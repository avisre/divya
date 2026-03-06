package com.divya.domain.usecase

import com.divya.data.models.CreateBookingRequest
import com.divya.data.models.CreateBookingResponse
import com.divya.data.repository.BookingRepository

class JoinWaitlistUseCase(private val repository: BookingRepository) {
    suspend operator fun invoke(request: CreateBookingRequest): CreateBookingResponse = repository.create(request)
}

