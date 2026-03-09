package com.divya.android.ui.screens

import androidx.compose.foundation.BorderStroke
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.heightIn
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.Button
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.OutlinedButton
import androidx.compose.material3.Slider
import androidx.compose.material3.Surface
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableFloatStateOf
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.platform.LocalConfiguration
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import com.divya.android.media.PrayerAudioPlayer
import com.divya.android.navigation.DivyaRoutes
import com.divya.android.ui.theme.DeepBrown
import com.divya.android.ui.theme.Saffron
import com.divya.android.ui.theme.TempleGold

@Composable
fun NowPlayingScreen(onOpen: (String) -> Unit) {
    val state by PrayerAudioPlayer.state.collectAsState()
    val isCompactPhone = LocalConfiguration.current.screenWidthDp < 390
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
        heroVariant = HeroCardVariant.PRAYER,
        heroStats = listOf(
            HeroStat("${state.playbackSpeed}x", "Playback speed"),
            HeroStat("${(state.progressFraction * 100).toInt()}%", "Progress"),
            HeroStat(formatDuration(state.currentPositionMs), "Elapsed"),
            HeroStat(formatDuration(state.durationMs), "Duration"),
        ),
        heroContent = {
            if (isCompactPhone) {
                Column(
                    modifier = Modifier.fillMaxWidth(),
                    verticalArrangement = Arrangement.spacedBy(12.dp),
                ) {
                    Button(
                        onClick = { onOpen(DivyaRoutes.prayerFor(state.prayerId)) },
                        enabled = !state.prayerId.isNullOrBlank(),
                        modifier = Modifier.fillMaxWidth(),
                    ) {
                        Text("Open prayer")
                    }
                    OutlinedButton(
                        onClick = { onOpen(DivyaRoutes.home.route) },
                        modifier = Modifier.fillMaxWidth(),
                    ) {
                        Text("Minimize")
                    }
                }
            } else {
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
                if (isCompactPhone) {
                    Column(
                        modifier = Modifier.fillMaxWidth(),
                        verticalArrangement = Arrangement.spacedBy(10.dp),
                    ) {
                        Button(
                            onClick = { PrayerAudioPlayer.togglePlayPause() },
                            modifier = Modifier.fillMaxWidth(),
                        ) {
                            Text(if (state.isPlaying) PAUSE_GLYPH else PLAY_GLYPH)
                        }
                        Row(
                            modifier = Modifier.fillMaxWidth(),
                            horizontalArrangement = Arrangement.spacedBy(10.dp),
                        ) {
                            OutlinedButton(
                                onClick = { PrayerAudioPlayer.skipBy(-10_000L) },
                                modifier = Modifier.weight(1f),
                            ) {
                                Text("-10s")
                            }
                            OutlinedButton(
                                onClick = { PrayerAudioPlayer.skipBy(10_000L) },
                                modifier = Modifier.weight(1f),
                            ) {
                                Text("+10s")
                            }
                        }
                    }
                } else {
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.spacedBy(10.dp),
                    ) {
                        OutlinedButton(
                            onClick = { PrayerAudioPlayer.skipBy(-10_000L) },
                            modifier = Modifier.weight(1f),
                        ) {
                            Text("-10s")
                        }
                        Button(
                            onClick = { PrayerAudioPlayer.togglePlayPause() },
                            modifier = Modifier.weight(1f),
                        ) {
                            Text(if (state.isPlaying) PAUSE_GLYPH else PLAY_GLYPH)
                        }
                        OutlinedButton(
                            onClick = { PrayerAudioPlayer.skipBy(10_000L) },
                            modifier = Modifier.weight(1f),
                        ) {
                            Text("+10s")
                        }
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
                SpeedAdjustRow(
                    isCompactPhone = isCompactPhone,
                    playbackSpeed = state.playbackSpeed,
                    onSpeedDown = { PrayerAudioPlayer.setSpeed((state.playbackSpeed - 0.25f).coerceAtLeast(0.5f)) },
                    onSpeedUp = { PrayerAudioPlayer.setSpeed((state.playbackSpeed + 0.25f).coerceAtMost(2f)) },
                )
                TextBlock("Current playback speed: ${state.playbackSpeed}x")
                OutlinedButton(
                    onClick = { PrayerAudioPlayer.setSpeed(1f) },
                    modifier = Modifier.fillMaxWidth(),
                ) {
                    Text("Reset speed to 1.0x")
                }
                if (isCompactPhone) {
                    Column(
                        modifier = Modifier.fillMaxWidth(),
                        verticalArrangement = Arrangement.spacedBy(10.dp),
                    ) {
                        OutlinedButton(
                            onClick = { onOpen(DivyaRoutes.home.route) },
                            modifier = Modifier.fillMaxWidth(),
                        ) {
                            Text("Minimize")
                        }
                        Button(
                            onClick = {
                                PrayerAudioPlayer.clearCurrent()
                                onOpen(DivyaRoutes.home.route)
                            },
                            modifier = Modifier.fillMaxWidth(),
                        ) {
                            Text(CLOSE_GLYPH)
                        }
                    }
                } else {
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
                            Text(CLOSE_GLYPH)
                        }
                    }
                }
            }
        }
    }
}

@Composable
private fun SpeedAdjustRow(
    isCompactPhone: Boolean,
    playbackSpeed: Float,
    onSpeedDown: () -> Unit,
    onSpeedUp: () -> Unit,
) {
    if (isCompactPhone) {
        Column(
            modifier = Modifier.fillMaxWidth(),
            verticalArrangement = Arrangement.spacedBy(10.dp),
        ) {
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.spacedBy(10.dp),
            ) {
                OutlinedButton(
                    onClick = onSpeedDown,
                    modifier = Modifier
                        .weight(1f)
                        .heightIn(min = 52.dp),
                ) {
                    Text("-", fontWeight = FontWeight.SemiBold)
                }
                SpeedPill(
                    modifier = Modifier.weight(2f),
                    value = "${playbackSpeed}x",
                )
                OutlinedButton(
                    onClick = onSpeedUp,
                    modifier = Modifier
                        .weight(1f)
                        .heightIn(min = 52.dp),
                ) {
                    Text("+", fontWeight = FontWeight.SemiBold)
                }
            }
        }
    } else {
        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.spacedBy(10.dp),
        ) {
            OutlinedButton(
                onClick = onSpeedDown,
                modifier = Modifier
                    .weight(1f)
                    .heightIn(min = 52.dp),
            ) {
                Text("-", fontWeight = FontWeight.SemiBold)
            }
            SpeedPill(
                modifier = Modifier.weight(2f),
                value = "${playbackSpeed}x",
            )
            OutlinedButton(
                onClick = onSpeedUp,
                modifier = Modifier
                    .weight(1f)
                    .heightIn(min = 52.dp),
            ) {
                Text("+", fontWeight = FontWeight.SemiBold)
            }
        }
    }
}

@Composable
private fun SpeedPill(
    modifier: Modifier,
    value: String,
) {
    Surface(
        modifier = modifier.heightIn(min = 52.dp),
        color = Saffron.copy(alpha = 0.14f),
        border = BorderStroke(1.dp, TempleGold.copy(alpha = 0.5f)),
        shape = RoundedCornerShape(999.dp),
    ) {
        Box(contentAlignment = Alignment.Center) {
            Text(
                text = value,
                color = DeepBrown,
                style = MaterialTheme.typography.titleMedium,
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

private const val PLAY_GLYPH = "\u25B6"
private const val PAUSE_GLYPH = "\u23F8"
private const val CLOSE_GLYPH = "\u2715"
