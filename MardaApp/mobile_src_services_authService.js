import AsyncStorage from '@react-native-async-storage/async-storage';
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

            const result = await authAPI.login(username, password, mobileId);

            if (result === 'success') {
                // Store credentials securely
                await AsyncStorage.multiSet([
                    [STORAGE_KEYS.USERNAME, username],
                    [STORAGE_KEYS.AUTH_TOKEN, `${username}:${Date.now()}`], // Simple token
                ]);

                return { success: true };
            } else if (result === 'perror') {
                return { success: false, error: 'Invalid password' };
            } else {
                return { success: false, error: 'Login failed. Please try again.' };
            }
        } catch (error) {
            console.error('Login error:', error);
            return {
                success: false,
                error: 'Network error. Please check your connection.'
            };
        }
    },

    /**
     * Logout and clear stored credentials
     */
    logout: async () => {
        try {
            await AsyncStorage.multiRemove([
                STORAGE_KEYS.USERNAME,
                STORAGE_KEYS.AUTH_TOKEN,
                STORAGE_KEYS.USER_DATA,
            ]);
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
};
