package com.divya.android.ui.components

import androidx.compose.foundation.BorderStroke
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.OutlinedButton
import androidx.compose.material3.Surface
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.graphicsLayer
import androidx.compose.ui.unit.dp
import com.divya.android.ui.screens.InfoRow
import com.divya.android.ui.screens.StatusPill
import com.divya.android.ui.screens.TagRow
import com.divya.android.ui.theme.Clay
import com.divya.android.ui.theme.DeepBrown
import com.divya.android.ui.theme.Saffron
import com.divya.android.ui.theme.TempleGold
import com.divya.android.ui.theme.WhiteSmoke
import com.divya.data.models.Prayer

@Composable
fun PrayerCard(
    prayer: Prayer,
    requiredTier: String = "Free",
    isUnlocked: Boolean = true,
    isFavorite: Boolean = false,
    onFavoriteToggle: (() -> Unit)? = null,
    onClick: () -> Unit,
) {
    Surface(
        modifier = Modifier
            .fillMaxWidth()
            .graphicsLayer { alpha = if (isUnlocked) 1f else 0.78f }
            .clickable(onClick = onClick),
        color = WhiteSmoke.copy(alpha = 0.98f),
        shape = MaterialTheme.shapes.medium,
        border = BorderStroke(1.dp, Clay.copy(alpha = 0.8f)),
    ) {
        Column(
            modifier = Modifier.padding(20.dp),
            verticalArrangement = Arrangement.spacedBy(14.dp),
        ) {
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
            ) {
                Column(
                    modifier = Modifier.weight(1f),
                    verticalArrangement = Arrangement.spacedBy(4.dp),
                ) {
                    Text(
                        text = prayer.title.en,
                        style = MaterialTheme.typography.titleLarge,
                        color = Saffron,
                    )
                    Text(
                        text = prayer.title.sa ?: prayer.transliteration.orEmpty(),
                        style = MaterialTheme.typography.bodyMedium,
                        color = DeepBrown.copy(alpha = 0.7f),
                    )
                    Text(
                        text = buildString {
                            append("English-first")
                            if (prayer.title.sa != null) append(" | Sanskrit")
                            if (prayer.title.ml != null) append(" | Regional script")
                        },
                        style = MaterialTheme.typography.bodySmall,
                        color = DeepBrown.copy(alpha = 0.62f),
                    )
                }
                StatusPill(
                    label = when {
                        !isUnlocked -> "$requiredTier unlock"
                        prayer.audioUrl != null -> "Audio included"
                        requiredTier != "Free" -> requiredTier
                        else -> "Featured"
                    },
                    color = if (prayer.audioUrl != null && isUnlocked) Saffron else TempleGold,
                )
            }
            Row(horizontalArrangement = Arrangement.spacedBy(16.dp)) {
                Column(modifier = Modifier.weight(1f), verticalArrangement = Arrangement.spacedBy(10.dp)) {
                    InfoRow(label = "Deity", value = prayer.deity?.name?.en ?: "Universal")
                    InfoRow(label = "Duration", value = normalizedDurationLabel(prayer.durationMinutes))
                }
                Column(modifier = Modifier.weight(1f), verticalArrangement = Arrangement.spacedBy(10.dp)) {
                    InfoRow(label = "Difficulty", value = prayer.difficulty.replaceFirstChar { it.uppercase() })
                    InfoRow(label = "Repetitions", value = prayer.recommendedRepetitions.joinToString())
                }
            }
            Text(
                text = prayer.meaning ?: "Sacred daily recitation",
                style = MaterialTheme.typography.bodyLarge,
                color = DeepBrown,
            )
            val beginnerNote = prayer.beginnerNote
            if (!beginnerNote.isNullOrBlank()) {
                Text(
                    text = beginnerNote,
                    style = MaterialTheme.typography.bodyMedium,
                    color = DeepBrown.copy(alpha = 0.75f),
                )
            }
            if (!isUnlocked) {
                Text(
                    text = "Included with the $requiredTier plan.",
                    style = MaterialTheme.typography.bodyMedium,
                    color = DeepBrown.copy(alpha = 0.82f),
                )
            }
            if (onFavoriteToggle != null) {
                OutlinedButton(onClick = onFavoriteToggle, modifier = Modifier.fillMaxWidth()) {
                    Text(if (isFavorite) "Remove favorite" else "Add favorite")
                }
            }
            TagRow(tags = prayer.tags.ifEmpty { listOf("Daily", "Temple", "Audio soon") })
        }
    }
}

private fun normalizedDurationLabel(minutes: Int): String {
    val safe = minutes.coerceAtLeast(1)
    return if (safe == 1) "1 min" else "$safe mins"
}
