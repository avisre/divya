package com.divya.android.media

import org.junit.Assert.assertEquals
import org.junit.Test

class AudioSourcePolicyTest {
    @Test
    fun offline_withValidCache_usesCached() {
        val choice = chooseAudioSource(
            AudioSourcePolicyInput(
                remoteAvailable = true,
                cachedAvailable = true,
                checksumValid = true,
                networkOnline = false,
            ),
        )
        assertEquals(AudioSourceChoice.CACHED, choice)
    }

    @Test
    fun online_withoutCache_usesRemote() {
        val choice = chooseAudioSource(
            AudioSourcePolicyInput(
                remoteAvailable = true,
                cachedAvailable = false,
                checksumValid = false,
                networkOnline = true,
            ),
        )
        assertEquals(AudioSourceChoice.REMOTE, choice)
    }

    @Test
    fun offline_withoutCache_returnsNone() {
        val choice = chooseAudioSource(
            AudioSourcePolicyInput(
                remoteAvailable = true,
                cachedAvailable = false,
                checksumValid = false,
                networkOnline = false,
            ),
        )
        assertEquals(AudioSourceChoice.NONE, choice)
    }
}

