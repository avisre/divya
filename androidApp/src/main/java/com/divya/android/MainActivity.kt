package com.divya.android

import android.os.Bundle
import android.os.SystemClock
import android.graphics.Color
import android.graphics.drawable.ColorDrawable
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.setValue
import androidx.core.view.WindowCompat
import com.divya.android.BuildConfig
import com.divya.android.app.DivyaRuntime
import com.divya.android.media.PrayerAudioPlayer
import com.divya.android.navigation.DivyaNavGraph
import com.divya.android.navigation.DivyaRoutes
import com.divya.android.ui.theme.DivyaTheme

class MainActivity : ComponentActivity() {
    private var startRoute by mutableStateOf(DivyaRoutes.splash.route)
    private var hideMiniPlayer by mutableStateOf(false)

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        WindowCompat.setDecorFitsSystemWindows(window, true)
        window.setBackgroundDrawable(ColorDrawable(Color.parseColor("#FFF9F2")))
        window.statusBarColor = Color.parseColor("#FFF9F2")
        window.navigationBarColor = Color.parseColor("#FFFDF9")
        WindowCompat.getInsetsController(window, window.decorView).apply {
            isAppearanceLightStatusBars = true
            isAppearanceLightNavigationBars = true
        }
        val initStartMs = SystemClock.elapsedRealtime()
        DivyaRuntime.initialize(applicationContext)
        PrayerAudioPlayer.initialize(applicationContext)
        startRoute = resolveStartRoute(intent.getStringExtra("route"))
        hideMiniPlayer = intent.getBooleanExtra("hideMiniPlayer", false)
        setContent {
            DivyaTheme {
                DivyaNavGraph(
                    startDestination = startRoute,
                    hideMiniPlayer = hideMiniPlayer,
                )
            }
        }
        val initDurationMs = SystemClock.elapsedRealtime() - initStartMs
        DivyaRuntime.trackEvent(
            "startup_player_init_benchmark",
            mapOf("duration_ms" to initDurationMs),
        )
    }

    override fun onNewIntent(intent: android.content.Intent) {
        super.onNewIntent(intent)
        setIntent(intent)
        startRoute = resolveStartRoute(intent.getStringExtra("route"))
        hideMiniPlayer = intent.getBooleanExtra("hideMiniPlayer", false)
        recreate()
    }

    override fun onDestroy() {
        if (isFinishing) {
            PrayerAudioPlayer.releaseForBackground()
        }
        super.onDestroy()
    }

    private fun resolveStartRoute(route: String?): String {
        if (route.isNullOrBlank()) {
            val session = DivyaRuntime.sessionState.value
            val hasAuthenticatedUser = !session.token.isNullOrBlank() && session.user?.isGuest == false
            return if (hasAuthenticatedUser) DivyaRoutes.home.route else DivyaRoutes.login.route
        }
        val normalized = DivyaRoutes.normalize(route)
        if (!BuildConfig.ENABLE_GALLERY_TOOLS && normalized == DivyaRoutes.gallery.route) {
            return if (!DivyaRuntime.sessionState.value.token.isNullOrBlank()) {
                DivyaRoutes.home.route
            } else {
                DivyaRoutes.login.route
            }
        }
        return normalized
    }
}
