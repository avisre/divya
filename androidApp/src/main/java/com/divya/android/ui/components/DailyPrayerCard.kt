package com.divya.android.ui.components

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.material3.Button
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Surface
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp
import com.divya.android.ui.screens.AppContent
import com.divya.android.ui.screens.PanelCard
import com.divya.android.ui.screens.StatusPill
import com.divya.android.ui.theme.DeepBrown
import com.divya.android.ui.theme.SuccessLeaf
import com.divya.android.ui.theme.TempleGold

@Composable
fun DailyPrayerCard(
    recommendation: AppContent.DailyRecommendation,
    onBegin: () -> Unit,
) {
    PanelCard(
        title = "Today's Recommended Prayer",
        subtitle = recommendation.reason,
        accent = TempleGold,
    ) {
        Surface(color = TempleGold.copy(alpha = 0.08f), shape = MaterialTheme.shapes.small) {
            Column(
                modifier = Modifier.fillMaxWidth(),
                verticalArrangement = Arrangement.spacedBy(12.dp),
            ) {
                Column(verticalArrangement = Arrangement.spacedBy(6.dp)) {
                    Text(
                        text = recommendation.prayer.title.en,
                        style = MaterialTheme.typography.headlineSmall,
                        color = DeepBrown,
                    )
                    Text(
                        text = recommendation.prayer.deity?.name?.en ?: "Universal prayer",
                        style = MaterialTheme.typography.bodyMedium,
                        color = DeepBrown.copy(alpha = 0.72f),
                    )
                }
                Row(horizontalArrangement = Arrangement.spacedBy(10.dp), modifier = Modifier.fillMaxWidth()) {
                    StatusPill(label = "${recommendation.prayer.durationMinutes} min", color = TempleGold)
                    StatusPill(label = recommendation.prayer.difficulty.replaceFirstChar { it.uppercase() }, color = TempleGold)
                }
                if (recommendation.completedToday) {
                    StatusPill(
                        label = "Completed today 🙏 • ${recommendation.streakCount}-day streak",
                        color = SuccessLeaf,
                    )
                }
                Button(onClick = onBegin, modifier = Modifier.fillMaxWidth()) {
                    Text("Begin today's prayer →")
                }
            }
        }
    }
}
