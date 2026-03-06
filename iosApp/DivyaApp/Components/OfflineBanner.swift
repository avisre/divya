import SwiftUI

struct OfflineBanner: View {
    var body: some View {
        Text("You're offline 🙏 Your prayers and panchang are still available")
            .foregroundStyle(.white)
            .padding(12)
            .frame(maxWidth: .infinity)
            .background(Color.divyaSaffron, in: Capsule())
    }
}

