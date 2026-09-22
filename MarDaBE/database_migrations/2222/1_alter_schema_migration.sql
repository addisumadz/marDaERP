-- ============================================================================
-- Schema Migration: wbill_jwns_old -> wbill_jwns9 (Shared Tables)
-- Generated: 2026-09-17
-- 
-- This script adds new columns, indexes, foreign keys, and updates views
-- that exist in wbill_jwns9 but are missing from wbill_jwns_old.
--
-- Target: wbill_jwns_old (or your target database)
-- ============================================================================

SET FOREIGN_KEY_CHECKS = 0;
SET NAMES utf8mb4;

-- ============================================================================
-- SECTION 1: NEW COLUMNS - billing_reading (20 new columns)
-- ============================================================================

-- 1.1 Additional payment columns (after techemari_kfya)
ALTER TABLE `billing_reading`
  ADD COLUMN `m_billing_additional_payment_1_value` double DEFAULT NULL AFTER `techemari_kfya`,
  ADD COLUMN `m_billing_additional_payment_1_value_lable` varchar(255) DEFAULT NULL AFTER `m_billing_additional_payment_1_value`,
  ADD COLUMN `m_billing_additional_payment_2_value` double DEFAULT NULL AFTER `m_billing_additional_payment_1_value_lable`,
  ADD COLUMN `m_billing_additional_payment_2_value_lable` varchar(255) DEFAULT NULL AFTER `m_billing_additional_payment_2_value`,
  ADD COLUMN `m_billing_additional_payment_1_wuzif` double DEFAULT NULL AFTER `m_billing_additional_payment_2_value_lable`,
  ADD COLUMN `m_billing_additional_payment_2_wuzif` double DEFAULT NULL AFTER `m_billing_additional_payment_1_wuzif`;

-- 1.2 Reader GPS & MardaArif bank integration columns (after bill_description_bank)
ALTER TABLE billing_reading ADD COLUMN reader_gps VARCHAR(255) NULL AFTER bill_description_bank;
ALTER TABLE `billing_reading`
  ADD COLUMN `is_send_to_bank_mardaarif` tinyint(1) DEFAULT 0 AFTER `reader_gps`,
  ADD COLUMN `is_bank_canceled_mardaarif` tinyint(1) DEFAULT 0 AFTER `is_send_to_bank_mardaarif`,
  ADD COLUMN `is_mardaarif_paid` tinyint(1) DEFAULT 0 AFTER `is_bank_canceled_mardaarif`,
  ADD COLUMN `m_bank_paid_agent_id` varchar(255) DEFAULT NULL AFTER `is_mardaarif_paid`,
  ADD COLUMN `m_bank_paid_confirmation_code` varchar(255) DEFAULT NULL AFTER `m_bank_paid_agent_id`,
  ADD COLUMN `m_money_collected_date` date DEFAULT NULL AFTER `m_bank_paid_confirmation_code`,
  ADD COLUMN `m_bank_due_date` date DEFAULT NULL AFTER `m_money_collected_date`,
  ADD COLUMN `m_bank_upload_date` date DEFAULT NULL AFTER `m_bank_due_date`,
  ADD COLUMN `m_billing_bank_id` int(11) DEFAULT NULL AFTER `m_bank_upload_date`;

-- 1.3 Journal integration columns (after m_billing_bank_id)
ALTER TABLE `billing_reading`
  ADD COLUMN `is_journal_pushed` tinyint(1) DEFAULT 0 AFTER `m_billing_bank_id`,
  ADD COLUMN `journal_entry_ref` varchar(100) DEFAULT NULL AFTER `is_journal_pushed`,
  ADD COLUMN `is_paid_journal_pushed` tinyint(1) DEFAULT 0 AFTER `journal_entry_ref`,
  ADD COLUMN `paid_journal_entry_ref` varchar(100) DEFAULT NULL AFTER `is_paid_journal_pushed`;


-- ============================================================================
-- SECTION 2: NEW COLUMNS - company_profile (10 new columns)
-- ============================================================================

ALTER TABLE `company_profile`
  ADD COLUMN `is_connected_to_mardaarif` tinyint(1) NOT NULL DEFAULT 0 AFTER `total_number_of_full_time_staff`,
  ADD COLUMN `m_company_uri` varchar(200) DEFAULT NULL AFTER `is_connected_to_mardaarif`,
  ADD COLUMN `m_company_file_url` varchar(100) DEFAULT NULL AFTER `m_company_uri`,
  ADD COLUMN `m_company_key` varchar(400) DEFAULT NULL AFTER `m_company_file_url`,
  ADD COLUMN `m_billing_additional_payment_1_value_lable` varchar(200) DEFAULT NULL AFTER `m_company_key`,
  ADD COLUMN `m_billing_additional_payment_1_value` double DEFAULT NULL AFTER `m_billing_additional_payment_1_value_lable`,
  ADD COLUMN `m_billing_additional_payment_1_value_option` varchar(50) DEFAULT NULL AFTER `m_billing_additional_payment_1_value`,
  ADD COLUMN `m_billing_additional_payment_2_value_lable` varchar(200) DEFAULT NULL AFTER `m_billing_additional_payment_1_value_option`,
  ADD COLUMN `m_billing_additional_payment_2_value` double DEFAULT NULL AFTER `m_billing_additional_payment_2_value_lable`,
  ADD COLUMN `m_billing_additional_payment_2_value_option` varchar(50) DEFAULT NULL AFTER `m_billing_additional_payment_2_value`;


-- ============================================================================
-- SECTION 3: NEW INDEXES - billing_customer_info (2 indexes)
-- ============================================================================

ALTER TABLE `billing_customer_info`
  ADD INDEX `idx_bci_account_number` (`account_number`),
  ADD INDEX `idx_bci_account_status` (`account_number`, `status`);


-- ============================================================================
-- SECTION 4: NEW INDEXES - billing_invoice_numbers (1 index)
-- ============================================================================

ALTER TABLE `billing_invoice_numbers`
  ADD INDEX `idx_bin_invoicenum` (`invoice_numbers`);


-- ============================================================================
-- SECTION 5: NEW INDEXES - billing_meter_rent (1 index)
-- ============================================================================

ALTER TABLE `billing_meter_rent`
  ADD INDEX `idx_bmr_type_size_status` (`billing_customer_type_id`, `meter_size_id`, `status`);


-- ============================================================================
-- SECTION 6: NEW INDEXES - billing_reading (5 indexes + FK index)
-- ============================================================================

-- Performance indexes
ALTER TABLE `billing_reading`
  ADD INDEX `idx_billing_reading_journal_pushed` (`kifya_wer`, `is_journal_pushed`, `is_void`, `is_bill_generated`),
  ADD INDEX `idx_br_customer_collected` (`customer_info_id`, `is_money_collected`, `status`),
  ADD INDEX `idx_br_customer_period_status` (`customer_info_id`, `kifya_wer`, `status`),
  ADD INDEX `idx_br_invoice_number` (`invoice_number`),
  ADD INDEX `idx_br_period_status_gen_void` (`kifya_wer`, `status`, `is_bill_generated`, `is_void`);


-- ============================================================================
-- SECTION 7: NEW INDEXES - billing_reading_wuzif (2 indexes)
-- ============================================================================

ALTER TABLE `billing_reading_wuzif`
  ADD INDEX `idx_brw_actual_unpaid` (`billing_reading_id_actual_payment`, `is_money_collected`, `deleted`),
  ADD INDEX `idx_brw_penalized` (`billing_reading_id_penalized`, `is_money_collected`);


-- ============================================================================
-- SECTION 8: NEW INDEXES - billing_tarrif (1 index)
-- ============================================================================

ALTER TABLE `billing_tarrif`
  ADD INDEX `idx_bt_custtype_status` (`customer_type_id`, `status`);


-- ============================================================================
-- SECTION 9: NEW FOREIGN KEY - billing_reading -> billing_banks
-- ============================================================================

-- FK: billing_reading.m_billing_bank_id -> billing_banks.id
ALTER TABLE `billing_reading`
  ADD CONSTRAINT `fk_billing_reading_m_billing_bank`
  FOREIGN KEY (`m_billing_bank_id`) REFERENCES `billing_banks` (`id`);


-- ============================================================================
-- SECTION 10: UPDATED VIEWS (5 views with new definitions)
-- ============================================================================

-- 10.1 view_sales_last_week
DROP VIEW IF EXISTS `view_sales_last_week`;
CREATE ALGORITHM=UNDEFINED DEFINER=`root`@`localhost` SQL SECURITY DEFINER VIEW `view_sales_last_week` AS 
SELECT sum(`sales`.`total_after_vat`) AS `lastweeksummery` 
FROM `sales` 
WHERE cast(`sales`.`sales_date` as date) >= cast(curdate() - interval 1 week + interval -weekday(curdate() - interval 1 week) - 0 day as date) 
  AND cast(`sales`.`sales_date` as date) <= cast(curdate() - interval 1 week + interval -weekday(curdate() - interval 1 week) - 0 day + interval 6 day as date) 
  AND `sales`.`deleted` = 'active';

-- 10.2 view_sales_this_month
DROP VIEW IF EXISTS `view_sales_this_month`;
CREATE ALGORITHM=UNDEFINED DEFINER=`root`@`localhost` SQL SECURITY DEFINER VIEW `view_sales_this_month` AS 
SELECT sum(`sales`.`total_after_vat`) AS `thismonthsummery` 
FROM `sales` 
WHERE month(`sales`.`sales_date`) = month(curdate()) 
  AND year(`sales`.`sales_date`) = year(curdate()) 
  AND `sales`.`deleted` = 'active';

-- 10.3 view_sales_this_week
DROP VIEW IF EXISTS `view_sales_this_week`;
CREATE ALGORITHM=UNDEFINED DEFINER=`root`@`localhost` SQL SECURITY DEFINER VIEW `view_sales_this_week` AS 
SELECT sum(`sales`.`total_after_vat`) AS `thisweeksales` 
FROM `sales` 
WHERE cast(`sales`.`sales_date` as date) >= cast(curdate() + interval -weekday(curdate()) - 0 day as date) 
  AND 0 <> cast(curdate() + interval -weekday(curdate()) - 0 day + interval 6 day as date) 
  AND `sales`.`deleted` = 'active';

-- 10.4 view_sales_this_year
DROP VIEW IF EXISTS `view_sales_this_year`;
CREATE ALGORITHM=UNDEFINED DEFINER=`root`@`localhost` SQL SECURITY DEFINER VIEW `view_sales_this_year` AS 
SELECT sum(`sales`.`total_after_vat`) AS `thismonthsummery` 
FROM `sales` 
WHERE year(`sales`.`sales_date`) = year(curdate()) 
  AND `sales`.`deleted` = 'active';

-- 10.5 view_sales_today_summery
DROP VIEW IF EXISTS `view_sales_today_summery`;
CREATE ALGORITHM=UNDEFINED DEFINER=`root`@`localhost` SQL SECURITY DEFINER VIEW `view_sales_today_summery` AS 
SELECT sum(`sales`.`total_after_vat`) AS `todaysummery` 
FROM `sales` 
WHERE cast(`sales`.`sales_date` as date) = curdate() 
  AND `sales`.`deleted` = 'active';


-- ============================================================================
-- RE-ENABLE FOREIGN KEY CHECKS
-- ============================================================================

SET FOREIGN_KEY_CHECKS = 1;

-- ============================================================================
-- MIGRATION COMPLETE
-- 
-- Summary of changes:
--   - billing_reading:        20 new columns, 5 new indexes, 1 new FK
--   - company_profile:        10 new columns
--   - billing_customer_info:  2 new indexes
--   - billing_invoice_numbers: 1 new index
--   - billing_meter_rent:     1 new index
--   - billing_reading_wuzif:  2 new indexes
--   - billing_tarrif:         1 new index
--   - 5 views updated with new definitions
-- ============================================================================
