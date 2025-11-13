import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  Pressable,
  ScrollView,
  Alert,
  FlatList,
  Modal,
} from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS, SIZES } from '../../constants/theme';

const ResponderIncidentsScreen = ({ navigation }) => {
  const [activeFilter, setActiveFilter] = useState('all');
  const [selectedIncident, setSelectedIncident] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);

  const [incidents, setIncidents] = useState([
    {
      id: 1,
      type: 'fire',
      location: 'Sector 22, Chandigarh',
      coordinates: { lat: 30.7333, lng: 76.7794 },
      victims: 3,
      priority: 'High',
      timestamp: new Date(Date.now() - 2 * 60 * 1000),
      status: 'new',
      assignedTeam: null,
      description: 'Building fire reported with people trapped inside',
      batteryLevel: 78,
      deviceId: 'DISASTRA-USER-045',
      supplies: ['Fire Extinguisher', 'Medical Kit', 'Ladder'],
      eta: null,
    },
    {
      id: 2,
      type: 'medical',
      location: 'Sector 11, Chandigarh',
      coordinates: { lat: 30.7194, lng: 76.7931 },
      victims: 1,
      priority: 'Moderate',
      timestamp: new Date(Date.now() - 5 * 60 * 1000),
      status: 'in-progress',
      assignedTeam: 'Alpha Team',
      description: 'Elderly person collapsed, conscious but in pain',
      batteryLevel: 65,
      deviceId: 'DISASTRA-USER-023',
      supplies: ['Medical Kit', 'Oxygen'],
      eta: '3 min',
    },
    {
      id: 3,
      type: 'flood',
      location: 'Sector 5, Chandigarh',
      coordinates: { lat: 30.7046, lng: 76.7179 },
      victims: 8,
      priority: 'Low',
      timestamp: new Date(Date.now() - 12 * 60 * 1000),
      status: 'acknowledged',
      assignedTeam: 'Bravo Team',
      description: 'Water logging due to heavy rain, families stranded',
      batteryLevel: 92,
      deviceId: 'DISASTRA-USER-067',
      supplies: ['Boats', 'Life Jackets', 'Food Packets'],
      eta: '8 min',
    },
    {
      id: 4,
      type: 'trapped',
      location: 'Sector 17, Chandigarh',
      coordinates: { lat: 30.7316, lng: 76.7635 },
      victims: 2,
      priority: 'High',
      timestamp: new Date(Date.now() - 15 * 60 * 1000),
      status: 'resolved',
      assignedTeam: 'Charlie Team',
      description: 'Two people trapped in elevator, successfully rescued',
      batteryLevel: 34,
      deviceId: 'DISASTRA-USER-089',
      supplies: ['Rescue Tools'],
      eta: 'Completed',
    },
    {
      id: 5,
      type: 'medical',
      location: 'Sector 8, Chandigarh',
      coordinates: { lat: 30.7100, lng: 76.8073 },
      victims: 1,
      priority: 'High',
      timestamp: new Date(Date.now() - 8 * 60 * 1000),
      status: 'new',
      assignedTeam: null,
      description: 'Heart attack patient, requires immediate medical attention',
      batteryLevel: 89,
      deviceId: 'DISASTRA-USER-012',
      supplies: ['Defibrillator', 'Medical Kit', 'Ambulance'],
      eta: null,
    },
  ]);

  const filterOptions = [
    { id: 'all', label: 'All', count: incidents.length },
    { id: 'new', label: 'New', count: incidents.filter(i => i.status === 'new').length },
    { id: 'in-progress', label: 'Active', count: incidents.filter(i => i.status === 'in-progress').length },
    { id: 'acknowledged', label: 'Acknowledged', count: incidents.filter(i => i.status === 'acknowledged').length },
    { id: 'resolved', label: 'Resolved', count: incidents.filter(i => i.status === 'resolved').length },
  ];

  const emergencyTypes = [
    { id: 'all', label: 'All Types', icon: '🚨' },
    { id: 'fire', label: 'Fire', icon: '🔥' },
    { id: 'medical', label: 'Medical', icon: '🏥' },
    { id: 'flood', label: 'Flood', icon: '🌊' },
    { id: 'trapped', label: 'Trapped', icon: '🏢' },
  ];

  const [selectedType, setSelectedType] = useState('all');
  const [sortBy, setSortBy] = useState('time'); // 'time', 'priority', 'distance'

  const getFilteredIncidents = () => {
    let filtered = incidents;

    // Filter by status
    if (activeFilter !== 'all') {
      filtered = filtered.filter(incident => incident.status === activeFilter);
    }

    // Filter by type
    if (selectedType !== 'all') {
      filtered = filtered.filter(incident => incident.type === selectedType);
    }

    // Sort incidents
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'priority':
          const priorityOrder = { 'High': 3, 'Moderate': 2, 'Low': 1 };
          return priorityOrder[b.priority] - priorityOrder[a.priority];
        case 'distance':
          // Mock distance calculation
          return Math.random() - 0.5;
        case 'time':
        default:
          return new Date(b.timestamp) - new Date(a.timestamp);
      }
    });

    return filtered;
  };

  const getIncidentIcon = (type) => {
    const iconMap = { fire: '🔥', medical: '🏥', flood: '🌊', trapped: '🏢' };
    return iconMap[type] || '🚨';
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

  const formatTimeAgo = (timestamp) => {
    const minutes = Math.floor((Date.now() - timestamp.getTime()) / 60000);
    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes} min ago`;
    const hours = Math.floor(minutes / 60);
    return `${hours}h ${minutes % 60}m ago`;
  };

  const handleIncidentPress = (incident) => {
    setSelectedIncident(incident);
    setShowDetailModal(true);
  };

  const handleAcknowledge = (incident) => {
    Alert.alert(
      'Acknowledge Incident',
      'This will notify the victim that help is on the way.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Acknowledge',
          onPress: () => {
            setIncidents(prev => prev.map(inc => 
              inc.id === incident.id 
                ? { ...inc, status: 'acknowledged' }
                : inc
            ));
            Alert.alert('Acknowledged', 'Victim has been notified.');
            setShowDetailModal(false);
          }
        }
      ]
    );
  };

  const handleMarkInProgress = (incident) => {
    setIncidents(prev => prev.map(inc => 
      inc.id === incident.id 
        ? { ...inc, status: 'in-progress', eta: '5 min' }
        : inc
    ));
    Alert.alert('Status Updated', 'Incident marked as in progress.');
    setShowDetailModal(false);
  };

  const handleResolve = (incident) => {
    Alert.alert(
      'Resolve Incident',
      'Mark this incident as resolved?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Resolve',
          onPress: () => {
            setIncidents(prev => prev.map(inc => 
              inc.id === incident.id 
                ? { ...inc, status: 'resolved', eta: 'Completed' }
                : inc
            ));
            Alert.alert('Resolved', 'Incident has been marked as resolved.');
            setShowDetailModal(false);
          }
        }
      ]
    );
  };

  const renderIncidentCard = ({ item: incident }) => (
    <Pressable 
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
        {incident.victims} victim{incident.victims !== 1 ? 's' : ''} • {formatTimeAgo(incident.timestamp)}
      </Text>
      <Text style={styles.incidentDescription} numberOfLines={2}>
        {incident.description}
      </Text>
      
      <View style={styles.incidentFooter}>
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(incident.status) }]}>
          <Text style={styles.statusText}>{incident.status.replace('-', ' ')}</Text>
        </View>
        {incident.assignedTeam && (
          <Text style={styles.assignedTeam}>📋 {incident.assignedTeam}</Text>
        )}
        {incident.eta && incident.status !== 'resolved' && (
          <Text style={styles.eta}>⏱️ ETA: {incident.eta}</Text>
        )}
      </View>
    </Pressable>
  );

  return (
    <>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.background} />
      <SafeAreaView style={styles.container}>
        
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Active Incidents</Text>
          <Text style={styles.headerSubtitle}>
            {getFilteredIncidents().length} incidents • Filter: {activeFilter}
          </Text>
        </View>

        {/* Filters */}
        <View style={styles.filtersContainer}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={styles.filterRow}>
              {filterOptions.map((filter) => (
                <Pressable
                  key={filter.id}
                  style={[
                    styles.filterButton,
                    activeFilter === filter.id && styles.filterButtonActive
                  ]}
                  onPress={() => setActiveFilter(filter.id)}
                >
                  <Text style={[
                    styles.filterText,
                    activeFilter === filter.id && styles.filterTextActive
                  ]}>
                    {filter.label} ({filter.count})
                  </Text>
                </Pressable>
              ))}
            </View>
          </ScrollView>
        </View>

        {/* Type and Sort Filters */}
        <View style={styles.subFiltersContainer}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={styles.subFilterRow}>
              {emergencyTypes.map((type) => (
                <Pressable
                  key={type.id}
                  style={[
                    styles.typeButton,
                    selectedType === type.id && styles.typeButtonActive
                  ]}
                  onPress={() => setSelectedType(type.id)}
                >
                  <Text style={styles.typeIcon}>{type.icon}</Text>
                  <Text style={[
                    styles.typeText,
                    selectedType === type.id && styles.typeTextActive
                  ]}>
                    {type.label}
                  </Text>
                </Pressable>
              ))}
            </View>
          </ScrollView>
          
          <View style={styles.sortContainer}>
            <Text style={styles.sortLabel}>Sort:</Text>
            {['time', 'priority', 'distance'].map((option) => (
              <Pressable
                key={option}
                style={[
                  styles.sortButton,
                  sortBy === option && styles.sortButtonActive
                ]}
                onPress={() => setSortBy(option)}
              >
                <Text style={[
                  styles.sortText,
                  sortBy === option && styles.sortTextActive
                ]}>
                  {option}
                </Text>
              </Pressable>
            ))}
          </View>
        </View>

        {/* Incidents List */}
        <FlatList
          data={getFilteredIncidents()}
          renderItem={renderIncidentCard}
          keyExtractor={item => item.id.toString()}
          style={styles.incidentsList}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.listContent}
        />

        {/* Incident Detail Modal */}
        <Modal
          visible={showDetailModal}
          transparent={true}
          animationType="slide"
          onRequestClose={() => setShowDetailModal(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.detailModal}>
              {selectedIncident && (
                <>
                  <View style={styles.modalHeader}>
                    <Text style={styles.modalTitle}>
                      {getIncidentIcon(selectedIncident.type)} {selectedIncident.type.toUpperCase()} Emergency
                    </Text>
                    <Pressable 
                      style={styles.closeButton}
                      onPress={() => setShowDetailModal(false)}
                    >
                      <Text style={styles.closeButtonText}>✕</Text>
                    </Pressable>
                  </View>

                  <ScrollView style={styles.modalContent}>
                    <View style={styles.detailSection}>
                      <Text style={styles.detailLabel}>Location:</Text>
                      <Text style={styles.detailValue}>{selectedIncident.location}</Text>
                    </View>

                    <View style={styles.detailSection}>
                      <Text style={styles.detailLabel}>Coordinates:</Text>
                      <Text style={styles.detailValue}>
                        {selectedIncident.coordinates.lat.toFixed(4)}, {selectedIncident.coordinates.lng.toFixed(4)}
                      </Text>
                    </View>

                    <View style={styles.detailSection}>
                      <Text style={styles.detailLabel}>Description:</Text>
                      <Text style={styles.detailValue}>{selectedIncident.description}</Text>
                    </View>

                    <View style={styles.detailRow}>
                      <View style={styles.detailColumn}>
                        <Text style={styles.detailLabel}>Victims:</Text>
                        <Text style={styles.detailValue}>{selectedIncident.victims}</Text>
                      </View>
                      <View style={styles.detailColumn}>
                        <Text style={styles.detailLabel}>Priority:</Text>
                        <Text style={[styles.detailValue, { color: getPriorityColor(selectedIncident.priority) }]}>
                          {selectedIncident.priority}
                        </Text>
                      </View>
                    </View>

                    <View style={styles.detailRow}>
                      <View style={styles.detailColumn}>
                        <Text style={styles.detailLabel}>Battery:</Text>
                        <Text style={styles.detailValue}>{selectedIncident.batteryLevel}%</Text>
                      </View>
                      <View style={styles.detailColumn}>
                        <Text style={styles.detailLabel}>Device:</Text>
                        <Text style={styles.detailValue}>{selectedIncident.deviceId}</Text>
                      </View>
                    </View>

                    <View style={styles.detailSection}>
                      <Text style={styles.detailLabel}>Time:</Text>
                      <Text style={styles.detailValue}>
                        {selectedIncident.timestamp.toLocaleString()}
                      </Text>
                    </View>

                    <View style={styles.detailSection}>
                      <Text style={styles.detailLabel}>Required Supplies:</Text>
                      <View style={styles.suppliesContainer}>
                        {selectedIncident.supplies.map((supply, index) => (
                          <View key={index} style={styles.supplyTag}>
                            <Text style={styles.supplyText}>{supply}</Text>
                          </View>
                        ))}
                      </View>
                    </View>

                    {selectedIncident.assignedTeam && (
                      <View style={styles.detailSection}>
                        <Text style={styles.detailLabel}>Assigned Team:</Text>
                        <Text style={styles.detailValue}>{selectedIncident.assignedTeam}</Text>
                      </View>
                    )}
                  </ScrollView>

                  <View style={styles.modalActions}>
                    {selectedIncident.status === 'new' && (
                      <Pressable 
                        style={styles.actionButton}
                        onPress={() => handleAcknowledge(selectedIncident)}
                      >
                        <Text style={styles.actionButtonText}>Acknowledge</Text>
                      </Pressable>
                    )}
                    
                    {(selectedIncident.status === 'acknowledged' || selectedIncident.status === 'new') && (
                      <Pressable 
                        style={[styles.actionButton, styles.progressButton]}
                        onPress={() => handleMarkInProgress(selectedIncident)}
                      >
                        <Text style={styles.actionButtonText}>Mark In Progress</Text>
                      </Pressable>
                    )}
                    
                    {selectedIncident.status !== 'resolved' && (
                      <Pressable 
                        style={[styles.actionButton, styles.resolveButton]}
                        onPress={() => handleResolve(selectedIncident)}
                      >
                        <Text style={styles.actionButtonText}>Resolve</Text>
                      </Pressable>
                    )}
                  </View>
                </>
              )}
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
    padding: SIZES.lg,
    backgroundColor: COLORS.surface,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
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
  filtersContainer: {
    backgroundColor: COLORS.surface,
    paddingVertical: SIZES.sm,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  filterRow: {
    flexDirection: 'row',
    paddingHorizontal: SIZES.lg,
    gap: SIZES.sm,
  },
  filterButton: {
    backgroundColor: COLORS.background,
    paddingHorizontal: SIZES.md,
    paddingVertical: SIZES.sm,
    borderRadius: SIZES.radiusMd,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  filterButtonActive: {
    backgroundColor: COLORS.emergency,
    borderColor: COLORS.emergency,
  },
  filterText: {
    fontSize: SIZES.fontSm,
    color: COLORS.textSecondary,
    fontWeight: '600',
  },
  filterTextActive: {
    color: '#FFFFFF',
  },
  subFiltersContainer: {
    backgroundColor: COLORS.surface,
    paddingVertical: SIZES.sm,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  subFilterRow: {
    flexDirection: 'row',
    paddingHorizontal: SIZES.lg,
    gap: SIZES.sm,
  },
  typeButton: {
    backgroundColor: COLORS.background,
    paddingHorizontal: SIZES.sm,
    paddingVertical: SIZES.sm,
    borderRadius: SIZES.radiusMd,
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: 'center',
    minWidth: 70,
  },
  typeButtonActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  typeIcon: {
    fontSize: 16,
    marginBottom: SIZES.xs,
  },
  typeText: {
    fontSize: 10,
    color: COLORS.textSecondary,
    fontWeight: '600',
  },
  typeTextActive: {
    color: '#FFFFFF',
  },
  sortContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SIZES.lg,
    marginTop: SIZES.sm,
    gap: SIZES.sm,
  },
  sortLabel: {
    fontSize: SIZES.fontSm,
    color: COLORS.textSecondary,
    fontWeight: '600',
  },
  sortButton: {
    paddingHorizontal: SIZES.sm,
    paddingVertical: SIZES.xs,
    borderRadius: SIZES.radiusSm,
    backgroundColor: COLORS.background,
  },
  sortButtonActive: {
    backgroundColor: COLORS.info,
  },
  sortText: {
    fontSize: SIZES.fontSm,
    color: COLORS.textSecondary,
    textTransform: 'capitalize',
  },
  sortTextActive: {
    color: '#FFFFFF',
  },
  incidentsList: {
    flex: 1,
  },
  listContent: {
    padding: SIZES.lg,
  },
  incidentCard: {
    backgroundColor: COLORS.surface,
    borderRadius: SIZES.radiusMd,
    padding: SIZES.md,
    marginBottom: SIZES.md,
    elevation: 2,
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
  incidentDescription: {
    fontSize: SIZES.fontSm,
    color: COLORS.textSecondary,
    marginBottom: SIZES.sm,
    fontStyle: 'italic',
  },
  incidentFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: SIZES.sm,
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
  eta: {
    fontSize: SIZES.fontSm,
    color: COLORS.info,
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  detailModal: {
    backgroundColor: COLORS.surface,
    borderRadius: SIZES.radiusLg,
    width: '95%',
    maxHeight: '90%',
    elevation: 8,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: SIZES.lg,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  modalTitle: {
    fontSize: SIZES.fontLg,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
    flex: 1,
  },
  closeButton: {
    width: 30,
    height: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButtonText: {
    fontSize: SIZES.fontLg,
    color: COLORS.textMuted,
  },
  modalContent: {
    padding: SIZES.lg,
    maxHeight: 400,
  },
  detailSection: {
    marginBottom: SIZES.md,
  },
  detailRow: {
    flexDirection: 'row',
    marginBottom: SIZES.md,
    gap: SIZES.lg,
  },
  detailColumn: {
    flex: 1,
  },
  detailLabel: {
    fontSize: SIZES.fontSm,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
    marginBottom: SIZES.xs,
  },
  detailValue: {
    fontSize: SIZES.fontMd,
    color: COLORS.textSecondary,
  },
  suppliesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SIZES.sm,
  },
  supplyTag: {
    backgroundColor: COLORS.background,
    paddingHorizontal: SIZES.sm,
    paddingVertical: SIZES.xs,
    borderRadius: SIZES.radiusSm,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  supplyText: {
    fontSize: SIZES.fontSm,
    color: COLORS.textSecondary,
  },
  modalActions: {
    flexDirection: 'row',
    padding: SIZES.lg,
    gap: SIZES.md,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  actionButton: {
    flex: 1,
    backgroundColor: COLORS.primary,
    paddingVertical: SIZES.md,
    borderRadius: SIZES.radiusMd,
    alignItems: 'center',
  },
  progressButton: {
    backgroundColor: COLORS.info,
  },
  resolveButton: {
    backgroundColor: COLORS.success,
  },
  actionButtonText: {
    color: '#FFFFFF',
    fontSize: SIZES.fontMd,
    fontWeight: 'bold',
  },
});

export default ResponderIncidentsScreen;