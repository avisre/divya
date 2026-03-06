package com.divya.data.models

import kotlinx.serialization.Serializable

@Serializable
data class User(
    val id: String,
    val name: String,
    val email: String,
    val role: String = "user",
    val country: String = "US",
    val timezone: String = "America/New_York",
    val currency: String = "USD",
    val onboarding: OnboardingAnswers? = null,
    val subscription: SubscriptionInfo = SubscriptionInfo(),
    val isGuest: Boolean = false,
)

@Serializable
data class OnboardingAnswers(
    val prayerFrequency: String,
    val purpose: String,
    val tradition: String,
    val completedAt: String? = null,
)

@Serializable
data class AuthResponse(
    val token: String,
    val user: User,
)

