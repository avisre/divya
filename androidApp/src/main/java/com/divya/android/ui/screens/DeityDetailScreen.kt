package com.divya.android.ui.screens

import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.material3.Button
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.saveable.rememberSaveable
import androidx.compose.runtime.setValue
import androidx.compose.ui.Modifier
import com.divya.android.navigation.DivyaRoutes
import com.divya.android.ui.components.DeityModuleCard
import com.divya.data.models.Deity

@Composable
fun DeityDetailScreen(onOpen: (String) -> Unit) {
    var tab by rememberSaveable { mutableStateOf("About") }
    var selectedDeityId by rememberSaveable { mutableStateOf(AppContent.bhagavathi.id) }
    val selectedDeity = AppContent.deities.firstOrNull { it.id == selectedDeityId } ?: AppContent.bhagavathi
    val knowledge = AppContent.deityKnowledge(selectedDeity.id)

    ScreenScaffold(
        eyebrow = "Deity library",
        title = selectedDeity.name.en,
        subtitle = "Clear English context with authentic Hindu terminology and pronunciation guidance.",
        badge = "Pronounced ${selectedDeity.pronunciationGuide}",
        heroStats = listOf(
            HeroStat("${AppContent.deities.size}", "Deities"),
            HeroStat(selectedDeity.tradition, "Tradition"),
            HeroStat("Ganesha first", "Ordering rule"),
        ),
    ) {
        item {
            PanelCard(title = "Choose deity") {
                SelectableTagRow(
                    options = AppContent.deities.sortedBy { it.order }.map { it.name.en },
                    selected = selectedDeity.name.en,
                    onSelect = { pick ->
                        val matched = AppContent.deities.firstOrNull { it.name.en == pick }
                        if (matched != null) {
                            selectedDeityId = matched.id
                        }
                    },
                )
            }
        }
        item {
            PanelCard(title = "Tabs") {
                SelectableTagRow(
                    options = listOf("About", "Prayers", "Learn"),
                    selected = tab,
                    onSelect = { tab = it },
                )
            }
        }

        if (tab == "About") {
            item {
                PanelCard(title = "Plain-English context") {
                    TextBlock(selectedDeity.fullDescription)
                }
            }
            item {
                PanelCard(title = "Mythology and symbolism") {
                    InfoRow(label = "Mythology", value = knowledge.mythology)
                    InfoRow(label = "Vahana", value = knowledge.vahana)
                    InfoRow(label = "Core mantra", value = knowledge.bijaOrCoreMantra)
                }
            }
            item {
                PanelCard(title = "Tradition and script") {
                    InfoRow(label = "Tradition", value = selectedDeity.tradition)
                    InfoRow(label = "Malayalam name", value = selectedDeity.name.ml ?: "Not specified")
                    InfoRow(label = "Sanskrit name", value = selectedDeity.name.sa ?: "Not specified")
                }
            }
        }

        if (tab == "Prayers") {
            prayersForDeity(selectedDeity).take(8).forEach { prayer ->
                item {
                    PanelCard(title = prayer.title.en, subtitle = prayer.meaning) {
                        InfoRow(label = "Duration", value = "${prayer.durationMinutes} min")
                        Button(onClick = { onOpen(DivyaRoutes.prayerFor(prayer.id)) }, modifier = Modifier.fillMaxWidth()) {
                            Text("Practice")
                        }
                    }
                }
            }
        }

        if (tab == "Learn") {
            val learningModules = if (selectedDeity.id == AppContent.bhagavathi.id) {
                AppContent.bhagavathiLearningModules
            } else {
                buildDefaultLearningPath(selectedDeity)
            }
            item {
                PanelCard(
                    title = "Your journey with ${selectedDeity.name.en}",
                    subtitle = "Modules 1-3 are open. Remaining modules are Bhakt-gated.",
                ) {
                    TextBlock("Complete modules in sequence to build ritual confidence and context.")
                }
            }
            learningModules.forEach { module ->
                item {
                    DeityModuleCard(
                        module = module,
                        completed = module.order <= 3,
                        onRead = { onOpen(DivyaRoutes.deityModule.route) },
                    )
                }
            }
            item {
                Button(onClick = { onOpen(DivyaRoutes.deityLearn.route) }, modifier = Modifier.fillMaxWidth()) {
                    Text("Open full learning path")
                }
            }
        }
    }
}

private fun prayersForDeity(deity: Deity) = AppContent.prayerLibrary108.filter { it.deity?.id == deity.id }

private fun buildDefaultLearningPath(deity: Deity) = listOf(
    AppContent.DeityLearningModulePreview(deity.id, deity.name.en, 1, "Who is ${deity.name.en}?", 4, false),
    AppContent.DeityLearningModulePreview(deity.id, deity.name.en, 2, "${deity.name.en} in daily life", 5, false),
    AppContent.DeityLearningModulePreview(deity.id, deity.name.en, 3, "Core mantra meaning", 4, false),
    AppContent.DeityLearningModulePreview(deity.id, deity.name.en, 4, "Ritual structure and offerings", 6, true),
    AppContent.DeityLearningModulePreview(deity.id, deity.name.en, 5, "Festival significance", 5, true),
    AppContent.DeityLearningModulePreview(deity.id, deity.name.en, 6, "Family practice abroad", 5, true),
)
