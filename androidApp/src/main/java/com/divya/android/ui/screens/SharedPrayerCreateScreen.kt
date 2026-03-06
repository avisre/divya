package com.divya.android.ui.screens

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.material3.Button
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.saveable.rememberSaveable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.setValue
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp
import com.divya.android.BuildConfig
import com.divya.android.navigation.DivyaRoutes

@Composable
fun SharedPrayerCreateScreen(onOpen: (String) -> Unit) {
    var selectedPrayer by rememberSaveable { mutableStateOf(AppContent.sharedSessionInvite.prayer.title.en) }
    var repetitions by rememberSaveable { mutableStateOf("21") }

    if (!BuildConfig.ENABLE_SHARED_PRAYER_PREVIEW) {
        ScreenScaffold(
            eyebrow = "Family prayer",
            title = "Shared sessions are staged off in this release",
            subtitle = "Realtime family prayer is still being validated for production rollout. Core prayer playback, temple booking, and video delivery remain available.",
            badge = "Release-safe build",
            heroStats = listOf(
                HeroStat("Stable", "Prayer playback"),
                HeroStat("Live", "Temple bookings"),
                HeroStat("Ready", "Sacred video"),
            ),
        ) {
            item {
                PanelCard(title = "What you can use now") {
                    BulletList(
                        items = listOf(
                            "Play complete prayers with individual audio mappings.",
                            "Join puja waitlists and track booking status.",
                            "Open delivered sacred videos from My Pujas.",
                        ),
                    )
                    Button(onClick = { onOpen(DivyaRoutes.home.route) }, modifier = Modifier.fillMaxWidth()) {
                        Text("Return home")
                    }
                }
            }
        }
        return
    }

    ScreenScaffold(
        eyebrow = "Pray together",
        title = "Create shared prayer session",
        subtitle = "Invite your family anywhere in the world and pray in sync with one session code.",
        badge = "Bhakt+ host feature",
        heroStats = listOf(
            HeroStat("Generated", "Session code"),
            HeroStat("Realtime", "Verse synchronization"),
            HeroStat("Global", "Family across timezones"),
        ),
    ) {
        item {
            PanelCard(title = "Choose prayer") {
                SelectableTagRow(
                    options = AppContent.allPrayers.take(10).map { it.title.en },
                    selected = selectedPrayer,
                    onSelect = { selectedPrayer = it },
                )
            }
        }
        item {
            PanelCard(title = "Set repetitions") {
                SelectableTagRow(
                    options = listOf("11", "21", "51", "108"),
                    selected = repetitions,
                    onSelect = { repetitions = it },
                )
            }
        }
        item {
            PanelCard(
                title = "Share code flow",
                subtitle = "Share the generated code with your family after creation so they can join the same prayer.",
            ) {
                TextBlock("Participants can join before the host begins and follow the same synchronized verses.")
                Button(onClick = { onOpen(DivyaRoutes.sharedPrayerSession.route) }, modifier = Modifier.fillMaxWidth()) {
                    Text("Open session lobby")
                }
            }
        }
    }
}
