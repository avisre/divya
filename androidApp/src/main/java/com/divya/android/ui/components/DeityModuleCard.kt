package com.divya.android.ui.components

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.material3.Button
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Surface
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp
import com.divya.android.ui.screens.AppContent
import com.divya.android.ui.screens.InfoRow
import com.divya.android.ui.theme.AlertMarigold
import com.divya.android.ui.theme.DeepBrown
import com.divya.android.ui.theme.SuccessLeaf
import com.divya.android.ui.theme.TempleGold

@Composable
fun DeityModuleCard(
    module: AppContent.DeityLearningModulePreview,
    completed: Boolean,
    onRead: () -> Unit,
) {
    val tone = when {
        completed -> SuccessLeaf
        module.locked -> AlertMarigold
        else -> TempleGold
    }

    Surface(
        modifier = Modifier.fillMaxWidth(),
        color = tone.copy(alpha = 0.10f),
        shape = MaterialTheme.shapes.medium,
        border = androidx.compose.foundation.BorderStroke(1.dp, tone.copy(alpha = 0.35f)),
    ) {
        androidx.compose.foundation.layout.Column(
            modifier = Modifier.fillMaxWidth(),
            verticalArrangement = Arrangement.spacedBy(8.dp),
        ) {
            InfoRow(
                label = if (completed) "Completed" else if (module.locked) "Locked" else "Module ${module.order}",
                value = module.title,
            )
            Row(horizontalArrangement = Arrangement.SpaceBetween, modifier = Modifier.fillMaxWidth()) {
                Text(
                    text = "${module.readMinutes} min read",
                    style = MaterialTheme.typography.bodySmall,
                    color = DeepBrown.copy(alpha = 0.74f),
                )
                Button(onClick = onRead, enabled = !module.locked) {
                    Text(if (module.locked) "Bhakt+" else if (completed) "Read again" else "Read")
                }
            }
        }
    }
}
