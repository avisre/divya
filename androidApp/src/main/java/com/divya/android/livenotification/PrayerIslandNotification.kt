package com.divya.android.livenotification

import android.content.Context
import android.widget.RemoteViews
import androidx.core.app.NotificationCompat
import androidx.core.app.NotificationManagerCompat
import com.divya.android.R

object PrayerIslandNotification {
    const val CHANNEL_ID = "prayer_live"
    const val NOTIFICATION_ID = 1001

    fun show(
        context: Context,
        prayerName: String,
        repetitionCurrent: Int,
        repetitionTotal: Int,
        progressFraction: Float,
    ) {
        val compactView = RemoteViews(context.packageName, R.layout.notification_prayer_compact).apply {
            setTextViewText(R.id.prayer_name, prayerName)
            setTextViewText(R.id.rep_counter, "$repetitionCurrent / $repetitionTotal")
            setProgressBar(R.id.prayer_progress, 100, (progressFraction * 100).toInt(), false)
        }

        val expandedView = RemoteViews(context.packageName, R.layout.notification_prayer_expanded).apply {
            setTextViewText(R.id.prayer_title, prayerName)
            setTextViewText(R.id.rep_detail, "Repetition $repetitionCurrent of $repetitionTotal")
            setProgressBar(R.id.progress_bar, 100, (progressFraction * 100).toInt(), false)
        }

        val notification = NotificationCompat.Builder(context, CHANNEL_ID)
            .setSmallIcon(R.drawable.ic_om)
            .setCustomContentView(compactView)
            .setCustomBigContentView(expandedView)
            .setStyle(NotificationCompat.DecoratedCustomViewStyle())
            .setOngoing(true)
            .setSilent(true)
            .setColorized(true)
            .setColor(0xFFFF6B00.toInt())
            .build()

        NotificationManagerCompat.from(context).notify(NOTIFICATION_ID, notification)
    }

    fun dismiss(context: Context) {
        NotificationManagerCompat.from(context).cancel(NOTIFICATION_ID)
    }
}
