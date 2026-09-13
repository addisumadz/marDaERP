-- V5__billing_module_performance_indexes.sql
-- High-Performance Composite Indexes for Billing & Meter Reading Module (20K+ Records)

-- 1. Accelerates readingList, billList, and readingmanagement queries
CREATE INDEX IF NOT EXISTS idx_br_period_status_gen_void 
ON billing_reading (kifya_wer, status, is_bill_generated, is_void);

-- 2. Accelerates previous reading and history lookups per customer & period
CREATE INDEX IF NOT EXISTS idx_br_customer_period_status 
ON billing_reading (billing_customer_info_id, kifya_wer, status);

-- 3. Accelerates collection status and unpaid arrears lookups
CREATE INDEX IF NOT EXISTS idx_br_customer_collected 
ON billing_reading (billing_customer_info_id, is_money_collected, status);

-- 4. Accelerates invoice number lookups and duplicate checks
CREATE INDEX IF NOT EXISTS idx_br_invoice_number 
ON billing_reading (invoice_number);

-- 5. Accelerates Wuzif (arrears) unpaid payment links
CREATE INDEX IF NOT EXISTS idx_brw_actual_unpaid 
ON billing_reading_wuzif (billing_reading_id_actual_payment, is_money_collected, deleted);

-- 6. Accelerates Wuzif penalized bill lookups
CREATE INDEX IF NOT EXISTS idx_brw_penalized 
ON billing_reading_wuzif (billing_reading_id_penalized, is_money_collected);

-- 7. Accelerates customer account validation during batch reads and Excel imports
CREATE INDEX IF NOT EXISTS idx_bci_account_status 
ON billing_customer_info (account_number, status);

-- 8. Accelerates tariff rate calculations
CREATE INDEX IF NOT EXISTS idx_bt_custtype_status 
ON billing_tariffs (billing_customer_type_id, status);

-- 9. Accelerates meter rent rate lookups
CREATE INDEX IF NOT EXISTS idx_bmr_type_size_status 
ON billing_meter_rents (billing_customer_type_id, billing_meter_size_id, status);
