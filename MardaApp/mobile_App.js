import React from 'react';
import { StyleSheet, Text, View, Button, Alert } from 'react-native';
import { authService } from './src/services/authService';
import { syncService } from './src/services/syncService';

export default function App() {
    const [isAuthenticated, setIsAuthenticated] = React.useState(false);
    const [syncStatus, setSyncStatus] = React.useState(null);

    React.useEffect(() => {
        checkAuth();
    }, []);

    const checkAuth = async () => {
        const authenticated = await authService.isAuthenticated();
        setIsAuthenticated(authenticated);

        if (authenticated) {
            const status = await syncService.getSyncStatus();
            setSyncStatus(status);
        }
    };

    const handleTestLogin = async () => {
        const deviceId = await authService.getDeviceId();

        // Test with admin credentials (you should replace with actual login screen)
        const result = await authService.login('admin', 'aflag4541enat', deviceId);

        if (result.success) {
            Alert.alert('Success', 'Logged in successfully!');
            setIsAuthenticated(true);
        } else {
            Alert.alert('Error', result.error);
        }
    };

    const handleTestSync = async () => {
        const username = await authService.getUsername();

        if (!username) {
            Alert.alert('Error', 'Please login first');
            return;
        }

        Alert.alert('Syncing...', 'Downloading data from server');

        const result = await syncService.downloadData(username);

        if (result.success) {
            Alert.alert(
                'Success',
                `Downloaded ${result.customersCount} customers\n` +
                `Billing period: ${result.kfyawor?.kfyawor || 'Unknown'}`
            );
            setSyncStatus(await syncService.getSyncStatus());
        } else {
            Alert.alert('Error', result.error);
        }
    };

    const handleLogout = async () => {
        await authService.logout();
        setIsAuthenticated(false);
        setSyncStatus(null);
        Alert.alert('Success', 'Logged out');
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Water Meter Reading App</Text>
            <Text style={styles.subtitle}>Development Test Screen</Text>

            <View style={styles.statusContainer}>
                <Text style={styles.statusLabel}>
                    Status: {isAuthenticated ? '✅ Logged In' : '❌ Not Logged In'}
                </Text>

                {syncStatus && (
                    <>
                        <Text style={styles.statusLabel}>
                            Last Sync: {syncStatus.lastSync
                                ? new Date(syncStatus.lastSync).toLocaleString()
                                : 'Never'}
                        </Text>
                        <Text style={styles.statusLabel}>
                            Pending Readings: {syncStatus.pendingCount}
                        </Text>
                    </>
                )}
            </View>

            <View style={styles.buttonContainer}>
                {!isAuthenticated ? (
                    <Button title="Test Login (Admin)" onPress={handleTestLogin} />
                ) : (
                    <>
                        <Button title="Sync Data" onPress={handleTestSync} />
                        <View style={styles.buttonSpacer} />
                        <Button title="Logout" onPress={handleLogout} color="#dc3545" />
                    </>
                )}
            </View>

            <View style={styles.infoContainer}>
                <Text style={styles.infoText}>
                    📱 This is a development test screen
                </Text>
                <Text style={styles.infoText}>
                    ✨ Full UI screens will be implemented next
                </Text>
                <Text style={styles.infoText}>
                    🔧 Make sure backend is running on your network
                </Text>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f5f5f5',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 20,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 8,
        color: '#333',
    },
    subtitle: {
        fontSize: 16,
        color: '#666',
        marginBottom: 30,
    },
    statusContainer: {
        backgroundColor: '#fff',
        padding: 20,
        borderRadius: 10,
        width: '100%',
        marginBottom: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    statusLabel: {
        fontSize: 14,
        color: '#333',
        marginBottom: 8,
    },
    buttonContainer: {
        width: '100%',
        marginBottom: 30,
    },
    buttonSpacer: {
        height: 10,
    },
    infoContainer: {
        marginTop: 20,
    },
    infoText: {
        fontSize: 12,
        color: '#999',
        textAlign: 'center',
        marginBottom: 4,
    },
});
