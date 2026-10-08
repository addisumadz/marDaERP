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

/**
 * In-memory fast cache for 0ms instant location access across screens.
 */
let _cachedLocation = null;
let _cachedTimestamp = 0;

export const locationService = {

    /**
     * Clear the in-memory GPS cache.
     */
    clearLocationCache: () => {
        _cachedLocation = null;
        _cachedTimestamp = 0;
    },

    /**
     * Inspect current in-memory cache state.
     */
    getLocationCache: () => {
        return {
            location: _cachedLocation,
            timestamp: _cachedTimestamp,
            ageMs: _cachedLocation ? Date.now() - _cachedTimestamp : null,
        };
    },

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
     * Stops early as soon as targetAccuracy (matching user setting) is satisfied.
     *
     * @param {Object} options
     * @param {number} options.timeoutMs - Max time to collect fixes (default 8000ms)
     * @param {number} options.targetAccuracy - Stop early if this accuracy reached (default: matches setting)
     * @returns {Object} Best location fix
     */
    getBestLocation: async (options = {}) => {
        const { timeoutMs = 8000 } = options;
        let targetAccuracy = options.targetAccuracy;

        // Dynamic Target Accuracy: defaults to user's configured setting (High: 20m, Medium: 40m, Low: 70m)
        if (!targetAccuracy) {
            const level = await locationService.getSavedAccuracyLevel();
            targetAccuracy = locationService.getAccuracyThreshold(level);
        }

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
                    _cachedLocation = bestLocation;
                    _cachedTimestamp = Date.now();
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
                            console.log(`[Location] New best: ${loc.coords.accuracy.toFixed(1)}m (target: <=${targetAccuracy}m)`);
                        }
                        // Stop early if we reached target accuracy for configured setting
                        if (bestLocation && bestLocation.coords.accuracy <= targetAccuracy) {
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
     * 2. Use watchPositionAsync to collect best fix (stops early on targetAccuracy, max 8s)
     * 3. Fallback: single assisted GPS shot (Balanced, 5s timeout)
     * Eliminates old 28s cascading freeze, capping maximum wait at ~13s.
     *
     * @param {Object} options
     * @param {number} options.timeoutMs - Time window for collecting fixes (default 8000)
     * @param {number} options.targetAccuracy - Target accuracy (default: dynamic from setting)
     * @returns {Object} Location object
     */
    getFreshLocation: async (options = {}) => {
        const { timeoutMs = 8000, targetAccuracy = null } = options;

        // Ensure GPS is on
        await locationService.ensureGPSEnabled();

        // 1. Try watch-based collection first (sensor fusion, dynamic early exit)
        try {
            const loc = await locationService.getBestLocation({ timeoutMs, targetAccuracy });
            return loc;
        } catch (e) {
            console.warn('[Location] Watch-based location failed:', e.message);
        }

        // 2. Streamlined assisted fallback: 5s Balanced single-shot (prevents 28s cascading lockup)
        try {
            console.log('[Location] Falling back to 5s Balanced single-shot...');
            const loc = await locationService.getLocationWithTimeout(
                Location.Accuracy.Balanced, 5000
            );
            if (loc) {
                _cachedLocation = loc;
                _cachedTimestamp = Date.now();
                return loc;
            }
        } catch (e) {
            console.warn('[Location] Balanced fallback failed:', e.message);
            if (e.message === 'GPS_TIMEOUT') {
                throw e;
            }
        }

        throw new Error('NO_LOCATION_FIX');
    },

    /**
     * Get Smart Location (with cache).
     * Strategy:
     * 1. In-Memory Fast Cache: Instant 0ms return if younger than maxAge (default 30s)
     * 2. OS Last Known Position: Instant return if younger than maxAge
     * 3. Fresh fetch with dynamic early exit if cache is empty or expired
     *
     * @param {Object} options
     * @param {number} options.maxAge - Max cache age in ms (default 30000 = 30s)
     * @param {number} options.requiredAccuracy - Max acceptable accuracy in meters (default null)
     * @param {number} options.timeoutMs - Timeout for fresh fetch (default 8000)
     * @param {number} options.targetAccuracy - Target accuracy for fresh fetch (default: dynamic from setting)
     * @returns {Object} Location object
     */
    getSmartLocation: async (options = {}) => {
        const { maxAge = 30000, requiredAccuracy = null, timeoutMs = 8000, targetAccuracy = null } = options;

        // 1. Fast In-Memory Cache (0ms instant return across screens)
        if (_cachedLocation) {
            const age = Date.now() - _cachedTimestamp;
            if (age < maxAge) {
                if (!requiredAccuracy || (_cachedLocation.coords && _cachedLocation.coords.accuracy <= requiredAccuracy)) {
                    console.log(`[Location] Fast in-memory cache hit (Age: ${Math.round(age / 1000)}s, Accuracy: ${_cachedLocation.coords.accuracy.toFixed(1)}m)`);
                    return _cachedLocation;
                } else {
                    console.log(`[Location] Fast cache ignored: accuracy ${_cachedLocation.coords.accuracy.toFixed(1)}m > ${requiredAccuracy}m`);
                }
            } else {
                console.log(`[Location] Fast cache expired: ${Math.round(age / 1000)}s > ${Math.round(maxAge / 1000)}s`);
            }
        }

        // 2. OS Last Known Position Fallback (Expo Native bridge)
        try {
            const lastKnown = await Location.getLastKnownPositionAsync();
            if (lastKnown) {
                const age = Date.now() - lastKnown.timestamp;
                if (age < maxAge) {
                    if (!requiredAccuracy || (lastKnown.coords && lastKnown.coords.accuracy <= requiredAccuracy)) {
                        console.log(`[Location] Using OS cached position (Age: ${Math.round(age / 1000)}s, Accuracy: ${lastKnown.coords.accuracy.toFixed(1)}m)`);
                        _cachedLocation = lastKnown;
                        _cachedTimestamp = Date.now();
                        return lastKnown;
                    } else {
                        console.log(`[Location] OS cache ignored: accuracy ${lastKnown.coords.accuracy.toFixed(1)}m > ${requiredAccuracy}m`);
                    }
                } else {
                    console.log(`[Location] OS cache too old: ${Math.round(age / 1000)}s > ${Math.round(maxAge / 1000)}s`);
                }
            }
        } catch (e) {
            console.warn('[Location] Last known check failed:', e);
        }

        // 3. Fetch fresh location with dynamic target accuracy
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
