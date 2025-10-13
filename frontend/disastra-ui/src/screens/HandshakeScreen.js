import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  Pressable,
  Animated,
  Alert,
} from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS, SIZES } from '../constants/theme';

const HandshakeScreen = ({ navigation, route }) => {
  const { userRole = 'user', incidentId = 'INC-001' } = route?.params || {};
  
  const [handshakeState, setHandshakeState] = useState('waiting'); // 'waiting', 'connecting', 'connected', 'en-route', 'arrived'
  const [countdown, setCountdown] = useState(300); // 5 minutes in seconds
  const [responderInfo, setResponderInfo] = useState({
    name: 'Alpha Team - Captain Smith',
    id: 'RSP-007',
    vehicle: '🚑 Ambulance Unit 7',
    eta: '4-6 minutes',
    distance: '2.1 km',
    phone: '+1-555-RESCUE'
  });
  const [userInfo, setUserInfo] = useState({
    name: 'Alex Johnson',
    id: 'USR-001',
    location: 'Sector 11, Building A',
    status: 'Needs Medical Help',
    battery: '67%'
  });

  const progressAnim = new Animated.Value(0);
  const pulseAnim = new Animated.Value(1);

  useEffect(() => {
    // Simulate handshake progression
    const progressTimer = setTimeout(() => {
      if (handshakeState === 'waiting') {
        setHandshakeState('connecting');
        animateProgress(0.3);
        
        setTimeout(() => {
          setHandshakeState('connected');
          animateProgress(0.6);
          startCountdown();
          
          setTimeout(() => {
            setHandshakeState('en-route');
            animateProgress(0.8);
            
            setTimeout(() => {
              setHandshakeState('arrived');
              animateProgress(1.0);
              setCountdown(0);
            }, 240000); // 4 minutes
          }, 30000); // 30 seconds
        }, 5000); // 5 seconds
      }
    }, 2000);

    return () => clearTimeout(progressTimer);
  }, [handshakeState]);

  useEffect(() => {
    // Countdown timer
    if (countdown > 0 && handshakeState === 'connected') {
      const timer = setInterval(() => {
        setCountdown(prev => prev - 1);
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [countdown, handshakeState]);

  useEffect(() => {
    // Pulse animation for connecting state
    if (handshakeState === 'connecting') {
      const pulse = () => {
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.2,
            duration: 800,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 800,
            useNativeDriver: true,
          }),
        ]).start(pulse);
      };
      pulse();
    }
  }, [handshakeState]);

  const animateProgress = (toValue) => {
    Animated.timing(progressAnim, {
      toValue,
      duration: 1000,
      useNativeDriver: false,
    }).start();
  };

  const startCountdown = () => {
    // Reset countdown to ETA
    setCountdown(300); // 5 minutes
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getStateIcon = () => {
    switch (handshakeState) {
      case 'waiting': return '⏳';
      case 'connecting': return '🔄';
      case 'connected': return '✅';
      case 'en-route': return '🚑';
      case 'arrived': return '🎯';
      default: return '📡';
    }
  };

  const getStateMessage = () => {
    switch (handshakeState) {
      case 'waiting': return 'Establishing connection...';
      case 'connecting': return 'Connecting to responder...';
      case 'connected': return 'Connection established!';
      case 'en-route': return 'Responder en route';
      case 'arrived': return 'Responder has arrived!';
      default: return 'Initializing...';
    }
  };

  const handleEmergencyCall = () => {
    Alert.alert(
      '📞 Emergency Call',
      `Call ${responderInfo.name} directly?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Call Now', onPress: () => Alert.alert('Calling...', `Connecting to ${responderInfo.phone}`) }
      ]
    );
  };

  const handleUpdateStatus = () => {
    Alert.alert(
      '📝 Update Status',
      'Send update to responder:',
      [
        { text: 'All Good', onPress: () => Alert.alert('Status Updated', 'Responder notified: All Good') },
        { text: 'Need Help', onPress: () => Alert.alert('Status Updated', 'Responder notified: Need Help') },
        { text: 'Emergency', onPress: () => Alert.alert('Status Updated', 'Emergency alert sent to responder') },
        { text: 'Cancel' }
      ]
    );
  };

  const handleResponderAction = () => {
    if (userRole === 'responder') {
      Alert.alert(
        '🚑 Responder Actions',
        'Choose action:',
        [
          { text: 'Update ETA', onPress: () => Alert.alert('ETA Updated', 'User notified of new arrival time') },
          { text: 'Request Info', onPress: () => Alert.alert('Info Requested', 'Message sent to user for more details') },
          { text: 'Mark Arrived', onPress: () => {
            setHandshakeState('arrived');
            animateProgress(1.0);
            Alert.alert('Arrived', 'User notified of your arrival');
          }},
          { text: 'Cancel' }
        ]
      );
    }
  };

  return (
    <>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.background} />
      <SafeAreaView style={styles.container}>
        <KeyboardAwareScrollView 
          style={styles.scrollContainer}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          enableOnAndroid={true}
          keyboardShouldPersistTaps="handled"
        >
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.headerTitle}>🤝 Emergency Handshake</Text>
            <Text style={styles.headerSubtitle}>
              {userRole === 'responder' ? 'Responding to Emergency' : 'Help is Coming'}
            </Text>
          </View>

          {/* Progress Indicator */}
          <View style={styles.progressSection}>
            <Text style={styles.progressTitle}>Connection Status</Text>
            <View style={styles.progressBar}>
              <Animated.View 
                style={[
                  styles.progressFill, 
                  { 
                    width: progressAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: ['0%', '100%']
                    })
                  }
                ]} 
              />
            </View>
            <View style={styles.progressSteps}>
              <Text style={[styles.stepText, handshakeState !== 'waiting' && styles.stepCompleted]}>
                📡 Connect
              </Text>
              <Text style={[styles.stepText, ['connected', 'en-route', 'arrived'].includes(handshakeState) && styles.stepCompleted]}>
                ✅ Confirm  
              </Text>
              <Text style={[styles.stepText, ['en-route', 'arrived'].includes(handshakeState) && styles.stepCompleted]}>
                🚑 En Route
              </Text>
              <Text style={[styles.stepText, handshakeState === 'arrived' && styles.stepCompleted]}>
                🎯 Arrive
              </Text>
            </View>
          </View>

          {/* Status Card */}
          <Animated.View style={[styles.statusCard, { transform: [{ scale: pulseAnim }] }]}>
            <LinearGradient
              colors={handshakeState === 'arrived' ? [COLORS.success, COLORS.successOverlay] : [COLORS.primary, COLORS.primaryOverlay]}
              style={styles.statusGradient}
            >
              <Text style={styles.statusIcon}>{getStateIcon()}</Text>
              <Text style={styles.statusMessage}>{getStateMessage()}</Text>
              {countdown > 0 && handshakeState === 'connected' && (
                <Text style={styles.countdown}>ETA: {formatTime(countdown)}</Text>
              )}
            </LinearGradient>
          </Animated.View>

          {/* Participant Information */}
          <View style={styles.participantsSection}>
            {userRole === 'user' ? (
              // User view - showing responder info
              <View style={styles.participantCard}>
                <Text style={styles.participantTitle}>🚑 Your Responder</Text>
                <View style={styles.participantInfo}>
                  <Text style={styles.participantName}>{responderInfo.name}</Text>
                  <Text style={styles.participantDetail}>ID: {responderInfo.id}</Text>
                  <Text style={styles.participantDetail}>Vehicle: {responderInfo.vehicle}</Text>
                  <Text style={styles.participantDetail}>Distance: {responderInfo.distance}</Text>
                  <Text style={styles.participantDetail}>ETA: {responderInfo.eta}</Text>
                </View>
              </View>
            ) : (
              // Responder view - showing user info
              <View style={styles.participantCard}>
                <Text style={styles.participantTitle}>👤 Emergency Contact</Text>
                <View style={styles.participantInfo}>
                  <Text style={styles.participantName}>{userInfo.name}</Text>
                  <Text style={styles.participantDetail}>ID: {userInfo.id}</Text>
                  <Text style={styles.participantDetail}>Location: {userInfo.location}</Text>
                  <Text style={styles.participantDetail}>Status: {userInfo.status}</Text>
                  <Text style={styles.participantDetail}>Battery: {userInfo.battery}</Text>
                </View>
              </View>
            )}
          </View>

          {/* Action Buttons */}
          <View style={styles.actionsSection}>
            <Pressable style={styles.actionButton} onPress={handleEmergencyCall}>
              <Text style={styles.actionIcon}>📞</Text>
              <Text style={styles.actionText}>Emergency Call</Text>
            </Pressable>

            <Pressable style={styles.actionButton} onPress={handleUpdateStatus}>
              <Text style={styles.actionIcon}>📝</Text>
              <Text style={styles.actionText}>
                {userRole === 'responder' ? 'Update Response' : 'Update Status'}
              </Text>
            </Pressable>

            {userRole === 'responder' && (
              <Pressable style={styles.actionButton} onPress={handleResponderAction}>
                <Text style={styles.actionIcon}>🚑</Text>
                <Text style={styles.actionText}>Responder Actions</Text>
              </Pressable>
            )}
          </View>

          {/* Live Updates */}
          <View style={styles.updatesSection}>
            <Text style={styles.updatesTitle}>📡 Live Updates</Text>
            <View style={styles.updatesList}>
              <Text style={styles.updateItem}>✅ Emergency signal received</Text>
              <Text style={styles.updateItem}>🔗 Handshake established</Text>
              {handshakeState === 'connected' && (
                <Text style={styles.updateItem}>📍 Responder location shared</Text>
              )}
              {handshakeState === 'en-route' && (
                <Text style={styles.updateItem}>🚑 Responder dispatched</Text>
              )}
              {handshakeState === 'arrived' && (
                <Text style={styles.updateItem}>🎯 Responder arrived on scene</Text>
              )}
            </View>
          </View>
        </KeyboardAwareScrollView>
      </SafeAreaView>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scrollContainer: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    padding: SIZES.lg,
  },
  header: {
    alignItems: 'center',
    marginBottom: SIZES.xl,
  },
  headerTitle: {
    fontSize: SIZES.fontXl,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
    textAlign: 'center',
    marginBottom: SIZES.xs,
  },
  headerSubtitle: {
    fontSize: SIZES.fontMd,
    color: COLORS.textSecondary,
    textAlign: 'center',
  },
  progressSection: {
    backgroundColor: COLORS.surface,
    borderRadius: SIZES.radiusLg,
    padding: SIZES.lg,
    marginBottom: SIZES.xl,
    elevation: 2,
  },
  progressTitle: {
    fontSize: SIZES.fontLg,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
    textAlign: 'center',
    marginBottom: SIZES.md,
  },
  progressBar: {
    height: 8,
    backgroundColor: COLORS.border,
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: SIZES.md,
  },
  progressFill: {
    height: '100%',
    backgroundColor: COLORS.primary,
  },
  progressSteps: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  stepText: {
    fontSize: SIZES.fontSm,
    color: COLORS.textMuted,
    fontWeight: '500',
  },
  stepCompleted: {
    color: COLORS.primary,
    fontWeight: 'bold',
  },
  statusCard: {
    marginBottom: SIZES.xl,
  },
  statusGradient: {
    borderRadius: SIZES.radiusLg,
    padding: SIZES.xl,
    alignItems: 'center',
    elevation: 4,
  },
  statusIcon: {
    fontSize: 48,
    marginBottom: SIZES.md,
  },
  statusMessage: {
    fontSize: SIZES.fontLg,
    fontWeight: 'bold',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: SIZES.sm,
  },
  countdown: {
    fontSize: SIZES.fontXl,
    fontWeight: 'bold',
    color: '#FFFFFF',
    textAlign: 'center',
    fontFamily: 'monospace',
  },
  participantsSection: {
    marginBottom: SIZES.xl,
  },
  participantCard: {
    backgroundColor: COLORS.surface,
    borderRadius: SIZES.radiusMd,
    padding: SIZES.lg,
    elevation: 1,
  },
  participantTitle: {
    fontSize: SIZES.fontMd,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
    marginBottom: SIZES.md,
  },
  participantInfo: {
    gap: SIZES.xs,
  },
  participantName: {
    fontSize: SIZES.fontLg,
    fontWeight: 'bold',
    color: COLORS.primary,
  },
  participantDetail: {
    fontSize: SIZES.fontSm,
    color: COLORS.textSecondary,
  },
  actionsSection: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SIZES.md,
    marginBottom: SIZES.xl,
  },
  actionButton: {
    backgroundColor: COLORS.surface,
    flex: 1,
    minWidth: '45%',
    alignItems: 'center',
    padding: SIZES.lg,
    borderRadius: SIZES.radiusMd,
    elevation: 1,
  },
  actionIcon: {
    fontSize: 24,
    marginBottom: SIZES.sm,
  },
  actionText: {
    fontSize: SIZES.fontSm,
    fontWeight: '600',
    color: COLORS.textPrimary,
    textAlign: 'center',
  },
  updatesSection: {
    backgroundColor: COLORS.surface,
    borderRadius: SIZES.radiusMd,
    padding: SIZES.lg,
    elevation: 1,
  },
  updatesTitle: {
    fontSize: SIZES.fontMd,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
    marginBottom: SIZES.md,
  },
  updatesList: {
    gap: SIZES.xs,
  },
  updateItem: {
    fontSize: SIZES.fontSm,
    color: COLORS.textSecondary,
    paddingLeft: SIZES.md,
  },
});

export default HandshakeScreen;