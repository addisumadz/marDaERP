import AsyncStorage from '@react-native-async-storage/async-storage';
import { STORAGE_KEYS } from '../constants/config';

const QUEUE_STORAGE_KEY = '@fieldapp:offline_queue';

/**
 * Offline Queue Service
 * Stores survey submissions and installation completions in AsyncStorage
 * when the device is offline, then syncs when connectivity is restored.
 */
export const offlineQueueService = {
    /**
     * Add an action to the offline queue
     * @param {'SUBMIT_SURVEY' | 'COMPLETE_INSTALLATION'} type
     * @param {number} applicationId
     * @param {object} data - The payload to send when online
     */
    enqueue: async (type, applicationId, data) => {
        try {
            const queue = await offlineQueueService.getQueue();
            const entry = {
                id: `${type}_${applicationId}_${Date.now()}`,
                type,
                applicationId,
                data,
                createdAt: new Date().toISOString(),
                retries: 0,
            };
            queue.push(entry);
            await AsyncStorage.setItem(QUEUE_STORAGE_KEY, JSON.stringify(queue));
            console.log(`[OfflineQueue] Enqueued: ${entry.id}`);
            return entry;
        } catch (error) {
            console.error('[OfflineQueue] Enqueue error:', error);
            throw error;
        }
    },

    /**
     * Get all queued items
     * @returns {Promise<Array>}
     */
    getQueue: async () => {
        try {
            const raw = await AsyncStorage.getItem(QUEUE_STORAGE_KEY);
            return raw ? JSON.parse(raw) : [];
        } catch {
            return [];
        }
    },

    /**
     * Get count of pending items
     * @returns {Promise<number>}
     */
    getPendingCount: async () => {
        const queue = await offlineQueueService.getQueue();
        return queue.length;
    },

    /**
     * Remove a successfully synced item from the queue
     * @param {string} entryId
     */
    dequeue: async (entryId) => {
        try {
            const queue = await offlineQueueService.getQueue();
            const updated = queue.filter((item) => item.id !== entryId);
            await AsyncStorage.setItem(QUEUE_STORAGE_KEY, JSON.stringify(updated));
            console.log(`[OfflineQueue] Dequeued: ${entryId}`);
        } catch (error) {
            console.error('[OfflineQueue] Dequeue error:', error);
        }
    },

    /**
     * Increment retry count for a failed item
     * @param {string} entryId
     */
    incrementRetry: async (entryId) => {
        try {
            const queue = await offlineQueueService.getQueue();
            const updated = queue.map((item) =>
                item.id === entryId ? { ...item, retries: (item.retries || 0) + 1 } : item
            );
            await AsyncStorage.setItem(QUEUE_STORAGE_KEY, JSON.stringify(updated));
        } catch (error) {
            console.error('[OfflineQueue] Retry increment error:', error);
        }
    },

    /**
     * Process all queued items — call from sync service when online
     * @param {Function} processItem - async function(entry) => should call the API
     * @returns {Promise<{synced: number, failed: number}>}
     */
    processQueue: async (processItem) => {
        const queue = await offlineQueueService.getQueue();
        let synced = 0;
        let failed = 0;

        for (const entry of queue) {
            try {
                await processItem(entry);
                await offlineQueueService.dequeue(entry.id);
                synced++;
            } catch (error) {
                console.warn(`[OfflineQueue] Failed to sync ${entry.id}:`, error.message);
                await offlineQueueService.incrementRetry(entry.id);
                failed++;
            }
        }

        if (synced > 0) {
            await AsyncStorage.setItem(STORAGE_KEYS.LAST_SYNC, new Date().toISOString());
        }

        return { synced, failed };
    },

    /**
     * Clear entire queue (use with caution)
     */
    clearQueue: async () => {
        await AsyncStorage.removeItem(QUEUE_STORAGE_KEY);
    },
};
