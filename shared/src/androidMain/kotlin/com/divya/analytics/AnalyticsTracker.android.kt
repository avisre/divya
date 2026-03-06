package com.divya.analytics

actual class AnalyticsTracker {
    actual fun track(name: String, properties: Map<String, Any?>) = Unit
    actual fun identify(userId: String) = Unit
    actual fun setUserProperties(properties: Map<String, Any?>) = Unit
}

