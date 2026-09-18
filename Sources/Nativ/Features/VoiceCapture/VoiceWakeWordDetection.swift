import Foundation

/// Used only by wake-word captures; keyboard captures retain their existing stop behavior.
struct VoiceWakeWordEndpoint {
    enum Action: Equatable { case finish, cancel }
    private var lastSpeechAt: TimeInterval?

    mutating func update(level: Float, elapsed: TimeInterval) -> Action? {
        // Ignore the activation chime and give the speaker time to begin.
        guard elapsed >= 0.6 else { return nil }
        if level >= 0.06 { lastSpeechAt = elapsed }
        if let lastSpeechAt, elapsed - lastSpeechAt >= 2 { return .finish }
        if lastSpeechAt == nil, elapsed >= 10 { return .cancel }
        if elapsed >= 120 { return .finish }
        return nil
    }
}
