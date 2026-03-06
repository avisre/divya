package com.divya.android.ui

import android.content.Intent
import android.os.SystemClock
import androidx.test.core.app.ActivityScenario
import androidx.test.platform.app.InstrumentationRegistry
import androidx.test.ext.junit.runners.AndroidJUnit4
import com.divya.android.MainActivity
import org.junit.Assert.assertTrue
import org.junit.Test
import org.junit.runner.RunWith

@RunWith(AndroidJUnit4::class)
class StartupBenchmarkTest {
    @Test
    fun startup_withPlayerInit_completesWithinBudget() {
        val targetContext = InstrumentationRegistry.getInstrumentation().targetContext
        val intent = Intent(targetContext, MainActivity::class.java).apply {
            action = Intent.ACTION_MAIN
        }
        val start = SystemClock.elapsedRealtime()
        ActivityScenario.launch<MainActivity>(intent).use {
            val duration = SystemClock.elapsedRealtime() - start
            assertTrue("Startup exceeded budget: ${duration}ms", duration < 8_000L)
        }
    }
}
