import ActivityKit
import SwiftUI
import WidgetKit

struct PujaProgressAttributes: ActivityAttributes {
    public struct ContentState: Codable, Hashable {
        var statusText: String
        var progressFraction: Double
        var minutesRemaining: Int
        var isVideoReady: Bool
    }

    var pujaName: String
    var templeName: String
    var deityName: String
}

@available(iOS 16.2, *)
struct PujaProgressLiveActivity: Widget {
    var body: some WidgetConfiguration {
        ActivityConfiguration(for: PujaProgressAttributes.self) { context in
            VStack(alignment: .leading) {
                Text("Your Puja is Happening Now")
                    .foregroundStyle(Color.divyaSaffron)
                Text(context.attributes.pujaName)
                ProgressView(value: context.state.progressFraction)
                    .tint(Color.divyaGold)
                Text("~\(context.state.minutesRemaining) min remaining")
            }
            .padding()
            .background(Color.divyaWarm)
        } dynamicIsland: { context in
            DynamicIsland {
                DynamicIslandExpandedRegion(.center) {
                    Text(context.attributes.pujaName)
                }
            } compactLeading: {
                Text("🪔")
            } compactTrailing: {
                Text("\(context.state.minutesRemaining)m")
            } minimal: {
                Text("🎬")
            }
        }
    }
}
