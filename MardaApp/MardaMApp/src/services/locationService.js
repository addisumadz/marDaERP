import * as Location from 'expo-location';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { STORAGE_KEYS } from '../constants/config';

/**
 * GPS Accuracy Level thresholds (configurable from Settings).
 * Maps level name → max acceptable accuracy in meters.
 */
const ACCURACY_THRESHOLDS = {
    high: 20,
    medium: 40,
    low: 70,
};

export const locationService = {

    /**
     * Get the saved GPS accuracy level from AsyncStorage.
     * @returns {'high' | 'medium' | 'low'}
     */
    getSavedAccuracyLevel: async () => {
        try {
            const level = await AsyncStorage.getItem(STORAGE_KEYS.GPS_ACCURACY_LEVEL);
            if (level && ACCURACY_THRESHOLDS[level] !== undefined) {
                return level;
            }
        } catch (e) {
            console.warn('[Location] Failed to read accuracy level:', e);
        }
        return 'medium'; // Default
    },

    /**
     * Save the GPS accuracy level to AsyncStorage.
     * @param {'high' | 'medium' | 'low'} level
     */
    saveAccuracyLevel: async (level) => {
        try {
            await AsyncStorage.setItem(STORAGE_KEYS.GPS_ACCURACY_LEVEL, level);
        } catch (e) {
            console.warn('[Location] Failed to save accuracy level:', e);
        }
    },

    /**
     * Get the accuracy threshold in meters for a given level.
     * @param {'high' | 'medium' | 'low'} level
     * @returns {number} Max acceptable accuracy in meters
     */
    getAccuracyThreshold: (level) => {
        return ACCURACY_THRESHOLDS[level] || ACCURACY_THRESHOLDS.medium;
    },

    /**
     * Ensure GPS/Location services are enabled (Android only).
     * On Android, prompts the user to enable location if it's off.
     */
    ensureGPSEnabled: async () => {
        if (Platform.OS === 'android') {
            try {
                await Location.enableNetworkProviderAsync();
            } catch (e) {
                console.warn('[Location] enableNetworkProviderAsync failed:', e);
            }
        }
    },

    /**
     * Request foreground location permission.
     * @returns {boolean} true if granted
     */
    requestPermission: async () => {
        const { status } = await Location.requestForegroundPermissionsAsync();
        return status === 'granted';
    },

    /**
     * Get Best Location using watchPositionAsync.
     * Collects GPS fixes over a time window and returns the most accurate one.
     * Uses BestForNavigation (sensor fusion) for maximum accuracy.
     *
     * @param {Object} options
     * @param {number} options.timeoutMs - Max time to collect fixes (default 8000ms)
     * @param {number} options.targetAccuracy - Stop early if this accuracy is reached (default 10m)
     * @returns {Object} Best location fix
     */
    getBestLocation: async (options = {}) => {
        const { timeoutMs = 8000, targetAccuracy = 10 } = options;

        return new Promise(async (resolve, reject) => {
            let bestLocation = null;
            let subscription = null;

            const finish = () => {
                if (subscription) {
                    subscription.remove();
                    subscription = null;
                }
                if (bestLocation) {
                    console.log(`[Location] Best fix: ${bestLocation.coords.accuracy.toFixed(1)}m`);
                    resolve(bestLocation);
                } else {
                    reject(new Error('NO_LOCATION_FIX'));
                }
            };

            const timer = setTimeout(finish, timeoutMs);

            try {
                subscription = await Location.watchPositionAsync(
                    {
                        accuracy: Location.Accuracy.BestForNavigation,
                        distanceInterval: 0,
                        timeInterval: 500,
                    },
                    (loc) => {
                        if (!bestLocation || loc.coords.accuracy < bestLocation.coords.accuracy) {
                            bestLocation = loc;
                            console.log(`[Location] New best: ${loc.coords.accuracy.toFixed(1)}m`);
                        }
                        // Stop early if we reached target accuracy
                        if (bestLocation.coords.accuracy <= targetAccuracy) {
                            clearTimeout(timer);
                            finish();
                        }
                    }
                );
            } catch (e) {
                clearTimeout(timer);
                reject(e);
            }
        });
    },

    /**
     * Get location with a timeout wrapper.
     * @param {number} accuracy - Location.Accuracy level
     * @param {number} timeoutMs - Timeout in milliseconds
     * @returns {Object} Location result
     */
    getLocationWithTimeout: async (accuracy = Location.Accuracy.BestForNavigation, timeoutMs = 10000) => {
        return Promise.race([
            Location.getCurrentPositionAsync({ accuracy }),
            new Promise((_, reject) =>
                setTimeout(() => reject(new Error('GPS_TIMEOUT')), timeoutMs)
            ),
        ]);
    },

    /**
     * Get Fresh Location (no cache).
     * Strategy:
     * 1. Ensure GPS is enabled (Android)
     * 2. Use watchPositionAsync to collect best fix over timeoutMs
     * 3. Fallback to single BestForNavigation shot with timeout
     * 4. Last resort: Highest accuracy single shot
     *
     * @param {Object} options
     * @param {number} options.timeoutMs - Time window for collecting fixes (default 8000)
     * @param {number} options.targetAccuracy - Stop early when this accuracy reached (default 10)
     * @returns {Object} Location object
     */
    getFreshLocation: async (options = {}) => {
        const { timeoutMs = 8000, targetAccuracy = 10 } = options;

        // Ensure GPS is on
        await locationService.ensureGPSEnabled();

        // Try watch-based collection first (best accuracy)
        try {
            const loc = await locationService.getBestLocation({ timeoutMs, targetAccuracy });
            return loc;
        } catch (e) {
            console.warn('[Location] Watch-based location failed:', e.message);
        }

        // Fallback: single shot with BestForNavigation + timeout
        try {
            console.log('[Location] Falling back to single-shot BestForNavigation...');
            const loc = await locationService.getLocationWithTimeout(
                Location.Accuracy.BestForNavigation, 10000
            );
            return loc;
        } catch (e) {
            console.warn('[Location] BestForNavigation fallback failed:', e.message);
        }

        // Last resort: Highest accuracy (no sensor fusion)
        console.log('[Location] Last resort: Highest accuracy...');
        return await locationService.getLocationWithTimeout(
            Location.Accuracy.Highest, 10000
        );
    },

    /**
     * Get Smart Location (with cache).
     * Uses cached location if it's fresh enough, otherwise fetches new.
     *
     * @param {Object} options
     * @param {number} options.maxAge - Max cache age in ms (default 15000 = 15s)
     * @param {number} options.requiredAccuracy - Max acceptable accuracy in meters (default null)
     * @param {number} options.timeoutMs - Timeout for fresh fetch (default 8000)
     * @param {number} options.targetAccuracy - Target accuracy for fresh fetch (default 10)
     * @returns {Object} Location object
     */
    getSmartLocation: async (options = {}) => {
        const { maxAge = 15000, requiredAccuracy = null, timeoutMs = 8000, targetAccuracy = 10 } = options;

        // 1. Try Last Known Position (Instant)
        try {
            const lastKnown = await Location.getLastKnownPositionAsync();
            if (lastKnown) {
                const age = Date.now() - lastKnown.timestamp;
                if (age < maxAge) {
                    if (!requiredAccuracy || (lastKnown.coords && lastKnown.coords.accuracy <= requiredAccuracy)) {
                        console.log(`[Location] Using cached position (Age: ${Math.round(age / 1000)}s, Accuracy: ${lastKnown.coords.accuracy.toFixed(1)}m)`);
                        return lastKnown;
                    } else {
                        console.log(`[Location] Cache ignored: accuracy ${lastKnown.coords.accuracy.toFixed(1)}m > ${requiredAccuracy}m`);
                    }
                } else {
                    console.log(`[Location] Cache too old: ${Math.round(age / 1000)}s > ${maxAge / 1000}s`);
                }
            }
        } catch (e) {
            console.warn('[Location] Last known check failed:', e);
        }

        // 2. Fetch fresh location
        return await locationService.getFreshLocation({ timeoutMs, targetAccuracy });
    },

    /**
     * Calculate Distance (Haversine)
     * Returns distance in meters between two GPS coordinates.
     */
    calculateDistance: (lat1, lon1, lat2, lon2) => {
        const R = 6371e3; // metres
        const φ1 = lat1 * Math.PI / 180;
        const φ2 = lat2 * Math.PI / 180;
        const Δφ = (lat2 - lat1) * Math.PI / 180;
        const Δλ = (lon2 - lon1) * Math.PI / 180;

        const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
            Math.cos(φ1) * Math.cos(φ2) *
            Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

        return R * c;
    },

    /**
     * Check GPS accuracy against the configured level.
     * @param {number} accuracy - GPS accuracy in meters
     * @param {'high' | 'medium' | 'low'} level - The configured accuracy level
     * @returns {{ ok: boolean, warning: boolean, message: string }}
     */
    checkAccuracy: (accuracy, level = 'medium') => {
        const threshold = locationService.getAccuracyThreshold(level);
        const warningThreshold = Math.round(threshold * 0.7); // Warn at 70% of threshold

        if (accuracy > threshold) {
            return {
                ok: false,
                warning: false,
                message: `Your location accuracy is too low (${Math.round(accuracy)}m). Max for "${level}" mode is ${threshold}m. Move to a clear view of the sky or change GPS setting.`,
            };
        }
        if (accuracy > warningThreshold) {
            return {
                ok: true,
                warning: true,
                message: `Your location accuracy is ${Math.round(accuracy)}m. Results may be less precise.`,
            };
        }
        return { ok: true, warning: false, message: '' };
    },

    /**
     * Get accuracy quality label for UI display.
     * @param {number} accuracy - GPS accuracy in meters
     * @param {'high' | 'medium' | 'low'} level - The configured level
     * @returns {{ quality: 'good' | 'mediocre' | 'poor', color: string }}
     */
    getAccuracyQuality: (accuracy, level = 'medium') => {
        const threshold = locationService.getAccuracyThreshold(level);
        const halfThreshold = threshold / 2;

        if (accuracy <= halfThreshold) {
            return { quality: 'good', color: '#4CAF50' }; // Green
        }
        if (accuracy <= threshold) {
            return { quality: 'mediocre', color: '#FF9800' }; // Yellow/Orange
        }
        return { quality: 'poor', color: '#F44336' }; // Red
    },
};
