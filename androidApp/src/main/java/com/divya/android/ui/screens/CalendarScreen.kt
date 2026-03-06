package com.divya.android.ui.screens

import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.material3.Button
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import com.divya.android.navigation.DivyaRoutes
import com.divya.android.ui.components.FestivalPrepCard

@Composable
fun CalendarScreen(onOpen: (String) -> Unit) {
    ScreenScaffold(
        eyebrow = "Festival calendar",
        title = "Temple rhythm across timezones",
        subtitle = "Calendar includes 15 festivals, diaspora context, and preparation journeys that drive daily return usage.",
        badge = "Timezone-aware + prep ready",
        heroStats = listOf(
            HeroStat("${AppContent.festivalCalendar.size}", "Festivals tracked"),
            HeroStat("Today", "Ekadashi"),
            HeroStat("Pushya", "Current nakshatra"),
            HeroStat("12 days", "To Navarathri prep"),
        ),
    ) {
        item {
            PanelCard(title = "Today") {
                InfoRow(label = "Tithi", value = "Ekadashi | Shukla")
                InfoRow(label = "Rahu Kaal", value = "Dynamic by timezone")
                InfoRow(label = "Temple note", value = "Referenced from Karunagapally, Kerala")
            }
        }
        item {
            FestivalPrepCard(
                prep = AppContent.festivalPrepState,
                onOpenGuide = { onOpen(DivyaRoutes.festival.route) },
                onStartPrayer = { onOpen(DivyaRoutes.prayerFor(AppContent.festivalPrepState.prepPrayer.id)) },
            )
        }
        AppContent.festivalCalendar.forEach { festival ->
            item {
                PanelCard(
                    title = "${festival.name} (${festival.month})",
                    subtitle = festival.diasporaNote,
                ) {
                    festival.keralaNote?.let { note ->
                        AccentNote(title = "Kerala note", body = note)
                    }
                }
            }
        }
        item {
            Button(onClick = { onOpen(DivyaRoutes.festival.route) }, modifier = Modifier.fillMaxWidth()) {
                Text("Open festival preparation journey")
            }
        }
    }
}
