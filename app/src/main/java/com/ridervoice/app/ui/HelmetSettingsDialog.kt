package com.ridervoice.app.ui

import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontFamily
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.ridervoice.app.model.HelmetConfig
import com.ridervoice.app.ui.theme.*

@Composable
fun HelmetSettingsDialog(
    config: HelmetConfig,
    onUpdateConfig: (HelmetConfig) -> Unit,
    onDismiss: () -> Unit
) {
    val devices = listOf("Cardo Packtalk Edge", "Sena 50S Mesh", "FreedConn FX", "Lexin B4FM")

    AlertDialog(
        onDismissRequest = onDismiss,
        title = {
            Row(verticalAlignment = Alignment.CenterVertically) {
                Icon(Icons.Default.Headphones, contentDescription = "Helmet", tint = NeonCyan)
                Spacer(modifier = Modifier.width(8.dp))
                Text("Helmet & Audio Settings", fontWeight = FontWeight.Bold, color = Color.White)
            }
        },
        text = {
            Column(
                modifier = Modifier.fillMaxWidth(),
                verticalArrangement = Arrangement.spacedBy(14.dp)
            ) {
                // Device selection
                Text(
                    "PAIRED COMM SYSTEM",
                    fontSize = 10.sp,
                    fontWeight = FontWeight.Bold,
                    color = Color.Gray,
                    fontFamily = FontFamily.Monospace
                )
                Column(verticalArrangement = Arrangement.spacedBy(6.dp)) {
                    devices.forEach { dev ->
                        val isSelected = config.connectedDevice == dev
                        Surface(
                            color = if (isSelected) Color(0xFF083344) else DarkSurfaceVariant,
                            shape = RoundedCornerShape(8.dp),
                            modifier = Modifier
                                .fillMaxWidth()
                                .clickable { onUpdateConfig(config.copy(connectedDevice = dev)) }
                        ) {
                            Row(
                                modifier = Modifier.padding(10.dp),
                                horizontalArrangement = Arrangement.SpaceBetween,
                                verticalAlignment = Alignment.CenterVertically
                            ) {
                                Text(
                                    dev,
                                    fontSize = 12.sp,
                                    fontWeight = if (isSelected) FontWeight.Bold else FontWeight.Normal,
                                    color = if (isSelected) NeonCyan else Color.White
                                )
                                if (isSelected) {
                                    Icon(Icons.Default.Check, contentDescription = "Active", tint = NeonCyan, modifier = Modifier.size(16.dp))
                                }
                            }
                        }
                    }
                }

                // Noise Suppression
                Text(
                    "WIND NOISE DSP FILTER",
                    fontSize = 10.sp,
                    fontWeight = FontWeight.Bold,
                    color = Color.Gray,
                    fontFamily = FontFamily.Monospace
                )
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.spacedBy(6.dp)
                ) {
                    listOf("Off", "Adaptive", "High Speed").forEach { mode ->
                        val isSelected = config.noiseSuppression == mode
                        Surface(
                            color = if (isSelected) NeonCyan else DarkSurfaceVariant,
                            shape = RoundedCornerShape(8.dp),
                            modifier = Modifier
                                .weight(1f)
                                .clickable { onUpdateConfig(config.copy(noiseSuppression = mode)) }
                        ) {
                            Text(
                                mode,
                                modifier = Modifier.padding(vertical = 8.dp),
                                textAlign = androidx.compose.ui.text.style.TextAlign.Center,
                                fontSize = 11.sp,
                                fontWeight = FontWeight.Bold,
                                color = if (isSelected) Color.Black else Color.White
                            )
                        }
                    }
                }

                // Volume Sliders
                Text(
                    "INTERCOM AUDIO VOLUME (${(config.intercomVolume * 100).toInt()}%)",
                    fontSize = 10.sp,
                    fontWeight = FontWeight.Bold,
                    color = Color.Gray,
                    fontFamily = FontFamily.Monospace
                )
                Slider(
                    value = config.intercomVolume,
                    onValueChange = { onUpdateConfig(config.copy(intercomVolume = it)) },
                    colors = SliderDefaults.colors(
                        thumbColor = NeonCyan,
                        activeTrackColor = NeonCyan,
                        inactiveTrackColor = DarkSurfaceVariant
                    )
                )
            }
        },
        confirmButton = {
            Button(
                onClick = onDismiss,
                colors = ButtonDefaults.buttonColors(containerColor = NeonCyan)
            ) {
                Text("DONE", fontWeight = FontWeight.Bold, color = Color.Black)
            }
        },
        containerColor = DarkSurface
    )
}
