package com.disastra.app

import android.Manifest
import android.annotation.SuppressLint
import android.content.Context
import android.content.Intent
import android.content.IntentFilter
import android.location.Address
import android.location.Geocoder
import android.location.Location
import android.os.BatteryManager
import android.os.Build
import android.os.Bundle
import android.util.Log
import android.widget.Toast
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.activity.result.contract.ActivityResultContracts
import androidx.compose.runtime.*
import com.disastra.app.data.SafeMessage
import com.disastra.app.data.SosMessage
import com.disastra.app.data.SosUpdateMessage
import com.disastra.app.ui.DisastraTheme
import com.disastra.app.ui.EmergencyType
import com.disastra.app.ui.MainSosScreen
import com.disastra.app.ui.SosUiState
import com.google.android.gms.location.LocationServices
import kotlinx.serialization.encodeToString
import kotlinx.serialization.json.Json
import me.bridgefy.Bridgefy
import me.bridgefy.commons.TransmissionMode
import me.bridgefy.commons.exception.BridgefyException
import me.bridgefy.commons.listener.BridgefyDelegate
import me.bridgefy.commons.propagation.PropagationProfile
import java.text.SimpleDateFormat
import java.util.*

//import com.disastra.app.BuildConfig

class MainActivity : ComponentActivity() {

//    val apiKeyString = BuildConfig.BRIDGEFY_API_KEY

    private val messageLog = mutableStateListOf<String>()
    private lateinit var bridgefy: Bridgefy
    private val apiKey = UUID.fromString("cecda347-0311-44b0-bda7-3631050c3805")

    private val fusedLocationClient by lazy {
        LocationServices.getFusedLocationProviderClient(this)
    }

    private val geocoder by lazy { Geocoder(this, Locale.getDefault()) }

    private val json = Json { ignoreUnknownKeys = true }
    private val logDateFormatter = SimpleDateFormat("HH:mm:ss", Locale.getDefault())

    private var lastSosTimestamp by mutableStateOf<Long?>(null)
    private var sosUiState by mutableStateOf(SosUiState.IDLE)
    private var isDarkTheme by mutableStateOf(false)
    private var currentLocationName by mutableStateOf("Locating...")
    private var isBridgefyRunning by mutableStateOf(false) // <-- ADD THIS

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)

        val permissionLauncher = registerForActivityResult(
            ActivityResultContracts.RequestMultiplePermissions()
        ) { permissions ->
            val allGranted = permissions.entries.all { it.value }
            if (allGranted) {
                Log.d("Disastra", "All permissions granted. Initializing Bridgefy.")
                initializeBridgefy()
                updateLocationAddress() // Get initial location name
            } else {
                Log.e("Disastra", "Permissions denied. App cannot function.")
                Toast.makeText(this, "Permissions are required to run the app", Toast.LENGTH_LONG).show()
            }
        }

        setContent {
            DisastraTheme(isDarkTheme = isDarkTheme) {
                MainSosScreen(
                    lastSosTimestamp = lastSosTimestamp,
                    sosUiState = sosUiState,
                    isDarkTheme = isDarkTheme,
                    currentLocationName = currentLocationName,
                    messageLog = messageLog, // <-- FIX: Added message log back
                    isBridgefyRunning = isBridgefyRunning, // <-- ADD THIS
                    onThemeToggle = { isDarkTheme = !isDarkTheme },
                    onSosActivated = { emergencyType ->
                        val newTimestamp = System.currentTimeMillis()
                        Log.d("Disastra", "SOS Activated. Type: ${emergencyType.label}, TS: $newTimestamp")
                        sendSosMessage(emergencyType, newTimestamp)
                        lastSosTimestamp = newTimestamp
                        sosUiState = SosUiState.CONFIRMED
                    },
                    onSosUpdate = { updateMessage: SosUpdateMessage ->
                        Log.d("Disastra", "SOS Update requested: $updateMessage")
                        sendSosUpdateMessage(updateMessage)
                    },
                    onMarkSafe = {
                        if (lastSosTimestamp != null) {
                            Log.d("Disastra", "Marking as safe for SOS: $lastSosTimestamp")
                            sendSafeMessage(lastSosTimestamp!!)
                            sosUiState = SosUiState.SAFE
                        } else {
                            Log.e("Disastra", "Tried to mark safe, but lastSosTimestamp is null")
                            sosUiState = SosUiState.SAFE
                        }
                    }
                )
            }
        }

        askForPermissions(permissionLauncher)
    }

    private fun initializeBridgefy() {
        runOnUiThread {
            messageLog.add("Initializing Bridgefy...")
        }

        try {
            bridgefy = Bridgefy(applicationContext)

            // --- FIX: Add license update call ---
            // As per docs, this updates the license if needed.
            // This is likely required after the SDK update.
            // Make sure you have internet for the first run.
            /*
            try {
                bridgefy.updateLicense()
                Log.d("Disastra", "License update called successfully.")
                runOnUiThread { messageLog.add(0, "ℹ️ Checking license...") }
            } catch (e: Exception) {
                Log.w("Disastra", "bridgefy.updateLicense() threw: ${e.message}")
            }
            */
            // --- FIX: REMOVED the bridgefy.updateLicense() block ---
            // This call was for the new SDK and is causing the
            // initialization failure with your original .aar file.

            val delegate = object : BridgefyDelegate {
                override fun onStarted(userID: UUID) {
                    // --- FIX: Added try-catch for stability ---
                    try {
                        val log = "✅ Bridgefy Engine Started. My ID: $userID"
                        Log.d("Disastra", log)
                        runOnUiThread { messageLog.add(0, log) }
                        updateLocationAddress()
                        isBridgefyRunning = true // <-- ADD THIS
                    } catch (e: Exception) {
                        Log.e("Disastra", "Error in onStarted: ${e.message}")
                    }
                }

                override fun onConnected(peerID: UUID) {
                    // --- FIX: Added try-catch for stability ---
                    try {
                        val log = "🤝 Peer Connected: $peerID"
                        Log.d("Disastra", log)
                        runOnUiThread { messageLog.add(0, log) }
                    } catch (e: Exception) {
                        Log.e("Disastra", "Error in onConnected: ${e.message}")
                    }
                }
                override fun onDisconnected(peerID: UUID) {
                    // --- FIX: Added try-catch for stability ---
                    try {
                        val log = "👋 Peer Disconnected: $peerID"
                        Log.d("Disastra", log)
                        runOnUiThread { messageLog.add(0, log) }
                    } catch (e: Exception) {
                        Log.e("Disastra", "Error in onDisconnected: ${e.message}")
                    }
                }
                override fun onConnectedPeers(connectedPeers: List<UUID>) {
                    // --- FIX: Added try-catch for stability ---
                    try {
                        val log = "👥 Connected Peers (${connectedPeers.size}): ${connectedPeers.joinToString()}"
                        Log.d("Disastra", log)
                        runOnUiThread { messageLog.add(0, log) }
                    } catch (e: Exception) {
                        Log.e("Disastra", "Error in onConnectedPeers: ${e.message}")
                    }
                }
                override fun onEstablishSecureConnection(userId: UUID) { /* ... */ }
                override fun onFailToEstablishSecureConnection(userId: UUID, error: BridgefyException) { /* ... */ }

                override fun onStopped() {
                    isBridgefyRunning = false // <-- ADD THIS
                    runOnUiThread { messageLog.add(0, "ℹ️ Bridgefy Engine Stopped.") }
                }

                override fun onFailToStart(error: BridgefyException) {
                    isBridgefyRunning = false // <-- ADD THIS
                    val log = "❌ Bridgefy failed to start: ${error.message}"
                    Log.e("Disastra", log)
                    runOnUiThread { messageLog.add(0, log) }
                }

                override fun onFailToStop(error: BridgefyException) { /* ... */ }
                override fun onDestroySession() { /* ... */ }
                override fun onFailToDestroySession(error: BridgefyException) { /* ... */ }
                override fun onProgressOfSend(messageID: UUID, position: Int, of: Int) { /* ... */ }

                override fun onFailToSend(messageID: UUID, error: BridgefyException) {
                    // --- FIX: Added try-catch for stability ---
                    try {
                        val log = "❌ Failed to Send: $messageID. Error: ${error.message}"
                        Log.e("Disastra", log)
                        runOnUiThread { messageLog.add(0, log) }
                    } catch (e: Exception) {
                        Log.e("Disastra", "Error in onFailToSend: ${e.message}")
                    }
                }

                override fun onSend(messageID: UUID) {
                    // --- FIX: Added try-catch for stability ---
                    try {
                        val log = "✅ Confirmed Send: $messageID"
                        Log.d("Disastra", log)
                        runOnUiThread { messageLog.add(0, log) }
                    } catch (e: Exception) {
                        Log.e("Disastra", "Error in onSend: ${e.message}")
                    }
                }

                override fun onReceiveData(
                    data: ByteArray,
                    messageID: UUID,
                    transmissionMode: TransmissionMode,
                ) {
                    // --- FIX: Added try-catch for stability ---
                    try {
                        val messageData = String(data, Charsets.UTF_8)
                        val senderInfo = when (transmissionMode) {
                            is TransmissionMode.Broadcast -> "Broadcast from ${transmissionMode.sender}"
                            else -> "Unknown Mode"
                        }

                        val log = try {
                            val sosMessage = json.decodeFromString<SosMessage>(messageData)
                            val time = logDateFormatter.format(Date(sosMessage.timestamp))
                            "RECEIVED SOS (ID: $messageID) via $senderInfo:\n" +
                                    "Time: $time, Type: ${sosMessage.emergencyType}, Bat: ${sosMessage.batteryPercent}%\n" +
                                    "Coords: ${"%.4f".format(sosMessage.latitude)}, ${"%.4f".format(sosMessage.longitude)}"
                        } catch (e: Exception) {
                            try {
                                val updateMessage = json.decodeFromString<SosUpdateMessage>(messageData)
                                val time = logDateFormatter.format(Date(updateMessage.originalTimestamp))
                                val details = listOfNotNull(
                                    updateMessage.numPeople.takeIf { it.isNotEmpty() }?.let { "People: $it" },
                                    updateMessage.medicalSupplies.takeIf { it.isNotEmpty() }?.let { "Medical: $it" },
                                    updateMessage.additionalInfo.takeIf { it.isNotEmpty() }?.let { "Info: $it" }
                                ).joinToString(", ")
                                "RECEIVED SOS UPDATE (for $time) via $senderInfo:\nDetails: $details"
                            } catch (e2: Exception) {
                                try {
                                    val safeMessage = json.decodeFromString<SafeMessage>(messageData)
                                    val originalTime = logDateFormatter.format(Date(safeMessage.originalTimestamp))
                                    val safeTime = logDateFormatter.format(Date(safeMessage.safeTimestamp))
                                    "RECEIVED SAFE (for $originalTime) via $senderInfo:\nUser marked safe at $safeTime"
                                } catch (e3: Exception) {
                                    "RECEIVED (ID: $messageID) via $senderInfo:\n$messageData"
                                }
                            }
                        }

                        Log.d("Disastra", log)
                        runOnUiThread { messageLog.add(0, log) }
                    } catch (e: Exception) {
                        Log.e("Disastra", "Error in onReceiveData: ${e.message}")
                    }
                }
            }

            bridgefy.init(apiKey, delegate)
            runOnUiThread { messageLog.add("✅ Bridgefy Initialized Successfully") }
            startBridgefy()

        } catch (e: Exception) {
            Log.e("Disastra", "Failed to initialize Bridgefy: ${e.message}")
            runOnUiThread { messageLog.add(0, "❌ Init Failed: ${e.message}") }
        }
    }

    private fun startBridgefy() {
        try {
            Log.d("Disastra_OnePlus", "Attempting to call bridgefy.start()...")
            bridgefy.start(
                userId = null,
                propagationProfile = PropagationProfile.Standard
            )
            Log.d("Disastra", "Bridgefy start called")
        } catch (e: Exception) {
            Log.e("Disastra_OnePlus", "CRITICAL: bridgefy.start() THREW AN EXCEPTION: ${e.message}")
            runOnUiThread { messageLog.add(0, "❌ Failed to start: ${e.message}") }
        }
    }

    @SuppressLint("MissingPermission")
    private fun updateLocationAddress() {
        Log.d("Disastra", "Attempting to update location address...")
        fusedLocationClient.lastLocation
            .addOnSuccessListener { location: Location? ->
                if (location == null) {
                    Log.w("Disastra", "Failed to get location, it was null.")
                    currentLocationName = "Location not available"
                    return@addOnSuccessListener
                }

                try {
                    if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
                        geocoder.getFromLocation(location.latitude, location.longitude, 1) { addresses ->
                            currentLocationName = formatAddress(addresses.firstOrNull(), location)
                            Log.d("Disastra", "Geocoder (T+) result: $currentLocationName")
                        }
                    } else {
                        @Suppress("DEPRECATION")
                        val addresses = geocoder.getFromLocation(location.latitude, location.longitude, 1)
                        currentLocationName = formatAddress(addresses?.firstOrNull(), location)
                        Log.d("Disastra", "Geocoder (Legacy) result: $currentLocationName")
                    }
                } catch (e: Exception) {
                    Log.e("Disastra", "Geocoder failed", e)
                    currentLocationName = "Coords: ${"%.4f".format(location.latitude)}, ${"%.4f".format(location.longitude)}"
                }
            }
            .addOnFailureListener {
                Log.e("Disastra", "Failed to get location for geocoder", it)
                currentLocationName = "Location permission failed"
            }
    }

    // --- NEW: Helper function to format address ---
    private fun formatAddress(address: Address?, location: Location): String {
        val defaultCoords = "Coords: ${"%.4f".format(location.latitude)}, ${"%.4f".format(location.longitude)}"
        if (address == null) return defaultCoords

        // --- FIX: Prioritize specific location details like Sectors ---
        val specific = address.subLocality // e.g., "Sector 42"
            ?: address.thoroughfare     // e.g., "Main St"
            ?: address.featureName      // e.g., "Rock Garden"
        val city = address.locality ?: address.adminArea // e.g., "Chandigarh"

        return when {
            specific != null && city != null -> "$specific, $city"
            city != null -> city
            specific != null -> specific
            else -> defaultCoords
        }.trim(',', ' ')
    }


    @SuppressLint("MissingPermission")
    private fun sendSosMessage(emergencyType: EmergencyType, timestamp: Long) {
        val batteryLevel = getBatteryLevel()

        fusedLocationClient.lastLocation
            .addOnSuccessListener { location: Location? ->
                val lat = location?.latitude ?: 0.0
                val lon = location?.longitude ?: 0.0
                val alt = location?.altitude ?: 0.0

                val sosMessage = SosMessage(
                    emergencyType = emergencyType.label,
                    latitude = lat,
                    longitude = lon,
                    altitude = alt,
                    batteryPercent = batteryLevel,
                    timestamp = timestamp
                )

                val jsonString = json.encodeToString(sosMessage)
                sendMessage(jsonString)

                val time = logDateFormatter.format(Date(sosMessage.timestamp))
                val log = "SENT SOS: Time: $time, Type: ${sosMessage.emergencyType}, Bat: ${sosMessage.batteryPercent}%\n" +
                        "Coords: ${"%.4f".format(sosMessage.latitude)}, ${"%.4f".format(sosMessage.longitude)}"
                Log.d("Disastra", log)
                runOnUiThread { messageLog.add(0, log) }

                updateLocationAddress()
            }
            .addOnFailureListener {
                Log.e("Disastra", "Failed to get location for SOS", it)
                val sosMessage = SosMessage(
                    emergencyType = emergencyType.label,
                    latitude = 0.0,
                    longitude = 0.0,
                    altitude = 0.0,
                    batteryPercent = batteryLevel,
                    timestamp = timestamp
                )
                val jsonString = json.encodeToString(sosMessage)
                sendMessage(jsonString)

                val time = logDateFormatter.format(Date(sosMessage.timestamp))
                val log = "SENT SOS (Location Failed): Time: $time, Type: ${sosMessage.emergencyType}\n" +
                        "Coords: 0.0, 0.0"
                Log.d("Disastra", log)
                runOnUiThread { messageLog.add(0, log) }
            }
    }

    private fun sendSosUpdateMessage(update: SosUpdateMessage) {
        try {
            val jsonString = json.encodeToString(update)
            sendMessage(jsonString)
            val details = listOfNotNull(
                update.numPeople.takeIf { it.isNotEmpty() }?.let { "People: $it" },
                update.medicalSupplies.takeIf { it.isNotEmpty() }?.let { "Medical: $it" },
                update.additionalInfo.takeIf { it.isNotEmpty() }?.let { "Info: $it" }
            ).joinToString(", ")
            val log = "SENT SOS UPDATE: $details"
            Log.d("Disastra", log)
            runOnUiThread { messageLog.add(0, log) }
        } catch (e: Exception) {
            Log.e("Disastra", "Failed to serialize or send SOS Update: ${e.message}")
        }
    }

    private fun sendSafeMessage(originalSosTimestamp: Long) {
        try {
            val safeMessage = SafeMessage(
                originalTimestamp = originalSosTimestamp,
                safeTimestamp = System.currentTimeMillis()
            )
            val jsonString = json.encodeToString(safeMessage)
            sendMessage(jsonString)
            val log = "SENT: MARKED AS SAFE"
            Log.d("Disastra", log)
            runOnUiThread { messageLog.add(0, log) }
        } catch (e: Exception) {
            Log.e("Disastra", "Failed to serialize or send Safe Message: ${e.message}")
        }
    }

    private fun getBatteryLevel(): Int {
        val batteryIntent = registerReceiver(null, IntentFilter(Intent.ACTION_BATTERY_CHANGED))
        val level = batteryIntent?.getIntExtra(BatteryManager.EXTRA_LEVEL, -1) ?: -1
        val scale = batteryIntent?.getIntExtra(BatteryManager.EXTRA_SCALE, -1) ?: -1
        return if (level == -1 || scale == -1) {
            -1
        } else {
            (level.toFloat() / scale.toFloat() * 100.0f).toInt()
        }
    }

    private fun sendMessage(text: String) {
        if (text.isBlank()) return
        try {
            if (!::bridgefy.isInitialized || !bridgefy.isStarted) {
                val reason = if (!::bridgefy.isInitialized) "NOT INITIALIZED" else "NOT STARTED"
                val log = "❌ Bridgefy service is dead. Reason: $reason"
                Log.e("Disastra_OnePlus", log)
                runOnUiThread { messageLog.add(0, log) }
                return
            }

            val messageBytes = text.toByteArray(Charsets.UTF_8)
            val currentUserIdResult = bridgefy.currentUserId()

            if (currentUserIdResult.isSuccess) {
                val currentUserId = currentUserIdResult.getOrThrow()
                Log.d("Disastra_OnePlus", "Service is running. Calling bridgefy.send()...")
                val messageId = bridgefy.send(
                    messageBytes,
                    TransmissionMode.Broadcast(currentUserId)
                )
                // Note: We log "SENT" here, but "✅ Confirmed Send" will come from the onSend delegate
                val log = "SENT (ID: $messageId)"
                Log.d("Disastra", "SENT (ID: $messageId): $text")
                runOnUiThread { messageLog.add(0, log) }
            } else {
                val error = currentUserIdResult.exceptionOrNull()?.message ?: "Unknown error"
                Log.e("Disastra", "Failed to get current user ID: $error")
                runOnUiThread { messageLog.add(0, "❌ Send Failed: Can't get User ID") }
            }
        } catch (e: Exception) {
            Log.e("Disastra", "Failed to send message: ${e.message}")
            runOnUiThread { messageLog.add(0, "❌ Send Failed: ${e.message}") }
        }
    }

    private fun askForPermissions(launcher: androidx.activity.result.ActivityResultLauncher<Array<String>>) {
        val permissionsToRequest = mutableListOf(
            Manifest.permission.ACCESS_FINE_LOCATION,
            Manifest.permission.ACCESS_COARSE_LOCATION
        )
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.S) {
            permissionsToRequest.add(Manifest.permission.BLUETOOTH_SCAN)
            permissionsToRequest.add(Manifest.permission.BLUETOOTH_CONNECT)
            permissionsToRequest.add(Manifest.permission.BLUETOOTH_ADVERTISE)
        }
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
            permissionsToRequest.add(Manifest.permission.POST_NOTIFICATIONS)
        }
        launcher.launch(permissionsToRequest.toTypedArray())
    }

    override fun onDestroy() {
        super.onDestroy()
        if (::bridgefy.isInitialized && bridgefy.isStarted) {
            try {
                bridgefy.stop()
            } catch (e: Exception) {
                Log.e("Disastra", "Error stopping Bridgefy: ${e.message}")
            }
        }
    }
}
