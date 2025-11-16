/**
 * HomeScreen.jsx
 * DISASTRA — Home screen (non-functional refactor)
 * - Added file header and constants for readability/maintainability
 * - Extracted repeated magic numbers into named constants (no behavior change)
 * - Added small inline comments to clarify flows
 *
 * Author: Chakshit Bansal (suggested)
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  Modal,
  TextInput,
  Pressable,
  ScrollView,
  Animated,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { LinearGradient } from 'expo-linear-gradient';
import SOSButton from '../components/SOSButton';
import { COLORS, SIZES } from '../constants/theme';

/* ---------------------------
   Named defaults & constants
   (Values identical to original; only renamed for clarity)
   --------------------------- */
const DEFAULT_COORDINATES = { lat: 40.7128, lng: -74.0060, altitude: 15 };
const DEFAULT_BATTERY = 82;
const DEFAULT_DEVICE_ID = 'DISASTRA-USER-001';

const ANIMATIONS = {
  fadeInDurationMs: 500,
};

const MOCK_TIMEOUTS = {
  sendSimulationMs: 2500,
  responderAckMs: 3000,
};

const STORAGE_KEYS = {
  sosHistory: 'sosHistory',
};

const INITIAL_SOS_DATA = {
  timestamp: null,
  coordinates: DEFAULT_COORDINATES,
  battery: DEFAULT_BATTERY,
  deviceId: DEFAULT_DEVICE_ID,
};

const INITIAL_UPDATE_FORM = {
  disasterType: '',
  peopleCount: '',
  supplies: [],
  additionalInfo: '',
};

const EMPTY_HISTORY = {
  type: '',
  people: '',
  supplies: [],
  location: '',
  time: '',
  hasUpdate: false,
};

const supplyOptions = [
  'Medical Supplies', 'Food & Water', 'Shelter Materials',
  'Rescue Equipment', 'Communication', 'Transportation'
];

const disasterTypes = [
  'Medical Emergency', 'Fire', 'Flood', 'Earthquake',
  'Building Collapse', 'Gas Leak', 'Chemical Spill', 'Other'
];

/* ---------------------------
   HomeScreen Component
   --------------------------- */
const HomeScreen = ({ navigation }) => {
  const [sosStatus, setSOSStatus] = useState('idle'); // 'idle', 'sending', 'sent'
  const [selectedEmergencyType, setSelectedEmergencyType] = useState(null);
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [sosData, setSOSData] = useState(INITIAL_SOS_DATA);
  const [updateForm, setUpdateForm] = useState(INITIAL_UPDATE_FORM);

  // SOS Status History for permanent display
  const [sosHistory, setSOSHistory] = useState(EMPTY_HISTORY);

  // Animation for confirmation message
  const fadeAnim = new Animated.Value(0);

  // Load SOS history on component mount
  useEffect(() => {
    loadSOSHistory();
  }, []);

  // Fade-in when sosStatus becomes 'sent'
  useEffect(() => {
    if (sosStatus === 'sent') {
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: ANIMATIONS.fadeInDurationMs,
        useNativeDriver: true,
      }).start();
    }
  }, [sosStatus]);

  const loadSOSHistory = async () => {
    try {
      const savedHistory = await AsyncStorage.getItem(STORAGE_KEYS.sosHistory);
      if (savedHistory) {
        setSOSHistory(JSON.parse(savedHistory));
      }
    } catch (error) {
      console.log('Error loading SOS history:', error);
    }
  };

  const saveSOSHistory = async (historyData) => {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.sosHistory, JSON.stringify(historyData));
      setSOSHistory(historyData);
    } catch (error) {
      console.log('Error saving SOS history:', error);
    }
  };

  const handleSOSActivated = (emergencyType) => {
    // Keep same logic — mark selected type and simulate send
    setSelectedEmergencyType(emergencyType);
    setSOSStatus('sending');
    setSOSData(prev => ({
      ...prev,
      timestamp: new Date().toISOString(),
    }));

    // Simulate sending process with mock ETA updates (timeouts unchanged)
    setTimeout(() => {
      setSOSStatus('sent');
      // Mock responder acknowledgment after responderAckMs
      setTimeout(() => {
        // Placeholder for possible ETA/responder updates (no-op)
      }, MOCK_TIMEOUTS.responderAckMs);
    }, MOCK_TIMEOUTS.sendSimulationMs);
  };

  const handleAddMoreInfo = () => {
    setShowUpdateModal(true);
  };

  const handleUpdateSOS = () => {
    setShowUpdateModal(false);

    // Create SOS history update (preserve original logic/format)
    const newSOSHistory = {
      type: updateForm.disasterType || selectedEmergencyType?.label || 'Emergency',
      people: updateForm.peopleCount || '1',
      supplies: updateForm.supplies,
      location: `${sosData.coordinates.lat.toFixed(4)}, ${sosData.coordinates.lng.toFixed(4)}`,
      time: new Date(sosData.timestamp).toLocaleString(),
      hasUpdate: true,
    };

    // Save to local storage
    saveSOSHistory(newSOSHistory);

    // Mock update - in real app would send to backend
    console.log('SOS Updated:', updateForm, newSOSHistory);
  };

  const toggleSupply = (supply) => {
    setUpdateForm(prev => ({
      ...prev,
      supplies: prev.supplies.includes(supply)
        ? prev.supplies.filter(s => s !== supply)
        : [...prev.supplies, supply]
    }));
  };

  const resetSOS = () => {
    setSOSStatus('idle');
    setSelectedEmergencyType(null);
    setUpdateForm(INITIAL_UPDATE_FORM);

    // Clear SOS history from storage
    saveSOSHistory(EMPTY_HISTORY);

    fadeAnim.setValue(0);
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

        {/* Clean, centered main content */}
        <View style={styles.mainContent}>

          {/* SOS Button - Large and Centered */}
          <View style={styles.sosContainer}>
            <SOSButton
              onSOSActivated={handleSOSActivated}
              sosStatus={sosStatus}
              onResetSOS={resetSOS}
            />
          </View>

          {/* Permanent SOS Update Display */}
          <View style={styles.sosUpdateSection}>
            <Text style={styles.sosUpdateTitle}>📋 SOS Information</Text>
            {sosHistory.hasUpdate ? (
              <View style={styles.sosUpdateContent}>
                <View style={styles.sosUpdateRow}>
                  <Text style={styles.sosUpdateLabel}>Type:</Text>
                  <Text style={styles.sosUpdateValue}>{sosHistory.type}</Text>
                </View>
                <View style={styles.sosUpdateRow}>
                  <Text style={styles.sosUpdateLabel}>People:</Text>
                  <Text style={styles.sosUpdateValue}>{sosHistory.people} person(s)</Text>
                </View>
                <View style={styles.sosUpdateRow}>
                  <Text style={styles.sosUpdateLabel}>Supplies:</Text>
                  <Text style={styles.sosUpdateValue}>
                    {sosHistory.supplies.length > 0 ? sosHistory.supplies.join(', ') : 'None specified'}
                  </Text>
                </View>
                <View style={styles.sosUpdateRow}>
                  <Text style={styles.sosUpdateLabel}>Location:</Text>
                  <Text style={styles.sosUpdateValue}>{sosHistory.location}</Text>
                </View>
                <View style={styles.sosUpdateRow}>
                  <Text style={styles.sosUpdateLabel}>Time:</Text>
                  <Text style={styles.sosUpdateValue}>{sosHistory.time}</Text>
                </View>
                <Pressable
                  style={styles.editInfoButton}
                  onPress={() => setShowUpdateModal(true)}
                >
                  <Text style={styles.editInfoText}>✏️ Edit Information</Text>
                </Pressable>
              </View>
            ) : (
              <View style={styles.sosUpdateEmpty}>
                <Text style={styles.sosUpdateEmptyText}>
                  No SOS information saved yet.
                </Text>
                <Pressable
                  style={styles.addInfoButtonEmpty}
                  onPress={() => setShowUpdateModal(true)}
                >
                  <Text style={styles.addInfoTextEmpty}>➕ Add SOS Details</Text>
                </Pressable>
              </View>
            )}
          </View>

          {/* Confirmation Message - Only after SOS sent */}
          {sosStatus === 'sent' && (
            <Animated.View style={[styles.confirmationContainer, { opacity: fadeAnim }]}>
              <LinearGradient
                colors={[COLORS.successOverlay, 'transparent']}
                style={styles.confirmationGradient}
              >
                <Text style={styles.confirmationText}>Help is on the way ✅</Text>
                <Text style={styles.confirmationSubtext}>
                  Emergency: {selectedEmergencyType?.label}
                </Text>
                <Text style={styles.etaText}>
                  Signal sent at {new Date(sosData.timestamp).toLocaleTimeString()}
                </Text>

                <View style={styles.sosDataContainer}>
                  <Text style={styles.sosDataText}>
                    📍 {sosData.coordinates.lat.toFixed(6)}, {sosData.coordinates.lng.toFixed(6)}
                  </Text>
                  <Text style={styles.sosDataText}>
                    🔋 Battery: {sosData.battery}% • ⛰️ Altitude: {sosData.coordinates.altitude}m
                  </Text>
                </View>

                <View style={styles.actionButtons}>
                  <Pressable
                    style={styles.handshakeButton}
                    onPress={() => navigation.navigate('Handshake', { userRole: 'user', incidentId: 'INC-001' })}
                  >
                    <Text style={styles.handshakeText}>🤝 Connect to Responder</Text>
                  </Pressable>

                  <Pressable
                    style={styles.addInfoButton}
                    onPress={handleAddMoreInfo}
                  >
                    <Text style={styles.addInfoText}>➕ Add More Info</Text>
                  </Pressable>

                  <Pressable
                    style={styles.resetButton}
                    onPress={resetSOS}
                  >
                    <Text style={styles.resetText}>Reset</Text>
                  </Pressable>
                </View>
              </LinearGradient>
            </Animated.View>
          )}

          {/* Mock ETA Updates */}
          {sosStatus === 'sent' && (
            <View style={styles.etaUpdatesContainer}>
              <Text style={styles.etaTitle}>🚨 Live Updates</Text>
              <Text style={styles.etaUpdate}>✅ Signal received by Rescue Team</Text>
              <Text style={styles.etaUpdate}>📡 Responder Team #7 dispatched</Text>
              <Text style={styles.etaUpdate}>🕐 Estimated arrival: 4-6 minutes</Text>
            </View>
          )}
        </View>

        {/* Additional Information Modal */}
        <Modal
          visible={showUpdateModal}
          transparent={true}
          animationType="slide"
          onRequestClose={() => setShowUpdateModal(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.updateModal}>
              <ScrollView showsVerticalScrollIndicator={false}>
                <Text style={styles.modalTitle}>Update SOS Information</Text>

                {/* Disaster Type Selection */}
                <View style={styles.formSection}>
                  <Text style={styles.formLabel}>Disaster Type</Text>
                  <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                    <View style={styles.disasterTypesContainer}>
                      {disasterTypes.map((type) => (
                        <Pressable
                          key={type}
                          style={[
                            styles.disasterTypeTag,
                            updateForm.disasterType === type && styles.disasterTypeTagSelected
                          ]}
                          onPress={() => setUpdateForm(prev => ({...prev, disasterType: type}))}
                        >
                          <Text style={[
                            styles.disasterTypeText,
                            updateForm.disasterType === type && styles.disasterTypeTextSelected
                          ]}>
                            {type}
                          </Text>
                        </Pressable>
                      ))}
                    </View>
                  </ScrollView>
                </View>

                {/* Number of People */}
                <View style={styles.formSection}>
                  <Text style={styles.formLabel}>Number of People</Text>
                  <TextInput
                    style={styles.textInput}
                    placeholder="How many people need help?"
                    placeholderTextColor={COLORS.textMuted}
                    value={updateForm.peopleCount}
                    onChangeText={(text) => setUpdateForm(prev => ({...prev, peopleCount: text}))}
                    keyboardType="numeric"
                  />
                </View>

                {/* Emergency Supplies */}
                <View style={styles.formSection}>
                  <Text style={styles.formLabel}>Emergency Supplies Required</Text>
                  <View style={styles.suppliesGrid}>
                    {supplyOptions.map((supply) => (
                      <Pressable
                        key={supply}
                        style={[
                          styles.supplyTag,
                          updateForm.supplies.includes(supply) && styles.supplyTagSelected
                        ]}
                        onPress={() => toggleSupply(supply)}
                      >
                        <Text style={[
                          styles.supplyText,
                          updateForm.supplies.includes(supply) && styles.supplyTextSelected
                        ]}>
                          {supply}
                        </Text>
                      </Pressable>
                    ))}
                  </View>
                </View>

                {/* Additional Information */}
                <View style={styles.formSection}>
                  <Text style={styles.formLabel}>Additional Information</Text>
                  <TextInput
                    style={[styles.textInput, styles.textArea]}
                    placeholder="Describe your situation in detail..."
                    placeholderTextColor={COLORS.textMuted}
                    value={updateForm.additionalInfo}
                    onChangeText={(text) => setUpdateForm(prev => ({...prev, additionalInfo: text}))}
                    multiline
                    numberOfLines={4}
                  />
                </View>

                {/* Action Buttons */}
                <View style={styles.modalButtons}>
                  <Pressable
                    style={styles.updateSOSButton}
                    onPress={handleUpdateSOS}
                  >
                    <Text style={styles.updateSOSButtonText}>Update SOS</Text>
                  </Pressable>

                  <Pressable
                    style={styles.cancelModalButton}
                    onPress={() => setShowUpdateModal(false)}
                  >
                    <Text style={styles.cancelModalText}>Cancel</Text>
                  </Pressable>
                </View>
              </ScrollView>
            </View>
          </View>
        </Modal>
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
  },
  mainContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: SIZES.lg,
  },
  sosContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SIZES.xl,
  },
  sosUpdateSection: {
    width: '100%',
    maxWidth: 400,
    backgroundColor: COLORS.surface,
    borderRadius: SIZES.radiusLg,
    padding: SIZES.lg,
    marginBottom: SIZES.xl,
    elevation: 2,
  },
  sosUpdateTitle: {
    fontSize: SIZES.fontLg,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
    textAlign: 'center',
    marginBottom: SIZES.md,
  },
  sosUpdateContent: {
    gap: SIZES.sm,
  },
  sosUpdateRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingVertical: SIZES.xs,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderLight,
  },
  sosUpdateLabel: {
    fontSize: SIZES.fontMd,
    fontWeight: '600',
    color: COLORS.textSecondary,
    flex: 1,
  },
  sosUpdateValue: {
    fontSize: SIZES.fontMd,
    color: COLORS.textPrimary,
    flex: 2,
    textAlign: 'right',
  },
  editInfoButton: {
    backgroundColor: COLORS.primary,
    paddingVertical: SIZES.md,
    paddingHorizontal: SIZES.lg,
    borderRadius: SIZES.radiusMd,
    alignItems: 'center',
    marginTop: SIZES.md,
  },
  editInfoText: {
    color: '#FFFFFF',
    fontSize: SIZES.fontMd,
    fontWeight: '600',
  },
  sosUpdateEmpty: {
    alignItems: 'center',
    paddingVertical: SIZES.md,
  },
  sosUpdateEmptyText: {
    fontSize: SIZES.fontMd,
    color: COLORS.textMuted,
    textAlign: 'center',
    marginBottom: SIZES.md,
  },
  addInfoButtonEmpty: {
    backgroundColor: COLORS.border,
    paddingVertical: SIZES.md,
    paddingHorizontal: SIZES.lg,
    borderRadius: SIZES.radiusMd,
    alignItems: 'center',
  },
  addInfoTextEmpty: {
    color: COLORS.textSecondary,
    fontSize: SIZES.fontMd,
    fontWeight: '500',
  },
  confirmationContainer: {
    width: '100%',
    maxWidth: 400,
    marginTop: SIZES.xl,
  },
  confirmationGradient: {
    padding: SIZES.lg,
    borderRadius: SIZES.radiusLg,
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    elevation: 4,
    shadowColor: COLORS.success,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
  },
  confirmationText: {
    fontSize: SIZES.fontXl,
    fontWeight: 'bold',
    color: COLORS.success,
    textAlign: 'center',
    marginBottom: SIZES.sm,
  },
  confirmationSubtext: {
    fontSize: SIZES.fontMd,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginBottom: SIZES.sm,
  },
  etaText: {
    fontSize: SIZES.fontSm,
    color: COLORS.textMuted,
    textAlign: 'center',
    marginBottom: SIZES.md,
  },
  sosDataContainer: {
    backgroundColor: COLORS.background,
    padding: SIZES.md,
    borderRadius: SIZES.radiusMd,
    marginBottom: SIZES.md,
    width: '100%',
  },
  sosDataText: {
    fontSize: SIZES.fontSm,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginBottom: SIZES.xs,
    fontFamily: 'monospace',
  },
  actionButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SIZES.md,
  },
  handshakeButton: {
    backgroundColor: COLORS.success,
    paddingHorizontal: SIZES.lg,
    paddingVertical: SIZES.md,
    borderRadius: SIZES.radiusMd,
    elevation: 2,
    flex: 1,
    minWidth: '100%',
    marginBottom: SIZES.sm,
  },
  handshakeText: {
    color: '#FFFFFF',
    fontSize: SIZES.fontMd,
    fontWeight: '600',
    textAlign: 'center',
  },
  addInfoButton: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: SIZES.lg,
    paddingVertical: SIZES.md,
    borderRadius: SIZES.radiusMd,
    elevation: 2,
  },
  addInfoText: {
    color: '#FFFFFF',
    fontSize: SIZES.fontMd,
    fontWeight: '600',
  },
  resetButton: {
    backgroundColor: COLORS.border,
    paddingHorizontal: SIZES.lg,
    paddingVertical: SIZES.md,
    borderRadius: SIZES.radiusMd,
  },
  resetText: {
    color: COLORS.textMuted,
    fontSize: SIZES.fontMd,
    fontWeight: '500',
  },
  etaUpdatesContainer: {
    marginTop: SIZES.xl,
    backgroundColor: COLORS.surface,
    padding: SIZES.lg,
    borderRadius: SIZES.radiusLg,
    width: '100%',
    maxWidth: 400,
    elevation: 2,
  },
  etaTitle: {
    fontSize: SIZES.fontMd,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
    marginBottom: SIZES.sm,
    textAlign: 'center',
  },
  etaUpdate: {
    fontSize: SIZES.fontSm,
    color: COLORS.textSecondary,
    marginBottom: SIZES.xs,
    paddingLeft: SIZES.md,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'flex-end',
  },
  updateModal: {
    backgroundColor: COLORS.surface,
    borderTopLeftRadius: SIZES.radiusLg,
    borderTopRightRadius: SIZES.radiusLg,
    padding: SIZES.xl,
    maxHeight: '90%',
  },
  modalTitle: {
    fontSize: SIZES.fontXl,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
    textAlign: 'center',
    marginBottom: SIZES.xl,
  },
  formSection: {
    marginBottom: SIZES.lg,
  },
  formLabel: {
    fontSize: SIZES.fontMd,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginBottom: SIZES.sm,
  },
  disasterTypesContainer: {
    flexDirection: 'row',
    gap: SIZES.sm,
  },
  disasterTypeTag: {
    backgroundColor: COLORS.border,
    paddingHorizontal: SIZES.md,
    paddingVertical: SIZES.sm,
    borderRadius: SIZES.radiusMd,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
  },
  disasterTypeTagSelected: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  disasterTypeText: {
    color: COLORS.textSecondary,
    fontSize: SIZES.fontSm,
    fontWeight: '600',
    whiteSpace: 'nowrap',
  },
  disasterTypeTextSelected: {
    color: '#FFFFFF',
  },
  textInput: {
    backgroundColor: COLORS.surface,
    borderRadius: SIZES.radiusMd,
    padding: SIZES.md,
    color: COLORS.textPrimary,
    fontSize: SIZES.fontMd,
    minHeight: 50,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  textArea: {
    minHeight: 100,
    textAlignVertical: 'top',
  },
  suppliesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SIZES.sm,
  },
  supplyTag: {
    backgroundColor: COLORS.border,
    paddingHorizontal: SIZES.md,
    paddingVertical: SIZES.sm,
    borderRadius: SIZES.radiusMd,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
  },
  supplyTagSelected: {
    backgroundColor: COLORS.success,
    borderColor: COLORS.success,
  },
  supplyText: {
    color: COLORS.textSecondary,
    fontSize: SIZES.fontSm,
    fontWeight: '500',
  },
  supplyTextSelected: {
    color: '#FFFFFF',
  },
  modalButtons: {
    marginTop: SIZES.xl,
    gap: SIZES.md,
  },
  updateSOSButton: {
    backgroundColor: COLORS.primary,
    paddingVertical: SIZES.md,
    borderRadius: SIZES.radiusMd,
    alignItems: 'center',
    elevation: 2,
  },
  updateSOSButtonText: {
    color: '#FFFFFF',
    fontSize: SIZES.fontMd,
    fontWeight: 'bold',
  },
  cancelModalButton: {
    backgroundColor: COLORS.border,
    paddingVertical: SIZES.md,
    borderRadius: SIZES.radiusMd,
    alignItems: 'center',
  },
  cancelModalText: {
    color: COLORS.textMuted,
    fontSize: SIZES.fontMd,
    fontWeight: '500',
  },
});

export default HomeScreen;
