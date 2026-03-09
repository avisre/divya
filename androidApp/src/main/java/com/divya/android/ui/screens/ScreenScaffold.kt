package com.divya.android.ui.screens

import androidx.compose.foundation.BorderStroke
import androidx.compose.foundation.Canvas
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.horizontalScroll
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.BoxWithConstraints
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.ColumnScope
import androidx.compose.foundation.layout.PaddingValues
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxHeight
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.widthIn
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
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.geometry.Offset
import androidx.compose.ui.platform.LocalConfiguration
import androidx.compose.ui.platform.testTag
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.Dp
import androidx.compose.ui.unit.sp
import androidx.compose.ui.unit.dp
import com.divya.android.app.DivyaRuntime
import com.divya.android.media.PrayerAudioPlayer
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

data class TrustMarker(
    val icon: String,
    val label: String,
)

enum class HeroCardVariant {
    DEFAULT,
    HOME,
    PRAYER,
    TEMPLE,
    PUJA,
    PROFILE,
    CALENDAR,
    EMPTY,
}

@Composable
fun ScreenScaffold(
    title: String,
    subtitle: String,
    eyebrow: String = "Divya",
    badge: String? = null,
    heroVariant: HeroCardVariant = HeroCardVariant.DEFAULT,
    heroStats: List<HeroStat> = emptyList(),
    heroContent: @Composable ColumnScope.() -> Unit = {},
    content: LazyListScope.() -> Unit,
) {
    BoxWithConstraints(
        modifier = Modifier
            .fillMaxSize()
            .background(
                Brush.verticalGradient(
                    colors = listOf(SoftRose, WarmBackground, Ivory),
                ),
            ),
    ) {
        val horizontalPadding = screenHorizontalPadding(maxWidth)
        val contentMaxWidth = screenContentMaxWidth(maxWidth)
        AtmosphericBackdrop()
        LazyColumn(
            modifier = Modifier
                .align(Alignment.TopCenter)
                .widthIn(max = contentMaxWidth)
                .fillMaxWidth()
                .fillMaxHeight()
                .testTag("screen_scaffold_list"),
            contentPadding = PaddingValues(horizontal = horizontalPadding, vertical = 18.dp),
            verticalArrangement = Arrangement.spacedBy(16.dp),
        ) {
            item {
                HeroCard(
                    eyebrow = eyebrow,
                    title = title,
                    subtitle = subtitle,
                    badge = badge,
                    variant = heroVariant,
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
    variant: HeroCardVariant,
    heroStats: List<HeroStat>,
    content: @Composable ColumnScope.() -> Unit,
) {
    val session by DivyaRuntime.sessionState.collectAsState()
    val playerState by PrayerAudioPlayer.state.collectAsState()
    val showListeningIndicator = !session.token.isNullOrBlank() && session.user?.isGuest == false && playerState.isPlaying
    val isCompactPhone = LocalConfiguration.current.screenWidthDp < 380
    val heroCorner = if (isCompactPhone) 28.dp else 32.dp
    val heroPadding = if (isCompactPhone) 20.dp else 24.dp
    val omBadgeSize = if (isCompactPhone) 60.dp else 70.dp
    val borderColor = when (variant) {
        HeroCardVariant.CALENDAR -> Color(0xFFD4956A)
        else -> TempleGold.copy(alpha = 0.35f)
    }
    val backgroundBrush = when (variant) {
        HeroCardVariant.EMPTY -> Brush.linearGradient(
            colors = listOf(Color(0xFFF5EDE4), Color(0xFFF8F0E7)),
        )
        HeroCardVariant.PROFILE -> Brush.linearGradient(
            colors = listOf(Color(0xFFFCEBDB), Color(0xFFF7E6D7), Color(0xFFFCEFE2)),
        )
        else -> Brush.linearGradient(
            colors = listOf(Color(0xFFFCE7D2), Color(0xFFF7DAB9), Color(0xFFFCEFE2)),
        )
    }
    val profileInitials = session.user?.name
        ?.split(" ")
        ?.mapNotNull { part -> part.firstOrNull()?.uppercaseChar() }
        ?.take(2)
        ?.joinToString("")
        ?.ifBlank { "D" }
        ?: "D"

    Box(
        modifier = Modifier
            .fillMaxWidth()
            .clip(RoundedCornerShape(heroCorner))
            .background(backgroundBrush)
            .border(
                border = BorderStroke(1.dp, borderColor),
                shape = RoundedCornerShape(heroCorner),
            )
            .padding(heroPadding),
    ) {
        when (variant) {
            HeroCardVariant.HOME -> LotusMotif(
                modifier = Modifier
                    .align(Alignment.BottomEnd)
                    .size(120.dp),
            )
            HeroCardVariant.TEMPLE -> Box(
                modifier = Modifier
                    .align(Alignment.BottomCenter)
                    .fillMaxWidth()
                    .height(40.dp)
                    .background(
                        Brush.verticalGradient(
                            colors = listOf(Color.Transparent, Saffron.copy(alpha = 0.15f)),
                        ),
                    ),
            )
            HeroCardVariant.PUJA -> Box(
                modifier = Modifier
                    .align(Alignment.TopCenter)
                    .fillMaxWidth()
                    .height(3.dp)
                    .background(Color(0xFFC8860A)),
            )
            HeroCardVariant.PRAYER -> Box(
                modifier = Modifier
                    .align(Alignment.CenterStart)
                    .fillMaxHeight()
                    .widthIn(min = 4.dp, max = 4.dp)
                    .background(Saffron),
            )
            HeroCardVariant.EMPTY -> DiyaPlaceholder(
                modifier = Modifier.align(Alignment.Center),
            )
            else -> Unit
        }
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
                if (variant == HeroCardVariant.PROFILE) {
                    AvatarBadge(
                        initials = profileInitials,
                        size = omBadgeSize,
                    )
                } else {
                    OmBadge(
                        size = omBadgeSize,
                        compact = isCompactPhone,
                        showListeningIndicator = showListeningIndicator,
                    )
                }
            }
            Text(
                text = title,
                style = MaterialTheme.typography.headlineLarge,
                color = DeepBrown,
                maxLines = 3,
                overflow = TextOverflow.Ellipsis,
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
    val statGap = if (LocalConfiguration.current.screenWidthDp < 380) 8.dp else 10.dp
    Column(verticalArrangement = Arrangement.spacedBy(statGap)) {
        stats.chunked(2).forEach { row ->
            Row(horizontalArrangement = Arrangement.spacedBy(statGap)) {
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
    val isCompactPhone = LocalConfiguration.current.screenWidthDp < 380
    Surface(
        modifier = modifier.fillMaxWidth(),
        color = Ivory.copy(alpha = 0.96f),
        shape = RoundedCornerShape(if (isCompactPhone) 24.dp else 28.dp),
        tonalElevation = 0.dp,
        shadowElevation = 0.dp,
        border = BorderStroke(1.dp, Clay.copy(alpha = 0.7f)),
    ) {
        Column(
            modifier = Modifier
                .fillMaxWidth()
                .padding(if (isCompactPhone) 16.dp else 20.dp),
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

private fun screenHorizontalPadding(maxWidth: Dp): Dp {
    return when {
        maxWidth < 360.dp -> 14.dp
        maxWidth < 420.dp -> 16.dp
        maxWidth < 840.dp -> 20.dp
        maxWidth < 1200.dp -> 28.dp
        else -> 36.dp
    }
}

@Composable
fun HeroTrustStrip(markers: List<TrustMarker>) {
    val isCompactPhone = LocalConfiguration.current.screenWidthDp < 380
    Row(
        modifier = Modifier.fillMaxWidth(),
        horizontalArrangement = Arrangement.spacedBy(8.dp),
    ) {
        markers.forEach { marker ->
            Surface(
                modifier = Modifier.weight(1f),
                color = Ivory.copy(alpha = 0.88f),
                shape = RoundedCornerShape(999.dp),
                border = BorderStroke(1.dp, Clay.copy(alpha = 0.72f)),
            ) {
                Column(
                    modifier = Modifier.padding(horizontal = 10.dp, vertical = if (isCompactPhone) 10.dp else 12.dp),
                    horizontalAlignment = Alignment.CenterHorizontally,
                    verticalArrangement = Arrangement.spacedBy(4.dp),
                ) {
                    Text(
                        text = marker.icon,
                        fontSize = if (isCompactPhone) 14.sp else 15.sp,
                        color = DeepBrown,
                    )
                    Text(
                        text = marker.label,
                        style = MaterialTheme.typography.labelMedium,
                        color = DeepBrown,
                        maxLines = 2,
                        textAlign = TextAlign.Center,
                    )
                }
            }
        }
    }
}

@Composable
private fun OmBadge(
    size: Dp,
    compact: Boolean,
    showListeningIndicator: Boolean,
) {
    Box(
        modifier = Modifier
            .size(size)
            .clip(CircleShape)
            .background(
                Brush.radialGradient(
                    colors = listOf(LampGlow.copy(alpha = 0.95f), Saffron.copy(alpha = 0.18f)),
                ),
            ),
        contentAlignment = Alignment.Center,
    ) {
        if (showListeningIndicator) {
            Box(
                modifier = Modifier
                    .size(18.dp)
                    .clip(CircleShape)
                    .background(DeepBrown.copy(alpha = 0.55f)),
            )
        }
        Box(
            modifier = Modifier.size(if (compact) 36.dp else 42.dp),
            contentAlignment = Alignment.Center,
        ) {
            Text(
                text = "\u0950",
                style = MaterialTheme.typography.headlineMedium.copy(
                    fontSize = if (compact) 28.sp else 31.sp,
                    lineHeight = 33.sp,
                ),
                color = DeepBrown,
                textAlign = TextAlign.Center,
            )
        }
    }
}

@Composable
private fun AvatarBadge(
    initials: String,
    size: Dp,
) {
    Box(
        modifier = Modifier
            .size(size)
            .clip(CircleShape)
            .background(
                Brush.radialGradient(
                    colors = listOf(Saffron.copy(alpha = 0.22f), Ivory.copy(alpha = 0.98f)),
                ),
            )
            .border(BorderStroke(1.dp, TempleGold.copy(alpha = 0.4f)), CircleShape),
        contentAlignment = Alignment.Center,
    ) {
        Text(
            text = initials,
            style = MaterialTheme.typography.titleLarge,
            color = DeepBrown,
        )
    }
}

@Composable
private fun LotusMotif(modifier: Modifier = Modifier) {
    Canvas(modifier = modifier) {
        val petalColor = Saffron.copy(alpha = 0.08f)
        val center = Offset(size.width * 0.68f, size.height * 0.62f)
        val petalRadius = size.minDimension * 0.12f
        repeat(6) { index ->
            val angle = Math.toRadians((index * 60.0) - 30.0)
            val offset = Offset(
                x = center.x + (kotlin.math.cos(angle) * size.minDimension * 0.18f).toFloat(),
                y = center.y + (kotlin.math.sin(angle) * size.minDimension * 0.18f).toFloat(),
            )
            drawCircle(
                color = petalColor,
                radius = petalRadius,
                center = offset,
            )
        }
        drawCircle(
            color = TempleGold.copy(alpha = 0.08f),
            radius = petalRadius * 0.8f,
            center = center,
        )
    }
}

@Composable
private fun DiyaPlaceholder(modifier: Modifier = Modifier) {
    Box(
        modifier = modifier.size(96.dp),
        contentAlignment = Alignment.Center,
    ) {
        Text(
            text = "🪔",
            fontSize = 44.sp,
            color = DeepBrown.copy(alpha = 0.26f),
        )
    }
}

private fun screenContentMaxWidth(maxWidth: Dp): Dp {
    return when {
        maxWidth < 420.dp -> maxWidth
        maxWidth < 600.dp -> 640.dp
        maxWidth < 840.dp -> 720.dp
        maxWidth < 1200.dp -> 960.dp
        else -> 1080.dp
    }
}
