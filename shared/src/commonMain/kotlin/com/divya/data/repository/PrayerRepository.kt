package com.divya.data.repository

import com.divya.data.local.PrayerLocalDataSource
import com.divya.data.models.Prayer
import com.divya.data.network.PrayerApi

class PrayerRepository(
    private val api: PrayerApi,
    private val local: PrayerLocalDataSource,
) {
    suspend fun featured(): List<Prayer> = api.getFeatured().also(local::saveAll)
    suspend fun daily(): List<Prayer> = api.getDaily().also(local::saveAll)
    suspend fun all(): List<Prayer> = api.getAll().also(local::saveAll)
    suspend fun get(id: String): Prayer = local.get(id) ?: api.getPrayer(id).also { local.saveAll(listOf(it)) }
}

