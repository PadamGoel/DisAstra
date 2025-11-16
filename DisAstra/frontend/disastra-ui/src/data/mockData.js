/**
 * Mock Data for DISASTRA UI Prototype
 * 
 * This file contains sample data for testing and development of the emergency
 * response system. All data is fictional and used for demonstration purposes.
 * 
 * @module mockData
 */

// =============================================================================
// EMERGENCY TYPE DEFINITIONS
// =============================================================================

/**
 * Emergency type categories with their respective priorities
 * Priority scale: 1 (lowest) to 10 (highest/most critical)
 */
export const EMERGENCY_TYPES = [
  { id: 'medical', label: '🏥 Medical', color: '#ef4444', priority: 9 },
  { id: 'fire', label: '🔥 Fire', color: '#f97316', priority: 10 },
  { id: 'police', label: '👮 Police', color: '#3b82f6', priority: 8 },
  { id: 'natural', label: '🌪️ Natural Disaster', color: '#8b5cf6', priority: 9 },
  { id: 'violence', label: '⚠️ Violence', color: '#dc2626', priority: 10 },
  { id: 'technical', label: '⚡ Technical', color: '#eab308', priority: 6 },
  { id: 'trapped', label: '🚪 Trapped', color: '#f59e0b', priority: 8 },
  { id: 'other', label: '❓ Other', color: '#6b7280', priority: 5 }
];

// =============================================================================
// SOS INCIDENT DATA
// =============================================================================

/**
 * Sample SOS incidents with various statuses and urgency levels
 * Status types: 'new', 'acknowledged', 'en-route', 'resolved'
 */
export const MOCK_SOS_INCIDENTS = [
  {
    id: 'sos-001',
    type: 'medical',
    message: 'Heart attack, need immediate help',
    location: { latitude: 28.6139, longitude: 77.2090 },
    timestamp: Date.now() - 300000, // 5 minutes ago
    status: 'new',
    batteryLevel: 45,
    deviceId: 'device-001',
    urgency: 9,
    distance: 450 // Distance in meters
  },
  {
    id: 'sos-002',
    type: 'fire',
    message: 'Building on fire, trapped on 3rd floor',
    location: { latitude: 28.6129, longitude: 77.2080 },
    timestamp: Date.now() - 600000, // 10 minutes ago
    status: 'acknowledged',
    batteryLevel: 78,
    deviceId: 'device-002',
    urgency: 10,
    distance: 680,
    assignedTeam: 'Fire Brigade Unit 7'
  },
  {
    id: 'sos-003',
    type: 'police',
    message: 'Robbery in progress',
    location: { latitude: 28.6149, longitude: 77.2070 },
    timestamp: Date.now() - 900000, // 15 minutes ago
    status: 'en-route',
    batteryLevel: 92,
    deviceId: 'device-003',
    urgency: 8,
    distance: 320,
    assignedTeam: 'Police Unit 12',
    eta: 3 // ETA in minutes
  },
  {
    id: 'sos-004',
    type: 'trapped',
    message: 'Elevator stuck between floors',
    location: { latitude: 28.6159, longitude: 77.2060 },
    timestamp: Date.now() - 1200000, // 20 minutes ago
    status: 'resolved',
    batteryLevel: 23,
    deviceId: 'device-004',
    urgency: 6,
    distance: 890,
    resolvedAt: Date.now() - 300000
  }
];

// =============================================================================
// RESPONDER TEAM DATA
// =============================================================================

/**
 * Emergency response teams with their current status and location
 * Status types: 'available', 'responding', 'en-route', 'busy'
 */
export const MOCK_RESPONDER_TEAMS = [
  {
    id: 'team-001',
    name: 'Medical Response Unit 3',
    type: 'medical',
    members: 4,
    location: { latitude: 28.6120, longitude: 77.2100 },
    status: 'available',
    specialization: 'Emergency Medicine'
  },
  {
    id: 'team-002',
    name: 'Fire Brigade Unit 7',
    type: 'fire',
    members: 6,
    location: { latitude: 28.6140, longitude: 77.2085 },
    status: 'responding',
    specialization: 'Urban Fire Rescue'
  },
  {
    id: 'team-003',
    name: 'Police Unit 12',
    type: 'police',
    members: 2,
    location: { latitude: 28.6135, longitude: 77.2075 },
    status: 'en-route',
    specialization: 'Emergency Response'
  }
];

// =============================================================================
// NETWORK STATISTICS
// =============================================================================

/**
 * Real-time mesh network statistics
 * Health indicators: 'excellent', 'good', 'fair', 'poor'
 */
export const MOCK_NETWORK_STATS = {
  peerCount: 127,
  health: 'good',
  coverage: '85%',
  meshNodes: 42,
  lastUpdate: Date.now()
};

// =============================================================================
// USER PROFILE DATA
// =============================================================================

/**
 * User profile information
 * Role types: 'civilian', 'volunteer', 'responder', 'coordinator'
 * Verification levels: 'unverified', 'pending', 'verified', 'trusted'
 */
export const MOCK_USER_PROFILE = {
  id: 'user-001',
  name: 'Alex Johnson',
  role: 'civilian',
  language: 'en',
  trustRingSize: 8,
  sosHistory: 2,
  helpProvided: 15,
  verificationLevel: 'verified'
};

// =============================================================================
// HAZARD ZONE DATA
// =============================================================================

/**
 * Active hazard zones with severity levels
 * Severity types: 'low', 'medium', 'high', 'critical'
 */
export const MOCK_HAZARD_ZONES = [
  {
    id: 'hazard-001',
    type: 'flood',
    severity: 'high',
    area: [
      { latitude: 28.6100, longitude: 77.2050 },
      { latitude: 28.6110, longitude: 77.2060 },
      { latitude: 28.6105, longitude: 77.2070 },
      { latitude: 28.6095, longitude: 77.2060 }
    ],
    description: 'Flash flood warning - avoid area'
  },
  {
    id: 'hazard-002',
    type: 'gas-leak',
    severity: 'medium',
    area: [
      { latitude: 28.6150, longitude: 77.2040 },
      { latitude: 28.6155, longitude: 77.2045 },
      { latitude: 28.6150, longitude: 77.2050 },
      { latitude: 28.6145, longitude: 77.2045 }
    ],
    description: 'Gas leak reported - evacuation in progress'
  }
];

// =============================================================================
// EVACUATION ROUTE DATA
// =============================================================================

/**
 * Designated evacuation routes with real-time status
 * Capacity levels: 'low', 'medium', 'high'
 * Status types: 'clear', 'congested', 'blocked'
 */
export const MOCK_EVACUATION_ROUTES = [
  {
    id: 'route-001',
    name: 'Primary Evacuation Route',
    path: [
      { latitude: 28.6139, longitude: 77.2090 },
      { latitude: 28.6140, longitude: 77.2095 },
      { latitude: 28.6145, longitude: 77.2100 },
      { latitude: 28.6150, longitude: 77.2105 }
    ],
    capacity: 'high',
    status: 'clear'
  },
  {
    id: 'route-002',
    name: 'Secondary Route',
    path: [
      { latitude: 28.6130, longitude: 77.2080 },
      { latitude: 28.6135, longitude: 77.2085 },
      { latitude: 28.6140, longitude: 77.2090 }
    ],
    capacity: 'medium',
    status: 'congested'
  }
];

// =============================================================================
// NOTIFICATION MESSAGES
// =============================================================================

/**
 * System messages and notifications
 * Priority levels: 'low', 'medium', 'high', 'critical'
 * Message types: 'sos-confirmation', 'safety-update', 'network-update', 'alert'
 */
export const MOCK_MESSAGES = [
  {
    id: 'msg-001',
    type: 'sos-confirmation',
    title: 'Help is on the way!',
    body: 'Medical Response Unit 3 has been dispatched. ETA: 4 minutes.',
    timestamp: Date.now() - 120000, // 2 minutes ago
    priority: 'high'
  },
  {
    id: 'msg-002',
    type: 'safety-update',
    title: 'Area Safe',
    body: 'Gas leak in sector 7 has been contained. Area now safe.',
    timestamp: Date.now() - 300000, // 5 minutes ago
    priority: 'medium'
  },
  {
    id: 'msg-003',
    type: 'network-update',
    title: 'Network Restored',
    body: 'Mesh network coverage improved to 95% in your area.',
    timestamp: Date.now() - 600000, // 10 minutes ago
    priority: 'low'
  }
];

// =============================================================================
// ANALYTICS AND METRICS
// =============================================================================

/**
 * System-wide analytics and performance metrics
 * Safety index levels: 'Critical', 'Poor', 'Fair', 'Good', 'Excellent'
 */
export const MOCK_ANALYTICS = {
  urgencyScore: 7.2,
  networkHealth: 85,
  responseTime: '3.2 min',
  activeCases: 12,
  resolvedToday: 28,
  peakHours: '14:00-16:00',
  safetyIndex: 'Good'
};
