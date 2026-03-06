import SwiftUI

struct HomeView: View {
    var body: some View {
        ScrollView {
            VStack(alignment: .leading, spacing: 16) {
                Text("Divya")
                    .font(DivyaFonts.title())
                    .foregroundStyle(Color.divyaSaffron)
                Text("Bhadra Bhagavathi Temple, Karunagapally")
                    .font(DivyaFonts.body())
                Text("Temple in your pocket for devotees living outside India.")
                    .font(DivyaFonts.body())
            }
            .frame(maxWidth: .infinity, alignment: .leading)
            .padding(24)
        }
        .background(Color.divyaWarm.ignoresSafeArea())
    }
}

