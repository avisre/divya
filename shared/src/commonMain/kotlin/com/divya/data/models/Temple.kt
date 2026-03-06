package com.divya.data.models

import kotlinx.serialization.Serializable

@Serializable
data class Temple(
    val id: String,
    val name: LocalizedText,
    val deity: Deity? = null,
    val shortDescription: String,
    val fullDescription: String,
    val significance: String,
    val tradition: String,
    val location: TempleLocation,
    val images: List<String> = emptyList(),
    val heroImage: String? = null,
    val timings: TempleTimings,
    val liveStreamUrl: String? = null,
    val isActive: Boolean = true,
    val nriNote: String,
    val panchangLocation: PanchangLocation,
)

@Serializable
data class TempleLocation(
    val city: String,
    val district: String,
    val state: String,
    val country: String,
    val coordinates: Coordinates,
)

@Serializable
data class TempleTimings(
    val pujas: List<TemplePujaTiming> = emptyList(),
)

@Serializable
data class TemplePujaTiming(
    val name: String,
    val nameML: String,
    val timeIST: String,
    val description: String,
)

@Serializable
data class PanchangLocation(
    val lat: Double,
    val lng: Double,
    val timezone: String,
)

