package com.divya.android.app

import android.content.Context
import android.content.SharedPreferences
import androidx.security.crypto.EncryptedSharedPreferences
import androidx.security.crypto.MasterKey

class SessionStore(context: Context) {
    private val prefs: SharedPreferences = runCatching {
        val masterKey = MasterKey.Builder(context)
            .setKeyScheme(MasterKey.KeyScheme.AES256_GCM)
            .build()
        EncryptedSharedPreferences.create(
            context,
            PREFS_NAME,
            masterKey,
            EncryptedSharedPreferences.PrefKeyEncryptionScheme.AES256_SIV,
            EncryptedSharedPreferences.PrefValueEncryptionScheme.AES256_GCM,
        )
    }.getOrElse {
        context.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE)
    }

    fun read(): SessionState {
        val token = prefs.getString(KEY_TOKEN, null)
        val userId = prefs.getString(KEY_USER_ID, null)
        if (token.isNullOrBlank() || userId.isNullOrBlank()) {
            return SessionState()
        }

        return SessionState(
            token = token,
            user = SessionUser(
                id = userId,
                name = prefs.getString(KEY_NAME, "").orEmpty(),
                email = prefs.getString(KEY_EMAIL, "").orEmpty(),
                role = prefs.getString(KEY_ROLE, "user").orEmpty(),
                country = prefs.getString(KEY_COUNTRY, "US").orEmpty(),
                timezone = prefs.getString(KEY_TIMEZONE, "America/New_York").orEmpty(),
                currency = prefs.getString(KEY_CURRENCY, "USD").orEmpty(),
                isGuest = prefs.getBoolean(KEY_IS_GUEST, false),
            ),
        )
    }

    fun save(token: String, user: SessionUser) {
        prefs.edit()
            .putString(KEY_TOKEN, token)
            .putString(KEY_USER_ID, user.id)
            .putString(KEY_NAME, user.name)
            .putString(KEY_EMAIL, user.email)
            .putString(KEY_ROLE, user.role)
            .putString(KEY_COUNTRY, user.country)
            .putString(KEY_TIMEZONE, user.timezone)
            .putString(KEY_CURRENCY, user.currency)
            .putBoolean(KEY_IS_GUEST, user.isGuest)
            .apply()
    }

    fun clear() {
        prefs.edit()
            .remove(KEY_TOKEN)
            .remove(KEY_USER_ID)
            .remove(KEY_NAME)
            .remove(KEY_EMAIL)
            .remove(KEY_ROLE)
            .remove(KEY_COUNTRY)
            .remove(KEY_TIMEZONE)
            .remove(KEY_CURRENCY)
            .remove(KEY_IS_GUEST)
            .remove(KEY_CACHED_PANCHANG_JSON)
            .remove(KEY_DETECTED_TIMEZONE)
            .apply()
    }

    fun savePendingPushToken(pushToken: String) {
        prefs.edit().putString(KEY_PENDING_PUSH_TOKEN, pushToken).apply()
    }

    fun getPendingPushToken(): String? = prefs.getString(KEY_PENDING_PUSH_TOKEN, null)

    fun clearPendingPushToken() {
        prefs.edit().remove(KEY_PENDING_PUSH_TOKEN).apply()
    }

    fun saveDetectedTimezone(timezone: String) {
        prefs.edit().putString(KEY_DETECTED_TIMEZONE, timezone).apply()
    }

    fun getDetectedTimezone(): String {
        return prefs.getString(KEY_DETECTED_TIMEZONE, null)
            ?: prefs.getString(KEY_TIMEZONE, "America/New_York")
            ?: "America/New_York"
    }

    fun saveCachedPanchang(json: String) {
        prefs.edit().putString(KEY_CACHED_PANCHANG_JSON, json).apply()
    }

    fun getCachedPanchang(): String? = prefs.getString(KEY_CACHED_PANCHANG_JSON, null)

    companion object {
        private const val PREFS_NAME = "divya.runtime"
        private const val KEY_TOKEN = "token"
        private const val KEY_USER_ID = "user_id"
        private const val KEY_NAME = "name"
        private const val KEY_EMAIL = "email"
        private const val KEY_ROLE = "role"
        private const val KEY_COUNTRY = "country"
        private const val KEY_TIMEZONE = "timezone"
        private const val KEY_CURRENCY = "currency"
        private const val KEY_IS_GUEST = "is_guest"
        private const val KEY_PENDING_PUSH_TOKEN = "pending_push_token"
        private const val KEY_DETECTED_TIMEZONE = "detected_timezone"
        private const val KEY_CACHED_PANCHANG_JSON = "cached_panchang_json"
    }
}
