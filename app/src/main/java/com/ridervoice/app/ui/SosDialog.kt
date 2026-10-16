package com.ridervoice.app.ui

import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Warning
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontFamily
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.ridervoice.app.ui.theme.*

@Composable
fun SosDialog(
    onDismiss: () -> Unit,
    onConfirmDispatch: () -> Unit
) {
    var countdown by remember { mutableStateOf(10) }

    LaunchedEffect(Unit) {
        while (countdown > 0) {
            kotlinx.coroutines.delay(1000)
            countdown -= 1
        }
        onConfirmDispatch()
    }

    AlertDialog(
        onDismissRequest = onDismiss,
        title = {
            Row(verticalAlignment = Alignment.CenterVertically) {
                Icon(Icons.Default.Warning, contentDescription = "Emergency SOS", tint = NeonRose)
                Spacer(modifier = Modifier.width(8.dp))
                Text("CRASH / DISTRESS DETECTED", fontWeight = FontWeight.ExtraBold, color = NeonRose)
            }
        },
        text = {
            Column(
                modifier = Modifier.fillMaxWidth(),
                horizontalAlignment = Alignment.CenterHorizontally,
                verticalArrangement = Arrangement.spacedBy(14.dp)
            ) {
                Text(
                    "Broadcasting distress coordinates to squad channel in:",
                    fontSize = 12.sp,
                    color = Color.LightGray
                )

                Surface(
                    color = Color(0xFF4C0519),
                    shape = RoundedCornerShape(12.dp)
                ) {
                    Text(
                        "00:0$countdown",
                        modifier = Modifier.padding(horizontal = 24.dp, vertical = 12.dp),
                        fontSize = 36.sp,
                        fontWeight = FontWeight.Black,
                        color = NeonRose,
                        fontFamily = FontFamily.Monospace
                    )
                }

                Text(
                    "GPS Coordinates: 36.5684° N, 121.9542° W",
                    fontSize = 11.sp,
                    color = Color.Gray,
                    fontFamily = FontFamily.Monospace
                )
            }
        },
        confirmButton = {
            Button(
                onClick = onDismiss,
                colors = ButtonDefaults.buttonColors(containerColor = Color.DarkGray),
                modifier = Modifier.fillMaxWidth()
            ) {
                Text("I AM OK — CANCEL SOS", fontWeight = FontWeight.Bold, color = Color.White)
            }
        },
        containerColor = DarkSurface
    )
}
