-- =============================================================================
-- 1. Maintenance Types Table (የጥገና ዓይነቶች ማውጫ)
-- =============================================================================
CREATE TABLE IF NOT EXISTS custom_maintenance_type (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    type_code VARCHAR(50) NOT NULL UNIQUE,
    type_name VARCHAR(200) NOT NULL,
    type_name_am VARCHAR(200) NOT NULL,
    description TEXT NULL,
    display_order INT NOT NULL DEFAULT 0,
    is_active TINYINT(1) NOT NULL DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =============================================================================
-- 2. Maintenance Common Materials (በጥገና ዓይነት የተከፋፈሉ የተለመዱ እቃዎች ካታሎግ)
-- =============================================================================
CREATE TABLE IF NOT EXISTS custom_maintenance_common_material (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    maintenance_type_id BIGINT NOT NULL,
    material_code VARCHAR(50) NOT NULL,
    material_name VARCHAR(200) NOT NULL,
    material_name_am VARCHAR(200) NOT NULL,
    unit_of_measure VARCHAR(50) NOT NULL DEFAULT 'በቁጥር',
    inv_item_id BIGINT NULL,
    default_unit_price DECIMAL(15,2) NOT NULL DEFAULT 0.00,
    display_order INT NOT NULL DEFAULT 0,
    is_active TINYINT(1) NOT NULL DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_cmm_type (maintenance_type_id),
    CONSTRAINT fk_cmm_type FOREIGN KEY (maintenance_type_id) REFERENCES custom_maintenance_type(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =============================================================================
-- 3. Maintenance Requests (የጥገና ጥያቄዎች ማዕከላዊ ሠንጠረዥ - ከተመዘገበ ደንበኛ ጋር የተቆራኘ)
-- =============================================================================
CREATE TABLE IF NOT EXISTS custom_maintenance_request (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    request_number VARCHAR(50) NOT NULL UNIQUE,
    customer_id INT NOT NULL,
    maintenance_type_id BIGINT NULL,
    customer_full_name VARCHAR(200) NOT NULL,
    customer_full_name_eng VARCHAR(200) NULL,
    phone_number VARCHAR(50) NOT NULL,
    national_id_number VARCHAR(50) NULL,
    house_number VARCHAR(50) NULL,
    account_number VARCHAR(50) NOT NULL,
    meter_number VARCHAR(50) NULL,
    branch_id INT NOT NULL,
    kebele_id INT NULL,
    ketena_id INT NULL,
    customer_type_id INT NULL,
    address_description TEXT NULL,
    problem_description TEXT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'PENDING_SURVEY_ASSIGNMENT',
    survey_plumber_id INT NULL,
    survey_assigned_date DATETIME NULL,
    survey_plumber_notes TEXT NULL,
    materials_utility_total DECIMAL(15,2) NOT NULL DEFAULT 0.00,
    materials_outside_total DECIMAL(15,2) NOT NULL DEFAULT 0.00,
    service_charge_percent DECIMAL(5,2) NOT NULL DEFAULT 55.00,
    service_charge_amount DECIMAL(15,2) NOT NULL DEFAULT 0.00,
    transport_charge_percent DECIMAL(5,2) NOT NULL DEFAULT 25.00,
    transport_charge_amount DECIMAL(15,2) NOT NULL DEFAULT 0.00,
    additional_fees_total DECIMAL(15,2) NOT NULL DEFAULT 0.00,
    total_payable_amount DECIMAL(15,2) NOT NULL DEFAULT 0.00,
    is_paid TINYINT(1) NOT NULL DEFAULT 0,
    payment_reference_number VARCHAR(100) NULL,
    payment_receipt_number VARCHAR(100) NULL,
    payment_approved_by VARCHAR(100) NULL,
    payment_approved_date DATETIME NULL,
    inv_issue_voucher_id BIGINT NULL,
    materials_collected_date DATETIME NULL,
    storekeeper_username VARCHAR(100) NULL,
    maintenance_plumber_id INT NULL,
    maintenance_assigned_date DATETIME NULL,
    maintenance_completed_date DATETIME NULL,
    maintenance_notes TEXT NULL,
    maintenance_approved_by VARCHAR(100) NULL,
    final_meter_reading DOUBLE NULL,
    registered_by VARCHAR(100) NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_cmr_status (status),
    INDEX idx_cmr_branch (branch_id),
    INDEX idx_cmr_customer (customer_id),
    INDEX idx_cmr_phone (phone_number),
    INDEX idx_cmr_account (account_number),
    CONSTRAINT fk_cmr_customer FOREIGN KEY (customer_id) REFERENCES billing_customer_info(id),
    CONSTRAINT fk_cmr_type FOREIGN KEY (maintenance_type_id) REFERENCES custom_maintenance_type(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =============================================================================
-- 4. Maintenance Items (የጥገና ዕቃዎች ዝርዝር - Utility & Outside Market split)
-- =============================================================================
CREATE TABLE IF NOT EXISTS custom_maintenance_item (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    request_id BIGINT NOT NULL,
    maintenance_common_material_id BIGINT NULL,
    inv_item_id BIGINT NULL,
    item_name VARCHAR(200) NOT NULL,
    item_name_am VARCHAR(200) NOT NULL,
    unit_of_measure VARCHAR(50) NOT NULL DEFAULT 'በቁጥር',
    surveyed_quantity DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    utility_quantity DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    utility_unit_price DECIMAL(15,2) NOT NULL DEFAULT 0.00,
    utility_total_price DECIMAL(15,2) NOT NULL DEFAULT 0.00,
    outside_quantity DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    outside_unit_price DECIMAL(15,2) NOT NULL DEFAULT 0.00,
    outside_total_price DECIMAL(15,2) NOT NULL DEFAULT 0.00,
    remarks VARCHAR(500) NULL,
    INDEX idx_cmi_req (request_id),
    CONSTRAINT fk_cmi_req FOREIGN KEY (request_id) REFERENCES custom_maintenance_request(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =============================================================================
-- 5. Maintenance Additional Fees (ተጨማሪ የአገልግሎትና የስራ ክፍያዎች)
-- =============================================================================
CREATE TABLE IF NOT EXISTS custom_maintenance_additional_fee (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    request_id BIGINT NOT NULL,
    fee_type_id INT NULL,
    fee_name VARCHAR(200) NOT NULL,
    fee_name_am VARCHAR(200) NOT NULL,
    unit_name VARCHAR(50) NOT NULL DEFAULT 'ብር',
    quantity DECIMAL(10,2) NOT NULL DEFAULT 1.00,
    unit_price DECIMAL(15,2) NOT NULL DEFAULT 0.00,
    total_price DECIMAL(15,2) NOT NULL DEFAULT 0.00,
    remarks VARCHAR(500) NULL,
    INDEX idx_cmaf_req (request_id),
    CONSTRAINT fk_cmaf_req FOREIGN KEY (request_id) REFERENCES custom_maintenance_request(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =============================================================================
-- 6. Maintenance Activity Log (የጥገና ሂደት ኦዲት ሎግ)
-- =============================================================================
CREATE TABLE IF NOT EXISTS custom_maintenance_activity_log (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    request_id BIGINT NOT NULL,
    action VARCHAR(100) NOT NULL,
    from_status VARCHAR(50) NULL,
    to_status VARCHAR(50) NOT NULL,
    actor_username VARCHAR(100) NOT NULL,
    actor_role VARCHAR(100) NULL,
    comments TEXT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_cmal_req (request_id),
    CONSTRAINT fk_cmal_req FOREIGN KEY (request_id) REFERENCES custom_maintenance_request(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;



-- =============================================================================
-- A. Seed Default Maintenance Types (የተለመዱ የጥገና ዓይነቶች)
-- =============================================================================
INSERT INTO custom_maintenance_type (type_code, type_name, type_name_am, description, display_order)
VALUES 
('PIPE_LEAKAGE', 'Pipe Leakage Repair', 'የቧንቧ ፍሳሽ ጥገና', 'Repair of leaking HDPE / GI pipes and fittings', 1),
('METER_REPLACE', 'Water Meter Replacement / Repair', 'የውሃ ቆጣሪ ቅያሬ / ጥገና', 'Replacement of broken, stuck, or aged water meter', 2),
('GATE_VALVE', 'Gate Valve & Fitting Repair', 'የጌት ቫልቭ እና ማገናኛ ጥገና', 'Servicing and replacing worn-out gate valves and nipples', 3),
('LINE_BURST', 'Main Line Breakdown Repair', 'የዋና መስመር መቆራረጥ ጥገና', 'Urgent line burst repair, reconnection and welding', 4),
('OTHER_MAINTENANCE', 'General / Other Maintenance', 'አጠቃላይ / ሌሎች ጥገናዎች', 'Other miscellaneous customer site water maintenance', 5)
ON DUPLICATE KEY UPDATE type_name_am=VALUES(type_name_am);

-- =============================================================================
-- B. Seed Categorized Common Materials per Maintenance Type
-- =============================================================================

-- 1. PIPE_LEAKAGE (maintenance_type_id = 1)
INSERT INTO custom_maintenance_common_material (maintenance_type_id, material_code, material_name, material_name_am, unit_of_measure, default_unit_price, display_order)
VALUES
(1, 'PL_HDPE_HALF', 'HDPE Pipe 1/2"', 'ቢ.ባ. ኤች.ዲ.ፒ. 1/2"', 'ሜትር', 35.36, 1),
(1, 'PL_MALE_ADAPT', 'Male Adapter 1/2"', 'ወንድ አዳፕተር 1/2"', 'በቁጥር', 149.50, 2),
(1, 'PL_FEM_ADAPT', 'Female Adapter 1/2"', 'ሴት አዳፕተር 1/2"', 'በቁጥር', 35.00, 3),
(1, 'PL_COMP_TEE', 'Compression Tee 1/2"', 'ኮምፕሬሽን ቲ 1/2"', 'በቁጥር', 17.00, 4),
(1, 'PL_CLAMP_SADDLE', 'Clamp Saddle', 'ክላምፕ ሳድል', 'በቁጥር', 85.00, 5),
(1, 'PL_TEFLON_TAPE', 'Teflon Tape', 'ቴፍሎን ቴፕ', 'በቁጥር', 25.00, 6),
(1, 'PL_ELBOW_HALF', 'Elbow 1/2"', 'ኤልቦ 1/2"', 'በቁጥር', 45.00, 7),
(1, 'PL_NIPPLE_HALF', 'Nipple 1/2"', 'ኒፕል 1/2"', 'በቁጥር', 30.00, 8);

-- 2. METER_REPLACE (maintenance_type_id = 2)
INSERT INTO custom_maintenance_common_material (maintenance_type_id, material_code, material_name, material_name_am, unit_of_measure, default_unit_price, display_order)
VALUES
(2, 'MR_WATER_METER', 'Water Meter 1/2"', 'የውሃ ቆጣሪ 1/2"', 'በቁጥር', 1200.00, 1),
(2, 'MR_STOP_VALVE', 'Stop Valve 1/2"', 'ስቶፕ ቫልቭ/ኮክ 1/2"', 'በቁጥር', 66.00, 2),
(2, 'MR_GATE_VALVE', 'Gate Valve 1/2"', 'ጌት ቫልቭ 1/2"', 'በቁጥር', 110.00, 3),
(2, 'MR_NIPPLE_HALF', 'Nipple 1/2"', 'ኒፕል 1/2"', 'በቁጥር', 30.00, 4),
(2, 'MR_MALE_ADAPT', 'Male Adapter 1/2"', 'ወንድ አዳፕተር 1/2"', 'በቁጥር', 149.50, 5),
(2, 'MR_FEM_ADAPT', 'Female Adapter 1/2"', 'ሴት አዳፕተር 1/2"', 'በቁጥር', 35.00, 6),
(2, 'MR_TEFLON_TAPE', 'Teflon Tape', 'ቴፍሎን ቴፕ', 'በቁጥር', 25.00, 7);

-- 3. GATE_VALVE (maintenance_type_id = 3)
INSERT INTO custom_maintenance_common_material (maintenance_type_id, material_code, material_name, material_name_am, unit_of_measure, default_unit_price, display_order)
VALUES
(3, 'GV_GATE_VALVE', 'Gate Valve 1/2"', 'ጌት ቫልቭ 1/2"', 'በቁጥር', 110.00, 1),
(3, 'GV_STOP_VALVE', 'Stop Valve 1/2"', 'ስቶፕ ቫልቭ/ኮክ 1/2"', 'በቁጥር', 66.00, 2),
(3, 'GV_NIPPLE_HALF', 'Nipple 1/2"', 'ኒፕል 1/2"', 'በቁጥር', 30.00, 3),
(3, 'GV_UNION_SADDLE', 'Union / Saddle 1 1/2" - 1"', 'ዩኒየን /ሳድል ክላም 1 1/2" - 1"', 'በቁጥር', 69.00, 4),
(3, 'GV_TEFLON_TAPE', 'Teflon Tape', 'ቴፍሎን ቴፕ', 'በቁጥር', 25.00, 5);

-- 4. LINE_BURST (maintenance_type_id = 4)
INSERT INTO custom_maintenance_common_material (maintenance_type_id, material_code, material_name, material_name_am, unit_of_measure, default_unit_price, display_order)
VALUES
(4, 'LB_GI_PIPE_FULL', 'GI Pipe Full Length', 'ጋልቫናይዝድ ቧንቧ', 'በቁጥር', 250.00, 1),
(4, 'LB_HDPE_HALF', 'HDPE Pipe 1/2"', 'ቢ.ባ. ኤች.ዲ.ፒ. 1/2"', 'ሜትር', 35.36, 2),
(4, 'LB_COMP_TEE', 'Compression Tee 1/2"', 'ኮምፕሬሽን ቲ 1/2"', 'በቁጥር', 17.00, 3),
(4, 'LB_CLAMP_SADDLE', 'Clamp Saddle', 'ክላምፕ ሳድል', 'በቁጥር', 85.00, 4),
(4, 'LB_REDUCER', 'Coupling Reducer 1" - 1/2"', 'ካፕሊንግ ሬዲዩሰር 1" - 1/2"', 'በቁጥር', 80.99, 5),
(4, 'LB_END_CAP', 'End Cap 1/2"', 'ኤንድ ካፕ 1/2"', 'በቁጥር', 29.80, 6);

-- 5. OTHER_MAINTENANCE (maintenance_type_id = 5)
INSERT INTO custom_maintenance_common_material (maintenance_type_id, material_code, material_name, material_name_am, unit_of_measure, default_unit_price, display_order)
VALUES
(5, 'OM_HDPE_HALF', 'HDPE Pipe 1/2"', 'ቢ.ባ. ኤች.ዲ.ፒ. 1/2"', 'ሜትር', 35.36, 1),
(5, 'OM_GI_PIPE_HALF', 'GI Pipe 1/2"', 'ቧንቧ 1/2"', 'በቁጥር', 44.08, 2),
(5, 'OM_MALE_ADAPT', 'Male Adapter 1/2"', 'ወንድ አዳፕተር 1/2"', 'በቁጥር', 149.50, 3),
(5, 'OM_WATER_METER', 'Water Meter 1/2"', 'የውሃ ቆጣሪ 1/2"', 'በቁጥር', 1200.00, 4),
(5, 'OM_GATE_VALVE', 'Gate Valve 1/2"', 'ጌት ቫልቭ 1/2"', 'በቁጥር', 110.00, 5),
(5, 'OM_TEFLON_TAPE', 'Teflon Tape', 'ቴፍሎን ቴፕ', 'በቁጥር', 25.00, 6);
