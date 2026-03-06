package com.divya.android.notifications

import com.divya.android.app.DivyaRuntime
import com.google.firebase.messaging.FirebaseMessagingService
import com.google.firebase.messaging.RemoteMessage

class DivyaFirebaseMessagingService : FirebaseMessagingService() {
    override fun onNewToken(token: String) {
        DivyaRuntime.initialize(applicationContext)
        DivyaRuntime.registerPushToken(token)
    }

    override fun onMessageReceived(message: RemoteMessage) {
        DivyaRuntime.initialize(applicationContext)
        val title = message.notification?.title ?: message.data["title"] ?: "Divya"
        val body = message.notification?.body ?: message.data["body"] ?: "You have a new temple update."
        DivyaNotificationCenter.showRemoteMessage(
            context = applicationContext,
            title = title,
            body = body,
            data = message.data,
        )
        DivyaRuntime.trackEvent(
            "push_received",
            mapOf("type" to (message.data["type"] ?: "generic")),
        )
    }
}
