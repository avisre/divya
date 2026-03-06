import Foundation

enum DivyaDeepLinkHandler {
    static func route(for url: URL) -> String {
        url.absoluteString
    }
}

