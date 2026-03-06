package com.divya.android.app

import android.content.Context
import android.os.Build
import com.divya.android.BuildConfig
import com.divya.data.models.Deity
import com.divya.data.models.LocalizedText
import com.divya.data.models.Prayer
import com.divya.data.models.PrayerContent
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext
import okhttp3.MediaType.Companion.toMediaType
import okhttp3.OkHttpClient
import okhttp3.Request
import okhttp3.RequestBody.Companion.toRequestBody
import org.json.JSONArray
import org.json.JSONObject
import java.io.IOException
import java.net.URLEncoder
import java.nio.charset.StandardCharsets
import java.util.Locale
import java.util.concurrent.TimeUnit
import java.time.LocalDate
import java.time.Instant

class BackendClient(private val context: Context) {
    private val client = OkHttpClient.Builder()
        .connectTimeout(20, TimeUnit.SECONDS)
        .readTimeout(60, TimeUnit.SECONDS)
        .writeTimeout(60, TimeUnit.SECONDS)
        .build()

    private val jsonMediaType = "application/json; charset=utf-8".toMediaType()
    private val baseApiUrl: String by lazy { resolveBaseApiUrl() }

    suspend fun login(email: String, password: String): SessionState = withContext(Dispatchers.IO) {
        parseSession(
            request(
                method = "POST",
                path = "/auth/login",
                payload = jsonOf(
                    "email" to email.trim(),
                    "password" to password,
                ),
            ),
        )
    }

    suspend fun register(
        name: String,
        email: String,
        password: String,
        country: String,
        timezone: String,
    ): SessionState = withContext(Dispatchers.IO) {
        parseSession(
            request(
                method = "POST",
                path = "/auth/register",
                payload = jsonOf(
                    "name" to name.trim(),
                    "email" to email.trim(),
                    "password" to password,
                    "country" to country,
                    "timezone" to timezone,
                ),
            ),
        )
    }

    suspend fun createGuest(sessionsBeforeSignup: Int): SessionState = withContext(Dispatchers.IO) {
        parseSession(
            request(
                method = "POST",
                path = "/auth/guest",
                payload = jsonOf("sessionsBeforeSignup" to sessionsBeforeSignup),
            ),
        )
    }

    suspend fun me(token: String): SessionUser = withContext(Dispatchers.IO) {
        val root = JSONObject(request(method = "GET", path = "/auth/me", token = token))
        parseUser(root.getJSONObject("user"))
    }

    suspend fun saveOnboarding(
        token: String,
        prayerFrequency: String,
        purpose: String,
        tradition: String,
    ) = withContext(Dispatchers.IO) {
        request(
            method = "PUT",
            path = "/users/onboarding",
            token = token,
            payload = jsonOf(
                "prayerFrequency" to prayerFrequency,
                "purpose" to purpose,
                "tradition" to tradition,
            ),
        )
    }

    suspend fun updateProfile(token: String, updates: Map<String, Any?>) = withContext(Dispatchers.IO) {
        request(
            method = "PUT",
            path = "/users/profile",
            token = token,
            payload = jsonOf(updates),
        )
    }

    suspend fun getBookings(token: String): List<BookingSummary> = withContext(Dispatchers.IO) {
        val root = JSONArray(request(method = "GET", path = "/bookings", token = token))
        buildList {
            for (index in 0 until root.length()) {
                add(parseBookingSummary(root.getJSONObject(index)))
            }
        }
    }

    suspend fun createBooking(
        token: String,
        bookingRequest: BookingCreateRequest,
    ): BookingCreateResult = withContext(Dispatchers.IO) {
        val payload = mutableMapOf<String, Any?>(
            "pujaId" to bookingRequest.pujaId,
            "devoteeName" to bookingRequest.devoteeName,
            "gothram" to bookingRequest.gothram,
            "nakshatra" to bookingRequest.nakshatra,
            "prayerIntention" to bookingRequest.prayerIntention,
            "currency" to bookingRequest.currency,
        )
        if (bookingRequest.requestedDateRange != null) {
            payload["requestedDateRange"] = bookingRequest.requestedDateRange
        }

        val root = JSONObject(
            request(
                method = "POST",
                path = "/bookings",
                token = token,
                payload = jsonOf(payload),
            ),
        )
        val booking = parseBookingSummary(root.getJSONObject("booking"))
        BookingCreateResult(
            booking = booking,
            paymentRequired = root.optBoolean("paymentRequired", false),
            clientSecret = root.optString("clientSecret").takeIf { !it.isNullOrBlank() },
        )
    }

    suspend fun suggestGothram(token: String, devoteeName: String): GothramSuggestion = withContext(Dispatchers.IO) {
        val guided = suggestGothramGuided(
            token = token,
            input = GothramGuidanceInput(devoteeName = devoteeName),
        )
        GothramSuggestion(
            gothram = guided.gothram,
            confidence = guided.confidence,
            source = guided.source,
        )
    }

    suspend fun suggestGothramGuided(
        token: String,
        input: GothramGuidanceInput,
    ): GothramGuidanceResult = withContext(Dispatchers.IO) {
        val root = JSONObject(
            request(
                method = "POST",
                path = "/bookings/gothram-suggest",
                token = token,
                payload = jsonOf(
                    "devoteeName" to input.devoteeName.trim(),
                    "surnameCommunity" to input.surnameCommunity,
                    "familyRegion" to input.familyRegion,
                    "knownFamilyGothram" to input.knownFamilyGothram,
                ),
            ),
        )
        GothramGuidanceResult(
            gothram = root.optString("gothram", "Unknown"),
            confidence = root.optString("confidence", "none"),
            source = root.optString("source", "backend"),
            guidanceText = root.optString(
                "guidanceText",
                "No reliable match found. Continue with Unknown and update later if needed.",
            ),
        )
    }

    suspend fun submitContactForm(
        token: String,
        requestBody: ContactFormRequest,
    ): ContactFormSubmitResult = withContext(Dispatchers.IO) {
        val payload = jsonOf(
            "name" to requestBody.name.trim(),
            "email" to requestBody.email.trim(),
            "category" to requestBody.category,
            "subject" to requestBody.subject.trim(),
            "message" to requestBody.message.trim(),
            "context" to mapOf(
                "bookingReference" to requestBody.bookingReference,
                "appVersion" to requestBody.appVersion,
                "platform" to requestBody.platform,
                "screen" to requestBody.screen,
            ),
        )

        val root = JSONObject(
            request(
                method = "POST",
                path = "/users/contact",
                token = token,
                payload = payload,
            ),
        )

        ContactFormSubmitResult(
            success = root.optBoolean("success", false),
            requestId = root.optString("requestId").takeIf { !it.isNullOrBlank() },
            status = root.optString("status").takeIf { !it.isNullOrBlank() },
        )
    }

    suspend fun getVideoAccess(token: String, bookingId: String): VideoAccess = withContext(Dispatchers.IO) {
        val root = JSONObject(request(method = "GET", path = "/bookings/$bookingId/video", token = token))
        VideoAccess(
            streamUrl = root.getString("url"),
            shareUrl = root.optString("shareUrl").takeIf { !it.isNullOrBlank() },
        )
    }

    suspend fun markVideoWatched(token: String, bookingId: String) = withContext(Dispatchers.IO) {
        request(method = "POST", path = "/bookings/$bookingId/video/watched", token = token, payload = JSONObject())
    }

    suspend fun getPanchangToday(timezone: String): String = withContext(Dispatchers.IO) {
        val encodedTz = URLEncoder.encode(timezone, StandardCharsets.UTF_8.toString())
        request(method = "GET", path = "/panchang/today?timezone=$encodedTz")
    }

    suspend fun getPanchangUpcoming(timezone: String, days: Int = 30): String = withContext(Dispatchers.IO) {
        val normalizedDays = days.coerceIn(1, 60)
        val encodedTz = URLEncoder.encode(timezone, StandardCharsets.UTF_8.toString())
        request(method = "GET", path = "/panchang/upcoming?timezone=$encodedTz&days=$normalizedDays")
    }

    suspend fun getDailyRecommendation(
        timezone: String,
        date: String = LocalDate.now().toString(),
        token: String? = null,
    ): DailyRecommendationRemote = withContext(Dispatchers.IO) {
        val encodedTz = URLEncoder.encode(timezone, StandardCharsets.UTF_8.toString())
        val encodedDate = URLEncoder.encode(date, StandardCharsets.UTF_8.toString())
        val root = JSONObject(
            request(
                method = "GET",
                path = "/prayers/daily-recommendation?timezone=$encodedTz&date=$encodedDate",
                token = token,
            ),
        )
        val prayer = root.optJSONObject("prayer")
        DailyRecommendationRemote(
            prayerId = prayer?.optString("_id")?.takeIf { !it.isNullOrBlank() },
            prayerTitle = prayer
                ?.optJSONObject("title")
                ?.optString("en")
                ?.takeIf { !it.isNullOrBlank() },
            reason = root.optString("reason", "Today's prayer is selected from panchang and devotional signals."),
            festival = root.optString("festival").takeIf { !it.isNullOrBlank() },
            tithiName = root.optJSONObject("tithi")?.optString("name")?.takeIf { !it.isNullOrBlank() },
        )
    }

    suspend fun getPrayers(
        page: Int = 1,
        limit: Int = 200,
        query: String? = null,
    ): List<Prayer> = withContext(Dispatchers.IO) {
        val params = mutableListOf(
            "page=${page.coerceAtLeast(1)}",
            "limit=${limit.coerceIn(1, 300)}",
        )
        if (!query.isNullOrBlank()) {
            params += "q=${URLEncoder.encode(query.trim(), StandardCharsets.UTF_8.toString())}"
        }
        val root = JSONArray(request(method = "GET", path = "/prayers?${params.joinToString("&")}"))
        buildList {
            for (index in 0 until root.length()) {
                add(parsePrayer(root.getJSONObject(index)))
            }
        }
    }

    suspend fun getPrayerAudioMetadata(prayerId: String, token: String? = null): PrayerAudioMetadata =
        withContext(Dispatchers.IO) {
        val response = requestRaw(
            method = "GET",
            path = "/prayers/$prayerId/audio",
            token = token,
            acceptedStatusCodes = setOf(200, 402),
        )
            val root = if (response.code == 402) {
                JSONObject(response.body).optJSONObject("metadata") ?: JSONObject()
            } else {
                JSONObject(response.body)
            }
            PrayerAudioMetadata(
                prayerId = root.optString("prayerId", prayerId),
                url = root.optString("url").takeIf { !it.isNullOrBlank() },
                streamUrl = root.optString("streamUrl").takeIf { !it.isNullOrBlank() },
                codec = root.optString("codec").takeIf { !it.isNullOrBlank() },
                durationSeconds = root.optInt("durationSeconds", 0),
                licenseTag = root.optString("licenseTag").takeIf { !it.isNullOrBlank() },
                qualityLabel = root.optString("qualityLabel").takeIf { !it.isNullOrBlank() },
                sourceLabel = root.optString("sourceLabel").takeIf { !it.isNullOrBlank() },
                checksumSha256 = root.optString("checksumSha256").takeIf { !it.isNullOrBlank() },
                version = root.optInt("version", 1),
                requiredTier = root.optString("requiredTier", "free"),
                entitled = root.optBoolean("entitled", response.code != 402),
                audioComingSoon = root.optBoolean("audioComingSoon", false),
                audioComingSoonSubscribed = root.optBoolean("audioComingSoonSubscribed", false),
            )
        }

    suspend fun getPrayerEntitlements(token: String? = null): PrayerEntitlementSnapshot = withContext(Dispatchers.IO) {
        val root = JSONObject(request(method = "GET", path = "/prayers/entitlements", token = token))
        val entitlementsJson = root.optJSONArray("entitlements") ?: JSONArray()
        val entries = buildList {
            for (index in 0 until entitlementsJson.length()) {
                val item = entitlementsJson.getJSONObject(index)
                add(
                    PrayerEntitlement(
                        prayerId = item.optString("prayerId"),
                        requiredTier = item.optString("requiredTier", "free"),
                        entitled = item.optBoolean("entitled", false),
                    ),
                )
            }
        }
        PrayerEntitlementSnapshot(
            userTier = root.optString("userTier", "free"),
            entitlements = entries,
        )
    }

    suspend fun getPrayerCatalogVersion(): PrayerCatalogVersion = withContext(Dispatchers.IO) {
        val root = JSONObject(request(method = "GET", path = "/prayers/catalog/version"))
        PrayerCatalogVersion(
            totalPrayers = root.optInt("totalPrayers", 0),
            latestUpdatedAt = root.optString("latestUpdatedAt").takeIf { !it.isNullOrBlank() },
            latestContentVersion = root.optInt("latestContentVersion", 1),
        )
    }

    suspend fun getPrayerAvailability(
        country: String,
        language: String,
        token: String? = null,
    ): PrayerAvailabilitySummary = withContext(Dispatchers.IO) {
        val encodedCountry = URLEncoder.encode(country, StandardCharsets.UTF_8.toString())
        val encodedLanguage = URLEncoder.encode(language, StandardCharsets.UTF_8.toString())
        val root = JSONObject(
            request(
                method = "GET",
                path = "/prayers/availability?country=$encodedCountry&language=$encodedLanguage",
                token = token,
            ),
        )
        val bundles = root.optJSONObject("bundles") ?: JSONObject()
        PrayerAvailabilitySummary(
            country = root.optString("country", country),
            language = root.optString("language", language),
            totalPrayers = root.optInt("totalPrayers", 0),
            languageReadyCount = root.optInt("languageReadyCount", 0),
            freeCount = bundles.optInt("free", 0),
            bhaktCount = bundles.optInt("bhakt", 0),
            sevaCount = bundles.optInt("seva", 0),
        )
    }

    suspend fun subscribeAudioComingSoon(token: String, prayerId: String, subscribe: Boolean = true) =
        withContext(Dispatchers.IO) {
            request(
                method = "POST",
                path = "/prayers/$prayerId/audio-coming-soon",
                token = token,
                payload = jsonOf("subscribe" to subscribe),
            )
        }

    suspend fun reportPrayerTextIssue(
        token: String?,
        prayerId: String,
        suggestedText: String,
        currentText: String,
        category: String,
        note: String? = null,
    ) = withContext(Dispatchers.IO) {
        request(
            method = "POST",
            path = "/prayers/$prayerId/report-text-issue",
            token = token,
            payload = jsonOf(
                "suggestedText" to suggestedText,
                "currentText" to currentText,
                "category" to category,
                "note" to note,
            ),
        )
    }

    suspend fun getHealthStatus(): BackendHealthStatus = withContext(Dispatchers.IO) {
        val root = JSONObject(request(method = "GET", path = "/observability/health"))
        val services = root.optJSONObject("services") ?: JSONObject()
        BackendHealthStatus(
            status = root.optString("status", "unknown"),
            requestId = root.optString("requestId").takeIf { !it.isNullOrBlank() },
            uptimeSeconds = root.optDouble("uptimeSeconds", 0.0),
            mongodb = services.optString("mongodb", "unknown"),
        )
    }

    suspend fun getStreak(token: String): UserStreakSummary = withContext(Dispatchers.IO) {
        val root = JSONObject(request(method = "GET", path = "/users/streak", token = token))
        UserStreakSummary(
            current = root.optInt("current", 0),
            longest = root.optInt("longest", 0),
            totalDaysEver = root.optInt("totalDaysEver", 0),
            graceUsed = root.optBoolean("graceUsed", false),
        )
    }

    suspend fun getStats(token: String): UserStatsSummary = withContext(Dispatchers.IO) {
        val root = JSONObject(request(method = "GET", path = "/users/stats", token = token))
        UserStatsSummary(
            prayersCompleted = root.optInt("prayersCompleted", 0),
            minutesPrayed = root.optInt("minutesPrayed", 0),
            streakDays = root.optInt("streakDays", 0),
        )
    }

    suspend fun registerDevice(token: String, deviceToken: String) = withContext(Dispatchers.IO) {
        request(
            method = "POST",
            path = "/users/devices",
            token = token,
            payload = jsonOf(
                "token" to deviceToken,
                "platform" to BuildConfig.APP_PLATFORM,
                "appVersion" to appVersion(),
                "locale" to Locale.getDefault().toLanguageTag(),
            ),
        )
    }

    suspend fun trackEvent(token: String?, name: String, properties: Map<String, Any?> = emptyMap()) =
        withContext(Dispatchers.IO) {
            request(
                method = "POST",
                path = "/observability/events",
                token = token,
                payload = jsonOf(
                    "name" to name,
                    "platform" to BuildConfig.APP_PLATFORM,
                    "appVersion" to appVersion(),
                    "properties" to properties,
                ),
            )
        }

    suspend fun trackAudioTelemetryBatch(
        token: String?,
        events: List<AudioTelemetryEvent>,
    ) = withContext(Dispatchers.IO) {
        if (events.isEmpty()) return@withContext
        val payload = events.map { event ->
            mapOf(
                "name" to event.name,
                "timestamp" to event.timestampIso,
                "platform" to BuildConfig.APP_PLATFORM,
                "appVersion" to appVersion(),
                "properties" to event.properties,
            )
        }
        request(
            method = "POST",
            path = "/observability/audio-telemetry/batch",
            token = token,
            payload = jsonOf(
                "platform" to BuildConfig.APP_PLATFORM,
                "appVersion" to appVersion(),
                "events" to payload,
            ),
        )
    }

    suspend fun reportCrash(
        token: String?,
        message: String,
        stackTrace: String?,
        metadata: Map<String, Any?> = emptyMap(),
    ) = withContext(Dispatchers.IO) {
        request(
            method = "POST",
            path = "/observability/crashes",
            token = token,
            payload = jsonOf(
                "platform" to BuildConfig.APP_PLATFORM,
                "appVersion" to appVersion(),
                "message" to message,
                "stackTrace" to stackTrace,
                "metadata" to metadata,
            ),
        )
    }

    fun reportCrashBlocking(
        token: String?,
        message: String,
        stackTrace: String?,
        metadata: Map<String, Any?> = emptyMap(),
    ) {
        request(
            method = "POST",
            path = "/observability/crashes",
            token = token,
            payload = jsonOf(
                "platform" to BuildConfig.APP_PLATFORM,
                "appVersion" to appVersion(),
                "message" to message,
                "stackTrace" to stackTrace,
                "metadata" to metadata,
            ),
        )
    }

    private fun parseSession(responseBody: String): SessionState {
        val root = JSONObject(responseBody)
        val user = parseUser(root.getJSONObject("user"))
        return SessionState(token = root.getString("token"), user = user)
    }

    private fun parseUser(user: JSONObject): SessionUser {
        return SessionUser(
            id = user.optString("id", user.optString("_id")),
            name = user.optString("name"),
            email = user.optString("email"),
            role = user.optString("role", "user"),
            country = user.optString("country", "US"),
            timezone = user.optString("timezone", "America/New_York"),
            currency = user.optString("currency", "USD"),
            isGuest = user.optBoolean("isGuest", false),
        )
    }

    private fun parsePrayer(payload: JSONObject): Prayer {
        val deityJson = payload.optJSONObject("deity")
        val titleJson = payload.optJSONObject("title") ?: JSONObject()
        val contentJson = payload.optJSONObject("content") ?: JSONObject()

        val deity = deityJson?.let {
            Deity(
                id = it.optString("_id", it.optString("id")),
                slug = it.optString("slug"),
                name = LocalizedText(
                    en = it.optJSONObject("name")?.optString("en") ?: it.optString("name"),
                    ml = it.optJSONObject("name")?.optString("ml").takeUnless { value -> value.isNullOrBlank() },
                    sa = it.optJSONObject("name")?.optString("sa").takeUnless { value -> value.isNullOrBlank() },
                ),
                shortDescription = it.optString("shortDescription", ""),
                fullDescription = it.optString("fullDescription", ""),
                pronunciationGuide = it.optString("pronunciationGuide").takeUnless { value -> value.isNullOrBlank() },
                tradition = it.optString("tradition", ""),
                order = it.optInt("order", 0),
            )
        }

        val repetitions = payload.optJSONArray("recommendedRepetitions") ?: JSONArray()
        val repetitionList = buildList {
            for (index in 0 until repetitions.length()) {
                add(repetitions.optInt(index))
            }
        }
        val tagsJson = payload.optJSONArray("tags") ?: JSONArray()
        val tags = buildList {
            for (index in 0 until tagsJson.length()) {
                tagsJson.optString(index).takeIf { it.isNotBlank() }?.let(::add)
            }
        }

        return Prayer(
            id = payload.optString("id", payload.optString("_id")),
            deity = deity,
            title = LocalizedText(
                en = titleJson.optString("en", payload.optString("title")),
                ml = titleJson.optString("ml").takeUnless { value -> value.isNullOrBlank() },
                sa = titleJson.optString("sa").takeUnless { value -> value.isNullOrBlank() },
            ),
            slug = payload.optString("slug", ""),
            type = payload.optString("type", "prayer"),
            difficulty = payload.optString("difficulty", "beginner"),
            durationMinutes = payload.optInt("durationMinutes", 0),
            transliteration = payload.optString("transliteration").takeUnless { value -> value.isNullOrBlank() },
            content = PrayerContent(
                devanagari = contentJson.optString("devanagari").takeUnless { value -> value.isNullOrBlank() },
                malayalam = contentJson.optString("malayalam").takeUnless { value -> value.isNullOrBlank() },
                english = contentJson.optString("english").takeUnless { value -> value.isNullOrBlank() },
            ),
            iast = payload.optString("iast").takeUnless { value -> value.isNullOrBlank() },
            beginnerNote = payload.optString("beginnerNote").takeUnless { value -> value.isNullOrBlank() },
            meaning = payload.optString("meaning").takeUnless { value -> value.isNullOrBlank() },
            audioUrl = payload.optString("audioUrl").takeUnless { value -> value.isNullOrBlank() },
            coverImageUrl = payload.optString("coverImageUrl").takeUnless { value -> value.isNullOrBlank() },
            recommendedRepetitions = repetitionList.filter { it > 0 },
            isPremium = payload.optBoolean("isPremium", false),
            isFeatured = payload.optBoolean("isFeatured", false),
            tags = tags,
            order = payload.optInt("order", 0),
        )
    }

    private fun parseBookingSummary(item: JSONObject): BookingSummary {
        val puja = item.optJSONObject("puja")
        val temple = item.optJSONObject("temple")
        return BookingSummary(
            id = item.optString("_id", item.optString("id")),
            bookingReference = item.optString("bookingReference"),
            status = item.optString("status"),
            waitlistPosition = item.optInt("waitlistPosition").takeIf { it > 0 },
            paymentStatus = item.optString("paymentStatus"),
            pujaName = puja?.optJSONObject("name")?.optString("en").orEmpty(),
            templeName = temple?.optJSONObject("name")?.optString("en").orEmpty(),
            prayerIntention = item.optString("prayerIntention"),
            hasVideo = item.optString("status") == "video_ready" || !item.optString("videoStorageId").isNullOrBlank(),
        )
    }

    private fun request(
        method: String,
        path: String,
        token: String? = null,
        payload: JSONObject? = null,
    ): String {
        return requestRaw(method, path, token, payload).body
    }

    private fun requestRaw(
        method: String,
        path: String,
        token: String? = null,
        payload: JSONObject? = null,
        acceptedStatusCodes: Set<Int> = setOf(200, 201),
    ): HttpResponsePayload {
        var lastError: Throwable? = null
        val maxAttempts = 3

        for (attempt in 1..maxAttempts) {
            try {
                return executeRequest(method, path, token, payload, acceptedStatusCodes)
            } catch (error: Throwable) {
                lastError = error
                if (attempt >= maxAttempts || !shouldRetry(error)) {
                    break
                }
                val backoffMs = 300L * (1L shl (attempt - 1))
                runCatching { Thread.sleep(backoffMs) }
            }
        }

        throw (lastError ?: IOException("Request failed"))
    }

    private fun executeRequest(
        method: String,
        path: String,
        token: String? = null,
        payload: JSONObject? = null,
        acceptedStatusCodes: Set<Int> = setOf(200, 201),
    ): HttpResponsePayload {
        val builder = Request.Builder().url("$baseApiUrl$path")
        if (!token.isNullOrBlank()) {
            builder.header("Authorization", "Bearer $token")
        }

        when (method) {
            "GET" -> builder.get()
            "POST" -> builder.post((payload ?: JSONObject()).toString().toRequestBody(jsonMediaType))
            "PUT" -> builder.put((payload ?: JSONObject()).toString().toRequestBody(jsonMediaType))
            "DELETE" -> builder.delete((payload ?: JSONObject()).toString().toRequestBody(jsonMediaType))
            else -> error("Unsupported method $method")
        }

        client.newCall(builder.build()).execute().use { response ->
            val body = response.body?.string().orEmpty()
            if (!acceptedStatusCodes.contains(response.code)) {
                throw IOException(parseError(body).ifBlank { "Request failed: ${response.code}" })
            }
            return HttpResponsePayload(response.code, body)
        }
    }

    private fun shouldRetry(error: Throwable): Boolean {
        val message = error.message.orEmpty()
        if (error is IOException) {
            return !message.contains("401") && !message.contains("402") && !message.contains("403") && !message.contains("404")
        }
        return false
    }

    private fun parseError(body: String): String {
        if (body.isBlank()) return ""
        return runCatching { JSONObject(body).optString("message") }.getOrNull().orEmpty()
    }

    private fun jsonOf(vararg entries: Pair<String, Any?>): JSONObject = jsonOf(entries.toMap())

    private fun resolveBaseApiUrl(): String {
        val emulatorBase = BuildConfig.DIVYA_API_URL.trim()
        val deviceBase = BuildConfig.DIVYA_API_URL_DEVICE.trim()
        val isEmulatorHost = emulatorBase.contains("10.0.2.2")
        return if (isEmulatorHost && !isProbablyEmulator() && deviceBase.isNotBlank()) {
            deviceBase
        } else {
            emulatorBase
        }
    }

    private fun isProbablyEmulator(): Boolean {
        return Build.FINGERPRINT.startsWith("generic", ignoreCase = true) ||
            Build.MODEL.contains("Emulator", ignoreCase = true) ||
            Build.MODEL.contains("Android SDK built for", ignoreCase = true) ||
            Build.PRODUCT.contains("sdk", ignoreCase = true)
    }

    private fun jsonOf(entries: Map<String, Any?>): JSONObject {
        val json = JSONObject()
        entries.forEach { (key, value) ->
            json.put(key, value.toJsonValue())
        }
        return json
    }

    private fun Any?.toJsonValue(): Any? {
        return when (this) {
            null -> JSONObject.NULL
            is Map<*, *> -> {
                val nested = JSONObject()
                entries.forEach { (key, value) ->
                    if (key is String) {
                        nested.put(key, value.toJsonValue())
                    }
                }
                nested
            }
            is Iterable<*> -> JSONArray().apply {
                for (item in this@toJsonValue) {
                    put(item.toJsonValue())
                }
            }
            else -> this
        }
    }

    private fun appVersion(): String {
        val packageInfo = context.packageManager.getPackageInfo(context.packageName, 0)
        return if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.P) {
            packageInfo.longVersionCode.toString()
        } else {
            @Suppress("DEPRECATION")
            packageInfo.versionCode.toString()
        }
    }
}

data class DailyRecommendationRemote(
    val prayerId: String?,
    val prayerTitle: String?,
    val reason: String,
    val festival: String?,
    val tithiName: String?,
)

data class AudioTelemetryEvent(
    val name: String,
    val properties: Map<String, Any?>,
    val timestampIso: String = Instant.now().toString(),
)

private data class HttpResponsePayload(
    val code: Int,
    val body: String,
)
