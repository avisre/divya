package com.divya.android.ui.components

import androidx.compose.animation.core.animateFloatAsState
import androidx.compose.animation.core.spring
import androidx.compose.foundation.BorderStroke
import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.interaction.MutableInteractionSource
import androidx.compose.foundation.interaction.collectIsPressedAsState
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.heightIn
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.ButtonDefaults
import androidx.compose.material3.LinearProgressIndicator
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.OutlinedButton
import androidx.compose.material3.Surface
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.runtime.remember
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.graphicsLayer
import androidx.compose.foundation.LocalIndication
import androidx.compose.ui.platform.LocalConfiguration
import androidx.compose.ui.platform.LocalView
import androidx.compose.ui.platform.testTag
import androidx.compose.ui.semantics.contentDescription
import androidx.compose.ui.semantics.semantics
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.dp
import com.divya.android.media.PrayerAudioPlayer
import com.divya.android.ui.theme.Clay
import com.divya.android.ui.theme.DeepBrown
import com.divya.android.ui.theme.Ivory
import com.divya.android.ui.theme.Saffron
import com.divya.android.ui.theme.TempleGold
import com.divya.android.ui.theme.WhiteSmoke

@Composable
fun PrayerMiniPlayerBar(
    onOpenPlayer: () -> Unit,
) {
    val state by PrayerAudioPlayer.state.collectAsState()
    val title = state.title ?: return
    val hostView = LocalView.current
    val isCompactPhone = LocalConfiguration.current.screenWidthDp < 390
    val interactionSource = remember { MutableInteractionSource() }
    val isPressed by interactionSource.collectIsPressedAsState()
    val pressScale by animateFloatAsState(
        targetValue = if (isPressed) 0.97f else 1f,
        animationSpec = spring(stiffness = 1200f, dampingRatio = 0.82f),
        label = "mini_player_press_scale",
    )

    Surface(
        modifier = Modifier
            .fillMaxWidth()
            .graphicsLayer(
                scaleX = pressScale,
                scaleY = pressScale,
            )
            .testTag("mini_player_bar")
            .semantics { contentDescription = "Mini player: $title" }
            .clickable(
                interactionSource = interactionSource,
                indication = LocalIndication.current,
            ) { onOpenPlayer() },
        color = WhiteSmoke.copy(alpha = 0.98f),
        border = BorderStroke(1.dp, Clay.copy(alpha = 0.7f)),
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
                            .background(Saffron.copy(alpha = 0.16f), CircleShape),
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
                            color = DeepBrown,
                            maxLines = 1,
                            overflow = TextOverflow.Ellipsis,
                        )
                        Text(
                            text = "${formatDuration(state.currentPositionMs)} / ${formatDuration(state.durationMs)} | ${state.playbackSpeed}x",
                            style = MaterialTheme.typography.bodySmall,
                            color = DeepBrown.copy(alpha = 0.72f),
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
                        containerColor = Ivory,
                        contentColor = DeepBrown,
                    ),
                ) {
                    Text("Open")
                }
            }

            if (isCompactPhone) {
                Column(
                    modifier = Modifier
                        .fillMaxWidth()
                        .semantics { contentDescription = "Minimized player controls" },
                    verticalArrangement = Arrangement.spacedBy(8.dp),
                ) {
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.spacedBy(8.dp),
                    ) {
                        SpeedStepButton(
                            label = "-",
                            testTag = "mini_player_speed_down",
                            description = "Decrease playback speed",
                        ) {
                            val updated = (state.playbackSpeed - 0.25f).coerceAtLeast(0.5f)
                            PrayerAudioPlayer.setSpeed(updated)
                            hostView.announceForAccessibility("Speed $updated x")
                        }
                        SpeedPill(
                            modifier = Modifier.weight(2f),
                            value = "${state.playbackSpeed}x",
                        )
                        SpeedStepButton(
                            label = "+",
                            testTag = "mini_player_speed_up",
                            description = "Increase playback speed",
                        ) {
                            val updated = (state.playbackSpeed + 0.25f).coerceAtMost(2f)
                            PrayerAudioPlayer.setSpeed(updated)
                            hostView.announceForAccessibility("Speed $updated x")
                        }
                    }
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.spacedBy(8.dp),
                    ) {
                        OutlinedButton(
                            onClick = { PrayerAudioPlayer.togglePlayPause() },
                            modifier = Modifier
                                .weight(1f)
                                .heightIn(min = 44.dp)
                                .testTag("mini_player_play_pause")
                                .semantics { contentDescription = if (state.isPlaying) "Pause prayer audio" else "Play prayer audio" },
                            colors = ButtonDefaults.outlinedButtonColors(
                                containerColor = Saffron.copy(alpha = 0.2f),
                                contentColor = DeepBrown,
                            ),
                            border = BorderStroke(1.dp, TempleGold.copy(alpha = 0.6f)),
                        ) {
                            Text(if (state.isPlaying) PAUSE_GLYPH else PLAY_GLYPH)
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
                                contentColor = DeepBrown,
                            ),
                            border = BorderStroke(1.dp, Clay.copy(alpha = 0.7f)),
                        ) {
                            Text(CLOSE_GLYPH)
                        }
                    }
                }
            } else {
                Row(
                    modifier = Modifier
                        .fillMaxWidth()
                        .semantics { contentDescription = "Minimized player controls" },
                    horizontalArrangement = Arrangement.spacedBy(8.dp),
                ) {
                    SpeedStepButton(
                        label = "-",
                        testTag = "mini_player_speed_down",
                        description = "Decrease playback speed",
                        modifier = Modifier.width(64.dp),
                    ) {
                        val updated = (state.playbackSpeed - 0.25f).coerceAtLeast(0.5f)
                        PrayerAudioPlayer.setSpeed(updated)
                        hostView.announceForAccessibility("Speed $updated x")
                    }
                    SpeedPill(
                        modifier = Modifier.weight(1f),
                        value = "${state.playbackSpeed}x",
                    )
                    SpeedStepButton(
                        label = "+",
                        testTag = "mini_player_speed_up",
                        description = "Increase playback speed",
                        modifier = Modifier.width(64.dp),
                    ) {
                        val updated = (state.playbackSpeed + 0.25f).coerceAtMost(2f)
                        PrayerAudioPlayer.setSpeed(updated)
                        hostView.announceForAccessibility("Speed $updated x")
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
                            contentColor = DeepBrown,
                        ),
                        border = BorderStroke(1.dp, TempleGold.copy(alpha = 0.6f)),
                    ) {
                        Text(if (state.isPlaying) PAUSE_GLYPH else PLAY_GLYPH)
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
                            contentColor = DeepBrown,
                        ),
                        border = BorderStroke(1.dp, Clay.copy(alpha = 0.7f)),
                    ) {
                        Text(CLOSE_GLYPH)
                    }
                }
            }

            LinearProgressIndicator(
                progress = { state.progressFraction },
                modifier = Modifier
                    .fillMaxWidth()
                    .testTag("mini_player_progress"),
                color = TempleGold,
                trackColor = Clay.copy(alpha = 0.28f),
            )
        }
    }
}

@Composable
private fun SpeedStepButton(
    label: String,
    testTag: String,
    description: String,
    modifier: Modifier = Modifier,
    onClick: () -> Unit,
) {
    OutlinedButton(
        onClick = onClick,
        modifier = modifier
            .heightIn(min = 44.dp)
            .testTag(testTag)
            .semantics { contentDescription = description },
        colors = ButtonDefaults.outlinedButtonColors(
            contentColor = DeepBrown,
        ),
        border = BorderStroke(1.dp, Clay.copy(alpha = 0.7f)),
    ) {
        Text(label, fontWeight = FontWeight.SemiBold)
    }
}

@Composable
private fun SpeedPill(
    modifier: Modifier,
    value: String,
) {
    Surface(
        modifier = modifier.heightIn(min = 44.dp),
        shape = RoundedCornerShape(999.dp),
        color = Saffron.copy(alpha = 0.14f),
        border = BorderStroke(1.dp, TempleGold.copy(alpha = 0.45f)),
    ) {
        Box(contentAlignment = Alignment.Center) {
            Text(
                text = value,
                color = DeepBrown,
                style = MaterialTheme.typography.labelLarge,
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
