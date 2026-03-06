package com.divya.island

actual class IslandManager {
    actual fun startPrayerSession(prayerName: String, totalRepetitions: Int, totalSeconds: Int) = Unit
    actual fun updatePrayerProgress(currentRep: Int, secondsRemaining: Int) = Unit
    actual fun endPrayerSession() = Unit
    actual fun showPujaInProgress(pujaName: String, minutesRemaining: Int) = Unit
    actual fun showVideoReady(pujaName: String, bookingId: String) = Unit
    actual fun showRahuKaalWarning(endsAtLocalTime: String) = Unit
    actual fun dismissAll() = Unit
}

