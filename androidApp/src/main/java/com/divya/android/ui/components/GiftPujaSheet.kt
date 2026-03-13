package com.divya.android.ui.components

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.material3.Button
import androidx.compose.material3.OutlinedButton
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp
import com.divya.android.ui.screens.BulletList
import com.divya.android.ui.screens.PanelCard
import com.divya.android.ui.screens.SelectableTagRow

@Composable
fun GiftPujaSheet(
    onContinue: () -> Unit,
    onCancel: () -> Unit,
) {
    PanelCard(
        title = "Gift This Puja to Someone",
        subtitle = "Collect recipient details, occasion, message, devotee details, and payment in one guided flow.",
    ) {
        Column(verticalArrangement = Arrangement.spacedBy(10.dp), modifier = Modifier.fillMaxWidth()) {
            BulletList(
                listOf(
                    "Step 1: Recipient name, email, and optional WhatsApp",
                    "Step 2: Occasion and personal message",
                    "Step 3: Devotee details (gothram and nakshatra)",
                    "Step 4: Payment by gifter in local currency",
                    "Step 5: Confirmation and share card",
                ),
            )
            SelectableTagRow(
                options = listOf("Birthday", "Anniversary", "Health", "New home", "General blessing"),
                selected = "Birthday",
                onSelect = {},
            )
            Button(onClick = onContinue, modifier = Modifier.fillMaxWidth()) {
                Text("Start gift flow")
            }
            OutlinedButton(onClick = onCancel, modifier = Modifier.fillMaxWidth()) {
                Text("Cancel")
            }
        }
    }
}
