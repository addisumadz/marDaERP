-- ============================================================
-- Budget Management Module
-- ============================================================

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
