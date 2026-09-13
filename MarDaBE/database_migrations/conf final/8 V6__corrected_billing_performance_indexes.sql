-- V6__corrected_billing_performance_indexes.sql
-- High-Performance Composite Indexes for Billing & Meter Reading Module (20K+ Scale)
-- Target Database: wbill_jwns9 (MySQL 5.7+ / MySQL 8.0 / MySQL 9.0)

-- 1. Accelerates readingList, billList, and readingmanagement queries (kifya_wer, status, is_bill_generated, is_void)
CREATE INDEX idx_br_period_status_gen_void 
ON billing_reading (kifya_wer, status, is_bill_generated, is_void);

-- 2. Accelerates customer period lookups and previous reading searches
CREATE INDEX idx_br_customer_period_status 
ON billing_reading (customer_info_id, kifya_wer, status);

-- 3. Accelerates collection status and unpaid arrears lookups per customer
CREATE INDEX idx_br_customer_collected 
ON billing_reading (customer_info_id, is_money_collected, status);

-- 4. Accelerates invoice number lookups and duplicate checks
CREATE INDEX idx_br_invoice_number 
ON billing_reading (invoice_number);

-- 5. Accelerates Wuzif (arrears) unpaid payment links
CREATE INDEX idx_brw_actual_unpaid 
ON billing_reading_wuzif (billing_reading_id_actual_payment, is_money_collected, deleted);

-- 6. Accelerates Wuzif penalized bill lookups
CREATE INDEX idx_brw_penalized 
ON billing_reading_wuzif (billing_reading_id_penalized, is_money_collected);

-- 7. Accelerates customer account validation during batch reads and Excel imports (O(1) account lookup)
CREATE INDEX idx_bci_account_number 
ON billing_customer_info (account_number);

CREATE INDEX idx_bci_account_status 
ON billing_customer_info (account_number, status);

-- 8. Accelerates tariff rate calculations per customer type
CREATE INDEX idx_bt_custtype_status 
ON billing_tarrif (customer_type_id, status);

-- 9. Accelerates meter rent rate lookups
CREATE INDEX idx_bmr_type_size_status 
ON billing_meter_rent (billing_customer_type_id, meter_size_id, status);

-- 10. Accelerates invoice number lookups on billing_invoice_numbers
CREATE INDEX idx_bin_invoicenum 
ON billing_invoice_numbers (invoice_numbers);
