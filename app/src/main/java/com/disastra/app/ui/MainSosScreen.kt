package com.disastra.app.ui

import android.util.Log
import android.view.animation.OvershootInterpolator
import androidx.compose.animation.core.*
import androidx.compose.foundation.Canvas
import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.gestures.detectTapGestures
import androidx.compose.foundation.interaction.MutableInteractionSource
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material.icons.outlined.WbSunny
import androidx.compose.material3.*
import androidx.compose.ui.draw.shadow
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.blur
import androidx.compose.ui.draw.clip
import androidx.compose.ui.draw.scale
import androidx.compose.ui.geometry.Offset
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.StrokeCap
import androidx.compose.ui.graphics.drawscope.Stroke
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.input.pointer.pointerInput
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.disastra.app.data.SosUpdateMessage
import kotlinx.coroutines.launch
import kotlin.math.cos
import kotlin.math.sin

/*
 * DISASTRA - UI
 * Minimal, non-functional refactor: add file header and private UI constants for readability.
 * Author: Chakshit Bansal (suggested)
 * Note: No logic changes — only documentation and constant extraction.
 */

// ------------------------
// UI Constants (presentation only, no behavior change)
// ------------------------
private val MAIN_BUTTON_BOX_SIZE = 340.dp
private val MAIN_BUTTON_SIZE = 230.dp
private val MAIN_HALO_OUTER = 300.dp
private val MAIN_HALO_INNER = 280.dp
private val RADIAL_RADIUS = 140.dp
private const val ACTIVATION_HOLD_MS = 3000

// --- Emergency Colors ---
enum class EmergencyType(val icon: ImageVector, val label: String, val color: Color) {
    TRAPPED(Icons.Default.Roofing, "Trapped", Color(0xFF9969C7)),
    MEDICAL(Icons.Default.MedicalServices, "Medical", Color(0xFFEF5350)),
    FIRE(Icons.Default.FireExtinguisher, "Fire", Color(0xFFFF7F00)),
    UNSAFE(Icons.Default.Warning, "Unsafe", Color(0xFF312B94))
}

enum class SosUiState {
    IDLE,
    CONFIRMED,
    SAFE,
    POST_ALERT
}

private enum class ActivationState { IDLE, PRESSED }

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun MainSosScreen(
    lastSosTimestamp: Long?,
    sosUiState: SosUiState,
    isDarkTheme: Boolean,
    currentLocationName: String,
    messageLog: List<String>, // <-- FIX: Added messageLog parameter
    isBridgefyRunning: Boolean, // <-- ADD THIS
    onThemeToggle: () -> Unit,
    onSosActivated: (EmergencyType) -> Unit,
    onSosUpdate: (SosUpdateMessage) -> Unit,
    onMarkSafe: () -> Unit
) {
    // --- FIX: Set default selected type to TRAPPED ---
    var selectedType by remember { mutableStateOf(EmergencyType.TRAPPED) }

    val gradientBrush = if (isDarkTheme) DarkGradients.background else LightGradients.background

    Box(
        modifier = Modifier
            .fillMaxSize()
            .background(gradientBrush)
    ) {
        AnimatedBackgroundElements(isDarkTheme)

        Column(
            modifier = Modifier
                .fillMaxSize()
                .statusBarsPadding()
                .padding(horizontal = 20.dp),
            horizontalAlignment = Alignment.CenterHorizontally
        ) {
            Spacer(Modifier.height(16.dp))

            PremiumHeader(
                isDarkTheme = isDarkTheme,
                onThemeToggle = onThemeToggle
            )

            Spacer(Modifier.height(24.dp))

            StatusCard(sosUiState, isDarkTheme)

            Spacer(Modifier.height(24.dp))

            EmergencySelector(
                selectedType = selectedType,
                onTypeSelected = { selectedType = it },
                enabled = sosUiState == SosUiState.IDLE
            )

            Spacer(Modifier.height(8.dp))

            Box(
                modifier = Modifier
                    .fillMaxWidth()
                    .weight(1f),
                contentAlignment = Alignment.Center
            ) {
                SosButtonCluster(
                    uiState = sosUiState,
                    isDarkTheme = isDarkTheme,
                    lastSosTimestamp = lastSosTimestamp,
                    isBridgefyRunning = isBridgefyRunning, // <-- ADD THIS
                    onSosUpdate = onSosUpdate,
                    onSosActivated = {
                        onSosActivated(selectedType)
                    },
                    onMarkSafe = onMarkSafe
                )
            }

            LocationDisplay(currentLocationName)

            Spacer(Modifier.height(8.dp)) // Small spacer

            // --- NEW: Event Log for Testing (Uncommented) ---
//            CompactEventLog(logs = messageLog)
//
//            Spacer(Modifier.height(16.dp))
        }
    }
}

@Composable
fun AnimatedBackgroundElements(isDarkTheme: Boolean) {
    val infiniteTransition = rememberInfiniteTransition()
    val alpha = if (isDarkTheme) 0.08f else 0.08f
    val accentBlue = MaterialTheme.colorScheme.primary
    val accentPurple = MaterialTheme.colorScheme.secondary

    val offset1 by infiniteTransition.animateFloat(
        initialValue = 0f, targetValue = 360f,
        animationSpec = infiniteRepeatable(tween(20000, easing = LinearEasing), RepeatMode.Restart)
    )
    val offset2 by infiniteTransition.animateFloat(
        initialValue = 0f, targetValue = 360f,
        animationSpec = infiniteRepeatable(tween(15000, easing = LinearEasing), RepeatMode.Restart)
    )

    Canvas(modifier = Modifier.fillMaxSize()) {
        drawCircle(
            brush = Brush.radialGradient(
                colors = listOf(accentBlue.copy(alpha = alpha), Color.Transparent),
                center = Offset(x = size.width * 0.3f + offset1, y = size.height * 0.2f),
                radius = 300f
            ),
            center = Offset(x = size.width * 0.3f, y = size.height * 0.2f),
            radius = 300f
        )
        drawCircle(
            brush = Brush.radialGradient(
                colors = listOf(accentPurple.copy(alpha = alpha), Color.Transparent),
                center = Offset(x = size.width * 0.7f - offset2, y = size.height * 0.7f),
                radius = 350f
            ),
            center = Offset(x = size.width * 0.7f, y = size.height * 0.7f),
            radius = 350f
        )
    }
}

@Composable
fun PremiumHeader(
    isDarkTheme: Boolean,
    onThemeToggle: () -> Unit
) {
    Box(
        modifier = Modifier.fillMaxWidth(),
        contentAlignment = Alignment.Center
    ) {
        Column(
            horizontalAlignment = Alignment.CenterHorizontally,
            modifier = Modifier.fillMaxWidth()
        ) {
            Surface(
                modifier = Modifier.size(56.dp),
                shape = CircleShape,
                color = MaterialTheme.colorScheme.surfaceVariant.copy(alpha = 0.5f),
                border = androidx.compose.foundation.BorderStroke(2.dp, MaterialTheme.colorScheme.primary.copy(alpha = 0.3f))
            ) {
                Box(contentAlignment = Alignment.Center) {
                    Icon(
                        imageVector = Icons.Default.Shield,
                        contentDescription = null,
                        tint = MaterialTheme.colorScheme.primary,
                        modifier = Modifier.size(32.dp)
                    )
                }
            }
            Spacer(Modifier.height(12.dp))
            Text(
                "DISASTRA",
                fontSize = 36.sp,
                fontWeight = FontWeight.Black,
                color = MaterialTheme.colorScheme.onBackground,
                letterSpacing = 6.sp
            )
            Text(
                "Emergency Response System",
                fontSize = 11.sp,
                color = MaterialTheme.colorScheme.onSurfaceVariant,
                letterSpacing = 3.sp,
                fontWeight = FontWeight.Light
            )
        }
        IconButton(
            onClick = onThemeToggle,
            modifier = Modifier
                .align(Alignment.TopEnd)
                .padding(top = 8.dp)
        ) {
            Icon(
                imageVector = if (isDarkTheme) Icons.Default.DarkMode else Icons.Outlined.WbSunny,
                contentDescription = "Toggle Theme",
                tint = MaterialTheme.colorScheme.primary
            )
        }
    }
}

@Composable
fun StatusCard(state: SosUiState, isDarkTheme: Boolean) {
    val (text, icon, color, bgColor) = when (state) {
        SosUiState.IDLE -> listOf(
            "Helpline Activated",
            Icons.Default.CheckCircle,
            MaterialTheme.colorScheme.primary,
            MaterialTheme.colorScheme.surfaceVariant
        )
        SosUiState.CONFIRMED, SosUiState.POST_ALERT -> listOf(
            "Help is Coming",
            Icons.Default.LocalHospital,
            if (isDarkTheme) DarkSuccessGreen else LightSuccessGreen,
            if (isDarkTheme) DarkSuccessCardBackground else LightSuccessCardBackground
        )
        SosUiState.SAFE -> listOf(
            "Marked as Safe",
            Icons.Default.VerifiedUser,
            if (isDarkTheme) DarkSuccessGreen else LightSuccessGreen,
            if (isDarkTheme) DarkSuccessCardBackground else LightSuccessCardBackground
        )
    }

    Surface(
        modifier = Modifier.fillMaxWidth(),
        shape = RoundedCornerShape(20.dp),
        color = bgColor as Color,
        shadowElevation = 2.dp
    ) {
        Row(
            modifier = Modifier.padding(horizontal = 20.dp, vertical = 16.dp),
            verticalAlignment = Alignment.CenterVertically,
            horizontalArrangement = Arrangement.Center
        ) {
            Icon(
                imageVector = icon as ImageVector,
                contentDescription = null,
                tint = color as Color,
                modifier = Modifier.size(20.dp)
            )
            Spacer(Modifier.width(12.dp))
            Text(
                text as String,
                color = color,
                fontSize = 15.sp,
                fontWeight = FontWeight.SemiBold,
                letterSpacing = 0.5.sp
            )
        }
    }
}

@Composable
fun EmergencySelector(
    selectedType: EmergencyType,
    onTypeSelected: (EmergencyType) -> Unit,
    enabled: Boolean
) {
    Column(horizontalAlignment = Alignment.CenterHorizontally) {
        Text(
            "SELECT EMERGENCY",
            style = MaterialTheme.typography.labelMedium,
            color = MaterialTheme.colorScheme.onSurfaceVariant,
            letterSpacing = 2.sp,
            fontSize = 11.sp,
            fontWeight = FontWeight.Medium
        )
        Spacer(Modifier.height(16.dp))
        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.SpaceEvenly
        ) {
            EmergencyType.values().forEach { type ->
                EmergencyTypeCard(
                    type = type,
                    isSelected = type == selectedType,
                    onClick = { if (enabled) onTypeSelected(type) },
                    enabled = enabled
                )
            }
        }
    }
}

@Composable
fun EmergencyTypeCard(
    type: EmergencyType,
    isSelected: Boolean,
    onClick: () -> Unit,
    enabled: Boolean
) {
    val scale by animateFloatAsState(
        targetValue = if (isSelected) 1.0f else 0.92f,
        animationSpec = spring(dampingRatio = Spring.DampingRatioMediumBouncy)
    )

    Surface(
        modifier = Modifier
            .scale(scale)
            .size(78.dp)
//            .shadow(
//                elevation = if (isSelected) 10.dp else 4.dp,
//                shape = RoundedCornerShape(18.dp),
//                clip = false
//            )
            .clickable(
                indication = null, // This removes the ripple
                interactionSource = remember { MutableInteractionSource() } // Required for no indication
            ) { onClick() }, // --- FIX: Call onClick() which was passed in ---
        shape = RoundedCornerShape(18.dp),
        color = if (isSelected) type.color.copy(alpha = 0.15f) else MaterialTheme.colorScheme.surface,
        border = if (isSelected) {
            androidx.compose.foundation.BorderStroke(2.dp, type.color.copy(alpha = 0.8f))
        } else {
            androidx.compose.foundation.BorderStroke(1.dp, MaterialTheme.colorScheme.onSurface.copy(alpha = 0.1f))
        }
    ) {
        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(10.dp),
            horizontalAlignment = Alignment.CenterHorizontally,
            verticalArrangement = Arrangement.Center
        ) {
            Icon(
                imageVector = type.icon,
                contentDescription = type.label,
                modifier = Modifier.size(32.dp),
                // --- FIX: Improved light theme contrast for unselected icons ---
                tint = if (isSelected) type.color else MaterialTheme.colorScheme.onSurface.copy(alpha = 0.7f)
            )
            Spacer(Modifier.height(6.dp))
            Text(
                type.label,
                fontSize = 10.sp,
                // --- FIX: Improved light theme contrast for unselected text ---
                color = if (isSelected) type.color else MaterialTheme.colorScheme.onSurface.copy(alpha = 0.8f),
                fontWeight = if (isSelected) FontWeight.Bold else FontWeight.Medium,
                textAlign = TextAlign.Center,
                lineHeight = 11.sp
            )
        }
    }
}

@OptIn(ExperimentalMaterial3Api::class, ExperimentalLayoutApi::class)
@Composable
fun SosButtonCluster(
    uiState: SosUiState,
    isDarkTheme: Boolean,
    lastSosTimestamp: Long?,
    isBridgefyRunning: Boolean, // <-- ADD THIS
    onSosActivated: () -> Unit,
    onSosUpdate: (SosUpdateMessage) -> Unit,
    onMarkSafe: () -> Unit
) {
    var activationState by remember { mutableStateOf(ActivationState.IDLE) }
    var radialMenuOpen by remember { mutableStateOf(false) }
    var showPeopleDialog by remember { mutableStateOf(false) }
    var showMedicalDialog by remember { mutableStateOf(false) }
    var showSafeConfirmation by remember { mutableStateOf(false) }

    val pulseScale = remember { Animatable(1f) }
    val activationProgress = remember { Animatable(0f) }
    val haloAlpha = remember { Animatable(0f) }
    val haloScale = remember { Animatable(1f) }

    // Breathing animation
    LaunchedEffect(activationState, uiState) {
        if (uiState == SosUiState.SAFE) {
            pulseScale.snapTo(1f)
            return@LaunchedEffect
        }

        while (true) {
            val pulseDuration = when {
                activationState == ActivationState.PRESSED -> 300
                uiState == SosUiState.CONFIRMED || uiState == SosUiState.POST_ALERT -> 2000
                else -> 1500
            }

            val targetScale = when {
                activationState == ActivationState.PRESSED -> 1.06f
                uiState == SosUiState.CONFIRMED || uiState == SosUiState.POST_ALERT -> 1.04f
                else -> 1.08f
            }

            pulseScale.animateTo(
                targetValue = targetScale,
                animationSpec = tween(durationMillis = pulseDuration, easing = FastOutSlowInEasing)
            )
            pulseScale.animateTo(
                targetValue = 1f,
                animationSpec = tween(durationMillis = pulseDuration, easing = FastOutSlowInEasing)
            )
        }
    }

    // Halo animation for confirmed state
    LaunchedEffect(uiState) {
        if (uiState == SosUiState.CONFIRMED || uiState == SosUiState.POST_ALERT) {
            while (true) {
                launch {
                    haloAlpha.animateTo(0.5f, tween(1500, easing = FastOutSlowInEasing))
                    haloAlpha.animateTo(0.2f, tween(1500, easing = FastOutSlowInEasing))
                }
                launch {
                    haloScale.animateTo(1.15f, tween(1500, easing = FastOutSlowInEasing))
                    haloScale.animateTo(1.0f, tween(1500, easing = FastOutSlowInEasing))
                }
                // --- FIX: Add delay to prevent ANR ---
                // This 'while(true)' loop was running without suspension,
                // launching thousands of coroutines and blocking the main thread,
                // which caused the "Application Not Responding" (ANR) error.
                // This delay waits for the animations (1500 + 1500 = 3000) to
                // finish before looping again.
                kotlinx.coroutines.delay(3000)
            }
        } else {
            haloAlpha.snapTo(0f)
            haloScale.snapTo(1f)
        }
    }

    // Activation progress
    LaunchedEffect(activationState) {
        if (activationState == ActivationState.PRESSED) {
            activationProgress.animateTo(
                targetValue = 1f,
                animationSpec = tween(durationMillis = 3000, easing = LinearEasing)
            )
            if (activationProgress.value == 1f) {
                onSosActivated()
                activationState = ActivationState.IDLE
                activationProgress.snapTo(0f)
            }
        } else {
            activationProgress.snapTo(0f)
        }
    }

    Box(
        modifier = Modifier.size(340.dp),
        contentAlignment = Alignment.Center
    ) {
        // --- FIX: This block is moved from the top to the bottom of the Box ---
        // This ensures the radial menu is drawn ON TOP of the main button.
        /*
        if (radialMenuOpen && (uiState == SosUiState.CONFIRMED || uiState == SosUiState.POST_ALERT)) {
            ...
        }
        */

        // Dialogs
        if (showPeopleDialog && lastSosTimestamp != null) {
            PeopleUpdateDialog(
                onDismiss = { showPeopleDialog = false },
                onSend = { numPeople ->
                    onSosUpdate(
                        SosUpdateMessage(
                            originalTimestamp = lastSosTimestamp,
                            numPeople = numPeople,
                            medicalSupplies = "",
                            additionalInfo = ""
                        )
                    )
                    showPeopleDialog = false
                    radialMenuOpen = false
                }
            )
        }
        if (showMedicalDialog && lastSosTimestamp != null) {
            MedicalUpdateDialog(
                onDismiss = { showMedicalDialog = false },
                onSend = { medical, info ->
                    onSosUpdate(
                        SosUpdateMessage(
                            originalTimestamp = lastSosTimestamp,
                            numPeople = "",
                            medicalSupplies = medical,
                            additionalInfo = info
                        )
                    )
                    showMedicalDialog = false
                    radialMenuOpen = false
                }
            )
        }

        if (showSafeConfirmation) {
            SafeConfirmationDialog(
                onDismiss = { showSafeConfirmation = false },
                onConfirm = {
                    onMarkSafe()
                    showSafeConfirmation = false
                    radialMenuOpen = false
                },
                isDarkTheme = isDarkTheme
            )
        }

        // Main Button with Halo
        Box(
            modifier = Modifier.size(250.dp),
            contentAlignment = Alignment.Center
        ) {
            if (uiState == SosUiState.CONFIRMED || uiState == SosUiState.POST_ALERT) {
                val haloBrush = if(isDarkTheme) DarkGradients.halo else LightGradients.halo
                val haloColor = if(isDarkTheme) DarkSuccessGreen else LightSuccessGreen
                // Outer halo
                Canvas(
                    modifier = Modifier
                        .size(300.dp)
                        .scale(haloScale.value)
                        .blur(30.dp)
                ) {
                    drawCircle(
                        brush = haloBrush,
                        radius = size.minDimension / 2f
                    )
                }
                // Inner halo
                Canvas(
                    modifier = Modifier
                        .size(280.dp)
                        .blur(15.dp)
                ) {
                    drawCircle(
                        color = haloColor.copy(alpha = haloAlpha.value * 0.4f),
                        radius = size.minDimension / 2.2f
                    )
                }
            }

            // Main button
            Box(
                modifier = Modifier
                    .size(230.dp)
                    .pointerInput(uiState, isBridgefyRunning) { // <-- ADD isBridgefyRunning
                        detectTapGestures(
                            onTap = {
                                when (uiState) {
                                    SosUiState.CONFIRMED, SosUiState.POST_ALERT -> radialMenuOpen = !radialMenuOpen
                                    else -> {}
                                }
                            },
                            onPress = {
                                if (uiState == SosUiState.IDLE && isBridgefyRunning) { // <-- UPDATE THIS CHECK
                                    activationState = ActivationState.PRESSED
                                    try {
                                        tryAwaitRelease()
                                    } finally {
                                        activationState = ActivationState.IDLE
                                    }
                                }
                            }
                        )
                    },
                contentAlignment = Alignment.Center
            ) {
                Canvas(
                    modifier = Modifier
                        .fillMaxSize()
                        .scale(pulseScale.value)
                ) {
                    val buttonColor = when (uiState) {
                        SosUiState.IDLE -> Color(0xFFD32F2F)
                        SosUiState.CONFIRMED, SosUiState.POST_ALERT -> Color(0xFF388E3C)
                        SosUiState.SAFE -> Color(0xFF388E3C).copy(alpha = 0.7f)
                    }

                    drawCircle(
                        brush = Brush.radialGradient(
                            colors = listOf(
                                buttonColor.copy(alpha = 0.0f),
                                buttonColor.copy(alpha = 0.2f),
                                Color.Transparent
                            ),
                            center = center,
                            radius = size.minDimension / 1.8f
                        ),
                        radius = size.minDimension / 1.8f
                    )
                    drawCircle(
                        brush = Brush.radialGradient(
                            colors = listOf(
                                buttonColor.copy(alpha = 1f),
                                buttonColor.copy(alpha = 0.85f)
                            ),
                            center = Offset(center.x, center.y - 20f)
                        ),
                        radius = size.minDimension / 2.0f
                    )
                    drawCircle(
                        brush = Brush.radialGradient(
                            colors = listOf(
                                Color.Black.copy(alpha = 0.1f),
                                Color.Transparent
                            ),
                            center = Offset(center.x, center.y + 30f),
                            radius = size.minDimension / 2.5f
                        ),
                        radius = size.minDimension / 2.0f
                    )
                    if (activationState == ActivationState.PRESSED) {
                        drawArc(
                            color = Color.White,
                            startAngle = -90f,
                            sweepAngle = 360f * activationProgress.value,
                            useCenter = false,
                            style = Stroke(width = 8.dp.toPx(), cap = StrokeCap.Round)
                        )
                    }
                }

                // Button text
                Column(
                    horizontalAlignment = Alignment.CenterHorizontally
                ) {
                    Text(
                        text = when (uiState) {
                            SosUiState.IDLE -> "SOS"
                            SosUiState.CONFIRMED, SosUiState.POST_ALERT -> "HELP\nCOMING"
                            SosUiState.SAFE -> "SAFE"
                        },
                        color = Color.White,
                        fontSize = if (uiState == SosUiState.CONFIRMED || uiState == SosUiState.POST_ALERT) 38.sp else 56.sp,
                        fontWeight = FontWeight.Black,
                        textAlign = TextAlign.Center,
                        lineHeight = if (uiState == SosUiState.CONFIRMED || uiState == SosUiState.POST_ALERT) 42.sp else 56.sp,
                        letterSpacing = 2.sp
                    )

                    if (uiState == SosUiState.IDLE) {
                        Spacer(Modifier.height(8.dp))
                        Text(
                            // --- FIX: Show connecting state ---
                            text = if (isBridgefyRunning) "HOLD 3s" else "CONNECTING...",
                            color = Color.White.copy(alpha = 0.8f),
                            fontSize = 13.sp,
                            fontWeight = FontWeight.Medium,
                            letterSpacing = 2.sp
                        )
                    }
                }
            }
        }

        // --- FIX: Moved this block from line 316 to here ---
        // This ensures the radial menu is drawn ON TOP of the main button.
        if (radialMenuOpen && (uiState == SosUiState.CONFIRMED || uiState == SosUiState.POST_ALERT)) {
            val animatable = remember { Animatable(0f) }
            LaunchedEffect(Unit) {
                animatable.animateTo(
                    targetValue = 1f,
                    animationSpec = tween(
                        durationMillis = 500,
                        easing = Easing {
                            OvershootInterpolator(1.8f).getInterpolation(it)
                        }
                    )
                )
            }

            val scale = animatable.value

            RadialMenuItem(
                icon = Icons.Default.People,
                label = "People",
                angle = 225f,
                scale = scale,
                onClick = { showPeopleDialog = true }
            )

            RadialMenuItem(
                icon = Icons.Default.MedicalServices,
                label = "Medical",
                angle = 315f,
                scale = scale,
                onClick = { showMedicalDialog = true }
            )
            RadialMenuItem(
                icon = Icons.Default.Favorite,
                label = "Heartbeat",
                angle = 180f,
                scale = scale,
                onClick = {
                    // step 3 will go here
                    Log.d("Disastra", "Heartbeat clicked")
                }
            )

            RadialMenuItem(
                icon = Icons.Default.CheckCircle,
                label = "I'm Safe",
                angle = 270f,
                scale = scale,
                onClick = { showSafeConfirmation = true }
            )
        }
    }
}

@Composable
fun RadialMenuItem(
    icon: ImageVector,
    label: String,
    angle: Float,
    scale: Float,
    onClick: () -> Unit
) {
    val radius = 140.dp
    val angleRad = Math.toRadians(angle.toDouble()).toFloat()
    val offsetX = cos(angleRad) * radius.value
    val offsetY = sin(angleRad) * radius.value

    Column(
        modifier = Modifier
            .offset(x = offsetX.dp, y = offsetY.dp)
            .scale(scale),
        horizontalAlignment = Alignment.CenterHorizontally
    ) {
        Surface(
            onClick = onClick,
            modifier = Modifier.size(64.dp),
            shape = CircleShape,
            color = MaterialTheme.colorScheme.secondary,
            shadowElevation = 12.dp
        ) {
            Box(
                contentAlignment = Alignment.Center,
                modifier = Modifier.fillMaxSize()
            ) {
                Icon(
                    imageVector = icon,
                    contentDescription = label,
                    tint = MaterialTheme.colorScheme.onSecondary,
                    modifier = Modifier.size(32.dp)
                )
            }
        }

        Spacer(Modifier.height(6.dp))

        Surface(
            shape = RoundedCornerShape(8.dp),
            color = MaterialTheme.colorScheme.surface,
            shadowElevation = 4.dp
        ) {
            Text(
                label,
                color = MaterialTheme.colorScheme.onSurface,
                fontSize = 11.sp,
                fontWeight = FontWeight.SemiBold,
                modifier = Modifier.padding(horizontal = 8.dp, vertical = 4.dp)
            )
        }
    }
}

@Composable
fun LocationDisplay(currentLocationName: String) {
    Surface(
        modifier = Modifier.fillMaxWidth(),
        color = MaterialTheme.colorScheme.surfaceVariant,
        shape = RoundedCornerShape(20.dp),
        border = androidx.compose.foundation.BorderStroke(1.dp, MaterialTheme.colorScheme.primary.copy(alpha = 0.2f)),
        shadowElevation = 2.dp
    ) {
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .padding(16.dp),
            verticalAlignment = Alignment.CenterVertically
        ) {
            Icon(
                imageVector = Icons.Default.LocationOn,
                contentDescription = "Location",
                tint = MaterialTheme.colorScheme.primary,
                modifier = Modifier.size(20.dp)
            )
            Spacer(Modifier.width(10.dp))
            Text(
                text = currentLocationName,
                style = MaterialTheme.typography.titleMedium,
                color = MaterialTheme.colorScheme.onSurface,
                fontWeight = FontWeight.SemiBold,
                maxLines = 1
            )
        }
    }
}

// --- NEW: Added CompactEventLog composable back ---
@Composable
fun CompactEventLog(logs: List<String>) {
    Column {
        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.SpaceBetween,
            verticalAlignment = Alignment.CenterVertically
        ) {
            Text(
                "EVENT LOG (FOR TESTING)",
                style = MaterialTheme.typography.labelMedium,
                color = MaterialTheme.colorScheme.onSurfaceVariant,
                letterSpacing = 2.sp,
                fontSize = 11.sp,
                fontWeight = FontWeight.Medium
            )
            Icon(
                imageVector = Icons.Default.BugReport,
                contentDescription = "Event Log",
                tint = MaterialTheme.colorScheme.onSurfaceVariant.copy(alpha = 0.7f),
                modifier = Modifier.size(16.dp)
            )
        }
        Spacer(Modifier.height(8.dp))
        Surface(
            modifier = Modifier
                .fillMaxWidth()
                .heightIn(max = 100.dp), // Limit height
            color = MaterialTheme.colorScheme.surfaceVariant.copy(alpha = 0.5f),
            shape = RoundedCornerShape(12.dp),
            border = androidx.compose.foundation.BorderStroke(1.dp, MaterialTheme.colorScheme.onSurface.copy(alpha = 0.1f))
        ) {
            LazyColumn(
                modifier = Modifier.padding(horizontal = 12.dp, vertical = 8.dp),
                reverseLayout = true // Shows newest logs first
            ) {
                items(logs) { log ->
                    Text(
                        log,
                        style = MaterialTheme.typography.bodySmall,
                        color = MaterialTheme.colorScheme.onSurfaceVariant,
                        fontSize = 10.sp,
                        lineHeight = 12.sp
                    )
                    Divider(color = MaterialTheme.colorScheme.onSurface.copy(alpha = 0.05f), thickness = 1.dp, modifier = Modifier.padding(vertical = 4.dp))
                }
            }
        }
    }
}


// --- All Dialogs (People, Medical, Safe) ---

@OptIn(ExperimentalMaterial3Api::class, ExperimentalLayoutApi::class)
@Composable
fun PeopleUpdateDialog(
    onDismiss: () -> Unit,
    onSend: (numPeople: String) -> Unit
) {
    var selectedCount by remember { mutableStateOf("") }
    val peopleOptions = listOf("1", "2-3", "4-6", "7+")

    AlertDialog(
        onDismissRequest = onDismiss,
        containerColor = MaterialTheme.colorScheme.surface,
        shape = RoundedCornerShape(24.dp),
        title = {
            Row(verticalAlignment = Alignment.CenterVertically) {
                Icon(
                    Icons.Default.People,
                    null,
                    tint = MaterialTheme.colorScheme.primary,
                    modifier = Modifier.size(28.dp)
                )
                Spacer(Modifier.width(12.dp))
                Text(
                    "People Count",
                    fontWeight = FontWeight.Bold,
                    color = MaterialTheme.colorScheme.onSurface
                )
            }
        },
        text = {
            Column {
                Text(
                    "How many people need help?",
                    color = MaterialTheme.colorScheme.onSurfaceVariant,
                    fontSize = 14.sp
                )
                Spacer(Modifier.height(16.dp))
                FlowRow(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.spacedBy(12.dp),
                    verticalArrangement = Arrangement.spacedBy(12.dp)
                ) {
                    peopleOptions.forEach { count ->
                        PremiumChip(
                            label = count,
                            isSelected = selectedCount == count,
                            onSelected = { selectedCount = count }
                        )
                    }
                }
            }
        },
        confirmButton = {
            Button(
                onClick = { onSend(selectedCount) },
                enabled = selectedCount.isNotEmpty(),
                colors = ButtonDefaults.buttonColors(
                    containerColor = MaterialTheme.colorScheme.primary,
                    disabledContainerColor = MaterialTheme.colorScheme.primary.copy(alpha = 0.3f)
                ),
                shape = RoundedCornerShape(12.dp),
                modifier = Modifier.height(48.dp)
            ) {
                Text(
                    "Send Update",
                    fontWeight = FontWeight.SemiBold,
                    color = MaterialTheme.colorScheme.onPrimary
                )
            }
        },
        dismissButton = {
            TextButton(
                onClick = onDismiss,
                shape = RoundedCornerShape(12.dp)
            ) {
                Text("Cancel", color = MaterialTheme.colorScheme.onSurfaceVariant)
            }
        }
    )
}

@OptIn(ExperimentalMaterial3Api::class, ExperimentalLayoutApi::class)
@Composable
fun MedicalUpdateDialog(
    onDismiss: () -> Unit,
    onSend: (medical: String, info: String) -> Unit
) {
    var selectedMedical by remember { mutableStateOf("") }
    var additionalInfo by remember { mutableStateOf("") }
    val medicalOptions = listOf("Bandages", "Water", "First Aid", "Medicine")

    AlertDialog(
        onDismissRequest = onDismiss,
        containerColor = MaterialTheme.colorScheme.surface,
        shape = RoundedCornerShape(24.dp),
        title = {
            Row(verticalAlignment = Alignment.CenterVertically) {
                Icon(
                    Icons.Default.MedicalServices,
                    null,
                    tint = MaterialTheme.colorScheme.error,
                    modifier = Modifier.size(28.dp)
                )
                Spacer(Modifier.width(12.dp))
                Text(
                    "Medical Info",
                    fontWeight = FontWeight.Bold,
                    color = MaterialTheme.colorScheme.onSurface
                )
            }
        },
        text = {
            Column(verticalArrangement = Arrangement.spacedBy(16.dp)) {
                Text(
                    "What supplies do you need?",
                    color = MaterialTheme.colorScheme.onSurfaceVariant,
                    fontSize = 14.sp
                )
                FlowRow(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.spacedBy(8.dp),
                    verticalArrangement = Arrangement.spacedBy(8.dp)
                ) {
                    medicalOptions.forEach { item ->
                        PremiumChip(
                            label = item,
                            isSelected = selectedMedical == item,
                            onSelected = { selectedMedical = item }
                        )
                    }
                }

                OutlinedTextField(
                    value = additionalInfo,
                    onValueChange = { additionalInfo = it },
                    label = { Text("Additional details", color = MaterialTheme.colorScheme.onSurfaceVariant) },
                    modifier = Modifier.fillMaxWidth(),
                    colors = TextFieldDefaults.outlinedTextFieldColors(
                        focusedBorderColor = MaterialTheme.colorScheme.primary,
                        unfocusedBorderColor = MaterialTheme.colorScheme.onSurface.copy(alpha = 0.2f),
                        cursorColor = MaterialTheme.colorScheme.primary,
                        focusedTextColor = MaterialTheme.colorScheme.onSurface,
                        unfocusedTextColor = MaterialTheme.colorScheme.onSurface
                    ),
                    shape = RoundedCornerShape(12.dp)
                )
            }
        },
        confirmButton = {
            Button(
                onClick = { onSend(selectedMedical, additionalInfo) },
                colors = ButtonDefaults.buttonColors(
                    containerColor = MaterialTheme.colorScheme.error
                ),
                shape = RoundedCornerShape(12.dp),
                modifier = Modifier.height(48.dp)
            ) {
                Text(
                    "Send",
                    fontWeight = FontWeight.SemiBold,
                    color = MaterialTheme.colorScheme.onError
                )
            }
        },
        dismissButton = {
            TextButton(
                onClick = onDismiss,
                shape = RoundedCornerShape(12.dp)
            ) {
                Text("Cancel", color = MaterialTheme.colorScheme.onSurfaceVariant)
            }
        }
    )
}

@Composable
fun SafeConfirmationDialog(
    onDismiss: () -> Unit,
    onConfirm: () -> Unit,
    isDarkTheme: Boolean
) {
    val successGreen = if (isDarkTheme) DarkSuccessGreen else LightSuccessGreen
    val successBg = if (isDarkTheme) DarkSuccessCardBackground else LightSuccessCardBackground

    AlertDialog(
        onDismissRequest = onDismiss,
        containerColor = MaterialTheme.colorScheme.surface,
        shape = RoundedCornerShape(24.dp),
        icon = {
            Surface(
                shape = CircleShape,
                color = successBg,
                modifier = Modifier.size(64.dp)
            ) {
                Box(contentAlignment = Alignment.Center) {
                    Icon(
                        Icons.Default.CheckCircle,
                        null,
                        tint = successGreen,
                        modifier = Modifier.size(36.dp)
                    )
                }
            }
        },
        title = {
            Text(
                "Mark as Safe?",
                fontWeight = FontWeight.Bold,
                color = MaterialTheme.colorScheme.onSurface,
                textAlign = TextAlign.Center,
                modifier = Modifier.fillMaxWidth()
            )
        },
        text = {
            Text(
                "This will notify others that you're safe and stop the heartbeat beacon.",
                color = MaterialTheme.colorScheme.onSurfaceVariant,
                textAlign = TextAlign.Center,
                fontSize = 14.sp
            )
        },
        confirmButton = {
            Button(
                onClick = onConfirm,
                colors = ButtonDefaults.buttonColors(
                    containerColor = successGreen
                ),
                shape = RoundedCornerShape(12.dp),
                modifier = Modifier
                    .fillMaxWidth()
                    .height(52.dp)
            ) {
                Icon(
                    Icons.Default.CheckCircle,
                    null,
                    modifier = Modifier.size(20.dp),
                    tint = if (isDarkTheme) Color.Black else Color.White
                )
                Spacer(Modifier.width(8.dp))
                Text(
                    "Confirm I'm Safe",
                    fontWeight = FontWeight.Bold,
                    fontSize = 16.sp,
                    color = if (isDarkTheme) Color.Black else Color.White
                )
            }
        },
        dismissButton = {
            TextButton(
                onClick = onDismiss,
                shape = RoundedCornerShape(12.dp),
                modifier = Modifier.fillMaxWidth()
            ) {
                Text("Cancel", color = MaterialTheme.colorScheme.onSurfaceVariant)
            }
        }
    )
}

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun PremiumChip(
    label: String,
    isSelected: Boolean,
    onSelected: () -> Unit
) {
    Surface(
        onClick = onSelected,
        shape = RoundedCornerShape(12.dp),
        color = if (isSelected) MaterialTheme.colorScheme.primaryContainer else Color.Transparent,
        border = androidx.compose.foundation.BorderStroke(
            width = 2.dp,
            color = if (isSelected) MaterialTheme.colorScheme.primary else MaterialTheme.colorScheme.onSurface.copy(alpha = 0.2f)
        )
    ) {
        Row(
            modifier = Modifier.padding(horizontal = 16.dp, vertical = 12.dp),
            verticalAlignment = Alignment.CenterVertically,
            horizontalArrangement = Arrangement.Center
        ) {
            if (isSelected) {
                Icon(
                    imageVector = Icons.Default.Done,
                    contentDescription = "Selected",
                    tint = MaterialTheme.colorScheme.primary,
                    modifier = Modifier.size(18.dp)
                )
                Spacer(Modifier.width(6.dp))
            }
            Text(
                label,
                color = if (isSelected) MaterialTheme.colorScheme.primary else MaterialTheme.colorScheme.onSurface,
                fontWeight = if (isSelected) FontWeight.Bold else FontWeight.Medium,
                fontSize = 14.sp
            )
        }
    }
}
//added all the mainSocket files
