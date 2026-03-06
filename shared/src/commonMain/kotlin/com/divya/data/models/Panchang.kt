package com.divya.data.models

import kotlinx.serialization.Serializable

@Serializable
data class Panchang(
    val date: String,
    val timezone: String,
    val tithi: Tithi,
    val nakshatra: Nakshatra,
    val sunriseUtc: String,
    val sunsetUtc: String,
    val rahuKaalStartUtc: String,
    val rahuKaalEndUtc: String,
    val sunriseLocal: String? = null,
    val sunsetLocal: String? = null,
    val rahuKaalStartLocal: String? = null,
    val rahuKaalEndLocal: String? = null,
    val festivals: List<Festival> = emptyList(),
    val infoTooltip: String? = null,
)

@Serializable
data class Tithi(
    val name: String,
    val paksha: String,
    val number: Int,
)

@Serializable
data class Nakshatra(
    val number: Int,
    val name: String,
    val nameHi: String,
    val deity: String,
)

