// Root-level Gradle build file

// Top-level build file where you can add configuration options common to all sub-projects/modules.
plugins {
    id("com.android.application") version "8.7.2" apply false
    id("com.android.library") version "8.7.2" apply false
    id("org.jetbrains.kotlin.android") version "2.0.21" apply false
    id("org.jetbrains.kotlin.plugin.serialization") version "1.9.0" apply false
    id("com.google.dagger.hilt.android") version "2.51.1" apply false // Add Hilt
    id ("org.jetbrains.kotlin.plugin.compose") version "2.0.21" apply false
}
//tasks.register("clean", Delete::class) {
//
//// Convert the File object to a Path object before deleting
//
//    java.nio.file.Files.delete(rootProject.buildDir.toPath())
//
//}
