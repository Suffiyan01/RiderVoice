package com.ridervoice.app

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontFamily
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.ridervoice.app.model.*
import com.ridervoice.app.ui.*
import com.ridervoice.app.ui.theme.*

class MainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContent {
            RiderVoiceTheme {
                RiderVoiceApp()
            }
        }
    }
}

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun RiderVoiceApp() {
    var currentTab by remember { mutableStateOf("cockpit") }
    var showSettings by remember { mutableStateOf(false) }
    var showSos by remember { mutableStateOf(false) }
    var speedUnit by remember { mutableStateOf("KM/H") }

    val initialChannels = remember {
        listOf(
            IntercomChannel("ch1", "Ghost Riders Alpha", "462.5625 MHz • Ch 01", "Primary squad ride channel", 4, true),
            IntercomChannel("ch2", "Mountain Pass Sweepers", "462.6125 MHz • Ch 02", "Lead & tail rider coordination", 2, false),
            IntercomChannel("ch3", "Open Biker Mesh", "467.5875 MHz • Ch 04", "Public beacon within 1.5km", 7, false),
            IntercomChannel("ch4", "EMERGENCY SOS", "462.6750 MHz • Ch 09", "Crash distress channel", 12, false, isEmergency = true)
        )
    }

    var activeChannel by remember { mutableStateOf(initialChannels[0]) }

    val initialRiders = remember {
        listOf(
            Rider("r1", "Alex Mercer", "LEAD-1", "Yamaha MT-09 SP", true, false, 88, 140, 12, "Road surface clear"),
            Rider("r2", "Sarah Chen", "WING-2", "Ducati Panigale V2", true, false, 94, 45, 345, "Maintaining spacing"),
            Rider("r3", "Marcus Vance", "TAIL-SWEEP", "BMW R1250 GS", true, false, 62, 310, 178, "Tail clear")
        )
    }
    var riders by remember { mutableStateOf(initialRiders) }

    val initialHazards = remember {
        mutableStateListOf(
            HazardAlert("h1", HazardType.POTHOLE, "Severe pothole in apex right lane", "Alex", 620, 8, "4m ago", 3),
            HazardAlert("h2", HazardType.POLICE, "Highway patrol radar trap on bridge", "Marcus", 1850, 4, "11m ago", 7)
        )
    }

    var telemetry by remember { mutableStateOf(RideTelemetry()) }

    var helmetConfig by remember {
        mutableStateOf(HelmetConfig())
    }

    val initialCommands = remember {
        mutableStateListOf(
            VoiceCommandRecord("c1", "10:14 AM", "Check speed", "speed", "Current speed is 78 km/h. Speed limit is 80."),
            VoiceCommandRecord("c2", "10:09 AM", "Where is the nearest gas?", "nav", "Nearest Shell station is 3.2km ahead on Route 9.")
        )
    }

    Scaffold(
        topBar = {
            TopAppBar(
                title = {
                    Row(verticalAlignment = Alignment.CenterVertically) {
                        Box(
                            modifier = Modifier
                                .size(32.dp)
                                .clip(RoundedCornerShape(8.dp))
                                .background(NeonCyan),
                            contentAlignment = Alignment.Center
                        ) {
                            Icon(Icons.Default.Radio, contentDescription = "Logo", tint = Color.Black, modifier = Modifier.size(20.dp))
                        }
                        Spacer(modifier = Modifier.width(10.dp))
                        Text("RIDER", fontWeight = FontWeight.Black, fontSize = 18.sp, color = Color.White)
                        Text("VOICE", fontWeight = FontWeight.Black, fontSize = 18.sp, color = NeonCyan)
                    }
                },
                actions = {
                    // Headset Battery
                    Row(
                        modifier = Modifier
                            .clip(RoundedCornerShape(8.dp))
                            .background(DarkSurfaceVariant)
                            .clickable { showSettings = true }
                            .padding(horizontal = 8.dp, vertical = 6.dp),
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Icon(Icons.Default.Bluetooth, contentDescription = "BT", tint = NeonCyan, modifier = Modifier.size(16.dp))
                        Spacer(modifier = Modifier.width(4.dp))
                        Text("${helmetConfig.batteryPercentage}%", fontSize = 11.sp, fontWeight = FontWeight.Bold, color = NeonGreen, fontFamily = FontFamily.Monospace)
                    }

                    Spacer(modifier = Modifier.width(8.dp))

                    // SOS Emergency Button
                    Button(
                        onClick = { showSos = true },
                        colors = ButtonDefaults.buttonColors(containerColor = NeonRose),
                        shape = RoundedCornerShape(8.dp),
                        contentPadding = PaddingValues(horizontal = 10.dp, vertical = 4.dp),
                        modifier = Modifier.padding(end = 8.dp)
                    ) {
                        Text("SOS", fontWeight = FontWeight.Black, fontSize = 12.sp, color = Color.White)
                    }
                },
                colors = TopAppBarDefaults.topAppBarColors(containerColor = DarkBackground)
            )
        },
        bottomBar = {
            NavigationBar(containerColor = DarkSurface) {
                listOf(
                    Triple("cockpit", "Cockpit", Icons.Default.Speed),
                    Triple("intercom", "Intercom", Icons.Default.Radio),
                    Triple("assistant", "Voice AI", Icons.Default.Mic),
                    Triple("radar", "Radar", Icons.Default.Explore)
                ).forEach { (id, label, icon) ->
                    val isSelected = currentTab == id
                    NavigationBarItem(
                        selected = isSelected,
                        onClick = { currentTab = id },
                        icon = { Icon(icon, contentDescription = label) },
                        label = { Text(label, fontWeight = if (isSelected) FontWeight.Bold else FontWeight.Normal) },
                        colors = NavigationBarItemDefaults.colors(
                            selectedIconColor = Color.Black,
                            selectedTextColor = NeonCyan,
                            indicatorColor = NeonCyan,
                            unselectedIconColor = Color.Gray,
                            unselectedTextColor = Color.Gray
                        )
                    )
                }
            }
        },
        containerColor = DarkBackground
    ) { innerPadding ->
        Box(modifier = Modifier.padding(innerPadding)) {
            when (currentTab) {
                "cockpit" -> CockpitScreen(
                    telemetry = telemetry,
                    onUpdateTelemetry = { telemetry = it },
                    nearestHazard = initialHazards.firstOrNull(),
                    onNavigateToIntercom = { currentTab = "intercom" },
                    onNavigateToAssistant = { currentTab = "assistant" },
                    unit = speedUnit,
                    onToggleUnit = { speedUnit = if (speedUnit == "KM/H") "MPH" else "KM/H" }
                )
                "intercom" -> IntercomScreen(
                    channels = initialChannels,
                    activeChannel = activeChannel,
                    onSelectChannel = { activeChannel = it },
                    riders = riders,
                    onSimulateRiderVoice = { rider ->
                        riders = riders.map { if (it.id == rider.id) it.copy(isTalking = !it.isTalking) else it }
                    },
                    helmetConfig = helmetConfig,
                    onToggleVox = {
                        helmetConfig = helmetConfig.copy(isVoxActive = !helmetConfig.isVoxActive)
                    }
                )
                "assistant" -> VoiceAssistantScreen(
                    commands = initialCommands,
                    onSendCommand = { query ->
                        val resp = when {
                            query.contains("speed", true) -> "Current speed is ${telemetry.currentSpeed} $speedUnit. Speed limit is 80."
                            query.contains("gas", true) || query.contains("fuel", true) -> "Nearest Shell station is 3.2km ahead."
                            query.contains("weather", true) -> "23°C, Partly Cloudy, wind 14 km/h West."
                            query.contains("hazard", true) || query.contains("pothole", true) -> "Hazard logged and broadcasted to squad radar."
                            else -> "Received command: \"$query\"."
                        }
                        initialCommands.add(
                            0,
                            VoiceCommandRecord("c-${System.currentTimeMillis()}", "Just now", query, "voice", resp)
                        )
                    }
                )
                "radar" -> SquadRadarScreen(
                    riders = riders,
                    hazards = initialHazards,
                    onAddHazard = { initialHazards.add(0, it) }
                )
            }
        }
    }

    if (showSettings) {
        HelmetSettingsDialog(
            config = helmetConfig,
            onUpdateConfig = { helmetConfig = it },
            onDismiss = { showSettings = false }
        )
    }

    if (showSos) {
        SosDialog(
            onDismiss = { showSos = false },
            onConfirmDispatch = {
                val sosChannel = initialChannels.find { it.isEmergency } ?: initialChannels[0]
                activeChannel = sosChannel
                showSos = false
            }
        )
    }
}
