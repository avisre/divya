package com.divya.data.models

import kotlinx.serialization.Serializable

@Serializable
data class LocalizedText(
    val en: String,
    val ml: String? = null,
    val sa: String? = null,
)

@Serializable
data class Coordinates(
    val lat: Double,
    val lng: Double,
)

@Serializable
data class ReminderSettings(
    val morningEnabled: Boolean = true,
    val morningTime: String = "07:00",
    val eveningEnabled: Boolean = true,
    val eveningTime: String = "19:00",
    val festivalAlerts: Boolean = true,
)

@Serializable
data class SubscriptionInfo(
    val tier: String = "free",
    val revenueCatId: String? = null,
    val expiresAt: String? = null,
    val platform: String? = null,
)

@Serializable
data class StreakInfo(
    val current: Int = 0,
    val longest: Int = 0,
    val lastPrayedAt: String? = null,
)

@Serializable
data class ApiMessage(
    val message: String,
)

