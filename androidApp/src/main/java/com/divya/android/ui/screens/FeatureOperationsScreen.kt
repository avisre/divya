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
        eyebrow = "Reference states",
        title = "Experience states",
        subtitle = "Review how important surfaces appear when prayer access, waitlist updates, video delivery, or upgrades are in different states.",
        badge = "Reference",
        heroStats = listOf(
            HeroStat("Offline", "Cached prayers"),
            HeroStat("Waitlist", "Status cards"),
            HeroStat("Video", "Ready + processing"),
            HeroStat("Bhakt", "Upgrade prompts"),
        ),
    ) {
        item { OfflineBanner() }
        item { WaitlistStatusCard("In progress | your puja is happening now") }
        item { VideoProcessingCard(videoStatus = "processing") }
        item { PujaVideoCard(streamUrl = null, shareUrl = null, videoStatus = "booked", onVideoStarted = {}) }
        item { PujaShareCard() }
        item { NakshatraPickerSheet() }
        item { UpgradePromptSheet() }
        item {
            AccentNote(
                title = "Notification support",
                body = "Prayer and puja progress can also appear in Android notifications when playback or temple activity is active.",
            )
        }
    }
}
