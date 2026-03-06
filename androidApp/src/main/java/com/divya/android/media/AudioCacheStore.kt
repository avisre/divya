package com.divya.android.media

import android.content.Context
import androidx.annotation.VisibleForTesting
import okhttp3.OkHttpClient
import okhttp3.Request
import java.io.File
import java.security.MessageDigest

object AudioCacheStore {
    private val client = OkHttpClient()

    fun cachedFile(context: Context, key: String): File {
        val directory = File(context.filesDir, "audio-cache").apply { mkdirs() }
        return File(directory, "${key.lowercase().replace(Regex("[^a-z0-9]+"), "-")}.bin")
    }

    fun isCached(context: Context, key: String): Boolean = cachedFile(context, key).exists()

    fun download(
        context: Context,
        key: String,
        url: String,
        expectedChecksumSha256: String? = null,
    ): File {
        val output = cachedFile(context, key)
        val request = Request.Builder().url(url).build()
        client.newCall(request).execute().use { response ->
            if (!response.isSuccessful) {
                error("Audio download failed: ${response.code}")
            }
            val body = response.body ?: error("Audio response body missing")
            output.outputStream().use { sink ->
                body.byteStream().use { source ->
                    source.copyTo(sink)
                }
            }
        }
        if (!expectedChecksumSha256.isNullOrBlank()) {
            val actual = sha256(output)
            if (!actual.equals(expectedChecksumSha256, ignoreCase = true)) {
                output.delete()
                error("Audio checksum mismatch for $key")
            }
        }
        return output
    }

    fun isChecksumValid(context: Context, key: String, expectedChecksumSha256: String?): Boolean {
        if (expectedChecksumSha256.isNullOrBlank()) return true
        val file = cachedFile(context, key)
        if (!file.exists()) return false
        return runCatching { sha256(file).equals(expectedChecksumSha256, ignoreCase = true) }.getOrDefault(false)
    }

    private fun sha256(file: File): String {
        val digest = MessageDigest.getInstance("SHA-256")
        file.inputStream().use { input ->
            val buffer = ByteArray(DEFAULT_BUFFER_SIZE)
            while (true) {
                val count = input.read(buffer)
                if (count <= 0) break
                digest.update(buffer, 0, count)
            }
        }
        return digest.digest().joinToString("") { byte -> "%02x".format(byte) }
    }

    @VisibleForTesting
    internal fun checksumForFile(file: File): String = sha256(file)
}
