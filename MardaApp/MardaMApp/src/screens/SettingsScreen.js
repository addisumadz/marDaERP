import React, { useState, useEffect } from 'react';
import {
    StyleSheet,
    Text,
    View,
    TouchableOpacity,
    ScrollView,
    StatusBar,
    SafeAreaView,
    Platform,
    Modal,
    TextInput,
    Alert,
} from 'react-native';
import { Ionicons, FontAwesome, MaterialIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { authService } from '../services/authService';
import { syncService } from '../services/syncService';
import { databaseService } from '../services/databaseService';
import { locationService } from '../services/locationService';
import * as FileSystemLegacy from 'expo-file-system/legacy';
import { StorageAccessFramework } from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import CustomAlert from '../components/CustomAlert';
import { STORAGE_KEYS } from '../constants/config';

export default function SettingsScreen({ onLogout, onBack }) {
    const [lastSync, setLastSync] = useState(null);
    const [realUsername, setRealUsername] = useState('');
    const [displayName, setDisplayName] = useState('');
    const [isSyncing, setIsSyncing] = useState(false);
    const [pendingReadings, setPendingReadings] = useState(0);

    // Server Configuration State
    const [showServerConfig, setShowServerConfig] = useState(false);
    const [serverAddress, setServerAddress] = useState('');
    const [currentServerAddress, setCurrentServerAddress] = useState('');
    const [readingMonth, setReadingMonth] = useState('');

    // GPS Accuracy Level State
    const [gpsAccuracyLevel, setGpsAccuracyLevel] = useState('medium');

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
        loadSettings();
    }, []);

    // Server Configuration Handlers
    const handleOpenServerConfig = async () => {
        try {
            const saved = await AsyncStorage.getItem(STORAGE_KEYS.CUSTOM_URL);
            setServerAddress(saved || '');
            setCurrentServerAddress(saved || 'Not configured (using default)');
            setShowServerConfig(true);
        } catch (e) {
            console.error('Failed to load server address', e);
        }
    };

    const handleSaveServerConfig = async () => {
        try {
            if (serverAddress.trim()) {
                await AsyncStorage.setItem(STORAGE_KEYS.CUSTOM_URL, serverAddress.trim());
                setCurrentServerAddress(serverAddress.trim());
            } else {
                await AsyncStorage.removeItem(STORAGE_KEYS.CUSTOM_URL);
                setCurrentServerAddress('Not configured (using default)');
            }
            setShowServerConfig(false);
            showAlert('Success', 'Server address updated successfully.', 'success');
        } catch (e) {
            showAlert('Error', 'Failed to save server address.', 'error');
        }
    };

    const loadSettings = async () => {
        const userData = await authService.getUserData();
        const storedUsername = await authService.getUsername();

        if (userData) {
            setRealUsername(storedUsername || userData.username);
            setDisplayName(userData.full_name || userData.username);
        } else {
            setRealUsername(storedUsername || '');
            setDisplayName(storedUsername || 'User');
        }

        const status = await syncService.getSyncStatus();
        setLastSync(status.lastSync);
        setPendingReadings(status.pendingCount);

        // Load reading month from kfyawor
        const kfyawor = await syncService.getKfyawor();
        setReadingMonth(kfyawor?.kfyawor || 'Not Set');

        // Load saved server address for display
        try {
            const savedServer = await AsyncStorage.getItem(STORAGE_KEYS.CUSTOM_URL);
            setCurrentServerAddress(savedServer || 'Not configured (using default)');
        } catch (e) {
            setCurrentServerAddress('Not configured (using default)');
        }

        // Load GPS accuracy level
        const savedLevel = await locationService.getSavedAccuracyLevel();
        setGpsAccuracyLevel(savedLevel);
    };

    const handleGpsLevelChange = async (level) => {
        setGpsAccuracyLevel(level);
        await locationService.saveAccuracyLevel(level);
    };

    const handleSync = async () => {
        if (!realUsername) return;

        // Build warning message with pending readings info
        let warningMsg = '⚠️ All old data will be deleted!\n\n' +
            'This will:\n' +
            '• Delete all customer data\n' +
            '• Delete all saved readings (uploaded & pending)\n' +
            '• Download fresh data from server\n';

        if (pendingReadings > 0) {
            warningMsg += `\n🔴 You have ${pendingReadings} unuploaded reading(s)!\n` +
                'Upload them first or they will be lost.\n';
        }

        warningMsg += '\nAre you sure you want to continue?';

        showAlert(
            'Download Data',
            warningMsg,
            pendingReadings > 0 ? 'warning' : 'info',
            false,
            async () => {
                setIsSyncing(true);
                try {
                    const result = await syncService.downloadData(realUsername);
                    if (result.success) {
                        showAlert(
                            'Success',
                            `Downloaded ${result.customersCount} customers\n` +
                            `Billing period: ${result.kfyawor?.kfyawor || 'Unknown'}`,
                            'success'
                        );
                        loadSettings(); // Refresh status
                    } else {
                        // CSV errors (not found, empty, month mismatch) stop sync
                        // and return descriptive bilingual error messages
                        showAlert(
                            result.errorType === 'CSV_MONTH_MISMATCH' ? '⚠️ Month Mismatch' :
                            result.errorType === 'CSV_NOT_FOUND' ? '⚠️ CSV Not Found' :
                            result.errorType === 'CSV_EMPTY' ? '⚠️ CSV Empty' :
                            'Error',
                            result.error,
                            result.errorType ? 'warning' : 'error'
                        );
                    }
                } catch (error) {
                    showAlert('Error', 'Sync failed: ' + (error.message || 'Unknown error'), 'error');
                } finally {
                    setIsSyncing(false);
                }
            }
        );
    };

    const handleLogoutConfirm = () => {
        showAlert(
            'Logout',
            'Are you sure you want to logout? Note: You can login offline if credentials were saved.',
            'warning',
            false,
            async () => {
                await authService.logout();
                if (onLogout) onLogout();
            }
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
                <Text style={styles.headerTitle}>Settings</Text>
                <View style={{ width: 40 }} />
            </View>

            <ScrollView contentContainerStyle={styles.content}>

                {/* User Profile Card */}
                <View style={styles.profileCard}>
                    <View style={styles.avatarCircle}>
                        <FontAwesome name="user" size={30} color="#fff" />
                    </View>
                    <View style={styles.profileInfo}>
                        <Text style={styles.profileName}>{displayName}</Text>
                        <Text style={styles.profileRole}>Meter Reader</Text>
                    </View>
                </View>

                {/* Reading Month Section */}
                <Text style={styles.sectionTitle}>Current Reading Period</Text>
                <View style={styles.readingMonthCard}>
                    <View style={styles.readingMonthIconContainer}>
                        <MaterialIcons name="event" size={32} color="#2196F3" />
                    </View>
                    <View style={styles.readingMonthInfo}>
                        <Text style={styles.readingMonthLabel}>Reading Month</Text>
                        <Text style={styles.readingMonthValue}>{readingMonth}</Text>
                    </View>
                </View>

                {/* Sync Section */}
                <Text style={styles.sectionTitle}>Data Management</Text>
                <View style={styles.section}>
                    <View style={styles.infoRow}>
                        <Text style={styles.label}>Last Sync:</Text>
                        <Text style={styles.value}>
                            {lastSync ? new Date(lastSync).toLocaleString() : 'Never'}
                        </Text>
                    </View>
                    <View style={styles.infoRow}>
                        <Text style={styles.label}>Pending Uploads:</Text>
                        <Text style={[styles.value, pendingReadings > 0 && styles.warningText]}>
                            {pendingReadings}
                        </Text>
                    </View>

                    <TouchableOpacity
                        style={[styles.actionButton, styles.uploadButton, pendingReadings === 0 && styles.disabledButton]}
                        onPress={() => {
                            if (pendingReadings === 0) return;

                            showAlert(
                                'Upload Readings',
                                `Upload ${pendingReadings} pending reading(s) to the server?`,
                                'info',
                                false,
                                async () => {
                                    setIsSyncing(true);
                                    try {
                                        const result = await syncService.uploadReadings();
                                        if (result.success) {
                                            showAlert('Success', `Uploaded ${result.uploaded} readings.`, 'success');
                                            loadSettings();
                                        } else {
                                            showAlert('Error', result.error, 'error');
                                        }
                                    } catch (e) {
                                        showAlert('Error', 'Upload failed', 'error');
                                    } finally {
                                        setIsSyncing(false);
                                    }
                                }
                            );
                        }}
                        disabled={pendingReadings === 0 || isSyncing}
                    >
                        <MaterialIcons name="cloud-upload" size={24} color="#fff" />
                        <Text style={styles.actionButtonText}>
                            {isSyncing ? 'Uploading...' : 'Upload Pending Readings'}
                        </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[styles.actionButton, styles.uploadButton, { backgroundColor: '#FF9800' }, pendingReadings === -1 && styles.disabledButton]}
                        onPress={async () => {
                            // Check for pending items by re-checking modified count
                            const modifiedCustomers = await databaseService.getModifiedCustomers();
                            if (modifiedCustomers.length === 0) {
                                showAlert('Info', 'No customer updates to upload.', 'info');
                                return;
                            }

                            showAlert(
                                'Upload Updates',
                                `Upload ${modifiedCustomers.length} customer detail updates?`,
                                'info',
                                false,
                                async () => {
                                    setIsSyncing(true);
                                    try {
                                        const result = await syncService.uploadCustomerUpdates();
                                        if (result.success) {
                                            showAlert('Success', `Uploaded ${result.count} updates.`, 'success');
                                            loadSettings();
                                        } else {
                                            showAlert('Error', 'Partial failure or error.', 'error');
                                        }
                                    } catch (e) {
                                        console.error(e);
                                        showAlert('Error', 'Upload failed', 'error');
                                    } finally {
                                        setIsSyncing(false);
                                    }
                                }
                            );
                        }}
                    >
                        <MaterialIcons name="person-pin" size={24} color="#fff" />
                        <Text style={styles.actionButtonText}>Upload Customer Updates</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[styles.actionButton, styles.exportButton]}
                        onPress={async () => {
                            try {
                                const readings = await databaseService.getEncodedReadingsForExport();
                                if (!readings || readings.length === 0) {
                                    showAlert('Info', 'No encoded readings found to export.', 'info');
                                    return;
                                }

                                // CSV Header
                                let csvContent = "No.,Full Name,Account Number,Reading,Reading Month\n";

                                // CSV Rows
                                readings.forEach((item, index) => {
                                    const row = [
                                        index + 1,
                                        `"${item.full_name || ''}"`,
                                        item.account_number || '',
                                        item.reading || 0,
                                        item.reading_month || ''
                                    ].join(",");
                                    csvContent += row + "\n";
                                });

                                const fileName = `Readings_${new Date().getTime()}.csv`;
                                const contentWithBOM = '\uFEFF' + csvContent;

                                const shareFile = async () => {
                                    try {
                                        const fileUri = FileSystemLegacy.documentDirectory + fileName;
                                        await FileSystemLegacy.writeAsStringAsync(fileUri, contentWithBOM, {
                                            encoding: 'utf8'
                                        });

                                        if (await Sharing.isAvailableAsync()) {
                                            await Sharing.shareAsync(fileUri);
                                        } else {
                                            showAlert('Error', 'Sharing is not available', 'error');
                                        }
                                    } catch (e) {
                                        showAlert('Error', 'Failed to share file', 'error');
                                    }
                                };

                                const saveToDevice = async () => {
                                    try {
                                        const permissions = await StorageAccessFramework.requestDirectoryPermissionsAsync();
                                        if (permissions.granted) {
                                            const uri = permissions.directoryUri;
                                            const newFileUri = await StorageAccessFramework.createFileAsync(uri, fileName, 'text/comma-separated-values');

                                            await StorageAccessFramework.writeAsStringAsync(newFileUri, contentWithBOM, {
                                                encoding: 'utf8' // SAF implies encoding, simple string might be enough or options object
                                            });
                                            showAlert('Success', 'File saved successfully', 'success');
                                        }
                                    } catch (e) {
                                        console.error(e);
                                        showAlert('Error', 'Failed to save file to device folder', 'error');
                                    }
                                };


                                // On Android and iOS, just share the file
                                // The share sheet will allow user to save to device
                                await shareFile();

                            } catch (e) {
                                console.error('Export failed', e);
                                showAlert('Error', 'Failed to export CSV', 'error');
                            }
                        }}
                    >
                        <FontAwesome name="file-excel-o" size={24} color="#fff" />
                        <Text style={styles.actionButtonText}>Export to Excel (CSV)</Text>
                    </TouchableOpacity>



                    <TouchableOpacity
                        style={[styles.actionButton, isSyncing && styles.disabledButton]}
                        onPress={handleSync}
                        disabled={isSyncing}
                    >
                        <MaterialIcons name="cloud-download" size={24} color="#fff" />
                        <Text style={styles.actionButtonText}>
                            {isSyncing ? 'Downloading...' : 'Fetch Customers (Sync)'}
                        </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[styles.actionButton, styles.dangerButton]}
                        onPress={() => {
                            showAlert(
                                'Clear All Data',
                                'Are you sure you want to delete all local data? This action cannot be undone.',
                                'warning',
                                false,
                                async () => {
                                    const result = await databaseService.clearAllData();
                                    if (result.success) {
                                        showAlert('Success', 'All local data has been cleared.', 'success');
                                        loadSettings(); // Refresh status
                                    } else {
                                        showAlert('Error', 'Failed to clear data: ' + result.error, 'error');
                                    }
                                }
                            );
                        }}
                    >
                        <MaterialIcons name="delete-forever" size={24} color="#fff" />
                        <Text style={styles.actionButtonText}>Clear All Data</Text>
                    </TouchableOpacity>
                </View>

                {/* Server Configuration Section */}
                <Text style={styles.sectionTitle}>Server Configuration</Text>
                <View style={styles.section}>
                    <View style={styles.infoRow}>
                        <Text style={styles.label}>Server Address:</Text>
                        <Text style={[styles.value, { flex: 1, textAlign: 'right', marginLeft: 8 }]} numberOfLines={1}>
                            {currentServerAddress || 'Not configured'}
                        </Text>
                    </View>
                    <TouchableOpacity
                        style={[styles.actionButton, { backgroundColor: '#607D8B', marginTop: 8 }]}
                        onPress={handleOpenServerConfig}
                    >
                        <MaterialIcons name="settings-ethernet" size={24} color="#fff" />
                        <Text style={styles.actionButtonText}>Configure Server IP</Text>
                    </TouchableOpacity>
                </View>

                {/* GPS Accuracy Level Section */}
                <Text style={styles.sectionTitle}>GPS Settings</Text>
                <View style={styles.section}>
                    <Text style={styles.gpsSettingLabel}>GPS Accuracy Level</Text>
                    <Text style={styles.gpsSettingHelper}>
                        Choose based on your phone's GPS quality. Lower settings work better on budget phones.
                    </Text>
                    <View style={styles.gpsPillContainer}>
                        {[
                            { key: 'high', label: 'High', sub: '≤20m', color: '#4CAF50' },
                            { key: 'medium', label: 'Medium', sub: '≤40m', color: '#FF9800' },
                            { key: 'low', label: 'Low', sub: '≤70m', color: '#F44336' },
                        ].map((opt) => (
                            <TouchableOpacity
                                key={opt.key}
                                style={[
                                    styles.gpsPill,
                                    gpsAccuracyLevel === opt.key && { backgroundColor: opt.color, borderColor: opt.color },
                                ]}
                                onPress={() => handleGpsLevelChange(opt.key)}
                            >
                                <Text style={[
                                    styles.gpsPillLabel,
                                    gpsAccuracyLevel === opt.key && styles.gpsPillLabelActive,
                                ]}>{opt.label}</Text>
                                <Text style={[
                                    styles.gpsPillSub,
                                    gpsAccuracyLevel === opt.key && styles.gpsPillSubActive,
                                ]}>{opt.sub}</Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                    <View style={styles.gpsCurrentInfo}>
                        <Ionicons name="information-circle-outline" size={16} color="#666" />
                        <Text style={styles.gpsCurrentText}>
                            Current: <Text style={{ fontWeight: 'bold' }}>{gpsAccuracyLevel.charAt(0).toUpperCase() + gpsAccuracyLevel.slice(1)}</Text> — accepts up to {locationService.getAccuracyThreshold(gpsAccuracyLevel)}m accuracy
                        </Text>
                    </View>
                </View>

                {/* Account Section */}
                <Text style={styles.sectionTitle}>Account</Text>
                <View style={styles.section}>
                    <TouchableOpacity style={styles.logoutButton} onPress={handleLogoutConfirm}>
                        <MaterialIcons name="logout" size={24} color="#dc3545" />
                        <Text style={styles.logoutText}>Logout</Text>
                    </TouchableOpacity>
                </View>

            </ScrollView >

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
    },
    backButton: {
        padding: 5,
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333',
    },
    content: {
        padding: 20,
    },
    profileCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#fff',
        padding: 20,
        borderRadius: 12,
        marginBottom: 24,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2,
    },
    avatarCircle: {
        width: 60,
        height: 60,
        borderRadius: 30,
        backgroundColor: '#2196F3',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 16,
    },
    profileInfo: {
        flex: 1,
    },
    profileName: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#333',
    },
    profileRole: {
        fontSize: 14,
        color: '#666',
    },
    sectionTitle: {
        fontSize: 14,
        fontWeight: '600',
        color: '#666',
        marginBottom: 10,
        marginLeft: 4,
        textTransform: 'uppercase',
    },
    section: {
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 16,
        marginBottom: 8,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
        elevation: 1,
    },
    infoRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 12,
        paddingBottom: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0',
    },
    label: {
        color: '#666',
        fontSize: 14,
    },
    value: {
        color: '#333',
        fontWeight: '500',
        fontSize: 14,
    },
    warningText: {
        color: '#f59e0b',
        fontWeight: 'bold',
    },
    actionButton: {
        backgroundColor: '#2196F3',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 14,
        borderRadius: 8,
        marginTop: 4,
    },
    disabledButton: {
        opacity: 0.7,
    },
    actionButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
        marginLeft: 8,
    },
    dangerButton: {
        backgroundColor: '#dc3545', // Red color for delete action
        marginTop: 12,
    },
    uploadButton: {
        backgroundColor: '#4CAF50', // Green for upload
        marginTop: 4,
        marginBottom: 8,
    },
    exportButton: {
        backgroundColor: '#009688', // Teal for export
        marginTop: 4,
        marginBottom: 8,
    },

    helperText: {
        fontSize: 12,
        color: '#999',
        marginBottom: 24,
        marginLeft: 4,
    },
    logoutButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 10,
    },
    logoutText: {
        color: '#dc3545',
        fontSize: 16,
        fontWeight: '600',
        marginLeft: 8,
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
    readingMonthCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#E3F2FD',
        padding: 16,
        borderRadius: 12,
        marginBottom: 24,
        borderLeftWidth: 4,
        borderLeftColor: '#2196F3',
    },
    readingMonthIconContainer: {
        width: 50,
        height: 50,
        borderRadius: 25,
        backgroundColor: '#fff',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 16,
    },
    readingMonthInfo: {
        flex: 1,
    },
    readingMonthLabel: {
        fontSize: 12,
        color: '#666',
        marginBottom: 4,
    },
    readingMonthValue: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#2196F3',
    },
    // GPS Settings styles
    gpsSettingLabel: {
        fontSize: 16,
        fontWeight: '600',
        color: '#333',
        marginBottom: 4,
    },
    gpsSettingHelper: {
        fontSize: 13,
        color: '#888',
        marginBottom: 16,
    },
    gpsPillContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 12,
    },
    gpsPill: {
        flex: 1,
        alignItems: 'center',
        paddingVertical: 12,
        paddingHorizontal: 8,
        borderRadius: 10,
        borderWidth: 2,
        borderColor: '#E0E0E0',
        backgroundColor: '#FAFAFA',
        marginHorizontal: 4,
    },
    gpsPillLabel: {
        fontSize: 15,
        fontWeight: 'bold',
        color: '#555',
    },
    gpsPillLabelActive: {
        color: '#fff',
    },
    gpsPillSub: {
        fontSize: 12,
        color: '#999',
        marginTop: 2,
    },
    gpsPillSubActive: {
        color: 'rgba(255,255,255,0.85)',
    },
    gpsCurrentInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F5F7FA',
        paddingVertical: 8,
        paddingHorizontal: 12,
        borderRadius: 8,
    },
    gpsCurrentText: {
        fontSize: 13,
        color: '#666',
        marginLeft: 6,
    },
});
