package com.divya.android.ui.screens

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.material3.Button
import androidx.compose.material3.OutlinedButton
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.saveable.rememberSaveable
import androidx.compose.runtime.setValue
import androidx.compose.ui.Modifier
import androidx.compose.ui.platform.LocalConfiguration
import androidx.compose.ui.unit.dp
import com.divya.android.navigation.DivyaRoutes
import com.divya.android.ui.formatPrice
import com.divya.android.ui.components.GiftConfirmationCard
import com.divya.android.ui.components.GiftPujaSheet
import com.divya.android.ui.components.PujaCard
import com.divya.android.ui.theme.TempleGold

@Composable
fun PujaDetailScreen(onOpen: (String) -> Unit) {
    val isCompactPhone = LocalConfiguration.current.screenWidthDp < 380
    var selectedPujaName by rememberSaveable { mutableStateOf(AppContent.abhishekam.name.en) }
    var showGiftFlow by rememberSaveable { mutableStateOf(false) }
    var giftConfirmed by rememberSaveable { mutableStateOf(false) }
    val selectedPuja = AppContent.allPujas.firstOrNull { it.name.en == selectedPujaName } ?: AppContent.abhishekam

    ScreenScaffold(
        eyebrow = "Sacred offering",
        title = selectedPuja.name.en,
        subtitle = "See what this ritual includes, why families choose it, and how the temple will carry it in your name.",
        badge = "Waitlist only",
        heroStats = listOf(
            HeroStat(
                formatPrice(
                    amount = selectedPuja.displayPrice?.amount ?: selectedPuja.pricing.usd,
                    currencyCode = selectedPuja.displayPrice?.currency ?: "USD",
                ),
                "Presented price",
            ),
            HeroStat("${selectedPuja.duration} min", "Temple duration"),
            HeroStat("${selectedPuja.estimatedWaitWeeks} weeks", "Estimated wait"),
            HeroStat("Private video", "Delivered after completion"),
        ),
        heroContent = {
            if (isCompactPhone) {
                Column(verticalArrangement = Arrangement.spacedBy(12.dp), modifier = Modifier.fillMaxWidth()) {
                    Button(onClick = { onOpen(DivyaRoutes.waitlist.route) }, modifier = Modifier.fillMaxWidth()) {
                        Text("Join waitlist")
                    }
                    OutlinedButton(
                        onClick = {
                            showGiftFlow = true
                            giftConfirmed = false
                        },
                        modifier = Modifier.fillMaxWidth(),
                    ) {
                        Text("Gift this puja")
                    }
                }
            } else {
                Row(horizontalArrangement = Arrangement.spacedBy(12.dp), modifier = Modifier.fillMaxWidth()) {
                    Button(onClick = { onOpen(DivyaRoutes.waitlist.route) }, modifier = Modifier.weight(1f)) {
                        Text("Join waitlist")
                    }
                    OutlinedButton(
                        onClick = {
                            showGiftFlow = true
                            giftConfirmed = false
                        },
                        modifier = Modifier.weight(1f),
                    ) {
                        Text("Gift this puja")
                    }
                }
            }
        },
    ) {
        item { DividerLabel("Choose offering") }

        item {
            PanelCard(title = "Choose a puja", subtitle = "Select one offering and the ritual guidance below updates immediately.") {
                SelectableTagRow(
                    options = AppContent.allPujas.map { it.name.en },
                    selected = selectedPujaName,
                    onSelect = {
                        selectedPujaName = it
                        showGiftFlow = false
                        giftConfirmed = false
                    },
                )
            }
        }

        item { PujaCard(selectedPuja) }

        item { DividerLabel("Why families book it") }

        item {
            PanelCard(
                title = "What you receive",
                subtitle = "A clear summary for devotees booking from abroad.",
            ) {
                BulletList(
                    listOf(
                        "A temple ritual performed in your devotee name by the licensed Tantri.",
                        "Clear status updates from waitlist to completion.",
                        "A private sacred video that stays with your family after the puja is complete.",
                        "Timings and updates framed for devotees living outside India.",
                    ),
                )
                TextBlock("Best for: ${selectedPuja.bestFor.joinToString()}")
                TextBlock("Benefits: ${selectedPuja.benefits.take(4).joinToString()}")
            }
        }

        item {
            PanelCard(
                title = "Temple ritual details",
                subtitle = "Kerala Tantric ritual details and delivery expectations.",
            ) {
                TextBlock(selectedPuja.description.whatHappens.orEmpty())
                BulletList(selectedPuja.requirements)
                AccentNote(title = "Video note", body = selectedPuja.videoNote.orEmpty())
                AccentNote(title = "Prasad status", body = selectedPuja.prasadNote, tone = TempleGold)
            }
        }

        item {
            AccentNote(
                title = "Before you join the waitlist",
                body = AppContent.waitlistReassurance.joinToString(" "),
            )
        }

        item { DividerLabel("Gift for family") }

        if (!showGiftFlow) {
            item {
                PanelCard(
                    title = "Gift this puja",
                    subtitle = "Use this when you want the ritual performed in a loved one's name rather than your own.",
                ) {
                    OutlinedButton(
                        onClick = {
                            showGiftFlow = true
                            giftConfirmed = false
                        },
                        modifier = Modifier.fillMaxWidth(),
                    ) {
                        Text("Start gift flow")
                    }
                }
            }
        } else if (!giftConfirmed) {
            item {
                GiftPujaSheet(
                    onContinue = { giftConfirmed = true },
                    onCancel = {
                        showGiftFlow = false
                        giftConfirmed = false
                    },
                )
            }
        } else {
            item {
                GiftConfirmationCard(
                    recipientName = "Amma",
                    pujaName = selectedPuja.name.en,
                    onShare = { onOpen(DivyaRoutes.gifts.route) },
                )
            }
        }
    }
}
