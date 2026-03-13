package com.divya.android.ui.components

import androidx.compose.animation.core.RepeatMode
import androidx.compose.animation.core.animateFloat
import androidx.compose.animation.core.infiniteRepeatable
import androidx.compose.animation.core.rememberInfiniteTransition
import androidx.compose.animation.core.tween
import androidx.compose.foundation.BorderStroke
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Surface
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.graphicsLayer
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import com.divya.android.ui.theme.Clay
import com.divya.android.ui.theme.DeepBrown
import com.divya.android.ui.theme.Ivory
import com.divya.android.ui.theme.Saffron

private val PendingVideoColor = Color(0xFF7B8FA1)

@Composable
fun VideoProcessingCard(videoStatus: String) {
    Surface(
        modifier = Modifier.fillMaxWidth(),
        color = Ivory.copy(alpha = 0.96f),
        shape = MaterialTheme.shapes.medium,
        border = BorderStroke(1.dp, Clay.copy(alpha = 0.8f)),
    ) {
        Column(
            modifier = Modifier.padding(20.dp),
            verticalArrangement = Arrangement.spacedBy(14.dp),
        ) {
            Text(
                text = "Video processing",
                style = MaterialTheme.typography.titleLarge,
                color = Saffron,
            )
            VideoStatusStepper(videoStatus = videoStatus)
            Text(
                text = "Private puja recording will appear here when the temple uploads it.",
                style = MaterialTheme.typography.bodyLarge,
                color = DeepBrown,
            )
        }
    }
}

@Composable
fun VideoStatusStepper(videoStatus: String) {
    val steps = listOf("Booked", "Puja performed", "Recording", "Delivered")
    val completedCount = when (videoStatus) {
        "performed" -> 2
        "processing" -> 3
        "video_ready" -> 4
        else -> 1
    }
    val currentIndex = when {
        videoStatus == "video_ready" -> -1
        else -> completedCount.coerceAtMost(steps.lastIndex)
    }

    Column(verticalArrangement = Arrangement.spacedBy(10.dp)) {
        Box(modifier = Modifier.fillMaxWidth()) {
            Row(
                modifier = Modifier
                    .fillMaxWidth()
                    .align(Alignment.TopCenter)
                    .padding(horizontal = 34.dp, vertical = 10.dp),
                verticalAlignment = Alignment.CenterVertically,
            ) {
                repeat(steps.lastIndex) { index ->
                    Box(
                        modifier = Modifier
                            .weight(1f)
                            .height(2.dp)
                            .background(
                                color = if (index < completedCount - 1) {
                                    Saffron
                                } else {
                                    Clay.copy(alpha = 0.5f)
                                },
                            ),
                    )
                }
            }
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
            ) {
                steps.forEachIndexed { index, label ->
                    Column(
                        modifier = Modifier.weight(1f),
                        horizontalAlignment = Alignment.CenterHorizontally,
                        verticalArrangement = Arrangement.spacedBy(8.dp),
                    ) {
                        StepNode(
                            isCompleted = index < completedCount,
                            isCurrent = index == currentIndex,
                        )
                        Text(
                            text = label,
                            color = DeepBrown,
                            textAlign = TextAlign.Center,
                            style = MaterialTheme.typography.bodySmall.copy(
                                fontWeight = if (index < completedCount || index == currentIndex) {
                                    FontWeight.SemiBold
                                } else {
                                    FontWeight.Normal
                                },
                            ),
                        )
                    }
                }
            }
        }
    }
}

@Composable
private fun StepNode(
    isCompleted: Boolean,
    isCurrent: Boolean,
) {
    val transition = rememberInfiniteTransition(label = "video_stepper")
    val ringScale = transition.animateFloat(
        initialValue = 1f,
        targetValue = 1.08f,
        animationSpec = infiniteRepeatable(
            animation = tween(durationMillis = 1800),
            repeatMode = RepeatMode.Reverse,
        ),
        label = "video_stepper_scale",
    ).value
    val ringAlpha = transition.animateFloat(
        initialValue = 0.2f,
        targetValue = 0.06f,
        animationSpec = infiniteRepeatable(
            animation = tween(durationMillis = 1800),
            repeatMode = RepeatMode.Reverse,
        ),
        label = "video_stepper_alpha",
    ).value

    Box(
        modifier = Modifier.size(28.dp),
        contentAlignment = Alignment.Center,
    ) {
        if (isCurrent) {
            Box(
                modifier = Modifier
                    .size(28.dp)
                    .graphicsLayer(
                        scaleX = ringScale,
                        scaleY = ringScale,
                        alpha = ringAlpha,
                    )
                    .background(Saffron, CircleShape),
            )
        }
        Box(
            modifier = Modifier
                .size(18.dp)
                .background(
                    color = when {
                        isCompleted -> Saffron
                        isCurrent -> Color.Transparent
                        else -> PendingVideoColor.copy(alpha = 0.5f)
                    },
                    shape = CircleShape,
                )
                .then(
                    if (isCurrent) {
                        Modifier.background(Color.Transparent, CircleShape)
                    } else {
                        Modifier
                    },
                ),
            contentAlignment = Alignment.Center,
        ) {
            if (isCurrent) {
                Box(
                    modifier = Modifier
                        .size(12.dp)
                        .background(Saffron, CircleShape),
                )
            } else if (isCompleted) {
                Text(
                    text = "\u2713",
                    color = Color.White,
                    style = MaterialTheme.typography.labelSmall,
                )
            }
        }
    }
}
