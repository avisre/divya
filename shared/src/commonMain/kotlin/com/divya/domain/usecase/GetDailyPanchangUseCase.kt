package com.divya.domain.usecase

import com.divya.data.models.Panchang
import com.divya.data.repository.PanchangRepository

class GetDailyPanchangUseCase(private val repository: PanchangRepository) {
    suspend operator fun invoke(timezone: String): Panchang = repository.today(timezone)
}

