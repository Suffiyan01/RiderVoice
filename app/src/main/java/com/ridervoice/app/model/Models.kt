package com.ridervoice.app.model

data class Rider(
    val id: String,
    val name: String,
    val callsign: String,
    val bikeModel: String,
    val isOnline: Boolean,
    val isTalking: Boolean,
    val batteryLevel: Int,
    val distanceMeters: Int,
    val bearingDeg: Int,
    val lastSpoke: String? = null
)

data class IntercomChannel(
    val id: String,
    val name: String,
    val frequency: String,
    val description: String,
    val activeMembers: Int,
    val isEncrypted: Boolean,
    val isEmergency: Boolean = false
)

enum class HazardType(val label: String) {
    POTHOLE("Pothole"),
    POLICE("Speed Trap"),
    DEBRIS("Debris"),
    ACCIDENT("Accident"),
    SLICK_ROAD("Slick Road"),
    OIL_SPILL("Oil Spill")
}

data class HazardAlert(
    val id: String,
    val type: HazardType,
    val title: String,
    val reportedBy: String,
    val distanceMeters: Int,
    val bearingDeg: Int,
    val timestamp: String,
    val confirmations: Int = 1
)

data class VoiceCommandRecord(
    val id: String,
    val timestamp: String,
    val rawQuery: String,
    val detectedIntent: String,
    val spokenResponse: String
)

data class RideTelemetry(
    val currentSpeed: Int = 78,
    val topSpeed: Int = 114,
    val avgSpeed: Double = 68.4,
    val distanceKm: Double = 24.6,
    val elevationMeters: Int = 284,
    val headingDeg: Int = 342,
    val rideDurationSec: Int = 1320,
    val isRiding: Boolean = true,
    val leanAngleDeg: Int = 14
)

data class HelmetConfig(
    val voxSensitivity: Int = 6,
    val isVoxActive: Boolean = true,
    val noiseSuppression: String = "Adaptive",
    val intercomVolume: Float = 0.85f,
    val navVolume: Float = 0.90f,
    val musicVolume: Float = 0.60f,
    val autoDuckMusic: Boolean = true,
    val connectedDevice: String = "Cardo Packtalk Edge",
    val batteryPercentage: Int = 86,
    val isConnected: Boolean = true
)
