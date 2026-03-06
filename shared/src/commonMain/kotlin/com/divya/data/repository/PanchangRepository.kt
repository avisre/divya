package com.divya.data.repository

import com.divya.data.local.PanchangLocalDataSource
import com.divya.data.models.Panchang
import com.divya.data.network.PanchangApi

class PanchangRepository(
    private val api: PanchangApi,
    private val local: PanchangLocalDataSource,
) {
    suspend fun today(timezone: String): Panchang = api.today(timezone).also(local::save)
    suspend fun upcoming(): List<Panchang> = api.upcoming().also { list -> list.forEach(local::save) }
}

