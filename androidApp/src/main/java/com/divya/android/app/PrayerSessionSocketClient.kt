package com.divya.android.app

import io.socket.client.IO
import io.socket.client.Socket
import org.json.JSONObject

object PrayerSessionSocketClient {
    private var socket: Socket? = null

    fun connect(apiBaseUrl: String, token: String?): Socket {
        if (socket?.connected() == true) {
            return socket!!
        }
        val host = apiBaseUrl.removeSuffix("/api")
        val options = IO.Options.builder()
            .setTransports(arrayOf("websocket"))
            .build()
        if (!token.isNullOrBlank()) {
            options.auth = mapOf("token" to token)
        }
        socket = IO.socket(host, options)
        socket?.connect()
        return socket!!
    }

    fun joinSession(sessionCode: String, userId: String, name: String) {
        socket?.emit(
            "join_session",
            JSONObject()
                .put("sessionCode", sessionCode)
                .put("userId", userId)
                .put("name", name),
        )
    }

    fun startSession(sessionCode: String, totalRepetitions: Int) {
        socket?.emit(
            "start_session",
            JSONObject()
                .put("sessionCode", sessionCode)
                .put("totalRepetitions", totalRepetitions),
        )
    }

    fun completeRepetition(sessionCode: String) {
        socket?.emit("rep_complete", JSONObject().put("sessionCode", sessionCode))
    }

    fun advanceVerse(sessionCode: String, verseIndex: Int) {
        socket?.emit(
            "verse_advance",
            JSONObject()
                .put("sessionCode", sessionCode)
                .put("verseIndex", verseIndex),
        )
    }

    fun endSession(sessionCode: String) {
        socket?.emit("end_session", JSONObject().put("sessionCode", sessionCode))
    }

    fun disconnect() {
        socket?.disconnect()
        socket = null
    }
}
