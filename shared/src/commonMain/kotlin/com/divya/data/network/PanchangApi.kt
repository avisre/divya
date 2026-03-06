package com.divya.data.network

import com.divya.data.models.Panchang

class PanchangApi(private val client: DivyaApiClient) {
    suspend fun today(timezone: String): Panchang = client.get("/panchang/today?timezone=$timezone")
    suspend fun upcoming(): List<Panchang> = client.get("/panchang/upcoming")
}

