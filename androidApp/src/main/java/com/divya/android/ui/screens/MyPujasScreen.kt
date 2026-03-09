package com.divya.android.ui.screens

import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.material3.Button
import androidx.compose.material3.OutlinedButton
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateListOf
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.saveable.rememberSaveable
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.alpha
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.LocalConfiguration
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import com.divya.android.app.BookingSummary
import com.divya.android.app.DivyaRuntime
import com.divya.android.navigation.DivyaRoutes
import com.divya.android.ui.components.WaitlistStatusCard
import com.divya.android.ui.theme.Clay
import com.divya.android.ui.theme.DeepBrown
import com.divya.android.ui.theme.Ivory
import com.divya.android.ui.theme.Saffron

@Composable
fun MyPujasScreen(onOpen: (String) -> Unit) {
    val isCompactPhone = LocalConfiguration.current.screenWidthDp < 380
    var topTab by rememberSaveable { mutableStateOf("My bookings") }
    var selectedState by rememberSaveable { mutableStateOf("All statuses") }
    val liveBookings = remember { mutableStateListOf<BookingSummary>() }
    var statusMessage by rememberSaveable { mutableStateOf<String?>(null) }

    LaunchedEffect(Unit) {
        runCatching {
            DivyaRuntime.fetchBookings()
        }.onSuccess {
            liveBookings.clear()
            liveBookings.addAll(it)
            if (it.isEmpty()) {
                statusMessage = "No active puja bookings are linked to this account yet."
            }
        }.onFailure {
            statusMessage = "We could not load live booking status right now. Try again when the connection is stable."
        }
    }

    val statusOptions = listOf("All statuses") + liveBookings
        .map { it.status.replace('_', ' ').replaceFirstChar { char -> char.uppercase() } }
        .distinct()
    val filteredBookings = liveBookings.filter { booking ->
        selectedState == "All statuses" ||
            booking.status.replace('_', ' ').replaceFirstChar { it.uppercase() } == selectedState
    }
    val videoReadyCount = liveBookings.count { it.hasVideo }
    val activeBookingCount = liveBookings.count { it.status != "cancelled" }

    ScreenScaffold(
        eyebrow = "Booking tracker",
        title = "Your pujas in one place",
        subtitle = "Review waitlists, confirmed rituals, gifted pujas, and sacred videos without losing track of any booking.",
        badge = if (liveBookings.isEmpty()) "No active bookings" else "$activeBookingCount active",
        heroVariant = if (liveBookings.isEmpty()) HeroCardVariant.EMPTY else HeroCardVariant.PUJA,
        heroStats = if (liveBookings.isEmpty()) {
            emptyList()
        } else {
            listOf(
                HeroStat("${liveBookings.size}", "Total bookings"),
                HeroStat("${filteredBookings.size}", "Visible now"),
                HeroStat("${videoReadyCount}", "Videos ready"),
                HeroStat(topTab, "Current view"),
            )
        },
        heroContent = {
            if (isCompactPhone) {
                Column(verticalArrangement = Arrangement.spacedBy(12.dp), modifier = Modifier.fillMaxWidth()) {
                    PrimaryActionButton(
                        text = "Browse pujas",
                        onClick = { onOpen(DivyaRoutes.puja.route) },
                        modifier = Modifier.fillMaxWidth(),
                    )
                    SecondaryActionButton(
                        text = "Open videos",
                        onClick = { onOpen(DivyaRoutes.video.route) },
                        modifier = Modifier.fillMaxWidth(),
                    )
                }
            } else {
                Row(horizontalArrangement = Arrangement.spacedBy(12.dp), modifier = Modifier.fillMaxWidth()) {
                    PrimaryActionButton(
                        text = "Browse pujas",
                        onClick = { onOpen(DivyaRoutes.puja.route) },
                        modifier = Modifier.weight(1f),
                    )
                    SecondaryActionButton(
                        text = "Open videos",
                        onClick = { onOpen(DivyaRoutes.video.route) },
                        modifier = Modifier.weight(1f),
                    )
                }
            }
        },
    ) {
        SectionHeader("View")

        item {
            PanelCard(
                title = "Choose what to review",
                subtitle = "Bookings, videos, and gifts stay in one consistent navigation pattern.",
            ) {
                SelectableTagRow(
                    options = listOf("My bookings", "My videos", "Gifts"),
                    selected = topTab,
                    onSelect = { topTab = it },
                )
            }
        }

        if (topTab == "Gifts") {
            item {
                PanelCard(
                    title = "Gifted pujas",
                    subtitle = "Track pujas sent and received for family members.",
                ) {
                    Button(onClick = { onOpen(DivyaRoutes.gifts.route) }, modifier = Modifier.fillMaxWidth()) {
                        Text("Open gifts")
                    }
                }
            }
            return@ScreenScaffold
        }

        if (topTab == "My videos") {
            item {
                PanelCard(
                    title = "Sacred videos",
                    subtitle = "Open completed recordings and private playback links.",
                ) {
                    Button(onClick = { onOpen(DivyaRoutes.video.route) }, modifier = Modifier.fillMaxWidth()) {
                        Text("Open video library")
                    }
                }
            }
            return@ScreenScaffold
        }

        SectionHeader("Bookings")

        if (liveBookings.isNotEmpty()) {
            item {
                PanelCard(
                    title = "Filter by status",
                    subtitle = "This changes which bookings are shown below without pretending the status itself is editable.",
                ) {
                    SelectableTagRow(
                        options = statusOptions,
                        selected = selectedState,
                        onSelect = { selectedState = it },
                    )
                }
            }
        }

        if (liveBookings.isEmpty()) {
            item {
                PanelCard(
                    title = "Your sacred record begins with your first puja",
                    subtitle = "Every confirmed ritual and video will appear here.",
                ) {
                    EmptyPujaStateArtwork()
                }
            }
        } else if (filteredBookings.isEmpty()) {
            item {
                AccentNote(
                    title = "No bookings in this status",
                    body = "Change the status filter to view the rest of your booking history.",
                )
            }
        } else {
            filteredBookings.forEach { booking ->
                item {
                    PanelCard(
                        title = booking.pujaName,
                        subtitle = booking.bookingReference,
                    ) {
                        WaitlistStatusCard(
                            "${booking.status.replace('_', ' ').replaceFirstChar { it.uppercase() }} | position ${booking.waitlistPosition ?: "--"}",
                        )
                        InfoRow(label = "Temple", value = booking.templeName)
                        InfoRow(label = "Payment", value = booking.paymentStatus.replaceFirstChar { it.uppercase() })
                        InfoRow(label = "Intention", value = booking.prayerIntention)
                        if (isCompactPhone) {
                            Column(verticalArrangement = Arrangement.spacedBy(12.dp), modifier = Modifier.fillMaxWidth()) {
                                Button(onClick = { onOpen(DivyaRoutes.waitlist.route) }, modifier = Modifier.fillMaxWidth()) {
                                    Text("Booking details")
                                }
                                OutlinedButton(
                                    onClick = { onOpen(if (booking.hasVideo) DivyaRoutes.video.route else DivyaRoutes.temple.route) },
                                    modifier = Modifier.fillMaxWidth(),
                                ) {
                                    Text(if (booking.hasVideo) "Watch video" else "Temple updates")
                                }
                            }
                        } else {
                            Row(
                                horizontalArrangement = Arrangement.spacedBy(12.dp),
                                modifier = Modifier.fillMaxWidth(),
                            ) {
                                Button(onClick = { onOpen(DivyaRoutes.waitlist.route) }, modifier = Modifier.weight(1f)) {
                                    Text("Booking details")
                                }
                                OutlinedButton(
                                    onClick = { onOpen(if (booking.hasVideo) DivyaRoutes.video.route else DivyaRoutes.temple.route) },
                                    modifier = Modifier.weight(1f),
                                ) {
                                    Text(if (booking.hasVideo) "Watch video" else "Temple updates")
                                }
                            }
                        }
                    }
                }
            }
        }

        item {
            PanelCard(title = "What happens next") {
                BulletList(AppContent.bookingStages)
            }
        }

        statusMessage?.let { message ->
            item {
                AccentNote(title = "Live sync", body = message)
            }
        }
    }
}

@Composable
private fun EmptyPujaStateArtwork() {
    Column(
        modifier = Modifier.fillMaxWidth(),
        horizontalAlignment = Alignment.CenterHorizontally,
        verticalArrangement = Arrangement.spacedBy(12.dp),
    ) {
        Box(
            modifier = Modifier
                .size(64.dp)
                .background(
                    brush = Brush.radialGradient(
                        colors = listOf(Saffron.copy(alpha = 0.14f), Color.Transparent),
                    ),
                ),
            contentAlignment = Alignment.Center,
        ) {
            Text(
                text = "\uD83E\uDE94",
                color = DeepBrown.copy(alpha = 0.86f),
                modifier = Modifier.alpha(0.92f),
            )
        }
        Text(
            text = "Your sacred record begins with your first puja",
            color = DeepBrown,
            textAlign = TextAlign.Center,
        )
        Text(
            text = "Every confirmed ritual and video will appear here.",
            color = DeepBrown.copy(alpha = 0.7f),
            textAlign = TextAlign.Center,
            modifier = Modifier.padding(horizontal = 12.dp),
        )
    }
}
