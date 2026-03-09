package com.divya.android.ui.screens

import android.content.Context
import android.net.ConnectivityManager
import android.net.NetworkCapabilities
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.fillMaxHeight
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.width
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Button
import androidx.compose.material3.Checkbox
import androidx.compose.material3.CircularProgressIndicator
import androidx.compose.material3.ExperimentalMaterial3Api
import androidx.compose.material3.ModalBottomSheet
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.Snackbar
import androidx.compose.material3.SnackbarHost
import androidx.compose.material3.SnackbarHostState
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableIntStateOf
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.rememberCoroutineScope
import androidx.compose.runtime.saveable.rememberSaveable
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.hapticfeedback.HapticFeedbackType
import androidx.compose.ui.platform.LocalConfiguration
import androidx.compose.ui.platform.LocalHapticFeedback
import androidx.compose.ui.semantics.contentDescription
import androidx.compose.ui.semantics.semantics
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import com.divya.android.app.BookingCreateRequest
import com.divya.android.app.DivyaRuntime
import com.divya.android.app.GothramGuidanceInput
import com.divya.android.navigation.DivyaRoutes
import com.divya.android.ui.formatPrice
import com.divya.android.ui.components.ConversionReasonCard
import com.divya.android.ui.components.NakshatraPickerSheet
import com.divya.android.ui.components.PujaShareCard
import com.divya.android.ui.components.TraditionNotesCard
import com.divya.android.ui.theme.AlertMarigold
import com.divya.android.ui.theme.DeepBrown
import com.divya.android.ui.theme.Ivory
import com.divya.android.ui.theme.SuccessLeaf
import java.util.Locale
import kotlinx.coroutines.launch

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun WaitlistJoinScreen(onOpen: (String) -> Unit) {
    val scope = rememberCoroutineScope()
    val context = androidx.compose.ui.platform.LocalContext.current
    val haptic = LocalHapticFeedback.current
    val isCompactPhone = LocalConfiguration.current.screenWidthDp < 380
    val snackbarHostState = remember { SnackbarHostState() }

    LaunchedEffect(Unit) {
        DivyaRuntime.trackEvent("waitlist_form_started", mapOf("puja_id" to AppContent.abhishekam.id))
    }

    var devoteeName by rememberSaveable { mutableStateOf("") }
    var gothram by rememberSaveable { mutableStateOf("") }
    var gothramConfidence by rememberSaveable { mutableStateOf<String?>(null) }
    var gothramSource by rememberSaveable { mutableStateOf<String?>(null) }
    var gothramGuidanceText by rememberSaveable { mutableStateOf<String?>(null) }
    var intention by rememberSaveable { mutableStateOf("") }
    var selectedRange by rememberSaveable { mutableStateOf("First available") }
    var detailsSaved by rememberSaveable { mutableStateOf(false) }
    var submitMessage by rememberSaveable { mutableStateOf<String?>(null) }
    var isSubmitting by rememberSaveable { mutableStateOf(false) }
    var bookingReference by rememberSaveable { mutableStateOf<String?>(null) }
    val isOnline = remember { isNetworkConnected(context) }
    val commonGothrams = listOf("Kashyap", "Bharadwaj", "Vasishta", "Garg", "Atri", "Unknown")

    var showGothramWizard by rememberSaveable { mutableStateOf(false) }
    var gothramWizardStep by rememberSaveable { mutableIntStateOf(1) }
    var wizardDevoteeName by rememberSaveable { mutableStateOf("") }
    var wizardSurnameCommunity by rememberSaveable { mutableStateOf("") }
    var wizardFamilyRegion by rememberSaveable { mutableStateOf("") }
    var wizardKnownFamilyGothram by rememberSaveable { mutableStateOf("") }
    var wizardBestEffortConfirmed by rememberSaveable { mutableStateOf(false) }
    var wizardLoading by rememberSaveable { mutableStateOf(false) }

    suspend fun showFeedback(message: String, isError: Boolean) {
        snackbarHostState.showSnackbar(
            message = message,
            actionLabel = if (isError) "error" else "success",
        )
    }

    val dateRangeOptions = listOf(
        "First available",
        "Mar 10 - Mar 25",
        "Mar 26 - Apr 10",
        "Apr 10+",
    )
    val intentionSuggestions = listOf(
        "Peace and prosperity for my family",
        "Health and recovery for [name]",
        "Gratitude and guidance",
    )

    fun submitBooking() {
        haptic.performHapticFeedback(HapticFeedbackType.TextHandleMove)
        val trimmedName = devoteeName.trim()
        val trimmedIntention = intention.trim()
        if (trimmedName.isBlank()) {
            submitMessage = "Devotee name is required."
            scope.launch { showFeedback("Devotee name is required.", true) }
            return
        }
        if (trimmedIntention.length < 10) {
            submitMessage = "Prayer intention must be at least 10 characters."
            scope.launch { showFeedback("Prayer intention must be at least 10 characters.", true) }
            return
        }

        val resolvedGothram = normalizeGothramInput(gothram, trimmedName)
        isSubmitting = true
        submitMessage = null
        scope.launch {
            runCatching {
                DivyaRuntime.createBooking(
                    BookingCreateRequest(
                        pujaId = AppContent.abhishekam.id,
                        devoteeName = trimmedName,
                        gothram = resolvedGothram,
                        nakshatra = null,
                        prayerIntention = trimmedIntention,
                        currency = "USD",
                    ),
                )
            }.onSuccess { result ->
                detailsSaved = true
                bookingReference = result.booking.bookingReference
                gothram = resolvedGothram
                submitMessage = "Waitlist joined successfully. Reference ${result.booking.bookingReference}."
                DivyaRuntime.trackEvent(
                    "waitlist_details_saved",
                    mapOf(
                        "puja_id" to AppContent.abhishekam.id,
                        "preferred_window" to selectedRange,
                        "gothram_value" to resolvedGothram,
                    ),
                )
                showFeedback("Puja request submitted successfully.", false)
            }.onFailure {
                submitMessage = it.message ?: "Unable to join waitlist right now."
                DivyaRuntime.reportHandledError(it, mapOf("screen" to "waitlist"))
                showFeedback("Could not submit request. Please retry.", true)
            }
            isSubmitting = false
        }
    }

    Box {
        ScreenScaffold(
            eyebrow = "Waitlist reservation",
            title = "Prepare your puja request",
            subtitle = "Share the devotee details the temple needs, review them once, and submit your request with confidence.",
            badge = "Temple request",
            heroVariant = HeroCardVariant.PUJA,
            heroStats = listOf(
                HeroStat(formatPrice(51.0, "USD"), "Presented price"),
                HeroStat("Temple service", "Performed in your name"),
                HeroStat("4-6 weeks", "Typical wait"),
                HeroStat("Private video", "After completion"),
            ),
            heroContent = {
                if (isCompactPhone) {
                    Column(verticalArrangement = Arrangement.spacedBy(12.dp), modifier = Modifier.fillMaxWidth()) {
                        PrimaryActionButton(
                            text = "Find my gothram",
                            onClick = {
                                haptic.performHapticFeedback(HapticFeedbackType.TextHandleMove)
                                wizardDevoteeName = devoteeName
                                showGothramWizard = true
                                gothramWizardStep = 1
                                wizardBestEffortConfirmed = false
                                DivyaRuntime.trackEvent("gothram_guidance_opened")
                            },
                            modifier = Modifier
                                .fillMaxWidth()
                                .semantics { contentDescription = "Find my gothram button" },
                        )
                        SecondaryActionButton(
                            text = "How tracking works",
                            onClick = {
                                haptic.performHapticFeedback(HapticFeedbackType.TextHandleMove)
                                onOpen(DivyaRoutes.myPujas.route)
                            },
                            modifier = Modifier
                                .fillMaxWidth()
                                .semantics { contentDescription = "How tracking works button" },
                        )
                    }
                } else {
                    Row(horizontalArrangement = Arrangement.spacedBy(12.dp), modifier = Modifier.fillMaxWidth()) {
                        PrimaryActionButton(
                            text = "Find my gothram",
                            onClick = {
                                haptic.performHapticFeedback(HapticFeedbackType.TextHandleMove)
                                wizardDevoteeName = devoteeName
                                showGothramWizard = true
                                gothramWizardStep = 1
                                wizardBestEffortConfirmed = false
                                DivyaRuntime.trackEvent("gothram_guidance_opened")
                            },
                            modifier = Modifier
                                .weight(1f)
                                .semantics { contentDescription = "Find my gothram button" },
                        )
                        SecondaryActionButton(
                            text = "How tracking works",
                            onClick = {
                                haptic.performHapticFeedback(HapticFeedbackType.TextHandleMove)
                                onOpen(DivyaRoutes.myPujas.route)
                            },
                            modifier = Modifier
                                .weight(1f)
                                .semantics { contentDescription = "How tracking works button" },
                        )
                    }
                }
            },
        ) {
            item {
                AccentNote(
                    title = "Before you continue",
                    body = AppContent.waitlistReassurance.joinToString(" "),
                )
            }
            item { DividerLabel("Devotee details") }
            if (detailsSaved) {
                item {
                    StatusStrip(
                        label = "Details saved",
                        detail = "Your waitlist request is now active and trackable in My Pujas.",
                    )
                }
            }
            submitMessage?.let { message ->
                item {
                    AccentNote(
                        title = "Waitlist status",
                        body = message,
                    )
                }
            }
            bookingReference?.let { reference ->
                item {
                    PanelCard(title = "Booking reference") {
                        InfoRow(label = "Reference", value = reference)
                        Button(onClick = { onOpen(DivyaRoutes.myPujas.route) }, modifier = Modifier.fillMaxWidth()) {
                            Text("Open My Pujas")
                        }
                    }
                }
            }
            item {
                PanelCard(
                    title = "Devotee details",
                    subtitle = "Collect only what the temple actually needs for the ritual.",
                ) {
                    OutlinedTextField(
                        value = devoteeName,
                        onValueChange = {
                            devoteeName = it
                            wizardDevoteeName = it
                        },
                        modifier = Modifier.fillMaxWidth(),
                        label = { Text("Devotee name") },
                    )
                    OutlinedTextField(
                        value = gothram,
                        onValueChange = {
                            gothram = it
                            gothramConfidence = "user_provided"
                            gothramSource = "manual_input"
                            gothramGuidanceText = "Using manually entered gothram."
                        },
                        modifier = Modifier.fillMaxWidth(),
                        label = { Text("Gothram") },
                    )
                    SelectableTagRow(
                        options = commonGothrams,
                        selected = gothram.takeIf { it in commonGothrams } ?: "",
                        onSelect = {
                            gothram = it
                            gothramConfidence = if (it == "Unknown") "none" else "user_provided"
                            gothramSource = "quick_select"
                            gothramGuidanceText = if (it == "Unknown") {
                                "Unknown is acceptable. You can update later after confirming with family."
                            } else {
                                "Using your selected gothram."
                            }
                        },
                    )
                    if (isCompactPhone) {
                        Column(verticalArrangement = Arrangement.spacedBy(12.dp), modifier = Modifier.fillMaxWidth()) {
                            Button(
                                onClick = {
                                    haptic.performHapticFeedback(HapticFeedbackType.TextHandleMove)
                                    wizardDevoteeName = devoteeName
                                    showGothramWizard = true
                                    gothramWizardStep = 1
                                    wizardBestEffortConfirmed = false
                                    DivyaRuntime.trackEvent("gothram_guidance_opened")
                                },
                                modifier = Modifier.fillMaxWidth(),
                            ) {
                                Text("Find my gothram")
                            }
                            Button(
                                onClick = {
                                    haptic.performHapticFeedback(HapticFeedbackType.TextHandleMove)
                                    gothram = "Unknown"
                                    gothramConfidence = "none"
                                    gothramSource = "user_unknown"
                                    gothramGuidanceText = "Unknown is acceptable. You can update it later after checking with family."
                                    submitMessage = "Unknown gothram is acceptable for this request."
                                    scope.launch { showFeedback("Proceeding with Unknown gothram.", false) }
                                },
                                modifier = Modifier.fillMaxWidth(),
                            ) {
                                Text("I don't know")
                            }
                        }
                    } else {
                        Row(horizontalArrangement = Arrangement.spacedBy(12.dp), modifier = Modifier.fillMaxWidth()) {
                            Button(
                                onClick = {
                                    haptic.performHapticFeedback(HapticFeedbackType.TextHandleMove)
                                    wizardDevoteeName = devoteeName
                                    showGothramWizard = true
                                    gothramWizardStep = 1
                                    wizardBestEffortConfirmed = false
                                    DivyaRuntime.trackEvent("gothram_guidance_opened")
                                },
                                modifier = Modifier.weight(1f),
                            ) {
                                Text("Find my gothram")
                            }
                            Button(
                                onClick = {
                                    haptic.performHapticFeedback(HapticFeedbackType.TextHandleMove)
                                    gothram = "Unknown"
                                    gothramConfidence = "none"
                                    gothramSource = "user_unknown"
                                    gothramGuidanceText = "Unknown is acceptable. You can update it later after checking with family."
                                    submitMessage = "Unknown gothram is acceptable for this request."
                                    scope.launch { showFeedback("Proceeding with Unknown gothram.", false) }
                                },
                                modifier = Modifier.weight(1f),
                            ) {
                                Text("I don't know")
                            }
                        }
                    }
                    Box(modifier = Modifier.fillMaxWidth()) {
                        SelectableTagRow(
                            options = dateRangeOptions,
                            selected = selectedRange,
                            onSelect = { selectedRange = it },
                        )
                        Box(
                            modifier = Modifier
                                .align(Alignment.CenterEnd)
                                .fillMaxHeight()
                                .width(36.dp)
                                .background(
                                    brush = Brush.horizontalGradient(
                                        colors = listOf(Ivory.copy(alpha = 0f), Ivory),
                                    ),
                                ),
                        )
                    }
                }
            }
            item { NakshatraPickerSheet() }
            item { DividerLabel("Prayer intention") }
            item {
                PanelCard(title = "Prayer intention", subtitle = "Minimum 10 characters, maximum 500.") {
                    SelectableTagRow(
                        options = intentionSuggestions,
                        selected = intention.takeIf { it in intentionSuggestions } ?: "",
                        onSelect = { intention = it },
                    )
                    Text(
                        text = "Most devotees write 2-3 sentences. Be specific about your family name and intention.",
                        style = MaterialTheme.typography.bodySmall,
                        color = DeepBrown.copy(alpha = 0.56f),
                    )
                    OutlinedTextField(
                        value = intention,
                        onValueChange = { intention = it.take(500) },
                        modifier = Modifier.fillMaxWidth(),
                        label = { Text("What would you like to pray for?") },
                        minLines = 4,
                    )
                    Text(
                        text = "${intention.length} / 500",
                        style = MaterialTheme.typography.labelLarge,
                        color = when {
                            intention.length > 480 -> MaterialTheme.colorScheme.error
                            intention.length > 400 -> AlertMarigold
                            else -> DeepBrown.copy(alpha = 0.65f)
                        },
                    )
                    AccentNote(
                        title = "Moderation",
                        body = "Intentions are screened quietly for abusive language before they are forwarded to the temple.",
                    )
                }
            }
            item {
                ConversionReasonCard(
                    title = "What happens after this",
                    subtitle = "You will receive updates as your request moves from waitlist to completion.",
                    bullets = AppContent.bookingStages,
                    tags = listOf("Waitlist", "Status updates", "Video ready"),
                )
            }
            item { DividerLabel("Review and submit") }
            item {
                PanelCard(title = "Request summary") {
                    InfoRow(label = "Presented amount", value = formatPrice(51.0, "USD"))
                    InfoRow(label = "Temple", value = AppContent.temple.name.en)
                    InfoRow(label = "Preferred window", value = selectedRange)
                    InfoRow(
                        label = "Gothram",
                        value = normalizeGothramInput(gothram, devoteeName),
                    )
                    InfoRow(
                        label = "Gothram confidence",
                        value = gothramConfidenceDisplay(gothramConfidence),
                    )
                    gothramGuidanceText?.let { guidance ->
                        TextBlock(guidance)
                    }
                    Button(
                        onClick = { submitBooking() },
                        modifier = Modifier
                            .fillMaxWidth()
                            .semantics { contentDescription = "Submit puja request button" },
                        enabled = !isSubmitting,
                    ) {
                        if (isSubmitting) {
                            CircularProgressIndicator(
                                modifier = Modifier.semantics { contentDescription = "Submitting request" },
                            )
                        } else {
                            Text("Submit puja request")
                        }
                    }
                }
            }
            item {
                AccentNote(
                    title = if (isOnline) "Draft backup" else "Offline draft",
                    body = if (isOnline) {
                        "Details are saved locally as a backup while we submit your request."
                    } else {
                        "Saved locally - will sync when you're back online"
                    },
                )
            }
            item { TraditionNotesCard(AppContent.traditionNotes.takeLast(2)) }
            item { PujaShareCard() }
        }

        SnackbarHost(
            hostState = snackbarHostState,
            modifier = Modifier
                .align(Alignment.BottomCenter)
                .padding(16.dp),
        ) { data ->
            val isError = data.visuals.actionLabel == "error"
            Snackbar(
                containerColor = if (isError) AlertMarigold.copy(alpha = 0.2f) else SuccessLeaf.copy(alpha = 0.2f),
                contentColor = DeepBrown,
            ) {
                Text(
                    text = data.visuals.message,
                    textAlign = TextAlign.Start,
                )
            }
        }

        if (showGothramWizard) {
            ModalBottomSheet(
                onDismissRequest = { showGothramWizard = false },
            ) {
                Column(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(horizontal = 20.dp, vertical = 12.dp),
                    verticalArrangement = Arrangement.spacedBy(12.dp),
                ) {
                    Text("Find my gothram")
                    Text("Step $gothramWizardStep of 2")
                    if (gothramWizardStep == 1) {
                        OutlinedTextField(
                            value = wizardDevoteeName,
                            onValueChange = { wizardDevoteeName = it },
                            modifier = Modifier.fillMaxWidth(),
                            label = { Text("Devotee full name") },
                        )
                        OutlinedTextField(
                            value = wizardSurnameCommunity,
                            onValueChange = { wizardSurnameCommunity = it },
                            modifier = Modifier.fillMaxWidth(),
                            label = { Text("Family surname/community (optional)") },
                        )
                        OutlinedTextField(
                            value = wizardFamilyRegion,
                            onValueChange = { wizardFamilyRegion = it },
                            modifier = Modifier.fillMaxWidth(),
                            label = { Text("Family origin region/state (optional)") },
                        )
                        SelectableTagRow(
                            options = listOf("Kerala", "Tamil Nadu", "Andhra/Telangana", "Gujarat", "Karnataka"),
                            selected = wizardFamilyRegion,
                            onSelect = { wizardFamilyRegion = it },
                        )
                        Button(
                            onClick = {
                                haptic.performHapticFeedback(HapticFeedbackType.TextHandleMove)
                                if (wizardDevoteeName.trim().isBlank()) {
                                    scope.launch {
                                        showFeedback("Devotee name is required for guidance.", true)
                                    }
                                    return@Button
                                }
                                gothramWizardStep = 2
                            },
                            modifier = Modifier.fillMaxWidth(),
                        ) {
                            Text("Next")
                        }
                    } else {
                        OutlinedTextField(
                            value = wizardKnownFamilyGothram,
                            onValueChange = { wizardKnownFamilyGothram = it },
                            modifier = Modifier.fillMaxWidth(),
                            label = { Text("Known family gothram (optional)") },
                        )
                        Row(
                            verticalAlignment = Alignment.CenterVertically,
                            horizontalArrangement = Arrangement.spacedBy(8.dp),
                            modifier = Modifier.fillMaxWidth(),
                        ) {
                            Checkbox(
                                checked = wizardBestEffortConfirmed,
                                onCheckedChange = { wizardBestEffortConfirmed = it },
                            )
                            Text("This is best-effort guidance. I will confirm with family/elder if unsure.")
                        }
                        Row(
                            horizontalArrangement = Arrangement.spacedBy(12.dp),
                            modifier = Modifier.fillMaxWidth(),
                        ) {
                            Button(
                                onClick = {
                                    haptic.performHapticFeedback(HapticFeedbackType.TextHandleMove)
                                    gothramWizardStep = 1
                                },
                                modifier = Modifier.weight(1f),
                            ) {
                                Text("Back")
                            }
                            Button(
                                onClick = {
                                    haptic.performHapticFeedback(HapticFeedbackType.TextHandleMove)
                                    if (!wizardBestEffortConfirmed) {
                                        scope.launch { showFeedback("Please confirm best-effort guidance before applying.", true) }
                                        return@Button
                                    }
                                    wizardLoading = true
                                    scope.launch {
                                        runCatching {
                                            DivyaRuntime.suggestGothramGuided(
                                                GothramGuidanceInput(
                                                    devoteeName = wizardDevoteeName.trim(),
                                                    surnameCommunity = wizardSurnameCommunity.trim().takeIf { it.isNotBlank() },
                                                    familyRegion = wizardFamilyRegion.trim().takeIf { it.isNotBlank() },
                                                    knownFamilyGothram = wizardKnownFamilyGothram.trim().takeIf { it.isNotBlank() },
                                                ),
                                            )
                                        }.onSuccess { result ->
                                            devoteeName = wizardDevoteeName
                                            gothram = result.gothram
                                            gothramConfidence = result.confidence
                                            gothramSource = result.source
                                            gothramGuidanceText = result.guidanceText
                                            submitMessage = when {
                                                result.gothram == "Unknown" -> "No reliable gothram match found. Continue with Unknown and update later."
                                                result.confidence == "low" -> "Suggested gothram: ${result.gothram} (low confidence)."
                                                else -> "Suggested gothram: ${result.gothram}."
                                            }
                                            DivyaRuntime.trackEvent("gothram_guidance_completed")
                                            DivyaRuntime.trackEvent(
                                                "gothram_guidance_result_applied",
                                                mapOf(
                                                    "confidence" to result.confidence,
                                                    "source" to result.source,
                                                    "is_unknown" to (result.gothram == "Unknown"),
                                                ),
                                            )
                                            showFeedback("Gothram guidance applied.", false)
                                            showGothramWizard = false
                                        }.onFailure { error ->
                                            DivyaRuntime.reportHandledError(error, mapOf("screen" to "waitlist_gothram_wizard"))
                                            showFeedback(error.message ?: "Could not generate gothram guidance.", true)
                                        }
                                        wizardLoading = false
                                    }
                                },
                                modifier = Modifier.weight(1f),
                                enabled = !wizardLoading,
                            ) {
                                if (wizardLoading) {
                                    CircularProgressIndicator(
                                        modifier = Modifier.semantics { contentDescription = "Finding gothram" },
                                    )
                                } else {
                                    Text("Apply guidance")
                                }
                            }
                        }
                    }
                }
            }
        }
    }
}

private fun normalizeGothramInput(input: String, devoteeName: String): String {
    val normalized = input.trim()
    if (normalized.isNotEmpty()) {
        return normalized
    }
    return suggestGothramFromName(devoteeName)
}

private fun suggestGothramFromName(devoteeName: String): String {
    val name = devoteeName.trim().lowercase(Locale.US)
    if (name.isBlank()) return "Unknown"

    val rules = listOf(
        Regex("\\b(nair|menon|pillai|kurup)\\b") to "Kashyap",
        Regex("\\b(iyer|iyengar|sharma|dikshit|chaturvedi)\\b") to "Bharadwaj",
        Regex("\\b(reddy|rao|murthy)\\b") to "Vasishta",
        Regex("\\b(gupta|aggarwal|agarwal)\\b") to "Garg",
        Regex("\\b(patel|mehta|shah)\\b") to "Kashyap",
        Regex("\\b(acharya|upadhyay)\\b") to "Atri",
    )

    val match = rules.firstOrNull { (pattern, _) -> pattern.containsMatchIn(name) }
    return match?.second ?: "Unknown"
}

private fun gothramConfidenceDisplay(confidence: String?): String {
    return when (confidence) {
        "high" -> "High (family-provided)"
        "low" -> "Low (best effort)"
        "user_provided" -> "User provided"
        "none" -> "Unknown"
        else -> "Not set"
    }
}

private fun isNetworkConnected(context: Context): Boolean {
    val manager = context.getSystemService(Context.CONNECTIVITY_SERVICE) as? ConnectivityManager ?: return false
    val network = manager.activeNetwork ?: return false
    val capabilities = manager.getNetworkCapabilities(network) ?: return false
    return capabilities.hasCapability(NetworkCapabilities.NET_CAPABILITY_INTERNET)
}
