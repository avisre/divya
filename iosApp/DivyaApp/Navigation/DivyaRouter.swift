import SwiftUI

enum DivyaRoute: Hashable {
    case home
    case prayer
    case temple
    case myPujas
    case profile
}

final class DivyaRouter: ObservableObject {
    @Published var path: [DivyaRoute] = []
}

