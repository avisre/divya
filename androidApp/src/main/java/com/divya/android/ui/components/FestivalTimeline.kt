package com.divya.android.ui.components

import androidx.compose.foundation.BorderStroke
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Surface
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.text.font.FontStyle
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.divya.android.ui.screens.AppContent
import com.divya.android.ui.screens.PanelCard
import com.divya.android.ui.screens.TimelineCard
import com.divya.android.ui.theme.Clay
import com.divya.android.ui.theme.DeepBrown
import com.divya.android.ui.theme.Ivory

@Composable
fun FestivalTimeline(
    festivalName: String,
    steps: List<AppContent.FestivalPrepState>,
    diasporaNote: String?,
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
                    phase = if (step.daysBefore == 0) "Day of $festivalName" else "${step.daysBefore} days before",
                )
            }
            diasporaNote?.takeIf { it.isNotBlank() }?.let { note ->
                Surface(
                    modifier = Modifier.fillMaxWidth(),
                    color = Ivory.copy(alpha = 0.92f),
                    shape = MaterialTheme.shapes.medium,
                    border = BorderStroke(1.dp, Clay.copy(alpha = 0.75f)),
                ) {
                    Column(
                        modifier = Modifier.padding(16.dp),
                        verticalArrangement = Arrangement.spacedBy(6.dp),
                    ) {
                        Text(
                            text = "Diaspora note",
                            style = MaterialTheme.typography.labelLarge,
                            color = DeepBrown,
                        )
                        Text(
                            text = "🌸 $note",
                            color = DeepBrown.copy(alpha = 0.62f),
                            fontSize = 13.sp,
                            fontStyle = FontStyle.Italic,
                            lineHeight = 18.sp,
                        )
                    }
                }
            }
        }
    }
}
