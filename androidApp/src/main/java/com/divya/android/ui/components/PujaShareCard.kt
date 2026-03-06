package com.divya.android.ui.components

import androidx.compose.foundation.BorderStroke
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Surface
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.unit.dp
import com.divya.android.ui.theme.Clay
import com.divya.android.ui.theme.DeepBrown
import com.divya.android.ui.theme.Ivory
import com.divya.android.ui.theme.LampGlow
import com.divya.android.ui.theme.Saffron
import com.divya.android.ui.theme.TempleGold

@Composable
fun PujaShareCard() {
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
                text = "Share your blessing",
                style = MaterialTheme.typography.titleLarge,
                color = Saffron,
            )
            Box(
                modifier = Modifier
                    .fillMaxWidth()
                    .height(180.dp)
                    .background(
                        brush = Brush.verticalGradient(
                            colors = listOf(LampGlow.copy(alpha = 0.75f), TempleGold.copy(alpha = 0.20f)),
                        ),
                        shape = RoundedCornerShape(24.dp),
                    ),
                contentAlignment = Alignment.Center,
            ) {
                Column(
                    modifier = Modifier.padding(20.dp),
                    verticalArrangement = Arrangement.spacedBy(8.dp),
                    horizontalAlignment = Alignment.CenterHorizontally,
                ) {
                    Text(text = "Seeking Divine Blessings", style = MaterialTheme.typography.titleLarge, color = DeepBrown)
                    Text(
                        text = "I have booked Abhishekam at Bhadra Bhagavathi Temple, Karunagapally.",
                        style = MaterialTheme.typography.bodyLarge,
                        color = DeepBrown,
                    )
                    Text(
                        text = "Designed for WhatsApp and iMessage sharing after waitlist join.",
                        style = MaterialTheme.typography.bodySmall,
                        color = DeepBrown.copy(alpha = 0.7f),
                    )
                }
            }
        }
    }
}
