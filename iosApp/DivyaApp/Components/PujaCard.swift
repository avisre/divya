import SwiftUI

struct PujaCard: View {
    let title: String

    var body: some View {
        VStack(alignment: .leading) {
            Text(title).foregroundStyle(Color.divyaGold)
            Text("Waitlist only")
        }
        .padding(20)
        .background(Color.white, in: DivyaShapes.card)
    }
}

