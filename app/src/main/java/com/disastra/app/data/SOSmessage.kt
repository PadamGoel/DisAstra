package com.disastra.app.data

import kotlinx.serialization.Serializable

/**
 * Defines the structured data for an "One Touch to Safety" SOS broadcast.
 * This object will be serialized to a JSON string before being sent.
 *
 * This fulfills the "Data & Payload Requirements."
 */
@Serializable
data class SosMessage(
    val emergencyType: String,
    val latitude: Double,
    val longitude: Double,
    val altitude: Double,
    val batteryPercent: Int,
    val timestamp: Long // UNIX epoch time
)

/**
 * Defines the structured data for an SOS Update.
 * This is sent *after* an initial SOS to provide more context.
 */
@Serializable
data class SosUpdateMessage(
    val originalTimestamp: Long, // Links this update to the initial SOS timestamp
    val numPeople: String,
    val medicalSupplies: String,
    val additionalInfo: String
)

/**
 * Defines the message sent when a user marks themselves as safe.
 */
@Serializable
data class SafeMessage(
    val originalTimestamp: Long, // Links this to the initial SOS timestamp
    val isSafe: Boolean = true,
    val safeTimestamp: Long // UNIX epoch time when they marked safe
)
