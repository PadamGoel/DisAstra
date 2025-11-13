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

const SOSButton = ({ onSOSActivated, sosStatus, onResetSOS }) => {
  const [isPressed, setIsPressed] = useState(false);
  const [showEmergencyMenu, setShowEmergencyMenu] = useState(false);
  const [pressTimer, setPressTimer] = useState(null);
  
  // Animations
  const breathingAnim = useRef(new Animated.Value(1)).current;
  const progressAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const haloAnim = useRef(new Animated.Value(0)).current;

  // Breathing Animation - Light Mode
  useEffect(() => {
    let breathingLoop;
    
    if (sosStatus === 'idle') {
      // Gentle breathing animation for idle state
      breathingLoop = Animated.loop(
        Animated.sequence([
          Animated.timing(breathingAnim, {
            toValue: 1.08,
            duration: 1500,
            useNativeDriver: true,
          }),
          Animated.timing(breathingAnim, {
            toValue: 1,
            duration: 1500,
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
            duration: 400,
            useNativeDriver: true,
          }),
          Animated.timing(breathingAnim, {
            toValue: 1,
            duration: 400,
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
            duration: 2000,
            useNativeDriver: true,
          }),
          Animated.timing(breathingAnim, {
            toValue: 1,
            duration: 2000,
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

  // Confirmation Halo Animation
  useEffect(() => {
    if (sosStatus === 'sent') {
      Animated.loop(
        Animated.sequence([
          Animated.timing(haloAnim, {
            toValue: 1,
            duration: 1500,
            useNativeDriver: true,
          }),
          Animated.timing(haloAnim, {
            toValue: 0.3,
            duration: 1500,
            useNativeDriver: true,
          }),
        ])
      ).start();
    } else {
      haloAnim.setValue(0);
    }
  }, [sosStatus, haloAnim]);

  const handlePressIn = () => {
    if (sosStatus !== 'idle') return;
    
    setIsPressed(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    
    // Scale down animation
    Animated.spring(scaleAnim, {
      toValue: 0.95,
      useNativeDriver: true,
    }).start();
    
    // Start progress animation for long press
    const timer = setTimeout(() => {
      // Long press detected - show emergency menu
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
      setShowEmergencyMenu(true);
    }, 1000); // 1 second long press
    
    setPressTimer(timer);
    
    // Progress fill animation
    Animated.timing(progressAnim, {
      toValue: 1,
      duration: 1000,
      useNativeDriver: false,
    }).start();
  };

  const handlePressOut = () => {
    setIsPressed(false);
    
    // Scale back up
    Animated.spring(scaleAnim, {
      toValue: 1,
      useNativeDriver: true,
    }).start();
    
    // Clear timer
    if (pressTimer) {
      clearTimeout(pressTimer);
      setPressTimer(null);
    }
    
    // Reset progress
    Animated.timing(progressAnim, {
      toValue: 0,
      duration: 200,
      useNativeDriver: false,
    }).start();
  };

  const handleEmergencySelect = (emergencyType) => {
    setShowEmergencyMenu(false);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    onSOSActivated(emergencyType);
  };

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

  const emergencyTypes = [
    { id: 'medical', icon: '🚑', label: 'Medical', color: COLORS.emergency },
    { id: 'fire', icon: '🔥', label: 'Fire', color: '#FF6F00' },
    { id: 'trapped', icon: '🧱', label: 'Trapped', color: '#7B1FA2' },
    { id: 'unsafe', icon: '☣️', label: 'Unsafe Area', color: '#F57C00' },
  ];

  return (
    <>
      <View style={styles.container}>
        {/* Confirmation Halo */}
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
              {/* Progress Fill */}
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
              
              <Text style={styles.sosText}>{getButtonText()}</Text>
              
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