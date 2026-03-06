package com.divya.data.network

import com.divya.data.models.Prayer

class PrayerApi(private val client: DivyaApiClient) {
    suspend fun getFeatured(): List<Prayer> = client.get("/prayers/featured")
    suspend fun getDaily(): List<Prayer> = client.get("/prayers/daily")
    suspend fun getPrayer(id: String): Prayer = client.get("/prayers/$id")
    suspend fun getAll(): List<Prayer> = client.get("/prayers")
}

