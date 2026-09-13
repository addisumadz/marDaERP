-- ══════════════════════════════════════════════════════════════════════════════════════════════
-- Bank & Cash Accounts Insertion Script for Payment Location Mapping
-- Table: fnc_account (Database: MySQL)
-- Safe to execute multiple times (Idempotent: Uses WHERE NOT EXISTS)
-- ══════════════════════════════════════════════════════════════════════════════════════════════

-- ==============================================================================================
-- Parent Header Accounts (ASSET - Normal Balance: DEBIT)
-- ==============================================================================================

-- 1100-0000: Cash and Cash Equivalents Header
INSERT INTO fnc_account (account_code, account_name, account_name_am, account_type, normal_balance, is_header, is_active, description, created_by, created_at, updated_at)
SELECT '1100-0000', 'Cash and Cash Equivalents', 'ጥሬ ገንዘብ እና የባንክ ሂሳቦች', 'ASSET', 'DEBIT', true, true, 'Parent Header — Cash and Cash Equivalents', 'system', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM fnc_account WHERE account_code = '1100-0000');

-- 1111-0000: Cash on Hand Header
INSERT INTO fnc_account (account_code, account_name, account_name_am, account_type, normal_balance, is_header, is_active, description, created_by, created_at, updated_at, parent_account_id)
SELECT '1111-0000', 'Cash on Hand', 'በእጅ ያለ ጥሬ ገንዘብ', 'ASSET', 'DEBIT', true, true, 'Cash on Hand Control Header', 'system', NOW(), NOW(), (SELECT id FROM fnc_account WHERE account_code = '1100-0000')
WHERE NOT EXISTS (SELECT 1 FROM fnc_account WHERE account_code = '1111-0000');

-- 1113-0000: Cash at Bank Header
INSERT INTO fnc_account (account_code, account_name, account_name_am, account_type, normal_balance, is_header, is_active, description, created_by, created_at, updated_at, parent_account_id)
SELECT '1113-0000', 'Cash at Bank', 'በባንክ ያለ ገንዘብ', 'ASSET', 'DEBIT', true, true, 'Cash at Bank Control Header', 'system', NOW(), NOW(), (SELECT id FROM fnc_account WHERE account_code = '1100-0000')
WHERE NOT EXISTS (SELECT 1 FROM fnc_account WHERE account_code = '1113-0000');


-- ==============================================================================================
-- Cash on Hand & Prepaid Accounts (ASSET - Normal Balance: DEBIT)
-- ==============================================================================================

-- 1111-0001: Office Cash Account (ቢሮ ጥሬ ገንዘብ)
INSERT INTO fnc_account (account_code, account_name, account_name_am, account_type, normal_balance, is_header, is_active, description, created_by, created_at, updated_at, parent_account_id)
SELECT '1111-0001', 'Office Cash Account', 'የቢሮ ጥሬ ገንዘብ', 'ASSET', 'DEBIT', false, true, 'Front office cash collections — OFFICE_CASH', 'system', NOW(), NOW(), (SELECT id FROM fnc_account WHERE account_code = '1111-0000')
WHERE NOT EXISTS (SELECT 1 FROM fnc_account WHERE account_code = '1111-0001');

-- 1112-0001: Customer Prepaid / Credit Account
INSERT INTO fnc_account (account_code, account_name, account_name_am, account_type, normal_balance, is_header, is_active, description, created_by, created_at, updated_at, parent_account_id)
SELECT '1112-0001', 'Prepaid Customer Deposit Account', 'የደንበኞች ቅድመ ክፍያ ተቀማጭ', 'ASSET', 'DEBIT', false, true, 'Customer prepaid/credit balances — PREPAID_ACCOUNT', 'system', NOW(), NOW(), (SELECT id FROM fnc_account WHERE account_code = '1100-0000')
WHERE NOT EXISTS (SELECT 1 FROM fnc_account WHERE account_code = '1112-0001');


-- ==============================================================================================
-- Bank & Digital Payment Accounts (ASSET - Normal Balance: DEBIT)
-- ==============================================================================================

-- 1113-0001: Abay Bank
INSERT INTO fnc_account (account_code, account_name, account_name_am, account_type, normal_balance, is_header, is_active, description, created_by, created_at, updated_at, parent_account_id)
SELECT '1113-0001', 'Abay Bank', 'አባይ ባንክ', 'ASSET', 'DEBIT', false, true, 'Abay Bank Collection Account', 'system', NOW(), NOW(), (SELECT id FROM fnc_account WHERE account_code = '1113-0000')
WHERE NOT EXISTS (SELECT 1 FROM fnc_account WHERE account_code = '1113-0001');

-- 1113-0002: Commercial Bank of Ethiopia (CBE)
INSERT INTO fnc_account (account_code, account_name, account_name_am, account_type, normal_balance, is_header, is_active, description, created_by, created_at, updated_at, parent_account_id)
SELECT '1113-0002', 'Commercial Bank of Ethiopia (CBE)', 'የኢትዮጵያ ንግድ ባንክ', 'ASSET', 'DEBIT', false, true, 'CBE Collection Account', 'system', NOW(), NOW(), (SELECT id FROM fnc_account WHERE account_code = '1113-0000')
WHERE NOT EXISTS (SELECT 1 FROM fnc_account WHERE account_code = '1113-0002');

-- 1113-0003: Telebirr (Ethio Telecom)
INSERT INTO fnc_account (account_code, account_name, account_name_am, account_type, normal_balance, is_header, is_active, description, created_by, created_at, updated_at, parent_account_id)
SELECT '1113-0003', 'Telebirr', 'ቴሌብር', 'ASSET', 'DEBIT', false, true, 'Telebirr Payment Account', 'system', NOW(), NOW(), (SELECT id FROM fnc_account WHERE account_code = '1113-0000')
WHERE NOT EXISTS (SELECT 1 FROM fnc_account WHERE account_code = '1113-0003');

-- 1113-0004: Bank of Abyssinia
INSERT INTO fnc_account (account_code, account_name, account_name_am, account_type, normal_balance, is_header, is_active, description, created_by, created_at, updated_at, parent_account_id)
SELECT '1113-0004', 'Bank of Abyssinia', 'አቢሲኒያ ባንክ', 'ASSET', 'DEBIT', false, true, 'Bank of Abyssinia Collection Account', 'system', NOW(), NOW(), (SELECT id FROM fnc_account WHERE account_code = '1113-0000')
WHERE NOT EXISTS (SELECT 1 FROM fnc_account WHERE account_code = '1113-0004');

-- 1113-0005: Dashen Bank
INSERT INTO fnc_account (account_code, account_name, account_name_am, account_type, normal_balance, is_header, is_active, description, created_by, created_at, updated_at, parent_account_id)
SELECT '1113-0005', 'Dashen Bank', 'ዳሽን ባንክ', 'ASSET', 'DEBIT', false, true, 'Dashen Bank Collection Account', 'system', NOW(), NOW(), (SELECT id FROM fnc_account WHERE account_code = '1113-0000')
WHERE NOT EXISTS (SELECT 1 FROM fnc_account WHERE account_code = '1113-0005');

-- 1113-0006: Awash Bank
INSERT INTO fnc_account (account_code, account_name, account_name_am, account_type, normal_balance, is_header, is_active, description, created_by, created_at, updated_at, parent_account_id)
SELECT '1113-0006', 'Awash Bank', 'አዋሽ ባንክ', 'ASSET', 'DEBIT', false, true, 'Awash Bank Collection Account', 'system', NOW(), NOW(), (SELECT id FROM fnc_account WHERE account_code = '1113-0000')
WHERE NOT EXISTS (SELECT 1 FROM fnc_account WHERE account_code = '1113-0006');

-- 1113-0007: Wegagen Bank
INSERT INTO fnc_account (account_code, account_name, account_name_am, account_type, normal_balance, is_header, is_active, description, created_by, created_at, updated_at, parent_account_id)
SELECT '1113-0007', 'Wegagen Bank', 'ወጋገን ባንክ', 'ASSET', 'DEBIT', false, true, 'Wegagen Bank Collection Account', 'system', NOW(), NOW(), (SELECT id FROM fnc_account WHERE account_code = '1113-0000')
WHERE NOT EXISTS (SELECT 1 FROM fnc_account WHERE account_code = '1113-0007');

-- 1113-0008: Nib International Bank
INSERT INTO fnc_account (account_code, account_name, account_name_am, account_type, normal_balance, is_header, is_active, description, created_by, created_at, updated_at, parent_account_id)
SELECT '1113-0008', 'Nib International Bank', 'ንብ ባንክ', 'ASSET', 'DEBIT', false, true, 'Nib Bank Collection Account', 'system', NOW(), NOW(), (SELECT id FROM fnc_account WHERE account_code = '1113-0000')
WHERE NOT EXISTS (SELECT 1 FROM fnc_account WHERE account_code = '1113-0008');

-- 1113-0009: Cooperative Bank of Oromia
INSERT INTO fnc_account (account_code, account_name, account_name_am, account_type, normal_balance, is_header, is_active, description, created_by, created_at, updated_at, parent_account_id)
SELECT '1113-0009', 'Cooperative Bank of Oromia', 'የኦሮሚያ ህብረት ስራ ባንክ', 'ASSET', 'DEBIT', false, true, 'Coop Bank Collection Account', 'system', NOW(), NOW(), (SELECT id FROM fnc_account WHERE account_code = '1113-0000')
WHERE NOT EXISTS (SELECT 1 FROM fnc_account WHERE account_code = '1113-0009');

-- 1113-0010: Hibret Bank (United Bank)
INSERT INTO fnc_account (account_code, account_name, account_name_am, account_type, normal_balance, is_header, is_active, description, created_by, created_at, updated_at, parent_account_id)
SELECT '1113-0010', 'Hibret Bank', 'ኅብረት ባንክ', 'ASSET', 'DEBIT', false, true, 'Hibret Bank Collection Account', 'system', NOW(), NOW(), (SELECT id FROM fnc_account WHERE account_code = '1113-0000')
WHERE NOT EXISTS (SELECT 1 FROM fnc_account WHERE account_code = '1113-0010');

-- 1113-0011: Berhan Bank
INSERT INTO fnc_account (account_code, account_name, account_name_am, account_type, normal_balance, is_header, is_active, description, created_by, created_at, updated_at, parent_account_id)
SELECT '1113-0011', 'Berhan Bank', 'ብርሃን ባንክ', 'ASSET', 'DEBIT', false, true, 'Berhan Bank Collection Account', 'system', NOW(), NOW(), (SELECT id FROM fnc_account WHERE account_code = '1113-0000')
WHERE NOT EXISTS (SELECT 1 FROM fnc_account WHERE account_code = '1113-0011');

-- 1113-0012: Zemen Bank
INSERT INTO fnc_account (account_code, account_name, account_name_am, account_type, normal_balance, is_header, is_active, description, created_by, created_at, updated_at, parent_account_id)
SELECT '1113-0012', 'Zemen Bank', 'ዘመን ባንክ', 'ASSET', 'DEBIT', false, true, 'Zemen Bank Collection Account', 'system', NOW(), NOW(), (SELECT id FROM fnc_account WHERE account_code = '1113-0000')
WHERE NOT EXISTS (SELECT 1 FROM fnc_account WHERE account_code = '1113-0012');

-- 1113-0013: Bunna International Bank
INSERT INTO fnc_account (account_code, account_name, account_name_am, account_type, normal_balance, is_header, is_active, description, created_by, created_at, updated_at, parent_account_id)
SELECT '1113-0013', 'Bunna International Bank', 'ቡና ባንክ', 'ASSET', 'DEBIT', false, true, 'Bunna Bank Collection Account', 'system', NOW(), NOW(), (SELECT id FROM fnc_account WHERE account_code = '1113-0000')
WHERE NOT EXISTS (SELECT 1 FROM fnc_account WHERE account_code = '1113-0013');

-- 1113-0014: Oromia Bank
INSERT INTO fnc_account (account_code, account_name, account_name_am, account_type, normal_balance, is_header, is_active, description, created_by, created_at, updated_at, parent_account_id)
SELECT '1113-0014', 'Oromia Bank', 'ኦሮሚያ ባንክ', 'ASSET', 'DEBIT', false, true, 'Oromia Bank Collection Account', 'system', NOW(), NOW(), (SELECT id FROM fnc_account WHERE account_code = '1113-0000')
WHERE NOT EXISTS (SELECT 1 FROM fnc_account WHERE account_code = '1113-0000');

-- 1113-0015: Lion International Bank
INSERT INTO fnc_account (account_code, account_name, account_name_am, account_type, normal_balance, is_header, is_active, description, created_by, created_at, updated_at, parent_account_id)
SELECT '1113-0015', 'Lion International Bank', 'አንበሳ ባንክ', 'ASSET', 'DEBIT', false, true, 'Lion Bank Collection Account', 'system', NOW(), NOW(), (SELECT id FROM fnc_account WHERE account_code = '1113-0000')
WHERE NOT EXISTS (SELECT 1 FROM fnc_account WHERE account_code = '1113-0015');

-- 1113-0016: Enat Bank
INSERT INTO fnc_account (account_code, account_name, account_name_am, account_type, normal_balance, is_header, is_active, description, created_by, created_at, updated_at, parent_account_id)
SELECT '1113-0016', 'Enat Bank', 'እናት ባንክ', 'ASSET', 'DEBIT', false, true, 'Enat Bank Collection Account', 'system', NOW(), NOW(), (SELECT id FROM fnc_account WHERE account_code = '1113-0000')
WHERE NOT EXISTS (SELECT 1 FROM fnc_account WHERE account_code = '1113-0016');

-- 1113-0017: Global Bank Ethiopia
INSERT INTO fnc_account (account_code, account_name, account_name_am, account_type, normal_balance, is_header, is_active, description, created_by, created_at, updated_at, parent_account_id)
SELECT '1113-0017', 'Global Bank Ethiopia', 'ግሎባል ባንክ ኢትዮጵያ', 'ASSET', 'DEBIT', false, true, 'Global Bank Collection Account', 'system', NOW(), NOW(), (SELECT id FROM fnc_account WHERE account_code = '1113-0000')
WHERE NOT EXISTS (SELECT 1 FROM fnc_account WHERE account_code = '1113-0017');

-- 1113-0018: Amhara Bank
INSERT INTO fnc_account (account_code, account_name, account_name_am, account_type, normal_balance, is_header, is_active, description, created_by, created_at, updated_at, parent_account_id)
SELECT '1113-0018', 'Amhara Bank', 'አማራ ባንክ', 'ASSET', 'DEBIT', false, true, 'Amhara Bank Collection Account', 'system', NOW(), NOW(), (SELECT id FROM fnc_account WHERE account_code = '1113-0000')
WHERE NOT EXISTS (SELECT 1 FROM fnc_account WHERE account_code = '1113-0018');

-- 1113-0019: Gadaa Bank
INSERT INTO fnc_account (account_code, account_name, account_name_am, account_type, normal_balance, is_header, is_active, description, created_by, created_at, updated_at, parent_account_id)
SELECT '1113-0019', 'Gadaa Bank', 'ገዳ ባንክ', 'ASSET', 'DEBIT', false, true, 'Gadaa Bank Collection Account', 'system', NOW(), NOW(), (SELECT id FROM fnc_account WHERE account_code = '1113-0000')
WHERE NOT EXISTS (SELECT 1 FROM fnc_account WHERE account_code = '1113-0019');

-- 1113-0020: Hijra Bank
INSERT INTO fnc_account (account_code, account_name, account_name_am, account_type, normal_balance, is_header, is_active, description, created_by, created_at, updated_at, parent_account_id)
SELECT '1113-0020', 'Hijra Bank', 'ሂጅራ ባንክ', 'ASSET', 'DEBIT', false, true, 'Hijra Bank Collection Account', 'system', NOW(), NOW(), (SELECT id FROM fnc_account WHERE account_code = '1113-0000')
WHERE NOT EXISTS (SELECT 1 FROM fnc_account WHERE account_code = '1113-0020');

-- 1113-0021: ZamZam Bank
INSERT INTO fnc_account (account_code, account_name, account_name_am, account_type, normal_balance, is_header, is_active, description, created_by, created_at, updated_at, parent_account_id)
SELECT '1113-0021', 'ZamZam Bank', 'ዘምዘም ባንክ', 'ASSET', 'DEBIT', false, true, 'ZamZam Bank Collection Account', 'system', NOW(), NOW(), (SELECT id FROM fnc_account WHERE account_code = '1113-0000')
WHERE NOT EXISTS (SELECT 1 FROM fnc_account WHERE account_code = '1113-0021');

-- 1113-0022: Sinqee Bank
INSERT INTO fnc_account (account_code, account_name, account_name_am, account_type, normal_balance, is_header, is_active, description, created_by, created_at, updated_at, parent_account_id)
SELECT '1113-0022', 'Sinqee Bank', 'ሲንቄ ባንክ', 'ASSET', 'DEBIT', false, true, 'Sinqee Bank Collection Account', 'system', NOW(), NOW(), (SELECT id FROM fnc_account WHERE account_code = '1113-0000')
WHERE NOT EXISTS (SELECT 1 FROM fnc_account WHERE account_code = '1113-0022');

-- 1113-0023: Tsedey Bank
INSERT INTO fnc_account (account_code, account_name, account_name_am, account_type, normal_balance, is_header, is_active, description, created_by, created_at, updated_at, parent_account_id)
SELECT '1113-0023', 'Tsedey Bank', 'ፀደይ ባንክ', 'ASSET', 'DEBIT', false, true, 'Tsedey Bank Collection Account', 'system', NOW(), NOW(), (SELECT id FROM fnc_account WHERE account_code = '1113-0000')
WHERE NOT EXISTS (SELECT 1 FROM fnc_account WHERE account_code = '1113-0023');

-- 1113-0024: CBE Birr
INSERT INTO fnc_account (account_code, account_name, account_name_am, account_type, normal_balance, is_header, is_active, description, created_by, created_at, updated_at, parent_account_id)
SELECT '1113-0024', 'CBE Birr', 'የሲቢኢ ብር', 'ASSET', 'DEBIT', false, true, 'CBE Birr Mobile Wallet Account', 'system', NOW(), NOW(), (SELECT id FROM fnc_account WHERE account_code = '1113-0000')
WHERE NOT EXISTS (SELECT 1 FROM fnc_account WHERE account_code = '1113-0024');

-- 1113-0025: Unicash / Derash Payment
INSERT INTO fnc_account (account_code, account_name, account_name_am, account_type, normal_balance, is_header, is_active, description, created_by, created_at, updated_at, parent_account_id)
SELECT '1113-0025', 'Unicash / Derash Payment', 'ዩኒካሽ / ደራሽ ክፍያ', 'ASSET', 'DEBIT', false, true, 'Unicash/Derash Payment Gateway Account', 'system', NOW(), NOW(), (SELECT id FROM fnc_account WHERE account_code = '1113-0000')
WHERE NOT EXISTS (SELECT 1 FROM fnc_account WHERE account_code = '1113-0025');

-- 1113-0026: Marda Arif Payment
INSERT INTO fnc_account (account_code, account_name, account_name_am, account_type, normal_balance, is_header, is_active, description, created_by, created_at, updated_at, parent_account_id)
SELECT '1113-0026', 'Marda Arif Payment', 'ማርዳ አሪፍ ክፍያ', 'ASSET', 'DEBIT', false, true, 'Marda Arif Payment Account', 'system', NOW(), NOW(), (SELECT id FROM fnc_account WHERE account_code = '1113-0000')
WHERE NOT EXISTS (SELECT 1 FROM fnc_account WHERE account_code = '1113-0026');
