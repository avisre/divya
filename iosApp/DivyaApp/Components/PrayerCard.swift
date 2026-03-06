import SwiftUI

struct PrayerCard: View {
    let title: String

    var body: some View {
        VStack(alignment: .leading) {
            Text(title).foregroundStyle(Color.divyaSaffron)
            Text("Sacred daily recitation")
        }
        .padding(20)
        .background(Color.white, in: DivyaShapes.card)
    }
}

