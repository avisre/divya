package com.divya.android.ui.components

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.material3.Button
import androidx.compose.material3.LinearProgressIndicator
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp
import com.divya.android.ui.screens.AppContent
import com.divya.android.ui.screens.PanelCard
import com.divya.android.ui.theme.DeepBrown
import com.divya.android.ui.theme.TempleGold

@Composable
fun SharedPrayerOverlay(
    session: AppContent.SharedSessionPreview,
    onRepComplete: () -> Unit,
) {
    val progress = if (session.totalRepetitions <= 0) 0f else session.completedRepetitions.toFloat() / session.totalRepetitions.toFloat()
    PanelCard(
        title = "Shared Prayer Progress",
        subtitle = "Repetition ${session.completedRepetitions} of ${session.totalRepetitions}",
        accent = TempleGold,
    ) {
        Column(verticalArrangement = Arrangement.spacedBy(10.dp), modifier = Modifier.fillMaxWidth()) {
            LinearProgressIndicator(
                progress = { progress.coerceIn(0f, 1f) },
                modifier = Modifier.fillMaxWidth(),
                color = TempleGold,
                trackColor = TempleGold.copy(alpha = 0.20f),
            )
            Text(
                text = "Current verse is synchronized for all participants.",
                style = MaterialTheme.typography.bodyMedium,
                color = DeepBrown.copy(alpha = 0.74f),
            )
            Row(horizontalArrangement = Arrangement.spacedBy(10.dp), modifier = Modifier.fillMaxWidth()) {
                session.participants.forEach { participant ->
                    ParticipantPill(participant = participant, modifier = Modifier.weight(1f, fill = false))
                }
            }
            Button(onClick = onRepComplete, modifier = Modifier.fillMaxWidth()) {
                Text("Count shared repetition")
            }
        }
    }
}
