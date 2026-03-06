package com.divya.android.navigation

import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.padding
import androidx.compose.material3.NavigationBar
import androidx.compose.material3.NavigationBarItem
import androidx.compose.material3.NavigationBarItemDefaults
import androidx.compose.material3.Scaffold
import androidx.compose.material3.Text
import androidx.compose.material3.TextButton
import androidx.compose.material3.TopAppBar
import androidx.compose.material3.TopAppBarDefaults
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.testTag
import androidx.compose.ui.semantics.contentDescription
import androidx.compose.ui.semantics.semantics
import androidx.compose.foundation.background
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.layout.PaddingValues
import androidx.compose.ui.unit.dp
import androidx.navigation.navArgument
import androidx.navigation.compose.NavHost
import androidx.navigation.compose.composable
import androidx.navigation.compose.currentBackStackEntryAsState
import androidx.navigation.compose.rememberNavController
import com.divya.android.BuildConfig
import com.divya.android.app.DivyaRuntime
import com.divya.android.ui.screens.CalendarScreen
import com.divya.android.ui.screens.DeityDetailScreen
import com.divya.android.ui.screens.DeityLearnScreen
import com.divya.android.ui.screens.DeityModuleScreen
import com.divya.android.ui.screens.FeatureOperationsScreen
import com.divya.android.ui.screens.FestivalDetailScreen
import com.divya.android.ui.screens.GalleryScreen
import com.divya.android.ui.screens.GiftsScreen
import com.divya.android.ui.screens.GuestExploreScreen
import com.divya.android.ui.screens.HomeScreen
import com.divya.android.ui.screens.LoginScreen
import com.divya.android.ui.screens.MyPujasScreen
import com.divya.android.ui.screens.NowPlayingScreen
import com.divya.android.ui.screens.OnboardingScreen
import com.divya.android.ui.screens.PrayerLibraryScreen
import com.divya.android.ui.screens.PrayerPlayerScreen
import com.divya.android.ui.screens.ProfileScreen
import com.divya.android.ui.screens.ProfileContactScreen
import com.divya.android.ui.screens.PujaDetailScreen
import com.divya.android.ui.screens.PujaVideoScreen
import com.divya.android.ui.screens.RegisterScreen
import com.divya.android.ui.screens.SharedPrayerCreateScreen
import com.divya.android.ui.screens.SharedPrayerScreen
import com.divya.android.ui.screens.SplashScreen
import com.divya.android.ui.screens.TempleScreen
import com.divya.android.ui.screens.WaitlistJoinScreen
import com.divya.android.ui.components.PrayerMiniPlayerBar
import com.divya.android.ui.theme.DeepBrown
import com.divya.android.ui.theme.Ivory
import com.divya.android.ui.theme.Saffron

@OptIn(androidx.compose.material3.ExperimentalMaterial3Api::class)
@Composable
fun DivyaNavGraph(startDestination: String) {
    val showGalleryTools = BuildConfig.ENABLE_GALLERY_TOOLS
    val navController = rememberNavController()
    val backStackEntry by navController.currentBackStackEntryAsState()
    val currentRoute = backStackEntry?.destination?.route ?: DivyaRoutes.normalize(startDestination)
    val currentTitle = DivyaRoutes.all.firstOrNull { it.route == currentRoute }?.title ?: "Divya"
    val showPrimaryNav = currentRoute in DivyaRoutes.primary.map { it.route }

    LaunchedEffect(currentRoute) {
        DivyaRuntime.trackScreen(currentRoute)
    }

    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text(currentTitle) },
                modifier = Modifier.testTag("top_app_bar"),
                colors = TopAppBarDefaults.topAppBarColors(
                    containerColor = Ivory.copy(alpha = 0.98f),
                    titleContentColor = DeepBrown,
                    actionIconContentColor = Saffron,
                    navigationIconContentColor = Saffron,
                ),
                navigationIcon = {
                    if (!showPrimaryNav && currentRoute != DivyaRoutes.gallery.route) {
                        TextButton(
                            onClick = { navController.navigateUp() },
                            modifier = Modifier.testTag("top_action_back"),
                        ) {
                            Text("Back")
                        }
                    }
                },
                actions = {
                    if (!showPrimaryNav && currentRoute != DivyaRoutes.home.route) {
                        TextButton(
                            onClick = {
                                navController.navigate(DivyaRoutes.home.route) {
                                    launchSingleTop = true
                                }
                            },
                            modifier = Modifier.testTag("top_action_home"),
                        ) {
                            Text("Home")
                        }
                    }
                    if (showGalleryTools && currentRoute != DivyaRoutes.gallery.route) {
                        TextButton(
                            onClick = {
                                navController.navigate(DivyaRoutes.gallery.route) {
                                    launchSingleTop = true
                                }
                            },
                            modifier = Modifier.testTag("top_action_gallery"),
                        ) {
                            Text("Gallery")
                        }
                    }
                },
            )
        },
        bottomBar = {
            Column {
                PrayerMiniPlayerBar(
                    onOpenPlayer = {
                        navController.navigate(DivyaRoutes.nowPlaying.route) {
                            launchSingleTop = true
                        }
                    },
                )
                if (showPrimaryNav) {
                    NavigationBar(
                        modifier = Modifier.testTag("bottom_nav_bar"),
                        containerColor = Ivory.copy(alpha = 0.98f),
                        contentColor = DeepBrown,
                    ) {
                        DivyaRoutes.primary.forEach { route ->
                            NavigationBarItem(
                                modifier = Modifier.testTag("bottom_nav_${route.route}"),
                                selected = currentRoute == route.route,
                                onClick = {
                                    navController.navigate(route.route) {
                                        launchSingleTop = true
                                        restoreState = true
                                        popUpTo(DivyaRoutes.home.route) {
                                            saveState = true
                                        }
                                    }
                                },
                                icon = {
                                    BottomNavEmojiIcon(
                                        route = route,
                                        selected = currentRoute == route.route,
                                    )
                                },
                                label = null,
                                alwaysShowLabel = false,
                                colors = NavigationBarItemDefaults.colors(
                                    selectedIconColor = DeepBrown,
                                    unselectedIconColor = DeepBrown,
                                    indicatorColor = Color.Transparent,
                                ),
                            )
                        }
                    }
                }
            }
        },
    ) { innerPadding ->
        NavHost(
            navController = navController,
            startDestination = DivyaRoutes.normalize(startDestination),
            modifier = Modifier.padding(innerPadding),
        ) {
            if (showGalleryTools) {
                composable(DivyaRoutes.gallery.route) {
                    GalleryScreen(routes = DivyaRoutes.all.filterNot { route -> route.route == DivyaRoutes.gallery.route }) {
                        navController.navigate(it)
                    }
                }
            }
            composable(DivyaRoutes.splash.route) { SplashScreen() }
            composable(DivyaRoutes.guest.route) { GuestExploreScreen(onOpen = navController::navigate) }
            composable(DivyaRoutes.onboarding.route) { OnboardingScreen(onOpen = navController::navigate) }
            composable(DivyaRoutes.login.route) { LoginScreen(onOpen = navController::navigate) }
            composable(DivyaRoutes.register.route) { RegisterScreen(onOpen = navController::navigate) }
            composable(DivyaRoutes.home.route) { HomeScreen(onOpen = navController::navigate) }
            composable(DivyaRoutes.library.route) { PrayerLibraryScreen(onOpen = navController::navigate) }
            composable(DivyaRoutes.nowPlaying.route) {
                NowPlayingScreen(onOpen = navController::navigate)
            }
            composable(
                route = "${DivyaRoutes.prayer.route}?prayerId={prayerId}",
                arguments = listOf(
                    navArgument("prayerId") {
                        nullable = true
                        defaultValue = null
                    },
                ),
            ) { backStackEntry ->
                PrayerPlayerScreen(
                    initialPrayerId = backStackEntry.arguments?.getString("prayerId"),
                    onOpen = navController::navigate,
                )
            }
            composable(DivyaRoutes.deity.route) { DeityDetailScreen(onOpen = navController::navigate) }
            composable(DivyaRoutes.deityLearn.route) { DeityLearnScreen(onOpen = navController::navigate) }
            composable(DivyaRoutes.deityModule.route) { DeityModuleScreen(onOpen = navController::navigate) }
            composable(DivyaRoutes.temple.route) { TempleScreen() }
            composable(DivyaRoutes.puja.route) { PujaDetailScreen(onOpen = navController::navigate) }
            composable(DivyaRoutes.waitlist.route) { WaitlistJoinScreen(onOpen = navController::navigate) }
            composable(DivyaRoutes.myPujas.route) { MyPujasScreen(onOpen = navController::navigate) }
            composable(DivyaRoutes.gifts.route) { GiftsScreen() }
            composable(DivyaRoutes.video.route) { PujaVideoScreen(onOpen = navController::navigate) }
            composable(DivyaRoutes.calendar.route) { CalendarScreen(onOpen = navController::navigate) }
            composable(DivyaRoutes.festival.route) { FestivalDetailScreen(onOpen = navController::navigate) }
            composable(DivyaRoutes.profile.route) { ProfileScreen(onOpen = navController::navigate) }
            composable(DivyaRoutes.profileContact.route) { ProfileContactScreen() }
            composable(DivyaRoutes.sharedPrayerCreate.route) { SharedPrayerCreateScreen(onOpen = navController::navigate) }
            composable(DivyaRoutes.sharedPrayerSession.route) { SharedPrayerScreen() }
            composable(DivyaRoutes.features.route) { FeatureOperationsScreen() }
        }
    }
}

@Composable
private fun BottomNavEmojiIcon(
    route: DivyaRoute,
    selected: Boolean,
) {
    val selectedContainer = Saffron.copy(alpha = 0.28f)
    val unselectedContainer = Color.Transparent
    val glyphColor = if (selected) DeepBrown else DeepBrown.copy(alpha = 0.75f)

    Box(
        modifier = Modifier
            .testTag("bottom_nav_icon_${route.route}")
            .semantics { contentDescription = route.navLabel }
            .clip(RoundedCornerShape(999.dp))
            .background(if (selected) selectedContainer else unselectedContainer)
            .padding(PaddingValues(horizontal = 16.dp, vertical = 8.dp)),
        contentAlignment = Alignment.Center,
    ) {
        Text(
            text = route.glyph,
            color = glyphColor,
        )
    }
}
