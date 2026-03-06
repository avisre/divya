package com.divya.android.ui.screens

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.material3.Button
import androidx.compose.material3.CircularProgressIndicator
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
fun OnboardingScreen(onOpen: (String) -> Unit) {
    val scope = rememberCoroutineScope()
    var frequency by rememberSaveable { mutableStateOf("Rarely - I want to start") }
    var purpose by rememberSaveable { mutableStateOf("Stay connected to my roots") }
    var tradition by rememberSaveable { mutableStateOf("Shaktism") }
    var saving by rememberSaveable { mutableStateOf(false) }
    var statusMessage by rememberSaveable { mutableStateOf<String?>(null) }

    ScreenScaffold(
        eyebrow = "3-question quiz",
        title = "Personalize the first week",
        subtitle = "The onboarding flow now persists to the backend so home recommendations, reminders, and future multi-temple discovery can build on a real profile.",
        badge = "Saved to backend",
        heroStats = listOf(
            HeroStat("3 steps", "Short flow"),
            HeroStat("Shaktism", "Pre-selected"),
            HeroStat("Real profile", "Stored server-side"),
        ),
        heroContent = {
            Row(horizontalArrangement = Arrangement.spacedBy(12.dp), modifier = Modifier.fillMaxWidth()) {
                Button(
                    onClick = {
                        saving = true
                        statusMessage = null
                        scope.launch {
                            runCatching {
                                DivyaRuntime.saveOnboarding(
                                    prayerFrequency = frequencyKey(frequency),
                                    purpose = purposeKey(purpose),
                                    tradition = traditionKey(tradition),
                                )
                            }.onSuccess {
                                statusMessage = "Your home screen is personalized."
                                onOpen(DivyaRoutes.home.route)
                            }.onFailure {
                                statusMessage = it.message ?: "Could not save onboarding"
                                DivyaRuntime.reportHandledError(it, mapOf("screen" to "onboarding"))
                            }
                            saving = false
                        }
                    },
                    enabled = !saving,
                    modifier = Modifier.weight(1f),
                ) {
                    if (saving) {
                        CircularProgressIndicator()
                    } else {
                        Text("Continue")
                    }
                }
            }
        },
    ) {
        item {
            PanelCard(title = "Question 1", subtitle = "How often do you currently pray?") {
                SelectableTagRow(
                    options = listOf("Every day", "A few times a week", "Rarely - I want to start", "I'm just exploring"),
                    selected = frequency,
                    onSelect = { frequency = it },
                )
            }
        }
        item {
            PanelCard(title = "Question 2", subtitle = "What brings you to Divya?") {
                SelectableTagRow(
                    options = listOf("Stay connected to my roots", "Learn more about Hinduism", "Book pujas for my family", "Build a daily spiritual practice"),
                    selected = purpose,
                    onSelect = { purpose = it },
                )
            }
        }
        item {
            PanelCard(title = "Question 3", subtitle = "Which tradition feels closest to you?") {
                SelectableTagRow(
                    options = listOf("Vaishnavism", "Shaivism", "Shaktism", "Smarta", "Not sure yet"),
                    selected = tradition,
                    onSelect = { tradition = it },
                )
            }
        }
        item {
            StatusStrip(
                label = "Preview of your home feed",
                detail = "$purpose - $tradition prayers first - Morning reminders tuned for $frequency practice",
            )
        }
        statusMessage?.let { message ->
            item {
                AccentNote(title = "Save status", body = message)
            }
        }
    }
}

private fun frequencyKey(label: String): String {
    return when (label) {
        "Every day" -> "daily"
        "A few times a week" -> "sometimes"
        "Rarely - I want to start" -> "rarely"
        else -> "exploring"
    }
}

private fun purposeKey(label: String): String {
    return when (label) {
        "Stay connected to my roots" -> "roots"
        "Learn more about Hinduism" -> "learn"
        "Book pujas for my family" -> "book_pujas"
        else -> "daily_practice"
    }
}

private fun traditionKey(label: String): String {
    return when (label) {
        "Vaishnavism" -> "vaishnava"
        "Shaivism" -> "shaiva"
        "Shaktism" -> "shakta"
        "Smarta" -> "smarta"
        else -> "not_sure"
    }
}
