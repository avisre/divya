package com.divya.android.ui.components

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.material3.Button
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.unit.dp
import com.divya.android.ui.screens.PanelCard
import com.divya.android.ui.theme.DeepBrown
import com.divya.android.ui.theme.Ivory
import com.divya.android.ui.theme.TempleGold

@Composable
fun MilestoneShareCard(
    days: Int,
    userName: String,
    onShare: () -> Unit,
) {
    PanelCard(
        title = "🕉️ $days Days of Prayer",
        subtitle = "$userName has maintained a sacred $days-day prayer practice.",
        accent = TempleGold,
    ) {
        Column(
            modifier = Modifier
                .fillMaxWidth()
                .background(
                    Brush.verticalGradient(
                        colors = listOf(TempleGold.copy(alpha = 0.22f), Ivory),
                    ),
                    shape = MaterialTheme.shapes.medium,
                )
                .padding(14.dp),
            verticalArrangement = Arrangement.spacedBy(8.dp),
        ) {
            Text(
                text = "\"The Goddess sees your dedication. 🙏\"",
                style = MaterialTheme.typography.bodyLarge,
                color = DeepBrown,
            )
            Button(onClick = onShare, modifier = Modifier.fillMaxWidth()) {
                Text("Share to WhatsApp")
            }
        }
    }
}
