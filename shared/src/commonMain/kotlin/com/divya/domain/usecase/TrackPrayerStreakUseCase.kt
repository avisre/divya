package com.divya.domain.usecase

class TrackPrayerStreakUseCase {
    operator fun invoke(previous: Int, prayedTodayAlready: Boolean): Int = if (prayedTodayAlready) previous else previous + 1
}

