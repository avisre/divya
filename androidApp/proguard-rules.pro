# Keep Kotlin serialization metadata used by shared KMM models.
-keepclassmembers class kotlinx.serialization.** {
    *;
}
-keep class kotlinx.serialization.** { *; }

# Keep model packages used by JSON parsing and navigation payloads.
-keep class com.divya.data.models.** { *; }
-keep class com.divya.android.app.** { *; }

# Keep Media3 player classes referenced by reflection in notifications/media sessions.
-keep class androidx.media3.** { *; }

# Keep Socket.IO classes used at runtime.
-keep class io.socket.** { *; }
