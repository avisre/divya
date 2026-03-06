package com.divya.data.network

import com.divya.data.models.CreateBookingRequest
import com.divya.data.models.CreateBookingResponse
import com.divya.data.models.PujaBooking
import kotlinx.serialization.Serializable

class BookingApi(private val client: DivyaApiClient) {
    suspend fun create(request: CreateBookingRequest): CreateBookingResponse = client.post("/bookings", request)
    suspend fun getMine(): List<PujaBooking> = client.get("/bookings")
    suspend fun getById(id: String): PujaBooking = client.get("/bookings/$id")
    suspend fun getVideo(id: String): VideoResponse = client.get("/bookings/$id/video")
}

@Serializable
data class VideoResponse(
    val url: String,
)

