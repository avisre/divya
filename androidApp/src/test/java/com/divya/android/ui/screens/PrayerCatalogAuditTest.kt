package com.divya.android.ui.screens

import org.junit.Assert.assertTrue
import org.junit.Test

class PrayerCatalogAuditTest {
    private val prayers = AppContent.prayerLibrary108
    private val mojibakeMarkers = listOf("Ã", "Â", "�")

    @Test
    fun audit108Prayers_completeTextFields() {
        val missing = prayers.filterNot { prayer ->
            val hasScript = !prayer.content.devanagari.isNullOrBlank() || !prayer.content.malayalam.isNullOrBlank()
            val hasTransliteration = !prayer.iast.isNullOrBlank() || !prayer.transliteration.isNullOrBlank()
            val hasMeaning = !prayer.meaning.isNullOrBlank()
            val hasEnglish = !prayer.content.english.isNullOrBlank()
            hasScript && hasTransliteration && hasMeaning && hasEnglish
        }.map { it.id }

        assertTrue("Missing required text fields for prayers: $missing", missing.isEmpty())
    }

    @Test
    fun validateIastFields_noMojibakeAndSupportedChars() {
        val iastRegex = Regex("^[\\p{L}\\p{M}\\p{N}\\s.,;:!?'\"()\\-]+$")
        val invalid = prayers.filterNot { prayer ->
            val value = prayer.iast?.trim().orEmpty()
            value.isNotBlank() &&
                mojibakeMarkers.none { value.contains(it) } &&
                iastRegex.matches(value)
        }.map { it.id }

        assertTrue("Invalid IAST/transliteration values: $invalid", invalid.isEmpty())
    }

    @Test
    fun validateDevanagariRendering_noMojibakeAndHasScriptChars() {
        val devanagariChar = Regex("[\\u0900-\\u097F]")
        val invalid = prayers.filterNot { prayer ->
            val value = prayer.content.devanagari?.trim().orEmpty()
            value.isNotBlank() &&
                mojibakeMarkers.none { value.contains(it) } &&
                devanagariChar.containsMatchIn(value)
        }.map { it.id }

        assertTrue("Devanagari content invalid for prayers: $invalid", invalid.isEmpty())
    }

    @Test
    fun validateMalayalamRendering_noMojibakeWhenPresent() {
        val malayalamChar = Regex("[\\u0D00-\\u0D7F]")
        val invalid = prayers.filter { prayer ->
            val value = prayer.content.malayalam?.trim().orEmpty()
            value.isNotBlank() &&
                (mojibakeMarkers.any { value.contains(it) } || !malayalamChar.containsMatchIn(value))
        }.map { it.id }

        assertTrue("Malayalam content invalid for prayers: $invalid", invalid.isEmpty())
    }

    @Test
    fun freeTierPrayers_haveBundledAudio() {
        val freePrayerIds = prayers.filter { AppContent.requiredTier(it.id) == "Free" }.map { it.id }.toSet()
        val missingAudio = prayers.filter { it.id in freePrayerIds && it.audioUrl.isNullOrBlank() }.map { it.id }

        assertTrue("Free-tier prayers missing audioUrl: $missingAudio", missingAudio.isEmpty())
    }
}
