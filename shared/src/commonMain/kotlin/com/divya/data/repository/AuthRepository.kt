package com.divya.data.repository

import com.divya.data.models.AuthResponse
import com.divya.data.network.AuthApi
import com.divya.data.network.GuestRequest
import com.divya.data.network.LoginRequest
import com.divya.data.network.RegisterRequest

class AuthRepository(private val api: AuthApi) {
    suspend fun register(name: String, email: String, password: String, country: String, timezone: String): AuthResponse =
        api.register(RegisterRequest(name, email, password, country, timezone))

    suspend fun login(email: String, password: String): AuthResponse = api.login(LoginRequest(email, password))
    suspend fun continueAsGuest(sessionCount: Int): AuthResponse = api.guest(GuestRequest(sessionCount))
}

