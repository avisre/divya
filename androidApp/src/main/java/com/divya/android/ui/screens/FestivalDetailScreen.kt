package com.divya.android.ui.screens

import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.material3.Button
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import com.divya.android.navigation.DivyaRoutes
import com.divya.android.ui.components.FestivalTimeline

@Composable
fun FestivalDetailScreen(onOpen: (String) -> Unit) {
    val prep = AppContent.festivalPrepState
    ScreenScaffold(
        eyebrow = "Festival preparation",
        title = "${prep.festivalName} journey",
        subtitle = "Follow each preparation step calmly, with guidance that works for families living abroad.",
        badge = "${prep.daysBefore} days remaining",
        heroVariant = HeroCardVariant.CALENDAR,
        heroStats = listOf(
            HeroStat("21 days", "Preparation span"),
            HeroStat("Daily", "Prayer rhythm"),
            HeroStat("Diaspora", "Practical notes"),
        ),
    ) {
        item {
            FestivalTimeline(
                festivalName = prep.festivalName,
                steps = listOf(
                    prep.copy(daysBefore = 21, title = "Start", task = "Clean altar and define family sankalpa"),
                    prep.copy(daysBefore = 12, title = "Rhythm", task = "Begin daily Devi prayer and lamp offering"),
                    prep.copy(daysBefore = 7, title = "Prepare", task = "Gather flowers and offerings"),
                    prep.copy(daysBefore = 3, title = "Align", task = "Finalize daily ritual schedule"),
                    prep.copy(daysBefore = 1, title = "Ready", task = "Prepare first-day offering"),
                    prep.copy(daysBefore = 0, title = "Day 1", task = "Begin Navarathri with daily prayer and reflection"),
                ),
                diasporaNote = prep.diasporaNote,
            )
        }
        item {
            Button(onClick = { onOpen(DivyaRoutes.prayerFor(prep.prepPrayer.id)) }, modifier = Modifier.fillMaxWidth()) {
                Text("Begin festival prayer")
            }
        }
    }
}
