package com.divya.android.ui.components

import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.shape.CircleShape
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
fun NilavilakkuFlame() {
    Surface(
        modifier = Modifier.fillMaxWidth(),
        color = Ivory.copy(alpha = 0.94f),
        shape = RoundedCornerShape(28.dp),
        border = androidx.compose.foundation.BorderStroke(1.dp, Clay.copy(alpha = 0.8f)),
    ) {
        Row(
            modifier = Modifier.padding(20.dp),
            horizontalArrangement = Arrangement.spacedBy(16.dp),
            verticalAlignment = Alignment.CenterVertically,
        ) {
            Box(
                modifier = Modifier
                    .size(86.dp)
                    .background(
                        brush = Brush.verticalGradient(
                            colors = listOf(LampGlow, Saffron, TempleGold),
                        ),
                        shape = CircleShape,
                    )
                    .border(1.dp, Clay.copy(alpha = 0.9f), CircleShape),
                contentAlignment = Alignment.Center,
            ) {
                Text(
                    text = "⟡",
                    style = MaterialTheme.typography.headlineLarge,
                    color = DeepBrown,
                )
            }
            Column(verticalArrangement = Arrangement.spacedBy(6.dp)) {
                Text(
                    text = "Nilavilakku focus mode",
                    style = MaterialTheme.typography.titleLarge,
                    color = DeepBrown,
                )
                Text(
                    text = "Warm, low-distraction prayer playback that feels ceremonial instead of utilitarian.",
                    style = MaterialTheme.typography.bodyMedium,
                    color = DeepBrown.copy(alpha = 0.8f),
                )
            }
        }
    }
}
