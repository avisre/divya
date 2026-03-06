package com.divya.android.media

import org.junit.Assert.assertEquals
import org.junit.Assert.assertNotEquals
import org.junit.Test
import java.io.File

class AudioCacheStoreChecksumTest {
    @Test
    fun checksumForFile_isStable() {
        val tmp = File.createTempFile("divya-audio", ".bin")
        tmp.writeText("om namah shivaya")

        val first = AudioCacheStore.checksumForFile(tmp)
        val second = AudioCacheStore.checksumForFile(tmp)
        assertEquals(first, second)
    }

    @Test
    fun checksumForFile_changesWhenContentChanges() {
        val tmp = File.createTempFile("divya-audio", ".bin")
        tmp.writeText("gayatri")
        val before = AudioCacheStore.checksumForFile(tmp)
        tmp.writeText("maha mrityunjaya")
        val after = AudioCacheStore.checksumForFile(tmp)
        assertNotEquals(before, after)
    }
}

