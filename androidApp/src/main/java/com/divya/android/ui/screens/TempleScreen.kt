package com.divya.android.ui.screens

import androidx.compose.foundation.BorderStroke
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Surface
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp
import com.divya.android.ui.components.TempleHeroVisualCard
import com.divya.android.ui.theme.Clay
import com.divya.android.ui.theme.DeepBrown
import com.divya.android.ui.theme.Ivory
import com.divya.android.ui.theme.TempleGold

@Composable
fun TempleScreen() {
    ScreenScaffold(
        eyebrow = "Karunagapally | Kerala",
        title = AppContent.temple.name.en,
        subtitle = "Temple timings, ritual windows, and diaspora guidance are gathered here in one calmer overview for families abroad.",
        badge = "Kerala Tantric Agama",
        heroStats = listOf(
            HeroStat("IST", "Temple timezone"),
            HeroStat("5 pujas", "Daily ritual windows"),
            HeroStat("NRI-first", "Timezone clarity"),
            HeroStat("Launch temple", "Pan-India roadmap"),
        ),
    ) {
        item { TempleHeroVisualCard() }

        item { DividerLabel("About the temple") }

        item {
            PanelCard(
                title = "Temple overview",
                subtitle = AppContent.temple.shortDescription,
            ) {
                TextBlock(AppContent.temple.fullDescription)
                TextBlock(AppContent.temple.significance)
                AccentNote(title = "NRI note", body = AppContent.temple.nriNote, tone = TempleGold)
            }
        }

        item { DividerLabel("Ritual windows") }

        item {
            PanelCard(
                title = "Daily puja timings",
                subtitle = "Timings stay anchored to IST so the temple remains the sacred reference point.",
            ) {
                Column(verticalArrangement = Arrangement.spacedBy(12.dp)) {
                    AppContent.temple.timings.pujas.forEach { timing ->
                        RitualWindowRow(
                            title = timing.name,
                            subtitle = timing.nameML,
                            time = timing.timeIST,
                            detail = timing.description,
                        )
                    }
                }
            }
        }

        item {
            PanelCard(
                title = "Timezone clarity",
                subtitle = "A devotee abroad should understand the Kerala-to-local offset instantly.",
            ) {
                InfoRow(label = "Temple timezone", value = "Asia/Kolkata")
                InfoRow(label = "User timezone", value = AppContent.panchang.timezone)
                InfoRow(label = "Example conversion", value = "Usha Puja at 4:30 AM IST = 6:00 PM previous day EST")
            }
        }

        item { DividerLabel("Booking clarity") }

        item {
            PanelCard(
                title = "Most requested pujas",
                subtitle = "This should help a first-time devotee understand what can actually be booked from abroad.",
            ) {
                BulletList(
                    AppContent.pujaHighlights.take(4).map { puja ->
                        "${puja.name.en} | ${puja.displayPrice?.currency ?: "USD"} ${puja.displayPrice?.amount ?: puja.pricing.usd} | ${puja.description.short.orEmpty()}"
                    },
                )
            }
        }
    }
}

@Composable
private fun RitualWindowRow(
    title: String,
    subtitle: String,
    time: String,
    detail: String,
) {
    Surface(
        modifier = Modifier.fillMaxWidth(),
        shape = MaterialTheme.shapes.medium,
        color = Ivory.copy(alpha = 0.94f),
        border = BorderStroke(1.dp, Clay.copy(alpha = 0.8f)),
    ) {
        Column(
            modifier = Modifier.padding(16.dp),
            verticalArrangement = Arrangement.spacedBy(8.dp),
        ) {
            InfoRow(label = title, value = time, highlight = TempleGold)
            TextBlock(subtitle)
            TextBlock(detail)
        }
    }
}
