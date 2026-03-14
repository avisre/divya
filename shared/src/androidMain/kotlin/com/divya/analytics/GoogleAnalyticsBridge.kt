package com.divya.analytics

import android.content.Context
import android.os.Bundle
import android.util.Log
import com.google.firebase.FirebaseApp
import com.google.firebase.analytics.FirebaseAnalytics

object GoogleAnalyticsBridge {
    private const val TAG = "GoogleAnalyticsBridge"
    private var analytics: FirebaseAnalytics? = null

    fun initialize(context: Context) {
        runCatching {
            if (FirebaseApp.getApps(context).isEmpty()) {
                Log.w(TAG, "Firebase is not configured; GA4 tracking is disabled for this build.")
                analytics = null
                return
            }
            analytics = FirebaseAnalytics.getInstance(context)
        }.onFailure {
            Log.w(TAG, "Firebase Analytics initialization failed", it)
            analytics = null
        }
    }

    fun trackEvent(name: String, properties: Map<String, Any?> = emptyMap()) {
        analytics?.logEvent(normalizeKey(name), properties.toBundle())
    }

    fun trackScreen(route: String) {
        analytics?.logEvent(
            FirebaseAnalytics.Event.SCREEN_VIEW,
            Bundle().apply {
                putString(FirebaseAnalytics.Param.SCREEN_NAME, route.take(100))
                putString(FirebaseAnalytics.Param.SCREEN_CLASS, "MainActivity")
            },
        )
    }

    fun identify(userId: String?) {
        analytics?.setUserId(userId)
    }

    fun setUserProperties(properties: Map<String, Any?>) {
        properties.forEach { (key, value) ->
            analytics?.setUserProperty(normalizeKey(key), value?.toString()?.take(36))
        }
    }

    fun normalizeKey(raw: String): String {
        val collapsed = raw
            .trim()
            .lowercase()
            .replace(Regex("[^a-z0-9_]+"), "_")
            .replace(Regex("_+"), "_")
            .trim('_')
        if (collapsed.isBlank()) {
            return "evt_unknown"
        }
        val prefixed = if (collapsed.firstOrNull()?.isLetter() == true) collapsed else "evt_$collapsed"
        return prefixed.take(40)
    }

    private fun Map<String, Any?>.toBundle(): Bundle {
        val bundle = Bundle()
        entries.forEach { (key, value) ->
            val normalizedKey = normalizeKey(key)
            when (value) {
                null -> Unit
                is String -> bundle.putString(normalizedKey, value.take(100))
                is Int -> bundle.putInt(normalizedKey, value)
                is Long -> bundle.putLong(normalizedKey, value)
                is Double -> bundle.putDouble(normalizedKey, value)
                is Float -> bundle.putDouble(normalizedKey, value.toDouble())
                is Boolean -> bundle.putString(normalizedKey, value.toString())
                else -> bundle.putString(normalizedKey, value.toString().take(100))
            }
        }
        return bundle
    }
}
