package com.divya.data.models

import kotlinx.serialization.Serializable

@Serializable
data class Deity(
    val id: String,
    val slug: String,
    val name: LocalizedText,
    val shortDescription: String,
    val fullDescription: String,
    val pronunciationGuide: String? = null,
    val tradition: String,
    val iconUrl: String? = null,
    val imageUrl: String? = null,
    val isFeatured: Boolean = false,
    val order: Int = 0,
)

