package com.divya.android

import android.os.Bundle
import android.os.SystemClock
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.setValue
import com.divya.android.BuildConfig
import com.divya.android.app.DivyaRuntime
import com.divya.android.media.PrayerAudioPlayer
import com.divya.android.navigation.DivyaNavGraph
import com.divya.android.navigation.DivyaRoutes
import com.divya.android.ui.theme.DivyaTheme

class MainActivity : ComponentActivity() {
    private var startRoute by mutableStateOf(DivyaRoutes.splash.route)

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        val initStartMs = SystemClock.elapsedRealtime()
        DivyaRuntime.initialize(applicationContext)
        PrayerAudioPlayer.initialize(applicationContext)
        startRoute = resolveStartRoute(intent.getStringExtra("route"))
        setContent {
            DivyaTheme {
                DivyaNavGraph(startDestination = startRoute)
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
        recreate()
    }

    override fun onDestroy() {
        if (isFinishing) {
            PrayerAudioPlayer.releaseForBackground()
        }
        super.onDestroy()
    }

    private fun resolveStartRoute(route: String?): String {
        val normalized = DivyaRoutes.normalize(route)
        if (!BuildConfig.ENABLE_GALLERY_TOOLS && normalized == DivyaRoutes.gallery.route) {
            return DivyaRoutes.splash.route
        }
        return normalized
    }
}
