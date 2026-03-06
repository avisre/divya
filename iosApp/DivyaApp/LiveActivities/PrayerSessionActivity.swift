import ActivityKit
import SwiftUI
import WidgetKit

struct PrayerSessionAttributes: ActivityAttributes {
    public struct ContentState: Codable, Hashable {
        var prayerName: String
        var repetitionCurrent: Int
        var repetitionTotal: Int
        var secondsRemaining: Int
        var isCompleted: Bool
    }

    var prayerTitle: String
    var deityName: String
    var totalSeconds: Int
}

@available(iOS 16.2, *)
struct PrayerLiveActivity: Widget {
    var body: some WidgetConfiguration {
        ActivityConfiguration(for: PrayerSessionAttributes.self) { context in
            HStack {
                Text("ॐ")
                    .font(.title2)
                    .foregroundStyle(Color.divyaSaffron)
                VStack(alignment: .leading) {
                    Text(context.state.prayerName)
                        .font(.headline)
                        .foregroundStyle(Color.divyaSaffron)
                    ProgressView(
                        value: Double(context.attributes.totalSeconds - context.state.secondsRemaining),
                        total: Double(context.attributes.totalSeconds)
                    )
                    .tint(Color.divyaGold)
                    Text("Repetition \(context.state.repetitionCurrent) of \(context.state.repetitionTotal)")
                        .font(.caption)
                }
            }
            .padding()
            .background(Color.divyaWarm)
        } dynamicIsland: { context in
            DynamicIsland {
                DynamicIslandExpandedRegion(.leading) {
                    Text("ॐ").foregroundStyle(Color.divyaSaffron)
                }
                DynamicIslandExpandedRegion(.trailing) {
                    Text("\(context.state.repetitionCurrent)x").foregroundStyle(Color.divyaGold)
                }
                DynamicIslandExpandedRegion(.center) {
                    Text(context.state.prayerName).foregroundStyle(Color.divyaSaffron)
                }
                DynamicIslandExpandedRegion(.bottom) {
                    ProgressView(
                        value: Double(context.attributes.totalSeconds - context.state.secondsRemaining),
                        total: Double(context.attributes.totalSeconds)
                    )
                    .tint(Color.divyaGold)
                }
            } compactLeading: {
                Text("ॐ")
            } compactTrailing: {
                Text("\(context.state.repetitionCurrent)x")
            } minimal: {
                Image(systemName: "flame.fill").foregroundStyle(Color.divyaSaffron)
            }
        }
    }
}

