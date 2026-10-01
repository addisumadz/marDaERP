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

-- Add material_request_id column to inv_issue_voucher (FK managed by JPA)
ALTER TABLE inv_issue_voucher ADD COLUMN IF NOT EXISTS material_request_id BIGINT;

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
