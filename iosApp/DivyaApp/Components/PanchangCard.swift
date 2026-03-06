import SwiftUI

struct PanchangCard: View {
    var body: some View {
        VStack(alignment: .leading) {
            Text("Today's Panchang")
            Text("Referenced to Karunagapally, Kerala")
        }
        .padding(20)
        .background(Color.white, in: DivyaShapes.card)
    }
}

