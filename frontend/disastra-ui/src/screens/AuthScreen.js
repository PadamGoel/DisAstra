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

const API_BASE_URL = 'http://localhost:3000/api'; // Update this for your backend

const AuthScreen = ({ navigation, onAuthSuccess }) => {
  const [activeTab, setActiveTab] = useState('login'); // 'login' or 'signup'
  const [loading, setLoading] = useState(false);
  const [fadeAnim] = useState(new Animated.Value(1));

  const [loginForm, setLoginForm] = useState({
    email: '',
    password: '',
  });

  const [signupForm, setSignupForm] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
    role: 'User', // 'User' or 'Responder'
  });

  useEffect(() => {
    // Check if user is already logged in
    checkExistingAuth();
  }, []);

  const checkExistingAuth = async () => {
    try {
      const token = await AsyncStorage.getItem('authToken');
      const userRole = await AsyncStorage.getItem('userRole');
      
      if (token && userRole) {
        // Auto-login if token exists
        handleAuthSuccess({ token, role: userRole });
      }
    } catch (error) {
      console.log('No existing auth found');
    }
  };

  const handleLogin = async () => {
    if (!loginForm.email || !loginForm.password) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    setLoading(true);

    try {
      // Try backend connection first, fallback to mock
      let response;
      try {
        response = await axios.post(`${API_BASE_URL}/auth/login`, {
          email: loginForm.email,
          password: loginForm.password,
        });
      } catch (networkError) {
        // Mock login for development
        response = await mockLogin(loginForm.email, loginForm.password);
      }

      if (response.data.success) {
        const { token, user } = response.data;
        await AsyncStorage.setItem('authToken', token);
        await AsyncStorage.setItem('userRole', user.role);
        await AsyncStorage.setItem('userProfile', JSON.stringify(user));
        
        handleAuthSuccess({ token, role: user.role, user });
      } else {
        Alert.alert('Login Failed', response.data.message || 'Invalid credentials');
      }
    } catch (error) {
      console.error('Login error:', error);
      Alert.alert('Error', 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSignup = async () => {
    if (!signupForm.name || !signupForm.email || !signupForm.password) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    setLoading(true);

    try {
      // Try backend connection first, fallback to mock
      let response;
      try {
        response = await axios.post(`${API_BASE_URL}/auth/signup`, signupForm);
      } catch (networkError) {
        // Mock signup for development
        response = await mockSignup(signupForm);
      }

      if (response.data.success) {
        const { token, user } = response.data;
        await AsyncStorage.setItem('authToken', token);
        await AsyncStorage.setItem('userRole', user.role);
        await AsyncStorage.setItem('userProfile', JSON.stringify(user));
        
        Alert.alert('Success', 'Account created successfully!');
        handleAuthSuccess({ token, role: user.role, user });
      } else {
        Alert.alert('Signup Failed', response.data.message || 'Failed to create account');
      }
    } catch (error) {
      console.error('Signup error:', error);
      Alert.alert('Error', 'Signup failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const mockLogin = async (email, password) => {
    // Mock authentication for development
    await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate network delay
    
    const mockUsers = {
      'user@test.com': { id: 1, name: 'Test User', email, role: 'User' },
      'responder@test.com': { id: 2, name: 'Test Responder', email, role: 'Responder' },
    };

    if (mockUsers[email] && password === 'password') {
      return {
        data: {
          success: true,
          token: 'mock-jwt-token-' + Date.now(),
          user: mockUsers[email]
        }
      };
    }

    return {
      data: {
        success: false,
        message: 'Invalid credentials'
      }
    };
  };

  const mockSignup = async (userData) => {
    // Mock signup for development
    await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate network delay
    
    const user = {
      id: Date.now(),
      name: userData.name,
      email: userData.email,
      phone: userData.phone,
      role: userData.role,
    };

    return {
      data: {
        success: true,
        token: 'mock-jwt-token-' + Date.now(),
        user
      }
    };
  };

  const handleAuthSuccess = ({ token, role, user }) => {
    if (onAuthSuccess) {
      onAuthSuccess({ token, role, user });
    }
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

                <View style={styles.inputContainer}>
                  <Text style={styles.inputLabel}>Email</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="Enter your email"
                    placeholderTextColor={COLORS.textMuted}
                    value={loginForm.email}
                    onChangeText={(text) => setLoginForm(prev => ({ ...prev, email: text }))}
                    keyboardType="email-address"
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

                <View style={styles.testCredentials}>
                  <Text style={styles.testTitle}>Test Credentials:</Text>
                  <Text style={styles.testText}>User: user@test.com / password</Text>
                  <Text style={styles.testText}>Responder: responder@test.com / password</Text>
                </View>
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
                    value={signupForm.name}
                    onChangeText={(text) => setSignupForm(prev => ({ ...prev, name: text }))}
                  />
                </View>

                <View style={styles.inputContainer}>
                  <Text style={styles.inputLabel}>Email *</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="Enter your email"
                    placeholderTextColor={COLORS.textMuted}
                    value={signupForm.email}
                    onChangeText={(text) => setSignupForm(prev => ({ ...prev, email: text }))}
                    keyboardType="email-address"
                    autoCapitalize="none"
                  />
                </View>

                <View style={styles.inputContainer}>
                  <Text style={styles.inputLabel}>Phone Number</Text>
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
                    placeholder="Create a password"
                    placeholderTextColor={COLORS.textMuted}
                    value={signupForm.password}
                    onChangeText={(text) => setSignupForm(prev => ({ ...prev, password: text }))}
                    secureTextEntry
                  />
                </View>

                {/* Role Selection */}
                <View style={styles.inputContainer}>
                  <Text style={styles.inputLabel}>Role *</Text>
                  <View style={styles.roleContainer}>
                    <Pressable
                      style={[
                        styles.roleOption,
                        signupForm.role === 'User' && styles.roleOptionActive
                      ]}
                      onPress={() => setSignupForm(prev => ({ ...prev, role: 'User' }))}
                    >
                      <Text style={styles.roleIcon}>👤</Text>
                      <Text style={[
                        styles.roleText,
                        signupForm.role === 'User' && styles.roleTextActive
                      ]}>
                        Civilian
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
  testCredentials: {
    marginTop: SIZES.xl,
    padding: SIZES.md,
    backgroundColor: COLORS.background,
    borderRadius: SIZES.radiusMd,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  testTitle: {
    fontSize: SIZES.fontSm,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
    marginBottom: SIZES.sm,
  },
  testText: {
    fontSize: SIZES.fontSm,
    color: COLORS.textMuted,
    fontFamily: 'monospace',
  },
});

export default AuthScreen;