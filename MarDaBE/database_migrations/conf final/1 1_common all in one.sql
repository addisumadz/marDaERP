
-------------------------------- finance UPDATE

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


-----------------------------------------------------------------
