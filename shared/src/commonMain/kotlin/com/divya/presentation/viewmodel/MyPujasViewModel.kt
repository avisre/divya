package com.divya.presentation.viewmodel

import com.divya.data.models.PujaBooking
import com.divya.data.repository.BookingRepository
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.SupervisorJob
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.launch

class MyPujasViewModel(private val repository: BookingRepository) {
    private val scope = CoroutineScope(SupervisorJob() + Dispatchers.Default)
    private val _state = MutableStateFlow<List<PujaBooking>>(emptyList())
    val state: StateFlow<List<PujaBooking>> = _state

    fun load() {
        scope.launch {
            _state.value = repository.myBookings()
        }
    }
}

