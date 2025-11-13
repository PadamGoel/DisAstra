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
import { 
  MOCK_SOS_INCIDENTS, 
  MOCK_RESPONDER_TEAMS, 
  MOCK_USER_PROFILE,
  MOCK_ANALYTICS 
} from '../data/mockData';

const ResponderScreen = ({ navigation }) => {
  const [activeTab, setActiveTab] = useState('incidents'); // 'incidents', 'teams', 'analytics'
  const [selectedIncidents, setSelectedIncidents] = useState([]);

  const handleIncidentPress = (incident) => {
    showIncidentActions(incident);
  };

  const showIncidentActions = (incident) => {
    const actions = [];
    
    if (incident.status === 'new') {
      actions.push(
        { text: 'Acknowledge', onPress: () => acknowledgeIncident(incident) },
        { text: 'Assign Team', onPress: () => showTeamSelection(incident) }
      );
    } else if (incident.status === 'acknowledged') {
      actions.push(
        { text: 'Dispatch Team', onPress: () => dispatchTeam(incident) },
        { text: 'Update Status', onPress: () => updateIncidentStatus(incident) }
      );
    } else if (incident.status === 'en-route') {
      actions.push(
        { text: 'Mark On Scene', onPress: () => markOnScene(incident) },
        { text: 'Send Update', onPress: () => sendUpdate(incident) }
      );
    }

    actions.push(
      { text: 'View Details', onPress: () => showIncidentDetails(incident) },
      { text: 'Cancel', style: 'cancel' }
    );

    Alert.alert(
      `${incident.type.toUpperCase()} Emergency`,
      `Status: ${incident.status}\nUrgency: ${incident.urgency}/10`,
      actions
    );
  };

  const acknowledgeIncident = (incident) => {
    Alert.alert(
      '✅ Incident Acknowledged',
      `${incident.type} emergency has been acknowledged. Victim will be notified that help is coming.`
    );
  };

  const showTeamSelection = (incident) => {
    const availableTeams = MOCK_RESPONDER_TEAMS.filter(team => 
      team.status === 'available' && team.type === incident.type
    );

    if (availableTeams.length === 0) {
      Alert.alert('No Teams Available', `No ${incident.type} response teams are currently available.`);
      return;
    }

    Alert.alert(
      'Assign Response Team',
      'Select a team to assign to this incident:',
      [
        ...availableTeams.map(team => ({
          text: `${team.name} (${team.members} members)`,
          onPress: () => assignTeam(incident, team)
        })),
        { text: 'Cancel', style: 'cancel' }
      ]
    );
  };

  const assignTeam = (incident, team) => {
    Alert.alert(
      '🚁 Team Assigned',
      `${team.name} has been assigned to the ${incident.type} emergency.\n\nTeam will be notified immediately and can begin response.`
    );
  };

  const dispatchTeam = (incident) => {
    Alert.alert(
      '🚨 Team Dispatched',
      `Response team is now en route to the ${incident.type} emergency.\n\nEstimated arrival: 6-8 minutes\nVictim has been notified.`
    );
  };

  const updateIncidentStatus = (incident) => {
    Alert.alert(
      'Update Status',
      'Select new status for this incident:',
      [
        { text: 'En Route', onPress: () => Alert.alert('Status Updated', 'Incident marked as En Route') },
        { text: 'On Scene', onPress: () => Alert.alert('Status Updated', 'Incident marked as On Scene') },
        { text: 'Resolved', onPress: () => Alert.alert('Status Updated', 'Incident marked as Resolved') },
        { text: 'Cancel', style: 'cancel' }
      ]
    );
  };

  const markOnScene = (incident) => {
    Alert.alert(
      '📍 On Scene',
      `Response team has arrived at the ${incident.type} emergency location.\n\nBeginning emergency response procedures.`
    );
  };

  const sendUpdate = (incident) => {
    Alert.alert(
      'Send Update',
      'What type of update would you like to send?',
      [
        { text: 'ETA Update', onPress: () => Alert.alert('Update Sent', 'ETA update sent to victim') },
        { text: 'Status Update', onPress: () => Alert.alert('Update Sent', 'Status update sent to victim') },
        { text: 'Request Info', onPress: () => Alert.alert('Update Sent', 'Information request sent to victim') },
        { text: 'Cancel', style: 'cancel' }
      ]
    );
  };

  const showIncidentDetails = (incident) => {
    const timeAgo = getTimeAgo(incident.timestamp);
    Alert.alert(
      `${incident.type.toUpperCase()} Emergency Details`,
      `Message: ${incident.message}\n\nTime: ${timeAgo}\nLocation: ${incident.distance}m from station\nBattery: ${incident.batteryLevel}%\nUrgency: ${incident.urgency}/10\nDevice: ${incident.deviceId}${incident.assignedTeam ? `\nAssigned: ${incident.assignedTeam}` : ''}${incident.eta ? `\nETA: ${incident.eta} minutes` : ''}`,
      [{ text: 'OK' }]
    );
  };

  const getTimeAgo = (timestamp) => {
    const now = Date.now();
    const diff = now - timestamp;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(minutes / 60);
    
    if (hours > 0) return `${hours}h ${minutes % 60}m ago`;
    return `${minutes}m ago`;
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

  const getEmergencyIcon = (type) => {
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

  const renderIncidentCard = ({ item: incident }) => (
    <TouchableOpacity
      style={styles.incidentCard}
      onPress={() => handleIncidentPress(incident)}
    >
      <LinearGradient
        colors={[COLORS.surface, COLORS.card]}
        style={styles.cardGradient}
      >
        <View style={styles.cardHeader}>
          <View style={styles.incidentInfo}>
            <Text style={styles.emergencyIcon}>
              {getEmergencyIcon(incident.type)}
            </Text>
            <View style={styles.incidentDetails}>
              <Text style={styles.incidentType}>
                {incident.type.toUpperCase()}
              </Text>
              <Text style={styles.incidentTime}>
                {getTimeAgo(incident.timestamp)}
              </Text>
            </View>
          </View>
          
          <View style={[styles.statusBadge, { backgroundColor: getStatusColor(incident.status) }]}>
            <Text style={styles.statusText}>{incident.status.toUpperCase()}</Text>
          </View>
        </View>

        <Text style={styles.incidentMessage} numberOfLines={2}>
          {incident.message}
        </Text>

        <View style={styles.metaInfo}>
          <Text style={styles.metaText}>🎯 Urgency: {incident.urgency}/10</Text>
          <Text style={styles.metaText}>📍 {incident.distance}m away</Text>
          <Text style={styles.metaText}>🔋 {incident.batteryLevel}%</Text>
        </View>

        {incident.assignedTeam && (
          <View style={styles.assignmentBadge}>
            <Text style={styles.assignmentText}>👥 {incident.assignedTeam}</Text>
          </View>
        )}
      </LinearGradient>
    </TouchableOpacity>
  );

  const renderTeamCard = ({ item: team }) => (
    <View style={styles.teamCard}>
      <LinearGradient
        colors={[COLORS.surface, COLORS.card]}
        style={styles.cardGradient}
      >
        <View style={styles.teamHeader}>
          <Text style={styles.teamName}>{team.name}</Text>
          <View style={[
            styles.teamStatusBadge,
            { backgroundColor: team.status === 'available' ? COLORS.success : COLORS.warning }
          ]}>
            <Text style={styles.teamStatusText}>{team.status.toUpperCase()}</Text>
          </View>
        </View>

        <View style={styles.teamInfo}>
          <Text style={styles.teamDetail}>👥 {team.members} members</Text>
          <Text style={styles.teamDetail}>⚡ {team.specialization}</Text>
          <Text style={styles.teamDetail}>📍 {team.location.latitude.toFixed(4)}, {team.location.longitude.toFixed(4)}</Text>
        </View>

        <TouchableOpacity 
          style={styles.teamActionButton}
          onPress={() => Alert.alert('Team Actions', `Manage ${team.name}`)}
        >
          <Text style={styles.teamActionText}>Manage Team</Text>
        </TouchableOpacity>
      </LinearGradient>
    </View>
  );

  const renderAnalyticsCard = (title, value, icon, color = COLORS.primary) => (
    <View style={[styles.analyticsCard, { borderLeftColor: color }]}>
      <Text style={styles.analyticsIcon}>{icon}</Text>
      <View style={styles.analyticsContent}>
        <Text style={styles.analyticsValue}>{value}</Text>
        <Text style={styles.analyticsTitle}>{title}</Text>
      </View>
    </View>
  );

  const getActiveIncidents = () => {
    return MOCK_SOS_INCIDENTS.filter(i => ['new', 'acknowledged', 'en-route'].includes(i.status));
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'teams':
        return (
          <FlatList
            data={MOCK_RESPONDER_TEAMS}
            renderItem={renderTeamCard}
            keyExtractor={item => item.id}
            contentContainerStyle={styles.listContainer}
            showsVerticalScrollIndicator={false}
          />
        );

      case 'analytics':
        return (
          <ScrollView style={styles.analyticsContainer} showsVerticalScrollIndicator={false}>
            <View style={styles.analyticsGrid}>
              {renderAnalyticsCard('Urgency Score', MOCK_ANALYTICS.urgencyScore, '🎯', COLORS.emergency)}
              {renderAnalyticsCard('Network Health', `${MOCK_ANALYTICS.networkHealth}%`, '📶', COLORS.success)}
              {renderAnalyticsCard('Response Time', MOCK_ANALYTICS.responseTime, '⏱️', COLORS.info)}
              {renderAnalyticsCard('Active Cases', MOCK_ANALYTICS.activeCases, '🚨', COLORS.warning)}
              {renderAnalyticsCard('Resolved Today', MOCK_ANALYTICS.resolvedToday, '✅', COLORS.success)}
              {renderAnalyticsCard('Safety Index', MOCK_ANALYTICS.safetyIndex, '🛡️', COLORS.primary)}
            </View>
            
            <View style={styles.peakHoursCard}>
              <Text style={styles.peakHoursTitle}>📊 Peak Emergency Hours</Text>
              <Text style={styles.peakHoursValue}>{MOCK_ANALYTICS.peakHours}</Text>
              <Text style={styles.peakHoursDescription}>
                Highest incident volume typically occurs during these hours.
              </Text>
            </View>
          </ScrollView>
        );

      default: // incidents
        return (
          <FlatList
            data={getActiveIncidents()}
            renderItem={renderIncidentCard}
            keyExtractor={item => item.id}
            contentContainerStyle={styles.listContainer}
            showsVerticalScrollIndicator={false}
          />
        );
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Responder Dashboard</Text>
        <Text style={styles.headerSubtitle}>
          {getActiveIncidents().length} active incidents • {MOCK_RESPONDER_TEAMS.filter(t => t.status === 'available').length} teams available
        </Text>
      </View>

      {/* Tab Navigation */}
      <View style={styles.tabContainer}>
        {[
          { key: 'incidents', label: 'Incidents', icon: '🚨' },
          { key: 'teams', label: 'Teams', icon: '👥' },
          { key: 'analytics', label: 'Analytics', icon: '📊' }
        ].map(tab => (
          <TouchableOpacity
            key={tab.key}
            style={[styles.tabButton, activeTab === tab.key && styles.tabButtonActive]}
            onPress={() => setActiveTab(tab.key)}
          >
            <Text style={styles.tabIcon}>{tab.icon}</Text>
            <Text style={[
              styles.tabLabel,
              activeTab === tab.key && styles.tabLabelActive
            ]}>
              {tab.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Content */}
      <View style={styles.content}>
        {renderTabContent()}
      </View>

      {/* Quick Actions */}
      <View style={styles.quickActions}>
        <TouchableOpacity 
          style={styles.quickActionButton}
          onPress={() => Alert.alert('Broadcast', 'Emergency broadcast sent to all teams')}
        >
          <Text style={styles.quickActionText}>📢 Broadcast</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.quickActionButton}
          onPress={() => navigation.navigate('Map')}
        >
          <Text style={styles.quickActionText}>🗺️ Map View</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.quickActionButton, styles.quickActionButtonPrimary]}
          onPress={() => Alert.alert('Emergency', 'Emergency response protocol activated')}
        >
          <Text style={[styles.quickActionText, styles.quickActionTextPrimary]}>
            🚨 Emergency
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
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: COLORS.surface,
    paddingHorizontal: SIZES.md,
    paddingBottom: SIZES.sm,
  },
  tabButton: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: SIZES.sm,
    borderRadius: SIZES.radiusMd,
    marginHorizontal: SIZES.xs,
  },
  tabButtonActive: {
    backgroundColor: COLORS.primary,
  },
  tabIcon: {
    fontSize: SIZES.fontLg,
    marginBottom: SIZES.xs,
  },
  tabLabel: {
    color: COLORS.textMuted,
    fontSize: SIZES.fontSm,
    fontWeight: '600',
  },
  tabLabelActive: {
    color: COLORS.textPrimary,
  },
  content: {
    flex: 1,
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
  teamCard: {
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
  incidentInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  emergencyIcon: {
    fontSize: SIZES.fontLg,
    marginRight: SIZES.sm,
  },
  incidentDetails: {
    flex: 1,
  },
  incidentType: {
    color: COLORS.textPrimary,
    fontSize: SIZES.fontMd,
    fontWeight: 'bold',
  },
  incidentTime: {
    color: COLORS.textMuted,
    fontSize: SIZES.fontSm,
  },
  statusBadge: {
    paddingHorizontal: SIZES.sm,
    paddingVertical: SIZES.xs,
    borderRadius: SIZES.radiusSm,
  },
  statusText: {
    color: COLORS.textPrimary,
    fontSize: SIZES.fontXs,
    fontWeight: 'bold',
  },
  incidentMessage: {
    color: COLORS.textSecondary,
    fontSize: SIZES.fontMd,
    marginBottom: SIZES.sm,
    lineHeight: SIZES.fontMd * 1.3,
  },
  metaInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: SIZES.sm,
  },
  metaText: {
    color: COLORS.textMuted,
    fontSize: SIZES.fontSm,
  },
  assignmentBadge: {
    backgroundColor: COLORS.info,
    paddingHorizontal: SIZES.sm,
    paddingVertical: SIZES.xs,
    borderRadius: SIZES.radiusSm,
    alignSelf: 'flex-start',
  },
  assignmentText: {
    color: COLORS.textPrimary,
    fontSize: SIZES.fontSm,
    fontWeight: '600',
  },
  teamHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SIZES.md,
  },
  teamName: {
    color: COLORS.textPrimary,
    fontSize: SIZES.fontLg,
    fontWeight: 'bold',
    flex: 1,
  },
  teamStatusBadge: {
    paddingHorizontal: SIZES.sm,
    paddingVertical: SIZES.xs,
    borderRadius: SIZES.radiusSm,
  },
  teamStatusText: {
    color: COLORS.textPrimary,
    fontSize: SIZES.fontXs,
    fontWeight: 'bold',
  },
  teamInfo: {
    marginBottom: SIZES.md,
  },
  teamDetail: {
    color: COLORS.textSecondary,
    fontSize: SIZES.fontSm,
    marginBottom: SIZES.xs,
  },
  teamActionButton: {
    backgroundColor: COLORS.primary,
    paddingVertical: SIZES.sm,
    borderRadius: SIZES.radiusSm,
    alignItems: 'center',
  },
  teamActionText: {
    color: COLORS.textPrimary,
    fontSize: SIZES.fontMd,
    fontWeight: '600',
  },
  analyticsContainer: {
    flex: 1,
    padding: SIZES.md,
  },
  analyticsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: SIZES.lg,
  },
  analyticsCard: {
    width: '48%',
    backgroundColor: COLORS.surface,
    padding: SIZES.md,
    borderRadius: SIZES.radiusMd,
    borderLeftWidth: 4,
    marginBottom: SIZES.md,
    flexDirection: 'row',
    alignItems: 'center',
    ...SHADOWS.small,
  },
  analyticsIcon: {
    fontSize: SIZES.fontXl,
    marginRight: SIZES.md,
  },
  analyticsContent: {
    flex: 1,
  },
  analyticsValue: {
    color: COLORS.textPrimary,
    fontSize: SIZES.fontLg,
    fontWeight: 'bold',
  },
  analyticsTitle: {
    color: COLORS.textMuted,
    fontSize: SIZES.fontSm,
  },
  peakHoursCard: {
    backgroundColor: COLORS.surface,
    padding: SIZES.lg,
    borderRadius: SIZES.radiusMd,
    alignItems: 'center',
    ...SHADOWS.medium,
  },
  peakHoursTitle: {
    color: COLORS.textPrimary,
    fontSize: SIZES.fontLg,
    fontWeight: 'bold',
    marginBottom: SIZES.sm,
  },
  peakHoursValue: {
    color: COLORS.primary,
    fontSize: SIZES.fontXxl,
    fontWeight: 'bold',
    marginBottom: SIZES.sm,
  },
  peakHoursDescription: {
    color: COLORS.textSecondary,
    fontSize: SIZES.fontSm,
    textAlign: 'center',
  },
  quickActions: {
    flexDirection: 'row',
    padding: SIZES.lg,
    gap: SIZES.sm,
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
    backgroundColor: COLORS.emergency,
    borderColor: COLORS.emergency,
  },
  quickActionText: {
    color: COLORS.textSecondary,
    fontSize: SIZES.fontSm,
    fontWeight: '600',
  },
  quickActionTextPrimary: {
    color: COLORS.textPrimary,
  },
});

export default ResponderScreen;