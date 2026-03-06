package com.divya.android.ui.theme

import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.lightColorScheme
import androidx.compose.runtime.Composable

private val LightColors = lightColorScheme(
    primary = Saffron,
    secondary = TempleGold,
    tertiary = LampGlow,
    background = WarmBackground,
    surface = Ivory,
    surfaceVariant = Sand,
    primaryContainer = SoftRose,
    secondaryContainer = Clay,
    onPrimary = Ivory,
    onSecondary = DeepBrown,
    onTertiary = DeepBrown,
    onBackground = DeepBrown,
    onSurface = DeepBrown,
    onSurfaceVariant = Dusk,
    outline = Clay,
)

@Composable
fun DivyaTheme(content: @Composable () -> Unit) {
    MaterialTheme(
        colorScheme = LightColors,
        typography = DivyaTypography,
        shapes = DivyaShapes,
        content = content,
    )
}
