import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  Pressable,
  Alert,
} from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { COLORS, SIZES } from '../../constants/theme';

const ResponderTeamsScreen = ({ navigation }) => {
  const [teams, setTeams] = useState([
    { id: 1, name: 'Alpha Team', status: 'engaged', members: 4, location: 'Sector 11', leader: 'Captain Smith' },
    { id: 2, name: 'Bravo Team', status: 'on-route', members: 3, location: 'En route to Sector 5', leader: 'Lieutenant Johnson' },
    { id: 3, name: 'Charlie Team', status: 'idle', members: 5, location: 'Base Station', leader: 'Sergeant Brown' },
    { id: 4, name: 'Delta Team', status: 'idle', members: 3, location: 'Base Station', leader: 'Officer Davis' },
  ]);

  const getTeamStatusColor = (status) => {
    switch (status) {
      case 'engaged': return COLORS.success;
      case 'on-route': return COLORS.info;
      case 'idle': return COLORS.textMuted;
      default: return COLORS.textMuted;
    }
  };

  const handleTeamPress = (team) => {
    Alert.alert(
      `${team.name}`,
      `Leader: ${team.leader}\nMembers: ${team.members}\nStatus: ${team.status}\nLocation: ${team.location}`,
      [
        { text: 'View Details' },
        { text: 'Assign Task' },
        { text: 'Contact Team' },
        { text: 'Close' }
      ]
    );
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
            <Text style={styles.headerTitle}>👥 Team Management</Text>
            <Text style={styles.headerSubtitle}>Coordinate response teams</Text>
          </View>

          {/* Teams List */}
          <View style={styles.teamsContainer}>
            {teams.map((team) => (
              <Pressable 
                key={team.id} 
                style={styles.teamCard}
                onPress={() => handleTeamPress(team)}
              >
                <View style={styles.teamHeader}>
                  <Text style={styles.teamName}>{team.name}</Text>
                  <View style={[styles.teamStatusBadge, { backgroundColor: getTeamStatusColor(team.status) }]}>
                    <Text style={styles.teamStatusText}>{team.status}</Text>
                  </View>
                </View>
                <Text style={styles.teamLeader}>👤 {team.leader}</Text>
                <Text style={styles.teamDetails}>
                  {team.members} members • 📍 {team.location}
                </Text>
              </Pressable>
            ))}
          </View>

          {/* Quick Actions */}
          <View style={styles.actionsContainer}>
            <Text style={styles.sectionTitle}>Quick Actions</Text>
            <View style={styles.actions}>
              <Pressable style={styles.actionButton}>
                <Text style={styles.actionIcon}>📋</Text>
                <Text style={styles.actionText}>Create New Team</Text>
              </Pressable>
              
              <Pressable style={styles.actionButton}>
                <Text style={styles.actionIcon}>📢</Text>
                <Text style={styles.actionText}>Broadcast to All</Text>
              </Pressable>
              
              <Pressable style={styles.actionButton}>
                <Text style={styles.actionIcon}>🗺️</Text>
                <Text style={styles.actionText}>View on Map</Text>
              </Pressable>
            </View>
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
  teamsContainer: {
    marginBottom: SIZES.xl,
  },
  teamCard: {
    backgroundColor: COLORS.surface,
    borderRadius: SIZES.radiusMd,
    padding: SIZES.md,
    marginBottom: SIZES.md,
    elevation: 1,
  },
  teamHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SIZES.sm,
  },
  teamName: {
    fontSize: SIZES.fontLg,
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
  teamLeader: {
    fontSize: SIZES.fontMd,
    color: COLORS.textSecondary,
    marginBottom: SIZES.xs,
  },
  teamDetails: {
    fontSize: SIZES.fontSm,
    color: COLORS.textMuted,
  },
  actionsContainer: {
    marginBottom: SIZES.xl,
  },
  sectionTitle: {
    fontSize: SIZES.fontLg,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
    marginBottom: SIZES.md,
  },
  actions: {
    gap: SIZES.md,
  },
  actionButton: {
    backgroundColor: COLORS.surface,
    flexDirection: 'row',
    alignItems: 'center',
    padding: SIZES.lg,
    borderRadius: SIZES.radiusMd,
    elevation: 1,
  },
  actionIcon: {
    fontSize: 24,
    marginRight: SIZES.md,
  },
  actionText: {
    fontSize: SIZES.fontMd,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
});

export default ResponderTeamsScreen;