package com.divya.data.local

import com.divya.data.models.Panchang

class PanchangLocalDataSource {
    private val cache = mutableMapOf<String, Panchang>()

    fun save(item: Panchang) {
        cache[item.date] = item
    }

    fun get(date: String): Panchang? = cache[date]
}

