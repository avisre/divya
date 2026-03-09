package com.divya.android.ui

import com.divya.android.BuildConfig
import java.text.NumberFormat
import java.util.Currency
import java.util.Locale

private val nullLikeStrings = setOf("null", "undefined", "n/a", "na")
private val captureUserMarkers = listOf("capture user", "ui capture user", "play store capture user")

fun joinUiSegments(vararg segments: String?): String {
    return segments
        .mapNotNull { sanitizeUiSegment(it) }
        .joinToString(" • ")
}

fun sanitizeUiSegment(value: String?): String? {
    val normalized = value
        ?.replace("|", "•")
        ?.replace(Regex("\\s+"), " ")
        ?.trim()
        ?.takeIf { it.isNotEmpty() }
        ?: return null
    return normalized.takeUnless { it.lowercase(Locale.US) in nullLikeStrings }
}

fun sanitizeUiText(value: String?): String {
    return value
        ?.replace("â€¢", "•")
        ?.replace("â†’", "→")
        ?.replace("âœ“", "✓")
        ?.replace("â€™", "’")
        ?.replace("ðŸ™\u008f", "🙏")
        ?.replace("ðŸŒ¸", "🌸")
        ?.replace(Regex("\\s+"), " ")
        ?.trim()
        .orEmpty()
}

fun formatPrice(amount: Double?, currencyCode: String?): String {
    val safeAmount = amount ?: 0.0
    val code = currencyCode?.uppercase(Locale.US).orEmpty().ifBlank { "USD" }
    val locale = when (code) {
        "INR" -> Locale("en", "IN")
        "GBP" -> Locale.UK
        "CAD" -> Locale.CANADA
        "AUD" -> Locale("en", "AU")
        "AED" -> Locale("en", "AE")
        else -> Locale.US
    }
    val formatter = NumberFormat.getCurrencyInstance(locale)
    runCatching { formatter.currency = Currency.getInstance(code) }
    formatter.maximumFractionDigits = 0
    formatter.minimumFractionDigits = 0
    return formatter.format(safeAmount)
}

fun productionDisplayName(rawName: String?, fallback: String): String {
    val candidate = sanitizeUiText(rawName).ifBlank { fallback }
    if (BuildConfig.DEBUG || BuildConfig.ENABLE_GALLERY_TOOLS) {
        return candidate
    }
    return if (captureUserMarkers.any { marker -> candidate.contains(marker, ignoreCase = true) }) {
        fallback
    } else {
        candidate
    }
}
