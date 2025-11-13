# Disastra: Offline SOS Mesh Network App

**Disastra** is an Android emergency-response application designed for disaster scenarios where traditional communication infrastructure (internet/cellular networks) is unavailable. It forms a **peer-to-peer (P2P) mesh network** using the **Bridgefy SDK**, allowing SOS alerts to *hop* from device to device — creating a resilient, decentralized communication channel for victims and responders.

---

## App Screenshot

![WhatsApp Image 2025-11-13 at 11 19 03_ce3a68a0](https://github.com/user-attachments/assets/053d7eec-5d80-4688-b1d1-00dccdfd8a38)

---

## Core Features

### Offline-First Mesh Networking  
- Works **without internet or cellular network**  
- Uses **Bridgefy SDK** for Bluetooth-based mesh connectivity  

### One-Touch SOS Broadcast  
- Large **press-and-hold (3 sec)** SOS activation button  
- Broadcasts SOS packets to all nearby peers  

### Dynamic SOS Payload  
Every SOS JSON message includes:
- **Emergency Type:** `"Trapped"`, `"Medical"`, `"Fire"`, `"Unsafe"`  
- **GPS Coordinates**  
- **Battery Level**  
- **Timestamp**

### Live SOS Updates  
Send follow-up context:
- Number of affected people (`"2-3"`, `"4-6"`)  
- Medical supply needs (`"Bandages"`, `"Water"`, etc.)

### Mark as Safe  
Broadcast a "safe" message linked to the original SOS.

### Real-Time Event Log  
Shows:
- Device connections/disconnections  
- Messages sent/received  
- Mesh activity (useful for demos/testing)

### Modern UI  
- 100% **Jetpack Compose**  
- Clean, polished interface  
- Light & dark themes  

---

## Technical Architecture

### App Structure  
- Single-activity architecture  
- Jetpack Compose for UI  
- Hilt for dependency injection  
- Kotlinx.Serialization for message encoding  

### Bridgefy Initialization  
On launch:
1. Requests required permissions  
2. Initializes Bridgefy with API key  
3. Starts automatic peer discovery  

### Broadcasting SOS  
1. Create `SosMessage` data class  
2. Serialize to JSON  
3. Broadcast using `TransmissionMode.BROADCAST`, enabling message hopping across the mesh  

### Receiving Messages  
- Listeners deserialize incoming message JSON  
- Display info in the event log  

---

## Technology Stack

### Mobile (Primary App)
- Kotlin  
- Jetpack Compose  
- Bridgefy SDK  
- Hilt  
- Kotlinx.Serialization  
- Google Play Services (Location)

### Legacy Version (`/DisAstra/`)
- Node.js + Express.js  
- React (Vite) & React Native  

---
## Repository Structure

```bash
/
├── app/ # Main Android application (Kotlin + Compose)
├── libs/ # Local Bridgefy .aar file
├── DisAstra/ # Legacy version
│ ├── backend/
│ └── frontend/
└── README.md
```

## Build & Run (Evaluator Friendly)

### Prerequisites  
- Latest **Android Studio**  
- A **physical Android device**  
- Internet connection (only for first launch)

---

## Setup

### 1. Clone the Repository  
```bash
git clone https://github.com/ChhaviKukreja/DisAstra.git
```

### 2. Open the project in Android Studio (select the root folder).

The Bridgefy .aar library is already present in:

```bash
app/libs/
```

### 3. 🔑 Add the API Key (Required)

Create the file:
```bash
app/secrets.properties
```

Add the following line:
```bash
BRIDGEFY_API_KEY="cecda347-0311-44b0-bda7-3631050c3805"
```

This file is ignored by .gitignore for security.

### 3. Run the App

1. Click Sync Project with Gradle Files
2. Connect your physical Android device
3. Press Run ▶ in Android Studio

## Important

- On first launch, the device must be connected to the internet to validate the Bridgefy API key.
- After successful validation, the app functions 100% offline.

## Summary

Disastra provides:

- Offline mesh communication
- Reliable, decentralized SOS broadcasting
- Real-time emergency updates in disaster conditions
- A modern Android application built for safety, resilience, and disaster response.
