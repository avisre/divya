package com.divya.android.ui.screens

import androidx.compose.runtime.Composable

@Composable
fun SplashScreen() {
    ScreenScaffold(
        eyebrow = "Divya",
        title = "A sacred bridge to Karunagapally",
        subtitle = "A calm prayer home rooted in Kerala temple tradition for families living away from the temple.",
        badge = "Welcome",
        heroStats = listOf(
            HeroStat("USA | UK | Canada", "Primary audiences"),
            HeroStat("Kerala", "Single temple source"),
            HeroStat("Prayer + puja", "Daily rhythm"),
        ),
    ) {
        item {
            PanelCard(title = "Launch promise") {
                TextBlock("Daily panchang, prayer guidance, waitlist-only pujas, and sacred video delivery in one calm product experience.")
            }
        }
    }
}
