package com.divya.android.ui.screens

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.widthIn
import androidx.compose.foundation.layout.ExperimentalLayoutApi
import androidx.compose.foundation.layout.FlowRow
import androidx.compose.material3.Button
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.platform.testTag
import androidx.compose.ui.unit.dp
import com.divya.android.navigation.DivyaRoute

@OptIn(ExperimentalLayoutApi::class)
@Composable
fun GalleryScreen(
    routes: List<DivyaRoute>,
    onOpen: (String) -> Unit,
) {
    ScreenScaffold(
        eyebrow = "Screen navigator",
        title = "Android experience atlas",
        subtitle = "Jump directly into each major page while preserving the same premium shell and navigation bar.",
        badge = "Screen launcher",
        heroStats = listOf(
            HeroStat("${routes.size}", "Routed screens"),
            HeroStat("1 tap", "Direct launch"),
            HeroStat("Reusable", "Screenshot flow"),
        ),
    ) {
        item {
            PanelCard(
                title = "Open any screen",
                subtitle = "Use this navigator to move quickly between major pages and product states.",
            ) {
                FlowRow(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.spacedBy(10.dp),
                    verticalArrangement = Arrangement.spacedBy(10.dp),
                ) {
                    routes.forEach { route ->
                        Button(
                            onClick = { onOpen(route.route) },
                            modifier = Modifier
                                .testTag("gallery_open_${route.route}")
                                .widthIn(min = 132.dp),
                        ) {
                            Text(
                                text = route.title,
                                modifier = Modifier.padding(vertical = 4.dp),
                                style = MaterialTheme.typography.labelLarge,
                            )
                        }
                    }
                }
            }
        }
    }
}
