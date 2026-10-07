-- ============================================================================
-- Schema Migration: wbill_jw_old -> wbill_jwns9
-- PART A: ALTER existing tables (columns, indexes, FKs, views)
-- Generated: 2026-10-07
--
-- Target: wbill_jw_old
-- ============================================================================

SET FOREIGN_KEY_CHECKS = 0;
SET NAMES utf8mb4;

-- ============================================================================
-- SECTION 1: NEW COLUMNS (31 columns across 3 tables)
-- ============================================================================

-- -------------------------------------------------------
-- 1.1 billing_reading — 20 new columns
-- -------------------------------------------------------

-- Additional payment columns
ALTER TABLE `billing_reading`
  ADD COLUMN `m_billing_additional_payment_1_value` double DEFAULT NULL AFTER `techemari_kfya`,
  ADD COLUMN `m_billing_additional_payment_1_value_lable` varchar(255) DEFAULT NULL AFTER `m_billing_additional_payment_1_value`,
  ADD COLUMN `m_billing_additional_payment_2_value` double DEFAULT NULL AFTER `m_billing_additional_payment_1_value_lable`,
  ADD COLUMN `m_billing_additional_payment_2_value_lable` varchar(255) DEFAULT NULL AFTER `m_billing_additional_payment_2_value`,
  ADD COLUMN `m_billing_additional_payment_1_wuzif` double DEFAULT NULL AFTER `m_billing_additional_payment_2_value_lable`,
  ADD COLUMN `m_billing_additional_payment_2_wuzif` double DEFAULT NULL AFTER `m_billing_additional_payment_1_wuzif`;

-- Reader GPS & MardaArif bank integration
ALTER TABLE `billing_reading`
  ADD COLUMN `reader_gps` varchar(255) DEFAULT NULL AFTER `bill_description_bank`,
  ADD COLUMN `is_send_to_bank_mardaarif` tinyint(1) DEFAULT 0 AFTER `reader_gps`,
  ADD COLUMN `is_bank_canceled_mardaarif` tinyint(1) DEFAULT 0 AFTER `is_send_to_bank_mardaarif`,
  ADD COLUMN `is_mardaarif_paid` tinyint(1) DEFAULT 0 AFTER `is_bank_canceled_mardaarif`,
  ADD COLUMN `m_bank_paid_agent_id` varchar(255) DEFAULT NULL AFTER `is_mardaarif_paid`,
  ADD COLUMN `m_bank_paid_confirmation_code` varchar(255) DEFAULT NULL AFTER `m_bank_paid_agent_id`,
  ADD COLUMN `m_money_collected_date` date DEFAULT NULL AFTER `m_bank_paid_confirmation_code`,
  ADD COLUMN `m_bank_due_date` date DEFAULT NULL AFTER `m_money_collected_date`,
  ADD COLUMN `m_bank_upload_date` date DEFAULT NULL AFTER `m_bank_due_date`,
  ADD COLUMN `m_billing_bank_id` int(11) DEFAULT NULL AFTER `m_bank_upload_date`;

-- Journal integration
ALTER TABLE `billing_reading`
  ADD COLUMN `is_journal_pushed` tinyint(1) DEFAULT 0 AFTER `m_billing_bank_id`,
  ADD COLUMN `journal_entry_ref` varchar(100) DEFAULT NULL AFTER `is_journal_pushed`,
  ADD COLUMN `is_paid_journal_pushed` tinyint(1) DEFAULT 0 AFTER `journal_entry_ref`,
  ADD COLUMN `paid_journal_entry_ref` varchar(100) DEFAULT NULL AFTER `is_paid_journal_pushed`;


-- -------------------------------------------------------
-- 1.2 company_profile — 10 new columns
-- -------------------------------------------------------
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


-- -------------------------------------------------------
-- 1.3 user_account — 1 new column
-- -------------------------------------------------------
ALTER TABLE `user_account`
  ADD COLUMN `employee_id` int(11) DEFAULT NULL AFTER `role_id`;


-- ============================================================================
-- SECTION 2: NEW INDEXES (14 indexes across 5 tables)
-- ============================================================================

-- billing_customer_info
ALTER TABLE `billing_customer_info`
  ADD INDEX `idx_bci_account_number` (`account_number`),
  ADD INDEX `idx_bci_account_status` (`account_number`, `status`);

-- billing_invoice_numbers
ALTER TABLE `billing_invoice_numbers`
  ADD INDEX `idx_bin_invoicenum` (`invoice_numbers`);

-- billing_meter_rent
ALTER TABLE `billing_meter_rent`
  ADD INDEX `idx_bmr_type_size_status` (`billing_customer_type_id`, `meter_size_id`, `status`);

-- billing_reading
ALTER TABLE `billing_reading`
  ADD INDEX `idx_billing_reading_journal_pushed` (`kifya_wer`, `is_journal_pushed`, `is_void`, `is_bill_generated`),
  ADD INDEX `idx_br_customer_collected` (`customer_info_id`, `is_money_collected`, `status`),
  ADD INDEX `idx_br_customer_period_status` (`customer_info_id`, `kifya_wer`, `status`),
  ADD INDEX `idx_br_invoice_number` (`invoice_number`),
  ADD INDEX `idx_br_period_status_gen_void` (`kifya_wer`, `status`, `is_bill_generated`, `is_void`);

-- billing_reading_wuzif
ALTER TABLE `billing_reading_wuzif`
  ADD INDEX `idx_brw_actual_unpaid` (`billing_reading_id_actual_payment`, `is_money_collected`, `deleted`),
  ADD INDEX `idx_brw_penalized` (`billing_reading_id_penalized`, `is_money_collected`);

-- billing_tarrif
ALTER TABLE `billing_tarrif`
  ADD INDEX `idx_bt_custtype_status` (`customer_type_id`, `status`);

-- user_account
ALTER TABLE `user_account`
  ADD INDEX `idx_user_account_employee` (`employee_id`);


-- ============================================================================
-- SECTION 3: NEW FOREIGN KEYS (2 FKs)
-- ============================================================================

-- billing_reading -> billing_banks
ALTER TABLE `billing_reading`
  ADD CONSTRAINT `fk_billing_reading_m_billing_bank`
  FOREIGN KEY (`m_billing_bank_id`) REFERENCES `billing_banks` (`id`);

-- user_account -> hrms_employee_info (new table, import new tables FIRST)
ALTER TABLE `user_account`
  ADD CONSTRAINT `fk_user_account_employee`
  FOREIGN KEY (`employee_id`) REFERENCES `hrms_employee_info` (`id`);


-- ============================================================================
-- SECTION 4: UPDATED VIEWS (5 views)
-- ============================================================================

DROP VIEW IF EXISTS `view_sales_last_week`;
CREATE ALGORITHM=UNDEFINED DEFINER=`root`@`localhost` SQL SECURITY DEFINER VIEW `view_sales_last_week` AS 
SELECT sum(`sales`.`total_after_vat`) AS `lastweeksummery` 
FROM `sales` 
WHERE cast(`sales`.`sales_date` as date) >= cast(curdate() - interval 1 week + interval -weekday(curdate() - interval 1 week) - 0 day as date) 
  AND cast(`sales`.`sales_date` as date) <= cast(curdate() - interval 1 week + interval -weekday(curdate() - interval 1 week) - 0 day + interval 6 day as date) 
  AND `sales`.`deleted` = 'active';

DROP VIEW IF EXISTS `view_sales_this_month`;
CREATE ALGORITHM=UNDEFINED DEFINER=`root`@`localhost` SQL SECURITY DEFINER VIEW `view_sales_this_month` AS 
SELECT sum(`sales`.`total_after_vat`) AS `thismonthsummery` 
FROM `sales` 
WHERE month(`sales`.`sales_date`) = month(curdate()) 
  AND year(`sales`.`sales_date`) = year(curdate()) 
  AND `sales`.`deleted` = 'active';

DROP VIEW IF EXISTS `view_sales_this_week`;
CREATE ALGORITHM=UNDEFINED DEFINER=`root`@`localhost` SQL SECURITY DEFINER VIEW `view_sales_this_week` AS 
SELECT sum(`sales`.`total_after_vat`) AS `thisweeksales` 
FROM `sales` 
WHERE cast(`sales`.`sales_date` as date) >= cast(curdate() + interval -weekday(curdate()) - 0 day as date) 
  AND 0 <> cast(curdate() + interval -weekday(curdate()) - 0 day + interval 6 day as date) 
  AND `sales`.`deleted` = 'active';

DROP VIEW IF EXISTS `view_sales_this_year`;
CREATE ALGORITHM=UNDEFINED DEFINER=`root`@`localhost` SQL SECURITY DEFINER VIEW `view_sales_this_year` AS 
SELECT sum(`sales`.`total_after_vat`) AS `thismonthsummery` 
FROM `sales` 
WHERE year(`sales`.`sales_date`) = year(curdate()) 
  AND `sales`.`deleted` = 'active';

DROP VIEW IF EXISTS `view_sales_today_summery`;
CREATE ALGORITHM=UNDEFINED DEFINER=`root`@`localhost` SQL SECURITY DEFINER VIEW `view_sales_today_summery` AS 
SELECT sum(`sales`.`total_after_vat`) AS `todaysummery` 
FROM `sales` 
WHERE cast(`sales`.`sales_date` as date) = curdate() 
  AND `sales`.`deleted` = 'active';


-- ============================================================================
SET FOREIGN_KEY_CHECKS = 1;
-- ============================================================================
-- MIGRATION PART A COMPLETE
--
-- Summary:
--   - 31 new columns (billing_reading: 20, company_profile: 10, user_account: 1)
--   - 14 new indexes across 6 tables
--   - 2 new foreign keys
--   - 5 views updated
--   - 0 column type changes
--   - 0 deleted columns
--   - 0 nullable/default changes
--
-- IMPORTANT: Import PART B (jw_old_new_tables_export.sql) BEFORE running
-- the user_account FK, since it references hrms_employee_info (new table).
-- ============================================================================
