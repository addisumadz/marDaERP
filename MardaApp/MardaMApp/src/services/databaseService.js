import * as SQLite from 'expo-sqlite';

/**
 * Database Service
 * Handles all SQLite operations for the mobile app
 */

const DB_NAME = 'wbill_mobile.db';

// Initialize database connection
let db = null;

const getDB = async () => {
    if (!db) {
        db = await SQLite.openDatabaseAsync(DB_NAME);
    }
    return db;
};

export const databaseService = {
    getDB,
    /**
     * Initialize database and create tables
     */
    initializeDatabase: async () => {
        try {
            console.log('[DB] Initializing database...');
            const database = await getDB();

            // Create customers table
            await database.execAsync(`
                CREATE TABLE IF NOT EXISTS customers (
                    id INTEGER PRIMARY KEY,
                    full_name TEXT,
                    account_number TEXT,
                    meter_number TEXT,
                    phone_number TEXT,
                    house_number TEXT,
                    count_number TEXT,
                    customer_type_id INTEGER,
                    meter_size_id INTEGER,
                    address_1_id INTEGER,
                    address_2_id INTEGER,
                    location_coordination TEXT,
                    qr_code TEXT,
                    status TEXT,
                    wuzif_hisab REAL DEFAULT 0,
                    wuzif_remark TEXT,
                    reading_status TEXT DEFAULT 'pending',
                    is_modified INTEGER DEFAULT 0,
                    previous_reading INTEGER DEFAULT 0,
                    max_reading INTEGER DEFAULT 0,
                    last_reading INTEGER DEFAULT 0,
                    reading_month TEXT,
                    additional_text TEXT
                );
            `);

            // Create pending_readings table
            await database.execAsync(`
                CREATE TABLE IF NOT EXISTS pending_readings (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    customer_id INTEGER,
                    current_reading REAL,
                    prev_reading REAL,
                    consumption REAL,
                    kifya_wer TEXT,
                    notes TEXT,
                    timestamp TEXT,
                    synced INTEGER DEFAULT 0,
                    zero_reason_id INTEGER,
                    FOREIGN KEY (customer_id) REFERENCES customers(id)
                );
            `);

            // Create zero_reasons table
            await database.execAsync(`
                CREATE TABLE IF NOT EXISTS zero_reasons (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    server_id INTEGER,
                    reason_code TEXT,
                    reason_name TEXT,
                    is_zero_reading_reason INTEGER DEFAULT 1
                );
            `);

            // Create indices for performance
            await database.execAsync(`
                CREATE INDEX IF NOT EXISTS idx_customers_account 
                ON customers(account_number);
            `);

            await database.execAsync(`
                CREATE INDEX IF NOT EXISTS idx_customers_status 
                ON customers(reading_status);
            `);

            await database.execAsync(`
                CREATE INDEX IF NOT EXISTS idx_pending_synced 
                ON pending_readings(synced);
            `);

            // Migration: Add columns if they don't exist (for existing databases)
            try {
                // Check if previous_reading column exists, if not add all missing columns
                const tableInfo = await database.getAllAsync('PRAGMA table_info(customers)');
                const columnNames = tableInfo.map(col => col.name);

                if (!columnNames.includes('previous_reading')) {
                    console.log('[DB] Adding previous_reading column...');
                    await database.execAsync(`ALTER TABLE customers ADD COLUMN previous_reading INTEGER DEFAULT 0;`);
                }

                if (!columnNames.includes('max_reading')) {
                    console.log('[DB] Adding max_reading column...');
                    await database.execAsync(`ALTER TABLE customers ADD COLUMN max_reading INTEGER DEFAULT 0;`);
                }

                if (!columnNames.includes('last_reading')) {
                    console.log('[DB] Adding last_reading column...');
                    await database.execAsync(`ALTER TABLE customers ADD COLUMN last_reading INTEGER DEFAULT 0;`);
                }

                if (!columnNames.includes('reading_month')) {
                    console.log('[DB] Adding reading_month column...');
                    await database.execAsync(`ALTER TABLE customers ADD COLUMN reading_month TEXT;`);
                }

                if (!columnNames.includes('additional_text')) {
                    console.log('[DB] Adding additional_text column...');
                    await database.execAsync(`ALTER TABLE customers ADD COLUMN additional_text TEXT;`);
                }

                console.log('[DB] Migration completed successfully');
            } catch (migrationError) {
                console.warn('[DB] Migration warning:', migrationError.message);
                // Continue even if migration fails - columns might already exist
            }

            // Migration: Add zero_reason_id to pending_readings if it doesn't exist
            try {
                const pendingTableInfo = await database.getAllAsync('PRAGMA table_info(pending_readings)');
                const pendingColumnNames = pendingTableInfo.map(col => col.name);

                if (!pendingColumnNames.includes('zero_reason_id')) {
                    console.log('[DB] Adding zero_reason_id column to pending_readings...');
                    await database.execAsync(`ALTER TABLE pending_readings ADD COLUMN zero_reason_id INTEGER;`);
                }

                if (!pendingColumnNames.includes('reader_gps')) {
                    console.log('[DB] Adding reader_gps column to pending_readings...');
                    await database.execAsync(`ALTER TABLE pending_readings ADD COLUMN reader_gps TEXT;`);
                }
            } catch (migrationError) {
                console.warn('[DB] Pending readings migration warning:', migrationError.message);
            }

            // Migration: Create zero_reasons if not exists (redundant but safe)
            try {
                await database.execAsync(`
                    CREATE TABLE IF NOT EXISTS zero_reasons (
                        id INTEGER PRIMARY KEY AUTOINCREMENT,
                        server_id INTEGER,
                        reason_code TEXT,
                        reason_name TEXT,
                        is_zero_reading_reason INTEGER DEFAULT 1
                    );
                `);
            } catch (error) {
                console.warn('[DB] Zero reasons table creation warning:', error.message);
            }

            console.log('[DB] Database initialized successfully');
            return { success: true };
        } catch (error) {
            console.error('[DB] Initialization failed:', error);
            return { success: false, error: error.message };
        }
    },

    /**
     * Clear all customer data (for fresh sync)
     */
    clearCustomers: async () => {
        try {
            const database = await getDB();
            await database.runAsync('DELETE FROM customers');
            console.log('[DB] Customers cleared');
            return { success: true };
        } catch (error) {
            console.error('[DB] Clear customers failed:', error);
            return { success: false, error: error.message };
        }
    },

    /**
     * Clear ALL data from the database
     */
    clearAllData: async () => {
        try {
            const database = await getDB();
            await database.withTransactionAsync(async () => {
                await database.runAsync('DELETE FROM customers');
                await database.runAsync('DELETE FROM pending_readings');
                await database.runAsync('DELETE FROM zero_reasons');
            });
            console.log('[DB] All data cleared');
            return { success: true };
        } catch (error) {
            console.error('[DB] Clear all data failed:', error);
            return { success: false, error: error.message };
        }
    },

    /**
     * Batch insert customers (optimized for 9000+ records)
     */
    insertCustomers: async (customers, wuzifData = []) => {
        try {
            const database = await getDB();

            // Create wuzif lookup map for fast merging
            const wuzifMap = {};
            wuzifData.forEach(w => {
                wuzifMap[w.id] = {
                    hisab: w.hisab || 0,
                    remark: w.remark || ''
                };
            });

            console.log(`[DB] Inserting ${customers.length} customers...`);

            // Use transaction for batch insert
            await database.withTransactionAsync(async () => {
                for (const c of customers) {
                    // Wuzif data can now come from the customer object (merged from CSV) OR the legacy map
                    const wuzifHisab = c.wuzif_hisab !== undefined ? c.wuzif_hisab : (wuzifMap[c.id]?.hisab || 0);
                    const wuzifRemark = c.wuzif_remark !== undefined ? c.wuzif_remark : (wuzifMap[c.id]?.remark || '');

                    await database.runAsync(
                        `INSERT OR REPLACE INTO customers (
                            id, full_name, account_number, meter_number,
                            phone_number, house_number, count_number,
                            customer_type_id, meter_size_id,
                            address_1_id, address_2_id,
                            location_coordination, qr_code, status,
                            wuzif_hisab, wuzif_remark, reading_status,
                            previous_reading, max_reading, last_reading, 
                            reading_month, additional_text
                        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                        [
                            c.id, c.full_name, c.account_number, c.meter_number,
                            c.phone_number, c.house_number, c.count_number,
                            c.customer_type_id, c.meter_size_id,
                            c.address_1_id, c.address_2_id,
                            c.location_coordination, c.qr_code, c.status,
                            wuzifHisab, wuzifRemark, 'pending',
                            c.previous_reading || 0, c.max_reading || 0, c.last_reading || 0,
                            c.reading_month || '', c.additional_text || ''
                        ]
                    );
                }
            });

            console.log('[DB] Customers inserted successfully');
            return { success: true, count: customers.length };
        } catch (error) {
            console.error('[DB] Insert customers failed:', error);
            return { success: false, error: error.message };
        }
    },

    /**
     * Get all customers with optional filtering
     */
    getCustomers: async (filters = {}) => {
        try {
            const database = await getDB();
            let query = 'SELECT * FROM customers WHERE 1=1';
            const params = [];

            // Apply filters
            if (filters.search) {
                query += ` AND (
                    full_name LIKE ? OR 
                    account_number LIKE ? OR 
                    meter_number LIKE ?
                )`;
                const searchTerm = `%${filters.search}%`;
                params.push(searchTerm, searchTerm, searchTerm);
            }

            if (filters.readingStatus) {
                query += ' AND reading_status = ?';
                params.push(filters.readingStatus);
            }

            if (filters.status) {
                query += ' AND status = ?';
                params.push(filters.status);
            }

            query += ' ORDER BY full_name ASC';

            const result = await database.getAllAsync(query, params);
            return result || [];
        } catch (error) {
            console.error('[DB] Get customers failed:', error);
            return [];
        }
    },

    /**
     * Get single customer by QR Code
     */
    getCustomerByQRCode: async (qrCode) => {
        try {
            const database = await getDB();
            // Use exact match
            const query = 'SELECT * FROM customers WHERE qr_code = ? LIMIT 1';
            const result = await database.getFirstAsync(query, [qrCode]);
            return result;
        } catch (error) {
            console.error('[DB] Get customer by QR failed:', error);
            return null;
        }
    },

    /**
     * Get single customer by ID
     */
    getCustomerById: async (id) => {
        try {
            const database = await getDB();
            const result = await database.getFirstAsync(
                'SELECT * FROM customers WHERE id = ?',
                [id]
            );
            return result;
        } catch (error) {
            console.error('[DB] Get customer failed:', error);
            return null;
        }
    },

    /**
     * Update customer information (for local edits like GPS/phone)
     */
    updateCustomer: async (id, updates) => {
        try {
            const database = await getDB();
            const fields = [];
            const values = [];

            Object.keys(updates).forEach(key => {
                fields.push(`${key} = ?`);
                values.push(updates[key]);
            });

            // Mark as modified (unless explicitly suppressed)
            if (!Object.keys(updates).includes('is_modified')) {
                fields.push('is_modified = ?');
                values.push(1);
            }
            values.push(id);

            const query = `UPDATE customers SET ${fields.join(', ')} WHERE id = ?`;
            await database.runAsync(query, values);

            console.log(`[DB] Customer ${id} updated`);
            return { success: true };
        } catch (error) {
            console.error('[DB] Update customer failed:', error);
            return { success: false, error: error.message };
        }
    },

    /**
     * Update reading status for a customer
     */
    updateReadingStatus: async (customerId, status) => {
        try {
            const database = await getDB();
            await database.runAsync(
                'UPDATE customers SET reading_status = ? WHERE id = ?',
                [status, customerId]
            );
            return { success: true };
        } catch (error) {
            console.error('[DB] Update reading status failed:', error);
            return { success: false, error: error.message };
        }
    },

    /**
     * Add or update pending reading
     * If an unsynced reading already exists for the same customer + period, it is updated (no duplicates).
     */
    addPendingReading: async (reading) => {
        try {
            const database = await getDB();

            // Check for existing unsynced reading for same customer + billing period
            const existing = await database.getFirstAsync(
                `SELECT id, current_reading, timestamp FROM pending_readings 
                 WHERE customer_id = ? AND kifya_wer = ? AND synced = 0
                 ORDER BY id DESC LIMIT 1`,
                [reading.customerId, reading.kifyaWer]
            );

            if (existing) {
                // UPDATE existing reading instead of creating a duplicate
                const oldReading = existing.current_reading;
                await database.runAsync(
                    `UPDATE pending_readings SET
                        current_reading = ?, prev_reading = ?, consumption = ?,
                        notes = ?, timestamp = ?, zero_reason_id = ?, reader_gps = ?
                     WHERE id = ?`,
                    [
                        reading.currentReading,
                        reading.prevReading,
                        reading.consumption,
                        reading.notes || '',
                        reading.timestamp || new Date().toISOString(),
                        reading.zeroReasonId || null,
                        reading.readerGps || null,
                        existing.id
                    ]
                );

                console.log(`[DB] Pending reading updated: ID ${existing.id} (${oldReading} → ${reading.currentReading})`);
                return {
                    success: true,
                    updated: true,
                    id: existing.id,
                    previousValue: oldReading
                };
            }

            const result = await database.runAsync(
                `INSERT INTO pending_readings (
                    customer_id, current_reading, prev_reading,
                    consumption, kifya_wer, notes, timestamp, zero_reason_id, reader_gps
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                [
                    reading.customerId,
                    reading.currentReading,
                    reading.prevReading,
                    reading.consumption,
                    reading.kifyaWer,
                    reading.notes || '',
                    reading.timestamp || new Date().toISOString(),
                    reading.zeroReasonId || null,
                    reading.readerGps || null
                ]
            );

            // Update customer reading status to 'encoded'
            await databaseService.updateReadingStatus(reading.customerId, 'encoded');

            console.log(`[DB] Pending reading added: ${result.lastInsertRowId}`);
            return { success: true, id: result.lastInsertRowId };
        } catch (error) {
            console.error('[DB] Add pending reading failed:', error);
            return { success: false, error: error.message };
        }
    },

    /**
     * Get all pending (unsynced) readings
     */
    getPendingReadings: async () => {
        try {
            const database = await getDB();
            const result = await database.getAllAsync(
                `SELECT pr.*, c.account_number 
                 FROM pending_readings pr 
                 LEFT JOIN customers c ON pr.customer_id = c.id 
                 WHERE pr.synced = 0 
                 ORDER BY pr.timestamp ASC`
            );
            return result || [];
        } catch (error) {
            console.error('[DB] Get pending readings failed:', error);
            return [];
        }
    },

    /**
     * Mark reading as synced
     */
    markReadingSynced: async (id) => {
        try {
            const database = await getDB();
            await database.runAsync(
                'UPDATE pending_readings SET synced = 1 WHERE id = ?',
                [id]
            );
            return { success: true };
        } catch (error) {
            console.error('[DB] Mark reading synced failed:', error);
            return { success: false, error: error.message };
        }
    },

    /**
     * Delete synced readings (cleanup)
     */
    deleteSyncedReadings: async () => {
        try {
            const database = await getDB();
            await database.runAsync('DELETE FROM pending_readings WHERE synced = 1');
            console.log('[DB] Synced readings deleted');
            return { success: true };
        } catch (error) {
            console.error('[DB] Delete synced readings failed:', error);
            return { success: false, error: error.message };
        }
    },

    /**
     * Get customer count by reading status
     */
    getCustomerCounts: async () => {
        try {
            const database = await getDB();
            const pending = await database.getFirstAsync(
                'SELECT COUNT(*) as count FROM customers WHERE reading_status = ?',
                ['pending']
            );
            const encoded = await database.getFirstAsync(
                'SELECT COUNT(*) as count FROM customers WHERE reading_status = ?',
                ['encoded']
            );

            return {
                pending: pending?.count || 0,
                encoded: encoded?.count || 0,
                total: (pending?.count || 0) + (encoded?.count || 0)
            };
        } catch (error) {
            console.error('[DB] Get customer counts failed:', error);
            return { pending: 0, encoded: 0, total: 0 };
        }
    },

    /**
     * Insert or update zero reasons
     */
    insertZeroReasons: async (reasons) => {
        try {
            const database = await getDB();

            // Clear existing reasons first to ensure clean state
            await database.runAsync('DELETE FROM zero_reasons');

            if (!reasons || reasons.length === 0) {
                return { success: true };
            }

            await database.withTransactionAsync(async () => {
                for (const r of reasons) {
                    await database.runAsync(
                        `INSERT INTO zero_reasons (
                            server_id, reason_code, reason_name, is_zero_reading_reason
                        ) VALUES (?, ?, ?, ?)`,
                        [
                            r.id,
                            r.reasonCode,
                            r.reasonName,
                            r.isZeroReadingReason ? 1 : 0
                        ]
                    );
                }
            });

            console.log(`[DB] Inserted ${reasons.length} zero reasons`);
            return { success: true };
        } catch (error) {
            console.error('[DB] Insert zero reasons failed:', error);
            return { success: false, error: error.message };
        }
    },

    /**
     * Get zero reasons from local DB
     */
    getZeroReasons: async () => {
        try {
            const database = await getDB();
            const result = await database.getAllAsync(
                'SELECT * FROM zero_reasons ORDER BY reason_name ASC'
            );

            // Map back to API format for consistency
            return result.map(r => ({
                id: r.server_id, // Use server_id as the ID for the app
                reasonCode: r.reason_code,
                reasonName: r.reason_name,
                isZeroReadingReason: !!r.is_zero_reading_reason
            }));
        } catch (error) {
            console.error('[DB] Get zero reasons failed:', error);
            return [];
        }
    },

    /**
     * Get encoded readings for export (Joined with Customer data)
     */
    getEncodedReadingsForExport: async () => {
        try {
            const database = await getDB();
            const query = `
                SELECT 
                    c.full_name, 
                    c.account_number, 
                    COALESCE(pr.current_reading, c.last_reading) as reading,
                    COALESCE(pr.kifya_wer, c.reading_month) as reading_month,
                    pr.timestamp
                FROM customers c
                LEFT JOIN pending_readings pr ON c.id = pr.customer_id
                WHERE c.reading_status = 'encoded' OR pr.id IS NOT NULL
                ORDER BY c.account_number ASC
            `;
            const result = await database.getAllAsync(query);
            return result || [];
        } catch (error) {
            console.error('[DB] Get export readings failed:', error);
            return [];
        }
    },

    /**
     * Get dashboard statistics
     */
    /**
     * Get modified customers for sync (Phone/GPS/QR)
     */
    getModifiedCustomers: async () => {
        try {
            const database = await getDB();
            const result = await database.getAllAsync(
                'SELECT * FROM customers WHERE is_modified = 1'
            );
            return result || [];
        } catch (error) {
            console.error('[DB] Get modified customers failed:', error);
            return [];
        }
    },

    /**
     * Get the latest pending reading for a specific customer
     */
    getPendingReadingForCustomer: async (customerId) => {
        try {
            const database = await getDB();
            const result = await database.getFirstAsync(
                `SELECT current_reading, prev_reading, consumption, kifya_wer, timestamp
                 FROM pending_readings
                 WHERE customer_id = ?
                 ORDER BY id DESC LIMIT 1`,
                [customerId]
            );
            return result || null;
        } catch (error) {
            console.error('[DB] Get pending reading for customer failed:', error);
            return null;
        }
    },

    /**
     * Get reading statuses for customers that have pending readings
     * Used to preserve status across re-sync
     */
    getCustomerReadingStatuses: async () => {
        try {
            const database = await getDB();
            // Only capture statuses for customers that have unsynced pending readings
            const result = await database.getAllAsync(
                `SELECT DISTINCT c.id, c.reading_status 
                 FROM customers c
                 INNER JOIN pending_readings pr ON c.id = pr.customer_id
                 WHERE pr.synced = 0`
            );
            const statusMap = {};
            (result || []).forEach(row => {
                statusMap[row.id] = row.reading_status;
            });
            return statusMap;
        } catch (error) {
            console.error('[DB] Get customer reading statuses failed:', error);
            return {};
        }
    },

    /**
     * Restore reading statuses after re-sync
     */
    restoreReadingStatuses: async (statusMap) => {
        try {
            const database = await getDB();
            await database.withTransactionAsync(async () => {
                for (const [id, status] of Object.entries(statusMap)) {
                    await database.runAsync(
                        'UPDATE customers SET reading_status = ? WHERE id = ?',
                        [status, id]
                    );
                }
            });
            console.log(`[DB] Restored ${Object.keys(statusMap).length} reading statuses`);
            return { success: true };
        } catch (error) {
            console.error('[DB] Restore reading statuses failed:', error);
            return { success: false, error: error.message };
        }
    },

    getDashboardStats: async () => {
        try {
            const database = await getDB();

            // Customer stats
            const allocated = await database.getFirstAsync('SELECT COUNT(*) as count FROM customers');
            // Count 'read' as anything that is NOT pending (encoded, synced, etc.)
            const read = await database.getFirstAsync("SELECT COUNT(*) as count FROM customers WHERE reading_status != 'pending'");
            const unread = await database.getFirstAsync("SELECT COUNT(*) as count FROM customers WHERE reading_status = 'pending'");

            // Sync stats from pending_readings table
            const uploaded = await database.getFirstAsync('SELECT COUNT(*) as count FROM pending_readings WHERE synced = 1');
            const pending = await database.getFirstAsync('SELECT COUNT(*) as count FROM pending_readings WHERE synced = 0');

            // GPS stats
            const gpsMissed = await database.getFirstAsync("SELECT COUNT(*) as count FROM customers WHERE location_coordination IS NULL OR location_coordination = ''");

            // Calculate percentage
            const total = allocated?.count || 0;
            const readCount = read?.count || 0;
            const percentage = total > 0 ? ((readCount / total) * 100).toFixed(1) : 0;

            return {
                allocated: total,
                read: readCount,
                unread: unread?.count || 0,
                gpsMissed: gpsMissed?.count || 0,
                percentage: percentage,
                uploaded: uploaded?.count || 0,
                pending: pending?.count || 0,
                failed: 0 // Placeholder
            };
        } catch (error) {
            console.error('[DB] Get dashboard stats failed:', error);
            return {
                allocated: 0,
                read: 0,
                unread: 0,
                unassigned: 0,
                percentage: 0,
                uploaded: 0,
                pending: 0,
                failed: 0
            };
        }
    }
};
