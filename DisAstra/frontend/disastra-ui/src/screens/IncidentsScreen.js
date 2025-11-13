import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Alert,
  FlatList,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS, SIZES, SHADOWS } from '../constants/theme';
import { MOCK_SOS_INCIDENTS, EMERGENCY_TYPES } from '../data/mockData';

const IncidentsScreen = ({ navigation }) => {
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [sortBy, setSortBy] = useState('timestamp'); // 'timestamp', 'urgency', 'distance'

  const getFilteredIncidents = () => {
    let filtered = MOCK_SOS_INCIDENTS;
    
    if (selectedFilter !== 'all') {
      filtered = filtered.filter(incident => incident.status === selectedFilter);
    }
    
    // Sort incidents
    return filtered.sort((a, b) => {
      switch (sortBy) {
        case 'urgency':
          return b.urgency - a.urgency;
        case 'distance':
          return a.distance - b.distance;
        case 'timestamp':
        default:
          return b.timestamp - a.timestamp;
      }
    });
  };

  const handleIncidentPress = (incident) => {
    showIncidentDetails(incident);
  };

  const showIncidentDetails = (incident) => {
    const statusEmoji = {
      'new': '🔴',
      'acknowledged': '🟡',
      'en-route': '🔵',
      'resolved': '✅'
    };

    const timeAgo = getTimeAgo(incident.timestamp);
    
    Alert.alert(
      `${statusEmoji[incident.status]} ${incident.type.toUpperCase()} Emergency`,
      `Message: ${incident.message}\n\nTime: ${timeAgo}\nDistance: ${incident.distance}m away\nBattery: ${incident.batteryLevel}%\nUrgency: ${incident.urgency}/10\nDevice: ${incident.deviceId}${incident.assignedTeam ? `\nAssigned to: ${incident.assignedTeam}` : ''}${incident.eta ? `\nETA: ${incident.eta} minutes` : ''}`,
      [
        { text: 'Dismiss' },
        { 
          text: 'View on Map', 
          onPress: () => navigation.navigate('Map') 
        },
        incident.status === 'new' && { 
          text: 'Respond', 
          onPress: () => respondToIncident(incident),
          style: 'default'
        }
      ].filter(Boolean)
    );
  };

  const respondToIncident = (incident) => {
    Alert.alert(
      '🚨 Confirm Response',
      `Do you want to respond to this ${incident.type} emergency?\n\nThis will notify the victim that help is coming.`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Confirm Response', 
          style: 'default',
          onPress: () => {
            Alert.alert(
              '✅ Response Confirmed',
              'You are now responding to this emergency. The victim has been notified.'
            );
          }
        }
      ]
    );
  };

  const getTimeAgo = (timestamp) => {
    const now = Date.now();
    const diff = now - timestamp;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);
    
    if (days > 0) return `${days}d ago`;
    if (hours > 0) return `${hours}h ago`;
    if (minutes > 0) return `${minutes}m ago`;
    return 'Just now';
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

  const getStatusIcon = (status) => {
    switch (status) {
      case 'new': return '🔴';
      case 'acknowledged': return '🟡';
      case 'en-route': return '🔵';
      case 'resolved': return '✅';
      default: return '⚪';
    }
  };

  const getEmergencyIcon = (type) => {
    const emergency = EMERGENCY_TYPES.find(e => e.id === type);
    return emergency ? emergency.label.split(' ')[0] : '❓';
  };

  const getUrgencyStyle = (urgency) => {
    if (urgency >= 9) return { backgroundColor: COLORS.emergency };
    if (urgency >= 7) return { backgroundColor: COLORS.warning };
    return { backgroundColor: COLORS.info };
  };

  const renderIncidentCard = ({ item: incident }) => (
    <TouchableOpacity
      style={styles.incidentCard}
      onPress={() => handleIncidentPress(incident)}
    >
      <LinearGradient
        colors={[COLORS.surface, COLORS.card]}
        style={styles.cardGradient}
      >
        {/* Header */}
        <View style={styles.cardHeader}>
          <View style={styles.incidentType}>
            <Text style={styles.emergencyIcon}>
              {getEmergencyIcon(incident.type)}
            </Text>
            <Text style={styles.incidentTypeText}>
              {incident.type.toUpperCase()}
            </Text>
          </View>
          
          <View style={styles.statusContainer}>
            <Text style={styles.statusIcon}>
              {getStatusIcon(incident.status)}
            </Text>
            <Text style={[styles.statusText, { color: getStatusColor(incident.status) }]}>
              {incident.status.toUpperCase()}
            </Text>
          </View>
        </View>

        {/* Message */}
        <Text style={styles.incidentMessage} numberOfLines={2}>
          {incident.message}
        </Text>

        {/* Details */}
        <View style={styles.incidentDetails}>
          <View style={styles.detailItem}>
            <Text style={styles.detailLabel}>Time</Text>
            <Text style={styles.detailValue}>
              {getTimeAgo(incident.timestamp)}
            </Text>
          </View>
          
          <View style={styles.detailItem}>
            <Text style={styles.detailLabel}>Distance</Text>
            <Text style={styles.detailValue}>
              {incident.distance}m
            </Text>
          </View>
          
          <View style={styles.detailItem}>
            <Text style={styles.detailLabel}>Battery</Text>
            <Text style={[
              styles.detailValue,
              { color: incident.batteryLevel < 30 ? COLORS.warning : COLORS.textSecondary }
            ]}>
              {incident.batteryLevel}%
            </Text>
          </View>
        </View>

        {/* Urgency Badge */}
        <View style={[styles.urgencyBadge, getUrgencyStyle(incident.urgency)]}>
          <Text style={styles.urgencyText}>
            Urgency: {incident.urgency}/10
          </Text>
        </View>

        {/* Assignment Info */}
        {incident.assignedTeam && (
          <View style={styles.assignmentInfo}>
            <Text style={styles.assignmentText}>
              📋 Assigned to: {incident.assignedTeam}
            </Text>
          </View>
        )}

        {/* ETA Info */}
        {incident.eta && (
          <View style={styles.etaInfo}>
            <Text style={styles.etaText}>
              ⏱️ ETA: {incident.eta} minutes
            </Text>
          </View>
        )}
      </LinearGradient>
    </TouchableOpacity>
  );

  const filterOptions = [
    { key: 'all', label: 'All', count: MOCK_SOS_INCIDENTS.length },
    { key: 'new', label: 'New', count: MOCK_SOS_INCIDENTS.filter(i => i.status === 'new').length },
    { key: 'acknowledged', label: 'Acknowledged', count: MOCK_SOS_INCIDENTS.filter(i => i.status === 'acknowledged').length },
    { key: 'en-route', label: 'En Route', count: MOCK_SOS_INCIDENTS.filter(i => i.status === 'en-route').length },
    { key: 'resolved', label: 'Resolved', count: MOCK_SOS_INCIDENTS.filter(i => i.status === 'resolved').length },
  ];

  const sortOptions = [
    { key: 'timestamp', label: 'Time' },
    { key: 'urgency', label: 'Urgency' },
    { key: 'distance', label: 'Distance' },
  ];

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Emergency Incidents</Text>
        <Text style={styles.headerSubtitle}>
          {getFilteredIncidents().length} incidents
        </Text>
      </View>

      {/* Filters */}
      <View style={styles.filtersContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {filterOptions.map(option => (
            <TouchableOpacity
              key={option.key}
              style={[
                styles.filterButton,
                selectedFilter === option.key && styles.filterButtonActive
              ]}
              onPress={() => setSelectedFilter(option.key)}
            >
              <Text style={[
                styles.filterButtonText,
                selectedFilter === option.key && styles.filterButtonTextActive
              ]}>
                {option.label} ({option.count})
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Sort Options */}
      <View style={styles.sortContainer}>
        <Text style={styles.sortLabel}>Sort by:</Text>
        {sortOptions.map(option => (
          <TouchableOpacity
            key={option.key}
            style={[
              styles.sortButton,
              sortBy === option.key && styles.sortButtonActive
            ]}
            onPress={() => setSortBy(option.key)}
          >
            <Text style={[
              styles.sortButtonText,
              sortBy === option.key && styles.sortButtonTextActive
            ]}>
              {option.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Incidents List */}
      <FlatList
        data={getFilteredIncidents()}
        renderItem={renderIncidentCard}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
      />

      {/* Quick Actions */}
      <View style={styles.quickActions}>
        <TouchableOpacity 
          style={styles.quickActionButton}
          onPress={() => navigation.navigate('Map')}
        >
          <Text style={styles.quickActionText}>View on Map</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.quickActionButton, styles.quickActionButtonPrimary]}
          onPress={() => Alert.alert('Refresh', 'Incident list refreshed')}
        >
          <Text style={[styles.quickActionText, styles.quickActionTextPrimary]}>
            Refresh
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    padding: SIZES.lg,
    backgroundColor: COLORS.surface,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  headerTitle: {
    color: COLORS.textPrimary,
    fontSize: SIZES.fontXl,
    fontWeight: 'bold',
    marginBottom: SIZES.xs,
  },
  headerSubtitle: {
    color: COLORS.textSecondary,
    fontSize: SIZES.fontMd,
  },
  filtersContainer: {
    paddingVertical: SIZES.md,
    paddingHorizontal: SIZES.sm,
  },
  filterButton: {
    paddingHorizontal: SIZES.md,
    paddingVertical: SIZES.sm,
    marginHorizontal: SIZES.xs,
    borderRadius: SIZES.radiusMd,
    backgroundColor: COLORS.card,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  filterButtonActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  filterButtonText: {
    color: COLORS.textSecondary,
    fontSize: SIZES.fontSm,
    fontWeight: '600',
  },
  filterButtonTextActive: {
    color: COLORS.textPrimary,
  },
  sortContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SIZES.lg,
    paddingBottom: SIZES.sm,
  },
  sortLabel: {
    color: COLORS.textSecondary,
    fontSize: SIZES.fontSm,
    marginRight: SIZES.md,
  },
  sortButton: {
    paddingHorizontal: SIZES.sm,
    paddingVertical: SIZES.xs,
    marginRight: SIZES.sm,
    borderRadius: SIZES.radiusSm,
    backgroundColor: COLORS.card,
  },
  sortButtonActive: {
    backgroundColor: COLORS.primary,
  },
  sortButtonText: {
    color: COLORS.textMuted,
    fontSize: SIZES.fontSm,
  },
  sortButtonTextActive: {
    color: COLORS.textPrimary,
  },
  listContainer: {
    padding: SIZES.md,
  },
  incidentCard: {
    marginBottom: SIZES.md,
    borderRadius: SIZES.radiusMd,
    overflow: 'hidden',
    ...SHADOWS.medium,
  },
  cardGradient: {
    padding: SIZES.md,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SIZES.sm,
  },
  incidentType: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  emergencyIcon: {
    fontSize: SIZES.fontLg,
    marginRight: SIZES.sm,
  },
  incidentTypeText: {
    color: COLORS.textPrimary,
    fontSize: SIZES.fontMd,
    fontWeight: 'bold',
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusIcon: {
    fontSize: SIZES.fontMd,
    marginRight: SIZES.xs,
  },
  statusText: {
    fontSize: SIZES.fontSm,
    fontWeight: '600',
  },
  incidentMessage: {
    color: COLORS.textSecondary,
    fontSize: SIZES.fontMd,
    marginBottom: SIZES.md,
    lineHeight: SIZES.fontMd * 1.3,
  },
  incidentDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: SIZES.sm,
  },
  detailItem: {
    alignItems: 'center',
  },
  detailLabel: {
    color: COLORS.textMuted,
    fontSize: SIZES.fontXs,
    marginBottom: 2,
  },
  detailValue: {
    color: COLORS.textSecondary,
    fontSize: SIZES.fontSm,
    fontWeight: '600',
  },
  urgencyBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: SIZES.sm,
    paddingVertical: SIZES.xs,
    borderRadius: SIZES.radiusSm,
    marginBottom: SIZES.sm,
  },
  urgencyText: {
    color: COLORS.textPrimary,
    fontSize: SIZES.fontSm,
    fontWeight: 'bold',
  },
  assignmentInfo: {
    backgroundColor: COLORS.info,
    paddingHorizontal: SIZES.sm,
    paddingVertical: SIZES.xs,
    borderRadius: SIZES.radiusSm,
    marginBottom: SIZES.xs,
  },
  assignmentText: {
    color: COLORS.textPrimary,
    fontSize: SIZES.fontSm,
    fontWeight: '500',
  },
  etaInfo: {
    backgroundColor: COLORS.success,
    paddingHorizontal: SIZES.sm,
    paddingVertical: SIZES.xs,
    borderRadius: SIZES.radiusSm,
  },
  etaText: {
    color: COLORS.textPrimary,
    fontSize: SIZES.fontSm,
    fontWeight: '500',
  },
  quickActions: {
    flexDirection: 'row',
    padding: SIZES.lg,
    gap: SIZES.md,
  },
  quickActionButton: {
    flex: 1,
    paddingVertical: SIZES.md,
    alignItems: 'center',
    borderRadius: SIZES.radiusMd,
    backgroundColor: COLORS.card,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  quickActionButtonPrimary: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  quickActionText: {
    color: COLORS.textSecondary,
    fontSize: SIZES.fontMd,
    fontWeight: '600',
  },
  quickActionTextPrimary: {
    color: COLORS.textPrimary,
  },
});

export default IncidentsScreen;