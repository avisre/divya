package com.divya.data.models

import kotlinx.serialization.Serializable

@Serializable
data class PujaBooking(
    val id: String,
    val bookingReference: String,
    val status: String,
    val devoteeName: String,
    val gothram: String = "Kashyap",
    val nakshatra: String? = null,
    val nakshatraCalculated: Boolean = false,
    val birthDate: String? = null,
    val rashi: String? = null,
    val prayerIntention: String,
    val intentionFiltered: Boolean = false,
    val requestedDateRange: DateRange? = null,
    val scheduledDate: String? = null,
    val scheduledTimeIST: String? = null,
    val waitlistPosition: Int? = null,
    val amount: Double = 0.0,
    val currency: String = "USD",
    val presentedAmount: Double = 0.0,
    val presentedCurrency: String = "USD",
    val settlementCurrency: String = "USD",
    val paymentStatus: String = "pending",
    val videoThumbnailUrl: String? = null,
    val videoDuration: Int? = null,
    val videoUploadedAt: String? = null,
    val videoWatchedAt: String? = null,
    val videoWatchCount: Int = 0,
    val adminNotes: String? = null,
    val notifications: List<BookingNotification> = emptyList(),
    val puja: Puja? = null,
    val temple: Temple? = null,
    val createdAt: String? = null,
)

@Serializable
data class DateRange(
    val start: String? = null,
    val end: String? = null,
)

@Serializable
data class BookingNotification(
    val type: String,
    val channel: String,
    val sentAt: String? = null,
    val success: Boolean = true,
)

@Serializable
data class CreateBookingRequest(
    val pujaId: String,
    val devoteeName: String,
    val gothram: String = "Kashyap",
    val nakshatra: String? = null,
    val nakshatraCalculated: Boolean = false,
    val birthDate: String? = null,
    val rashi: String? = null,
    val prayerIntention: String,
    val requestedDateRange: DateRange? = null,
    val currency: String = "USD",
)

@Serializable
data class CreateBookingResponse(
    val booking: PujaBooking,
    val clientSecret: String,
)

