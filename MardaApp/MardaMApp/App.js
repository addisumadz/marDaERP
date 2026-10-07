import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, Alert } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { authService } from './src/services/authService';
import { databaseService } from './src/services/databaseService';
import LoginScreen from './src/screens/LoginScreen';
import CustomerListScreen from './src/screens/CustomerListScreen';
import SettingsScreen from './src/screens/SettingsScreen';
import CustomerDetailScreen from './src/screens/CustomerDetailScreen';
import HomeScreen from './src/screens/HomeScreen';
import NearbyCustomersScreen from './src/screens/NearbyCustomersScreen';

const Stack = createNativeStackNavigator();

export default function App() {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [isCheckingAuth, setIsCheckingAuth] = useState(true);

    useEffect(() => {
        checkAuth();
    }, []);

    const checkAuth = async () => {
        try {
            await databaseService.initializeDatabase();
            const authenticated = await authService.isAuthenticated();
            setIsAuthenticated(authenticated);
        } catch (error) {
            console.error('Failed to initialize database or check auth:', error);
        } finally {
            setIsCheckingAuth(false);
        }
    };

    const handleLoginSuccess = () => {
        setIsAuthenticated(true);
    };

    const handleLogout = async () => {
        await authService.logout();
        setIsAuthenticated(false);
    };

    const handleDetailSave = async (updatedCustomer) => {
        const result = await databaseService.updateCustomer(updatedCustomer.id, {
            phone_number: updatedCustomer.mobile_number || updatedCustomer.phone_number,
            location_coordination: updatedCustomer.location_coordination,
            qr_code: updatedCustomer.qr_code,
        });

        if (!result.success) {
            Alert.alert('Error', 'Failed to save changes');
        }
        return result;
    };

    // Show loading while checking authentication
    if (isCheckingAuth) {
        return (
            <View style={styles.container}>
                <Text style={styles.loadingText}>Loading...</Text>
            </View>
        );
    }

    return (
        <NavigationContainer>
            <Stack.Navigator
                screenOptions={{
                    headerShown: false,
                    animation: 'slide_from_right',
                }}
            >
                {!isAuthenticated ? (
                    <Stack.Screen name="Login">
                        {(props) => <LoginScreen {...props} onLoginSuccess={handleLoginSuccess} />}
                    </Stack.Screen>
                ) : (
                    <>
                        <Stack.Screen name="Home">
                            {(props) => (
                                <HomeScreen
                                    {...props}
                                    onNavigateToReadings={(filter = 'pending') => {
                                        props.navigation.navigate('CustomerList', { initialTab: filter });
                                    }}
                                    onNavigateToSync={() => props.navigation.navigate('Settings')}
                                    onNavigateToNearby={() => props.navigation.navigate('Nearby')}
                                    onNavigateToCustomer={(customer) => {
                                        props.navigation.navigate('CustomerDetail', { customer });
                                    }}
                                    onNavigateToSettings={() => props.navigation.navigate('Settings')}
                                />
                            )}
                        </Stack.Screen>

                        <Stack.Screen name="CustomerList">
                            {(props) => (
                                <CustomerListScreen
                                    {...props}
                                    initialTab={props.route.params?.initialTab || 'pending'}
                                    onSettingsPress={() => props.navigation.navigate('Settings')}
                                    onCustomerSelect={(customer) => {
                                        props.navigation.navigate('CustomerDetail', { customer });
                                    }}
                                    onBack={() => props.navigation.goBack()}
                                />
                            )}
                        </Stack.Screen>

                        <Stack.Screen name="CustomerDetail">
                            {(props) => (
                                <CustomerDetailScreen
                                    {...props}
                                    customer={props.route.params?.customer}
                                    onBack={() => props.navigation.goBack()}
                                    onSave={async (updatedCustomer) => {
                                        return await handleDetailSave(updatedCustomer);
                                    }}
                                />
                            )}
                        </Stack.Screen>

                        <Stack.Screen name="Nearby">
                            {(props) => (
                                <NearbyCustomersScreen
                                    {...props}
                                    onBack={() => props.navigation.goBack()}
                                    onSelectCustomer={(customer) => {
                                        props.navigation.navigate('CustomerDetail', { customer });
                                    }}
                                />
                            )}
                        </Stack.Screen>

                        <Stack.Screen name="Settings">
                            {(props) => (
                                <SettingsScreen
                                    {...props}
                                    onLogout={handleLogout}
                                    onBack={() => props.navigation.goBack()}
                                />
                            )}
                        </Stack.Screen>
                    </>
                )}
            </Stack.Navigator>
        </NavigationContainer>
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
