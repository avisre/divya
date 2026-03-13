package com.divya.android.ui.screens

import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.material3.Button
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import com.divya.android.navigation.DivyaRoutes

@Composable
fun DeityModuleScreen(onOpen: (String) -> Unit) {
    val module = AppContent.bhagavathiLearningModules[3]
    ScreenScaffold(
        eyebrow = "Learning module",
        title = module.title,
        subtitle = "${module.readMinutes} min read • ${module.deityName}",
        badge = "Module ${module.order}",
        heroStats = listOf(
            HeroStat("${module.readMinutes} min", "Read time"),
            HeroStat("Key takeaway", "Daily consistency wins"),
        ),
    ) {
        item {
            PanelCard(title = "Module content") {
                TextBlock("Navarathri is a nine-day progression of devotion and discipline. For diaspora families, a short daily practice is better than occasional long rituals.")
                TextBlock("Key takeaway: devotion compounds through consistency, not intensity.")
            }
        }
        item {
            Button(onClick = { onOpen(DivyaRoutes.prayerFor(AppContent.deviMahatmyam.id)) }, modifier = Modifier.fillMaxWidth()) {
                Text("Practice this module prayer")
            }
        }
    }
}
