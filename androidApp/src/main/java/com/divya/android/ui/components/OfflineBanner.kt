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
import com.divya.android.ui.theme.Saffron

enum class OfflineBannerState {
    NetworkOffline,
    BackendUnavailable,
}

@Composable
fun OfflineBanner(state: OfflineBannerState = OfflineBannerState.NetworkOffline) {
    val title = when (state) {
        OfflineBannerState.NetworkOffline -> "Offline mode"
        OfflineBannerState.BackendUnavailable -> "Temple servers unreachable"
    }
    val body = when (state) {
        OfflineBannerState.NetworkOffline -> "You're offline \uD83D\uDE4F Your prayers and panchang are still available"
        OfflineBannerState.BackendUnavailable -> "Internet is available, but Divya cannot reach live temple updates right now."
    }

    Surface(
        modifier = Modifier.fillMaxWidth(),
        color = Saffron.copy(alpha = 0.12f),
        border = BorderStroke(1.dp, Saffron.copy(alpha = 0.35f)),
        shape = MaterialTheme.shapes.medium,
    ) {
        Column(
            modifier = Modifier.padding(18.dp),
            verticalArrangement = Arrangement.spacedBy(4.dp),
        ) {
            Text(
                text = title,
                style = MaterialTheme.typography.labelLarge,
                color = Saffron,
            )
            Text(
                text = body,
                style = MaterialTheme.typography.bodyLarge,
                color = DeepBrown,
            )
        }
    }
}
