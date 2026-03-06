package com.divya.android.ui.components

import androidx.compose.foundation.BorderStroke
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Surface
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp
import com.divya.android.ui.theme.DeepBrown
import com.divya.android.ui.theme.Ivory
import com.divya.android.ui.theme.Saffron

@Composable
fun WaitlistStatusCard(status: String) {
    Surface(
        modifier = Modifier.fillMaxWidth(),
        color = Saffron.copy(alpha = 0.10f),
        shape = MaterialTheme.shapes.medium,
        border = BorderStroke(1.dp, Saffron.copy(alpha = 0.28f)),
    ) {
        Column(
            modifier = Modifier.padding(18.dp),
            verticalArrangement = Arrangement.spacedBy(4.dp),
        ) {
            Text(
                text = "Waitlist status",
                style = MaterialTheme.typography.labelLarge,
                color = Saffron,
            )
            Text(
                text = status,
                style = MaterialTheme.typography.bodyLarge,
                color = DeepBrown,
            )
        }
    }
}
