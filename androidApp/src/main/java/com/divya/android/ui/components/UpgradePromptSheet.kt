package com.divya.android.ui.components

import androidx.compose.foundation.BorderStroke
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Surface
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp
import com.divya.android.ui.screens.AppContent
import com.divya.android.ui.screens.InfoRow
import com.divya.android.ui.theme.Clay
import com.divya.android.ui.theme.DeepBrown
import com.divya.android.ui.theme.Ivory
import com.divya.android.ui.theme.Saffron
import com.divya.android.ui.theme.TempleGold

@Composable
fun UpgradePromptSheet(onSelectTier: (String) -> Unit = {}) {
    Surface(
        modifier = Modifier.fillMaxWidth(),
        color = Ivory.copy(alpha = 0.96f),
        shape = MaterialTheme.shapes.medium,
        border = BorderStroke(1.dp, Clay.copy(alpha = 0.8f)),
    ) {
        Column(
            modifier = Modifier.padding(20.dp),
            verticalArrangement = Arrangement.spacedBy(12.dp),
        ) {
            Text(
                text = "Choose your spiritual path",
                style = MaterialTheme.typography.titleLarge,
                color = Saffron,
            )
            Text(
                text = "Clear tiering improves conversion only when the devotee can quickly see which plan fits exploration, daily practice, or family ritual archiving.",
                style = MaterialTheme.typography.bodyLarge,
                color = DeepBrown,
            )
            InfoRow(label = "Best entry point", value = "Free for exploration, Bhakt for habit, Seva for family keepsakes")
            AppContent.tiers.forEach { tier ->
                SubscriptionTierCard(
                    name = tier.name,
                    price = tier.price,
                    summary = tier.summary,
                    perks = tier.perks,
                    badge = tier.badge,
                    accent = if (tier.name == "Seva") TempleGold else Saffron,
                    cta = tier.cta,
                    footnote = tier.footnote,
                    emphasized = tier.name == "Bhakt",
                    onSelect = { onSelectTier(tier.name) },
                )
            }
        }
    }
}

