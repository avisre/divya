package com.divya.data.network

import com.divya.data.models.Puja

class PujaApi(private val client: DivyaApiClient) {
    suspend fun getAll(currency: String): List<Puja> = client.get("/pujas?currency=$currency")
    suspend fun getById(id: String, currency: String): Puja = client.get("/pujas/$id?currency=$currency")
}

