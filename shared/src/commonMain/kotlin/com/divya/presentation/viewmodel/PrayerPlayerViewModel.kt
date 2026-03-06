package com.divya.presentation.viewmodel

import com.divya.analytics.AnalyticsTracker
import com.divya.data.models.Prayer
import com.divya.island.IslandManager
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.update

data class PrayerPlayerUiState(
    val prayer: Prayer? = null,
    val repetitionCurrent: Int = 0,
    val repetitionTotal: Int = 0,
    val secondsRemaining: Int = 0,
    val isPlaying: Boolean = false,
)

class PrayerPlayerViewModel(
    private val islandManager: IslandManager,
    private val analytics: AnalyticsTracker,
) {
    private val _state = MutableStateFlow(PrayerPlayerUiState())
    val state: StateFlow<PrayerPlayerUiState> = _state

    fun start(prayer: Prayer, totalRepetitions: Int, totalSeconds: Int) {
        _state.value = PrayerPlayerUiState(prayer, 0, totalRepetitions, totalSeconds, true)
        analytics.track("prayer_started", mapOf("prayer_name" to prayer.title.en, "repetitions_set" to totalRepetitions))
        analytics.track("island_prayer_started")
        islandManager.startPrayerSession(prayer.title.en, totalRepetitions, totalSeconds)
    }

    fun updateProgress(currentRep: Int, secondsRemaining: Int) {
        _state.update { it.copy(repetitionCurrent = currentRep, secondsRemaining = secondsRemaining) }
        islandManager.updatePrayerProgress(currentRep, secondsRemaining)
    }

    fun finish() {
        analytics.track("prayer_completed")
        islandManager.endPrayerSession()
        _state.update { it.copy(isPlaying = false) }
    }
}

