import AVFoundation
import Combine
import Foundation

/// Locates the downloaded "Hey Nativ" Core ML model in the Hugging Face hub cache.
enum WakeWordModelLocator {
    static let repoID = "nativ-community/HN"
    static let packageName = "hey-native-mm-fp16.mlpackage"
    static let sizeBytes: Int64 = 4_000_000

    static func modelURL(
        environment: [String: String] = ProcessInfo.processInfo.environment
    ) -> URL? {
        let hub = (HuggingFaceCache.defaultHubPath(environment: environment) as NSString)
            .expandingTildeInPath
        let parts = repoID.split(separator: "/")
        guard parts.count == 2 else { return nil }
        let repo = URL(fileURLWithPath: hub)
            .appendingPathComponent("models--\(parts[0])--\(parts[1])")
        let snapshots = repo.appendingPathComponent("snapshots")
        let fm = FileManager.default

        var snapshot: URL?
        if let rev = try? String(contentsOf: repo.appendingPathComponent("refs/main"), encoding: .utf8)
            .trimmingCharacters(in: .whitespacesAndNewlines), !rev.isEmpty,
            fm.fileExists(atPath: snapshots.appendingPathComponent(rev).path) {
            snapshot = snapshots.appendingPathComponent(rev)
        } else {
            let subdirectories = (try? fm.contentsOfDirectory(
                at: snapshots, includingPropertiesForKeys: [.contentModificationDateKey])) ?? []
            snapshot = subdirectories.filter { $0.hasDirectoryPath }.max {
                (modified($0) ?? .distantPast) < (modified($1) ?? .distantPast)
            }
        }
        guard let snapshot else { return nil }
        let package = snapshot.appendingPathComponent(packageName)
        // Require the compiled model + weights, not just Manifest.json: the hub downloads
        // small files first, so a partial checkpoint must not look ready (avoids compiling
        // a package whose weight.bin has not arrived yet).
        // Resolve the Hugging Face cache symlink so we measure the real blob, not the
        // ~88-byte symlink (URL.fileSizeKey reports the link's own size).
        let weights = package.appendingPathComponent("Data/com.apple.CoreML/weights/weight.bin")
            .resolvingSymlinksInPath()
        let weightsSize = ((try? fm.attributesOfItem(atPath: weights.path))?[.size] as? Int) ?? 0
        guard fm.fileExists(atPath: package.appendingPathComponent("Manifest.json").path),
              fm.fileExists(atPath: package.appendingPathComponent("Data/com.apple.CoreML/model.mlmodel").path),
              weightsSize > 1024
        else { return nil }
        return package
    }

    private static func modified(_ url: URL) -> Date? {
        try? url.resourceValues(forKeys: [.contentModificationDateKey]).contentModificationDate
    }
}

/// An opt-in, on-device wake-word listener. Microphone audio is streamed in memory,
/// never saved, and scored by the on-device Core ML model — no transcription. The
/// detector is isolated behind `wakeDetected`, so any consumer (dictation today, a
/// full session bootstrap later) can react to a wake without changing this engine.
@MainActor
final class VoiceWakeWordMonitor: ObservableObject {
    enum State: Equatable {
        case off, paused, preparing, listening, needsModel
        case unavailable(String)

        var description: String {
            switch self {
            case .off: "Wake word is off."
            case .paused: "Wake word is paused while audio is busy."
            case .preparing: "Preparing on-device wake word…"
            case .listening: "Listening for “hey nativ”."
            case .needsModel: "Download the Hey Nativ model to start listening."
            case let .unavailable(message): message
            }
        }
    }

    static let shared = VoiceWakeWordMonitor()
    @Published private(set) var state: State = .off
    /// Isolated wake-event stream. Fires once per detected "hey nativ".
    let wakeDetected = PassthroughSubject<Void, Never>()
    /// Convenience for the current single consumer; prefer `wakeDetected` for new work.
    var onWake: (() -> Void)?

    private struct Configuration: Equatable {
        var enabled: Bool
        var suspended: Bool
        var deviceID: String?
    }

    private var configuration = Configuration(enabled: false, suspended: false)
    private let inputSession = AudioInputEngineSession()
    private var sessionID = UUID()
    private var task: Task<Void, Never>?
    private var consumerTask: Task<Void, Never>?
    private var continuation: AsyncStream<AVAudioPCMBuffer>.Continuation?
    private var cancellables = Set<AnyCancellable>()

    init() {
        // Arm automatically once the model download completes (the local model library
        // posts this after a Models-page download finishes).
        NotificationCenter.default.publisher(for: .localModelLibraryDidChange)
            .receive(on: RunLoop.main)
            .sink { [weak self] _ in
                guard let self, self.state == .needsModel else { return }
                self.restart()
            }
            .store(in: &cancellables)
    }

    private static let targetFormat = AVAudioFormat(
        commonFormat: .pcmFormatFloat32,
        sampleRate: CoreMLWakeWordDetector.sampleRate,
        channels: 1,
        interleaved: false
    )!

    func configure(enabled: Bool, suspended: Bool, deviceID: String?) {
        let next = Configuration(enabled: enabled, suspended: suspended, deviceID: deviceID)
        // Re-resolve when waiting on the model so listening arms once its download completes.
        guard next != configuration || state == .needsModel else { return }
        configuration = next
        restart()
    }

    func restart() {
        stopSession()
        guard configuration.enabled else { state = .off; NSLog("[WW] restart: off"); return }
        // Model presence takes priority: invite the download even while audio is busy.
        guard let modelURL = WakeWordModelLocator.modelURL() else {
            state = .needsModel; NSLog("[WW] restart: needsModel (model not resolved)"); return
        }
        guard !configuration.suspended else { state = .paused; NSLog("[WW] restart: paused (suspended)"); return }
        state = .preparing
        NSLog("[WW] restart: preparing, model=\(modelURL.path)")
        let id = sessionID
        let deviceID = configuration.deviceID
        task = Task { [weak self] in
            // Let the previous recording's feedback finish before rearming the mic.
            do { try await Task.sleep(for: .milliseconds(750)) } catch { return }
            await self?.listen(id: id, deviceID: deviceID)
        }
    }

    private func listen(id: UUID, deviceID: String?) async {
        do {
            let granted = await NativSystemPermissionController.requestMicrophone()
            guard isCurrent(id) else { return }
            guard granted else {
                fail("Allow microphone access in System Settings, then try again.", id: id, retry: false)
                return
            }
            guard let modelURL = WakeWordModelLocator.modelURL() else {
                if isCurrent(id) { state = .needsModel }
                return
            }
            let detector = try await CoreMLWakeWordDetector(modelURL: modelURL)
            guard isCurrent(id) else { return }

            let (stream, continuation) = AsyncStream<AVAudioPCMBuffer>.makeStream(
                bufferingPolicy: .bufferingNewest(32)
            )
            self.continuation = continuation
            let bridge = WakeWordAudioBridge(format: Self.targetFormat, continuation: continuation) {
                [weak self] in
                Task { @MainActor [weak self] in
                    self?.fail("Could not read microphone audio. Retrying…", id: id)
                }
            }
            consumerTask = Task { [weak self] in
                for await buffer in stream {
                    if Task.isCancelled { return }
                    if detector.process(buffer) {
                        await MainActor.run { [weak self] in
                            guard let self, self.isCurrent(id) else { return }
                            NSLog("[WW] WAKE detected, onWake set=\(self.onWake != nil)")
                            self.stopSession()
                            self.state = .paused
                            self.wakeDetected.send()
                            self.onWake?()
                        }
                        return
                    }
                }
            }
            try inputSession.start(deviceUniqueID: deviceID, tap: { buffer, _ in
                bridge.append(buffer)
            }) { [weak self] error in
                Task { @MainActor [weak self] in self?.fail(error.localizedDescription, id: id) }
            }
            state = .listening
            NSLog("[WW] LISTENING")
        } catch {
            NSLog("[WW] listen error: \(error.localizedDescription)")
            fail("Wake word is unavailable: \(error.localizedDescription)", id: id)
        }
    }

    private func isCurrent(_ id: UUID) -> Bool { id == sessionID && !Task.isCancelled }

    private func fail(_ message: String, id: UUID, retry: Bool = true) {
        guard isCurrent(id) else { return }
        stopSession()
        state = .unavailable(message)
        guard retry else { return }
        let retryID = sessionID
        task = Task { [weak self] in
            do { try await Task.sleep(for: .seconds(30)) } catch { return }
            guard let self, self.isCurrent(retryID) else { return }
            self.restart()
        }
    }

    private func stopSession() {
        sessionID = UUID()
        inputSession.stop()
        continuation?.finish()
        continuation = nil
        task?.cancel(); task = nil
        consumerTask?.cancel(); consumerTask = nil
    }
}

/// Converts and owns each microphone buffer (to 16 kHz mono) before the audio callback
/// returns. The bounded stream cannot accumulate ambient audio across restarts.
final class WakeWordAudioBridge: @unchecked Sendable {
    private let lock = NSLock()
    private let format: AVAudioFormat
    private let continuation: AsyncStream<AVAudioPCMBuffer>.Continuation
    private let onFailure: @Sendable () -> Void
    private var converter: AVAudioConverter?
    private var pending: AVAudioPCMBuffer?
    private var failed = false

    init(
        format: AVAudioFormat,
        continuation: AsyncStream<AVAudioPCMBuffer>.Continuation,
        onFailure: @escaping @Sendable () -> Void
    ) {
        self.format = format
        self.continuation = continuation
        self.onFailure = onFailure
    }

    func append(_ buffer: AVAudioPCMBuffer) {
        let shouldReport = lock.withLock { () -> Bool in
            guard !failed, buffer.frameLength > 0 else { return false }
            do {
                if converter?.inputFormat != buffer.format {
                    converter = AVAudioConverter(from: buffer.format, to: format)
                    converter?.downmix = true
                }
                guard let converter else { throw VoiceAudioRecorderError.couldNotConvert }
                pending = buffer
                defer { pending = nil }
                while true {
                    guard let output = AVAudioPCMBuffer(pcmFormat: format, frameCapacity: 4_096)
                    else { throw VoiceAudioRecorderError.couldNotConvert }
                    var error: NSError?
                    let status = converter.convert(to: output, error: &error) { [self] _, status in
                        if let buffer = pending {
                            pending = nil
                            status.pointee = .haveData
                            return buffer
                        }
                        status.pointee = .noDataNow
                        return nil
                    }
                    if status == .error { throw VoiceAudioRecorderError.couldNotConvert }
                    if output.frameLength > 0 { continuation.yield(output) }
                    if status != .haveData { break }
                }
                return false
            } catch {
                failed = true
                return true
            }
        }
        if shouldReport { onFailure() }
    }
}
