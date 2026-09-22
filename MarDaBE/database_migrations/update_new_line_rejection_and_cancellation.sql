-- ====================================================================
-- Database Migration: New Line Connection Rejection & Cancellation Support
-- Target Table: custom_new_line_connection_request
-- Module: Customer Service & New Line Connection
-- ====================================================================

SET NAMES utf8mb4;

-- --------------------------------------------------------------------
-- Option A: Standard ALTER TABLE (Compatible with all MySQL / MariaDB)
-- --------------------------------------------------------------------
ALTER TABLE `custom_new_line_connection_request`
    ADD COLUMN `rejection_reason` TEXT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL AFTER `updated_at`,
    ADD COLUMN `rejected_by` VARCHAR(100) NULL AFTER `rejection_reason`,
    ADD COLUMN `rejected_date` DATETIME NULL AFTER `rejected_by`,
    ADD COLUMN `cancellation_reason` TEXT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL AFTER `rejected_date`;

-- Performance composite index for branch & status filtering
CREATE INDEX `idx_cnl_status_branch` ON `custom_new_line_connection_request` (`status`, `branch_id`);

-- --------------------------------------------------------------------
-- Verification Query
-- --------------------------------------------------------------------
DESCRIBE `custom_new_line_connection_request`;
