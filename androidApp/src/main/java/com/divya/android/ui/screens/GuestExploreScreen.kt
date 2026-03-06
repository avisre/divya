package com.divya.android.ui.screens

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.material3.Button
import androidx.compose.material3.OutlinedButton
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp
import com.divya.android.navigation.DivyaRoutes
import com.divya.android.ui.components.ConversionReasonCard
import com.divya.android.ui.components.PanchangCard
import com.divya.android.ui.components.PrayerCard
import com.divya.android.ui.components.ProofStatCard
import com.divya.android.ui.components.TraditionNotesCard

@Composable
fun GuestExploreScreen(onOpen: (String) -> Unit) {
    ScreenScaffold(
        eyebrow = "Guest mode",
        title = "Begin without an account",
        subtitle = "Explore today's panchang, featured prayers, and the temple story before you create a profile.",
        badge = "No login required",
        heroStats = listOf(
            HeroStat("3 prayers", "Free to browse"),
            HeroStat("English-first", "Easy for diaspora users"),
            HeroStat("Soft prompt", "Register when ready"),
        ),
        heroContent = {
            Row(horizontalArrangement = Arrangement.spacedBy(12.dp), modifier = Modifier.fillMaxWidth()) {
                Button(onClick = { onOpen(DivyaRoutes.register.route) }, modifier = Modifier.weight(1f)) {
                    Text("Create free account")
                }
                OutlinedButton(onClick = { onOpen(DivyaRoutes.library.route) }, modifier = Modifier.weight(1f)) {
                    Text("Browse prayers")
                }
            }
        },
    ) {
        item {
            ConversionReasonCard(
                title = "Why start in guest mode",
                subtitle = "Conversion improves when a first-time devotee can feel the value before being asked to commit.",
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
                subtitle = "A guest should understand the spiritual value of the product in under a minute.",
            ) {
                BulletList(
                    items = AppContent.prayerHighlights.map { prayer ->
                        "${prayer.title.en} | ${prayer.meaning}"
                    },
                )
            }
        }
        item {
            PrayerCard(AppContent.navarnaMantra) { onOpen(DivyaRoutes.prayer.route) }
        }
        item {
            PanelCard(
                title = "What unlocks with an account",
                subtitle = "The prompt should explain value clearly without sounding pushy.",
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
                subtitle = "The guest page should show real spiritual context, not invented community quotes.",
                bullets = AppContent.traditionNotes.take(2),
                tags = listOf("Vedic", "Devi tradition", "Kerala temple language"),
            )
        }
        item {
            PanelCard(
                title = "Language approach",
                subtitle = "English leads, with regional and script support where it adds authenticity.",
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
