package com.divya.android.app

import android.content.Context
import android.util.Log
import com.divya.android.notifications.DivyaNotificationCenter
import com.divya.android.media.PrayerAudioPlayer
import com.divya.data.models.Prayer
import com.google.firebase.messaging.FirebaseMessaging
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.SupervisorJob
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch
import java.time.LocalDate
import java.util.TimeZone
import java.util.concurrent.atomic.AtomicBoolean

object DivyaRuntime {
    private const val TAG = "DivyaRuntime"

    private val appScope = CoroutineScope(SupervisorJob() + Dispatchers.IO)
    private val initialized = AtomicBoolean(false)
    private val audioTelemetryBuffer = mutableListOf<AudioTelemetryEvent>()

    private lateinit var applicationContext: Context
    private lateinit var sessionStore: SessionStore
    private lateinit var backendClient: BackendClient

    private val _sessionState = MutableStateFlow(SessionState())
    val sessionState: StateFlow<SessionState> = _sessionState.asStateFlow()
    private val _prayerCatalog = MutableStateFlow<List<Prayer>>(emptyList())
    val prayerCatalog: StateFlow<List<Prayer>> = _prayerCatalog.asStateFlow()
    private val _prayerEntitlements = MutableStateFlow<PrayerEntitlementSnapshot?>(null)
    val prayerEntitlements: StateFlow<PrayerEntitlementSnapshot?> = _prayerEntitlements.asStateFlow()
    private val _backendHealth = MutableStateFlow<BackendHealthStatus?>(null)
    val backendHealth: StateFlow<BackendHealthStatus?> = _backendHealth.asStateFlow()

    fun initialize(context: Context) {
        if (!initialized.compareAndSet(false, true)) {
            return
        }

        applicationContext = context.applicationContext
        sessionStore = SessionStore(applicationContext)
        backendClient = BackendClient(applicationContext)
        _sessionState.value = sessionStore.read()
        if (_sessionState.value.user?.isGuest == true) {
            _sessionState.value = SessionState()
            sessionStore.clear()
        }
        val detectedTimezone = TimeZone.getDefault().id.ifBlank { "UTC" }
        sessionStore.saveDetectedTimezone(detectedTimezone)
        DivyaNotificationCenter.ensureChannels(applicationContext)

        CrashReporter.install { throwable, metadata ->
            sendCrashBlocking(
                message = throwable.message ?: throwable.javaClass.simpleName,
                stackTrace = Log.getStackTraceString(throwable),
                metadata = metadata,
            )
        }

        appScope.launch {
            if (_sessionState.value.token != null) {
                refreshSession()
                registerPendingPushToken()
                prefetchPanchangCache()
            } else {
                prefetchPanchangCache()
            }
            warmPrayerCatalog()
            runCatching { refreshPrayerEntitlements() }.onFailure {
                Log.w(TAG, "Prayer entitlements refresh failed", it)
            }
            runCatching { checkBackendHealthDiagnostics() }.onFailure {
                Log.w(TAG, "Backend health diagnostics failed", it)
            }
        }

        fetchFirebasePushToken()
    }

    suspend fun login(email: String, password: String): SessionUser {
        val session = backendClient.login(email, password)
        persist(session)
        trackEvent("login_completed", mapOf("role" to (session.user?.role ?: "user")))
        registerPendingPushToken()
        prefetchPanchangCache()
        return session.user ?: error("Missing user after login")
    }

    suspend fun register(
        name: String,
        email: String,
        password: String,
        country: String,
        timezone: String,
    ): SessionUser {
        val session = backendClient.register(name, email, password, country, timezone)
        persist(session)
        trackEvent("register_completed", mapOf("country" to country, "timezone" to timezone))
        registerPendingPushToken()
        prefetchPanchangCache()
        return session.user ?: error("Missing user after registration")
    }

    suspend fun loginWithGoogle(idToken: String): SessionUser {
        val session = backendClient.loginWithGoogleIdToken(idToken)
        persist(session)
        trackEvent("login_completed", mapOf("method" to "google"))
        registerPendingPushToken()
        prefetchPanchangCache()
        return session.user ?: error("Missing user after Google login")
    }

    suspend fun refreshSession() {
        val token = _sessionState.value.token ?: return
        runCatching {
            val user = backendClient.me(token)
            persist(SessionState(token = token, user = user))
        }.onFailure {
            Log.w(TAG, "Session refresh failed", it)
            clearSession()
        }
    }

    suspend fun saveOnboarding(prayerFrequency: String, purpose: String, tradition: String) {
        val token = requireToken()
        backendClient.saveOnboarding(token, prayerFrequency, purpose, tradition)
        trackEvent(
            "onboarding_completed",
            mapOf(
                "frequency" to prayerFrequency,
                "purpose" to purpose,
                "tradition" to tradition,
            ),
        )
        refreshSession()
    }

    fun getDetectedTimezone(): String = sessionStore.getDetectedTimezone()

    suspend fun updateReminderSettings(
        morningEnabled: Boolean,
        eveningEnabled: Boolean,
        festivalAlerts: Boolean,
    ) {
        val token = requireToken()
        backendClient.updateProfile(
            token = token,
            updates = mapOf(
                "prayerReminders" to mapOf(
                    "morningEnabled" to morningEnabled,
                    "morningTime" to "07:00",
                    "eveningEnabled" to eveningEnabled,
                    "eveningTime" to "19:00",
                    "festivalAlerts" to festivalAlerts,
                ),
            ),
        )
        trackEvent(
            "reminders_updated",
            mapOf(
                "morningEnabled" to morningEnabled,
                "eveningEnabled" to eveningEnabled,
                "festivalAlerts" to festivalAlerts,
            ),
        )
        refreshSession()
    }

    suspend fun updateTimezone(timezone: String) {
        backendClient.updateProfile(
            token = requireToken(),
            updates = mapOf("timezone" to timezone.trim()),
        )
        trackEvent("timezone_updated", mapOf("timezone" to timezone.trim()))
        refreshSession()
    }

    suspend fun fetchBookings(): List<BookingSummary> {
        return backendClient.getBookings(requireToken())
    }

    suspend fun createBooking(request: BookingCreateRequest): BookingCreateResult {
        val result = backendClient.createBooking(requireToken(), request)
        trackEvent(
            "waitlist_joined",
            mapOf(
                "puja_name" to result.booking.pujaName,
                "booking_reference" to result.booking.bookingReference,
                "payment_required" to result.paymentRequired,
            ),
        )
        return result
    }

    suspend fun suggestGothram(devoteeName: String): GothramSuggestion {
        return backendClient.suggestGothram(requireToken(), devoteeName)
    }

    suspend fun suggestGothramGuided(input: GothramGuidanceInput): GothramGuidanceResult {
        return backendClient.suggestGothramGuided(requireToken(), input)
    }

    suspend fun submitContactForm(request: ContactFormRequest): ContactFormSubmitResult {
        val result = backendClient.submitContactForm(requireToken(), request)
        if (result.success) {
            trackEvent(
                "contact_form_submitted",
                mapOf(
                    "category" to request.category,
                    "request_id" to (result.requestId ?: ""),
                ),
            )
        }
        return result
    }

    suspend fun fetchVideoAccess(bookingId: String): VideoAccess {
        return backendClient.getVideoAccess(requireToken(), bookingId)
    }

    suspend fun fetchStreak(): UserStreakSummary {
        return backendClient.getStreak(requireToken())
    }

    suspend fun fetchStats(): UserStatsSummary {
        return backendClient.getStats(requireToken())
    }

    suspend fun markVideoWatched(bookingId: String) {
        backendClient.markVideoWatched(requireToken(), bookingId)
        trackEvent("video_completed", mapOf("booking_id" to bookingId, "watch_fraction" to 1.0))
    }

    suspend fun fetchDailyRecommendation(timezone: String): DailyRecommendationRemote {
        val token = _sessionState.value.token
        return backendClient.getDailyRecommendation(
            timezone = timezone,
            date = LocalDate.now().toString(),
            token = token,
        )
    }

    suspend fun fetchPrayerCatalog(
        query: String? = null,
        page: Int = 1,
        limit: Int = 200,
    ): List<Prayer> {
        val prayers = backendClient.getPrayers(page = page, limit = limit, query = query)
        _prayerCatalog.value = prayers
        return prayers
    }

    suspend fun fetchPrayerAudioMetadata(prayerId: String): PrayerAudioMetadata {
        return backendClient.getPrayerAudioMetadata(prayerId, _sessionState.value.token)
    }

    suspend fun refreshPrayerEntitlements(): PrayerEntitlementSnapshot {
        val snapshot = backendClient.getPrayerEntitlements(_sessionState.value.token)
        _prayerEntitlements.value = snapshot
        return snapshot
    }

    suspend fun fetchPrayerCatalogVersion(): PrayerCatalogVersion {
        return backendClient.getPrayerCatalogVersion()
    }

    suspend fun fetchPrayerAvailability(country: String, language: String): PrayerAvailabilitySummary {
        return backendClient.getPrayerAvailability(country, language, _sessionState.value.token)
    }

    suspend fun subscribeAudioComingSoon(prayerId: String, subscribe: Boolean = true) {
        val token = requireToken()
        backendClient.subscribeAudioComingSoon(token, prayerId, subscribe)
    }

    suspend fun reportPrayerTextIssue(
        prayerId: String,
        suggestedText: String,
        currentText: String,
        category: String,
        note: String? = null,
    ) {
        backendClient.reportPrayerTextIssue(
            token = _sessionState.value.token,
            prayerId = prayerId,
            suggestedText = suggestedText,
            currentText = currentText,
            category = category,
            note = note,
        )
    }

    suspend fun checkBackendHealthDiagnostics(): BackendHealthStatus {
        val health = backendClient.getHealthStatus()
        _backendHealth.value = health
        trackEvent(
            "backend_health_checked",
            mapOf(
                "status" to health.status,
                "mongodb" to health.mongodb,
                "uptime_seconds" to health.uptimeSeconds,
            ),
        )
        return health
    }

    fun signOut() {
        runCatching { PrayerAudioPlayer.clearCurrent(reason = "sign_out") }
        clearSession()
        trackEvent("logout_completed")
    }

    fun trackScreen(route: String) {
        trackEvent("screen_view", mapOf("route" to route))
    }

    fun trackEvent(name: String, properties: Map<String, Any?> = emptyMap()) {
        appScope.launch {
            runCatching {
                backendClient.trackEvent(_sessionState.value.token, name, properties)
            }.onFailure {
                Log.w(TAG, "Event tracking failed for $name", it)
            }
        }
    }

    fun trackAudioTelemetry(name: String, properties: Map<String, Any?> = emptyMap()) {
        synchronized(audioTelemetryBuffer) {
            audioTelemetryBuffer += AudioTelemetryEvent(name = name, properties = properties)
        }
        if (audioTelemetryBuffer.size >= 6 || name == "pause") {
            flushAudioTelemetryBuffer()
        }
    }

    fun reportHandledError(throwable: Throwable, metadata: Map<String, Any?> = emptyMap()) {
        appScope.launch {
            runCatching {
                backendClient.reportCrash(
                    token = _sessionState.value.token,
                    message = throwable.message ?: throwable.javaClass.simpleName,
                    stackTrace = Log.getStackTraceString(throwable),
                    metadata = metadata,
                )
            }.onFailure {
                Log.w(TAG, "Handled error reporting failed", it)
            }
        }
    }

    fun registerPushToken(pushToken: String) {
        if (!::sessionStore.isInitialized) {
            return
        }

        sessionStore.savePendingPushToken(pushToken)
        appScope.launch {
            registerPendingPushToken()
        }
    }

    private fun fetchFirebasePushToken() {
        runCatching {
            FirebaseMessaging.getInstance().token
                .addOnSuccessListener { token ->
                    if (!token.isNullOrBlank()) {
                        registerPushToken(token)
                    }
                }
                .addOnFailureListener {
                    Log.w(TAG, "Firebase token fetch failed", it)
                }
        }.onFailure {
            Log.w(TAG, "Firebase not configured on this build", it)
        }
    }

    private suspend fun registerPendingPushToken() {
        val token = _sessionState.value.token ?: return
        val pushToken = sessionStore.getPendingPushToken() ?: return
        runCatching {
            backendClient.registerDevice(token, pushToken)
            sessionStore.clearPendingPushToken()
            trackEvent("push_token_registered", mapOf("platform" to "android"))
        }.onFailure {
            Log.w(TAG, "Push token registration failed", it)
        }
    }

    private fun sendCrashBlocking(message: String, stackTrace: String?, metadata: Map<String, Any?>) {
        if (!::backendClient.isInitialized) {
            return
        }

        runCatching {
            backendClient.reportCrashBlocking(
                token = _sessionState.value.token,
                message = message,
                stackTrace = stackTrace,
                metadata = metadata,
            )
        }.onFailure {
            Log.w(TAG, "Crash upload failed", it)
        }
    }

    private fun persist(session: SessionState) {
        _sessionState.value = session
        val token = session.token
        val user = session.user
        if (!token.isNullOrBlank() && user != null) {
            sessionStore.save(token, user)
        }
    }

    private fun clearSession() {
        _sessionState.value = SessionState()
        if (::sessionStore.isInitialized) {
            sessionStore.clear()
        }
    }

    private fun requireToken(): String {
        return _sessionState.value.token ?: error("Authentication required")
    }

    private fun prefetchPanchangCache() {
        appScope.launch {
            val timezone = _sessionState.value.user?.timezone?.ifBlank { null }
                ?: sessionStore.getDetectedTimezone()
            runCatching {
                val upcoming = backendClient.getPanchangUpcoming(timezone, days = 30)
                sessionStore.saveCachedPanchang(upcoming)
                trackEvent(
                    "panchang_prefetched",
                    mapOf("days" to 30, "timezone" to timezone),
                )
            }.onFailure {
                Log.w(TAG, "Panchang prefetch failed; offline cache unchanged", it)
            }
        }
    }

    private fun warmPrayerCatalog() {
        appScope.launch {
            runCatching {
                val prayers = backendClient.getPrayers(limit = 250)
                _prayerCatalog.value = prayers
                trackEvent(
                    "prayer_catalog_refreshed",
                    mapOf("count" to prayers.size),
                )
            }.onFailure {
                Log.w(TAG, "Prayer catalog refresh failed", it)
            }
        }
    }

    private fun flushAudioTelemetryBuffer() {
        appScope.launch {
            val batch = synchronized(audioTelemetryBuffer) {
                if (audioTelemetryBuffer.isEmpty()) return@launch
                val copy = audioTelemetryBuffer.toList()
                audioTelemetryBuffer.clear()
                copy
            }
            runCatching {
                backendClient.trackAudioTelemetryBatch(
                    token = _sessionState.value.token,
                    events = batch,
                )
            }.onFailure {
                Log.w(TAG, "Audio telemetry batch upload failed", it)
                synchronized(audioTelemetryBuffer) {
                    audioTelemetryBuffer.addAll(0, batch.take(12))
                }
            }
        }
    }
}
