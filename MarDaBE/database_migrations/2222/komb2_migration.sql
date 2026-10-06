-- ============================================================================
-- Schema & Data Migration: test_2 -> wbill_jwns9
-- Generated: 2026-10-01
--
-- This script:
--   1. Creates 9 new tables (dependency order)
--   2. Adds 27 new columns to 8 shared tables
--   3. Modifies 7 columns with type changes (2 tables)
--   4. Adds 10 new foreign keys, 11 new indexes
--   5. Notes 13 deleted columns (3 tables) — commented out
--
-- Target: test_2
-- ============================================================================

SET FOREIGN_KEY_CHECKS = 0;
SET NAMES utf8mb4;
SET CHARACTER SET utf8mb4;


-- ############################################################################
-- PART 1: NEW TABLES (9 tables, dependency order)
-- ############################################################################

-- ============================================================================
-- TIER 0: Independent new tables (no FK to other new tables)
-- ============================================================================

-- 1. inv_disposal (0 rows)
DROP TABLE IF EXISTS `inv_disposal`;
CREATE TABLE `inv_disposal` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `disposal_number` varchar(50) NOT NULL,
  `store_id` int(11) NOT NULL,
  `branch_id` int(11) DEFAULT NULL,
  `disposal_type` varchar(30) NOT NULL,
  `disposal_date` date NOT NULL,
  `status` varchar(20) NOT NULL DEFAULT 'DRAFT',
  `total_amount` decimal(15,2) DEFAULT 0.00,
  `workflow_instance_id` bigint(20) DEFAULT NULL,
  `journal_entry_id` bigint(20) DEFAULT NULL,
  `reason` text DEFAULT NULL,
  `disposal_method` varchar(200) DEFAULT NULL,
  `committee_members` varchar(500) DEFAULT NULL,
  `remarks` varchar(500) DEFAULT NULL,
  `created_by` varchar(100) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `disposal_number` (`disposal_number`),
  KEY `branch_id` (`branch_id`),
  KEY `journal_entry_id` (`journal_entry_id`),
  KEY `workflow_instance_id` (`workflow_instance_id`),
  KEY `idx_inv_dsp_status` (`status`),
  KEY `idx_inv_dsp_store` (`store_id`)
) ENGINE=MyISAM DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci;

-- 2. inv_material_request (0 rows)
DROP TABLE IF EXISTS `inv_material_request`;
CREATE TABLE `inv_material_request` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `request_number` varchar(50) NOT NULL,
  `store_id` int(11) NOT NULL,
  `department_id` int(11) DEFAULT NULL,
  `branch_id` int(11) DEFAULT NULL,
  `requested_by` varchar(200) NOT NULL,
  `requested_date` date NOT NULL,
  `needed_by_date` date DEFAULT NULL,
  `priority` varchar(20) NOT NULL DEFAULT 'NORMAL',
  `status` varchar(30) NOT NULL DEFAULT 'DRAFT',
  `purpose` varchar(500) DEFAULT NULL,
  `remarks` varchar(500) DEFAULT NULL,
  `total_estimated_amount` decimal(15,2) DEFAULT 0.00,
  `workflow_instance_id` bigint(20) DEFAULT NULL,
  `issue_voucher_id` bigint(20) DEFAULT NULL,
  `created_by` varchar(100) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `request_number` (`request_number`),
  KEY `issue_voucher_id` (`issue_voucher_id`),
  KEY `workflow_instance_id` (`workflow_instance_id`),
  KEY `idx_inv_mr_status` (`status`),
  KEY `idx_inv_mr_branch` (`branch_id`),
  KEY `idx_inv_mr_store` (`store_id`),
  KEY `idx_inv_mr_dept` (`department_id`)
) ENGINE=MyISAM DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci;

-- 3. inv_return_voucher (0 rows)
DROP TABLE IF EXISTS `inv_return_voucher`;
CREATE TABLE `inv_return_voucher` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `voucher_number` varchar(50) NOT NULL,
  `store_id` int(11) NOT NULL,
  `branch_id` int(11) DEFAULT NULL,
  `return_type` varchar(30) NOT NULL,
  `original_issue_voucher_id` bigint(20) DEFAULT NULL,
  `original_grn_id` bigint(20) DEFAULT NULL,
  `supplier_id` bigint(20) DEFAULT NULL,
  `returned_by` varchar(200) DEFAULT NULL,
  `department` varchar(200) DEFAULT NULL,
  `return_date` date NOT NULL,
  `status` varchar(20) NOT NULL DEFAULT 'DRAFT',
  `approved_by` varchar(100) DEFAULT NULL,
  `approved_date` timestamp NULL DEFAULT NULL,
  `received_by` varchar(100) DEFAULT NULL,
  `total_amount` decimal(15,2) DEFAULT 0.00,
  `journal_entry_id` bigint(20) DEFAULT NULL,
  `reason` varchar(500) DEFAULT NULL,
  `remarks` varchar(500) DEFAULT NULL,
  `created_by` varchar(100) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `voucher_number` (`voucher_number`),
  KEY `branch_id` (`branch_id`),
  KEY `original_grn_id` (`original_grn_id`),
  KEY `supplier_id` (`supplier_id`),
  KEY `journal_entry_id` (`journal_entry_id`),
  KEY `idx_inv_rv_status` (`status`),
  KEY `idx_inv_rv_type` (`return_type`),
  KEY `idx_inv_rv_store` (`store_id`),
  KEY `idx_inv_rv_orig_iv` (`original_issue_voucher_id`)
) ENGINE=MyISAM DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci;

-- 4. inv_stock_count (0 rows)
DROP TABLE IF EXISTS `inv_stock_count`;
CREATE TABLE `inv_stock_count` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `count_number` varchar(50) NOT NULL,
  `store_id` int(11) NOT NULL,
  `branch_id` int(11) DEFAULT NULL,
  `count_date` date NOT NULL,
  `count_scope` varchar(20) NOT NULL DEFAULT 'FULL',
  `category_filter_id` int(11) DEFAULT NULL,
  `status` varchar(20) NOT NULL DEFAULT 'PLANNED',
  `counted_by` varchar(100) DEFAULT NULL,
  `verified_by` varchar(100) DEFAULT NULL,
  `verified_date` timestamp NULL DEFAULT NULL,
  `total_system_value` decimal(15,2) DEFAULT 0.00,
  `total_physical_value` decimal(15,2) DEFAULT 0.00,
  `total_variance_value` decimal(15,2) DEFAULT 0.00,
  `stock_adjustment_id` bigint(20) DEFAULT NULL,
  `remarks` varchar(500) DEFAULT NULL,
  `created_by` varchar(100) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `count_number` (`count_number`),
  KEY `branch_id` (`branch_id`),
  KEY `category_filter_id` (`category_filter_id`),
  KEY `stock_adjustment_id` (`stock_adjustment_id`),
  KEY `idx_inv_sc_status` (`status`),
  KEY `idx_inv_sc_store` (`store_id`)
) ENGINE=MyISAM DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci;

-- 5. inv_store_user (2 rows, FK: inv_store, user_account)
DROP TABLE IF EXISTS `inv_store_user`;
CREATE TABLE `inv_store_user` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `store_id` int(11) NOT NULL,
  `user_account_id` int(11) NOT NULL,
  `role_in_store` varchar(50) DEFAULT 'STORE_KEEPER',
  `is_primary` tinyint(1) DEFAULT 0,
  `is_active` tinyint(1) DEFAULT 1,
  `assigned_by` varchar(100) DEFAULT NULL,
  `assigned_date` datetime DEFAULT current_timestamp(),
  `notes` text DEFAULT NULL,
  `created_at` datetime DEFAULT current_timestamp(),
  `updated_at` datetime DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `idx_store_user_store` (`store_id`),
  KEY `idx_store_user_account` (`user_account_id`),
  CONSTRAINT `fk_inv_store_user_account` FOREIGN KEY (`user_account_id`) REFERENCES `user_account` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_inv_store_user_store` FOREIGN KEY (`store_id`) REFERENCES `inv_store` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;



-- ============================================================================
-- TIER 1: Child tables (FK to Tier 0 parents)
-- ============================================================================

-- 6. inv_disposal_line (0 rows)
DROP TABLE IF EXISTS `inv_disposal_line`;
CREATE TABLE `inv_disposal_line` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `disposal_id` bigint(20) NOT NULL,
  `item_id` bigint(20) NOT NULL,
  `line_order` int(11) NOT NULL DEFAULT 1,
  `quantity` decimal(15,4) NOT NULL,
  `unit_cost` decimal(15,4) DEFAULT 0.0000,
  `total_cost` decimal(15,2) DEFAULT 0.00,
  `reason` varchar(500) DEFAULT NULL,
  `remarks` varchar(500) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `disposal_id` (`disposal_id`),
  KEY `item_id` (`item_id`)
) ENGINE=MyISAM DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci;

-- 7. inv_material_request_line (0 rows)
DROP TABLE IF EXISTS `inv_material_request_line`;
CREATE TABLE `inv_material_request_line` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `material_request_id` bigint(20) NOT NULL,
  `item_id` bigint(20) NOT NULL,
  `line_order` int(11) NOT NULL DEFAULT 1,
  `requested_quantity` decimal(15,4) NOT NULL,
  `approved_quantity` decimal(15,4) DEFAULT NULL,
  `issued_quantity` decimal(15,4) DEFAULT 0.0000,
  `estimated_unit_cost` decimal(15,4) DEFAULT 0.0000,
  `remarks` varchar(500) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `material_request_id` (`material_request_id`),
  KEY `item_id` (`item_id`)
) ENGINE=MyISAM DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci;

-- 8. inv_return_voucher_line (0 rows)
DROP TABLE IF EXISTS `inv_return_voucher_line`;
CREATE TABLE `inv_return_voucher_line` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `return_voucher_id` bigint(20) NOT NULL,
  `item_id` bigint(20) NOT NULL,
  `line_order` int(11) NOT NULL DEFAULT 1,
  `quantity` decimal(15,4) NOT NULL,
  `unit_cost` decimal(15,4) DEFAULT 0.0000,
  `total_cost` decimal(15,2) DEFAULT 0.00,
  `condition_status` varchar(30) DEFAULT 'GOOD',
  `remarks` varchar(500) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `return_voucher_id` (`return_voucher_id`),
  KEY `item_id` (`item_id`)
) ENGINE=MyISAM DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci;

-- 9. inv_stock_count_line (0 rows)
DROP TABLE IF EXISTS `inv_stock_count_line`;
CREATE TABLE `inv_stock_count_line` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `stock_count_id` bigint(20) NOT NULL,
  `item_id` bigint(20) NOT NULL,
  `system_quantity` decimal(15,4) NOT NULL,
  `physical_quantity` decimal(15,4) DEFAULT NULL,
  `variance_quantity` decimal(15,4) DEFAULT NULL,
  `unit_cost` decimal(15,4) DEFAULT 0.0000,
  `variance_value` decimal(15,2) DEFAULT 0.00,
  `is_counted` tinyint(1) NOT NULL DEFAULT 0,
  `remarks` varchar(500) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `stock_count_id` (`stock_count_id`),
  KEY `item_id` (`item_id`)
) ENGINE=MyISAM DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci;


-- ############################################################################
-- PART 2: NEW COLUMNS ON SHARED TABLES (27 columns across 8 tables)
-- ############################################################################

-- -------------------------------------------------------
-- 2.1 custom_common_material — 1 new column
-- -------------------------------------------------------
ALTER TABLE `custom_common_material`
  ADD COLUMN `is_water_meter` tinyint(1) NOT NULL DEFAULT 0 AFTER `updated_at`;

-- -------------------------------------------------------
-- 2.2 custom_maintenance_common_material — 1 new column
-- -------------------------------------------------------
ALTER TABLE `custom_maintenance_common_material`
  ADD COLUMN `is_water_meter` tinyint(1) NOT NULL DEFAULT 0 AFTER `updated_at`;

-- -------------------------------------------------------
-- 2.3 custom_maintenance_item — 1 new column
-- -------------------------------------------------------
ALTER TABLE `custom_maintenance_item`
  ADD COLUMN `is_water_meter` tinyint(1) NOT NULL DEFAULT 0 AFTER `remarks`;

-- -------------------------------------------------------
-- 2.4 custom_maintenance_request — 4 new columns
-- -------------------------------------------------------
ALTER TABLE `custom_maintenance_request`
  ADD COLUMN `rejection_reason` text DEFAULT NULL AFTER `updated_at`,
  ADD COLUMN `rejected_by` varchar(100) DEFAULT NULL AFTER `rejection_reason`,
  ADD COLUMN `rejected_date` datetime DEFAULT NULL AFTER `rejected_by`,
  ADD COLUMN `cancellation_reason` text DEFAULT NULL AFTER `rejected_date`;

-- -------------------------------------------------------
-- 2.5 custom_new_line_connection_request — 4 new columns
-- -------------------------------------------------------
ALTER TABLE `custom_new_line_connection_request`
  ADD COLUMN `rejection_reason` text DEFAULT NULL AFTER `updated_at`,
  ADD COLUMN `rejected_by` varchar(100) DEFAULT NULL AFTER `rejection_reason`,
  ADD COLUMN `rejected_date` datetime DEFAULT NULL AFTER `rejected_by`,
  ADD COLUMN `cancellation_reason` text DEFAULT NULL AFTER `rejected_date`;

-- -------------------------------------------------------
-- 2.6 custom_new_line_item — 1 new column
-- -------------------------------------------------------
ALTER TABLE `custom_new_line_item`
  ADD COLUMN `is_water_meter` tinyint(1) NOT NULL DEFAULT 0 AFTER `remarks`;

-- -------------------------------------------------------
-- 2.7 fnce_general_journal — 8 new columns
-- -------------------------------------------------------
ALTER TABLE `fnce_general_journal`
  ADD COLUMN `fnce_wulo_abel_meteyekia_header_id` int(11) DEFAULT NULL AFTER `deleted`,
  ADD COLUMN `fnce_guzo_wechi_mawerareja_header_id` int(11) DEFAULT NULL AFTER `fnce_wulo_abel_meteyekia_header_id`,
  ADD COLUMN `fnce_asset_delivery_form_header_id` int(11) DEFAULT NULL AFTER `fnce_guzo_wechi_mawerareja_header_id`,
  ADD COLUMN `fnce_petty_cash_request_header_id` int(11) DEFAULT NULL AFTER `fnce_asset_delivery_form_header_id`,
  ADD COLUMN `fnce_payment_voucher_line_id` int(11) DEFAULT NULL AFTER `fnce_petty_cash_request_header_id`,
  ADD COLUMN `is_posted` tinyint(1) NOT NULL AFTER `fnce_payment_voucher_line_id`,
  ADD COLUMN `is_closed` tinyint(1) NOT NULL AFTER `is_posted`,
  ADD COLUMN `narration` text DEFAULT NULL AFTER `is_closed`;

-- -------------------------------------------------------
-- 2.8 inv_issue_voucher — 1 new column
-- -------------------------------------------------------
ALTER TABLE `inv_issue_voucher`
  ADD COLUMN `material_request_id` bigint(20) DEFAULT NULL AFTER `updated_at`;

-- -------------------------------------------------------
-- 2.9 inv_item — 2 new columns
-- -------------------------------------------------------
ALTER TABLE `inv_item`
  ADD COLUMN `vat_rate` decimal(5,2) DEFAULT 15.00 AFTER `default_unit_cost`,
  ADD COLUMN `is_water_meter` tinyint(1) NOT NULL DEFAULT 0 AFTER `updated_at`;

-- -------------------------------------------------------
-- 2.10 inv_purchase_order — 3 new columns
-- -------------------------------------------------------
ALTER TABLE `inv_purchase_order`
  ADD COLUMN `rejected_by` varchar(100) DEFAULT NULL AFTER `remarks`,
  ADD COLUMN `rejected_date` datetime DEFAULT NULL AFTER `rejected_by`,
  ADD COLUMN `rejection_reason` varchar(500) DEFAULT NULL AFTER `rejected_date`;

-- -------------------------------------------------------
-- 2.11 inv_purchase_order_line — 2 new columns
-- -------------------------------------------------------
ALTER TABLE `inv_purchase_order_line`
  ADD COLUMN `vat_rate` decimal(5,2) DEFAULT 15.00 AFTER `total_price`,
  ADD COLUMN `vat_amount` decimal(15,2) DEFAULT 0.00 AFTER `vat_rate`;


-- ############################################################################
-- PART 3: COLUMN TYPE CHANGES (7 columns across 3 tables)
-- ############################################################################

-- -------------------------------------------------------
-- 3.1 billing_reading — 2 type changes (double -> varchar)
-- -------------------------------------------------------
ALTER TABLE `billing_reading`
  MODIFY COLUMN `m_billing_additional_payment_1_value_lable` varchar(255) DEFAULT NULL,
  MODIFY COLUMN `m_billing_additional_payment_2_value_lable` varchar(255) DEFAULT NULL;

-- -------------------------------------------------------
-- 3.2 company_profile — 4 type changes (double -> varchar)
-- -------------------------------------------------------
ALTER TABLE `company_profile`
  MODIFY COLUMN `m_billing_additional_payment_1_value_lable` varchar(200) DEFAULT NULL,
  MODIFY COLUMN `m_billing_additional_payment_1_value_option` varchar(50) DEFAULT NULL,
  MODIFY COLUMN `m_billing_additional_payment_2_value_lable` varchar(200) DEFAULT NULL,
  MODIFY COLUMN `m_billing_additional_payment_2_value_option` varchar(50) DEFAULT NULL;

-- -------------------------------------------------------
-- 3.3 inv_purchase_requisition — ENUM expanded (added 'APPROVED')
-- -------------------------------------------------------
ALTER TABLE `inv_purchase_requisition`
  MODIFY COLUMN `status` enum('DRAFT','SUBMITTED','APPROVED_L1','APPROVED_L2','APPROVED','REJECTED','CONVERTED_TO_PO','CANCELLED');


-- ############################################################################
-- PART 4: NEW INDEXES (11 indexes)
-- ############################################################################

-- custom_new_line_connection_request
ALTER TABLE `custom_new_line_connection_request`
  ADD INDEX `idx_cnl_status_branch` (`status`, `branch_id`);

-- fnce_general_journal — FK indexes for new columns
ALTER TABLE `fnce_general_journal`
  ADD INDEX `fnce_wulo_abel_meteyekia_header_id` (`fnce_wulo_abel_meteyekia_header_id`),
  ADD INDEX `fnce_guzo_wechi_mawerareja_header_id` (`fnce_guzo_wechi_mawerareja_header_id`),
  ADD INDEX `fnce_asset_delivery_form_header_id` (`fnce_asset_delivery_form_header_id`),
  ADD INDEX `fnce_petty_cash_request_header_id` (`fnce_petty_cash_request_header_id`),
  ADD INDEX `fnce_payment_voucher_line_id` (`fnce_payment_voucher_line_id`);


-- ############################################################################
-- PART 5: NEW FOREIGN KEYS (10 FKs on fnce_general_journal)
-- ############################################################################

ALTER TABLE `fnce_general_journal`
  ADD CONSTRAINT `fnce_general_journal_ibfk_8` FOREIGN KEY (`fnce_wulo_abel_meteyekia_header_id`) REFERENCES `fnce_wulo_abel_meteyekia_header` (`id`),
  ADD CONSTRAINT `fnce_general_journal_ibfk_9` FOREIGN KEY (`fnce_asset_delivery_form_header_id`) REFERENCES `fnce_asset_delivery_form_header` (`id`),
  ADD CONSTRAINT `fnce_general_journal_ibfk_11` FOREIGN KEY (`fnce_petty_cash_request_header_id`) REFERENCES `fnce_petty_cash_request_header` (`id`),
  ADD CONSTRAINT `fnce_general_journal_ibfk_12` FOREIGN KEY (`fnce_guzo_wechi_mawerareja_header_id`) REFERENCES `fnce_guzo_wechi_mawerareja_header` (`id`),
  ADD CONSTRAINT `fnce_general_journal_ibfk_17` FOREIGN KEY (`fnce_payment_voucher_line_id`) REFERENCES `fnce_payment_voucher_line` (`id`);


-- ############################################################################
-- PART 6: DELETED COLUMNS (13 columns from 3 tables)
-- Uncomment if you want to drop them from test_2
-- ############################################################################

-- custom_common_material: 5 columns replaced by inv_item FK
-- ALTER TABLE `custom_common_material`
--   DROP COLUMN `material_code`,
--   DROP COLUMN `material_name`,
--   DROP COLUMN `material_name_am`,
--   DROP COLUMN `unit_of_measure`,
--   DROP COLUMN `default_unit_price`;

-- custom_maintenance_common_material: 5 columns replaced by inv_item FK
-- ALTER TABLE `custom_maintenance_common_material`
--   DROP COLUMN `material_code`,
--   DROP COLUMN `material_name`,
--   DROP COLUMN `material_name_am`,
--   DROP COLUMN `unit_of_measure`,
--   DROP COLUMN `default_unit_price`;

-- fnce_budget_year: 3 columns removed
-- ALTER TABLE `fnce_budget_year`
--   DROP COLUMN `is_active_budget_year`,
--   DROP COLUMN `total_number_of_burst_pips`,
--   DROP COLUMN `total_length_of_distribution_network`;


-- ============================================================================
SET FOREIGN_KEY_CHECKS = 1;
-- ============================================================================
-- MIGRATION COMPLETE
--
-- Summary:
--   - 9 new tables created (inv_disposal, inv_disposal_line,
--     inv_material_request, inv_material_request_line,
--     inv_return_voucher, inv_return_voucher_line,
--     inv_stock_count, inv_stock_count_line, inv_store_user)
--   - 27 new columns across 8 shared tables
--   - 7 column type modifications across 3 tables
--   - 11 new indexes
--   - 5 new foreign keys on fnce_general_journal
--   - 13 deleted columns (commented out, from 3 tables)
-- ============================================================================
