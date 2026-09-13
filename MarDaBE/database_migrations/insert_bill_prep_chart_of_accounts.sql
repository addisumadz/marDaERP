-- ══════════════════════════════════════════════════════════════════════════════════════════════
-- Chart of Accounts Insertion Script for Bill Preparation DR / CR Account Mapping
-- Table: fnc_account (Database: MySQL)
-- Safe to execute multiple times (Idempotent: Uses WHERE NOT EXISTS)
-- ══════════════════════════════════════════════════════════════════════════════════════════════

-- ==============================================================================================
-- 1. ASSET ACCOUNTS (Accounts Receivable) - Normal Balance: DEBIT
-- ==============================================================================================

-- Parent Header Account: 1200-0000
INSERT INTO fnc_account (account_code, account_name, account_name_am, account_type, normal_balance, is_header, is_active, description, created_by, created_at, updated_at)
SELECT '1200-0000', 'Accounts Receivable', 'ተሰብሳቢ ሂሳብ', 'ASSET', 'DEBIT', true, true, 'Parent Header — Customer Accounts Receivable Control', 'system', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM fnc_account WHERE account_code = '1200-0000');

-- 1222-0006: Current Month Water consumption (yezihWerFjotaKfya)
INSERT INTO fnc_account (account_code, account_name, account_name_am, account_type, normal_balance, is_header, is_active, description, created_by, created_at, updated_at, parent_account_id)
SELECT '1222-0006', 'Current Month Water consumption', 'የዚህ ወር የውሃ ፍጆታ ተቀባይ', 'ASSET', 'DEBIT', false, true, 'Receivable for current month water consumption — yezihWerFjotaKfya', 'system', NOW(), NOW(), (SELECT id FROM fnc_account WHERE account_code = '1200-0000')
WHERE NOT EXISTS (SELECT 1 FROM fnc_account WHERE account_code = '1222-0006');

-- 1222-0007: Meter Rent (kotariKiray)
INSERT INTO fnc_account (account_code, account_name, account_name_am, account_type, normal_balance, is_header, is_active, description, created_by, created_at, updated_at, parent_account_id)
SELECT '1222-0007', 'Meter Rent', 'ቆጣሪ ኪራይ ተቀባይ', 'ASSET', 'DEBIT', false, true, 'Receivable for meter rent — kotariKiray', 'system', NOW(), NOW(), (SELECT id FROM fnc_account WHERE account_code = '1200-0000')
WHERE NOT EXISTS (SELECT 1 FROM fnc_account WHERE account_code = '1222-0007');

-- 1222-0008: Bill Additional Payment (techemariKfya)
INSERT INTO fnc_account (account_code, account_name, account_name_am, account_type, normal_balance, is_header, is_active, description, created_by, created_at, updated_at, parent_account_id)
SELECT '1222-0008', 'Bill Additional Payment', 'ተጨማሪ ክፍያ ተቀባይ', 'ASSET', 'DEBIT', false, true, 'Receivable for bill additional payment — techemariKfya', 'system', NOW(), NOW(), (SELECT id FROM fnc_account WHERE account_code = '1200-0000')
WHERE NOT EXISTS (SELECT 1 FROM fnc_account WHERE account_code = '1222-0008');

-- 1222-0009: Arrears Water Consumption (wuzifFjotaKfya)
INSERT INTO fnc_account (account_code, account_name, account_name_am, account_type, normal_balance, is_header, is_active, description, created_by, created_at, updated_at, parent_account_id)
SELECT '1222-0009', 'Arrears Water Consumption', 'ውዝፍ የውሃ ፍጆታ ተቀባይ', 'ASSET', 'DEBIT', false, true, 'Receivable for arrears water consumption — wuzifFjotaKfya', 'system', NOW(), NOW(), (SELECT id FROM fnc_account WHERE account_code = '1200-0000')
WHERE NOT EXISTS (SELECT 1 FROM fnc_account WHERE account_code = '1222-0009');

-- 1222-0010: Arrears Meter rent (wuzifKotariKiray)
INSERT INTO fnc_account (account_code, account_name, account_name_am, account_type, normal_balance, is_header, is_active, description, created_by, created_at, updated_at, parent_account_id)
SELECT '1222-0010', 'Arrears Meter rent', 'ውዝፍ ቆጣሪ ኪራይ ተቀባይ', 'ASSET', 'DEBIT', false, true, 'Receivable for arrears meter rent — wuzifKotariKiray', 'system', NOW(), NOW(), (SELECT id FROM fnc_account WHERE account_code = '1200-0000')
WHERE NOT EXISTS (SELECT 1 FROM fnc_account WHERE account_code = '1222-0010');

-- 1222-0011: Arrears Bill Additional Payment (wuzifTechemariKfya)
INSERT INTO fnc_account (account_code, account_name, account_name_am, account_type, normal_balance, is_header, is_active, description, created_by, created_at, updated_at, parent_account_id)
SELECT '1222-0011', 'Arrears Bill Additional Payment', 'ውዝፍ ተጨማሪ ክፍያ ተቀባይ', 'ASSET', 'DEBIT', false, true, 'Receivable for arrears bill additional payment — wuzifTechemariKfya', 'system', NOW(), NOW(), (SELECT id FROM fnc_account WHERE account_code = '1200-0000')
WHERE NOT EXISTS (SELECT 1 FROM fnc_account WHERE account_code = '1222-0011');

-- 1222-0012: Bill Penalty (kitat)
INSERT INTO fnc_account (account_code, account_name, account_name_am, account_type, normal_balance, is_header, is_active, description, created_by, created_at, updated_at, parent_account_id)
SELECT '1222-0012', 'Bill Penalty', 'ቅጣት ተቀባይ', 'ASSET', 'DEBIT', false, true, 'Receivable for penalty charges — kitat', 'system', NOW(), NOW(), (SELECT id FROM fnc_account WHERE account_code = '1200-0000')
WHERE NOT EXISTS (SELECT 1 FROM fnc_account WHERE account_code = '1222-0012');

-- 1222-0013: Bill Old system Arrears (Carried Forward Arrears)
INSERT INTO fnc_account (account_code, account_name, account_name_am, account_type, normal_balance, is_header, is_active, description, created_by, created_at, updated_at, parent_account_id)
SELECT '1222-0013', 'Bill Old system Arrears', 'የተላለፈ(ነባር) ውዝፍ ተቀባይ', 'ASSET', 'DEBIT', false, true, 'Receivable for old system carried forward arrears — calculated', 'system', NOW(), NOW(), (SELECT id FROM fnc_account WHERE account_code = '1200-0000')
WHERE NOT EXISTS (SELECT 1 FROM fnc_account WHERE account_code = '1222-0013');

-- 1222-0014: Bill Service Charge (billing_additional_payment_1_value)
INSERT INTO fnc_account (account_code, account_name, account_name_am, account_type, normal_balance, is_header, is_active, description, created_by, created_at, updated_at, parent_account_id)
SELECT '1222-0014', 'Bill Service Charge', 'የአገልግሎት ክፍያ ተቀባይ', 'ASSET', 'DEBIT', false, true, 'Receivable for service charge — billing_additional_payment_1_value', 'system', NOW(), NOW(), (SELECT id FROM fnc_account WHERE account_code = '1200-0000')
WHERE NOT EXISTS (SELECT 1 FROM fnc_account WHERE account_code = '1222-0014');

-- 1222-0015: Dry Wast (additionalHisab)
INSERT INTO fnc_account (account_code, account_name, account_name_am, account_type, normal_balance, is_header, is_active, description, created_by, created_at, updated_at, parent_account_id)
SELECT '1222-0015', 'Dry Wast', 'የዚህ ወር ደረቅ ቆሻሻ ተቀባይ', 'ASSET', 'DEBIT', false, true, 'Receivable for dry waste charge — additionalHisab', 'system', NOW(), NOW(), (SELECT id FROM fnc_account WHERE account_code = '1200-0000')
WHERE NOT EXISTS (SELECT 1 FROM fnc_account WHERE account_code = '1222-0015');

-- 1222-0016: School Feeding (billing_additional_payment_2_value)
INSERT INTO fnc_account (account_code, account_name, account_name_am, account_type, normal_balance, is_header, is_active, description, created_by, created_at, updated_at, parent_account_id)
SELECT '1222-0016', 'School Feeding', 'የትምህርት ቤት ምገባ ተቀባይ', 'ASSET', 'DEBIT', false, true, 'Receivable for school feeding charge — billing_additional_payment_2_value', 'system', NOW(), NOW(), (SELECT id FROM fnc_account WHERE account_code = '1200-0000')
WHERE NOT EXISTS (SELECT 1 FROM fnc_account WHERE account_code = '1222-0016');

-- 1222-0017: Arrears Bill Service Charge (billing_additional_payment_1_wuzif)
INSERT INTO fnc_account (account_code, account_name, account_name_am, account_type, normal_balance, is_header, is_active, description, created_by, created_at, updated_at, parent_account_id)
SELECT '1222-0017', 'Arrears Bill Service Charge', 'ውዝፍ የአገልግሎት ክፍያ ተቀባይ', 'ASSET', 'DEBIT', false, true, 'Receivable for arrears service charge — billing_additional_payment_1_wuzif', 'system', NOW(), NOW(), (SELECT id FROM fnc_account WHERE account_code = '1200-0000')
WHERE NOT EXISTS (SELECT 1 FROM fnc_account WHERE account_code = '1222-0017');

-- 1222-0018: Arrears Dry Wast (wuzifDerekKoshasha)
INSERT INTO fnc_account (account_code, account_name, account_name_am, account_type, normal_balance, is_header, is_active, description, created_by, created_at, updated_at, parent_account_id)
SELECT '1222-0018', 'Arrears Dry Wast', 'ውዝፍ ደረቅ ቆሻሻ ተቀባይ', 'ASSET', 'DEBIT', false, true, 'Receivable for arrears dry waste charge — wuzifDerekKoshasha', 'system', NOW(), NOW(), (SELECT id FROM fnc_account WHERE account_code = '1200-0000')
WHERE NOT EXISTS (SELECT 1 FROM fnc_account WHERE account_code = '1222-0018');

-- 1222-0019: Arrears School Feeding (billing_additional_payment_2_wuzif)
INSERT INTO fnc_account (account_code, account_name, account_name_am, account_type, normal_balance, is_header, is_active, description, created_by, created_at, updated_at, parent_account_id)
SELECT '1222-0019', 'Arrears School Feeding', 'ውዝፍ የትምህርት ቤት ምገባ ተቀባይ', 'ASSET', 'DEBIT', false, true, 'Receivable for arrears school feeding charge — billing_additional_payment_2_wuzif', 'system', NOW(), NOW(), (SELECT id FROM fnc_account WHERE account_code = '1200-0000')
WHERE NOT EXISTS (SELECT 1 FROM fnc_account WHERE account_code = '1222-0019');


-- ==============================================================================================
-- 2. REVENUE ACCOUNTS (Water Sales Revenue) - Normal Balance: CREDIT
-- ==============================================================================================

-- Parent Header Account: 4001-0000
INSERT INTO fnc_account (account_code, account_name, account_name_am, account_type, normal_balance, is_header, is_active, description, created_by, created_at, updated_at)
SELECT '4001-0000', 'Water Sales Revenue', 'የውሃ ሽያጭ ገቢ', 'REVENUE', 'CREDIT', true, true, 'Parent Header — Water Sales Revenue Control', 'system', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM fnc_account WHERE account_code = '4001-0000');

-- 4001-0005: Current Month Water consumption (yezihWerFjotaKfya)
INSERT INTO fnc_account (account_code, account_name, account_name_am, account_type, normal_balance, is_header, is_active, description, created_by, created_at, updated_at, parent_account_id)
SELECT '4001-0005', 'Current Month Water consumption', 'የዚህ ወር የውሃ ፍጆታ ገቢ', 'REVENUE', 'CREDIT', false, true, 'Revenue for current month water consumption — yezihWerFjotaKfya', 'system', NOW(), NOW(), (SELECT id FROM fnc_account WHERE account_code = '4001-0000')
WHERE NOT EXISTS (SELECT 1 FROM fnc_account WHERE account_code = '4001-0005');

-- 4001-0006: Meter Rent (kotariKiray)
INSERT INTO fnc_account (account_code, account_name, account_name_am, account_type, normal_balance, is_header, is_active, description, created_by, created_at, updated_at, parent_account_id)
SELECT '4001-0006', 'Meter Rent', 'ቆጣሪ ኪራይ ገቢ', 'REVENUE', 'CREDIT', false, true, 'Monthly meter rental fees — kotariKiray', 'system', NOW(), NOW(), (SELECT id FROM fnc_account WHERE account_code = '4001-0000')
WHERE NOT EXISTS (SELECT 1 FROM fnc_account WHERE account_code = '4001-0006');

-- 4001-0007: Bill Additional Payment (techemariKfya)
INSERT INTO fnc_account (account_code, account_name, account_name_am, account_type, normal_balance, is_header, is_active, description, created_by, created_at, updated_at, parent_account_id)
SELECT '4001-0007', 'Bill Additional Payment', 'ተጨማሪ ክፍያ ገቢ', 'REVENUE', 'CREDIT', false, true, 'Revenue for bill additional payments — techemariKfya', 'system', NOW(), NOW(), (SELECT id FROM fnc_account WHERE account_code = '4001-0000')
WHERE NOT EXISTS (SELECT 1 FROM fnc_account WHERE account_code = '4001-0007');

-- 4001-0008: Arrears Water Consumption (wuzifFjotaKfya)
INSERT INTO fnc_account (account_code, account_name, account_name_am, account_type, normal_balance, is_header, is_active, description, created_by, created_at, updated_at, parent_account_id)
SELECT '4001-0008', 'Arrears Water Consumption', 'ውዝፍ የውሃ ፍጆታ ገቢ', 'REVENUE', 'CREDIT', false, true, 'Revenue for prior arrears water consumption — wuzifFjotaKfya', 'system', NOW(), NOW(), (SELECT id FROM fnc_account WHERE account_code = '4001-0000')
WHERE NOT EXISTS (SELECT 1 FROM fnc_account WHERE account_code = '4001-0008');

-- 4001-0009: Arrears Meter rent (wuzifKotariKiray)
INSERT INTO fnc_account (account_code, account_name, account_name_am, account_type, normal_balance, is_header, is_active, description, created_by, created_at, updated_at, parent_account_id)
SELECT '4001-0009', 'Arrears Meter rent', 'ውዝፍ ቆጣሪ ኪራይ ገቢ', 'REVENUE', 'CREDIT', false, true, 'Revenue for prior arrears meter rent — wuzifKotariKiray', 'system', NOW(), NOW(), (SELECT id FROM fnc_account WHERE account_code = '4001-0000')
WHERE NOT EXISTS (SELECT 1 FROM fnc_account WHERE account_code = '4001-0009');

-- 4001-0010: Arrears Bill Additional Payment (wuzifTechemariKfya)
INSERT INTO fnc_account (account_code, account_name, account_name_am, account_type, normal_balance, is_header, is_active, description, created_by, created_at, updated_at, parent_account_id)
SELECT '4001-0010', 'Arrears Bill Additional Payment', 'ውዝፍ ተጨማሪ ክፍያ ገቢ', 'REVENUE', 'CREDIT', false, true, 'Revenue for prior arrears bill additional payment — wuzifTechemariKfya', 'system', NOW(), NOW(), (SELECT id FROM fnc_account WHERE account_code = '4001-0000')
WHERE NOT EXISTS (SELECT 1 FROM fnc_account WHERE account_code = '4001-0010');

-- 4001-0011: Bill Penalty (kitat)
INSERT INTO fnc_account (account_code, account_name, account_name_am, account_type, normal_balance, is_header, is_active, description, created_by, created_at, updated_at, parent_account_id)
SELECT '4001-0011', 'Bill Penalty', 'ቅጣት ገቢ', 'REVENUE', 'CREDIT', false, true, 'Revenue for late payment penalties — kitat', 'system', NOW(), NOW(), (SELECT id FROM fnc_account WHERE account_code = '4001-0000')
WHERE NOT EXISTS (SELECT 1 FROM fnc_account WHERE account_code = '4001-0011');

-- 4001-0012: Bill Old system Arrears (Carried Forward Arrears)
INSERT INTO fnc_account (account_code, account_name, account_name_am, account_type, normal_balance, is_header, is_active, description, created_by, created_at, updated_at, parent_account_id)
SELECT '4001-0012', 'Bill Old system Arrears', 'የተላለፈ(ነባር) ውዝፍ ገቢ', 'REVENUE', 'CREDIT', false, true, 'Revenue recognized for legacy/old system arrears carried forward', 'system', NOW(), NOW(), (SELECT id FROM fnc_account WHERE account_code = '4001-0000')
WHERE NOT EXISTS (SELECT 1 FROM fnc_account WHERE account_code = '4001-0012');

-- 4001-0013: Bill Service Charge (billing_additional_payment_1_value)
INSERT INTO fnc_account (account_code, account_name, account_name_am, account_type, normal_balance, is_header, is_active, description, created_by, created_at, updated_at, parent_account_id)
SELECT '4001-0013', 'Bill Service Charge', 'የአገልግሎት ክፍያ ገቢ', 'REVENUE', 'CREDIT', false, true, 'Revenue for billing service charges — billing_additional_payment_1_value', 'system', NOW(), NOW(), (SELECT id FROM fnc_account WHERE account_code = '4001-0000')
WHERE NOT EXISTS (SELECT 1 FROM fnc_account WHERE account_code = '4001-0013');


-- ==============================================================================================
-- 3. LIABILITY ACCOUNTS (Other Gov't Tax Payable) - Normal Balance: CREDIT
-- ==============================================================================================

-- Parent Header Account: 2005-0000
INSERT INTO fnc_account (account_code, account_name, account_name_am, account_type, normal_balance, is_header, is_active, description, created_by, created_at, updated_at)
SELECT '2005-0000', 'Other Gov''t Tax Payable', 'ሌሎች የመንግስት ታክስ ተከፋይ', 'LIABILITY', 'CREDIT', true, true, 'Parent Header — Other Government Tax & Surcharge Payables Control', 'system', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM fnc_account WHERE account_code = '2005-0000');

-- 2005-0004: Dry Wast (additionalHisab)
INSERT INTO fnc_account (account_code, account_name, account_name_am, account_type, normal_balance, is_header, is_active, description, created_by, created_at, updated_at, parent_account_id)
SELECT '2005-0004', 'Dry Wast', 'የዚህ ወር ደረቅ ቆሻሻ ተከፋይ', 'LIABILITY', 'CREDIT', false, true, 'Payable to municipality/waste company for dry waste — additionalHisab', 'system', NOW(), NOW(), (SELECT id FROM fnc_account WHERE account_code = '2005-0000')
WHERE NOT EXISTS (SELECT 1 FROM fnc_account WHERE account_code = '2005-0004');

-- 2005-0005: School Feeding (billing_additional_payment_2_value)
INSERT INTO fnc_account (account_code, account_name, account_name_am, account_type, normal_balance, is_header, is_active, description, created_by, created_at, updated_at, parent_account_id)
SELECT '2005-0005', 'School Feeding', 'የትምህርት ቤት ምገባ ተከፋይ', 'LIABILITY', 'CREDIT', false, true, 'Payable for school feeding program — billing_additional_payment_2_value', 'system', NOW(), NOW(), (SELECT id FROM fnc_account WHERE account_code = '2005-0000')
WHERE NOT EXISTS (SELECT 1 FROM fnc_account WHERE account_code = '2005-0005');

-- 2005-0006: Arrears Bill Service Charge (billing_additional_payment_1_wuzif)
INSERT INTO fnc_account (account_code, account_name, account_name_am, account_type, normal_balance, is_header, is_active, description, created_by, created_at, updated_at, parent_account_id)
SELECT '2005-0006', 'Arrears Bill Service Charge', 'ውዝፍ የአገልግሎት ክፍያ ተከፋይ', 'LIABILITY', 'CREDIT', false, true, 'Payable for arrears service charges — billing_additional_payment_1_wuzif', 'system', NOW(), NOW(), (SELECT id FROM fnc_account WHERE account_code = '2005-0000')
WHERE NOT EXISTS (SELECT 1 FROM fnc_account WHERE account_code = '2005-0006');

-- 2005-0007: Arrears Dry Wast (wuzifDerekKoshasha)
INSERT INTO fnc_account (account_code, account_name, account_name_am, account_type, normal_balance, is_header, is_active, description, created_by, created_at, updated_at, parent_account_id)
SELECT '2005-0007', 'Arrears Dry Wast', 'ውዝፍ ደረቅ ቆሻሻ ተከፋይ', 'LIABILITY', 'CREDIT', false, true, 'Payable to municipality/waste company for arrears dry waste — wuzifDerekKoshasha', 'system', NOW(), NOW(), (SELECT id FROM fnc_account WHERE account_code = '2005-0000')
WHERE NOT EXISTS (SELECT 1 FROM fnc_account WHERE account_code = '2005-0007');

-- 2005-0008: Arrears School Feeding (billing_additional_payment_2_wuzif)
INSERT INTO fnc_account (account_code, account_name, account_name_am, account_type, normal_balance, is_header, is_active, description, created_by, created_at, updated_at, parent_account_id)
SELECT '2005-0008', 'Arrears School Feeding', 'ውዝፍ የትምህርት ቤት ምገባ ተከፋይ', 'LIABILITY', 'CREDIT', false, true, 'Payable for arrears school feeding program — billing_additional_payment_2_wuzif', 'system', NOW(), NOW(), (SELECT id FROM fnc_account WHERE account_code = '2005-0000')
WHERE NOT EXISTS (SELECT 1 FROM fnc_account WHERE account_code = '2005-0008');
