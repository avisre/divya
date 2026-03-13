package com.divya.android.ui.screens

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.material3.Button
import androidx.compose.material3.OutlinedButton
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.platform.LocalConfiguration
import androidx.compose.ui.unit.dp
import com.divya.android.navigation.DivyaRoutes
import com.divya.android.ui.components.ConversionReasonCard
import com.divya.android.ui.components.PanchangCard
import com.divya.android.ui.components.PrayerCard
import com.divya.android.ui.components.ProofStatCard
import com.divya.android.ui.components.TraditionNotesCard

@Composable
fun GuestExploreScreen(onOpen: (String) -> Unit) {
    val isCompactPhone = LocalConfiguration.current.screenWidthDp < 380
    ScreenScaffold(
        eyebrow = "Guest mode",
        title = "Begin without an account",
        subtitle = "Explore today's panchang, featured prayers, and the temple story before you create a profile.",
        badge = "No login required",
        heroStats = listOf(
            HeroStat("3 prayers", "Free to browse"),
            HeroStat("Guided", "Easy to start"),
            HeroStat("Optional", "Create an account later"),
        ),
        heroContent = {
            if (isCompactPhone) {
                Column(verticalArrangement = Arrangement.spacedBy(12.dp), modifier = Modifier.fillMaxWidth()) {
                    Button(onClick = { onOpen(DivyaRoutes.register.route) }, modifier = Modifier.fillMaxWidth()) {
                        Text("Create free account")
                    }
                    OutlinedButton(onClick = { onOpen(DivyaRoutes.library.route) }, modifier = Modifier.fillMaxWidth()) {
                        Text("Browse prayers")
                    }
                }
            } else {
                Row(horizontalArrangement = Arrangement.spacedBy(12.dp), modifier = Modifier.fillMaxWidth()) {
                    Button(onClick = { onOpen(DivyaRoutes.register.route) }, modifier = Modifier.weight(1f)) {
                        Text("Create free account")
                    }
                    OutlinedButton(onClick = { onOpen(DivyaRoutes.library.route) }, modifier = Modifier.weight(1f)) {
                        Text("Browse prayers")
                    }
                }
            }
        },
    ) {
        item {
            ConversionReasonCard(
                title = "Why start in guest mode",
                subtitle = "Take a first look before deciding whether you want to create an account.",
                bullets = listOf(
                    "Read today's panchang in your local-time context.",
                    "Preview the prayer experience before choosing a plan.",
                    "See how temple, reminders, and sacred video fit a life abroad.",
                ),
                tags = listOf("No login wall", "Low pressure", "First value"),
            )
        }
        AppContent.proofStats.take(2).forEach { stat ->
            item { ProofStatCard(stat) }
        }
        item { PanchangCard(AppContent.panchang) }
        item {
            PanelCard(
                title = "Featured for a first visit",
                subtitle = "A simple place to begin if this is your first visit.",
            ) {
                BulletList(
                    items = AppContent.prayerHighlights.map { prayer ->
                        "${prayer.title.en} | ${prayer.meaning}"
                    },
                )
            }
        }
        item {
            PrayerCard(AppContent.navarnaMantra) { onOpen(DivyaRoutes.prayerFor(AppContent.navarnaMantra.id)) }
        }
        item {
            PanelCard(
                title = "What unlocks with an account",
                subtitle = "Create an account when you want to save progress and temple activity.",
            ) {
                BulletList(
                    items = listOf(
                        "Save favorite prayers and pick up where you left off.",
                        "Track a prayer streak and set morning and evening reminders.",
                        "Join puja waitlists and receive sacred video updates.",
                    ),
                )
            }
        }
        item {
            ConversionReasonCard(
                title = "What the experience is rooted in",
                subtitle = "The app is grounded in living temple practice, prayer, and festival rhythm.",
                bullets = AppContent.traditionNotes.take(2),
                tags = listOf("Vedic", "Devi tradition", "Kerala temple language"),
            )
        }
        item {
            PanelCard(
                title = "Language approach",
                subtitle = "English leads, with script support where it adds prayer authenticity.",
            ) {
                BulletList(items = AppContent.languageSupport)
            }
        }
        item { TraditionNotesCard(AppContent.traditionNotes) }
        item {
            AccentNote(
                title = "Soft registration prompt",
                body = "Create a free account to save your favorite prayers, track your streak, and book pujas at the temple.",
            )
        }
    }
}
