package com.divya.android.ui.screens

import android.content.Context
import android.net.ConnectivityManager
import android.net.NetworkCapabilities
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.material3.Button
import androidx.compose.material3.OutlinedButton
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.saveable.rememberSaveable
import androidx.compose.runtime.setValue
import androidx.compose.ui.Modifier
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.unit.dp
import com.divya.android.app.BookingSummary
import com.divya.android.app.DailyRecommendationRemote
import com.divya.android.app.DivyaRuntime
import com.divya.android.app.ExperimentFlags
import com.divya.android.app.SessionStore
import com.divya.android.app.UserStatsSummary
import com.divya.android.app.UserStreakSummary
import com.divya.android.media.PrayerAudioPlayer
import com.divya.android.navigation.DivyaRoutes
import com.divya.android.ui.joinUiSegments
import com.divya.android.ui.sanitizeUiSegment
import com.divya.android.ui.sanitizeUiText
import com.divya.android.ui.components.DailyPrayerCard
import com.divya.android.ui.components.OfflineBanner
import com.divya.android.ui.components.OfflineBannerState
import com.divya.android.ui.components.PanchangCard
import com.divya.android.ui.components.StreakMilestoneModal
import com.divya.android.ui.theme.TempleGold
import com.divya.data.models.Nakshatra
import com.divya.data.models.Panchang
import com.divya.data.models.Tithi
import java.time.Instant
import java.time.LocalDate
import java.time.LocalTime
import java.time.ZoneId
import java.time.format.DateTimeFormatter
import java.util.Locale
import org.json.JSONArray
import org.json.JSONObject

@Composable
fun HomeScreen(onOpen: (String) -> Unit) {
    val context = LocalContext.current
    val playerState by PrayerAudioPlayer.state.collectAsState()
    val backendHealth by DivyaRuntime.backendHealth.collectAsState()
    var showMilestoneModal by rememberSaveable { mutableStateOf(false) }
    val greeting = timeAwareGreeting(LocalTime.now())
    var localizedPanchang by remember { mutableStateOf(localizePanchang(AppContent.panchang)) }
    var recommendation by remember { mutableStateOf(AppContent.dailyRecommendation) }
    var liveBookings by remember { mutableStateOf<List<BookingSummary>>(emptyList()) }
    var liveStreak by remember { mutableStateOf<UserStreakSummary?>(null) }
    var liveStats by remember { mutableStateOf<UserStatsSummary?>(null) }
    val experimentBucket = remember(context) { ExperimentFlags.homeLayoutVariant(context) }
    val isOnline = remember(context) { isNetworkConnected(context) }
    val hasContinuePrayer = !playerState.prayerId.isNullOrBlank() && playerState.progressFraction > 0f
    val completedToday = playerState.progressFraction >= 0.98f && !playerState.isPlaying
    val hasBackendIssue = backendHealth != null && backendHealth?.status != "ok"
    val currentStreakDays = liveStreak?.current ?: 0
    val bookingWithVideo = liveBookings.firstOrNull { it.hasVideo }
    val latestBooking = liveBookings.firstOrNull()
    val heroPrimaryLabel = if (hasContinuePrayer) "Resume prayer" else "Begin today's prayer"
    val heroSecondaryLabel = if (bookingWithVideo != null) "Watch sacred video" else "Temple guide"
    val practiceSummary = if ((liveStats?.prayersCompleted ?: 0) > 0 || (liveStats?.minutesPrayed ?: 0) > 0) {
        "${liveStats?.prayersCompleted ?: 0} prayers completed | ${liveStats?.minutesPrayed ?: 0} minutes this week."
    } else {
        "Start with one short prayer today and your practice summary will build from there."
    }
    val templeStatus = when {
        bookingWithVideo != null -> "Video ready"
        latestBooking != null -> latestBooking.status.replace('_', ' ').replaceFirstChar { it.uppercase() }
        else -> "No active puja"
    }
    val offlineBannerState = when {
        !isOnline -> OfflineBannerState.NetworkOffline
        hasBackendIssue -> OfflineBannerState.BackendUnavailable
        else -> null
    }

    LaunchedEffect(Unit) {
        DivyaRuntime.trackEvent(
            "daily_recommendation_shown",
            mapOf(
                "prayer_id" to recommendation.prayer.id,
                "reason" to recommendation.reason,
                "tithi" to AppContent.panchang.tithi.name,
            ),
        )
        DivyaRuntime.trackEvent("home_experiment_exposed", mapOf("bucket" to experimentBucket))
    }

    LaunchedEffect(Unit) {
        loadCachedPanchang(context)?.let { cached ->
            localizedPanchang = localizePanchang(cached)
            DivyaRuntime.trackEvent("offline_panchang_served")
        }
    }

    LaunchedEffect(Unit) {
        runCatching { DivyaRuntime.fetchBookings() }.onSuccess { liveBookings = it }
        runCatching { DivyaRuntime.fetchStreak() }.onSuccess { liveStreak = it }
        runCatching { DivyaRuntime.fetchStats() }.onSuccess { liveStats = it }
    }

    LaunchedEffect(localizedPanchang.timezone) {
        runCatching {
            DivyaRuntime.fetchDailyRecommendation(localizedPanchang.timezone)
        }.onSuccess { remote ->
            recommendation = mergeDailyRecommendation(remote, localizedPanchang)
        }
    }

    ScreenScaffold(
        eyebrow = "Today's practice",
        title = if (hasContinuePrayer) "Continue your prayer rhythm" else "Your daily spiritual home",
        subtitle = "Start with one recommended prayer, today’s panchang, and clear temple updates in your local timezone.",
        badge = greeting,
        heroStats = listOf(
            HeroStat(localizedPanchang.tithi.name, "Today's tithi"),
            HeroStat(localizedPanchang.nakshatra.name, "Nakshatra"),
            HeroStat(if (currentStreakDays > 0) "$currentStreakDays days" else "Start today", "Prayer streak"),
            HeroStat(templeStatus, "Temple status"),
        ),
        heroContent = {
            Row(
                horizontalArrangement = Arrangement.spacedBy(12.dp),
                modifier = Modifier.fillMaxWidth(),
            ) {
                Button(
                    onClick = {
                        if (hasContinuePrayer) {
                            DivyaRuntime.trackEvent("funnel_stage", mapOf("stage" to "continue_last_prayer"))
                        }
                        val route = playerState.prayerId
                            ?.takeIf { hasContinuePrayer }
                            ?.let { DivyaRoutes.prayerFor(it) }
                            ?: DivyaRoutes.prayerFor(recommendation.prayer.id)
                        onOpen(route)
                    },
                    modifier = Modifier.weight(1f),
                ) {
                    Text(heroPrimaryLabel)
                }
                OutlinedButton(
                    onClick = {
                        onOpen(
                            if (bookingWithVideo != null) {
                                DivyaRoutes.video.route
                            } else {
                                DivyaRoutes.temple.route
                            },
                        )
                    },
                    modifier = Modifier.weight(1f),
                ) {
                    Text(heroSecondaryLabel)
                }
            }
        },
    ) {
        if (offlineBannerState != null) {
            item { OfflineBanner(state = offlineBannerState) }
        }

        item { DividerLabel("Today") }

        if (currentStreakDays > 0 && !completedToday) {
            item {
                StatusStrip(
                    label = "Keep your $currentStreakDays-day streak alive",
                    detail = "One prayer today keeps your devotional rhythm unbroken.",
                )
            }
        }

        if (completedToday) {
            item {
                StatusStrip(
                    label = "Today's prayer is complete",
                    detail = "Review your streak or choose a lighter evening prayer if you want to stay in rhythm.",
                    color = TempleGold,
                )
            }
        }

        if (hasContinuePrayer && !completedToday) {
            item {
                AccentNote(
                    title = "Continue where you left off",
                    body = "${playerState.title ?: "Previous prayer"} is ${(playerState.progressFraction * 100).toInt()}% complete and ready to resume.",
                )
            }
        }

        item {
            DailyPrayerCard(
                recommendation = recommendation,
                onBegin = {
                    DivyaRuntime.trackEvent(
                        "daily_recommendation_tapped",
                        mapOf("prayer_id" to recommendation.prayer.id),
                    )
                    onOpen(DivyaRoutes.prayerFor(recommendation.prayer.id))
                },
            )
        }

        item { PanchangCard(localizedPanchang, guidance = AppContent.panchangGuidance) }

        item { DividerLabel("Temple and bookings") }

        if (bookingWithVideo != null) {
            item {
                AccentNote(
                    title = "Sacred video ready",
                    body = "Your ${bookingWithVideo.pujaName} recording is ready to watch from your private archive.",
                    tone = TempleGold,
                )
            }
        }

        item {
            PanelCard(
                title = "Stay connected to Karunagapally",
                subtitle = "Keep temple timings, festival context, and booking actions close at hand.",
            ) {
                InfoRow(label = "Temple", value = AppContent.temple.name.en)
                InfoRow(label = "Reference timezone", value = "Asia/Kolkata (IST)")
                InfoRow(label = "My puja status", value = templeStatus)
                Row(
                    horizontalArrangement = Arrangement.spacedBy(12.dp),
                    modifier = Modifier.fillMaxWidth(),
                ) {
                    Button(onClick = { onOpen(DivyaRoutes.temple.route) }, modifier = Modifier.weight(1f)) {
                        Text("Temple guide")
                    }
                    OutlinedButton(onClick = { onOpen(DivyaRoutes.puja.route) }, modifier = Modifier.weight(1f)) {
                        Text("Browse pujas")
                    }
                }
                OutlinedButton(
                    onClick = {
                        onOpen(if (bookingWithVideo != null) DivyaRoutes.video.route else DivyaRoutes.festival.route)
                    },
                    modifier = Modifier.fillMaxWidth(),
                ) {
                    Text(if (bookingWithVideo != null) "Open sacred video" else "Open festival guide")
                }
            }
        }

        item { DividerLabel("Your rhythm") }

        item {
            PanelCard(
                title = "Practice progress",
                subtitle = practiceSummary,
            ) {
                InfoRow(label = "Current streak", value = if (currentStreakDays > 0) "$currentStreakDays days" else "Not started")
                InfoRow(label = "Longest streak", value = "${liveStreak?.longest ?: currentStreakDays} days")
                InfoRow(label = "Total devotional days", value = "${liveStreak?.totalDaysEver ?: 0}")
                InfoRow(label = "Grace used", value = if (liveStreak?.graceUsed == true) "Yes" else "No")
                Row(
                    horizontalArrangement = Arrangement.spacedBy(12.dp),
                    modifier = Modifier.fillMaxWidth(),
                ) {
                    Button(onClick = { showMilestoneModal = true }, modifier = Modifier.weight(1f)) {
                        Text("Milestones")
                    }
                    OutlinedButton(onClick = { onOpen(DivyaRoutes.profile.route) }, modifier = Modifier.weight(1f)) {
                        Text("Reminders")
                    }
                }
            }
        }

        item {
            PanelCard(
                title = "Continue learning",
                subtitle = "Take one meaningful next step without leaving your daily rhythm.",
            ) {
                TextBlock("Module ${AppContent.learningPathPreview.order}: ${AppContent.learningPathPreview.title}")
                TagRow(
                    tags = AppContent.deities
                        .sortedBy { it.order }
                        .take(5)
                        .map { it.name.en },
                )
                Row(
                    horizontalArrangement = Arrangement.spacedBy(12.dp),
                    modifier = Modifier.fillMaxWidth(),
                ) {
                    Button(onClick = { onOpen(DivyaRoutes.deityModule.route) }, modifier = Modifier.weight(1f)) {
                        Text("Read module")
                    }
                    OutlinedButton(onClick = { onOpen(DivyaRoutes.deity.route) }, modifier = Modifier.weight(1f)) {
                        Text("Deity details")
                    }
                }
            }
        }

        if (currentStreakDays > 0) {
            item {
                StreakMilestoneModal(
                    visible = showMilestoneModal,
                    days = currentStreakDays,
                    onDismiss = { showMilestoneModal = false },
                    onShare = {
                        DivyaRuntime.trackEvent(
                            "streak_milestone_shared",
                            mapOf("days" to currentStreakDays, "channel" to "whatsapp"),
                        )
                        showMilestoneModal = false
                    },
                )
            }
        }
    }
}

private fun timeAwareGreeting(localTime: LocalTime): String {
    return when {
        localTime.isBefore(LocalTime.NOON) -> "Suprabhatam"
        localTime.isBefore(LocalTime.of(17, 0)) -> "Namaste"
        localTime.isBefore(LocalTime.of(21, 0)) -> "Shubha Sandhya"
        else -> "Shubha Ratri"
    }
}

private fun localizePanchang(base: Panchang): Panchang {
    val userZone = ZoneId.systemDefault()
    return base.copy(
        timezone = userZone.id,
        sunriseLocal = formatLocalFromUtc(base.sunriseUtc, userZone),
        sunsetLocal = formatLocalFromUtc(base.sunsetUtc, userZone),
        rahuKaalStartLocal = formatLocalFromUtc(base.rahuKaalStartUtc, userZone),
        rahuKaalEndLocal = formatLocalFromUtc(base.rahuKaalEndUtc, userZone),
    )
}

private fun formatLocalFromUtc(utcIso: String?, zoneId: ZoneId): String {
    if (utcIso.isNullOrBlank()) return "--"
    return runCatching {
        val instant = Instant.parse(utcIso)
        val formatter = DateTimeFormatter.ofPattern("h:mm a z", Locale.US)
        formatter.format(instant.atZone(zoneId))
    }.getOrDefault("--")
}

private fun loadCachedPanchang(context: Context): Panchang? {
    val raw = SessionStore(context).getCachedPanchang() ?: return null
    return runCatching {
        val array = JSONArray(raw)
        if (array.length() == 0) return null
        val today = LocalDate.now(ZoneId.systemDefault()).toString()
        val selected = (0 until array.length())
            .asSequence()
            .map { array.getJSONObject(it) }
            .firstOrNull { it.optString("date") == today }
            ?: array.getJSONObject(0)
        selected.toPanchangModel()
    }.getOrNull()
}

private fun JSONObject.toPanchangModel(): Panchang {
    val tithiJson = optJSONObject("tithi") ?: JSONObject()
    val nakshatraJson = optJSONObject("nakshatra") ?: JSONObject()
    return Panchang(
        date = optString("date", LocalDate.now(ZoneId.of("UTC")).toString()),
        timezone = optString("timezone", ZoneId.systemDefault().id),
        tithi = Tithi(
            name = tithiJson.optString("name", "Unknown"),
            paksha = tithiJson.optString("paksha", "Shukla"),
            number = tithiJson.optInt("number", 1),
        ),
        nakshatra = Nakshatra(
            number = nakshatraJson.optInt("number", 1),
            name = nakshatraJson.optString("name", "Unknown"),
            nameHi = nakshatraJson.optString("nameHi", "Unknown"),
            deity = nakshatraJson.optString("deity", "Unknown"),
        ),
        sunriseUtc = optString("sunriseUtc", AppContent.panchang.sunriseUtc),
        sunsetUtc = optString("sunsetUtc", AppContent.panchang.sunsetUtc),
        rahuKaalStartUtc = optString("rahuKaalStartUtc", AppContent.panchang.rahuKaalStartUtc),
        rahuKaalEndUtc = optString("rahuKaalEndUtc", AppContent.panchang.rahuKaalEndUtc),
        sunriseLocal = optNullableString("sunriseLocal"),
        sunsetLocal = optNullableString("sunsetLocal"),
        rahuKaalStartLocal = optNullableString("rahuKaalStartLocal"),
        rahuKaalEndLocal = optNullableString("rahuKaalEndLocal"),
        infoTooltip = optNullableString("infoTooltip") ?: AppContent.panchang.infoTooltip,
    )
}

private fun JSONObject.optNullableString(key: String): String? {
    val value = optString(key, "").trim()
    return value.takeIf { it.isNotEmpty() }
}

private fun mergeDailyRecommendation(
    remote: DailyRecommendationRemote,
    panchang: Panchang,
): AppContent.DailyRecommendation {
    val fromTitle = remote.prayerTitle?.let { title ->
        AppContent.prayerLibrary108.firstOrNull { it.title.en.equals(title, ignoreCase = true) }
    }
    val resolvedPrayer = fromTitle ?: AppContent.dailyRecommendation.prayer
    val reasonParts = listOf(remote.reason, remote.festival, remote.tithiName)
        .flatMap { sanitizeUiText(it).split("|") }
        .mapNotNull(::sanitizeUiSegment)
    val reason = joinUiSegments(
        *reasonParts.toTypedArray(),
        panchang.nakshatra.name,
    ).ifBlank { AppContent.dailyRecommendation.reason }
    return AppContent.dailyRecommendation.copy(
        prayer = resolvedPrayer,
        reason = reason,
    )
}

private fun isNetworkConnected(context: Context): Boolean {
    val manager = context.getSystemService(Context.CONNECTIVITY_SERVICE) as? ConnectivityManager ?: return false
    val network = manager.activeNetwork ?: return false
    val capabilities = manager.getNetworkCapabilities(network) ?: return false
    return capabilities.hasCapability(NetworkCapabilities.NET_CAPABILITY_INTERNET)
}
