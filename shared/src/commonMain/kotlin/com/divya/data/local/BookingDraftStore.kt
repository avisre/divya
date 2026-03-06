package com.divya.data.local

import com.divya.data.models.CreateBookingRequest

class BookingDraftStore {
    private val drafts = mutableListOf<CreateBookingRequest>()

    fun saveDraft(draft: CreateBookingRequest) {
        drafts += draft
    }

    fun allDrafts(): List<CreateBookingRequest> = drafts.toList()
}

