package com.divya.island

expect class IslandManager {
    fun startPrayerSession(prayerName: String, totalRepetitions: Int, totalSeconds: Int)
    fun updatePrayerProgress(currentRep: Int, secondsRemaining: Int)
    fun endPrayerSession()
    fun showPujaInProgress(pujaName: String, minutesRemaining: Int)
    fun showVideoReady(pujaName: String, bookingId: String)
    fun showRahuKaalWarning(endsAtLocalTime: String)
    fun dismissAll()
}

