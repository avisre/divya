package com.divya.android.ui.screens

import androidx.compose.foundation.BorderStroke
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.horizontalScroll
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.ColumnScope
import androidx.compose.foundation.layout.PaddingValues
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.LazyListScope
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.FilterChip
import androidx.compose.material3.FilterChipDefaults
import androidx.compose.material3.HorizontalDivider
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Surface
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.testTag
import androidx.compose.ui.unit.dp
import com.divya.android.ui.theme.AlertMarigold
import com.divya.android.ui.theme.Clay
import com.divya.android.ui.theme.DeepBrown
import com.divya.android.ui.theme.Dusk
import com.divya.android.ui.theme.Ivory
import com.divya.android.ui.theme.LampGlow
import com.divya.android.ui.theme.Saffron
import com.divya.android.ui.theme.Sand
import com.divya.android.ui.theme.SoftRose
import com.divya.android.ui.theme.SuccessLeaf
import com.divya.android.ui.theme.TempleGold
import com.divya.android.ui.theme.WarmBackground

data class HeroStat(
    val value: String,
    val label: String,
)

@Composable
fun ScreenScaffold(
    title: String,
    subtitle: String,
    eyebrow: String = "Divya",
    badge: String? = null,
    heroStats: List<HeroStat> = emptyList(),
    heroContent: @Composable ColumnScope.() -> Unit = {},
    content: LazyListScope.() -> Unit,
) {
    Box(
        modifier = Modifier
            .fillMaxSize()
            .background(
                Brush.verticalGradient(
                    colors = listOf(SoftRose, WarmBackground, Ivory),
                ),
            ),
    ) {
        AtmosphericBackdrop()
        LazyColumn(
            modifier = Modifier
                .fillMaxSize()
                .testTag("screen_scaffold_list"),
            contentPadding = PaddingValues(horizontal = 20.dp, vertical = 18.dp),
            verticalArrangement = Arrangement.spacedBy(16.dp),
        ) {
            item {
                HeroCard(
                    eyebrow = eyebrow,
                    title = title,
                    subtitle = subtitle,
                    badge = badge,
                    heroStats = heroStats,
                    content = heroContent,
                )
            }
            content()
            item { Spacer(modifier = Modifier.height(12.dp)) }
        }
    }
}

@Composable
private fun AtmosphericBackdrop() {
    Box(
        modifier = Modifier
            .fillMaxSize()
            .padding(top = 8.dp),
    ) {
        Box(
            modifier = Modifier
                .align(Alignment.TopEnd)
                .size(220.dp)
                .clip(CircleShape)
                .background(LampGlow.copy(alpha = 0.16f)),
        )
        Box(
            modifier = Modifier
                .align(Alignment.TopStart)
                .padding(top = 120.dp)
                .size(140.dp)
                .clip(CircleShape)
                .background(Saffron.copy(alpha = 0.10f)),
        )
        Box(
            modifier = Modifier
                .align(Alignment.BottomStart)
                .padding(bottom = 72.dp)
                .size(width = 260.dp, height = 120.dp)
                .clip(RoundedCornerShape(topEnd = 120.dp))
                .background(TempleGold.copy(alpha = 0.08f)),
        )
    }
}

@Composable
private fun HeroCard(
    eyebrow: String,
    title: String,
    subtitle: String,
    badge: String?,
    heroStats: List<HeroStat>,
    content: @Composable ColumnScope.() -> Unit,
) {
    Box(
        modifier = Modifier
            .fillMaxWidth()
            .clip(RoundedCornerShape(32.dp))
            .background(
                Brush.linearGradient(
                    colors = listOf(Color(0xFFFCE7D2), Color(0xFFF7DAB9), Color(0xFFFCEFE2)),
                ),
            )
            .border(
                border = BorderStroke(1.dp, TempleGold.copy(alpha = 0.35f)),
                shape = RoundedCornerShape(32.dp),
            )
            .padding(24.dp),
    ) {
        Column(verticalArrangement = Arrangement.spacedBy(16.dp)) {
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically,
            ) {
                Column(verticalArrangement = Arrangement.spacedBy(6.dp)) {
                    Text(
                        text = eyebrow.uppercase(),
                        style = MaterialTheme.typography.labelMedium,
                        color = Dusk,
                    )
                    if (badge != null) {
                        StatusPill(label = badge)
                    }
                }
                Box(
                    modifier = Modifier
                        .size(70.dp)
                        .clip(CircleShape)
                        .background(
                            Brush.radialGradient(
                                colors = listOf(LampGlow.copy(alpha = 0.95f), Saffron.copy(alpha = 0.18f)),
                            ),
                        ),
                    contentAlignment = Alignment.Center,
                ) {
                    Text(
                        text = "Om",
                        style = MaterialTheme.typography.headlineMedium,
                        color = DeepBrown,
                    )
                }
            }
            Text(
                text = title,
                style = MaterialTheme.typography.headlineLarge,
                color = DeepBrown,
            )
            Text(
                text = subtitle,
                style = MaterialTheme.typography.bodyMedium,
                color = Dusk,
            )
            if (heroStats.isNotEmpty()) {
                HorizontalDivider(color = Clay.copy(alpha = 0.55f))
                MetricsRow(stats = heroStats)
            }
            content()
        }
    }
}

@Composable
fun MetricsRow(stats: List<HeroStat>) {
    Column(verticalArrangement = Arrangement.spacedBy(10.dp)) {
        stats.chunked(2).forEach { row ->
            Row(horizontalArrangement = Arrangement.spacedBy(10.dp)) {
                row.forEach { stat ->
                    Surface(
                        modifier = Modifier.weight(1f),
                        color = Ivory.copy(alpha = 0.82f),
                        shape = RoundedCornerShape(22.dp),
                        border = BorderStroke(1.dp, Clay.copy(alpha = 0.8f)),
                    ) {
                        Column(
                            modifier = Modifier.padding(horizontal = 16.dp, vertical = 14.dp),
                            verticalArrangement = Arrangement.spacedBy(4.dp),
                        ) {
                            Text(
                                text = stat.value,
                                style = MaterialTheme.typography.titleLarge,
                                color = DeepBrown,
                            )
                            Text(
                                text = stat.label,
                                style = MaterialTheme.typography.bodySmall,
                                color = Dusk,
                            )
                        }
                    }
                }
                if (row.size == 1) {
                    Spacer(modifier = Modifier.weight(1f))
                }
            }
        }
    }
}

@Composable
fun PanelCard(
    title: String,
    modifier: Modifier = Modifier,
    subtitle: String? = null,
    accent: Color = Saffron,
    content: @Composable ColumnScope.() -> Unit = {},
) {
    Surface(
        modifier = modifier.fillMaxWidth(),
        color = Ivory.copy(alpha = 0.96f),
        shape = RoundedCornerShape(28.dp),
        tonalElevation = 0.dp,
        shadowElevation = 0.dp,
        border = BorderStroke(1.dp, Clay.copy(alpha = 0.7f)),
    ) {
        Column(
            modifier = Modifier
                .fillMaxWidth()
                .padding(20.dp),
            verticalArrangement = Arrangement.spacedBy(14.dp),
        ) {
            Column(verticalArrangement = Arrangement.spacedBy(6.dp)) {
                Text(
                    text = title,
                    style = MaterialTheme.typography.titleLarge,
                    color = accent,
                )
                if (subtitle != null) {
                    Text(
                        text = subtitle,
                        style = MaterialTheme.typography.bodyMedium,
                        color = Dusk,
                    )
                }
            }
            HorizontalDivider(color = Clay.copy(alpha = 0.5f))
            content()
        }
    }
}

@Composable
fun SectionCard(
    title: String,
    body: String,
) {
    PanelCard(title = title) {
        Text(text = body, style = MaterialTheme.typography.bodyLarge, color = DeepBrown)
    }
}

@Composable
fun InfoRow(
    label: String,
    value: String,
    highlight: Color = DeepBrown,
) {
    Column(verticalArrangement = Arrangement.spacedBy(2.dp)) {
        Text(
            text = label.uppercase(),
            style = MaterialTheme.typography.labelMedium,
            color = Dusk,
        )
        Text(
            text = value,
            style = MaterialTheme.typography.bodyLarge,
            color = highlight,
        )
    }
}

@Composable
fun BulletList(items: List<String>) {
    Column(verticalArrangement = Arrangement.spacedBy(10.dp)) {
        items.forEach { item ->
            Row(
                horizontalArrangement = Arrangement.spacedBy(10.dp),
                verticalAlignment = Alignment.Top,
            ) {
                Box(
                    modifier = Modifier
                        .padding(top = 7.dp)
                        .size(8.dp)
                        .clip(CircleShape)
                        .background(TempleGold),
                )
                Text(
                    text = item,
                    modifier = Modifier.weight(1f),
                    style = MaterialTheme.typography.bodyLarge,
                    color = DeepBrown,
                )
            }
        }
    }
}

@Composable
fun TagRow(tags: List<String>, modifier: Modifier = Modifier) {
    Row(
        modifier = modifier.horizontalScroll(rememberScrollState()),
        horizontalArrangement = Arrangement.spacedBy(8.dp),
    ) {
        tags.forEach { tag ->
            Surface(
                color = Sand,
                shape = RoundedCornerShape(999.dp),
                border = BorderStroke(1.dp, Clay.copy(alpha = 0.8f)),
            ) {
                Text(
                    text = tag,
                    modifier = Modifier.padding(horizontal = 12.dp, vertical = 8.dp),
                    style = MaterialTheme.typography.labelLarge,
                    color = DeepBrown,
                )
            }
        }
    }
}

@Composable
fun SelectableTagRow(
    options: List<String>,
    selected: String,
    onSelect: (String) -> Unit,
    modifier: Modifier = Modifier,
) {
    Row(
        modifier = modifier.horizontalScroll(rememberScrollState()),
        horizontalArrangement = Arrangement.spacedBy(8.dp),
    ) {
        options.forEach { option ->
            FilterChip(
                selected = selected == option,
                onClick = { onSelect(option) },
                label = { Text(option) },
                colors = FilterChipDefaults.filterChipColors(
                    selectedContainerColor = Saffron.copy(alpha = 0.16f),
                    selectedLabelColor = DeepBrown,
                    containerColor = Ivory.copy(alpha = 0.92f),
                    labelColor = Dusk,
                ),
                border = FilterChipDefaults.filterChipBorder(
                    enabled = true,
                    selected = selected == option,
                    borderColor = Clay.copy(alpha = 0.85f),
                    selectedBorderColor = TempleGold.copy(alpha = 0.55f),
                    borderWidth = 1.dp,
                    selectedBorderWidth = 1.dp,
                ),
            )
        }
    }
}

@Composable
fun TimelineCard(
    title: String,
    body: String,
    phase: String,
) {
    PanelCard(title = phase, accent = TempleGold) {
        Text(text = title, style = MaterialTheme.typography.titleMedium, color = DeepBrown)
        Text(text = body, style = MaterialTheme.typography.bodyMedium, color = Dusk)
    }
}

@Composable
fun StatusPill(label: String, color: Color = Saffron) {
    Surface(
        color = color.copy(alpha = 0.14f),
        border = BorderStroke(1.dp, color.copy(alpha = 0.35f)),
        shape = RoundedCornerShape(999.dp),
    ) {
        Text(
            text = label,
            modifier = Modifier.padding(horizontal = 12.dp, vertical = 8.dp),
            style = MaterialTheme.typography.labelLarge,
            color = color,
        )
    }
}

@Composable
fun StatusStrip(
    label: String,
    detail: String,
    color: Color = SuccessLeaf,
) {
    Surface(
        modifier = Modifier.fillMaxWidth(),
        color = color.copy(alpha = 0.10f),
        border = BorderStroke(1.dp, color.copy(alpha = 0.25f)),
        shape = RoundedCornerShape(24.dp),
    ) {
        Column(
            modifier = Modifier.padding(horizontal = 18.dp, vertical = 16.dp),
            verticalArrangement = Arrangement.spacedBy(4.dp),
        ) {
            Text(
                text = label,
                style = MaterialTheme.typography.labelLarge,
                color = color,
            )
            Text(
                text = detail,
                style = MaterialTheme.typography.bodyLarge,
                color = DeepBrown,
            )
        }
    }
}

@Composable
fun DividerLabel(label: String) {
    Row(
        modifier = Modifier.fillMaxWidth(),
        verticalAlignment = Alignment.CenterVertically,
        horizontalArrangement = Arrangement.spacedBy(10.dp),
    ) {
        HorizontalDivider(modifier = Modifier.weight(1f), color = Clay)
        Text(text = label, style = MaterialTheme.typography.labelMedium, color = Dusk)
        HorizontalDivider(modifier = Modifier.weight(1f), color = Clay)
    }
}

@Composable
fun AccentNote(
    title: String,
    body: String,
    tone: Color = AlertMarigold,
) {
    Surface(
        modifier = Modifier.fillMaxWidth(),
        color = tone.copy(alpha = 0.12f),
        border = BorderStroke(1.dp, tone.copy(alpha = 0.25f)),
        shape = RoundedCornerShape(24.dp),
    ) {
        Column(
            modifier = Modifier.padding(18.dp),
            verticalArrangement = Arrangement.spacedBy(6.dp),
        ) {
            Text(text = title, style = MaterialTheme.typography.titleMedium, color = tone)
            Text(text = body, style = MaterialTheme.typography.bodyMedium, color = DeepBrown)
        }
    }
}

@Composable
fun TextBlock(text: String) {
    Text(
        text = text,
        style = MaterialTheme.typography.bodyLarge,
        color = DeepBrown,
    )
}
