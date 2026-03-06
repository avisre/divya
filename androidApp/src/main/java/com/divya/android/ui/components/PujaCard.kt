package com.divya.android.ui.components

import androidx.compose.foundation.BorderStroke
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Surface
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp
import com.divya.android.ui.screens.BulletList
import com.divya.android.ui.screens.InfoRow
import com.divya.android.ui.screens.StatusPill
import com.divya.android.ui.theme.Clay
import com.divya.android.ui.theme.DeepBrown
import com.divya.android.ui.theme.Ivory
import com.divya.android.ui.theme.Saffron
import com.divya.android.ui.theme.TempleGold
import com.divya.data.models.Puja

@Composable
fun PujaCard(puja: Puja) {
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
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
            ) {
                Column(
                    modifier = Modifier.weight(1f),
                    verticalArrangement = Arrangement.spacedBy(4.dp),
                ) {
                    Text(
                        text = puja.name.en,
                        style = MaterialTheme.typography.titleLarge,
                        color = Saffron,
                    )
                    Text(
                        text = puja.description.short ?: "Waitlist-only sacred offering",
                        style = MaterialTheme.typography.bodyMedium,
                        color = DeepBrown.copy(alpha = 0.75f),
                    )
                }
                StatusPill(label = "Waitlist only", color = TempleGold)
            }
            Row(horizontalArrangement = Arrangement.spacedBy(16.dp)) {
                Column(modifier = Modifier.weight(1f), verticalArrangement = Arrangement.spacedBy(10.dp)) {
                    InfoRow(label = "Price", value = "${puja.displayPrice?.currency ?: "USD"} ${puja.displayPrice?.amount ?: puja.pricing.usd}")
                    InfoRow(label = "Duration", value = "${puja.duration} min")
                }
                Column(modifier = Modifier.weight(1f), verticalArrangement = Arrangement.spacedBy(10.dp)) {
                    InfoRow(label = "Video", value = "Included")
                    InfoRow(label = "Wait", value = "~${puja.estimatedWaitWeeks} weeks")
                }
            }
            BulletList(items = puja.benefits.take(3))
            Text(
                text = puja.prasadNote,
                style = MaterialTheme.typography.bodyMedium,
                color = DeepBrown.copy(alpha = 0.75f),
            )
        }
    }
}
