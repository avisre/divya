package com.divya.android.ui.components

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Surface
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp
import com.divya.android.ui.screens.AppContent
import com.divya.android.ui.screens.BulletList
import com.divya.android.ui.screens.PanelCard
import com.divya.android.ui.screens.StatusPill
import com.divya.android.ui.theme.AlertMarigold
import com.divya.android.ui.theme.DeepBrown
import com.divya.android.ui.theme.SuccessLeaf
import com.divya.android.ui.theme.TempleGold

@Composable
fun PanchangGuidanceCard(
    guidance: AppContent.PanchangGuidance,
) {
    val tone = when (guidance.overall.lowercase()) {
        "highly auspicious", "auspicious day", "auspicious" -> SuccessLeaf
        "inauspicious" -> AlertMarigold
        else -> TempleGold
    }

    PanelCard(
        title = "Today's Guidance",
        subtitle = "Actionable interpretation for your day",
        accent = tone,
    ) {
        StatusPill(label = guidance.overall, color = tone)
        Surface(color = tone.copy(alpha = 0.08f), shape = MaterialTheme.shapes.small) {
            Column(
                modifier = Modifier.fillMaxWidth(),
                verticalArrangement = Arrangement.spacedBy(10.dp),
            ) {
                Text(
                    text = "✅ Good for:",
                    style = MaterialTheme.typography.titleSmall,
                    color = DeepBrown,
                )
                BulletList(guidance.goodFor)
                Text(
                    text = "⚠️ Avoid:",
                    style = MaterialTheme.typography.titleSmall,
                    color = DeepBrown,
                )
                BulletList(guidance.avoidFor)
                Text(
                    text = "⭐ Best window: ${guidance.window}",
                    style = MaterialTheme.typography.bodyLarge,
                    color = DeepBrown,
                )
                Text(
                    text = guidance.infoText,
                    style = MaterialTheme.typography.bodySmall,
                    color = DeepBrown.copy(alpha = 0.75f),
                )
            }
        }
    }
}
