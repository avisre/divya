package com.divya.android.ui.screens

import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.material3.Button
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateListOf
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.saveable.rememberSaveable
import androidx.compose.runtime.setValue
import androidx.compose.ui.Modifier
import com.divya.android.app.DivyaRuntime
import com.divya.android.navigation.DivyaRoutes
import com.divya.android.ui.components.PrayerCard
import com.divya.android.ui.components.UpgradePromptSheet

@Composable
fun PrayerLibraryScreen(onOpen: (String) -> Unit) {
    var query by rememberSaveable { mutableStateOf("") }
    var typeFilter by rememberSaveable { mutableStateOf("All types") }
    var deityFilter by rememberSaveable { mutableStateOf("All deities") }
    var durationFilter by rememberSaveable { mutableStateOf("Any duration") }
    var favoritesOnly by rememberSaveable { mutableStateOf(false) }
    var previewTier by rememberSaveable { mutableStateOf("Free") }
    var isLoadingRemote by rememberSaveable { mutableStateOf(false) }
    var availabilityMessage by rememberSaveable { mutableStateOf<String?>(null) }
    val favoritePrayerIds = remember { mutableStateListOf<String>() }
    val remoteCatalog by DivyaRuntime.prayerCatalog.collectAsState()
    val entitlementsSnapshot by DivyaRuntime.prayerEntitlements.collectAsState()
    val entitlementMap = remember(entitlementsSnapshot) {
        entitlementsSnapshot?.entitlements?.associateBy { it.prayerId }.orEmpty()
    }
    val activeTier = entitlementsSnapshot?.userTier?.replaceFirstChar { it.uppercase() }
    val catalog = if (remoteCatalog.isNotEmpty()) remoteCatalog else AppContent.prayerLibrary108

    LaunchedEffect(Unit) {
        isLoadingRemote = true
        DivyaRuntime.trackEvent("funnel_stage", mapOf("stage" to "library_open"))
        runCatching {
            DivyaRuntime.fetchPrayerCatalog()
            DivyaRuntime.refreshPrayerEntitlements()
            val availability = DivyaRuntime.fetchPrayerAvailability("US", "english")
            availabilityMessage = "Availability: ${availability.languageReadyCount}/${availability.totalPrayers} English-ready prayers"
        }.also { isLoadingRemote = false }
    }

    val freeCount = catalog.count { resolveRequiredTier(it.id, entitlementMap) == "Free" }
    val bhaktCount = catalog.count { resolveRequiredTier(it.id, entitlementMap) == "Bhakt" }
    val sevaCount = catalog.count { resolveRequiredTier(it.id, entitlementMap) == "Seva" }

    val filteredPrayers = catalog.filter { prayer ->
        val matchesQuery = query.isBlank() || listOfNotNull(
            prayer.title.en,
            prayer.title.sa,
            prayer.title.ml,
            prayer.transliteration,
            prayer.iast,
            prayer.content.devanagari,
            prayer.content.english,
        ).any { it.contains(query.trim(), ignoreCase = true) }

        val matchesType = typeFilter == "All types" || prayer.type.equals(typeFilter, ignoreCase = true)
        val matchesDeity = deityFilter == "All deities" || prayer.deity?.name?.en == deityFilter
        val matchesDuration = when (durationFilter) {
            "<= 5 min" -> prayer.durationMinutes <= 5
            "6-10 min" -> prayer.durationMinutes in 6..10
            "11-20 min" -> prayer.durationMinutes in 11..20
            "> 20 min" -> prayer.durationMinutes > 20
            else -> true
        }
        val matchesFavorite = !favoritesOnly || favoritePrayerIds.contains(prayer.id)

        matchesQuery && matchesType && matchesDeity && matchesDuration && matchesFavorite
    }

    val sortedPrayers = filteredPrayers.sortedWith(
        compareByDescending<com.divya.data.models.Prayer> { resolveUnlocked(it.id, previewTier, entitlementMap) }
            .thenBy { it.order },
    )

    ScreenScaffold(
        eyebrow = "Prayer library",
        title = "Find the right prayer for today",
        subtitle = "Search in English or script, refine by deity or type, and enter the prayer that fits today.",
        badge = activeTier?.let { "Account tier: $it" } ?: "${sortedPrayers.count { resolveUnlocked(it.id, previewTier, entitlementMap) }} accessible",
        heroVariant = HeroCardVariant.PRAYER,
        heroStats = listOf(
            HeroStat("${catalog.size}", "Total prayers"),
            HeroStat("${catalog.count { !it.audioUrl.isNullOrBlank() }}", "Audio-ready"),
            HeroStat(activeTier ?: previewTier, "Current plan"),
            HeroStat("${favoritePrayerIds.size}", "Favorites"),
        ),
    ) {
        if (isLoadingRemote) {
            item {
                AccentNote(
                    title = "Refreshing catalog",
                    body = "Refreshing available prayers and audio access for your account.",
                )
            }
        }

        SectionHeader("Browse")

        item {
            PanelCard(
                title = "Find a prayer",
                subtitle = "Search by name, script, or transliteration and begin from the prayer that feels right today.",
            ) {
                OutlinedTextField(
                    value = query,
                    onValueChange = { query = it },
                    modifier = Modifier.fillMaxWidth(),
                    singleLine = true,
                    label = { Text("Search English, Hindi, or transliteration") },
                )
                if (!availabilityMessage.isNullOrBlank()) {
                    TextBlock(availabilityMessage!!)
                }
                if (activeTier == null) {
                    SelectableTagRow(
                        options = listOf("Free", "Bhakt", "Seva"),
                        selected = previewTier,
                        onSelect = { previewTier = it },
                    )
                } else {
                    TextBlock("Showing access for your current plan.")
                }
            }
        }

        item {
            PanelCard(
                title = "Filters",
                subtitle = "Refine by type, deity, duration, or favorites.",
            ) {
                SelectableTagRow(
                    options = listOf("All types", "aarti", "mantra", "chalisa", "stotram", "bhajan"),
                    selected = typeFilter,
                    onSelect = { typeFilter = it },
                )
                SelectableTagRow(
                    options = listOf("All deities") + AppContent.deities.map { it.name.en },
                    selected = deityFilter,
                    onSelect = { deityFilter = it },
                )
                SelectableTagRow(
                    options = listOf("Any duration", "<= 5 min", "6-10 min", "11-20 min", "> 20 min"),
                    selected = durationFilter,
                    onSelect = { durationFilter = it },
                )
                SelectableTagRow(
                    options = listOf("All prayers", "Favorites only"),
                    selected = if (favoritesOnly) "Favorites only" else "All prayers",
                    onSelect = { favoritesOnly = it == "Favorites only" },
                )
            }
        }

        item {
            AccentNote(
                title = "Results",
                body = "${sortedPrayers.size} prayers match your current search and filters.",
            )
        }

        if (sortedPrayers.isEmpty()) {
            item {
                PanelCard(
                    title = "No prayers match yet",
                    subtitle = "Try clearing one filter or searching with a shorter phrase.",
                ) {
                    Button(
                        onClick = {
                            query = ""
                            typeFilter = "All types"
                            deityFilter = "All deities"
                            durationFilter = "Any duration"
                            favoritesOnly = false
                        },
                        modifier = Modifier.fillMaxWidth(),
                    ) {
                        Text("Reset filters")
                    }
                }
            }
        }

        sortedPrayers.forEach { prayer ->
            item {
                val requiredTier = resolveRequiredTier(prayer.id, entitlementMap)
                val unlocked = resolveUnlocked(prayer.id, previewTier, entitlementMap)
                PrayerCard(
                    prayer = prayer,
                    requiredTier = requiredTier,
                    isUnlocked = unlocked,
                    isFavorite = favoritePrayerIds.contains(prayer.id),
                    onFavoriteToggle = {
                        if (favoritePrayerIds.contains(prayer.id)) {
                            favoritePrayerIds.remove(prayer.id)
                        } else {
                            favoritePrayerIds.add(prayer.id)
                        }
                        DivyaRuntime.trackEvent("prayer_favorite_toggled", mapOf("prayer_id" to prayer.id))
                    },
                ) {
                    if (unlocked) {
                        DivyaRuntime.trackEvent(
                            "funnel_stage",
                            mapOf("stage" to "library_to_player", "prayer_id" to prayer.id),
                        )
                        val prayerRef = prayer.slug.takeIf { it.isNotBlank() } ?: prayer.id
                        onOpen(DivyaRoutes.prayerFor(prayerRef))
                    } else {
                        DivyaRuntime.trackEvent(
                            "funnel_stage",
                            mapOf("stage" to "library_to_tier", "prayer_id" to prayer.id, "required_tier" to requiredTier),
                        )
                        onOpen(DivyaRoutes.profile.route)
                    }
                }
            }
        }

        SectionHeader("Membership")

        item {
            PanelCard(
                title = "How access works",
                subtitle = "Each plan opens more prayers and deeper listening features.",
            ) {
                TextBlock("Free includes $freeCount complete prayers. Bhakt opens $bhaktCount. Seva unlocks all $sevaCount.")
                TagRow(tags = AppContent.languageSupport.take(4))
            }
        }

        item { UpgradePromptSheet(onSelectTier = { previewTier = it }) }
    }
}

private fun resolveRequiredTier(
    prayerId: String,
    entitlements: Map<String, com.divya.android.app.PrayerEntitlement>,
): String {
    val remote = entitlements[prayerId]?.requiredTier
    if (!remote.isNullOrBlank()) {
        return remote.replaceFirstChar { it.uppercase() }
    }
    return AppContent.requiredTier(prayerId)
}

private fun resolveUnlocked(
    prayerId: String,
    previewTier: String,
    entitlements: Map<String, com.divya.android.app.PrayerEntitlement>,
): Boolean {
    val remote = entitlements[prayerId]
    if (remote != null) {
        return remote.entitled
    }
    return AppContent.isPrayerUnlocked(prayerId, previewTier)
}
