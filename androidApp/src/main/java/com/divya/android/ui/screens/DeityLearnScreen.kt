package com.divya.android.ui.screens

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.material3.Button
import androidx.compose.material3.LinearProgressIndicator
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateListOf
import androidx.compose.runtime.remember
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp
import com.divya.android.navigation.DivyaRoutes
import com.divya.android.ui.components.DeityModuleCard
import com.divya.android.ui.theme.TempleGold

@Composable
fun DeityLearnScreen(onOpen: (String) -> Unit) {
    val completed = remember { mutableStateListOf(1, 2, 3) }
    val modules = AppContent.bhagavathiLearningModules
    val progress = completed.size.toFloat() / modules.size.toFloat()

    ScreenScaffold(
        eyebrow = "Deity learning path",
        title = "Journey with ${AppContent.bhagavathi.name.en}",
        subtitle = "Structured module flow for second-generation and first-generation diaspora devotees.",
        badge = "${completed.size} of ${modules.size} completed",
        heroStats = listOf(
            HeroStat("${(progress * 100).toInt()}%", "Path progress"),
            HeroStat("8", "Total modules"),
            HeroStat("Bhakt+", "Unlock all modules"),
        ),
    ) {
        item {
            PanelCard(title = "Learning path progress") {
                LinearProgressIndicator(
                    progress = { progress },
                    modifier = Modifier.fillMaxWidth(),
                    color = TempleGold,
                    trackColor = TempleGold.copy(alpha = 0.22f),
                )
                Text("Continue with module ${completed.size + 1}")
            }
        }
        modules.forEach { module ->
            item {
                DeityModuleCard(
                    module = module,
                    completed = completed.contains(module.order),
                    onRead = { onOpen(DivyaRoutes.deityModule.route) },
                )
            }
        }
        item {
            Button(onClick = { onOpen(DivyaRoutes.prayerFor(AppContent.navarnaMantra.id)) }, modifier = Modifier.fillMaxWidth()) {
                Text("Practice linked prayer")
            }
        }
    }
}
