package com.ridervoice.app.ui

import androidx.compose.animation.core.*
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
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
import com.ridervoice.app.model.HelmetConfig
import com.ridervoice.app.model.IntercomChannel
import com.ridervoice.app.model.Rider
import com.ridervoice.app.ui.theme.*

@Composable
fun IntercomScreen(
    channels: List<IntercomChannel>,
    activeChannel: IntercomChannel,
    onSelectChannel: (IntercomChannel) -> Unit,
    riders: List<Rider>,
    onSimulateRiderVoice: (Rider) -> Unit,
    helmetConfig: HelmetConfig,
    onToggleVox: () -> Unit
) {
    var isPttActive by remember { mutableStateOf(false) }

    Column(
        modifier = Modifier
            .fillMaxSize()
            .padding(16.dp),
        verticalArrangement = Arrangement.spacedBy(16.dp)
    ) {
        // Channel Selector Row
        Card(
            colors = CardDefaults.cardColors(containerColor = DarkSurface),
            shape = RoundedCornerShape(16.dp),
            modifier = Modifier.fillMaxWidth()
        ) {
            Column(modifier = Modifier.padding(14.dp)) {
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Column {
                        Text(
                            "ACTIVE MESH INTERCOM",
                            fontSize = 10.sp,
                            fontWeight = FontWeight.Bold,
                            color = Color.Gray,
                            fontFamily = FontFamily.Monospace
                        )
                        Text(
                            activeChannel.name,
                            fontSize = 16.sp,
                            fontWeight = FontWeight.Bold,
                            color = Color.White
                        )
                    }

                    // VOX Mode Toggle
                    Surface(
                        color = if (helmetConfig.isVoxActive) NeonCyan else DarkSurfaceVariant,
                        shape = RoundedCornerShape(10.dp),
                        modifier = Modifier.clickable { onToggleVox() }
                    ) {
                        Text(
                            if (helmetConfig.isVoxActive) "VOX ON" else "PTT ONLY",
                            modifier = Modifier.padding(horizontal = 10.dp, vertical = 6.dp),
                            color = if (helmetConfig.isVoxActive) Color.Black else Color.LightGray,
                            fontSize = 11.sp,
                            fontWeight = FontWeight.Bold,
                            fontFamily = FontFamily.Monospace
                        )
                    }
                }

                Spacer(modifier = Modifier.height(10.dp))

                // Channels horizontal pills
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.spacedBy(8.dp)
                ) {
                    channels.forEach { ch ->
                        val isSelected = ch.id == activeChannel.id
                        Surface(
                            color = if (isSelected) {
                                if (ch.isEmergency) NeonRose else NeonCyan
                            } else DarkSurfaceVariant,
                            shape = RoundedCornerShape(10.dp),
                            modifier = Modifier
                                .weight(1f)
                                .clickable { onSelectChannel(ch) }
                        ) {
                            Column(
                                modifier = Modifier.padding(vertical = 8.dp, horizontal = 4.dp),
                                horizontalAlignment = Alignment.CenterHorizontally
                            ) {
                                Text(
                                    ch.frequency.split("•").firstOrNull()?.trim() ?: "CH",
                                    fontSize = 9.sp,
                                    fontWeight = FontWeight.Bold,
                                    color = if (isSelected) Color.Black else Color.Gray,
                                    fontFamily = FontFamily.Monospace
                                )
                                Text(
                                    ch.name.take(9),
                                    fontSize = 11.sp,
                                    fontWeight = FontWeight.Bold,
                                    color = if (isSelected) Color.Black else Color.White
                                )
                            }
                        }
                    }
                }
            }
        }

        // Giant Glove-Friendly PTT Button Cluster
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
                Text(
                    if (isPttActive) "TRANSMITTING TO ALL RIDERS" else "HOLD OR TAP TO TALK",
                    fontSize = 11.sp,
                    fontWeight = FontWeight.Bold,
                    color = if (isPttActive) NeonRose else NeonCyan,
                    fontFamily = FontFamily.Monospace
                )

                Spacer(modifier = Modifier.height(14.dp))

                Box(
                    modifier = Modifier
                        .size(170.dp)
                        .clip(CircleShape)
                        .background(if (isPttActive) NeonRose else DarkSurfaceVariant)
                        .border(
                            width = 6.dp,
                            color = if (isPttActive) Color.White else NeonCyan,
                            shape = CircleShape
                        )
                        .clickable { isPttActive = !isPttActive },
                    contentAlignment = Alignment.Center
                ) {
                    Column(horizontalAlignment = Alignment.CenterHorizontally) {
                        Icon(
                            if (isPttActive) Icons.Default.Mic else Icons.Default.Radio,
                            contentDescription = "PTT Mic",
                            tint = if (isPttActive) Color.White else NeonCyan,
                            modifier = Modifier.size(52.dp)
                        )
                        Spacer(modifier = Modifier.height(6.dp))
                        Text(
                            if (isPttActive) "LIVE" else "PUSH TO TALK",
                            fontSize = 14.sp,
                            fontWeight = FontWeight.ExtraBold,
                            color = if (isPttActive) Color.White else Color.White,
                            fontFamily = FontFamily.Monospace
                        )
                    }
                }

                Spacer(modifier = Modifier.height(12.dp))

                Text(
                    "GLOVE COMPLIANT • 12ms MESH LATENCY",
                    fontSize = 10.sp,
                    color = Color.Gray,
                    fontFamily = FontFamily.Monospace
                )
            }
        }

        // Squad Members List
        Card(
            colors = CardDefaults.cardColors(containerColor = DarkSurface),
            shape = RoundedCornerShape(16.dp),
            modifier = Modifier.fillMaxWidth()
        ) {
            Column(modifier = Modifier.padding(14.dp)) {
                Text(
                    "SQUAD RIDERS IN RANGE (${riders.size})",
                    fontSize = 11.sp,
                    fontWeight = FontWeight.Bold,
                    color = Color.Gray,
                    fontFamily = FontFamily.Monospace
                )
                Spacer(modifier = Modifier.height(8.dp))

                riders.forEach { rider ->
                    Row(
                        modifier = Modifier
                            .fillMaxWidth()
                            .padding(vertical = 6.dp),
                        horizontalArrangement = Arrangement.SpaceBetween,
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Row(verticalAlignment = Alignment.CenterVertically) {
                            Box(
                                modifier = Modifier
                                    .size(36.dp)
                                    .clip(CircleShape)
                                    .background(if (rider.isTalking) NeonCyan else DarkSurfaceVariant),
                                contentAlignment = Alignment.Center
                            ) {
                                Text(
                                    rider.name.take(1),
                                    fontWeight = FontWeight.Bold,
                                    color = if (rider.isTalking) Color.Black else Color.White
                                )
                            }
                            Spacer(modifier = Modifier.width(10.dp))
                            Column {
                                Text(
                                    rider.name,
                                    fontSize = 13.sp,
                                    fontWeight = FontWeight.Bold,
                                    color = Color.White
                                )
                                Text(
                                    "${rider.callsign} • ${rider.distanceMeters}m away",
                                    fontSize = 11.sp,
                                    color = Color.Gray,
                                    fontFamily = FontFamily.Monospace
                                )
                            }
                        }

                        Button(
                            onClick = { onSimulateRiderVoice(rider) },
                            colors = ButtonDefaults.buttonColors(containerColor = DarkSurfaceVariant),
                            shape = RoundedCornerShape(8.dp),
                            contentPadding = PaddingValues(horizontal = 10.dp, vertical = 4.dp)
                        ) {
                            Icon(
                                Icons.Default.VolumeUp,
                                contentDescription = "Simulate Voice",
                                tint = NeonCyan,
                                modifier = Modifier.size(16.dp)
                            )
                            Spacer(modifier = Modifier.width(4.dp))
                            Text("TEST VOICE", fontSize = 10.sp, color = Color.White)
                        }
                    }
                }
            }
        }
    }
}
