package com.divya.android.ui.screens

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.material3.Button
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
import androidx.compose.ui.platform.LocalHapticFeedback
import androidx.compose.ui.semantics.contentDescription
import androidx.compose.ui.semantics.semantics
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import com.divya.android.app.DivyaRuntime
import com.divya.android.app.UserStreakSummary
import com.divya.android.navigation.DivyaRoutes
import com.divya.android.ui.components.UpgradePromptSheet
import com.divya.android.ui.theme.AlertMarigold
import com.divya.android.ui.theme.DeepBrown
import com.divya.android.ui.theme.SuccessLeaf
import kotlinx.coroutines.launch

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

    LaunchedEffect(Unit) {
        runCatching { DivyaRuntime.fetchStreak() }.onSuccess { liveStreak = it }
    }

    Box {
        ScreenScaffold(
            eyebrow = "Devotee profile",
            title = "Prayer routine and identity",
            subtitle = "Manage reminders, account details, and support in one calmer profile space.",
            badge = session.user?.let { if (it.isGuest) "Guest session" else "Signed in" } ?: "Offline",
            heroStats = listOf(
                HeroStat(
                    if ((liveStreak?.current ?: 0) > 0) "${liveStreak?.current} days" else "Not started",
                    "Current streak",
                ),
                HeroStat(session.user?.timezone ?: "EST", "Primary timezone"),
                HeroStat("English", "Primary language"),
                HeroStat("Morning + evening", "Reminder cadence"),
            ),
        ) {
            item { DividerLabel("Account") }

            item {
                PanelCard(title = "Account details", subtitle = "Keep identity and location visible without burying settings.") {
                    InfoRow(label = "Name", value = session.user?.name ?: "Guest Devotee")
                    InfoRow(label = "Email", value = session.user?.email ?: "Guest session")
                    InfoRow(label = "Country", value = session.user?.country ?: "US")
                    InfoRow(label = "Timezone", value = session.user?.timezone ?: "America/New_York")
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
                        Text("Sign out and return to guest mode")
                    }
                }
            }

            item { DividerLabel("Reminders") }

            item {
                PanelCard(title = "Reminder settings", subtitle = "Tune prayer windows in your own timezone and keep the feedback explicit.") {
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
                    TextBlock("Windows are evaluated in your timezone: ${session.user?.timezone ?: "America/New_York"}")
                    Button(
                        onClick = {
                            haptic.performHapticFeedback(HapticFeedbackType.TextHandleMove)
                            statusMessage = "Saving reminder settings..."
                            scope.launch {
                                runCatching {
                                    DivyaRuntime.updateReminderSettings(
                                        timezone = session.user?.timezone ?: "America/New_York",
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
                                    statusMessage = "Reminder settings synced to the backend."
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
                PanelCard(title = "Support and contact", subtitle = "Keep help visible, but secondary to prayer and reminder management.") {
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
                PanelCard(title = "Heritage settings", subtitle = "Language stays English-first while still respecting prayer tradition and script depth.") {
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
    }
}

@Composable
private fun ReminderToggle(
    label: String,
    summary: String,
    checked: Boolean,
    onCheckedChange: (Boolean) -> Unit,
) {
    Row(
        modifier = Modifier.fillMaxWidth(),
        horizontalArrangement = Arrangement.SpaceBetween,
        verticalAlignment = Alignment.CenterVertically,
    ) {
        InfoRow(label = label, value = summary)
        Switch(checked = checked, onCheckedChange = onCheckedChange)
    }
}
