package com.divya.android.ui.components

import android.net.ConnectivityManager
import android.net.Uri
import android.speech.tts.TextToSpeech
import android.util.Patterns
import android.widget.Toast
import androidx.compose.foundation.BorderStroke
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.material3.Button
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.OutlinedButton
import androidx.compose.material3.Surface
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.DisposableEffect
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.rememberCoroutineScope
import androidx.compose.runtime.setValue
import androidx.compose.ui.Modifier
import androidx.compose.ui.platform.LocalConfiguration
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.platform.LocalView
import androidx.compose.ui.semantics.contentDescription
import androidx.compose.ui.semantics.semantics
import androidx.compose.ui.unit.dp
import com.divya.android.app.DivyaRuntime
import com.divya.android.media.AudioCacheStore
import com.divya.android.media.AudioSourceChoice
import com.divya.android.media.AudioSourcePolicyInput
import com.divya.android.media.PrayerAudioPlayer
import com.divya.android.media.chooseAudioSource
import com.divya.android.ui.theme.Clay
import com.divya.android.ui.theme.DeepBrown
import com.divya.android.ui.theme.Ivory
import com.divya.android.ui.theme.Saffron
import java.util.Locale
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.launch
import kotlinx.coroutines.withContext

@Composable
fun PrayerAudioGuideCard(
    prayerId: String?,
    title: String,
    audioUrl: String?,
    pronunciationTip: String?,
    transliteration: String,
    englishMeaning: String,
    audioChecksumSha256: String? = null,
    audioVersion: Int? = null,
    requiredTierLabel: String? = null,
    entitled: Boolean = true,
    autoPlayRequested: Boolean = false,
    onAutoPlayConsumed: () -> Unit = {},
    onSubscribeAudioComingSoon: (() -> Unit)? = null,
    onPlaybackProgress: (Float) -> Unit = {},
) {
    val context = LocalContext.current
    val isCompactPhone = LocalConfiguration.current.screenWidthDp < 390
    val hostView = LocalView.current
    val scope = rememberCoroutineScope()
    val playerState by PrayerAudioPlayer.state.collectAsState()

    val safeAudioUrl = remember(audioUrl) {
        audioUrl?.trim()?.takeIf { candidate ->
            candidate.isNotBlank() &&
                (
                    candidate.startsWith("raw://") ||
                        (
                            (candidate.startsWith("http://") || candidate.startsWith("https://")) &&
                                Patterns.WEB_URL.matcher(candidate).matches()
                            )
                    )
        }
    }

    val remoteAudioAvailable = !safeAudioUrl.isNullOrBlank() && safeAudioUrl.startsWith("http")
    val bundledAudioAvailable = !safeAudioUrl.isNullOrBlank() && safeAudioUrl.startsWith("raw://")
    val bundledResourceName = remember(safeAudioUrl) { safeAudioUrl?.removePrefix("raw://")?.trim() }
    val bundledResourceId = remember(bundledResourceName) {
        if (bundledAudioAvailable && !bundledResourceName.isNullOrBlank()) {
            context.resources.getIdentifier(bundledResourceName, "raw", context.packageName)
        } else {
            0
        }
    }
    val cacheKey = remember(title, audioVersion) {
        "${title.lowercase(Locale.US).replace(Regex("[^a-z0-9]+"), "-")}-v${audioVersion ?: 1}"
    }
    var isCached by remember {
        mutableStateOf(
            remoteAudioAvailable &&
                AudioCacheStore.isCached(context, cacheKey) &&
                AudioCacheStore.isChecksumValid(context, cacheKey, audioChecksumSha256),
        )
    }
    var isDownloading by remember { mutableStateOf(false) }
    var ready by remember { mutableStateOf(false) }
    val sourceToken = remember(audioUrl, cacheKey, isCached, bundledResourceId) {
        "$cacheKey|$audioUrl|$isCached|$bundledResourceId"
    }

    val textToSpeech = remember {
        TextToSpeech(context) { status ->
            ready = status == TextToSpeech.SUCCESS
        }
    }

    DisposableEffect(textToSpeech) {
        textToSpeech.language = Locale.US
        onDispose {
            textToSpeech.stop()
            textToSpeech.shutdown()
        }
    }

    val networkOnline = remember { isNetworkOnline(context) }
    val sourceChoice = remember(remoteAudioAvailable, isCached, networkOnline, audioChecksumSha256, cacheKey) {
        chooseAudioSource(
            AudioSourcePolicyInput(
                remoteAvailable = remoteAudioAvailable,
                cachedAvailable = isCached,
                checksumValid = if (isCached) AudioCacheStore.isChecksumValid(context, cacheKey, audioChecksumSha256) else false,
                networkOnline = networkOnline,
            ),
        )
    }

    val sourceUri = remember(
        safeAudioUrl,
        isCached,
        bundledAudioAvailable,
        bundledResourceId,
        remoteAudioAvailable,
        cacheKey,
        sourceChoice,
    ) {
        when {
            bundledAudioAvailable && bundledResourceId != 0 ->
                Uri.parse("android.resource://${context.packageName}/$bundledResourceId")
            sourceChoice == AudioSourceChoice.CACHED ->
                Uri.fromFile(AudioCacheStore.cachedFile(context, cacheKey))
            sourceChoice == AudioSourceChoice.REMOTE ->
                Uri.parse(safeAudioUrl)
            else -> null
        }
    }

    LaunchedEffect(sourceToken, sourceUri, prayerId, title, entitled, autoPlayRequested) {
        PrayerAudioPlayer.initialize(context)
        PrayerAudioPlayer.setSource(
            prayerId = prayerId,
            title = title,
            sourceToken = sourceToken,
            sourceUri = sourceUri,
        )
        if (sourceUri != null && entitled && autoPlayRequested) {
            PrayerAudioPlayer.play(reason = "selection_autoplay")
            onAutoPlayConsumed()
        }
    }

    val isCurrentSource = playerState.sourceToken == sourceToken
    val playerReady = isCurrentSource && playerState.isReady
    val isPlaying = isCurrentSource && playerState.isPlaying
    val playbackSpeed = if (isCurrentSource) playerState.playbackSpeed else 1f

    LaunchedEffect(playerState.progressFraction, isCurrentSource) {
        if (isCurrentSource) {
            onPlaybackProgress(playerState.progressFraction)
        }
    }

    Surface(
        modifier = Modifier.fillMaxWidth(),
        color = Ivory.copy(alpha = 0.96f),
        shape = MaterialTheme.shapes.medium,
        border = BorderStroke(1.dp, Clay.copy(alpha = 0.8f)),
    ) {
        Column(
            modifier = Modifier.padding(20.dp),
            verticalArrangement = Arrangement.spacedBy(12.dp),
        ) {
            Text(
                text = "Audio for $title",
                style = MaterialTheme.typography.titleLarge,
                color = Saffron,
            )
            Text(
                text = when {
                    bundledAudioAvailable && bundledResourceId == 0 ->
                        "Audio is not available right now. Guided recitation is available instead."
                    bundledAudioAvailable ->
                        "Audio is included for this prayer and can play offline."
                    remoteAudioAvailable ->
                        "Audio is available for this prayer. Save it offline for travel or weaker network conditions."
                    else ->
                        "Audio is not available yet for this prayer. Guided recitation and meaning are available now."
                },
                style = MaterialTheme.typography.bodyMedium,
                color = DeepBrown,
            )
            if (!entitled) {
                Text(
                    text = "Offline download and speed controls unlock in ${requiredTierLabel ?: "Bhakt"} tier.",
                    style = MaterialTheme.typography.bodySmall,
                    color = DeepBrown.copy(alpha = 0.8f),
                )
            }
            if (!pronunciationTip.isNullOrBlank()) {
                Text(
                    text = "Pronunciation tip: $pronunciationTip",
                    style = MaterialTheme.typography.bodySmall,
                    color = DeepBrown.copy(alpha = 0.78f),
                )
            }
            if (!playerState.errorMessage.isNullOrBlank() && isCurrentSource) {
                Text(
                    text = playerState.errorMessage.orEmpty(),
                    style = MaterialTheme.typography.bodySmall,
                    color = DeepBrown.copy(alpha = 0.8f),
                )
            }

            if (sourceUri != null) {
                PlayControls(
                    isCompactPhone = isCompactPhone,
                    playerReady = playerReady,
                    entitled = entitled,
                    isPlaying = isPlaying,
                )
            } else {
                GuidedRecitationControls(
                    isCompactPhone = isCompactPhone,
                    ready = ready,
                    transliteration = transliteration,
                    textToSpeech = textToSpeech,
                    onSubscribeAudioComingSoon = onSubscribeAudioComingSoon,
                    context = context,
                )
            }

            if (sourceUri != null) {
                SpeedControls(
                    isCompactPhone = isCompactPhone,
                    entitled = entitled,
                    onSpeedSelected = { speed ->
                        PrayerAudioPlayer.setSpeed(speed)
                        hostView.announceForAccessibility("Speed $speed x")
                    },
                )
                Text(
                    text = "Playback speed: ${playbackSpeed}x",
                    style = MaterialTheme.typography.bodySmall,
                    color = DeepBrown.copy(alpha = 0.75f),
                )
            }

            if (remoteAudioAvailable) {
                OutlinedButton(
                    onClick = {
                        scope.launch {
                            isDownloading = true
                            runCatching {
                                withContext(Dispatchers.IO) {
                                    AudioCacheStore.download(
                                        context = context,
                                        key = cacheKey,
                                        url = safeAudioUrl!!,
                                        expectedChecksumSha256 = audioChecksumSha256,
                                    )
                                }
                            }.onSuccess {
                                isCached = true
                            }.onFailure {
                                textToSpeech.speak("Audio download failed.", TextToSpeech.QUEUE_FLUSH, null, "download_error")
                            }.also {
                                isDownloading = false
                            }
                        }
                    },
                    enabled = !isCached && !isDownloading,
                    modifier = Modifier
                        .fillMaxWidth()
                        .semantics { contentDescription = "Save prayer audio for offline playback" },
                ) {
                    Text(
                        when {
                            isCached -> "Saved offline"
                            isDownloading -> "Saving..."
                            else -> "Save offline"
                        },
                    )
                }
                if (!networkOnline && !isCached) {
                    Text(
                        text = "Offline right now. Connect briefly to cache this prayer, then it plays offline.",
                        style = MaterialTheme.typography.bodySmall,
                        color = DeepBrown.copy(alpha = 0.78f),
                    )
                }
            }

            if (sourceUri != null) {
                OutlinedButton(
                    onClick = {
                        DivyaRuntime.trackEvent(
                            "prayer_audio_issue_reported",
                            mapOf(
                                "prayer_id" to prayerId,
                                "prayer_title" to title,
                                "position_ms" to playerState.currentPositionMs,
                                "source_token" to sourceToken,
                            ),
                        )
                        Toast.makeText(
                            context,
                            "Audio issue captured at ${playerState.currentPositionMs / 1000}s",
                            Toast.LENGTH_SHORT,
                        ).show()
                    },
                    modifier = Modifier.fillMaxWidth(),
                ) {
                    Text("Report audio issue")
                }
            }

            if (isCompactPhone) {
                Column(verticalArrangement = Arrangement.spacedBy(12.dp), modifier = Modifier.fillMaxWidth()) {
                    Button(
                        onClick = {
                            textToSpeech.speak(englishMeaning, TextToSpeech.QUEUE_FLUSH, null, "meaning")
                        },
                        enabled = ready,
                        modifier = Modifier.fillMaxWidth(),
                    ) {
                        Text("Play meaning")
                    }
                    OutlinedButton(
                        onClick = {
                            textToSpeech.speak(transliteration, TextToSpeech.QUEUE_FLUSH, null, "guide")
                        },
                        enabled = ready,
                        modifier = Modifier.fillMaxWidth(),
                    ) {
                        Text("Pronunciation guide")
                    }
                }
            } else {
                Row(horizontalArrangement = Arrangement.spacedBy(12.dp), modifier = Modifier.fillMaxWidth()) {
                    Button(
                        onClick = {
                            textToSpeech.speak(englishMeaning, TextToSpeech.QUEUE_FLUSH, null, "meaning")
                        },
                        enabled = ready,
                        modifier = Modifier.weight(1f),
                    ) {
                        Text("Play meaning")
                    }
                    OutlinedButton(
                        onClick = {
                            textToSpeech.speak(transliteration, TextToSpeech.QUEUE_FLUSH, null, "guide")
                        },
                        enabled = ready,
                        modifier = Modifier.weight(1f),
                    ) {
                        Text("Pronunciation guide")
                    }
                }
            }
        }
    }
}

@Composable
private fun PlayControls(
    isCompactPhone: Boolean,
    playerReady: Boolean,
    entitled: Boolean,
    isPlaying: Boolean,
) {
    if (isCompactPhone) {
        Column(verticalArrangement = Arrangement.spacedBy(12.dp), modifier = Modifier.fillMaxWidth()) {
            Button(
                onClick = { PrayerAudioPlayer.togglePlayPause() },
                enabled = playerReady && entitled,
                modifier = Modifier
                    .fillMaxWidth()
                    .semantics { contentDescription = if (isPlaying) "Pause chant audio" else "Play chant audio" },
            ) {
                Text(if (isPlaying) PAUSE_GLYPH else PLAY_GLYPH)
            }
            OutlinedButton(
                onClick = { PrayerAudioPlayer.stop() },
                enabled = playerReady && entitled,
                modifier = Modifier
                    .fillMaxWidth()
                    .semantics { contentDescription = "Stop chant audio" },
            ) {
                Text(STOP_GLYPH)
            }
        }
    } else {
        Row(horizontalArrangement = Arrangement.spacedBy(12.dp), modifier = Modifier.fillMaxWidth()) {
            Button(
                onClick = { PrayerAudioPlayer.togglePlayPause() },
                enabled = playerReady && entitled,
                modifier = Modifier
                    .weight(1f)
                    .semantics { contentDescription = if (isPlaying) "Pause chant audio" else "Play chant audio" },
            ) {
                Text(if (isPlaying) PAUSE_GLYPH else PLAY_GLYPH)
            }
            OutlinedButton(
                onClick = { PrayerAudioPlayer.stop() },
                enabled = playerReady && entitled,
                modifier = Modifier
                    .weight(1f)
                    .semantics { contentDescription = "Stop chant audio" },
            ) {
                Text(STOP_GLYPH)
            }
        }
    }
}

@Composable
private fun GuidedRecitationControls(
    isCompactPhone: Boolean,
    ready: Boolean,
    transliteration: String,
    textToSpeech: TextToSpeech,
    onSubscribeAudioComingSoon: (() -> Unit)?,
    context: android.content.Context,
) {
    if (isCompactPhone) {
        Column(verticalArrangement = Arrangement.spacedBy(12.dp), modifier = Modifier.fillMaxWidth()) {
            Button(
                onClick = {
                    textToSpeech.speak(transliteration, TextToSpeech.QUEUE_FLUSH, null, "transliteration")
                },
                enabled = ready,
                modifier = Modifier
                    .fillMaxWidth()
                    .semantics { contentDescription = "Play guided recitation" },
            ) {
                Text("Play recitation")
            }
            if (onSubscribeAudioComingSoon != null) {
                OutlinedButton(
                    onClick = {
                        onSubscribeAudioComingSoon()
                        Toast.makeText(context, "Subscribed for audio release updates", Toast.LENGTH_SHORT).show()
                    },
                    modifier = Modifier
                        .fillMaxWidth()
                        .semantics { contentDescription = "Notify me when licensed audio is available" },
                ) {
                    Text("Notify me")
                }
            }
        }
    } else {
        Row(horizontalArrangement = Arrangement.spacedBy(12.dp), modifier = Modifier.fillMaxWidth()) {
            Button(
                onClick = {
                    textToSpeech.speak(transliteration, TextToSpeech.QUEUE_FLUSH, null, "transliteration")
                },
                enabled = ready,
                modifier = Modifier
                    .weight(1f)
                    .semantics { contentDescription = "Play guided recitation" },
            ) {
                Text("Play recitation")
            }
            if (onSubscribeAudioComingSoon != null) {
                OutlinedButton(
                    onClick = {
                        onSubscribeAudioComingSoon()
                        Toast.makeText(context, "Subscribed for audio release updates", Toast.LENGTH_SHORT).show()
                    },
                    modifier = Modifier
                        .weight(1f)
                        .semantics { contentDescription = "Notify me when licensed audio is available" },
                ) {
                    Text("Notify me")
                }
            }
        }
    }
}

@Composable
private fun SpeedControls(
    isCompactPhone: Boolean,
    entitled: Boolean,
    onSpeedSelected: (Float) -> Unit,
) {
    if (isCompactPhone) {
        Column(verticalArrangement = Arrangement.spacedBy(8.dp), modifier = Modifier.fillMaxWidth()) {
            listOf(listOf(0.5f, 1f), listOf(1.5f, 2f)).forEach { row ->
                Row(horizontalArrangement = Arrangement.spacedBy(8.dp), modifier = Modifier.fillMaxWidth()) {
                    row.forEach { speed ->
                        OutlinedButton(
                            onClick = { onSpeedSelected(speed) },
                            enabled = entitled,
                            modifier = Modifier
                                .weight(1f)
                                .semantics { contentDescription = "Set playback speed to $speed x" },
                        ) {
                            Text("${speed}x")
                        }
                    }
                }
            }
        }
    } else {
        Row(horizontalArrangement = Arrangement.spacedBy(8.dp), modifier = Modifier.fillMaxWidth()) {
            listOf(0.5f, 1f, 1.5f, 2f).forEach { speed ->
                OutlinedButton(
                    onClick = { onSpeedSelected(speed) },
                    enabled = entitled,
                    modifier = Modifier
                        .weight(1f)
                        .semantics { contentDescription = "Set playback speed to $speed x" },
                ) {
                    Text("${speed}x")
                }
            }
        }
    }
}

private fun isNetworkOnline(context: android.content.Context): Boolean {
    return runCatching {
        val cm = context.getSystemService(ConnectivityManager::class.java) ?: return false
        val active = cm.activeNetwork ?: return false
        val caps = cm.getNetworkCapabilities(active) ?: return false
        caps.hasCapability(android.net.NetworkCapabilities.NET_CAPABILITY_INTERNET)
    }.getOrDefault(false)
}

private const val PLAY_GLYPH = "\u25B6"
private const val PAUSE_GLYPH = "\u23F8"
private const val STOP_GLYPH = "\u23F9"
