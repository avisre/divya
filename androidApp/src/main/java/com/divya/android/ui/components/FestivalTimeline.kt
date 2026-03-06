package com.divya.android.ui.components

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.runtime.Composable
import androidx.compose.ui.unit.dp
import com.divya.android.ui.screens.AppContent
import com.divya.android.ui.screens.PanelCard
import com.divya.android.ui.screens.TextBlock
import com.divya.android.ui.screens.TimelineCard

@Composable
fun FestivalTimeline(
    festivalName: String,
    steps: List<AppContent.FestivalPrepState>,
) {
    PanelCard(
        title = "$festivalName Preparation Timeline",
        subtitle = "Day-by-day guidance for diaspora households",
    ) {
        Column(verticalArrangement = Arrangement.spacedBy(10.dp)) {
            steps.sortedByDescending { it.daysBefore }.forEach { step ->
                TimelineCard(
                    title = step.task,
                    body = "Prayer: ${step.prepPrayer.title.en} • ${step.prepPrayer.durationMinutes} min",
                    phase = if (step.daysBefore == 0) "Day of $festivalName" else "${step.daysBefore} days before"
                )
                TextBlock(step.diasporaNote)
            }
        }
    }
}
