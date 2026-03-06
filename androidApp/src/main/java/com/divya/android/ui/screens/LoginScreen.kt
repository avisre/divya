package com.divya.android.ui.screens

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.material3.Button
import androidx.compose.material3.CircularProgressIndicator
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.rememberCoroutineScope
import androidx.compose.runtime.saveable.rememberSaveable
import androidx.compose.runtime.setValue
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp
import com.divya.android.app.DivyaRuntime
import com.divya.android.navigation.DivyaRoutes
import kotlinx.coroutines.launch

@Composable
fun LoginScreen(onOpen: (String) -> Unit) {
    val scope = rememberCoroutineScope()
    var email by rememberSaveable { mutableStateOf("admin@divya.app") }
    var password by rememberSaveable { mutableStateOf("Admin@12345") }
    var isSubmitting by rememberSaveable { mutableStateOf(false) }
    var statusMessage by rememberSaveable { mutableStateOf<String?>(null) }

    ScreenScaffold(
        eyebrow = "Account access",
        title = "Return to your sacred routine",
        subtitle = "Authentication is now backed by the live backend and persists to the device, so favorites, bookings, and videos survive app restarts.",
        badge = "Live auth",
        heroStats = listOf(
            HeroStat("Secure", "JWT session persisted"),
            HeroStat("Mongo", "Backend connected"),
        ),
        heroContent = {
            Row(horizontalArrangement = Arrangement.spacedBy(12.dp), modifier = Modifier.fillMaxWidth()) {
                Button(
                    onClick = {
                        isSubmitting = true
                        statusMessage = null
                        DivyaRuntime.trackEvent("login_started")
                        scope.launch {
                            runCatching {
                                DivyaRuntime.login(email, password)
                            }.onSuccess {
                                statusMessage = "Signed in. Restoring your temple data."
                                onOpen(DivyaRoutes.home.route)
                            }.onFailure {
                                statusMessage = it.message ?: "Login failed"
                                DivyaRuntime.reportHandledError(it, mapOf("screen" to "login"))
                            }
                            isSubmitting = false
                        }
                    },
                    enabled = !isSubmitting,
                    modifier = Modifier.weight(1f),
                ) {
                    if (isSubmitting) {
                        CircularProgressIndicator()
                    } else {
                        Text("Sign in")
                    }
                }
            }
        },
    ) {
        item {
            PanelCard(title = "Email") {
                OutlinedTextField(
                    value = email,
                    onValueChange = { email = it },
                    modifier = Modifier.fillMaxWidth(),
                    label = { Text("Email address") },
                    singleLine = true,
                )
            }
        }
        item {
            PanelCard(title = "Password") {
                OutlinedTextField(
                    value = password,
                    onValueChange = { password = it },
                    modifier = Modifier.fillMaxWidth(),
                    label = { Text("Password") },
                    singleLine = true,
                )
            }
        }
        statusMessage?.let { message ->
            item {
                StatusStrip(
                    label = "Sign-in status",
                    detail = message,
                )
            }
        }
        item {
            AccentNote(
                title = "After sign-in",
                body = "Device token registration, analytics, crash reporting, and secure video access are all tied to the stored session.",
            )
        }
    }
}
