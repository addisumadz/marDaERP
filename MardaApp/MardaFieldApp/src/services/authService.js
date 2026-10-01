import AsyncStorage from '@react-native-async-storage/async-storage';
import { STORAGE_KEYS } from '../constants/config';
import { authAPI } from '../api/endpoints';

/**
 * Authentication service for plumber/technician login
 * Reuses the same legacy mobile auth endpoint as MardaMApp
 */
export const authService = {
    /**
     * Login with username and password
     * @param {string} username
     * @param {string} password
     * @returns {Promise<{success: boolean, message: string}>}
     */
    login: async (username, password) => {
        try {
            // Generate a unique mobile device ID
            const mobileId = `field_${Date.now()}`;
            const result = await authAPI.login(username, password, mobileId);

            if (result === 'success' || (typeof result === 'object' && result?.status === 'success')) {
                await AsyncStorage.setItem(STORAGE_KEYS.USERNAME, username);
                await AsyncStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, `${username}:${mobileId}`);

                // Store user data if returned as object
                if (typeof result === 'object') {
                    await AsyncStorage.setItem(STORAGE_KEYS.USER_DATA, JSON.stringify(result));
                    if (result.id) {
                        await AsyncStorage.setItem(STORAGE_KEYS.PLUMBER_ID, String(result.id));
                    }
                }

                return { success: true, message: 'በተሳካ ሁኔታ ገብተዋል' };
            } else if (result === 'perror') {
                return { success: false, message: 'የይለፍ ቃል ስህተት (Wrong Password)' };
            } else {
                return { success: false, message: 'የተጠቃሚ ስም ወይም ይለፍ ቃል ስህተት ነው' };
            }
        } catch (error) {
            console.error('[Auth] Login error:', error);
            if (error.message?.includes('Network')) {
                return { success: false, message: 'ከሰርቨር ጋር መገናኘት አልተቻለም። እባክዎ ግንኙነትዎን ያረጋግጡ።' };
            }
            return { success: false, message: error.response?.data?.message || 'መግባት አልተቻለም' };
        }
    },

    /**
     * Check if user is already authenticated
     */
    isAuthenticated: async () => {
        try {
            const username = await AsyncStorage.getItem(STORAGE_KEYS.USERNAME);
            return !!username;
        } catch {
            return false;
        }
    },

    /**
     * Get current username
     */
    getUsername: async () => {
        try {
            return await AsyncStorage.getItem(STORAGE_KEYS.USERNAME);
        } catch {
            return null;
        }
    },

    /**
     * Get stored plumber ID (for filtering assigned jobs)
     */
    getPlumberId: async () => {
        try {
            const id = await AsyncStorage.getItem(STORAGE_KEYS.PLUMBER_ID);
            return id ? Number(id) : null;
        } catch {
            return null;
        }
    },

    /**
     * Logout — clear all stored credentials
     */
    logout: async () => {
        try {
            await AsyncStorage.multiRemove([
                STORAGE_KEYS.USERNAME,
                STORAGE_KEYS.AUTH_TOKEN,
                STORAGE_KEYS.USER_DATA,
                STORAGE_KEYS.PLUMBER_ID,
                STORAGE_KEYS.LAST_SYNC,
            ]);
            return true;
        } catch (error) {
            console.error('[Auth] Logout error:', error);
            return false;
        }
    },
};
