package com.divya.android.ui.screens

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.material3.Button
import androidx.compose.material3.OutlinedButton
import androidx.compose.material3.Slider
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableFloatStateOf
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp
import com.divya.android.media.PrayerAudioPlayer
import com.divya.android.navigation.DivyaRoutes

@Composable
fun NowPlayingScreen(onOpen: (String) -> Unit) {
    val state by PrayerAudioPlayer.state.collectAsState()
    var isScrubbing by remember { mutableStateOf(false) }
    var scrubValue by remember(state.sourceToken) { mutableFloatStateOf(state.progressFraction) }

    LaunchedEffect(state.progressFraction, state.sourceToken, isScrubbing) {
        if (!isScrubbing) {
            scrubValue = state.progressFraction
        }
    }

    ScreenScaffold(
        eyebrow = "Audio controls",
        title = state.title ?: "No active prayer",
        subtitle = "The persistent player keeps full control in one place while the prayer page stays focused on practice.",
        badge = if (state.isPlaying) "Playing" else "Paused",
        heroStats = listOf(
            HeroStat("${state.playbackSpeed}x", "Playback speed"),
            HeroStat("${(state.progressFraction * 100).toInt()}%", "Progress"),
            HeroStat(formatDuration(state.currentPositionMs), "Elapsed"),
            HeroStat(formatDuration(state.durationMs), "Duration"),
        ),
        heroContent = {
            Row(horizontalArrangement = Arrangement.spacedBy(12.dp), modifier = Modifier.fillMaxWidth()) {
                Button(
                    onClick = { onOpen(DivyaRoutes.prayerFor(state.prayerId)) },
                    enabled = !state.prayerId.isNullOrBlank(),
                    modifier = Modifier.weight(1f),
                ) {
                    Text("Open prayer")
                }
                OutlinedButton(
                    onClick = { onOpen(DivyaRoutes.home.route) },
                    modifier = Modifier.weight(1f),
                ) {
                    Text("Minimize")
                }
            }
        },
    ) {
        item { DividerLabel("Transport") }

        item {
            PanelCard(
                title = "Playback",
                subtitle = "${formatDuration(state.currentPositionMs)} / ${formatDuration(state.durationMs)}",
            ) {
                Slider(
                    value = scrubValue,
                    onValueChange = {
                        isScrubbing = true
                        scrubValue = it
                    },
                    onValueChangeFinished = {
                        PrayerAudioPlayer.seekToFraction(scrubValue)
                        isScrubbing = false
                    },
                    valueRange = 0f..1f,
                    enabled = state.isReady && state.durationMs > 0,
                    modifier = Modifier.fillMaxWidth(),
                )
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.spacedBy(10.dp),
                ) {
                    OutlinedButton(onClick = { PrayerAudioPlayer.skipBy(-10_000L) }, modifier = Modifier.weight(1f)) {
                        Text("-10s")
                    }
                    Button(onClick = { PrayerAudioPlayer.togglePlayPause() }, modifier = Modifier.weight(1f)) {
                        Text(if (state.isPlaying) "Pause" else "Play")
                    }
                    OutlinedButton(onClick = { PrayerAudioPlayer.skipBy(10_000L) }, modifier = Modifier.weight(1f)) {
                        Text("+10s")
                    }
                }
            }
        }

        item { DividerLabel("Speed and session") }

        item {
            PanelCard(
                title = "Playback speed",
                subtitle = "Speed controls stay here and in the mini player so the rest of the app does not duplicate transport UI.",
            ) {
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.spacedBy(10.dp),
                ) {
                    OutlinedButton(
                        onClick = { PrayerAudioPlayer.setSpeed((state.playbackSpeed - 0.25f).coerceAtLeast(0.5f)) },
                        modifier = Modifier.weight(1f),
                    ) {
                        Text("-Speed")
                    }
                    Button(
                        onClick = { PrayerAudioPlayer.setSpeed(1f) },
                        modifier = Modifier.weight(1f),
                    ) {
                        Text("1.0x")
                    }
                    OutlinedButton(
                        onClick = { PrayerAudioPlayer.setSpeed((state.playbackSpeed + 0.25f).coerceAtMost(2f)) },
                        modifier = Modifier.weight(1f),
                    ) {
                        Text("+Speed")
                    }
                }
                TextBlock("Current playback speed: ${state.playbackSpeed}x")
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.spacedBy(10.dp),
                ) {
                    OutlinedButton(
                        onClick = { onOpen(DivyaRoutes.home.route) },
                        modifier = Modifier.weight(1f),
                    ) {
                        Text("Minimize")
                    }
                    Button(
                        onClick = {
                            PrayerAudioPlayer.clearCurrent()
                            onOpen(DivyaRoutes.home.route)
                        },
                        modifier = Modifier.weight(1f),
                    ) {
                        Text("Close")
                    }
                }
            }
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
