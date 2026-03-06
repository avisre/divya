package com.divya.android.ui.components

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
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
import com.divya.android.ui.theme.DeepBrown
import com.divya.android.ui.theme.TempleGold

@Composable
fun FestivalPrepCard(
    prep: AppContent.FestivalPrepState,
    onOpenGuide: () -> Unit,
    onStartPrayer: () -> Unit,
) {
    PanelCard(
        title = "🪔 ${prep.festivalName} begins in ${prep.daysBefore} days",
        subtitle = prep.title,
        accent = TempleGold,
    ) {
        Surface(color = TempleGold.copy(alpha = 0.08f), shape = MaterialTheme.shapes.small) {
            Column(
                modifier = Modifier.fillMaxWidth(),
                verticalArrangement = Arrangement.spacedBy(10.dp),
            ) {
                Text(
                    text = prep.task,
                    style = MaterialTheme.typography.bodyLarge,
                    color = DeepBrown,
                )
                Text(
                    text = "Today's prep prayer: ${prep.prepPrayer.title.en} • ${prep.prepPrayer.durationMinutes} min",
                    style = MaterialTheme.typography.bodyMedium,
                    color = DeepBrown,
                )
                Text(
                    text = prep.diasporaNote,
                    style = MaterialTheme.typography.bodySmall,
                    color = DeepBrown.copy(alpha = 0.75f),
                )
                Button(onClick = onStartPrayer, modifier = Modifier.fillMaxWidth()) {
                    Text("Begin prep prayer →")
                }
                Button(onClick = onOpenGuide, modifier = Modifier.fillMaxWidth()) {
                    Text("View full ${prep.festivalName} guide")
                }
            }
        }
    }
}
