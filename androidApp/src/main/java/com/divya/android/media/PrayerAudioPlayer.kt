package com.divya.android.media

import android.app.PendingIntent
import android.content.Context
import android.content.Intent
import android.graphics.Bitmap
import android.net.Uri
import androidx.annotation.VisibleForTesting
import androidx.media3.common.AudioAttributes
import androidx.media3.common.C
import androidx.media3.common.MediaItem
import androidx.media3.common.Player
import androidx.media3.exoplayer.ExoPlayer
import androidx.media3.ui.PlayerNotificationManager
import com.divya.android.MainActivity
import com.divya.android.R
import com.divya.android.app.DivyaRuntime
import com.divya.android.navigation.DivyaRoutes
import com.divya.android.notifications.DivyaNotificationCenter
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.Job
import kotlinx.coroutines.SupervisorJob
import kotlinx.coroutines.delay
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.isActive
import kotlinx.coroutines.launch

data class PrayerAudioState(
    val prayerId: String? = null,
    val title: String? = null,
    val sourceToken: String? = null,
    val sourceUri: String? = null,
    val isReady: Boolean = false,
    val isPlaying: Boolean = false,
    val playbackSpeed: Float = 1f,
    val currentPositionMs: Long = 0L,
    val durationMs: Long = 0L,
    val progressFraction: Float = 0f,
    val errorMessage: String? = null,
)

object PrayerAudioPlayer {
    private const val PREFS_NAME = "prayer_audio_player"
    private const val KEY_PRAYER_ID = "prayer_id"
    private const val KEY_TITLE = "title"
    private const val KEY_SOURCE_TOKEN = "source_token"
    private const val KEY_SOURCE_URI = "source_uri"
    private const val KEY_SPEED = "speed"
    private const val KEY_POSITION = "position"
    private const val KEY_DURATION = "duration"
    private const val KEY_PROGRESS = "progress"
    private const val KEY_QUEUE = "queue"
    private const val KEY_LAST_POSITION_PREFIX = "position_by_prayer_"
    private const val MEDIA_NOTIFICATION_ID = 9202

    private val scope = CoroutineScope(SupervisorJob() + Dispatchers.Main.immediate)
    private var appContext: Context? = null
    private var player: ExoPlayer? = null
    private var progressJob: Job? = null
    private var listenerAttached = false
    private var lockscreenConfigured = false
    private var notificationManager: PlayerNotificationManager? = null
    private var lastPersistedPositionMs: Long = 0L

    private val _state = MutableStateFlow(PrayerAudioState())
    val state: StateFlow<PrayerAudioState> = _state.asStateFlow()

    fun initialize(context: Context) {
        if (appContext == null) {
            appContext = context.applicationContext
        }
        ensurePlayer()?.let {
            restoreLastPlaybackState(it)
            startProgressLoop()
        }
    }

    fun setSource(
        prayerId: String?,
        title: String,
        sourceToken: String,
        sourceUri: Uri?,
    ) {
        if (appContext == null) {
            _state.value = _state.value.copy(
                prayerId = prayerId,
                title = title,
                sourceToken = sourceToken,
                isReady = false,
                errorMessage = "Audio engine not initialized yet.",
            )
            return
        }
        val exoPlayer = ensurePlayer() ?: return
        saveCurrentPrayerPosition()
        if (sourceUri == null) {
            _state.value = _state.value.copy(
                prayerId = prayerId,
                title = title,
                sourceToken = sourceToken,
                sourceUri = null,
                isReady = false,
                errorMessage = "Audio source unavailable for this prayer.",
            )
            return
        }
        if (!isSupportedSourceUri(sourceUri)) {
            _state.value = _state.value.copy(
                prayerId = prayerId,
                title = title,
                sourceToken = sourceToken,
                sourceUri = sourceUri.toString(),
                isReady = false,
                errorMessage = "Audio source URL is malformed or unsupported.",
            )
            return
        }

        val current = _state.value
        if (
            current.prayerId == prayerId &&
            current.title == title &&
            current.sourceUri == sourceUri.toString() &&
            exoPlayer.currentMediaItem != null
        ) {
            return
        }

        exoPlayer.setMediaItem(MediaItem.fromUri(sourceUri))
        exoPlayer.prepare()
        exoPlayer.playWhenReady = false
        _state.value = PrayerAudioState(
            prayerId = prayerId,
            title = title,
            sourceToken = sourceToken,
            sourceUri = sourceUri.toString(),
            isReady = false,
            isPlaying = false,
            playbackSpeed = current.playbackSpeed,
            currentPositionMs = 0L,
            durationMs = 0L,
            progressFraction = 0f,
            errorMessage = null,
        )
        prayerId?.let {
            val savedPosition = loadPrayerPosition(it)
            if (savedPosition > 0L) {
                exoPlayer.seekTo(savedPosition)
                _state.value = _state.value.copy(currentPositionMs = savedPosition)
            }
        }
        setSpeed(current.playbackSpeed)
        persistPlaybackState()
        startProgressLoop()
    }

    private fun isSupportedSourceUri(uri: Uri): Boolean {
        val scheme = uri.scheme?.lowercase() ?: return false
        return scheme == "android.resource" || scheme == "http" || scheme == "https" || scheme == "file"
    }

    fun play(reason: String = "user") {
        val exoPlayer = ensurePlayer() ?: return
        exoPlayer.play()
        trackMediaAction("play", reason)
    }

    fun pause(reason: String = "user") {
        val exoPlayer = ensurePlayer() ?: return
        exoPlayer.pause()
        trackMediaAction("pause", reason)
        persistPlaybackState()
    }

    fun togglePlayPause() {
        val exoPlayer = ensurePlayer() ?: return
        if (exoPlayer.isPlaying) {
            pause(reason = "toggle")
        } else {
            play(reason = "toggle")
        }
    }

    fun stop() {
        val exoPlayer = ensurePlayer() ?: return
        exoPlayer.pause()
        exoPlayer.seekTo(0)
        _state.value = _state.value.copy(
            isPlaying = false,
            currentPositionMs = 0L,
            progressFraction = 0f,
        )
        trackMediaAction("pause", "stop")
        persistPlaybackState()
    }

    fun clearCurrent(reason: String = "user_close") {
        val closingState = _state.value
        val exoPlayer = ensurePlayer()
        saveCurrentPrayerPosition()
        exoPlayer?.pause()
        exoPlayer?.clearMediaItems()
        trackMediaAction(
            "close",
            reason,
            mapOf(
                "prayer_id" to closingState.prayerId,
                "prayer_title" to closingState.title,
                "position_ms" to closingState.currentPositionMs,
            ),
        )
        _state.value = PrayerAudioState()
        clearPersistedPlaybackState()
    }

    fun setSpeed(speed: Float) {
        val normalized = speed.coerceIn(0.5f, 2f)
        ensurePlayer()?.setPlaybackSpeed(normalized)
        _state.value = _state.value.copy(playbackSpeed = normalized)
        trackMediaAction("speed_change", "user", mapOf("speed" to normalized))
        persistPlaybackState()
    }

    fun seekToFraction(fraction: Float) {
        val exoPlayer = ensurePlayer() ?: return
        val duration = exoPlayer.duration
        if (duration <= 0) return
        val safeFraction = fraction.coerceIn(0f, 1f)
        val position = (duration * safeFraction).toLong()
        exoPlayer.seekTo(position)
        _state.value = _state.value.copy(
            currentPositionMs = position,
            durationMs = duration,
            progressFraction = safeFraction,
        )
        trackMediaAction("seek", "fraction", mapOf("position_ms" to position))
        persistPlaybackState()
    }

    fun skipBy(deltaMs: Long) {
        val exoPlayer = ensurePlayer() ?: return
        val duration = exoPlayer.duration.coerceAtLeast(0L)
        val currentPosition = exoPlayer.currentPosition.coerceAtLeast(0L)
        val target = (currentPosition + deltaMs).coerceIn(0L, duration.takeIf { it > 0L } ?: Long.MAX_VALUE)
        exoPlayer.seekTo(target)
        _state.value = _state.value.copy(
            currentPositionMs = target,
            durationMs = duration,
            progressFraction = if (duration > 0L) {
                (target.toFloat() / duration.toFloat()).coerceIn(0f, 1f)
            } else {
                0f
            },
        )
        trackMediaAction("seek", if (deltaMs >= 0) "forward_10s" else "rewind_10s", mapOf("position_ms" to target))
        persistPlaybackState()
    }

    private fun ensurePlayer(): ExoPlayer? {
        val context = appContext ?: return null
        if (player == null) {
            player = ExoPlayer.Builder(context).build().apply {
                setAudioAttributes(
                    AudioAttributes.Builder()
                        .setUsage(C.USAGE_MEDIA)
                        .setContentType(C.AUDIO_CONTENT_TYPE_MUSIC)
                        .build(),
                    true,
                )
                setHandleAudioBecomingNoisy(true)
            }
        }
        if (!listenerAttached) {
            attachListener(player!!)
            listenerAttached = true
        }
        if (!lockscreenConfigured) {
            configureLockscreenControls(context, player!!)
            lockscreenConfigured = true
        }
        return player
    }

    private fun attachListener(exoPlayer: ExoPlayer) {
        exoPlayer.addListener(
            object : Player.Listener {
                override fun onPlaybackStateChanged(playbackState: Int) {
                    val ready = playbackState == Player.STATE_READY
                    _state.value = _state.value.copy(isReady = ready)
                    if (playbackState == Player.STATE_ENDED) {
                        saveCurrentPrayerPosition(reset = true)
                        _state.value = reduceStateOnEnded(_state.value)
                        persistPlaybackState()
                    }
                }

                override fun onIsPlayingChanged(isPlaying: Boolean) {
                    _state.value = reduceStateOnPlaybackChanged(_state.value, isPlaying)
                    persistPlaybackState()
                }

                override fun onPlayerError(error: androidx.media3.common.PlaybackException) {
                    _state.value = _state.value.copy(errorMessage = error.message)
                    persistPlaybackState()
                }
            },
        )
    }

    private fun configureLockscreenControls(
        context: Context,
        exoPlayer: ExoPlayer,
    ) {
        val descriptionAdapter = object : PlayerNotificationManager.MediaDescriptionAdapter {
            override fun getCurrentContentTitle(player: Player): CharSequence {
                return state.value.title ?: "Prayer playback"
            }

            override fun createCurrentContentIntent(player: Player): PendingIntent {
                val launchIntent = Intent(context, MainActivity::class.java).apply {
                    putExtra("route", DivyaRoutes.nowPlaying.route)
                    flags = Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_CLEAR_TOP
                }
                return PendingIntent.getActivity(
                    context,
                    MEDIA_NOTIFICATION_ID,
                    launchIntent,
                    PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE,
                )
            }

            override fun getCurrentContentText(player: Player): CharSequence {
                val current = state.value
                return "${formatDuration(current.currentPositionMs)} / ${formatDuration(current.durationMs)}"
            }

            override fun getCurrentLargeIcon(
                player: Player,
                callback: PlayerNotificationManager.BitmapCallback,
            ): Bitmap? = null
        }

        notificationManager = PlayerNotificationManager.Builder(
            context,
            MEDIA_NOTIFICATION_ID,
            DivyaNotificationCenter.MEDIA_PLAYBACK_CHANNEL_ID,
        ).setMediaDescriptionAdapter(descriptionAdapter)
            .setSmallIconResourceId(R.drawable.ic_om)
            .build().apply {
                setPlayer(exoPlayer)
                setUseNextAction(false)
                setUsePreviousAction(false)
                setUseFastForwardAction(false)
                setUseRewindAction(false)
                setUseStopAction(true)
            }
    }

    private fun startProgressLoop() {
        if (progressJob?.isActive == true) return
        progressJob = scope.launch {
            while (isActive) {
                val exoPlayer = player
                if (exoPlayer != null) {
                    val duration = exoPlayer.duration
                    val current = exoPlayer.currentPosition
                    val fraction = if (duration > 0) {
                        (current.toFloat() / duration.toFloat()).coerceIn(0f, 1f)
                    } else {
                        0f
                    }
                    _state.value = _state.value.copy(
                        currentPositionMs = current.coerceAtLeast(0L),
                        durationMs = duration.coerceAtLeast(0L),
                        progressFraction = fraction,
                    )
                    persistPlaybackState()
                    val currentPrayerId = _state.value.prayerId
                    val safeCurrent = current.coerceAtLeast(0L)
                    if (currentPrayerId != null && kotlin.math.abs(safeCurrent - lastPersistedPositionMs) >= 1_000L) {
                        savePrayerPosition(currentPrayerId, safeCurrent)
                        lastPersistedPositionMs = safeCurrent
                    }
                }
                delay(300)
            }
        }
    }

    private fun persistPlaybackState() {
        val context = appContext ?: return
        val current = _state.value
        context.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE).edit().apply {
            putString(KEY_PRAYER_ID, current.prayerId)
            putString(KEY_TITLE, current.title)
            putString(KEY_SOURCE_TOKEN, current.sourceToken)
            putString(KEY_SOURCE_URI, current.sourceUri)
            putFloat(KEY_SPEED, current.playbackSpeed)
            putLong(KEY_POSITION, current.currentPositionMs)
            putLong(KEY_DURATION, current.durationMs)
            putFloat(KEY_PROGRESS, current.progressFraction)
            putString(KEY_QUEUE, current.sourceUri ?: "")
        }.apply()
    }

    private fun clearPersistedPlaybackState() {
        val context = appContext ?: return
        context.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE).edit().apply {
            remove(KEY_PRAYER_ID)
            remove(KEY_TITLE)
            remove(KEY_SOURCE_TOKEN)
            remove(KEY_SOURCE_URI)
            remove(KEY_POSITION)
            remove(KEY_DURATION)
            remove(KEY_PROGRESS)
            remove(KEY_QUEUE)
        }.apply()
    }

    private fun restoreLastPlaybackState(exoPlayer: ExoPlayer) {
        val context = appContext ?: return
        val prefs = context.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE)
        val sourceUriString = prefs.getString(KEY_SOURCE_URI, null) ?: return
        if (exoPlayer.currentMediaItem != null) return

        val sourceUri = runCatching { Uri.parse(sourceUriString) }.getOrNull() ?: return
        val prayerId = prefs.getString(KEY_PRAYER_ID, null)
        val title = prefs.getString(KEY_TITLE, null)
        val sourceToken = prefs.getString(KEY_SOURCE_TOKEN, null)
        val speed = prefs.getFloat(KEY_SPEED, 1f).coerceIn(0.5f, 2f)
        val savedPosition = prayerId?.let(::loadPrayerPosition) ?: prefs.getLong(KEY_POSITION, 0L)

        exoPlayer.setMediaItem(MediaItem.fromUri(sourceUri))
        exoPlayer.prepare()
        exoPlayer.setPlaybackSpeed(speed)
        if (savedPosition > 0L) {
            exoPlayer.seekTo(savedPosition)
        }
        _state.value = PrayerAudioState(
            prayerId = prayerId,
            title = title,
            sourceToken = sourceToken,
            sourceUri = sourceUriString,
            isReady = false,
            isPlaying = false,
            playbackSpeed = speed,
            currentPositionMs = savedPosition,
            durationMs = prefs.getLong(KEY_DURATION, 0L),
            progressFraction = prefs.getFloat(KEY_PROGRESS, 0f),
            errorMessage = null,
        )
        lastPersistedPositionMs = savedPosition
    }

    private fun saveCurrentPrayerPosition(reset: Boolean = false) {
        val prayerId = _state.value.prayerId ?: return
        val position = if (reset) 0L else {
            player?.currentPosition?.coerceAtLeast(0L) ?: _state.value.currentPositionMs
        }
        savePrayerPosition(prayerId, position)
    }

    private fun savePrayerPosition(prayerId: String, positionMs: Long) {
        val context = appContext ?: return
        context.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE)
            .edit()
            .putLong(KEY_LAST_POSITION_PREFIX + prayerId, positionMs.coerceAtLeast(0L))
            .apply()
    }

    private fun loadPrayerPosition(prayerId: String): Long {
        val context = appContext ?: return 0L
        return context.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE)
            .getLong(KEY_LAST_POSITION_PREFIX + prayerId, 0L)
            .coerceAtLeast(0L)
    }

    private fun trackMediaAction(
        action: String,
        reason: String,
        extras: Map<String, Any?> = emptyMap(),
    ) {
        val current = _state.value
        val payload = mutableMapOf<String, Any?>(
            "action" to action,
            "reason" to reason,
            "prayer_id" to current.prayerId,
            "prayer_title" to current.title,
            "position_ms" to current.currentPositionMs,
            "speed" to current.playbackSpeed,
        )
        payload.putAll(extras)
        DivyaRuntime.trackEvent(action, payload)
        DivyaRuntime.trackAudioTelemetry(action, payload)
    }

    @VisibleForTesting
    internal fun clearPersistedStateForTests() {
        val context = appContext ?: return
        context.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE).edit().clear().apply()
    }

    @VisibleForTesting
    internal fun debugSnapshot(): Map<String, Any?> {
        val current = _state.value
        return mapOf(
            "hasContext" to (appContext != null),
            "hasPlayer" to (player != null),
            "listenerAttached" to listenerAttached,
            "lockscreenConfigured" to lockscreenConfigured,
            "progressLoopActive" to (progressJob?.isActive == true),
            "prayerId" to current.prayerId,
            "sourceUri" to current.sourceUri,
            "speed" to current.playbackSpeed
        )
    }

    @VisibleForTesting
    internal fun reduceStateOnPlaybackChanged(current: PrayerAudioState, isPlaying: Boolean): PrayerAudioState {
        return current.copy(isPlaying = isPlaying)
    }

    @VisibleForTesting
    internal fun reduceStateOnEnded(current: PrayerAudioState): PrayerAudioState {
        return current.copy(
            isPlaying = false,
            currentPositionMs = 0L,
            progressFraction = 1f,
        )
    }

    fun releaseForBackground() {
        saveCurrentPrayerPosition()
        progressJob?.cancel()
        progressJob = null
        notificationManager?.setPlayer(null)
        notificationManager = null
        player?.release()
        player = null
        listenerAttached = false
        lockscreenConfigured = false
    }

    private fun formatDuration(durationMs: Long): String {
        if (durationMs <= 0L) return "0:00"
        val totalSeconds = durationMs / 1000
        val minutes = totalSeconds / 60
        val seconds = totalSeconds % 60
        return "$minutes:${seconds.toString().padStart(2, '0')}"
    }
}
