package com.divya.analytics

expect class AnalyticsTracker {
    fun track(name: String, properties: Map<String, Any?> = emptyMap())
    fun identify(userId: String)
    fun setUserProperties(properties: Map<String, Any?>)
}

