package com.ridervoice.app.ui

import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
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
import com.ridervoice.app.model.HazardAlert
import com.ridervoice.app.model.HazardType
import com.ridervoice.app.model.Rider
import com.ridervoice.app.ui.theme.*

@Composable
fun SquadRadarScreen(
    riders: List<Rider>,
    hazards: List<HazardAlert>,
    onAddHazard: (HazardAlert) -> Unit
) {
    var showDialog by remember { mutableStateOf(false) }
    var selectedType by remember { mutableStateOf(HazardType.POTHOLE) }
    var hazardTitle by remember { mutableStateOf("") }
    val scrollState = rememberScrollState()

    Column(
        modifier = Modifier
            .fillMaxSize()
            .verticalScroll(scrollState)
            .padding(16.dp),
        verticalArrangement = Arrangement.spacedBy(16.dp)
    ) {
        // Radar Header
        Card(
            colors = CardDefaults.cardColors(containerColor = DarkSurface),
            shape = RoundedCornerShape(16.dp),
            modifier = Modifier.fillMaxWidth()
        ) {
            Row(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(14.dp),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Column {
                    Text(
                        "SQUAD RADAR & CROWD HAZARDS",
                        fontSize = 10.sp,
                        fontWeight = FontWeight.Bold,
                        color = Color.Gray,
                        fontFamily = FontFamily.Monospace
                    )
                    Text(
                        "360° Tactical Proximity",
                        fontSize = 16.sp,
                        fontWeight = FontWeight.Bold,
                        color = Color.White
                    )
                }

                Button(
                    onClick = { showDialog = true },
                    colors = ButtonDefaults.buttonColors(containerColor = NeonAmber),
                    shape = RoundedCornerShape(10.dp)
                ) {
                    Icon(Icons.Default.AddAlert, contentDescription = "Add", tint = Color.Black)
                    Spacer(modifier = Modifier.width(4.dp))
                    Text("LOG HAZARD", fontSize = 11.sp, fontWeight = FontWeight.Bold, color = Color.Black)
                }
            }
        }

        // Radar Circular Visualizer
        Card(
            colors = CardDefaults.cardColors(containerColor = DarkSurface),
            shape = RoundedCornerShape(24.dp),
            modifier = Modifier.fillMaxWidth()
        ) {
            Column(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(20.dp),
                horizontalAlignment = Alignment.CenterHorizontally
            ) {
                Box(
                    modifier = Modifier
                        .size(240.dp)
                        .clip(CircleShape)
                        .background(DarkBackground)
                        .border(1.dp, NeonCyanDark, CircleShape),
                    contentAlignment = Alignment.Center
                ) {
                    // Concentric rings
                    Box(modifier = Modifier.size(180.dp).border(1.dp, Color(0xFF1E293B), CircleShape))
                    Box(modifier = Modifier.size(120.dp).border(1.dp, Color(0xFF1E293B), CircleShape))
                    Box(modifier = Modifier.size(60.dp).border(1.dp, Color(0xFF1E293B), CircleShape))

                    // Center Bike (User)
                    Box(
                        modifier = Modifier
                            .size(14.dp)
                            .clip(CircleShape)
                            .background(NeonCyan)
                            .border(2.dp, Color.White, CircleShape)
                    )

                    // Simulated Squad Rider Blips
                    Box(
                        modifier = Modifier
                            .offset(x = (-30).dp, y = (-45).dp)
                            .size(10.dp)
                            .clip(CircleShape)
                            .background(NeonGreen)
                    )
                    Box(
                        modifier = Modifier
                            .offset(x = 55.dp, y = 20.dp)
                            .size(10.dp)
                            .clip(CircleShape)
                            .background(NeonGreen)
                    )

                    // Hazard Blip
                    Box(
                        modifier = Modifier
                            .offset(x = 10.dp, y = (-70).dp)
                            .size(12.dp)
                            .clip(CircleShape)
                            .background(NeonAmber),
                        contentAlignment = Alignment.Center
                    ) {
                        Text("!", fontSize = 8.sp, fontWeight = FontWeight.Bold, color = Color.Black)
                    }

                    // Cardinal labels
                    Text("N", modifier = Modifier.align(Alignment.TopCenter).padding(top = 4.dp), color = Color.Gray, fontSize = 10.sp, fontFamily = FontFamily.Monospace)
                    Text("S", modifier = Modifier.align(Alignment.BottomCenter).padding(bottom = 4.dp), color = Color.Gray, fontSize = 10.sp, fontFamily = FontFamily.Monospace)
                    Text("W", modifier = Modifier.align(Alignment.CenterStart).padding(start = 4.dp), color = Color.Gray, fontSize = 10.sp, fontFamily = FontFamily.Monospace)
                    Text("E", modifier = Modifier.align(Alignment.CenterEnd).padding(end = 4.dp), color = Color.Gray, fontSize = 10.sp, fontFamily = FontFamily.Monospace)
                }

                Spacer(modifier = Modifier.height(12.dp))

                Row(
                    horizontalArrangement = Arrangement.spacedBy(16.dp),
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Row(verticalAlignment = Alignment.CenterVertically) {
                        Box(modifier = Modifier.size(8.dp).clip(CircleShape).background(NeonGreen))
                        Spacer(modifier = Modifier.width(4.dp))
                        Text("Squad Rider", fontSize = 10.sp, color = Color.LightGray, fontFamily = FontFamily.Monospace)
                    }
                    Row(verticalAlignment = Alignment.CenterVertically) {
                        Box(modifier = Modifier.size(8.dp).clip(CircleShape).background(NeonAmber))
                        Spacer(modifier = Modifier.width(4.dp))
                        Text("Road Hazard", fontSize = 10.sp, color = Color.LightGray, fontFamily = FontFamily.Monospace)
                    }
                    Row(verticalAlignment = Alignment.CenterVertically) {
                        Box(modifier = Modifier.size(8.dp).clip(CircleShape).background(NeonCyan))
                        Spacer(modifier = Modifier.width(4.dp))
                        Text("You", fontSize = 10.sp, color = Color.LightGray, fontFamily = FontFamily.Monospace)
                    }
                }
            }
        }

        // Active Hazards Feed
        Card(
            colors = CardDefaults.cardColors(containerColor = DarkSurface),
            shape = RoundedCornerShape(16.dp),
            modifier = Modifier.fillMaxWidth()
        ) {
            Column(modifier = Modifier.padding(14.dp)) {
                Text(
                    "REPORTED ROAD HAZARDS (${hazards.size})",
                    fontSize = 10.sp,
                    fontWeight = FontWeight.Bold,
                    color = Color.Gray,
                    fontFamily = FontFamily.Monospace
                )

                Spacer(modifier = Modifier.height(8.dp))

                hazards.forEach { haz ->
                    Surface(
                        color = DarkSurfaceVariant,
                        shape = RoundedCornerShape(12.dp),
                        modifier = Modifier
                            .fillMaxWidth()
                            .padding(vertical = 4.dp)
                    ) {
                        Row(
                            modifier = Modifier
                                .fillMaxWidth()
                                .padding(12.dp),
                            horizontalArrangement = Arrangement.SpaceBetween,
                            verticalAlignment = Alignment.CenterVertically
                        ) {
                            Row(verticalAlignment = Alignment.CenterVertically) {
                                Box(
                                    modifier = Modifier
                                        .size(36.dp)
                                        .clip(RoundedCornerShape(8.dp))
                                        .background(Color(0xFF451A03)),
                                    contentAlignment = Alignment.Center
                                ) {
                                    Icon(
                                        Icons.Default.Warning,
                                        contentDescription = "Hazard",
                                        tint = NeonAmber,
                                        modifier = Modifier.size(20.dp)
                                    )
                                }
                                Spacer(modifier = Modifier.width(10.dp))
                                Column {
                                    Text(
                                        haz.title,
                                        fontSize = 13.sp,
                                        fontWeight = FontWeight.Bold,
                                        color = Color.White
                                    )
                                    Text(
                                        "Reported by ${haz.reportedBy} • ${haz.timestamp}",
                                        fontSize = 11.sp,
                                        color = Color.Gray,
                                        fontFamily = FontFamily.Monospace
                                    )
                                }
                            }

                            Text(
                                "${haz.distanceMeters}m",
                                fontSize = 14.sp,
                                fontWeight = FontWeight.Bold,
                                color = NeonAmber,
                                fontFamily = FontFamily.Monospace
                            )
                        }
                    }
                }
            }
        }
    }

    // Add Hazard Modal Dialog
    if (showDialog) {
        AlertDialog(
            onDismissRequest = { showDialog = false },
            title = {
                Text("Broadcast Road Hazard", fontWeight = FontWeight.Bold, color = Color.White)
            },
            text = {
                Column(verticalArrangement = Arrangement.spacedBy(10.dp)) {
                    Text("Select Hazard Category:", fontSize = 12.sp, color = Color.LightGray)
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.spacedBy(6.dp)
                    ) {
                        listOf(HazardType.POTHOLE, HazardType.POLICE, HazardType.DEBRIS).forEach { type ->
                            Surface(
                                color = if (selectedType == type) NeonAmber else DarkSurfaceVariant,
                                shape = RoundedCornerShape(8.dp),
                                modifier = Modifier
                                    .weight(1f)
                                    .clickable { selectedType = type }
                            ) {
                                Text(
                                    type.label,
                                    modifier = Modifier.padding(vertical = 8.dp),
                                    textAlign = androidx.compose.ui.text.style.TextAlign.Center,
                                    fontSize = 11.sp,
                                    fontWeight = FontWeight.Bold,
                                    color = if (selectedType == type) Color.Black else Color.White
                                )
                            }
                        }
                    }

                    OutlinedTextField(
                        value = hazardTitle,
                        onValueChange = { hazardTitle = it },
                        placeholder = { Text("Details (e.g., deep pothole in right lane)") },
                        modifier = Modifier.fillMaxWidth()
                    )
                }
            },
            confirmButton = {
                Button(
                    onClick = {
                        val newHazard = HazardAlert(
                            id = "haz-${System.currentTimeMillis()}",
                            type = selectedType,
                            title = hazardTitle.ifBlank { selectedType.label },
                            reportedBy = "You (Squad Lead)",
                            distanceMeters = 50,
                            bearingDeg = 0,
                            timestamp = "Just now"
                        )
                        onAddHazard(newHazard)
                        showDialog = false
                        hazardTitle = ""
                    },
                    colors = ButtonDefaults.buttonColors(containerColor = NeonAmber)
                ) {
                    Text("BROADCAST", fontWeight = FontWeight.Bold, color = Color.Black)
                }
            },
            dismissButton = {
                TextButton(onClick = { showDialog = false }) {
                    Text("CANCEL", color = Color.LightGray)
                }
            },
            containerColor = DarkSurface
        )
    }
}
