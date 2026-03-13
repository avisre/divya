package com.divya.android.ui.screens

import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.material3.CircularProgressIndicator
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.rememberCoroutineScope
import androidx.compose.runtime.saveable.rememberSaveable
import androidx.compose.runtime.setValue
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.alpha
import androidx.compose.ui.hapticfeedback.HapticFeedbackType
import androidx.compose.ui.platform.LocalHapticFeedback
import androidx.compose.ui.text.input.KeyboardType
import androidx.compose.ui.text.input.PasswordVisualTransformation
import com.divya.android.app.DivyaRuntime
import com.divya.android.navigation.DivyaRoutes
import com.divya.android.ui.components.ProductionOutlinedTextField
import com.divya.android.ui.theme.AlertMarigold
import com.divya.android.ui.theme.SuccessLeaf
import kotlinx.coroutines.launch

@Composable
fun LoginScreen(onOpen: (String) -> Unit) {
    val scope = rememberCoroutineScope()
    val haptic = LocalHapticFeedback.current
    var email by rememberSaveable { mutableStateOf("") }
    var password by rememberSaveable { mutableStateOf("") }
    var isSubmitting by rememberSaveable { mutableStateOf(false) }
    var statusMessage by rememberSaveable { mutableStateOf<String?>(null) }
    var statusOk by rememberSaveable { mutableStateOf(true) }
    val canSubmit = email.isNotBlank() && password.isNotBlank()

    ScreenScaffold(
        eyebrow = "Account access",
        title = "Return to your sacred routine",
        subtitle = "Sign in to continue your prayers, bookings, and saved preferences.",
        badge = "Secure sign-in",
        heroContent = {
            HeroTrustStrip(
                markers = listOf(
                    TrustMarker("\uD83D\uDD12", "Encrypted"),
                    TrustMarker("\uD83D\uDED5", "Temple-verified"),
                    TrustMarker("\uD83C\uDF0F", "NRI-first"),
                ),
            )
            PrimaryActionButton(
                text = "Sign in",
                onClick = {
                    haptic.performHapticFeedback(HapticFeedbackType.TextHandleMove)
                    if (!canSubmit) {
                        statusOk = false
                        statusMessage = "Enter both email and password."
                        return@PrimaryActionButton
                    }
                    isSubmitting = true
                    statusMessage = null
                    DivyaRuntime.trackEvent("login_started")
                    scope.launch {
                        runCatching {
                            DivyaRuntime.login(email.trim(), password)
                        }.onSuccess {
                            statusOk = true
                            statusMessage = "Signed in. Restoring your temple data."
                            onOpen(DivyaRoutes.home.route)
                        }.onFailure {
                            statusOk = false
                            statusMessage = it.message ?: "Login failed"
                            DivyaRuntime.reportHandledError(it, mapOf("screen" to "login"))
                        }
                        isSubmitting = false
                    }
                },
                enabled = !isSubmitting,
                modifier = Modifier
                    .fillMaxWidth()
                    .alpha(if (canSubmit || isSubmitting) 1f else 0.4f),
            ) {
                if (isSubmitting) {
                    CircularProgressIndicator()
                }
            }
        },
    ) {
        item {
            PanelCard(title = "Email") {
                ProductionOutlinedTextField(
                    value = email,
                    onValueChange = { email = it },
                    modifier = Modifier.fillMaxWidth(),
                    label = "Email address",
                    keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Email),
                    singleLine = true,
                )
            }
        }
        item {
            PanelCard(title = "Password") {
                ProductionOutlinedTextField(
                    value = password,
                    onValueChange = { password = it },
                    modifier = Modifier.fillMaxWidth(),
                    label = "Password",
                    visualTransformation = PasswordVisualTransformation(),
                    keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Password),
                    singleLine = true,
                )
            }
        }
        statusMessage?.let { message ->
            item {
                StatusStrip(
                    label = "Sign-in status",
                    detail = message,
                    color = if (statusOk) SuccessLeaf else AlertMarigold,
                )
            }
        }
        item {
            AccentNote(
                title = "After sign-in",
                body = "You will return to your home screen with your prayer history, bookings, and reminders ready.",
            )
        }
        item {
            PanelCard(title = "New to Divya?") {
                TextBlock("Create your account to save streaks, favorites, and puja history.")
                SecondaryActionButton(
                    text = "Create account",
                    onClick = { onOpen(DivyaRoutes.register.route) },
                    modifier = Modifier.fillMaxWidth(),
                )
            }
        }
    }
}
