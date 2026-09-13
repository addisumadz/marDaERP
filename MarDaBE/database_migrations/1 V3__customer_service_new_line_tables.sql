-- ====================================================================
-- V3__customer_service_new_line_tables.sql
-- Customer Service Management System: New Line Connection Module
-- Tables prefixed with custom_ as per system guidelines
-- ====================================================================

SET NAMES utf8mb4;

-- Drop in reverse foreign key order for clean migration/re-run
DROP TABLE IF EXISTS custom_new_line_activity_log;
DROP TABLE IF EXISTS custom_new_line_additional_fee;
DROP TABLE IF EXISTS custom_new_line_item;
DROP TABLE IF EXISTS custom_new_line_connection_request;
DROP TABLE IF EXISTS custom_additional_fee_type;
DROP TABLE IF EXISTS custom_common_material;

-- 1. Curated Common Plumbing Materials catalog for new line connection surveys
CREATE TABLE IF NOT EXISTS custom_common_material (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    material_code VARCHAR(50) NOT NULL UNIQUE,
    material_name VARCHAR(200) NOT NULL,
    material_name_am VARCHAR(200) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
    unit_of_measure VARCHAR(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'በቁጥር',
    inv_item_id BIGINT NULL,
    default_unit_price DECIMAL(15,2) NOT NULL DEFAULT 0.00,
    display_order INT NOT NULL DEFAULT 0,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at DATETIME DEFAULT NOW(),
    updated_at DATETIME DEFAULT NOW() ON UPDATE NOW(),
    FOREIGN KEY (inv_item_id) REFERENCES inv_item(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 2. Standard Additional Fee Types
CREATE TABLE IF NOT EXISTS custom_additional_fee_type (
    id INT AUTO_INCREMENT PRIMARY KEY,
    fee_code VARCHAR(50) NOT NULL UNIQUE,
    fee_name VARCHAR(200) NOT NULL,
    fee_name_am VARCHAR(200) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
    default_amount DECIMAL(15,2) NOT NULL DEFAULT 0.00,
    unit_name VARCHAR(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'ብር',
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at DATETIME DEFAULT NOW()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 3. Core New Line Connection Request
CREATE TABLE IF NOT EXISTS custom_new_line_connection_request (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    application_number VARCHAR(50) NOT NULL UNIQUE,
    customer_id INT NULL,
    applicant_name VARCHAR(200) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
    customer_full_name VARCHAR(200) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
    customer_full_name_eng VARCHAR(200),
    phone_number VARCHAR(50) NOT NULL,
    national_id_number VARCHAR(50),
    house_number VARCHAR(50),
    kebele_id INT NULL,
    ketena_id INT NULL,
    customer_type_id INT NULL,
    branch_id INT NULL,
    address_description TEXT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
    
    -- Status pipeline
    status VARCHAR(50) NOT NULL DEFAULT 'PENDING_SURVEY_ASSIGNMENT',
    
    -- Survey & Technical Stage
    survey_plumber_id INT NULL,
    survey_assigned_date DATETIME NULL,
    survey_plumber_notes TEXT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL,
    
    -- Financial Totals (Static percentages: 55% Service, 25% Transport)
    materials_utility_total DECIMAL(15,2) NOT NULL DEFAULT 0.00,
    materials_outside_total DECIMAL(15,2) NOT NULL DEFAULT 0.00,
    service_charge_percent DECIMAL(5,2) NOT NULL DEFAULT 55.00,
    service_charge_amount DECIMAL(15,2) NOT NULL DEFAULT 0.00,
    transport_charge_percent DECIMAL(5,2) NOT NULL DEFAULT 25.00,
    transport_charge_amount DECIMAL(15,2) NOT NULL DEFAULT 0.00,
    additional_fees_total DECIMAL(15,2) NOT NULL DEFAULT 0.00,
    total_payable_amount DECIMAL(15,2) NOT NULL DEFAULT 0.00,
    
    -- Revenue Stage
    is_paid BOOLEAN NOT NULL DEFAULT FALSE,
    payment_reference_number VARCHAR(100) NULL,
    payment_receipt_number VARCHAR(100) NULL,
    payment_approved_by VARCHAR(100) NULL,
    payment_approved_date DATETIME NULL,
    
    -- Store Dispatch Stage
    inv_issue_voucher_id BIGINT NULL,
    materials_collected_date DATETIME NULL,
    storekeeper_username VARCHAR(100) NULL,
    
    -- Installation Stage
    installation_plumber_id INT NULL,
    installation_assigned_date DATETIME NULL,
    installation_completed_date DATETIME NULL,
    installation_notes TEXT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL,
    installation_approved_by VARCHAR(100) NULL,
    
    -- Final Activation Stage
    meter_number VARCHAR(50) NULL,
    meter_size_id INT NULL,
    initial_reading DOUBLE NOT NULL DEFAULT 0.0,
    assigned_reader_id INT NULL,
    location_coordination VARCHAR(100) NULL,
    activated_by VARCHAR(100) NULL,
    activated_date DATETIME NULL,
    
    created_by VARCHAR(100) NULL,
    created_at DATETIME DEFAULT NOW(),
    updated_at DATETIME DEFAULT NOW() ON UPDATE NOW(),
    
    FOREIGN KEY (customer_id) REFERENCES billing_customer_info(id) ON DELETE SET NULL,
    FOREIGN KEY (kebele_id) REFERENCES address_streets(id) ON DELETE SET NULL,
    FOREIGN KEY (ketena_id) REFERENCES address_ketena(id) ON DELETE SET NULL,
    FOREIGN KEY (customer_type_id) REFERENCES billing_customer_type(id) ON DELETE SET NULL,
    FOREIGN KEY (branch_id) REFERENCES branchs(id) ON DELETE SET NULL,
    FOREIGN KEY (survey_plumber_id) REFERENCES user_account(id) ON DELETE SET NULL,
    FOREIGN KEY (installation_plumber_id) REFERENCES user_account(id) ON DELETE SET NULL,
    FOREIGN KEY (assigned_reader_id) REFERENCES user_account(id) ON DELETE SET NULL,
    FOREIGN KEY (inv_issue_voucher_id) REFERENCES inv_issue_voucher(id) ON DELETE SET NULL,
    INDEX idx_cnl_status (status),
    INDEX idx_cnl_branch (branch_id),
    INDEX idx_cnl_phone (phone_number)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 4. Line Items Surveyed for Connection
CREATE TABLE IF NOT EXISTS custom_new_line_item (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    request_id BIGINT NOT NULL,
    common_material_id BIGINT NULL,
    inv_item_id BIGINT NULL,
    item_name VARCHAR(200) NOT NULL,
    item_name_am VARCHAR(200) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL,
    unit_of_measure VARCHAR(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT 'በቁጥር',
    surveyed_quantity DECIMAL(12,2) NOT NULL DEFAULT 0.00,
    
    -- Purchased from Utility
    utility_quantity DECIMAL(12,2) NOT NULL DEFAULT 0.00,
    utility_unit_price DECIMAL(15,2) NOT NULL DEFAULT 0.00,
    utility_total_price DECIMAL(15,2) NOT NULL DEFAULT 0.00,
    
    -- Purchased Outside / from Market
    outside_quantity DECIMAL(12,2) NOT NULL DEFAULT 0.00,
    outside_unit_price DECIMAL(15,2) NOT NULL DEFAULT 0.00,
    outside_total_price DECIMAL(15,2) NOT NULL DEFAULT 0.00,
    
    remarks VARCHAR(500) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL,
    
    FOREIGN KEY (request_id) REFERENCES custom_new_line_connection_request(id) ON DELETE CASCADE,
    FOREIGN KEY (common_material_id) REFERENCES custom_common_material(id) ON DELETE SET NULL,
    FOREIGN KEY (inv_item_id) REFERENCES inv_item(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 5. Additional Fees attached to connection request
CREATE TABLE IF NOT EXISTS custom_new_line_additional_fee (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    request_id BIGINT NOT NULL,
    fee_type_id INT NULL,
    fee_name VARCHAR(200) NOT NULL,
    fee_name_am VARCHAR(200) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL,
    unit_name VARCHAR(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT 'ብር',
    quantity DECIMAL(10,2) NOT NULL DEFAULT 1.00,
    unit_price DECIMAL(15,2) NOT NULL DEFAULT 0.00,
    total_price DECIMAL(15,2) NOT NULL DEFAULT 0.00,
    remarks VARCHAR(500) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL,
    
    FOREIGN KEY (request_id) REFERENCES custom_new_line_connection_request(id) ON DELETE CASCADE,
    FOREIGN KEY (fee_type_id) REFERENCES custom_additional_fee_type(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 6. Activity & Audit Trail
CREATE TABLE IF NOT EXISTS custom_new_line_activity_log (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    request_id BIGINT NOT NULL,
    action VARCHAR(50) NOT NULL,
    from_status VARCHAR(50) NULL,
    to_status VARCHAR(50) NOT NULL,
    actor_username VARCHAR(100) NOT NULL,
    actor_role VARCHAR(100) NULL,
    comments TEXT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL,
    created_at DATETIME DEFAULT NOW(),
    
    FOREIGN KEY (request_id) REFERENCES custom_new_line_connection_request(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ====================================================================
-- SEED DATA: Curated Common Materials (Ethiopian Water Utility)
-- ====================================================================
INSERT INTO custom_common_material (material_code, material_name, material_name_am, unit_of_measure, default_unit_price, display_order) VALUES
('MAT_HDPE_HALF', 'HDPE Pipe 1/2"', 'ቢ.ባ. ኤች.ዲ.ፒ. 1/2"', 'ሜትር', 35.36, 1),
('MAT_PIPE_HALF', 'GI Pipe 1/2"', 'ቧንቧ 1/2"', 'በቁጥር', 44.08, 2),
('MAT_MALE_ADAPT_HALF', 'Male Adapter 1/2"', 'ሜል አዳፕተር 1/2"', 'በቁጥር', 149.50, 3),
('MAT_FEM_ADAPT_HALF', 'Female Adapter 1/2"', 'ፊሜል አዳፕተር 1/2"', 'በቁጥር', 35.00, 4),
('MAT_UNION_SADDLE', 'Union / Saddle 1 1/2" - 1"', 'ዩኒየን /ሲግናል ሳድል 1 1/2" - 1"', 'በቁጥር', 69.00, 5),
('MAT_FEM_THREAD_HALF', 'Female Threaded 1/2"', 'ፊሜል ትሬዴት 1/2"', 'በቁጥር', 60.00, 6),
('MAT_COMP_TEE_HALF', 'Compression Tee 1/2"', 'ኮምፕሬሽን ቲ 1/2"', 'በቁጥር', 17.00, 7),
('MAT_END_CAP_HALF', 'End Cap 1/2"', 'ኤንድ ካፕ 1/2"', 'በቁጥር', 29.80, 8),
('MAT_STOP_VALVE_HALF', 'Stop Valve 1/2"', 'እስቶፕ ቆልፍ/ቫልቭ 1/2"', 'በቁጥር', 66.00, 9),
('MAT_REDUCER_1_HALF', 'Coupling Reducer 1" - 1/2"', 'ካፕሊንግ ሬዲዩሰር 1" - 1/2"', 'በቁጥር', 80.99, 10),
('MAT_TEFLON_TAPE', 'Teflon Tape', 'ቴፍሎን ቴፕ', 'በቁጥር', 25.00, 11),
('MAT_WATER_METER_HALF', 'Water Meter 1/2"', 'የውሃ ቆጣሪ 1/2"', 'በቁጥር', 1200.00, 12),
('MAT_CLAMP_SADDLE', 'Clamp Saddle', 'ክላምፕ ሳድል', 'በቁጥር', 85.00, 13),
('MAT_GATE_VALVE_HALF', 'Gate Valve 1/2"', 'ጌት ቫልቭ 1/2"', 'በቁጥር', 110.00, 14),
('MAT_NIPPLE_HALF', 'Nipple 1/2"', 'ኒፕል 1/2"', 'በቁጥር', 30.00, 15),
('MAT_ELBOW_HALF', 'Elbow 1/2"', 'ኤልቦ 1/2"', 'በቁጥር', 45.00, 16),
('MAT_GI_PIPE_FULL', 'GI Pipe Full Length', 'ጋልቫናይዝድ ፓይፕ', 'በቁጥር', 250.00, 17);

-- ====================================================================
-- SEED DATA: Standard Additional Fee Types
-- ====================================================================
INSERT INTO custom_additional_fee_type (fee_code, fee_name, fee_name_am, default_amount, unit_name) VALUES
('FEE_SURVEY', 'Site Survey Fee', 'የዳሰሳ ጥናት ክፍያ', 40.00, 'ብር'),
('FEE_EXCAVATION', 'Excavation / Inspection', 'ከተቆጣጣሪ / ቁፋሮ', 50.00, 'ብር'),
('FEE_PHOTOCOPY', 'Photocopy Charge', 'ፎቶ ኮፒ', 6.00, 'ብር'),
('FEE_DOCUMENT', 'Document & Form Processing', 'ሰነድ / ደረሰኝ', 4.00, 'ብር'),
('FEE_STICKER', 'Meter Security Sticker', 'ስቴከር', 5.00, 'ብር'),
('FEE_STAMP', 'Legal Revenue Stamp', 'ታምብ', 70.00, 'ብር');
