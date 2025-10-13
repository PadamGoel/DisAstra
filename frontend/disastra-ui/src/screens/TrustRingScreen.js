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
  Alert,
  Image,
} from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { LinearGradient } from 'expo-linear-gradient';
import QRCode from 'react-native-qrcode-svg';
import { COLORS, SIZES } from '../constants/theme';

const TrustRingScreen = ({ navigation }) => {
  const [selectedRing, setSelectedRing] = useState('family'); // 'family', 'friends', 'neighbors'
  const [showQRModal, setShowQRModal] = useState(false);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [groupSOSActive, setGroupSOSActive] = useState(false);
  const [connectedMembers, setConnectedMembers] = useState(12);
  const [showMyQRModal, setShowMyQRModal] = useState(false);

  // Mock user data for QR code
  const myUserData = {
    id: 'USER-001',
    name: 'Alex Johnson',
    phone: '+1-555-0123',
    trustRingId: 'TR-ABC123DEF',
    inviteCode: 'DISASTRA-INV-789XYZ'
  };

  const trustRings = [
    { id: 'family', label: 'Family', icon: '👨‍👩‍👧‍👦', color: COLORS.emergency, members: 5 },
    { id: 'friends', label: 'Friends', icon: '👥', color: COLORS.primary, members: 8 },
    { id: 'neighbors', label: 'Neighbors', icon: '🏘️', color: COLORS.success, members: 15 },
  ];

  const mockMembers = {
    family: [
      { id: 1, name: 'Sarah Chen', status: 'safe', lastSeen: '2 min ago', avatar: '👩', battery: 85, distance: '0.2 km' },
      { id: 2, name: 'Mike Chen', status: 'safe', lastSeen: '5 min ago', avatar: '👨', battery: 67, distance: '0.2 km' },
      { id: 3, name: 'Emma Chen', status: 'help', lastSeen: '1 min ago', avatar: '👧', battery: 45, distance: '1.8 km' },
      { id: 4, name: 'Tom Chen', status: 'unknown', lastSeen: '25 min ago', avatar: '👦', battery: 12, distance: '?' },
      { id: 5, name: 'Lisa Chen', status: 'safe', lastSeen: '3 min ago', avatar: '👵', battery: 78, distance: '0.1 km' },
    ],
    friends: [
      { id: 6, name: 'Alex Kim', status: 'safe', lastSeen: '1 min ago', avatar: '🧑', battery: 92, distance: '0.5 km' },
      { id: 7, name: 'Jordan Smith', status: 'safe', lastSeen: '4 min ago', avatar: '👩', battery: 56, distance: '2.1 km' },
      { id: 8, name: 'Sam Davis', status: 'help', lastSeen: '7 min ago', avatar: '👨', battery: 34, distance: '3.2 km' },
    ],
    neighbors: [
      { id: 9, name: 'Maria Lopez', status: 'safe', lastSeen: '30 sec ago', avatar: '👩', battery: 88, distance: '0.1 km' },
      { id: 10, name: 'John Williams', status: 'safe', lastSeen: '2 min ago', avatar: '👨', battery: 71, distance: '0.3 km' },
      { id: 11, name: 'Anna Taylor', status: 'unknown', lastSeen: '45 min ago', avatar: '👩', battery: 8, distance: '?' },
    ],
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'safe': return COLORS.success;
      case 'help': return COLORS.emergency;
      case 'unknown': return COLORS.textMuted;
      default: return COLORS.textMuted;
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'safe': return '✅';
      case 'help': return '🆘';
      case 'unknown': return '❓';
      default: return '❓';
    }
  };

  const handleMemberPress = (member) => {
    Alert.alert(
      `${member.avatar} ${member.name}`,
      `Status: ${member.status.toUpperCase()}\nLast seen: ${member.lastSeen}\nBattery: ${member.battery}%\nDistance: ${member.distance}`,
      [
        { text: 'Dismiss' },
        { text: 'Send Message', onPress: () => Alert.alert('Message Sent', `Emergency message sent to ${member.name}`) },
        member.status === 'help' && { 
          text: 'Respond to SOS', 
          onPress: () => Alert.alert('SOS Response', `You are now responding to ${member.name}'s emergency`) 
        },
      ].filter(Boolean)
    );
  };

  const handleQRScan = () => {
    setTimeout(() => {
      Alert.alert(
        '📱 Contact Added!',
        'Jessica Brown has been added to your Friends ring.',
        [{ text: 'Great!', onPress: () => setShowQRModal(false) }]
      );
    }, 2000);
  };

  const handleInviteByPhone = () => {
    Alert.alert(
      '📞 Invitation Sent',
      'SMS invitation sent to +1 (555) 123-4567\n\n"Join my DISASTRA trust ring for emergency coordination: https://disastra.app/invite/abc123"',
      [{ text: 'OK', onPress: () => setShowInviteModal(false) }]
    );
  };

  const toggleGroupSOS = () => {
    if (!groupSOSActive) {
      Alert.alert(
        '🚨 Group SOS Alert',
        'This will send an emergency alert to all members in your active rings. Continue?',
        [
          { text: 'Cancel', style: 'cancel' },
          { 
            text: 'Send Group SOS', 
            style: 'destructive',
            onPress: () => {
              setGroupSOSActive(true);
              Alert.alert('Group SOS Activated', 'Emergency alert sent to all trust ring members');
            }
          }
        ]
      );
    } else {
      setGroupSOSActive(false);
      Alert.alert('Group SOS Deactivated', 'Emergency alert cancelled');
    }
  };

  const currentMembers = mockMembers[selectedRing] || [];
  const helpCount = currentMembers.filter(m => m.status === 'help').length;
  const safeCount = currentMembers.filter(m => m.status === 'safe').length;

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
          <Text style={styles.headerTitle}>Trust Ring</Text>
          <Text style={styles.headerSubtitle}>
            {connectedMembers} connected • {helpCount} need help • {safeCount} safe
          </Text>
        </View>

        {/* Ring Selection */}
        <View style={styles.ringSelector}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={styles.ringTabs}>
              {trustRings.map((ring) => (
                <Pressable
                  key={ring.id}
                  style={[
                    styles.ringTab,
                    selectedRing === ring.id && styles.ringTabActive,
                    selectedRing === ring.id && { borderColor: ring.color }
                  ]}
                  onPress={() => setSelectedRing(ring.id)}
                >
                  <Text style={styles.ringIcon}>{ring.icon}</Text>
                  <Text style={[
                    styles.ringText,
                    selectedRing === ring.id && styles.ringTextActive
                  ]}>
                    {ring.label}
                  </Text>
                  <View style={[styles.memberCount, { backgroundColor: ring.color }]}>
                    <Text style={styles.memberCountText}>{ring.members}</Text>
                  </View>
                </Pressable>
              ))}
            </View>
          </ScrollView>
        </View>

        {/* Group SOS Button */}
        <View style={styles.groupSOSContainer}>
          <Pressable 
            style={[
              styles.groupSOSButton,
              groupSOSActive && styles.groupSOSButtonActive
            ]}
            onPress={toggleGroupSOS}
          >
            <LinearGradient
              colors={groupSOSActive ? ['#FF1744', '#D32F2F'] : [COLORS.emergency, '#C62828']}
              style={styles.groupSOSGradient}
            >
              <Text style={styles.groupSOSIcon}>
                {groupSOSActive ? '🚨' : '📢'}
              </Text>
              <Text style={styles.groupSOSText}>
                {groupSOSActive ? 'GROUP SOS ACTIVE' : 'GROUP SOS'}
              </Text>
            </LinearGradient>
          </Pressable>
        </View>

        {/* Members List */}
        <View style={styles.membersContainer}>
          <View style={styles.membersHeader}>
            <Text style={styles.membersTitle}>
              {trustRings.find(r => r.id === selectedRing)?.icon} {trustRings.find(r => r.id === selectedRing)?.label} Members
            </Text>
            <Pressable 
              style={styles.addButton}
              onPress={() => setShowInviteModal(true)}
            >
              <Text style={styles.addButtonText}>+ Add</Text>
            </Pressable>
          </View>

          <ScrollView style={styles.membersList} showsVerticalScrollIndicator={false}>
            {currentMembers.map((member) => (
              <Pressable 
                key={member.id}
                style={styles.memberItem}
                onPress={() => handleMemberPress(member)}
              >
                <View style={styles.memberAvatar}>
                  <Text style={styles.memberAvatarText}>{member.avatar}</Text>
                  <View style={[styles.statusDot, { backgroundColor: getStatusColor(member.status) }]} />
                </View>
                
                <View style={styles.memberInfo}>
                  <Text style={styles.memberName}>{member.name}</Text>
                  <Text style={styles.memberDetails}>
                    {getStatusIcon(member.status)} {member.status} • {member.lastSeen} • {member.distance}
                  </Text>
                  <View style={styles.batteryContainer}>
                    <View style={styles.batteryBar}>
                      <View 
                        style={[
                          styles.batteryFill, 
                          { 
                            width: `${member.battery}%`,
                            backgroundColor: member.battery > 20 ? COLORS.success : COLORS.emergency
                          }
                        ]} 
                      />
                    </View>
                    <Text style={styles.batteryText}>{member.battery}%</Text>
                  </View>
                </View>

                <View style={styles.memberActions}>
                  {member.status === 'help' && (
                    <Pressable style={styles.helpButton}>
                      <Text style={styles.helpButtonText}>🆘</Text>
                    </Pressable>
                  )}
                  <Pressable style={styles.messageButton}>
                    <Text style={styles.messageButtonText}>💬</Text>
                  </Pressable>
                </View>
              </Pressable>
            ))}
          </ScrollView>
        </View>

        {/* QR Code Modal */}
        <Modal
          visible={showQRModal}
          transparent={true}
          animationType="slide"
          onRequestClose={() => setShowQRModal(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.qrModal}>
              <Text style={styles.qrModalTitle}>📱 Scan QR Code</Text>
              
              <View style={styles.qrCodeContainer}>
                <View style={styles.qrCode}>
                  <Text style={styles.qrCodeText}>📷</Text>
                  <Text style={styles.qrCodeSubtext}>Camera View</Text>
                </View>
              </View>
              
              <Text style={styles.qrInstructions}>
                Point your camera at someone's DISASTRA QR code to add them to your trust ring
              </Text>

              <View style={styles.qrModalButtons}>
                <Pressable style={styles.scanButton} onPress={handleQRScan}>
                  <Text style={styles.scanButtonText}>🔍 Simulate Scan</Text>
                </Pressable>
                
                <Pressable 
                  style={styles.cancelButton}
                  onPress={() => setShowQRModal(false)}
                >
                  <Text style={styles.cancelButtonText}>Cancel</Text>
                </Pressable>
              </View>
            </View>
          </View>
        </Modal>

        {/* Invite Modal */}
        <Modal
          visible={showInviteModal}
          transparent={true}
          animationType="slide"
          onRequestClose={() => setShowInviteModal(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.inviteModal}>
              <Text style={styles.inviteModalTitle}>👥 Add Member</Text>
              
              <View style={styles.inviteOptions}>
                <Pressable 
                  style={styles.inviteOption}
                  onPress={() => setShowQRModal(true)}
                >
                  <Text style={styles.inviteOptionIcon}>📱</Text>
                  <Text style={styles.inviteOptionText}>Scan QR Code</Text>
                  <Text style={styles.inviteOptionDesc}>
                    Scan their DISASTRA QR code
                  </Text>
                </Pressable>

                <Pressable 
                  style={styles.inviteOption}
                  onPress={handleInviteByPhone}
                >
                  <Text style={styles.inviteOptionIcon}>📞</Text>
                  <Text style={styles.inviteOptionText}>Send SMS Invite</Text>
                  <Text style={styles.inviteOptionDesc}>
                    Send invitation link via text
                  </Text>
                </Pressable>

                <Pressable style={styles.inviteOption}>
                  <Text style={styles.inviteOptionIcon}>📧</Text>
                  <Text style={styles.inviteOptionText}>Email Invite</Text>
                  <Text style={styles.inviteOptionDesc}>
                    Send invitation via email
                  </Text>
                </Pressable>
              </View>

              <Pressable 
                style={styles.closeInviteButton}
                onPress={() => setShowInviteModal(false)}
              >
                <Text style={styles.closeInviteButtonText}>Close</Text>
              </Pressable>
            </View>
          </View>
        </Modal>

        {/* My QR Code */}
        <View style={styles.myQRContainer}>
          <Text style={styles.myQRTitle}>🏷️ My Trust Ring Code</Text>
          <Text style={styles.myQRSubtitle}>Share this code to add people to your trust ring</Text>
          
          <View style={styles.qrDisplayContainer}>
            <QRCode
              value={JSON.stringify({
                type: 'DISASTRA_INVITE',
                userId: myUserData.id,
                name: myUserData.name,
                trustRingId: myUserData.trustRingId,
                inviteCode: myUserData.inviteCode,
                timestamp: new Date().toISOString()
              })}
              size={180}
              color={COLORS.textPrimary}
              backgroundColor={COLORS.surface}
              logo={null}
              logoSize={30}
              logoBackgroundColor='transparent'
            />
          </View>

          <View style={styles.qrInfo}>
            <Text style={styles.qrInfoText}>👤 {myUserData.name}</Text>
            <Text style={styles.qrInfoText}>📱 {myUserData.phone}</Text>
            <Text style={styles.qrInfoText}>🔗 {myUserData.inviteCode}</Text>
          </View>

          <Pressable 
            style={styles.shareQRButton}
            onPress={() => setShowMyQRModal(true)}
          >
            <Text style={styles.shareQRButtonText}>📤 Share Full Screen QR</Text>
          </Pressable>
        </View>

        {/* Full Screen My QR Code Modal */}
        <Modal
          visible={showMyQRModal}
          transparent={true}
          animationType="slide"
          onRequestClose={() => setShowMyQRModal(false)}
        >
          <View style={styles.fullQRModalOverlay}>
            <View style={styles.fullQRModal}>
              <Text style={styles.fullQRTitle}>📱 Scan to Join My Trust Ring</Text>
              
              <View style={styles.fullQRContainer}>
                <QRCode
                  value={JSON.stringify({
                    type: 'DISASTRA_INVITE',
                    userId: myUserData.id,
                    name: myUserData.name,
                    trustRingId: myUserData.trustRingId,
                    inviteCode: myUserData.inviteCode,
                    timestamp: new Date().toISOString()
                  })}
                  size={250}
                  color={COLORS.textPrimary}
                  backgroundColor='#FFFFFF'
                  logo={null}
                />
              </View>
              
              <View style={styles.fullQRInfo}>
                <Text style={styles.fullQRName}>{myUserData.name}</Text>
                <Text style={styles.fullQRDetails}>Trust Ring Invitation</Text>
                <Text style={styles.fullQRCode}>{myUserData.inviteCode}</Text>
              </View>

              <Pressable 
                style={styles.closeFullQRButton}
                onPress={() => setShowMyQRModal(false)}
              >
                <Text style={styles.closeFullQRText}>Close</Text>
              </Pressable>
            </View>
          </View>
        </Modal>
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
  },
  header: {
    padding: SIZES.md,
    backgroundColor: COLORS.surface,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  headerTitle: {
    fontSize: SIZES.fontXl,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
    textAlign: 'center',
  },
  headerSubtitle: {
    fontSize: SIZES.fontSm,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginTop: SIZES.xs,
  },
  ringSelector: {
    backgroundColor: COLORS.surface,
    paddingVertical: SIZES.sm,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  ringTabs: {
    flexDirection: 'row',
    paddingHorizontal: SIZES.md,
    gap: SIZES.sm,
  },
  ringTab: {
    backgroundColor: COLORS.background,
    paddingHorizontal: SIZES.md,
    paddingVertical: SIZES.sm,
    borderRadius: SIZES.radiusMd,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
    minWidth: 90,
    position: 'relative',
  },
  ringTabActive: {
    backgroundColor: COLORS.primary + '20',
    borderWidth: 2,
  },
  ringIcon: {
    fontSize: 20,
    marginBottom: SIZES.xs,
  },
  ringText: {
    fontSize: SIZES.fontSm,
    color: COLORS.textSecondary,
    fontWeight: '500',
  },
  ringTextActive: {
    color: COLORS.textPrimary,
    fontWeight: '700',
  },
  memberCount: {
    position: 'absolute',
    top: -5,
    right: -5,
    width: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  memberCountText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: 'bold',
  },
  groupSOSContainer: {
    padding: SIZES.lg,
    alignItems: 'center',
  },
  groupSOSButton: {
    width: 200,
    height: 60,
    borderRadius: SIZES.radiusLg,
    overflow: 'hidden',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  groupSOSButtonActive: {
    transform: [{ scale: 1.05 }],
  },
  groupSOSGradient: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SIZES.sm,
  },
  groupSOSIcon: {
    fontSize: 24,
  },
  groupSOSText: {
    color: '#FFFFFF',
    fontSize: SIZES.fontMd,
    fontWeight: 'bold',
  },
  membersContainer: {
    flex: 1,
    paddingHorizontal: SIZES.md,
  },
  membersHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: SIZES.md,
  },
  membersTitle: {
    fontSize: SIZES.fontLg,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
  },
  addButton: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: SIZES.md,
    paddingVertical: SIZES.sm,
    borderRadius: SIZES.radiusMd,
  },
  addButtonText: {
    color: '#FFFFFF',
    fontSize: SIZES.fontSm,
    fontWeight: '600',
  },
  membersList: {
    flex: 1,
  },
  memberItem: {
    flexDirection: 'row',
    backgroundColor: COLORS.surface,
    padding: SIZES.md,
    borderRadius: SIZES.radiusMd,
    marginBottom: SIZES.sm,
    alignItems: 'center',
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  memberAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: COLORS.background,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
    marginRight: SIZES.md,
  },
  memberAvatarText: {
    fontSize: 24,
  },
  statusDot: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    width: 12,
    height: 12,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  memberInfo: {
    flex: 1,
  },
  memberName: {
    fontSize: SIZES.fontMd,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginBottom: SIZES.xs,
  },
  memberDetails: {
    fontSize: SIZES.fontSm,
    color: COLORS.textSecondary,
    marginBottom: SIZES.xs,
  },
  batteryContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SIZES.xs,
  },
  batteryBar: {
    width: 60,
    height: 4,
    backgroundColor: COLORS.border,
    borderRadius: 2,
    overflow: 'hidden',
  },
  batteryFill: {
    height: '100%',
    borderRadius: 2,
  },
  batteryText: {
    fontSize: 10,
    color: COLORS.textMuted,
  },
  memberActions: {
    flexDirection: 'row',
    gap: SIZES.sm,
  },
  helpButton: {
    width: 40,
    height: 40,
    backgroundColor: COLORS.emergency,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  helpButtonText: {
    fontSize: 16,
  },
  messageButton: {
    width: 40,
    height: 40,
    backgroundColor: COLORS.primary,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  messageButtonText: {
    fontSize: 16,
  },
  myQRContainer: {
    padding: SIZES.lg,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    backgroundColor: COLORS.surface,
    alignItems: 'center',
  },
  myQRTitle: {
    fontSize: SIZES.fontLg,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
    textAlign: 'center',
    marginBottom: SIZES.xs,
  },
  myQRSubtitle: {
    fontSize: SIZES.fontSm,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginBottom: SIZES.lg,
  },
  qrDisplayContainer: {
    backgroundColor: COLORS.background,
    padding: SIZES.lg,
    borderRadius: SIZES.radiusMd,
    elevation: 2,
    marginBottom: SIZES.md,
  },
  qrInfo: {
    alignItems: 'center',
    gap: SIZES.xs,
    marginBottom: SIZES.md,
  },
  qrInfoText: {
    fontSize: SIZES.fontSm,
    color: COLORS.textMuted,
    fontFamily: 'monospace',
  },
  shareQRButton: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: SIZES.lg,
    paddingVertical: SIZES.md,
    borderRadius: SIZES.radiusMd,
    elevation: 2,
  },
  shareQRButtonText: {
    color: '#FFFFFF',
    fontSize: SIZES.fontMd,
    fontWeight: '600',
    textAlign: 'center',
  },
  fullQRModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  fullQRModal: {
    backgroundColor: '#FFFFFF',
    borderRadius: SIZES.radiusLg,
    padding: SIZES.xl,
    alignItems: 'center',
    width: '90%',
    maxWidth: 350,
  },
  fullQRTitle: {
    fontSize: SIZES.fontLg,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
    textAlign: 'center',
    marginBottom: SIZES.lg,
  },
  fullQRContainer: {
    backgroundColor: '#FFFFFF',
    padding: SIZES.md,
    borderRadius: SIZES.radiusMd,
    marginBottom: SIZES.lg,
  },
  fullQRInfo: {
    alignItems: 'center',
    marginBottom: SIZES.lg,
  },
  fullQRName: {
    fontSize: SIZES.fontLg,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
    textAlign: 'center',
    marginBottom: SIZES.xs,
  },
  fullQRDetails: {
    fontSize: SIZES.fontMd,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginBottom: SIZES.xs,
  },
  fullQRCode: {
    fontSize: SIZES.fontSm,
    color: COLORS.textMuted,
    fontFamily: 'monospace',
    textAlign: 'center',
  },
  closeFullQRButton: {
    backgroundColor: COLORS.border,
    paddingHorizontal: SIZES.xl,
    paddingVertical: SIZES.md,
    borderRadius: SIZES.radiusMd,
  },
  closeFullQRText: {
    color: COLORS.textMuted,
    fontSize: SIZES.fontMd,
    fontWeight: '500',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  qrModal: {
    backgroundColor: COLORS.surface,
    borderRadius: SIZES.radiusLg,
    padding: SIZES.xl,
    width: '90%',
    maxWidth: 400,
    elevation: 8,
  },
  qrModalTitle: {
    fontSize: SIZES.fontXl,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
    textAlign: 'center',
    marginBottom: SIZES.lg,
  },
  qrCodeContainer: {
    alignItems: 'center',
    marginBottom: SIZES.lg,
  },
  qrCode: {
    width: 200,
    height: 200,
    backgroundColor: COLORS.background,
    borderRadius: SIZES.radiusMd,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: COLORS.border,
    borderStyle: 'dashed',
  },
  qrCodeText: {
    fontSize: 48,
    marginBottom: SIZES.sm,
  },
  qrCodeSubtext: {
    fontSize: SIZES.fontSm,
    color: COLORS.textMuted,
  },
  qrInstructions: {
    fontSize: SIZES.fontSm,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginBottom: SIZES.lg,
  },
  qrModalButtons: {
    gap: SIZES.md,
  },
  scanButton: {
    backgroundColor: COLORS.primary,
    paddingVertical: SIZES.md,
    borderRadius: SIZES.radiusMd,
    alignItems: 'center',
  },
  scanButtonText: {
    color: '#FFFFFF',
    fontSize: SIZES.fontMd,
    fontWeight: 'bold',
  },
  cancelButton: {
    backgroundColor: COLORS.border,
    paddingVertical: SIZES.md,
    borderRadius: SIZES.radiusMd,
    alignItems: 'center',
  },
  cancelButtonText: {
    color: COLORS.textMuted,
    fontSize: SIZES.fontMd,
    fontWeight: '500',
  },
  inviteModal: {
    backgroundColor: COLORS.surface,
    borderRadius: SIZES.radiusLg,
    padding: SIZES.xl,
    width: '90%',
    maxWidth: 400,
    elevation: 8,
  },
  inviteModalTitle: {
    fontSize: SIZES.fontXl,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
    textAlign: 'center',
    marginBottom: SIZES.lg,
  },
  inviteOptions: {
    gap: SIZES.md,
    marginBottom: SIZES.lg,
  },
  inviteOption: {
    backgroundColor: COLORS.background,
    padding: SIZES.md,
    borderRadius: SIZES.radiusMd,
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: 'center',
  },
  inviteOptionIcon: {
    fontSize: 32,
    marginBottom: SIZES.sm,
  },
  inviteOptionText: {
    fontSize: SIZES.fontMd,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginBottom: SIZES.xs,
  },
  inviteOptionDesc: {
    fontSize: SIZES.fontSm,
    color: COLORS.textSecondary,
    textAlign: 'center',
  },
  closeInviteButton: {
    backgroundColor: COLORS.border,
    paddingVertical: SIZES.md,
    borderRadius: SIZES.radiusMd,
    alignItems: 'center',
  },
  closeInviteButtonText: {
    color: COLORS.textMuted,
    fontSize: SIZES.fontMd,
    fontWeight: '500',
  },
});

export default TrustRingScreen;