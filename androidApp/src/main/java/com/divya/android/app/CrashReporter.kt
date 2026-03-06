package com.divya.android.app

import kotlinx.coroutines.runBlocking

object CrashReporter {
    fun install(report: suspend (Throwable, Map<String, Any?>) -> Unit) {
        val previousHandler = Thread.getDefaultUncaughtExceptionHandler()
        Thread.setDefaultUncaughtExceptionHandler { thread, throwable ->
            runCatching {
                runBlocking {
                    report(
                        throwable,
                        mapOf(
                            "thread" to thread.name,
                            "fatal" to true,
                        ),
                    )
                }
            }
            previousHandler?.uncaughtException(thread, throwable)
        }
    }
}
