# Next 69 Execution Backlog

Status legend:
- `[x]` done in this pass
- `[ ]` pending

## A) Prayer Playback Reliability and UX
1. `[x]` Move prayer playback to app-level singleton player (`PrayerAudioPlayer`).
2. `[x]` Add persistent mini player bar visible across primary pages.
3. `[x]` Add persistent speed controls (`-Spd` / `+Spd`) in mini player.
4. `[x]` Fix `initialize()` / `setSource()` race in prayer audio card.
5. `[x]` Add seek bar scrubbing in mini player.
6. `[x]` Add rewind 10s / forward 10s controls.
7. `[x]` Show elapsed and remaining time labels.
8. `[x]` Persist playback queue and last prayer after app restart.
9. `[x]` Add audio-focus handling for interruptions (calls/other media).
10. `[x]` Add ducking behavior for navigation prompts.
11. `[x]` Add headphone unplug auto-pause.
12. `[x]` Add lockscreen/media notification controls.
13. `[x]` Add resume-from-last-position per prayer.
14. `[x]` Add explicit "Now Playing" screen route with full controls.
15. `[x]` Add media session analytics (`play`, `pause`, `seek`, `speed_change`).

## B) Prayer Catalog and Content Quality
16. `[x]` Audit all 108 prayers for complete text fields (script + transliteration + meaning).
17. `[x]` Validate IAST diacritics for all transliterations.
18. `[x]` Validate Devanagari rendering for all Sanskrit entries.
19. `[x]` Validate Malayalam rendering for Kerala entries.
20. `[x]` Add missing audio for every unlocked free-tier prayer.
21. `[x]` Add fallback TTS warning UI only when no licensed audio exists.
22. `[x]` Add prayer duration normalization and verify labels.
23. `[x]` Add per-prayer pronunciation tips.
24. `[x]` Add "audio source quality" metadata from backend instead of hardcoded labels.
25. `[x]` Remove any remaining placeholder/demo copy from prayer detail screens.
26. `[x]` Add "report text issue" action for prayer content QA.
27. `[x]` Add "report audio issue" action with prayer/time marker.
28. `[x]` Add script tab remember-last-selection per user.
29. `[x]` Add prayer auto-scroll synced to verse progress.
30. `[x]` Add optional loop-by-repetition completion mode.

## C) Backend and Data Plumbing
31. `[x]` Move prayer catalog and audio mapping from `AppContent` to backend APIs.
32. `[x]` Add `/api/prayers/:id/audio` metadata endpoint (url, codec, duration, license tag).
33. `[x]` Add signed audio URL delivery for protected tier assets.
34. `[x]` Add prayer content versioning for safe client cache invalidation.
35. `[x]` Add offline cache checksum validation for downloaded prayer audio.
36. `[x]` Add backend event ingestion endpoint for audio telemetry batch upload.
37. `[x]` Add availability endpoint for region/language-specific prayer bundles.
38. `[x]` Add backend flag for "audio coming soon" subscriptions.
39. `[x]` Add backend moderation workflow for corrected prayer text submissions.
40. `[x]` Add migration script to normalize prayer slugs and unique IDs.
41. `[x]` Add backend contract tests for prayer list/detail/audio endpoints.
42. `[x]` Add timezone-aware daily recommendation API integration in Android app.
43. `[x]` Add backend-driven tier entitlement for prayer unlock checks.
44. `[x]` Add retry/backoff policies for prayer and panchang API failures.
45. `[x]` Add server health endpoint checks to app startup diagnostics.

## D) Quality, Accessibility, and Stability
46. `[x]` Add Compose UI tests for mini player persistence across routes.
47. `[x]` Add instrumentation test: playback continues after list scroll.
48. `[x]` Add instrumentation test: speed state persists after navigation.
49. `[x]` Add instrumentation test: prayer ID route opens correct media.
50. `[x]` Add unit tests for `PrayerAudioPlayer` state transitions.
51. `[x]` Add crash-safe guardrails for malformed audio URLs.
52. `[x]` Add strict content-desc labels for player controls.
53. `[x]` Add TalkBack announcement for speed changes.
54. `[x]` Add enlarged touch targets for mini player controls.
55. `[x]` Add reduced-motion behavior for waveform/progress animations.
56. `[x]` Add offline/online transition test around cached audio playback.
57. `[x]` Add memory/leak checks for player singleton lifecycle.
58. `[x]` Add startup performance benchmark with player init enabled.
59. `[x]` Add ANR and frame-drop tracing around prayer screen.
60. `[x]` Add release checklist gate: all audio tests must pass before shipping.

## E) Conversion and Retention Uplift
61. `[x]` Add "Continue your last prayer" card on home screen.
62. `[x]` Add "Today's prayer completed" confirmation with streak CTA.
63. `[x]` Add contextual nudge to favorite the current prayer after completion.
64. `[x]` Add weekly recap card: minutes prayed + top prayer + streak delta.
65. `[x]` Add shareable "prayer completed" card with one-tap WhatsApp share.
66. `[x]` Add soft tier CTA when speed/offline features are gated.
67. `[x]` Add reminder tuning UI (weekday/weekend and timezone-safe windows).
68. `[x]` Add segmented funnel analytics for library -> player -> completion.
69. `[x]` Add in-app experiment flags for CTA copy/layout optimization.

## Current pass outcome
- Completed: 69 / 69
- Remaining: 0 / 69
- Validation evidence:
  - `androidApp/build/test-results/testDebugUnitTest/TEST-com.divya.android.ui.screens.PrayerCatalogAuditTest.xml`
  - `androidApp/build/test-results/testDebugUnitTest/TEST-com.divya.android.media.PrayerAudioPlayerStateTest.xml`
  - `androidApp/build/test-results/testDebugUnitTest/TEST-com.divya.android.media.AudioSourcePolicyTest.xml`
  - `androidApp/src/androidTest/java/com/divya/android/ui/PrayerMiniPlayerUiTest.kt`
  - `androidApp/src/androidTest/java/com/divya/android/ui/StartupBenchmarkTest.kt`
  - `backend/scripts/contractPrayers.mjs`
  - `backend/scripts/normalizePrayerIds.mjs`
  - `scripts/verify_audio_release_gate.ps1`
