package com.divya.android.ui.components

import androidx.compose.foundation.BorderStroke
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.OutlinedButton
import androidx.compose.material3.Surface
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.saveable.rememberSaveable
import androidx.compose.runtime.setValue
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp
import com.divya.android.ui.screens.AppContent
import com.divya.android.ui.screens.InfoRow
import com.divya.android.ui.screens.SelectableTagRow
import com.divya.android.ui.screens.StatusPill
import com.divya.android.ui.theme.Clay
import com.divya.android.ui.theme.DeepBrown
import com.divya.android.ui.theme.Saffron
import com.divya.android.ui.theme.TempleGold
import com.divya.android.ui.theme.WhiteSmoke
import com.divya.data.models.Panchang
import java.time.Instant
import java.time.ZoneId
import java.time.format.DateTimeFormatter
import java.util.Locale

@Composable
fun PanchangCard(
    panchang: Panchang,
    guidance: AppContent.PanchangGuidance? = null,
) {
    var tab by rememberSaveable { mutableStateOf("Panchang") }
    var showInfo by rememberSaveable { mutableStateOf(false) }
    Surface(
        modifier = Modifier.fillMaxWidth(),
        color = WhiteSmoke.copy(alpha = 0.98f),
        shape = MaterialTheme.shapes.medium,
        border = BorderStroke(1.dp, Clay.copy(alpha = 0.8f)),
    ) {
        Column(
            modifier = Modifier.padding(20.dp),
            verticalArrangement = Arrangement.spacedBy(14.dp),
        ) {
            Row(horizontalArrangement = Arrangement.SpaceBetween, modifier = Modifier.fillMaxWidth()) {
                Column(verticalArrangement = Arrangement.spacedBy(4.dp), modifier = Modifier.weight(1f)) {
                    Text(
                        text = "Today's Panchang",
                        style = MaterialTheme.typography.titleLarge,
                        color = TempleGold,
                    )
                    Text(
                        text = "Local timezone + IST secondary view from Karunagapally reference calculations.",
                        style = MaterialTheme.typography.bodyMedium,
                        color = DeepBrown.copy(alpha = 0.75f),
                    )
                }
                Column(verticalArrangement = Arrangement.spacedBy(8.dp)) {
                    StatusPill(label = "Temple-based", color = Saffron)
                    OutlinedButton(onClick = { showInfo = !showInfo }) {
                        Text(if (showInfo) "Hide info" else "ⓘ Info")
                    }
                }
            }
            if (guidance != null) {
                SelectableTagRow(
                    options = listOf("Panchang", "Guidance"),
                    selected = tab,
                    onSelect = { tab = it },
                )
            }

            if (showInfo) {
                Surface(
                    color = TempleGold.copy(alpha = 0.10f),
                    shape = MaterialTheme.shapes.small,
                ) {
                    Column(
                        modifier = Modifier.padding(16.dp),
                        verticalArrangement = Arrangement.spacedBy(6.dp),
                    ) {
                        Text(
                            text = "About this Panchang",
                            style = MaterialTheme.typography.titleMedium,
                            color = DeepBrown,
                        )
                        Text(
                            text = guidance?.infoText
                                ?: panchang.infoTooltip
                                ?: "Panchang timings are referenced from Karunagapally, Kerala and converted to your local timezone.",
                            style = MaterialTheme.typography.bodyMedium,
                            color = DeepBrown.copy(alpha = 0.85f),
                        )
                    }
                }
            }

            if (tab == "Panchang" || guidance == null) {
                Row(horizontalArrangement = Arrangement.spacedBy(20.dp), modifier = Modifier.fillMaxWidth()) {
                    Column(modifier = Modifier.weight(1f), verticalArrangement = Arrangement.spacedBy(12.dp)) {
                        InfoRow(label = "Tithi", value = "${panchang.tithi.name} | ${panchang.tithi.paksha}")
                        InfoRow(label = "Nakshatra", value = "${panchang.nakshatra.name} | ${panchang.nakshatra.deity}")
                    }
                    Column(modifier = Modifier.weight(1f), verticalArrangement = Arrangement.spacedBy(12.dp)) {
                        InfoRow(
                            label = "Sunrise",
                            value = "${panchang.sunriseLocal ?: "--"} (IST ${formatIstFromUtc(panchang.sunriseUtc)})",
                        )
                        InfoRow(
                            label = "Sunset",
                            value = "${panchang.sunsetLocal ?: "--"} (IST ${formatIstFromUtc(panchang.sunsetUtc)})",
                        )
                    }
                }
                Surface(
                    color = Saffron.copy(alpha = 0.10f),
                    shape = MaterialTheme.shapes.small,
                ) {
                    Column(
                        modifier = Modifier.padding(16.dp),
                        verticalArrangement = Arrangement.spacedBy(4.dp),
                    ) {
                        Text(
                            text = "Rahu Kaal warning",
                            style = MaterialTheme.typography.labelLarge,
                            color = Saffron,
                        )
                        Text(
                            text = "${panchang.rahuKaalStartLocal ?: "--"} to ${panchang.rahuKaalEndLocal ?: "--"}",
                            style = MaterialTheme.typography.bodyLarge,
                            color = DeepBrown,
                        )
                        Text(
                            text = "IST ${formatIstFromUtc(panchang.rahuKaalStartUtc)} to ${formatIstFromUtc(panchang.rahuKaalEndUtc)}",
                            style = MaterialTheme.typography.bodySmall,
                            color = DeepBrown.copy(alpha = 0.75f),
                        )
                    }
                }
            }
            if (tab == "Guidance" && guidance != null) {
                Surface(
                    color = TempleGold.copy(alpha = 0.10f),
                    shape = MaterialTheme.shapes.small,
                ) {
                    Column(
                        modifier = Modifier.padding(16.dp),
                        verticalArrangement = Arrangement.spacedBy(8.dp),
                    ) {
                        Text(
                            text = guidance.overall,
                            style = MaterialTheme.typography.titleMedium,
                            color = DeepBrown,
                        )
                        Text(
                            text = "Good for: ${guidance.goodFor.joinToString()}",
                            style = MaterialTheme.typography.bodyMedium,
                            color = DeepBrown,
                        )
                        Text(
                            text = "Avoid: ${guidance.avoidFor.joinToString()}",
                            style = MaterialTheme.typography.bodyMedium,
                            color = DeepBrown,
                        )
                        Text(
                            text = "Best window: ${guidance.window}",
                            style = MaterialTheme.typography.bodyMedium,
                            color = DeepBrown,
                        )
                    }
                }
            }
            Text(
                text = if (showInfo) "Tap the info pill again to close details." else "Tap the info pill to read the Panchang reference note.",
                style = MaterialTheme.typography.bodySmall,
                color = DeepBrown.copy(alpha = 0.65f),
            )
        }
    }
}

private fun formatIstFromUtc(utcIso: String?): String {
    if (utcIso.isNullOrBlank()) return "--"
    return runCatching {
        val instant = Instant.parse(utcIso)
        val formatter = DateTimeFormatter.ofPattern("h:mm a", Locale.US)
        formatter.format(instant.atZone(ZoneId.of("Asia/Kolkata")))
    }.getOrDefault("--")
}
