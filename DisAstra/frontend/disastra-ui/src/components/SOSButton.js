import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  Animated,
  Modal,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { COLORS, SIZES } from '../constants/theme';

const { width } = Dimensions.get('window');

/**
 * SOSButton Component
 * Provides emergency SOS functionality with visual feedback and haptic responses
 * @param {Function} onSOSActivated - Callback when SOS is activated with emergency type
 * @param {String} sosStatus - Current status: 'idle', 'sending', or 'sent'
 * @param {Function} onResetSOS - Callback to reset SOS state
 */
const SOSButton = ({ onSOSActivated, sosStatus, onResetSOS }) => {
  // State Management
  const [isPressed, setIsPressed] = useState(false);
  const [showEmergencyMenu, setShowEmergencyMenu] = useState(false);
  const [pressTimer, setPressTimer] = useState(null);
  
  // Animation References
  const breathingAnim = useRef(new Animated.Value(1)).current;
  const progressAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const haloAnim = useRef(new Animated.Value(0)).current;

  // Constants
  const LONG_PRESS_DURATION = 1000;
  const BREATHING_IDLE_DURATION = 1500;
  const BREATHING_SENDING_DURATION = 400;
  const BREATHING_SENT_DURATION = 2000;
  const HALO_ANIMATION_DURATION = 1500;

  /**
   * Breathing Animation Effect
   * Creates different breathing patterns based on SOS status
   */
  useEffect(() => {
    let breathingLoop;
    
    if (sosStatus === 'idle') {
      // Gentle breathing animation for idle state
      breathingLoop = Animated.loop(
        Animated.sequence([
          Animated.timing(breathingAnim, {
            toValue: 1.08,
            duration: BREATHING_IDLE_DURATION,
            useNativeDriver: true,
          }),
          Animated.timing(breathingAnim, {
            toValue: 1,
            duration: BREATHING_IDLE_DURATION,
            useNativeDriver: true,
          }),
        ])
      );
    } else if (sosStatus === 'sending') {
      // Faster pulse during activation
      breathingLoop = Animated.loop(
        Animated.sequence([
          Animated.timing(breathingAnim, {
            toValue: 1.15,
            duration: BREATHING_SENDING_DURATION,
            useNativeDriver: true,
          }),
          Animated.timing(breathingAnim, {
            toValue: 1,
            duration: BREATHING_SENDING_DURATION,
            useNativeDriver: true,
          }),
        ])
      );
    } else if (sosStatus === 'sent') {
      // Calm breathing after SOS sent
      breathingLoop = Animated.loop(
        Animated.sequence([
          Animated.timing(breathingAnim, {
            toValue: 1.03,
            duration: BREATHING_SENT_DURATION,
            useNativeDriver: true,
          }),
          Animated.timing(breathingAnim, {
            toValue: 1,
            duration: BREATHING_SENT_DURATION,
            useNativeDriver: true,
          }),
        ])
      );
    }
    
    if (breathingLoop) {
      breathingLoop.start();
    }
    
    return () => {
      if (breathingLoop) {
        breathingLoop.stop();
      }
    };
  }, [sosStatus, breathingAnim]);

  /**
   * Confirmation Halo Animation Effect
   * Shows pulsing halo when SOS is successfully sent
   */
  useEffect(() => {
    if (sosStatus === 'sent') {
      Animated.loop(
        Animated.sequence([
          Animated.timing(haloAnim, {
            toValue: 1,
            duration: HALO_ANIMATION_DURATION,
            useNativeDriver: true,
          }),
          Animated.timing(haloAnim, {
            toValue: 0.3,
            duration: HALO_ANIMATION_DURATION,
            useNativeDriver: true,
          }),
        ])
      ).start();
    } else {
      haloAnim.setValue(0);
    }
  }, [sosStatus, haloAnim]);

  /**
   * Handle Press In Event
   * Initiates long press detection and visual feedback
   */
  const handlePressIn = () => {
    if (sosStatus !== 'idle') return;
    
    setIsPressed(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    
    // Scale down animation for press feedback
    Animated.spring(scaleAnim, {
      toValue: 0.95,
      useNativeDriver: true,
    }).start();
    
    // Start long press timer
    const timer = setTimeout(() => {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
      setShowEmergencyMenu(true);
    }, LONG_PRESS_DURATION);
    
    setPressTimer(timer);
    
    // Animate progress fill
    Animated.timing(progressAnim, {
      toValue: 1,
      duration: LONG_PRESS_DURATION,
      useNativeDriver: false,
    }).start();
  };

  /**
   * Handle Press Out Event
   * Clears timers and resets animations
   */
  const handlePressOut = () => {
    setIsPressed(false);
    
    // Scale back to normal
    Animated.spring(scaleAnim, {
      toValue: 1,
      useNativeDriver: true,
    }).start();
    
    // Clear the long press timer
    if (pressTimer) {
      clearTimeout(pressTimer);
      setPressTimer(null);
    }
    
    // Reset progress animation
    Animated.timing(progressAnim, {
      toValue: 0,
      duration: 200,
      useNativeDriver: false,
    }).start();
  };

  /**
   * Handle Emergency Type Selection
   * Closes menu and triggers SOS activation
   */
  const handleEmergencySelect = (emergencyType) => {
    setShowEmergencyMenu(false);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    onSOSActivated(emergencyType);
  };

  /**
   * Get Button Gradient Colors
   * Returns appropriate gradient based on current status
   */
  const getButtonGradient = () => {
    switch (sosStatus) {
      case 'idle':
        return [COLORS.emergency, COLORS.primaryDark];
      case 'sending':
        return [COLORS.warning, '#F57C00'];
      case 'sent':
        return [COLORS.success, COLORS.successGradientEnd];
      default:
        return [COLORS.emergency, COLORS.primaryDark];
    }
  };

  /**
   * Get Button Text
   * Returns appropriate text based on current status
   */
  const getButtonText = () => {
    switch (sosStatus) {
      case 'idle':
        return 'SOS';
      case 'sending':
        return 'SENDING...';
      case 'sent':
        return 'SENT ✓';
      default:
        return 'SOS';
    }
  };

  // Emergency type options configuration
  const emergencyTypes = [
    { id: 'medical', icon: '🚑', label: 'Medical', color: COLORS.emergency },
    { id: 'fire', icon: '🔥', label: 'Fire', color: '#FF6F00' },
    { id: 'trapped', icon: '🧱', label: 'Trapped', color: '#7B1FA2' },
    { id: 'unsafe', icon: '☣️', label: 'Unsafe Area', color: '#F57C00' },
  ];

  return (
    <>
      <View style={styles.container}>
        {/* Confirmation Halo - Visible when SOS is sent */}
        {sosStatus === 'sent' && (
          <Animated.View
            style={[
              styles.confirmationHalo,
              {
                opacity: haloAnim,
                transform: [
                  {
                    scale: haloAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [1, 1.2],
                    }),
                  },
                ],
              },
            ]}
          />
        )}

        {/* Main SOS Button Container */}
        <Animated.View
          style={[
            styles.buttonContainer,
            {
              transform: [
                { scale: Animated.multiply(breathingAnim, scaleAnim) }
              ]
            }
          ]}
        >
          <Pressable
            style={styles.sosButtonWrapper}
            onPressIn={handlePressIn}
            onPressOut={handlePressOut}
            disabled={sosStatus === 'sending'}
          >
            <LinearGradient
              colors={getButtonGradient()}
              style={styles.sosButton}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              {/* Progress Fill Indicator */}
              <Animated.View
                style={[
                  styles.progressFill,
                  {
                    opacity: progressAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [0, 0.3],
                    }),
                    transform: [{
                      scale: progressAnim.interpolate({
                        inputRange: [0, 1],
                        outputRange: [0, 1],
                      })
                    }]
                  }
                ]}
              />
              
              {/* Button Text */}
              <Text style={styles.sosText}>{getButtonText()}</Text>
              
              {/* Instruction Text - Only visible in idle state */}
              {sosStatus === 'idle' && (
                <Text style={styles.instructionText}>Hold to Activate</Text>
              )}
            </LinearGradient>
          </Pressable>
        </Animated.View>
      </View>

      {/* Emergency Type Selection Modal */}
      <Modal
        visible={showEmergencyMenu}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowEmergencyMenu(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.emergencyMenu}>
            <Text style={styles.menuTitle}>Select Emergency Type</Text>
            
            {/* Emergency Options Grid */}
            <View style={styles.emergencyGrid}>
              {emergencyTypes.map((emergency) => (
                <Pressable
                  key={emergency.id}
                  style={[styles.emergencyOption, { backgroundColor: emergency.color }]}
                  onPress={() => handleEmergencySelect(emergency)}
                >
                  <Text style={styles.emergencyIcon}>{emergency.icon}</Text>
                  <Text style={styles.emergencyLabel}>{emergency.label}</Text>
                </Pressable>
              ))}
            </View>
            
            {/* Cancel Button */}
            <Pressable
              style={styles.cancelButton}
              onPress={() => setShowEmergencyMenu(false)}
            >
              <Text style={styles.cancelText}>Cancel</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  confirmationHalo: {
    position: 'absolute',
    width: 280,
    height: 280,
    borderRadius: 140,
    borderWidth: 3,
    borderColor: COLORS.success,
    backgroundColor: COLORS.successOverlay,
  },
  buttonContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  sosButtonWrapper: {
    borderRadius: 120,
    elevation: 12,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
  },
  sosButton: {
    width: 240,
    height: 240,
    borderRadius: 120,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  progressFill: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    borderRadius: 120,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
  },
  sosText: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#FFFFFF',
    textAlign: 'center',
    letterSpacing: 3,
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  instructionText: {
    fontSize: 14,
    color: '#FFFFFF',
    opacity: 0.9,
    marginTop: 8,
    textAlign: 'center',
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  emergencyMenu: {
    backgroundColor: COLORS.surface,
    borderRadius: SIZES.radiusLg,
    padding: SIZES.xl,
    width: width * 0.9,
    maxWidth: 400,
    alignItems: 'center',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  menuTitle: {
    fontSize: SIZES.fontXl,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
    marginBottom: SIZES.lg,
    textAlign: 'center',
  },
  emergencyGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: SIZES.md,
  },
  emergencyOption: {
    width: 110,
    height: 110,
    borderRadius: SIZES.radiusLg,
    alignItems: 'center',
    justifyContent: 'center',
    margin: SIZES.sm,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  emergencyIcon: {
    fontSize: 36,
    marginBottom: 8,
  },
  emergencyLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#FFFFFF',
    textAlign: 'center',
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  cancelButton: {
    marginTop: SIZES.lg,
    paddingVertical: SIZES.md,
    paddingHorizontal: SIZES.xl,
    backgroundColor: COLORS.border,
    borderRadius: SIZES.radiusMd,
  },
  cancelText: {
    fontSize: SIZES.fontMd,
    color: COLORS.textMuted,
    fontWeight: '600',
  },
});

export default SOSButton;
