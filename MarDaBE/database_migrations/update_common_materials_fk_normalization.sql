-- =========================================================================================
-- MarDa ERP Database Migration: Normalize Common Materials to InvItem Foreign Key
-- Target Tables: custom_common_material, custom_maintenance_common_material, inv_item
-- =========================================================================================

-- -----------------------------------------------------------------------------------------
-- STEP 1: Relax Constraints on Redundant Columns & Add Missing Foreign Keys / Indexes
-- -----------------------------------------------------------------------------------------

-- 1.1 custom_common_material: make redundant mirrored columns nullable
ALTER TABLE `custom_common_material`
    MODIFY COLUMN `material_code` VARCHAR(50) NULL,
    MODIFY COLUMN `material_name` VARCHAR(200) NULL,
    MODIFY COLUMN `material_name_am` VARCHAR(200) NULL,
    MODIFY COLUMN `unit_of_measure` VARCHAR(50) NULL DEFAULT 'በቁጥር',
    MODIFY COLUMN `default_unit_price` DECIMAL(15,2) NULL DEFAULT 0.00;

-- Ensure foreign key constraint exists on custom_common_material
SET @fk_exists = (
    SELECT COUNT(*) FROM information_schema.TABLE_CONSTRAINTS 
    WHERE CONSTRAINT_SCHEMA = DATABASE() 
      AND TABLE_NAME = 'custom_common_material' 
      AND CONSTRAINT_NAME = 'fk_ccm_inv_item'
);
SET @sql = IF(@fk_exists = 0, 
    'ALTER TABLE `custom_common_material` ADD CONSTRAINT `fk_ccm_inv_item` FOREIGN KEY (`inv_item_id`) REFERENCES `inv_item` (`id`) ON DELETE SET NULL', 
    'SELECT "FK fk_ccm_inv_item already exists"'
);
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

-- 1.2 custom_maintenance_common_material: make redundant columns nullable
ALTER TABLE `custom_maintenance_common_material`
    MODIFY COLUMN `material_code` VARCHAR(50) NULL,
    MODIFY COLUMN `material_name` VARCHAR(200) NULL,
    MODIFY COLUMN `material_name_am` VARCHAR(200) NULL,
    MODIFY COLUMN `unit_of_measure` VARCHAR(50) NULL DEFAULT 'በቁጥር',
    MODIFY COLUMN `default_unit_price` DECIMAL(15,2) NULL DEFAULT 0.00;

-- Ensure index and foreign key constraint exist on custom_maintenance_common_material for inv_item_id
SET @idx_exists = (
    SELECT COUNT(*) FROM information_schema.STATISTICS 
    WHERE TABLE_SCHEMA = DATABASE() 
      AND TABLE_NAME = 'custom_maintenance_common_material' 
      AND INDEX_NAME = 'idx_cmm_inv_item'
);
SET @sql_idx = IF(@idx_exists = 0, 
    'ALTER TABLE `custom_maintenance_common_material` ADD INDEX `idx_cmm_inv_item` (`inv_item_id`)', 
    'SELECT "Index idx_cmm_inv_item already exists"'
);
PREPARE stmt_idx FROM @sql_idx; EXECUTE stmt_idx; DEALLOCATE PREPARE stmt_idx;

SET @fk_exists2 = (
    SELECT COUNT(*) FROM information_schema.TABLE_CONSTRAINTS 
    WHERE CONSTRAINT_SCHEMA = DATABASE() 
      AND TABLE_NAME = 'custom_maintenance_common_material' 
      AND CONSTRAINT_NAME = 'fk_cmm_inv_item'
);
SET @sql_fk2 = IF(@fk_exists2 = 0, 
    'ALTER TABLE `custom_maintenance_common_material` ADD CONSTRAINT `fk_cmm_inv_item` FOREIGN KEY (`inv_item_id`) REFERENCES `inv_item` (`id`) ON DELETE SET NULL', 
    'SELECT "FK fk_cmm_inv_item already exists"'
);
PREPARE stmt_fk2 FROM @sql_fk2; EXECUTE stmt_fk2; DEALLOCATE PREPARE stmt_fk2;


-- -----------------------------------------------------------------------------------------
-- STEP 2: Automatic Data Linking (Backfill inv_item_id where currently NULL)
-- -----------------------------------------------------------------------------------------

-- 2.1 Auto-link custom_common_material by matching item_code or item names
UPDATE custom_common_material c
JOIN inv_item i ON (
    c.material_code = i.item_code
    OR c.material_name COLLATE utf8mb4_unicode_ci = i.item_name COLLATE utf8mb4_unicode_ci
    OR c.material_name_am COLLATE utf8mb4_unicode_ci = i.item_name_am COLLATE utf8mb4_unicode_ci
)
SET c.inv_item_id = i.id
WHERE c.inv_item_id IS NULL;

-- 2.2 Auto-link custom_maintenance_common_material by matching item_code or item names
UPDATE custom_maintenance_common_material m
JOIN inv_item i ON (
    m.material_code = i.item_code
    OR m.material_name COLLATE utf8mb4_unicode_ci = i.item_name COLLATE utf8mb4_unicode_ci
    OR m.material_name_am COLLATE utf8mb4_unicode_ci = i.item_name_am COLLATE utf8mb4_unicode_ci
)
SET m.inv_item_id = i.id
WHERE m.inv_item_id IS NULL;


-- -----------------------------------------------------------------------------------------
-- STEP 3: Synchronize Authoritative Master Prices & Details into inv_item
-- -----------------------------------------------------------------------------------------

-- 3.1 If inv_item default_unit_cost is 0.00, copy active price from custom_common_material
UPDATE inv_item i
JOIN custom_common_material c ON c.inv_item_id = i.id
SET i.default_unit_cost = c.default_unit_price
WHERE (i.default_unit_cost IS NULL OR i.default_unit_cost = 0)
  AND c.default_unit_price > 0;

-- 3.2 If inv_item default_unit_cost is still 0.00, copy active price from maintenance catalog
UPDATE inv_item i
JOIN custom_maintenance_common_material m ON m.inv_item_id = i.id
SET i.default_unit_cost = m.default_unit_price
WHERE (i.default_unit_cost IS NULL OR i.default_unit_cost = 0)
  AND m.default_unit_price > 0;

-- 3.3 Synchronize mirrored columns in common material tables from inv_item for 100% consistency
UPDATE custom_common_material c
JOIN inv_item i ON c.inv_item_id = i.id
SET 
    c.material_code = i.item_code,
    c.material_name = i.item_name,
    c.material_name_am = COALESCE(NULLIF(i.item_name_am, ''), i.item_name),
    c.default_unit_price = i.default_unit_cost,
    c.is_water_meter = i.is_water_meter;

UPDATE custom_maintenance_common_material m
JOIN inv_item i ON m.inv_item_id = i.id
SET 
    m.material_code = i.item_code,
    m.material_name = i.item_name,
    m.material_name_am = COALESCE(NULLIF(i.item_name_am, ''), i.item_name),
    m.default_unit_price = i.default_unit_cost,
    m.is_water_meter = i.is_water_meter;


-- -----------------------------------------------------------------------------------------
-- STEP 4: Verification Queries (Run to confirm successful migration)
-- -----------------------------------------------------------------------------------------

-- Check linked vs unlinked items in New Line Common Materials:
SELECT 
    COUNT(*) AS total_items,
    SUM(CASE WHEN inv_item_id IS NOT NULL THEN 1 ELSE 0 END) AS linked_to_inv_item,
    SUM(CASE WHEN inv_item_id IS NULL THEN 1 ELSE 0 END) AS unlinked_items
FROM custom_common_material;

-- Check linked vs unlinked items in Maintenance Common Materials:
SELECT 
    COUNT(*) AS total_items,
    SUM(CASE WHEN inv_item_id IS NOT NULL THEN 1 ELSE 0 END) AS linked_to_inv_item,
    SUM(CASE WHEN inv_item_id IS NULL THEN 1 ELSE 0 END) AS unlinked_items
FROM custom_maintenance_common_material;

-- Preview joined catalog showing data pulled directly from inv_item:
SELECT 
    c.id AS catalog_id,
    c.display_order,
    i.item_code,
    i.item_name,
    i.item_name_am,
    i.default_unit_cost AS master_sale_price,
    c.is_active
FROM custom_common_material c
LEFT JOIN inv_item i ON c.inv_item_id = i.id
ORDER BY c.display_order ASC;
