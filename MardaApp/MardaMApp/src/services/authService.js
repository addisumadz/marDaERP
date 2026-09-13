import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SecureStore from 'expo-secure-store';
import { STORAGE_KEYS } from '../constants/config';

/**
 * Authentication Service
 * Handles user login, logout, and session management
 */

export const authService = {
    /**
     * Login user and store credentials
     */
    login: async (username, password, mobileId) => {
        try {
            const { authAPI } = require('../api/endpoints');

            // Try online login first
            const response = await authAPI.login(username, password, mobileId);

            // Handle both object (new) and string (legacy) responses
            const result = typeof response === 'string' ? response : response.status;

            if (result === 'success') {
                // Store credentials securely for offline access
                const multiSetPairs = [
                    [STORAGE_KEYS.USERNAME, username],
                    [STORAGE_KEYS.AUTH_TOKEN, `${username}:${Date.now()}`]
                ];

                // If we got user data object, save it
                if (typeof response === 'object' && response.user_id) {
                    multiSetPairs.push([STORAGE_KEYS.USER_DATA, JSON.stringify(response)]);
                }

                await AsyncStorage.multiSet(multiSetPairs);
                await SecureStore.setItemAsync('wbill_offline_password', password); // Securely cache password for offline login

                return { success: true };
            } else if (result === 'perror') {
                return { success: false, error: 'Invalid password' };
            } else if (result === 'error') {
                return { success: false, error: response.message || 'User not found' };
            } else {
                return { success: false, error: 'Login failed. Please try again.' };
            }
        } catch (error) {
            console.log('Online login failed, trying offline:', error);

            // Network error? Try offline login
            try {
                const storedUsername = await AsyncStorage.getItem(STORAGE_KEYS.USERNAME);
                const storedPassword = await SecureStore.getItemAsync('wbill_offline_password');

                // Check credentials (handle potential nulls)
                if (storedUsername && username && storedPassword &&
                    storedUsername.trim() === username.trim() &&
                    storedPassword === password) {

                    console.log('Offline login successful for:', username);
                    // Refresh token
                    await AsyncStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, `${username}:${Date.now()}`);
                    return { success: true, offline: true };
                } else if (storedUsername === username) {
                    return { success: false, error: 'Invalid password (Offline)' };
                }
            } catch (storageError) {
                console.error('Offline auth error:', storageError);
            }

            return {
                success: false,
                error: 'Network error and offline login failed. Please connect to internet first.'
            };
        }
    },

    /**
     * Logout and clear stored credentials
     */
    logout: async () => {
        try {
            // Only remove AUTH_TOKEN to log out, keep everything else for offline login
            await AsyncStorage.removeItem(STORAGE_KEYS.AUTH_TOKEN);
            // Keep USERNAME, USER_DATA, and offline_password for future offline logins
            return { success: true };
        } catch (error) {
            console.error('Logout error:', error);
            return { success: false, error: 'Failed to logout' };
        }
    },

    /**
     * Check if user is logged in
     */
    isAuthenticated: async () => {
        try {
            const token = await AsyncStorage.getItem(STORAGE_KEYS.AUTH_TOKEN);
            return token !== null;
        } catch (error) {
            console.error('Auth check error:', error);
            return false;
        }
    },

    /**
     * Get current username
     */
    getUsername: async () => {
        try {
            return await AsyncStorage.getItem(STORAGE_KEYS.USERNAME);
        } catch (error) {
            console.error('Get username error:', error);
            return null;
        }
    },

    /**
     * Get device ID (generate if doesn't exist)
     */
    getDeviceId: async () => {
        try {
            let deviceId = await AsyncStorage.getItem('@wbill:device_id');

            if (!deviceId) {
                // Generate a simple device ID
                deviceId = `DEVICE_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
                await AsyncStorage.setItem('@wbill:device_id', deviceId);
            }

            return deviceId;
        } catch (error) {
            console.error('Get device ID error:', error);
            return 'UNKNOWN_DEVICE';
        }
    },

    /**
     * Get stored user data (profile info)
     */
    getUserData: async () => {
        try {
            const data = await AsyncStorage.getItem(STORAGE_KEYS.USER_DATA);
            return data ? JSON.parse(data) : null;
        } catch (error) {
            console.error('Get user data error:', error);
            return null;
        }
    }
};
