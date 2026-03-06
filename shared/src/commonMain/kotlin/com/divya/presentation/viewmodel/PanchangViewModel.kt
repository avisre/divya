package com.divya.presentation.viewmodel

import com.divya.data.models.Panchang
import com.divya.data.repository.PanchangRepository
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.SupervisorJob
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.launch

class PanchangViewModel(private val repository: PanchangRepository) {
    private val scope = CoroutineScope(SupervisorJob() + Dispatchers.Default)
    private val _state = MutableStateFlow<Panchang?>(null)
    val state: StateFlow<Panchang?> = _state

    fun loadToday(timezone: String) {
        scope.launch {
            _state.value = repository.today(timezone)
        }
    }
}

