package com.divya.analytics

actual class AnalyticsTracker {
    actual fun track(name: String, properties: Map<String, Any?>) {
        GoogleAnalyticsBridge.trackEvent(name, properties)
    }

    actual fun identify(userId: String) {
        GoogleAnalyticsBridge.identify(userId)
    }

    actual fun setUserProperties(properties: Map<String, Any?>) {
        GoogleAnalyticsBridge.setUserProperties(properties)
    }
}
