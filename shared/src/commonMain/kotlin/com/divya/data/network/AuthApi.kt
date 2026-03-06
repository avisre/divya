package com.divya.data.network

import com.divya.data.models.AuthResponse
import kotlinx.serialization.Serializable

class AuthApi(private val client: DivyaApiClient) {
    suspend fun register(request: RegisterRequest): AuthResponse = client.post("/auth/register", request)
    suspend fun login(request: LoginRequest): AuthResponse = client.post("/auth/login", request)
    suspend fun guest(request: GuestRequest): AuthResponse = client.post("/auth/guest", request)
}

@Serializable
data class RegisterRequest(
    val name: String,
    val email: String,
    val password: String,
    val country: String,
    val timezone: String,
)

@Serializable
data class LoginRequest(
    val email: String,
    val password: String,
)

@Serializable
data class GuestRequest(
    val sessionsBeforeSignup: Int = 1,
)

