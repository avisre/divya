package com.divya.android.ui.screens

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.material3.Button
import androidx.compose.material3.ExperimentalMaterial3Api
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.ModalBottomSheet
import androidx.compose.material3.OutlinedButton
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.Snackbar
import androidx.compose.material3.SnackbarHost
import androidx.compose.material3.SnackbarHostState
import androidx.compose.material3.Switch
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
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
import androidx.compose.ui.platform.LocalConfiguration
import androidx.compose.ui.platform.LocalHapticFeedback
import androidx.compose.ui.semantics.contentDescription
import androidx.compose.ui.semantics.semantics
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import com.divya.android.app.DivyaRuntime
import com.divya.android.app.UserStreakSummary
import com.divya.android.navigation.DivyaRoutes
import com.divya.android.ui.productionDisplayName
import com.divya.android.ui.components.UpgradePromptSheet
import com.divya.android.ui.theme.AlertMarigold
import com.divya.android.ui.theme.DeepBrown
import com.divya.android.ui.theme.SuccessLeaf
import java.util.TimeZone
import kotlinx.coroutines.launch

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun ProfileScreen(onOpen: (String) -> Unit) {
    val scope = rememberCoroutineScope()
    val session by DivyaRuntime.sessionState.collectAsState()
    val haptic = LocalHapticFeedback.current
    val snackbarHostState = remember { SnackbarHostState() }
    var morningEnabled by rememberSaveable { mutableStateOf(true) }
    var eveningEnabled by rememberSaveable { mutableStateOf(true) }
    var festivalEnabled by rememberSaveable { mutableStateOf(true) }
    var weekdayWindow by rememberSaveable { mutableStateOf("6:30 AM - 8:00 AM") }
    var weekendWindow by rememberSaveable { mutableStateOf("7:00 AM - 9:00 AM") }
    var statusMessage by rememberSaveable { mutableStateOf<String?>(null) }
    var liveStreak by remember { mutableStateOf<UserStreakSummary?>(null) }
    var showTimezonePicker by rememberSaveable { mutableStateOf(false) }
    var timezoneQuery by rememberSaveable { mutableStateOf("") }
    val allTimezones = remember { TimeZone.getAvailableIDs().distinct().sorted() }
    val savedTimezone = session.user?.timezone.orEmpty()
    val detectedTimezone = DivyaRuntime.getDetectedTimezone()
    val effectiveTimezone = savedTimezone.ifBlank { detectedTimezone }
    val timezoneSourceLabel = if (savedTimezone.isBlank()) "Detected from device" else "Set by you"
    val filteredTimezones = remember(timezoneQuery, allTimezones) {
        if (timezoneQuery.isBlank()) {
            allTimezones
        } else {
            allTimezones.filter { it.contains(timezoneQuery.trim(), ignoreCase = true) }
        }
    }

    LaunchedEffect(Unit) {
        runCatching { DivyaRuntime.fetchStreak() }.onSuccess { liveStreak = it }
    }

    Box {
        ScreenScaffold(
            eyebrow = "Devotee profile",
            title = "Manage your profile",
            subtitle = "Keep your reminders, account details, timezone, and support options in one place.",
            badge = session.user?.let { if (it.isGuest) "Guest session" else "Signed in" } ?: "Offline",
            heroStats = listOf(
                HeroStat(
                    if ((liveStreak?.current ?: 0) > 0) "${liveStreak?.current} days" else "Not started",
                    "Current streak",
                ),
                HeroStat(effectiveTimezone, "Primary timezone"),
                HeroStat("English", "Primary language"),
                HeroStat("Morning + evening", "Reminder cadence"),
            ),
        ) {
            item { DividerLabel("Account") }

            item {
                PanelCard(title = "Account details", subtitle = "Review your identity, location, and preferred devotional context.") {
                    InfoRow(
                        label = "Name",
                        value = productionDisplayName(
                            rawName = session.user?.name,
                            fallback = "Guest Devotee",
                        ),
                    )
                    InfoRow(label = "Email", value = session.user?.email ?: "Guest session")
                    InfoRow(label = "Country", value = session.user?.country ?: "US")
                    InfoRow(label = "Timezone", value = effectiveTimezone)
                    Text(
                        text = timezoneSourceLabel,
                        style = MaterialTheme.typography.bodySmall,
                        color = DeepBrown.copy(alpha = 0.56f),
                    )
                    OutlinedButton(
                        onClick = {
                            haptic.performHapticFeedback(HapticFeedbackType.TextHandleMove)
                            showTimezonePicker = true
                        },
                        modifier = Modifier.fillMaxWidth(),
                    ) {
                        Text("Change timezone")
                    }
                    InfoRow(
                        label = "Preferred deity",
                        value = AppContent.bhagavathi.name.en,
                    )
                    InfoRow(
                        label = "Tradition",
                        value = AppContent.bhagavathi.tradition,
                    )
                    Button(
                        onClick = { DivyaRuntime.signOut() },
                        modifier = Modifier.fillMaxWidth(),
                    ) {
                        Text("Logout")
                    }
                }
            }

            item { DividerLabel("Reminders") }

            item {
                PanelCard(title = "Reminder settings", subtitle = "Choose the prayer windows that fit your day.") {
                    ReminderToggle(label = "Morning prayer", summary = "7:00 AM local time", checked = morningEnabled, onCheckedChange = { morningEnabled = it })
                    ReminderToggle(label = "Evening aarti", summary = "7:00 PM local time", checked = eveningEnabled, onCheckedChange = { eveningEnabled = it })
                    ReminderToggle(label = "Festival alerts", summary = "Key temple dates", checked = festivalEnabled, onCheckedChange = { festivalEnabled = it })
                    SelectableTagRow(
                        options = listOf("6:00 AM - 7:30 AM", "6:30 AM - 8:00 AM", "7:00 AM - 8:30 AM"),
                        selected = weekdayWindow,
                        onSelect = { weekdayWindow = it },
                    )
                    SelectableTagRow(
                        options = listOf("7:00 AM - 9:00 AM", "8:00 AM - 10:00 AM", "Flexible"),
                        selected = weekendWindow,
                        onSelect = { weekendWindow = it },
                    )
                    TextBlock("Reminder windows use your timezone: $effectiveTimezone")
                    Button(
                        onClick = {
                            haptic.performHapticFeedback(HapticFeedbackType.TextHandleMove)
                            statusMessage = "Saving reminder settings..."
                            scope.launch {
                                runCatching {
                                    DivyaRuntime.updateReminderSettings(
                                        morningEnabled = morningEnabled,
                                        eveningEnabled = eveningEnabled,
                                        festivalAlerts = festivalEnabled,
                                    )
                                    DivyaRuntime.trackEvent(
                                        "reminder_window_tuned",
                                        mapOf(
                                            "weekday_window" to weekdayWindow,
                                            "weekend_window" to weekendWindow,
                                        ),
                                    )
                                }.onSuccess {
                                    statusMessage = "Reminder settings saved."
                                    snackbarHostState.showSnackbar(
                                        message = "Reminder settings saved.",
                                        actionLabel = "success",
                                    )
                                }.onFailure {
                                    statusMessage = it.message ?: "Could not save reminder settings"
                                    DivyaRuntime.reportHandledError(it, mapOf("screen" to "profile"))
                                    snackbarHostState.showSnackbar(
                                        message = "Could not save settings. Please retry.",
                                        actionLabel = "error",
                                    )
                                }
                            }
                        },
                        modifier = Modifier
                            .fillMaxWidth()
                            .semantics { contentDescription = "Save reminder settings button" },
                    ) {
                        Text("Save reminder settings")
                    }
                }
            }

            item { DividerLabel("Support") }

            item {
                PanelCard(title = "Support and contact", subtitle = "Reach support quickly for booking, gothram, or technical help.") {
                    TextBlock("Need help with booking, gothram, or technical issues? Contact Divya support.")
                    Button(
                        onClick = {
                            haptic.performHapticFeedback(HapticFeedbackType.TextHandleMove)
                            onOpen(DivyaRoutes.profileContact.route)
                        },
                        modifier = Modifier
                            .fillMaxWidth()
                            .semantics { contentDescription = "Contact Divya Support button" },
                    ) {
                        Text("Contact Divya Support")
                    }
                }
            }

            item { DividerLabel("Heritage") }

            item {
                PanelCard(title = "Language and tradition", subtitle = "Review the language and devotional context currently guiding the app.") {
                    InfoRow(label = "Language model", value = "English-first with Sanskrit and regional script support where appropriate")
                    InfoRow(label = "Streak", value = if ((liveStreak?.current ?: 0) > 0) "${liveStreak?.current} days current" else "Begin today")
                    InfoRow(label = "Longest streak", value = "${liveStreak?.longest ?: 0} days")
                }
            }

            statusMessage?.let { message ->
                item {
                    AccentNote(title = "Profile status", body = message)
                }
            }

            item { UpgradePromptSheet() }
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

        if (showTimezonePicker) {
            ModalBottomSheet(
                onDismissRequest = { showTimezonePicker = false },
            ) {
                Box(modifier = Modifier.padding(horizontal = 20.dp, vertical = 12.dp)) {
                    LazyColumn(verticalArrangement = Arrangement.spacedBy(12.dp)) {
                        item {
                            Text(
                                text = "Change timezone",
                                style = MaterialTheme.typography.titleLarge,
                                color = DeepBrown,
                            )
                        }
                        item {
                            OutlinedTextField(
                                value = timezoneQuery,
                                onValueChange = { timezoneQuery = it },
                                modifier = Modifier.fillMaxWidth(),
                                label = { Text("Search timezone") },
                            )
                        }
                        items(filteredTimezones) { timezoneId ->
                            OutlinedButton(
                                onClick = {
                                    haptic.performHapticFeedback(HapticFeedbackType.TextHandleMove)
                                    statusMessage = "Saving timezone..."
                                    scope.launch {
                                        runCatching {
                                            DivyaRuntime.updateTimezone(timezoneId)
                                        }.onSuccess {
                                            statusMessage = "Timezone updated."
                                            timezoneQuery = ""
                                            showTimezonePicker = false
                                            snackbarHostState.showSnackbar(
                                                message = "Timezone updated.",
                                                actionLabel = "success",
                                            )
                                        }.onFailure {
                                            statusMessage = it.message ?: "Could not update timezone"
                                            snackbarHostState.showSnackbar(
                                                message = "Could not update timezone. Please retry.",
                                                actionLabel = "error",
                                            )
                                        }
                                    }
                                },
                                modifier = Modifier.fillMaxWidth(),
                            ) {
                                Text(timezoneId, textAlign = TextAlign.Start, modifier = Modifier.fillMaxWidth())
                            }
                        }
                    }
                }
            }
        }
    }
}

@Composable
private fun ReminderToggle(
    label: String,
    summary: String,
    checked: Boolean,
    onCheckedChange: (Boolean) -> Unit,
) {
    val isCompactPhone = LocalConfiguration.current.screenWidthDp < 380
    if (isCompactPhone) {
        Box(modifier = Modifier.fillMaxWidth()) {
            Column(verticalArrangement = Arrangement.spacedBy(10.dp)) {
                InfoRow(label = label, value = summary)
                Switch(checked = checked, onCheckedChange = onCheckedChange)
            }
        }
    } else {
        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.SpaceBetween,
            verticalAlignment = Alignment.CenterVertically,
        ) {
            InfoRow(label = label, value = summary)
            Switch(checked = checked, onCheckedChange = onCheckedChange)
        }
    }
}
