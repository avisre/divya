package com.divya.android.ui.screens

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.material3.Button
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.rememberCoroutineScope
import androidx.compose.runtime.saveable.rememberSaveable
import androidx.compose.runtime.setValue
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp
import com.divya.android.app.DivyaRuntime
import com.divya.android.app.VideoAccess
import com.divya.android.navigation.DivyaRoutes
import com.divya.android.ui.components.PujaVideoCard
import com.divya.android.ui.components.VideoProcessingCard
import kotlinx.coroutines.launch

@Composable
fun PujaVideoScreen(onOpen: (String) -> Unit) {
    val scope = rememberCoroutineScope()
    var tab by rememberSaveable { mutableStateOf("Video") }
    var videoAccess by remember { mutableStateOf<VideoAccess?>(null) }
    var liveBookingId by rememberSaveable { mutableStateOf<String?>(null) }
    var liveIntention by rememberSaveable { mutableStateOf<String?>(null) }
    var livePujaName by rememberSaveable { mutableStateOf<String?>(null) }
    var liveVideoStatus by rememberSaveable { mutableStateOf("booked") }
    var statusMessage by rememberSaveable { mutableStateOf<String?>(null) }

    LaunchedEffect(Unit) {
        runCatching {
            val bookings = DivyaRuntime.fetchBookings()
            val bookingWithVideo = bookings.firstOrNull { it.hasVideo } ?: bookings.firstOrNull()
            liveBookingId = bookingWithVideo?.id
            liveIntention = bookingWithVideo?.prayerIntention
            livePujaName = bookingWithVideo?.pujaName
            liveVideoStatus = bookingWithVideo?.videoStatus ?: "booked"
            if (bookingWithVideo != null) {
                DivyaRuntime.fetchVideoAccess(bookingWithVideo.id)
            } else {
                null
            }
        }.onSuccess {
            videoAccess = it
            if (it == null) {
                statusMessage = "No sacred video is available on this account yet."
            }
        }.onFailure {
            statusMessage = "We could not load the sacred video stream right now."
        }
    }

    ScreenScaffold(
        eyebrow = "Private delivery",
        title = "Sacred video archive",
        subtitle = "Watch completed puja recordings once the temple has finished and uploaded your private video.",
        badge = "Private access",
        heroVariant = HeroCardVariant.PUJA,
        heroStats = listOf(
            HeroStat("48 hrs", "Typical delivery"),
            HeroStat("Private", "Only visible to you"),
            HeroStat(liveVideoStatus.replace('_', ' ').replaceFirstChar { it.uppercase() }, "Current status"),
        ),
        heroContent = {
            Row(horizontalArrangement = Arrangement.spacedBy(12.dp), modifier = Modifier.fillMaxWidth()) {
                Button(onClick = { onOpen(DivyaRoutes.myPujas.route) }, modifier = Modifier.weight(1f)) {
                    Text("Back to bookings")
                }
            }
        },
    ) {
        item {
            PanelCard(title = "Watch options") {
                SelectableTagRow(
                    options = listOf("Video", "Intention", "Notes"),
                    selected = tab,
                    onSelect = { tab = it },
                )
            }
        }
        item {
            when (tab) {
                "Intention" -> PanelCard(title = "Prayer intention shared with the temple") {
                    TextBlock(liveIntention ?: "When a live puja booking is available, the submitted intention appears here.")
                }
                "Notes" -> VideoProcessingCard(videoStatus = liveVideoStatus)
                else -> PujaVideoCard(
                    streamUrl = videoAccess?.streamUrl,
                    shareUrl = videoAccess?.shareUrl,
                    videoStatus = liveVideoStatus,
                    onVideoStarted = {
                        val bookingId = liveBookingId
                        if (bookingId != null) {
                            DivyaRuntime.trackEvent("video_opened", mapOf("booking_id" to bookingId, "puja_name" to (livePujaName ?: "")))
                            scope.launch {
                                runCatching {
                                    DivyaRuntime.markVideoWatched(bookingId)
                                }
                            }
                        }
                    },
                )
            }
        }
        statusMessage?.let { message ->
            item {
                AccentNote(title = "Video status", body = message)
            }
        }
    }
}
