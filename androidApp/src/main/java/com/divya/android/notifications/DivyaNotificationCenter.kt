package com.divya.android.notifications

import android.app.NotificationChannel
import android.app.NotificationManager
import android.app.PendingIntent
import android.content.Context
import android.content.Intent
import android.net.Uri
import android.os.Build
import androidx.core.app.NotificationCompat
import androidx.core.app.NotificationManagerCompat
import com.divya.android.MainActivity
import com.divya.android.R
import com.divya.android.livenotification.PrayerIslandNotification
import com.divya.android.livenotification.PujaIslandNotification
import com.divya.android.navigation.DivyaRoutes

object DivyaNotificationCenter {
    const val MEDIA_PLAYBACK_CHANNEL_ID = "prayer_media_playback"
    private const val GENERAL_CHANNEL_ID = "divya_updates"
    private const val GENERAL_NOTIFICATION_ID = 3001

    fun ensureChannels(context: Context) {
        if (Build.VERSION.SDK_INT < Build.VERSION_CODES.O) {
            return
        }

        val manager = context.getSystemService(NotificationManager::class.java)
        val channels = listOf(
            NotificationChannel(GENERAL_CHANNEL_ID, "Divya updates", NotificationManager.IMPORTANCE_DEFAULT),
            NotificationChannel(PrayerIslandNotification.CHANNEL_ID, "Prayer sessions", NotificationManager.IMPORTANCE_LOW),
            NotificationChannel(PujaIslandNotification.CHANNEL_ID, "Live puja", NotificationManager.IMPORTANCE_LOW),
            NotificationChannel(MEDIA_PLAYBACK_CHANNEL_ID, "Prayer media playback", NotificationManager.IMPORTANCE_LOW),
        )
        channels.forEach(manager::createNotificationChannel)
    }

    fun showRemoteMessage(
        context: Context,
        title: String,
        body: String,
        data: Map<String, String>,
    ) {
        ensureChannels(context)

        val deepLink = data["deepLink"]
        when (data["type"]) {
            "puja_in_progress" -> {
                PujaIslandNotification.show(
                    context = context,
                    pujaName = data["pujaName"] ?: "Your puja",
                    minutesRemaining = data["minutesRemaining"]?.toIntOrNull() ?: 60,
                )
            }
            "prayer_session" -> {
                PrayerIslandNotification.show(
                    context = context,
                    prayerName = data["prayerName"] ?: "Prayer",
                    repetitionCurrent = data["repetitionCurrent"]?.toIntOrNull() ?: 1,
                    repetitionTotal = data["repetitionTotal"]?.toIntOrNull() ?: 21,
                    progressFraction = data["progressFraction"]?.toFloatOrNull() ?: 0.25f,
                )
            }
        }

        showNotification(context, title, body, deepLink)
    }

    fun showNotification(
        context: Context,
        title: String,
        body: String,
        deepLink: String?,
    ) {
        ensureChannels(context)
        val pendingIntent = PendingIntent.getActivity(
            context,
            GENERAL_NOTIFICATION_ID,
            Intent(context, MainActivity::class.java).apply {
                putExtra("route", routeFromDeepLink(deepLink))
                flags = Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_CLEAR_TOP
            },
            PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE,
        )

        val notification = NotificationCompat.Builder(context, GENERAL_CHANNEL_ID)
            .setSmallIcon(R.drawable.ic_om)
            .setContentTitle(title)
            .setContentText(body)
            .setStyle(NotificationCompat.BigTextStyle().bigText(body))
            .setContentIntent(pendingIntent)
            .setAutoCancel(true)
            .build()

        NotificationManagerCompat.from(context).notify(GENERAL_NOTIFICATION_ID, notification)
    }

    fun routeFromDeepLink(deepLink: String?): String {
        if (deepLink.isNullOrBlank()) {
            return DivyaRoutes.home.route
        }

        val uri = runCatching { Uri.parse(deepLink) }.getOrNull() ?: return DivyaRoutes.home.route
        val targetId = uri.lastPathSegment
        return when (uri.host) {
            "prayer" -> DivyaRoutes.prayerFor(targetId)
            "deity" -> DivyaRoutes.deity.route
            "puja" -> DivyaRoutes.puja.route
            "booking" -> DivyaRoutes.myPujas.route
            "puja-video" -> DivyaRoutes.video.route
            "temple" -> DivyaRoutes.temple.route
            "my-pujas" -> DivyaRoutes.myPujas.route
            else -> DivyaRoutes.home.route
        }
    }
}
