-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1:3307
-- Generation Time: Sep 14, 2026 at 01:04 PM
-- Server version: 11.5.2-MariaDB
-- PHP Version: 8.3.14

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `wbill_jwns9`
--

-- --------------------------------------------------------

--
-- Table structure for table `hrms_attendance_raw_logs`
--

DROP TABLE IF EXISTS `hrms_attendance_raw_logs`;
CREATE TABLE IF NOT EXISTS `hrms_attendance_raw_logs` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `device_id` int(11) NOT NULL,
  `biometric_pin` varchar(50) NOT NULL,
  `punch_time_utc` datetime NOT NULL,
  `punch_time_local` datetime NOT NULL,
  `punch_type` varchar(50) DEFAULT 'CHECK_IN',
  `verify_mode` varchar(50) DEFAULT 'FINGERPRINT',
  `is_processed` tinyint(1) NOT NULL DEFAULT 0,
  `created_at` datetime NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `fk_hrms_raw_device` (`device_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `hrms_attendance_records`
--

DROP TABLE IF EXISTS `hrms_attendance_records`;
CREATE TABLE IF NOT EXISTS `hrms_attendance_records` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `hrms_employee_info_id` int(11) NOT NULL,
  `attendance_date` date NOT NULL,
  `shift_schedule_id` int(11) DEFAULT NULL,
  `check_in_time` datetime DEFAULT NULL,
  `check_out_time` datetime DEFAULT NULL,
  `regular_hours` double NOT NULL DEFAULT 0,
  `late_minutes` int(11) NOT NULL DEFAULT 0,
  `early_minutes` int(11) NOT NULL DEFAULT 0,
  `overtime_day_hours` double NOT NULL DEFAULT 0,
  `overtime_night_hours` double NOT NULL DEFAULT 0,
  `overtime_weekend_hours` double NOT NULL DEFAULT 0,
  `overtime_holiday_hours` double NOT NULL DEFAULT 0,
  `status` varchar(50) NOT NULL DEFAULT 'PRESENT',
  `is_overtime_approved` tinyint(1) NOT NULL DEFAULT 0,
  `approved_by` int(11) DEFAULT NULL,
  `remarks` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `fk_hrms_att_emp` (`hrms_employee_info_id`),
  KEY `fk_hrms_att_shift` (`shift_schedule_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `hrms_biometric_device`
--

DROP TABLE IF EXISTS `hrms_biometric_device`;
CREATE TABLE IF NOT EXISTS `hrms_biometric_device` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `device_name` varchar(150) NOT NULL,
  `device_ip` varchar(50) NOT NULL,
  `port` int(11) NOT NULL DEFAULT 4370,
  `serial_number` varchar(100) DEFAULT NULL,
  `device_model` varchar(100) DEFAULT 'ZKTeco',
  `location_name` varchar(150) NOT NULL,
  `protocol` varchar(50) DEFAULT 'ZK_TCP',
  `last_sync_time` datetime DEFAULT NULL,
  `is_active` tinyint(1) NOT NULL DEFAULT 1,
  `created_at` datetime NOT NULL DEFAULT current_timestamp(),
  `updated_at` datetime DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `hrms_biometric_device`
--

INSERT INTO `hrms_biometric_device` (`id`, `device_name`, `device_ip`, `port`, `serial_number`, `device_model`, `location_name`, `protocol`, `last_sync_time`, `is_active`, `created_at`, `updated_at`) VALUES
(1, 'WTP Central Plant Terminal', '192.168.1.201', 4370, 'ZK-WTP-001', 'ZKTeco SilkBio-101TC', 'Main Water Treatment Plant Entrance', 'ZK_TCP', NULL, 1, '2026-09-13 11:50:11', '2026-09-13 11:50:11'),
(2, 'Reservoir Booster Station Terminal', '192.168.1.202', 4370, 'ZK-BST-002', 'ZKTeco iClock-680', 'Reservoir Pump & Booster Station', 'ZK_TCP', NULL, 1, '2026-09-13 11:50:11', '2026-09-13 11:50:11'),
(3, 'Head Office Attendance Terminal', '192.168.1.203', 4370, 'ZK-HQ-003', 'ZKTeco uFace-800', 'Head Office HR & Admin Building', 'ZK_TCP', NULL, 1, '2026-09-13 11:50:11', '2026-09-13 11:50:11'),
(4, 'Central Workshop & Stores Terminal', '192.168.1.204', 4370, 'ZK-ST-004', 'Hikvision DS-K1T671', 'Central Mechanical Workshop & Warehouse', 'ZK_TCP', NULL, 1, '2026-09-13 11:50:11', '2026-09-13 11:50:11');

-- --------------------------------------------------------

--
-- Table structure for table `hrms_departments`
--

DROP TABLE IF EXISTS `hrms_departments`;
CREATE TABLE IF NOT EXISTS `hrms_departments` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `department_code` varchar(50) NOT NULL,
  `department_name` varchar(150) NOT NULL,
  `department_name_am` varchar(200) DEFAULT NULL,
  `parent_department_id` int(11) DEFAULT NULL,
  `manager_employee_id` int(11) DEFAULT NULL,
  `cost_center_code` varchar(50) DEFAULT NULL,
  `is_active` tinyint(1) NOT NULL DEFAULT 1,
  `created_at` datetime NOT NULL DEFAULT current_timestamp(),
  `updated_at` datetime DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `department_code` (`department_code`),
  KEY `fk_hrms_dept_parent` (`parent_department_id`)
) ENGINE=InnoDB AUTO_INCREMENT=13 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `hrms_departments`
--

INSERT INTO `hrms_departments` (`id`, `department_code`, `department_name`, `department_name_am`, `parent_department_id`, `manager_employee_id`, `cost_center_code`, `is_active`, `created_at`, `updated_at`) VALUES
(1, 'WTP-PROD', 'Water Production & Treatment Department', 'የውሃ ማጣሪያና ማምረቻ መምሪያ', NULL, NULL, 'CC-101', 1, '2026-09-13 11:50:11', '2026-09-13 11:50:11'),
(2, 'DIST-NET', 'Water Distribution & Sewerage Network Department', 'የውሃ ሥርጭትና መስመር መምሪያ', NULL, NULL, 'CC-102', 1, '2026-09-13 11:50:11', '2026-09-13 11:50:11'),
(3, 'ELEC-MECH', 'Electromechanical & Maintenance Department', 'ኤሌክትሮ መካኒካልና ጥገና መምሪያ', NULL, NULL, 'CC-103', 1, '2026-09-13 11:50:11', '2026-09-13 11:50:11'),
(4, 'COMM-BILL', 'Commercial Billing & Customer Care Department', 'የደንበኞች አገልግሎትና ቢሊንግ መምሪያ', NULL, NULL, 'CC-104', 1, '2026-09-13 11:50:11', '2026-09-13 11:50:11'),
(5, 'ADM-FIN', 'Administration & Human Resources Department', 'አስተዳደርና የሰው ኃይል መምሪያ', NULL, NULL, 'CC-105', 1, '2026-09-13 11:50:11', '2026-09-13 11:50:11'),
(6, 'FIN-ACCTS', 'Finance & Accounts Department', 'ፋይናንስና ሂሳብ መምሪያ', NULL, NULL, 'CC-106', 1, '2026-09-13 11:50:11', '2026-09-13 11:50:11');

-- --------------------------------------------------------

--
-- Table structure for table `hrms_employee_chlota`
--

DROP TABLE IF EXISTS `hrms_employee_chlota`;
CREATE TABLE IF NOT EXISTS `hrms_employee_chlota` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `hrms_employee_info_id` int(11) NOT NULL,
  `chlota_sm` varchar(200) NOT NULL,
  `chlota_label` varchar(200) DEFAULT NULL,
  `chlota_level` varchar(50) DEFAULT 'INTERMEDIATE',
  `chlota_remark` text DEFAULT NULL,
  `registered_date` datetime NOT NULL DEFAULT current_timestamp(),
  `registered_by` int(11) DEFAULT NULL,
  `modified_date` datetime DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `modified_by` int(11) DEFAULT NULL,
  `is_deleted` tinyint(1) NOT NULL DEFAULT 0,
  PRIMARY KEY (`id`),
  KEY `fk_hrms_chlota_emp` (`hrms_employee_info_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `hrms_employee_education`
--

DROP TABLE IF EXISTS `hrms_employee_education`;
CREATE TABLE IF NOT EXISTS `hrms_employee_education` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `hrms_employee_info_id` int(11) NOT NULL,
  `yetmhrt_dereja` varchar(100) NOT NULL,
  `yetmhrtbet_sm` varchar(200) NOT NULL,
  `yetmhrt_aynet` varchar(200) NOT NULL,
  `yetmhrt_dereja_status` varchar(100) DEFAULT 'COMPLETED',
  `graduation_year_ec` varchar(20) DEFAULT NULL,
  `gpa` double DEFAULT NULL,
  `registered_date` datetime NOT NULL DEFAULT current_timestamp(),
  `registered_by` int(11) DEFAULT NULL,
  `modified_date` datetime DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `modified_by` int(11) DEFAULT NULL,
  `is_deleted` tinyint(1) NOT NULL DEFAULT 0,
  PRIMARY KEY (`id`),
  KEY `fk_hrms_edu_emp` (`hrms_employee_info_id`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `hrms_employee_education`
--

INSERT INTO `hrms_employee_education` (`id`, `hrms_employee_info_id`, `yetmhrt_dereja`, `yetmhrtbet_sm`, `yetmhrt_aynet`, `yetmhrt_dereja_status`, `graduation_year_ec`, `gpa`, `registered_date`, `registered_by`, `modified_date`, `modified_by`, `is_deleted`) VALUES
(1, 1, 'Bachelor\'s Degree / የመጀመሪያ ዲግሪ (BSc/BA)', 'Arba Minch University (Water Technology Institute)', 'Hydraulic & Water Resources Engineering', 'COMPLETED', '2014 E.C.', 3.75, '2026-09-13 10:26:29', 1, '2026-09-13 10:26:29', NULL, 0);

-- --------------------------------------------------------

--
-- Table structure for table `hrms_employee_info`
--

DROP TABLE IF EXISTS `hrms_employee_info`;
CREATE TABLE IF NOT EXISTS `hrms_employee_info` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `employee_id` varchar(50) NOT NULL,
  `tin_number` varchar(50) DEFAULT NULL,
  `fayda_national_id` varchar(50) DEFAULT NULL,
  `pension_number` varchar(50) DEFAULT NULL,
  `full_name` varchar(200) NOT NULL,
  `full_name_am` varchar(300) NOT NULL,
  `mother_name` varchar(150) DEFAULT NULL,
  `marital_status` varchar(50) DEFAULT 'SINGLE',
  `disability_status` varchar(100) DEFAULT 'NONE',
  `sex` varchar(10) NOT NULL,
  `date_of_birth` date DEFAULT NULL,
  `nationality` varchar(100) DEFAULT 'Ethiopian',
  `blood_group` varchar(10) DEFAULT NULL,
  `department_id` int(11) DEFAULT NULL,
  `position_id` int(11) DEFAULT NULL,
  `job_grade_id` int(11) DEFAULT NULL,
  `duty_station` varchar(150) DEFAULT 'Head Office',
  `branchs_id` int(11) DEFAULT NULL,
  `address_city_id` int(11) DEFAULT NULL,
  `address_ketena_id` int(11) DEFAULT NULL,
  `address_streets_id` int(11) DEFAULT NULL,
  `phone_number` varchar(50) DEFAULT NULL,
  `email` varchar(100) DEFAULT NULL,
  `emergency_contact_name` varchar(150) DEFAULT NULL,
  `emergency_contact_phone` varchar(50) DEFAULT NULL,
  `employment_type` varchar(50) NOT NULL DEFAULT 'PERMANENT',
  `employment_status` varchar(50) NOT NULL DEFAULT 'ACTIVE',
  `first_employment_date` date DEFAULT NULL,
  `yeteketerubet_ken` date DEFAULT NULL,
  `probation_end_date` date DEFAULT NULL,
  `tureta_yemiwetubet_ken` date DEFAULT NULL,
  `current_salary` double NOT NULL DEFAULT 0,
  `biometric_pin` varchar(50) DEFAULT NULL,
  `rfid_card_number` varchar(50) DEFAULT NULL,
  `primary_bank_name` varchar(100) DEFAULT 'Commercial Bank of Ethiopia',
  `primary_bank_account` varchar(50) DEFAULT NULL,
  `primary_bank_branch` varchar(100) DEFAULT NULL,
  `secondary_bank_name` varchar(100) DEFAULT 'Abay Bank',
  `secondary_bank_account` varchar(50) DEFAULT NULL,
  `secondary_bank_branch` varchar(100) DEFAULT NULL,
  `secondary_payment_purpose` varchar(150) DEFAULT 'Per Diem & Special Allowances',
  `employee_photo` varchar(255) DEFAULT NULL,
  `employee_signature` varchar(255) DEFAULT NULL,
  `registered_by` int(11) DEFAULT NULL,
  `registered_date` datetime NOT NULL DEFAULT current_timestamp(),
  `modified_by` int(11) DEFAULT NULL,
  `modified_date` datetime DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `is_deleted` tinyint(1) NOT NULL DEFAULT 0,
  `is_salary_defaults_modified` tinyint(1) NOT NULL DEFAULT 0,
  PRIMARY KEY (`id`),
  UNIQUE KEY `employee_id` (`employee_id`),
  KEY `fk_hrms_emp_dept` (`department_id`),
  KEY `fk_hrms_emp_pos` (`position_id`),
  KEY `fk_hrms_emp_grade` (`job_grade_id`),
  KEY `fk_hrms_emp_branch` (`branchs_id`),
  KEY `fk_hrms_emp_city` (`address_city_id`),
  KEY `fk_hrms_emp_ketena` (`address_ketena_id`),
  KEY `fk_hrms_emp_street` (`address_streets_id`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `hrms_employee_info`
--

INSERT INTO `hrms_employee_info` (`id`, `employee_id`, `tin_number`, `fayda_national_id`, `pension_number`, `full_name`, `full_name_am`, `mother_name`, `marital_status`, `disability_status`, `sex`, `date_of_birth`, `nationality`, `blood_group`, `department_id`, `position_id`, `job_grade_id`, `duty_station`, `branchs_id`, `address_city_id`, `address_ketena_id`, `address_streets_id`, `phone_number`, `email`, `emergency_contact_name`, `emergency_contact_phone`, `employment_type`, `employment_status`, `first_employment_date`, `yeteketerubet_ken`, `probation_end_date`, `tureta_yemiwetubet_ken`, `current_salary`, `biometric_pin`, `rfid_card_number`, `primary_bank_name`, `primary_bank_account`, `primary_bank_branch`, `secondary_bank_name`, `secondary_bank_account`, `secondary_bank_branch`, `secondary_payment_purpose`, `employee_photo`, `employee_signature`, `registered_by`, `registered_date`, `modified_by`, `modified_date`, `is_deleted`, `is_salary_defaults_modified`) VALUES
(1, 'EMP-TEST-001', '', '', '', 'Abebe Kebede Tesfaye', 'አበበ ከበደ ተስፋየ', '', 'SINGLE', 'NONE', 'MALE', '2026-09-09', 'Ethiopian', NULL, NULL, NULL, NULL, 'Head Office', NULL, NULL, NULL, NULL, '', '', NULL, NULL, 'PERMANENT', 'ACTIVE', NULL, NULL, NULL, NULL, 18500, '1001', NULL, 'Commercial Bank of Ethiopia', '1000123456789', NULL, 'Abay Bank', '2000987654321', NULL, 'Per Diem & Special Allowances', NULL, NULL, NULL, '2026-09-13 09:47:08', 1, '2026-09-13 09:50:09', 0, 0);

-- --------------------------------------------------------

--
-- Table structure for table `hrms_employee_info_photo`
--

DROP TABLE IF EXISTS `hrms_employee_info_photo`;
CREATE TABLE IF NOT EXISTS `hrms_employee_info_photo` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `hrms_employee_info_id` int(11) NOT NULL,
  `is_document` tinyint(1) NOT NULL DEFAULT 0,
  `is_photo` tinyint(1) NOT NULL DEFAULT 0,
  `document_photo` varchar(255) NOT NULL,
  `document_title` varchar(200) DEFAULT NULL,
  `document_description` text DEFAULT NULL,
  `registered_by` int(11) DEFAULT NULL,
  `registered_date` datetime NOT NULL DEFAULT current_timestamp(),
  `modified_by` int(11) DEFAULT NULL,
  `modified_date` datetime DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `is_deleted` tinyint(1) NOT NULL DEFAULT 0,
  PRIMARY KEY (`id`),
  KEY `fk_hrms_photo_emp` (`hrms_employee_info_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `hrms_employee_info_salary_defaults`
--

DROP TABLE IF EXISTS `hrms_employee_info_salary_defaults`;
CREATE TABLE IF NOT EXISTS `hrms_employee_info_salary_defaults` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `hrms_employee_info_id` int(11) NOT NULL,
  `hrms_salary_configurations_id` int(11) NOT NULL,
  `default_value` double NOT NULL DEFAULT 0,
  `is_active` tinyint(1) NOT NULL DEFAULT 1,
  `is_deleted` tinyint(1) NOT NULL DEFAULT 0,
  PRIMARY KEY (`id`),
  KEY `fk_hrms_sal_def_emp` (`hrms_employee_info_id`),
  KEY `fk_hrms_sal_def_cfg` (`hrms_salary_configurations_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `hrms_employee_leave`
--

DROP TABLE IF EXISTS `hrms_employee_leave`;
CREATE TABLE IF NOT EXISTS `hrms_employee_leave` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `hrms_employee_info_id` int(11) NOT NULL,
  `leave_type_id` int(11) DEFAULT NULL,
  `year` int(11) NOT NULL,
  `leave_days` int(11) NOT NULL,
  `leave_start` date NOT NULL,
  `leave_end` date NOT NULL,
  `leave_reason` varchar(255) DEFAULT NULL,
  `approval_status` varchar(50) NOT NULL DEFAULT 'PENDING',
  `approved_by` int(11) DEFAULT NULL,
  `approved_date` datetime DEFAULT NULL,
  `attachment_path` varchar(255) DEFAULT NULL,
  `registered_by` int(11) NOT NULL,
  `registered_date` datetime NOT NULL DEFAULT current_timestamp(),
  `modified_by` int(11) DEFAULT NULL,
  `modified_date` datetime DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `is_deleted` tinyint(1) NOT NULL DEFAULT 0,
  PRIMARY KEY (`id`),
  KEY `fk_hrms_leave_emp` (`hrms_employee_info_id`),
  KEY `fk_hrms_leave_type` (`leave_type_id`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `hrms_employee_leave`
--

INSERT INTO `hrms_employee_leave` (`id`, `hrms_employee_info_id`, `leave_type_id`, `year`, `leave_days`, `leave_start`, `leave_end`, `leave_reason`, `approval_status`, `approved_by`, `approved_date`, `attachment_path`, `registered_by`, `registered_date`, `modified_by`, `modified_date`, `is_deleted`) VALUES
(1, 1, 1, 2019, 21, '2026-09-20', '2026-10-10', '', 'APPROVED', 1, '2026-09-13 16:47:33', NULL, 1, '2026-09-13 16:46:28', NULL, '2026-09-13 16:46:28', 0);

-- --------------------------------------------------------

--
-- Table structure for table `hrms_employee_ljoch`
--

DROP TABLE IF EXISTS `hrms_employee_ljoch`;
CREATE TABLE IF NOT EXISTS `hrms_employee_ljoch` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `hrms_employee_info_id` int(11) NOT NULL,
  `yelj_mulu_sm` varchar(200) NOT NULL,
  `birth_date` date NOT NULL,
  `tsota` varchar(10) NOT NULL,
  `yeabat_or_enat_mulusm` varchar(200) DEFAULT NULL,
  `registered_date` datetime NOT NULL DEFAULT current_timestamp(),
  `registered_by` int(11) DEFAULT NULL,
  `modified_date` datetime DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `modified_by` int(11) DEFAULT NULL,
  `is_deleted` tinyint(1) NOT NULL DEFAULT 0,
  PRIMARY KEY (`id`),
  KEY `fk_hrms_ljoch_emp` (`hrms_employee_info_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `hrms_employee_more_info`
--

DROP TABLE IF EXISTS `hrms_employee_more_info`;
CREATE TABLE IF NOT EXISTS `hrms_employee_more_info` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `hrms_employee_info_id` int(11) NOT NULL,
  `info_label` varchar(200) NOT NULL,
  `info_value` varchar(200) NOT NULL,
  `info_remark` varchar(200) DEFAULT NULL,
  `info_status` varchar(200) DEFAULT 'ACTIVE',
  `registered_date` datetime NOT NULL DEFAULT current_timestamp(),
  `registered_by` int(11) DEFAULT NULL,
  `modified_date` datetime DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `modified_by` int(11) DEFAULT NULL,
  `is_deleted` tinyint(1) NOT NULL DEFAULT 0,
  PRIMARY KEY (`id`),
  KEY `fk_hrms_more_info_emp` (`hrms_employee_info_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `hrms_employee_yesewnet_meglecha`
--

DROP TABLE IF EXISTS `hrms_employee_yesewnet_meglecha`;
CREATE TABLE IF NOT EXISTS `hrms_employee_yesewnet_meglecha` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `hrms_employee_info_id` int(11) NOT NULL,
  `meglecha_label` varchar(200) NOT NULL,
  `meglecha_value` varchar(200) NOT NULL,
  `registered_by` int(11) DEFAULT NULL,
  `registered_date` datetime NOT NULL DEFAULT current_timestamp(),
  `modified_by` int(11) DEFAULT NULL,
  `modified_date` datetime DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `is_deleted` tinyint(1) NOT NULL DEFAULT 0,
  PRIMARY KEY (`id`),
  KEY `fk_hrms_meglecha_emp` (`hrms_employee_info_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `hrms_employee_yeteketerebachew`
--

DROP TABLE IF EXISTS `hrms_employee_yeteketerebachew`;
CREATE TABLE IF NOT EXISTS `hrms_employee_yeteketerebachew` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `hrms_employee_info_id` int(11) NOT NULL,
  `organization_name` varchar(200) NOT NULL,
  `yesra_medeb` varchar(150) NOT NULL,
  `demewez_meten` double NOT NULL DEFAULT 0,
  `employeed_from` date NOT NULL,
  `employeed_to` date DEFAULT NULL,
  `reason_for_leaving` varchar(255) DEFAULT NULL,
  `registered_date` datetime NOT NULL DEFAULT current_timestamp(),
  `registered_by` int(11) DEFAULT NULL,
  `modified_date` datetime DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `modified_by` int(11) DEFAULT NULL,
  `is_deleted` tinyint(1) NOT NULL DEFAULT 0,
  PRIMARY KEY (`id`),
  KEY `fk_hrms_exp_emp` (`hrms_employee_info_id`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `hrms_employee_yeteketerebachew`
--

INSERT INTO `hrms_employee_yeteketerebachew` (`id`, `hrms_employee_info_id`, `organization_name`, `yesra_medeb`, `demewez_meten`, `employeed_from`, `employeed_to`, `reason_for_leaving`, `registered_date`, `registered_by`, `modified_date`, `modified_by`, `is_deleted`) VALUES
(1, 1, 'እናት ባንክ', 'ደንበኞች አገልግሎት', 16000, '2024-01-13', '2025-05-13', 'ስራ ቦታ በመልቀቅ', '2026-09-13 15:20:05', 1, '2026-09-13 15:20:04', NULL, 0);

-- --------------------------------------------------------

--
-- Table structure for table `hrms_gibir_setting`
--

DROP TABLE IF EXISTS `hrms_gibir_setting`;
CREATE TABLE IF NOT EXISTS `hrms_gibir_setting` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `weight` int(11) NOT NULL,
  `upper_limit_birr` int(11) NOT NULL,
  `percent_birr` int(11) NOT NULL,
  `and_above` tinyint(1) NOT NULL DEFAULT 0,
  `total_deductible_till_this` double NOT NULL DEFAULT 0,
  `setting_description` varchar(150) DEFAULT NULL,
  `is_deleted` tinyint(1) NOT NULL DEFAULT 0,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `hrms_gibir_setting`
--

INSERT INTO `hrms_gibir_setting` (`id`, `weight`, `upper_limit_birr`, `percent_birr`, `and_above`, `total_deductible_till_this`, `setting_description`, `is_deleted`) VALUES
(1, 1, 600, 0, 0, 0, '0 - 600 ETB (0% Exempt)', 0),
(2, 2, 1650, 10, 0, 60, '601 - 1,650 ETB (10%)', 0),
(3, 3, 3200, 15, 0, 142.5, '1,651 - 3,200 ETB (15%)', 0),
(4, 4, 5250, 20, 0, 302.5, '3,201 - 5,250 ETB (20%)', 0),
(5, 5, 7800, 25, 0, 565, '5,251 - 7,800 ETB (25%)', 0),
(6, 6, 10900, 30, 0, 955, '7,801 - 10,900 ETB (30%)', 0),
(7, 7, 10900, 35, 1, 1500, '> 10,900 ETB (35%)', 0);

-- --------------------------------------------------------

--
-- Table structure for table `hrms_job_grades`
--

DROP TABLE IF EXISTS `hrms_job_grades`;
CREATE TABLE IF NOT EXISTS `hrms_job_grades` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `grade_code` varchar(50) NOT NULL,
  `grade_name` varchar(100) NOT NULL,
  `min_salary` double NOT NULL DEFAULT 0,
  `max_salary` double NOT NULL DEFAULT 0,
  `step_increment_rate` double NOT NULL DEFAULT 0,
  `description` varchar(255) DEFAULT NULL,
  `is_active` tinyint(1) NOT NULL DEFAULT 1,
  `created_at` datetime NOT NULL DEFAULT current_timestamp(),
  `updated_at` datetime DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `grade_code` (`grade_code`)
) ENGINE=InnoDB AUTO_INCREMENT=11 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `hrms_job_grades`
--

INSERT INTO `hrms_job_grades` (`id`, `grade_code`, `grade_name`, `min_salary`, `max_salary`, `step_increment_rate`, `description`, `is_active`, `created_at`, `updated_at`) VALUES
(1, 'GR-I', 'Grade I (Junior Support / Casual)', 4500, 7500, 300, 'Junior field support, trench workers, security guards', 1, '2026-09-13 11:50:11', '2026-09-13 11:50:11'),
(2, 'GR-II', 'Grade II (Field Technician / Operator)', 7500, 12500, 500, 'Plumbers, water meter readers, junior pump operators', 1, '2026-09-13 11:50:11', '2026-09-13 11:50:11'),
(3, 'GR-III', 'Grade III (Senior Technician / Officer)', 12500, 20000, 800, 'WTP plant operators, electromechanical technicians, billing officers', 1, '2026-09-13 11:50:11', '2026-09-13 11:50:11'),
(4, 'GR-IV', 'Grade IV (Professional / Team Leader)', 20000, 32000, 1200, 'Water quality chemists, network engineers, HR officers, accountants', 1, '2026-09-13 11:50:11', '2026-09-13 11:50:11'),
(5, 'GR-V', 'Grade V (Department Head / Director)', 32000, 55000, 2000, 'Department directors, technical division heads', 1, '2026-09-13 11:50:11', '2026-09-13 11:50:11');

-- --------------------------------------------------------

--
-- Table structure for table `hrms_leave_allocations`
--

DROP TABLE IF EXISTS `hrms_leave_allocations`;
CREATE TABLE IF NOT EXISTS `hrms_leave_allocations` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `hrms_employee_info_id` int(11) NOT NULL,
  `leave_type_id` int(11) NOT NULL,
  `fiscal_year_ec` int(11) NOT NULL,
  `entitled_days` double NOT NULL DEFAULT 0,
  `carried_over_days` double NOT NULL DEFAULT 0,
  `used_days` double NOT NULL DEFAULT 0,
  `remaining_days` double NOT NULL DEFAULT 0,
  `updated_at` datetime DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `fk_hrms_alloc_emp` (`hrms_employee_info_id`),
  KEY `fk_hrms_alloc_type` (`leave_type_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `hrms_leave_types`
--

DROP TABLE IF EXISTS `hrms_leave_types`;
CREATE TABLE IF NOT EXISTS `hrms_leave_types` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `type_code` varchar(50) NOT NULL,
  `type_name` varchar(100) NOT NULL,
  `type_name_am` varchar(150) NOT NULL,
  `default_days` int(11) NOT NULL DEFAULT 16,
  `is_service_accrued` tinyint(1) NOT NULL DEFAULT 0,
  `is_paid` tinyint(1) NOT NULL DEFAULT 1,
  `requires_attachment` tinyint(1) NOT NULL DEFAULT 0,
  `gender_restriction` varchar(10) DEFAULT 'ALL',
  `is_active` tinyint(1) NOT NULL DEFAULT 1,
  PRIMARY KEY (`id`),
  UNIQUE KEY `type_code` (`type_code`)
) ENGINE=InnoDB AUTO_INCREMENT=15 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `hrms_leave_types`
--

INSERT INTO `hrms_leave_types` (`id`, `type_code`, `type_name`, `type_name_am`, `default_days`, `is_service_accrued`, `is_paid`, `requires_attachment`, `gender_restriction`, `is_active`) VALUES
(1, 'ANNUAL', 'Annual Leave', 'ዓመታዊ የዕረፍት ፈቃድ', 16, 1, 1, 0, 'ALL', 1),
(2, 'MATERNITY', 'Maternity Leave', 'የወሊድ ፈቃድ', 120, 0, 1, 1, 'FEMALE', 1),
(3, 'PATERNITY', 'Paternity Leave', 'የአባትነት ፈቃድ', 3, 0, 1, 1, 'MALE', 1),
(4, 'SICK', 'Sick Leave', 'የሕክምና ፈቃድ', 30, 0, 1, 1, 'ALL', 1),
(5, 'BEREAVEMENT', 'Bereavement / Mourning Leave', 'የሐዘን ፈቃድ', 3, 0, 1, 0, 'ALL', 1),
(6, 'WEDDING', 'Wedding Leave', 'የጋብቻ ፈቃድ', 3, 0, 1, 1, 'ALL', 1),
(7, 'SPECIAL', 'Special Duty / Exam Leave', 'ልዩ ፈቃድ', 5, 0, 1, 1, 'ALL', 1);

-- --------------------------------------------------------

--
-- Table structure for table `hrms_payroll_account_map`
--

DROP TABLE IF EXISTS `hrms_payroll_account_map`;
CREATE TABLE IF NOT EXISTS `hrms_payroll_account_map` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `mapping_key` varchar(100) NOT NULL,
  `account_id` int(11) NOT NULL,
  `label` varchar(200) NOT NULL,
  `label_am` varchar(250) DEFAULT NULL,
  `entry_type` varchar(10) NOT NULL DEFAULT 'DEBIT',
  `created_at` datetime NOT NULL DEFAULT current_timestamp(),
  `updated_at` datetime DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `mapping_key` (`mapping_key`),
  KEY `fk_hrms_acct_map_fnc` (`account_id`)
) ENGINE=InnoDB AUTO_INCREMENT=12 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `hrms_payroll_account_map`
--

INSERT INTO `hrms_payroll_account_map` (`id`, `mapping_key`, `account_id`, `label`, `label_am`, `entry_type`, `created_at`, `updated_at`) VALUES
(1, 'HRMS_DR_BASIC_SALARY', 69, 'Basic Salaries Expense', 'መሰረታዊ ደመወዝ ወጪ', 'DEBIT', '2026-09-13 11:38:17', '2026-09-13 11:38:17'),
(2, 'HRMS_DR_OVERTIME', 70, 'Overtime Pay Expense', 'የትርፍ ሰዓት ክፍያ ወጪ', 'DEBIT', '2026-09-13 11:38:17', '2026-09-13 11:38:17'),
(3, 'HRMS_DR_HOUSING_ALLOWANCE', 71, 'Housing Allowances Expense', 'የቤት ኪራይ አበል ወጪ', 'DEBIT', '2026-09-13 11:38:17', '2026-09-13 11:38:17'),
(4, 'HRMS_DR_TRANSPORT_ALLOWANCE', 72, 'Transport Allowances Expense', 'የትራንስፖርት አበል ወጪ', 'DEBIT', '2026-09-13 11:38:17', '2026-09-13 11:38:17'),
(5, 'HRMS_DR_HAZARD_ALLOWANCE', 73, 'Hazard & Chemical Allowances Expense', 'የክሎሪንና ኬሚካል አበል ወጪ', 'DEBIT', '2026-09-13 11:38:17', '2026-09-13 11:38:17'),
(6, 'HRMS_DR_EMPLOYER_PENSION_11', 74, 'Employer Pension Contribution 11%', 'የአሰሪው ጡረታ መዋጮ 11% ወጪ', 'DEBIT', '2026-09-13 11:38:17', '2026-09-13 11:38:17'),
(7, 'HRMS_CR_TAX_PAYABLE', 76, 'Employment Income Tax Payable (Schedule A)', 'የሥራ ግብር ተከፋይ', 'CREDIT', '2026-09-13 11:38:17', '2026-09-13 11:38:17'),
(8, 'HRMS_CR_PENSION_PAYABLE_18', 77, 'Pension Contribution Payable (18%)', 'የጡረታ መዋጮ ተከፋይ (18%)', 'CREDIT', '2026-09-13 11:38:17', '2026-09-13 11:38:17'),
(9, 'HRMS_CR_EDIR_PAYABLE', 78, 'Staff Association & Edir Payable', 'የእድርና ብድር ተቀናሽ ተከፋይ', 'CREDIT', '2026-09-13 11:38:17', '2026-09-13 11:38:17'),
(10, 'HRMS_CR_NET_SALARY_CBE', 79, 'Net Salaries Payable — Commercial Bank of Ethiopia', 'የተጣራ ደመወዝ ተከፋይ (ንግድ ባንክ)', 'CREDIT', '2026-09-13 11:38:17', '2026-09-13 11:38:17'),
(11, 'HRMS_CR_NET_SALARY_ABAY', 80, 'Net Salaries Payable — Abay Bank', 'የተጣራ ደመወዝ ተከፋይ (አባይ ባንክ)', 'CREDIT', '2026-09-13 11:38:17', '2026-09-13 11:38:17');

-- --------------------------------------------------------

--
-- Table structure for table `hrms_payroll_runs`
--

DROP TABLE IF EXISTS `hrms_payroll_runs`;
CREATE TABLE IF NOT EXISTS `hrms_payroll_runs` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `payroll_reference` varchar(100) NOT NULL,
  `salary_month_name` varchar(50) NOT NULL,
  `salary_year` int(11) NOT NULL,
  `salary_month_date` date NOT NULL,
  `fiscal_year_id` int(11) NOT NULL,
  `total_basic_salary` double NOT NULL DEFAULT 0,
  `total_overtime` double NOT NULL DEFAULT 0,
  `total_additive` double NOT NULL DEFAULT 0,
  `total_gross_salary` double NOT NULL DEFAULT 0,
  `total_taxable_income` double NOT NULL DEFAULT 0,
  `total_salary_tax` double NOT NULL DEFAULT 0,
  `total_pension_employee` double NOT NULL DEFAULT 0,
  `total_pension_employer` double NOT NULL DEFAULT 0,
  `total_deductible` double NOT NULL DEFAULT 0,
  `total_net_salary` double NOT NULL DEFAULT 0,
  `total_net_cbe` double NOT NULL DEFAULT 0,
  `total_net_abay` double NOT NULL DEFAULT 0,
  `payment_status` varchar(50) NOT NULL DEFAULT 'PENDING',
  `approval_status` varchar(50) NOT NULL DEFAULT 'DRAFT',
  `is_posted_to_journal` tinyint(1) NOT NULL DEFAULT 0,
  `journal_entry_id` bigint(20) DEFAULT NULL,
  `fnce_payment_voucher_id` int(11) DEFAULT NULL,
  `registered_by` int(11) NOT NULL,
  `registered_date` datetime NOT NULL DEFAULT current_timestamp(),
  `approved_by` int(11) DEFAULT NULL,
  `approved_date` datetime DEFAULT NULL,
  `is_deleted` tinyint(1) NOT NULL DEFAULT 0,
  PRIMARY KEY (`id`),
  UNIQUE KEY `payroll_reference` (`payroll_reference`),
  KEY `fk_hrms_prun_fy` (`fiscal_year_id`),
  KEY `fk_hrms_prun_jentry` (`journal_entry_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `hrms_positions`
--

DROP TABLE IF EXISTS `hrms_positions`;
CREATE TABLE IF NOT EXISTS `hrms_positions` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `position_code` varchar(50) NOT NULL,
  `position_title` varchar(150) NOT NULL,
  `position_title_am` varchar(200) DEFAULT NULL,
  `department_id` int(11) NOT NULL,
  `job_grade_id` int(11) DEFAULT NULL,
  `approved_headcount` int(11) NOT NULL DEFAULT 1,
  `is_hazardous` tinyint(1) NOT NULL DEFAULT 0,
  `requires_shift_work` tinyint(1) NOT NULL DEFAULT 0,
  `is_active` tinyint(1) NOT NULL DEFAULT 1,
  `created_at` datetime NOT NULL DEFAULT current_timestamp(),
  `updated_at` datetime DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `position_code` (`position_code`),
  KEY `fk_hrms_pos_dept` (`department_id`),
  KEY `fk_hrms_pos_grade` (`job_grade_id`)
) ENGINE=InnoDB AUTO_INCREMENT=19 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `hrms_positions`
--

INSERT INTO `hrms_positions` (`id`, `position_code`, `position_title`, `position_title_am`, `department_id`, `job_grade_id`, `approved_headcount`, `is_hazardous`, `requires_shift_work`, `is_active`, `created_at`, `updated_at`) VALUES
(1, 'POS-WTP-OP', 'Water Treatment Plant Operator', 'የውሃ ማጣሪያ ፕላንት ኦፕሬተር', 1, 3, 8, 1, 1, 1, '2026-09-13 11:50:11', '2026-09-13 11:50:11'),
(2, 'POS-WTP-CHM', 'Water Quality Lab Chemist', 'የውሃ ጥራት ተቆጣጣሪ ኬሚስት', 1, 4, 3, 1, 0, 1, '2026-09-13 11:50:11', '2026-09-13 11:50:11'),
(3, 'POS-NET-PLMB', 'Network Maintenance Plumber', 'የውሃ መስመር ጥገና ባለሙያ (ቧንቧ ሠራተኛ)', 2, 2, 12, 0, 1, 1, '2026-09-13 11:50:11', '2026-09-13 11:50:11'),
(4, 'POS-LEAK-REP', 'Emergency Leak Repair Technician', 'የአደጋ ጊዜ የውሃ ፍሰት ጥገና ቴክኒሻን', 2, 3, 6, 0, 1, 1, '2026-09-13 11:50:11', '2026-09-13 11:50:11'),
(5, 'POS-ELEC-ENG', 'Electro-Mechanical Pump Station Engineer', 'የቦስተርና ፓምፕ ኤሌክትሮ መካኒክ መሃንዲስ', 3, 4, 4, 1, 1, 1, '2026-09-13 11:50:11', '2026-09-13 11:50:11'),
(6, 'POS-MTR-RDR', 'Water Meter Reader & Collector', 'የውሃ ቆጣሪ አንባቢና ተቆጣጣሪ', 4, 2, 15, 0, 0, 1, '2026-09-13 11:50:11', '2026-09-13 11:50:11'),
(7, 'POS-BILL-OFF', 'Customer Billing Officer', 'የደንበኞች ቢሊንግ ባለሙያ', 4, 3, 6, 0, 0, 1, '2026-09-13 11:50:11', '2026-09-13 11:50:11'),
(8, 'POS-HR-OFF', 'Human Resource Specialist', 'የሰው ኃይል አስተዳደር ባለሙያ', 5, 4, 2, 0, 0, 1, '2026-09-13 11:50:11', '2026-09-13 11:50:11'),
(9, 'POS-PAY-ACC', 'Payroll & General Ledger Accountant', 'የደመወዝና ፋይናንስ ሂሳብ ሹም', 6, 4, 2, 0, 0, 1, '2026-09-13 11:50:11', '2026-09-13 11:50:11');

-- --------------------------------------------------------

--
-- Table structure for table `hrms_salary_calculated`
--

DROP TABLE IF EXISTS `hrms_salary_calculated`;
CREATE TABLE IF NOT EXISTS `hrms_salary_calculated` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `hrms_payroll_run_id` int(11) DEFAULT NULL,
  `hrms_employee_id` int(11) NOT NULL,
  `basic_salary` double NOT NULL DEFAULT 0,
  `current_salary` double NOT NULL DEFAULT 0,
  `part_time_working_hr` double NOT NULL DEFAULT 0,
  `part_time_night` double NOT NULL DEFAULT 0,
  `part_time_weekend` double NOT NULL DEFAULT 0,
  `part_time_holliday` double NOT NULL DEFAULT 0,
  `part_time_total` double NOT NULL DEFAULT 0,
  `total_additive` double NOT NULL DEFAULT 0,
  `gross_salary` double NOT NULL DEFAULT 0,
  `total_taxable_income` double NOT NULL DEFAULT 0,
  `salary_tax` double NOT NULL DEFAULT 0,
  `total_7_percent_pension` double NOT NULL DEFAULT 0,
  `total_11_percent_pension` double NOT NULL DEFAULT 0,
  `total_deductible` double NOT NULL DEFAULT 0,
  `net_salary` double NOT NULL DEFAULT 0,
  `disbursed_to_primary_cbe` double NOT NULL DEFAULT 0,
  `disbursed_to_secondary_abay` double NOT NULL DEFAULT 0,
  `working_days` int(11) NOT NULL DEFAULT 30,
  `payment_status` varchar(50) NOT NULL DEFAULT 'Pending',
  `approval_status` varchar(50) NOT NULL DEFAULT 'Pending',
  `is_paid` tinyint(1) NOT NULL DEFAULT 0,
  `registered_by` int(11) NOT NULL,
  `registered_date` datetime NOT NULL DEFAULT current_timestamp(),
  `modified_by` int(11) DEFAULT NULL,
  `modified_date` datetime DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `is_deleted` tinyint(1) NOT NULL DEFAULT 0,
  PRIMARY KEY (`id`),
  KEY `fk_hrms_scal_run` (`hrms_payroll_run_id`),
  KEY `fk_hrms_scal_emp` (`hrms_employee_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `hrms_salary_calculated_tekenash`
--

DROP TABLE IF EXISTS `hrms_salary_calculated_tekenash`;
CREATE TABLE IF NOT EXISTS `hrms_salary_calculated_tekenash` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `hrm_salary_calculated_id` int(11) NOT NULL,
  `hrm_salary_configurations_id` int(11) NOT NULL,
  `is_percent` tinyint(1) NOT NULL DEFAULT 0,
  `is_birr` tinyint(1) NOT NULL DEFAULT 1,
  `config_value` double NOT NULL DEFAULT 0,
  `tekenanash_value` double NOT NULL DEFAULT 0,
  `is_tekenash` tinyint(1) NOT NULL DEFAULT 0,
  `is_techemari` tinyint(1) NOT NULL DEFAULT 0,
  `is_deleted` tinyint(1) NOT NULL DEFAULT 0,
  PRIMARY KEY (`id`),
  KEY `fk_hrms_scal_tek_scal` (`hrm_salary_calculated_id`),
  KEY `fk_hrms_scal_tek_cfg` (`hrm_salary_configurations_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `hrms_salary_configurations`
--

DROP TABLE IF EXISTS `hrms_salary_configurations`;
CREATE TABLE IF NOT EXISTS `hrms_salary_configurations` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `config_code` varchar(50) DEFAULT NULL,
  `config_title` varchar(150) NOT NULL,
  `config_title_am` varchar(200) DEFAULT NULL,
  `is_birr` tinyint(1) NOT NULL DEFAULT 1,
  `is_percent` tinyint(1) NOT NULL DEFAULT 0,
  `config_value` double NOT NULL DEFAULT 0,
  `weight` int(11) NOT NULL DEFAULT 0,
  `is_taxed` tinyint(1) NOT NULL DEFAULT 0,
  `is_deductible` tinyint(1) NOT NULL DEFAULT 0,
  `is_additive` tinyint(1) NOT NULL DEFAULT 0,
  `is_pension` tinyint(1) NOT NULL DEFAULT 0,
  `is_leave_config` tinyint(1) NOT NULL DEFAULT 0,
  `is_deleted` tinyint(1) NOT NULL DEFAULT 0,
  `created_at` datetime NOT NULL DEFAULT current_timestamp(),
  `updated_at` datetime DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `config_code` (`config_code`)
) ENGINE=InnoDB AUTO_INCREMENT=9 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `hrms_salary_configurations`
--

INSERT INTO `hrms_salary_configurations` (`id`, `config_code`, `config_title`, `config_title_am`, `is_birr`, `is_percent`, `config_value`, `weight`, `is_taxed`, `is_deductible`, `is_additive`, `is_pension`, `is_leave_config`, `is_deleted`, `created_at`, `updated_at`) VALUES
(1, 'CFG_OT_DAY', 'Daytime Overtime 1.5x', 'የትርፍ ሰዓት ክፍያ (ቀን 1.5x)', 1, 0, 0, 1, 1, 0, 1, 0, 0, 0, '2026-09-13 11:50:11', '2026-09-13 11:50:11'),
(2, 'CFG_HOUSING', 'Housing Allowance', 'የቤት ኪራይ አበል', 1, 0, 500, 2, 1, 0, 1, 0, 0, 0, '2026-09-13 11:50:11', '2026-09-13 11:50:11'),
(3, 'CFG_TRANSPORT', 'Transport Allowance', 'ጠቅላላ የትራንስፖርት አበል', 1, 0, 300, 3, 1, 0, 1, 0, 0, 0, '2026-09-13 11:50:11', '2026-09-13 11:50:11'),
(4, 'CFG_PENSION_EMP', 'Employee Pension 7%', 'የጡረታ መዋጮ (ሠራተኛ 7%)', 0, 1, 7, 4, 0, 1, 0, 1, 0, 0, '2026-09-13 11:50:11', '2026-09-13 11:50:11'),
(5, 'CFG_PENSION_ORG', 'Employer Pension 11%', 'የጡረታ መዋጮ (አሰሪ 11%)', 0, 1, 11, 5, 0, 0, 0, 1, 0, 0, '2026-09-13 11:50:11', '2026-09-13 11:50:11'),
(6, 'CFG_HAZARD', 'Hazard & Chemical Allowance', 'የክሎሪንና ኬሚካል አበል', 1, 0, 400, 6, 1, 0, 1, 0, 0, 0, '2026-09-13 11:50:11', '2026-09-13 11:50:11'),
(7, 'CFG_SHIFT_DIFF', 'Night Shift Differential Allowance', 'የማታ ፈረቃ አበል', 1, 0, 250, 7, 1, 0, 1, 0, 0, 0, '2026-09-13 11:50:11', '2026-09-13 11:50:11'),
(8, 'CFG_EDIR', 'Staff Association / Edir Deduction', 'የእድርና ብድር ተቀናሽ', 1, 0, 100, 8, 0, 1, 0, 0, 0, 0, '2026-09-13 11:50:11', '2026-09-13 11:50:11');

-- --------------------------------------------------------

--
-- Table structure for table `hrms_shift_assignments`
--

DROP TABLE IF EXISTS `hrms_shift_assignments`;
CREATE TABLE IF NOT EXISTS `hrms_shift_assignments` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `hrms_employee_info_id` int(11) NOT NULL,
  `shift_schedule_id` int(11) NOT NULL,
  `assigned_date` date NOT NULL,
  `is_standby_on_call` tinyint(1) NOT NULL DEFAULT 0,
  `created_at` datetime NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `fk_hrms_shift_emp` (`hrms_employee_info_id`),
  KEY `fk_hrms_shift_sched` (`shift_schedule_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `hrms_shift_schedules`
--

DROP TABLE IF EXISTS `hrms_shift_schedules`;
CREATE TABLE IF NOT EXISTS `hrms_shift_schedules` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `shift_code` varchar(50) NOT NULL,
  `shift_name` varchar(100) NOT NULL,
  `start_time` time NOT NULL,
  `end_time` time NOT NULL,
  `is_night_shift` tinyint(1) NOT NULL DEFAULT 0,
  `grace_period_minutes` int(11) NOT NULL DEFAULT 15,
  `total_hours` double NOT NULL DEFAULT 8,
  `description` varchar(255) DEFAULT NULL,
  `is_active` tinyint(1) NOT NULL DEFAULT 1,
  PRIMARY KEY (`id`),
  UNIQUE KEY `shift_code` (`shift_code`)
) ENGINE=InnoDB AUTO_INCREMENT=11 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `hrms_shift_schedules`
--

INSERT INTO `hrms_shift_schedules` (`id`, `shift_code`, `shift_name`, `start_time`, `end_time`, `is_night_shift`, `grace_period_minutes`, `total_hours`, `description`, `is_active`) VALUES
(1, 'SHIFT-MORN', 'Morning Shift (የጠዋት ፈረቃ)', '06:00:00', '14:00:00', 0, 15, 8, 'Treatment plant and pump station morning shift', 1),
(2, 'SHIFT-AFTN', 'Afternoon Shift (የከሰዓት ፈረቃ)', '14:00:00', '22:00:00', 0, 15, 8, 'Treatment plant and pump station afternoon shift', 1),
(3, 'SHIFT-NIGHT', 'Night Shift (የማታ ፈረቃ - 1.75x OT / Allowance)', '22:00:00', '06:00:00', 1, 15, 8, 'Continuous night operation with statutory night differential', 1),
(4, 'SHIFT-GEN', 'General Office Hours (መደበኛ የቢሮ ሰዓት)', '08:00:00', '17:00:00', 0, 15, 8, 'Standard administration & billing office schedule with 1hr lunch', 1),
(5, 'SHIFT-STNDBY', 'Emergency Standby (የአደጋ ጊዜ ተረኛ)', '17:00:00', '08:00:00', 1, 30, 15, 'On-call emergency leak burst & main line repair crew', 1);

--
-- Constraints for dumped tables
--

--
-- Constraints for table `hrms_attendance_raw_logs`
--
ALTER TABLE `hrms_attendance_raw_logs`
  ADD CONSTRAINT `fk_hrms_raw_device` FOREIGN KEY (`device_id`) REFERENCES `hrms_biometric_device` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `hrms_attendance_records`
--
ALTER TABLE `hrms_attendance_records`
  ADD CONSTRAINT `fk_hrms_att_emp` FOREIGN KEY (`hrms_employee_info_id`) REFERENCES `hrms_employee_info` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_hrms_att_shift` FOREIGN KEY (`shift_schedule_id`) REFERENCES `hrms_shift_schedules` (`id`) ON DELETE SET NULL;

--
-- Constraints for table `hrms_departments`
--
ALTER TABLE `hrms_departments`
  ADD CONSTRAINT `fk_hrms_dept_parent` FOREIGN KEY (`parent_department_id`) REFERENCES `hrms_departments` (`id`) ON DELETE SET NULL;

--
-- Constraints for table `hrms_employee_chlota`
--
ALTER TABLE `hrms_employee_chlota`
  ADD CONSTRAINT `fk_hrms_chlota_emp` FOREIGN KEY (`hrms_employee_info_id`) REFERENCES `hrms_employee_info` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `hrms_employee_education`
--
ALTER TABLE `hrms_employee_education`
  ADD CONSTRAINT `fk_hrms_edu_emp` FOREIGN KEY (`hrms_employee_info_id`) REFERENCES `hrms_employee_info` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `hrms_employee_info`
--
ALTER TABLE `hrms_employee_info`
  ADD CONSTRAINT `fk_hrms_emp_branch` FOREIGN KEY (`branchs_id`) REFERENCES `branchs` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `fk_hrms_emp_city` FOREIGN KEY (`address_city_id`) REFERENCES `address_city` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `fk_hrms_emp_dept` FOREIGN KEY (`department_id`) REFERENCES `hrms_departments` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `fk_hrms_emp_grade` FOREIGN KEY (`job_grade_id`) REFERENCES `hrms_job_grades` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `fk_hrms_emp_ketena` FOREIGN KEY (`address_ketena_id`) REFERENCES `address_ketena` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `fk_hrms_emp_pos` FOREIGN KEY (`position_id`) REFERENCES `hrms_positions` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `fk_hrms_emp_street` FOREIGN KEY (`address_streets_id`) REFERENCES `address_streets` (`id`) ON DELETE SET NULL;

--
-- Constraints for table `hrms_employee_info_photo`
--
ALTER TABLE `hrms_employee_info_photo`
  ADD CONSTRAINT `fk_hrms_photo_emp` FOREIGN KEY (`hrms_employee_info_id`) REFERENCES `hrms_employee_info` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `hrms_employee_info_salary_defaults`
--
ALTER TABLE `hrms_employee_info_salary_defaults`
  ADD CONSTRAINT `fk_hrms_sal_def_cfg` FOREIGN KEY (`hrms_salary_configurations_id`) REFERENCES `hrms_salary_configurations` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_hrms_sal_def_emp` FOREIGN KEY (`hrms_employee_info_id`) REFERENCES `hrms_employee_info` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `hrms_employee_leave`
--
ALTER TABLE `hrms_employee_leave`
  ADD CONSTRAINT `fk_hrms_leave_emp` FOREIGN KEY (`hrms_employee_info_id`) REFERENCES `hrms_employee_info` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_hrms_leave_type` FOREIGN KEY (`leave_type_id`) REFERENCES `hrms_leave_types` (`id`) ON DELETE SET NULL;

--
-- Constraints for table `hrms_employee_ljoch`
--
ALTER TABLE `hrms_employee_ljoch`
  ADD CONSTRAINT `fk_hrms_ljoch_emp` FOREIGN KEY (`hrms_employee_info_id`) REFERENCES `hrms_employee_info` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `hrms_employee_more_info`
--
ALTER TABLE `hrms_employee_more_info`
  ADD CONSTRAINT `fk_hrms_more_info_emp` FOREIGN KEY (`hrms_employee_info_id`) REFERENCES `hrms_employee_info` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `hrms_employee_yesewnet_meglecha`
--
ALTER TABLE `hrms_employee_yesewnet_meglecha`
  ADD CONSTRAINT `fk_hrms_meglecha_emp` FOREIGN KEY (`hrms_employee_info_id`) REFERENCES `hrms_employee_info` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `hrms_employee_yeteketerebachew`
--
ALTER TABLE `hrms_employee_yeteketerebachew`
  ADD CONSTRAINT `fk_hrms_exp_emp` FOREIGN KEY (`hrms_employee_info_id`) REFERENCES `hrms_employee_info` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `hrms_leave_allocations`
--
ALTER TABLE `hrms_leave_allocations`
  ADD CONSTRAINT `fk_hrms_alloc_emp` FOREIGN KEY (`hrms_employee_info_id`) REFERENCES `hrms_employee_info` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_hrms_alloc_type` FOREIGN KEY (`leave_type_id`) REFERENCES `hrms_leave_types` (`id`);

--
-- Constraints for table `hrms_payroll_account_map`
--
ALTER TABLE `hrms_payroll_account_map`
  ADD CONSTRAINT `fk_hrms_acct_map_fnc` FOREIGN KEY (`account_id`) REFERENCES `fnc_account` (`id`);

--
-- Constraints for table `hrms_payroll_runs`
--
ALTER TABLE `hrms_payroll_runs`
  ADD CONSTRAINT `fk_hrms_prun_fy` FOREIGN KEY (`fiscal_year_id`) REFERENCES `fnc_fiscal_year` (`id`),
  ADD CONSTRAINT `fk_hrms_prun_jentry` FOREIGN KEY (`journal_entry_id`) REFERENCES `fnc_journal_entry` (`id`) ON DELETE SET NULL;

--
-- Constraints for table `hrms_positions`
--
ALTER TABLE `hrms_positions`
  ADD CONSTRAINT `fk_hrms_pos_dept` FOREIGN KEY (`department_id`) REFERENCES `hrms_departments` (`id`),
  ADD CONSTRAINT `fk_hrms_pos_grade` FOREIGN KEY (`job_grade_id`) REFERENCES `hrms_job_grades` (`id`) ON DELETE SET NULL;

--
-- Constraints for table `hrms_salary_calculated`
--
ALTER TABLE `hrms_salary_calculated`
  ADD CONSTRAINT `fk_hrms_scal_emp` FOREIGN KEY (`hrms_employee_id`) REFERENCES `hrms_employee_info` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_hrms_scal_run` FOREIGN KEY (`hrms_payroll_run_id`) REFERENCES `hrms_payroll_runs` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `hrms_salary_calculated_tekenash`
--
ALTER TABLE `hrms_salary_calculated_tekenash`
  ADD CONSTRAINT `fk_hrms_scal_tek_cfg` FOREIGN KEY (`hrm_salary_configurations_id`) REFERENCES `hrms_salary_configurations` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_hrms_scal_tek_scal` FOREIGN KEY (`hrm_salary_calculated_id`) REFERENCES `hrms_salary_calculated` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `hrms_shift_assignments`
--
ALTER TABLE `hrms_shift_assignments`
  ADD CONSTRAINT `fk_hrms_shift_emp` FOREIGN KEY (`hrms_employee_info_id`) REFERENCES `hrms_employee_info` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_hrms_shift_sched` FOREIGN KEY (`shift_schedule_id`) REFERENCES `hrms_shift_schedules` (`id`);
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
