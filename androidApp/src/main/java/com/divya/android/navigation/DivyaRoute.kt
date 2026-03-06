package com.divya.android.navigation

import android.net.Uri

data class DivyaRoute(
    val route: String,
    val title: String,
    val navLabel: String = title,
    val glyph: String = "Om",
)

object DivyaRoutes {
    val gallery = DivyaRoute("gallery", "Screen Gallery", "Gallery", "[]")
    val splash = DivyaRoute("splash", "Splash", "Splash", "Om")
    val guest = DivyaRoute("guest", "Guest Explore", "Guest", "G")
    val onboarding = DivyaRoute("onboarding", "Onboarding", "Onboard", "Q")
    val login = DivyaRoute("login", "Login", "Login", "In")
    val register = DivyaRoute("register", "Register", "Register", "Up")
    val home = DivyaRoute("home", "Home", "Home", "\uD83C\uDFE0")
    val library = DivyaRoute("library", "Prayer Library", "Prayers", "\uD83D\uDCFF")
    val prayer = DivyaRoute("prayer", "Prayer Player", "Player", "Play")
    val nowPlaying = DivyaRoute("now-playing", "Now Playing", "Now Playing", "Now")
    val deity = DivyaRoute("deity", "Deity Detail", "Deity", "D")
    val deityLearn = DivyaRoute("deity-learn", "Deity Learn", "Learn", "L")
    val deityModule = DivyaRoute("deity-module", "Learning Module", "Module", "M")
    val temple = DivyaRoute("temple", "Temple", "Temple", "\uD83C\uDFDB\uFE0F")
    val puja = DivyaRoute("puja", "Puja Detail", "Puja", "S")
    val waitlist = DivyaRoute("waitlist", "Waitlist Join", "Waitlist", "W")
    val myPujas = DivyaRoute("my-pujas", "My Pujas", "My Pujas", "\uD83E\uDE94")
    val gifts = DivyaRoute("my-pujas-gifts", "Gifts", "Gifts", "Gift")
    val video = DivyaRoute("video", "Puja Video", "Video", "V")
    val calendar = DivyaRoute("calendar", "Calendar", "Calendar", "C")
    val festival = DivyaRoute("festival", "Festival Prep", "Festival", "F")
    val profile = DivyaRoute("profile", "Profile", "Profile", "\uD83D\uDC64")
    val profileContact = DivyaRoute("profile-contact", "Support Contact", "Contact", "Help")
    val sharedPrayerCreate = DivyaRoute("shared-prayer-create", "Create Shared Prayer", "Together", "Join")
    val sharedPrayerSession = DivyaRoute("shared-prayer-session", "Shared Prayer Session", "Session", "Sync")
    val features = DivyaRoute("features", "Feature Operations", "Features", "Ops")

    val all = listOf(
        gallery,
        splash,
        guest,
        onboarding,
        login,
        register,
        home,
        library,
        prayer,
        nowPlaying,
        deity,
        deityLearn,
        deityModule,
        temple,
        puja,
        waitlist,
        myPujas,
        gifts,
        video,
        calendar,
        festival,
        profile,
        profileContact,
        sharedPrayerCreate,
        sharedPrayerSession,
        features,
    )

    val primary = listOf(
        home,
        library,
        temple,
        myPujas,
        profile,
    )

    fun normalize(route: String?): String {
        val value = route ?: splash.route
        if (all.any { it.route == value }) {
            return value
        }

        val baseRoute = value.substringBefore("?")
        if (baseRoute == prayer.route && value.startsWith("${prayer.route}?")) {
            return value
        }

        return all.firstOrNull { it.route == baseRoute }?.route ?: splash.route
    }

    fun prayerFor(prayerId: String?): String {
        if (prayerId.isNullOrBlank()) {
            return prayer.route
        }
        return "${prayer.route}?prayerId=${Uri.encode(prayerId)}"
    }
}
