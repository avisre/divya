package com.divya.android.ui.components

import androidx.compose.animation.core.RepeatMode
import androidx.compose.animation.core.animateFloat
import androidx.compose.animation.core.infiniteRepeatable
import androidx.compose.animation.core.rememberInfiniteTransition
import androidx.compose.animation.core.tween
import androidx.compose.foundation.border
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.BoxScope
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.heightIn
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Surface
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.graphicsLayer
import androidx.compose.ui.unit.dp
import com.divya.android.ui.screens.AppContent
import com.divya.android.ui.screens.PanelCard
import com.divya.android.ui.screens.PrimaryActionButton
import com.divya.android.ui.screens.StatusPill
import com.divya.android.ui.theme.DeepBrown
import com.divya.android.ui.theme.SuccessLeaf
import com.divya.android.ui.theme.TempleGold

@Composable
fun DailyPrayerCard(
    recommendation: AppContent.DailyRecommendation,
    supportingLine: String,
    pulsePrimaryAction: Boolean = false,
    onBegin: () -> Unit,
) {
    PanelCard(
        title = "Today's Recommended Prayer",
        subtitle = supportingLine,
        accent = TempleGold,
    ) {
        Surface(
            color = TempleGold.copy(alpha = 0.08f),
            shape = MaterialTheme.shapes.small,
        ) {
            Column(
                modifier = Modifier.fillMaxWidth(),
                verticalArrangement = Arrangement.spacedBy(12.dp),
            ) {
                androidx.compose.material3.Text(
                    text = recommendation.prayer.title.en,
                    style = MaterialTheme.typography.headlineSmall,
                    color = DeepBrown,
                )
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.spacedBy(10.dp),
                ) {
                    StatusPill(
                        label = "${recommendation.prayer.durationMinutes} min",
                        color = TempleGold,
                    )
                    StatusPill(
                        label = recommendation.prayer.difficulty.replaceFirstChar { it.uppercase() },
                        color = TempleGold,
                    )
                }
                if (recommendation.completedToday) {
                    StatusPill(
                        label = "Completed today \u2022 ${recommendation.streakCount}-day streak",
                        color = SuccessLeaf,
                    )
                }
                PulsingActionFrame(
                    pulse = pulsePrimaryAction,
                    modifier = Modifier.fillMaxWidth(),
                ) {
                    PrimaryActionButton(
                        text = "Begin today's prayer",
                        onClick = onBegin,
                        modifier = Modifier.fillMaxWidth(),
                    )
                }
            }
        }
    }
}

@Composable
private fun PulsingActionFrame(
    pulse: Boolean,
    modifier: Modifier = Modifier,
    content: @Composable BoxScope.() -> Unit,
) {
    val transition = rememberInfiniteTransition(label = "daily_prayer_cta")
    val scale = if (pulse) {
        transition.animateFloat(
            initialValue = 1f,
            targetValue = 1.04f,
            animationSpec = infiniteRepeatable(
                animation = tween(durationMillis = 2000),
                repeatMode = RepeatMode.Reverse,
            ),
            label = "daily_prayer_scale",
        ).value
    } else {
        1f
    }
    val alpha = if (pulse) {
        transition.animateFloat(
            initialValue = 0.16f,
            targetValue = 0.04f,
            animationSpec = infiniteRepeatable(
                animation = tween(durationMillis = 2000),
                repeatMode = RepeatMode.Reverse,
            ),
            label = "daily_prayer_alpha",
        ).value
    } else {
        0f
    }

    Box(
        modifier = modifier,
        contentAlignment = Alignment.Center,
    ) {
        if (pulse) {
            Box(
                modifier = Modifier
                    .fillMaxWidth()
                    .heightIn(min = 52.dp)
                    .padding(2.dp)
                    .graphicsLayer(
                        scaleX = scale,
                        scaleY = scale,
                        alpha = alpha,
                    )
                    .clip(RoundedCornerShape(18.dp))
                    .border(
                        width = 1.5.dp,
                        color = TempleGold,
                        shape = RoundedCornerShape(18.dp),
                    ),
            )
        }
        content()
    }
}
