import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  Pressable,
  ScrollView,
  Modal,
  Animated,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import MockMap from '../components/MockMap';
import { COLORS, SIZES } from '../constants/theme';

const MapScreen = ({ navigation }) => {
  const [selectedMapType, setSelectedMapType] = useState('street');
  const [overlays, setOverlays] = useState({
    meshPositions: true,
    hazardZones: true,
    evacuationRoutes: false,
    victimDensity: false,
    resourceAnchors: true,
    terrainRisk: false,
  });
  const [selectedPoints, setSelectedPoints] = useState([]);
  const [showRouteModal, setShowRouteModal] = useState(false);
  const [currentZone, setCurrentZone] = useState('safe'); // 'safe', 'hazard', 'unknown'
  const [showDrawingMode, setShowDrawingMode] = useState(false);

  const mapTypes = [
    { id: 'street', label: 'Street', icon: '🗺️' },
    { id: 'satellite', label: 'Satellite', icon: '🛰️' },
    { id: 'terrain', label: 'Terrain', icon: '⛰️' },
  ];

  const overlayOptions = [
    { id: 'meshPositions', label: 'Mesh Network', icon: '📡', color: COLORS.info },
    { id: 'hazardZones', label: 'Hazard Zones', icon: '⚠️', color: COLORS.emergency },
    { id: 'evacuationRoutes', label: 'Evacuation Routes', icon: '🚶', color: COLORS.success },
    { id: 'victimDensity', label: 'Victim Density', icon: '👥', color: COLORS.warning },
    { id: 'resourceAnchors', label: 'Resources', icon: '🏥', color: COLORS.primary },
    { id: 'terrainRisk', label: 'Terrain Risk', icon: '🌋', color: '#FF6F00' },
  ];

  const mockIncidents = [
    { id: 1, type: 'medical', lat: 40.7128, lng: -74.0060, status: 'active' },
    { id: 2, type: 'fire', lat: 40.7580, lng: -73.9855, status: 'responded' },
    { id: 3, type: 'trapped', lat: 40.7505, lng: -73.9934, status: 'pending' },
  ];

  const mockResources = [
    { id: 1, type: 'hospital', name: 'Emergency Hospital', lat: 40.7589, lng: -73.9851 },
    { id: 2, type: 'shelter', name: 'Evacuation Center', lat: 40.7282, lng: -74.0776 },
    { id: 3, type: 'supplies', name: 'Supply Drop', lat: 40.7831, lng: -73.9712 },
  ];

  const toggleOverlay = (overlayId) => {
    setOverlays(prev => ({
      ...prev,
      [overlayId]: !prev[overlayId]
    }));
  };

  const handleMapPress = (coordinate) => {
    if (selectedPoints.length < 2) {
      setSelectedPoints(prev => [...prev, coordinate]);
    } else {
      setSelectedPoints([coordinate]);
    }
  };

  const handleGetRoute = () => {
    if (selectedPoints.length === 2) {
      setShowRouteModal(true);
    }
  };

  const clearRoute = () => {
    setSelectedPoints([]);
  };

  const getZoneStatus = () => {
    switch (currentZone) {
      case 'safe':
        return { message: 'You are inside a safe zone ✅', color: COLORS.success };
      case 'hazard':
        return { message: 'Near hazard zone ⚠️', color: COLORS.emergency };
      default:
        return { message: 'Zone status unknown', color: COLORS.textMuted };
    }
  };

  return (
    <>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.background} />
      <SafeAreaView style={styles.container}>
        
        {/* Header with Zone Status */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Tactical Map</Text>
          <View style={[styles.zoneStatus, { backgroundColor: getZoneStatus().color + '20' }]}>
            <Text style={[styles.zoneStatusText, { color: getZoneStatus().color }]}>
              {getZoneStatus().message}
            </Text>
          </View>
        </View>

        {/* Map Type Selection */}
        <View style={styles.mapTypeContainer}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={styles.mapTypeTabs}>
              {mapTypes.map((type) => (
                <Pressable
                  key={type.id}
                  style={[
                    styles.mapTypeTab,
                    selectedMapType === type.id && styles.mapTypeTabActive
                  ]}
                  onPress={() => setSelectedMapType(type.id)}
                >
                  <Text style={styles.mapTypeIcon}>{type.icon}</Text>
                  <Text style={[
                    styles.mapTypeText,
                    selectedMapType === type.id && styles.mapTypeTextActive
                  ]}>
                    {type.label}
                  </Text>
                </Pressable>
              ))}
            </View>
          </ScrollView>
        </View>

        {/* Main Map Area */}
        <View style={styles.mapContainer}>
          <MockMap
            mapType={selectedMapType}
            overlays={overlays}
            incidents={mockIncidents}
            resources={mockResources}
            selectedPoints={selectedPoints}
            onMapPress={handleMapPress}
            showDrawingMode={showDrawingMode}
          />
          
          {/* Floating Route Button */}
          {selectedPoints.length === 2 && (
            <View style={styles.routeButtonContainer}>
              <Pressable style={styles.routeButton} onPress={handleGetRoute}>
                <Text style={styles.routeButtonText}>🗺️ Get Route</Text>
              </Pressable>
              <Pressable style={styles.clearButton} onPress={clearRoute}>
                <Text style={styles.clearButtonText}>✕</Text>
              </Pressable>
            </View>
          )}

          {/* Drawing Mode Toggle */}
          <View style={styles.drawingModeContainer}>
            <Pressable
              style={[
                styles.drawingModeButton,
                showDrawingMode && styles.drawingModeButtonActive
              ]}
              onPress={() => setShowDrawingMode(!showDrawingMode)}
            >
              <Text style={styles.drawingModeText}>
                {showDrawingMode ? '✓ Drawing' : '✏️ Draw Zones'}
              </Text>
            </Pressable>
          </View>
        </View>

        {/* Overlay Controls */}
        <View style={styles.overlayControls}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={styles.overlayTabs}>
              {overlayOptions.map((overlay) => (
                <Pressable
                  key={overlay.id}
                  style={[
                    styles.overlayTab,
                    overlays[overlay.id] && styles.overlayTabActive,
                    overlays[overlay.id] && { borderColor: overlay.color }
                  ]}
                  onPress={() => toggleOverlay(overlay.id)}
                >
                  <Text style={styles.overlayIcon}>{overlay.icon}</Text>
                  <Text style={[
                    styles.overlayText,
                    overlays[overlay.id] && styles.overlayTextActive
                  ]}>
                    {overlay.label}
                  </Text>
                </Pressable>
              ))}
            </View>
          </ScrollView>
        </View>

        {/* Legend */}
        <View style={styles.legend}>
          <Text style={styles.legendTitle}>Legend</Text>
          <View style={styles.legendItems}>
            <View style={styles.legendRow}>
              <View style={[styles.legendColor, { backgroundColor: COLORS.emergency }]} />
              <Text style={styles.legendText}>Active Incidents</Text>
              
              <View style={[styles.legendColor, { backgroundColor: COLORS.success }]} />
              <Text style={styles.legendText}>Safe Zones</Text>
            </View>
            <View style={styles.legendRow}>
              <View style={[styles.legendColor, { backgroundColor: COLORS.warning }]} />
              <Text style={styles.legendText}>Hazard Areas</Text>
              
              <View style={[styles.legendColor, { backgroundColor: COLORS.info }]} />
              <Text style={styles.legendText}>Resources</Text>
            </View>
          </View>
        </View>

        {/* Route Modal */}
        <Modal
          visible={showRouteModal}
          transparent={true}
          animationType="slide"
          onRequestClose={() => setShowRouteModal(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.routeModal}>
              <Text style={styles.routeModalTitle}>🗺️ Route Information</Text>
              
              <View style={styles.routeInfo}>
                <Text style={styles.routeInfoText}>
                  📍 From: {selectedPoints[0]?.lat.toFixed(4)}, {selectedPoints[0]?.lng.toFixed(4)}
                </Text>
                <Text style={styles.routeInfoText}>
                  📍 To: {selectedPoints[1]?.lat.toFixed(4)}, {selectedPoints[1]?.lng.toFixed(4)}
                </Text>
                <Text style={styles.routeInfoText}>
                  📏 Distance: ~1.2 km
                </Text>
                <Text style={styles.routeInfoText}>
                  ⏱️ Estimated Time: 15 minutes walking
                </Text>
                <Text style={styles.routeInfoText}>
                  ⚠️ Safety Level: Moderate (avoid building debris)
                </Text>
              </View>

              <View style={styles.routeModalButtons}>
                <Pressable style={styles.startRouteButton}>
                  <Text style={styles.startRouteButtonText}>Start Navigation</Text>
                </Pressable>
                
                <Pressable 
                  style={styles.closeRouteButton}
                  onPress={() => setShowRouteModal(false)}
                >
                  <Text style={styles.closeRouteButtonText}>Close</Text>
                </Pressable>
              </View>
            </View>
          </View>
        </Modal>
      </SafeAreaView>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    padding: SIZES.md,
    backgroundColor: COLORS.surface,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  headerTitle: {
    fontSize: SIZES.fontLg,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
    textAlign: 'center',
    marginBottom: SIZES.sm,
  },
  zoneStatus: {
    padding: SIZES.sm,
    borderRadius: SIZES.radiusMd,
    alignItems: 'center',
  },
  zoneStatusText: {
    fontSize: SIZES.fontSm,
    fontWeight: '600',
  },
  mapTypeContainer: {
    backgroundColor: COLORS.surface,
    paddingVertical: SIZES.sm,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  mapTypeTabs: {
    flexDirection: 'row',
    paddingHorizontal: SIZES.md,
    gap: SIZES.sm,
  },
  mapTypeTab: {
    backgroundColor: COLORS.background,
    paddingHorizontal: SIZES.md,
    paddingVertical: SIZES.sm,
    borderRadius: SIZES.radiusMd,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  mapTypeTabActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  mapTypeIcon: {
    fontSize: 16,
    marginRight: SIZES.xs,
  },
  mapTypeText: {
    fontSize: SIZES.fontSm,
    color: COLORS.textSecondary,
    fontWeight: '500',
  },
  mapTypeTextActive: {
    color: '#FFFFFF',
  },
  mapContainer: {
    flex: 1,
    position: 'relative',
  },
  routeButtonContainer: {
    position: 'absolute',
    bottom: SIZES.lg,
    right: SIZES.lg,
    flexDirection: 'row',
    gap: SIZES.sm,
  },
  routeButton: {
    backgroundColor: COLORS.success,
    paddingHorizontal: SIZES.lg,
    paddingVertical: SIZES.md,
    borderRadius: SIZES.radiusMd,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  routeButtonText: {
    color: '#FFFFFF',
    fontSize: SIZES.fontMd,
    fontWeight: '600',
  },
  clearButton: {
    backgroundColor: COLORS.emergency,
    paddingHorizontal: SIZES.md,
    paddingVertical: SIZES.md,
    borderRadius: SIZES.radiusMd,
    elevation: 4,
  },
  clearButtonText: {
    color: '#FFFFFF',
    fontSize: SIZES.fontMd,
    fontWeight: '600',
  },
  drawingModeContainer: {
    position: 'absolute',
    top: SIZES.lg,
    right: SIZES.lg,
  },
  drawingModeButton: {
    backgroundColor: COLORS.surface,
    paddingHorizontal: SIZES.md,
    paddingVertical: SIZES.sm,
    borderRadius: SIZES.radiusMd,
    borderWidth: 1,
    borderColor: COLORS.border,
    elevation: 2,
  },
  drawingModeButtonActive: {
    backgroundColor: COLORS.warning,
    borderColor: COLORS.warning,
  },
  drawingModeText: {
    fontSize: SIZES.fontSm,
    color: COLORS.textPrimary,
    fontWeight: '600',
  },
  overlayControls: {
    backgroundColor: COLORS.surface,
    paddingVertical: SIZES.sm,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  overlayTabs: {
    flexDirection: 'row',
    paddingHorizontal: SIZES.md,
    gap: SIZES.sm,
  },
  overlayTab: {
    backgroundColor: COLORS.background,
    paddingHorizontal: SIZES.sm,
    paddingVertical: SIZES.sm,
    borderRadius: SIZES.radiusMd,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
    minWidth: 70,
  },
  overlayTabActive: {
    backgroundColor: COLORS.primary + '20',
    borderWidth: 2,
  },
  overlayIcon: {
    fontSize: 14,
    marginBottom: SIZES.xs,
  },
  overlayText: {
    fontSize: 10,
    color: COLORS.textSecondary,
    fontWeight: '500',
    textAlign: 'center',
  },
  overlayTextActive: {
    color: COLORS.textPrimary,
    fontWeight: '700',
  },
  legend: {
    backgroundColor: COLORS.surface,
    padding: SIZES.md,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  legendTitle: {
    fontSize: SIZES.fontSm,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
    marginBottom: SIZES.sm,
  },
  legendItems: {
    gap: SIZES.xs,
  },
  legendRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SIZES.sm,
  },
  legendColor: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  legendText: {
    fontSize: SIZES.fontXs,
    color: COLORS.textSecondary,
    flex: 1,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  routeModal: {
    backgroundColor: COLORS.surface,
    borderRadius: SIZES.radiusLg,
    padding: SIZES.xl,
    width: '90%',
    maxWidth: 400,
    elevation: 8,
  },
  routeModalTitle: {
    fontSize: SIZES.fontXl,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
    textAlign: 'center',
    marginBottom: SIZES.lg,
  },
  routeInfo: {
    backgroundColor: COLORS.background,
    padding: SIZES.md,
    borderRadius: SIZES.radiusMd,
    marginBottom: SIZES.lg,
  },
  routeInfoText: {
    fontSize: SIZES.fontSm,
    color: COLORS.textSecondary,
    marginBottom: SIZES.xs,
    fontFamily: 'monospace',
  },
  routeModalButtons: {
    gap: SIZES.md,
  },
  startRouteButton: {
    backgroundColor: COLORS.primary,
    paddingVertical: SIZES.md,
    borderRadius: SIZES.radiusMd,
    alignItems: 'center',
  },
  startRouteButtonText: {
    color: '#FFFFFF',
    fontSize: SIZES.fontMd,
    fontWeight: 'bold',
  },
  closeRouteButton: {
    backgroundColor: COLORS.border,
    paddingVertical: SIZES.md,
    borderRadius: SIZES.radiusMd,
    alignItems: 'center',
  },
  closeRouteButtonText: {
    color: COLORS.textMuted,
    fontSize: SIZES.fontMd,
    fontWeight: '500',
  },
});

export default MapScreen;