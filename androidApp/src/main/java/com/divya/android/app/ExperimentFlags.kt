package com.divya.android.app

import android.content.Context
import kotlin.random.Random

object ExperimentFlags {
    private const val PREFS = "divya.experiments"
    private const val KEY_BUCKET = "home_cta_bucket"

    fun homePrimaryCta(context: Context): String {
        return when (bucket(context)) {
            "A" -> "Begin evening prayer"
            "B" -> "Continue your prayer"
            else -> "Start today's prayer"
        }
    }

    fun homeSecondaryCta(context: Context): String {
        return when (bucket(context)) {
            "A" -> "Pray together"
            "B" -> "Invite family"
            else -> "Open shared prayer"
        }
    }

    fun homeLayoutVariant(context: Context): String {
        return bucket(context)
    }

    private fun bucket(context: Context): String {
        val prefs = context.getSharedPreferences(PREFS, Context.MODE_PRIVATE)
        val existing = prefs.getString(KEY_BUCKET, null)
        if (!existing.isNullOrBlank()) return existing
        val assigned = if (Random.nextBoolean()) "A" else "B"
        prefs.edit().putString(KEY_BUCKET, assigned).apply()
        return assigned
    }
}

