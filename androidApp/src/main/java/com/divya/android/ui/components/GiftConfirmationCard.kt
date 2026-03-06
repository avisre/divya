package com.divya.android.ui.components

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.material3.Button
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp
import com.divya.android.ui.screens.PanelCard
import com.divya.android.ui.theme.DeepBrown
import com.divya.android.ui.theme.SuccessLeaf

@Composable
fun GiftConfirmationCard(
    recipientName: String,
    pujaName: String,
    onShare: () -> Unit,
) {
    PanelCard(
        title = "🙏 Your gift has been offered",
        subtitle = "$pujaName has been booked in $recipientName's name.",
        accent = SuccessLeaf,
    ) {
        Column(verticalArrangement = Arrangement.spacedBy(10.dp), modifier = Modifier.fillMaxWidth()) {
            Text(
                text = "We've sent the recipient notification and updates will continue through puja completion and video delivery.",
                style = MaterialTheme.typography.bodyLarge,
                color = DeepBrown,
            )
            Button(onClick = onShare, modifier = Modifier.fillMaxWidth()) {
                Text("Share this gift")
            }
        }
    }
}
