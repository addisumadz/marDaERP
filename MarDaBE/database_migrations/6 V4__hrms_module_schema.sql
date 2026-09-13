-- ══════════════════════════════════════════════════════════════════════════════════════════════
-- V4__hrms_module_schema.sql
-- Enterprise Human Resource Management System (HRMS) Schema for Ethiopian Municipal Water Utility
-- Regulated by Ethiopian Labour Proclamation No. 1156/2019
-- Prefix: hrms_
-- Completely self-contained: Does NOT depend on any old hrm_* legacy tables!
-- Safe to execute idempotently on fresh or existing databases.
-- ══════════════════════════════════════════════════════════════════════════════════════════════

SET FOREIGN_KEY_CHECKS = 0;

-- ----------------------------------------------------------------------------------------------
-- 1. Organizational Structure: Departments, Positions, Job Grades
-- ----------------------------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS `hrms_departments` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `department_code` VARCHAR(50) NOT NULL UNIQUE,
  `department_name` VARCHAR(150) NOT NULL,
  `department_name_am` VARCHAR(200) DEFAULT NULL,
  `parent_department_id` INT DEFAULT NULL,
  `manager_employee_id` INT DEFAULT NULL,
  `cost_center_code` VARCHAR(50) DEFAULT NULL,
  `is_active` TINYINT(1) NOT NULL DEFAULT 1,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT `fk_hrms_dept_parent` FOREIGN KEY (`parent_department_id`) REFERENCES `hrms_departments` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE TABLE IF NOT EXISTS `hrms_job_grades` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `grade_code` VARCHAR(50) NOT NULL UNIQUE,
  `grade_name` VARCHAR(100) NOT NULL,
  `min_salary` DOUBLE NOT NULL DEFAULT 0,
  `max_salary` DOUBLE NOT NULL DEFAULT 0,
  `step_increment_rate` DOUBLE NOT NULL DEFAULT 0,
  `description` VARCHAR(255) DEFAULT NULL,
  `is_active` TINYINT(1) NOT NULL DEFAULT 1,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE TABLE IF NOT EXISTS `hrms_positions` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `position_code` VARCHAR(50) NOT NULL UNIQUE,
  `position_title` VARCHAR(150) NOT NULL,
  `position_title_am` VARCHAR(200) DEFAULT NULL,
  `department_id` INT NOT NULL,
  `job_grade_id` INT DEFAULT NULL,
  `approved_headcount` INT NOT NULL DEFAULT 1,
  `is_hazardous` TINYINT(1) NOT NULL DEFAULT 0,
  `requires_shift_work` TINYINT(1) NOT NULL DEFAULT 0,
  `is_active` TINYINT(1) NOT NULL DEFAULT 1,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT `fk_hrms_pos_dept` FOREIGN KEY (`department_id`) REFERENCES `hrms_departments` (`id`),
  CONSTRAINT `fk_hrms_pos_grade` FOREIGN KEY (`job_grade_id`) REFERENCES `hrms_job_grades` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- ----------------------------------------------------------------------------------------------
-- 2. Employee Master Record & Dossiers
-- ----------------------------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS `hrms_employee_info` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `employee_id` VARCHAR(50) NOT NULL UNIQUE,
  `tin_number` VARCHAR(50) DEFAULT NULL,
  `fayda_national_id` VARCHAR(50) DEFAULT NULL,
  `pension_number` VARCHAR(50) DEFAULT NULL,
  `full_name` VARCHAR(200) NOT NULL,
  `full_name_am` VARCHAR(300) NOT NULL,
  `mother_name` VARCHAR(150) DEFAULT NULL,
  `marital_status` VARCHAR(50) DEFAULT 'SINGLE',
  `disability_status` VARCHAR(100) DEFAULT 'NONE',
  `sex` VARCHAR(10) NOT NULL,
  `date_of_birth` DATE DEFAULT NULL,
  `nationality` VARCHAR(100) DEFAULT 'Ethiopian',
  `blood_group` VARCHAR(10) DEFAULT NULL,
  
  -- Placement & Organization
  `department_id` INT DEFAULT NULL,
  `position_id` INT DEFAULT NULL,
  `job_grade_id` INT DEFAULT NULL,
  `duty_station` VARCHAR(150) DEFAULT 'Head Office',
  `branchs_id` INT DEFAULT NULL,
  `address_city_id` INT DEFAULT NULL,
  `address_ketena_id` INT DEFAULT NULL,
  `address_streets_id` INT DEFAULT NULL,
  `phone_number` VARCHAR(50) DEFAULT NULL,
  `email` VARCHAR(100) DEFAULT NULL,
  `emergency_contact_name` VARCHAR(150) DEFAULT NULL,
  `emergency_contact_phone` VARCHAR(50) DEFAULT NULL,
  
  -- Employment Details (Labour Proclamation 1156/2019)
  `employment_type` VARCHAR(50) NOT NULL DEFAULT 'PERMANENT',
  `employment_status` VARCHAR(50) NOT NULL DEFAULT 'ACTIVE',
  `first_employment_date` DATE DEFAULT NULL,
  `yeteketerubet_ken` DATE DEFAULT NULL,
  `probation_end_date` DATE DEFAULT NULL,
  `tureta_yemiwetubet_ken` DATE DEFAULT NULL,
  `current_salary` DOUBLE NOT NULL DEFAULT 0,
  
  -- Biometric & Attendance Hardware Identification
  `biometric_pin` VARCHAR(50) DEFAULT NULL,
  `rfid_card_number` VARCHAR(50) DEFAULT NULL,
  
  -- Dual Banking Architecture (Primary CBE, Secondary Abay Bank)
  `primary_bank_name` VARCHAR(100) DEFAULT 'Commercial Bank of Ethiopia',
  `primary_bank_account` VARCHAR(50) DEFAULT NULL,
  `primary_bank_branch` VARCHAR(100) DEFAULT NULL,
  `secondary_bank_name` VARCHAR(100) DEFAULT 'Abay Bank',
  `secondary_bank_account` VARCHAR(50) DEFAULT NULL,
  `secondary_bank_branch` VARCHAR(100) DEFAULT NULL,
  `secondary_payment_purpose` VARCHAR(150) DEFAULT 'Per Diem & Special Allowances',
  
  -- Media & Signatures
  `employee_photo` VARCHAR(255) DEFAULT NULL,
  `employee_signature` VARCHAR(255) DEFAULT NULL,
  
  -- Audit fields
  `registered_by` INT DEFAULT NULL,
  `registered_date` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `modified_by` INT DEFAULT NULL,
  `modified_date` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `is_deleted` TINYINT(1) NOT NULL DEFAULT 0,
  `is_salary_defaults_modified` TINYINT(1) NOT NULL DEFAULT 0,
  
  CONSTRAINT `fk_hrms_emp_dept` FOREIGN KEY (`department_id`) REFERENCES `hrms_departments` (`id`) ON DELETE SET NULL,
  CONSTRAINT `fk_hrms_emp_pos` FOREIGN KEY (`position_id`) REFERENCES `hrms_positions` (`id`) ON DELETE SET NULL,
  CONSTRAINT `fk_hrms_emp_grade` FOREIGN KEY (`job_grade_id`) REFERENCES `hrms_job_grades` (`id`) ON DELETE SET NULL,
  CONSTRAINT `fk_hrms_emp_branch` FOREIGN KEY (`branchs_id`) REFERENCES `branchs` (`id`) ON DELETE SET NULL,
  CONSTRAINT `fk_hrms_emp_city` FOREIGN KEY (`address_city_id`) REFERENCES `address_city` (`id`) ON DELETE SET NULL,
  CONSTRAINT `fk_hrms_emp_ketena` FOREIGN KEY (`address_ketena_id`) REFERENCES `address_ketena` (`id`) ON DELETE SET NULL,
  CONSTRAINT `fk_hrms_emp_street` FOREIGN KEY (`address_streets_id`) REFERENCES `address_streets` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- ----------------------------------------------------------------------------------------------
-- 3. Education, Skills, Work Experience, Dependents & Dossier
-- ----------------------------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS `hrms_employee_education` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `hrms_employee_info_id` INT NOT NULL,
  `yetmhrt_dereja` VARCHAR(100) NOT NULL,
  `yetmhrtbet_sm` VARCHAR(200) NOT NULL,
  `yetmhrt_aynet` VARCHAR(200) NOT NULL,
  `yetmhrt_dereja_status` VARCHAR(100) DEFAULT 'COMPLETED',
  `graduation_year_ec` VARCHAR(20) DEFAULT NULL,
  `gpa` DOUBLE DEFAULT NULL,
  `registered_date` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `registered_by` INT DEFAULT NULL,
  `modified_date` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `modified_by` INT DEFAULT NULL,
  `is_deleted` TINYINT(1) NOT NULL DEFAULT 0,
  CONSTRAINT `fk_hrms_edu_emp` FOREIGN KEY (`hrms_employee_info_id`) REFERENCES `hrms_employee_info` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE TABLE IF NOT EXISTS `hrms_employee_chlota` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `hrms_employee_info_id` INT NOT NULL,
  `chlota_sm` VARCHAR(200) NOT NULL,
  `chlota_label` VARCHAR(200) DEFAULT NULL,
  `chlota_level` VARCHAR(50) DEFAULT 'INTERMEDIATE',
  `chlota_remark` TEXT DEFAULT NULL,
  `registered_date` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `registered_by` INT DEFAULT NULL,
  `modified_date` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `modified_by` INT DEFAULT NULL,
  `is_deleted` TINYINT(1) NOT NULL DEFAULT 0,
  CONSTRAINT `fk_hrms_chlota_emp` FOREIGN KEY (`hrms_employee_info_id`) REFERENCES `hrms_employee_info` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE TABLE IF NOT EXISTS `hrms_employee_yeteketerebachew` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `hrms_employee_info_id` INT NOT NULL,
  `organization_name` VARCHAR(200) NOT NULL,
  `yesra_medeb` VARCHAR(150) NOT NULL,
  `demewez_meten` DOUBLE NOT NULL DEFAULT 0,
  `employeed_from` DATE NOT NULL,
  `employeed_to` DATE DEFAULT NULL,
  `reason_for_leaving` VARCHAR(255) DEFAULT NULL,
  `registered_date` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `registered_by` INT DEFAULT NULL,
  `modified_date` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `modified_by` INT DEFAULT NULL,
  `is_deleted` TINYINT(1) NOT NULL DEFAULT 0,
  CONSTRAINT `fk_hrms_exp_emp` FOREIGN KEY (`hrms_employee_info_id`) REFERENCES `hrms_employee_info` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE TABLE IF NOT EXISTS `hrms_employee_ljoch` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `hrms_employee_info_id` INT NOT NULL,
  `yelj_mulu_sm` VARCHAR(200) NOT NULL,
  `birth_date` DATE NOT NULL,
  `tsota` VARCHAR(10) NOT NULL,
  `yeabat_or_enat_mulusm` VARCHAR(200) DEFAULT NULL,
  `registered_date` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `registered_by` INT DEFAULT NULL,
  `modified_date` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `modified_by` INT DEFAULT NULL,
  `is_deleted` TINYINT(1) NOT NULL DEFAULT 0,
  CONSTRAINT `fk_hrms_ljoch_emp` FOREIGN KEY (`hrms_employee_info_id`) REFERENCES `hrms_employee_info` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE TABLE IF NOT EXISTS `hrms_employee_yesewnet_meglecha` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `hrms_employee_info_id` INT NOT NULL,
  `meglecha_label` VARCHAR(200) NOT NULL,
  `meglecha_value` VARCHAR(200) NOT NULL,
  `registered_by` INT DEFAULT NULL,
  `registered_date` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `modified_by` INT DEFAULT NULL,
  `modified_date` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `is_deleted` TINYINT(1) NOT NULL DEFAULT 0,
  CONSTRAINT `fk_hrms_meglecha_emp` FOREIGN KEY (`hrms_employee_info_id`) REFERENCES `hrms_employee_info` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE TABLE IF NOT EXISTS `hrms_employee_info_photo` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `hrms_employee_info_id` INT NOT NULL,
  `is_document` TINYINT(1) NOT NULL DEFAULT 0,
  `is_photo` TINYINT(1) NOT NULL DEFAULT 0,
  `document_photo` VARCHAR(255) NOT NULL,
  `document_title` VARCHAR(200) DEFAULT NULL,
  `document_description` TEXT DEFAULT NULL,
  `registered_by` INT DEFAULT NULL,
  `registered_date` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `modified_by` INT DEFAULT NULL,
  `modified_date` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `is_deleted` TINYINT(1) NOT NULL DEFAULT 0,
  CONSTRAINT `fk_hrms_photo_emp` FOREIGN KEY (`hrms_employee_info_id`) REFERENCES `hrms_employee_info` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE TABLE IF NOT EXISTS `hrms_employee_more_info` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `hrms_employee_info_id` INT NOT NULL,
  `info_label` VARCHAR(200) NOT NULL,
  `info_value` VARCHAR(200) NOT NULL,
  `info_remark` VARCHAR(200) DEFAULT NULL,
  `info_status` VARCHAR(200) DEFAULT 'ACTIVE',
  `registered_date` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `registered_by` INT DEFAULT NULL,
  `modified_date` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `modified_by` INT DEFAULT NULL,
  `is_deleted` TINYINT(1) NOT NULL DEFAULT 0,
  CONSTRAINT `fk_hrms_more_info_emp` FOREIGN KEY (`hrms_employee_info_id`) REFERENCES `hrms_employee_info` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- ----------------------------------------------------------------------------------------------
-- 4. Leave Management (Labour Proclamation 1156/2019)
-- ----------------------------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS `hrms_leave_types` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `type_code` VARCHAR(50) NOT NULL UNIQUE,
  `type_name` VARCHAR(100) NOT NULL,
  `type_name_am` VARCHAR(150) NOT NULL,
  `default_days` INT NOT NULL DEFAULT 16,
  `is_service_accrued` TINYINT(1) NOT NULL DEFAULT 0,
  `is_paid` TINYINT(1) NOT NULL DEFAULT 1,
  `requires_attachment` TINYINT(1) NOT NULL DEFAULT 0,
  `gender_restriction` VARCHAR(10) DEFAULT 'ALL',
  `is_active` TINYINT(1) NOT NULL DEFAULT 1
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE TABLE IF NOT EXISTS `hrms_leave_allocations` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `hrms_employee_info_id` INT NOT NULL,
  `leave_type_id` INT NOT NULL,
  `fiscal_year_ec` INT NOT NULL,
  `entitled_days` DOUBLE NOT NULL DEFAULT 0,
  `carried_over_days` DOUBLE NOT NULL DEFAULT 0,
  `used_days` DOUBLE NOT NULL DEFAULT 0,
  `remaining_days` DOUBLE NOT NULL DEFAULT 0,
  `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT `fk_hrms_alloc_emp` FOREIGN KEY (`hrms_employee_info_id`) REFERENCES `hrms_employee_info` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_hrms_alloc_type` FOREIGN KEY (`leave_type_id`) REFERENCES `hrms_leave_types` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE TABLE IF NOT EXISTS `hrms_employee_leave` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `hrms_employee_info_id` INT NOT NULL,
  `leave_type_id` INT DEFAULT NULL,
  `year` INT NOT NULL,
  `leave_days` INT NOT NULL,
  `leave_start` DATE NOT NULL,
  `leave_end` DATE NOT NULL,
  `leave_reason` VARCHAR(255) DEFAULT NULL,
  `approval_status` VARCHAR(50) NOT NULL DEFAULT 'PENDING',
  `approved_by` INT DEFAULT NULL,
  `approved_date` DATETIME DEFAULT NULL,
  `attachment_path` VARCHAR(255) DEFAULT NULL,
  `registered_by` INT NOT NULL,
  `registered_date` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `modified_by` INT DEFAULT NULL,
  `modified_date` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `is_deleted` TINYINT(1) NOT NULL DEFAULT 0,
  CONSTRAINT `fk_hrms_leave_emp` FOREIGN KEY (`hrms_employee_info_id`) REFERENCES `hrms_employee_info` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_hrms_leave_type` FOREIGN KEY (`leave_type_id`) REFERENCES `hrms_leave_types` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- ----------------------------------------------------------------------------------------------
-- 5. Biometric Hardware & Shift Rostering (Water Utility Operations)
-- ----------------------------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS `hrms_biometric_device` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `device_name` VARCHAR(150) NOT NULL,
  `device_ip` VARCHAR(50) NOT NULL,
  `port` INT NOT NULL DEFAULT 4370,
  `serial_number` VARCHAR(100) DEFAULT NULL,
  `device_model` VARCHAR(100) DEFAULT 'ZKTeco',
  `location_name` VARCHAR(150) NOT NULL,
  `protocol` VARCHAR(50) DEFAULT 'ZK_TCP',
  `last_sync_time` DATETIME DEFAULT NULL,
  `is_active` TINYINT(1) NOT NULL DEFAULT 1,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE TABLE IF NOT EXISTS `hrms_attendance_raw_logs` (
  `id` BIGINT AUTO_INCREMENT PRIMARY KEY,
  `device_id` INT NOT NULL,
  `biometric_pin` VARCHAR(50) NOT NULL,
  `punch_time_utc` DATETIME NOT NULL,
  `punch_time_local` DATETIME NOT NULL,
  `punch_type` VARCHAR(50) DEFAULT 'CHECK_IN',
  `verify_mode` VARCHAR(50) DEFAULT 'FINGERPRINT',
  `is_processed` TINYINT(1) NOT NULL DEFAULT 0,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT `fk_hrms_raw_device` FOREIGN KEY (`device_id`) REFERENCES `hrms_biometric_device` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE TABLE IF NOT EXISTS `hrms_shift_schedules` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `shift_code` VARCHAR(50) NOT NULL UNIQUE,
  `shift_name` VARCHAR(100) NOT NULL,
  `start_time` TIME NOT NULL,
  `end_time` TIME NOT NULL,
  `is_night_shift` TINYINT(1) NOT NULL DEFAULT 0,
  `grace_period_minutes` INT NOT NULL DEFAULT 15,
  `total_hours` DOUBLE NOT NULL DEFAULT 8.0,
  `description` VARCHAR(255) DEFAULT NULL,
  `is_active` TINYINT(1) NOT NULL DEFAULT 1
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE TABLE IF NOT EXISTS `hrms_shift_assignments` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `hrms_employee_info_id` INT NOT NULL,
  `shift_schedule_id` INT NOT NULL,
  `assigned_date` DATE NOT NULL,
  `is_standby_on_call` TINYINT(1) NOT NULL DEFAULT 0,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT `fk_hrms_shift_emp` FOREIGN KEY (`hrms_employee_info_id`) REFERENCES `hrms_employee_info` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_hrms_shift_sched` FOREIGN KEY (`shift_schedule_id`) REFERENCES `hrms_shift_schedules` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE TABLE IF NOT EXISTS `hrms_attendance_records` (
  `id` BIGINT AUTO_INCREMENT PRIMARY KEY,
  `hrms_employee_info_id` INT NOT NULL,
  `attendance_date` DATE NOT NULL,
  `shift_schedule_id` INT DEFAULT NULL,
  `check_in_time` DATETIME DEFAULT NULL,
  `check_out_time` DATETIME DEFAULT NULL,
  `regular_hours` DOUBLE NOT NULL DEFAULT 0,
  `late_minutes` INT NOT NULL DEFAULT 0,
  `early_minutes` INT NOT NULL DEFAULT 0,
  `overtime_day_hours` DOUBLE NOT NULL DEFAULT 0,      -- 1.5x (Art. 68)
  `overtime_night_hours` DOUBLE NOT NULL DEFAULT 0,    -- 1.75x (Art. 68)
  `overtime_weekend_hours` DOUBLE NOT NULL DEFAULT 0,  -- 2.0x (Art. 68)
  `overtime_holiday_hours` DOUBLE NOT NULL DEFAULT 0,  -- 2.5x (Art. 68)
  `status` VARCHAR(50) NOT NULL DEFAULT 'PRESENT',     -- PRESENT, ABSENT, ON_LEAVE, REST_DAY
  `is_overtime_approved` TINYINT(1) NOT NULL DEFAULT 0,
  `approved_by` INT DEFAULT NULL,
  `remarks` VARCHAR(255) DEFAULT NULL,
  CONSTRAINT `fk_hrms_att_emp` FOREIGN KEY (`hrms_employee_info_id`) REFERENCES `hrms_employee_info` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_hrms_att_shift` FOREIGN KEY (`shift_schedule_id`) REFERENCES `hrms_shift_schedules` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- ----------------------------------------------------------------------------------------------
-- 6. Ethiopian Tax & Salary Configurations
-- ----------------------------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS `hrms_gibir_setting` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `weight` INT NOT NULL,
  `upper_limit_birr` INT NOT NULL,
  `percent_birr` INT NOT NULL,
  `and_above` TINYINT(1) NOT NULL DEFAULT 0,
  `total_deductible_till_this` DOUBLE NOT NULL DEFAULT 0,
  `setting_description` VARCHAR(150) DEFAULT NULL,
  `is_deleted` TINYINT(1) NOT NULL DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE TABLE IF NOT EXISTS `hrms_salary_configurations` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `config_code` VARCHAR(50) DEFAULT NULL UNIQUE,
  `config_title` VARCHAR(150) NOT NULL,
  `config_title_am` VARCHAR(200) DEFAULT NULL,
  `is_birr` TINYINT(1) NOT NULL DEFAULT 1,
  `is_percent` TINYINT(1) NOT NULL DEFAULT 0,
  `config_value` DOUBLE NOT NULL DEFAULT 0,
  `weight` INT NOT NULL DEFAULT 0,
  `is_taxed` TINYINT(1) NOT NULL DEFAULT 0,
  `is_deductible` TINYINT(1) NOT NULL DEFAULT 0,
  `is_additive` TINYINT(1) NOT NULL DEFAULT 0,
  `is_pension` TINYINT(1) NOT NULL DEFAULT 0,
  `is_leave_config` TINYINT(1) NOT NULL DEFAULT 0,
  `is_deleted` TINYINT(1) NOT NULL DEFAULT 0,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE TABLE IF NOT EXISTS `hrms_employee_info_salary_defaults` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `hrms_employee_info_id` INT NOT NULL,
  `hrms_salary_configurations_id` INT NOT NULL,
  `default_value` DOUBLE NOT NULL DEFAULT 0,
  `is_active` TINYINT(1) NOT NULL DEFAULT 1,
  `is_deleted` TINYINT(1) NOT NULL DEFAULT 0,
  CONSTRAINT `fk_hrms_sal_def_emp` FOREIGN KEY (`hrms_employee_info_id`) REFERENCES `hrms_employee_info` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_hrms_sal_def_cfg` FOREIGN KEY (`hrms_salary_configurations_id`) REFERENCES `hrms_salary_configurations` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- ----------------------------------------------------------------------------------------------
-- 7. Finance GL Integration (hrms_payroll_account_map)
-- ----------------------------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS `hrms_payroll_account_map` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `mapping_key` VARCHAR(100) NOT NULL UNIQUE,
  `account_id` INT NOT NULL,
  `label` VARCHAR(200) NOT NULL,
  `label_am` VARCHAR(250) DEFAULT NULL,
  `entry_type` VARCHAR(10) NOT NULL DEFAULT 'DEBIT', -- DEBIT or CREDIT
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT `fk_hrms_acct_map_fnc` FOREIGN KEY (`account_id`) REFERENCES `fnc_account` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- ----------------------------------------------------------------------------------------------
-- 8. Payroll Runs & Calculated Items (with Dual Bank Split & GL Voucher Reference)
-- ----------------------------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS `hrms_payroll_runs` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `payroll_reference` VARCHAR(100) NOT NULL UNIQUE,  -- e.g. PAYROLL-መስከረም-2018
  `salary_month_name` VARCHAR(50) NOT NULL,         -- e.g. መስከረም
  `salary_year` INT NOT NULL,                        -- e.g. 2018
  `salary_month_date` DATE NOT NULL,
  `fiscal_year_id` INT NOT NULL,
  
  -- Totals
  `total_basic_salary` DOUBLE NOT NULL DEFAULT 0,
  `total_overtime` DOUBLE NOT NULL DEFAULT 0,
  `total_additive` DOUBLE NOT NULL DEFAULT 0,
  `total_gross_salary` DOUBLE NOT NULL DEFAULT 0,
  `total_taxable_income` DOUBLE NOT NULL DEFAULT 0,
  `total_salary_tax` DOUBLE NOT NULL DEFAULT 0,
  `total_pension_employee` DOUBLE NOT NULL DEFAULT 0,   -- 7%
  `total_pension_employer` DOUBLE NOT NULL DEFAULT 0,   -- 11%
  `total_deductible` DOUBLE NOT NULL DEFAULT 0,
  
  -- Dual Bank Split Totals
  `total_net_salary` DOUBLE NOT NULL DEFAULT 0,
  `total_net_cbe` DOUBLE NOT NULL DEFAULT 0,           -- Primary Bank
  `total_net_abay` DOUBLE NOT NULL DEFAULT 0,          -- Secondary Bank
  
  -- Financial Posting Status
  `payment_status` VARCHAR(50) NOT NULL DEFAULT 'PENDING',
  `approval_status` VARCHAR(50) NOT NULL DEFAULT 'DRAFT', -- DRAFT, VERIFIED, APPROVED, POSTED_TO_JOURNAL
  `is_posted_to_journal` TINYINT(1) NOT NULL DEFAULT 0,
  `journal_entry_id` BIGINT DEFAULT NULL,
  `fnce_payment_voucher_id` INT DEFAULT NULL,
  
  -- Audit
  `registered_by` INT NOT NULL,
  `registered_date` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `approved_by` INT DEFAULT NULL,
  `approved_date` DATETIME DEFAULT NULL,
  `is_deleted` TINYINT(1) NOT NULL DEFAULT 0,
  
  CONSTRAINT `fk_hrms_prun_fy` FOREIGN KEY (`fiscal_year_id`) REFERENCES `fnc_fiscal_year` (`id`),
  CONSTRAINT `fk_hrms_prun_jentry` FOREIGN KEY (`journal_entry_id`) REFERENCES `fnc_journal_entry` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE TABLE IF NOT EXISTS `hrms_salary_calculated` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `hrms_payroll_run_id` INT DEFAULT NULL,
  `hrms_employee_id` INT NOT NULL,
  `basic_salary` DOUBLE NOT NULL DEFAULT 0,
  `current_salary` DOUBLE NOT NULL DEFAULT 0,
  
  -- Overtime breakdown (Labour Proclamation 1156/2019)
  `part_time_working_hr` DOUBLE NOT NULL DEFAULT 0,    -- Day 1.5x
  `part_time_night` DOUBLE NOT NULL DEFAULT 0,         -- Night 1.75x
  `part_time_weekend` DOUBLE NOT NULL DEFAULT 0,       -- Weekend 2.0x
  `part_time_holliday` DOUBLE NOT NULL DEFAULT 0,      -- Holiday 2.5x
  `part_time_total` DOUBLE NOT NULL DEFAULT 0,
  
  -- Calculations
  `total_additive` DOUBLE NOT NULL DEFAULT 0,
  `gross_salary` DOUBLE NOT NULL DEFAULT 0,
  `total_taxable_income` DOUBLE NOT NULL DEFAULT 0,
  `salary_tax` DOUBLE NOT NULL DEFAULT 0,
  `total_7_percent_pension` DOUBLE NOT NULL DEFAULT 0,
  `total_11_percent_pension` DOUBLE NOT NULL DEFAULT 0,
  `total_deductible` DOUBLE NOT NULL DEFAULT 0,
  `net_salary` DOUBLE NOT NULL DEFAULT 0,
  
  -- Dual Bank Split
  `disbursed_to_primary_cbe` DOUBLE NOT NULL DEFAULT 0,
  `disbursed_to_secondary_abay` DOUBLE NOT NULL DEFAULT 0,
  
  `working_days` INT NOT NULL DEFAULT 30,
  `payment_status` VARCHAR(50) NOT NULL DEFAULT 'Pending',
  `approval_status` VARCHAR(50) NOT NULL DEFAULT 'Pending',
  `is_paid` TINYINT(1) NOT NULL DEFAULT 0,
  `registered_by` INT NOT NULL,
  `registered_date` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `modified_by` INT DEFAULT NULL,
  `modified_date` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `is_deleted` TINYINT(1) NOT NULL DEFAULT 0,
  
  CONSTRAINT `fk_hrms_scal_run` FOREIGN KEY (`hrms_payroll_run_id`) REFERENCES `hrms_payroll_runs` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_hrms_scal_emp` FOREIGN KEY (`hrms_employee_id`) REFERENCES `hrms_employee_info` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE TABLE IF NOT EXISTS `hrms_salary_calculated_tekenash` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `hrms_salary_calculated_id` INT NOT NULL,
  `hrms_salary_configurations_id` INT NOT NULL,
  `is_percent` TINYINT(1) NOT NULL DEFAULT 0,
  `is_birr` TINYINT(1) NOT NULL DEFAULT 1,
  `config_value` DOUBLE NOT NULL DEFAULT 0,
  `tekenanash_value` DOUBLE NOT NULL DEFAULT 0,
  `is_tekenash` TINYINT(1) NOT NULL DEFAULT 0,
  `is_techemari` TINYINT(1) NOT NULL DEFAULT 0,
  `is_deleted` TINYINT(1) NOT NULL DEFAULT 0,
  CONSTRAINT `fk_hrms_scal_tek_scal` FOREIGN KEY (`hrms_salary_calculated_id`) REFERENCES `hrms_salary_calculated` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_hrms_scal_tek_cfg` FOREIGN KEY (`hrms_salary_configurations_id`) REFERENCES `hrms_salary_configurations` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- ══════════════════════════════════════════════════════════════════════════════════════════════
-- 9. BASELINE SEED DATA (Direct Static Values - 100% Self-Contained)
-- ══════════════════════════════════════════════════════════════════════════════════════════════

-- 9.1 Ethiopian Employment Income Tax Brackets (Schedule 'A' Proclamation 979/2016)
INSERT INTO `hrms_gibir_setting` (`id`, `weight`, `upper_limit_birr`, `percent_birr`, `and_above`, `total_deductible_till_this`, `setting_description`, `is_deleted`) VALUES
(1, 1, 600, 0, 0, 0, '0 - 600 ETB (0% Exempt)', 0),
(2, 2, 1650, 10, 0, 60, '601 - 1,650 ETB (10%)', 0),
(3, 3, 3200, 15, 0, 142.5, '1,651 - 3,200 ETB (15%)', 0),
(4, 4, 5250, 20, 0, 302.5, '3,201 - 5,250 ETB (20%)', 0),
(5, 5, 7800, 25, 0, 565, '5,251 - 7,800 ETB (25%)', 0),
(6, 6, 10900, 30, 0, 955, '7,801 - 10,900 ETB (30%)', 0),
(7, 7, 10900, 35, 1, 1500, '> 10,900 ETB (35%)', 0)
ON DUPLICATE KEY UPDATE
  `weight` = VALUES(`weight`),
  `upper_limit_birr` = VALUES(`upper_limit_birr`),
  `percent_birr` = VALUES(`percent_birr`),
  `and_above` = VALUES(`and_above`),
  `total_deductible_till_this` = VALUES(`total_deductible_till_this`);

-- 9.2 Ethiopian Statutory & Utility Salary Configurations
INSERT INTO `hrms_salary_configurations` (`id`, `config_code`, `config_title`, `config_title_am`, `is_birr`, `is_percent`, `config_value`, `weight`, `is_taxed`, `is_deductible`, `is_additive`, `is_pension`, `is_leave_config`, `is_deleted`) VALUES
(1, 'CFG_OT_DAY', 'Daytime Overtime 1.5x', 'የትርፍ ሰዓት ክፍያ (ቀን 1.5x)', 1, 0, 0, 1, 1, 0, 1, 0, 0, 0),
(2, 'CFG_HOUSING', 'Housing Allowance', 'የቤት ኪራይ አበል', 1, 0, 500, 2, 1, 0, 1, 0, 0, 0),
(3, 'CFG_TRANSPORT', 'Transport Allowance', 'ጠቅላላ የትራንስፖርት አበል', 1, 0, 300, 3, 1, 0, 1, 0, 0, 0),
(4, 'CFG_PENSION_EMP', 'Employee Pension 7%', 'የጡረታ መዋጮ (ሠራተኛ 7%)', 0, 1, 7, 4, 0, 1, 0, 1, 0, 0),
(5, 'CFG_PENSION_ORG', 'Employer Pension 11%', 'የጡረታ መዋጮ (አሰሪ 11%)', 0, 1, 11, 5, 0, 0, 0, 1, 0, 0),
(6, 'CFG_HAZARD', 'Hazard & Chemical Allowance', 'የክሎሪንና ኬሚካል አበል', 1, 0, 400, 6, 1, 0, 1, 0, 0, 0),
(7, 'CFG_SHIFT_DIFF', 'Night Shift Differential Allowance', 'የማታ ፈረቃ አበል', 1, 0, 250, 7, 1, 0, 1, 0, 0, 0),
(8, 'CFG_EDIR', 'Staff Association / Edir Deduction', 'የእድርና ብድር ተቀናሽ', 1, 0, 100, 8, 0, 1, 0, 0, 0, 0)
ON DUPLICATE KEY UPDATE
  `config_title` = VALUES(`config_title`),
  `config_title_am` = VALUES(`config_title_am`),
  `is_birr` = VALUES(`is_birr`),
  `is_percent` = VALUES(`is_percent`),
  `config_value` = VALUES(`config_value`),
  `is_taxed` = VALUES(`is_taxed`),
  `is_deductible` = VALUES(`is_deductible`),
  `is_additive` = VALUES(`is_additive`);

-- 9.3 Municipal Water Utility Departments
INSERT INTO `hrms_departments` (`department_code`, `department_name`, `department_name_am`, `cost_center_code`, `is_active`) VALUES
('WTP-PROD', 'Water Production & Treatment Department', 'የውሃ ማጣሪያና ማምረቻ መምሪያ', 'CC-101', 1),
('DIST-NET', 'Water Distribution & Sewerage Network Department', 'የውሃ ሥርጭትና መስመር መምሪያ', 'CC-102', 1),
('ELEC-MECH', 'Electromechanical & Maintenance Department', 'ኤሌክትሮ መካኒካልና ጥገና መምሪያ', 'CC-103', 1),
('COMM-BILL', 'Commercial Billing & Customer Care Department', 'የደንበኞች አገልግሎትና ቢሊንግ መምሪያ', 'CC-104', 1),
('ADM-FIN', 'Administration & Human Resources Department', 'አስተዳደርና የሰው ኃይል መምሪያ', 'CC-105', 1),
('FIN-ACCTS', 'Finance & Accounts Department', 'ፋይናንስና ሂሳብ መምሪያ', 'CC-106', 1)
ON DUPLICATE KEY UPDATE `department_name` = VALUES(`department_name`);

-- 9.4 Standard Job Grades
INSERT INTO `hrms_job_grades` (`grade_code`, `grade_name`, `min_salary`, `max_salary`, `step_increment_rate`, `description`, `is_active`) VALUES
('GR-I', 'Grade I (Junior Support / Casual)', 4500, 7500, 300, 'Junior field support, trench workers, security guards', 1),
('GR-II', 'Grade II (Field Technician / Operator)', 7500, 12500, 500, 'Plumbers, water meter readers, junior pump operators', 1),
('GR-III', 'Grade III (Senior Technician / Officer)', 12500, 20000, 800, 'WTP plant operators, electromechanical technicians, billing officers', 1),
('GR-IV', 'Grade IV (Professional / Team Leader)', 20000, 32000, 1200, 'Water quality chemists, network engineers, HR officers, accountants', 1),
('GR-V', 'Grade V (Department Head / Director)', 32000, 55000, 2000, 'Department directors, technical division heads', 1)
ON DUPLICATE KEY UPDATE `grade_name` = VALUES(`grade_name`);

-- 9.5 Key Water Utility Positions
INSERT INTO `hrms_positions` (`position_code`, `position_title`, `position_title_am`, `department_id`, `job_grade_id`, `approved_headcount`, `is_hazardous`, `requires_shift_work`, `is_active`) VALUES
('POS-WTP-OP', 'Water Treatment Plant Operator', 'የውሃ ማጣሪያ ፕላንት ኦፕሬተር', (SELECT id FROM hrms_departments WHERE department_code = 'WTP-PROD'), (SELECT id FROM hrms_job_grades WHERE grade_code = 'GR-III'), 8, 1, 1, 1),
('POS-WTP-CHM', 'Water Quality Lab Chemist', 'የውሃ ጥራት ተቆጣጣሪ ኬሚስት', (SELECT id FROM hrms_departments WHERE department_code = 'WTP-PROD'), (SELECT id FROM hrms_job_grades WHERE grade_code = 'GR-IV'), 3, 1, 0, 1),
('POS-NET-PLMB', 'Network Maintenance Plumber', 'የውሃ መስመር ጥገና ባለሙያ (ቧንቧ ሠራተኛ)', (SELECT id FROM hrms_departments WHERE department_code = 'DIST-NET'), (SELECT id FROM hrms_job_grades WHERE grade_code = 'GR-II'), 12, 0, 1, 1),
('POS-LEAK-REP', 'Emergency Leak Repair Technician', 'የአደጋ ጊዜ የውሃ ፍሰት ጥገና ቴክኒሻን', (SELECT id FROM hrms_departments WHERE department_code = 'DIST-NET'), (SELECT id FROM hrms_job_grades WHERE grade_code = 'GR-III'), 6, 0, 1, 1),
('POS-ELEC-ENG', 'Electro-Mechanical Pump Station Engineer', 'የቦስተርና ፓምፕ ኤሌክትሮ መካኒክ መሃንዲስ', (SELECT id FROM hrms_departments WHERE department_code = 'ELEC-MECH'), (SELECT id FROM hrms_job_grades WHERE grade_code = 'GR-IV'), 4, 1, 1, 1),
('POS-MTR-RDR', 'Water Meter Reader & Collector', 'የውሃ ቆጣሪ አንባቢና ተቆጣጣሪ', (SELECT id FROM hrms_departments WHERE department_code = 'COMM-BILL'), (SELECT id FROM hrms_job_grades WHERE grade_code = 'GR-II'), 15, 0, 0, 1),
('POS-BILL-OFF', 'Customer Billing Officer', 'የደንበኞች ቢሊንግ ባለሙያ', (SELECT id FROM hrms_departments WHERE department_code = 'COMM-BILL'), (SELECT id FROM hrms_job_grades WHERE grade_code = 'GR-III'), 6, 0, 0, 1),
('POS-HR-OFF', 'Human Resource Specialist', 'የሰው ኃይል አስተዳደር ባለሙያ', (SELECT id FROM hrms_departments WHERE department_code = 'ADM-FIN'), (SELECT id FROM hrms_job_grades WHERE grade_code = 'GR-IV'), 2, 0, 0, 1),
('POS-PAY-ACC', 'Payroll & General Ledger Accountant', 'የደመወዝና ፋይናንስ ሂሳብ ሹም', (SELECT id FROM hrms_departments WHERE department_code = 'FIN-ACCTS'), (SELECT id FROM hrms_job_grades WHERE grade_code = 'GR-IV'), 2, 0, 0, 1)
ON DUPLICATE KEY UPDATE `position_title` = VALUES(`position_title`);

-- 9.6 Statutory Leave Types (Labour Proclamation No. 1156/2019)
INSERT INTO `hrms_leave_types` (`type_code`, `type_name`, `type_name_am`, `default_days`, `is_service_accrued`, `is_paid`, `requires_attachment`, `gender_restriction`, `is_active`) VALUES
('ANNUAL', 'Annual Leave', 'ዓመታዊ የዕረፍት ፈቃድ', 16, 1, 1, 0, 'ALL', 1),
('MATERNITY', 'Maternity Leave', 'የወሊድ ፈቃድ', 120, 0, 1, 1, 'FEMALE', 1),
('PATERNITY', 'Paternity Leave', 'የአባትነት ፈቃድ', 3, 0, 1, 1, 'MALE', 1),
('SICK', 'Sick Leave', 'የሕክምና ፈቃድ', 30, 0, 1, 1, 'ALL', 1),
('BEREAVEMENT', 'Bereavement / Mourning Leave', 'የሐዘን ፈቃድ', 3, 0, 1, 0, 'ALL', 1),
('WEDDING', 'Wedding Leave', 'የጋብቻ ፈቃድ', 3, 0, 1, 1, 'ALL', 1),
('SPECIAL', 'Special Duty / Exam Leave', 'ልዩ ፈቃድ', 5, 0, 1, 1, 'ALL', 1)
ON DUPLICATE KEY UPDATE `type_name` = VALUES(`type_name`);

-- 9.7 Continuous 24/7 Shift Schedules for Water Utility Operations
INSERT INTO `hrms_shift_schedules` (`shift_code`, `shift_name`, `start_time`, `end_time`, `is_night_shift`, `grace_period_minutes`, `total_hours`, `description`, `is_active`) VALUES
('SHIFT-MORN', 'Morning Shift (የጠዋት ፈረቃ)', '06:00:00', '14:00:00', 0, 15, 8.0, 'Treatment plant and pump station morning shift', 1),
('SHIFT-AFTN', 'Afternoon Shift (የከሰዓት ፈረቃ)', '14:00:00', '22:00:00', 0, 15, 8.0, 'Treatment plant and pump station afternoon shift', 1),
('SHIFT-NIGHT', 'Night Shift (የማታ ፈረቃ - 1.75x OT / Allowance)', '22:00:00', '06:00:00', 1, 15, 8.0, 'Continuous night operation with statutory night differential', 1),
('SHIFT-GEN', 'General Office Hours (መደበኛ የቢሮ ሰዓት)', '08:00:00', '17:00:00', 0, 15, 8.0, 'Standard administration & billing office schedule with 1hr lunch', 1),
('SHIFT-STNDBY', 'Emergency Standby (የአደጋ ጊዜ ተረኛ)', '17:00:00', '08:00:00', 1, 30, 15.0, 'On-call emergency leak burst & main line repair crew', 1)
ON DUPLICATE KEY UPDATE `shift_name` = VALUES(`shift_name`);

-- 9.8 Sample Biometric Devices for Municipal Water Utility
INSERT INTO `hrms_biometric_device` (`device_name`, `device_ip`, `port`, `serial_number`, `device_model`, `location_name`, `protocol`, `is_active`) VALUES
('WTP Central Plant Terminal', '192.168.1.201', 4370, 'ZK-WTP-001', 'ZKTeco SilkBio-101TC', 'Main Water Treatment Plant Entrance', 'ZK_TCP', 1),
('Reservoir Booster Station Terminal', '192.168.1.202', 4370, 'ZK-BST-002', 'ZKTeco iClock-680', 'Reservoir Pump & Booster Station', 'ZK_TCP', 1),
('Head Office Attendance Terminal', '192.168.1.203', 4370, 'ZK-HQ-003', 'ZKTeco uFace-800', 'Head Office HR & Admin Building', 'ZK_TCP', 1),
('Central Workshop & Stores Terminal', '192.168.1.204', 4370, 'ZK-ST-004', 'Hikvision DS-K1T671', 'Central Mechanical Workshop & Warehouse', 'ZK_TCP', 1)
-- 9.9 Standard HRMS Roles for Role Assignment & Menu Access
INSERT INTO `user_role` (`role_code`, `role_name`, `is_medical`, `is_store`, `is_forman_expert`, `is_water_meter_reader`, `status`, `deleted`)
SELECT 'M_HR_OFFICER', 'Human Resource Officer (የሰው ኃይል ባለሙያ)', 0, 0, 0, 0, 'Active', 'active'
WHERE NOT EXISTS (SELECT 1 FROM `user_role` WHERE `role_code` = 'M_HR_OFFICER');

INSERT INTO `user_role` (`role_code`, `role_name`, `is_medical`, `is_store`, `is_forman_expert`, `is_water_meter_reader`, `status`, `deleted`)
SELECT 'M_PAYROLL_OFFICER', 'Payroll Officer (የደመወዝ ባለሙያ)', 0, 0, 0, 0, 'Active', 'active'
WHERE NOT EXISTS (SELECT 1 FROM `user_role` WHERE `role_code` = 'M_PAYROLL_OFFICER');

SET FOREIGN_KEY_CHECKS = 1;
