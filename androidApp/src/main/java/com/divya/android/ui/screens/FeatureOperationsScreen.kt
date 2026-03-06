package com.divya.android.ui.screens

import androidx.compose.runtime.Composable
import com.divya.android.ui.components.NakshatraPickerSheet
import com.divya.android.ui.components.OfflineBanner
import com.divya.android.ui.components.PujaShareCard
import com.divya.android.ui.components.PujaVideoCard
import com.divya.android.ui.components.UpgradePromptSheet
import com.divya.android.ui.components.VideoProcessingCard
import com.divya.android.ui.components.WaitlistStatusCard

@Composable
fun FeatureOperationsScreen() {
    ScreenScaffold(
        eyebrow = "Operational states",
        title = "Feature states",
        subtitle = "Review important product states such as offline prayer access, waitlist updates, sacred video delivery, and upgrade prompts.",
        badge = "System states",
        heroStats = listOf(
            HeroStat("Offline", "Cached prayers"),
            HeroStat("Waitlist", "Status cards"),
            HeroStat("Video", "Ready + processing"),
            HeroStat("Bhakt", "Upgrade prompts"),
        ),
    ) {
        item { OfflineBanner() }
        item { WaitlistStatusCard("In progress | your puja is happening now") }
        item { VideoProcessingCard() }
        item { PujaVideoCard(streamUrl = null, shareUrl = null, onVideoStarted = {}) }
        item { PujaShareCard() }
        item { NakshatraPickerSheet() }
        item { UpgradePromptSheet() }
        item {
            AccentNote(
                title = "Live notification support",
                body = "Prayer and puja progress surfaces are designed to map cleanly into Android live notifications.",
            )
        }
    }
}
