package com.divya.presentation.viewmodel

import com.divya.data.models.Puja
import com.divya.data.repository.PujaRepository
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.SupervisorJob
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.launch

class PujaDetailViewModel(private val repository: PujaRepository) {
    private val scope = CoroutineScope(SupervisorJob() + Dispatchers.Default)
    private val _puja = MutableStateFlow<Puja?>(null)
    val puja: StateFlow<Puja?> = _puja

    fun load(id: String, currency: String) {
        scope.launch {
            _puja.value = repository.get(id, currency)
        }
    }
}

