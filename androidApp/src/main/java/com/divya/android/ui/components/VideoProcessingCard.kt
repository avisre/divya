package com.divya.android.ui.components

import androidx.compose.foundation.BorderStroke
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.material3.LinearProgressIndicator
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Surface
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp
import com.divya.android.ui.theme.Clay
import com.divya.android.ui.theme.DeepBrown
import com.divya.android.ui.theme.Ivory
import com.divya.android.ui.theme.Saffron
import com.divya.android.ui.theme.TempleGold

@Composable
fun VideoProcessingCard() {
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
                text = "Video processing",
                style = MaterialTheme.typography.titleLarge,
                color = Saffron,
            )
            Text(
                text = "Your sacred recording is being prepared and signed for private delivery. Expected within 48 hours.",
                style = MaterialTheme.typography.bodyLarge,
                color = DeepBrown,
            )
            LinearProgressIndicator(
                progress = { 0.72f },
                modifier = Modifier.fillMaxWidth(),
                color = TempleGold,
                trackColor = TempleGold.copy(alpha = 0.18f),
            )
        }
    }
}
