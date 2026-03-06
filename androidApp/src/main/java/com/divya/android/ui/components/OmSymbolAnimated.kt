package com.divya.android.ui.components

import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
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

@Composable
fun OmSymbolAnimated() {
    Surface(
        modifier = Modifier.fillMaxWidth(),
        shape = RoundedCornerShape(28.dp),
        color = Ivory.copy(alpha = 0.9f),
        border = androidx.compose.foundation.BorderStroke(1.dp, Clay.copy(alpha = 0.8f)),
    ) {
        Row(
            modifier = Modifier.padding(20.dp),
            verticalAlignment = Alignment.CenterVertically,
        ) {
            Box(
                modifier = Modifier
                    .size(84.dp)
                    .background(
                        brush = Brush.radialGradient(
                            colors = listOf(LampGlow, Saffron.copy(alpha = 0.18f)),
                        ),
                        shape = CircleShape,
                    )
                    .border(1.dp, Clay.copy(alpha = 0.8f), CircleShape),
                contentAlignment = Alignment.Center,
            ) {
                Text(
                    text = "ॐ",
                    style = MaterialTheme.typography.headlineLarge,
                    color = DeepBrown,
                )
            }
            Spacer(modifier = Modifier.size(16.dp))
            Column {
                Text(
                    text = "Temple in your pocket",
                    style = MaterialTheme.typography.titleLarge,
                    color = DeepBrown,
                )
                Spacer(modifier = Modifier.height(6.dp))
                Text(
                    text = "A calm visual anchor for prayer, rooted in Kerala and designed for diaspora life.",
                    style = MaterialTheme.typography.bodyMedium,
                    color = DeepBrown.copy(alpha = 0.8f),
                )
            }
        }
    }
}
