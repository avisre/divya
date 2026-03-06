package com.divya.domain.usecase

import com.divya.data.models.Nakshatra
import com.divya.domain.util.NakshatraCalculator

class CalculateNakshatraUseCase {
    operator fun invoke(moonLongitude: Double): Nakshatra = NakshatraCalculator.fromMoonLongitude(moonLongitude)
}

