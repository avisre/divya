package com.divya.data.repository

import com.divya.data.local.BookingDraftStore
import com.divya.data.models.CreateBookingRequest
import com.divya.data.models.CreateBookingResponse
import com.divya.data.models.PujaBooking
import com.divya.data.network.BookingApi

class BookingRepository(
    private val api: BookingApi,
    private val drafts: BookingDraftStore,
) {
    suspend fun create(request: CreateBookingRequest): CreateBookingResponse = api.create(request)
    suspend fun myBookings(): List<PujaBooking> = api.getMine()
    suspend fun booking(id: String): PujaBooking = api.getById(id)
    fun saveDraft(request: CreateBookingRequest) = drafts.saveDraft(request)
}

