pluginManagement {
    repositories {
        google()
        mavenCentral()
        gradlePluginPortal()
    }
}

val bridgefy_release_maven_url = "http://34.82.5.94:8081/artifactory/libs-release-local"

dependencyResolutionManagement {
    repositoriesMode.set(RepositoriesMode.FAIL_ON_PROJECT_REPOS)
    repositories {
        google()
        mavenCentral()

        // Add Bridgefy repository when implementing mesh networking
        maven {
            url = java.net.URI(bridgefy_release_maven_url)
            isAllowInsecureProtocol = true
        }
    }
}

rootProject.name = "Disastra"
include(":app")
