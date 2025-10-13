import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  Pressable,
  Alert,
  Switch,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { COLORS, SIZES } from '../constants/theme';

const SettingsScreen = ({ onLogout, userProfile }) => {
  const [settings, setSettings] = useState({
    notifications: true,
    emergencyAlerts: true,
    locationSharing: true,
    soundAlerts: true,
    vibration: true,
    darkMode: false,
    language: 'English',
  });

  // Load settings on mount
  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const savedSettings = await AsyncStorage.getItem('userSettings');
      if (savedSettings) {
        setSettings(JSON.parse(savedSettings));
      }
    } catch (error) {
      console.log('Error loading settings:', error);
    }
  };

  const saveSettings = async (newSettings) => {
    try {
      await AsyncStorage.setItem('userSettings', JSON.stringify(newSettings));
      setSettings(newSettings);
    } catch (error) {
      console.log('Error saving settings:', error);
    }
  };

  const toggleSetting = (key) => {
    const newSettings = { ...settings, [key]: !settings[key] };
    saveSettings(newSettings);
  };

  const handleLanguageChange = () => {
    Alert.alert(
      'Language Selection',
      'Choose your preferred language:',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'English', onPress: () => updateLanguage('English') },
        { text: 'Hindi', onPress: () => updateLanguage('Hindi') },
        { text: 'Spanish', onPress: () => updateLanguage('Spanish') },
      ]
    );
  };

  const updateLanguage = (language) => {
    const newSettings = { ...settings, language };
    saveSettings(newSettings);
  };

  const handleEmergencyContacts = () => {
    Alert.alert(
      'Emergency Contacts',
      'Manage your trusted emergency contacts:',
      [
        { text: 'Add Contact', onPress: () => Alert.alert('Feature', 'Add Contact functionality would be implemented here') },
        { text: 'View Contacts', onPress: () => Alert.alert('Feature', 'View Contacts functionality would be implemented here') },
        { text: 'Close' },
      ]
    );
  };

  const handleDataExport = () => {
    Alert.alert(
      'Export Data',
      'Export your SOS history and settings:',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Export', onPress: () => Alert.alert('Success', 'Data exported successfully!') },
      ]
    );
  };

  const handlePrivacySettings = () => {
    Alert.alert(
      'Privacy & Security',
      'Manage your privacy settings:',
      [
        { text: 'Data Sharing', onPress: () => Alert.alert('Feature', 'Data Sharing settings would be implemented here') },
        { text: 'Location Privacy', onPress: () => Alert.alert('Feature', 'Location Privacy settings would be implemented here') },
        { text: 'Close' },
      ]
    );
  };

  const confirmLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout? This will clear your session.',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Logout', style: 'destructive', onPress: onLogout }
      ]
    );
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
            <Text style={styles.headerTitle}>⚙️ Settings</Text>
            <Text style={styles.headerSubtitle}>Manage your preferences and account</Text>
          </View>

          {/* Profile Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>👤 Profile Information</Text>
            <View style={styles.profileCard}>
              <View style={styles.profileRow}>
                <Text style={styles.profileLabel}>Name:</Text>
                <Text style={styles.profileValue}>{userProfile?.name || 'User Name'}</Text>
              </View>
              <View style={styles.profileRow}>
                <Text style={styles.profileLabel}>Email:</Text>
                <Text style={styles.profileValue}>{userProfile?.email || 'user@example.com'}</Text>
              </View>
              <View style={styles.profileRow}>
                <Text style={styles.profileLabel}>Role:</Text>
                <Text style={[styles.profileValue, styles.roleValue]}>
                  {userProfile?.role === 'responder' ? '🚑 Responder' : '👤 User'}
                </Text>
              </View>
              <View style={styles.profileRow}>
                <Text style={styles.profileLabel}>User ID:</Text>
                <Text style={styles.profileValue}>{userProfile?.id || 'USR-001'}</Text>
              </View>
            </View>
          </View>

          {/* Notification Settings */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>🔔 Notifications</Text>
            <View style={styles.settingCard}>
              <View style={styles.settingRow}>
                <View style={styles.settingInfo}>
                  <Text style={styles.settingLabel}>Emergency Alerts</Text>
                  <Text style={styles.settingDescription}>Receive critical emergency notifications</Text>
                </View>
                <Switch
                  value={settings.emergencyAlerts}
                  onValueChange={() => toggleSetting('emergencyAlerts')}
                  trackColor={{ false: COLORS.border, true: COLORS.success }}
                  thumbColor={settings.emergencyAlerts ? '#FFFFFF' : '#FFFFFF'}
                />
              </View>
              
              <View style={styles.settingRow}>
                <View style={styles.settingInfo}>
                  <Text style={styles.settingLabel}>Sound Alerts</Text>
                  <Text style={styles.settingDescription}>Play sound for notifications</Text>
                </View>
                <Switch
                  value={settings.soundAlerts}
                  onValueChange={() => toggleSetting('soundAlerts')}
                  trackColor={{ false: COLORS.border, true: COLORS.success }}
                  thumbColor={settings.soundAlerts ? '#FFFFFF' : '#FFFFFF'}
                />
              </View>

              <View style={styles.settingRow}>
                <View style={styles.settingInfo}>
                  <Text style={styles.settingLabel}>Vibration</Text>
                  <Text style={styles.settingDescription}>Vibrate for important alerts</Text>
                </View>
                <Switch
                  value={settings.vibration}
                  onValueChange={() => toggleSetting('vibration')}
                  trackColor={{ false: COLORS.border, true: COLORS.success }}
                  thumbColor={settings.vibration ? '#FFFFFF' : '#FFFFFF'}
                />
              </View>
            </View>
          </View>

          {/* Privacy & Security */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>🔒 Privacy & Security</Text>
            <View style={styles.settingCard}>
              <View style={styles.settingRow}>
                <View style={styles.settingInfo}>
                  <Text style={styles.settingLabel}>Location Sharing</Text>
                  <Text style={styles.settingDescription}>Share location during emergencies</Text>
                </View>
                <Switch
                  value={settings.locationSharing}
                  onValueChange={() => toggleSetting('locationSharing')}
                  trackColor={{ false: COLORS.border, true: COLORS.success }}
                  thumbColor={settings.locationSharing ? '#FFFFFF' : '#FFFFFF'}
                />
              </View>

              <Pressable style={styles.actionRow} onPress={handlePrivacySettings}>
                <Text style={styles.actionLabel}>🛡️ Privacy Settings</Text>
                <Text style={styles.actionArrow}>›</Text>
              </Pressable>
            </View>
          </View>

          {/* App Preferences */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>🎨 App Preferences</Text>
            <View style={styles.settingCard}>
              <View style={styles.settingRow}>
                <View style={styles.settingInfo}>
                  <Text style={styles.settingLabel}>Dark Mode</Text>
                  <Text style={styles.settingDescription}>Enable dark theme</Text>
                </View>
                <Switch
                  value={settings.darkMode}
                  onValueChange={() => toggleSetting('darkMode')}
                  trackColor={{ false: COLORS.border, true: COLORS.success }}
                  thumbColor={settings.darkMode ? '#FFFFFF' : '#FFFFFF'}
                />
              </View>

              <Pressable style={styles.actionRow} onPress={handleLanguageChange}>
                <View style={styles.settingInfo}>
                  <Text style={styles.actionLabel}>🌍 Language</Text>
                  <Text style={styles.settingDescription}>{settings.language}</Text>
                </View>
                <Text style={styles.actionArrow}>›</Text>
              </Pressable>
            </View>
          </View>

          {/* Data & Storage */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>📊 Data & Storage</Text>
            <View style={styles.settingCard}>
              <Pressable style={styles.actionRow} onPress={handleDataExport}>
                <Text style={styles.actionLabel}>📤 Export Data</Text>
                <Text style={styles.actionArrow}>›</Text>
              </Pressable>

              <Pressable style={styles.actionRow} onPress={handleEmergencyContacts}>
                <Text style={styles.actionLabel}>📞 Emergency Contacts</Text>
                <Text style={styles.actionArrow}>›</Text>
              </Pressable>
            </View>
          </View>

          {/* Support & About */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>❓ Support & About</Text>
            <View style={styles.settingCard}>
              <Pressable style={styles.actionRow} onPress={() => Alert.alert('Help', 'Help documentation would be displayed here')}>
                <Text style={styles.actionLabel}>📖 Help & Support</Text>
                <Text style={styles.actionArrow}>›</Text>
              </Pressable>

              <Pressable style={styles.actionRow} onPress={() => Alert.alert('About', 'DISASTRA v1.0\nEmergency Response Platform')}>
                <Text style={styles.actionLabel}>ℹ️ About DISASTRA</Text>
                <Text style={styles.actionArrow}>›</Text>
              </Pressable>

              <Pressable style={styles.actionRow} onPress={() => Alert.alert('Terms', 'Terms of Service would be displayed here')}>
                <Text style={styles.actionLabel}>📄 Terms & Privacy</Text>
                <Text style={styles.actionArrow}>›</Text>
              </Pressable>
            </View>
          </View>

          {/* Logout Button */}
          <View style={styles.logoutSection}>
            <Pressable style={styles.logoutButton} onPress={confirmLogout}>
              <Text style={styles.logoutText}>🚪 Logout</Text>
            </Pressable>
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
    padding: SIZES.md,
  },
  header: {
    alignItems: 'center',
    marginBottom: SIZES.xl,
  },
  headerTitle: {
    fontSize: SIZES.fontXl,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
    marginBottom: SIZES.xs,
  },
  headerSubtitle: {
    fontSize: SIZES.fontMd,
    color: COLORS.textSecondary,
    textAlign: 'center',
  },
  section: {
    marginBottom: SIZES.xl,
  },
  sectionTitle: {
    fontSize: SIZES.fontLg,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
    marginBottom: SIZES.md,
  },
  profileCard: {
    backgroundColor: COLORS.surface,
    borderRadius: SIZES.radiusMd,
    padding: SIZES.lg,
    elevation: 1,
  },
  profileRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: SIZES.sm,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderLight,
  },
  profileLabel: {
    fontSize: SIZES.fontMd,
    fontWeight: '600',
    color: COLORS.textSecondary,
    flex: 1,
  },
  profileValue: {
    fontSize: SIZES.fontMd,
    color: COLORS.textPrimary,
    flex: 2,
    textAlign: 'right',
  },
  roleValue: {
    fontWeight: '600',
    color: COLORS.primary,
  },
  settingCard: {
    backgroundColor: COLORS.surface,
    borderRadius: SIZES.radiusMd,
    padding: SIZES.lg,
    elevation: 1,
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: SIZES.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderLight,
  },
  settingInfo: {
    flex: 1,
    marginRight: SIZES.md,
  },
  settingLabel: {
    fontSize: SIZES.fontMd,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginBottom: SIZES.xs,
  },
  settingDescription: {
    fontSize: SIZES.fontSm,
    color: COLORS.textMuted,
  },
  actionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: SIZES.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderLight,
  },
  actionLabel: {
    fontSize: SIZES.fontMd,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  actionArrow: {
    fontSize: 20,
    color: COLORS.textMuted,
    fontWeight: 'bold',
  },
  logoutSection: {
    marginTop: SIZES.xl,
    marginBottom: SIZES.xl,
  },
  logoutButton: {
    backgroundColor: COLORS.emergency,
    paddingVertical: SIZES.lg,
    borderRadius: SIZES.radiusMd,
    alignItems: 'center',
    elevation: 2,
  },
  logoutText: {
    color: '#FFFFFF',
    fontSize: SIZES.fontMd,
    fontWeight: 'bold',
  },
});

export default SettingsScreen;