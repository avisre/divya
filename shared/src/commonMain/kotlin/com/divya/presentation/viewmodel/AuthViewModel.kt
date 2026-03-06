package com.divya.presentation.viewmodel

import com.divya.data.models.AuthResponse
import com.divya.data.repository.AuthRepository
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.SupervisorJob
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.launch

class AuthViewModel(private val repository: AuthRepository) {
    private val scope = CoroutineScope(SupervisorJob() + Dispatchers.Default)
    private val _session = MutableStateFlow<AuthResponse?>(null)
    val session: StateFlow<AuthResponse?> = _session

    fun login(email: String, password: String) {
        scope.launch {
            _session.value = repository.login(email, password)
        }
    }

    fun register(name: String, email: String, password: String, country: String, timezone: String) {
        scope.launch {
            _session.value = repository.register(name, email, password, country, timezone)
        }
    }

    fun continueAsGuest(sessionCount: Int) {
        scope.launch {
            _session.value = repository.continueAsGuest(sessionCount)
        }
    }
}
