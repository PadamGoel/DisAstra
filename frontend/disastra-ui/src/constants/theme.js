// Light Mode Theme for DISASTRA UI

export const COLORS = {
  // Primary Colors - Light Mode
  primary: '#E53935', // Emergency Red
  primaryDark: '#C62828',
  secondary: '#1976D2',
  
  // Emergency Colors
  emergency: '#E53935', // Emergency Red
  warning: '#FB8C00', // Orange
  success: '#43A047', // Responder Green
  info: '#1976D2',
  
  // Status Colors
  statusNew: '#E53935',
  statusAcknowledged: '#FB8C00',
  statusEnRoute: '#1976D2',
  statusResolved: '#43A047',
  
  // Background Colors - Light Mode
  background: '#F9F9F9', // Light grey/white tone
  surface: '#FFFFFF', // Pure white surfaces
  card: '#FFFFFF', // White cards with shadows
  
  // Text Colors - Light Mode
  textPrimary: '#212121', // Dark grey for readability
  textSecondary: '#424242', // Medium grey
  textMuted: '#757575', // Light grey
  
  // Border Colors - Light Mode
  border: '#E0E0E0',
  borderLight: '#F5F5F5',
  
  // Gradient Colors
  gradientStart: '#E53935',
  gradientEnd: '#C62828',
  successGradientStart: '#43A047',
  successGradientEnd: '#388E3C',
  
  // Transparency
  overlay: 'rgba(0, 0, 0, 0.5)',
  cardOverlay: 'rgba(255, 255, 255, 0.95)',
  emergencyOverlay: 'rgba(229, 57, 53, 0.1)',
  successOverlay: 'rgba(67, 160, 71, 0.1)',
};

export const SIZES = {
  // Spacing
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
  
  // Font Sizes
  fontXs: 12,
  fontSm: 14,
  fontMd: 16,
  fontLg: 18,
  fontXl: 24,
  fontXxl: 32,
  fontHuge: 48,
  
  // Border Radius
  radiusSm: 4,
  radiusMd: 8,
  radiusLg: 12,
  radiusXl: 16,
  radiusRound: 50,
  
  // Button Sizes
  buttonHeight: 56,
  buttonRadius: 12,
  sosButtonSize: 180,
  
  // Icon Sizes
  iconSm: 16,
  iconMd: 24,
  iconLg: 32,
  iconXl: 48,
  
  // Touch Targets
  touchTarget: 44,
  touchTargetLarge: 56,
};

export const ANIMATIONS = {
  // Duration
  durationFast: 200,
  durationMedium: 300,
  durationSlow: 500,
  durationBreathing: 2000,
  durationPulse: 1000,
  
  // Easing
  easeInOut: 'ease-in-out',
  easeOut: 'ease-out',
  easeIn: 'ease-in',
  
  // SOS Animation States
  sosIdle: 'idle',
  sosActivating: 'activating',
  sosActive: 'active',
  sosConfirmed: 'confirmed',
  
  // Breathing animation scale
  breathingScaleMin: 0.9,
  breathingScaleMax: 1.1,
  
  // Pulse animation
  pulseScaleMin: 1.0,
  pulseScaleMax: 1.3,
};

export const TYPOGRAPHY = {
  fontFamily: {
    regular: 'System',
    medium: 'System',
    bold: 'System',
    light: 'System',
  },
  
  // Font Weights
  weightLight: '300',
  weightRegular: '400',
  weightMedium: '500',
  weightSemiBold: '600',
  weightBold: '700',
  weightBlack: '900',
  
  // Line Heights
  lineHeightTight: 1.2,
  lineHeightNormal: 1.4,
  lineHeightLoose: 1.6,
};

export const SHADOWS = {
  small: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },
  medium: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 4,
  },
  large: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  sos: {
    shadowColor: '#ef4444',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 20,
    elevation: 10,
  },
};

export const GESTURE_CONFIGS = {
  longPressDuration: 800,
  doubleTapDelay: 300,
  panThreshold: 10,
  swipeVelocityThreshold: 500,
};

export const USER_ROLES = {
  CIVILIAN: 'civilian',
  VOLUNTEER: 'volunteer',
  RESPONDER: 'responder',
  COORDINATOR: 'coordinator',
};

export const SOS_STATUS = {
  IDLE: 'idle',
  ACTIVATING: 'activating',
  SENDING: 'sending',
  BROADCASTED: 'broadcasted',
  ACKNOWLEDGED: 'acknowledged',
  EN_ROUTE: 'en-route',
  RESOLVED: 'resolved',
  FAILED: 'failed',
};

export const INCIDENT_STATUS = {
  NEW: 'new',
  ACKNOWLEDGED: 'acknowledged',
  ASSIGNED: 'assigned',
  EN_ROUTE: 'en-route',
  ON_SCENE: 'on-scene',
  RESOLVED: 'resolved',
  CANCELLED: 'cancelled',
};

export const NETWORK_STATUS = {
  EXCELLENT: 'excellent',
  GOOD: 'good',
  FAIR: 'fair',
  POOR: 'poor',
  OFFLINE: 'offline',
};

export const MAP_LAYERS = {
  VICTIMS: 'victims',
  RESPONDERS: 'responders',
  HAZARDS: 'hazards',
  EVACUATION_ROUTES: 'evacuation_routes',
  NETWORK_COVERAGE: 'network_coverage',
  HEATMAP: 'heatmap',
};

export const LANGUAGES = {
  EN: { code: 'en', label: 'English', flag: '🇺🇸' },
  ES: { code: 'es', label: 'Español', flag: '🇪🇸' },
  FR: { code: 'fr', label: 'Français', flag: '🇫🇷' },
  DE: { code: 'de', label: 'Deutsch', flag: '🇩🇪' },
  HI: { code: 'hi', label: 'हिंदी', flag: '🇮🇳' },
  ZH: { code: 'zh', label: '中文', flag: '🇨🇳' },
  AR: { code: 'ar', label: 'العربية', flag: '🇸🇦' },
  RU: { code: 'ru', label: 'Русский', flag: '🇷🇺' },
};