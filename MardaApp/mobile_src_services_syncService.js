import AsyncStorage from '@react-native-async-storage/async-storage';
import { syncAPI, downloadAllReferenceData } from '../api/endpoints';
import { STORAGE_KEYS } from '../constants/config';

/**
 * Sync Service
 * Handles data synchronization between mobile app and backend
 */

export const syncService = {
    /**
     * Download all data from server and store locally
     */
    downloadData: async (username) => {
        try {
            console.log('[Sync] Starting data download...');

            // 1. Get current billing period
            const kfyaworData = await syncAPI.getKfyawor(username);
            await AsyncStorage.setItem(
                STORAGE_KEYS.KIFYAWER,
                JSON.stringify(kfyaworData)
            );

            // 2. Get assigned customers
            const customers = await syncAPI.getCustomers(username);
            await AsyncStorage.setItem(
                '@wbill:customers',
                JSON.stringify(customers)
            );

            // 3. Get wuzif data
            const wuzif = await syncAPI.getWuzif(username);
            await AsyncStorage.setItem(
                '@wbill:wuzif',
                JSON.stringify(wuzif)
            );

            // 4. Get reference data
            const referenceData = await downloadAllReferenceData();
            await AsyncStorage.setItem(
                '@wbill:reference_data',
                JSON.stringify(referenceData)
            );

            // 5. Update last sync time
            const now = new Date().toISOString();
            await AsyncStorage.setItem(STORAGE_KEYS.LAST_SYNC, now);

            console.log('[Sync] Download complete!');

            return {
                success: true,
                kfyawor: kfyaworData,
                customersCount: customers.length,
                wuzifCount: wuzif.length,
                lastSync: now,
            };

        } catch (error) {
            console.error('[Sync] Download failed:', error);
            return {
                success: false,
                error: error.message || 'Failed to download data',
            };
        }
    },

    /**
     * Upload pending readings to server
     */
    uploadReadings: async () => {
        try {
            console.log('[Sync] Starting readings upload...');

            // Get pending readings from storage
            const pendingJson = await AsyncStorage.getItem('@wbill:pending_readings');
            const pendingReadings = pendingJson ? JSON.parse(pendingJson) : [];

            if (pendingReadings.length === 0) {
                console.log('[Sync] No pending readings to upload');
                return { success: true, uploaded: 0, failed: 0 };
            }

            const { readingAPI } = require('../api/endpoints');

            let uploaded = 0;
            let failed = 0;
            const failedReadings = [];

            // Upload one by one (will be improved with bulk endpoint)
            for (const reading of pendingReadings) {
                try {
                    await readingAPI.submitReading({
                        customerInfoId: reading.customerId,
                        consumption: reading.consumption,
                        kifyaWer: reading.kifyaWer,
                        additionalText: reading.notes,
                        maximumreading: reading.currentReading,
                    });

                    uploaded++;
                    console.log(`[Sync] Uploaded reading for customer ${reading.customerId}`);

                } catch (error) {
                    failed++;
                    failedReadings.push(reading);
                    console.error(`[Sync] Failed to upload reading:`, error);
                }
            }

            // Update pending readings (keep only failed ones)
            await AsyncStorage.setItem(
                '@wbill:pending_readings',
                JSON.stringify(failedReadings)
            );

            console.log(`[Sync] Upload complete: ${uploaded} successful, ${failed} failed`);

            return {
                success: true,
                uploaded,
                failed,
                remaining: failedReadings.length,
            };

        } catch (error) {
            console.error('[Sync] Upload failed:', error);
            return {
                success: false,
                error: error.message || 'Failed to upload readings',
            };
        }
    },

    /**
     * Get sync status
     */
    getSyncStatus: async () => {
        try {
            const lastSync = await AsyncStorage.getItem(STORAGE_KEYS.LAST_SYNC);
            const pendingJson = await AsyncStorage.getItem('@wbill:pending_readings');
            const pendingReadings = pendingJson ? JSON.parse(pendingJson) : [];

            return {
                lastSync: lastSync ? new Date(lastSync) : null,
                pendingCount: pendingReadings.length,
                hasPendingData: pendingReadings.length > 0,
            };
        } catch (error) {
            console.error('[Sync] Status check failed:', error);
            return {
                lastSync: null,
                pendingCount: 0,
                hasPendingData: false,
            };
        }
    },

    /**
     * Get local customers data
     */
    getLocalCustomers: async () => {
        try {
            const customersJson = await AsyncStorage.getItem('@wbill:customers');
            return customersJson ? JSON.parse(customersJson) : [];
        } catch (error) {
            console.error('[Sync] Failed to get local customers:', error);
            return [];
        }
    },

    /**
     * Get kfyawor data
     */
    getKfyawor: async () => {
        try {
            const kfyaworJson = await AsyncStorage.getItem(STORAGE_KEYS.KIFYAWER);
            return kfyaworJson ? JSON.parse(kfyaworJson) : null;
        } catch (error) {
            console.error('[Sync] Failed to get kfyawor:', error);
            return null;
        }
    },
};
