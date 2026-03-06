package com.divya.android.media

enum class AudioSourceChoice {
    NONE,
    CACHED,
    REMOTE,
}

data class AudioSourcePolicyInput(
    val remoteAvailable: Boolean,
    val cachedAvailable: Boolean,
    val checksumValid: Boolean,
    val networkOnline: Boolean,
)

fun chooseAudioSource(input: AudioSourcePolicyInput): AudioSourceChoice {
    if (!input.remoteAvailable) return AudioSourceChoice.NONE
    if (input.cachedAvailable && input.checksumValid) return AudioSourceChoice.CACHED
    if (input.networkOnline) return AudioSourceChoice.REMOTE
    return AudioSourceChoice.NONE
}

