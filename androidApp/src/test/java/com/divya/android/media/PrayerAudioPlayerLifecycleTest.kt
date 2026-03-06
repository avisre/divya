package com.divya.android.media

import org.junit.Assert.assertFalse
import org.junit.Test

class PrayerAudioPlayerLifecycleTest {
    @Test
    fun releaseForBackground_clearsProgressLoopAndPlayerReferences() {
        PrayerAudioPlayer.releaseForBackground()
        val snapshot = PrayerAudioPlayer.debugSnapshot()
        assertFalse(snapshot["progressLoopActive"] as Boolean)
        assertFalse(snapshot["hasPlayer"] as Boolean)
    }
}

