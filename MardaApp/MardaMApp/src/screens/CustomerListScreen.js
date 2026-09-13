import React, { useState, useEffect } from 'react';
import {
    StyleSheet,
    Text,
    View,
    TextInput,
    FlatList,
    TouchableOpacity,
    Switch,
    Image,
    StatusBar,
    SafeAreaView,
    Platform,
    ActivityIndicator,
    Alert,
    Modal,
    KeyboardAvoidingView,
    ScrollView
} from 'react-native';
import { Ionicons, FontAwesome, MaterialIcons, Entypo } from '@expo/vector-icons';
import { authService } from '../services/authService';
import { syncService } from '../services/syncService';
import { databaseService } from '../services/databaseService';
import { referenceDataAPI } from '../api/endpoints';

import CustomAlert from '../components/CustomAlert';
import ReadingEntryModal from '../components/ReadingEntryModal';
import { locationService } from '../services/locationService';
import { validation } from '../utils/validation';

export default function CustomerListScreen({ onSettingsPress, onCustomerSelect, initialTab = 'pending' }) {
    // ... activeTab state ...

    const [activeTab, setActiveTab] = useState(['pending', 'encoded'].includes(initialTab) ? initialTab : 'pending');

    const [searchQuery, setSearchQuery] = useState('');
    const [showNoLocationOnly, setShowNoLocationOnly] = useState(false);
    const [customers, setCustomers] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    // Alert State
    const [alertConfig, setAlertConfig] = useState({
        visible: false,
        title: '',
        message: '',
        type: 'info',
        singleButton: true,
        onConfirm: () => { },
        onCancel: () => { }
    });

    const showAlert = (title, message, type = 'info', singleButton = true, onConfirm = null, onCancel = null) => {
        setAlertConfig({
            visible: true,
            title,
            message,
            type,
            singleButton,
            onConfirm: () => {
                setAlertConfig(prev => ({ ...prev, visible: false }));
                if (onConfirm) onConfirm();
            },
            onCancel: () => {
                setAlertConfig(prev => ({ ...prev, visible: false }));
                if (onCancel) onCancel();
            }
        });
    };

    // ... useEffects ...

    useEffect(() => {
        // If initialTab changes (e.g. navigation from dashboard), update valid tabs
        if (initialTab === 'gps_missed') {
            setShowNoLocationOnly(true);
            if (!['pending', 'encoded'].includes(activeTab)) {
                setActiveTab('pending');
            }
        } else if (['pending', 'encoded'].includes(initialTab)) {
            setActiveTab(initialTab);
            setShowNoLocationOnly(false); // Reset filter
        }
    }, [initialTab]);

    useEffect(() => {
        loadCustomers();
    }, []);

    // Reload when tab or search changes
    useEffect(() => {
        if (!isLoading) {
            loadCustomers();
        }
    }, [activeTab, searchQuery]);

    const loadCustomers = async () => {
        try {
            const filters = {
                readingStatus: activeTab,
                search: searchQuery
            };
            const data = await syncService.getLocalCustomers(filters);
            if (data && data.length > 0) {
                const mappedData = data.map(c => ({
                    ...c,
                    id: c.id.toString(),
                    name: c.full_name,
                    nameAm: c.full_name,
                    accountNumber: c.account_number,
                    meterNumber: c.meter_number,
                    hasLocation: !!c.location_coordination,
                    locationName: c.location_coordination ? 'Location Entered' : 'No Location',
                }));
                setCustomers(mappedData);
            } else {
                setCustomers([]);
            }
        } catch (error) {
            console.error('Failed to load customers:', error);
        } finally {
            setIsLoading(false);
            setRefreshing(false);
        }
    };

    const handleRefresh = () => {
        setRefreshing(true);
        loadCustomers();
    };

    // Reading Modal State
    const [modalVisible, setModalVisible] = useState(false);
    const [selectedCustomer, setSelectedCustomer] = useState(null);
    const [currentReading, setCurrentReading] = useState('');
    const [zeroReasons, setZeroReasons] = useState([]);
    const [selectedZeroReason, setSelectedZeroReason] = useState('');
    const [showZeroReasonPicker, setShowZeroReasonPicker] = useState(false);
    const [loadingCustomerId, setLoadingCustomerId] = useState(null);
    const [readerGps, setReaderGps] = useState(null);

    // Load zero reasons
    useEffect(() => {
        loadZeroReasons();
    }, []);

    const loadZeroReasons = async () => {
        try {
            const reasons = await databaseService.getZeroReasons();
            setZeroReasons(reasons || []);
        } catch (error) {
            console.error('Failed to load zero reasons:', error);
        }
    };


    // ...

    const handleReadingClick = async (customer) => {
        // Guard: if filtered to GPS-missed view, block reading for customers with no GPS
        if (showNoLocationOnly && !customer.location_coordination) {
            showAlert(
                'No GPS Coordinate',
                `Customer "${customer.nameAm}" does not have a GPS coordinate. Please add the GPS location before taking a reading.`,
                'warning'
            );
            return;
        }

        setLoadingCustomerId(customer.id);

        try {
            const granted = await locationService.requestPermission();
            if (!granted) {
                showAlert('Permission Denied', 'Location permission is required.', 'error');
                setLoadingCustomerId(null);
                return;
            }

            // Load configured GPS accuracy level
            const gpsLevel = await locationService.getSavedAccuracyLevel();

            // Optimize GPS: Use Smart Location Service
            const currentLoc = await locationService.getSmartLocation();

            // GPS Accuracy Check using configured level
            const gpsAccuracy = currentLoc?.coords?.accuracy || 0;
            const accuracyStatus = locationService.checkAccuracy(gpsAccuracy, gpsLevel);

            if (!accuracyStatus.ok) {
                showAlert('Poor GPS Accuracy', accuracyStatus.message, 'error');
                setLoadingCustomerId(null);
                return;
            }

            if (accuracyStatus.warning) {
                showAlert('GPS Accuracy Warning', accuracyStatus.message, 'warning');
            }

            if (customer.location_coordination) {
                const [latStr, lonStr] = customer.location_coordination.split(',');
                const customerLat = parseFloat(latStr.trim());
                const customerLon = parseFloat(lonStr.trim());

                if (!isNaN(customerLat) && !isNaN(customerLon)) {
                    const distance = locationService.calculateDistance(
                        currentLoc.coords.latitude,
                        currentLoc.coords.longitude,
                        customerLat,
                        customerLon
                    );

                    // Accuracy-aware check: allow if (distance - gpsAccuracy) <= 70
                    const effectiveDistance = Math.max(0, distance - gpsAccuracy);
                    if (effectiveDistance > 70) {
                        showAlert(
                            'Location Error',
                            `You are too far (${distance.toFixed(1)}m ±${Math.round(gpsAccuracy)}m). Max allowed is 70m.`,
                            'error'
                        );
                        setLoadingCustomerId(null);
                        return;
                    }
                }
            }
        } catch (e) {
            console.log('GPS Check Error', e);
            showAlert('Error', 'Failed to verify location. Ensure GPS is on.', 'error');
            setLoadingCustomerId(null);
            return;
        }

        setLoadingCustomerId(null);
        // Capture reader GPS for audit trail
        if (currentLoc && currentLoc.coords) {
            setReaderGps(`${currentLoc.coords.latitude},${currentLoc.coords.longitude}`);
        }
        setSelectedCustomer(customer);
        setModalVisible(true);
        setCurrentReading('');
        setSelectedZeroReason('');
        setShowZeroReasonPicker(false);
    };

    const handleSaveReading = (readingData, callbacks) => {
        const { currentReading: inputReading, zeroReasonId } = readingData;
        const { setShowZeroReasonPicker } = callbacks;

        if (!selectedCustomer) {
            showAlert('Error', 'No customer selected', 'error');
            return;
        }

        const result = validation.validateAndPrepareReading(selectedCustomer, inputReading, zeroReasonId);

        switch (result.action) {
            case 'error':
                showAlert('Error', result.message, 'error');
                return;
            case 'warn_zero_prev':
                showAlert('⚠️ Verify Reading', result.message, 'warning', false,
                    () => proceedSave(result.data.currentReadingNum, result.data.prevReading, result.data.consumption, result.data.zeroReasonId)
                );
                return;
            case 'confirm_high':
                showAlert('Confirm', result.message, 'warning', false,
                    () => proceedSave(result.data.currentReadingNum, result.data.prevReading, result.data.consumption, result.data.zeroReasonId)
                );
                return;
            case 'select_zero_reason':
                setShowZeroReasonPicker(true);
                return;
            case 'proceed':
                proceedSave(result.data.currentReadingNum, result.data.prevReading, result.data.consumption, result.data.zeroReasonId);
                return;
        }
    };

    const proceedSave = async (currentReadingNum, prevReading, consumption, zeroReasonId) => {
        try {
            const kfyawor = await syncService.getKfyawor();
            if (!kfyawor || !kfyawor.kfyawor) {
                showAlert('Error', 'Billing period not set. Please sync data first.', 'error');
                return;
            }

            const reading = {
                customerId: parseInt(selectedCustomer.id),
                currentReading: currentReadingNum,
                prevReading: prevReading,
                consumption: consumption,
                kifyaWer: kfyawor.kfyawor,
                notes: '',
                timestamp: new Date().toISOString(),
                zeroReasonId: zeroReasonId || null,
                readerGps: readerGps || null
            };

            const result = await databaseService.addPendingReading(reading);

            if (result.success) {
                setModalVisible(false);
                loadCustomers();
                // Success alert removed as per user request

                if (result.updated) {
                    showAlert(
                        'Reading Updated',
                        `Reading updated from ${result.previousValue} to ${reading.currentReading}.`,
                        'success'
                    );
                }
            } else {
                showAlert('Error', result.error || 'Failed to save reading', 'error');
            }
        } catch (error) {
            console.error('Save reading error:', error);
            showAlert('Error', 'Failed to save reading', 'error');
        }
    };

    const renderItem = ({ item }) => {
        // Priority-based icon color logic:
        // 1. No GPS → Yellow
        // 2. Has wuzif_hisab > 0 → Red
        // 3. Default → Blue
        const hasNoGPS = !item.hasLocation || !item.location_coordination;
        const hasBalance = item.wuzif_hisab && item.wuzif_hisab > 0;

        // Disable Read button for customers with no GPS when in GPS-missed filter mode
        const isReadDisabled = showNoLocationOnly && hasNoGPS;

        let bgColor = '#E3F2FD'; // Default blue
        let iconColor = '#2196F3';

        if (hasNoGPS) {
            bgColor = '#FFF9C4'; // Light yellow
            iconColor = '#F57F17'; // Dark yellow/amber
        } else if (hasBalance) {
            bgColor = '#FFCDD2'; // Light red
            iconColor = '#D32F2F'; // Dark red
        }

        return (
            <View style={styles.card}>
                <TouchableOpacity onPress={() => onCustomerSelect(item)} style={styles.avatarContainer}>
                    <View style={[styles.avatar, { backgroundColor: bgColor }]}>
                        <FontAwesome name="user" size={24} color={iconColor} />
                    </View>
                </TouchableOpacity>
                <TouchableOpacity style={styles.cardContent} onPress={() => onCustomerSelect(item)}>
                    <Text style={styles.customerName}>{item.nameAm}</Text>
                    <Text style={styles.detailText}>Account No: {item.accountNumber}</Text>
                    <Text style={styles.detailText}>Meter No: {item.meterNumber}</Text>

                    {item.hasLocation && (
                        <View style={styles.locationContainer}>
                            <Ionicons name="location-sharp" size={12} color="#4CAF50" />
                            <Text style={styles.locationText}> {item.locationName}</Text>
                        </View>
                    )}
                    {hasNoGPS && showNoLocationOnly && (
                        <View style={styles.noGpsWarning}>
                            <Ionicons name="warning-outline" size={12} color="#F57F17" />
                            <Text style={styles.noGpsText}> No GPS – Add coordinate first</Text>
                        </View>
                    )}
                </TouchableOpacity>

                {/* Right Side Action - "Read" Button (30% width) */}
                <TouchableOpacity
                    style={[styles.recordActionBtn, isReadDisabled && styles.recordActionBtnDisabled]}
                    onPress={() => handleReadingClick(item)}
                    disabled={loadingCustomerId === item.id}
                >
                    {loadingCustomerId === item.id ? (
                        <ActivityIndicator size="small" color="#fff" />
                    ) : (
                        <Text style={[styles.recordActionText, isReadDisabled && styles.recordActionTextDisabled]}>
                            {isReadDisabled ? 'No GPS' : 'Read'}
                        </Text>
                    )}
                </TouchableOpacity>
            </View>
        );
    };

    // ... (rest of render)

    // Apply additional filter for "No Location Only" toggle
    const filteredData = customers.filter(item => {
        // "No Location Only" toggle
        if (showNoLocationOnly && item.hasLocation) return false;
        return true;
    });

    const totalCount = customers.length;
    const currentCount = filteredData.length;

    return (
        <SafeAreaView style={styles.container}>
            {/* ... Header and Search ... */}
            <StatusBar backgroundColor="#2196F3" barStyle="light-content" />

            <View style={styles.header}>
                <TouchableOpacity onPress={onSettingsPress} style={styles.settingsButton}>
                    <Ionicons name="settings-outline" size={24} color="#fff" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Customer Reading</Text>
                <Ionicons name="person-circle-outline" size={30} color="#fff" />
            </View>

            <View style={styles.searchContainer}>
                <View style={styles.searchBox}>
                    <Ionicons name="search" size={20} color="#666" style={styles.searchIcon} />
                    <TextInput
                        style={styles.searchInput}
                        placeholder="Search by name, account no, meter no"
                        value={searchQuery}
                        onChangeText={setSearchQuery}
                    />
                </View>
            </View>

            <View style={styles.summaryBar}>
                <Text style={styles.summaryText}>
                    Pending: <Text style={styles.yellowText}>{currentCount}</Text> / Total <Text style={styles.yellowText}>{totalCount}</Text>
                </Text>
            </View>

            <View style={styles.filterContainer}>
                <Switch
                    trackColor={{ false: "#767577", true: "#2196F3" }}
                    thumbColor={showNoLocationOnly ? "#fff" : "#f4f3f4"}
                    onValueChange={setShowNoLocationOnly}
                    value={showNoLocationOnly}
                />
                <Text style={styles.filterText}>No GPS Only</Text>
            </View>

            <FlatList
                data={filteredData}
                renderItem={renderItem}
                keyExtractor={item => item.id}
                contentContainerStyle={styles.listContent}
                ItemSeparatorComponent={() => <View style={styles.separator} />}
                refreshing={refreshing}
                onRefresh={handleRefresh}
            />

            {/* ... FAB, Tabs ... */}

            {/* Reading Input Modal Component */}
            <ReadingEntryModal
                visible={modalVisible}
                onClose={() => setModalVisible(false)}
                customer={selectedCustomer}
                onSubmit={handleSaveReading}
                zeroReasons={zeroReasons}
            />

            {/* Custom Alert Component */}
            <CustomAlert
                visible={alertConfig.visible}
                title={alertConfig.title}
                message={alertConfig.message}
                type={alertConfig.type}
                singleButton={alertConfig.singleButton}
                onConfirm={alertConfig.onConfirm}
                onCancel={alertConfig.onCancel}
            />
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#fff' },
    centerContent: { justifyContent: 'center', alignItems: 'center' },
    loadingText: { marginTop: 10, color: '#666' },
    header: {
        backgroundColor: '#2196F3',
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 16,
        paddingTop: Platform.OS === 'android' ? 40 : 16,
    },
    headerTitle: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
    searchContainer: { padding: 10, backgroundColor: '#fff' },
    searchBox: {
        flexDirection: 'row',
        backgroundColor: '#f1f1f1',
        borderRadius: 8,
        alignItems: 'center',
        paddingHorizontal: 10,
        height: 40,
    },
    searchIcon: { marginRight: 10 },
    searchInput: { flex: 1, color: '#333' },
    summaryBar: { backgroundColor: '#1976D2', padding: 8, alignItems: 'center' },
    summaryText: { color: '#fff', fontWeight: 'bold' },
    yellowText: { color: '#FFEB3B' },
    filterContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 10,
        backgroundColor: '#f9f9f9',
        borderBottomWidth: 1,
        borderColor: '#eee'
    },
    filterText: { marginLeft: 10, color: '#555' },
    listContent: { paddingBottom: 100 },
    card: {
        flexDirection: 'row',
        padding: 15,
        alignItems: 'center',
        backgroundColor: '#fff',
    },
    avatarContainer: { marginRight: 15 },
    avatar: {
        width: 50,
        height: 50,
        borderRadius: 25,
        justifyContent: 'center',
        alignItems: 'center',
    },
    cardContent: { flex: 1 },
    customerName: { fontSize: 16, fontWeight: 'bold', color: '#333' },
    detailText: { fontSize: 13, color: '#666' },
    locationContainer: { flexDirection: 'row', alignItems: 'center', marginTop: 4 },
    locationText: { fontSize: 12, color: '#4CAF50' },
    // New Action Button Style
    recordActionBtn: {
        width: '30%',
        backgroundColor: '#2196F3',
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: 12,
        borderRadius: 8,
        marginLeft: 10,
    },
    recordActionBtnDisabled: {
        backgroundColor: '#BDBDBD',
    },
    recordActionText: {
        color: '#fff',
        fontWeight: 'bold',
        fontSize: 16,
    },
    recordActionTextDisabled: {
        color: '#fff',
        fontSize: 13,
    },
    noGpsWarning: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 4,
    },
    noGpsText: {
        fontSize: 11,
        color: '#F57F17',
        fontStyle: 'italic',
    },
    separator: { height: 1, backgroundColor: '#eee' },
    // Modal Styles
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    modalContent: {
        width: '100%',
        backgroundColor: '#fff',
        borderRadius: 15,
        padding: 20,
        elevation: 5,
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 15,
    },
    modalTitle: { fontSize: 20, fontWeight: 'bold', color: '#333' },
    customerInfoBlock: {
        backgroundColor: '#F5F7FA',
        padding: 10,
        borderRadius: 8,
        marginBottom: 20,
    },
    modalCustomerName: { fontSize: 16, fontWeight: 'bold', marginBottom: 5 },
    rowBetween: { flexDirection: 'row', justifyContent: 'space-between' },
    modalDetailText: { color: '#666', fontSize: 14 },
    readingInput: {
        borderWidth: 2,
        borderColor: '#E3F2FD',
        backgroundColor: '#F5F9FF',
        borderRadius: 10,
        padding: 15,
        fontSize: 24,
        textAlign: 'center',
        fontWeight: 'bold',
        marginBottom: 20,
        color: '#2196F3'
    },
    zeroReasonContainer: { marginBottom: 15 },
    zeroReasonLabel: { marginBottom: 8, fontWeight: 'bold', color: '#E65100' },
    reasonItem: {
        padding: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
    },
    selectedReasonItem: { backgroundColor: '#FFF3E0' },
    reasonText: { fontSize: 14 },
    saveButton: {
        backgroundColor: '#2196F3',
        padding: 15,
        borderRadius: 25,
        alignItems: 'center',
        elevation: 3,
    },
    saveButtonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },

    // ... Any other missing styles
});
