package com.divya.android.ui.screens

import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableIntStateOf
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.setValue
import androidx.compose.runtime.saveable.rememberSaveable
import com.divya.android.BuildConfig
import com.divya.android.ui.components.SharedPrayerOverlay
import com.divya.android.ui.components.SharedSessionLobby

@Composable
fun SharedPrayerScreen() {
    if (!BuildConfig.ENABLE_SHARED_PRAYER_PREVIEW) {
        ScreenScaffold(
            eyebrow = "Shared prayer",
            title = "Shared sessions are not exposed in this release",
            subtitle = "The release build keeps only fully validated critical paths active. Family prayer sessions will be re-enabled after realtime verification.",
            badge = "Release-safe build",
            heroStats = listOf(
                HeroStat("Active", "Prayer player"),
                HeroStat("Active", "Puja booking"),
                HeroStat("Active", "Video access"),
            ),
        ) {
            item {
                PanelCard(title = "Current status") {
                    TextBlock("This route is intentionally gated from production until realtime session sync is verified end to end.")
                }
            }
        }
        return
    }

    var started by rememberSaveable { mutableStateOf(false) }
    var reps by rememberSaveable { mutableIntStateOf(AppContent.sharedSessionInvite.completedRepetitions) }
    val base = AppContent.sharedSessionInvite
    val session = base.copy(completedRepetitions = reps)

    ScreenScaffold(
        eyebrow = "Shared prayer",
        title = "${session.prayer.title.en} together",
        subtitle = "Synchronized verses and shared repetition count for family prayer across timezones.",
        badge = "Session ${session.code}",
        heroStats = listOf(
            HeroStat("${session.participants.size}", "Participants"),
            HeroStat("${session.completedRepetitions}/${session.totalRepetitions}", "Repetitions"),
            HeroStat(if (started) "Active" else "Waiting", "Session state"),
        ),
    ) {
        item {
            SharedSessionLobby(
                session = session,
                isHost = true,
                onStart = { started = true },
                onShare = {},
            )
        }
        if (started) {
            item {
                SharedPrayerOverlay(
                    session = session,
                    onRepComplete = {
                        reps = (reps + 1).coerceAtMost(session.totalRepetitions)
                    },
                )
            }
            item {
                PanelCard(
                    title = "Session completion",
                    subtitle = "You prayed together with ${session.participants.joinToString { it.name }}",
                ) {
                    TextBlock("When complete, show share card: We prayed ${session.prayer.title.en} together today across cities.")
                }
            }
        }
    }
}
