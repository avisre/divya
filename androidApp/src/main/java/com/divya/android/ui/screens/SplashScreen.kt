package com.divya.android.ui.screens

import androidx.compose.runtime.Composable

@Composable
fun SplashScreen() {
    ScreenScaffold(
        eyebrow = "Divya",
        title = "A sacred bridge to Karunagapally",
        subtitle = "Warm, premium, and rooted in Kerala temple tradition for diaspora families who cannot simply walk to a temple.",
        badge = "Guest mode enabled",
        heroStats = listOf(
            HeroStat("USA · UK · Canada", "Primary audiences"),
            HeroStat("Kerala", "Single temple source"),
            HeroStat("Compose", "Android native UI"),
        ),
    ) {
        item {
            PanelCard(title = "Launch promise") {
                TextBlock("Daily panchang, prayer guidance, waitlist-only pujas, and sacred video delivery in one calm product experience.")
            }
        }
    }
}
