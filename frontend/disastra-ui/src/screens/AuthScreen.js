import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  Pressable,
  Alert,
  Animated,
} from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { LinearGradient } from 'expo-linear-gradient';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { COLORS, SIZES } from '../constants/theme';
import axios from 'axios';

// ⚠️ IMPORTANT: Change this to your actual backend URL
// For Android emulator: use http://10.0.2.2:5000
// For iOS simulator: use http://localhost:5000
// For physical device: use your computer's IP address (e.g., http://192.168.1.100:5000)
const API_BASE_URL = 'http://10.162.231.17:5000'; // ✅ Update this based on your setup

const AuthScreen = ({ navigation, onAuthSuccess }) => {
  const [activeTab, setActiveTab] = useState('login');
  const [loading, setLoading] = useState(false);
  const [fadeAnim] = useState(new Animated.Value(1));

  const [loginForm, setLoginForm] = useState({
    phone: '',
    password: '',
    role: 'Victim', // 'Victim' or 'Responder'
  });

  const [signupForm, setSignupForm] = useState({
    username: '',
    phone: '',
    password: '',
    role: 'Victim', // 'Victim' or 'Responder'
  });

  useEffect(() => {
    checkExistingAuth();
  }, []);

  const checkExistingAuth = async () => {
    try {
      const token = await AsyncStorage.getItem('authToken');
      const userRole = await AsyncStorage.getItem('userRole');
      if (token && userRole) {
        handleAuthSuccess({ token, role: userRole });
      }
    } catch (error) {
      console.log('No existing auth found');
    }
  };

  // 🟢 LOGIN HANDLER
  const handleLogin = async () => {
    if (!loginForm.phone || !loginForm.password) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    // Basic phone validation
    if (loginForm.phone.length < 10) {
      Alert.alert('Error', 'Please enter a valid phone number');
      return;
    }

    setLoading(true);

    try {
      const endpoint =
        loginForm.role === 'Responder'
          ? `${API_BASE_URL}/responder/login`
          : `${API_BASE_URL}/victim/login`;

      console.log('Attempting login to:', endpoint);

      const response = await axios.post(endpoint, {
        phone: loginForm.phone,
        password: loginForm.password,
      });

      if (response.data.token) {
        const token = response.data.token;
        const role = loginForm.role;

        await AsyncStorage.setItem('authToken', token);
        await AsyncStorage.setItem('userRole', role);

        Alert.alert('Success', 'Logged in successfully!');
        handleAuthSuccess({ token, role });
      } else {
        Alert.alert('Login Failed', response.data.msg || 'Invalid credentials');
      }
    } catch (error) {
      console.error('Login error:', error);
      const errorMsg = error.response?.data?.msg || 'Login failed. Please check your credentials.';
      Alert.alert('Error', errorMsg);
    } finally {
      setLoading(false);
    }
  };

  // 🟢 SIGNUP HANDLER
  const handleSignup = async () => {
    if (!signupForm.username || !signupForm.password || !signupForm.phone) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    // Validation
    if (signupForm.phone.length < 10) {
      Alert.alert('Error', 'Please enter a valid phone number (min 10 digits)');
      return;
    }

    if (signupForm.password.length < 6) {
      Alert.alert('Error', 'Password must be at least 6 characters long');
      return;
    }

    setLoading(true);

    try {
      const endpoint =
        signupForm.role === 'Responder'
          ? `${API_BASE_URL}/responder/register`
          : `${API_BASE_URL}/victim/register`;

      console.log('Attempting signup to:', endpoint);

      const response = await axios.post(endpoint, {
        username: signupForm.username,
        phone: signupForm.phone,
        password: signupForm.password,
        role: signupForm.role === 'Responder' ? 'Volunteer' : undefined, // Only for responders
      });

      if (response.data.msg?.toLowerCase().includes('success')) {
        Alert.alert('Success', 'Account created successfully! Please login.');
        
        // Switch to login tab and pre-fill credentials
        setLoginForm({
          phone: signupForm.phone,
          password: signupForm.password,
          role: signupForm.role,
        });
        animateTabSwitch('login');
      } else {
        Alert.alert('Signup Failed', response.data.msg || 'Failed to create account');
      }
    } catch (error) {
      console.error('Signup error:', error);
      const errorMsg = error.response?.data?.msg || 'Signup failed. Please try again.';
      Alert.alert('Error', errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const handleAuthSuccess = ({ token, role }) => {
    if (onAuthSuccess) onAuthSuccess({ token, role });
  };

  const animateTabSwitch = (tab) => {
    Animated.sequence([
      Animated.timing(fadeAnim, {
        toValue: 0.3,
        duration: 150,
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 150,
        useNativeDriver: true,
      }),
    ]).start();
    
    setActiveTab(tab);
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
            <Text style={styles.logo}>🆘 DISASTRA</Text>
            <Text style={styles.subtitle}>Emergency Response Network</Text>
          </View>

          {/* Tab Selection */}
          <View style={styles.tabContainer}>
            <Pressable
              style={[styles.tab, activeTab === 'login' && styles.tabActive]}
              onPress={() => animateTabSwitch('login')}
            >
              <Text style={[styles.tabText, activeTab === 'login' && styles.tabTextActive]}>
                Login
              </Text>
            </Pressable>
            <Pressable
              style={[styles.tab, activeTab === 'signup' && styles.tabActive]}
              onPress={() => animateTabSwitch('signup')}
            >
              <Text style={[styles.tabText, activeTab === 'signup' && styles.tabTextActive]}>
                Sign Up
              </Text>
            </Pressable>
          </View>

          {/* Form Content */}
          <Animated.View style={[styles.formContainer, { opacity: fadeAnim }]}>
            {activeTab === 'login' ? (
              <View style={styles.form}>
                <Text style={styles.formTitle}>Welcome Back</Text>
                <Text style={styles.formSubtitle}>Sign in to continue</Text>

                {/* Role Selection for Login */}
                <View style={styles.inputContainer}>
                  <Text style={styles.inputLabel}>Login As</Text>
                  <View style={styles.roleContainer}>
                    <Pressable
                      style={[
                        styles.roleOption,
                        loginForm.role === 'Victim' && styles.roleOptionActive
                      ]}
                      onPress={() => setLoginForm(prev => ({ ...prev, role: 'Victim' }))}
                    >
                      <Text style={styles.roleIcon}>👤</Text>
                      <Text style={[
                        styles.roleText,
                        loginForm.role === 'Victim' && styles.roleTextActive
                      ]}>
                        Victim
                      </Text>
                    </Pressable>
                    <Pressable
                      style={[
                        styles.roleOption,
                        loginForm.role === 'Responder' && styles.roleOptionActive
                      ]}
                      onPress={() => setLoginForm(prev => ({ ...prev, role: 'Responder' }))}
                    >
                      <Text style={styles.roleIcon}>🚑</Text>
                      <Text style={[
                        styles.roleText,
                        loginForm.role === 'Responder' && styles.roleTextActive
                      ]}>
                        Responder
                      </Text>
                    </Pressable>
                  </View>
                </View>

                <View style={styles.inputContainer}>
                  <Text style={styles.inputLabel}>Phone Number</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="Enter your phone number"
                    placeholderTextColor={COLORS.textMuted}
                    value={loginForm.phone}
                    onChangeText={(text) => setLoginForm(prev => ({ ...prev, phone: text }))}
                    keyboardType="phone-pad"
                    autoCapitalize="none"
                  />
                </View>

                <View style={styles.inputContainer}>
                  <Text style={styles.inputLabel}>Password</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="Enter your password"
                    placeholderTextColor={COLORS.textMuted}
                    value={loginForm.password}
                    onChangeText={(text) => setLoginForm(prev => ({ ...prev, password: text }))}
                    secureTextEntry
                  />
                </View>

                <Pressable 
                  style={[styles.submitButton, loading && styles.submitButtonDisabled]}
                  onPress={handleLogin}
                  disabled={loading}
                >
                  <LinearGradient
                    colors={[COLORS.primary, COLORS.emergency]}
                    style={styles.submitGradient}
                  >
                    <Text style={styles.submitButtonText}>
                      {loading ? 'Signing In...' : 'Sign In'}
                    </Text>
                  </LinearGradient>
                </Pressable>
              </View>
            ) : (
              <View style={styles.form}>
                <Text style={styles.formTitle}>Create Account</Text>
                <Text style={styles.formSubtitle}>Join the emergency network</Text>

                <View style={styles.inputContainer}>
                  <Text style={styles.inputLabel}>Full Name *</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="Enter your full name"
                    placeholderTextColor={COLORS.textMuted}
                    value={signupForm.username}
                    onChangeText={(text) => setSignupForm(prev => ({ ...prev, username: text }))}
                  />
                </View>

                <View style={styles.inputContainer}>
                  <Text style={styles.inputLabel}>Phone Number *</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="Enter your phone number"
                    placeholderTextColor={COLORS.textMuted}
                    value={signupForm.phone}
                    onChangeText={(text) => setSignupForm(prev => ({ ...prev, phone: text }))}
                    keyboardType="phone-pad"
                  />
                </View>

                <View style={styles.inputContainer}>
                  <Text style={styles.inputLabel}>Password *</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="Create a password (min 6 characters)"
                    placeholderTextColor={COLORS.textMuted}
                    value={signupForm.password}
                    onChangeText={(text) => setSignupForm(prev => ({ ...prev, password: text }))}
                    secureTextEntry
                  />
                </View>

                {/* Role Selection */}
                <View style={styles.inputContainer}>
                  <Text style={styles.inputLabel}>Register As *</Text>
                  <View style={styles.roleContainer}>
                    <Pressable
                      style={[
                        styles.roleOption,
                        signupForm.role === 'Victim' && styles.roleOptionActive
                      ]}
                      onPress={() => setSignupForm(prev => ({ ...prev, role: 'Victim' }))}
                    >
                      <Text style={styles.roleIcon}>👤</Text>
                      <Text style={[
                        styles.roleText,
                        signupForm.role === 'Victim' && styles.roleTextActive
                      ]}>
                        Victim
                      </Text>
                    </Pressable>
                    <Pressable
                      style={[
                        styles.roleOption,
                        signupForm.role === 'Responder' && styles.roleOptionActive
                      ]}
                      onPress={() => setSignupForm(prev => ({ ...prev, role: 'Responder' }))}
                    >
                      <Text style={styles.roleIcon}>🚑</Text>
                      <Text style={[
                        styles.roleText,
                        signupForm.role === 'Responder' && styles.roleTextActive
                      ]}>
                        Responder
                      </Text>
                    </Pressable>
                  </View>
                </View>

                <Pressable 
                  style={[styles.submitButton, loading && styles.submitButtonDisabled]}
                  onPress={handleSignup}
                  disabled={loading}
                >
                  <LinearGradient
                    colors={[COLORS.success, COLORS.primary]}
                    style={styles.submitGradient}
                  >
                    <Text style={styles.submitButtonText}>
                      {loading ? 'Creating Account...' : 'Create Account'}
                    </Text>
                  </LinearGradient>
                </Pressable>
              </View>
            )}
          </Animated.View>
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
    paddingHorizontal: SIZES.lg,
  },
  header: {
    alignItems: 'center',
    paddingVertical: SIZES.xl * 2,
  },
  logo: {
    fontSize: SIZES.fontXl * 1.5,
    fontWeight: 'bold',
    color: COLORS.emergency,
    marginBottom: SIZES.sm,
  },
  subtitle: {
    fontSize: SIZES.fontMd,
    color: COLORS.textSecondary,
    textAlign: 'center',
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: COLORS.surface,
    borderRadius: SIZES.radiusMd,
    padding: SIZES.xs,
    marginBottom: SIZES.xl,
  },
  tab: {
    flex: 1,
    paddingVertical: SIZES.md,
    alignItems: 'center',
    borderRadius: SIZES.radiusMd,
  },
  tabActive: {
    backgroundColor: COLORS.primary,
  },
  tabText: {
    fontSize: SIZES.fontMd,
    fontWeight: '600',
    color: COLORS.textSecondary,
  },
  tabTextActive: {
    color: '#FFFFFF',
  },
  formContainer: {
    flex: 1,
  },
  form: {
    backgroundColor: COLORS.surface,
    borderRadius: SIZES.radiusLg,
    padding: SIZES.xl,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    marginBottom: SIZES.xl,
  },
  formTitle: {
    fontSize: SIZES.fontXl,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
    textAlign: 'center',
    marginBottom: SIZES.sm,
  },
  formSubtitle: {
    fontSize: SIZES.fontMd,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginBottom: SIZES.xl,
  },
  inputContainer: {
    marginBottom: SIZES.lg,
  },
  inputLabel: {
    fontSize: SIZES.fontSm,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginBottom: SIZES.sm,
  },
  input: {
    backgroundColor: COLORS.background,
    borderRadius: SIZES.radiusMd,
    paddingHorizontal: SIZES.md,
    paddingVertical: SIZES.md,
    fontSize: SIZES.fontMd,
    color: COLORS.textPrimary,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  roleContainer: {
    flexDirection: 'row',
    gap: SIZES.md,
  },
  roleOption: {
    flex: 1,
    backgroundColor: COLORS.background,
    borderRadius: SIZES.radiusMd,
    paddingVertical: SIZES.lg,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: COLORS.border,
  },
  roleOptionActive: {
    borderColor: COLORS.primary,
    backgroundColor: COLORS.primary + '20',
  },
  roleIcon: {
    fontSize: 32,
    marginBottom: SIZES.sm,
  },
  roleText: {
    fontSize: SIZES.fontMd,
    fontWeight: '600',
    color: COLORS.textSecondary,
  },
  roleTextActive: {
    color: COLORS.primary,
  },
  submitButton: {
    borderRadius: SIZES.radiusMd,
    overflow: 'hidden',
    marginTop: SIZES.lg,
  },
  submitButtonDisabled: {
    opacity: 0.6,
  },
  submitGradient: {
    paddingVertical: SIZES.lg,
    alignItems: 'center',
  },
  submitButtonText: {
    fontSize: SIZES.fontMd,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
});

export default AuthScreen;