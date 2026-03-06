package com.divya.android.ui.components

import androidx.compose.foundation.BorderStroke
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.material3.Button
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.OutlinedButton
import androidx.compose.material3.Surface
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.unit.dp
import com.divya.android.ui.screens.BulletList
import com.divya.android.ui.screens.StatusPill
import com.divya.android.ui.theme.Clay
import com.divya.android.ui.theme.DeepBrown
import com.divya.android.ui.theme.Ivory
import com.divya.android.ui.theme.Sand
import com.divya.android.ui.theme.Saffron

@Composable
fun SubscriptionTierCard(
    name: String,
    price: String,
    summary: String,
    perks: List<String>,
    badge: String? = null,
    accent: Color = Saffron,
    cta: String? = null,
    footnote: String? = null,
    emphasized: Boolean = false,
    onSelect: (() -> Unit)? = null,
) {
    Surface(
        modifier = Modifier.fillMaxWidth(),
        color = if (emphasized) Sand.copy(alpha = 0.6f) else Ivory.copy(alpha = 0.98f),
        shape = MaterialTheme.shapes.medium,
        border = BorderStroke(if (emphasized) 2.dp else 1.dp, if (emphasized) accent.copy(alpha = 0.45f) else Clay.copy(alpha = 0.8f)),
    ) {
        Column(
            modifier = Modifier.padding(20.dp),
            verticalArrangement = Arrangement.spacedBy(12.dp),
        ) {
            if (badge != null) {
                StatusPill(label = badge, color = accent)
            }
            Text(
                text = name,
                style = MaterialTheme.typography.titleLarge,
                color = accent,
            )
            Text(
                text = price,
                style = MaterialTheme.typography.headlineMedium,
                color = DeepBrown,
            )
            Text(
                text = summary,
                style = MaterialTheme.typography.bodyLarge,
                color = DeepBrown,
            )
            BulletList(perks)
            if (!footnote.isNullOrBlank()) {
                Text(
                    text = footnote,
                    style = MaterialTheme.typography.bodyMedium,
                    color = DeepBrown.copy(alpha = 0.75f),
                )
            }
            if (!cta.isNullOrBlank() && onSelect != null) {
                if (emphasized) {
                    Button(
                        onClick = onSelect,
                        modifier = Modifier.fillMaxWidth(),
                    ) {
                        Text(cta)
                    }
                } else {
                    OutlinedButton(
                        onClick = onSelect,
                        modifier = Modifier.fillMaxWidth(),
                    ) {
                        Text(cta)
                    }
                }
            }
        }
    }
}
