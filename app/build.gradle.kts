import java.util.Properties
import java.io.FileInputStream

plugins {
    id("com.android.application")
    id("org.jetbrains.kotlin.android")
    id("com.google.dagger.hilt.android") // Add Hilt
    id("kotlin-kapt") // Add kapt for annotation processing
    //kotlin("plugin.serialization") // Add serialization
    id ("org.jetbrains.kotlin.plugin.compose")
    id("org.jetbrains.kotlin.plugin.serialization")
}

android {
    namespace = "com.disastra.app"
    compileSdk = 35

//    buildFeatures {
//        buildConfig = true
//    }

    defaultConfig {
        applicationId = "com.disastra.app"
        minSdk = 26
        targetSdk = 34
        versionCode = 1
        versionName = "1.0"

        testInstrumentationRunner = "androidx.test.runner.AndroidJUnitRunner"
        vectorDrawables {
            useSupportLibrary = true
        }
    }

//    val secretsProperties = Properties()
//    val secretsFile = project.rootProject.file("app/secrets.properties")
//    if (secretsFile.exists()) {
//        secretsProperties.load(FileInputStream(secretsFile))
//    } else {
//        println("Warning: secrets.properties file not found. API key will be missing.")
//    }

    buildTypes {
        release {
            isMinifyEnabled = false
            proguardFiles(
                getDefaultProguardFile("proguard-android-optimize.txt"),
                "proguard-rules.pro"
            )
            // Pass the API key to the manifest
            //manifestPlaceholders["BRIDGEFY_API_KEY"] = secretsProperties.getProperty("BRIDGEFY_API_KEY", "")

            // 2. Pass the key to the Kotlin code (BuildConfig)
            //buildConfigField("String", "BRIDGEFY_API_KEY", "\"${secretsProperties.getProperty("BRIDGEFY_API_KEY", "")}\"")
        }
//        debug {
//            // Pass the API key to the manifest for debug builds too
//            manifestPlaceholders["BRIDGEFY_API_KEY"] = secretsProperties.getProperty("BRIDGEFY_API_KEY", "")
//
//            // 2. Pass the key to the Kotlin code (BuildConfig)
//            //buildConfigField("String", "BRIDGEFY_API_KEY", "\"${secretsProperties.getProperty("BRIDGEFY_API_KEY", "")}\"")
//        }
    }

    compileOptions {
        isCoreLibraryDesugaringEnabled = true
        sourceCompatibility = JavaVersion.VERSION_17
        targetCompatibility = JavaVersion.VERSION_17
    }

    kotlinOptions {
        jvmTarget = "17"
    }

    buildFeatures {
        compose = true
    }

//    composeOptions {
//        kotlinCompilerExtensionVersion = "1.5.1"
//    }

    packaging {
        resources {
            excludes += "/META-INF/{AL2.0,LGPL2.1}"
        }
    }
}

dependencies {
    coreLibraryDesugaring("com.android.tools:desugar_jdk_libs:2.1.4")

    // Core Android
    implementation("androidx.core:core-ktx:1.12.0")
    implementation("androidx.lifecycle:lifecycle-runtime-ktx:2.6.2")
    implementation("androidx.activity:activity-compose:1.8.2")

    // Compose BOM
    implementation(platform("androidx.compose:compose-bom:2024.02.00"))
    implementation("androidx.compose.ui:ui")
    implementation("androidx.compose.ui:ui-graphics")
    implementation("androidx.compose.ui:ui-tooling-preview")
    implementation("androidx.compose.material3:material3")

    // Material Icons Extended
    implementation("androidx.compose.material:material-icons-extended")

    // Navigation
    implementation("androidx.navigation:navigation-compose:2.7.6")

    // Permissions
    implementation("com.google.accompanist:accompanist-permissions:0.33.2-alpha")

    // Location Services
    implementation("com.google.android.gms:play-services-location:21.0.1")

    // Coroutines
    implementation("org.jetbrains.kotlinx:kotlinx-coroutines-android:1.9.0") // Updated to match Bridgefy
    implementation("org.jetbrains.kotlinx:kotlinx-coroutines-play-services:1.7.3")

    // ========== BRIDGEFYx SDK (Local AAR) ==========
    implementation(fileTree(mapOf("dir" to "libs", "include" to listOf("*.aar"))))

    // Bridgefy transitive dependencies (from POM file):
    // Kotlin
    implementation("org.jetbrains.kotlin:kotlin-stdlib:2.0.20")
    implementation("org.jetbrains.kotlinx:kotlinx-serialization-json:1.7.3")
    // Note: kotlinx-coroutines-android already declared above, using 1.9.0

    // Signal Protocol (for encryption)
    implementation("org.signal:libsignal-android:0.50.0")

    // Dependency Injection
    implementation("com.google.dagger:hilt-android:2.51.1")
    kapt("com.google.dagger:hilt-android-compiler:2.51.1")  // ADD THIS LINE!!!

    // AndroidX Libraries
    implementation("androidx.lifecycle:lifecycle-process:2.8.7")
    implementation("androidx.preference:preference-ktx:1.2.1")
    implementation("androidx.security:security-crypto:1.1.0-alpha06")
    implementation("androidx.work:work-runtime-ktx:2.10.0")

    // Database
    implementation("org.dbtools:dbtools-room:8.3.0")

    // Networking
    implementation("com.squareup.okhttp3:okhttp:4.12.0")
    implementation("com.squareup.okhttp3:logging-interceptor:4.12.0")
    implementation("com.squareup.retrofit2:retrofit:2.11.0")
    // ===============================================

    // Testing
    testImplementation("junit:junit:4.13.2")
    androidTestImplementation("androidx.test.ext:junit:1.1.5")
    androidTestImplementation("androidx.test.espresso:espresso-core:3.5.1")
    androidTestImplementation(platform("androidx.compose:compose-bom:2023.10.01"))
    androidTestImplementation("androidx.compose.ui:ui-test-junit4")

    // Debug
    debugImplementation("androidx.compose.ui:ui-tooling")
    debugImplementation("androidx.compose.ui:ui-test-manifest")
}
