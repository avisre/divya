package com.divya.android.ui.screens

import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.saveable.rememberSaveable
import androidx.compose.runtime.setValue
import com.divya.android.ui.components.GiftConfirmationCard
import com.divya.android.ui.components.GiftPujaSheet

@Composable
fun GiftsScreen() {
    var view by rememberSaveable { mutableStateOf("Sent") }
    var giftFlowStarted by rememberSaveable { mutableStateOf(false) }

    ScreenScaffold(
        eyebrow = "Puja gifting",
        title = "Gifts",
        subtitle = "Offer sacred pujas for family milestones and track sent/received gifts.",
        badge = "Sent and received",
        heroStats = listOf(
            HeroStat("5 steps", "Gift flow"),
            HeroStat("Email + app", "Recipient notification"),
            HeroStat("${AppContent.giftsPreview.size}", "Recent gifts"),
        ),
    ) {
        item {
            PanelCard(title = "View mode") {
                SelectableTagRow(
                    options = listOf("Sent", "Received"),
                    selected = view,
                    onSelect = { view = it },
                )
            }
        }
        AppContent.giftsPreview.forEach { gift ->
            item {
                PanelCard(
                    title = "${gift.pujaName} • ${gift.occasion}",
                    subtitle = "${if (view == "Sent") "Recipient" else "Gifted by"}: ${gift.recipient}",
                ) {
                    InfoRow(label = "Status", value = gift.status)
                }
            }
        }
        item {
            if (!giftFlowStarted) {
                GiftPujaSheet(
                    onContinue = { giftFlowStarted = true },
                    onCancel = { giftFlowStarted = false },
                )
            } else {
                GiftConfirmationCard(
                    recipientName = "Amma",
                    pujaName = "Abhishekam",
                    onShare = {},
                )
            }
        }
    }
}
