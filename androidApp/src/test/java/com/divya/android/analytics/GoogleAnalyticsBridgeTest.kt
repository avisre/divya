package com.divya.android.analytics

import com.divya.analytics.GoogleAnalyticsBridge
import org.junit.Assert.assertEquals
import org.junit.Test

class GoogleAnalyticsBridgeTest {
    @Test
    fun normalizeKey_coercesToGaFriendlyEventNames() {
        assertEquals("login_completed", GoogleAnalyticsBridge.normalizeKey("Login Completed"))
        assertEquals("evt_123_prayer_opened", GoogleAnalyticsBridge.normalizeKey("123 Prayer Opened"))
        assertEquals("evt_unknown", GoogleAnalyticsBridge.normalizeKey("%%%"))
    }
}
