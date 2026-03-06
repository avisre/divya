package com.divya.android.ui.components

import androidx.compose.foundation.BorderStroke
import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.heightIn
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.ButtonDefaults
import androidx.compose.material3.LinearProgressIndicator
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.OutlinedButton
import androidx.compose.material3.Surface
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.collectAsState
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.platform.LocalView
import androidx.compose.ui.platform.testTag
import androidx.compose.ui.semantics.contentDescription
import androidx.compose.ui.semantics.semantics
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.dp
import com.divya.android.media.PrayerAudioPlayer
import com.divya.android.ui.theme.Clay
import com.divya.android.ui.theme.DeepBrown
import com.divya.android.ui.theme.Ivory
import com.divya.android.ui.theme.Saffron
import com.divya.android.ui.theme.TempleGold

@Composable
fun PrayerMiniPlayerBar(
    onOpenPlayer: () -> Unit,
) {
    val state by PrayerAudioPlayer.state.collectAsState()
    val title = state.title ?: return
    val hostView = LocalView.current

    Surface(
        modifier = Modifier
            .fillMaxWidth()
            .testTag("mini_player_bar")
            .semantics { contentDescription = "Mini player: $title" }
            .clickable { onOpenPlayer() },
        color = DeepBrown,
        border = BorderStroke(1.dp, TempleGold.copy(alpha = 0.32f)),
        shape = RoundedCornerShape(18.dp),
    ) {
        Column(
            modifier = Modifier.padding(horizontal = 12.dp, vertical = 10.dp),
            verticalArrangement = Arrangement.spacedBy(8.dp),
        ) {
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically,
            ) {
                Row(
                    modifier = Modifier.weight(1f),
                    verticalAlignment = Alignment.CenterVertically,
                    horizontalArrangement = Arrangement.spacedBy(10.dp),
                ) {
                    Box(
                        modifier = Modifier
                            .size(44.dp)
                            .background(Saffron.copy(alpha = 0.18f), CircleShape),
                        contentAlignment = Alignment.Center,
                    ) {
                        Text(
                            text = "Om",
                            color = TempleGold,
                            style = MaterialTheme.typography.labelLarge,
                        )
                    }
                    Column(
                        modifier = Modifier.weight(1f),
                        verticalArrangement = Arrangement.spacedBy(2.dp),
                    ) {
                        Text(
                            text = title,
                            style = MaterialTheme.typography.bodyLarge,
                            color = Ivory,
                            maxLines = 1,
                            overflow = TextOverflow.Ellipsis,
                        )
                        Text(
                            text = "${formatDuration(state.currentPositionMs)} / ${formatDuration(state.durationMs)} | ${state.playbackSpeed}x",
                            style = MaterialTheme.typography.bodySmall,
                            color = Ivory.copy(alpha = 0.78f),
                            maxLines = 1,
                            overflow = TextOverflow.Ellipsis,
                        )
                    }
                }
                OutlinedButton(
                    onClick = onOpenPlayer,
                    modifier = Modifier
                        .heightIn(min = 44.dp)
                        .testTag("mini_player_open")
                        .semantics { contentDescription = "Open full player" },
                    border = BorderStroke(1.dp, TempleGold.copy(alpha = 0.5f)),
                    colors = ButtonDefaults.outlinedButtonColors(
                        containerColor = DeepBrown,
                        contentColor = TempleGold,
                    ),
                ) {
                    Text(
                        text = "Open",
                    )
                }
            }
            Row(
                modifier = Modifier
                    .fillMaxWidth()
                    .semantics { contentDescription = "Minimized player controls" },
                horizontalArrangement = Arrangement.spacedBy(8.dp),
            ) {
                OutlinedButton(
                    onClick = {
                        val updated = (state.playbackSpeed - 0.25f).coerceAtLeast(0.5f)
                        PrayerAudioPlayer.setSpeed(updated)
                        hostView.announceForAccessibility("Speed $updated x")
                    },
                    modifier = Modifier
                        .weight(1f)
                        .heightIn(min = 44.dp)
                        .testTag("mini_player_speed_down")
                        .semantics { contentDescription = "Decrease playback speed" },
                    colors = ButtonDefaults.outlinedButtonColors(
                        contentColor = Ivory,
                    ),
                    border = BorderStroke(1.dp, Clay.copy(alpha = 0.7f)),
                ) {
                    Text("-Spd")
                }
                OutlinedButton(
                    onClick = {
                        val updated = (state.playbackSpeed + 0.25f).coerceAtMost(2f)
                        PrayerAudioPlayer.setSpeed(updated)
                        hostView.announceForAccessibility("Speed $updated x")
                    },
                    modifier = Modifier
                        .weight(1f)
                        .heightIn(min = 44.dp)
                        .testTag("mini_player_speed_up")
                        .semantics { contentDescription = "Increase playback speed" },
                    colors = ButtonDefaults.outlinedButtonColors(
                        contentColor = Ivory,
                    ),
                    border = BorderStroke(1.dp, Clay.copy(alpha = 0.7f)),
                ) {
                    Text("+Spd")
                }
                OutlinedButton(
                    onClick = { PrayerAudioPlayer.togglePlayPause() },
                    modifier = Modifier
                        .weight(1f)
                        .heightIn(min = 44.dp)
                        .testTag("mini_player_play_pause")
                        .semantics { contentDescription = if (state.isPlaying) "Pause prayer audio" else "Play prayer audio" },
                    colors = ButtonDefaults.outlinedButtonColors(
                        containerColor = Saffron.copy(alpha = 0.2f),
                        contentColor = TempleGold,
                    ),
                    border = BorderStroke(1.dp, TempleGold.copy(alpha = 0.6f)),
                ) {
                    Text(if (state.isPlaying) "Pause" else "Play")
                }
                OutlinedButton(
                    onClick = {
                        PrayerAudioPlayer.clearCurrent()
                        hostView.announceForAccessibility("Player closed")
                    },
                    modifier = Modifier
                        .weight(1f)
                        .heightIn(min = 44.dp)
                        .testTag("mini_player_stop")
                        .semantics { contentDescription = "Close player" },
                    colors = ButtonDefaults.outlinedButtonColors(
                        contentColor = Ivory,
                    ),
                    border = BorderStroke(1.dp, Clay.copy(alpha = 0.7f)),
                ) {
                    Text("Close")
                }
            }
            LinearProgressIndicator(
                progress = { state.progressFraction },
                modifier = Modifier
                    .fillMaxWidth()
                    .testTag("mini_player_progress"),
                color = TempleGold,
                trackColor = Ivory.copy(alpha = 0.24f),
            )
        }
    }
}

private fun formatDuration(durationMs: Long): String {
    if (durationMs <= 0L) return "0:00"
    val totalSeconds = durationMs / 1000
    val minutes = totalSeconds / 60
    val seconds = totalSeconds % 60
    return "$minutes:${seconds.toString().padStart(2, '0')}"
}
