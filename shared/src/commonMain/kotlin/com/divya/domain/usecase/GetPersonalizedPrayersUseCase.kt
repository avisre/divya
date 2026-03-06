package com.divya.domain.usecase

import com.divya.data.models.Prayer
import com.divya.data.repository.PrayerRepository

class GetPersonalizedPrayersUseCase(private val repository: PrayerRepository) {
    suspend operator fun invoke(): List<Prayer> = repository.daily()
}

