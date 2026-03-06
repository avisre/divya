package com.divya.android.ui.components

import androidx.compose.foundation.layout.padding
import androidx.compose.material3.Surface
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.MaterialTheme
import androidx.compose.ui.unit.dp
import com.divya.android.ui.screens.AppContent
import com.divya.android.ui.theme.Clay
import com.divya.android.ui.theme.DeepBrown
import com.divya.android.ui.theme.SuccessLeaf

@Composable
fun ParticipantPill(
    participant: AppContent.SharedParticipant,
    modifier: Modifier = Modifier,
) {
    val tone = if (participant.active) SuccessLeaf else Clay
    Surface(
        modifier = modifier,
        color = tone.copy(alpha = 0.12f),
        border = androidx.compose.foundation.BorderStroke(1.dp, tone.copy(alpha = 0.35f)),
        shape = RoundedCornerShape(999.dp),
    ) {
        Text(
            text = "${participant.name} • ${participant.location}",
            modifier = Modifier.padding(horizontal = 12.dp, vertical = 8.dp),
            style = MaterialTheme.typography.labelLarge,
            color = DeepBrown,
        )
    }
}
