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
fun RegisterScreen(onOpen: (String) -> Unit) {
    val scope = rememberCoroutineScope()
    var name by rememberSaveable { mutableStateOf("Ananya Nair") }
    var email by rememberSaveable { mutableStateOf("ananya@example.com") }
    var password by rememberSaveable { mutableStateOf("Temple@123") }
    var country by rememberSaveable { mutableStateOf("US") }
    var timezone by rememberSaveable { mutableStateOf("America/New_York") }
    var isSubmitting by rememberSaveable { mutableStateOf(false) }
    var statusMessage by rememberSaveable { mutableStateOf<String?>(null) }

    ScreenScaffold(
        eyebrow = "Free account",
        title = "Save your spiritual journey",
        subtitle = "Registration now creates a real backend account, stores the session on-device, and hands off directly into onboarding.",
        badge = "Live registration",
        heroStats = listOf(
            HeroStat("JWT", "Persisted locally"),
            HeroStat("Guest mode", "Still available"),
            HeroStat("Timezone", "Required for reminders"),
        ),
        heroContent = {
            Row(horizontalArrangement = Arrangement.spacedBy(12.dp), modifier = Modifier.fillMaxWidth()) {
                Button(
                    onClick = {
                        isSubmitting = true
                        statusMessage = null
                        DivyaRuntime.trackEvent("register_started", mapOf("country" to country))
                        scope.launch {
                            runCatching {
                                DivyaRuntime.register(name, email, password, country, timezone)
                            }.onSuccess {
                                statusMessage = "Account created. Personalize your home screen next."
                                onOpen(DivyaRoutes.onboarding.route)
                            }.onFailure {
                                statusMessage = it.message ?: "Registration failed"
                                DivyaRuntime.reportHandledError(it, mapOf("screen" to "register"))
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
                        Text("Create account")
                    }
                }
            }
        },
    ) {
        item {
            PanelCard(title = "Your details") {
                OutlinedTextField(value = name, onValueChange = { name = it }, modifier = Modifier.fillMaxWidth(), label = { Text("Name") })
                OutlinedTextField(value = email, onValueChange = { email = it }, modifier = Modifier.fillMaxWidth(), label = { Text("Email") })
                OutlinedTextField(value = password, onValueChange = { password = it }, modifier = Modifier.fillMaxWidth(), label = { Text("Password") })
                OutlinedTextField(value = country, onValueChange = { country = it }, modifier = Modifier.fillMaxWidth(), label = { Text("Country code") })
                OutlinedTextField(value = timezone, onValueChange = { timezone = it }, modifier = Modifier.fillMaxWidth(), label = { Text("Timezone") })
            }
        }
        statusMessage?.let { message ->
            item {
                StatusStrip(label = "Registration status", detail = message)
            }
        }
        item {
            AccentNote(
                title = "What happens next",
                body = "Onboarding answers are saved to the backend and can later drive temple recommendations as more trusted temples are added.",
            )
        }
    }
}
