package com.divya.android.ui.components

import androidx.compose.foundation.BorderStroke
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.Button
import androidx.compose.material3.LinearProgressIndicator
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Surface
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.unit.dp
import com.divya.android.ui.screens.BulletList
import com.divya.android.ui.screens.AppContent
import com.divya.android.ui.screens.InfoRow
import com.divya.android.ui.screens.PanelCard
import com.divya.android.ui.screens.StatusPill
import com.divya.android.ui.screens.TagRow
import com.divya.android.ui.theme.Clay
import com.divya.android.ui.theme.DeepBrown
import com.divya.android.ui.theme.Ivory
import com.divya.android.ui.theme.LampGlow
import com.divya.android.ui.theme.Saffron
import com.divya.android.ui.theme.TempleGold
import com.divya.android.ui.theme.WarmBackground

@Composable
fun TempleHeroVisualCard() {
    Surface(
        modifier = Modifier.fillMaxWidth(),
        shape = RoundedCornerShape(28.dp),
        color = Ivory.copy(alpha = 0.92f),
        border = BorderStroke(1.dp, TempleGold.copy(alpha = 0.3f)),
    ) {
        Column(
            modifier = Modifier
                .fillMaxWidth()
                .background(
                    Brush.verticalGradient(
                        colors = listOf(Ivory, WarmBackground, LampGlow.copy(alpha = 0.16f)),
                    ),
                )
                .padding(18.dp),
            verticalArrangement = Arrangement.spacedBy(14.dp),
        ) {
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically,
            ) {
                StatusPill(label = "Bhadra Bhagavathi Temple", color = TempleGold)
                Text(
                    text = "IST to local",
                    style = MaterialTheme.typography.labelLarge,
                    color = Saffron,
                )
            }
            Text(
                text = "Temple rituals in Kerala, timed for your city.",
                style = MaterialTheme.typography.headlineMedium,
                color = DeepBrown,
            )
            Text(
                text = "For devotees in the USA, UK, Canada, UAE, and Australia, the app keeps prayer and puja updates understandable in local time.",
                style = MaterialTheme.typography.bodyMedium,
                color = DeepBrown.copy(alpha = 0.78f),
            )
            Row(horizontalArrangement = Arrangement.spacedBy(12.dp), modifier = Modifier.fillMaxWidth()) {
                Surface(
                    modifier = Modifier.weight(1f),
                    shape = RoundedCornerShape(20.dp),
                    color = Ivory.copy(alpha = 0.86f),
                    border = BorderStroke(1.dp, Clay.copy(alpha = 0.8f)),
                ) {
                    Column(modifier = Modifier.padding(14.dp), verticalArrangement = Arrangement.spacedBy(4.dp)) {
                        InfoRow(label = "Temple", value = "6:00 PM IST")
                    }
                }
                Surface(
                    modifier = Modifier.weight(1f),
                    shape = RoundedCornerShape(20.dp),
                    color = Ivory.copy(alpha = 0.86f),
                    border = BorderStroke(1.dp, Clay.copy(alpha = 0.8f)),
                ) {
                    Column(modifier = Modifier.padding(14.dp), verticalArrangement = Arrangement.spacedBy(4.dp)) {
                        InfoRow(label = "New York", value = "7:30 AM EST")
                    }
                }
            }
            Column(verticalArrangement = Arrangement.spacedBy(8.dp)) {
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceBetween,
                ) {
                    Text(
                        text = "Booking transparency",
                        style = MaterialTheme.typography.labelLarge,
                        color = TempleGold,
                    )
                    Text(
                        text = "Clear status flow",
                        style = MaterialTheme.typography.labelLarge,
                        color = Saffron,
                    )
                }
                LinearProgressIndicator(
                    progress = { 1f },
                    modifier = Modifier
                        .fillMaxWidth()
                        .height(8.dp)
                        .clip(RoundedCornerShape(999.dp)),
                    color = TempleGold,
                    trackColor = LampGlow.copy(alpha = 0.3f),
                )
            }
            TagRow(tags = listOf("Guest mode first", "Waitlist clarity", "Private video", "English-first guidance"))
        }
    }
}

@Composable
fun TrustHighlightsCard(stats: List<AppContent.ProofStat>) {
    PanelCard(
        title = "Why this feels trustworthy fast",
        subtitle = "The landing page should answer the user's first questions in under ten seconds.",
        accent = TempleGold,
    ) {
        Column(verticalArrangement = Arrangement.spacedBy(10.dp)) {
            stats.chunked(2).forEach { row ->
                Row(horizontalArrangement = Arrangement.spacedBy(10.dp), modifier = Modifier.fillMaxWidth()) {
                    row.forEach { stat ->
                        Surface(
                            modifier = Modifier.weight(1f),
                            color = Ivory.copy(alpha = 0.92f),
                            shape = RoundedCornerShape(22.dp),
                            border = BorderStroke(1.dp, Clay.copy(alpha = 0.75f)),
                        ) {
                            Column(
                                modifier = Modifier.padding(16.dp),
                                verticalArrangement = Arrangement.spacedBy(6.dp),
                            ) {
                                Text(
                                    text = stat.value,
                                    style = MaterialTheme.typography.titleLarge,
                                    color = Saffron,
                                )
                                Text(
                                    text = stat.label,
                                    style = MaterialTheme.typography.bodyMedium,
                                    color = DeepBrown,
                                )
                            }
                        }
                    }
                }
            }
        }
    }
}

@Composable
fun RitualJourneyCard(steps: List<String>) {
    PanelCard(
        title = "How the sacred flow works",
        subtitle = "A good spiritual product should explain the ritual journey without sounding transactional.",
    ) {
        Column(verticalArrangement = Arrangement.spacedBy(14.dp)) {
            steps.forEachIndexed { index, step ->
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.spacedBy(12.dp),
                    verticalAlignment = Alignment.Top,
                ) {
                    Column(horizontalAlignment = Alignment.CenterHorizontally) {
                        Box(
                            modifier = Modifier
                                .size(30.dp)
                                .clip(CircleShape)
                                .background(if (index == 0) Saffron else TempleGold.copy(alpha = 0.16f)),
                            contentAlignment = Alignment.Center,
                        ) {
                            Text(
                                text = "${index + 1}",
                                style = MaterialTheme.typography.labelLarge,
                                color = if (index == 0) Ivory else TempleGold,
                            )
                        }
                        if (index != steps.lastIndex) {
                            Box(
                                modifier = Modifier
                                    .padding(top = 4.dp)
                                    .size(width = 2.dp, height = 42.dp)
                                    .background(Clay),
                            )
                        }
                    }
                    Surface(
                        modifier = Modifier.weight(1f),
                        shape = RoundedCornerShape(20.dp),
                        color = Ivory.copy(alpha = 0.9f),
                        border = BorderStroke(1.dp, Clay.copy(alpha = 0.7f)),
                    ) {
                        Text(
                            text = step,
                            modifier = Modifier.padding(14.dp),
                            style = MaterialTheme.typography.bodyLarge,
                            color = DeepBrown,
                        )
                    }
                }
            }
        }
    }
}

@Composable
fun AudienceFitCard() {
    PanelCard(
        title = "Made for Indian families abroad",
        subtitle = "The page should feel emotionally familiar to parents and effortlessly legible to second-generation users.",
    ) {
        Column(verticalArrangement = Arrangement.spacedBy(12.dp)) {
            AudiencePillar(
                title = "For parents",
                body = "Temple language stays respectful and ritual detail stays clear enough to trust from abroad.",
            )
            AudiencePillar(
                title = "For second-generation users",
                body = "English leads the experience so prayer, meaning, and puja steps never feel gatekept.",
            )
            AudiencePillar(
                title = "For the family together",
                body = "Sacred videos, reminders, and prayer history become a shared archive rather than one person's app.",
            )
        }
    }
}

@Composable
private fun AudiencePillar(title: String, body: String) {
    Surface(
        modifier = Modifier.fillMaxWidth(),
        shape = RoundedCornerShape(20.dp),
        color = Ivory.copy(alpha = 0.92f),
        border = BorderStroke(1.dp, Clay.copy(alpha = 0.75f)),
    ) {
        Column(
            modifier = Modifier.padding(16.dp),
            verticalArrangement = Arrangement.spacedBy(6.dp),
        ) {
            Text(
                text = title,
                style = MaterialTheme.typography.titleMedium,
                color = TempleGold,
            )
            Text(
                text = body,
                style = MaterialTheme.typography.bodyMedium,
                color = DeepBrown,
            )
        }
    }
}

@Composable
fun TraditionNotesCard(notes: List<String>) {
    PanelCard(
        title = "Tradition notes behind the experience",
        subtitle = "These are drawn from widely used temple and prayer traditions rather than invented marketing quotes.",
        accent = TempleGold,
    ) {
        BulletList(notes)
    }
}

@Composable
fun PanIndiaRoadmapCard(steps: List<String>) {
    PanelCard(
        title = "Pan-India temple roadmap",
        subtitle = "Divya starts with one trusted temple and expands carefully across traditions, regions, and languages.",
        accent = TempleGold,
    ) {
        BulletList(steps)
        TagRow(tags = listOf("Kerala origin", "Nationwide expansion", "Diaspora-first UX"))
    }
}

@Composable
fun FirstDayJourneyCard(
    steps: List<String>,
    ctaLabel: String,
    onCta: () -> Unit,
) {
    PanelCard(
        title = "What you can do in your first day",
        subtitle = "A clear start path helps new devotees build trust before committing to any plan.",
        accent = Saffron,
    ) {
        BulletList(steps)
        Button(
            onClick = onCta,
            modifier = Modifier.fillMaxWidth(),
        ) {
            Text(ctaLabel)
        }
    }
}

@Composable
fun ClosingCtaCard() {
    PanelCard(
        title = "Start with prayer, stay for the temple connection",
        subtitle = "The final screenful should make the next action obvious and low-risk.",
        accent = Saffron,
    ) {
        BulletList(
            items = listOf(
                "Explore as a guest before creating an account.",
                "Build a daily prayer habit in English-first guidance.",
                "Join a temple waitlist when your family is ready.",
            ),
        )
    }
}

@Composable
fun ProofStatCard(stat: AppContent.ProofStat) {
    Surface(
        modifier = Modifier.fillMaxWidth(),
        color = Ivory.copy(alpha = 0.96f),
        shape = MaterialTheme.shapes.medium,
        border = BorderStroke(1.dp, Clay.copy(alpha = 0.8f)),
    ) {
        Column(
            modifier = Modifier.padding(18.dp),
            verticalArrangement = Arrangement.spacedBy(6.dp),
        ) {
            Text(
                text = stat.value,
                style = MaterialTheme.typography.headlineSmall,
                color = TempleGold,
            )
            Text(
                text = stat.label,
                style = MaterialTheme.typography.bodyLarge,
                color = DeepBrown,
            )
        }
    }
}

@Composable
fun TierComparisonCard(rows: List<AppContent.ComparisonRow>) {
    PanelCard(
        title = "Compare plans quickly",
        subtitle = "Users convert faster when they can see what changes at each tier without reading a wall of copy.",
    ) {
        rows.forEach { row ->
            Surface(
                modifier = Modifier.fillMaxWidth(),
                color = Ivory.copy(alpha = 0.9f),
                shape = MaterialTheme.shapes.medium,
                border = BorderStroke(1.dp, Clay.copy(alpha = 0.65f)),
            ) {
                Column(
                    modifier = Modifier.padding(16.dp),
                    verticalArrangement = Arrangement.spacedBy(8.dp),
                ) {
                    Text(
                        text = row.feature,
                        style = MaterialTheme.typography.titleMedium,
                        color = Saffron,
                    )
                    Row(horizontalArrangement = Arrangement.spacedBy(12.dp), modifier = Modifier.fillMaxWidth()) {
                        Column(modifier = Modifier.weight(1f), verticalArrangement = Arrangement.spacedBy(6.dp)) {
                            StatusPill(label = "Free")
                            InfoRow(label = "Included", value = row.free)
                        }
                        Column(modifier = Modifier.weight(1f), verticalArrangement = Arrangement.spacedBy(6.dp)) {
                            StatusPill(label = "Bhakt", color = Saffron)
                            InfoRow(label = "Included", value = row.bhakt)
                        }
                        Column(modifier = Modifier.weight(1f), verticalArrangement = Arrangement.spacedBy(6.dp)) {
                            StatusPill(label = "Seva", color = TempleGold)
                            InfoRow(label = "Included", value = row.seva)
                        }
                    }
                }
            }
        }
    }
}

@Composable
fun ConversionReasonCard(
    title: String,
    subtitle: String,
    bullets: List<String>,
    tags: List<String> = emptyList(),
) {
    PanelCard(title = title, subtitle = subtitle) {
        if (tags.isNotEmpty()) {
            TagRow(tags = tags)
        }
        BulletList(items = bullets)
    }
}
