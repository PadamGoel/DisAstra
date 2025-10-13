import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  Pressable,
  ScrollView,
  Alert,
} from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS, SIZES } from '../../constants/theme';

const ResponderOverviewScreen = ({ navigation }) => {
  const [dashboardStats, setDashboardStats] = useState({
    activeIncidents: 12,
    resolvedToday: 8,
    teamsActive: 5,
    averageResponseTime: '4.2 min',
  });

  const [recentIncidents, setRecentIncidents] = useState([
    {
      id: 1,
      type: 'fire',
      location: 'Sector 22, Chandigarh',
      victims: 3,
      priority: 'High',
      time: '2 min ago',
      status: 'new',
      assignedTeam: null,
    },
    {
      id: 2,
      type: 'medical',
      location: 'Sector 11, Chandigarh',
      victims: 1,
      priority: 'Moderate',
      time: '5 min ago',
      status: 'in-progress',
      assignedTeam: 'Alpha Team',
    },
    {
      id: 3,
      type: 'flood',
      location: 'Sector 5, Chandigarh',
      victims: 8,
      priority: 'Low',
      time: '12 min ago',
      status: 'acknowledged',
      assignedTeam: 'Bravo Team',
    },
  ]);

  const [teams, setTeams] = useState([
    { id: 1, name: 'Alpha Team', status: 'engaged', members: 4, location: 'Sector 11' },
    { id: 2, name: 'Bravo Team', status: 'on-route', members: 3, location: 'En route to Sector 5' },
    { id: 3, name: 'Charlie Team', status: 'idle', members: 5, location: 'Base Station' },
    { id: 4, name: 'Delta Team', status: 'idle', members: 3, location: 'Base Station' },
  ]);

  const getIncidentIcon = (type) => {
    switch (type) {
      case 'fire': return '🔥';
      case 'medical': return '🏥';
      case 'flood': return '🌊';
      case 'trapped': return '🏢';
      default: return '🚨';
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority.toLowerCase()) {
      case 'high': return COLORS.emergency;
      case 'moderate': return COLORS.warning;
      case 'low': return COLORS.info;
      default: return COLORS.textMuted;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'new': return COLORS.emergency;
      case 'acknowledged': return COLORS.warning;
      case 'in-progress': return COLORS.info;
      case 'resolved': return COLORS.success;
      default: return COLORS.textMuted;
    }
  };

  const getTeamStatusColor = (status) => {
    switch (status) {
      case 'engaged': return COLORS.success;
      case 'on-route': return COLORS.info;
      case 'idle': return COLORS.textMuted;
      default: return COLORS.textMuted;
    }
  };

  const handleIncidentPress = (incident) => {
    Alert.alert(
      `${getIncidentIcon(incident.type)} ${incident.type.toUpperCase()} Emergency`,
      `Location: ${incident.location}\nVictims: ${incident.victims}\nPriority: ${incident.priority}\nTime: ${incident.time}\nStatus: ${incident.status}\nAssigned: ${incident.assignedTeam || 'None'}`,
      [
        { text: 'View Details', onPress: () => navigation?.navigate('Incidents') },
        { text: 'Assign Team', onPress: () => handleAssignTeam(incident) },
        { text: 'Acknowledge', onPress: () => handleAcknowledge(incident) },
        { text: 'Close' },
      ]
    );
  };

  const handleAssignTeam = (incident) => {
    const availableTeams = teams.filter(t => t.status === 'idle');
    if (availableTeams.length === 0) {
      Alert.alert('No Teams Available', 'All teams are currently busy.');
      return;
    }

    Alert.alert(
      'Assign Team',
      `Select a team for ${incident.type} emergency:`,
      [
        ...availableTeams.map(team => ({
          text: `${team.name} (${team.members} members)`,
          onPress: () => {
            Alert.alert('Team Assigned', `${team.name} has been assigned to this incident.`);
            // Update incident and team status
            setRecentIncidents(prev => prev.map(inc => 
              inc.id === incident.id 
                ? { ...inc, assignedTeam: team.name, status: 'acknowledged' }
                : inc
            ));
            setTeams(prev => prev.map(t => 
              t.id === team.id 
                ? { ...t, status: 'on-route' }
                : t
            ));
          }
        })),
        { text: 'Cancel', style: 'cancel' }
      ]
    );
  };

  const handleAcknowledge = (incident) => {
    Alert.alert(
      'Acknowledge Incident',
      'This will send a confirmation to the victim that help is on the way.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Acknowledge',
          onPress: () => {
            setRecentIncidents(prev => prev.map(inc => 
              inc.id === incident.id 
                ? { ...inc, status: 'acknowledged' }
                : inc
            ));
            Alert.alert('Acknowledged', 'Victim has been notified that help is coming.');
          }
        }
      ]
    );
  };

  const handleQuickAction = (action) => {
    switch (action) {
      case 'broadcast':
        Alert.alert('Emergency Broadcast', 'Emergency alert sent to all teams and civilians.');
        break;
      case 'deploy-all':
        Alert.alert('Deploy All Teams', 'All available teams have been deployed.');
        setTeams(prev => prev.map(t => 
          t.status === 'idle' 
            ? { ...t, status: 'on-route' }
            : t
        ));
        break;
      case 'situation-report':
        Alert.alert(
          'Situation Report',
          `Active Incidents: ${dashboardStats.activeIncidents}\nActive Teams: ${dashboardStats.teamsActive}\nResponse Time: ${dashboardStats.averageResponseTime}\n\nAll systems operational.`
        );
        break;
    }
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
            <Text style={styles.headerTitle}>Responder Overview</Text>
            <Text style={styles.headerSubtitle}>Command & Control Dashboard</Text>
          </View>

          {/* Stats Cards */}
          <View style={styles.statsContainer}>
            <View style={[styles.statCard, { borderLeftColor: COLORS.emergency }]}>
              <Text style={styles.statNumber}>{dashboardStats.activeIncidents}</Text>
              <Text style={styles.statLabel}>Active Incidents</Text>
            </View>
            <View style={[styles.statCard, { borderLeftColor: COLORS.success }]}>
              <Text style={styles.statNumber}>{dashboardStats.resolvedToday}</Text>
              <Text style={styles.statLabel}>Resolved Today</Text>
            </View>
            <View style={[styles.statCard, { borderLeftColor: COLORS.info }]}>
              <Text style={styles.statNumber}>{dashboardStats.teamsActive}</Text>
              <Text style={styles.statLabel}>Teams Active</Text>
            </View>
            <View style={[styles.statCard, { borderLeftColor: COLORS.warning }]}>
              <Text style={styles.statNumber}>{dashboardStats.averageResponseTime}</Text>
              <Text style={styles.statLabel}>Avg Response</Text>
            </View>
          </View>

          {/* Quick Actions */}
          <View style={styles.quickActionsContainer}>
            <Text style={styles.sectionTitle}>Quick Actions</Text>
            <View style={styles.quickActions}>
              <Pressable 
                style={[styles.quickActionButton, { backgroundColor: COLORS.emergency + '20' }]}
                onPress={() => handleQuickAction('broadcast')}
              >
                <Text style={styles.quickActionIcon}>📢</Text>
                <Text style={[styles.quickActionText, { color: COLORS.emergency }]}>
                  Emergency Broadcast
                </Text>
              </Pressable>
              
              <Pressable 
                style={[styles.quickActionButton, { backgroundColor: COLORS.primary + '20' }]}
                onPress={() => handleQuickAction('deploy-all')}
              >
                <Text style={styles.quickActionIcon}>🚑</Text>
                <Text style={[styles.quickActionText, { color: COLORS.primary }]}>
                  Deploy All Teams
                </Text>
              </Pressable>
              
              <Pressable 
                style={[styles.quickActionButton, { backgroundColor: COLORS.info + '20' }]}
                onPress={() => handleQuickAction('situation-report')}
              >
                <Text style={styles.quickActionIcon}>📊</Text>
                <Text style={[styles.quickActionText, { color: COLORS.info }]}>
                  Situation Report
                </Text>
              </Pressable>
              
              <Pressable 
                style={[styles.quickActionButton, { backgroundColor: COLORS.success + '20' }]}
                onPress={() => navigation.navigate('Handshake', { userRole: 'responder', incidentId: 'INC-001' })}
              >
                <Text style={styles.quickActionIcon}>🤝</Text>
                <Text style={[styles.quickActionText, { color: COLORS.success }]}>
                  Connect to User
                </Text>
              </Pressable>
            </View>
          </View>

          {/* Recent Incidents */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Recent Incidents</Text>
            {recentIncidents.map((incident) => (
              <Pressable 
                key={incident.id}
                style={styles.incidentCard}
                onPress={() => handleIncidentPress(incident)}
              >
                <View style={styles.incidentHeader}>
                  <View style={styles.incidentTypeContainer}>
                    <Text style={styles.incidentIcon}>{getIncidentIcon(incident.type)}</Text>
                    <Text style={styles.incidentType}>{incident.type.toUpperCase()}</Text>
                  </View>
                  <View style={[styles.priorityBadge, { backgroundColor: getPriorityColor(incident.priority) }]}>
                    <Text style={styles.priorityText}>{incident.priority}</Text>
                  </View>
                </View>
                
                <Text style={styles.incidentLocation}>{incident.location}</Text>
                <Text style={styles.incidentDetails}>
                  {incident.victims} victim{incident.victims !== 1 ? 's' : ''} • {incident.time}
                </Text>
                
                <View style={styles.incidentFooter}>
                  <View style={[styles.statusBadge, { backgroundColor: getStatusColor(incident.status) }]}>
                    <Text style={styles.statusText}>{incident.status.replace('-', ' ')}</Text>
                  </View>
                  {incident.assignedTeam && (
                    <Text style={styles.assignedTeam}>📋 {incident.assignedTeam}</Text>
                  )}
                </View>
              </Pressable>
            ))}
          </View>

          {/* Team Status */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Team Status</Text>
            {teams.map((team) => (
              <View key={team.id} style={styles.teamCard}>
                <View style={styles.teamHeader}>
                  <Text style={styles.teamName}>{team.name}</Text>
                  <View style={[styles.teamStatusBadge, { backgroundColor: getTeamStatusColor(team.status) }]}>
                    <Text style={styles.teamStatusText}>{team.status}</Text>
                  </View>
                </View>
                <Text style={styles.teamDetails}>
                  {team.members} members • {team.location}
                </Text>
              </View>
            ))}
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
    padding: SIZES.lg,
  },
  header: {
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
  },
  statsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SIZES.md,
    marginBottom: SIZES.xl,
  },
  statCard: {
    backgroundColor: COLORS.surface,
    borderRadius: SIZES.radiusMd,
    padding: SIZES.md,
    flex: 1,
    minWidth: '45%',
    borderLeftWidth: 4,
    elevation: 2,
  },
  statNumber: {
    fontSize: SIZES.fontXl,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
    marginBottom: SIZES.xs,
  },
  statLabel: {
    fontSize: SIZES.fontSm,
    color: COLORS.textSecondary,
  },
  quickActionsContainer: {
    marginBottom: SIZES.xl,
  },
  sectionTitle: {
    fontSize: SIZES.fontLg,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
    marginBottom: SIZES.md,
  },
  quickActions: {
    flexDirection: 'row',
    gap: SIZES.sm,
  },
  quickActionButton: {
    flex: 1,
    backgroundColor: COLORS.surface,
    borderRadius: SIZES.radiusMd,
    paddingVertical: SIZES.lg,
    alignItems: 'center',
    elevation: 1,
  },
  quickActionIcon: {
    fontSize: 24,
    marginBottom: SIZES.sm,
  },
  quickActionText: {
    fontSize: SIZES.fontSm,
    fontWeight: '600',
    textAlign: 'center',
  },
  section: {
    marginBottom: SIZES.xl,
  },
  incidentCard: {
    backgroundColor: COLORS.surface,
    borderRadius: SIZES.radiusMd,
    padding: SIZES.md,
    marginBottom: SIZES.md,
    elevation: 1,
  },
  incidentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SIZES.sm,
  },
  incidentTypeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SIZES.sm,
  },
  incidentIcon: {
    fontSize: 20,
  },
  incidentType: {
    fontSize: SIZES.fontMd,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
  },
  priorityBadge: {
    paddingHorizontal: SIZES.sm,
    paddingVertical: SIZES.xs,
    borderRadius: SIZES.radiusSm,
  },
  priorityText: {
    fontSize: SIZES.fontSm,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  incidentLocation: {
    fontSize: SIZES.fontMd,
    color: COLORS.textSecondary,
    marginBottom: SIZES.xs,
  },
  incidentDetails: {
    fontSize: SIZES.fontSm,
    color: COLORS.textMuted,
    marginBottom: SIZES.sm,
  },
  incidentFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statusBadge: {
    paddingHorizontal: SIZES.sm,
    paddingVertical: SIZES.xs,
    borderRadius: SIZES.radiusSm,
  },
  statusText: {
    fontSize: SIZES.fontSm,
    fontWeight: '600',
    color: '#FFFFFF',
    textTransform: 'capitalize',
  },
  assignedTeam: {
    fontSize: SIZES.fontSm,
    color: COLORS.textMuted,
  },
  teamCard: {
    backgroundColor: COLORS.surface,
    borderRadius: SIZES.radiusMd,
    padding: SIZES.md,
    marginBottom: SIZES.sm,
    elevation: 1,
  },
  teamHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SIZES.sm,
  },
  teamName: {
    fontSize: SIZES.fontMd,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
  },
  teamStatusBadge: {
    paddingHorizontal: SIZES.sm,
    paddingVertical: SIZES.xs,
    borderRadius: SIZES.radiusSm,
  },
  teamStatusText: {
    fontSize: SIZES.fontSm,
    fontWeight: '600',
    color: '#FFFFFF',
    textTransform: 'capitalize',
  },
  teamDetails: {
    fontSize: SIZES.fontSm,
    color: COLORS.textSecondary,
  },
});

export default ResponderOverviewScreen;