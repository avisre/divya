package com.divya.presentation.viewmodel

import com.divya.data.models.CreateBookingRequest
import com.divya.data.models.CreateBookingResponse
import com.divya.data.repository.BookingRepository
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.SupervisorJob
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.launch

class BookingViewModel(private val repository: BookingRepository) {
    private val scope = CoroutineScope(SupervisorJob() + Dispatchers.Default)
    private val _result = MutableStateFlow<CreateBookingResponse?>(null)
    val result: StateFlow<CreateBookingResponse?> = _result
    val offlineMessage = "You're offline 🙏 Your prayers and panchang are still available"
    val savedDraftMessage = "Saved locally - will sync when you're back online"
    val syncingMessage = "Syncing your prayer history..."

    fun submit(request: CreateBookingRequest) {
        scope.launch {
            _result.value = repository.create(request)
        }
    }

    fun saveDraft(request: CreateBookingRequest) {
        repository.saveDraft(request)
    }
}

