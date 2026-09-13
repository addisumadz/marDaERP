-- =============================================================================
-- Migration: Add missing logistics & GL columns to inv_stock_transfer
-- Target Database: wbill_jwns9 (or your current database)
-- Target Table: inv_stock_transfer
-- =============================================================================

-- 1. Add carrier, logistics and General Ledger columns
ALTER TABLE inv_stock_transfer
    ADD COLUMN waybill_number VARCHAR(100) NULL AFTER remarks,
    ADD COLUMN vehicle_plate VARCHAR(50) NULL AFTER waybill_number,
    ADD COLUMN driver_name VARCHAR(100) NULL AFTER vehicle_plate,
    ADD COLUMN journal_entry_id BIGINT NULL AFTER driver_name;

-- 2. Optional: Add foreign key reference to General Ledger journal entry table
-- (Run this if you want referential integrity with fnc_journal_entry)
ALTER TABLE inv_stock_transfer
    ADD CONSTRAINT fk_tf_journal_entry 
    FOREIGN KEY (journal_entry_id) REFERENCES fnc_journal_entry(id) 
    ON DELETE SET NULL;

-- 3. Safety check: ensure received_quantity exists in line items table (if not already present)
-- ALTER TABLE inv_stock_transfer_line ADD COLUMN received_quantity DECIMAL(15,4) NULL AFTER serial_tracking_id;
