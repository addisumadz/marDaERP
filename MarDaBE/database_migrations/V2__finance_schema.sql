-- ============================================================
-- Finance Module Schema - Double Entry Accounting System
-- Currency: ETB (Ethiopian Birr)
-- Fiscal Year: Hamle 1 – Sene 30
-- ============================================================

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








-- ============================================================
-- DEFAULT CHART OF ACCOUNTS FOR MUNICIPAL WATER UTILITY
-- ============================================================

-- ASSETS (1000-1999)
INSERT INTO fnc_account (account_code, account_name, account_name_am, account_type, parent_account_id, is_header, normal_balance, description) VALUES
('1000', 'Assets', 'ንብረቶች', 'ASSET', NULL, 1, 'DEBIT', 'All assets'),
('1100', 'Current Assets', 'የአሁን ንብረቶች', 'ASSET', NULL, 1, 'DEBIT', 'Current assets');

SET @assets_id = (SELECT id FROM fnc_account WHERE account_code = '1100');

INSERT INTO fnc_account (account_code, account_name, account_name_am, account_type, parent_account_id, is_header, normal_balance, description) VALUES
('1110', 'Cash on Hand', 'በእጅ ያለ ገንዘብ', 'ASSET', @assets_id, 0, 'DEBIT', 'Physical cash'),
('1120', 'Cash at Bank - CBE', 'በባንክ ያለ ገንዘብ - ንግድ ባንክ', 'ASSET', @assets_id, 0, 'DEBIT', 'Commercial Bank of Ethiopia'),
('1121', 'Cash at Bank - Awash', 'በባንክ ያለ ገንዘብ - አዋሽ ባንክ', 'ASSET', @assets_id, 0, 'DEBIT', 'Awash Bank'),
('1122', 'Cash at Bank - Dashen', 'በባንክ ያለ ገንዘብ - ዳሽን ባንክ', 'ASSET', @assets_id, 0, 'DEBIT', 'Dashen Bank'),
('1123', 'Cash at Bank - Abyssinia', 'በባንክ ያለ ገንዘብ - አቢሲኒያ ባንክ', 'ASSET', @assets_id, 0, 'DEBIT', 'Bank of Abyssinia'),
('1130', 'Petty Cash', 'ጥቃቅን ገንዘብ', 'ASSET', @assets_id, 0, 'DEBIT', 'Petty cash fund'),
('1200', 'Accounts Receivable', 'የሚሰበሰብ ገንዘብ', 'ASSET', @assets_id, 0, 'DEBIT', 'Money owed by customers'),
('1210', 'Water Bill Receivable', 'የውሃ ክፍያ ተሰብሳቢ', 'ASSET', @assets_id, 0, 'DEBIT', 'Outstanding water bills'),
('1220', 'Penalty Receivable', 'የቅጣት ተሰብሳቢ', 'ASSET', @assets_id, 0, 'DEBIT', 'Outstanding penalties'),
('1230', 'Other Receivables', 'ሌሎች ተሰብሳቢዎች', 'ASSET', @assets_id, 0, 'DEBIT', 'Other amounts receivable'),
('1300', 'Prepaid Expenses', 'ቅድመ ክፍያዎች', 'ASSET', @assets_id, 0, 'DEBIT', 'Prepaid expenses'),
('1400', 'Inventory - Supplies', 'የእቃ ክምችት', 'ASSET', @assets_id, 0, 'DEBIT', 'Water meters, pipes, supplies');

-- Fixed Assets
INSERT INTO fnc_account (account_code, account_name, account_name_am, account_type, parent_account_id, is_header, normal_balance, description) VALUES
('1500', 'Fixed Assets', 'ቋሚ ንብረቶች', 'ASSET', NULL, 1, 'DEBIT', 'Long-term assets');

SET @fixed_id = (SELECT id FROM fnc_account WHERE account_code = '1500');

INSERT INTO fnc_account (account_code, account_name, account_name_am, account_type, parent_account_id, is_header, normal_balance, description) VALUES
('1510', 'Land', 'መሬት', 'ASSET', @fixed_id, 0, 'DEBIT', 'Land owned'),
('1520', 'Buildings', 'ሕንፃዎች', 'ASSET', @fixed_id, 0, 'DEBIT', 'Office and facility buildings'),
('1521', 'Accumulated Depreciation - Buildings', 'የተከማቸ ዋጋ ቅናሽ - ሕንፃዎች', 'ASSET', @fixed_id, 0, 'CREDIT', 'Contra asset'),
('1530', 'Vehicles', 'ተሽከርካሪዎች', 'ASSET', @fixed_id, 0, 'DEBIT', 'Company vehicles'),
('1531', 'Accumulated Depreciation - Vehicles', 'የተከማቸ ዋጋ ቅናሽ - ተሽከርካሪዎች', 'ASSET', @fixed_id, 0, 'CREDIT', 'Contra asset'),
('1540', 'Office Equipment', 'የቢሮ እቃዎች', 'ASSET', @fixed_id, 0, 'DEBIT', 'Computers, furniture, etc.'),
('1541', 'Accumulated Depreciation - Office Equipment', 'የተከማቸ ዋጋ ቅናሽ - የቢሮ እቃዎች', 'ASSET', @fixed_id, 0, 'CREDIT', 'Contra asset'),
('1550', 'Water Infrastructure', 'የውሃ መሰረተ ልማት', 'ASSET', @fixed_id, 0, 'DEBIT', 'Pipes, pumps, treatment plants'),
('1551', 'Accumulated Depreciation - Water Infrastructure', 'የተከማቸ ዋጋ ቅናሽ - የውሃ መሰረተ ልማት', 'ASSET', @fixed_id, 0, 'CREDIT', 'Contra asset'),
('1560', 'Water Meters', 'የውሃ ቆጣሪዎች', 'ASSET', @fixed_id, 0, 'DEBIT', 'Installed water meters'),
('1561', 'Accumulated Depreciation - Water Meters', 'የተከማቸ ዋጋ ቅናሽ - የውሃ ቆጣሪዎች', 'ASSET', @fixed_id, 0, 'CREDIT', 'Contra asset');

-- LIABILITIES (2000-2999)
INSERT INTO fnc_account (account_code, account_name, account_name_am, account_type, parent_account_id, is_header, normal_balance, description) VALUES
('2000', 'Liabilities', 'እዳዎች', 'LIABILITY', NULL, 1, 'CREDIT', 'All liabilities'),
('2100', 'Current Liabilities', 'የአሁን እዳዎች', 'LIABILITY', NULL, 1, 'CREDIT', 'Short-term obligations');

SET @liab_id = (SELECT id FROM fnc_account WHERE account_code = '2100');

INSERT INTO fnc_account (account_code, account_name, account_name_am, account_type, parent_account_id, is_header, normal_balance, description) VALUES
('2110', 'Accounts Payable', 'የሚከፈል ገንዘብ', 'LIABILITY', @liab_id, 0, 'CREDIT', 'Money owed to suppliers'),
('2120', 'Salaries Payable', 'የሚከፈል ደመወዝ', 'LIABILITY', @liab_id, 0, 'CREDIT', 'Accrued salaries'),
('2130', 'Tax Payable', 'የሚከፈል ግብር', 'LIABILITY', @liab_id, 0, 'CREDIT', 'Taxes owed'),
('2131', 'Income Tax Payable', 'የገቢ ግብር', 'LIABILITY', @liab_id, 0, 'CREDIT', 'Employee income tax'),
('2132', 'Pension Payable', 'የጡረታ መዋጮ', 'LIABILITY', @liab_id, 0, 'CREDIT', 'Pension contributions'),
('2140', 'Customer Deposits', 'የደንበኛ ተቀማጭ', 'LIABILITY', @liab_id, 0, 'CREDIT', 'Water connection deposits'),
('2150', 'Advance Payments Received', 'ቅድመ ክፍያ የተቀበለ', 'LIABILITY', @liab_id, 0, 'CREDIT', 'Customer advance payments'),
('2160', 'Other Payables', 'ሌሎች ተከፋይ', 'LIABILITY', @liab_id, 0, 'CREDIT', 'Other amounts payable');

INSERT INTO fnc_account (account_code, account_name, account_name_am, account_type, parent_account_id, is_header, normal_balance, description) VALUES
('2200', 'Long-term Liabilities', 'የረጅም ጊዜ እዳዎች', 'LIABILITY', NULL, 1, 'CREDIT', 'Long-term obligations');

SET @ltliab_id = (SELECT id FROM fnc_account WHERE account_code = '2200');

INSERT INTO fnc_account (account_code, account_name, account_name_am, account_type, parent_account_id, is_header, normal_balance, description) VALUES
('2210', 'Bank Loans', 'የባንክ ብድር', 'LIABILITY', @ltliab_id, 0, 'CREDIT', 'Long-term bank loans'),
('2220', 'Government Loans', 'የመንግስት ብድር', 'LIABILITY', @ltliab_id, 0, 'CREDIT', 'Government funding/loans');

-- EQUITY (9000-3999)
INSERT INTO fnc_account (account_code, account_name, account_name_am, account_type, parent_account_id, is_header, normal_balance, description) VALUES
('9000', 'Equity', 'የባለቤትነት ድርሻ', 'EQUITY', NULL, 1, 'CREDIT', 'Owner equity');

SET @equity_id = (SELECT id FROM fnc_account WHERE account_code = '9000');

INSERT INTO fnc_account (account_code, account_name, account_name_am, account_type, parent_account_id, is_header, normal_balance, description) VALUES
('3100', 'Government Capital', 'የመንግስት ካፒታል', 'EQUITY', @equity_id, 0, 'CREDIT', 'Government invested capital'),
('3200', 'Retained Earnings', 'ያልተከፋፈለ ትርፍ', 'EQUITY', @equity_id, 0, 'CREDIT', 'Accumulated net income'),
('3300', 'Current Year Earnings', 'የዘንድሮ ትርፍ', 'EQUITY', @equity_id, 0, 'CREDIT', 'Current period net income');

-- REVENUE (4000-4999)
INSERT INTO fnc_account (account_code, account_name, account_name_am, account_type, parent_account_id, is_header, normal_balance, description) VALUES
('4000', 'Revenue', 'ገቢ', 'REVENUE', NULL, 1, 'CREDIT', 'All revenue');

SET @rev_id = (SELECT id FROM fnc_account WHERE account_code = '4000');

INSERT INTO fnc_account (account_code, account_name, account_name_am, account_type, parent_account_id, is_header, normal_balance, description) VALUES
('4100', 'Water Sales Revenue', 'የውሃ ሽያጭ ገቢ', 'REVENUE', @rev_id, 0, 'CREDIT', 'Revenue from water consumption'),
('4110', 'Residential Water Revenue', 'የመኖሪያ ውሃ ገቢ', 'REVENUE', @rev_id, 0, 'CREDIT', 'Residential customers'),
('4120', 'Commercial Water Revenue', 'የንግድ ውሃ ገቢ', 'REVENUE', @rev_id, 0, 'CREDIT', 'Commercial customers'),
('4130', 'Industrial Water Revenue', 'የኢንዱስትሪ ውሃ ገቢ', 'REVENUE', @rev_id, 0, 'CREDIT', 'Industrial customers'),
('4140', 'Government Water Revenue', 'የመንግስት ውሃ ገቢ', 'REVENUE', @rev_id, 0, 'CREDIT', 'Government customers'),
('4200', 'Meter Rent Revenue', 'የቆጣሪ ኪራይ ገቢ', 'REVENUE', @rev_id, 0, 'CREDIT', 'Meter rental fees'),
('4300', 'Connection Fee Revenue', 'የመስመር ዝርጋታ ገቢ', 'REVENUE', @rev_id, 0, 'CREDIT', 'New connection fees'),
('4400', 'Penalty Revenue', 'የቅጣት ገቢ', 'REVENUE', @rev_id, 0, 'CREDIT', 'Late payment penalties'),
('4500', 'Reconnection Fee Revenue', 'የመልሶ ማገናኘት ገቢ', 'REVENUE', @rev_id, 0, 'CREDIT', 'Service reconnection fees'),
('4900', 'Other Revenue', 'ሌሎች ገቢዎች', 'REVENUE', @rev_id, 0, 'CREDIT', 'Miscellaneous revenue');

-- EXPENSES (5000-5999)
INSERT INTO fnc_account (account_code, account_name, account_name_am, account_type, parent_account_id, is_header, normal_balance, description) VALUES
('5000', 'Expenses', 'ወጪዎች', 'EXPENSE', NULL, 1, 'DEBIT', 'All expenses');

SET @exp_id = (SELECT id FROM fnc_account WHERE account_code = '5000');

INSERT INTO fnc_account (account_code, account_name, account_name_am, account_type, parent_account_id, is_header, normal_balance, description) VALUES
('5100', 'Salary & Wages', 'ደመወዝ እና አበል', 'EXPENSE', @exp_id, 0, 'DEBIT', 'Employee salaries'),
('5110', 'Employee Benefits', 'የሰራተኛ ጥቅማ ጥቅም', 'EXPENSE', @exp_id, 0, 'DEBIT', 'Benefits and allowances'),
('5120', 'Pension Expense', 'የጡረታ ወጪ', 'EXPENSE', @exp_id, 0, 'DEBIT', 'Employer pension contribution'),
('5200', 'Office Supplies', 'የቢሮ ቁሳቁስ', 'EXPENSE', @exp_id, 0, 'DEBIT', 'Stationery, supplies'),
('5210', 'Office Rent', 'የቢሮ ኪራይ', 'EXPENSE', @exp_id, 0, 'DEBIT', 'Office space rental'),
('5220', 'Utilities Expense', 'የመብራትና ውሃ ወጪ', 'EXPENSE', @exp_id, 0, 'DEBIT', 'Electricity, water, phone'),
('5230', 'Communication Expense', 'የመገናኛ ወጪ', 'EXPENSE', @exp_id, 0, 'DEBIT', 'Phone, internet, postage'),
('5300', 'Vehicle Expense', 'የተሽከርካሪ ወጪ', 'EXPENSE', @exp_id, 0, 'DEBIT', 'Fuel, maintenance'),
('5310', 'Travel Expense', 'የጉዞ ወጪ', 'EXPENSE', @exp_id, 0, 'DEBIT', 'Travel and per diem'),
('5400', 'Maintenance & Repair', 'ጥገና እና ግንባታ', 'EXPENSE', @exp_id, 0, 'DEBIT', 'Infrastructure maintenance'),
('5410', 'Water Treatment Chemicals', 'የውሃ ማጣሪያ ኬሚካል', 'EXPENSE', @exp_id, 0, 'DEBIT', 'Chemicals for water treatment'),
('5420', 'Pipe & Fittings', 'ቧንቧ እና መገጣጠሚያ', 'EXPENSE', @exp_id, 0, 'DEBIT', 'Replacement pipes and fittings'),
('5500', 'Depreciation Expense', 'የዋጋ ቅናሽ ወጪ', 'EXPENSE', @exp_id, 0, 'DEBIT', 'Asset depreciation'),
('5600', 'Insurance Expense', 'የኢንሹራንስ ወጪ', 'EXPENSE', @exp_id, 0, 'DEBIT', 'Insurance premiums'),
('5700', 'Bank Charges', 'የባንክ ክፍያ', 'EXPENSE', @exp_id, 0, 'DEBIT', 'Bank service fees'),
('5800', 'Bad Debt Expense', 'ሊሰበሰብ ያልቻለ ዕዳ', 'EXPENSE', @exp_id, 0, 'DEBIT', 'Uncollectible accounts'),
('5900', 'Miscellaneous Expense', 'ልዩ ልዩ ወጪ', 'EXPENSE', @exp_id, 0, 'DEBIT', 'Other expenses'),
('5910', 'Training Expense', 'የስልጠና ወጪ', 'EXPENSE', @exp_id, 0, 'DEBIT', 'Employee training'),
('5920', 'Professional Fees', 'ሙያዊ ክፍያ', 'EXPENSE', @exp_id, 0, 'DEBIT', 'Consulting, audit, legal fees');


