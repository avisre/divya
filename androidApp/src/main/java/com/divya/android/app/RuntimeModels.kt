package com.divya.android.app

data class SessionUser(
    val id: String,
    val name: String,
    val email: String,
    val role: String,
    val country: String,
    val timezone: String,
    val currency: String,
    val isGuest: Boolean,
)

data class SessionState(
    val token: String? = null,
    val user: SessionUser? = null,
)

data class BookingSummary(
    val id: String,
    val bookingReference: String,
    val status: String,
    val waitlistPosition: Int?,
    val paymentStatus: String,
    val pujaName: String,
    val templeName: String,
    val prayerIntention: String,
    val hasVideo: Boolean,
)

data class VideoAccess(
    val streamUrl: String,
    val shareUrl: String?,
)

data class BookingCreateRequest(
    val pujaId: String,
    val devoteeName: String,
    val gothram: String?,
    val nakshatra: String?,
    val prayerIntention: String,
    val currency: String = "USD",
    val requestedDateRange: Map<String, String>? = null,
)

data class BookingCreateResult(
    val booking: BookingSummary,
    val paymentRequired: Boolean,
    val clientSecret: String?,
)

data class GothramSuggestion(
    val gothram: String,
    val confidence: String,
    val source: String,
)

data class GothramGuidanceInput(
    val devoteeName: String,
    val surnameCommunity: String? = null,
    val familyRegion: String? = null,
    val knownFamilyGothram: String? = null,
)

data class GothramGuidanceResult(
    val gothram: String,
    val confidence: String,
    val source: String,
    val guidanceText: String,
)

data class ContactFormRequest(
    val name: String,
    val email: String,
    val category: String,
    val subject: String,
    val message: String,
    val bookingReference: String? = null,
    val appVersion: String? = null,
    val platform: String = "android",
    val screen: String = "profile-contact",
)

data class ContactFormSubmitResult(
    val success: Boolean,
    val requestId: String?,
    val status: String?,
)

data class PrayerAudioMetadata(
    val prayerId: String,
    val url: String?,
    val streamUrl: String?,
    val codec: String?,
    val durationSeconds: Int,
    val licenseTag: String?,
    val qualityLabel: String?,
    val sourceLabel: String?,
    val checksumSha256: String?,
    val version: Int,
    val requiredTier: String,
    val entitled: Boolean,
    val audioComingSoon: Boolean,
    val audioComingSoonSubscribed: Boolean,
)

data class PrayerEntitlement(
    val prayerId: String,
    val requiredTier: String,
    val entitled: Boolean,
)

data class PrayerEntitlementSnapshot(
    val userTier: String,
    val entitlements: List<PrayerEntitlement>,
)

data class PrayerCatalogVersion(
    val totalPrayers: Int,
    val latestUpdatedAt: String?,
    val latestContentVersion: Int,
)

data class PrayerAvailabilitySummary(
    val country: String,
    val language: String,
    val totalPrayers: Int,
    val languageReadyCount: Int,
    val freeCount: Int,
    val bhaktCount: Int,
    val sevaCount: Int,
)

data class BackendHealthStatus(
    val status: String,
    val requestId: String?,
    val uptimeSeconds: Double,
    val mongodb: String,
)

data class UserStreakSummary(
    val current: Int,
    val longest: Int,
    val totalDaysEver: Int,
    val graceUsed: Boolean,
)

data class UserStatsSummary(
    val prayersCompleted: Int,
    val minutesPrayed: Int,
    val streakDays: Int,
)
