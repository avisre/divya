package com.divya.data.models

import kotlinx.serialization.Serializable

@Serializable
data class Prayer(
    val id: String,
    val deity: Deity? = null,
    val title: LocalizedText,
    val slug: String,
    val type: String,
    val difficulty: String,
    val durationMinutes: Int,
    val transliteration: String? = null,
    val content: PrayerContent,
    val iast: String? = null,
    val beginnerNote: String? = null,
    val meaning: String? = null,
    val audioUrl: String? = null,
    val coverImageUrl: String? = null,
    val recommendedRepetitions: List<Int> = emptyList(),
    val isPremium: Boolean = false,
    val isFeatured: Boolean = false,
    val tags: List<String> = emptyList(),
    val order: Int = 0,
)

@Serializable
data class PrayerContent(
    val devanagari: String? = null,
    val malayalam: String? = null,
    val english: String? = null,
)

