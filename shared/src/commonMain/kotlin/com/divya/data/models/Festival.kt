package com.divya.data.models

import kotlinx.serialization.Serializable

@Serializable
data class Festival(
    val id: String,
    val slug: String,
    val name: LocalizedText,
    val description: String,
    val significance: String,
    val keralaNote: String? = null,
    val monthHint: String? = null,
    val featuredPrayer: Prayer? = null,
    val deity: Deity? = null,
)

