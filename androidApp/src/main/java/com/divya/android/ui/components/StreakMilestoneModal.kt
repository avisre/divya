package com.divya.android.ui.components

import androidx.compose.material3.AlertDialog
import androidx.compose.material3.Text
import androidx.compose.material3.TextButton
import androidx.compose.runtime.Composable

@Composable
fun StreakMilestoneModal(
    visible: Boolean,
    days: Int,
    onDismiss: () -> Unit,
    onShare: () -> Unit,
) {
    if (!visible) return

    val title = when (days) {
        7 -> "7 Days of Devotion 🙏"
        21 -> "21 Days — A Sacred Habit 🪔"
        108 -> "108 Days — The Sacred Number 🕉️"
        365 -> "One Full Year of Prayer 🙏"
        else -> "$days-Day Streak Reached"
    }

    val message = when (days) {
        7 -> "You maintained one full week of sacred practice."
        21 -> "In Vedic tradition, 21 days helps establish a dharmic habit."
        108 -> "108 is a sacred number across mantra, mala, and scripture traditions."
        365 -> "A full year of devotion is a rare spiritual achievement."
        else -> "Your consistency is becoming your spiritual identity."
    }

    AlertDialog(
        onDismissRequest = onDismiss,
        title = { Text(title) },
        text = { Text(message) },
        confirmButton = {
            TextButton(onClick = onShare) {
                Text("Share")
            }
        },
        dismissButton = {
            TextButton(onClick = onDismiss) {
                Text("Close")
            }
        },
    )
}
