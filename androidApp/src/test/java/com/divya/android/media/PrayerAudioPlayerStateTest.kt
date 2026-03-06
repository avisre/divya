package com.divya.android.media

import org.junit.Assert.assertEquals
import org.junit.Assert.assertFalse
import org.junit.Assert.assertTrue
import org.junit.Test

class PrayerAudioPlayerStateTest {
    @Test
    fun reduceStateOnPlaybackChanged_updatesPlayingFlag() {
        val initial = PrayerAudioState(
            prayerId = "prayer-3",
            title = "Gayatri Mantra",
            isPlaying = false,
            progressFraction = 0.2f,
        )

        val updated = PrayerAudioPlayer.reduceStateOnPlaybackChanged(initial, true)
        assertTrue(updated.isPlaying)
        assertEquals(initial.progressFraction, updated.progressFraction)
        assertEquals(initial.prayerId, updated.prayerId)
    }

    @Test
    fun reduceStateOnEnded_resetsPositionAndMarksComplete() {
        val initial = PrayerAudioState(
            prayerId = "prayer-3",
            title = "Gayatri Mantra",
            isPlaying = true,
            currentPositionMs = 23_400L,
            durationMs = 30_000L,
            progressFraction = 0.78f,
        )

        val ended = PrayerAudioPlayer.reduceStateOnEnded(initial)
        assertFalse(ended.isPlaying)
        assertEquals(0L, ended.currentPositionMs)
        assertEquals(1f, ended.progressFraction)
        assertEquals(initial.durationMs, ended.durationMs)
    }
}

