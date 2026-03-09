package com.divya.android.ui.screens

import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.material3.Button
import androidx.compose.material3.CircularProgressIndicator
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.Snackbar
import androidx.compose.material3.SnackbarHost
import androidx.compose.material3.SnackbarHostState
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.rememberCoroutineScope
import androidx.compose.runtime.saveable.rememberSaveable
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.hapticfeedback.HapticFeedbackType
import androidx.compose.ui.platform.LocalHapticFeedback
import androidx.compose.ui.semantics.contentDescription
import androidx.compose.ui.semantics.semantics
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import com.divya.android.BuildConfig
import com.divya.android.app.ContactFormRequest
import com.divya.android.app.DivyaRuntime
import com.divya.android.ui.productionDisplayName
import com.divya.android.ui.theme.AlertMarigold
import com.divya.android.ui.theme.DeepBrown
import com.divya.android.ui.theme.SuccessLeaf
import kotlinx.coroutines.launch

@Composable
fun ProfileContactScreen() {
    val categoryOptions = listOf("booking_help", "gothram_help", "technical_issue", "video_help", "general")
    val categoryLabels = mapOf(
        "booking_help" to "Booking help",
        "gothram_help" to "Gothram help",
        "technical_issue" to "Technical issue",
        "video_help" to "Video help",
        "general" to "General",
    )
    val session by DivyaRuntime.sessionState.collectAsState()
    val scope = rememberCoroutineScope()
    val haptic = LocalHapticFeedback.current
    val snackbarHostState = remember { SnackbarHostState() }
    var name by rememberSaveable {
        mutableStateOf(
            productionDisplayName(
                rawName = session.user?.name,
                fallback = "",
            ),
        )
    }
    var email by rememberSaveable { mutableStateOf(session.user?.email ?: "") }
    var category by rememberSaveable { mutableStateOf("general") }
    var subject by rememberSaveable { mutableStateOf("") }
    var message by rememberSaveable { mutableStateOf("") }
    var bookingReference by rememberSaveable { mutableStateOf("") }
    var isSubmitting by rememberSaveable { mutableStateOf(false) }
    var statusMessage by rememberSaveable { mutableStateOf<String?>(null) }

    fun validate(): String? {
        if (name.trim().length !in 2..80) return "Name must be between 2 and 80 characters."
        val emailText = email.trim()
        if (!Regex("^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$").matches(emailText)) return "Please enter a valid email address."
        if (subject.trim().length !in 5..120) return "Subject must be between 5 and 120 characters."
        if (message.trim().length !in 20..2000) return "Message must be between 20 and 2000 characters."
        return null
    }

    Box {
        ScreenScaffold(
            eyebrow = "Support",
            title = "Contact Divya Support",
            subtitle = "Share booking, gothram, or technical questions. We store your request and follow up by email.",
            badge = "Profile contact",
            heroStats = listOf(
                HeroStat("24-48h", "Typical response window"),
                HeroStat(session.user?.timezone?.ifBlank { DivyaRuntime.getDetectedTimezone() } ?: DivyaRuntime.getDetectedTimezone(), "Your timezone"),
                HeroStat("Email", "Response channel"),
                HeroStat("Tracked", "Request stored in profile"),
            ),
        ) {
            item {
                PanelCard(title = "Contact details") {
                    OutlinedTextField(
                        value = name,
                        onValueChange = { name = it },
                        modifier = Modifier.fillMaxWidth(),
                        label = { Text("Name") },
                    )
                    OutlinedTextField(
                        value = email,
                        onValueChange = { email = it },
                        modifier = Modifier.fillMaxWidth(),
                        label = { Text("Email") },
                    )
                    SelectableTagRow(
                        options = categoryOptions.mapNotNull { categoryLabels[it] },
                        selected = categoryLabels[category] ?: category,
                        onSelect = { selectedLabel ->
                            category = categoryOptions.firstOrNull { categoryLabels[it] == selectedLabel } ?: "general"
                        },
                    )
                    OutlinedTextField(
                        value = subject,
                        onValueChange = { subject = it },
                        modifier = Modifier.fillMaxWidth(),
                        label = { Text("Subject") },
                    )
                    OutlinedTextField(
                        value = message,
                        onValueChange = { message = it.take(2000) },
                        modifier = Modifier.fillMaxWidth(),
                        label = { Text("Message") },
                        minLines = 5,
                    )
                    OutlinedTextField(
                        value = bookingReference,
                        onValueChange = { bookingReference = it },
                        modifier = Modifier.fillMaxWidth(),
                        label = { Text("Booking reference (optional)") },
                    )
                    InfoRow(label = "Message length", value = "${message.length} / 2000")
                }
            }
            statusMessage?.let { messageText ->
                item {
                    AccentNote(
                        title = "Contact status",
                        body = messageText,
                    )
                }
            }
            item {
                Button(
                    onClick = {
                        haptic.performHapticFeedback(HapticFeedbackType.TextHandleMove)
                        val validationError = validate()
                        if (validationError != null) {
                            statusMessage = validationError
                            scope.launch {
                                snackbarHostState.showSnackbar(
                                    message = validationError,
                                    actionLabel = "error",
                                )
                            }
                            return@Button
                        }

                        isSubmitting = true
                        statusMessage = "Submitting request..."
                        scope.launch {
                            runCatching {
                                DivyaRuntime.submitContactForm(
                                    ContactFormRequest(
                                        name = name.trim(),
                                        email = email.trim(),
                                        category = category,
                                        subject = subject.trim(),
                                        message = message.trim(),
                                        bookingReference = bookingReference.trim().takeIf { it.isNotBlank() },
                                        appVersion = BuildConfig.VERSION_NAME,
                                    ),
                                )
                            }.onSuccess { result ->
                                isSubmitting = false
                                statusMessage = "Support request submitted. Reference ${result.requestId ?: "generated"}."
                                message = ""
                                subject = ""
                                bookingReference = ""
                                snackbarHostState.showSnackbar(
                                    message = "Support request submitted. We'll get back to you by email.",
                                    actionLabel = "success",
                                )
                            }.onFailure { error ->
                                isSubmitting = false
                                statusMessage = error.message ?: "Could not submit support request."
                                DivyaRuntime.reportHandledError(error, mapOf("screen" to "profile_contact"))
                                snackbarHostState.showSnackbar(
                                    message = "Could not submit request. Please retry.",
                                    actionLabel = "error",
                                )
                            }
                        }
                    },
                    enabled = !isSubmitting,
                    modifier = Modifier
                        .fillMaxWidth()
                        .semantics { contentDescription = "Submit support request button" },
                ) {
                    if (isSubmitting) {
                        CircularProgressIndicator()
                    } else {
                        Text("Submit request")
                    }
                }
            }
        }

        SnackbarHost(
            hostState = snackbarHostState,
            modifier = Modifier
                .align(Alignment.BottomCenter)
                .padding(16.dp),
        ) { data ->
            val isError = data.visuals.actionLabel == "error"
            Snackbar(
                containerColor = if (isError) AlertMarigold.copy(alpha = 0.2f) else SuccessLeaf.copy(alpha = 0.2f),
                contentColor = DeepBrown,
            ) {
                Text(
                    text = data.visuals.message,
                    textAlign = TextAlign.Start,
                )
            }
        }
    }
}
