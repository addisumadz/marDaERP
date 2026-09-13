import React, { useState, useEffect, useCallback } from 'react';

import {
    StyleSheet,
    Text,
    View,
    SafeAreaView,
    ScrollView,
    TouchableOpacity,
    RefreshControl,
    StatusBar,
    Image,
    Platform,
    Alert,
    Modal,
    TextInput,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { STORAGE_KEYS } from '../constants/config';
import { Ionicons, MaterialCommunityIcons, FontAwesome5 } from '@expo/vector-icons';
import { databaseService } from '../services/databaseService';
import { syncService } from '../services/syncService';
import { authService } from '../services/authService';
import QRScannerModal from '../components/QRScannerModal';
import CustomAlert from '../components/CustomAlert';

export default function HomeScreen({ onNavigateToReadings, onNavigateToSync, onNavigateToNearby, onNavigateToCustomer, onNavigateToSettings }) {
    const [stats, setStats] = useState({
        allocated: 0,
        read: 0,
        unread: 0,
        unassigned: 0,
        percentage: 0,
        uploaded: 0,
        pending: 0,
        failed: 0
    });
    const [refreshing, setRefreshing] = useState(false);
    const [user, setUser] = useState({ name: 'User' });
    const [activePeriod, setActivePeriod] = useState('Loading...');
    const [showQRScanner, setShowQRScanner] = useState(false);
    const [syncWarning, setSyncWarning] = useState(null); // { type: 'no_data' | 'stale', message: '' }
    const [alertConfig, setAlertConfig] = useState({
        visible: false,
        title: '',
        message: '',
        type: 'info',
        onConfirm: () => { }
    });

    // Server Configuration State
    const [showServerConfig, setShowServerConfig] = useState(false);
    const [serverAddress, setServerAddress] = useState('');

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            // Load User Info
            const userData = await authService.getUserData();
            if (userData) {
                setUser({ name: userData.full_name || userData.username });
            } else {
                // Fallback for offline/legacy login
                const username = await authService.getUsername();
                if (username) {
                    setUser({ name: username });
                }
            }

            // Load Period
            const kfyawor = await syncService.getKfyawor();
            if (kfyawor && kfyawor.kfyawor) {
                setActivePeriod(kfyawor.kfyawor);
            } else {
                setActivePeriod('No Active Cycle');
            }

            // Load Stats
            const dashboardStats = await databaseService.getDashboardStats();
            setStats(dashboardStats);

            // Sync warning: check if data has been synced
            const syncStatus = await syncService.getSyncStatus();
            if (dashboardStats.allocated === 0) {
                setSyncWarning({
                    type: 'no_data',
                    message: 'No customer data found. Go to Settings → Fetch Customers to download data before starting readings.'
                });
            } else if (!syncStatus.lastSync) {
                setSyncWarning({
                    type: 'stale',
                    message: 'Data has never been synced with the server. Sync to get the latest customer data.'
                });
            } else {
                const hoursSinceSync = (Date.now() - new Date(syncStatus.lastSync).getTime()) / (1000 * 60 * 60);
                if (hoursSinceSync > 24) {
                    setSyncWarning({
                        type: 'stale',
                        message: `Last sync was ${Math.floor(hoursSinceSync)} hours ago. Consider syncing to get the latest data.`
                    });
                } else {
                    setSyncWarning(null);
                }
            }
        } catch (error) {
            console.error('Failed to load dashboard data:', error);
        }
    };

    const handleRefresh = useCallback(async () => {
        setRefreshing(true);
        await loadData();
        setRefreshing(false);
    }, []);

    const showAlert = (title, message, type = 'info') => {
        setAlertConfig({
            visible: true,
            title,
            message,
            type,
            onConfirm: () => setAlertConfig(prev => ({ ...prev, visible: false }))
        });
    };

    // Server Configuration Handlers
    const handleOpenServerConfig = async () => {
        try {
            const saved = await AsyncStorage.getItem(STORAGE_KEYS.CUSTOM_URL);
            setServerAddress(saved || '');
        } catch (e) {
            console.error('Failed to load server address', e);
        }
        setShowServerConfig(true);
    };

    const handleSaveServerConfig = async () => {
        try {
            if (serverAddress.trim()) {
                await AsyncStorage.setItem(STORAGE_KEYS.CUSTOM_URL, serverAddress.trim());
            } else {
                await AsyncStorage.removeItem(STORAGE_KEYS.CUSTOM_URL);
            }
            setShowServerConfig(false);
            showAlert('Success', 'Server address updated successfully.', 'success');
        } catch (e) {
            showAlert('Error', 'Failed to save server address.', 'error');
        }
    };

    const handleQRScan = async (qrData) => {
        setShowQRScanner(false);
        try {
            const customer = await databaseService.getCustomerByQRCode(qrData);
            if (customer) {
                if (onNavigateToCustomer) {
                    onNavigateToCustomer(customer);
                } else {
                    showAlert('Customer Found', `${customer.full_name}\nAccount: ${customer.account_number}`, 'success');
                }
            } else {
                showAlert(
                    'Customer Not Found',
                    'No customer matches this QR code. Please verify the code and try again.',
                    'warning'
                );
            }
        } catch (err) {
            console.error('QR Search Error:', err);
            showAlert('Error', 'Failed to search for customer. Please try again.', 'error');
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar backgroundColor="#fff" barStyle="dark-content" />

            {/* Header */}
            <View style={styles.header}>
                <View style={styles.userInfo}>
                    <View style={styles.avatarCircle}>
                        <Text style={styles.avatarText}>{user.name.charAt(0).toUpperCase()}</Text>
                    </View>
                    <View>
                        <Text style={styles.userName}>{user.name}</Text>
                        <Text style={styles.userRole}>Meter Reader</Text>
                    </View>
                </View>
                <View style={styles.headerActions}>
                    <TouchableOpacity style={styles.iconButton} onPress={() => onNavigateToReadings('all')}>
                        <Ionicons name="search" size={24} color="#333" />
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.iconButton} onPress={onNavigateToSettings}>
                        <Ionicons name="menu" size={24} color="#333" />
                    </TouchableOpacity>
                </View>
            </View>

            {/* Main Content */}
            <View style={styles.contentContainer}>
                <ScrollView
                    contentContainerStyle={styles.scrollContent}
                    refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />}
                    showsVerticalScrollIndicator={false}
                >
                    {/* Sync Warning Banner */}
                    {syncWarning && (
                        <TouchableOpacity
                            style={[
                                styles.syncWarningBanner,
                                syncWarning.type === 'no_data' ? styles.syncWarningCritical : styles.syncWarningStale
                            ]}
                            onPress={onNavigateToSettings}
                            activeOpacity={0.8}
                        >
                            <View style={styles.syncWarningContent}>
                                <Ionicons
                                    name={syncWarning.type === 'no_data' ? 'alert-circle' : 'time-outline'}
                                    size={22}
                                    color={syncWarning.type === 'no_data' ? '#D32F2F' : '#E65100'}
                                />
                                <Text style={[
                                    styles.syncWarningText,
                                    { color: syncWarning.type === 'no_data' ? '#D32F2F' : '#E65100' }
                                ]}>
                                    {syncWarning.message}
                                </Text>
                            </View>
                            <Ionicons name="chevron-forward" size={18} color="#999" />
                        </TouchableOpacity>
                    )}

                    {/* Active Period Card */}
                    <View style={styles.periodCard}>
                        <View style={styles.periodHeader}>
                            <Ionicons name="calendar-outline" size={24} color="#333" />
                            <View style={styles.periodTexts}>
                                <Text style={styles.periodLabel}>Active Period</Text>
                            </View>
                        </View>
                        <Text style={styles.periodTitle}>{activePeriod}</Text>
                    </View>

                    {/* Meter Stats Grid */}
                    <View style={styles.gridContainer}>
                        {/* Allocated */}
                        <TouchableOpacity
                            style={[styles.statCard, styles.cardBlueBorder]}
                            onPress={() => onNavigateToReadings('all')}
                        >
                            <Text style={[styles.cardLabel, { color: '#2196F3' }]}>Allocated</Text>
                            <Text style={[styles.cardValue, { color: '#2196F3' }]}>{stats.allocated}</Text>
                            <Ionicons name="water-outline" size={40} color="#E3F2FD" style={styles.cardBgIcon} />
                        </TouchableOpacity>

                        {/* Read */}
                        <TouchableOpacity
                            style={[styles.statCard, styles.cardGreenBorder]}
                            onPress={() => onNavigateToReadings('encoded')}
                        >
                            <Text style={[styles.cardLabel, { color: '#4CAF50' }]}>Read</Text>
                            <Text style={[styles.cardValue, { color: '#4CAF50' }]}>{stats.read}</Text>
                            <View style={styles.progressBarBg}>
                                <View style={[styles.progressBarFill, { width: `${stats.percentage}%` }]} />
                            </View>
                            <Text style={styles.percentageText}>{stats.percentage}%</Text>
                            <MaterialCommunityIcons name="check-all" size={40} color="#E8F5E9" style={styles.cardBgIcon} />
                        </TouchableOpacity>

                        {/* Unread */}
                        <TouchableOpacity
                            style={[styles.statCard, styles.cardOrangeBorder]}
                            onPress={() => onNavigateToReadings('pending')}
                        >
                            <Text style={[styles.cardLabel, { color: '#FF9800' }]}>Unread</Text>
                            <Text style={[styles.cardValue, { color: '#FF9800' }]}>{stats.unread}</Text>
                            <Ionicons name="time-outline" size={40} color="#FFF3E0" style={styles.cardBgIcon} />
                        </TouchableOpacity>

                        {/* GPS Missed (Updated from Unassigned) */}
                        <TouchableOpacity
                            style={[styles.statCard, styles.cardLightBlueBorder]}
                            onPress={() => onNavigateToReadings('gps_missed')}
                        >
                            <Text style={[styles.cardLabel, { color: '#03A9F4' }]}>GPS Missed</Text>
                            <Text style={[styles.cardValue, { color: '#03A9F4' }]}>{stats.gpsMissed || 0}</Text>
                            <Ionicons name="location-outline" size={30} color="#E1F5FE" style={styles.cardBgIcon} />
                        </TouchableOpacity>
                    </View>

                    {/* Sync Status Row */}
                    <View style={styles.syncRow}>
                        <View style={[styles.syncCard, styles.bgGreenLight]}>
                            <Ionicons name="checkmark-circle-outline" size={20} color="#4CAF50" />
                            <Text style={styles.syncLabel}>Uploaded</Text>
                            <Text style={[styles.syncValue, { color: '#4CAF50' }]}>{stats.uploaded}</Text>
                        </View>

                        <View style={[styles.syncCard, styles.bgOrangeLight]}>
                            <Ionicons name="ellipsis-horizontal-circle-outline" size={20} color="#FF9800" />
                            <Text style={styles.syncLabel}>Pending</Text>
                            <Text style={[styles.syncValue, { color: '#FF9800' }]}>{stats.pending}</Text>
                        </View>

                        <View style={[styles.syncCard, styles.bgRedLight]}>
                            <Ionicons name="alert-circle-outline" size={20} color="#F44336" />
                            <Text style={styles.syncLabel}>Failed</Text>
                            <Text style={[styles.syncValue, { color: '#F44336' }]}>{stats.failed}</Text>
                        </View>
                    </View>

                    {/* REMOVED: Nearby Connections Section */}

                </ScrollView>
            </View>

            {/* Bottom Navigation (Floating Style) */}
            <View style={styles.bottomNavWrapper}>
                <View style={styles.bottomNav}>
                    <TouchableOpacity style={styles.navItem} onPress={() => setShowQRScanner(true)}>
                        <Ionicons name="qr-code-outline" size={24} color="#2196F3" />
                        <Text style={[styles.navText, { color: '#2196F3' }]}>Scan</Text>
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.scanButton} onPress={onNavigateToNearby}>
                        <Ionicons name="location-sharp" size={28} color="#fff" />
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.navItem} onPress={onNavigateToSettings}>
                        <Ionicons name="sync-outline" size={24} color="#666" />
                        <Text style={styles.navText}>Sync</Text>
                    </TouchableOpacity>
                </View>
            </View>

            {/* QR Scanner Modal */}
            <QRScannerModal
                visible={showQRScanner}
                onClose={() => setShowQRScanner(false)}
                onScan={handleQRScan}
                title="Scan to Search"
            />

            {/* Server Configuration Modal */}
            <Modal
                visible={showServerConfig}
                transparent={true}
                animationType="slide"
                onRequestClose={() => setShowServerConfig(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <Text style={styles.modalTitle}>Server Configuration</Text>

                        <Text style={styles.modalLabel}>Server Address (IP:Port)</Text>
                        <Text style={styles.modalHelper}>Example: 192.168.1.10:8080</Text>

                        <TextInput
                            style={styles.modalInput}
                            placeholder="Enter IP:Port"
                            value={serverAddress}
                            onChangeText={setServerAddress}
                            autoCapitalize="none"
                            autoCorrect={false}
                            keyboardType="url"
                        />

                        <View style={styles.modalButtons}>
                            <TouchableOpacity
                                style={[styles.modalButton, styles.cancelButton]}
                                onPress={() => setShowServerConfig(false)}
                            >
                                <Text style={styles.cancelButtonText}>Cancel</Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={[styles.modalButton, styles.saveButton]}
                                onPress={handleSaveServerConfig}
                            >
                                <Text style={styles.saveButtonText}>Save</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>

            {/* Custom Alert */}
            <CustomAlert
                visible={alertConfig.visible}
                title={alertConfig.title}
                message={alertConfig.message}
                type={alertConfig.type}
                onConfirm={alertConfig.onConfirm}
                singleButton={true}
            />
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F5F7FA',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 20,
        backgroundColor: '#fff',
        paddingTop: Platform.OS === 'android' ? 40 : 20,
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0',
    },
    userInfo: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    avatarCircle: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#E3F2FD',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 10,
    },
    avatarText: {
        color: '#2196F3',
        fontSize: 18,
        fontWeight: 'bold',
    },
    userName: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#333',
    },
    userRole: {
        fontSize: 12,
        color: '#888',
    },
    headerActions: {
        flexDirection: 'row',
    },
    iconButton: {
        marginLeft: 15,
    },
    contentContainer: {
        flex: 1, // Takes up remaining space between Header and Footer
    },
    scrollContent: {
        padding: 20,
        paddingBottom: 100, // Extra padding for scrolling behind footer
    },
    periodCard: {
        backgroundColor: '#fff',
        borderRadius: 15,
        padding: 20,
        marginBottom: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 5,
        elevation: 2,
    },
    periodHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 10,
    },
    periodTexts: {
        marginLeft: 10,
    },
    periodLabel: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#333',
    },
    periodDate: {
        fontSize: 12,
        color: '#666',
    },
    periodTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#333',
    },
    gridContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        marginBottom: 20,
    },
    statCard: {
        width: '48%',
        backgroundColor: '#fff',
        borderRadius: 15,
        padding: 15,
        marginBottom: 15,
        borderWidth: 1,
        height: 120,
        justifyContent: 'space-between',
        position: 'relative',
        overflow: 'hidden',
    },
    cardBlueBorder: { borderColor: '#BBDEFB' },
    cardGreenBorder: { borderColor: '#C8E6C9' },
    cardOrangeBorder: { borderColor: '#FFE0B2' },
    cardLightBlueBorder: { borderColor: '#B3E5FC' },
    cardLabel: {
        fontSize: 14,
        fontWeight: '600',
        marginBottom: 5,
        backgroundColor: '#f5f5f5',
        alignSelf: 'flex-start',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 4,
    },
    cardValue: {
        fontSize: 28,
        fontWeight: 'bold',
    },
    cardBgIcon: {
        position: 'absolute',
        right: -5,
        bottom: -5,
        opacity: 0.5,
    },
    progressBarBg: {
        height: 4,
        backgroundColor: '#E8F5E9',
        borderRadius: 2,
        marginTop: 5,
    },
    progressBarFill: {
        height: 4,
        backgroundColor: '#4CAF50',
        borderRadius: 2,
    },
    // Sync Warning Banner styles
    syncWarningBanner: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 14,
        borderRadius: 12,
        marginBottom: 16,
        borderWidth: 1,
    },
    syncWarningCritical: {
        backgroundColor: '#FFEBEE',
        borderColor: '#FFCDD2',
    },
    syncWarningStale: {
        backgroundColor: '#FFF3E0',
        borderColor: '#FFE0B2',
    },
    syncWarningContent: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
        marginRight: 8,
    },
    syncWarningText: {
        fontSize: 13,
        fontWeight: '500',
        marginLeft: 10,
        flex: 1,
        lineHeight: 18,
    },
    percentageText: {
        fontSize: 10,
        color: '#888',
        alignSelf: 'flex-end',
        marginTop: 2,
    },
    syncRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 20,
    },
    syncCard: {
        width: '31%',
        padding: 10,
        borderRadius: 10,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: 'rgba(0,0,0,0.05)',
    },
    bgGreenLight: { backgroundColor: '#F1F8E9' },
    bgOrangeLight: { backgroundColor: '#FFF3E0' },
    bgRedLight: { backgroundColor: '#FFEBEE' },
    syncLabel: {
        fontSize: 12,
        color: '#555',
        marginVertical: 4,
    },
    syncValue: {
        fontSize: 18,
        fontWeight: 'bold',
    },
    bottomNavWrapper: {
        position: 'absolute',
        bottom: Platform.OS === 'android' ? 50 : 30, // Increased to avoid nav bar intersection
        left: 0,
        right: 0,
        alignItems: 'center',
        paddingHorizontal: 20,
    },
    bottomNav: {
        backgroundColor: '#fff',
        flexDirection: 'row',
        justifyContent: 'space-around',
        alignItems: 'center',
        width: '100%',
        paddingVertical: 10, // Slimmer vertical profile
        borderRadius: 25, // Full rounded corners
        elevation: 8,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 10,
        height: 70, // Fixed height for consistency
    },
    navItem: {
        alignItems: 'center',
        justifyContent: 'center',
        flex: 1,
    },
    navText: {
        fontSize: 11,
        color: '#666',
        marginTop: 2,
        fontWeight: '500',
    },
    scanButton: {
        width: 65,
        height: 65,
        borderRadius: 18, // Rounded square
        backgroundColor: '#2196F3',
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: -35, // Pull up to float
        shadowColor: '#2196F3',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.4,
        shadowRadius: 10,
        elevation: 10,
    },
    // Server Config Modal styles
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'center',
        padding: 20,
    },
    modalContent: {
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 24,
        elevation: 5,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 4,
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 20,
        color: '#333',
        textAlign: 'center',
    },
    modalLabel: {
        fontSize: 16,
        fontWeight: '600',
        color: '#444',
        marginBottom: 5,
    },
    modalHelper: {
        fontSize: 12,
        color: '#888',
        marginBottom: 10,
    },
    modalInput: {
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 8,
        padding: 12,
        fontSize: 16,
        marginBottom: 20,
        backgroundColor: '#f9f9f9',
    },
    modalButtons: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    modalButton: {
        flex: 1,
        padding: 12,
        borderRadius: 8,
        alignItems: 'center',
        marginHorizontal: 5,
    },
    cancelButton: {
        backgroundColor: '#f0f0f0',
    },
    saveButton: {
        backgroundColor: '#2196F3',
    },
    cancelButtonText: {
        color: '#666',
        fontWeight: '600',
    },
    saveButtonText: {
        color: '#fff',
        fontWeight: '600',
    },
});
