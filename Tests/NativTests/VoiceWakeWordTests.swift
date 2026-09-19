import AVFoundation
import Foundation
import Testing

struct VoiceWakeWordTests {
    @Test func testSilenceFinishesOnlyAfterSpeechAndResetsWhenSpeakingResumes() {
        var endpoint = VoiceWakeWordEndpoint()
        #expect(endpoint.update(level: 0, elapsed: 2) == nil)
        #expect(endpoint.update(level: 0.4, elapsed: 3) == nil)
        #expect(endpoint.update(level: 0, elapsed: 4.4) == nil)
        #expect(endpoint.update(level: 0.4, elapsed: 5) == nil)
        #expect(endpoint.update(level: 0, elapsed: 6.4) == nil)
        #expect(endpoint.update(level: 0, elapsed: 6.5) == .finish)
    }

    @Test func testEmptyCaptureCancelsAndIgnoresStartChime() {
        var endpoint = VoiceWakeWordEndpoint()
        #expect(endpoint.update(level: 1, elapsed: 0.3) == nil)
        #expect(endpoint.update(level: 0, elapsed: 9.9) == nil)
        #expect(endpoint.update(level: 0, elapsed: 10) == .cancel)
    }

    @Test func testContinuousNoiseCannotRecordIndefinitely() {
        var endpoint = VoiceWakeWordEndpoint()
        #expect(endpoint.update(level: 0.4, elapsed: 119) == nil)
        #expect(endpoint.update(level: 0.4, elapsed: 120) == .finish)
    }

    @Test func testFeatureExtractorProducesNormalizedFiniteMels() {
        let extractor = WakeWordFeatureExtractor()
        var tone = [Float](repeating: 0, count: 32_000)
        for i in 0..<tone.count { tone[i] = 0.2 * sin(2 * .pi * 440 * Float(i) / 16_000) }
        var out = [Float](repeating: .nan, count: 128 * 200)
        out.withUnsafeMutableBufferPointer { extractor.logMels(tone, into: $0.baseAddress!) }
        #expect(out.allSatisfy { $0.isFinite })
        // Per-mel-bin normalization keeps the overall level near zero.
        let mean = out.reduce(0, +) / Float(out.count)
        #expect(abs(mean) < 0.5)
        // Silence stays finite and bounded (constant bins normalize near zero, up to the
        // 1e-5 epsilon amplifying float rounding — matching the Python training frontend).
        let silence = [Float](repeating: 0, count: 32_000)
        out.withUnsafeMutableBufferPointer { extractor.logMels(silence, into: $0.baseAddress!) }
        #expect(out.allSatisfy { $0.isFinite && abs($0) < 5 })
    }

    @Test func testAudioBridgeConvertsAndOwnsBuffersAcrossDeviceChanges() async throws {
        let outputFormat = try #require(AVAudioFormat(
            standardFormatWithSampleRate: 16_000, channels: 1
        ))
        let (stream, continuation) = AsyncStream<AVAudioPCMBuffer>.makeStream()
        let bridge = WakeWordAudioBridge(format: outputFormat, continuation: continuation) {
            Issue.record("Audio conversion failed")
        }
        for rate in [48_000.0, 44_100, 16_000] {
            let format = try #require(AVAudioFormat(standardFormatWithSampleRate: rate, channels: 2))
            let buffer = try #require(AVAudioPCMBuffer(pcmFormat: format, frameCapacity: 4_096))
            buffer.frameLength = 4_096
            for channel in 0..<2 {
                for frame in 0..<4_096 { buffer.floatChannelData![channel][frame] = 0.25 }
            }
            bridge.append(buffer)
            // The microphone reuses its buffers immediately after returning from the tap.
            for channel in 0..<2 {
                for frame in 0..<4_096 { buffer.floatChannelData![channel][frame] = 0 }
            }
        }
        continuation.finish()
        var count = 0
        for await buffer in stream {
            #expect(buffer.format == outputFormat)
            #expect(buffer.frameLength > 0)
            let middle = Int(buffer.frameLength / 2)
            #expect(abs(buffer.floatChannelData![0][middle] - 0.25) <= 0.01)
            count += 1
        }
        #expect(count >= 3)
    }
}

@MainActor
struct VoiceWakeWordPreferencesTests {
    @Test func testWakeWordIsOptInAndPersistsWithoutChangingKeyboardMode() throws {
        let suite = "VoiceWakeWordPreferencesTests.\(UUID())"
        let defaults = try #require(UserDefaults(suiteName: suite))
        defer { defaults.removePersistentDomain(forName: suite) }
        let preferences = VoiceShortcutPreferences(defaults: defaults)
        #expect(!preferences.isWakeWordEnabled)
        preferences.isHandsFreeEnabled = false
        preferences.isWakeWordEnabled = true
        let restored = VoiceShortcutPreferences(defaults: defaults)
        #expect(restored.isWakeWordEnabled)
        #expect(!restored.isHandsFreeEnabled)
        #expect(restored.recordShortcut == .recordDefault)
        restored.isWakeWordEnabled = false
        #expect(!VoiceShortcutPreferences(defaults: defaults).isWakeWordEnabled)
    }

    @Test func testLegacyPreferencesKeepListeningOff() throws {
        let suite = "VoiceWakeWordPreferencesTests.\(UUID())"
        let defaults = try #require(UserDefaults(suiteName: suite))
        defer { defaults.removePersistentDomain(forName: suite) }
        let legacy: [String: Any] = [
            "recordShortcut": ["modifiers": VoiceShortcut.recordDefault.modifiers.rawValue],
            "retryShortcut": ["keyCode": 15, "keyDisplay": "R", "modifiers": 16],
            "isHandsFreeEnabled": false,
        ]
        defaults.set(try JSONSerialization.data(withJSONObject: legacy), forKey: "voiceShortcutPreferences.v1")
        let preferences = VoiceShortcutPreferences(defaults: defaults)
        #expect(!preferences.isWakeWordEnabled)
        #expect(!preferences.isHandsFreeEnabled)
    }

    @Test func testSuspendingOrDisablingSettlesToPausedThenOff() async throws {
        let monitor = VoiceWakeWordMonitor()
        // Suspension is evaluated before the model check, so it is model-independent.
        monitor.configure(enabled: true, suspended: true, deviceID: nil)
        #expect(monitor.state == .paused)
        monitor.configure(enabled: false, suspended: false, deviceID: nil)
        try await Task.sleep(for: .milliseconds(800))
        #expect(monitor.state == .off)
    }
}
