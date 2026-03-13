package com.divya.android.ui.screens

import org.junit.Assert.assertFalse
import org.junit.Assert.assertTrue
import org.junit.Test

class PrayerPlayerScreenLogicTest {

    @Test
    fun shouldRequestAutoPlay_returnsTrueForMatchingIds() {
        assertTrue(shouldRequestAutoPlay("gayatri-mantra", "gayatri-mantra"))
    }

    @Test
    fun shouldRequestAutoPlay_ignoresCase() {
        assertTrue(shouldRequestAutoPlay("Gayatri-Mantra", "gayatri-mantra"))
    }

    @Test
    fun shouldRequestAutoPlay_returnsFalseWhenPendingIdMissing() {
        assertFalse(shouldRequestAutoPlay(null, "gayatri-mantra"))
    }

    @Test
    fun shouldRequestAutoPlay_returnsFalseForDifferentIds() {
        assertFalse(shouldRequestAutoPlay("hanuman-chalisa", "gayatri-mantra"))
    }
}
