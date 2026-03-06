package com.divya.presentation.viewmodel

import com.divya.data.models.Panchang
import com.divya.data.models.Prayer
import com.divya.data.repository.PanchangRepository
import com.divya.data.repository.PrayerRepository
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.SupervisorJob
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.update
import kotlinx.coroutines.launch

data class HomeUiState(
    val isLoading: Boolean = true,
    val featuredPrayers: List<Prayer> = emptyList(),
    val panchang: Panchang? = null,
)

class HomeViewModel(
    private val prayerRepository: PrayerRepository,
    private val panchangRepository: PanchangRepository,
) {
    private val scope = CoroutineScope(SupervisorJob() + Dispatchers.Default)
    private val _state = MutableStateFlow(HomeUiState())
    val state: StateFlow<HomeUiState> = _state

    fun load(timezone: String) {
        scope.launch {
            val prayers = prayerRepository.featured()
            val panchang = panchangRepository.today(timezone)
            _state.update { it.copy(isLoading = false, featuredPrayers = prayers, panchang = panchang) }
        }
    }
}

