import React, { useState, useEffect } from 'react';
import {
    StyleSheet,
    Text,
    View,
    TextInput,
    TouchableOpacity,
    Alert,
    ScrollView,
    SafeAreaView,
    StatusBar,
    ActivityIndicator,
    Platform,
    Linking,
    Modal,
    KeyboardAvoidingView
} from 'react-native';
import { Ionicons, MaterialIcons, FontAwesome5 } from '@expo/vector-icons';
import * as Location from 'expo-location';
import { databaseService } from '../services/databaseService';
import { syncService } from '../services/syncService';

import CustomAlert from '../components/CustomAlert';
import ReadingEntryModal from '../components/ReadingEntryModal';
import QRScannerModal from '../components/QRScannerModal';
import { locationService } from '../services/locationService';
import { validation } from '../utils/validation';

export default function CustomerDetailScreen({ customer, onBack, onSave }) {
    const [phoneNumber, setPhoneNumber] = useState(customer.phone_number || '');
    const [qrCode, setQrCode] = useState(customer.qr_code || '');
    const [showQRScanner, setShowQRScanner] = useState(false);
    const [loadingLocation, setLoadingLocation] = useState(false);
    const [locationCoords, setLocationCoords] = useState(customer.location_coordination || null);

    // Reading Modal State
    const [modalVisible, setModalVisible] = useState(false);
    const [currentReading, setCurrentReading] = useState('');
    const [zeroReasons, setZeroReasons] = useState([]);
    const [selectedZeroReason, setSelectedZeroReason] = useState('');
    const [showZeroReasonPicker, setShowZeroReasonPicker] = useState(false);
    const [isSavingReading, setIsSavingReading] = useState(false);

    // Reader GPS captured during distance check
    const [readerGps, setReaderGps] = useState(null);

    // Encoded reading info
    const [encodedReadingData, setEncodedReadingData] = useState(null);

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

    // Initialize zero reasons and encoded reading data
    useEffect(() => {
        loadZeroReasons();
        if (customer.reading_status === 'encoded') {
            loadEncodedReading();
        }
    }, []);

    const loadZeroReasons = async () => {
        try {
            const reasons = await databaseService.getZeroReasons();
            setZeroReasons(reasons || []);
        } catch (error) {
            console.error('Failed to load zero reasons:', error);
        }
    };

    const loadEncodedReading = async () => {
        try {
            const data = await databaseService.getPendingReadingForCustomer(customer.id);
            setEncodedReadingData(data);
        } catch (error) {
            console.error('Failed to load encoded reading:', error);
        }
    };

    const handleDirections = () => {
        if (!locationCoords) {
            showAlert('No Location', 'This customer does not have GPS coordinates set.', 'warning');
            return;
        }

        const url = `https://www.google.com/maps/dir/?api=1&destination=${locationCoords}`;
        Linking.canOpenURL(url).then(supported => {
            if (supported) {
                Linking.openURL(url);
            } else {
                showAlert('Error', 'Unable to open Google Maps', 'error');
            }
        });
    };

    // Helper: verify distance & open reading modal
    const verifyDistanceAndOpenModal = (currentLoc) => {
        if (locationCoords) {
            const [latStr, lonStr] = locationCoords.split(',');
            const customerLat = parseFloat(latStr.trim());
            const customerLon = parseFloat(lonStr.trim());

            if (!isNaN(customerLat) && !isNaN(customerLon)) {
                const distance = locationService.calculateDistance(
                    currentLoc.coords.latitude,
                    currentLoc.coords.longitude,
                    customerLat,
                    customerLon
                );

                // Accuracy-aware distance check (same formula as NearbyCustomersScreen)
                const gpsAccuracy = currentLoc.coords.accuracy || 0;
                const effectiveDistance = Math.max(0, distance - gpsAccuracy);
                if (effectiveDistance > 70) {
                    showAlert('Out of Range', `You are too far (${distance.toFixed(1)}m ±${Math.round(gpsAccuracy)}m). Max allowed is 70m.`, 'error');
                    return;
                }
            }
        }

        // Store reader GPS for saving with reading
        setReaderGps(`${currentLoc.coords.latitude},${currentLoc.coords.longitude}`);

        // Reset and open modal
        setCurrentReading('');
        setSelectedZeroReason('');
        setShowZeroReasonPicker(false);
        setModalVisible(true);
    };

    const handleOpenReadingModal = async () => {
        // Block reading if customer has no GPS coordinates
        if (!locationCoords) {
            showAlert(
                'No GPS Coordinate',
                'This customer does not have a GPS coordinate. Please add the GPS location before taking a reading.',
                'warning'
            );
            return;
        }

        // Enforce GPS Constraint (70m)
        setLoadingLocation(true);
        try {
            const granted = await locationService.requestPermission();
            if (!granted) {
                showAlert('Permission Denied', 'Location permission is required.', 'error');
                setLoadingLocation(false);
                return;
            }

            // Get GPS accuracy level from settings
            const level = await locationService.getSavedAccuracyLevel();

            // Get location using locationService (smart: cache if < 15s, else fresh)
            const currentLoc = await locationService.getSmartLocation({
                maxAge: 15000,
                timeoutMs: 8000,
                targetAccuracy: 10,
            });

            const gpsAccuracy = currentLoc?.coords?.accuracy || 0;
            const accuracyStatus = locationService.checkAccuracy(gpsAccuracy, level);

            if (!accuracyStatus.ok) {
                showAlert('Poor GPS Accuracy', accuracyStatus.message, 'error');
                setLoadingLocation(false);
                return;
            }

            if (accuracyStatus.warning) {
                showAlert(
                    'GPS Accuracy Warning',
                    `${accuracyStatus.message}\n\nProceed anyway?`,
                    'warning',
                    false,
                    () => {
                        setLoadingLocation(false);
                        verifyDistanceAndOpenModal(currentLoc);
                    },
                    () => { setLoadingLocation(false); }
                );
                return;
            }

            setLoadingLocation(false);
            verifyDistanceAndOpenModal(currentLoc);

        } catch (e) {
            console.log('GPS Error', e);
            if (e.message === 'GPS_TIMEOUT') {
                showAlert('GPS Timeout', 'GPS timed out. Move to a clear area and try again.', 'error');
            } else if (e.message === 'NO_LOCATION_FIX') {
                showAlert('No GPS Fix', 'Could not get a GPS fix. Please try again.', 'error');
            } else {
                showAlert('Error', 'Failed to get location. Ensure GPS is enabled and you have a clear view of the sky.', 'error');
            }
            setLoadingLocation(false);
            return;
        }
    };

    // Shared validation for ReadingEntryModal
    const handleSubmitReading = ({ currentReading, zeroReasonId }, { setShowZeroReasonPicker }) => {
        const result = validation.validateAndPrepareReading(customer, currentReading, zeroReasonId);

        switch (result.action) {
            case 'error':
                showAlert('Error', result.message, 'error');
                return;
            case 'warn_zero_prev':
                showAlert('⚠️ Verify Reading', result.message, 'warning', false,
                    () => proceedSaveReading(result.data.currentReadingNum, result.data.prevReading, result.data.consumption, result.data.zeroReasonId)
                );
                return;
            case 'confirm_high':
                showAlert('Confirm', result.message, 'warning', false,
                    () => proceedSaveReading(result.data.currentReadingNum, result.data.prevReading, result.data.consumption, result.data.zeroReasonId)
                );
                return;
            case 'select_zero_reason':
                setShowZeroReasonPicker(true);
                return;
            case 'proceed':
                proceedSaveReading(result.data.currentReadingNum, result.data.prevReading, result.data.consumption, result.data.zeroReasonId);
                return;
        }
    };

    const proceedSaveReading = async (currentReadingNum, prevReading, consumption, zeroReasonId) => {
        setIsSavingReading(true);
        try {
            const kfyawor = await syncService.getKfyawor();
            if (!kfyawor || !kfyawor.kfyawor) {
                showAlert('Error', 'Billing period not set. Sync first.', 'error');
                setIsSavingReading(false);
                return;
            }

            const reading = {
                customerId: parseInt(customer.id),
                currentReading: currentReadingNum,
                prevReading: prevReading,
                consumption: consumption,
                kifyaWer: kfyawor.kfyawor,
                notes: '',
                timestamp: new Date().toISOString(),
                zeroReasonId: zeroReasonId || selectedZeroReason || null,
                readerGps: readerGps || null
            };

            const result = await databaseService.addPendingReading(reading);

            if (result.success) {
                setModalVisible(false); // Close Modal first
                // Refresh encoded reading display
                await loadEncodedReading();

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
            showAlert('Error', 'Failed to save', 'error');
        } finally {
            setIsSavingReading(false);
        }
    };

    const handleGetLocation = async () => {
        setLoadingLocation(true);
        try {
            let { status } = await Location.requestForegroundPermissionsAsync();
            if (status !== 'granted') {
                showAlert('Permission denied', 'Location permission is required', 'error');
                setLoadingLocation(false);
                return;
            }

            // Use current position with highest accuracy (skip cached/last known)
            let location = await Location.getCurrentPositionAsync({
                accuracy: Location.Accuracy.Highest,
            });
            const coordsString = `${location.coords.latitude},${location.coords.longitude}`;
            const accuracy = location.coords.accuracy?.toFixed(1) || 'N/A';

            setLoadingLocation(false);

            // Show confirmation dialog with GPS result
            showAlert(
                'GPS Location Retrieved',
                `Coordinates:\n${location.coords.latitude.toFixed(6)}, ${location.coords.longitude.toFixed(6)}\n\nAccuracy: ${accuracy}m\n\nSave this location to customer record?`,
                'success',
                false, // Show Cancel/Save buttons
                () => {
                    // On Save: Update customer data
                    setLocationCoords(coordsString);
                    const updatedCustomer = {
                        ...customer,
                        location_coordination: coordsString,
                        isModified: true
                    };
                    onSave(updatedCustomer);
                    // Don't show another modal - onSave already handles confirmation
                }
            );
        } catch (error) {
            console.error('GPS Error:', error);
            showAlert('Error', 'Could not fetch location. Please ensure GPS is enabled.', 'error');
            setLoadingLocation(false);
        }
    };

    const handleUpdateInfo = () => {
        // Validate Phone Number
        // Pattern: Starts with 0, 251, or +251, followed by 9 or 7, then 8 digits
        const phoneRegex = /^(?:0|251|\+251)(?:9|7)\d{8}$/;
        const cleanPhone = (phoneNumber || "").trim();

        if (cleanPhone && !phoneRegex.test(cleanPhone)) {
            showAlert('Invalid Phone', 'Phone number must start with 0, 251, or +251, followed by 9 or 7, then 8 digits.', 'error');
            return;
        }

        const updatedCustomer = {
            ...customer,
            phone_number: cleanPhone,
            location_coordination: locationCoords,
            qr_code: qrCode,
            isModified: true
        };
        onSave(updatedCustomer);
        showAlert('Success', 'Customer info updated', 'success');
    };

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar backgroundColor="#2196F3" barStyle="light-content" />

            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={onBack} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color="#2196F3" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Customer Detail</Text>
                <TouchableOpacity style={styles.menuButton}>
                    <MaterialIcons name="more-vert" size={24} color="#2196F3" />
                </TouchableOpacity>
            </View>

            <View style={styles.mainContainer}>
                <ScrollView contentContainerStyle={styles.content}>

                    {/* Profile Card */}
                    <View style={styles.profileCard}>
                        <View style={styles.avatarContainer}>
                            <FontAwesome5 name="user-check" size={24} color="#fff" />
                            <View style={[styles.avatarBadge, { backgroundColor: customer.status === 'Active' ? '#4CAF50' : '#F44336' }]} />
                        </View>
                        <View style={styles.profileInfo}>
                            <Text style={styles.profileName}>{customer.full_name || 'Unknown Helper'}</Text>
                            <Text style={styles.profilePhone}>{phoneNumber || 'No Phone'}</Text>
                            <Text style={styles.statusText}>{customer.status || 'Unknown Status'}</Text>
                        </View>
                    </View>

                    {/* Customer Info Section (White Card) */}
                    <View style={styles.sectionHeader}>
                        <View style={styles.sectionIconBg}>
                            <FontAwesome5 name="user" size={14} color="#2196F3" />
                        </View>
                        <Text style={styles.sectionTitle}>Main Info</Text>
                    </View>

                    <View style={styles.detailCard}>
                        {/* ... Existing grid rows ... */}
                        <View style={styles.gridRow}>
                            <View style={styles.gridItem}>
                                <Text style={styles.gridLabel}>WC Code</Text>
                                <Text style={styles.gridValue}>{customer.account_number}</Text>
                            </View>
                            <View style={styles.gridItem}>
                                <Text style={styles.gridLabel}>House No.</Text>
                                <Text style={styles.gridValue}>{customer.house_number || '-'}</Text>
                            </View>
                        </View>
                        <View style={styles.gridRow}>
                            <View style={styles.gridItem}>
                                <Text style={styles.gridLabel}>Meter Size</Text>
                                <Text style={styles.gridValue}>{customer.meter_size_id || '-'}</Text>
                            </View>
                            <View style={styles.gridItem}>
                                <Text style={styles.gridLabel}>Meter No.</Text>
                                <Text style={styles.gridValue}>{customer.meter_number}</Text>
                            </View>
                        </View>
                        <View style={styles.gridRow}>
                            <View style={styles.gridItem}>
                                <Text style={styles.gridLabel}>Group</Text>
                                <Text style={styles.gridValue}>{customer.customer_type_id}</Text>
                            </View>
                            <View style={styles.gridItem}>
                                <Text style={styles.gridLabel}>Count No</Text>
                                <Text style={styles.gridValue}>{customer.count_number || '-'}</Text>
                            </View>
                        </View>
                    </View>

                    {/* Additional Info Section */}
                    <View style={styles.sectionHeader}>
                        <View style={[styles.sectionIconBg, { backgroundColor: '#E1BEE7' }]}>
                            <MaterialIcons name="info-outline" size={16} color="#8E24AA" />
                        </View>
                        <Text style={styles.sectionTitle}>Additional Details</Text>
                    </View>

                    <View style={styles.detailCard}>
                        {/* ... Existing additional info ... */}
                        <View style={styles.gridRow}>
                            <View style={styles.gridItem}>
                                <Text style={styles.gridLabel}>Kebele</Text>
                                <Text style={styles.gridValue}>{customer.address_1_id || '-'}</Text>
                            </View>
                            <View style={styles.gridItem}>
                                <Text style={styles.gridLabel}>Ketena</Text>
                                <Text style={styles.gridValue}>{customer.address_2_id || '-'}</Text>
                            </View>
                        </View>
                        <View style={styles.gridRow}>
                            <View style={styles.gridItem}>
                                <Text style={styles.gridLabel}>Reading Status</Text>
                                <Text style={[styles.gridValue, { color: customer.reading_status === 'encoded' ? '#4CAF50' : '#FF9800' }]}>
                                    {customer.reading_status || 'pending'}
                                </Text>
                            </View>
                            <View style={styles.gridItem}>
                                <Text style={styles.gridLabel}>Last Month</Text>
                                <Text style={styles.gridValue}>{customer.reading_month || '-'}</Text>
                            </View>
                        </View>
                        <View style={styles.gridRow}>
                            <View style={styles.gridItem}>
                                <Text style={styles.gridLabel}>Previous Reading</Text>
                                <Text style={[styles.gridValue, { color: '#2196F3', fontWeight: 'bold' }]}>{customer.previous_reading || 0}</Text>
                            </View>
                            <View style={styles.gridItem}>
                                <Text style={styles.gridLabel}>Coordinates</Text>
                                <Text style={styles.gridValue} numberOfLines={1}>{locationCoords || 'None'}</Text>
                            </View>
                        </View>
                        {customer.additional_text ? (
                            <View style={styles.row}>
                                <Text style={styles.gridLabel}>Additional:</Text>
                                <Text style={styles.gridValue}>{customer.additional_text}</Text>
                            </View>
                        ) : null}
                    </View>

                    {/* Encoded Reading Summary Card */}
                    {customer.reading_status === 'encoded' && (
                        <>
                            <View style={styles.sectionHeader}>
                                <View style={[styles.sectionIconBg, { backgroundColor: '#E8F5E9' }]}>
                                    <Ionicons name="checkmark-circle" size={16} color="#4CAF50" />
                                </View>
                                <Text style={styles.sectionTitle}>Current Reading</Text>
                            </View>

                            <View style={[styles.detailCard, { borderLeftWidth: 4, borderLeftColor: '#4CAF50' }]}>
                                <View style={styles.gridRow}>
                                    <View style={styles.gridItem}>
                                        <Text style={styles.gridLabel}>Current Reading</Text>
                                        <Text style={[styles.gridValue, { color: '#4CAF50', fontSize: 20, fontWeight: 'bold' }]}>
                                            {encodedReadingData ? encodedReadingData.current_reading : '—'}
                                        </Text>
                                    </View>
                                    <View style={styles.gridItem}>
                                        <Text style={styles.gridLabel}>Consumption (m³)</Text>
                                        <Text style={[styles.gridValue, {
                                            fontSize: 20,
                                            fontWeight: 'bold',
                                            color: encodedReadingData && encodedReadingData.consumption === 0
                                                ? '#FF9800'
                                                : '#2196F3'
                                        }]}>
                                            {encodedReadingData ? encodedReadingData.consumption : '—'}
                                        </Text>
                                    </View>
                                </View>
                                <View style={[styles.remarkBox, { backgroundColor: '#E8F5E9', marginTop: 4 }]}>
                                    <Text style={[styles.remarkLabel, { color: '#388E3C' }]}>✓ Reading encoded and pending sync</Text>
                                </View>
                            </View>
                        </>
                    )}

                    {/* Unpaid Bills Section */}
                    <View style={styles.sectionHeader}>
                        <View style={[styles.sectionIconBg, { backgroundColor: '#FFF3E0' }]}>
                            <Ionicons name="wallet-outline" size={16} color="#FF9800" />
                        </View>
                        <Text style={styles.sectionTitle}>Financials</Text>
                    </View>

                    <View style={styles.detailCard}>
                        <View style={styles.rowBetween}>
                            <Text style={styles.billLabel}>Wuzif Hisab (Unpaid):</Text>
                            <Text style={styles.billText}>{customer.wuzif_hisab ? `${customer.wuzif_hisab} Birr` : '0.00'}</Text>
                        </View>
                        {customer.wuzif_remark ? (
                            <View style={styles.remarkBox}>
                                <Text style={styles.remarkLabel}>Remark:</Text>
                                <Text style={styles.remarkText}>{customer.wuzif_remark}</Text>
                            </View>
                        ) : null}

                        <View style={styles.qrBox}>
                            <Text style={styles.label}>QR Code Value</Text>
                            <Text style={styles.value}>{customer.qr_code || '----'}</Text>
                        </View>
                    </View>

                    {/* Update Info */}
                    <View style={styles.updateCard}>
                        <Text style={styles.cardTitle}>Update Contact & Info</Text>

                        {/* Phone Update */}
                        <View style={styles.inputRow}>
                            <TextInput
                                style={styles.input}
                                placeholder="Phone Number"
                                value={phoneNumber}
                                onChangeText={setPhoneNumber}
                                keyboardType="phone-pad"
                            />
                        </View>

                        {/* QR Code Update */}
                        <View style={[styles.inputRow, { marginTop: 10 }]}>
                            <TextInput
                                style={styles.input}
                                placeholder="QR Code content"
                                value={qrCode}
                                onChangeText={setQrCode}
                            />
                            <TouchableOpacity style={styles.scanButton} onPress={() => setShowQRScanner(true)}>
                                <MaterialIcons name="qr-code-scanner" size={24} color="#fff" />
                            </TouchableOpacity>
                        </View>

                        {/* Action Buttons */}
                        <View style={{ gap: 10, marginTop: 15 }}>
                            <TouchableOpacity style={styles.gpsButton} onPress={handleGetLocation}>
                                <MaterialIcons name="my-location" size={20} color="#2196F3" />
                                <Text style={styles.gpsButtonText}>Update GPS Location</Text>
                            </TouchableOpacity>

                            <TouchableOpacity style={styles.saveButton} onPress={handleUpdateInfo}>
                                <Text style={styles.saveButtonText}>Save Updates</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </ScrollView>

                {/* Footer in Floating Wrapper */}
                <View style={styles.footerWrapper}>
                    <View style={styles.footer}>
                        <TouchableOpacity style={styles.directionBtn} onPress={handleDirections}>
                            <FontAwesome5 name="map-marker-alt" size={16} color="#2196F3" />
                            <Text style={styles.directionText}>Directions</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={[styles.recordBtn, customer.reading_status === 'encoded' && { backgroundColor: '#FF9800' }]}
                            onPress={handleOpenReadingModal}
                        >
                            {loadingLocation ? (
                                <ActivityIndicator size="small" color="#fff" />
                            ) : (
                                <>
                                    <Ionicons
                                        name={customer.reading_status === 'encoded' ? 'create-outline' : 'document-text-outline'}
                                        size={20}
                                        color="#fff"
                                    />
                                    <Text style={styles.recordText}>
                                        {customer.reading_status === 'encoded' ? 'Update Reading' : 'Record Reading'}
                                    </Text>
                                </>
                            )}
                        </TouchableOpacity>
                    </View>
                </View>
            </View>

            {/* Reading Entry Modal */}
            <ReadingEntryModal
                visible={modalVisible}
                onClose={() => setModalVisible(false)}
                customer={customer}
                onSubmit={handleSubmitReading}
                zeroReasons={zeroReasons}
                isSubmitting={isSavingReading}
            />

            {/* QR Scanner Modal */}
            <QRScannerModal
                visible={showQRScanner}
                onClose={() => setShowQRScanner(false)}
                onScan={(data) => {
                    setQrCode(data);
                    setShowQRScanner(false);
                    showAlert('Success', 'QR Code scanned successfully', 'success');
                }}
                title="Scan Customer QR"
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
        </SafeAreaView >
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
        padding: 16,
        backgroundColor: '#fff',
        paddingTop: Platform.OS === 'android' ? 40 : 16,
        elevation: 2,
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#2196F3',
    },
    backButton: { padding: 5 },
    menuButton: { padding: 5 },
    mainContainer: {
        flex: 1, // Takes remaining space
        flexDirection: 'column',
    },
    content: {
        padding: 16,
        paddingBottom: 100, // Extra padding for scrolling behind floating footer
    },
    profileCard: {
        backgroundColor: '#fff',
        borderRadius: 15,
        padding: 16,
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 20,
        elevation: 2,
    },
    avatarContainer: {
        width: 50,
        height: 50,
        borderRadius: 25,
        backgroundColor: '#2196F3',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 15,
        position: 'relative',
    },
    avatarBadge: {
        position: 'absolute',
        right: 0,
        bottom: 0,
        width: 14,
        height: 14,
        borderRadius: 7,
        borderWidth: 2,
        borderColor: '#2196F3',
    },
    profileInfo: {
        flex: 1,
    },
    profileName: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#333',
    },
    profilePhone: {
        fontSize: 16,
        color: '#666',
        marginTop: 2,
    },
    statusText: {
        fontSize: 14,
        color: '#888',
        marginTop: 2,
        fontStyle: 'italic',
    },
    sectionHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 10,
        paddingLeft: 5,
        marginTop: 10,
    },
    sectionIconBg: {
        width: 24,
        height: 24,
        borderRadius: 8,
        backgroundColor: '#E3F2FD',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 10,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333',
    },
    detailCard: {
        backgroundColor: '#fff',
        borderRadius: 15,
        padding: 16,
        marginBottom: 10,
        elevation: 1,
    },
    gridRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 12,
    },
    gridItem: {
        flex: 1,
        marginRight: 8,
    },
    gridLabel: {
        fontSize: 14,
        color: '#888',
        marginBottom: 2,
    },
    gridValue: {
        fontSize: 16,
        fontWeight: '600',
        color: '#333',
    },
    row: {
        marginTop: 8,
    },
    qrBox: {
        backgroundColor: '#E3F2FD',
        borderRadius: 10,
        padding: 12,
        marginTop: 15,
    },
    scanButton: {
        backgroundColor: '#2196F3',
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 6,
    },
    scanButtonText: {
        color: '#fff',
        marginLeft: 6,
        fontWeight: 'bold',
        fontSize: 14
    },
    rowBetween: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    billLabel: {
        fontSize: 18,
        color: '#555',
    },
    billText: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#D32F2F',
    },
    remarkBox: {
        marginTop: 10,
        padding: 10,
        backgroundColor: '#FFFDE7',
        borderRadius: 8,
    },
    remarkLabel: { fontSize: 14, fontWeight: 'bold', color: '#FBC02D' },
    remarkText: { fontSize: 16, color: '#333' },
    updateCard: {
        backgroundColor: '#fff',
        borderRadius: 15,
        padding: 16,
        elevation: 1,
        marginBottom: 20,
        marginTop: 10,
    },
    cardTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 10,
    },
    inputRow: {
        flexDirection: 'row',
        marginBottom: 10,
    },
    input: {
        flex: 1,
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 8,
        paddingHorizontal: 10,
        height: 40,
        marginRight: 10,
    },
    saveMiniButton: {
        backgroundColor: '#2196F3',
        justifyContent: 'center',
        paddingHorizontal: 15,
        borderRadius: 8,
    },
    saveMiniText: { color: '#fff' },
    scanButton: {
        backgroundColor: '#673AB7',
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 15,
        borderRadius: 8,
        marginLeft: 10,
    },
    gpsButton: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#E3F2FD',
        padding: 12,
        borderRadius: 8,
    },
    gpsButtonText: { color: '#2196F3', marginLeft: 8, fontWeight: 'bold' },
    saveButton: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#4CAF50',
        padding: 12,
        borderRadius: 8,
    },
    saveButtonText: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
    content: {
        padding: 16,
        paddingBottom: 100, // Extra padding for scrolling behind floating footer
    },
    // ... (rest of styles)
    footerWrapper: {
        position: 'absolute',
        bottom: Platform.OS === 'android' ? 50 : 30, // Increased to avoid nav bar intersection
        left: 0,
        right: 0,
        alignItems: 'center',
        paddingHorizontal: 20,
    },
    footer: {
        backgroundColor: '#fff',
        flexDirection: 'row',
        padding: 10,
        width: '100%',
        borderRadius: 25, // Floating rounded look
        elevation: 8,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 10,
        height: 70, // Consistent height
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    directionBtn: {
        flex: 1,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#2196F3',
        borderRadius: 20, // More rounded
        paddingVertical: 12,
        marginRight: 10,
        backgroundColor: '#fff',
        height: '100%', // Fill container
    },
    directionText: {
        color: '#2196F3',
        fontWeight: 'bold',
        marginLeft: 8,
    },
    recordBtn: {
        flex: 1.5,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#2196F3',
        borderRadius: 20, // More rounded
        paddingVertical: 12,
        height: '100%', // Fill container
    },
    recordText: {
        color: '#fff',
        fontWeight: 'bold',
        marginLeft: 8,
        fontSize: 18,
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'center', // Center vertically
        alignItems: 'center', // Center horizontally
        padding: 20,
    },
    modalContent: {
        width: '100%',
        backgroundColor: '#fff',
        borderRadius: 20,
        padding: 20,
        elevation: 5,
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20,
    },
    modalTitle: { fontSize: 22, fontWeight: 'bold' },
    readingInput: {
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 10,
        padding: 15,
        fontSize: 26,
        textAlign: 'center',
        marginVertical: 20,
        fontWeight: 'bold',
    },
    confirmButton: {
        backgroundColor: '#2196F3',
        padding: 15,
        borderRadius: 10,
        alignItems: 'center',
    },
    confirmText: { color: '#fff', fontSize: 20, fontWeight: 'bold' },
    pickerContainer: { marginBottom: 15 },
    reasonItem: { padding: 10, borderBottomWidth: 1, borderBottomColor: '#eee' },
    selectedReason: { backgroundColor: '#E3F2FD' },
    reasonText: { fontSize: 18 },
    readingInfoBox: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        backgroundColor: '#f5f5f5',
        padding: 10,
        borderRadius: 8,
    }
});
