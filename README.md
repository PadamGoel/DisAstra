Disastra: Offline SOS Mesh Network App

Disastra is an Android emergency response application designed to operate in disaster scenarios where conventional communication infrastructure (internet, cellular networks) has failed. It creates a peer-to-peer (P2P) mesh network, allowing users to broadcast critical SOS beacons to all nearby devices.

The signal "hops" from device to device using the Bridgefy SDK, extending the range of an alert far beyond a single user's immediate vicinity and creating a resilient, decentralized communication channel for first responders and victims.

App Screenshot

![WhatsApp Image 2025-11-13 at 11 19 03_b4e7a7a2](https://github.com/user-attachments/assets/afe3a102-7dc4-4044-a571-d193d63fd657)


 Core Features

Offline-First Mesh Networking: Built on the Bridgefy SDK, the app requires no internet or cellular connection to function.

One-Touch SOS Broadcast: A large, press-and-hold button (3-second activation) broadcasts an SOS signal to all peers in the mesh.

Dynamic SOS Payload: The SOS message is a lightweight JSON object containing:

Emergency Type: (e.g., "Trapped", "Medical", "Fire", "Unsafe")

GPS Coordinates: Latitude & Longitude.

Phone Battery Level: So responders can prioritize.

Timestamp: To identify the original alert.

Live SOS Updates: After an initial SOS, users can send follow-up updates with critical context, such as:

Number of people ("2-3", "4-6", etc.)

Medical supplies needed ("Bandages", "Water", etc.)

"Mark as Safe" Beacon: Users can broadcast a "safe" message, which is linked to their original SOS, letting others know they no longer need help.

Real-time Event Log: A toggleable on-screen log shows all mesh activity (connections, disconnections, sent/received messages) for testing and demonstration.

Modern UI: A clean, responsive UI built entirely with Jetpack Compose, including light and dark themes.

🛠 How it Works: Technical Architecture

The app is built as a single-activity application in Kotlin, using Jetpack Compose for all UI elements.

Initialization: On launch, the app requests all necessary permissions (Location, Nearby Devices) and initializes the Bridgefy SDK with a unique API key.

Peer Discovery: Bridgefy runs as a service, automatically discovering and connecting to other nearby devices running the app, forming a mesh network.

Data Serialization: When a user sends an SOS, the app creates a SosMessage data class (using kotlinx.serialization) and converts it to a JSON string.

Broadcasting: This JSON payload is broadcast to all connected peers using TransmissionMode.Broadcast. This mode ensures that every device that receives the message automatically forwards it to its peers, creating the "hopping" effect.

Receiving Data: The app listens for incoming messages, de-serializes the JSON payload, and displays the information in the event log.

 Technology Stack

Mobile (Main Project):

Kotlin

Jetpack Compose (for all UI)

Bridgefy SDK (for P2P Mesh Networking)

Hilt (for Dependency Injection)

Kotlinx.Serialization (for data payloads)

Google Play Services (for Location)

Previous Version (in DisAstra/ folder):

Backend: Node.js, Express.js

Frontend: React (Vite) & React Native

 Repository Structure

This repository contains two main projects:

/ (Root): The primary, working Android Application (Kotlin/Compose/Bridgefy). This is the main project for evaluation.

/DisAstra/: This folder contains a previous iteration of the project, including a Node.js backend (/backend) and a React/React Native frontend (/frontend). This is kept for historical purposes.

 Build & Run Instructions (For Evaluator)

To successfully build and run this project, please follow these steps.

1. Prerequisites

Android Studio (latest version)

A physical Android device (Mesh networking does not work on the Android Emulator).

An active internet connection for the first launch only.

2. Setup

Clone the repository:

git clone [https://github.com/ChhaviKukreja/DisAstra.git](https://github.com/ChhaviKukreja/DisAstra.git)


Open the project in Android Studio (select the root mvp or Disastra folder).

The project is configured to use a local Bridgefy library (.aar file) located in app/libs/. Gradle should detect this automatically.

3. Add The API Key (CRITICAL)

The Bridgefy API Key is kept in a secret file (which is in .gitignore) to protect it. You must create this file manually.

In the app/ directory, create a new file named secrets.properties.

Copy and paste the following line into that file:

BRIDGEFY_API_KEY="cecda347-0311-44b0-bda7-3631050c3805"


4. Run the App

Click "Sync Project with Gradle Files" in Android Studio.

Connect your physical Android device.

Run the app.

Important: For the first launch, your device must be connected to the internet. This allows the Bridgefy SDK to validate the API key one time. After that, the app will work 100% offline.
