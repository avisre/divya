package com.divya.android.ui.screens

import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.material3.Button
import androidx.compose.material3.CircularProgressIndicator
import androidx.compose.material3.OutlinedButton
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.rememberCoroutineScope
import androidx.compose.runtime.saveable.rememberSaveable
import androidx.compose.runtime.setValue
import androidx.compose.ui.Modifier
import androidx.compose.ui.hapticfeedback.HapticFeedbackType
import androidx.compose.ui.platform.LocalHapticFeedback
import androidx.compose.ui.text.input.KeyboardType
import androidx.compose.ui.text.input.PasswordVisualTransformation
import com.divya.android.app.DivyaRuntime
import com.divya.android.navigation.DivyaRoutes
import com.divya.android.ui.screens.HeroTrustStrip
import com.divya.android.ui.screens.TrustMarker
import com.divya.android.ui.theme.AlertMarigold
import com.divya.android.ui.theme.SuccessLeaf
import java.util.Locale
import java.util.TimeZone
import kotlinx.coroutines.launch

@Composable
fun RegisterScreen(onOpen: (String) -> Unit) {
    val scope = rememberCoroutineScope()
    val haptic = LocalHapticFeedback.current
    var name by rememberSaveable { mutableStateOf("") }
    var email by rememberSaveable { mutableStateOf("") }
    var password by rememberSaveable { mutableStateOf("") }
    var country by rememberSaveable { mutableStateOf(Locale.getDefault().country.ifBlank { "US" }) }
    var timezone by rememberSaveable { mutableStateOf(TimeZone.getDefault().id) }
    var isSubmitting by rememberSaveable { mutableStateOf(false) }
    var statusMessage by rememberSaveable { mutableStateOf<String?>(null) }
    var statusOk by rememberSaveable { mutableStateOf(true) }
    val isBusy = isSubmitting
    val canSubmit = name.isNotBlank() && email.isNotBlank() && password.isNotBlank() && !isBusy

    ScreenScaffold(
        eyebrow = "Free account",
        title = "Save your spiritual journey",
        subtitle = "Create your account to save prayers, bookings, reminders, and your daily rhythm.",
        badge = "Create account",
        heroContent = {
            HeroTrustStrip(
                markers = listOf(
                    TrustMarker("🔒", "Encrypted"),
                    TrustMarker("🛕", "Temple-verified"),
                    TrustMarker("🌏", "NRI-first"),
                ),
            )
            Button(
                onClick = {
                    haptic.performHapticFeedback(HapticFeedbackType.TextHandleMove)
                    if (name.isBlank() || email.isBlank() || password.isBlank()) {
                        statusOk = false
                        statusMessage = "Name, email, and password are required."
                        return@Button
                    }
                    isSubmitting = true
                    statusMessage = null
                    DivyaRuntime.trackEvent("register_started", mapOf("country" to country))
                    scope.launch {
                        runCatching {
                            DivyaRuntime.register(name.trim(), email.trim(), password, country.trim(), timezone.trim())
                        }.onSuccess {
                            statusOk = true
                            statusMessage = "Account created. Personalize your home screen next."
                            onOpen(DivyaRoutes.onboarding.route)
                        }.onFailure {
                            statusOk = false
                            statusMessage = it.message ?: "Registration failed"
                            DivyaRuntime.reportHandledError(it, mapOf("screen" to "register"))
                        }
                        isSubmitting = false
                    }
                },
                enabled = canSubmit,
                modifier = Modifier.fillMaxWidth(),
            ) {
                if (isSubmitting) {
                    CircularProgressIndicator()
                } else {
                    Text("Create account")
                }
            }
        },
    ) {
        item {
            PanelCard(title = "Your details") {
                OutlinedTextField(value = name, onValueChange = { name = it }, modifier = Modifier.fillMaxWidth(), label = { Text("Name") }, singleLine = true)
                OutlinedTextField(
                    value = email,
                    onValueChange = { email = it },
                    modifier = Modifier.fillMaxWidth(),
                    label = { Text("Email") },
                    keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Email),
                    singleLine = true,
                )
                OutlinedTextField(
                    value = password,
                    onValueChange = { password = it },
                    modifier = Modifier.fillMaxWidth(),
                    label = { Text("Password") },
                    keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Password),
                    visualTransformation = PasswordVisualTransformation(),
                    singleLine = true,
                )
                OutlinedTextField(value = country, onValueChange = { country = it }, modifier = Modifier.fillMaxWidth(), label = { Text("Country code") })
                OutlinedTextField(value = timezone, onValueChange = { timezone = it }, modifier = Modifier.fillMaxWidth(), label = { Text("Timezone") })
            }
        }
        statusMessage?.let { message ->
            item {
                StatusStrip(
                    label = "Registration status",
                    detail = message,
                    color = if (statusOk) SuccessLeaf else AlertMarigold,
                )
            }
        }
        item {
            AccentNote(
                title = "What happens next",
                body = "You will choose a few preferences next so Divya can personalize your home screen and reminders.",
            )
        }
        item {
            PanelCard(title = "Already have an account?") {
                OutlinedButton(
                    onClick = { onOpen(DivyaRoutes.login.route) },
                    modifier = Modifier.fillMaxWidth(),
                ) {
                    Text("Back to sign in")
                }
            }
        }
    }
}
