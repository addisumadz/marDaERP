import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, Button, Alert, BackHandler } from 'react-native';
import { authService } from './src/services/authService';
import { syncService } from './src/services/syncService';
import { databaseService } from './src/services/databaseService';
import LoginScreen from './src/screens/LoginScreen';
import CustomerListScreen from './src/screens/CustomerListScreen';
import SettingsScreen from './src/screens/SettingsScreen';
import CustomerDetailScreen from './src/screens/CustomerDetailScreen';
import HomeScreen from './src/screens/HomeScreen';
import NearbyCustomersScreen from './src/screens/NearbyCustomersScreen';

export default function App() {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [isCheckingAuth, setIsCheckingAuth] = useState(true);
    const [currentScreen, setCurrentScreen] = useState('home'); // 'home' | 'list' | 'settings' | 'detail' | 'nearby'
    const [previousScreen, setPreviousScreen] = useState('list'); // Track where detail was opened from
    const [selectedCustomer, setSelectedCustomer] = useState(null);
    const [initialFilter, setInitialFilter] = useState('pending'); // 'pending' | 'encoded' | 'all'

    useEffect(() => {
        checkAuth();
    }, []);

    // Handle Hardware Back Button
    useEffect(() => {
        const backAction = () => {
            if (!isAuthenticated) {
                return false; // Default behavior (exit)
            }

            if (currentScreen === 'home') {
                BackHandler.exitApp();
                return true;
            }

            if (currentScreen === 'list') {
                setCurrentScreen('home');
                return true;
            }

            if (currentScreen === 'settings') {
                setCurrentScreen('home');
                return true;
            }

            if (currentScreen === 'nearby') {
                setCurrentScreen('home');
                return true;
            }

            if (currentScreen === 'detail') {
                setCurrentScreen(previousScreen); // Go back to where it was opened from
                return true;
            }

            return false;
        };

        const backHandler = BackHandler.addEventListener(
            'hardwareBackPress',
            backAction
        );

        return () => backHandler.remove();
    }, [currentScreen, previousScreen, isAuthenticated]);

    const checkAuth = async () => {
        // Initialize database first
        await databaseService.initializeDatabase();

        const authenticated = await authService.isAuthenticated();
        setIsAuthenticated(authenticated);
        setIsCheckingAuth(false);
    };

    const handleLoginSuccess = async () => {
        setIsAuthenticated(true);
        setCurrentScreen('home');
    };

    const handleLogout = async () => {
        setIsAuthenticated(false);
        setCurrentScreen('home'); // Reset to default for next login
    };

    const handleCustomerSelect = (customer, fromScreen = 'list') => {
        setSelectedCustomer(customer);
        setPreviousScreen(fromScreen); // Remember where we came from
        setCurrentScreen('detail');
    };

    const handleDetailSave = async (updatedCustomer) => {
        // ... (same as before) ...
        const result = await databaseService.updateCustomer(updatedCustomer.id, {
            phone_number: updatedCustomer.mobile_number || updatedCustomer.phone_number,
            location_coordination: updatedCustomer.location_coordination,
            qr_code: updatedCustomer.qr_code
        });

        if (!result.success) {
            Alert.alert('Error', 'Failed to save changes');
        }
        // No success alert here — the calling screen handles its own feedback
        // (e.g., GPS confirmation dialog, "Customer info updated" alert)

        setCurrentScreen(previousScreen); // Return to where detail was opened from
    };

    // Show loading while checking authentication
    if (isCheckingAuth) {
        return (
            <View style={styles.container}>
                <Text style={styles.loadingText}>Loading...</Text>
            </View>
        );
    }

    // Show login screen if not authenticated
    if (!isAuthenticated) {
        return <LoginScreen onLoginSuccess={handleLoginSuccess} />;
    }

    // Show Home Screen
    if (currentScreen === 'home') {
        return (
            <HomeScreen
                onNavigateToReadings={(filter = 'pending') => {
                    setInitialFilter(filter);
                    setCurrentScreen('list');
                }}
                onNavigateToSync={() => setCurrentScreen('settings')}
                onNavigateToNearby={() => setCurrentScreen('nearby')}
                onNavigateToCustomer={(customer) => handleCustomerSelect(customer, 'home')}
                onNavigateToSettings={() => setCurrentScreen('settings')}
            />
        );
    }

    // Show Settings Screen
    if (currentScreen === 'settings') {
        return (
            <SettingsScreen
                onLogout={handleLogout}
                onBack={() => setCurrentScreen('home')}
            />
        );
    }

    // Show Nearby Screen
    if (currentScreen === 'nearby') {
        return (
            <NearbyCustomersScreen
                onBack={() => setCurrentScreen('home')}
                onSelectCustomer={(customer) => handleCustomerSelect(customer, 'nearby')}
            />
        );
    }

    // Show Detail Screen
    if (currentScreen === 'detail' && selectedCustomer) {
        return (
            <CustomerDetailScreen
                customer={selectedCustomer}
                onBack={() => setCurrentScreen(previousScreen)}
                onSave={handleDetailSave}
            />
        );
    }

    // Show Customer List Screen
    return (
        <CustomerListScreen
            initialTab={initialFilter} // Pass filter preference
            onSettingsPress={() => setCurrentScreen('settings')}
            onCustomerSelect={handleCustomerSelect}
        />
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
    loadingText: {
        fontSize: 16,
        color: '#666',
    },
});

