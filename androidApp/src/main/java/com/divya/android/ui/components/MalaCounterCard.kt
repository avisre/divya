package com.divya.android.ui.components

import androidx.compose.foundation.BorderStroke
import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.material3.Button
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Surface
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.platform.LocalHapticFeedback
import androidx.compose.ui.semantics.contentDescription
import androidx.compose.ui.semantics.semantics
import androidx.compose.ui.unit.dp
import androidx.compose.ui.hapticfeedback.HapticFeedbackType
import com.divya.android.ui.screens.PanelCard
import com.divya.android.ui.theme.Clay
import com.divya.android.ui.theme.DeepBrown
import com.divya.android.ui.theme.Ivory
import com.divya.android.ui.theme.Saffron
import com.divya.android.ui.theme.TempleGold

@Composable
fun MalaCounterCard(
    currentBead: Int,
    onBeadTap: (Int) -> Unit,
    onReset: () -> Unit,
) {
    val haptic = LocalHapticFeedback.current
    val clampedCurrent = currentBead.coerceIn(0, 108)
    val beadRows = (1..108).toList().chunked(12)

    PanelCard(
        title = "108-bead digital japa mala",
        subtitle = "Tap a bead to count your repetition. Each tap gives haptic feedback and accessibility label.",
    ) {
        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.SpaceBetween,
            verticalAlignment = Alignment.CenterVertically,
        ) {
            Text(
                text = "$clampedCurrent / 108",
                style = MaterialTheme.typography.titleMedium,
                color = DeepBrown,
            )
            Button(onClick = onReset) {
                Text("Reset mala")
            }
        }
        Column(verticalArrangement = Arrangement.spacedBy(6.dp)) {
            beadRows.forEach { row ->
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceBetween,
                ) {
                    row.forEach { beadIndex ->
                        val reached = beadIndex <= clampedCurrent
                        Surface(
                            modifier = Modifier
                                .size(44.dp)
                                .semantics {
                                    contentDescription = "Bead $beadIndex of 108"
                                }
                                .clickable {
                                    haptic.performHapticFeedback(HapticFeedbackType.LongPress)
                                    onBeadTap(beadIndex)
                                },
                            shape = CircleShape,
                            color = Ivory,
                            border = BorderStroke(
                                width = 1.dp,
                                color = if (reached) Saffron else Clay,
                            ),
                        ) {
                            Box(
                                modifier = Modifier
                                    .padding(8.dp)
                                    .background(
                                        color = if (reached) TempleGold.copy(alpha = 0.85f) else Clay.copy(alpha = 0.45f),
                                        shape = CircleShape,
                                    ),
                            )
                        }
                    }
                }
            }
        }
    }
}
