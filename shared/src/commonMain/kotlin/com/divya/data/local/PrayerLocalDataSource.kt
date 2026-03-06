package com.divya.data.local

import com.divya.data.models.Prayer

class PrayerLocalDataSource {
    private val cache = mutableMapOf<String, Prayer>()

    fun saveAll(prayers: List<Prayer>) {
        prayers.forEach { cache[it.id] = it }
    }

    fun getAll(): List<Prayer> = cache.values.sortedBy { it.order }
    fun get(id: String): Prayer? = cache[id]
}

