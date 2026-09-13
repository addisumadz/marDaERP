-- ══════════════════════════════════════════════════════════════════════════════════════════════
-- insert_hrms_chart_of_accounts_and_mappings.sql
-- Chart of Accounts & Dynamic Mappings for HRMS Monthly Payroll Journal Integration
-- Tables: fnc_account, hrms_payroll_account_map
-- Safe to execute multiple times (Idempotent: Uses WHERE NOT EXISTS)
-- ══════════════════════════════════════════════════════════════════════════════════════════════

-- ==============================================================================================
-- 1. EXPENSE ACCOUNTS (5000 Series) - Normal Balance: DEBIT
-- ==============================================================================================

-- Parent Header: 5100-0000 (Salaries & Employee Benefits Expense)
INSERT INTO fnc_account (account_code, account_name, account_name_am, account_type, normal_balance, is_header, is_active, description, created_by, created_at, updated_at)
SELECT '5100-0000', 'Salaries & Employee Benefits', 'የደመወዝና ሠራተኞች ጥቅማጥቅም ወጪ', 'EXPENSE', 'DEBIT', true, true, 'Parent Header — Payroll and Employee Benefits Control', 'system', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM fnc_account WHERE account_code = '5100-0000');

-- 5110-0001: Basic Salaries Expense (መሰረታዊ ደመወዝ ወጪ)
INSERT INTO fnc_account (account_code, account_name, account_name_am, account_type, normal_balance, is_header, is_active, description, created_by, created_at, updated_at, parent_account_id)
SELECT '5110-0001', 'Basic Salaries Expense', 'መሰረታዊ ደመወዝ ወጪ', 'EXPENSE', 'DEBIT', false, true, 'Basic salaries expense for permanent & contract staff', 'system', NOW(), NOW(), (SELECT id FROM fnc_account WHERE account_code = '5100-0000')
WHERE NOT EXISTS (SELECT 1 FROM fnc_account WHERE account_code = '5110-0001');

-- 5110-0002: Overtime Pay Expense (የትርፍ ሰዓት ክፍያ ወጪ)
INSERT INTO fnc_account (account_code, account_name, account_name_am, account_type, normal_balance, is_header, is_active, description, created_by, created_at, updated_at, parent_account_id)
SELECT '5110-0002', 'Overtime Pay Expense', 'የትርፍ ሰዓት ክፍያ ወጪ', 'EXPENSE', 'DEBIT', false, true, 'Overtime compensation under Labour Proclamation 1156/2019', 'system', NOW(), NOW(), (SELECT id FROM fnc_account WHERE account_code = '5100-0000')
WHERE NOT EXISTS (SELECT 1 FROM fnc_account WHERE account_code = '5110-0002');

-- 5110-0003: Housing & Living Allowances Expense (የቤት ኪራይና ኑሮ አበል ወጪ)
INSERT INTO fnc_account (account_code, account_name, account_name_am, account_type, normal_balance, is_header, is_active, description, created_by, created_at, updated_at, parent_account_id)
SELECT '5110-0003', 'Housing Allowances Expense', 'የቤት ኪራይ አበል ወጪ', 'EXPENSE', 'DEBIT', false, true, 'Housing and living cost allowances expense', 'system', NOW(), NOW(), (SELECT id FROM fnc_account WHERE account_code = '5100-0000')
WHERE NOT EXISTS (SELECT 1 FROM fnc_account WHERE account_code = '5110-0003');

-- 5110-0004: Transport Allowances Expense (የትራንስፖርት አበል ወጪ)
INSERT INTO fnc_account (account_code, account_name, account_name_am, account_type, normal_balance, is_header, is_active, description, created_by, created_at, updated_at, parent_account_id)
SELECT '5110-0004', 'Transport Allowances Expense', 'የትራንስፖርት አበል ወጪ', 'EXPENSE', 'DEBIT', false, true, 'Transport and commute allowances expense', 'system', NOW(), NOW(), (SELECT id FROM fnc_account WHERE account_code = '5100-0000')
WHERE NOT EXISTS (SELECT 1 FROM fnc_account WHERE account_code = '5110-0004');

-- 5110-0005: Water Utility Hazard & Chemical Allowances (የክሎሪንና ኬሚካል አበል ወጪ)
INSERT INTO fnc_account (account_code, account_name, account_name_am, account_type, normal_balance, is_header, is_active, description, created_by, created_at, updated_at, parent_account_id)
SELECT '5110-0005', 'Hazard & Chemical Allowances Expense', 'የክሎሪንና ኬሚካል አበል ወጪ', 'EXPENSE', 'DEBIT', false, true, 'Water treatment hazardous chemical handling & shift allowances', 'system', NOW(), NOW(), (SELECT id FROM fnc_account WHERE account_code = '5100-0000')
WHERE NOT EXISTS (SELECT 1 FROM fnc_account WHERE account_code = '5110-0005');

-- 5110-0006: Employer Pension Contribution 11% Expense (የአሰሪው ጡረታ መዋጮ 11% ወጪ)
INSERT INTO fnc_account (account_code, account_name, account_name_am, account_type, normal_balance, is_header, is_active, description, created_by, created_at, updated_at, parent_account_id)
SELECT '5110-0006', 'Employer Pension Contribution 11%', 'የአሰሪው ጡረታ መዋጮ 11% ወጪ', 'EXPENSE', 'DEBIT', false, true, 'Statutory 11% employer pension contribution expense', 'system', NOW(), NOW(), (SELECT id FROM fnc_account WHERE account_code = '5100-0000')
WHERE NOT EXISTS (SELECT 1 FROM fnc_account WHERE account_code = '5110-0006');

-- ==============================================================================================
-- 2. LIABILITY ACCOUNTS (2000 Series) - Normal Balance: CREDIT
-- ==============================================================================================

-- Parent Header: 2100-0000 (Current Payroll Liabilities & Accruals)
INSERT INTO fnc_account (account_code, account_name, account_name_am, account_type, normal_balance, is_header, is_active, description, created_by, created_at, updated_at)
SELECT '2100-0000', 'Payroll Withholdings & Accruals', 'የደመወዝ ተቀናሾችና እዳዎች', 'LIABILITY', 'CREDIT', true, true, 'Parent Header — Statutory withholdings and payroll liabilities', 'system', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM fnc_account WHERE account_code = '2100-0000');

-- 2110-0001: Employment Income Tax Payable (የሥራ ግብር ተከፋይ - Schedule A)
INSERT INTO fnc_account (account_code, account_name, account_name_am, account_type, normal_balance, is_header, is_active, description, created_by, created_at, updated_at, parent_account_id)
SELECT '2110-0001', 'Employment Income Tax Payable', 'የሥራ ግብር ተከፋይ', 'LIABILITY', 'CREDIT', false, true, 'Employment income tax payable to Ministry of Revenues (Schedule A)', 'system', NOW(), NOW(), (SELECT id FROM fnc_account WHERE account_code = '2100-0000')
WHERE NOT EXISTS (SELECT 1 FROM fnc_account WHERE account_code = '2110-0001');

-- 2110-0002: Pension Contribution Payable 18% (የጡረታ መዋጮ ተከፋይ 18% = 7% + 11%)
INSERT INTO fnc_account (account_code, account_name, account_name_am, account_type, normal_balance, is_header, is_active, description, created_by, created_at, updated_at, parent_account_id)
SELECT '2110-0002', 'Pension Contribution Payable', 'የጡረታ መዋጮ ተከፋይ (18%)', 'LIABILITY', 'CREDIT', false, true, 'Total statutory pension payable to POESSA / PSSSA (18%)', 'system', NOW(), NOW(), (SELECT id FROM fnc_account WHERE account_code = '2100-0000')
WHERE NOT EXISTS (SELECT 1 FROM fnc_account WHERE account_code = '2110-0002');

-- 2110-0003: Staff Association & Edir Withholdings Payable (የእድርና ብድር ተቀናሽ ተከፋይ)
INSERT INTO fnc_account (account_code, account_name, account_name_am, account_type, normal_balance, is_header, is_active, description, created_by, created_at, updated_at, parent_account_id)
SELECT '2110-0003', 'Staff Association & Edir Payable', 'የእድርና ብድር ተቀናሽ ተከፋይ', 'LIABILITY', 'CREDIT', false, true, 'Voluntary payroll deductions (Edir, Credit Association, Union)', 'system', NOW(), NOW(), (SELECT id FROM fnc_account WHERE account_code = '2100-0000')
WHERE NOT EXISTS (SELECT 1 FROM fnc_account WHERE account_code = '2110-0003');

-- 2110-0004: Net Salaries Payable — Commercial Bank of Ethiopia (CBE) (የተጣራ ደመወዝ ተከፋይ - ንግድ ባንክ)
INSERT INTO fnc_account (account_code, account_name, account_name_am, account_type, normal_balance, is_header, is_active, description, created_by, created_at, updated_at, parent_account_id)
SELECT '2110-0004', 'Net Salaries Payable — CBE', 'የተጣራ ደመወዝ ተከፋይ (ንግድ ባንክ)', 'LIABILITY', 'CREDIT', false, true, 'Net salary payable to staff via Commercial Bank of Ethiopia', 'system', NOW(), NOW(), (SELECT id FROM fnc_account WHERE account_code = '2100-0000')
WHERE NOT EXISTS (SELECT 1 FROM fnc_account WHERE account_code = '2110-0004');

-- 2110-0005: Net Salaries Payable — Abay Bank (የተጣራ ደመወዝ ተከፋይ - አባይ ባንክ)
INSERT INTO fnc_account (account_code, account_name, account_name_am, account_type, normal_balance, is_header, is_active, description, created_by, created_at, updated_at, parent_account_id)
SELECT '2110-0005', 'Net Salaries Payable — Abay Bank', 'የተጣራ ደመወዝ ተከፋይ (አባይ ባንክ)', 'LIABILITY', 'CREDIT', false, true, 'Net salary & special allowances payable via Abay Bank', 'system', NOW(), NOW(), (SELECT id FROM fnc_account WHERE account_code = '2100-0000')
WHERE NOT EXISTS (SELECT 1 FROM fnc_account WHERE account_code = '2110-0005');

-- ==============================================================================================
-- 3. REGISTER MAPPINGS IN hrms_payroll_account_map
-- ==============================================================================================

-- DEBIT MAPPINGS (EXPENSES)
INSERT INTO hrms_payroll_account_map (mapping_key, account_id, label, label_am, entry_type)
SELECT 'HRMS_DR_BASIC_SALARY', id, 'Basic Salaries Expense', 'መሰረታዊ ደመወዝ ወጪ', 'DEBIT'
FROM fnc_account WHERE account_code = '5110-0001'
ON DUPLICATE KEY UPDATE account_id = VALUES(account_id);

INSERT INTO hrms_payroll_account_map (mapping_key, account_id, label, label_am, entry_type)
SELECT 'HRMS_DR_OVERTIME', id, 'Overtime Pay Expense', 'የትርፍ ሰዓት ክፍያ ወጪ', 'DEBIT'
FROM fnc_account WHERE account_code = '5110-0002'
ON DUPLICATE KEY UPDATE account_id = VALUES(account_id);

INSERT INTO hrms_payroll_account_map (mapping_key, account_id, label, label_am, entry_type)
SELECT 'HRMS_DR_HOUSING_ALLOWANCE', id, 'Housing Allowances Expense', 'የቤት ኪራይ አበል ወጪ', 'DEBIT'
FROM fnc_account WHERE account_code = '5110-0003'
ON DUPLICATE KEY UPDATE account_id = VALUES(account_id);

INSERT INTO hrms_payroll_account_map (mapping_key, account_id, label, label_am, entry_type)
SELECT 'HRMS_DR_TRANSPORT_ALLOWANCE', id, 'Transport Allowances Expense', 'የትራንስፖርት አበል ወጪ', 'DEBIT'
FROM fnc_account WHERE account_code = '5110-0004'
ON DUPLICATE KEY UPDATE account_id = VALUES(account_id);

INSERT INTO hrms_payroll_account_map (mapping_key, account_id, label, label_am, entry_type)
SELECT 'HRMS_DR_HAZARD_ALLOWANCE', id, 'Hazard & Chemical Allowances Expense', 'የክሎሪንና ኬሚካል አበል ወጪ', 'DEBIT'
FROM fnc_account WHERE account_code = '5110-0005'
ON DUPLICATE KEY UPDATE account_id = VALUES(account_id);

INSERT INTO hrms_payroll_account_map (mapping_key, account_id, label, label_am, entry_type)
SELECT 'HRMS_DR_EMPLOYER_PENSION_11', id, 'Employer Pension Contribution 11%', 'የአሰሪው ጡረታ መዋጮ 11% ወጪ', 'DEBIT'
FROM fnc_account WHERE account_code = '5110-0006'
ON DUPLICATE KEY UPDATE account_id = VALUES(account_id);

-- CREDIT MAPPINGS (TAX, PENSION, EDIR & BANK PAYABLES)
INSERT INTO hrms_payroll_account_map (mapping_key, account_id, label, label_am, entry_type)
SELECT 'HRMS_CR_TAX_PAYABLE', id, 'Employment Income Tax Payable (Schedule A)', 'የሥራ ግብር ተከፋይ', 'CREDIT'
FROM fnc_account WHERE account_code = '2110-0001'
ON DUPLICATE KEY UPDATE account_id = VALUES(account_id);

INSERT INTO hrms_payroll_account_map (mapping_key, account_id, label, label_am, entry_type)
SELECT 'HRMS_CR_PENSION_PAYABLE_18', id, 'Pension Contribution Payable (18%)', 'የጡረታ መዋጮ ተከፋይ (18%)', 'CREDIT'
FROM fnc_account WHERE account_code = '2110-0002'
ON DUPLICATE KEY UPDATE account_id = VALUES(account_id);

INSERT INTO hrms_payroll_account_map (mapping_key, account_id, label, label_am, entry_type)
SELECT 'HRMS_CR_EDIR_PAYABLE', id, 'Staff Association & Edir Payable', 'የእድርና ብድር ተቀናሽ ተከፋይ', 'CREDIT'
FROM fnc_account WHERE account_code = '2110-0003'
ON DUPLICATE KEY UPDATE account_id = VALUES(account_id);

INSERT INTO hrms_payroll_account_map (mapping_key, account_id, label, label_am, entry_type)
SELECT 'HRMS_CR_NET_SALARY_CBE', id, 'Net Salaries Payable — Commercial Bank of Ethiopia', 'የተጣራ ደመወዝ ተከፋይ (ንግድ ባንክ)', 'CREDIT'
FROM fnc_account WHERE account_code = '2110-0004'
ON DUPLICATE KEY UPDATE account_id = VALUES(account_id);

INSERT INTO hrms_payroll_account_map (mapping_key, account_id, label, label_am, entry_type)
SELECT 'HRMS_CR_NET_SALARY_ABAY', id, 'Net Salaries Payable — Abay Bank', 'የተጣራ ደመወዝ ተከፋይ (አባይ ባንክ)', 'CREDIT'
FROM fnc_account WHERE account_code = '2110-0005'
ON DUPLICATE KEY UPDATE account_id = VALUES(account_id);
