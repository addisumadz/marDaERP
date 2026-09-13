import React, { useState, useEffect, useCallback } from 'react';
import {
    StyleSheet,
    Text,
    View,
    FlatList,
    TouchableOpacity,
    RefreshControl,
    ActivityIndicator,
    SafeAreaView,
    StatusBar,
    Platform,
    TextInput,
} from 'react-native';
import { Ionicons, MaterialIcons, FontAwesome } from '@expo/vector-icons';

import { databaseService } from '../services/databaseService';
import { syncService } from '../services/syncService';
import ReadingEntryModal from '../components/ReadingEntryModal';
import CustomAlert from '../components/CustomAlert';

import { locationService } from '../services/locationService';
import { validation } from '../utils/validation';

export default function NearbyCustomersScreen({ onBack, onSelectCustomer }) {
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [location, setLocation] = useState(null);
    const [nearbyCustomers, setNearbyCustomers] = useState([]);
    const [errorMsg, setErrorMsg] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');

    // GPS Accuracy State
    const [gpsAccuracyLevel, setGpsAccuracyLevel] = useState('medium');
    const [currentAccuracy, setCurrentAccuracy] = useState(null);

    // Reading Logic State
    const [modalVisible, setModalVisible] = useState(false);
    const [selectedCustomer, setSelectedCustomer] = useState(null);
    const [loadingCustomerId, setLoadingCustomerId] = useState(null);
    const [zeroReasons, setZeroReasons] = useState([]);

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

    useEffect(() => {
        loadZeroReasons();
        loadGpsLevel();
    }, []);

    const loadGpsLevel = async () => {
        const level = await locationService.getSavedAccuracyLevel();
        setGpsAccuracyLevel(level);
    };

    const loadZeroReasons = async () => {
        try {
            const reasons = await databaseService.getZeroReasons();
            setZeroReasons(reasons || []);
        } catch (error) {
            console.error('Failed to load zero reasons:', error);
        }
    };

    useEffect(() => {
        loadNearbyCustomers(false);
    }, []);

    /**
     * Sort customers based on GPS accuracy quality.
     * - Good accuracy: simple distance sort
     * - Mediocre accuracy: group by similar distance (within accuracy radius), then sort within groups
     */
    const sortCustomers = (customers, accuracy, level) => {
        const qualityInfo = locationService.getAccuracyQuality(accuracy, level);

        if (qualityInfo.quality === 'good') {
            // Good accuracy: trust distances, sort normally
            customers.sort((a, b) => a.distance - b.distance);
        } else {
            // Mediocre accuracy: group customers within accuracy radius, then sort within groups
            const groupRadius = accuracy || 20; // Group customers within the accuracy error radius
            customers.sort((a, b) => a.distance - b.distance);

            // Assign group indices: customers within `groupRadius` of each other are in the same group
            let currentGroupStart = 0;
            for (let i = 1; i < customers.length; i++) {
                if (customers[i].distance - customers[currentGroupStart].distance > groupRadius) {
                    currentGroupStart = i;
                }
                customers[i]._groupIndex = currentGroupStart;
            }
            if (customers.length > 0) {
                customers[0]._groupIndex = 0;
            }
        }

        return customers;
    };

    /**
     * Load nearby customers.
     * @param {boolean} useCache - If true, use cached location if < 15s old. If false, always fetch fresh GPS.
     */
    const loadNearbyCustomers = async (useCache = false) => {
        setLoading(true);
        setErrorMsg(null);
        try {
            // 0. Load GPS accuracy level
            const level = await locationService.getSavedAccuracyLevel();
            setGpsAccuracyLevel(level);

            // 1. Request Permissions
            const granted = await locationService.requestPermission();
            if (!granted) {
                setErrorMsg('Permission to access location was denied');
                setLoading(false);
                return;
            }

            // 2. Get Location (fresh or cached based on button)
            let currentLocation;
            if (useCache) {
                // Smart: use cache if < 15s, otherwise fetch fresh
                currentLocation = await locationService.getSmartLocation({
                    maxAge: 15000,
                    timeoutMs: 8000,
                    targetAccuracy: 10,
                });
            } else {
                // Always fresh GPS (no cache)
                currentLocation = await locationService.getFreshLocation({
                    timeoutMs: 8000,
                    targetAccuracy: 10,
                });
            }

            // 3. Check accuracy using configured level
            const gpsAccuracy = currentLocation?.coords?.accuracy || 0;
            setCurrentAccuracy(gpsAccuracy);
            const accuracyStatus = locationService.checkAccuracy(gpsAccuracy, level);

            if (!accuracyStatus.ok) {
                showAlert('Poor GPS Accuracy', accuracyStatus.message, 'error');
                setLoading(false);
                return;
            }

            if (accuracyStatus.warning) {
                showAlert('GPS Accuracy Warning', accuracyStatus.message, 'warning');
            }

            setLocation(currentLocation.coords);

            // 4. Fetch All Customers with Coordinates
            const database = await databaseService.getDB();
            const customers = await database.getAllAsync(`
                SELECT * 
                FROM customers 
                WHERE location_coordination IS NOT NULL AND location_coordination != ''
            `);

            // 5. Filter by Radius (70 meters)
            const nearby = customers.filter(customer => {
                if (!customer.location_coordination) return false;

                try {
                    const [latStr, lonStr] = customer.location_coordination.split(',');
                    const lat = parseFloat(latStr.trim());
                    const lon = parseFloat(lonStr.trim());

                    if (isNaN(lat) || isNaN(lon)) return false;

                    const distance = locationService.calculateDistance(
                        currentLocation.coords.latitude,
                        currentLocation.coords.longitude,
                        lat,
                        lon
                    );

                    customer.distance = distance;
                    return distance <= 70 && customer.reading_status !== 'encoded';
                } catch (e) {
                    return false;
                }
            });

            // 6. Smart sort based on GPS accuracy quality
            const sorted = sortCustomers(nearby, gpsAccuracy, level);
            setNearbyCustomers(sorted);

        } catch (error) {
            console.error('Error fetching nearby customers:', error);
            if (error.message === 'GPS_TIMEOUT') {
                setErrorMsg('GPS timed out. Move to a clear area and try again.');
            } else if (error.message === 'NO_LOCATION_FIX') {
                setErrorMsg('Could not get a GPS fix. Please try again.');
            } else {
                setErrorMsg('Failed to load nearby customers');
            }
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    // Center button: always fetch fresh GPS
    const handleFreshGPS = useCallback(() => {
        setRefreshing(true);
        loadNearbyCustomers(false);
    }, []);

    // Refresh button: use cache if < 15s, otherwise fetch new
    const handleSmartRefresh = useCallback(() => {
        setRefreshing(true);
        loadNearbyCustomers(true);
    }, []);

    const handleReadingClick = async (customer) => {
        setLoadingCustomerId(customer.id);

        try {
            const granted = await locationService.requestPermission();
            if (!granted) {
                showAlert('Permission Denied', 'Location permission is required.', 'error');
                setLoadingCustomerId(null);
                return;
            }

            // Use smart location with 60s cache for reading verification
            const currentLoc = await locationService.getSmartLocation({
                maxAge: 60000,
                timeoutMs: 8000,
                targetAccuracy: 10,
            });

            const gpsAccuracy = currentLoc?.coords?.accuracy || 0;
            const accuracyStatus = locationService.checkAccuracy(gpsAccuracy, gpsAccuracyLevel);

            if (!accuracyStatus.ok) {
                showAlert('Poor GPS Accuracy', accuracyStatus.message, 'error');
                setLoadingCustomerId(null);
                return;
            }

            if (accuracyStatus.warning) {
                showAlert('GPS Accuracy Warning', accuracyStatus.message, 'warning');
            }

            // Distance check with accuracy tolerance
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
            showAlert('Error', 'Failed to verify location or GPS error.', 'error');
            setLoadingCustomerId(null);
            return;
        }

        setLoadingCustomerId(null);
        setSelectedCustomer(customer);
        setModalVisible(true);
    };

    const handleSubmitReading = ({ currentReading, zeroReasonId }, { setShowZeroReasonPicker }) => {
        const result = validation.validateAndPrepareReading(selectedCustomer, currentReading, zeroReasonId);

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
                readerGps: location ? `${location.latitude},${location.longitude}` : null
            };

            const result = await databaseService.addPendingReading(reading);

            if (result.success) {
                setModalVisible(false);

                // Optimistic Update: remove encoded customer from list
                setNearbyCustomers(prev => prev.filter(c => c.id !== selectedCustomer.id));

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

    // GPS accuracy badge component
    const renderGpsBadge = () => {
        if (currentAccuracy === null) return null;

        const qualityInfo = locationService.getAccuracyQuality(currentAccuracy, gpsAccuracyLevel);
        const threshold = locationService.getAccuracyThreshold(gpsAccuracyLevel);

        return (
            <View style={[styles.gpsBadge, { backgroundColor: qualityInfo.color + '20', borderColor: qualityInfo.color }]}>
                <Ionicons name="navigate" size={12} color={qualityInfo.color} />
                <Text style={[styles.gpsBadgeText, { color: qualityInfo.color }]}>
                    ±{Math.round(currentAccuracy)}m
                </Text>
            </View>
        );
    };

    const renderItem = ({ item }) => {
        // Priority-based icon color logic:
        // All nearby customers have GPS (filtered by SQL query), so only check balance
        const hasBalance = item.wuzif_hisab && item.wuzif_hisab > 0;

        let bgColor = '#E3F2FD'; // Default blue
        let iconColor = '#2196F3';

        if (hasBalance) {
            bgColor = '#FFCDD2'; // Light red
            iconColor = '#D32F2F'; // Dark red
        }

        return (
            <TouchableOpacity
                style={styles.card}
                onPress={() => onSelectCustomer(item)}
            >
                <View style={styles.cardHeader}>
                    <View style={[styles.avatar, { backgroundColor: bgColor }]}>
                        <FontAwesome name="user" size={24} color={iconColor} />
                    </View>
                    <View style={{ flex: 1, marginRight: 10, marginLeft: 10 }}>
                        <Text style={styles.customerName}>
                            {item.full_name}
                        </Text>
                        <Text style={{ fontWeight: 'normal', fontSize: 13, color: item.reading_status === 'encoded' ? '#4CAF50' : '#FF9800', marginTop: 2 }}>
                            ({item.reading_status === 'encoded' ? 'Read' : 'Unread'})
                        </Text>
                    </View>

                    {/* Read Button - Top Right (30% width) */}
                    <TouchableOpacity
                        style={styles.recordActionBtnSide}
                        onPress={() => handleReadingClick(item)}
                        disabled={loadingCustomerId === item.id}
                    >
                        {loadingCustomerId === item.id ? (
                            <ActivityIndicator size="small" color="#fff" />
                        ) : (
                            <Text style={styles.recordActionText}>Read</Text>
                        )}
                    </TouchableOpacity>
                </View>

                <View style={styles.cardRow}>
                    <Text style={styles.label}>Account:</Text>
                    <Text style={styles.value}>{item.account_number}</Text>
                </View>

                <View style={styles.cardRow}>
                    <Text style={styles.label}>Meter:</Text>
                    <Text style={styles.value}>{item.meter_number}</Text>
                </View>

                <View style={styles.distanceContainer}>
                    <Ionicons name="location-sharp" size={16} color="#2196F3" />
                    <Text style={styles.distanceText}>
                        {item.distance.toFixed(1)}m away
                    </Text>
                    {currentAccuracy !== null && (
                        <Text style={styles.accuracyHint}>
                            {' '}(±{Math.round(currentAccuracy)}m)
                        </Text>
                    )}
                </View>
            </TouchableOpacity>
        );
    };

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar backgroundColor="#fff" barStyle="dark-content" />

            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={onBack} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color="#333" />
                </TouchableOpacity>
                <View style={styles.headerCenter}>
                    <Text style={styles.headerTitle}>Nearby (70m)</Text>
                    {renderGpsBadge()}
                </View>
                <TouchableOpacity onPress={handleFreshGPS} style={styles.refreshButton}>
                    <Ionicons name="refresh" size={24} color="#2196F3" />
                </TouchableOpacity>
            </View>

            {/* Search Bar */}
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

            {/* Content */}
            {loading && !refreshing ? (
                <View style={styles.centerContainer}>
                    <ActivityIndicator size="large" color="#2196F3" />
                    <Text style={styles.loadingText}>Locating...</Text>
                </View>
            ) : errorMsg ? (
                <View style={styles.centerContainer}>
                    <MaterialIcons name="location-off" size={48} color="#ccc" />
                    <Text style={styles.errorText}>{errorMsg}</Text>
                    <TouchableOpacity style={styles.retryButton} onPress={loadNearbyCustomers}>
                        <Text style={styles.retryText}>Retry</Text>
                    </TouchableOpacity>
                </View>
            ) : nearbyCustomers.length === 0 ? (
                <View style={styles.centerContainer}>
                    <MaterialIcons name="person-search" size={48} color="#ccc" />
                    <Text style={styles.emptyText}>No customers found within 70 meters.</Text>
                    <Text style={styles.subText}>Try moving closer to customer locations.</Text>
                </View>
            ) : (
                <FlatList
                    data={nearbyCustomers.filter(item => {
                        if (!searchQuery) return true;
                        const q = searchQuery.toLowerCase();
                        return (
                            (item.full_name && item.full_name.toLowerCase().includes(q)) ||
                            (item.account_number && item.account_number.toLowerCase().includes(q)) ||
                            (item.meter_number && item.meter_number.toLowerCase().includes(q))
                        );
                    })}
                    renderItem={renderItem}
                    keyExtractor={item => item.id.toString()}
                    contentContainerStyle={styles.listContent}
                    refreshControl={
                        <RefreshControl refreshing={refreshing} onRefresh={handleSmartRefresh} colors={['#2196F3']} />
                    }
                />
            )}

            {/* Bottom Navigation (Floating Style - mirrors HomeScreen) */}
            <View style={styles.bottomNavWrapper}>
                <View style={styles.bottomNav}>
                    <TouchableOpacity style={styles.navItem} onPress={onBack}>
                        <Ionicons name="arrow-back" size={24} color="#666" />
                        <Text style={styles.navText}>Back</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={styles.scanButton}
                        onPress={handleFreshGPS}
                        activeOpacity={0.8}
                    >
                        {refreshing ? (
                            <ActivityIndicator size="small" color="#fff" />
                        ) : (
                            <Ionicons name="locate" size={28} color="#fff" />
                        )}
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.navItem} onPress={handleSmartRefresh}>
                        <Ionicons name="refresh" size={24} color="#666" />
                        <Text style={styles.navText}>Refresh</Text>
                    </TouchableOpacity>
                </View>
            </View>

            <ReadingEntryModal
                visible={modalVisible}
                onClose={() => setModalVisible(false)}
                customer={selectedCustomer}
                onSubmit={handleSubmitReading}
                zeroReasons={zeroReasons}
            />

            <CustomAlert
                visible={alertConfig.visible}
                title={alertConfig.title}
                message={alertConfig.message}
                type={alertConfig.type}
                singleButton={alertConfig.singleButton}
                onConfirm={alertConfig.onConfirm}
                onCancel={alertConfig.onCancel}
            />
        </SafeAreaView >
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f5f5f5',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 16,
        backgroundColor: '#fff',
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
        paddingTop: Platform.OS === 'android' ? 40 : 16,
    },
    headerCenter: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    searchContainer: {
        padding: 10,
        backgroundColor: '#fff',
    },
    searchBox: {
        flexDirection: 'row',
        backgroundColor: '#f1f1f1',
        borderRadius: 8,
        alignItems: 'center',
        paddingHorizontal: 10,
        height: 40,
    },
    searchIcon: {
        marginRight: 10,
    },
    searchInput: {
        flex: 1,
        color: '#333',
    },
    backButton: {
        padding: 5,
    },
    refreshButton: {
        padding: 5,
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333',
    },
    // GPS Badge styles
    gpsBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 8,
        paddingVertical: 3,
        borderRadius: 12,
        borderWidth: 1,
        marginLeft: 8,
    },
    gpsBadgeText: {
        fontSize: 11,
        fontWeight: 'bold',
        marginLeft: 3,
    },
    centerContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    listContent: {
        padding: 16,
        paddingBottom: 120,
    },
    loadingText: {
        marginTop: 10,
        color: '#666',
    },
    errorText: {
        marginTop: 10,
        color: '#F44336',
        textAlign: 'center',
        marginBottom: 20,
    },
    emptyText: {
        marginTop: 10,
        fontSize: 16,
        color: '#666',
        fontWeight: '600',
    },
    subText: {
        marginTop: 5,
        color: '#999',
        textAlign: 'center',
    },
    retryButton: {
        backgroundColor: '#2196F3',
        paddingHorizontal: 20,
        paddingVertical: 10,
        borderRadius: 5,
    },
    retryText: {
        color: '#fff',
        fontWeight: 'bold',
    },
    card: {
        backgroundColor: '#fff',
        borderRadius: 10,
        padding: 16,
        marginBottom: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        elevation: 2,
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
    },
    customerName: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#333',
        flex: 1,
        marginRight: 10,
    },
    cardRow: {
        flexDirection: 'row',
        marginBottom: 4,
    },
    label: {
        width: 80,
        color: '#666',
        fontSize: 14,
    },
    value: {
        color: '#333',
        fontSize: 14,
        flex: 1,
    },
    distanceContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 8,
        paddingTop: 8,
        borderTopWidth: 1,
        borderTopColor: '#f0f0f0',
    },
    distanceText: {
        fontSize: 12,
        fontWeight: 'bold',
        color: '#2196F3',
        marginLeft: 4,
    },
    accuracyHint: {
        fontSize: 11,
        color: '#999',
    },
    recordActionBtnSide: {
        width: '30%',
        backgroundColor: '#2196F3',
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: 12,
        borderRadius: 8,
        marginLeft: 10,
    },
    recordActionText: {
        color: '#fff',
        fontWeight: 'bold',
        fontSize: 16,
    },
    avatar: {
        width: 50,
        height: 50,
        borderRadius: 25,
        justifyContent: 'center',
        alignItems: 'center',
    },
    bottomNavWrapper: {
        position: 'absolute',
        bottom: Platform.OS === 'android' ? 50 : 30,
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
        paddingVertical: 10,
        borderRadius: 25,
        elevation: 8,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 10,
        height: 70,
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
        borderRadius: 18,
        backgroundColor: '#2196F3',
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: -35,
        shadowColor: '#2196F3',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.4,
        shadowRadius: 10,
        elevation: 10,
    },
});
