import AsyncStorage from '@react-native-async-storage/async-storage';
import Papa from 'papaparse';
import { syncAPI, readingAPI, cardManagementAPI, downloadAllReferenceData } from '../api/endpoints';
import { STORAGE_KEYS } from '../constants/config';
import { databaseService } from './databaseService';

/**
 * Sync Service
 * Handles data synchronization between mobile app and backend
 */



/**
 * Parse CSV text into array of objects (Handles quoted strings)
 */
const parseCsvData = (csvText) => {
    // The CSV has a header row, so we parse as an array of arrays (header: false)
    // and skip the first row
    const parsed = Papa.parse(csvText.trim(), {
        header: false,
        skipEmptyLines: true,
    });

    const data = parsed.data;
    if (data.length < 2) return []; // No data rows (only header)

    const csvData = [];

    for (let i = 1; i < data.length; i++) {
        const values = data[i];

        // Format: 
        // 0: customer_info_id
        // 1: consumption (previous reading in logic)
        // 2: maximumreading
        // 3: wuzif_hisab
        // 4: wuzif_kezih_eske (remark)
        // 5: kifya_wer
        // 6: additional_text

        const row = {};
        if (values.length >= 6) {
            row['customer_info_id'] = values[0];
            row['consumption'] = values[1];
            row['maximumreading'] = values[2];
            row['wuzif_hisab'] = values[3];
            row['wuzif_kezih_eske'] = values[4]; // Description/Reason
            row['kifya_wer'] = values[5];
            row['additional_text'] = values[6] || "";
        }
        csvData.push(row);
    }

    return csvData;
};

/**
 * Merge CSV data with customers
 */
const mergeCustomersWithCsv = (csvData, customers, currentReadingMonth) => {
    // Create CSV lookup map by customer_info_id
    const csvMap = {};
    csvData.forEach(row => {
        const customerId = row.customer_info_id;
        if (customerId) {
            csvMap[customerId] = {
                previous_reading: parseFloat(row.consumption) || 0,
                max_reading: parseFloat(row.maximumreading) || 0,
                reading_month: row.kifya_wer || currentReadingMonth,
                additional_text: row.additional_text || '',
                wuzif_hisab: parseFloat(row.wuzif_hisab) || 0,
                wuzif_remark: row.wuzif_kezih_eske || '',
                last_reading: 0
            };
        }
    });

    // Merge CSV data with customers
    return customers.map(customer => {
        // Handle ID mismatch (string vs int)
        const csvData = csvMap[customer.id] || csvMap[String(customer.id)];
        if (csvData) {
            return {
                ...customer,
                ...csvData
            };
        }
        return {
            ...customer,
            previous_reading: 0,
            max_reading: 0,
            last_reading: 0,
            reading_month: currentReadingMonth,
            additional_text: '',
            wuzif_hisab: 0,
            wuzif_remark: ''
        };
    });
};

export const syncService = {
    /**
     * Upload locally modified customer data (Phone, GPS, QR)
     */
    uploadCustomerUpdates: async () => {
        try {
            const modifiedCustomers = await databaseService.getModifiedCustomers();

            if (!modifiedCustomers || modifiedCustomers.length === 0) {
                return { success: true, count: 0 };
            }

            let successCount = 0;
            let errors = [];

            for (const localCustomer of modifiedCustomers) {
                try {
                    // Send update directly to dedicated mobile endpoint
                    await cardManagementAPI.updateCustomer({
                        id: localCustomer.id,
                        phone_number: localCustomer.phone_number,
                        location_coordination: localCustomer.location_coordination,
                        qr_code: localCustomer.qr_code
                    });

                    // Mark as synced locally
                    await databaseService.updateCustomer(localCustomer.id, { is_modified: 0 });

                    successCount++;
                } catch (err) {
                    console.error(`Failed to sync customer ${localCustomer.id}:`, err);
                    errors.push(err.message);
                }
            }

            return {
                success: errors.length === 0,
                count: successCount,
                total: modifiedCustomers.length,
                errors
            };
        } catch (error) {
            console.error('Upload updates failed:', error);
            return { success: false, error };
        }
    },
    /**
     * Download all data from server and store locally
     */
    downloadData: async (username) => {
        try {
            console.log('[Sync] Starting data download...');

            // 1. Get current billing period
            const kfyaworData = await syncAPI.getKfyawor(username);
            const currentReadingMonth = kfyaworData.kfyawor;
            await AsyncStorage.setItem(
                STORAGE_KEYS.KIFYAWER,
                JSON.stringify(kfyaworData)
            );

            // 2. Get assigned customers (New Endpoint)
            const customers = await syncAPI.getCustomers(username);

            // 3. Get CSV data (previous readings, wuzif, etc.) — REQUIRED
            let mergedCustomers = customers;
            let csvLink;
            try {
                csvLink = await syncAPI.getCsvFileLink(username);
            } catch (csvLinkError) {
                // CSV file not found or not prepared for this user — STOP sync
                console.error('[Sync] CSV file not found for user:', csvLinkError.message);
                return {
                    success: false,
                    errorType: 'CSV_NOT_FOUND',
                    error: `የCSV ፋይል አልተዘጋጀም ለዚህ ተጠቃሚ!\n\nCSV file has not been prepared for this reader.\nPlease ask the manager to prepare data for the current month (${currentReadingMonth}).`,
                    kfyawor: kfyaworData,
                };
            }

            // Download the CSV file
            const csvController = new AbortController();
            const csvTimeout = setTimeout(() => csvController.abort(), 90000);

            let csvText;
            try {
                const csvResponse = await fetch(csvLink, { signal: csvController.signal });
                clearTimeout(csvTimeout);

                if (!csvResponse.ok) {
                    throw new Error(`CSV download returned status ${csvResponse.status}`);
                }
                csvText = await csvResponse.text();
            } catch (fetchError) {
                clearTimeout(csvTimeout);
                console.error('[Sync] CSV file download failed:', fetchError.message);
                return {
                    success: false,
                    errorType: 'CSV_NOT_FOUND',
                    error: `የCSV ፋይል ማውረድ አልተሳካም!\n\nFailed to download CSV file. The file may have been deleted from the server.\nPlease ask the manager to prepare a new CSV for the current month (${currentReadingMonth}).`,
                    kfyawor: kfyaworData,
                };
            }

            // Parse CSV
            const csvData = parseCsvData(csvText);

            if (csvData.length === 0) {
                // CSV file is empty — STOP sync
                console.error('[Sync] CSV parsed but contained no data rows');
                return {
                    success: false,
                    errorType: 'CSV_EMPTY',
                    error: `የCSV ፋይል ባዶ ነው!\n\nThe CSV file exists but contains no data.\nPlease ask the manager to prepare data for the current month (${currentReadingMonth}).`,
                    kfyawor: kfyaworData,
                };
            }

            // Validate CSV month matches current reading month
            // Note: kifya_wer in CSV contains a comma (e.g. "የካቲት, 2018") which
            // the CSV parser splits: kifya_wer gets "የካቲት", additional_text gets " 2018"
            // So we reconstruct the full month by combining both fields
            const rawKifyaWer = csvData[0]?.kifya_wer?.trim() || '';
            const rawAdditionalText = csvData[0]?.additional_text?.trim() || '';
            let csvKifyaWer = rawKifyaWer;
            // If additional_text looks like a year (numeric), it's the split year part
            if (rawAdditionalText && /^\d{4}$/.test(rawAdditionalText)) {
                csvKifyaWer = rawKifyaWer + ', ' + rawAdditionalText;
            }

            if (csvKifyaWer && currentReadingMonth && csvKifyaWer !== currentReadingMonth) {
                console.error(`[Sync] CSV month mismatch! CSV has "${csvKifyaWer}", system expects "${currentReadingMonth}"`);
                // Extract month from filename for extra context
                let fileMonth = '';
                try {
                    const urlParts = csvLink.split('/');
                    const fileName = urlParts[urlParts.length - 1];
                    const nameParts = fileName.replace('.csv', '').split('_');
                    if (nameParts.length >= 3) {
                        fileMonth = `${nameParts[nameParts.length - 3]}_${nameParts[nameParts.length - 2]}`;
                    }
                } catch (e) { /* ignore parse errors */ }

                // Month mismatch — STOP sync
                return {
                    success: false,
                    errorType: 'CSV_MONTH_MISMATCH',
                    error: `የCSV ፋይል ለተሳሳተ ወር ተዘጋጅቷል!\n\n` +
                        `CSV file month: "${csvKifyaWer}"\n` +
                        `Current month: "${currentReadingMonth}"\n` +
                        (fileMonth ? `File: ${fileMonth}\n\n` : '\n') +
                        `The CSV file was prepared for a different month.\nPlease ask the manager to prepare a new CSV for "${currentReadingMonth}".`,
                    kfyawor: kfyaworData,
                    csvMonthMismatch: {
                        expected: currentReadingMonth,
                        found: csvKifyaWer,
                        fileMonth: fileMonth,
                    },
                };
            }

            // CSV is valid — merge with customers
            mergedCustomers = mergeCustomersWithCsv(csvData, customers, currentReadingMonth);
            console.log(`[Sync] Merged ${csvData.length} CSV records with customers`);

            // 4. Get reference data (keep in AsyncStorage - small data)
            const referenceData = await downloadAllReferenceData();

            // === All remote data collected successfully — now safe to update local DB ===

            // 5a. Preserve unsynced pending readings before wiping
            const unsyncedReadings = await databaseService.getPendingReadings();
            const pendingReadingsToPreserve = unsyncedReadings.filter(r => r.synced === 0);
            console.log(`[Sync] Preserving ${pendingReadingsToPreserve.length} unsynced readings`);

            // 5b. Preserve reading statuses for customers with pending readings
            const statusMap = await databaseService.getCustomerReadingStatuses();

            // 5c. Wipe all old data (customers, pending_readings, zero_reasons)
            //    Login data is stored in AsyncStorage/SecureStore, not SQLite — untouched.
            await databaseService.clearAllData();
            console.log('[Sync] All old data cleared (customers, readings, zero_reasons)');

            // 6. Insert fresh customers
            const insertResult = await databaseService.insertCustomers(mergedCustomers, []);

            if (!insertResult.success) {
                throw new Error('Failed to save customers to database');
            }

            // 6b. Restore preserved pending readings
            if (pendingReadingsToPreserve.length > 0) {
                const database = await databaseService.getDB();
                await database.withTransactionAsync(async () => {
                    for (const r of pendingReadingsToPreserve) {
                        await database.runAsync(
                            `INSERT INTO pending_readings (
                                customer_id, current_reading, prev_reading,
                                consumption, kifya_wer, notes, timestamp, synced, zero_reason_id, reader_gps
                            ) VALUES (?, ?, ?, ?, ?, ?, ?, 0, ?, ?)`,
                            [
                                r.customer_id, r.current_reading, r.prev_reading,
                                r.consumption, r.kifya_wer, r.notes || '', r.timestamp,
                                r.zero_reason_id || null, r.reader_gps || null
                            ]
                        );
                    }
                });
                console.log(`[Sync] Restored ${pendingReadingsToPreserve.length} pending readings`);

                // Restore reading statuses (marks customers as 'encoded' again)
                await databaseService.restoreReadingStatuses(statusMap);
            }

            // 7. Save reference data
            await AsyncStorage.setItem(
                '@wbill:reference_data',
                JSON.stringify(referenceData)
            );
            if (referenceData.zeroReasons) {
                await databaseService.insertZeroReasons(referenceData.zeroReasons);
            }

            // 8. Update last sync time
            const now = new Date().toISOString();
            await AsyncStorage.setItem(STORAGE_KEYS.LAST_SYNC, now);

            console.log('[Sync] Download complete!');

            return {
                success: true,
                kfyawor: kfyaworData,
                customersCount: mergedCustomers.length,
                wuzifCount: 0,
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
     * Upload pending readings to server (Bulk)
     */
    uploadReadings: async () => {
        try {
            console.log('[Sync] Starting readings upload (Bulk)...');

            // Get pending readings from database
            const pendingReadings = await databaseService.getPendingReadings();

            if (pendingReadings.length === 0) {
                console.log('[Sync] No pending readings to upload');
                return { success: true, uploaded: 0, failed: 0 };
            }

            const { readingAPI } = require('../api/endpoints');

            let uploaded = 0;
            let failed = 0;

            const bulkPayload = pendingReadings.map(r => {
                // Combine reader GPS and notes into additional_text for server
                let additionalText = '';
                if (r.reader_gps) {
                    additionalText += `GPS:${r.reader_gps}`;
                }
                if (r.notes) {
                    additionalText += additionalText ? `|${r.notes}` : r.notes;
                }

                return {
                    customer_info_id: r.customer_id,
                    consumption: parseInt(r.consumption) || 0,
                    kifya_wer: r.kifya_wer,
                    additional_text: additionalText,
                    maximumreading: parseInt(r.current_reading) || 0,
                    zero_reason_id: r.zero_reason_id || null,
                    reader_gps: r.reader_gps || null
                };
            });

            try {
                const result = await readingAPI.submitBulkReadings(bulkPayload);

                if (result && result.status === 'success') {
                    const details = result.details || [];
                    const successAccounts = new Set();
                    const failedAccounts = new Set();

                    // Parse success/failure messages: "Success: accountNo" / "Failed: accountNo"
                    details.forEach(msg => {
                        if (msg.startsWith("Success: ")) {
                            successAccounts.add(msg.substring(9).trim());
                        } else if (msg.startsWith("Failed: ")) {
                            failedAccounts.add(msg.substring(8).trim());
                        }
                    });

                    // Build a customer_id → account_number lookup for fallback matching
                    const customerIdToAccount = {};
                    pendingReadings.forEach(r => {
                        if (r.account_number) {
                            customerIdToAccount[r.customer_id] = r.account_number;
                        }
                    });

                    for (const reading of pendingReadings) {
                        const acctNo = reading.account_number || customerIdToAccount[reading.customer_id];

                        if (acctNo && successAccounts.has(acctNo)) {
                            // Matched by account number in server response
                            await databaseService.markReadingSynced(reading.id);
                            uploaded++;
                        } else if (!acctNo && successAccounts.size > 0 && failedAccounts.size === 0 && details.length >= pendingReadings.length) {
                            // Fallback: if no account_number from JOIN but server reports all success,
                            // mark as synced (server accepted the batch)
                            console.warn(`[Sync] No account_number for reading ID ${reading.id} (customer_id: ${reading.customer_id}), but server reports full success — marking synced.`);
                            await databaseService.markReadingSynced(reading.id);
                            uploaded++;
                        } else {
                            failed++;
                            console.warn(`[Sync] Failed or unmatched: Account "${acctNo || 'MISSING'}" (Reading ID: ${reading.id}, Customer ID: ${reading.customer_id})`);
                        }
                    }
                } else {
                    console.error('[Sync] Bulk upload returned error status:', result);
                    failed = pendingReadings.length;
                    return { success: false, error: result?.message || 'Bulk upload failed' };
                }

            } catch (error) {
                console.error('[Sync] Bulk upload request failed:', error);
                return { success: false, error: error.message };
            }

            // Clean up synced readings - DISABLED to show "Uploaded" count in dashboard
            // await databaseService.deleteSyncedReadings();

            console.log(`[Sync] Upload complete: ${uploaded} successful, ${failed} failed`);

            return {
                success: failed === 0,
                uploaded,
                failed,
                remaining: failed,
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
            const pendingReadings = await databaseService.getPendingReadings();

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
    getLocalCustomers: async (filters = {}) => {
        try {
            return await databaseService.getCustomers(filters);
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
