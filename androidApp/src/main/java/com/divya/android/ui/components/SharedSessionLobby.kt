package com.divya.android.ui.components

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.material3.Button
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.OutlinedButton
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp
import com.divya.android.ui.screens.AppContent
import com.divya.android.ui.screens.PanelCard
import com.divya.android.ui.theme.DeepBrown
import com.divya.android.ui.theme.TempleGold

@Composable
fun SharedSessionLobby(
    session: AppContent.SharedSessionPreview,
    isHost: Boolean,
    onStart: () -> Unit,
    onShare: () -> Unit,
) {
    PanelCard(
        title = "🕉️ ${session.prayer.title.en} — Together",
        subtitle = "Session code: ${session.code}",
        accent = TempleGold,
    ) {
        Column(verticalArrangement = Arrangement.spacedBy(10.dp), modifier = Modifier.fillMaxWidth()) {
            Text(
                text = "Participants",
                style = MaterialTheme.typography.titleSmall,
                color = DeepBrown,
            )
            session.participants.forEach { participant ->
                ParticipantPill(participant = participant)
            }
            if (isHost) {
                Button(onClick = onStart, modifier = Modifier.fillMaxWidth()) {
                    Text("Begin prayer together")
                }
            } else {
                Text(
                    text = "Waiting for host to begin...",
                    style = MaterialTheme.typography.bodyMedium,
                    color = DeepBrown.copy(alpha = 0.74f),
                )
            }
            OutlinedButton(onClick = onShare, modifier = Modifier.fillMaxWidth()) {
                Text("Share via WhatsApp")
            }
        }
    }
}
