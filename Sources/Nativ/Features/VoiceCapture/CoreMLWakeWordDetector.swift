import Accelerate
import AVFoundation
import CoreML
import Foundation

/// On-device "Hey Nativ" wake detector: a rolling two-second window of 16 kHz mono
/// audio → log-mels → the bundled Core ML RepCNN model on the Apple Neural Engine.
/// Feature extraction matches the training frontend exactly (validated to identical
/// wake decisions on 140 clips), so no transcription is involved.
final class CoreMLWakeWordDetector {
    static let sampleRate: Double = 16_000

    private let model: MLModel
    private let features = WakeWordFeatureExtractor()
    private let threshold: Double
    private let windowSamples = 32_000
    private let hopSamples = 3_200            // evaluate roughly every 0.2 s

    private var ring = [Float]()
    private var sinceEval = 0
    private let input: MLMultiArray
    private let inputPointer: UnsafeMutablePointer<Float>

    init(modelURL: URL, threshold: Double = 0.85) async throws {
        self.threshold = threshold
        let staged = try Self.dereferencedCopy(of: modelURL)
        defer { try? FileManager.default.removeItem(at: staged.deletingLastPathComponent()) }
        let compiled = try await MLModel.compileModel(at: staged)
        let configuration = MLModelConfiguration()
        configuration.computeUnits = .cpuAndNeuralEngine
        model = try MLModel(contentsOf: compiled, configuration: configuration)
        input = try MLMultiArray(shape: [1, 128, 200], dataType: .float32)
        inputPointer = input.dataPointer.bindMemory(to: Float.self, capacity: 128 * 200)
        ring.reserveCapacity(windowSamples + 8_192)
    }

    func reset() {
        ring.removeAll(keepingCapacity: true)
        sinceEval = 0
    }

    /// Hugging Face cache files are symlinks to content-addressed blobs; Core ML's
    /// compiler cannot compile through them, so stage a symlink-dereferenced copy.
    private static func dereferencedCopy(of url: URL) throws -> URL {
        let fm = FileManager.default
        let directory = fm.temporaryDirectory
            .appendingPathComponent("heynativ-model-\(UUID().uuidString)", isDirectory: true)
        try fm.createDirectory(at: directory, withIntermediateDirectories: true)
        let destination = directory.appendingPathComponent(url.lastPathComponent)
        let process = Process()
        process.executableURL = URL(fileURLWithPath: "/bin/cp")
        process.arguments = ["-RL", url.path, destination.path]
        try process.run()
        process.waitUntilExit()
        guard process.terminationStatus == 0 else {
            throw NSError(domain: "CoreMLWakeWordDetector", code: 1,
                          userInfo: [NSLocalizedDescriptionKey: "Could not stage the model for compilation."])
        }
        return destination
    }

    /// Appends one buffer of 16 kHz mono audio and returns true if "hey nativ" is heard.
    func process(_ buffer: AVAudioPCMBuffer) -> Bool {
        guard let channel = buffer.floatChannelData else { return false }
        let count = Int(buffer.frameLength)
        guard count > 0 else { return false }
        ring.append(contentsOf: UnsafeBufferPointer(start: channel[0], count: count))
        if ring.count > windowSamples { ring.removeFirst(ring.count - windowSamples) }
        sinceEval += count
        guard sinceEval >= hopSamples else { return false }
        sinceEval = 0
        return probability() >= threshold
    }

    private func probability() -> Double {
        features.logMels(ring, into: inputPointer)
        guard let output = try? model.prediction(from: input.asFeatureProvider(name: "mels")),
              let value = output.featureValue(for: "probability")?.multiArrayValue
        else { return 0 }
        return value[0].doubleValue
    }
}

/// Log-mel frontend matching `wakewords.features.log_mels`: STFT (n_fft 512, hop 160,
/// win 400 periodic Hann, centered, constant-padded) → power → Slaney mel filterbank
/// [128,257] → ln(clamp 1e-10) → per-mel-bin normalization over the two-second window.
final class WakeWordFeatureExtractor {
    private let nFFT = 512, hop = 160, win = 400, mels = 128, frames = 200, bins = 257
    private let pad = 256, windowSamples = 32_000
    private let filterbank: [Float]        // [mels * bins]
    private let window: [Float]            // [nFFT]
    private let dft: vDSP.DFT<Float>

    init() {
        filterbank = Self.slaneyFilterbank(mels: mels, bins: bins, sampleRate: 16_000)
        var w = [Float](repeating: 0, count: nFFT)
        for n in 0..<win { w[(nFFT - win) / 2 + n] = 0.5 - 0.5 * cos(2 * .pi * Float(n) / Float(win)) }
        window = w
        dft = vDSP.DFT(count: nFFT, direction: .forward,
                       transformType: .complexComplex, ofType: Float.self)!
    }

    /// Writes normalized log-mels [128,200] (row-major) into `out`. `audio` is the most
    /// recent samples; the window is front-padded with silence when shorter than 2 s.
    func logMels(_ audio: [Float], into out: UnsafeMutablePointer<Float>) {
        var x = [Float](repeating: 0, count: windowSamples)
        let take = min(audio.count, windowSamples)
        for i in 0..<take { x[windowSamples - take + i] = audio[audio.count - take + i] }
        var padded = [Float](repeating: 0, count: windowSamples + nFFT)
        for i in 0..<windowSamples { padded[pad + i] = x[i] }

        var power = [Float](repeating: 0, count: bins * frames)
        var re = [Float](repeating: 0, count: nFFT), im = [Float](repeating: 0, count: nFFT)
        var oRe = [Float](repeating: 0, count: nFFT), oIm = [Float](repeating: 0, count: nFFT)
        for t in 0..<frames {
            let s = t * hop
            for k in 0..<nFFT { re[k] = padded[s + k] * window[k]; im[k] = 0 }
            dft.transform(inputReal: re, inputImaginary: im, outputReal: &oRe, outputImaginary: &oIm)
            for b in 0..<bins { power[b * frames + t] = oRe[b] * oRe[b] + oIm[b] * oIm[b] }
        }
        filterbank.withUnsafeBufferPointer { fb in
            power.withUnsafeBufferPointer { pw in
                cblas_sgemm(CblasRowMajor, CblasNoTrans, CblasNoTrans,
                            Int32(mels), Int32(frames), Int32(bins), 1.0,
                            fb.baseAddress, Int32(bins), pw.baseAddress, Int32(frames),
                            0.0, out, Int32(frames))
            }
        }
        for i in 0..<(mels * frames) { out[i] = log(max(out[i], 1e-10)) }
        for m in 0..<mels {
            let base = m * frames
            var mean: Float = 0
            for t in 0..<frames { mean += out[base + t] }
            mean /= Float(frames)
            var variance: Float = 0
            for t in 0..<frames { let d = out[base + t] - mean; variance += d * d }
            let inv = 1.0 / ((variance / Float(frames)).squareRoot() + 1e-5)
            for t in 0..<frames { out[base + t] = (out[base + t] - mean) * inv }
        }
    }

    private static func slaneyFilterbank(mels: Int, bins: Int, sampleRate: Double) -> [Float] {
        func hzToMel(_ hz: Double) -> Double {
            hz < 1000 ? hz / (200.0 / 3.0) : 15 + log(max(hz, 1000) / 1000) / (log(6.4) / 27)
        }
        func linspace(_ a: Double, _ b: Double, _ n: Int) -> [Double] {
            (0..<n).map { a + (b - a) * Double($0) / Double(n - 1) }
        }
        let nyquist = sampleRate / 2
        let points = linspace(hzToMel(0), hzToMel(nyquist), mels + 2)
        let hz = points.map { $0 < 15 ? $0 * (200.0 / 3.0) : 1000 * exp(($0 - 15) * log(6.4) / 27) }
        let freq = linspace(0, nyquist, bins)
        var weights = [Float](repeating: 0, count: mels * bins)
        for m in 0..<mels {
            let lo = hz[m], center = hz[m + 1], hi = hz[m + 2]
            let norm = 2.0 / (hi - lo)
            for f in 0..<bins {
                let lower = (freq[f] - lo) / (center - lo)
                let upper = (hi - freq[f]) / (hi - center)
                weights[m * bins + f] = Float(max(0, min(lower, upper)) * norm)
            }
        }
        return weights
    }
}

private extension MLMultiArray {
    func asFeatureProvider(name: String) -> MLDictionaryFeatureProvider {
        try! MLDictionaryFeatureProvider(dictionary: [name: self])
    }
}
