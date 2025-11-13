import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Dimensions,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS, SIZES, SHADOWS } from '../constants/theme';
import { MOCK_SOS_INCIDENTS, MOCK_HAZARD_ZONES, MOCK_EVACUATION_ROUTES } from '../data/mockData';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

const MockMap = ({ 
  incidents = MOCK_SOS_INCIDENTS,
  onIncidentSelect,
  layers = {
    victims: true,
    responders: true,
    hazards: false,
    evacuation_routes: false,
    heatmap: false
  }
}) => {
  const [selectedIncident, setSelectedIncident] = useState(null);
  const [mapLayers, setMapLayers] = useState(layers);

  const handleIncidentPress = (incident) => {
    setSelectedIncident(incident);
    onIncidentSelect && onIncidentSelect(incident);
    
    Alert.alert(
      `${getIncidentIcon(incident.type)} ${incident.type.toUpperCase()}`,
      `Message: ${incident.message}\nDistance: ${incident.distance}m\nStatus: ${incident.status}\nBattery: ${incident.batteryLevel}%`,
      [
        { text: 'Dismiss' },
        { text: 'Navigate', onPress: () => navigateToIncident(incident) },
        incident.status === 'new' && { 
          text: 'Acknowledge', 
          onPress: () => acknowledgeIncident(incident) 
        }
      ].filter(Boolean)
    );
  };

  const navigateToIncident = (incident) => {
    Alert.alert('Navigation', `Routing to ${incident.type} incident...`);
  };

  const acknowledgeIncident = (incident) => {
    Alert.alert('Acknowledged', `You have acknowledged the ${incident.type} incident.`);
  };

  const toggleLayer = (layerKey) => {
    setMapLayers(prev => ({
      ...prev,
      [layerKey]: !prev[layerKey]
    }));
  };

  const getIncidentIcon = (type) => {
    const icons = {
      medical: '🏥',
      fire: '🔥',
      police: '👮',
      natural: '🌪️',
      violence: '⚠️',
      technical: '⚡',
      trapped: '🚪',
      other: '❓'
    };
    return icons[type] || '❓';
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'new': return COLORS.statusNew;
      case 'acknowledged': return COLORS.statusAcknowledged;
      case 'en-route': return COLORS.statusEnRoute;
      case 'resolved': return COLORS.statusResolved;
      default: return COLORS.textMuted;
    }
  };

  const getIncidentPosition = (incident, index) => {
    // Mock positioning based on index and some randomization
    const baseX = 50 + (index * 30) % 200;
    const baseY = 100 + (index * 40) % 300;
    const randomX = (incident.location.latitude * 1000) % 50;
    const randomY = (incident.location.longitude * 1000) % 50;
    
    return {
      left: (baseX + randomX) % (screenWidth - 60),
      top: (baseY + randomY) % (screenHeight - 200),
    };
  };

  const renderIncidentPin = (incident, index) => {
    const position = getIncidentPosition(incident, index);
    const isSelected = selectedIncident?.id === incident.id;
    
    return (
      <TouchableOpacity
        key={incident.id}
        style={[
          styles.incidentPin,
          {
            backgroundColor: getStatusColor(incident.status),
            borderColor: isSelected ? COLORS.textPrimary : 'transparent',
            borderWidth: isSelected ? 2 : 0,
            ...position,
          },
        ]}
        onPress={() => handleIncidentPress(incident)}
      >
        <Text style={styles.incidentIcon}>
          {getIncidentIcon(incident.type)}
        </Text>
        {incident.urgency >= 8 && (
          <View style={styles.urgencyIndicator}>
            <Text style={styles.urgencyText}>!</Text>
          </View>
        )}
      </TouchableOpacity>
    );
  };

  const renderHazardZone = (hazard, index) => {
    const position = {
      left: 100 + (index * 80),
      top: 150 + (index * 60),
      width: 80,
      height: 60,
    };

    return (
      <View
        key={hazard.id}
        style={[
          styles.hazardZone,
          position,
          {
            backgroundColor: hazard.severity === 'high' 
              ? 'rgba(239, 68, 68, 0.3)' 
              : 'rgba(245, 158, 11, 0.3)',
            borderColor: hazard.severity === 'high' 
              ? COLORS.emergency 
              : COLORS.warning,
          },
        ]}
      >
        <Text style={styles.hazardText}>
          {hazard.type === 'flood' ? '🌊' : '💨'}
        </Text>
      </View>
    );
  };

  const renderEvacuationRoute = (route, index) => {
    return (
      <View
        key={route.id}
        style={[
          styles.evacuationRoute,
          {
            left: 20,
            top: 200 + (index * 100),
            width: screenWidth - 40,
          },
        ]}
      >
        <LinearGradient
          colors={['rgba(59, 130, 246, 0.6)', 'rgba(16, 185, 129, 0.6)']}
          style={styles.routeLine}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
        />
        <Text style={styles.routeLabel}>{route.name}</Text>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {/* Mock Map Background */}
      <View style={styles.mapBackground}>
        <LinearGradient
          colors={['#1f2937', '#374151', '#4b5563']}
          style={styles.mapGradient}
        />
        
        {/* Grid Lines for Map Feel */}
        <View style={styles.gridContainer}>
          {Array.from({ length: 10 }).map((_, i) => (
            <View key={`h-${i}`} style={[styles.gridLineHorizontal, { top: i * 50 }]} />
          ))}
          {Array.from({ length: 8 }).map((_, i) => (
            <View key={`v-${i}`} style={[styles.gridLineVertical, { left: i * 50 }]} />
          ))}
        </View>

        {/* Map Content */}
        {mapLayers.victims && incidents.map((incident, index) => 
          renderIncidentPin(incident, index)
        )}
        
        {mapLayers.hazards && MOCK_HAZARD_ZONES.map((hazard, index) => 
          renderHazardZone(hazard, index)
        )}
        
        {mapLayers.evacuation_routes && MOCK_EVACUATION_ROUTES.map((route, index) => 
          renderEvacuationRoute(route, index)
        )}

        {/* User Location Indicator */}
        <View style={styles.userLocation}>
          <View style={styles.userLocationDot} />
          <View style={styles.userLocationRing} />
        </View>

        {/* Compass */}
        <View style={styles.compass}>
          <Text style={styles.compassText}>N</Text>
          <View style={styles.compassNeedle} />
        </View>
      </View>

      {/* Layer Controls */}
      <View style={styles.layerControls}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {Object.entries(mapLayers).map(([key, enabled]) => (
            <TouchableOpacity
              key={key}
              style={[
                styles.layerButton,
                { backgroundColor: enabled ? COLORS.primary : COLORS.card }
              ]}
              onPress={() => toggleLayer(key)}
            >
              <Text style={styles.layerButtonText}>
                {key.replace('_', ' ').toUpperCase()}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Legend */}
      <View style={styles.legend}>
        <Text style={styles.legendTitle}>Legend</Text>
        <View style={styles.legendItems}>
          <View style={styles.legendItem}>
            <View style={[styles.legendColor, { backgroundColor: COLORS.statusNew }]} />
            <Text style={styles.legendText}>New</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendColor, { backgroundColor: COLORS.statusAcknowledged }]} />
            <Text style={styles.legendText}>Acknowledged</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendColor, { backgroundColor: COLORS.statusEnRoute }]} />
            <Text style={styles.legendText}>En Route</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendColor, { backgroundColor: COLORS.statusResolved }]} />
            <Text style={styles.legendText}>Resolved</Text>
          </View>
        </View>
      </View>

      {/* Map Info */}
      <View style={styles.mapInfo}>
        <Text style={styles.mapInfoText}>
          {incidents.filter(i => i.status === 'new').length} new incidents • 
          {incidents.filter(i => i.status === 'acknowledged').length} acknowledged
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  mapBackground: {
    flex: 1,
    position: 'relative',
  },
  mapGradient: {
    ...StyleSheet.absoluteFillObject,
  },
  gridContainer: {
    ...StyleSheet.absoluteFillObject,
  },
  gridLineHorizontal: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: 1,
    backgroundColor: COLORS.border,
    opacity: 0.3,
  },
  gridLineVertical: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    width: 1,
    backgroundColor: COLORS.border,
    opacity: 0.3,
  },
  incidentPin: {
    position: 'absolute',
    width: 50,
    height: 50,
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
    ...SHADOWS.medium,
  },
  incidentIcon: {
    fontSize: 20,
  },
  urgencyIndicator: {
    position: 'absolute',
    top: -5,
    right: -5,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: COLORS.emergency,
    alignItems: 'center',
    justifyContent: 'center',
  },
  urgencyText: {
    color: COLORS.textPrimary,
    fontSize: 12,
    fontWeight: 'bold',
  },
  hazardZone: {
    position: 'absolute',
    borderWidth: 2,
    borderRadius: SIZES.radiusMd,
    alignItems: 'center',
    justifyContent: 'center',
    borderStyle: 'dashed',
  },
  hazardText: {
    fontSize: 24,
  },
  evacuationRoute: {
    position: 'absolute',
    height: 6,
    borderRadius: 3,
  },
  routeLine: {
    flex: 1,
    borderRadius: 3,
  },
  routeLabel: {
    position: 'absolute',
    top: -20,
    left: 10,
    color: COLORS.textSecondary,
    fontSize: SIZES.fontSm,
    fontWeight: '500',
  },
  userLocation: {
    position: 'absolute',
    bottom: 100,
    left: screenWidth / 2 - 15,
    width: 30,
    height: 30,
    alignItems: 'center',
    justifyContent: 'center',
  },
  userLocationDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: COLORS.info,
  },
  userLocationRing: {
    position: 'absolute',
    width: 30,
    height: 30,
    borderRadius: 15,
    borderWidth: 2,
    borderColor: COLORS.info,
    opacity: 0.5,
  },
  compass: {
    position: 'absolute',
    top: 50,
    right: 20,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: COLORS.cardOverlay,
    alignItems: 'center',
    justifyContent: 'center',
    ...SHADOWS.medium,
  },
  compassText: {
    color: COLORS.textPrimary,
    fontSize: SIZES.fontMd,
    fontWeight: 'bold',
  },
  compassNeedle: {
    position: 'absolute',
    width: 2,
    height: 20,
    backgroundColor: COLORS.emergency,
    top: 10,
  },
  layerControls: {
    position: 'absolute',
    top: 120,
    left: 0,
    right: 0,
    height: 50,
  },
  layerButton: {
    marginLeft: SIZES.sm,
    paddingHorizontal: SIZES.md,
    paddingVertical: SIZES.sm,
    borderRadius: SIZES.radiusMd,
    alignItems: 'center',
    justifyContent: 'center',
  },
  layerButtonText: {
    color: COLORS.textPrimary,
    fontSize: SIZES.fontSm,
    fontWeight: '600',
  },
  legend: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    backgroundColor: COLORS.cardOverlay,
    padding: SIZES.md,
    borderRadius: SIZES.radiusMd,
    ...SHADOWS.medium,
  },
  legendTitle: {
    color: COLORS.textPrimary,
    fontSize: SIZES.fontSm,
    fontWeight: 'bold',
    marginBottom: SIZES.sm,
  },
  legendItems: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: SIZES.md,
    marginBottom: SIZES.xs,
  },
  legendColor: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: SIZES.xs,
  },
  legendText: {
    color: COLORS.textSecondary,
    fontSize: SIZES.fontXs,
  },
  mapInfo: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    backgroundColor: COLORS.cardOverlay,
    padding: SIZES.sm,
    borderRadius: SIZES.radiusSm,
  },
  mapInfoText: {
    color: COLORS.textSecondary,
    fontSize: SIZES.fontSm,
  },
});

export default MockMap;