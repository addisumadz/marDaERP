
-------------------------------- finance UPDATE
ALTER TABLE billing_reading ADD COLUMN reader_gps VARCHAR(255) NULL AFTER bill_description_bank;


-- Fiscal Year / Accounting Period
CREATE TABLE IF NOT EXISTS fnc_fiscal_year (
    id INT AUTO_INCREMENT PRIMARY KEY,
    fiscal_year_name VARCHAR(100) NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    is_closed TINYINT(1) DEFAULT 0,
    created_by VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Chart of Accounts
CREATE TABLE IF NOT EXISTS fnc_account (
    id INT AUTO_INCREMENT PRIMARY KEY,
    account_code VARCHAR(20) NOT NULL UNIQUE,
    account_name VARCHAR(200) NOT NULL,
    account_name_am VARCHAR(200),
    account_type ENUM('ASSET','LIABILITY','EQUITY','REVENUE','EXPENSE') NOT NULL,
    parent_account_id INT,
    is_active TINYINT(1) DEFAULT 1,
    is_header TINYINT(1) DEFAULT 0,
    normal_balance ENUM('DEBIT','CREDIT') NOT NULL,
    description VARCHAR(500),
    created_by VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (parent_account_id) REFERENCES fnc_account(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Journal Entry Header
CREATE TABLE IF NOT EXISTS fnc_journal_entry (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    entry_number VARCHAR(50) NOT NULL UNIQUE,
    entry_date DATE NOT NULL,
    fiscal_year_id INT NOT NULL,
    reference_number VARCHAR(100),
    source_type VARCHAR(50) DEFAULT 'MANUAL',
    source_id VARCHAR(100),
    description VARCHAR(500) NOT NULL,
    status ENUM('DRAFT','POSTED','VOID') DEFAULT 'DRAFT',
    total_debit DECIMAL(15,2) DEFAULT 0,
    total_credit DECIMAL(15,2) DEFAULT 0,
    posted_by VARCHAR(100),
    posted_at TIMESTAMP NULL,
    voided_by VARCHAR(100),
    voided_at TIMESTAMP NULL,
    void_reason VARCHAR(500),
    created_by VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (fiscal_year_id) REFERENCES fnc_fiscal_year(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Journal Entry Lines
CREATE TABLE IF NOT EXISTS fnc_journal_entry_line (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    journal_entry_id BIGINT NOT NULL,
    account_id INT NOT NULL,
    description VARCHAR(500),
    debit_amount DECIMAL(15,2) DEFAULT 0,
    credit_amount DECIMAL(15,2) DEFAULT 0,
    line_order INT DEFAULT 0,
    FOREIGN KEY (journal_entry_id) REFERENCES fnc_journal_entry(id) ON DELETE CASCADE,
    FOREIGN KEY (account_id) REFERENCES fnc_account(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- General Ledger
CREATE TABLE IF NOT EXISTS fnc_general_ledger (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    account_id INT NOT NULL,
    fiscal_year_id INT NOT NULL,
    period_month INT,
    opening_balance DECIMAL(15,2) DEFAULT 0,
    total_debit DECIMAL(15,2) DEFAULT 0,
    total_credit DECIMAL(15,2) DEFAULT 0,
    closing_balance DECIMAL(15,2) DEFAULT 0,
    UNIQUE KEY uk_ledger (account_id, fiscal_year_id, period_month),
    FOREIGN KEY (account_id) REFERENCES fnc_account(id),
    FOREIGN KEY (fiscal_year_id) REFERENCES fnc_fiscal_year(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Opening Balances
CREATE TABLE IF NOT EXISTS fnc_opening_balance (
    id INT AUTO_INCREMENT PRIMARY KEY,
    account_id INT NOT NULL,
    fiscal_year_id INT NOT NULL,
    debit_amount DECIMAL(15,2) DEFAULT 0,
    credit_amount DECIMAL(15,2) DEFAULT 0,
    created_by VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY uk_opening (account_id, fiscal_year_id),
    FOREIGN KEY (account_id) REFERENCES fnc_account(id),
    FOREIGN KEY (fiscal_year_id) REFERENCES fnc_fiscal_year(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;


CREATE TABLE `fnc_billing_account_map` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `mapping_key` VARCHAR(100) NOT NULL,
  `account_id` INT NOT NULL,
  `label` VARCHAR(200) DEFAULT NULL,
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_mapping_key` (`mapping_key`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

ALTER TABLE `fnc_billing_account_map`
ADD CONSTRAINT `fk_billing_map_account`
FOREIGN KEY (`account_id`) REFERENCES `fnc_account` (`id`)
ON DELETE RESTRICT 
ON UPDATE CASCADE;


-------------------------budget----------------------------------------------


CREATE TABLE IF NOT EXISTS fnc_budget (
    id INT AUTO_INCREMENT PRIMARY KEY,
    fiscal_year_id INT NOT NULL,
    budget_name VARCHAR(200) NOT NULL,
    description VARCHAR(500),
    status ENUM('DRAFT','APPROVED','REVISED') DEFAULT 'DRAFT',
    total_revenue_budget DECIMAL(15,2) DEFAULT 0,
    total_expense_budget DECIMAL(15,2) DEFAULT 0,
    approved_by VARCHAR(100),
    approved_at TIMESTAMP NULL,
    created_by VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (fiscal_year_id) REFERENCES fnc_fiscal_year(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS fnc_budget_line (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    budget_id INT NOT NULL,
    account_id INT NOT NULL,
    annual_amount DECIMAL(15,2) DEFAULT 0,
    q1_amount DECIMAL(15,2) DEFAULT 0,
    q2_amount DECIMAL(15,2) DEFAULT 0,
    q3_amount DECIMAL(15,2) DEFAULT 0,
    q4_amount DECIMAL(15,2) DEFAULT 0,
    notes VARCHAR(500),
    UNIQUE KEY uk_budget_line (budget_id, account_id),
    FOREIGN KEY (budget_id) REFERENCES fnc_budget(id) ON DELETE CASCADE,
    FOREIGN KEY (account_id) REFERENCES fnc_account(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;


------------------new columons for service charge --------------------------------
-- 1. Add the nullable 'billing_month' column to fnc_journal_entry table
ALTER TABLE fnc_journal_entry 
ADD COLUMN billing_month VARCHAR(100) NULL AFTER source_id;

-- 2. (Optional) Add an index for fast lookups by billing month
CREATE INDEX idx_fnc_journal_entry_billing_month 
ON fnc_journal_entry (billing_month);


ALTER TABLE `billing_reading`
  ADD COLUMN `m_billing_additional_payment_1_value` DOUBLE NULL DEFAULT NULL AFTER `techemari_kfya`,
  ADD COLUMN `m_billing_additional_payment_1_value_lable` DOUBLE NULL DEFAULT NULL AFTER `m_billing_additional_payment_1_value`,
  ADD COLUMN `m_billing_additional_payment_2_value` DOUBLE NULL DEFAULT NULL AFTER `m_billing_additional_payment_1_value_lable`,
  ADD COLUMN `m_billing_additional_payment_2_value_lable` DOUBLE NULL DEFAULT NULL AFTER `m_billing_additional_payment_2_value`,
  ADD COLUMN `m_billing_additional_payment_1_wuzif` DOUBLE NULL DEFAULT NULL AFTER `m_billing_additional_payment_2_value_lable`,
  ADD COLUMN `m_billing_additional_payment_2_wuzif` DOUBLE NULL DEFAULT NULL AFTER `m_billing_additional_payment_1_wuzif`;


ALTER TABLE `company_profile`
  ADD COLUMN `m_billing_additional_payment_1_value_lable` DOUBLE NULL DEFAULT NULL AFTER `m_company_key`,
  ADD COLUMN `m_billing_additional_payment_1_value` DOUBLE NULL DEFAULT NULL AFTER `m_billing_additional_payment_1_value_lable`,
  ADD COLUMN `m_billing_additional_payment_1_value_option` DOUBLE NULL DEFAULT NULL AFTER `m_billing_additional_payment_1_value`,
  ADD COLUMN `m_billing_additional_payment_2_value_lable` DOUBLE NULL DEFAULT NULL AFTER `m_billing_additional_payment_1_value_option`,
  ADD COLUMN `m_billing_additional_payment_2_value` DOUBLE NULL DEFAULT NULL AFTER `m_billing_additional_payment_2_value_lable`,
  ADD COLUMN `m_billing_additional_payment_2_value_option` DOUBLE NULL DEFAULT NULL AFTER `m_billing_additional_payment_2_value`;



-- ============================================================
-- Inventory Module — MySQL Migration Script
-- Water Bill Management System (WBMS)
-- ============================================================
-- Run this script against the wbill database to create all
-- inventory management tables.
-- ============================================================

-- ─── 1. CONFIGURATION / LOOKUP TABLES ─────────────────────

CREATE TABLE IF NOT EXISTS inv_unit_of_measure (
    id INT AUTO_INCREMENT PRIMARY KEY,
    unit_code VARCHAR(20) NOT NULL UNIQUE,
    unit_name VARCHAR(100) NOT NULL,
    unit_name_am VARCHAR(100),
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    deleted VARCHAR(20) NOT NULL DEFAULT 'No',
    created_by VARCHAR(100),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS inv_item_category (
    id INT AUTO_INCREMENT PRIMARY KEY,
    category_code VARCHAR(20) NOT NULL UNIQUE,
    category_name VARCHAR(200) NOT NULL,
    category_name_am VARCHAR(200),
    description VARCHAR(500),
    item_type ENUM('STOCK','NON_STOCK','SERVICE') NOT NULL DEFAULT 'STOCK',
    tracking_type ENUM('NONE','BATCH','EXPIRY','SERIAL','MOTOR') NOT NULL DEFAULT 'NONE',
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    deleted VARCHAR(20) NOT NULL DEFAULT 'No',
    created_by VARCHAR(100),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS inv_item_group (
    id INT AUTO_INCREMENT PRIMARY KEY,
    category_id INT NOT NULL,
    group_code VARCHAR(20) NOT NULL UNIQUE,
    group_name VARCHAR(200) NOT NULL,
    group_name_am VARCHAR(200),
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    deleted VARCHAR(20) NOT NULL DEFAULT 'No',
    created_by VARCHAR(100),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_item_group_category FOREIGN KEY (category_id) REFERENCES inv_item_category(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ─── 2. SUPPLIER ──────────────────────────────────────────

CREATE TABLE IF NOT EXISTS inv_supplier (
    id INT AUTO_INCREMENT PRIMARY KEY,
    supplier_code VARCHAR(20) NOT NULL UNIQUE,
    supplier_name VARCHAR(200) NOT NULL,
    supplier_name_am VARCHAR(200),
    tin VARCHAR(50),
    phone VARCHAR(20),
    email VARCHAR(100),
    address VARCHAR(300),
    city VARCHAR(100),
    contact_person VARCHAR(100),
    contact_phone VARCHAR(20),
    bank_name VARCHAR(100),
    bank_account_number VARCHAR(50),
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    deleted VARCHAR(20) NOT NULL DEFAULT 'No',
    created_by VARCHAR(100),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ─── 3. STORE ─────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS inv_store (
    id INT AUTO_INCREMENT PRIMARY KEY,
    store_code VARCHAR(20) NOT NULL UNIQUE,
    store_name VARCHAR(200) NOT NULL,
    store_name_am VARCHAR(200),
    branch_id INT,
    is_main_store BOOLEAN NOT NULL DEFAULT FALSE,
    store_keeper_id INT,
    manager_id INT,
    location VARCHAR(200),
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    deleted VARCHAR(20) NOT NULL DEFAULT 'No',
    created_by VARCHAR(100),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_store_branch FOREIGN KEY (branch_id) REFERENCES branchs(id),
    CONSTRAINT fk_store_keeper FOREIGN KEY (store_keeper_id) REFERENCES user_account(id),
    CONSTRAINT fk_store_manager FOREIGN KEY (manager_id) REFERENCES user_account(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ─── 4. ITEM MASTER ───────────────────────────────────────

CREATE TABLE IF NOT EXISTS inv_item (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    item_code VARCHAR(30) NOT NULL UNIQUE,
    item_name VARCHAR(200) NOT NULL,
    item_name_am VARCHAR(200),
    description VARCHAR(500),
    category_id INT NOT NULL,
    item_group_id INT,
    unit_of_measure_id INT NOT NULL,
    reorder_level INT NOT NULL DEFAULT 0,
    reorder_quantity INT NOT NULL DEFAULT 0,
    tracking_type ENUM('NONE','BATCH','EXPIRY','SERIAL','MOTOR') NOT NULL DEFAULT 'NONE',
    item_usage ENUM('FOR_SALE','COMPANY_USE','BOTH') NOT NULL DEFAULT 'BOTH',
    default_unit_cost DECIMAL(15,2) DEFAULT 0.00,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    deleted VARCHAR(20) NOT NULL DEFAULT 'No',
    created_by VARCHAR(100),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_item_category FOREIGN KEY (category_id) REFERENCES inv_item_category(id),
    CONSTRAINT fk_item_group FOREIGN KEY (item_group_id) REFERENCES inv_item_group(id),
    CONSTRAINT fk_item_uom FOREIGN KEY (unit_of_measure_id) REFERENCES inv_unit_of_measure(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ─── 5. STOCK PER STORE ───────────────────────────────────

CREATE TABLE IF NOT EXISTS inv_item_store_stock (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    item_id BIGINT NOT NULL,
    store_id INT NOT NULL,
    quantity_on_hand DECIMAL(15,4) NOT NULL DEFAULT 0,
    quantity_reserved DECIMAL(15,4) NOT NULL DEFAULT 0,
    quantity_on_order DECIMAL(15,4) NOT NULL DEFAULT 0,
    weighted_avg_cost DECIMAL(15,4) NOT NULL DEFAULT 0,
    last_count_date DATE,
    last_count_quantity DECIMAL(15,4),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY uk_item_store (item_id, store_id),
    CONSTRAINT fk_stock_item FOREIGN KEY (item_id) REFERENCES inv_item(id),
    CONSTRAINT fk_stock_store FOREIGN KEY (store_id) REFERENCES inv_store(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ─── 6. SERIAL / MOTOR / BATCH TRACKING ───────────────────

CREATE TABLE IF NOT EXISTS inv_serial_tracking (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    item_id BIGINT NOT NULL,
    store_id INT NOT NULL,
    tracking_type ENUM('SERIAL','MOTOR','BATCH') NOT NULL,
    serial_number VARCHAR(100),
    motor_number VARCHAR(100),
    chassis_number VARCHAR(100),
    plate_number VARCHAR(100),
    batch_number VARCHAR(100),
    expiry_date DATE,
    manufacture_date DATE,
    status ENUM('IN_STOCK','ISSUED','TRANSFERRED','DISPOSED','RETURNED') NOT NULL DEFAULT 'IN_STOCK',
    reference_type VARCHAR(50),
    reference_id BIGINT,
    remarks VARCHAR(500),
    created_by VARCHAR(100),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_serial_item FOREIGN KEY (item_id) REFERENCES inv_item(id),
    CONSTRAINT fk_serial_store FOREIGN KEY (store_id) REFERENCES inv_store(id),
    INDEX idx_serial_number (serial_number),
    INDEX idx_motor_number (motor_number),
    INDEX idx_batch_number (batch_number)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ─── 7. STOCK TRANSACTIONS (AUDIT TRAIL) ──────────────────

CREATE TABLE IF NOT EXISTS inv_stock_transaction (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    transaction_number VARCHAR(50) NOT NULL UNIQUE,
    item_id BIGINT NOT NULL,
    store_id INT NOT NULL,
    transaction_type ENUM('RECEIVE','ISSUE_SALE','ISSUE_INTERNAL','TRANSFER_OUT','TRANSFER_IN','ADJUSTMENT_PLUS','ADJUSTMENT_MINUS','RETURN','DISPOSAL') NOT NULL,
    quantity DECIMAL(15,4) NOT NULL,
    unit_cost DECIMAL(15,4) NOT NULL DEFAULT 0,
    total_cost DECIMAL(15,2) NOT NULL DEFAULT 0,
    reference_type VARCHAR(50),
    reference_id BIGINT,
    balance_before DECIMAL(15,4) NOT NULL DEFAULT 0,
    balance_after DECIMAL(15,4) NOT NULL DEFAULT 0,
    serial_tracking_id BIGINT,
    remarks VARCHAR(500),
    transaction_date DATE NOT NULL,
    created_by VARCHAR(100),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_txn_item FOREIGN KEY (item_id) REFERENCES inv_item(id),
    CONSTRAINT fk_txn_store FOREIGN KEY (store_id) REFERENCES inv_store(id),
    CONSTRAINT fk_txn_serial FOREIGN KEY (serial_tracking_id) REFERENCES inv_serial_tracking(id),
    INDEX idx_txn_date (transaction_date),
    INDEX idx_txn_item (item_id),
    INDEX idx_txn_type (transaction_type),
    INDEX idx_txn_ref (reference_type, reference_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ─── 8. PURCHASE REQUISITION ──────────────────────────────

CREATE TABLE IF NOT EXISTS inv_purchase_requisition (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    requisition_number VARCHAR(50) NOT NULL UNIQUE,
    store_id INT NOT NULL,
    requested_by VARCHAR(100) NOT NULL,
    requested_date DATE NOT NULL,
    status ENUM('DRAFT','SUBMITTED','APPROVED_L1','APPROVED_L2','REJECTED','CONVERTED_TO_PO','CANCELLED') NOT NULL DEFAULT 'DRAFT',
    approved_by_l1 VARCHAR(100),
    approved_date_l1 DATETIME,
    approved_by_l2 VARCHAR(100),
    approved_date_l2 DATETIME,
    rejected_by VARCHAR(100),
    rejected_date DATETIME,
    rejection_reason VARCHAR(500),
    remarks VARCHAR(500),
    total_estimated_amount DECIMAL(15,2) NOT NULL DEFAULT 0,
    created_by VARCHAR(100),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_pr_store FOREIGN KEY (store_id) REFERENCES inv_store(id),
    INDEX idx_pr_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS inv_purchase_requisition_line (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    requisition_id BIGINT NOT NULL,
    item_id BIGINT NOT NULL,
    requested_quantity DECIMAL(15,4) NOT NULL,
    approved_quantity DECIMAL(15,4),
    estimated_unit_cost DECIMAL(15,4) NOT NULL DEFAULT 0,
    estimated_total DECIMAL(15,2) NOT NULL DEFAULT 0,
    purpose VARCHAR(300),
    line_order INT NOT NULL DEFAULT 0,
    CONSTRAINT fk_prl_requisition FOREIGN KEY (requisition_id) REFERENCES inv_purchase_requisition(id) ON DELETE CASCADE,
    CONSTRAINT fk_prl_item FOREIGN KEY (item_id) REFERENCES inv_item(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ─── 9. PURCHASE ORDER ────────────────────────────────────

CREATE TABLE IF NOT EXISTS inv_purchase_order (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    po_number VARCHAR(50) NOT NULL UNIQUE,
    requisition_id BIGINT,
    supplier_id INT NOT NULL,
    store_id INT NOT NULL,
    order_date DATE NOT NULL,
    expected_delivery_date DATE,
    status ENUM('DRAFT','SUBMITTED','APPROVED_L1','APPROVED_L2','SENT_TO_SUPPLIER','PARTIALLY_RECEIVED','FULLY_RECEIVED','CANCELLED') NOT NULL DEFAULT 'DRAFT',
    approved_by_l1 VARCHAR(100),
    approved_date_l1 DATETIME,
    approved_by_l2 VARCHAR(100),
    approved_date_l2 DATETIME,
    subtotal DECIMAL(15,2) NOT NULL DEFAULT 0,
    vat_rate DECIMAL(5,2) NOT NULL DEFAULT 15.00,
    vat_amount DECIMAL(15,2) NOT NULL DEFAULT 0,
    grand_total DECIMAL(15,2) NOT NULL DEFAULT 0,
    payment_terms VARCHAR(200),
    delivery_terms VARCHAR(200),
    remarks VARCHAR(500),
    created_by VARCHAR(100),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_po_requisition FOREIGN KEY (requisition_id) REFERENCES inv_purchase_requisition(id),
    CONSTRAINT fk_po_supplier FOREIGN KEY (supplier_id) REFERENCES inv_supplier(id),
    CONSTRAINT fk_po_store FOREIGN KEY (store_id) REFERENCES inv_store(id),
    INDEX idx_po_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS inv_purchase_order_line (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    purchase_order_id BIGINT NOT NULL,
    item_id BIGINT NOT NULL,
    ordered_quantity DECIMAL(15,4) NOT NULL,
    received_quantity DECIMAL(15,4) NOT NULL DEFAULT 0,
    unit_price DECIMAL(15,4) NOT NULL,
    total_price DECIMAL(15,2) NOT NULL DEFAULT 0,
    line_order INT NOT NULL DEFAULT 0,
    CONSTRAINT fk_pol_po FOREIGN KEY (purchase_order_id) REFERENCES inv_purchase_order(id) ON DELETE CASCADE,
    CONSTRAINT fk_pol_item FOREIGN KEY (item_id) REFERENCES inv_item(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ─── 10. GOODS RECEIVED NOTE ──────────────────────────────

CREATE TABLE IF NOT EXISTS inv_goods_received_note (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    grn_number VARCHAR(50) NOT NULL UNIQUE,
    purchase_order_id BIGINT NOT NULL,
    store_id INT NOT NULL,
    supplier_id INT NOT NULL,
    received_date DATE NOT NULL,
    received_by VARCHAR(100) NOT NULL,
    status ENUM('DRAFT','CONFIRMED','CANCELLED') NOT NULL DEFAULT 'DRAFT',
    supplier_invoice_number VARCHAR(50),
    remarks VARCHAR(500),
    total_amount DECIMAL(15,2) NOT NULL DEFAULT 0,
    journal_entry_id BIGINT,
    created_by VARCHAR(100),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_grn_po FOREIGN KEY (purchase_order_id) REFERENCES inv_purchase_order(id),
    CONSTRAINT fk_grn_store FOREIGN KEY (store_id) REFERENCES inv_store(id),
    CONSTRAINT fk_grn_supplier FOREIGN KEY (supplier_id) REFERENCES inv_supplier(id),
    CONSTRAINT fk_grn_journal FOREIGN KEY (journal_entry_id) REFERENCES fnc_journal_entry(id),
    INDEX idx_grn_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS inv_goods_received_note_line (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    grn_id BIGINT NOT NULL,
    po_line_id BIGINT NOT NULL,
    item_id BIGINT NOT NULL,
    received_quantity DECIMAL(15,4) NOT NULL,
    accepted_quantity DECIMAL(15,4) NOT NULL,
    rejected_quantity DECIMAL(15,4) NOT NULL DEFAULT 0,
    unit_cost DECIMAL(15,4) NOT NULL,
    total_cost DECIMAL(15,2) NOT NULL DEFAULT 0,
    batch_number VARCHAR(50),
    expiry_date DATE,
    rejection_reason VARCHAR(300),
    line_order INT NOT NULL DEFAULT 0,
    CONSTRAINT fk_grnl_grn FOREIGN KEY (grn_id) REFERENCES inv_goods_received_note(id) ON DELETE CASCADE,
    CONSTRAINT fk_grnl_pol FOREIGN KEY (po_line_id) REFERENCES inv_purchase_order_line(id),
    CONSTRAINT fk_grnl_item FOREIGN KEY (item_id) REFERENCES inv_item(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ─── 11. ISSUE VOUCHER ────────────────────────────────────

CREATE TABLE IF NOT EXISTS inv_issue_voucher (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    voucher_number VARCHAR(50) NOT NULL UNIQUE,
    store_id INT NOT NULL,
    issue_type ENUM('SALE','INTERNAL_USE','PROJECT','MAINTENANCE') NOT NULL,
    issued_to VARCHAR(200),
    department VARCHAR(200),
    issued_date DATE NOT NULL,
    status ENUM('DRAFT','APPROVED','ISSUED','CANCELLED') NOT NULL DEFAULT 'DRAFT',
    approved_by VARCHAR(100),
    approved_date DATETIME,
    issued_by VARCHAR(100),
    total_amount DECIMAL(15,2) NOT NULL DEFAULT 0,
    journal_entry_id BIGINT,
    remarks VARCHAR(500),
    created_by VARCHAR(100),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_iv_store FOREIGN KEY (store_id) REFERENCES inv_store(id),
    CONSTRAINT fk_iv_journal FOREIGN KEY (journal_entry_id) REFERENCES fnc_journal_entry(id),
    INDEX idx_iv_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS inv_issue_voucher_line (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    voucher_id BIGINT NOT NULL,
    item_id BIGINT NOT NULL,
    requested_quantity DECIMAL(15,4) NOT NULL,
    approved_quantity DECIMAL(15,4),
    issued_quantity DECIMAL(15,4) NOT NULL DEFAULT 0,
    unit_cost DECIMAL(15,4) NOT NULL DEFAULT 0,
    total_cost DECIMAL(15,2) NOT NULL DEFAULT 0,
    serial_tracking_id BIGINT,
    line_order INT NOT NULL DEFAULT 0,
    CONSTRAINT fk_ivl_voucher FOREIGN KEY (voucher_id) REFERENCES inv_issue_voucher(id) ON DELETE CASCADE,
    CONSTRAINT fk_ivl_item FOREIGN KEY (item_id) REFERENCES inv_item(id),
    CONSTRAINT fk_ivl_serial FOREIGN KEY (serial_tracking_id) REFERENCES inv_serial_tracking(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ─── 12. STOCK TRANSFER ───────────────────────────────────

CREATE TABLE IF NOT EXISTS inv_stock_transfer (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    transfer_number VARCHAR(50) NOT NULL UNIQUE,
    from_store_id INT NOT NULL,
    to_store_id INT NOT NULL,
    transfer_date DATE NOT NULL,
    status ENUM('DRAFT','SUBMITTED','APPROVED','IN_TRANSIT','RECEIVED','CANCELLED') NOT NULL DEFAULT 'DRAFT',
    requested_by VARCHAR(100),
    approved_by VARCHAR(100),
    approved_date DATETIME,
    shipped_by VARCHAR(100),
    shipped_date DATETIME,
    received_by VARCHAR(100),
    received_date DATETIME,
    total_amount DECIMAL(15,2) NOT NULL DEFAULT 0,
    remarks VARCHAR(500),
    waybill_number VARCHAR(100),
    vehicle_plate VARCHAR(50),
    driver_name VARCHAR(100),
    journal_entry_id BIGINT,
    created_by VARCHAR(100),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_tf_from_store FOREIGN KEY (from_store_id) REFERENCES inv_store(id),
    CONSTRAINT fk_tf_to_store FOREIGN KEY (to_store_id) REFERENCES inv_store(id),
    CONSTRAINT fk_tf_journal_entry FOREIGN KEY (journal_entry_id) REFERENCES fnc_journal_entry(id),
    INDEX idx_tf_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS inv_stock_transfer_line (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    transfer_id BIGINT NOT NULL,
    item_id BIGINT NOT NULL,
    quantity DECIMAL(15,4) NOT NULL,
    unit_cost DECIMAL(15,4) NOT NULL DEFAULT 0,
    total_cost DECIMAL(15,2) NOT NULL DEFAULT 0,
    serial_tracking_id BIGINT,
    received_quantity DECIMAL(15,4),
    line_order INT NOT NULL DEFAULT 0,
    CONSTRAINT fk_tfl_transfer FOREIGN KEY (transfer_id) REFERENCES inv_stock_transfer(id) ON DELETE CASCADE,
    CONSTRAINT fk_tfl_item FOREIGN KEY (item_id) REFERENCES inv_item(id),
    CONSTRAINT fk_tfl_serial FOREIGN KEY (serial_tracking_id) REFERENCES inv_serial_tracking(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ─── 13. STOCK ADJUSTMENT ─────────────────────────────────

CREATE TABLE IF NOT EXISTS inv_stock_adjustment (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    adjustment_number VARCHAR(50) NOT NULL UNIQUE,
    store_id INT NOT NULL,
    adjustment_type ENUM('PHYSICAL_COUNT','DAMAGE','DISPOSAL','EXPIRY','OTHER') NOT NULL,
    adjustment_date DATE NOT NULL,
    status ENUM('DRAFT','SUBMITTED','APPROVED','APPLIED','CANCELLED') NOT NULL DEFAULT 'DRAFT',
    approved_by VARCHAR(100),
    approved_date DATETIME,
    applied_by VARCHAR(100),
    applied_date DATETIME,
    journal_entry_id BIGINT,
    remarks VARCHAR(500),
    created_by VARCHAR(100),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_adj_store FOREIGN KEY (store_id) REFERENCES inv_store(id),
    CONSTRAINT fk_adj_journal FOREIGN KEY (journal_entry_id) REFERENCES fnc_journal_entry(id),
    INDEX idx_adj_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS inv_stock_adjustment_line (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    adjustment_id BIGINT NOT NULL,
    item_id BIGINT NOT NULL,
    system_quantity DECIMAL(15,4) NOT NULL,
    actual_quantity DECIMAL(15,4) NOT NULL,
    variance DECIMAL(15,4) NOT NULL DEFAULT 0,
    unit_cost DECIMAL(15,4) NOT NULL DEFAULT 0,
    variance_cost DECIMAL(15,2) NOT NULL DEFAULT 0,
    reason VARCHAR(300),
    line_order INT NOT NULL DEFAULT 0,
    CONSTRAINT fk_adjl_adjustment FOREIGN KEY (adjustment_id) REFERENCES inv_stock_adjustment(id) ON DELETE CASCADE,
    CONSTRAINT fk_adjl_item FOREIGN KEY (item_id) REFERENCES inv_item(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;


----------------------missing inventory columon and data----------------------------------------------------

ALTER TABLE inv_purchase_requisition 
MODIFY COLUMN status ENUM('DRAFT','SUBMITTED','APPROVED_L1','APPROVED_L2','APPROVED','REJECTED','CONVERTED_TO_PO','CANCELLED') 
NOT NULL DEFAULT 'DRAFT';
