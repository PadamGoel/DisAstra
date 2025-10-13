import React, { useState, useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { StatusBar } from 'expo-status-bar';
import { Text, View, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Auth Screen
import AuthScreen from './src/screens/AuthScreen';

// User Dashboard Screens
import HomeScreen from './src/screens/HomeScreen';
import MapScreen from './src/screens/MapScreen';
import TrustRingScreen from './src/screens/TrustRingScreen';
import SettingsScreen from './src/screens/SettingsScreen';
import HandshakeScreen from './src/screens/HandshakeScreen';

// Responder Dashboard Screens (we'll create these)
import ResponderOverviewScreen from './src/screens/responder/OverviewScreen';
import ResponderIncidentsScreen from './src/screens/responder/IncidentsScreen';
import ResponderGeoZoneScreen from './src/screens/responder/GeoZoneScreen';
import ResponderTeamsScreen from './src/screens/responder/TeamsScreen';

// Theme
import { COLORS, SIZES } from './src/constants/theme';

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();



// User Dashboard Tab Navigator
const UserTabNavigator = ({ onLogout, userProfile }) => {
  const getTabBarIcon = (routeName, focused) => {
    const icons = {
      'Home': focused ? '🏠' : '🏠',
      'Map': focused ? '🗺️' : '🗺️',
      'Trust Ring': focused ? '👥' : '👥',
      'Settings': focused ? '⚙️' : '⚙️',
    };
    return icons[routeName] || '❓';
  };

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarStyle: {
          backgroundColor: COLORS.surface,
          borderTopColor: COLORS.border,
          borderTopWidth: 1,
          paddingBottom: 8,
          paddingTop: 8,
          height: 70,
        },
        tabBarActiveTintColor: COLORS.primary,
        tabBarInactiveTintColor: COLORS.textMuted,
        tabBarLabelStyle: {
          fontSize: SIZES.fontSm,
          fontWeight: '600',
          marginTop: 4,
        },
        tabBarIcon: ({ focused }) => (
          <Text style={{ fontSize: 24, marginBottom: 2 }}>
            {getTabBarIcon(route.name, focused)}
          </Text>
        ),
      })}
    >
      <Tab.Screen 
        name="Home" 
        component={HomeScreen}
        options={{
          tabBarLabel: 'Home',
        }}
      />
      <Tab.Screen 
        name="Map" 
        component={MapScreen}
        options={{
          tabBarLabel: 'Map',
        }}
      />
      <Tab.Screen 
        name="Trust Ring" 
        component={TrustRingScreen}
        options={{
          tabBarLabel: 'Trust Ring',
        }}
      />
      <Tab.Screen 
        name="Settings"
        options={{
          tabBarLabel: 'Settings',
        }}
      >
        {() => <SettingsScreen onLogout={onLogout} userProfile={userProfile} />}
      </Tab.Screen>
    </Tab.Navigator>
  );
};

// User Dashboard Stack Navigator (includes Handshake screen)
const UserDashboard = ({ onLogout, userProfile }) => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="UserTabs">
        {() => <UserTabNavigator onLogout={onLogout} userProfile={userProfile} />}
      </Stack.Screen>
      <Stack.Screen 
        name="Handshake" 
        component={HandshakeScreen}
        options={{
          headerShown: true,
          title: 'Emergency Handshake',
          headerStyle: { backgroundColor: COLORS.surface },
          headerTintColor: COLORS.textPrimary,
        }}
      />
    </Stack.Navigator>
  );
};

// Responder Dashboard Tab Navigator
const ResponderTabNavigator = ({ onLogout, userProfile }) => {
  const getTabBarIcon = (routeName, focused) => {
    const icons = {
      'Overview': focused ? '🏠' : '🏠',
      'Incidents': focused ? '🚨' : '🚨',
      'Geo Zones': focused ? '🧭' : '🧭',
      'Teams': focused ? '👥' : '👥',
      'Settings': focused ? '⚙️' : '⚙️',
    };
    return icons[routeName] || '❓';
  };

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarStyle: {
          backgroundColor: COLORS.surface,
          borderTopColor: COLORS.border,
          borderTopWidth: 1,
          paddingBottom: 8,
          paddingTop: 8,
          height: 70,
        },
        tabBarActiveTintColor: COLORS.emergency,
        tabBarInactiveTintColor: COLORS.textMuted,
        tabBarLabelStyle: {
          fontSize: SIZES.fontSm,
          fontWeight: '600',
          marginTop: 4,
        },
        tabBarIcon: ({ focused }) => (
          <Text style={{ fontSize: 24, marginBottom: 2 }}>
            {getTabBarIcon(route.name, focused)}
          </Text>
        ),
      })}
    >
      <Tab.Screen 
        name="Overview" 
        component={ResponderOverviewScreen}
        options={{
          tabBarLabel: 'Overview',
        }}
      />
      <Tab.Screen 
        name="Incidents" 
        component={ResponderIncidentsScreen}
        options={{
          tabBarLabel: 'Incidents',
        }}
      />
      <Tab.Screen 
        name="Geo Zones" 
        component={ResponderGeoZoneScreen}
        options={{
          tabBarLabel: 'Geo Zones',
        }}
      />
      <Tab.Screen 
        name="Teams" 
        component={ResponderTeamsScreen}
        options={{
          tabBarLabel: 'Teams',
        }}
      />
      <Tab.Screen 
        name="Settings"
        options={{
          tabBarLabel: 'Settings',
        }}
      >
        {() => <SettingsScreen onLogout={onLogout} userProfile={userProfile} />}
      </Tab.Screen>
    </Tab.Navigator>
  );
};

// Responder Dashboard Stack Navigator (includes Handshake screen)
const ResponderDashboard = ({ onLogout, userProfile }) => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="ResponderTabs">
        {() => <ResponderTabNavigator onLogout={onLogout} userProfile={userProfile} />}
      </Stack.Screen>
      <Stack.Screen 
        name="Handshake" 
        component={HandshakeScreen}
        options={{
          headerShown: true,
          title: 'Emergency Response',
          headerStyle: { backgroundColor: COLORS.surface },
          headerTintColor: COLORS.textPrimary,
        }}
      />
    </Stack.Navigator>
  );
};

export default function MainApp() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userRole, setUserRole] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check for existing authentication
    checkAuthState();
  }, []);

  const checkAuthState = async () => {
    try {
      const token = await AsyncStorage.getItem('authToken');
      const role = await AsyncStorage.getItem('userRole');
      const profile = await AsyncStorage.getItem('userProfile');
      
      if (token && role) {
        setIsAuthenticated(true);
        setUserRole(role);
        setUserProfile(profile ? JSON.parse(profile) : null);
      }
    } catch (error) {
      console.error('Auth check error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAuthSuccess = ({ token, role, user }) => {
    setIsAuthenticated(true);
    setUserRole(role);
    setUserProfile(user);
  };

  const handleLogout = async () => {
    try {
      await AsyncStorage.multiRemove(['authToken', 'userRole', 'userProfile']);
      setIsAuthenticated(false);
      setUserRole(null);
      setUserProfile(null);
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  if (isLoading) {
    return (
      <View style={{ 
        flex: 1, 
        backgroundColor: COLORS.background, 
        justifyContent: 'center', 
        alignItems: 'center' 
      }}>
        <Text style={{ 
          fontSize: SIZES.fontXl, 
          color: COLORS.emergency,
          fontWeight: 'bold'
        }}>
          🆘 DISASTRA
        </Text>
        <Text style={{ 
          fontSize: SIZES.fontMd, 
          color: COLORS.textSecondary,
          marginTop: SIZES.sm
        }}>
          Loading...
        </Text>
      </View>
    );
  }

  return (
    <>
      <StatusBar style="dark" backgroundColor={COLORS.background} />
      <NavigationContainer>
        {!isAuthenticated ? (
          <Stack.Navigator screenOptions={{ headerShown: false }}>
            <Stack.Screen name="Auth">
              {(props) => (
                <AuthScreen 
                  {...props} 
                  onAuthSuccess={handleAuthSuccess}
                />
              )}
            </Stack.Screen>
          </Stack.Navigator>
        ) : userRole === 'Responder' ? (
          <ResponderDashboard 
            onLogout={handleLogout} 
            userProfile={userProfile} 
          />
        ) : (
          <UserDashboard 
            onLogout={handleLogout} 
            userProfile={userProfile} 
          />
        )}
      </NavigationContainer>
    </>
  );
}