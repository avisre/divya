package com.divya.android.livenotification

import android.content.Context
import androidx.core.app.NotificationCompat
import androidx.core.app.NotificationManagerCompat
import com.divya.android.R

object PujaIslandNotification {
    const val CHANNEL_ID = "puja_live"
    const val NOTIFICATION_ID = 1002

    fun show(context: Context, pujaName: String, minutesRemaining: Int) {
        val notification = NotificationCompat.Builder(context, CHANNEL_ID)
            .setSmallIcon(R.drawable.ic_om)
            .setContentTitle("Your Puja is Happening Now")
            .setContentText("$pujaName • ~${minutesRemaining} min remaining")
            .setOngoing(true)
            .setSilent(true)
            .build()
        NotificationManagerCompat.from(context).notify(NOTIFICATION_ID, notification)
    }
}

