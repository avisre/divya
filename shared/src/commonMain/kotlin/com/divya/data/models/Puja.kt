package com.divya.data.models

import kotlinx.serialization.Serializable

@Serializable
data class Puja(
    val id: String,
    val temple: Temple? = null,
    val deity: Deity? = null,
    val name: LocalizedText,
    val type: String,
    val description: PujaDescription,
    val duration: Int,
    val pricing: PujaPricing,
    val displayPrice: CurrencyAmount? = null,
    val benefits: List<String> = emptyList(),
    val bestFor: List<String> = emptyList(),
    val requirements: List<String> = emptyList(),
    val isWaitlistOnly: Boolean = true,
    val waitlistCount: Int = 0,
    val estimatedWaitWeeks: Int = 4,
    val videoDelivered: Boolean = true,
    val videoNote: String? = null,
    val prasadAvailable: Boolean = false,
    val prasadNote: String = "Prasad delivery - Coming Soon 🙏",
    val order: Int = 0,
    val isActive: Boolean = true,
)

@Serializable
data class PujaDescription(
    val short: String? = null,
    val full: String? = null,
    val whatHappens: String? = null,
    val nriNote: String? = null,
)

@Serializable
data class PujaPricing(
    val usd: Double = 0.0,
    val gbp: Double = 0.0,
    val cad: Double = 0.0,
    val aud: Double = 0.0,
    val aed: Double = 0.0,
)

@Serializable
data class CurrencyAmount(
    val amount: Double,
    val currency: String,
)

