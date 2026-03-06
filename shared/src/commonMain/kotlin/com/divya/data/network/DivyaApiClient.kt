package com.divya.data.network

import io.ktor.client.HttpClient
import io.ktor.client.call.body
import io.ktor.client.request.get
import io.ktor.client.request.header
import io.ktor.client.request.post
import io.ktor.client.request.setBody

class DivyaApiClient(
    @PublishedApi internal val baseUrl: String,
    @PublishedApi internal val httpClient: HttpClient,
    private val authTokenProvider: () -> String? = { null },
) {
    @PublishedApi
    internal fun authToken(): String? = authTokenProvider()

    suspend inline fun <reified T> get(path: String): T = httpClient.get("$baseUrl$path") {
        authToken()?.let { header("Authorization", "Bearer $it") }
    }.body()

    suspend inline fun <reified R, reified T> post(path: String, body: R): T = httpClient.post("$baseUrl$path") {
        authToken()?.let { header("Authorization", "Bearer $it") }
        setBody(body)
    }.body()
}
