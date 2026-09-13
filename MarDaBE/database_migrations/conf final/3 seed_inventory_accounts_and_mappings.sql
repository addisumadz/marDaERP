-- ==============================================================================
-- Seed Inventory Chart of Accounts, Finance Account Mappings, and Store Stock
-- ==============================================================================

-- 1. Insert Standard Postable Accounts into fnc_account (if not present)
INSERT INTO fnc_account (account_code, account_name, account_name_am, account_type, normal_balance, is_header, is_active, description, created_by, created_at)
SELECT '1300-0001', 'Inventory Asset', 'የዕቃ ንብረት ሂሳብ', 'ASSET', 'DEBIT', 0, 1, 'General inventory asset account for stored materials', 'system', NOW()
WHERE NOT EXISTS (SELECT 1 FROM fnc_account WHERE account_code = '1300-0001');

INSERT INTO fnc_account (account_code, account_name, account_name_am, account_type, normal_balance, is_header, is_active, description, created_by, created_at)
SELECT '2100-0001', 'Accounts Payable - Inventory / GR-IR', 'የሚከፈል እዳ (የዕቃ ግዢ)', 'LIABILITY', 'CREDIT', 0, 1, 'Accounts payable for goods received from suppliers', 'system', NOW()
WHERE NOT EXISTS (SELECT 1 FROM fnc_account WHERE account_code = '2100-0001');

INSERT INTO fnc_account (account_code, account_name, account_name_am, account_type, normal_balance, is_header, is_active, description, created_by, created_at)
SELECT '5100-0001', 'Cost of Goods Sold (COGS)', 'የተሸጡ ዕቃዎች ወጪ', 'EXPENSE', 'DEBIT', 0, 1, 'Cost of materials sold or issued for new connections/services', 'system', NOW()
WHERE NOT EXISTS (SELECT 1 FROM fnc_account WHERE account_code = '5100-0001');

INSERT INTO fnc_account (account_code, account_name, account_name_am, account_type, normal_balance, is_header, is_active, description, created_by, created_at)
SELECT '6200-0001', 'Operating Supplies Expense', 'የስራ ማስኬጃ ዕቃዎች ወጪ', 'EXPENSE', 'DEBIT', 0, 1, 'Internal supplies and maintenance materials consumed', 'system', NOW()
WHERE NOT EXISTS (SELECT 1 FROM fnc_account WHERE account_code = '6200-0001');

INSERT INTO fnc_account (account_code, account_name, account_name_am, account_type, normal_balance, is_header, is_active, description, created_by, created_at)
SELECT '6300-0001', 'Inventory Adjustment Gain', 'የዕቃ ማስተካከያ ትርፍ', 'REVENUE', 'CREDIT', 0, 1, 'Physical audit count surplus gain', 'system', NOW()
WHERE NOT EXISTS (SELECT 1 FROM fnc_account WHERE account_code = '6300-0001');

INSERT INTO fnc_account (account_code, account_name, account_name_am, account_type, normal_balance, is_header, is_active, description, created_by, created_at)
SELECT '6300-0002', 'Inventory Loss / Shrinkage', 'የዕቃ ብልሽት/ኪሳራ ወጪ', 'EXPENSE', 'DEBIT', 0, 1, 'Physical audit count shortage or damage write-off', 'system', NOW()
WHERE NOT EXISTS (SELECT 1 FROM fnc_account WHERE account_code = '6300-0002');

INSERT INTO fnc_account (account_code, account_name, account_name_am, account_type, normal_balance, is_header, is_active, description, created_by, created_at)
SELECT '1301-0001', 'Inventory In-Transit', 'ተቀባይ መጋዘን / ዝውውር', 'ASSET', 'DEBIT', 0, 1, 'Inter-store transfer transit account', 'system', NOW()
WHERE NOT EXISTS (SELECT 1 FROM fnc_account WHERE account_code = '1301-0001');


-- 2. Seed Pre-set Mappings in fnc_billing_account_map (INV_ keys)
DELETE FROM fnc_billing_account_map WHERE mapping_key IN (
  'INV_DR_GRN_ASSET', 'INV_CR_GRN_PAYABLE',
  'INV_DR_ISSUE_EXPENSE', 'INV_CR_ISSUE_ASSET',
  'INV_DR_SALE_COGS', 'INV_CR_SALE_ASSET',
  'INV_DR_ADJUST_GAIN_ASSET', 'INV_CR_ADJUST_GAIN_REV',
  'INV_DR_ADJUST_LOSS_EXP', 'INV_CR_ADJUST_LOSS_ASSET',
  'INV_DR_TRANSFER_ASSET', 'INV_CR_TRANSFER_ASSET'
);

INSERT INTO fnc_billing_account_map (mapping_key, account_id, label, created_at, updated_at)
SELECT 'INV_DR_GRN_ASSET', id, 'DR: የዕቃ መቀበያ ሰነድ (GRN Stock Intake)', NOW(), NOW()
FROM fnc_account WHERE account_code = '1300-0001';

INSERT INTO fnc_billing_account_map (mapping_key, account_id, label, created_at, updated_at)
SELECT 'INV_CR_GRN_PAYABLE', id, 'CR: የዕቃ መቀበያ ሰነድ (GRN Stock Intake)', NOW(), NOW()
FROM fnc_account WHERE account_code = '2100-0001';

INSERT INTO fnc_billing_account_map (mapping_key, account_id, label, created_at, updated_at)
SELECT 'INV_DR_ISSUE_EXPENSE', id, 'DR: የዕቃ ወጪ ሰነድ (Store Issue / Dept Consumption)', NOW(), NOW()
FROM fnc_account WHERE account_code = '6200-0001';

INSERT INTO fnc_billing_account_map (mapping_key, account_id, label, created_at, updated_at)
SELECT 'INV_CR_ISSUE_ASSET', id, 'CR: የዕቃ ወጪ ሰነድ (Store Issue / Dept Consumption)', NOW(), NOW()
FROM fnc_account WHERE account_code = '1300-0001';

INSERT INTO fnc_billing_account_map (mapping_key, account_id, label, created_at, updated_at)
SELECT 'INV_DR_SALE_COGS', id, 'DR: የዕቃ ሽያጭ / ወጪ (Customer Sale & COGS)', NOW(), NOW()
FROM fnc_account WHERE account_code = '5100-0001';

INSERT INTO fnc_billing_account_map (mapping_key, account_id, label, created_at, updated_at)
SELECT 'INV_CR_SALE_ASSET', id, 'CR: የዕቃ ሽያጭ / ወጪ (Customer Sale & COGS)', NOW(), NOW()
FROM fnc_account WHERE account_code = '1300-0001';

INSERT INTO fnc_billing_account_map (mapping_key, account_id, label, created_at, updated_at)
SELECT 'INV_DR_ADJUST_GAIN_ASSET', id, 'DR: የዕቃ ቆጠራ ትርፍ ማስተካከያ', NOW(), NOW()
FROM fnc_account WHERE account_code = '1300-0001';

INSERT INTO fnc_billing_account_map (mapping_key, account_id, label, created_at, updated_at)
SELECT 'INV_CR_ADJUST_GAIN_REV', id, 'CR: የዕቃ ቆጠራ ትርፍ ማስተካከያ', NOW(), NOW()
FROM fnc_account WHERE account_code = '6300-0001';

INSERT INTO fnc_billing_account_map (mapping_key, account_id, label, created_at, updated_at)
SELECT 'INV_DR_ADJUST_LOSS_EXP', id, 'DR: የዕቃ ቆጠራ ጉድለት/ብልሽት', NOW(), NOW()
FROM fnc_account WHERE account_code = '6300-0002';

INSERT INTO fnc_billing_account_map (mapping_key, account_id, label, created_at, updated_at)
SELECT 'INV_CR_ADJUST_LOSS_ASSET', id, 'CR: የዕቃ ቆጠራ ጉድለት/ብልሽት', NOW(), NOW()
FROM fnc_account WHERE account_code = '1300-0001';

INSERT INTO fnc_billing_account_map (mapping_key, account_id, label, created_at, updated_at)
SELECT 'INV_DR_TRANSFER_ASSET', id, 'DR: የዕቃ መጋዘን ዝውውር (Destination)', NOW(), NOW()
FROM fnc_account WHERE account_code = '1301-0001';

INSERT INTO fnc_billing_account_map (mapping_key, account_id, label, created_at, updated_at)
SELECT 'INV_CR_TRANSFER_ASSET', id, 'CR: የዕቃ መጋዘን ዝውውር (Source)', NOW(), NOW()
FROM fnc_account WHERE account_code = '1300-0001';

/*
-- 3. Seed Catalog Materials into inv_item (if not existing)
INSERT INTO inv_item (item_code, item_name, item_name_am, category_id, unit_of_measure_id, reorder_level, reorder_quantity, tracking_type, item_usage, default_unit_cost, is_active)
SELECT 'PIPE-00001', 'HDPE Pipe 1/2"', 'ኤች.ዲ.ፒ.ኢ. 1/2"', 1, 2, 10, 50, 'NONE', 'BOTH', 30.00, 1
WHERE NOT EXISTS (SELECT 1 FROM inv_item WHERE item_name = 'HDPE Pipe 1/2"' OR item_name = 'HDP pipe');

INSERT INTO inv_item (item_code, item_name, item_name_am, category_id, unit_of_measure_id, reorder_level, reorder_quantity, tracking_type, item_usage, default_unit_cost, is_active)
SELECT 'PIPE-00002', 'GI Pipe 1/2"', 'የብረት 1/2"', 1, 2, 10, 50, 'NONE', 'BOTH', 38.00, 1
WHERE NOT EXISTS (SELECT 1 FROM inv_item WHERE item_name = 'GI Pipe 1/2"');

INSERT INTO inv_item (item_code, item_name, item_name_am, category_id, unit_of_measure_id, reorder_level, reorder_quantity, tracking_type, item_usage, default_unit_cost, is_active)
SELECT 'FIT-00001', 'Male Adapter 1/2"', 'ወንድ አዳፕተር 1/2"', 1, 1, 20, 100, 'NONE', 'BOTH', 120.00, 1
WHERE NOT EXISTS (SELECT 1 FROM inv_item WHERE item_name = 'Male Adapter 1/2"');

INSERT INTO inv_item (item_code, item_name, item_name_am, category_id, unit_of_measure_id, reorder_level, reorder_quantity, tracking_type, item_usage, default_unit_cost, is_active)
SELECT 'FIT-00002', 'Female Adapter 1/2"', 'ሴት አዳፕተር 1/2"', 1, 1, 20, 100, 'NONE', 'BOTH', 28.00, 1
WHERE NOT EXISTS (SELECT 1 FROM inv_item WHERE item_name = 'Female Adapter 1/2"');

INSERT INTO inv_item (item_code, item_name, item_name_am, category_id, unit_of_measure_id, reorder_level, reorder_quantity, tracking_type, item_usage, default_unit_cost, is_active)
SELECT 'FIT-00003', 'Union / Saddle 1 1/2" - 1"', 'ዩኒየን /ሳድል ኮኔ 1 1/2" - 1"', 1, 1, 10, 50, 'NONE', 'BOTH', 55.00, 1
WHERE NOT EXISTS (SELECT 1 FROM inv_item WHERE item_name LIKE 'Union / Saddle%');

INSERT INTO inv_item (item_code, item_name, item_name_am, category_id, unit_of_measure_id, reorder_level, reorder_quantity, tracking_type, item_usage, default_unit_cost, is_active)
SELECT 'FIT-00004', 'Stop Valve 1/2"', 'ስቶፕ ቫልቭ/ኮክ 1/2"', 1, 1, 15, 60, 'NONE', 'BOTH', 52.00, 1
WHERE NOT EXISTS (SELECT 1 FROM inv_item WHERE item_name = 'Stop Valve 1/2"');

INSERT INTO inv_item (item_code, item_name, item_name_am, category_id, unit_of_measure_id, reorder_level, reorder_quantity, tracking_type, item_usage, default_unit_cost, is_active)
SELECT 'FIT-00005', 'Gate Valve 1/2"', 'ጌት ቫልቭ 1/2"', 1, 1, 15, 60, 'NONE', 'BOTH', 88.00, 1
WHERE NOT EXISTS (SELECT 1 FROM inv_item WHERE item_name = 'Gate Valve 1/2"');

INSERT INTO inv_item (item_code, item_name, item_name_am, category_id, unit_of_measure_id, reorder_level, reorder_quantity, tracking_type, item_usage, default_unit_cost, is_active)
SELECT 'FIT-00006', 'Teflon Tape', 'ቴፍሎን ቴፕ', 1, 1, 50, 200, 'NONE', 'BOTH', 18.00, 1
WHERE NOT EXISTS (SELECT 1 FROM inv_item WHERE item_name = 'Teflon Tape');

INSERT INTO inv_item (item_code, item_name, item_name_am, category_id, unit_of_measure_id, reorder_level, reorder_quantity, tracking_type, item_usage, default_unit_cost, is_active)
SELECT 'MTR-00001', 'Water Meter 1/2"', 'የውሃ ቆጣሪ 1/2"', 1, 1, 20, 100, 'NONE', 'BOTH', 950.00, 1
WHERE NOT EXISTS (SELECT 1 FROM inv_item WHERE item_name = 'Water Meter 1/2"' OR item_name = 'meter');

INSERT INTO inv_item (item_code, item_name, item_name_am, category_id, unit_of_measure_id, reorder_level, reorder_quantity, tracking_type, item_usage, default_unit_cost, is_active)
SELECT 'FIT-00007', 'Clamp Saddle', 'ክላምፕ ሳድል', 1, 1, 20, 80, 'NONE', 'BOTH', 65.00, 1
WHERE NOT EXISTS (SELECT 1 FROM inv_item WHERE item_name = 'Clamp Saddle');

INSERT INTO inv_item (item_code, item_name, item_name_am, category_id, unit_of_measure_id, reorder_level, reorder_quantity, tracking_type, item_usage, default_unit_cost, is_active)
SELECT 'FIT-00008', 'Nipple 1/2"', 'ኒፕል 1/2"', 1, 1, 30, 100, 'NONE', 'BOTH', 22.00, 1
WHERE NOT EXISTS (SELECT 1 FROM inv_item WHERE item_name = 'Nipple 1/2"');

INSERT INTO inv_item (item_code, item_name, item_name_am, category_id, unit_of_measure_id, reorder_level, reorder_quantity, tracking_type, item_usage, default_unit_cost, is_active)
SELECT 'FIT-00009', 'Elbow 1/2"', 'ክርን 1/2"', 1, 1, 30, 100, 'NONE', 'BOTH', 32.00, 1
WHERE NOT EXISTS (SELECT 1 FROM inv_item WHERE item_name = 'Elbow 1/2"');

INSERT INTO inv_item (item_code, item_name, item_name_am, category_id, unit_of_measure_id, reorder_level, reorder_quantity, tracking_type, item_usage, default_unit_cost, is_active)
SELECT 'FIT-00010', 'Compression Tee 1/2"', 'ኮምፕረሽን ቲ 1/2"', 1, 1, 20, 80, 'NONE', 'BOTH', 14.00, 1
WHERE NOT EXISTS (SELECT 1 FROM inv_item WHERE item_name = 'Compression Tee 1/2"');

INSERT INTO inv_item (item_code, item_name, item_name_am, category_id, unit_of_measure_id, reorder_level, reorder_quantity, tracking_type, item_usage, default_unit_cost, is_active)
SELECT 'FIT-00011', 'End Cap 1/2"', 'እንዲ ካፕ 1/2"', 1, 1, 20, 80, 'NONE', 'BOTH', 24.00, 1
WHERE NOT EXISTS (SELECT 1 FROM inv_item WHERE item_name = 'End Cap 1/2"');

INSERT INTO inv_item (item_code, item_name, item_name_am, category_id, unit_of_measure_id, reorder_level, reorder_quantity, tracking_type, item_usage, default_unit_cost, is_active)
SELECT 'FIT-00012', 'Coupling Reducer 1" - 1/2"', 'ኮፕሊንግ ሪዲውሰር 1" - 1/2"', 1, 1, 20, 80, 'NONE', 'BOTH', 62.00, 1
WHERE NOT EXISTS (SELECT 1 FROM inv_item WHERE item_name = 'Coupling Reducer 1" - 1/2"');

INSERT INTO inv_item (item_code, item_name, item_name_am, category_id, unit_of_measure_id, reorder_level, reorder_quantity, tracking_type, item_usage, default_unit_cost, is_active)
SELECT 'PIPE-00003', 'GI Pipe Full Length', 'ባለሙሉ ርዝመት ብረት', 1, 2, 5, 20, 'NONE', 'BOTH', 190.00, 1
WHERE NOT EXISTS (SELECT 1 FROM inv_item WHERE item_name = 'GI Pipe Full Length');


-- 4. Link custom_common_material to inv_item using COLLATE utf8mb4_unicode_ci
UPDATE custom_common_material c
JOIN inv_item i ON (
   c.material_name COLLATE utf8mb4_unicode_ci = i.item_name COLLATE utf8mb4_unicode_ci
   OR (c.material_name COLLATE utf8mb4_unicode_ci LIKE '%HDPE Pipe%' AND (i.item_name COLLATE utf8mb4_unicode_ci LIKE '%HDPE%' OR i.item_name COLLATE utf8mb4_unicode_ci = 'HDP pipe'))
   OR (c.material_name COLLATE utf8mb4_unicode_ci LIKE '%Water Meter%' AND (i.item_name COLLATE utf8mb4_unicode_ci LIKE '%Water Meter%' OR i.item_name COLLATE utf8mb4_unicode_ci = 'meter'))
   OR (c.material_name COLLATE utf8mb4_unicode_ci LIKE '%GI Pipe%' AND i.item_name COLLATE utf8mb4_unicode_ci LIKE '%GI Pipe%')
   OR (c.material_name COLLATE utf8mb4_unicode_ci LIKE '%Male Adapter%' AND i.item_name COLLATE utf8mb4_unicode_ci LIKE '%Male Adapter%')
   OR (c.material_name COLLATE utf8mb4_unicode_ci LIKE '%Female Adapter%' AND i.item_name COLLATE utf8mb4_unicode_ci LIKE '%Female Adapter%')
   OR (c.material_name COLLATE utf8mb4_unicode_ci LIKE '%Union%' AND i.item_name COLLATE utf8mb4_unicode_ci LIKE '%Union%')
   OR (c.material_name COLLATE utf8mb4_unicode_ci LIKE '%Stop Valve%' AND i.item_name COLLATE utf8mb4_unicode_ci LIKE '%Stop Valve%')
   OR (c.material_name COLLATE utf8mb4_unicode_ci LIKE '%Gate Valve%' AND i.item_name COLLATE utf8mb4_unicode_ci LIKE '%Gate Valve%')
   OR (c.material_name COLLATE utf8mb4_unicode_ci LIKE '%Teflon%' AND i.item_name COLLATE utf8mb4_unicode_ci LIKE '%Teflon%')
   OR (c.material_name COLLATE utf8mb4_unicode_ci LIKE '%Clamp Saddle%' AND i.item_name COLLATE utf8mb4_unicode_ci LIKE '%Clamp Saddle%')
   OR (c.material_name COLLATE utf8mb4_unicode_ci LIKE '%Nipple%' AND i.item_name COLLATE utf8mb4_unicode_ci LIKE '%Nipple%')
   OR (c.material_name COLLATE utf8mb4_unicode_ci LIKE '%Elbow%' AND i.item_name COLLATE utf8mb4_unicode_ci LIKE '%Elbow%')
   OR (c.material_name COLLATE utf8mb4_unicode_ci LIKE '%Compression Tee%' AND i.item_name COLLATE utf8mb4_unicode_ci LIKE '%Compression Tee%')
   OR (c.material_name COLLATE utf8mb4_unicode_ci LIKE '%End Cap%' AND i.item_name COLLATE utf8mb4_unicode_ci LIKE '%End Cap%')
   OR (c.material_name COLLATE utf8mb4_unicode_ci LIKE '%Reducer%' AND i.item_name COLLATE utf8mb4_unicode_ci LIKE '%Reducer%')
)
SET c.inv_item_id = i.id
WHERE c.inv_item_id IS NULL;


-- 5. Link custom_maintenance_common_material to inv_item using COLLATE utf8mb4_unicode_ci
UPDATE custom_maintenance_common_material c
JOIN inv_item i ON (
   c.material_name COLLATE utf8mb4_unicode_ci = i.item_name COLLATE utf8mb4_unicode_ci
   OR (c.material_name COLLATE utf8mb4_unicode_ci LIKE '%HDPE Pipe%' AND (i.item_name COLLATE utf8mb4_unicode_ci LIKE '%HDPE%' OR i.item_name COLLATE utf8mb4_unicode_ci = 'HDP pipe'))
   OR (c.material_name COLLATE utf8mb4_unicode_ci LIKE '%Water Meter%' AND (i.item_name COLLATE utf8mb4_unicode_ci LIKE '%Water Meter%' OR i.item_name COLLATE utf8mb4_unicode_ci = 'meter'))
   OR (c.material_name COLLATE utf8mb4_unicode_ci LIKE '%GI Pipe%' AND i.item_name COLLATE utf8mb4_unicode_ci LIKE '%GI Pipe%')
   OR (c.material_name COLLATE utf8mb4_unicode_ci LIKE '%Male Adapter%' AND i.item_name COLLATE utf8mb4_unicode_ci LIKE '%Male Adapter%')
   OR (c.material_name COLLATE utf8mb4_unicode_ci LIKE '%Female Adapter%' AND i.item_name COLLATE utf8mb4_unicode_ci LIKE '%Female Adapter%')
   OR (c.material_name COLLATE utf8mb4_unicode_ci LIKE '%Union%' AND i.item_name COLLATE utf8mb4_unicode_ci LIKE '%Union%')
   OR (c.material_name COLLATE utf8mb4_unicode_ci LIKE '%Stop Valve%' AND i.item_name COLLATE utf8mb4_unicode_ci LIKE '%Stop Valve%')
   OR (c.material_name COLLATE utf8mb4_unicode_ci LIKE '%Gate Valve%' AND i.item_name COLLATE utf8mb4_unicode_ci LIKE '%Gate Valve%')
   OR (c.material_name COLLATE utf8mb4_unicode_ci LIKE '%Teflon%' AND i.item_name COLLATE utf8mb4_unicode_ci LIKE '%Teflon%')
   OR (c.material_name COLLATE utf8mb4_unicode_ci LIKE '%Clamp Saddle%' AND i.item_name COLLATE utf8mb4_unicode_ci LIKE '%Clamp Saddle%')
   OR (c.material_name COLLATE utf8mb4_unicode_ci LIKE '%Nipple%' AND i.item_name COLLATE utf8mb4_unicode_ci LIKE '%Nipple%')
   OR (c.material_name COLLATE utf8mb4_unicode_ci LIKE '%Elbow%' AND i.item_name COLLATE utf8mb4_unicode_ci LIKE '%Elbow%')
   OR (c.material_name COLLATE utf8mb4_unicode_ci LIKE '%Compression Tee%' AND i.item_name COLLATE utf8mb4_unicode_ci LIKE '%Compression Tee%')
   OR (c.material_name COLLATE utf8mb4_unicode_ci LIKE '%End Cap%' AND i.item_name COLLATE utf8mb4_unicode_ci LIKE '%End Cap%')
   OR (c.material_name COLLATE utf8mb4_unicode_ci LIKE '%Reducer%' AND i.item_name COLLATE utf8mb4_unicode_ci LIKE '%Reducer%')
)
SET c.inv_item_id = i.id
WHERE c.inv_item_id IS NULL;


-- 6. Seed Initial Stock in inv_item_store_stock for All Active Stores
INSERT INTO inv_item_store_stock (item_id, store_id, quantity_on_hand, quantity_reserved, quantity_on_order, weighted_avg_cost, created_at, updated_at)
SELECT i.id, s.id, 100.0000, 0.0000, 0.0000, 
       COALESCE(i.default_unit_cost, 50.0000), NOW(), NOW()
FROM inv_item i
CROSS JOIN inv_store s
WHERE s.is_active = 1
  AND NOT EXISTS (
    SELECT 1 FROM inv_item_store_stock st WHERE st.item_id = i.id AND st.store_id = s.id
  );

*/