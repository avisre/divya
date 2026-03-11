plugins {
    id("com.android.application")
    kotlin("android")
}

import java.util.Properties

kotlin {
    jvmToolchain(17)
}

val localProperties = Properties().apply {
    val file = rootProject.file("local.properties")
    if (file.exists()) {
        file.inputStream().use(::load)
    }
}

fun readConfig(name: String, defaultValue: String): String {
    val raw = localProperties.getProperty(name)
        ?: System.getenv(name)
        ?: defaultValue
    return raw.replace(Regex("""\\([:=/])"""), "$1")
}

val apiUrlDebug = readConfig("DIVYA_API_URL_DEBUG", readConfig("DIVYA_API_URL", "http://10.0.2.2:5000/api"))
val apiUrlRelease = readConfig("DIVYA_API_URL_RELEASE", "https://divya-twug.onrender.com/api")
val apiUrlDevice = readConfig("DIVYA_API_URL_DEVICE", readConfig("DIVYA_API_URL", "http://10.0.2.2:5000/api"))
val googleWebClientId = readConfig("GOOGLE_WEB_CLIENT_ID", "")
val playUploadStoreFile = readConfig("PLAY_UPLOAD_STORE_FILE", "")
val playUploadStorePassword = readConfig("PLAY_UPLOAD_STORE_PASSWORD", "")
val playUploadKeyAlias = readConfig("PLAY_UPLOAD_KEY_ALIAS", "")
val playUploadKeyPassword = readConfig("PLAY_UPLOAD_KEY_PASSWORD", "")
val hasReleaseSigning =
    playUploadStoreFile.isNotBlank() &&
        playUploadStorePassword.isNotBlank() &&
        playUploadKeyAlias.isNotBlank() &&
        playUploadKeyPassword.isNotBlank()

android {
    namespace = "com.divya.android"
    compileSdk = 35

    defaultConfig {
        applicationId = "com.divya.prayerapp.avinash"
        minSdk = 26
        targetSdk = 35
        versionCode = 16
        versionName = "16.0.0"
        testInstrumentationRunner = "androidx.test.runner.AndroidJUnitRunner"
        buildConfigField("String", "DIVYA_API_URL", "\"$apiUrlDebug\"")
        buildConfigField("String", "DIVYA_API_URL_DEVICE", "\"$apiUrlDevice\"")
        buildConfigField("String", "GOOGLE_WEB_CLIENT_ID", "\"$googleWebClientId\"")
        buildConfigField("String", "APP_PLATFORM", "\"android\"")
        buildConfigField("boolean", "ENABLE_GALLERY_TOOLS", "true")
    }

    buildFeatures {
        compose = true
        buildConfig = true
    }

    composeOptions {
        kotlinCompilerExtensionVersion = "1.5.14"
    }

    compileOptions {
        sourceCompatibility = JavaVersion.VERSION_17
        targetCompatibility = JavaVersion.VERSION_17
    }

    kotlinOptions {
        jvmTarget = "17"
    }

    signingConfigs {
        if (hasReleaseSigning) {
            create("release") {
                storeFile = rootProject.file(playUploadStoreFile)
                storePassword = playUploadStorePassword
                keyAlias = playUploadKeyAlias
                keyPassword = playUploadKeyPassword
            }
        }
    }

    buildTypes {
        debug {
            applicationIdSuffix = ".debug"
            versionNameSuffix = "-debug"
            manifestPlaceholders["usesCleartextTraffic"] = "true"
            buildConfigField("String", "DIVYA_API_URL", "\"$apiUrlDebug\"")
            buildConfigField("String", "DIVYA_API_URL_DEVICE", "\"$apiUrlDevice\"")
            buildConfigField("String", "GOOGLE_WEB_CLIENT_ID", "\"$googleWebClientId\"")
            buildConfigField("boolean", "ENABLE_GALLERY_TOOLS", "true")
            buildConfigField("boolean", "ENABLE_SHARED_PRAYER_PREVIEW", "true")
        }
        release {
            isMinifyEnabled = true
            isShrinkResources = true
            manifestPlaceholders["usesCleartextTraffic"] = "false"
            buildConfigField("String", "DIVYA_API_URL", "\"$apiUrlRelease\"")
            buildConfigField("String", "DIVYA_API_URL_DEVICE", "\"$apiUrlRelease\"")
            buildConfigField("String", "GOOGLE_WEB_CLIENT_ID", "\"$googleWebClientId\"")
            buildConfigField("boolean", "ENABLE_GALLERY_TOOLS", "false")
            buildConfigField("boolean", "ENABLE_SHARED_PRAYER_PREVIEW", "false")
            if (hasReleaseSigning) {
                signingConfig = signingConfigs.getByName("release")
            }
            proguardFiles(
                getDefaultProguardFile("proguard-android-optimize.txt"),
                "proguard-rules.pro"
            )
        }
    }
}

dependencies {
    implementation(project(":shared"))
    implementation(platform("androidx.compose:compose-bom:2024.02.02"))
    implementation("androidx.activity:activity-compose:1.9.2")
    implementation("androidx.compose.material3:material3")
    implementation("androidx.compose.ui:ui")
    implementation("androidx.compose.ui:ui-tooling-preview")
    implementation("androidx.navigation:navigation-compose:2.8.3")
    implementation("androidx.core:core-ktx:1.13.1")
    implementation("androidx.lifecycle:lifecycle-runtime-ktx:2.8.6")
    implementation("androidx.lifecycle:lifecycle-runtime-compose:2.8.6")
    implementation("androidx.lifecycle:lifecycle-viewmodel-compose:2.8.6")
    implementation("androidx.core:core-splashscreen:1.0.1")
    implementation("androidx.core:core:1.13.1")
    implementation("androidx.security:security-crypto:1.1.0-alpha06")
    implementation("androidx.credentials:credentials:1.3.0")
    implementation("androidx.credentials:credentials-play-services-auth:1.3.0")
    implementation("com.google.android.libraries.identity.googleid:googleid:1.1.1")
    implementation("androidx.work:work-runtime-ktx:2.9.1")
    implementation("androidx.media3:media3-exoplayer:1.4.1")
    implementation("androidx.media3:media3-ui:1.4.1")
    implementation("androidx.media3:media3-session:1.4.1")
    implementation("io.coil-kt:coil-compose:2.7.0")
    implementation("com.squareup.okhttp3:okhttp:4.12.0")
    implementation("io.socket:socket.io-client:2.1.0") {
        exclude(group = "org.json", module = "json")
    }
    implementation("com.google.firebase:firebase-messaging:24.0.1")
    implementation("org.jetbrains.kotlinx:kotlinx-coroutines-android:1.8.1")
    debugImplementation("androidx.compose.ui:ui-tooling")
    debugImplementation("androidx.compose.ui:ui-test-manifest")
    testImplementation("junit:junit:4.13.2")
    testImplementation("org.jetbrains.kotlinx:kotlinx-coroutines-test:1.8.1")
    testImplementation("io.mockk:mockk:1.13.12")
    androidTestImplementation(platform("androidx.compose:compose-bom:2024.02.02"))
    androidTestImplementation("androidx.compose.ui:ui-test-junit4")
    androidTestImplementation("androidx.test.ext:junit:1.2.1")
    androidTestImplementation("androidx.test.espresso:espresso-core:3.6.1")
}

tasks.register("verifyAudioReleaseGate") {
    group = "verification"
    description = "Runs audio/player-focused tests and fails release if any fail."
    dependsOn("testDebugUnitTest")
}

tasks.matching { task ->
    task.name in setOf("generateDebugBuildConfig", "generateReleaseBuildConfig")
}.configureEach {
    inputs.property("divya.api.debug", apiUrlDebug)
    inputs.property("divya.api.device", apiUrlDevice)
    inputs.property("divya.api.release", apiUrlRelease)
}
