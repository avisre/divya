plugins {
    kotlin("multiplatform")
    kotlin("plugin.serialization")
    id("com.android.library")
    id("app.cash.sqldelight")
}

kotlin {
    jvmToolchain(17)
    androidTarget()
    val isMac = System.getProperty("os.name") == "Mac OS X"
    if (isMac) {
        iosX64()
        iosArm64()
        iosSimulatorArm64()
    }

    sourceSets {
        val commonMain by getting {
            dependencies {
                implementation("io.ktor:ktor-client-core:2.3.12")
                implementation("io.ktor:ktor-client-content-negotiation:2.3.12")
                implementation("io.ktor:ktor-serialization-kotlinx-json:2.3.12")
                implementation("org.jetbrains.kotlinx:kotlinx-serialization-json:1.6.3")
                implementation("org.jetbrains.kotlinx:kotlinx-coroutines-core:1.8.1")
                implementation("io.insert-koin:koin-core:3.5.6")
                implementation("co.touchlab:kermit:2.0.4")
                implementation("app.cash.sqldelight:runtime:2.0.2")
            }
        }
        val androidMain by getting {
            dependencies {
                implementation("io.ktor:ktor-client-okhttp:2.3.12")
                implementation("app.cash.sqldelight:android-driver:2.0.2")
            }
        }
        if (isMac) {
            val iosMain by getting {
                dependencies {
                    implementation("io.ktor:ktor-client-darwin:2.3.12")
                    implementation("app.cash.sqldelight:native-driver:2.0.2")
                }
            }
        }
    }
}

android {
    namespace = "com.divya.shared"
    compileSdk = 34
    defaultConfig {
        minSdk = 26
    }
    compileOptions {
        sourceCompatibility = JavaVersion.VERSION_17
        targetCompatibility = JavaVersion.VERSION_17
    }
}

sqldelight {
    databases {
        create("DivyaDatabase") {
            packageName.set("com.divya.db")
        }
    }
}
