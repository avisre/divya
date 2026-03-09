package com.divya.android.ui.screens

import android.animation.ValueAnimator
import android.net.Uri
import android.util.Patterns
import android.view.Choreographer
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.heightIn
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.itemsIndexed
import androidx.compose.foundation.lazy.rememberLazyListState
import androidx.compose.material3.Button
import androidx.compose.material3.LinearProgressIndicator
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.OutlinedButton
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.DisposableEffect
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.runtime.key
import androidx.compose.runtime.mutableFloatStateOf
import androidx.compose.runtime.mutableIntStateOf
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.rememberCoroutineScope
import androidx.compose.runtime.saveable.rememberSaveable
import androidx.compose.runtime.setValue
import androidx.compose.ui.Modifier
import androidx.compose.ui.platform.LocalConfiguration
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.unit.dp
import com.divya.android.BuildConfig
import com.divya.android.app.DivyaRuntime
import com.divya.android.app.PrayerAudioMetadata
import com.divya.android.livenotification.PrayerIslandNotification
import com.divya.android.media.PrayerAudioPlayer
import com.divya.android.navigation.DivyaRoutes
import com.divya.android.ui.components.MalaCounterCard
import com.divya.android.ui.components.PrayerAudioGuideCard
import com.divya.android.ui.theme.DeepBrown
import com.divya.android.ui.theme.TempleGold
import com.divya.data.models.Prayer
import kotlinx.coroutines.launch

@Composable
fun PrayerPlayerScreen(
    initialPrayerId: String? = null,
    onOpen: (String) -> Unit,
) {
    val context = LocalContext.current
    val isCompactPhone = LocalConfiguration.current.screenWidthDp < 380
    val scope = rememberCoroutineScope()
    val scriptPrefs = remember(context) {
        context.getSharedPreferences(SCRIPT_PREFS_NAME, android.content.Context.MODE_PRIVATE)
    }
    var selectedRep by rememberSaveable { mutableStateOf("21") }
    var selectedScript by rememberSaveable {
        mutableStateOf(
            scriptPrefs.getString(KEY_LAST_SCRIPT_TAB, "Devanagari/Malayalam")
                ?: "Devanagari/Malayalam",
        )
    }
    var selectedPrayerId by rememberSaveable { mutableStateOf(initialPrayerId ?: AppContent.gayatri.id) }
    var progress by rememberSaveable { mutableFloatStateOf(0.34f) }
    var audioProgress by rememberSaveable { mutableFloatStateOf(0f) }
    var malaCount by rememberSaveable { mutableIntStateOf(0) }
    var loopModeEnabled by rememberSaveable { mutableStateOf(false) }
    var loopCompleted by rememberSaveable(selectedRep, selectedPrayerId) { mutableIntStateOf(0) }
    var loopEdgeArmed by rememberSaveable { mutableStateOf(true) }
    var audioMetadata by remember(selectedPrayerId) { mutableStateOf<PrayerAudioMetadata?>(null) }
    var metadataError by remember(selectedPrayerId) { mutableStateOf<String?>(null) }
    var showFavoriteNudge by rememberSaveable { mutableStateOf(false) }
    var pendingAutoPlayPrayerId by rememberSaveable { mutableStateOf(initialPrayerId?.takeIf { it.isNotBlank() }) }
    var previousPlayingPrayerId by rememberSaveable { mutableStateOf<String?>(null) }
    val session by DivyaRuntime.sessionState.collectAsState()
    val playerState by PrayerAudioPlayer.state.collectAsState()
    val remoteCatalog by DivyaRuntime.prayerCatalog.collectAsState()
    val entitlementsSnapshot by DivyaRuntime.prayerEntitlements.collectAsState()
    val catalog = if (remoteCatalog.isNotEmpty()) remoteCatalog else AppContent.prayerLibrary108
    val entitlements = entitlementsSnapshot?.entitlements?.associateBy { it.prayerId }.orEmpty()
    PrayerFrameTraceEffect(screenName = "prayer_player")

    LaunchedEffect(initialPrayerId) {
        if (!initialPrayerId.isNullOrBlank()) {
            selectedPrayerId = initialPrayerId
            progress = 0f
            audioProgress = 0f
            malaCount = 0
            pendingAutoPlayPrayerId = initialPrayerId
        }
    }

    val selectedPrayer = remember(catalog, selectedPrayerId) {
        resolvePrayerSelection(catalog, selectedPrayerId)
    }
    val isAuthenticated = !session.token.isNullOrBlank() && session.user?.isGuest == false
    val isEntitled = isAuthenticated && (entitlements[selectedPrayer.id]?.entitled ?: true)
    val bundledAudioUrl = remember(selectedPrayer.id, selectedPrayer.slug, selectedPrayer.title.en) {
        resolveBundledAudioUrl(selectedPrayer)
    }
    val resolvedAudioUrl =
        if (isAuthenticated) {
            bundledAudioUrl
                ?: audioMetadata?.streamUrl
                ?: audioMetadata?.url
                ?: selectedPrayer.audioUrl
        } else {
            null
        }
    val scriptText = prayerScript(selectedPrayer, selectedScript)
    val verses = remember(scriptText) { splitPrayerIntoVerses(scriptText) }
    val highlightedVerse = if (verses.isEmpty()) 0 else ((verses.lastIndex) * audioProgress).toInt().coerceIn(0, verses.lastIndex)
    val verseListState = rememberLazyListState()
    val pickerPrayers = remember(selectedPrayer.id) {
        (AppContent.prayerHighlights + selectedPrayer).distinctBy { it.id }
    }

    LaunchedEffect(Unit) {
        if (remoteCatalog.isEmpty()) {
            runCatching { DivyaRuntime.fetchPrayerCatalog(limit = 250) }
            runCatching { DivyaRuntime.refreshPrayerEntitlements() }
        }
    }

    LaunchedEffect(selectedScript) {
        scriptPrefs.edit().putString(KEY_LAST_SCRIPT_TAB, selectedScript).apply()
    }

    LaunchedEffect(highlightedVerse, verses.size) {
        if (verses.size > 1) {
            if (isReducedMotionEnabled()) {
                verseListState.scrollToItem(highlightedVerse.coerceAtLeast(0))
            } else {
                verseListState.animateScrollToItem(highlightedVerse.coerceAtLeast(0))
            }
        }
    }

    LaunchedEffect(selectedPrayer.id, isAuthenticated) {
        metadataError = null
        audioMetadata = null
        if (!isAuthenticated) {
            metadataError = "Sign in is required to listen to prayer audio."
            return@LaunchedEffect
        }
        runCatching {
            DivyaRuntime.fetchPrayerAudioMetadata(selectedPrayer.id)
        }.onSuccess {
            audioMetadata = it
            if (!it.entitled) {
                metadataError = "Audio for this prayer requires ${it.requiredTier.replaceFirstChar { c -> c.uppercase() }} tier."
            }
        }.onFailure {
            metadataError = it.message
        }
    }

    LaunchedEffect(selectedPrayer.id) {
        DivyaRuntime.trackEvent(
            "funnel_stage",
            mapOf("stage" to "player_open", "prayer_id" to selectedPrayer.id),
        )
    }

    LaunchedEffect(selectedPrayer.id, selectedRep) {
        loopCompleted = 0
        loopEdgeArmed = true
    }

    LaunchedEffect(loopModeEnabled, audioProgress, playerState.isPlaying, selectedRep, selectedPrayer.id) {
        if (!loopModeEnabled || !playerState.isPlaying) return@LaunchedEffect

        val targetRepetitions = selectedRep.toIntOrNull()?.coerceAtLeast(1) ?: 1
        if (audioProgress < 0.9f) {
            loopEdgeArmed = true
            return@LaunchedEffect
        }

        if (audioProgress >= 0.995f && loopEdgeArmed) {
            loopEdgeArmed = false
            val nextCompleted = (loopCompleted + 1).coerceAtMost(targetRepetitions)
            loopCompleted = nextCompleted
            progress = (nextCompleted.toFloat() / targetRepetitions.toFloat()).coerceIn(0f, 1f)

            if (nextCompleted >= targetRepetitions) {
                PrayerAudioPlayer.pause(reason = "loop_target_reached")
                showFavoriteNudge = true
                DivyaRuntime.trackEvent(
                    "prayer_completed",
                    mapOf(
                        "prayer_id" to selectedPrayer.id,
                        "duration_seconds" to (selectedPrayer.durationMinutes * 60),
                        "repetitions_completed" to targetRepetitions,
                        "completion_rate" to 1.0,
                        "mode" to "loop_repetition",
                    ),
                )
                DivyaRuntime.trackEvent(
                    "funnel_stage",
                    mapOf("stage" to "completion", "prayer_id" to selectedPrayer.id),
                )
            } else {
                PrayerAudioPlayer.stop()
                PrayerAudioPlayer.play(reason = "loop_next_repetition")
            }
        }
    }

    LaunchedEffect(playerState.isPlaying, selectedPrayer.id) {
        if (playerState.isPlaying && previousPlayingPrayerId != selectedPrayer.id) {
            previousPlayingPrayerId = selectedPrayer.id
            DivyaRuntime.trackEvent(
                "prayer_started",
                mapOf(
                    "prayer_id" to selectedPrayer.id,
                    "prayer_name" to selectedPrayer.title.en,
                    "type" to selectedPrayer.type,
                    "repetitions_set" to selectedRep.toInt(),
                ),
            )
        }
        if (!playerState.isPlaying && previousPlayingPrayerId == selectedPrayer.id) {
            previousPlayingPrayerId = null
        }
    }

    LaunchedEffect(selectedPrayer.id, playerState.isPlaying, selectedRep, progress) {
        if (playerState.isPlaying) {
            PrayerIslandNotification.show(
                context = context,
                prayerName = selectedPrayer.title.en,
                repetitionCurrent = (progress * selectedRep.toInt()).toInt().coerceAtLeast(1),
                repetitionTotal = selectedRep.toInt(),
                progressFraction = progress,
            )
        } else {
            PrayerIslandNotification.dismiss(context)
        }
    }

    ScreenScaffold(
        eyebrow = "Guided practice",
        title = selectedPrayer.title.en,
        subtitle = previewLine(selectedPrayer.iast ?: selectedPrayer.transliteration)
            ?: "Listen, read along, and track repetitions in one calmer flow.",
        badge = when {
            playerState.isPlaying -> "Now playing"
            playerState.isReady -> "Ready to play"
            else -> "Loading audio"
        },
        heroVariant = HeroCardVariant.PRAYER,
        heroStats = listOf(
            HeroStat("${(progress * selectedRep.toInt()).toInt().coerceAtLeast(1)} / $selectedRep", "Current repetitions"),
            HeroStat("${selectedPrayer.durationMinutes} min", "Session length"),
            HeroStat(selectedScript, "Reading mode"),
            HeroStat("${playerState.playbackSpeed}x", "Playback speed"),
            HeroStat("108 beads", "Mala counter"),
        ),
        heroContent = {
            if (isCompactPhone) {
                androidx.compose.foundation.layout.Column(
                    verticalArrangement = Arrangement.spacedBy(12.dp),
                    modifier = Modifier.fillMaxWidth(),
                ) {
                    PrimaryActionButton(
                        text = "Audio controls",
                        onClick = { onOpen(DivyaRoutes.nowPlaying.route) },
                        modifier = Modifier.fillMaxWidth(),
                    )
                    SecondaryActionButton(
                        text = "Browse prayers",
                        onClick = { onOpen(DivyaRoutes.library.route) },
                        modifier = Modifier.fillMaxWidth(),
                    )
                }
            } else {
                Row(horizontalArrangement = Arrangement.spacedBy(12.dp), modifier = Modifier.fillMaxWidth()) {
                    PrimaryActionButton(
                        text = "Audio controls",
                        onClick = { onOpen(DivyaRoutes.nowPlaying.route) },
                        modifier = Modifier.weight(1f),
                    )
                    SecondaryActionButton(
                        text = "Browse prayers",
                        onClick = { onOpen(DivyaRoutes.library.route) },
                        modifier = Modifier.weight(1f),
                    )
                }
            }
            if (BuildConfig.ENABLE_SHARED_PRAYER_PREVIEW) {
                TertiaryActionButton(
                    text = "Pray together",
                    onClick = {
                        DivyaRuntime.trackEvent("shared_session_created", mapOf("prayer_name" to selectedPrayer.title.en))
                        onOpen(DivyaRoutes.sharedPrayerCreate.route)
                    },
                    modifier = Modifier.fillMaxWidth(),
                    enabled = isEntitled,
                )
            }
        },
    ) {
        item { DividerLabel("Listen") }

        item {
            PanelCard(title = "Quick switch", subtitle = "Use these highlights now, or open the full library for the complete catalog.") {
                SelectableTagRow(
                    options = pickerPrayers.map { it.title.en },
                    selected = selectedPrayer.title.en,
                    onSelect = { pickedTitle ->
                        val picked = catalog.firstOrNull { it.title.en == pickedTitle }
                        if (picked != null) {
                            selectedPrayerId = picked.id
                            progress = 0f
                            audioProgress = 0f
                            malaCount = 0
                            pendingAutoPlayPrayerId = picked.id
                            selectedRep = picked.recommendedRepetitions.firstOrNull()?.toString() ?: selectedRep
                        }
                    },
                )
            }
        }

        item {
            if (!isAuthenticated || !isEntitled) {
                PanelCard(
                    title = "Tier unlock required",
                    subtitle = metadataError ?: if (!isAuthenticated) {
                        "Please sign in to listen to prayer audio."
                    } else {
                        "This prayer is currently locked for your account tier."
                    },
                ) {
                    if (!isAuthenticated) {
                        TextBlock("Audio playback is available for signed-in devotees only.")
                    } else {
                        TextBlock("Unlock this prayer in ${audioMetadata?.requiredTier?.replaceFirstChar { it.uppercase() } ?: "Bhakt"} and continue your chanting session.")
                        Button(onClick = { onOpen(DivyaRoutes.profile.route) }, modifier = Modifier.fillMaxWidth()) {
                            Text("View tier plans")
                        }
                    }
                }
            }
        }

        item {
            key(selectedPrayer.id) {
                PrayerAudioGuideCard(
                    prayerId = selectedPrayer.id,
                    title = selectedPrayer.title.en,
                    audioUrl = resolvedAudioUrl,
                    pronunciationTip = AppContent.pronunciationTip(selectedPrayer.id),
                    transliteration = selectedPrayer.transliteration ?: selectedPrayer.iast.orEmpty(),
                    englishMeaning = selectedPrayer.content.english ?: selectedPrayer.meaning.orEmpty(),
                    audioChecksumSha256 = audioMetadata?.checksumSha256,
                    audioVersion = audioMetadata?.version,
                    requiredTierLabel = audioMetadata?.requiredTier?.replaceFirstChar { it.uppercase() },
                    entitled = isEntitled,
                    autoPlayRequested = shouldRequestAutoPlay(pendingAutoPlayPrayerId, selectedPrayer.id),
                    onAutoPlayConsumed = { pendingAutoPlayPrayerId = null },
                    onSubscribeAudioComingSoon = {
                        scope.launch {
                            runCatching { DivyaRuntime.subscribeAudioComingSoon(selectedPrayer.id, true) }
                        }
                    },
                    onPlaybackProgress = { latest -> audioProgress = latest },
                )
            }
        }

        item { DividerLabel("Read along") }

        item {
            PanelCard(
                title = "Prayer text",
                subtitle = "Switch between script, transliteration, and meaning without leaving the player.",
            ) {
                SelectableTagRow(
                    options = listOf("Devanagari/Malayalam", "IAST", "English + meaning"),
                    selected = selectedScript,
                    onSelect = { selectedScript = it },
                )
                LazyColumn(
                    state = verseListState,
                    modifier = Modifier
                        .fillMaxWidth()
                        .heightIn(max = 260.dp),
                    verticalArrangement = Arrangement.spacedBy(8.dp),
                ) {
                    itemsIndexed(verses) { index, verse ->
                        Text(
                            text = verse,
                            style = MaterialTheme.typography.bodyLarge,
                            color = if (index == highlightedVerse) TempleGold else DeepBrown,
                        )
                    }
                }
            }
        }

        item { DividerLabel("Chant and count") }

        item {
            PanelCard(title = "Repetition guidance", subtitle = "Choose looped repetitions or manual mala counting.") {
                SelectableTagRow(
                    options = listOf("Manual beads", "Loop by repetition"),
                    selected = if (loopModeEnabled) "Loop by repetition" else "Manual beads",
                    onSelect = { picked ->
                        loopModeEnabled = picked == "Loop by repetition"
                        if (!loopModeEnabled) {
                            loopCompleted = 0
                            loopEdgeArmed = true
                        }
                    },
                )
                SelectableTagRow(
                    options = selectedPrayer.recommendedRepetitions.map { it.toString() },
                    selected = selectedRep,
                    onSelect = { selectedRep = it },
                )
                if (loopModeEnabled) {
                    Text(
                        text = "Loop progress: $loopCompleted / $selectedRep repetitions",
                        style = MaterialTheme.typography.bodyMedium,
                        color = DeepBrown,
                    )
                    Button(
                        onClick = {
                            loopCompleted = 0
                            loopEdgeArmed = true
                            progress = 0f
                            PrayerAudioPlayer.stop()
                            PrayerAudioPlayer.play(reason = "loop_mode_start")
                        },
                        modifier = Modifier.fillMaxWidth(),
                    ) {
                        Text("Start loop session")
                    }
                }
                LinearProgressIndicator(
                    progress = { progress },
                    modifier = Modifier.fillMaxWidth(),
                    color = TempleGold,
                    trackColor = TempleGold.copy(alpha = 0.2f),
                )
                if (isCompactPhone) {
                    androidx.compose.foundation.layout.Column(
                        verticalArrangement = Arrangement.spacedBy(12.dp),
                        modifier = Modifier.fillMaxWidth(),
                    ) {
                        Button(
                            onClick = {
                                progress = (progress + 0.12f).coerceAtMost(1f)
                                malaCount = (malaCount + 1).coerceAtMost(108)
                                if (progress >= 1f) {
                                    showFavoriteNudge = true
                                    DivyaRuntime.trackEvent(
                                        "prayer_completed",
                                        mapOf(
                                            "prayer_id" to selectedPrayer.id,
                                            "duration_seconds" to (selectedPrayer.durationMinutes * 60),
                                            "repetitions_completed" to selectedRep.toInt(),
                                            "completion_rate" to 1.0,
                                        ),
                                    )
                                    DivyaRuntime.trackEvent(
                                        "funnel_stage",
                                        mapOf("stage" to "completion", "prayer_id" to selectedPrayer.id),
                                    )
                                }
                            },
                            modifier = Modifier.fillMaxWidth(),
                        ) {
                            Text("Complete bead")
                        }
                        OutlinedButton(
                            onClick = {
                                DivyaRuntime.trackEvent(
                                    "prayer_abandoned",
                                    mapOf(
                                        "prayer_id" to selectedPrayer.id,
                                        "abandoned_at_seconds" to ((selectedPrayer.durationMinutes * 60) * progress).toInt(),
                                        "completion_rate" to progress,
                                    ),
                                )
                                progress = 0f
                                malaCount = 0
                            },
                            modifier = Modifier.fillMaxWidth(),
                        ) {
                            Text("Reset")
                        }
                    }
                } else {
                    Row(horizontalArrangement = Arrangement.spacedBy(12.dp), modifier = Modifier.fillMaxWidth()) {
                        Button(
                            onClick = {
                                progress = (progress + 0.12f).coerceAtMost(1f)
                                malaCount = (malaCount + 1).coerceAtMost(108)
                                if (progress >= 1f) {
                                    showFavoriteNudge = true
                                    DivyaRuntime.trackEvent(
                                        "prayer_completed",
                                        mapOf(
                                            "prayer_id" to selectedPrayer.id,
                                            "duration_seconds" to (selectedPrayer.durationMinutes * 60),
                                            "repetitions_completed" to selectedRep.toInt(),
                                            "completion_rate" to 1.0,
                                        ),
                                    )
                                    DivyaRuntime.trackEvent(
                                        "funnel_stage",
                                        mapOf("stage" to "completion", "prayer_id" to selectedPrayer.id),
                                    )
                                }
                            },
                            modifier = Modifier.weight(1f),
                        ) {
                            Text("Complete bead")
                        }
                        OutlinedButton(
                            onClick = {
                                DivyaRuntime.trackEvent(
                                    "prayer_abandoned",
                                    mapOf(
                                        "prayer_id" to selectedPrayer.id,
                                        "abandoned_at_seconds" to ((selectedPrayer.durationMinutes * 60) * progress).toInt(),
                                        "completion_rate" to progress,
                                    ),
                                )
                                progress = 0f
                                malaCount = 0
                            },
                            modifier = Modifier.weight(1f),
                        ) {
                            Text("Reset")
                        }
                    }
                }
            }
        }

        item {
            MalaCounterCard(
                currentBead = malaCount,
                onBeadTap = { bead ->
                    malaCount = bead
                    progress = (bead / 108f).coerceIn(0f, 1f)
                },
                onReset = {
                    malaCount = 0
                    progress = 0f
                },
            )
        }

        if (showFavoriteNudge) {
            item {
                PanelCard(
                    title = "Save this prayer?",
                    subtitle = "You completed this session. Add this prayer to favorites for faster access next time.",
                ) {
                    Button(
                        onClick = {
                            DivyaRuntime.trackEvent(
                                "prayer_favorite_nudge_accepted",
                                mapOf("prayer_id" to selectedPrayer.id),
                            )
                            showFavoriteNudge = false
                        },
                        modifier = Modifier.fillMaxWidth(),
                    ) {
                        Text("Add to favorites")
                    }
                    OutlinedButton(
                        onClick = { showFavoriteNudge = false },
                        modifier = Modifier.fillMaxWidth(),
                    ) {
                        Text("Maybe later")
                    }
                }
            }
        }
    }
}

private val canonicalBundledAudioBySlug = mapOf(
    "mahishasura-mardini" to "raw://mahishasura_mardini_stotram",
    "mahishasura-mardini-stotram" to "raw://mahishasura_mardini_stotram",
    "navarna-mantra" to "raw://navarna_mantra",
    "ya-devi-sarvabhuteshu" to "raw://ya_devi_sarvabhuteshu",
    "devi-mahatmyam-shloka" to "raw://ya_devi_sarvabhuteshu",
    "kerala-bhagavathi-stuti" to "raw://kerala_bhagavathi_stuti",
    "lalitha-sahasranama-108" to "raw://lalitha_sahasranama_108",
    "gayatri-mantra" to "raw://gayatri_mantra",
    "ganesh-aarti" to "raw://ganesh_aarti",
    "hanuman-chalisa" to "raw://hanuman_chalisa",
    "maha-mrityunjaya" to "raw://maha_mrityunjaya",
    "maha-mrityunjaya-mantra" to "raw://maha_mrityunjaya",
    "lakshmi-aarti" to "raw://lakshmi_aarti",
    "saraswati-vandana" to "raw://saraswati_vandana",
    "shiva-panchakshara" to "raw://shiva_panchakshara",
    "om-namah-shivaya" to "raw://om_namah_shivaya",
    "durga-chalisa" to "raw://durga_chalisa",
    "krishna-aarti" to "raw://krishna_aarti",
    "surya-mantra" to "raw://surya_mantra",
    "shanti-mantra" to "raw://shanti_mantra",
    "vishnu-sahasranama-108" to "raw://vishnu_sahasranama_108",
    "pratah-smaranam" to "raw://morning_prayer",
    "morning-prayer" to "raw://morning_prayer",
    "nirvana-shatakam" to "raw://nirvana_shatakam",
)

private fun resolveBundledAudioUrl(prayer: Prayer): String? {
    val normalizedSlug = prayer.slug.trim().lowercase()
    val normalizedTitle = normalizePrayerKey(prayer.title.en)

    val byId = AppContent.prayerLibrary108.firstOrNull { localPrayer ->
        localPrayer.id.equals(prayer.id, ignoreCase = true)
    }?.audioUrl

    val bySlug = AppContent.prayerLibrary108.firstOrNull { localPrayer ->
        localPrayer.slug.equals(prayer.slug, ignoreCase = true)
    }?.audioUrl

    val byTitle = AppContent.prayerLibrary108.firstOrNull { localPrayer ->
        normalizePrayerKey(localPrayer.title.en) == normalizedTitle
    }?.audioUrl

    val canonicalBySlug = canonicalBundledAudioBySlug[normalizedSlug]
    val canonicalByTitle = canonicalBundledAudioBySlug.entries
        .firstOrNull { normalizePrayerKey(it.key) == normalizedTitle }
        ?.value

    return listOf(
        byId,
        bySlug,
        byTitle,
        canonicalBySlug,
        canonicalByTitle,
        prayer.audioUrl?.takeIf { it.startsWith("raw://") },
    ).firstOrNull { !it.isNullOrBlank() }
}

private fun resolvePrayerSelection(
    catalog: List<Prayer>,
    prayerRef: String,
): Prayer {
    val fromCatalog = catalog.firstOrNull { prayer ->
        prayer.id.equals(prayerRef, ignoreCase = true) || prayer.slug.equals(prayerRef, ignoreCase = true)
    }
    if (fromCatalog != null) return fromCatalog

    val fromLocal = AppContent.prayerLibrary108.firstOrNull { prayer ->
        prayer.id.equals(prayerRef, ignoreCase = true) || prayer.slug.equals(prayerRef, ignoreCase = true)
    }
    if (fromLocal != null) return fromLocal

    return AppContent.gayatri
}

private fun previewLine(text: String?): String? {
    return text
        ?.lineSequence()
        ?.map { it.trim() }
        ?.firstOrNull { it.isNotEmpty() }
}

private fun normalizePrayerKey(value: String?): String {
    return value
        .orEmpty()
        .trim()
        .lowercase()
        .replace("[^a-z0-9]+".toRegex(), "")
}

internal fun shouldRequestAutoPlay(
    pendingPrayerId: String?,
    selectedPrayerId: String,
): Boolean {
    return !pendingPrayerId.isNullOrBlank() && pendingPrayerId.equals(selectedPrayerId, ignoreCase = true)
}

private fun prayerScript(prayer: Prayer, selectedScript: String): String {
    return when (selectedScript) {
        "IAST" -> prayer.iast ?: prayer.transliteration.orEmpty()
        "English + meaning" -> {
            val translation = prayer.content.english ?: ""
            val meaning = prayer.meaning ?: ""
            if (translation.isNotBlank() && meaning.isNotBlank()) {
                "$translation\n\nMeaning: $meaning"
            } else {
                translation.ifBlank { meaning.ifBlank { prayer.transliteration.orEmpty() } }
            }
        }
        else -> prayer.content.devanagari ?: prayer.content.malayalam ?: prayer.transliteration.orEmpty()
    }
}

private fun splitPrayerIntoVerses(text: String): List<String> {
    val byLines = text
        .split("\n")
        .map { it.trim() }
        .filter { it.isNotBlank() }
    if (byLines.size > 1) return byLines

    val byMarkers = text
        .split("\u0965", "\u0964", "|", ".", ";")
        .map { it.trim() }
        .filter { it.isNotBlank() }
    return if (byMarkers.isNotEmpty()) byMarkers else listOf(text)
}

private fun isReducedMotionEnabled(): Boolean {
    return runCatching { !ValueAnimator.areAnimatorsEnabled() }.getOrDefault(false)
}

private fun resolvePrayerAudioUri(context: android.content.Context, audioUrl: String?): Uri? {
    if (audioUrl.isNullOrBlank()) return null
    return when {
        audioUrl.startsWith("raw://") -> {
            val resourceName = audioUrl.removePrefix("raw://").trim()
            val resourceId = context.resources.getIdentifier(resourceName, "raw", context.packageName)
            if (resourceId != 0) {
                Uri.parse("android.resource://${context.packageName}/$resourceId")
            } else {
                null
            }
        }
        audioUrl.startsWith("http://") || audioUrl.startsWith("https://") -> {
            if (Patterns.WEB_URL.matcher(audioUrl).matches()) {
                runCatching { Uri.parse(audioUrl) }.getOrNull()
            } else {
                null
            }
        }
        else -> null
    }
}

private const val SCRIPT_PREFS_NAME = "divya_player_preferences"
private const val KEY_LAST_SCRIPT_TAB = "last_script_tab"

@Composable
private fun PrayerFrameTraceEffect(screenName: String) {
    DisposableEffect(screenName) {
        var lastFrameNs = 0L
        val callback =
            object : Choreographer.FrameCallback {
                override fun doFrame(frameTimeNanos: Long) {
                    if (lastFrameNs != 0L) {
                        val deltaMs = (frameTimeNanos - lastFrameNs) / 1_000_000
                        if (deltaMs > 700L) {
                            DivyaRuntime.trackEvent(
                                "prayer_screen_frame_drop",
                                mapOf("screen" to screenName, "frame_delta_ms" to deltaMs),
                            )
                        }
                    }
                    lastFrameNs = frameTimeNanos
                    Choreographer.getInstance().postFrameCallback(this)
                }
            }

        Choreographer.getInstance().postFrameCallback(callback)
        onDispose { Choreographer.getInstance().removeFrameCallback(callback) }
    }
}
