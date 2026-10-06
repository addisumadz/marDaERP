

-- 1. Add columns for Rejection and Cancellation tracking
ALTER TABLE `custom_new_line_connection_request`
    ADD COLUMN `rejection_reason` TEXT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL AFTER `updated_at`,
    ADD COLUMN `rejected_by` VARCHAR(100) NULL AFTER `rejection_reason`,
    ADD COLUMN `rejected_date` DATETIME NULL AFTER `rejected_by`,
    ADD COLUMN `cancellation_reason` TEXT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL AFTER `rejected_date`;

-- 2. Performance index for status and branch queries
CREATE INDEX `idx_cnl_status_branch` ON `custom_new_line_connection_request` (`status`, `branch_id`);


ALTER TABLE custom_maintenance_request
  ADD COLUMN rejection_reason TEXT NULL,
  ADD COLUMN rejected_by VARCHAR(100) NULL,
  ADD COLUMN rejected_date DATETIME NULL,
  ADD COLUMN cancellation_reason TEXT NULL;

wbill_jwns9
-- 1. Master Inventory Items Table
ALTER TABLE inv_item 
  ADD COLUMN is_water_meter TINYINT(1) NOT NULL DEFAULT 0;

-- 2. New Line Connection Common Materials Catalog
ALTER TABLE custom_common_material 
  ADD COLUMN is_water_meter TINYINT(1) NOT NULL DEFAULT 0;

-- 3. Maintenance Common Materials Catalog
ALTER TABLE custom_maintenance_common_material 
  ADD COLUMN is_water_meter TINYINT(1) NOT NULL DEFAULT 0;

-- 4. New Line Connection Encoded Items Table
ALTER TABLE custom_new_line_item 
  ADD COLUMN is_water_meter TINYINT(1) NOT NULL DEFAULT 0;

-- 5. Maintenance Encoded Items Table
ALTER TABLE custom_maintenance_item 
  ADD COLUMN is_water_meter TINYINT(1) NOT NULL DEFAULT 0;



--==========================================

ALTER TABLE inv_purchase_order
    ADD COLUMN rejected_by VARCHAR(100) NULL AFTER remarks,
    ADD COLUMN rejected_date DATETIME NULL AFTER rejected_by,
    ADD COLUMN rejection_reason VARCHAR(500) NULL AFTER rejected_date;


--===========================



-- 1.1 custom_common_material (New Line Connection catalog)
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

-- 1.2 custom_maintenance_common_material (Maintenance catalog)
ALTER TABLE `custom_maintenance_common_material`
    MODIFY COLUMN `material_code` VARCHAR(50) NULL,
    MODIFY COLUMN `material_name` VARCHAR(200) NULL,
    MODIFY COLUMN `material_name_am` VARCHAR(200) NULL,
    MODIFY COLUMN `unit_of_measure` VARCHAR(50) NULL DEFAULT 'በቁጥር',
    MODIFY COLUMN `default_unit_price` DECIMAL(15,2) NULL DEFAULT 0.00;

-- Ensure index and foreign key constraint exist for inv_item_id
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

=======================================================


SET FOREIGN_KEY_CHECKS = 0;
-- Truncate catalog tables
TRUNCATE TABLE custom_common_material;
TRUNCATE TABLE custom_maintenance_common_material;
SET FOREIGN_KEY_CHECKS = 1;

-- Drop redundant columns from custom_common_material
ALTER TABLE `custom_common_material`
    DROP COLUMN `material_code`,
    DROP COLUMN `material_name`,
    DROP COLUMN `material_name_am`,
    DROP COLUMN `unit_of_measure`,
    DROP COLUMN `default_unit_price`;

-- Drop redundant columns from custom_maintenance_common_material
ALTER TABLE `custom_maintenance_common_material`
    DROP COLUMN `material_code`,
    DROP COLUMN `material_name`,
    DROP COLUMN `material_name_am`,
    DROP COLUMN `unit_of_measure`,
    DROP COLUMN `default_unit_price`;



--===================== inventory update ================

-- =============================================
-- MarDaERP Inventory Module Upgrade Migration
-- All phases: Material Requests, Return Vouchers,
-- Stock Count, Disposal & Write-Off
-- =============================================

-- =============================================
-- Phase 1: Material Requests
-- =============================================

CREATE TABLE IF NOT EXISTS inv_material_request (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    request_number VARCHAR(50) NOT NULL UNIQUE,
    store_id INT NOT NULL,
    department_id INT,
    branch_id INT,
    requested_by VARCHAR(200) NOT NULL,
    requested_date DATE NOT NULL,
    needed_by_date DATE,
    priority VARCHAR(20) NOT NULL DEFAULT 'NORMAL',
    status VARCHAR(30) NOT NULL DEFAULT 'DRAFT',
    purpose VARCHAR(500),
    remarks VARCHAR(500),
    total_estimated_amount DECIMAL(15,2) DEFAULT 0,
    workflow_instance_id BIGINT,
    issue_voucher_id BIGINT,
    created_by VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (store_id) REFERENCES inv_store(id),
    FOREIGN KEY (department_id) REFERENCES hrms_department(id),
    FOREIGN KEY (branch_id) REFERENCES branch(id),
    FOREIGN KEY (issue_voucher_id) REFERENCES inv_issue_voucher(id),
    FOREIGN KEY (workflow_instance_id) REFERENCES wf_workflow_instance(id)
);

CREATE TABLE IF NOT EXISTS inv_material_request_line (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    material_request_id BIGINT NOT NULL,
    item_id BIGINT NOT NULL,
    line_order INT NOT NULL DEFAULT 1,
    requested_quantity DECIMAL(15,4) NOT NULL,
    approved_quantity DECIMAL(15,4),
    issued_quantity DECIMAL(15,4) DEFAULT 0,
    estimated_unit_cost DECIMAL(15,4) DEFAULT 0,
    remarks VARCHAR(500),
    FOREIGN KEY (material_request_id) REFERENCES inv_material_request(id) ON DELETE CASCADE,
    FOREIGN KEY (item_id) REFERENCES inv_item(id)
);

-- Add material_request_id column to inv_issue_voucher
ALTER TABLE inv_issue_voucher ADD FOREIGN KEY fk_iv_material_request (material_request_id) REFERENCES inv_material_request(id);

-- =============================================
-- Phase 2: Return Vouchers (Model 21 / SRV)
-- =============================================

CREATE TABLE IF NOT EXISTS inv_return_voucher (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    voucher_number VARCHAR(50) NOT NULL UNIQUE,
    store_id INT NOT NULL,
    branch_id INT,
    return_type VARCHAR(30) NOT NULL,
    original_issue_voucher_id BIGINT,
    original_grn_id BIGINT,
    supplier_id BIGINT,
    returned_by VARCHAR(200),
    department VARCHAR(200),
    return_date DATE NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'DRAFT',
    approved_by VARCHAR(100),
    approved_date TIMESTAMP,
    received_by VARCHAR(100),
    total_amount DECIMAL(15,2) DEFAULT 0,
    journal_entry_id BIGINT,
    reason VARCHAR(500),
    remarks VARCHAR(500),
    created_by VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (store_id) REFERENCES inv_store(id),
    FOREIGN KEY (branch_id) REFERENCES branch(id),
    FOREIGN KEY (original_issue_voucher_id) REFERENCES inv_issue_voucher(id),
    FOREIGN KEY (original_grn_id) REFERENCES inv_goods_received_note(id),
    FOREIGN KEY (supplier_id) REFERENCES inv_supplier(id),
    FOREIGN KEY (journal_entry_id) REFERENCES fnc_journal_entry(id)
);

CREATE TABLE IF NOT EXISTS inv_return_voucher_line (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    return_voucher_id BIGINT NOT NULL,
    item_id BIGINT NOT NULL,
    line_order INT NOT NULL DEFAULT 1,
    quantity DECIMAL(15,4) NOT NULL,
    unit_cost DECIMAL(15,4) DEFAULT 0,
    total_cost DECIMAL(15,2) DEFAULT 0,
    condition_status VARCHAR(30) DEFAULT 'GOOD',
    remarks VARCHAR(500),
    FOREIGN KEY (return_voucher_id) REFERENCES inv_return_voucher(id) ON DELETE CASCADE,
    FOREIGN KEY (item_id) REFERENCES inv_item(id)
);

-- =============================================
-- Phase 3: Physical Stock Count
-- =============================================

CREATE TABLE IF NOT EXISTS inv_stock_count (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    count_number VARCHAR(50) NOT NULL UNIQUE,
    store_id INT NOT NULL,
    branch_id INT,
    count_date DATE NOT NULL,
    count_scope VARCHAR(20) NOT NULL DEFAULT 'FULL',
    category_filter_id INT,
    status VARCHAR(20) NOT NULL DEFAULT 'PLANNED',
    counted_by VARCHAR(100),
    verified_by VARCHAR(100),
    verified_date TIMESTAMP,
    total_system_value DECIMAL(15,2) DEFAULT 0,
    total_physical_value DECIMAL(15,2) DEFAULT 0,
    total_variance_value DECIMAL(15,2) DEFAULT 0,
    stock_adjustment_id BIGINT,
    remarks VARCHAR(500),
    created_by VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (store_id) REFERENCES inv_store(id),
    FOREIGN KEY (branch_id) REFERENCES branch(id),
    FOREIGN KEY (category_filter_id) REFERENCES inv_item_category(id),
    FOREIGN KEY (stock_adjustment_id) REFERENCES inv_stock_adjustment(id)
);

CREATE TABLE IF NOT EXISTS inv_stock_count_line (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    stock_count_id BIGINT NOT NULL,
    item_id BIGINT NOT NULL,
    system_quantity DECIMAL(15,4) NOT NULL,
    physical_quantity DECIMAL(15,4),
    variance_quantity DECIMAL(15,4),
    unit_cost DECIMAL(15,4) DEFAULT 0,
    variance_value DECIMAL(15,2) DEFAULT 0,
    is_counted BOOLEAN NOT NULL DEFAULT FALSE,
    remarks VARCHAR(500),
    FOREIGN KEY (stock_count_id) REFERENCES inv_stock_count(id) ON DELETE CASCADE,
    FOREIGN KEY (item_id) REFERENCES inv_item(id)
);

-- =============================================
-- Phase 4: Disposal & Write-Off
-- =============================================

CREATE TABLE IF NOT EXISTS inv_disposal (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    disposal_number VARCHAR(50) NOT NULL UNIQUE,
    store_id INT NOT NULL,
    branch_id INT,
    disposal_type VARCHAR(30) NOT NULL,
    disposal_date DATE NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'DRAFT',
    total_amount DECIMAL(15,2) DEFAULT 0,
    workflow_instance_id BIGINT,
    journal_entry_id BIGINT,
    reason TEXT,
    disposal_method VARCHAR(200),
    committee_members VARCHAR(500),
    remarks VARCHAR(500),
    created_by VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (store_id) REFERENCES inv_store(id),
    FOREIGN KEY (branch_id) REFERENCES branch(id),
    FOREIGN KEY (journal_entry_id) REFERENCES fnc_journal_entry(id),
    FOREIGN KEY (workflow_instance_id) REFERENCES wf_workflow_instance(id)
);

CREATE TABLE IF NOT EXISTS inv_disposal_line (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    disposal_id BIGINT NOT NULL,
    item_id BIGINT NOT NULL,
    line_order INT NOT NULL DEFAULT 1,
    quantity DECIMAL(15,4) NOT NULL,
    unit_cost DECIMAL(15,4) DEFAULT 0,
    total_cost DECIMAL(15,2) DEFAULT 0,
    reason VARCHAR(500),
    remarks VARCHAR(500),
    FOREIGN KEY (disposal_id) REFERENCES inv_disposal(id) ON DELETE CASCADE,
    FOREIGN KEY (item_id) REFERENCES inv_item(id)
);

-- =============================================
-- Indexes for performance
-- =============================================

CREATE INDEX IF NOT EXISTS idx_inv_mr_status ON inv_material_request(status);
CREATE INDEX IF NOT EXISTS idx_inv_mr_branch ON inv_material_request(branch_id);
CREATE INDEX IF NOT EXISTS idx_inv_mr_store ON inv_material_request(store_id);
CREATE INDEX IF NOT EXISTS idx_inv_mr_dept ON inv_material_request(department_id);

CREATE INDEX IF NOT EXISTS idx_inv_rv_status ON inv_return_voucher(status);
CREATE INDEX IF NOT EXISTS idx_inv_rv_type ON inv_return_voucher(return_type);
CREATE INDEX IF NOT EXISTS idx_inv_rv_store ON inv_return_voucher(store_id);
CREATE INDEX IF NOT EXISTS idx_inv_rv_orig_iv ON inv_return_voucher(original_issue_voucher_id);

CREATE INDEX IF NOT EXISTS idx_inv_sc_status ON inv_stock_count(status);
CREATE INDEX IF NOT EXISTS idx_inv_sc_store ON inv_stock_count(store_id);

CREATE INDEX IF NOT EXISTS idx_inv_dsp_status ON inv_disposal(status);
CREATE INDEX IF NOT EXISTS idx_inv_dsp_store ON inv_disposal(store_id);


----======================================================


-- ─── 1. Add vatRate to inv_item ─────────────────────────────
-- Default VAT rate per item (auto-fills on PO line selection)
ALTER TABLE inv_item
    ADD COLUMN vat_rate DECIMAL(5,2) DEFAULT 15.00 AFTER default_unit_cost;
-- Set all existing items to 15% default
UPDATE inv_item SET vat_rate = 15.00 WHERE vat_rate IS NULL;
-- ─── 2. Add per-line VAT fields to inv_purchase_order_line ──
ALTER TABLE inv_purchase_order_line
    ADD COLUMN vat_rate DECIMAL(5,2) DEFAULT 15.00 AFTER total_price,
    ADD COLUMN vat_amount DECIMAL(15,2) DEFAULT 0.00 AFTER vat_rate;
-- ─── 3. Backfill existing PO lines with PO header's vatRate ─
-- This ensures existing POs display correctly with per-line VAT
UPDATE inv_purchase_order_line pol
JOIN inv_purchase_order po ON pol.purchase_order_id = po.id
SET pol.vat_rate = po.vat_rate,
    pol.vat_amount = ROUND(pol.total_price * po.vat_rate / 100, 2);
	
	
--- ======================v 5 diff ===========================================


-- Add nullable employee_id to user_account
ALTER TABLE user_account 
    ADD COLUMN employee_id INT(11) NULL AFTER role_id;

-- Add foreign key constraint (nullified if employee is removed)
ALTER TABLE user_account 
    ADD CONSTRAINT fk_user_account_employee 
    FOREIGN KEY (employee_id) REFERENCES hrms_employee_info(id) 
    ON DELETE SET NULL;

-- Add index for fast user lookup by employee ID
CREATE INDEX idx_user_account_employee ON user_account(employee_id);


-- Allow store_id to be optional for office/departmental purchase requisitions
ALTER TABLE inv_purchase_requisition 
    MODIFY COLUMN store_id INT(11) NULL;

-- Add department, employee, and position title columns
ALTER TABLE inv_purchase_requisition 
    ADD COLUMN department_id INT(11) NULL AFTER store_id,
    ADD COLUMN employee_id INT(11) NULL AFTER department_id,
    ADD COLUMN position_title VARCHAR(150) NULL AFTER employee_id;

-- Add foreign keys for referential integrity
ALTER TABLE inv_purchase_requisition 
    ADD CONSTRAINT fk_pr_department 
    FOREIGN KEY (department_id) REFERENCES hrms_departments(id) 
    ON DELETE SET NULL;

ALTER TABLE inv_purchase_requisition 
    ADD CONSTRAINT fk_pr_employee 
    FOREIGN KEY (employee_id) REFERENCES hrms_employee_info(id) 
    ON DELETE SET NULL;
