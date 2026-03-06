package com.divya.data.repository

import com.divya.data.models.Puja
import com.divya.data.network.PujaApi

class PujaRepository(private val api: PujaApi) {
    suspend fun all(currency: String): List<Puja> = api.getAll(currency)
    suspend fun get(id: String, currency: String): Puja = api.getById(id, currency)
}

