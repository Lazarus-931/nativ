import Foundation

enum NativWindowIntent: Equatable {
    case activate
    case newChat
    case openChat(UUID)
    case openTab(ControlPanelTab)
    case openExtensionPage(String)
    case openSpeechModels
    case openModelDiscovery(String)
    case toggleSidebar
    case collapseSidebarSections
}

extension NativWindowIntent {
    /// Parses the Hugging Face "Use this model" link, `nativ://open_from_hf?model=<owner>/<name>`.
    init?(url: URL) {
        guard url.scheme?.lowercased() == "nativ",
              url.host?.lowercased() == "open_from_hf",
              let repoID = URLComponents(url: url, resolvingAgainstBaseURL: false)?
                .queryItems?.first(where: { $0.name == "model" })?.value,
              repoID.wholeMatch(of: /[A-Za-z0-9][A-Za-z0-9._-]*\/[A-Za-z0-9][A-Za-z0-9._-]*/) != nil
        else {
            return nil
        }
        self = .openModelDiscovery(repoID)
    }
}

extension ControlPanelNavigation {
    func perform(_ intent: NativWindowIntent) {
        switch intent {
        case .activate:
            break
        case .newChat:
            createChat()
        case .openChat(let sessionID):
            openChatSession(sessionID)
        case .openTab(let tab):
            open(tab)
        case .openExtensionPage(let pageID):
            openExtensionPage(pageID)
        case .openSpeechModels:
            openSpeechModelDiscovery()
        case .openModelDiscovery(let repoID):
            openModelDiscovery(repoID: repoID)
        case .toggleSidebar:
            toggleSidebar()
        case .collapseSidebarSections:
            collapseAllSections()
        }
    }
}
