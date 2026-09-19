import Foundation

/// Used only by wake-word captures; keyboard captures retain their existing stop behavior.
struct VoiceWakeWordEndpoint {
    enum Action: Equatable { case finish, cancel }
    private var lastSpeechAt: TimeInterval?
    private var speechPeak: Float = 0

    mutating func update(level: Float, elapsed: TimeInterval) -> Action? {
        // Ignore the activation chime and give the speaker time to begin.
        guard elapsed >= 0.6 else { return nil }
        speechPeak = max(speechPeak, level)
        // The recorder's meter level is well above zero at silence (a noisy mic floors
        // near ~0.2), so key "speech" off the loudest sample seen with an absolute floor
        // that clears that baseline — not a fixed low threshold.
        let speechThreshold = max(0.25, speechPeak * 0.4)
        if level >= speechThreshold { lastSpeechAt = elapsed }
        if let lastSpeechAt, elapsed - lastSpeechAt >= 1.5 { return .finish }
        if lastSpeechAt == nil, elapsed >= 10 { return .cancel }
        if elapsed >= 120 { return .finish }
        return nil
    }
}
