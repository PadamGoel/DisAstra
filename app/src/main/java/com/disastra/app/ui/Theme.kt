package com.disastra.app.ui

import androidx.compose.foundation.isSystemInDarkTheme
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.darkColorScheme
import androidx.compose.material3.lightColorScheme
import androidx.compose.runtime.Composable
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color

//--- Light Palette ---
val LightBackground = Color(0xFFF8F9FA)
val LightSoftWhite = Color(0xFFFFFFFF)
val LightAccentBlue = Color(0xFF1976D2)
val LightAccentPurple = Color(0xFF7C4DFF)
val LightEmergencyRed = Color(0xFFD32F2F)
val LightSuccessGreen = Color(0xFF388E3C)
val LightTextPrimary = Color(0xFF212121)
val LightTextSecondary = Color(0xFF546E7A)
val LightCardBackground = Color(0xFFE3F2FD)
val LightSuccessCardBackground = Color(0xFFE8F5E9)

private val AppLightColorScheme = lightColorScheme(
    primary = LightAccentBlue,
    secondary = LightAccentPurple,
    background = LightBackground,
    surface = LightSoftWhite,
    error = LightEmergencyRed,
    onPrimary = Color.White,
    onSecondary = Color.White,
    onBackground = LightTextPrimary,
    onSurface = LightTextPrimary,
    onSurfaceVariant = LightTextSecondary,
    surfaceVariant = LightCardBackground,
    primaryContainer = LightAccentBlue.copy(alpha = 0.1f)
)

//--- Dark Palette ---
val DarkBackground = Color(0xFF121212)
val DarkSoftWhite = Color(0xFF1E1E1E)
val DarkAccentBlue = Color(0xFF90CAF9)
val DarkAccentPurple = Color(0xFFB388FF)
val DarkEmergencyRed = Color(0xFFEF9A9A)
val DarkSuccessGreen = Color(0xFFA5D6A7)
val DarkTextPrimary = Color(0xFFE0E0E0)
val DarkTextSecondary = Color(0xFFB0BEC5)
val DarkCardBackground = Color(0xFF1A223C)
val DarkSuccessCardBackground = Color(0xFF385239)

private val AppDarkColorScheme = darkColorScheme(
    primary = DarkAccentBlue,
    secondary = DarkAccentPurple,
    background = DarkBackground,
    surface = DarkSoftWhite,
    error = DarkEmergencyRed,
    onPrimary = Color.Black,
    onSecondary = Color.Black,
    onBackground = DarkTextPrimary,
    onSurface = DarkTextPrimary,
    onSurfaceVariant = DarkTextSecondary,
    surfaceVariant = DarkCardBackground,
    primaryContainer = DarkAccentBlue.copy(alpha = 0.1f)
)

@Composable
fun DisastraTheme(
    isDarkTheme: Boolean,
    content: @Composable () -> Unit
) {
    val colors = if (isDarkTheme) AppDarkColorScheme else AppLightColorScheme

    MaterialTheme(
        colorScheme = colors,
        typography = MaterialTheme.typography,
        content = content
    )
}

// Custom theme extension for gradients
data class GradientColors(
    val background: Brush,
    val halo: Brush
)

val LightGradients = GradientColors(
    background = Brush.verticalGradient(
        colors = listOf(
            Color(0xFFF8F9FA),
            Color(0xFFE8EAF6),
            Color(0xFFEDE7F6)
        )
    ),
    halo = Brush.radialGradient(
        colors = listOf(
            LightSuccessGreen.copy(alpha = 0.6f),
            Color.Transparent
        )
    )
)

val DarkGradients = GradientColors(
    background = Brush.verticalGradient(
        colors = listOf(
            Color(0xFF1F222A),
            Color(0xFF1A1D24),
            Color(0xFF121212)
        )
    ),
    halo = Brush.radialGradient(
        colors = listOf(
            DarkSuccessGreen.copy(alpha = 0.5f),
            Color.Transparent
        )
    )
)
