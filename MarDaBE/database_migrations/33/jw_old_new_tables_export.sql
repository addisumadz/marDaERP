-- MySQL dump 10.13  Distrib 5.7.44, for Win64 (x86_64)
--
-- Host: 127.0.0.1    Database: wbill_jwns9
-- ------------------------------------------------------
-- Server version	11.5.2-MariaDB

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `custom_additional_fee_type`
--

DROP TABLE IF EXISTS `custom_additional_fee_type`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `custom_additional_fee_type` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `fee_code` varchar(50) NOT NULL,
  `fee_name` varchar(200) NOT NULL,
  `fee_name_am` varchar(200) NOT NULL,
  `default_amount` decimal(15,2) NOT NULL DEFAULT 0.00,
  `unit_name` varchar(50) NOT NULL DEFAULT 'ßëÑßê¡',
  `is_active` tinyint(1) NOT NULL DEFAULT 1,
  `created_at` datetime DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `fee_code` (`fee_code`)
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `custom_additional_fee_type`
--

LOCK TABLES `custom_additional_fee_type` WRITE;
/*!40000 ALTER TABLE `custom_additional_fee_type` DISABLE KEYS */;
INSERT INTO `custom_additional_fee_type` (`id`, `fee_code`, `fee_name`, `fee_name_am`, `default_amount`, `unit_name`, `is_active`, `created_at`) VALUES (1,'FEE_SURVEY','Site Survey Fee','ßï¿ßï│ßê░ßê│ ßîÑßèôßëÁ ßè¡ßììßï½',40.00,'ßëÑßê¡',1,'2026-09-09 16:08:39'),(2,'FEE_EXCAVATION','Excavation / Inspection','ßè¿ßë░ßëåßîúßîúßê¬ / ßëüßìïßê«',50.00,'ßëÑßê¡',1,'2026-09-09 16:08:39'),(3,'FEE_PHOTOCOPY','Photocopy Charge','ßìÄßëÂ ßè«ßìÆ',6.00,'ßëÑßê¡',1,'2026-09-09 16:08:39'),(4,'FEE_DOCUMENT','Document & Form Processing','ßê░ßèÉßïÁ / ßï░ßê¿ßê░ßèØ',4.00,'ßëÑßê¡',1,'2026-09-09 16:08:39'),(5,'FEE_STICKER','Meter Security Sticker','ßêÁßë┤ßè¿ßê¡',5.00,'ßëÑßê¡',1,'2026-09-09 16:08:39'),(6,'FEE_STAMP','Legal Revenue Stamp','ßë│ßêØßëÑ',70.00,'ßëÑßê¡',1,'2026-09-09 16:08:39');
/*!40000 ALTER TABLE `custom_additional_fee_type` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `custom_maintenance_type`
--

DROP TABLE IF EXISTS `custom_maintenance_type`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `custom_maintenance_type` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `type_code` varchar(50) NOT NULL,
  `type_name` varchar(200) NOT NULL,
  `type_name_am` varchar(200) NOT NULL,
  `description` text DEFAULT NULL,
  `display_order` int(11) NOT NULL DEFAULT 0,
  `is_active` tinyint(1) NOT NULL DEFAULT 1,
  `created_at` datetime DEFAULT current_timestamp(),
  `updated_at` datetime DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `type_code` (`type_code`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `custom_maintenance_type`
--

LOCK TABLES `custom_maintenance_type` WRITE;
/*!40000 ALTER TABLE `custom_maintenance_type` DISABLE KEYS */;
INSERT INTO `custom_maintenance_type` (`id`, `type_code`, `type_name`, `type_name_am`, `description`, `display_order`, `is_active`, `created_at`, `updated_at`) VALUES (1,'PIPE_LEAKAGE','Pipe Leakage Repair','ßï¿ßëºßèòßëº ßììßê│ßê¢ ßîÑßîêßèô','Repair of leaking HDPE / GI pipes and fittings',1,1,'2026-09-11 23:28:47','2026-09-11 23:28:47'),(2,'METER_REPLACE','Water Meter Replacement / Repair','ßï¿ßïìßêâ ßëåßîúßê¬ ßëàßï½ßê¼ / ßîÑßîêßèô','Replacement of broken, stuck, or aged water meter',2,1,'2026-09-11 23:28:47','2026-09-11 23:28:47'),(3,'GATE_VALVE','Gate Valve & Fitting Repair','ßï¿ßîîßëÁ ßë½ßêìßë¡ ßèÑßèô ßêøßîêßèôßèø ßîÑßîêßèô','Servicing and replacing worn-out gate valves and nipples',3,1,'2026-09-11 23:28:47','2026-09-11 23:28:47'),(4,'LINE_BURST','Main Line Breakdown Repair','ßï¿ßïïßèô ßêÿßêÁßêÿßê¡ ßêÿßëåßê½ßê¿ßîÑ ßîÑßîêßèô','Urgent line burst repair, reconnection and welding',4,1,'2026-09-11 23:28:47','2026-09-11 23:28:47'),(5,'OTHER_MAINTENANCE','General / Other Maintenance','ßèáßîáßëâßêïßï¡ / ßêîßêÄßë¢ ßîÑßîêßèôßïÄßë¢','Other miscellaneous customer site water maintenance',5,1,'2026-09-11 23:28:47','2026-09-11 23:28:47');
/*!40000 ALTER TABLE `custom_maintenance_type` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `fnc_fiscal_year`
--

DROP TABLE IF EXISTS `fnc_fiscal_year`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `fnc_fiscal_year` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `fiscal_year_name` varchar(100) NOT NULL,
  `start_date` date NOT NULL,
  `end_date` date NOT NULL,
  `is_closed` tinyint(1) DEFAULT 0,
  `created_by` varchar(100) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_uca1400_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `fnc_fiscal_year`
--

LOCK TABLES `fnc_fiscal_year` WRITE;
/*!40000 ALTER TABLE `fnc_fiscal_year` DISABLE KEYS */;
INSERT INTO `fnc_fiscal_year` (`id`, `fiscal_year_name`, `start_date`, `end_date`, `is_closed`, `created_by`, `created_at`, `updated_at`) VALUES (1,'2019','2026-07-09','2027-06-09',0,'reading2','2026-08-26 15:40:40','2026-08-26 15:40:40');
/*!40000 ALTER TABLE `fnc_fiscal_year` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `hrms_biometric_device`
--

DROP TABLE IF EXISTS `hrms_biometric_device`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `hrms_biometric_device` (
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
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `hrms_biometric_device`
--

LOCK TABLES `hrms_biometric_device` WRITE;
/*!40000 ALTER TABLE `hrms_biometric_device` DISABLE KEYS */;
INSERT INTO `hrms_biometric_device` (`id`, `device_name`, `device_ip`, `port`, `serial_number`, `device_model`, `location_name`, `protocol`, `last_sync_time`, `is_active`, `created_at`, `updated_at`) VALUES (1,'WTP Central Plant Terminal','192.168.1.201',4370,'ZK-WTP-001','ZKTeco SilkBio-101TC','Main Water Treatment Plant Entrance','ZK_TCP',NULL,1,'2026-09-13 11:50:11','2026-09-13 11:50:11'),(2,'Reservoir Booster Station Terminal','192.168.1.202',4370,'ZK-BST-002','ZKTeco iClock-680','Reservoir Pump & Booster Station','ZK_TCP',NULL,1,'2026-09-13 11:50:11','2026-09-13 11:50:11'),(3,'Head Office Attendance Terminal','192.168.1.203',4370,'ZK-HQ-003','ZKTeco uFace-800','Head Office HR & Admin Building','ZK_TCP',NULL,1,'2026-09-13 11:50:11','2026-09-13 11:50:11'),(4,'Central Workshop & Stores Terminal','192.168.1.204',4370,'ZK-ST-004','Hikvision DS-K1T671','Central Mechanical Workshop & Warehouse','ZK_TCP',NULL,1,'2026-09-13 11:50:11','2026-09-13 11:50:11');
/*!40000 ALTER TABLE `hrms_biometric_device` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `hrms_departments`
--

DROP TABLE IF EXISTS `hrms_departments`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `hrms_departments` (
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
  KEY `fk_hrms_dept_parent` (`parent_department_id`),
  CONSTRAINT `fk_hrms_dept_parent` FOREIGN KEY (`parent_department_id`) REFERENCES `hrms_departments` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `hrms_departments`
--

LOCK TABLES `hrms_departments` WRITE;
/*!40000 ALTER TABLE `hrms_departments` DISABLE KEYS */;
INSERT INTO `hrms_departments` (`id`, `department_code`, `department_name`, `department_name_am`, `parent_department_id`, `manager_employee_id`, `cost_center_code`, `is_active`, `created_at`, `updated_at`) VALUES (1,'WTP-PROD','Water Production & Treatment Department','ßï¿ßïìßêâ ßêøßîúßê¬ßï½ßèô ßêøßêØßê¿ßë╗ ßêÿßêØßê¬ßï½',NULL,NULL,'CC-101',1,'2026-09-13 11:50:11','2026-09-13 11:50:11'),(2,'DIST-NET','Water Distribution & Sewerage Network Department','ßï¿ßïìßêâ ßêÑßê¡ßî¡ßëÁßèô ßêÿßêÁßêÿßê¡ ßêÿßêØßê¬ßï½',NULL,NULL,'CC-102',1,'2026-09-13 11:50:11','2026-09-13 11:50:11'),(3,'ELEC-MECH','Electromechanical & Maintenance Department','ßèñßêîßè¡ßëÁßê« ßêÿßè½ßèÆßè½ßêìßèô ßîÑßîêßèô ßêÿßêØßê¬ßï½',NULL,NULL,'CC-103',1,'2026-09-13 11:50:11','2026-09-13 11:50:11'),(4,'COMM-BILL','Commercial Billing & Customer Care Department','ßï¿ßï░ßèòßëáßè×ßë¢ ßèáßîêßêìßîìßêÄßëÁßèô ßëóßêèßèòßîì ßêÿßêØßê¬ßï½',NULL,NULL,'CC-104',1,'2026-09-13 11:50:11','2026-09-13 11:50:11'),(5,'ADM-FIN','Administration & Human Resources Department','ßèáßêÁßë░ßï│ßï░ßê¡ßèô ßï¿ßê░ßïì ßèâßï¡ßêì ßêÿßêØßê¬ßï½',NULL,1,'CC-105',1,'2026-09-13 11:50:11','2026-10-02 13:21:02'),(6,'FIN-ACCTS','Finance & Accounts Department','ßìïßï¡ßèôßèòßêÁßèô ßêéßê│ßëÑ ßêÿßêØßê¬ßï½',NULL,1,'CC-106',1,'2026-09-13 11:50:11','2026-10-05 07:41:02');
/*!40000 ALTER TABLE `hrms_departments` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `hrms_gibir_setting`
--

DROP TABLE IF EXISTS `hrms_gibir_setting`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `hrms_gibir_setting` (
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
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `hrms_gibir_setting`
--

LOCK TABLES `hrms_gibir_setting` WRITE;
/*!40000 ALTER TABLE `hrms_gibir_setting` DISABLE KEYS */;
INSERT INTO `hrms_gibir_setting` (`id`, `weight`, `upper_limit_birr`, `percent_birr`, `and_above`, `total_deductible_till_this`, `setting_description`, `is_deleted`) VALUES (1,1,600,0,0,0,'0 - 600 ETB (0% Exempt)',0),(2,2,1650,10,0,60,'601 - 1,650 ETB (10%)',0),(3,3,3200,15,0,142.5,'1,651 - 3,200 ETB (15%)',0),(4,4,5250,20,0,302.5,'3,201 - 5,250 ETB (20%)',0),(5,5,7800,25,0,565,'5,251 - 7,800 ETB (25%)',0),(6,6,10900,30,0,955,'7,801 - 10,900 ETB (30%)',0),(7,7,10900,35,1,1500,'> 10,900 ETB (35%)',0);
/*!40000 ALTER TABLE `hrms_gibir_setting` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `hrms_job_grades`
--

DROP TABLE IF EXISTS `hrms_job_grades`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `hrms_job_grades` (
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
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `hrms_job_grades`
--

LOCK TABLES `hrms_job_grades` WRITE;
/*!40000 ALTER TABLE `hrms_job_grades` DISABLE KEYS */;
INSERT INTO `hrms_job_grades` (`id`, `grade_code`, `grade_name`, `min_salary`, `max_salary`, `step_increment_rate`, `description`, `is_active`, `created_at`, `updated_at`) VALUES (1,'GR-I','Grade I (Junior Support / Casual)',4500,7500,300,'Junior field support, trench workers, security guards',1,'2026-09-13 11:50:11','2026-09-13 11:50:11'),(2,'GR-II','Grade II (Field Technician / Operator)',7500,12500,500,'Plumbers, water meter readers, junior pump operators',1,'2026-09-13 11:50:11','2026-09-13 11:50:11'),(3,'GR-III','Grade III (Senior Technician / Officer)',12500,20000,800,'WTP plant operators, electromechanical technicians, billing officers',1,'2026-09-13 11:50:11','2026-09-13 11:50:11'),(4,'GR-IV','Grade IV (Professional / Team Leader)',20000,32000,1200,'Water quality chemists, network engineers, HR officers, accountants',1,'2026-09-13 11:50:11','2026-09-13 11:50:11'),(5,'GR-V','Grade V (Department Head / Director)',32000,55000,2000,'Department directors, technical division heads',1,'2026-09-13 11:50:11','2026-09-13 11:50:11');
/*!40000 ALTER TABLE `hrms_job_grades` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `hrms_leave_types`
--

DROP TABLE IF EXISTS `hrms_leave_types`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `hrms_leave_types` (
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
) ENGINE=InnoDB AUTO_INCREMENT=9 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `hrms_leave_types`
--

LOCK TABLES `hrms_leave_types` WRITE;
/*!40000 ALTER TABLE `hrms_leave_types` DISABLE KEYS */;
INSERT INTO `hrms_leave_types` (`id`, `type_code`, `type_name`, `type_name_am`, `default_days`, `is_service_accrued`, `is_paid`, `requires_attachment`, `gender_restriction`, `is_active`) VALUES (1,'ANNUAL','Annual Leave','ßïôßêÿßë│ßïè ßï¿ßïòßê¿ßììßëÁ ßìêßëâßïÁ',16,1,1,0,'ALL',1),(2,'MATERNITY','Maternity Leave','ßï¿ßïêßêèßïÁ ßìêßëâßïÁ',120,0,1,1,'FEMALE',1),(3,'PATERNITY','Paternity Leave','ßï¿ßèáßëúßëÁßèÉßëÁ ßìêßëâßïÁ',3,0,1,1,'MALE',1),(4,'SICK','Sick Leave','ßï¿ßêòßè¡ßêØßèô ßìêßëâßïÁ',30,0,1,1,'ALL',1),(5,'BEREAVEMENT','Bereavement / Mourning Leave','ßï¿ßêÉßïÿßèò ßìêßëâßïÁ',3,0,1,0,'ALL',1),(6,'WEDDING','Wedding Leave','ßï¿ßîïßëÑßë╗ ßìêßëâßïÁ',3,0,1,1,'ALL',1),(7,'SPECIAL','Special Duty / Exam Leave','ßêìßï® ßìêßëâßïÁ',5,0,1,1,'ALL',1);
/*!40000 ALTER TABLE `hrms_leave_types` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `hrms_salary_configurations`
--

DROP TABLE IF EXISTS `hrms_salary_configurations`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `hrms_salary_configurations` (
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
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `hrms_salary_configurations`
--

LOCK TABLES `hrms_salary_configurations` WRITE;
/*!40000 ALTER TABLE `hrms_salary_configurations` DISABLE KEYS */;
INSERT INTO `hrms_salary_configurations` (`id`, `config_code`, `config_title`, `config_title_am`, `is_birr`, `is_percent`, `config_value`, `weight`, `is_taxed`, `is_deductible`, `is_additive`, `is_pension`, `is_leave_config`, `is_deleted`, `created_at`, `updated_at`) VALUES (1,'CFG_OT_DAY','Daytime Overtime 1.5x','ßï¿ßëÁßê¡ßìì ßê░ßïôßëÁ ßè¡ßììßï½ (ßëÇßèò 1.5x)',1,0,0,1,1,0,1,0,0,0,'2026-09-13 11:50:11','2026-09-13 11:50:11'),(2,'CFG_HOUSING','Housing Allowance','ßï¿ßëñßëÁ ßè¬ßê½ßï¡ ßèáßëáßêì',1,0,500,2,1,0,1,0,0,0,'2026-09-13 11:50:11','2026-09-13 11:50:11'),(3,'CFG_TRANSPORT','Transport Allowance','ßîáßëàßêïßêï ßï¿ßëÁßê½ßèòßêÁßìûßê¡ßëÁ ßèáßëáßêì',1,0,300,3,1,0,1,0,0,0,'2026-09-13 11:50:11','2026-09-13 11:50:11'),(4,'CFG_PENSION_EMP','Employee Pension 7%','ßï¿ßîíßê¿ßë│ ßêÿßïïßî« (ßêáßê½ßë░ßèø 7%)',0,1,7,4,0,1,0,1,0,0,'2026-09-13 11:50:11','2026-09-13 11:50:11'),(5,'CFG_PENSION_ORG','Employer Pension 11%','ßï¿ßîíßê¿ßë│ ßêÿßïïßî« (ßèáßê░ßê¬ 11%)',0,1,11,5,0,0,0,1,0,0,'2026-09-13 11:50:11','2026-09-13 11:50:11'),(6,'CFG_HAZARD','Hazard & Chemical Allowance','ßï¿ßè¡ßêÄßê¬ßèòßèô ßè¼ßêÜßè½ßêì ßèáßëáßêì',1,0,400,6,1,0,1,0,0,0,'2026-09-13 11:50:11','2026-09-13 11:50:11'),(7,'CFG_SHIFT_DIFF','Night Shift Differential Allowance','ßï¿ßêøßë│ ßìêßê¿ßëâ ßèáßëáßêì',1,0,250,7,1,0,1,0,0,0,'2026-09-13 11:50:11','2026-09-13 11:50:11'),(8,'CFG_EDIR','Staff Association / Edir Deduction','ßï¿ßèÑßïÁßê¡ßèô ßëÑßïÁßê¡ ßë░ßëÇßèôßê¢',1,0,100,8,0,1,0,0,0,0,'2026-09-13 11:50:11','2026-09-13 11:50:11');
/*!40000 ALTER TABLE `hrms_salary_configurations` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `hrms_shift_schedules`
--

DROP TABLE IF EXISTS `hrms_shift_schedules`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `hrms_shift_schedules` (
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
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `hrms_shift_schedules`
--

LOCK TABLES `hrms_shift_schedules` WRITE;
/*!40000 ALTER TABLE `hrms_shift_schedules` DISABLE KEYS */;
INSERT INTO `hrms_shift_schedules` (`id`, `shift_code`, `shift_name`, `start_time`, `end_time`, `is_night_shift`, `grace_period_minutes`, `total_hours`, `description`, `is_active`) VALUES (1,'SHIFT-MORN','Morning Shift (ßï¿ßîáßïïßëÁ ßìêßê¿ßëâ)','06:00:00','14:00:00',0,15,8,'Treatment plant and pump station morning shift',1),(2,'SHIFT-AFTN','Afternoon Shift (ßï¿ßè¿ßê░ßïôßëÁ ßìêßê¿ßëâ)','14:00:00','22:00:00',0,15,8,'Treatment plant and pump station afternoon shift',1),(3,'SHIFT-NIGHT','Night Shift (ßï¿ßêøßë│ ßìêßê¿ßëâ - 1.75x OT / Allowance)','22:00:00','06:00:00',1,15,8,'Continuous night operation with statutory night differential',1),(4,'SHIFT-GEN','General Office Hours (ßêÿßï░ßëáßèø ßï¿ßëóßê« ßê░ßïôßëÁ)','08:00:00','17:00:00',0,15,8,'Standard administration & billing office schedule with 1hr lunch',1),(5,'SHIFT-STNDBY','Emergency Standby (ßï¿ßèáßï░ßîï ßîèßï£ ßë░ßê¿ßèø)','17:00:00','08:00:00',1,30,15,'On-call emergency leak burst & main line repair crew',1);
/*!40000 ALTER TABLE `hrms_shift_schedules` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `inv_item_category`
--

DROP TABLE IF EXISTS `inv_item_category`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `inv_item_category` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `category_code` varchar(20) NOT NULL,
  `category_name` varchar(200) NOT NULL,
  `category_name_am` varchar(200) DEFAULT NULL,
  `description` varchar(500) DEFAULT NULL,
  `item_type` enum('STOCK','NON_STOCK','SERVICE') NOT NULL DEFAULT 'STOCK',
  `tracking_type` enum('NONE','BATCH','EXPIRY','SERIAL','MOTOR') NOT NULL DEFAULT 'NONE',
  `is_active` tinyint(1) NOT NULL DEFAULT 1,
  `deleted` varchar(20) NOT NULL DEFAULT 'No',
  `created_by` varchar(100) DEFAULT NULL,
  `created_at` datetime DEFAULT current_timestamp(),
  `updated_at` datetime DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `category_code` (`category_code`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_uca1400_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `inv_item_category`
--

LOCK TABLES `inv_item_category` WRITE;
/*!40000 ALTER TABLE `inv_item_category` DISABLE KEYS */;
INSERT INTO `inv_item_category` (`id`, `category_code`, `category_name`, `category_name_am`, `description`, `item_type`, `tracking_type`, `is_active`, `deleted`, `created_by`, `created_at`, `updated_at`) VALUES (1,'1122','Pipe andFiting2','ßëºßèòßëºßïêßë¢','','SERVICE','NONE',1,'No','system','2026-09-06 05:44:21','2026-09-07 06:49:08'),(2,'OFFICE','Office ','ßï¿ßëóßê«','','STOCK','NONE',1,'No','reading2','2026-10-01 14:49:05','2026-10-01 14:49:05');
/*!40000 ALTER TABLE `inv_item_category` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `inv_supplier`
--

DROP TABLE IF EXISTS `inv_supplier`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `inv_supplier` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `supplier_code` varchar(20) NOT NULL,
  `supplier_name` varchar(200) NOT NULL,
  `supplier_name_am` varchar(200) DEFAULT NULL,
  `tin` varchar(50) DEFAULT NULL,
  `phone` varchar(20) DEFAULT NULL,
  `email` varchar(100) DEFAULT NULL,
  `address` varchar(300) DEFAULT NULL,
  `city` varchar(100) DEFAULT NULL,
  `contact_person` varchar(100) DEFAULT NULL,
  `contact_phone` varchar(20) DEFAULT NULL,
  `bank_name` varchar(100) DEFAULT NULL,
  `bank_account_number` varchar(50) DEFAULT NULL,
  `is_active` tinyint(1) NOT NULL DEFAULT 1,
  `deleted` varchar(20) NOT NULL DEFAULT 'No',
  `created_by` varchar(100) DEFAULT NULL,
  `created_at` datetime DEFAULT current_timestamp(),
  `updated_at` datetime DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `supplier_code` (`supplier_code`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_uca1400_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `inv_supplier`
--

LOCK TABLES `inv_supplier` WRITE;
/*!40000 ALTER TABLE `inv_supplier` DISABLE KEYS */;
INSERT INTO `inv_supplier` (`id`, `supplier_code`, `supplier_name`, `supplier_name_am`, `tin`, `phone`, `email`, `address`, `city`, `contact_person`, `contact_phone`, `bank_name`, `bank_account_number`, `is_active`, `deleted`, `created_by`, `created_at`, `updated_at`) VALUES (1,'SUP1','abc Metere ','abc Metere  amh','00052154','0935981944','toaddisu@gmail.com','Bahir Dar , Amhara ,ET(1CDEx4)','Amhara, Bahir Dar, Bahir Dar','Addisu Zeleke Mesfin','0935981944','dshn','100002541',1,'No','reading2','2026-09-06 08:16:37','2026-09-06 08:16:37');
/*!40000 ALTER TABLE `inv_supplier` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `inv_unit_of_measure`
--

DROP TABLE IF EXISTS `inv_unit_of_measure`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `inv_unit_of_measure` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `unit_code` varchar(20) NOT NULL,
  `unit_name` varchar(100) NOT NULL,
  `unit_name_am` varchar(100) DEFAULT NULL,
  `is_active` tinyint(1) NOT NULL DEFAULT 1,
  `deleted` varchar(20) NOT NULL DEFAULT 'No',
  `created_by` varchar(100) DEFAULT NULL,
  `created_at` datetime DEFAULT current_timestamp(),
  `updated_at` datetime DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `unit_code` (`unit_code`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_uca1400_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `inv_unit_of_measure`
--

LOCK TABLES `inv_unit_of_measure` WRITE;
/*!40000 ALTER TABLE `inv_unit_of_measure` DISABLE KEYS */;
INSERT INTO `inv_unit_of_measure` (`id`, `unit_code`, `unit_name`, `unit_name_am`, `is_active`, `deleted`, `created_by`, `created_at`, `updated_at`) VALUES (1,' PCS','Pieces','ßëÑßïøßëÁ',1,'No','system','2026-09-06 05:35:48','2026-09-06 05:38:52'),(2,'M','Meter','ßê£ßëÁßê¡',1,'No','system','2026-09-06 05:39:11','2026-09-06 05:39:11'),(3,'2312','liter','lig',1,'No','system','2026-09-06 06:47:14','2026-09-06 06:47:21');
/*!40000 ALTER TABLE `inv_unit_of_measure` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `sms_setting`
--

DROP TABLE IF EXISTS `sms_setting`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `sms_setting` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `city_id` int(11) DEFAULT NULL,
  `city_name` varchar(150) NOT NULL,
  `gateway_url` varchar(500) NOT NULL DEFAULT 'https://smsethiopia.et/api/sms/send',
  `api_key` varchar(500) NOT NULL,
  `sender_id` varchar(100) DEFAULT 'MarDa ERP',
  `is_active` tinyint(1) NOT NULL DEFAULT 1,
  `description` varchar(255) DEFAULT NULL,
  `created_date` datetime DEFAULT current_timestamp(),
  `modified_date` datetime DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `protocol` varchar(30) NOT NULL DEFAULT 'HTTP_REST',
  `smpp_host` varchar(255) DEFAULT NULL,
  `smpp_port` int(11) DEFAULT 5019,
  `smpp_system_id` varchar(100) DEFAULT NULL,
  `smpp_password` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_sms_setting_city` (`city_id`),
  KEY `idx_sms_setting_active` (`is_active`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `sms_setting`
--

LOCK TABLES `sms_setting` WRITE;
/*!40000 ALTER TABLE `sms_setting` DISABLE KEYS */;
INSERT INTO `sms_setting` (`id`, `city_id`, `city_name`, `gateway_url`, `api_key`, `sender_id`, `is_active`, `description`, `created_date`, `modified_date`, `protocol`, `smpp_host`, `smpp_port`, `smpp_system_id`, `smpp_password`) VALUES (2,1,'Fenidika','https://smsethiopia.et/api/sms/send','fsfsdfdsfsdfsdfsf','Fenidika',1,'SMS Gateway for Fenidika','2026-09-23 10:19:01','2026-09-23 10:19:01','HTTP_REST','10.204.181.70',5019,'8581','Wtw@1921');
/*!40000 ALTER TABLE `sms_setting` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `user_account_role`
--

DROP TABLE IF EXISTS `user_account_role`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `user_account_role` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `user_account_id` int(11) NOT NULL,
  `user_role_id` int(11) NOT NULL,
  `branch_id` int(11) DEFAULT NULL,
  `assigned_by` varchar(100) DEFAULT NULL,
  `assigned_at` datetime DEFAULT current_timestamp(),
  `is_active` tinyint(1) DEFAULT 1,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_user_role_branch` (`user_account_id`,`user_role_id`,`branch_id`),
  KEY `user_role_id` (`user_role_id`)
) ENGINE=MyISAM AUTO_INCREMENT=19 DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `user_account_role`
--

LOCK TABLES `user_account_role` WRITE;
/*!40000 ALTER TABLE `user_account_role` DISABLE KEYS */;
INSERT INTO `user_account_role` (`id`, `user_account_id`, `user_role_id`, `branch_id`, `assigned_by`, `assigned_at`, `is_active`) VALUES (1,111,7,NULL,'reading2','2026-09-06 15:33:48',0),(2,111,8,NULL,'reading2','2026-09-06 15:34:06',0),(3,111,15,NULL,'reading2','2026-09-06 15:43:18',0),(4,204,51,NULL,'admin2','2026-09-06 17:09:02',0),(5,1,1,NULL,'admin2','2026-09-06 17:12:00',1),(6,111,30,NULL,'admin2','2026-09-06 17:12:39',1),(7,1,30,NULL,'admin2','2026-09-06 18:41:27',1),(8,204,30,NULL,'admin2','2026-09-07 04:23:27',0),(9,204,30,NULL,'admin2','2026-09-07 04:34:13',0),(10,204,1,NULL,'admin2','2026-09-07 04:37:08',0),(11,204,51,NULL,'mstore','2026-09-07 04:55:43',1),(12,204,30,NULL,'mstore','2026-09-07 05:47:20',0),(13,204,1,NULL,'mstore','2026-09-07 05:50:26',0),(14,204,30,NULL,'mstore','2026-09-07 06:14:40',0),(15,204,30,NULL,'mstore','2026-09-07 06:19:07',0),(16,204,49,NULL,'admin2','2026-09-07 06:28:39',0),(17,205,52,NULL,'admin2','2026-09-07 06:35:19',1),(18,209,56,NULL,'reading2','2026-09-08 14:31:39',1);
/*!40000 ALTER TABLE `user_account_role` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `wf_workflow_template`
--

DROP TABLE IF EXISTS `wf_workflow_template`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `wf_workflow_template` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `template_code` varchar(50) NOT NULL,
  `template_name` varchar(200) NOT NULL,
  `document_type` varchar(50) NOT NULL,
  `description` varchar(500) DEFAULT NULL,
  `is_active` tinyint(1) DEFAULT 1,
  `created_by` varchar(100) DEFAULT NULL,
  `created_at` datetime DEFAULT current_timestamp(),
  `updated_at` datetime DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `template_code` (`template_code`)
) ENGINE=MyISAM AUTO_INCREMENT=6 DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `wf_workflow_template`
--

LOCK TABLES `wf_workflow_template` WRITE;
/*!40000 ALTER TABLE `wf_workflow_template` DISABLE KEYS */;
INSERT INTO `wf_workflow_template` (`id`, `template_code`, `template_name`, `document_type`, `description`, `is_active`, `created_by`, `created_at`, `updated_at`) VALUES (1,'PR_APPROVAL','Purchase Requisition Approval','PURCHASE_REQUISITION','Standard 3-step approval for purchase requisitions',1,'system','2026-09-06 17:03:03','2026-09-06 17:03:03'),(2,'PO_APPROVAL','Purchase Order Approval','PURCHASE_ORDER','Finance and GM approval for purchase orders',1,'system','2026-09-06 17:03:03','2026-09-06 17:03:03'),(3,'TRANSFER_APPROVAL','Stock Transfer Approval','STOCK_TRANSFER','Manager approval for inter-store transfers',1,'system','2026-09-06 17:03:03','2026-09-06 17:03:03'),(4,'ADJUSTMENT_APPROVAL','Stock Adjustment Approval','STOCK_ADJUSTMENT','Manager and finance approval for adjustments',1,'system','2026-09-06 17:03:03','2026-09-06 17:03:03'),(5,'ISSUE_APPROVAL','Issue Voucher Approval','ISSUE_VOUCHER','Manager approval for material issues',1,'system','2026-09-06 17:03:03','2026-09-06 17:03:03');
/*!40000 ALTER TABLE `wf_workflow_template` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `fnc_account`
--

DROP TABLE IF EXISTS `fnc_account`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `fnc_account` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `account_code` varchar(20) NOT NULL,
  `account_name` varchar(200) NOT NULL,
  `account_name_am` varchar(200) DEFAULT NULL,
  `account_type` enum('ASSET','LIABILITY','EQUITY','REVENUE','EXPENSE') NOT NULL,
  `parent_account_id` int(11) DEFAULT NULL,
  `is_active` tinyint(1) DEFAULT 1,
  `is_header` tinyint(1) DEFAULT 0,
  `normal_balance` enum('DEBIT','CREDIT') NOT NULL,
  `description` varchar(500) DEFAULT NULL,
  `created_by` varchar(100) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `account_code` (`account_code`),
  KEY `parent_account_id` (`parent_account_id`),
  CONSTRAINT `fnc_account_ibfk_1` FOREIGN KEY (`parent_account_id`) REFERENCES `fnc_account` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=81 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_uca1400_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `fnc_account`
--

LOCK TABLES `fnc_account` WRITE;
/*!40000 ALTER TABLE `fnc_account` DISABLE KEYS */;
INSERT INTO `fnc_account` (`id`, `account_code`, `account_name`, `account_name_am`, `account_type`, `parent_account_id`, `is_active`, `is_header`, `normal_balance`, `description`, `created_by`, `created_at`, `updated_at`) VALUES (1,'1200-0000','Accounts Receivable','ßë░ßê░ßëÑßê│ßëó ßêéßê│ßëÑ','ASSET',NULL,1,1,'DEBIT','Parent Header ÔÇö Customer Accounts Receivable Control','system','2026-08-25 21:58:53','2026-08-25 21:58:53'),(2,'1222-0006','Current Month Water consumption','ßï¿ßïÜßêà ßïêßê¡ ßï¿ßïìßêâ ßììßîåßë│ ßë░ßëÇßëúßï¡','ASSET',1,1,0,'DEBIT','Receivable for current month water consumption ÔÇö yezihWerFjotaKfya','system','2026-08-25 21:58:54','2026-08-25 21:58:54'),(3,'1222-0007','Meter Rent','ßëåßîúßê¬ ßè¬ßê½ßï¡ ßë░ßëÇßëúßï¡','ASSET',1,1,0,'DEBIT','Receivable for meter rent ÔÇö kotariKiray','system','2026-08-25 21:58:54','2026-08-25 21:58:54'),(4,'1222-0008','Bill Additional Payment','ßë░ßî¿ßêøßê¬ ßè¡ßììßï½ ßë░ßëÇßëúßï¡','ASSET',1,1,0,'DEBIT','Receivable for bill additional payment ÔÇö techemariKfya','system','2026-08-25 21:58:54','2026-08-25 21:58:54'),(5,'1222-0009','Arrears Water Consumption','ßïìßïØßìì ßï¿ßïìßêâ ßììßîåßë│ ßë░ßëÇßëúßï¡','ASSET',1,1,0,'DEBIT','Receivable for arrears water consumption ÔÇö wuzifFjotaKfya','system','2026-08-25 21:58:54','2026-08-25 21:58:54'),(6,'1222-0010','Arrears Meter rent','ßïìßïØßìì ßëåßîúßê¬ ßè¬ßê½ßï¡ ßë░ßëÇßëúßï¡','ASSET',1,1,0,'DEBIT','Receivable for arrears meter rent ÔÇö wuzifKotariKiray','system','2026-08-25 21:58:54','2026-08-25 21:58:54'),(7,'1222-0011','Arrears Bill Additional Payment','ßïìßïØßìì ßë░ßî¿ßêøßê¬ ßè¡ßììßï½ ßë░ßëÇßëúßï¡','ASSET',1,1,0,'DEBIT','Receivable for arrears bill additional payment ÔÇö wuzifTechemariKfya','system','2026-08-25 21:58:55','2026-08-25 21:58:55'),(8,'1222-0012','Bill Penalty','ßëàßîúßëÁ ßë░ßëÇßëúßï¡','ASSET',1,1,0,'DEBIT','Receivable for penalty charges ÔÇö kitat','system','2026-08-25 21:58:55','2026-08-25 21:58:55'),(9,'1222-0013','Bill Old system Arrears','ßï¿ßë░ßêïßêêßìê(ßèÉßëúßê¡) ßïìßïØßìì ßë░ßëÇßëúßï¡','ASSET',1,1,0,'DEBIT','Receivable for old system carried forward arrears ÔÇö calculated','system','2026-08-25 21:58:55','2026-08-25 21:58:55'),(10,'1222-0014','Bill Service Charge','ßï¿ßèáßîêßêìßîìßêÄßëÁ ßè¡ßììßï½ ßë░ßëÇßëúßï¡','ASSET',1,1,0,'DEBIT','Receivable for service charge ÔÇö billing_additional_payment_1_value','system','2026-08-25 21:58:55','2026-08-25 21:58:55'),(11,'1222-0015','Dry Wast','ßï¿ßïÜßêà ßïêßê¡ ßï░ßê¿ßëà ßëåßê╗ßê╗ ßë░ßëÇßëúßï¡','ASSET',1,1,0,'DEBIT','Receivable for dry waste charge ÔÇö additionalHisab','system','2026-08-25 21:58:55','2026-08-25 21:58:55'),(12,'1222-0016','School Feeding','ßï¿ßëÁßêØßêàßê¡ßëÁ ßëñßëÁ ßêØßîêßëú ßë░ßëÇßëúßï¡','ASSET',1,1,0,'DEBIT','Receivable for school feeding charge ÔÇö billing_additional_payment_2_value','system','2026-08-25 21:58:55','2026-08-25 21:58:55'),(13,'1222-0017','Arrears Bill Service Charge','ßïìßïØßìì ßï¿ßèáßîêßêìßîìßêÄßëÁ ßè¡ßììßï½ ßë░ßëÇßëúßï¡','ASSET',1,1,0,'DEBIT','Receivable for arrears service charge ÔÇö billing_additional_payment_1_wuzif','system','2026-08-25 21:58:55','2026-08-25 21:58:55'),(14,'1222-0018','Arrears Dry Wast','ßïìßïØßìì ßï░ßê¿ßëà ßëåßê╗ßê╗ ßë░ßëÇßëúßï¡','ASSET',1,1,0,'DEBIT','Receivable for arrears dry waste charge ÔÇö wuzifDerekKoshasha','system','2026-08-25 21:58:55','2026-08-25 21:58:55'),(15,'1222-0019','Arrears School Feeding','ßïìßïØßìì ßï¿ßëÁßêØßêàßê¡ßëÁ ßëñßëÁ ßêØßîêßëú ßë░ßëÇßëúßï¡','ASSET',1,1,0,'DEBIT','Receivable for arrears school feeding charge ÔÇö billing_additional_payment_2_wuzif','system','2026-08-25 21:58:56','2026-08-25 21:58:56'),(16,'4001-0000','Water Sales Revenue','ßï¿ßïìßêâ ßê¢ßï½ßî¡ ßîêßëó','REVENUE',NULL,1,1,'CREDIT','Parent Header ÔÇö Water Sales Revenue Control','system','2026-08-25 21:58:56','2026-08-25 21:58:56'),(17,'4001-0005','Current Month Water consumption','ßï¿ßïÜßêà ßïêßê¡ ßï¿ßïìßêâ ßììßîåßë│ ßîêßëó','REVENUE',16,1,0,'CREDIT','Revenue for current month water consumption ÔÇö yezihWerFjotaKfya','system','2026-08-25 21:58:56','2026-08-25 21:58:56'),(18,'4001-0006','Meter Rent','ßëåßîúßê¬ ßè¬ßê½ßï¡ ßîêßëó','REVENUE',16,1,0,'CREDIT','Monthly meter rental fees ÔÇö kotariKiray','system','2026-08-25 21:58:56','2026-08-25 21:58:56'),(19,'4001-0007','Bill Additional Payment','ßë░ßî¿ßêøßê¬ ßè¡ßììßï½ ßîêßëó','REVENUE',16,1,0,'CREDIT','Revenue for bill additional payments ÔÇö techemariKfya','system','2026-08-25 21:58:56','2026-08-25 21:58:56'),(20,'4001-0008','Arrears Water Consumption','ßïìßïØßìì ßï¿ßïìßêâ ßììßîåßë│ ßîêßëó','REVENUE',16,1,0,'CREDIT','Revenue for prior arrears water consumption ÔÇö wuzifFjotaKfya','system','2026-08-25 21:58:56','2026-08-25 21:58:56'),(21,'4001-0009','Arrears Meter rent','ßïìßïØßìì ßëåßîúßê¬ ßè¬ßê½ßï¡ ßîêßëó','REVENUE',16,1,0,'CREDIT','Revenue for prior arrears meter rent ÔÇö wuzifKotariKiray','system','2026-08-25 21:58:56','2026-08-25 21:58:56'),(22,'4001-0010','Arrears Bill Additional Payment','ßïìßïØßìì ßë░ßî¿ßêøßê¬ ßè¡ßììßï½ ßîêßëó','REVENUE',16,1,0,'CREDIT','Revenue for prior arrears bill additional payment ÔÇö wuzifTechemariKfya','system','2026-08-25 21:58:56','2026-08-25 21:58:56'),(23,'4001-0011','Bill Penalty','ßëàßîúßëÁ ßîêßëó','REVENUE',16,1,0,'CREDIT','Revenue for late payment penalties ÔÇö kitat','system','2026-08-25 21:58:56','2026-08-25 21:58:56'),(24,'4001-0012','Bill Old system Arrears','ßï¿ßë░ßêïßêêßìê(ßèÉßëúßê¡) ßïìßïØßìì ßîêßëó','REVENUE',16,1,0,'CREDIT','Revenue recognized for legacy/old system arrears carried forward','system','2026-08-25 21:58:56','2026-08-25 21:58:56'),(25,'4001-0013','Bill Service Charge','ßï¿ßèáßîêßêìßîìßêÄßëÁ ßè¡ßììßï½ ßîêßëó','REVENUE',16,1,0,'CREDIT','Revenue for billing service charges ÔÇö billing_additional_payment_1_value','system','2026-08-25 21:58:56','2026-08-25 21:58:56'),(26,'2005-0000','Other Gov\'t Tax Payable','ßêîßêÄßë¢ ßï¿ßêÿßèòßîìßêÁßëÁ ßë│ßè¡ßêÁ ßë░ßè¿ßìïßï¡','LIABILITY',NULL,1,1,'CREDIT','Parent Header ÔÇö Other Government Tax & Surcharge Payables Control','system','2026-08-25 21:58:57','2026-08-25 21:58:57'),(27,'2005-0004','Dry Wast','ßï¿ßïÜßêà ßïêßê¡ ßï░ßê¿ßëà ßëåßê╗ßê╗ ßë░ßè¿ßìïßï¡','LIABILITY',26,1,0,'CREDIT','Payable to municipality/waste company for dry waste ÔÇö additionalHisab','system','2026-08-25 21:58:57','2026-08-25 21:58:57'),(28,'2005-0005','School Feeding','ßï¿ßëÁßêØßêàßê¡ßëÁ ßëñßëÁ ßêØßîêßëú ßë░ßè¿ßìïßï¡','LIABILITY',26,1,0,'CREDIT','Payable for school feeding program ÔÇö billing_additional_payment_2_value','system','2026-08-25 21:58:57','2026-08-25 21:58:57'),(29,'2005-0006','Arrears Bill Service Charge','ßïìßïØßìì ßï¿ßèáßîêßêìßîìßêÄßëÁ ßè¡ßììßï½ ßë░ßè¿ßìïßï¡','LIABILITY',26,1,0,'CREDIT','Payable for arrears service charges ÔÇö billing_additional_payment_1_wuzif','system','2026-08-25 21:58:57','2026-08-25 21:58:57'),(30,'2005-0007','Arrears Dry Wast','ßïìßïØßìì ßï░ßê¿ßëà ßëåßê╗ßê╗ ßë░ßè¿ßìïßï¡','LIABILITY',26,1,0,'CREDIT','Payable to municipality/waste company for arrears dry waste ÔÇö wuzifDerekKoshasha','system','2026-08-25 21:58:57','2026-08-25 21:58:57'),(31,'2005-0008','Arrears School Feeding','ßïìßïØßìì ßï¿ßëÁßêØßêàßê¡ßëÁ ßëñßëÁ ßêØßîêßëú ßë░ßè¿ßìïßï¡','LIABILITY',26,1,0,'CREDIT','Payable for arrears school feeding program ÔÇö billing_additional_payment_2_wuzif','system','2026-08-25 21:58:57','2026-08-25 21:58:57'),(32,'1100-0000','Cash and Cash Equivalents','ßîÑßê¼ ßîêßèòßïÿßëÑ ßèÑßèô ßï¿ßëúßèòßè¡ ßêéßê│ßëªßë¢','ASSET',NULL,1,1,'DEBIT','Parent Header ÔÇö Cash and Cash Equivalents','system','2026-08-26 18:12:14','2026-08-26 18:12:14'),(33,'1111-0000','Cash on Hand','ßëáßèÑßîà ßï½ßêê ßîÑßê¼ ßîêßèòßïÿßëÑ','ASSET',32,1,1,'DEBIT','Cash on Hand Control Header','system','2026-08-26 18:12:14','2026-08-26 18:12:14'),(34,'1113-0000','Cash at Bank','ßëáßëúßèòßè¡ ßï½ßêê ßîêßèòßïÿßëÑ','ASSET',32,1,1,'DEBIT','Cash at Bank Control Header','system','2026-08-26 18:12:15','2026-08-26 18:12:15'),(35,'1111-0001','Office Cash Account','ßï¿ßëóßê« ßîÑßê¼ ßîêßèòßïÿßëÑ','ASSET',33,1,0,'DEBIT','Front office cash collections ÔÇö OFFICE_CASH','system','2026-08-26 18:12:15','2026-08-26 18:12:15'),(36,'1112-0001','Prepaid Customer Deposit Account','ßï¿ßï░ßèòßëáßè×ßë¢ ßëàßïÁßêÿ ßè¡ßììßï½ ßë░ßëÇßêøßî¡','ASSET',32,1,0,'DEBIT','Customer prepaid/credit balances ÔÇö PREPAID_ACCOUNT','system','2026-08-26 18:12:15','2026-08-26 18:12:15'),(37,'1113-0001','Abay Bank','ßèáßëúßï¡ ßëúßèòßè¡','ASSET',34,1,0,'DEBIT','Abay Bank Collection Account','system','2026-08-26 18:12:15','2026-08-26 18:12:15'),(38,'1113-0002','Commercial Bank of Ethiopia (CBE)','ßï¿ßèóßëÁßï«ßîÁßï½ ßèòßîìßïÁ ßëúßèòßè¡','ASSET',34,1,0,'DEBIT','CBE Collection Account','system','2026-08-26 18:12:15','2026-08-26 18:12:15'),(39,'1113-0003','Telebirr','ßë┤ßêîßëÑßê¡','ASSET',34,1,0,'DEBIT','Telebirr Payment Account','system','2026-08-26 18:12:15','2026-08-26 18:12:15'),(40,'1113-0004','Bank of Abyssinia','ßèáßëóßê▓ßèÆßï½ ßëúßèòßè¡','ASSET',34,1,0,'DEBIT','Bank of Abyssinia Collection Account','system','2026-08-26 18:12:15','2026-08-26 18:12:15'),(41,'1113-0005','Dashen Bank','ßï│ßê¢ßèò ßëúßèòßè¡','ASSET',34,1,0,'DEBIT','Dashen Bank Collection Account','system','2026-08-26 18:12:15','2026-08-26 18:12:15'),(42,'1113-0006','Awash Bank','ßèáßïïßê¢ ßëúßèòßè¡','ASSET',34,1,0,'DEBIT','Awash Bank Collection Account','system','2026-08-26 18:12:15','2026-08-26 18:12:15'),(43,'1113-0008','Nib International Bank','ßèòßëÑ ßëúßèòßè¡','ASSET',34,1,0,'DEBIT','Nib Bank Collection Account','system','2026-08-26 18:12:15','2026-08-26 18:12:15'),(44,'1113-0009','Cooperative Bank of Oromia','ßï¿ßèªßê«ßêÜßï½ ßêàßëÑßê¿ßëÁ ßêÁßê½ ßëúßèòßè¡','ASSET',34,1,0,'DEBIT','Coop Bank Collection Account','system','2026-08-26 18:12:15','2026-08-26 18:12:15'),(45,'1113-0010','Hibret Bank','ßèàßëÑßê¿ßëÁ ßëúßèòßè¡','ASSET',34,1,0,'DEBIT','Hibret Bank Collection Account','system','2026-08-26 18:12:15','2026-08-26 18:12:15'),(46,'1113-0011','Berhan Bank','ßëÑßê¡ßêâßèò ßëúßèòßè¡','ASSET',34,1,0,'DEBIT','Berhan Bank Collection Account','system','2026-08-26 18:12:15','2026-08-26 18:12:15'),(47,'1113-0012','Zemen Bank','ßïÿßêÿßèò ßëúßèòßè¡','ASSET',34,1,0,'DEBIT','Zemen Bank Collection Account','system','2026-08-26 18:12:15','2026-08-26 18:12:15'),(48,'1113-0013','Bunna International Bank','ßëíßèô ßëúßèòßè¡','ASSET',34,1,0,'DEBIT','Bunna Bank Collection Account','system','2026-08-26 18:12:15','2026-08-26 18:12:15'),(49,'1113-0015','Lion International Bank','ßèáßèòßëáßê│ ßëúßèòßè¡','ASSET',34,1,0,'DEBIT','Lion Bank Collection Account','system','2026-08-26 18:12:15','2026-08-26 18:12:15'),(50,'1113-0016','Enat Bank','ßèÑßèôßëÁ ßëúßèòßè¡','ASSET',34,1,0,'DEBIT','Enat Bank Collection Account','system','2026-08-26 18:12:15','2026-08-26 18:12:15'),(51,'1113-0017','Global Bank Ethiopia','ßîìßêÄßëúßêì ßëúßèòßè¡ ßèóßëÁßï«ßîÁßï½','ASSET',34,1,0,'DEBIT','Global Bank Collection Account','system','2026-08-26 18:12:15','2026-08-26 18:12:15'),(52,'1113-0018','Amhara Bank','ßèáßêøßê½ ßëúßèòßè¡','ASSET',34,1,0,'DEBIT','Amhara Bank Collection Account','system','2026-08-26 18:12:15','2026-08-26 18:12:15'),(53,'1113-0019','Gadaa Bank','ßîêßï│ ßëúßèòßè¡','ASSET',34,1,0,'DEBIT','Gadaa Bank Collection Account','system','2026-08-26 18:12:15','2026-08-26 18:12:15'),(54,'1113-0020','Hijra Bank','ßêéßîàßê½ ßëúßèòßè¡','ASSET',34,1,0,'DEBIT','Hijra Bank Collection Account','system','2026-08-26 18:12:15','2026-08-26 18:12:15'),(55,'1113-0021','ZamZam Bank','ßïÿßêØßïÿßêØ ßëúßèòßè¡','ASSET',34,1,0,'DEBIT','ZamZam Bank Collection Account','system','2026-08-26 18:12:15','2026-08-26 18:12:15'),(56,'1113-0022','Sinqee Bank','ßê▓ßèòßëä ßëúßèòßè¡','ASSET',34,1,0,'DEBIT','Sinqee Bank Collection Account','system','2026-08-26 18:12:15','2026-08-26 18:12:15'),(57,'1113-0023','Tsedey Bank','ßìÇßï░ßï¡ ßëúßèòßè¡','ASSET',34,1,0,'DEBIT','Tsedey Bank Collection Account','system','2026-08-26 18:12:15','2026-08-26 18:12:15'),(58,'1113-0024','CBE Birr','ßï¿ßê▓ßëóßèó ßëÑßê¡','ASSET',34,1,0,'DEBIT','CBE Birr Mobile Wallet Account','system','2026-08-26 18:12:16','2026-08-26 18:12:16'),(59,'1113-0025','Unicash / Derash Payment','ßï®ßèÆßè½ßê¢ / ßï░ßê½ßê¢ ßè¡ßììßï½','ASSET',34,1,0,'DEBIT','Unicash/Derash Payment Gateway Account','system','2026-08-26 18:12:16','2026-08-26 18:12:16'),(60,'1113-0026','Marda Arif Payment','ßêøßê¡ßï│ ßèáßê¬ßìì ßè¡ßììßï½','ASSET',34,1,0,'DEBIT','Marda Arif Payment Account','system','2026-08-26 18:12:16','2026-08-26 18:12:16'),(61,'1300-0001','Inventory Asset','ßï¿ßïòßëâ ßèòßëÑßê¿ßëÁ ßêéßê│ßëÑ','ASSET',NULL,1,0,'DEBIT','General inventory asset account for stored materials','system','2026-09-12 19:16:11','2026-09-12 19:16:11'),(62,'2100-0001','Accounts Payable - Inventory / GR-IR','ßï¿ßêÜßè¿ßìêßêì ßèÑßï│ (ßï¿ßïòßëâ ßîìßïó)','LIABILITY',NULL,1,0,'CREDIT','Accounts payable for goods received from suppliers','system','2026-09-12 19:16:11','2026-09-12 19:16:11'),(63,'5100-0001','Cost of Goods Sold (COGS)','ßï¿ßë░ßê©ßîí ßïòßëâßïÄßë¢ ßïêßî¬','EXPENSE',NULL,1,0,'DEBIT','Cost of materials sold or issued for new connections/services','system','2026-09-12 19:16:11','2026-09-12 19:16:11'),(64,'6200-0001','Operating Supplies Expense','ßï¿ßêÁßê½ ßêøßêÁßè¼ßîâ ßïòßëâßïÄßë¢ ßïêßî¬','EXPENSE',NULL,1,0,'DEBIT','Internal supplies and maintenance materials consumed','system','2026-09-12 19:16:11','2026-09-12 19:16:11'),(65,'6300-0001','Inventory Adjustment Gain','ßï¿ßïòßëâ ßêøßêÁßë░ßè½ßè¿ßï½ ßëÁßê¡ßìì','REVENUE',NULL,1,0,'CREDIT','Physical audit count surplus gain','system','2026-09-12 19:16:11','2026-09-12 19:16:11'),(66,'6300-0002','Inventory Loss / Shrinkage','ßï¿ßïòßëâ ßëÑßêìßê¢ßëÁ/ßè¬ßê│ßê½ ßïêßî¬','EXPENSE',NULL,1,0,'DEBIT','Physical audit count shortage or damage write-off','system','2026-09-12 19:16:11','2026-09-12 19:16:11'),(67,'1301-0001','Inventory In-Transit','ßë░ßëÇßëúßï¡ ßêÿßîïßïÿßèò / ßïØßïìßïìßê¡','ASSET',NULL,1,0,'DEBIT','Inter-store transfer transit account','system','2026-09-12 19:16:11','2026-09-12 19:16:11'),(68,'5100-0000','Salaries & Employee Benefits','ßï¿ßï░ßêÿßïêßïØßèô ßêáßê½ßë░ßè×ßë¢ ßîÑßëàßêøßîÑßëàßêØ ßïêßî¬','EXPENSE',NULL,1,1,'DEBIT','Parent Header ÔÇö Payroll and Employee Benefits Control','system','2026-09-13 08:38:16','2026-09-13 08:38:16'),(69,'5110-0001','Basic Salaries Expense','ßêÿßê░ßê¿ßë│ßïè ßï░ßêÿßïêßïØ ßïêßî¬','EXPENSE',68,1,0,'DEBIT','Basic salaries expense for permanent & contract staff','system','2026-09-13 08:38:16','2026-09-13 08:38:16'),(70,'5110-0002','Overtime Pay Expense','ßï¿ßëÁßê¡ßìì ßê░ßïôßëÁ ßè¡ßììßï½ ßïêßî¬','EXPENSE',68,1,0,'DEBIT','Overtime compensation under Labour Proclamation 1156/2019','system','2026-09-13 08:38:16','2026-09-13 08:38:16'),(71,'5110-0003','Housing Allowances Expense','ßï¿ßëñßëÁ ßè¬ßê½ßï¡ ßèáßëáßêì ßïêßî¬','EXPENSE',68,1,0,'DEBIT','Housing and living cost allowances expense','system','2026-09-13 08:38:16','2026-09-13 08:38:16'),(72,'5110-0004','Transport Allowances Expense','ßï¿ßëÁßê½ßèòßêÁßìûßê¡ßëÁ ßèáßëáßêì ßïêßî¬','EXPENSE',68,1,0,'DEBIT','Transport and commute allowances expense','system','2026-09-13 08:38:16','2026-09-13 08:38:16'),(73,'5110-0005','Hazard & Chemical Allowances Expense','ßï¿ßè¡ßêÄßê¬ßèòßèô ßè¼ßêÜßè½ßêì ßèáßëáßêì ßïêßî¬','EXPENSE',68,1,0,'DEBIT','Water treatment hazardous chemical handling & shift allowances','system','2026-09-13 08:38:16','2026-09-13 08:38:16'),(74,'5110-0006','Employer Pension Contribution 11%','ßï¿ßèáßê░ßê¬ßïì ßîíßê¿ßë│ ßêÿßïïßî« 11% ßïêßî¬','EXPENSE',68,1,0,'DEBIT','Statutory 11% employer pension contribution expense','system','2026-09-13 08:38:17','2026-09-13 08:38:17'),(75,'2100-0000','Payroll Withholdings & Accruals','ßï¿ßï░ßêÿßïêßïØ ßë░ßëÇßèôßê¥ßë¢ßèô ßèÑßï│ßïÄßë¢','LIABILITY',NULL,1,1,'CREDIT','Parent Header ÔÇö Statutory withholdings and payroll liabilities','system','2026-09-13 08:38:17','2026-09-13 08:38:17'),(76,'2110-0001','Employment Income Tax Payable','ßï¿ßêÑßê½ ßîìßëÑßê¡ ßë░ßè¿ßìïßï¡','LIABILITY',75,1,0,'CREDIT','Employment income tax payable to Ministry of Revenues (Schedule A)','system','2026-09-13 08:38:17','2026-09-13 08:38:17'),(77,'2110-0002','Pension Contribution Payable','ßï¿ßîíßê¿ßë│ ßêÿßïïßî« ßë░ßè¿ßìïßï¡ (18%)','LIABILITY',75,1,0,'CREDIT','Total statutory pension payable to POESSA / PSSSA (18%)','system','2026-09-13 08:38:17','2026-09-13 08:38:17'),(78,'2110-0003','Staff Association & Edir Payable','ßï¿ßèÑßïÁßê¡ßèô ßëÑßïÁßê¡ ßë░ßëÇßèôßê¢ ßë░ßè¿ßìïßï¡','LIABILITY',75,1,0,'CREDIT','Voluntary payroll deductions (Edir, Credit Association, Union)','system','2026-09-13 08:38:17','2026-09-13 08:38:17'),(79,'2110-0004','Net Salaries Payable ÔÇö CBE','ßï¿ßë░ßîúßê½ ßï░ßêÿßïêßïØ ßë░ßè¿ßìïßï¡ (ßèòßîìßïÁ ßëúßèòßè¡)','LIABILITY',75,1,0,'CREDIT','Net salary payable to staff via Commercial Bank of Ethiopia','system','2026-09-13 08:38:17','2026-09-13 08:38:17'),(80,'2110-0005','Net Salaries Payable ÔÇö Abay Bank','ßï¿ßë░ßîúßê½ ßï░ßêÿßïêßïØ ßë░ßè¿ßìïßï¡ (ßèáßëúßï¡ ßëúßèòßè¡)','LIABILITY',75,1,0,'CREDIT','Net salary & special allowances payable via Abay Bank','system','2026-09-13 08:38:17','2026-09-13 08:38:17');
/*!40000 ALTER TABLE `fnc_account` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `hrms_positions`
--

DROP TABLE IF EXISTS `hrms_positions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `hrms_positions` (
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
  KEY `fk_hrms_pos_grade` (`job_grade_id`),
  CONSTRAINT `fk_hrms_pos_dept` FOREIGN KEY (`department_id`) REFERENCES `hrms_departments` (`id`),
  CONSTRAINT `fk_hrms_pos_grade` FOREIGN KEY (`job_grade_id`) REFERENCES `hrms_job_grades` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=11 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `hrms_positions`
--

LOCK TABLES `hrms_positions` WRITE;
/*!40000 ALTER TABLE `hrms_positions` DISABLE KEYS */;
INSERT INTO `hrms_positions` (`id`, `position_code`, `position_title`, `position_title_am`, `department_id`, `job_grade_id`, `approved_headcount`, `is_hazardous`, `requires_shift_work`, `is_active`, `created_at`, `updated_at`) VALUES (1,'POS-WTP-OP','Water Treatment Plant Operator','ßï¿ßïìßêâ ßêøßîúßê¬ßï½ ßìòßêïßèòßëÁ ßèªßìòßê¼ßë░ßê¡',1,3,8,1,1,1,'2026-09-13 11:50:11','2026-09-13 11:50:11'),(2,'POS-WTP-CHM','Water Quality Lab Chemist','ßï¿ßïìßêâ ßîÑßê½ßëÁ ßë░ßëåßîúßîúßê¬ ßè¼ßêÜßêÁßëÁ',1,4,3,1,0,1,'2026-09-13 11:50:11','2026-09-13 11:50:11'),(3,'POS-NET-PLMB','Network Maintenance Plumber','ßï¿ßïìßêâ ßêÿßêÁßêÿßê¡ ßîÑßîêßèô ßëúßêêßêÖßï½ (ßëºßèòßëº ßêáßê½ßë░ßèø)',2,2,12,0,1,1,'2026-09-13 11:50:11','2026-09-13 11:50:11'),(4,'POS-LEAK-REP','Emergency Leak Repair Technician','ßï¿ßèáßï░ßîï ßîèßï£ ßï¿ßïìßêâ ßììßê░ßëÁ ßîÑßîêßèô ßë┤ßè¡ßèÆßê╗ßèò',2,3,6,0,1,1,'2026-09-13 11:50:11','2026-09-13 11:50:11'),(5,'POS-ELEC-ENG','Electro-Mechanical Pump Station Engineer','ßï¿ßëªßêÁßë░ßê¡ßèô ßìôßêØßìò ßèñßêîßè¡ßëÁßê« ßêÿßè½ßèÆßè¡ ßêÿßêâßèòßï▓ßêÁ',3,4,4,1,1,1,'2026-09-13 11:50:11','2026-09-13 11:50:11'),(6,'POS-MTR-RDR','Water Meter Reader & Collector','ßï¿ßïìßêâ ßëåßîúßê¬ ßèáßèòßëúßëóßèô ßë░ßëåßîúßîúßê¬',4,2,15,0,0,1,'2026-09-13 11:50:11','2026-09-13 11:50:11'),(7,'POS-BILL-OFF','Customer Billing Officer','ßï¿ßï░ßèòßëáßè×ßë¢ ßëóßêèßèòßîì ßëúßêêßêÖßï½',4,3,6,0,0,1,'2026-09-13 11:50:11','2026-09-13 11:50:11'),(8,'POS-HR-OFF','Human Resource Specialist','ßï¿ßê░ßïì ßèâßï¡ßêì ßèáßêÁßë░ßï│ßï░ßê¡ ßëúßêêßêÖßï½',5,4,2,0,0,1,'2026-09-13 11:50:11','2026-09-13 11:50:11'),(9,'POS-PAY-ACC','Payroll & General Ledger Accountant','ßï¿ßï░ßêÿßïêßïØßèô ßìïßï¡ßèôßèòßêÁ ßêéßê│ßëÑ ßê╣ßêØ',6,4,2,0,0,1,'2026-09-13 11:50:11','2026-09-13 11:50:11');
/*!40000 ALTER TABLE `hrms_positions` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `inv_item_group`
--

DROP TABLE IF EXISTS `inv_item_group`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `inv_item_group` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `category_id` int(11) NOT NULL,
  `group_code` varchar(20) NOT NULL,
  `group_name` varchar(200) NOT NULL,
  `group_name_am` varchar(200) DEFAULT NULL,
  `is_active` tinyint(1) NOT NULL DEFAULT 1,
  `deleted` varchar(20) NOT NULL DEFAULT 'No',
  `created_by` varchar(100) DEFAULT NULL,
  `created_at` datetime DEFAULT current_timestamp(),
  `updated_at` datetime DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `group_code` (`group_code`),
  KEY `fk_item_group_category` (`category_id`),
  CONSTRAINT `fk_item_group_category` FOREIGN KEY (`category_id`) REFERENCES `inv_item_category` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_uca1400_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `inv_item_group`
--

LOCK TABLES `inv_item_group` WRITE;
/*!40000 ALTER TABLE `inv_item_group` DISABLE KEYS */;
INSERT INTO `inv_item_group` (`id`, `category_id`, `group_code`, `group_name`, `group_name_am`, `is_active`, `deleted`, `created_by`, `created_at`, `updated_at`) VALUES (2,1,'23','dsdsd','bbbbb',1,'No','system','2026-09-06 06:30:54','2026-09-06 06:30:54'),(3,1,'232','office use','offfus',1,'No','system','2026-09-06 06:51:03','2026-09-06 06:51:03');
/*!40000 ALTER TABLE `inv_item_group` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `inv_store`
--

DROP TABLE IF EXISTS `inv_store`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `inv_store` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `store_code` varchar(20) NOT NULL,
  `store_name` varchar(200) NOT NULL,
  `store_name_am` varchar(200) DEFAULT NULL,
  `branch_id` int(11) DEFAULT NULL,
  `is_main_store` tinyint(1) NOT NULL DEFAULT 0,
  `store_keeper_id` int(11) DEFAULT NULL,
  `manager_id` int(11) DEFAULT NULL,
  `location` varchar(200) DEFAULT NULL,
  `is_active` tinyint(1) NOT NULL DEFAULT 1,
  `deleted` varchar(20) NOT NULL DEFAULT 'No',
  `created_by` varchar(100) DEFAULT NULL,
  `created_at` datetime DEFAULT current_timestamp(),
  `updated_at` datetime DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `store_code` (`store_code`),
  KEY `fk_store_branch` (`branch_id`),
  KEY `fk_store_keeper` (`store_keeper_id`),
  KEY `fk_store_manager` (`manager_id`),
  CONSTRAINT `fk_store_branch` FOREIGN KEY (`branch_id`) REFERENCES `branchs` (`id`),
  CONSTRAINT `fk_store_keeper` FOREIGN KEY (`store_keeper_id`) REFERENCES `user_account` (`id`),
  CONSTRAINT `fk_store_manager` FOREIGN KEY (`manager_id`) REFERENCES `user_account` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_uca1400_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `inv_store`
--

LOCK TABLES `inv_store` WRITE;
/*!40000 ALTER TABLE `inv_store` DISABLE KEYS */;
INSERT INTO `inv_store` (`id`, `store_code`, `store_name`, `store_name_am`, `branch_id`, `is_main_store`, `store_keeper_id`, `manager_id`, `location`, `is_active`, `deleted`, `created_by`, `created_at`, `updated_at`) VALUES (1,'ST1','main Store','ßïïßèôßïì ßèÑßëâ ßëñßëÁ',1,1,209,NULL,'kebele 1',1,'No','reading2','2026-09-06 08:01:25','2026-09-11 19:31:32'),(2,'ST2','SheSha Ber','ßê©ßê╗ ßëáßê¡',6,0,204,NULL,'3',1,'No','reading2','2026-09-06 08:02:12','2026-09-11 19:31:33'),(3,'STB3','branch 3','ßëÑßê½ßèòßë¢ 3',7,0,219,NULL,'keb33',1,'No','reading2','2026-09-11 09:44:32','2026-09-11 19:31:33'),(4,'4STR','4branch Store','4 ßèÑßêÁßëÂßê¡',8,0,227,NULL,'44',1,'No','admin2','2026-09-19 18:46:06','2026-09-19 18:46:06');
/*!40000 ALTER TABLE `inv_store` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `wf_workflow_step`
--

DROP TABLE IF EXISTS `wf_workflow_step`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `wf_workflow_step` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `template_id` int(11) NOT NULL,
  `step_order` int(11) NOT NULL,
  `step_name` varchar(200) NOT NULL,
  `step_name_am` varchar(200) DEFAULT NULL,
  `approver_role_code` varchar(20) NOT NULL,
  `is_required` tinyint(1) DEFAULT 1,
  `min_amount` decimal(15,2) DEFAULT NULL,
  `max_amount` decimal(15,2) DEFAULT NULL,
  `auto_approve_below` decimal(15,2) DEFAULT NULL,
  `sla_hours` int(11) DEFAULT 48,
  `can_reject` tinyint(1) DEFAULT 1,
  `notify_on_arrival` tinyint(1) DEFAULT 1,
  `created_at` datetime DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `template_id` (`template_id`)
) ENGINE=MyISAM AUTO_INCREMENT=12 DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `wf_workflow_step`
--

LOCK TABLES `wf_workflow_step` WRITE;
/*!40000 ALTER TABLE `wf_workflow_step` DISABLE KEYS */;
INSERT INTO `wf_workflow_step` (`id`, `template_id`, `step_order`, `step_name`, `step_name_am`, `approver_role_code`, `is_required`, `min_amount`, `max_amount`, `auto_approve_below`, `sla_hours`, `can_reject`, `notify_on_arrival`, `created_at`) VALUES (1,1,1,'Department Manager Approval','???? ??? ?????','DEPT_MANAGER',1,NULL,NULL,NULL,24,1,1,'2026-09-06 17:03:03'),(2,1,2,'Finance Manager Approval','Finance Manager Approval','M_FINANCE_HEAD',1,NULL,NULL,NULL,48,1,1,'2026-09-06 17:03:03'),(3,1,3,'Purchase Officer Review','Purchase Officer Review','M_PURCHASING_OFFICER',1,NULL,NULL,NULL,24,1,1,'2026-09-06 17:03:03'),(4,2,1,'Finance Head','Finance Manager ','M_FINANCE_HEAD',1,NULL,50000.00,NULL,48,1,1,'2026-09-06 17:03:03'),(7,4,1,'Store Manager Approval','????? ??? ???','INV_MANAGER',1,NULL,NULL,NULL,24,1,1,'2026-09-06 17:03:03'),(8,4,2,'Finance Approval','?????? ???','FNC',1,NULL,NULL,NULL,48,1,1,'2026-09-06 17:03:03'),(9,5,1,'Department Manager Approval','???? ??? ???','INV_MANAGER',1,NULL,NULL,NULL,24,1,1,'2026-09-06 17:03:04'),(11,3,1,'Branch Admin','Branch Admin am','M_BRANCH_MANAGER',1,NULL,NULL,NULL,48,1,1,'2026-10-05 18:54:02'),(10,3,2,'Finance Head ','Finance Head ','M_FINANCE_HEAD',1,NULL,NULL,NULL,48,1,1,'2026-09-08 12:46:32');
/*!40000 ALTER TABLE `wf_workflow_step` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `fnc_billing_account_map`
--

DROP TABLE IF EXISTS `fnc_billing_account_map`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `fnc_billing_account_map` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `mapping_key` varchar(100) NOT NULL,
  `account_id` int(11) NOT NULL,
  `label` varchar(200) DEFAULT NULL,
  `created_at` datetime DEFAULT current_timestamp(),
  `updated_at` datetime DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_mapping_key` (`mapping_key`),
  KEY `fk_billing_map_account` (`account_id`),
  CONSTRAINT `fk_billing_map_account` FOREIGN KEY (`account_id`) REFERENCES `fnc_account` (`id`) ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=79 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_uca1400_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `fnc_billing_account_map`
--

LOCK TABLES `fnc_billing_account_map` WRITE;
/*!40000 ALTER TABLE `fnc_billing_account_map` DISABLE KEYS */;
INSERT INTO `fnc_billing_account_map` (`id`, `mapping_key`, `account_id`, `label`, `created_at`, `updated_at`) VALUES (1,'BP_DR_WATER_CONSUMPTION',2,'DR: ßï¿ßïìßêâ ßììßîåßë│ ßëÑßê¡ (Current Month Water consumption)','2026-08-25 22:00:25','2026-08-25 22:00:25'),(2,'BP_CR_WATER_CONSUMPTION',17,'CR: ßï¿ßïìßêâ ßììßîåßë│ ßëÑßê¡ (Current Month Water consumption)','2026-08-25 22:00:25','2026-08-25 22:00:25'),(3,'BP_DR_METER_RENT',3,'DR: ßëåßîúßê¬ ßè¬ßê½ßï¡ (Meter Rent)','2026-08-25 22:00:25','2026-08-25 22:00:25'),(4,'BP_CR_METER_RENT',18,'CR: ßëåßîúßê¬ ßè¬ßê½ßï¡ (Meter Rent)','2026-08-25 22:00:25','2026-08-25 22:00:25'),(5,'BP_DR_ADDITIONAL_CHARGE',4,'DR: ßë░ßî¿ßêøßê¬ ßè¡ßììßï½ (Bill Additional Payment)','2026-08-26 06:35:34','2026-08-26 06:35:34'),(6,'BP_CR_ADDITIONAL_CHARGE',19,'CR: ßë░ßî¿ßêøßê¬ ßè¡ßììßï½ (Bill Additional Payment)','2026-08-26 06:35:34','2026-08-26 06:35:34'),(7,'BP_DR_WUZIF_CONSUMPTION',5,'DR: ßïìßïØßìì ßììßîåßë│ ßè¡ßììßï½ (Arrears Water Consumption)','2026-08-26 06:35:34','2026-08-26 06:35:34'),(8,'BP_CR_WUZIF_CONSUMPTION',20,'CR: ßïìßïØßìì ßììßîåßë│ ßè¡ßììßï½ (Arrears Water Consumption)','2026-08-26 06:35:34','2026-08-26 06:35:34'),(9,'BP_DR_WUZIF_METER_RENT',6,'DR: ßïìßïØßìì ßëåßîúßê¬ ßè¬ßê½ßï¡ (Arrears Meter rent)','2026-08-26 06:35:34','2026-08-26 06:35:34'),(10,'BP_CR_WUZIF_METER_RENT',21,'CR: ßïìßïØßìì ßëåßîúßê¬ ßè¬ßê½ßï¡ (Arrears Meter rent)','2026-08-26 06:35:34','2026-08-26 06:35:34'),(11,'BP_DR_WUZIF_ADDITIONAL',7,'DR: ßïìßïØßìì ßë░ßî¿ßêøßê¬ ßè¡ßììßï½ (Arrears Bill Additional Payment)','2026-08-26 06:35:34','2026-08-26 06:35:34'),(12,'BP_CR_WUZIF_ADDITIONAL',22,'CR: ßïìßïØßìì ßë░ßî¿ßêøßê¬ ßè¡ßììßï½ (Arrears Bill Additional Payment)','2026-08-26 06:35:34','2026-08-26 06:35:34'),(13,'BP_DR_PENALTY',8,'DR: ßëàßîúßëÁ (Bill Penalty)','2026-08-26 06:35:34','2026-08-26 06:35:34'),(14,'BP_CR_PENALTY',23,'CR: ßëàßîúßëÁ (Bill Penalty)','2026-08-26 06:35:34','2026-08-26 06:35:34'),(15,'BP_DR_CARRIED_FORWARD',9,'DR: ßï¿ßë░ßêïßêêßìê(ßèÉßëúßê¡) ßïìßïØßìì (Bill Old system Arrears)','2026-08-26 06:35:34','2026-08-26 06:35:34'),(16,'BP_CR_CARRIED_FORWARD',24,'CR: ßï¿ßë░ßêïßêêßìê(ßèÉßëúßê¡) ßïìßïØßìì (Bill Old system Arrears)','2026-08-26 06:35:34','2026-08-26 06:35:34'),(17,'BP_DR_SERVICE_CHARGE',10,'DR: ßï¿ßèáßîêßêìßîìßêÄßëÁ ßè¡ßììßï½ (Bill Service Charge)','2026-08-26 06:35:34','2026-08-26 06:35:34'),(18,'BP_DR_WASTE_CHARGE',11,'DR: ßï¿ßïÜßêà ßïêßê¡ ßï░ßê¿ßëà ßëåßê╗ßê╗ (Dry Wast)','2026-08-26 06:35:34','2026-08-26 06:35:34'),(19,'BP_CR_WASTE_CHARGE',27,'CR: ßï¿ßïÜßêà ßïêßê¡ ßï░ßê¿ßëà ßëåßê╗ßê╗ (Dry Wast)','2026-08-26 06:35:34','2026-08-26 06:35:34'),(20,'BP_DR_SCHOOL_FEEDING',12,'DR: ßï¿ßëÁßêØßêàßê¡ßëÁ ßëñßëÁ ßêØßîêßëú (School Feeding)','2026-08-26 06:35:34','2026-08-26 06:35:34'),(21,'BP_CR_SCHOOL_FEEDING',28,'CR: ßï¿ßëÁßêØßêàßê¡ßëÁ ßëñßëÁ ßêØßîêßëú (School Feeding)','2026-08-26 06:35:34','2026-08-26 06:35:34'),(22,'BP_DR_WUZIF_SERVICE_CHARGE',13,'DR: ßïìßïØßìì ßï¿ßèáßîêßêìßîìßêÄßëÁ ßè¡ßììßï½ (Arrears Bill Service Charge)','2026-08-26 06:35:34','2026-08-26 06:35:34'),(23,'BP_CR_WUZIF_SERVICE_CHARGE',29,'CR: ßïìßïØßìì ßï¿ßèáßîêßêìßîìßêÄßëÁ ßè¡ßììßï½ (Arrears Bill Service Charge)','2026-08-26 06:35:34','2026-08-26 06:35:34'),(24,'BP_DR_WUZIF_WASTE',14,'DR: ßïìßïØßìì ßï░ßê¿ßëà ßëåßê╗ßê╗ (Arrears Dry Wast)','2026-08-26 06:35:34','2026-08-26 06:35:34'),(25,'BP_CR_WUZIF_WASTE',30,'CR: ßïìßïØßìì ßï░ßê¿ßëà ßëåßê╗ßê╗ (Arrears Dry Wast)','2026-08-26 06:35:34','2026-08-26 06:35:34'),(26,'BP_DR_WUZIF_SCHOOL_FEEDING',15,'DR: ßïìßïØßìì ßï¿ßëÁßêØßêàßê¡ßëÁ ßëñßëÁ ßêØßîêßëú (Arrears School Feeding)','2026-08-26 06:35:34','2026-08-26 06:35:34'),(27,'BP_CR_WUZIF_SCHOOL_FEEDING',31,'CR: ßïìßïØßìì ßï¿ßëÁßêØßêàßê¡ßëÁ ßëñßëÁ ßêØßîêßëú (Arrears School Feeding)','2026-08-26 06:35:34','2026-08-26 06:35:34'),(28,'BP_CR_SERVICE_CHARGE',25,'CR: ßï¿ßèáßîêßêìßîìßêÄßëÁ ßè¡ßììßï½ (Bill Service Charge)','2026-08-26 06:35:34','2026-08-26 06:35:34'),(29,'BANK_1',37,'Bank: BANK_1','2026-08-26 18:21:12','2026-08-26 18:21:12'),(30,'BANK_9',52,'Bank: BANK_9','2026-08-26 18:21:12','2026-08-26 18:21:12'),(31,'BANK_7',42,'Bank: BANK_7','2026-08-26 18:21:12','2026-08-26 18:21:12'),(32,'BANK_4',40,'Bank: BANK_4','2026-08-26 18:21:12','2026-08-26 18:21:12'),(33,'BANK_2',48,'Bank: BANK_2','2026-08-26 18:32:06','2026-08-26 18:32:06'),(34,'BANK_3',38,'Bank: BANK_3','2026-08-26 18:32:06','2026-08-26 18:32:06'),(35,'BANK_11',41,'Bank: BANK_11','2026-08-26 18:32:06','2026-08-26 18:32:06'),(36,'BANK_8',50,'Bank: BANK_8','2026-08-26 18:32:06','2026-08-26 18:32:06'),(37,'BANK_6',45,'Bank: BANK_6','2026-08-26 18:32:06','2026-08-26 18:32:06'),(38,'BANK_10',39,'Bank: BANK_10','2026-08-26 18:32:06','2026-08-26 18:32:06'),(39,'OFFICE_CASH',35,'Office Cash Account (ßëóßê« ßîÑßê¼ ßîêßèòßïÿßëÑ)','2026-08-26 18:33:03','2026-08-26 18:33:03'),(40,'PREPAID_ACCOUNT',36,'Prepaid/Credit Account','2026-08-26 18:33:03','2026-08-26 18:33:03'),(67,'INV_DR_GRN_ASSET',61,'DR: ßï¿ßïòßëâ ßêÿßëÇßëáßï½ ßê░ßèÉßïÁ (GRN Stock Intake)','2026-09-13 11:38:05','2026-09-13 11:38:05'),(68,'INV_CR_GRN_PAYABLE',62,'CR: ßï¿ßïòßëâ ßêÿßëÇßëáßï½ ßê░ßèÉßïÁ (GRN Stock Intake)','2026-09-13 11:38:05','2026-09-13 11:38:05'),(69,'INV_DR_ISSUE_EXPENSE',64,'DR: ßï¿ßïòßëâ ßïêßî¬ ßê░ßèÉßïÁ (Store Issue / Dept Consumption)','2026-09-13 11:38:05','2026-09-13 11:38:05'),(70,'INV_CR_ISSUE_ASSET',61,'CR: ßï¿ßïòßëâ ßïêßî¬ ßê░ßèÉßïÁ (Store Issue / Dept Consumption)','2026-09-13 11:38:05','2026-09-13 11:38:05'),(71,'INV_DR_SALE_COGS',63,'DR: ßï¿ßïòßëâ ßê¢ßï½ßî¡ / ßïêßî¬ (Customer Sale & COGS)','2026-09-13 11:38:05','2026-09-13 11:38:05'),(72,'INV_CR_SALE_ASSET',61,'CR: ßï¿ßïòßëâ ßê¢ßï½ßî¡ / ßïêßî¬ (Customer Sale & COGS)','2026-09-13 11:38:05','2026-09-13 11:38:05'),(73,'INV_DR_ADJUST_GAIN_ASSET',61,'DR: ßï¿ßïòßëâ ßëåßîáßê½ ßëÁßê¡ßìì ßêøßêÁßë░ßè½ßè¿ßï½','2026-09-13 11:38:05','2026-09-13 11:38:05'),(74,'INV_CR_ADJUST_GAIN_REV',65,'CR: ßï¿ßïòßëâ ßëåßîáßê½ ßëÁßê¡ßìì ßêøßêÁßë░ßè½ßè¿ßï½','2026-09-13 11:38:05','2026-09-13 11:38:05'),(75,'INV_DR_ADJUST_LOSS_EXP',66,'DR: ßï¿ßïòßëâ ßëåßîáßê½ ßîëßïÁßêêßëÁ/ßëÑßêìßê¢ßëÁ','2026-09-13 11:38:05','2026-09-13 11:38:05'),(76,'INV_CR_ADJUST_LOSS_ASSET',61,'CR: ßï¿ßïòßëâ ßëåßîáßê½ ßîëßïÁßêêßëÁ/ßëÑßêìßê¢ßëÁ','2026-09-13 11:38:05','2026-09-13 11:38:05'),(77,'INV_DR_TRANSFER_ASSET',67,'DR: ßï¿ßïòßëâ ßêÿßîïßïÿßèò ßïØßïìßïìßê¡ (Destination)','2026-09-13 11:38:05','2026-09-13 11:38:05'),(78,'INV_CR_TRANSFER_ASSET',61,'CR: ßï¿ßïòßëâ ßêÿßîïßïÿßèò ßïØßïìßïìßê¡ (Source)','2026-09-13 11:38:05','2026-09-13 11:38:05');
/*!40000 ALTER TABLE `fnc_billing_account_map` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `fnc_budget`
--

DROP TABLE IF EXISTS `fnc_budget`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `fnc_budget` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `fiscal_year_id` int(11) NOT NULL,
  `budget_name` varchar(200) NOT NULL,
  `description` varchar(500) DEFAULT NULL,
  `status` enum('DRAFT','APPROVED','REVISED') DEFAULT 'DRAFT',
  `total_revenue_budget` decimal(15,2) DEFAULT 0.00,
  `total_expense_budget` decimal(15,2) DEFAULT 0.00,
  `approved_by` varchar(100) DEFAULT NULL,
  `approved_at` timestamp NULL DEFAULT NULL,
  `created_by` varchar(100) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `fiscal_year_id` (`fiscal_year_id`),
  CONSTRAINT `fnc_budget_ibfk_1` FOREIGN KEY (`fiscal_year_id`) REFERENCES `fnc_fiscal_year` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_uca1400_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `fnc_budget`
--

LOCK TABLES `fnc_budget` WRITE;
/*!40000 ALTER TABLE `fnc_budget` DISABLE KEYS */;
/*!40000 ALTER TABLE `fnc_budget` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `fnc_journal_entry`
--

DROP TABLE IF EXISTS `fnc_journal_entry`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `fnc_journal_entry` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `entry_number` varchar(50) NOT NULL,
  `entry_date` date NOT NULL,
  `fiscal_year_id` int(11) NOT NULL,
  `reference_number` varchar(100) DEFAULT NULL,
  `source_type` varchar(50) DEFAULT 'MANUAL',
  `source_id` varchar(100) DEFAULT NULL,
  `billing_month` varchar(100) DEFAULT NULL,
  `description` varchar(500) NOT NULL,
  `status` enum('DRAFT','POSTED','VOID') DEFAULT 'DRAFT',
  `total_debit` decimal(15,2) DEFAULT 0.00,
  `total_credit` decimal(15,2) DEFAULT 0.00,
  `posted_by` varchar(100) DEFAULT NULL,
  `posted_at` timestamp NULL DEFAULT NULL,
  `voided_by` varchar(100) DEFAULT NULL,
  `voided_at` timestamp NULL DEFAULT NULL,
  `void_reason` varchar(500) DEFAULT NULL,
  `created_by` varchar(100) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `entry_number` (`entry_number`),
  KEY `fiscal_year_id` (`fiscal_year_id`),
  KEY `idx_fnc_journal_entry_billing_month` (`billing_month`),
  CONSTRAINT `fnc_journal_entry_ibfk_1` FOREIGN KEY (`fiscal_year_id`) REFERENCES `fnc_fiscal_year` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=52 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_uca1400_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `fnc_journal_entry`
--

LOCK TABLES `fnc_journal_entry` WRITE;
/*!40000 ALTER TABLE `fnc_journal_entry` DISABLE KEYS */;
INSERT INTO `fnc_journal_entry` (`id`, `entry_number`, `entry_date`, `fiscal_year_id`, `reference_number`, `source_type`, `source_id`, `billing_month`, `description`, `status`, `total_debit`, `total_credit`, `posted_by`, `posted_at`, `voided_by`, `voided_at`, `void_reason`, `created_by`, `created_at`, `updated_at`) VALUES (13,'JE-INV-2026-1788870998893','2026-09-08',1,'GRN-2026-00001','INVENTORY_GRN','10',NULL,'Goods Received - GRN-2026-00001 from abc Metere ','POSTED',22000.00,22000.00,'pofficer',NULL,NULL,NULL,NULL,'pofficer','2026-09-08 09:36:38','2026-09-08 09:36:38'),(14,'JE-INV-2026-1789241945776','2026-09-12',1,'ISV-MNT-MNT-2026-00001','INVENTORY_ISSUE','6',NULL,'Sale / Customer Utility Materials - ISV-MNT-MNT-2026-00001 (ßïê/ßê« ßèÑßèôßèæ ßëÑßê¡ßêÇßèò)','POSTED',4000.00,4000.00,'reading2','2026-09-12 16:39:05',NULL,NULL,NULL,'reading2','2026-09-12 16:39:05','2026-09-12 16:39:05'),(15,'JE-INV-2026-1789303838026','2026-09-13',1,'ISV-NLC-NLC-2026-00010','INVENTORY_ISSUE','7',NULL,'Sale / Customer Utility Materials - ISV-NLC-NLC-2026-00010 (ßîïßê¢ßèÉßëÁ ßèáßëáßîïßïØ ßèáßêè)','POSTED',1091.44,1091.44,'3store','2026-09-13 09:50:38',NULL,NULL,NULL,'3store','2026-09-13 09:50:38','2026-09-13 09:50:38'),(16,'JE-INV-2026-1789307290516','2026-09-13',1,'ISV-MNT-MNT-2026-00003','INVENTORY_ISSUE','8',NULL,'Sale / Customer Utility Materials - ISV-MNT-MNT-2026-00003 (ßîïßê¢ßèÉßëÁ ßèáßëáßîïßïØ ßèáßêè)','POSTED',2481.24,2481.24,'3store','2026-09-13 10:48:10',NULL,NULL,NULL,'3store','2026-09-13 10:48:10','2026-09-13 10:48:10'),(17,'JE-INV-2026-1789309458300','2026-09-13',1,'ISV-NLC-NLC-2026-00011','INVENTORY_ISSUE','9',NULL,'Sale / Customer Utility Materials - ISV-NLC-NLC-2026-00011 (ßèáßëÑßê¡ßêÇßêØ ßèáßê×ßèÿ ßëÑßê¡ßêÇßèæ)','POSTED',782.72,782.72,'3store','2026-09-13 11:24:18',NULL,NULL,NULL,'3store','2026-09-13 11:24:18','2026-09-13 11:24:18'),(18,'JE-INV-2026-1789318858119','2026-09-13',1,'ISV-NLC-NLC-2026-00007','INVENTORY_ISSUE','10',NULL,'Sale / Customer Utility Materials - ISV-NLC-NLC-2026-00007 (test)','POSTED',6400.00,6400.00,'3store','2026-09-13 14:00:58',NULL,NULL,NULL,'3store','2026-09-13 14:00:58','2026-09-13 14:00:58'),(19,'JE-2019-00010','2026-09-14',1,'BILL-PREP-SINGLE-FT-00187305-1789366577247','BILL_PREP','ßê░ßèö, 2018','ßê░ßèö, 2018','Bill Preparation ÔÇö FT-00187305 ÔÇö ßê░ßèö, 2018','DRAFT',3005.00,3005.00,NULL,NULL,NULL,NULL,NULL,'reading2','2026-09-14 03:16:17','2026-09-14 03:16:17'),(20,'JE-INV-2026-1789893229233','2026-09-20',1,'GRN-2026-00002','INVENTORY_GRN','11',NULL,'Goods Received - GRN-2026-00002 from abc Metere ','POSTED',2000.00,2000.00,'fhead',NULL,NULL,NULL,NULL,'fhead','2026-09-20 05:33:49','2026-09-20 05:33:49'),(21,'JE-INV-2026-1789999372810','2026-09-21',1,'GRN-2026-00003','INVENTORY_GRN','12',NULL,'Goods Received - GRN-2026-00003 from abc Metere ','POSTED',59400.00,59400.00,'fhead',NULL,NULL,NULL,NULL,'fhead','2026-09-21 11:02:52','2026-09-21 11:02:52'),(22,'JE-INV-2026-1790007444951','2026-09-21',1,'TRF-2026-00003','INVENTORY_TRANSFER','5',NULL,'Stock Transfer - TRF-2026-00003 from main Store to 4branch Store','POSTED',1860.00,1860.00,'4store',NULL,NULL,NULL,NULL,'4store','2026-09-21 13:17:24','2026-09-21 13:17:24'),(23,'JE-INV-2026-1790011844753','2026-09-21',1,'TRF-2026-00004','INVENTORY_TRANSFER','6',NULL,'Stock Transfer - TRF-2026-00004 from main Store to 4branch Store','POSTED',6000.00,6000.00,'4store',NULL,NULL,NULL,NULL,'4store','2026-09-21 14:30:44','2026-09-21 14:30:44'),(24,'JE-INV-2026-1790020241508','2026-09-21',1,'TRF-2026-00007','INVENTORY_TRANSFER','9',NULL,'Stock Transfer - TRF-2026-00007 from 4branch Store to branch 3','POSTED',18380.00,18380.00,'3store',NULL,NULL,NULL,NULL,'3store','2026-09-21 16:50:41','2026-09-21 16:50:41'),(25,'JE-INV-2026-1790081577767','2026-09-22',1,'ISV-NLC-NLC-2026-00015','INVENTORY_ISSUE','11',NULL,'Sale / Customer Utility Materials - ISV-NLC-NLC-2026-00015 (kebede alemu yasie)','POSTED',6340.00,6340.00,'4store','2026-09-22 09:52:57',NULL,NULL,NULL,'4store','2026-09-22 09:52:57','2026-09-22 09:52:57'),(26,'JE-INV-2026-1790084815605','2026-09-22',1,'ISV-NLC-NLC-2026-00004','INVENTORY_ISSUE','12',NULL,'Sale / Customer Utility Materials - ISV-NLC-NLC-2026-00004 (Abebe Kebede)','POSTED',4200.00,4200.00,'reading2','2026-09-22 10:46:55',NULL,NULL,NULL,'reading2','2026-09-22 10:46:55','2026-09-22 10:46:55'),(27,'JE-INV-2026-1790143141733','2026-09-23',1,'ISV-NLC-NLC-2026-00016','INVENTORY_ISSUE','13',NULL,'Sale / Customer Utility Materials - ISV-NLC-NLC-2026-00016 (test 4 kebede)','POSTED',7140.00,7140.00,'4store','2026-09-23 02:59:01',NULL,NULL,NULL,'4store','2026-09-23 02:59:01','2026-09-23 02:59:01'),(28,'JE-INV-2026-1790192061840','2026-09-23',1,'ISV-NLC-NLC-2026-00018','INVENTORY_ISSUE','14',NULL,'Sale / Customer Utility Materials - ISV-NLC-NLC-2026-00018 (ßèáßëáßëá ßè¿ßëáßï░ ßê×ßêï)','POSTED',3000.00,3000.00,'4store','2026-09-23 16:34:21',NULL,NULL,NULL,'4store','2026-09-23 16:34:21','2026-09-23 16:34:21'),(29,'JE-INV-2026-1790194083762','2026-09-23',1,'ISV-NLC-NLC-2026-00019','INVENTORY_ISSUE','15',NULL,'Sale / Customer Utility Materials - ISV-NLC-NLC-2026-00019 (ßîàßêàßëÑßîà)','POSTED',6000.00,6000.00,'4store','2026-09-23 17:08:03',NULL,NULL,NULL,'4store','2026-09-23 17:08:03','2026-09-23 17:08:03'),(30,'JE-INV-2026-1790232143685','2026-09-24',1,'ISV-MNT-MNT-2026-00005','INVENTORY_ISSUE','16',NULL,'Sale / Customer Utility Materials - ISV-MNT-MNT-2026-00005 (ßèáßëÂ ßï¡ßê│ ßê░ßï¡ßïÁ)','POSTED',3000.00,3000.00,'4store','2026-09-24 03:42:23',NULL,NULL,NULL,'4store','2026-09-24 03:42:23','2026-09-24 03:42:23'),(31,'JE-INV-2026-1790254817078','2026-09-24',1,'TRF-2026-00008','INVENTORY_TRANSFER','10',NULL,'Stock Transfer - TRF-2026-00008 from main Store to 4branch Store','POSTED',4280.00,4280.00,'4store',NULL,NULL,NULL,NULL,'4store','2026-09-24 10:00:17','2026-09-24 10:00:17'),(32,'JE-INV-2026-1790276507185','2026-09-24',1,'ISV-MNT-MNT-2026-00006','INVENTORY_ISSUE','17',NULL,'Sale / Customer Utility Materials - ISV-MNT-MNT-2026-00006 (ßïêßèòßïÁßêØßèÉßïì ßï░ßê┤)','POSTED',940.00,940.00,'4store','2026-09-24 16:01:47',NULL,NULL,NULL,'4store','2026-09-24 16:01:47','2026-09-24 16:01:47'),(33,'JE-INV-2026-1790276717358','2026-09-24',1,'ISV-NLC-NLC-2026-00021','INVENTORY_ISSUE','18',NULL,'Sale / Customer Utility Materials - ISV-NLC-NLC-2026-00021 (ßê░ßêÄßê×ßèò ßè¿ßëáßï░ ßèáßêêßêÖ)','POSTED',940.00,940.00,'4store','2026-09-24 16:05:17',NULL,NULL,NULL,'4store','2026-09-24 16:05:17','2026-09-24 16:05:17'),(34,'JE-INV-2026-1790276826611','2026-09-24',1,'ISV-NLC-NLC-2026-00017','INVENTORY_ISSUE','19',NULL,'Sale / Customer Utility Materials - ISV-NLC-NLC-2026-00017 (ßè¿ßëáßï░ ßê░ßêêßê×ßèò ßï½ßï£)','POSTED',3000.00,3000.00,'4store','2026-09-24 16:07:06',NULL,NULL,NULL,'4store','2026-09-24 16:07:06','2026-09-24 16:07:06'),(35,'JE-INV-2026-1790580075503','2026-09-28',1,'ISV-NLC-NLC-2026-00001','INVENTORY_ISSUE','20',NULL,'Sale / Customer Utility Materials - ISV-NLC-NLC-2026-00001 (ßê░ßêïßêØ ßïêßê░ßèò ßè¿ßëáßï░)','POSTED',3800.00,3800.00,'4store','2026-09-28 04:21:15',NULL,NULL,NULL,'4store','2026-09-28 04:21:15','2026-09-28 04:21:15'),(36,'JE-INV-2026-1790582323366','2026-09-28',1,'ISV-MNT-MNT-2026-00001','INVENTORY_ISSUE','1',NULL,'Sale / Customer Utility Materials - ISV-MNT-MNT-2026-00001 (ßêØßëÁßè® ßèáßï½ßèô ßè¡ßèòßï┤)','POSTED',5000.00,5000.00,'4store','2026-09-28 04:58:43',NULL,NULL,NULL,'4store','2026-09-28 04:58:43','2026-09-28 04:58:43'),(37,'JE-INV-2026-1790625481248','2026-09-28',1,'ISV-NLC-NLC-2026-00001','INVENTORY_ISSUE','2',NULL,'Sale / Customer Utility Materials - ISV-NLC-NLC-2026-00001 (ßêêßêØßêêßêØ ßêÿßêêßê░ ßëóßêêßïì)','POSTED',6000.00,6000.00,'reading2','2026-09-28 16:58:01',NULL,NULL,NULL,'reading2','2026-09-28 16:58:01','2026-09-28 16:58:01'),(38,'JE-INV-2026-1790710199510','2026-09-29',1,'GRN-2026-00004','INVENTORY_GRN','13',NULL,'Goods Received - GRN-2026-00004 from abc Metere ','POSTED',23000.00,23000.00,'fhead',NULL,NULL,NULL,NULL,'fhead','2026-09-29 16:29:59','2026-09-29 16:29:59'),(39,'JE-INV-2026-1790774601112','2026-09-30',1,'GRN-2026-00005','INVENTORY_GRN','14',NULL,'Goods Received - GRN-2026-00005 from abc Metere ','POSTED',10000.00,10000.00,'reading2',NULL,NULL,NULL,NULL,'reading2','2026-09-30 10:23:21','2026-09-30 10:23:21'),(40,'JE-INV-2026-1790777198235','2026-09-30',1,'TRF-2026-00009','INVENTORY_TRANSFER','11',NULL,'Stock Transfer - TRF-2026-00009 from 4branch Store to main Store','POSTED',3000.00,3000.00,'mostore',NULL,NULL,NULL,NULL,'mostore','2026-09-30 11:06:38','2026-09-30 11:06:38'),(41,'JE-INV-2026-1790792053202','2026-09-30',1,'GRN-2026-00006','INVENTORY_GRN','15',NULL,'Goods Received - GRN-2026-00006 from abc Metere ','POSTED',60000.00,60000.00,'fhead',NULL,NULL,NULL,NULL,'fhead','2026-09-30 15:14:13','2026-09-30 15:14:13'),(42,'JE-INV-2026-1790796749891','2026-09-30',1,'GRN-2026-00007','INVENTORY_GRN','16',NULL,'Goods Received - GRN-2026-00007 from abc Metere ','POSTED',500.00,500.00,'fhead',NULL,NULL,NULL,NULL,'fhead','2026-09-30 16:32:29','2026-09-30 16:32:29'),(43,'JE-INV-2026-1790799885982','2026-09-30',1,'GRN-2026-00008','INVENTORY_GRN','17',NULL,'Goods Received - GRN-2026-00008 from abc Metere ','POSTED',52900.00,52900.00,'fhead',NULL,NULL,NULL,NULL,'fhead','2026-09-30 17:24:45','2026-09-30 17:24:45'),(44,'JE-INV-0001','2026-10-05',1,'ISV-MNT-MNT-2026-00002','INVENTORY_ISSUE','3',NULL,'Sale / Customer Utility Materials - ISV-MNT-MNT-2026-00002 (ßèÑßèòßè│ßèÉßêà ßê×ßêï)','POSTED',3356.35,3356.35,'4store','2026-10-05 08:34:40',NULL,NULL,NULL,'4store','2026-10-05 08:34:40','2026-10-05 08:34:40'),(47,'JE-INV-0002','2026-10-05',1,'GRV-00001','INVENTORY_GRN','19',NULL,'Goods Received - GRV-00001 from abc Metere ','POSTED',4600.00,4600.00,'pofficer',NULL,NULL,NULL,NULL,'pofficer','2026-10-05 10:47:54','2026-10-05 10:47:54'),(48,'JE-INV-0003','2026-10-05',1,'TRF-02028','INVENTORY_TRANSFER','13',NULL,'Stock Transfer - TRF-02028 from main Store to SheSha Ber','POSTED',6380.00,6380.00,'mstore',NULL,NULL,NULL,NULL,'mstore','2026-10-05 16:03:33','2026-10-05 16:03:33'),(49,'JE-INV-0004','2026-10-05',1,'ISV-NLC-NLC-2026-00002','INVENTORY_ISSUE','4',NULL,'Sale / Customer Utility Materials - ISV-NLC-NLC-2026-00002 (ßêÿßêêßê░ ßï░ßëáßëá ßê░ßêÄßê×ßèò)','POSTED',4952.94,4952.94,'mstore','2026-10-05 16:39:31',NULL,NULL,NULL,'mstore','2026-10-05 16:39:31','2026-10-05 16:39:31'),(50,'JE-INV-0005','2026-10-07',1,'ISV-NLC-NLC-2026-00003','INVENTORY_ISSUE','5',NULL,'Sale / Customer Utility Materials - ISV-NLC-NLC-2026-00003 (ßï«ßê┤ßìì ßè¿ßëáßï░ ßèáßêêßêÖ)','POSTED',3395.24,3395.24,'4store','2026-10-07 03:31:08',NULL,NULL,NULL,'4store','2026-10-07 03:31:08','2026-10-07 03:31:08'),(51,'JE-2019-00011','2026-10-07',1,'BILL-PREP-SINGLE-FT-00188186-1791355577618','BILL_PREP','ßêÿßêÁßè¿ßê¿ßêØ, 2019','ßêÿßêÁßè¿ßê¿ßêØ, 2019','Bill Preparation ÔÇö FT-00188186 ÔÇö ßêÿßêÁßè¿ßê¿ßêØ, 2019','DRAFT',4448.00,4448.00,NULL,NULL,NULL,NULL,NULL,'reading2','2026-10-07 03:46:17','2026-10-07 03:46:17');
/*!40000 ALTER TABLE `fnc_journal_entry` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `fnc_general_ledger`
--

DROP TABLE IF EXISTS `fnc_general_ledger`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `fnc_general_ledger` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `account_id` int(11) NOT NULL,
  `fiscal_year_id` int(11) NOT NULL,
  `period_month` int(11) DEFAULT NULL,
  `opening_balance` decimal(15,2) DEFAULT 0.00,
  `total_debit` decimal(15,2) DEFAULT 0.00,
  `total_credit` decimal(15,2) DEFAULT 0.00,
  `closing_balance` decimal(15,2) DEFAULT 0.00,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_ledger` (`account_id`,`fiscal_year_id`,`period_month`),
  KEY `fiscal_year_id` (`fiscal_year_id`),
  CONSTRAINT `fnc_general_ledger_ibfk_1` FOREIGN KEY (`account_id`) REFERENCES `fnc_account` (`id`),
  CONSTRAINT `fnc_general_ledger_ibfk_2` FOREIGN KEY (`fiscal_year_id`) REFERENCES `fnc_fiscal_year` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=40 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_uca1400_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `fnc_general_ledger`
--

LOCK TABLES `fnc_general_ledger` WRITE;
/*!40000 ALTER TABLE `fnc_general_ledger` DISABLE KEYS */;
INSERT INTO `fnc_general_ledger` (`id`, `account_id`, `fiscal_year_id`, `period_month`, `opening_balance`, `total_debit`, `total_credit`, `closing_balance`) VALUES (1,2,1,8,0.00,0.00,0.00,0.00),(2,17,1,8,0.00,0.00,0.00,0.00),(3,3,1,8,0.00,0.00,0.00,0.00),(4,18,1,8,0.00,0.00,0.00,0.00),(5,11,1,8,0.00,0.00,0.00,0.00),(6,27,1,8,0.00,0.00,0.00,0.00),(7,5,1,8,0.00,0.00,0.00,0.00),(8,20,1,8,0.00,0.00,0.00,0.00),(9,6,1,8,0.00,0.00,0.00,0.00),(10,21,1,8,0.00,0.00,0.00,0.00),(11,7,1,8,0.00,0.00,0.00,0.00),(12,22,1,8,0.00,0.00,0.00,0.00),(13,8,1,8,0.00,0.00,0.00,0.00),(14,23,1,8,0.00,0.00,0.00,0.00),(15,14,1,8,0.00,0.00,0.00,0.00),(16,30,1,8,0.00,0.00,0.00,0.00),(17,9,1,8,0.00,0.00,0.00,0.00),(18,24,1,8,0.00,0.00,0.00,0.00),(19,2,1,9,0.00,830970.00,91350.00,739620.00),(20,17,1,9,0.00,210.00,830970.00,830760.00),(21,3,1,9,0.00,235740.00,23940.00,211800.00),(22,18,1,9,0.00,30.00,235740.00,235710.00),(23,4,1,9,0.00,112949.00,1300.00,111649.00),(24,19,1,9,0.00,0.00,112949.00,112949.00),(25,11,1,9,0.00,262710.00,29540.00,233170.00),(26,27,1,9,0.00,0.00,262710.00,262710.00),(27,5,1,9,0.00,608983.00,17860.00,591123.00),(28,20,1,9,0.00,0.00,608983.00,608983.00),(29,6,1,9,0.00,783013.00,4755.00,778258.00),(30,21,1,9,0.00,0.00,783013.00,783013.00),(31,7,1,9,0.00,84694.00,3200.00,81494.00),(32,22,1,9,0.00,0.00,84694.00,84694.00),(33,8,1,9,0.00,792200.00,13450.00,778750.00),(34,23,1,9,0.00,0.00,792200.00,792200.00),(35,14,1,9,0.00,429800.00,5740.00,424060.00),(36,30,1,9,0.00,0.00,429800.00,429800.00),(37,9,1,9,0.00,932056.00,200.00,931856.00),(38,24,1,9,0.00,0.00,932056.00,932056.00),(39,48,1,9,0.00,191095.00,0.00,191095.00);
/*!40000 ALTER TABLE `fnc_general_ledger` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `fnc_opening_balance`
--

DROP TABLE IF EXISTS `fnc_opening_balance`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `fnc_opening_balance` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `account_id` int(11) NOT NULL,
  `fiscal_year_id` int(11) NOT NULL,
  `debit_amount` decimal(15,2) DEFAULT 0.00,
  `credit_amount` decimal(15,2) DEFAULT 0.00,
  `created_by` varchar(100) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_opening` (`account_id`,`fiscal_year_id`),
  KEY `fiscal_year_id` (`fiscal_year_id`),
  CONSTRAINT `fnc_opening_balance_ibfk_1` FOREIGN KEY (`account_id`) REFERENCES `fnc_account` (`id`),
  CONSTRAINT `fnc_opening_balance_ibfk_2` FOREIGN KEY (`fiscal_year_id`) REFERENCES `fnc_fiscal_year` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_uca1400_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `fnc_opening_balance`
--

LOCK TABLES `fnc_opening_balance` WRITE;
/*!40000 ALTER TABLE `fnc_opening_balance` DISABLE KEYS */;
/*!40000 ALTER TABLE `fnc_opening_balance` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `hrms_employee_info`
--

DROP TABLE IF EXISTS `hrms_employee_info`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `hrms_employee_info` (
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
  KEY `fk_hrms_emp_street` (`address_streets_id`),
  CONSTRAINT `fk_hrms_emp_branch` FOREIGN KEY (`branchs_id`) REFERENCES `branchs` (`id`) ON DELETE SET NULL,
  CONSTRAINT `fk_hrms_emp_city` FOREIGN KEY (`address_city_id`) REFERENCES `address_city` (`id`) ON DELETE SET NULL,
  CONSTRAINT `fk_hrms_emp_dept` FOREIGN KEY (`department_id`) REFERENCES `hrms_departments` (`id`) ON DELETE SET NULL,
  CONSTRAINT `fk_hrms_emp_grade` FOREIGN KEY (`job_grade_id`) REFERENCES `hrms_job_grades` (`id`) ON DELETE SET NULL,
  CONSTRAINT `fk_hrms_emp_ketena` FOREIGN KEY (`address_ketena_id`) REFERENCES `address_ketena` (`id`) ON DELETE SET NULL,
  CONSTRAINT `fk_hrms_emp_pos` FOREIGN KEY (`position_id`) REFERENCES `hrms_positions` (`id`) ON DELETE SET NULL,
  CONSTRAINT `fk_hrms_emp_street` FOREIGN KEY (`address_streets_id`) REFERENCES `address_streets` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `hrms_employee_info`
--

LOCK TABLES `hrms_employee_info` WRITE;
/*!40000 ALTER TABLE `hrms_employee_info` DISABLE KEYS */;
INSERT INTO `hrms_employee_info` (`id`, `employee_id`, `tin_number`, `fayda_national_id`, `pension_number`, `full_name`, `full_name_am`, `mother_name`, `marital_status`, `disability_status`, `sex`, `date_of_birth`, `nationality`, `blood_group`, `department_id`, `position_id`, `job_grade_id`, `duty_station`, `branchs_id`, `address_city_id`, `address_ketena_id`, `address_streets_id`, `phone_number`, `email`, `emergency_contact_name`, `emergency_contact_phone`, `employment_type`, `employment_status`, `first_employment_date`, `yeteketerubet_ken`, `probation_end_date`, `tureta_yemiwetubet_ken`, `current_salary`, `biometric_pin`, `rfid_card_number`, `primary_bank_name`, `primary_bank_account`, `primary_bank_branch`, `secondary_bank_name`, `secondary_bank_account`, `secondary_bank_branch`, `secondary_payment_purpose`, `employee_photo`, `employee_signature`, `registered_by`, `registered_date`, `modified_by`, `modified_date`, `is_deleted`, `is_salary_defaults_modified`) VALUES (1,'EMP-TEST-001','','','','Abebe Kebede Tesfaye','ßèáßëáßëá ßè¿ßëáßï░ ßë░ßêÁßìïßï¿','','SINGLE','NONE','MALE','2026-09-09','Ethiopian',NULL,NULL,NULL,NULL,'Head Office',NULL,NULL,NULL,NULL,'','',NULL,NULL,'PERMANENT','ACTIVE',NULL,NULL,NULL,NULL,18500,'1001',NULL,'Commercial Bank of Ethiopia','1000123456789',NULL,'Abay Bank','2000987654321',NULL,'Per Diem & Special Allowances',NULL,NULL,NULL,'2026-09-13 09:47:08',1,'2026-09-25 19:15:59',0,0),(2,' kb005','','','','selam sheshaber store ','selam sheshaber store am','','SINGLE','NONE','FEMALE','2026-10-22','Ethiopian',NULL,6,9,NULL,'Head Office',6,NULL,NULL,NULL,'','',NULL,NULL,'PERMANENT','ACTIVE',NULL,NULL,NULL,NULL,1000,'',NULL,'Commercial Bank of Ethiopia','',NULL,'Abay Bank','',NULL,'Per Diem & Special Allowances',NULL,NULL,NULL,'2026-10-05 07:28:43',1,'2026-10-05 12:49:59',0,0);
/*!40000 ALTER TABLE `hrms_employee_info` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `hrms_payroll_account_map`
--

DROP TABLE IF EXISTS `hrms_payroll_account_map`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `hrms_payroll_account_map` (
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
  KEY `fk_hrms_acct_map_fnc` (`account_id`),
  CONSTRAINT `fk_hrms_acct_map_fnc` FOREIGN KEY (`account_id`) REFERENCES `fnc_account` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=12 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `hrms_payroll_account_map`
--

LOCK TABLES `hrms_payroll_account_map` WRITE;
/*!40000 ALTER TABLE `hrms_payroll_account_map` DISABLE KEYS */;
INSERT INTO `hrms_payroll_account_map` (`id`, `mapping_key`, `account_id`, `label`, `label_am`, `entry_type`, `created_at`, `updated_at`) VALUES (1,'HRMS_DR_BASIC_SALARY',69,'Basic Salaries Expense','ßêÿßê░ßê¿ßë│ßïè ßï░ßêÿßïêßïØ ßïêßî¬','DEBIT','2026-09-13 11:38:17','2026-09-13 11:38:17'),(2,'HRMS_DR_OVERTIME',70,'Overtime Pay Expense','ßï¿ßëÁßê¡ßìì ßê░ßïôßëÁ ßè¡ßììßï½ ßïêßî¬','DEBIT','2026-09-13 11:38:17','2026-09-13 11:38:17'),(3,'HRMS_DR_HOUSING_ALLOWANCE',71,'Housing Allowances Expense','ßï¿ßëñßëÁ ßè¬ßê½ßï¡ ßèáßëáßêì ßïêßî¬','DEBIT','2026-09-13 11:38:17','2026-09-13 11:38:17'),(4,'HRMS_DR_TRANSPORT_ALLOWANCE',72,'Transport Allowances Expense','ßï¿ßëÁßê½ßèòßêÁßìûßê¡ßëÁ ßèáßëáßêì ßïêßî¬','DEBIT','2026-09-13 11:38:17','2026-09-13 11:38:17'),(5,'HRMS_DR_HAZARD_ALLOWANCE',73,'Hazard & Chemical Allowances Expense','ßï¿ßè¡ßêÄßê¬ßèòßèô ßè¼ßêÜßè½ßêì ßèáßëáßêì ßïêßî¬','DEBIT','2026-09-13 11:38:17','2026-09-13 11:38:17'),(6,'HRMS_DR_EMPLOYER_PENSION_11',74,'Employer Pension Contribution 11%','ßï¿ßèáßê░ßê¬ßïì ßîíßê¿ßë│ ßêÿßïïßî« 11% ßïêßî¬','DEBIT','2026-09-13 11:38:17','2026-09-13 11:38:17'),(7,'HRMS_CR_TAX_PAYABLE',76,'Employment Income Tax Payable (Schedule A)','ßï¿ßêÑßê½ ßîìßëÑßê¡ ßë░ßè¿ßìïßï¡','CREDIT','2026-09-13 11:38:17','2026-09-13 11:38:17'),(8,'HRMS_CR_PENSION_PAYABLE_18',77,'Pension Contribution Payable (18%)','ßï¿ßîíßê¿ßë│ ßêÿßïïßî« ßë░ßè¿ßìïßï¡ (18%)','CREDIT','2026-09-13 11:38:17','2026-09-13 11:38:17'),(9,'HRMS_CR_EDIR_PAYABLE',78,'Staff Association & Edir Payable','ßï¿ßèÑßïÁßê¡ßèô ßëÑßïÁßê¡ ßë░ßëÇßèôßê¢ ßë░ßè¿ßìïßï¡','CREDIT','2026-09-13 11:38:17','2026-09-13 11:38:17'),(10,'HRMS_CR_NET_SALARY_CBE',79,'Net Salaries Payable ÔÇö Commercial Bank of Ethiopia','ßï¿ßë░ßîúßê½ ßï░ßêÿßïêßïØ ßë░ßè¿ßìïßï¡ (ßèòßîìßïÁ ßëúßèòßè¡)','CREDIT','2026-09-13 11:38:17','2026-09-13 11:38:17'),(11,'HRMS_CR_NET_SALARY_ABAY',80,'Net Salaries Payable ÔÇö Abay Bank','ßï¿ßë░ßîúßê½ ßï░ßêÿßïêßïØ ßë░ßè¿ßìïßï¡ (ßèáßëúßï¡ ßëúßèòßè¡)','CREDIT','2026-09-13 11:38:17','2026-09-13 11:38:17');
/*!40000 ALTER TABLE `hrms_payroll_account_map` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `inv_item`
--

DROP TABLE IF EXISTS `inv_item`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `inv_item` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `item_code` varchar(30) NOT NULL,
  `item_name` varchar(200) NOT NULL,
  `item_name_am` varchar(200) DEFAULT NULL,
  `description` varchar(500) DEFAULT NULL,
  `category_id` int(11) NOT NULL,
  `item_group_id` int(11) DEFAULT NULL,
  `unit_of_measure_id` int(11) NOT NULL,
  `reorder_level` int(11) NOT NULL DEFAULT 0,
  `reorder_quantity` int(11) NOT NULL DEFAULT 0,
  `tracking_type` enum('NONE','BATCH','EXPIRY','SERIAL','MOTOR') NOT NULL DEFAULT 'NONE',
  `item_usage` enum('FOR_SALE','COMPANY_USE','BOTH') NOT NULL DEFAULT 'BOTH',
  `default_unit_cost` decimal(15,2) DEFAULT 0.00,
  `vat_rate` decimal(5,2) DEFAULT 15.00,
  `is_active` tinyint(1) NOT NULL DEFAULT 1,
  `deleted` varchar(20) NOT NULL DEFAULT 'No',
  `created_by` varchar(100) DEFAULT NULL,
  `created_at` datetime DEFAULT current_timestamp(),
  `updated_at` datetime DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `is_water_meter` tinyint(1) NOT NULL DEFAULT 0,
  PRIMARY KEY (`id`),
  UNIQUE KEY `item_code` (`item_code`),
  KEY `fk_item_category` (`category_id`),
  KEY `fk_item_group` (`item_group_id`),
  KEY `fk_item_uom` (`unit_of_measure_id`),
  CONSTRAINT `fk_item_category` FOREIGN KEY (`category_id`) REFERENCES `inv_item_category` (`id`),
  CONSTRAINT `fk_item_group` FOREIGN KEY (`item_group_id`) REFERENCES `inv_item_group` (`id`),
  CONSTRAINT `fk_item_uom` FOREIGN KEY (`unit_of_measure_id`) REFERENCES `inv_unit_of_measure` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=18 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_uca1400_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `inv_item`
--

LOCK TABLES `inv_item` WRITE;
/*!40000 ALTER TABLE `inv_item` DISABLE KEYS */;
INSERT INTO `inv_item` (`id`, `item_code`, `item_name`, `item_name_am`, `description`, `category_id`, `item_group_id`, `unit_of_measure_id`, `reorder_level`, `reorder_quantity`, `tracking_type`, `item_usage`, `default_unit_cost`, `vat_rate`, `is_active`, `deleted`, `created_by`, `created_at`, `updated_at`, `is_water_meter`) VALUES (1,'1122-00001','foset','amfoset','',1,NULL,1,0,0,'NONE','BOTH',0.00,15.00,1,'No','system','2026-09-06 06:39:28','2026-09-08 15:12:38',0),(2,'1122-00002','water Meter','ßê£ßëÁßê¡','',1,2,1,10,50,'NONE','FOR_SALE',900.00,15.00,1,'No','reading2','2026-09-06 07:59:45','2026-09-29 19:29:59',0),(3,'1122-00003','HDP pipe','HDP ßë▒ßëª ','',1,3,2,10,50,'NONE','FOR_SALE',500.00,15.00,1,'No','admin2','2026-09-08 10:34:37','2026-09-29 19:29:59',0),(4,'PIPE-00002','GI Pipe 1/2\"','ßï¿ßëÑßê¿ßëÁ 1/2\"',NULL,1,NULL,2,10,50,'NONE','BOTH',230.00,15.00,1,'No',NULL,'2026-09-12 22:16:11','2026-09-30 18:14:13',0),(5,'FIT-00001','Male Adapter 1/2\"','ßïêßèòßïÁ ßèáßï│ßìòßë░ßê¡ 1/2\"',NULL,1,NULL,1,20,100,'NONE','BOTH',120.00,15.00,1,'No',NULL,'2026-09-12 22:16:11','2026-09-12 22:16:11',0),(6,'FIT-00002','Female Adapter 1/2\"','ßê┤ßëÁ ßèáßï│ßìòßë░ßê¡ 1/2\"',NULL,1,NULL,1,20,100,'NONE','BOTH',28.00,15.00,1,'No',NULL,'2026-09-12 22:16:11','2026-09-12 22:16:11',0),(7,'FIT-00003','Union / Saddle 1 1/2\" - 1\"','ßï®ßèÆßï¿ßèò /ßê│ßïÁßêì ßè«ßèö 1 1/2\" - 1\"',NULL,1,NULL,1,10,50,'NONE','BOTH',115.00,15.00,1,'No',NULL,'2026-09-12 22:16:11','2026-10-05 13:47:54',0),(8,'FIT-00004','Stop Valve 1/2\"','ßêÁßëÂßìò ßë½ßêìßë¡/ßè«ßè¡ 1/2\"',NULL,1,NULL,1,15,60,'NONE','BOTH',52.00,15.00,1,'No',NULL,'2026-09-12 22:16:11','2026-09-12 22:16:11',0),(9,'FIT-00005','Gate Valve 1/2\"','ßîîßëÁ ßë½ßêìßë¡ 1/2\"',NULL,1,NULL,1,15,60,'NONE','BOTH',88.00,15.00,1,'No',NULL,'2026-09-12 22:16:11','2026-09-12 22:16:11',0),(10,'FIT-00006','Teflon Tape','ßë┤ßììßêÄßèò ßë┤ßìò','',1,NULL,1,50,200,'NONE','BOTH',100.00,15.00,1,'No',NULL,'2026-09-12 22:16:11','2026-09-25 19:18:50',0),(11,'FIT-00007','Clamp Saddle','ßè¡ßêïßêØßìò ßê│ßïÁßêì',NULL,1,NULL,1,20,80,'NONE','BOTH',65.00,15.00,1,'No',NULL,'2026-09-12 22:16:11','2026-09-12 22:16:11',0),(12,'FIT-00008','Nipple 1/2\"','ßèÆßìòßêì 1/2\"',NULL,1,NULL,1,30,100,'NONE','BOTH',690.00,15.00,1,'No',NULL,'2026-09-12 22:16:11','2026-09-30 20:24:45',0),(13,'FIT-00009','Elbow 1/2\"','ßè¡ßê¡ßèò 1/2\"',NULL,1,NULL,1,30,100,'NONE','BOTH',2300.00,15.00,1,'No',NULL,'2026-09-12 22:16:11','2026-09-30 20:24:45',0),(14,'FIT-00010','Compression Tee 1/2\"','ßè«ßêØßìòßê¿ßê¢ßèò ßë▓ 1/2\"',NULL,1,NULL,1,20,80,'NONE','BOTH',34.50,15.00,1,'No',NULL,'2026-09-12 22:16:11','2026-09-30 19:32:29',0),(15,'FIT-00011','End Cap 1/2\"','ßèÑßèòßï▓ ßè½ßìò 1/2\"',NULL,1,NULL,1,20,80,'NONE','BOTH',1000.00,15.00,1,'No',NULL,'2026-09-12 22:16:11','2026-09-30 13:23:21',0),(16,'FIT-00012','Coupling Reducer 1\" - 1/2\"','ßè«ßìòßêèßèòßîì ßê¬ßï▓ßïìßê░ßê¡ 1\" - 1/2\"',NULL,1,NULL,1,20,80,'NONE','BOTH',575.00,15.00,1,'No',NULL,'2026-09-12 22:16:11','2026-09-30 18:14:13',0),(17,'PIPE-00003','GI Pipe Full Length','ßëúßêêßêÖßêë ßê¡ßïØßêÿßëÁ ßëÑßê¿ßëÁ',NULL,1,NULL,2,5,20,'NONE','BOTH',190.00,15.00,1,'No',NULL,'2026-09-12 22:16:11','2026-09-12 22:16:11',0);
/*!40000 ALTER TABLE `inv_item` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `inv_store_user`
--

DROP TABLE IF EXISTS `inv_store_user`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `inv_store_user` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `store_id` int(11) NOT NULL,
  `user_account_id` int(11) NOT NULL,
  `role_in_store` varchar(50) DEFAULT 'STORE_KEEPER',
  `is_primary` tinyint(1) DEFAULT 0,
  `is_active` tinyint(1) DEFAULT 1,
  `assigned_by` varchar(100) DEFAULT NULL,
  `assigned_date` datetime DEFAULT current_timestamp(),
  `notes` text DEFAULT NULL,
  `created_at` datetime DEFAULT current_timestamp(),
  `updated_at` datetime DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `idx_store_user_store` (`store_id`),
  KEY `idx_store_user_account` (`user_account_id`),
  CONSTRAINT `fk_inv_store_user_account` FOREIGN KEY (`user_account_id`) REFERENCES `user_account` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_inv_store_user_store` FOREIGN KEY (`store_id`) REFERENCES `inv_store` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_uca1400_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `inv_store_user`
--

LOCK TABLES `inv_store_user` WRITE;
/*!40000 ALTER TABLE `inv_store_user` DISABLE KEYS */;
INSERT INTO `inv_store_user` (`id`, `store_id`, `user_account_id`, `role_in_store`, `is_primary`, `is_active`, `assigned_by`, `assigned_date`, `notes`, `created_at`, `updated_at`) VALUES (1,2,204,'STORE_KEEPER',1,1,'system','2026-09-09 15:16:53','Branch storekeeper','2026-09-09 15:16:53','2026-09-09 15:16:53'),(2,1,209,'STORE_KEEPER',1,1,'system','2026-09-09 15:17:02','Main storekeeper','2026-09-09 15:17:02','2026-09-09 15:17:02'),(3,4,227,'STORE_MANAGER',0,1,'admin2','2026-09-19 18:46:43','','2026-09-19 18:46:43','2026-09-20 07:47:25'),(4,3,219,'STORE_KEEPER',0,1,'admin2','2026-09-21 11:17:28','','2026-09-21 11:17:28','2026-09-21 11:17:28');
/*!40000 ALTER TABLE `inv_store_user` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `inv_purchase_requisition`
--

DROP TABLE IF EXISTS `inv_purchase_requisition`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `inv_purchase_requisition` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `requisition_number` varchar(50) NOT NULL,
  `store_id` int(11) DEFAULT NULL,
  `department_id` int(11) DEFAULT NULL,
  `employee_id` int(11) DEFAULT NULL,
  `position_title` varchar(150) DEFAULT NULL,
  `requested_by` varchar(100) NOT NULL,
  `requested_date` date NOT NULL,
  `status` enum('DRAFT','SUBMITTED','APPROVED_L1','APPROVED_L2','APPROVED','REJECTED','CONVERTED_TO_PO','CANCELLED') NOT NULL DEFAULT 'DRAFT',
  `approved_by_l1` varchar(100) DEFAULT NULL,
  `approved_date_l1` datetime DEFAULT NULL,
  `approved_by_l2` varchar(100) DEFAULT NULL,
  `approved_date_l2` datetime DEFAULT NULL,
  `rejected_by` varchar(100) DEFAULT NULL,
  `rejected_date` datetime DEFAULT NULL,
  `rejection_reason` varchar(500) DEFAULT NULL,
  `remarks` varchar(500) DEFAULT NULL,
  `total_estimated_amount` decimal(15,2) NOT NULL DEFAULT 0.00,
  `created_by` varchar(100) DEFAULT NULL,
  `created_at` datetime DEFAULT current_timestamp(),
  `updated_at` datetime DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `requisition_number` (`requisition_number`),
  KEY `fk_pr_store` (`store_id`),
  KEY `idx_pr_status` (`status`),
  KEY `fk_pr_department` (`department_id`),
  KEY `fk_pr_employee` (`employee_id`),
  CONSTRAINT `fk_pr_department` FOREIGN KEY (`department_id`) REFERENCES `hrms_departments` (`id`) ON DELETE SET NULL,
  CONSTRAINT `fk_pr_employee` FOREIGN KEY (`employee_id`) REFERENCES `hrms_employee_info` (`id`) ON DELETE SET NULL,
  CONSTRAINT `fk_pr_store` FOREIGN KEY (`store_id`) REFERENCES `inv_store` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=18 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_uca1400_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `inv_purchase_requisition`
--

LOCK TABLES `inv_purchase_requisition` WRITE;
/*!40000 ALTER TABLE `inv_purchase_requisition` DISABLE KEYS */;
INSERT INTO `inv_purchase_requisition` (`id`, `requisition_number`, `store_id`, `department_id`, `employee_id`, `position_title`, `requested_by`, `requested_date`, `status`, `approved_by_l1`, `approved_date_l1`, `approved_by_l2`, `approved_date_l2`, `rejected_by`, `rejected_date`, `rejection_reason`, `remarks`, `total_estimated_amount`, `created_by`, `created_at`, `updated_at`) VALUES (7,'PR-2026-00001',1,NULL,NULL,NULL,'mstore','2026-09-08','CONVERTED_TO_PO','fhead','2026-09-08 12:17:37','pofficer','2026-09-08 12:18:16',NULL,NULL,NULL,'firstREqu',22000.00,'mstore','2026-09-08 12:16:13','2026-09-08 12:19:57'),(8,'PR-2026-00002',3,NULL,NULL,NULL,'3store','2026-09-14','DRAFT',NULL,NULL,NULL,NULL,NULL,NULL,NULL,'for sale on branch 3',51000.00,'3store','2026-09-14 06:38:02','2026-09-14 06:38:02'),(9,'PR-2026-00003',3,NULL,NULL,NULL,'3store','2026-09-14','CONVERTED_TO_PO','reading2','2026-09-30 13:13:32','reading2','2026-09-30 13:14:43',NULL,NULL,NULL,'for sale',5000.00,'3store','2026-09-14 06:47:18','2026-09-30 13:20:02'),(10,'PR-2026-00004',4,NULL,NULL,NULL,'4store','2026-09-19','CONVERTED_TO_PO','fhead','2026-09-21 06:17:26','pofficer','2026-09-21 06:17:52',NULL,NULL,NULL,'',140000.00,'4store','2026-09-19 18:48:45','2026-09-21 06:19:50'),(11,'PR-2026-00005',2,NULL,NULL,NULL,'mstore','2026-09-20','CONVERTED_TO_PO','fhead','2026-09-20 08:27:54','pofficer','2026-09-20 08:29:53',NULL,NULL,NULL,'',1040.00,'mstore','2026-09-20 08:24:26','2026-09-20 08:31:51'),(12,'PR-2026-00006',4,NULL,NULL,NULL,'4store','2026-09-21','CONVERTED_TO_PO','fhead','2026-09-21 13:58:13','pofficer','2026-09-21 13:58:53',NULL,NULL,NULL,'',23100.00,'4store','2026-09-21 13:56:54','2026-09-21 14:00:58'),(13,'PR-2026-00007',4,NULL,NULL,NULL,'4store','2026-09-29','CONVERTED_TO_PO','fhead','2026-09-29 19:17:22','pofficer','2026-09-29 19:18:20',NULL,NULL,NULL,'',23000.00,'4store','2026-09-29 19:14:35','2026-09-29 19:27:35'),(14,'PR-2026-00008',4,NULL,NULL,NULL,'4store','2026-09-30','CONVERTED_TO_PO','fhead','2026-09-30 18:00:22','pofficer','2026-09-30 18:00:47',NULL,NULL,NULL,'',5000.00,'4store','2026-09-30 17:57:03','2026-09-30 18:03:03'),(15,'PR-2026-00009',4,NULL,NULL,NULL,'4store','2026-09-30','CONVERTED_TO_PO','fhead','2026-09-30 19:11:44','pofficer','2026-09-30 19:12:34',NULL,NULL,NULL,'',2140.00,'4store','2026-09-30 19:09:07','2026-09-30 19:14:38'),(16,'PR-02027',2,6,1,NULL,'mstore','2026-10-05','SUBMITTED',NULL,NULL,NULL,NULL,NULL,NULL,NULL,'',36000.00,'mstore','2026-10-05 07:54:40','2026-10-05 07:54:45'),(17,'PR-02028',2,6,2,'Payroll & General Ledger Accountant','mstore','2026-10-05','CONVERTED_TO_PO','fhead','2026-10-05 13:17:38','reading2','2026-10-05 13:19:37',NULL,NULL,NULL,'',4000.00,'mstore','2026-10-05 13:11:52','2026-10-05 13:25:36');
/*!40000 ALTER TABLE `inv_purchase_requisition` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `wf_workflow_action`
--

DROP TABLE IF EXISTS `wf_workflow_action`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `wf_workflow_action` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `instance_id` bigint(20) NOT NULL,
  `step_id` int(11) NOT NULL,
  `action` varchar(20) NOT NULL,
  `acted_by` varchar(100) NOT NULL,
  `acted_at` datetime DEFAULT current_timestamp(),
  `comments` varchar(500) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `instance_id` (`instance_id`),
  KEY `step_id` (`step_id`)
) ENGINE=MyISAM AUTO_INCREMENT=68 DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `wf_workflow_action`
--

LOCK TABLES `wf_workflow_action` WRITE;
/*!40000 ALTER TABLE `wf_workflow_action` DISABLE KEYS */;
INSERT INTO `wf_workflow_action` (`id`, `instance_id`, `step_id`, `action`, `acted_by`, `acted_at`, `comments`) VALUES (1,1,1,'APPROVED','mstore','2026-09-07 13:48:34','Approved'),(2,1,2,'APPROVED','fhead','2026-09-07 13:49:26','Approved'),(3,1,3,'APPROVED','pofficer','2026-09-07 14:11:39','Approved'),(4,1,3,'APPROVED','pofficer','2026-09-07 14:12:15','Approved'),(5,1,3,'APPROVED','pofficer','2026-09-07 14:12:55','Approved'),(6,1,3,'APPROVED','pofficer','2026-09-07 14:16:31','Approved'),(7,1,3,'APPROVED','pofficer','2026-09-07 14:18:19','Approved'),(8,1,3,'APPROVED','pofficer','2026-09-07 14:19:08','Approved'),(9,1,3,'APPROVED','pofficer','2026-09-07 14:19:19','Approved'),(10,1,3,'APPROVED','pofficer','2026-09-07 14:26:21','Approved'),(11,2,1,'APPROVED','badmin','2026-09-07 15:00:28','Approved'),(12,2,2,'APPROVED','fhead','2026-09-07 15:01:52','Approved'),(13,2,3,'APPROVED','pofficer','2026-09-07 15:02:24','Approved'),(14,3,4,'APPROVED','fhead','2026-09-07 17:45:50','Approved'),(15,4,1,'APPROVED','badmin','2026-09-08 10:37:01','Approved'),(16,4,2,'APPROVED','fhead','2026-09-08 10:37:46','Approved'),(17,4,3,'APPROVED','pofficer','2026-09-08 10:38:12','Approved'),(18,5,4,'APPROVED','fhead','2026-09-08 10:41:03','Approved'),(19,5,5,'APPROVED','reading2','2026-09-08 10:42:03','Approved'),(20,6,1,'APPROVED','badmin','2026-09-08 12:16:56','Approved'),(21,6,2,'APPROVED','fhead','2026-09-08 12:17:37','Approved'),(22,6,3,'APPROVED','pofficer','2026-09-08 12:18:16','Approved'),(23,7,4,'APPROVED','fhead','2026-09-08 12:20:49','Approved'),(24,8,6,'APPROVED','badmin','2026-09-08 14:20:45','Approved'),(25,8,10,'APPROVED','fhead','2026-09-08 14:22:44','Approved'),(26,9,1,'APPROVED','badmin','2026-09-20 08:27:19','Approved'),(27,9,2,'APPROVED','fhead','2026-09-20 08:27:54','Approved'),(28,9,3,'APPROVED','pofficer','2026-09-20 08:29:53','Approved'),(29,10,4,'APPROVED','fhead','2026-09-20 08:32:30','Approved'),(30,11,1,'APPROVED','4branchadmin','2026-09-21 06:16:15','Approved'),(31,11,2,'APPROVED','fhead','2026-09-21 06:17:26','Approved'),(32,11,3,'APPROVED','pofficer','2026-09-21 06:17:52','Approved'),(33,12,4,'APPROVED','fhead','2026-09-21 06:21:23','Approved'),(34,13,1,'APPROVED','4branchadmin','2026-09-21 13:57:46','Approved'),(35,13,2,'APPROVED','fhead','2026-09-21 13:58:13','Approved'),(36,13,3,'APPROVED','pofficer','2026-09-21 13:58:53','Approved'),(37,14,4,'APPROVED','fhead','2026-09-21 14:01:42','Approved'),(38,16,10,'APPROVED','fhead','2026-09-21 16:12:26','Approved'),(39,17,10,'APPROVED','fhead','2026-09-21 17:21:17','Approved'),(40,18,10,'REJECTED','fhead','2026-09-21 17:38:59','bbbb'),(41,19,10,'APPROVED','fhead','2026-09-21 17:41:01','Approved'),(42,20,10,'APPROVED','fhead','2026-09-21 19:49:17','Approved'),(43,21,10,'APPROVED','fhead','2026-09-24 12:56:35','Approved'),(44,22,1,'APPROVED','4branchadmin','2026-09-29 19:16:23','Approved'),(45,22,2,'APPROVED','fhead','2026-09-29 19:17:22','Approved'),(46,22,3,'APPROVED','pofficer','2026-09-29 19:18:20','Approved'),(47,23,4,'APPROVED','fhead','2026-09-29 19:28:29','Approved'),(48,24,1,'APPROVED','reading2','2026-09-30 13:13:22','Approved'),(49,24,2,'APPROVED','reading2','2026-09-30 13:13:32','Approved'),(50,24,3,'APPROVED','reading2','2026-09-30 13:14:43','Approved'),(51,25,4,'APPROVED','reading2','2026-09-30 13:20:44','Approved'),(52,26,10,'APPROVED','fhead','2026-09-30 13:49:19','Approved'),(53,27,1,'APPROVED','4branchadmin','2026-09-30 17:58:47','Approved'),(54,27,2,'APPROVED','fhead','2026-09-30 18:00:22','Approved'),(55,27,3,'APPROVED','pofficer','2026-09-30 18:00:47','Approved'),(56,28,4,'APPROVED','fhead','2026-09-30 18:10:11','Approved'),(57,29,1,'APPROVED','4branchadmin','2026-09-30 19:11:02','Approved'),(58,29,2,'APPROVED','fhead','2026-09-30 19:11:44','Approved'),(59,29,3,'APPROVED','pofficer','2026-09-30 19:12:34','Approved'),(60,30,4,'APPROVED','fhead','2026-09-30 19:29:59','Approved'),(61,31,4,'APPROVED','fhead','2026-09-30 20:23:28','Approved'),(62,33,1,'APPROVED','badmin','2026-10-05 13:16:28','Approved'),(63,33,2,'APPROVED','fhead','2026-10-05 13:17:38','Approved'),(64,33,3,'APPROVED','reading2','2026-10-05 13:19:37','Approved'),(65,34,4,'APPROVED','fhead','2026-10-05 13:26:11','Approved'),(66,36,11,'APPROVED','badmin','2026-10-05 18:59:56','Approved'),(67,36,10,'APPROVED','fhead','2026-10-05 19:01:00','Approved');
/*!40000 ALTER TABLE `wf_workflow_action` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `wf_workflow_instance`
--

DROP TABLE IF EXISTS `wf_workflow_instance`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `wf_workflow_instance` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `template_id` int(11) NOT NULL,
  `document_type` varchar(50) NOT NULL,
  `document_id` bigint(20) NOT NULL,
  `document_number` varchar(50) DEFAULT NULL,
  `current_step_id` int(11) DEFAULT NULL,
  `status` varchar(30) NOT NULL DEFAULT 'IN_PROGRESS',
  `initiated_by` varchar(100) DEFAULT NULL,
  `initiated_at` datetime DEFAULT current_timestamp(),
  `completed_at` datetime DEFAULT NULL,
  `total_amount` decimal(15,2) DEFAULT NULL,
  `branch_id` int(11) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `template_id` (`template_id`),
  KEY `current_step_id` (`current_step_id`),
  KEY `idx_wfi_doc` (`document_type`,`document_id`),
  KEY `idx_wfi_status` (`status`)
) ENGINE=MyISAM AUTO_INCREMENT=37 DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `wf_workflow_instance`
--

LOCK TABLES `wf_workflow_instance` WRITE;
/*!40000 ALTER TABLE `wf_workflow_instance` DISABLE KEYS */;
INSERT INTO `wf_workflow_instance` (`id`, `template_id`, `document_type`, `document_id`, `document_number`, `current_step_id`, `status`, `initiated_by`, `initiated_at`, `completed_at`, `total_amount`, `branch_id`) VALUES (1,1,'PURCHASE_REQUISITION',4,'PR-2026-00004',NULL,'COMPLETED','mstore','2026-09-07 13:46:35','2026-09-07 17:52:07',148500.00,NULL),(2,1,'PURCHASE_REQUISITION',5,'PR-2026-00005',NULL,'COMPLETED','mstore','2026-09-07 14:58:56','2026-09-07 15:02:24',2300.00,NULL),(3,2,'PURCHASE_ORDER',1,'PO-2026-00001',NULL,'COMPLETED','pofficer','2026-09-07 17:39:28','2026-09-07 17:45:50',2645.00,1),(4,1,'PURCHASE_REQUISITION',6,'PR-2026-00006',NULL,'COMPLETED','mstore','2026-09-08 10:36:07','2026-09-08 10:38:12',100000.00,NULL),(5,2,'PURCHASE_ORDER',3,'PO-2026-00003',NULL,'COMPLETED','pofficer','2026-09-08 10:40:32','2026-09-08 10:42:03',74750.00,1),(6,1,'PURCHASE_REQUISITION',7,'PR-2026-00001',NULL,'COMPLETED','mstore','2026-09-08 12:16:16','2026-09-08 12:18:16',22000.00,NULL),(7,2,'PURCHASE_ORDER',4,'PO-2026-00001',NULL,'COMPLETED','pofficer','2026-09-08 12:20:03','2026-09-08 12:20:49',25300.00,1),(8,3,'STOCK_TRANSFER',3,'TRF-2026-00001',NULL,'COMPLETED','mstore','2026-09-08 14:19:47','2026-09-08 14:22:44',9800.00,NULL),(9,1,'PURCHASE_REQUISITION',11,'PR-2026-00005',NULL,'COMPLETED','mstore','2026-09-20 08:24:45','2026-09-20 08:29:53',1040.00,6),(10,2,'PURCHASE_ORDER',5,'PO-2026-00002',NULL,'COMPLETED','pofficer','2026-09-20 08:31:55','2026-09-20 08:32:30',2300.00,2),(11,1,'PURCHASE_REQUISITION',10,'PR-2026-00004',NULL,'COMPLETED','4store','2026-09-21 06:15:11','2026-09-21 06:17:52',140000.00,8),(12,2,'PURCHASE_ORDER',6,'PO-2026-00003',5,'IN_PROGRESS','pofficer','2026-09-21 06:20:04',NULL,218500.00,4),(13,1,'PURCHASE_REQUISITION',12,'PR-2026-00006',NULL,'COMPLETED','4store','2026-09-21 13:57:02','2026-09-21 13:58:53',23100.00,8),(14,2,'PURCHASE_ORDER',7,'PO-2026-00004',NULL,'COMPLETED','pofficer','2026-09-21 14:01:09','2026-09-21 14:01:42',68310.00,4),(15,3,'STOCK_TRANSFER',4,'TRF-2026-00002',6,'IN_PROGRESS','4store','2026-09-21 14:25:42',NULL,4240.00,1),(16,3,'STOCK_TRANSFER',5,'TRF-2026-00003',NULL,'COMPLETED','mostore','2026-09-21 14:30:29','2026-09-21 16:12:26',1860.00,1),(17,3,'STOCK_TRANSFER',6,'TRF-2026-00004',NULL,'COMPLETED','4store','2026-09-21 17:20:16','2026-09-21 17:21:17',6000.00,1),(18,3,'STOCK_TRANSFER',7,'TRF-2026-00005',10,'REJECTED','mostore','2026-09-21 17:38:06','2026-09-21 17:38:59',1320.00,1),(19,3,'STOCK_TRANSFER',8,'TRF-2026-00006',NULL,'COMPLETED','mostore','2026-09-21 17:40:26','2026-09-21 17:41:01',840.00,1),(20,3,'STOCK_TRANSFER',9,'TRF-2026-00007',NULL,'COMPLETED','4store','2026-09-21 19:36:55','2026-09-21 19:49:17',18760.00,8),(21,3,'STOCK_TRANSFER',10,'TRF-2026-00008',NULL,'COMPLETED','mostore','2026-09-24 12:55:56','2026-09-24 12:56:35',4280.00,1),(22,1,'PURCHASE_REQUISITION',13,'PR-2026-00007',NULL,'COMPLETED','4store','2026-09-29 19:14:42','2026-09-29 19:18:20',23000.00,8),(23,2,'PURCHASE_ORDER',8,'PO-2026-00005',NULL,'COMPLETED','pofficer','2026-09-29 19:27:42','2026-09-29 19:28:29',26450.00,4),(24,1,'PURCHASE_REQUISITION',9,'PR-2026-00003',NULL,'COMPLETED','reading2','2026-09-30 13:13:17','2026-09-30 13:14:43',5000.00,7),(25,2,'PURCHASE_ORDER',9,'PO-2026-00006',NULL,'COMPLETED','reading2','2026-09-30 13:20:32','2026-09-30 13:20:44',11500.00,3),(26,3,'STOCK_TRANSFER',11,'TRF-2026-00009',NULL,'COMPLETED','4store','2026-09-30 13:48:20','2026-09-30 13:49:19',6000.00,8),(27,1,'PURCHASE_REQUISITION',14,'PR-2026-00008',NULL,'COMPLETED','4store','2026-09-30 17:57:10','2026-09-30 18:00:47',5000.00,8),(28,2,'PURCHASE_ORDER',10,'PO-2026-00007',NULL,'COMPLETED','pofficer','2026-09-30 18:03:46','2026-09-30 18:10:11',69000.00,4),(29,1,'PURCHASE_REQUISITION',15,'PR-2026-00009',NULL,'COMPLETED','4store','2026-09-30 19:09:10','2026-09-30 19:12:34',2140.00,8),(30,2,'PURCHASE_ORDER',11,'PO-2026-00008',NULL,'COMPLETED','pofficer','2026-09-30 19:14:44','2026-09-30 19:29:59',575.00,4),(31,2,'PURCHASE_ORDER',12,'PO-2026-00009',NULL,'COMPLETED','pofficer','2026-09-30 20:22:42','2026-09-30 20:23:28',52900.00,2),(32,1,'PURCHASE_REQUISITION',16,'PR-02027',1,'IN_PROGRESS','mstore','2026-10-05 07:54:45',NULL,36000.00,6),(33,1,'PURCHASE_REQUISITION',17,'PR-02028',NULL,'COMPLETED','mstore','2026-10-05 13:11:57','2026-10-05 13:19:37',4000.00,6),(34,2,'PURCHASE_ORDER',13,'PO-02027',NULL,'COMPLETED','pofficer','2026-10-05 13:25:39','2026-10-05 13:26:11',4600.00,2),(35,3,'STOCK_TRANSFER',12,'TRF-02027',10,'IN_PROGRESS','mstore','2026-10-05 18:49:04',NULL,1000.00,1),(36,3,'STOCK_TRANSFER',13,'TRF-02028',NULL,'COMPLETED','mstore','2026-10-05 18:55:51','2026-10-05 19:01:00',6380.00,1);
/*!40000 ALTER TABLE `wf_workflow_instance` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `fnc_budget_line`
--

DROP TABLE IF EXISTS `fnc_budget_line`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `fnc_budget_line` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `budget_id` int(11) NOT NULL,
  `account_id` int(11) NOT NULL,
  `annual_amount` decimal(15,2) DEFAULT 0.00,
  `q1_amount` decimal(15,2) DEFAULT 0.00,
  `q2_amount` decimal(15,2) DEFAULT 0.00,
  `q3_amount` decimal(15,2) DEFAULT 0.00,
  `q4_amount` decimal(15,2) DEFAULT 0.00,
  `notes` varchar(500) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_budget_line` (`budget_id`,`account_id`),
  KEY `account_id` (`account_id`),
  CONSTRAINT `fnc_budget_line_ibfk_1` FOREIGN KEY (`budget_id`) REFERENCES `fnc_budget` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fnc_budget_line_ibfk_2` FOREIGN KEY (`account_id`) REFERENCES `fnc_account` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_uca1400_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `fnc_budget_line`
--

LOCK TABLES `fnc_budget_line` WRITE;
/*!40000 ALTER TABLE `fnc_budget_line` DISABLE KEYS */;
/*!40000 ALTER TABLE `fnc_budget_line` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `fnc_journal_entry_line`
--

DROP TABLE IF EXISTS `fnc_journal_entry_line`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `fnc_journal_entry_line` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `journal_entry_id` bigint(20) NOT NULL,
  `account_id` int(11) NOT NULL,
  `description` varchar(500) DEFAULT NULL,
  `debit_amount` decimal(15,2) DEFAULT 0.00,
  `credit_amount` decimal(15,2) DEFAULT 0.00,
  `line_order` int(11) DEFAULT 0,
  PRIMARY KEY (`id`),
  KEY `journal_entry_id` (`journal_entry_id`),
  KEY `account_id` (`account_id`),
  CONSTRAINT `fnc_journal_entry_line_ibfk_1` FOREIGN KEY (`journal_entry_id`) REFERENCES `fnc_journal_entry` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fnc_journal_entry_line_ibfk_2` FOREIGN KEY (`account_id`) REFERENCES `fnc_account` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=232 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_uca1400_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `fnc_journal_entry_line`
--

LOCK TABLES `fnc_journal_entry_line` WRITE;
/*!40000 ALTER TABLE `fnc_journal_entry_line` DISABLE KEYS */;
INSERT INTO `fnc_journal_entry_line` (`id`, `journal_entry_id`, `account_id`, `description`, `debit_amount`, `credit_amount`, `line_order`) VALUES (134,13,37,'Inventory received - GRN-2026-00001',22000.00,0.00,1),(135,13,27,'Payable to abc Metere ',0.00,22000.00,2),(136,14,63,'Sale / Customer Utility Materials - ISV-MNT-MNT-2026-00001',4000.00,0.00,1),(137,14,61,'Inventory issued - ISV-MNT-MNT-2026-00001',0.00,4000.00,2),(138,15,63,'Sale / Customer Utility Materials - ISV-NLC-NLC-2026-00010',1091.44,0.00,1),(139,15,61,'Inventory issued - ISV-NLC-NLC-2026-00010',0.00,1091.44,2),(140,16,63,'Sale / Customer Utility Materials - ISV-MNT-MNT-2026-00003',2481.24,0.00,1),(141,16,61,'Inventory issued - ISV-MNT-MNT-2026-00003',0.00,2481.24,2),(142,17,63,'Sale / Customer Utility Materials - ISV-NLC-NLC-2026-00011',782.72,0.00,1),(143,17,61,'Inventory issued - ISV-NLC-NLC-2026-00011',0.00,782.72,2),(144,18,63,'Sale / Customer Utility Materials - ISV-NLC-NLC-2026-00007',6400.00,0.00,1),(145,18,61,'Inventory issued - ISV-NLC-NLC-2026-00007',0.00,6400.00,2),(146,19,2,'ßï¿ßïìßêâ ßììßîåßë│ ßëÑßê¡ ÔÇö Receivable ÔÇö New Bill FT-00187305',590.00,0.00,0),(147,19,17,'ßï¿ßïìßêâ ßììßîåßë│ ßëÑßê¡ ÔÇö Revenue ÔÇö New Bill FT-00187305',0.00,590.00,1),(148,19,3,'ßëåßîúßê¬ ßè¬ßê½ßï¡ ÔÇö Receivable ÔÇö New Bill FT-00187305',30.00,0.00,2),(149,19,18,'ßëåßîúßê¬ ßè¬ßê½ßï¡ ÔÇö Revenue ÔÇö New Bill FT-00187305',0.00,30.00,3),(150,19,6,'ßïìßïØßìì ßëåßîúßê¬ ßè¬ßê½ßï¡ ÔÇö Receivable ÔÇö New Bill FT-00187305',705.00,0.00,4),(151,19,21,'ßïìßïØßìì ßëåßîúßê¬ ßè¬ßê½ßï¡ ÔÇö Revenue ÔÇö New Bill FT-00187305',0.00,705.00,5),(152,19,8,'ßëàßîúßëÁ ÔÇö Receivable ÔÇö New Bill FT-00187305',450.00,0.00,6),(153,19,23,'ßëàßîúßëÁ ÔÇö Revenue ÔÇö New Bill FT-00187305',0.00,450.00,7),(154,19,14,'ßïìßïØßìì ßï░ßê¿ßëà ßëåßê╗ßê╗ ÔÇö Receivable ÔÇö New Bill FT-00187305',70.00,0.00,8),(155,19,30,'ßïìßïØßìì ßï░ßê¿ßëà ßëåßê╗ßê╗ ÔÇö Revenue ÔÇö New Bill FT-00187305',0.00,70.00,9),(156,19,9,'ßï¿ßë░ßêïßêêßìê(ßèÉßëúßê¡) ßïìßïØßìì ÔÇö Receivable ÔÇö New Bill FT-00187305',1160.00,0.00,10),(157,19,24,'ßï¿ßë░ßêïßêêßìê(ßèÉßëúßê¡) ßïìßïØßìì ÔÇö Revenue ÔÇö New Bill FT-00187305',0.00,1160.00,11),(158,20,61,'Inventory received - GRN-2026-00002',2000.00,0.00,1),(159,20,62,'Payable to abc Metere ',0.00,2000.00,2),(160,21,61,'Inventory received - GRN-2026-00003',59400.00,0.00,1),(161,21,62,'Payable to abc Metere ',0.00,59400.00,2),(162,22,67,'Stock transferred into 4branch Store',1860.00,0.00,1),(163,22,61,'Stock transferred out from main Store',0.00,1860.00,2),(164,23,67,'Stock transferred into 4branch Store',6000.00,0.00,1),(165,23,61,'Stock transferred out from main Store',0.00,6000.00,2),(166,24,67,'Stock transferred into branch 3',18380.00,0.00,1),(167,24,61,'Stock transferred out from 4branch Store',0.00,18380.00,2),(168,25,63,'Sale / Customer Utility Materials - ISV-NLC-NLC-2026-00015',6340.00,0.00,1),(169,25,61,'Inventory issued - ISV-NLC-NLC-2026-00015',0.00,6340.00,2),(170,26,63,'Sale / Customer Utility Materials - ISV-NLC-NLC-2026-00004',4200.00,0.00,1),(171,26,61,'Inventory issued - ISV-NLC-NLC-2026-00004',0.00,4200.00,2),(172,27,63,'Sale / Customer Utility Materials - ISV-NLC-NLC-2026-00016',7140.00,0.00,1),(173,27,61,'Inventory issued - ISV-NLC-NLC-2026-00016',0.00,7140.00,2),(174,28,63,'Sale / Customer Utility Materials - ISV-NLC-NLC-2026-00018',3000.00,0.00,1),(175,28,61,'Inventory issued - ISV-NLC-NLC-2026-00018',0.00,3000.00,2),(176,29,63,'Sale / Customer Utility Materials - ISV-NLC-NLC-2026-00019',6000.00,0.00,1),(177,29,61,'Inventory issued - ISV-NLC-NLC-2026-00019',0.00,6000.00,2),(178,30,63,'Sale / Customer Utility Materials - ISV-MNT-MNT-2026-00005',3000.00,0.00,1),(179,30,61,'Inventory issued - ISV-MNT-MNT-2026-00005',0.00,3000.00,2),(180,31,67,'Stock transferred into 4branch Store',4280.00,0.00,1),(181,31,61,'Stock transferred out from main Store',0.00,4280.00,2),(182,32,63,'Sale / Customer Utility Materials - ISV-MNT-MNT-2026-00006',940.00,0.00,1),(183,32,61,'Inventory issued - ISV-MNT-MNT-2026-00006',0.00,940.00,2),(184,33,63,'Sale / Customer Utility Materials - ISV-NLC-NLC-2026-00021',940.00,0.00,1),(185,33,61,'Inventory issued - ISV-NLC-NLC-2026-00021',0.00,940.00,2),(186,34,63,'Sale / Customer Utility Materials - ISV-NLC-NLC-2026-00017',3000.00,0.00,1),(187,34,61,'Inventory issued - ISV-NLC-NLC-2026-00017',0.00,3000.00,2),(188,35,63,'Sale / Customer Utility Materials - ISV-NLC-NLC-2026-00001',3800.00,0.00,1),(189,35,61,'Inventory issued - ISV-NLC-NLC-2026-00001',0.00,3800.00,2),(190,36,63,'Sale / Customer Utility Materials - ISV-MNT-MNT-2026-00001',5000.00,0.00,1),(191,36,61,'Inventory issued - ISV-MNT-MNT-2026-00001',0.00,5000.00,2),(192,37,63,'Sale / Customer Utility Materials - ISV-NLC-NLC-2026-00001',6000.00,0.00,1),(193,37,61,'Inventory issued - ISV-NLC-NLC-2026-00001',0.00,6000.00,2),(194,38,61,'Inventory received - GRN-2026-00004',23000.00,0.00,1),(195,38,62,'Payable to abc Metere ',0.00,23000.00,2),(196,39,61,'Inventory received - GRN-2026-00005',10000.00,0.00,1),(197,39,62,'Payable to abc Metere ',0.00,10000.00,2),(198,40,67,'Stock transferred into main Store',3000.00,0.00,1),(199,40,61,'Stock transferred out from 4branch Store',0.00,3000.00,2),(200,41,61,'Inventory received - GRN-2026-00006',60000.00,0.00,1),(201,41,62,'Payable to abc Metere ',0.00,60000.00,2),(202,42,61,'Inventory received - GRN-2026-00007',500.00,0.00,1),(203,42,62,'Payable to abc Metere ',0.00,500.00,2),(204,43,61,'Inventory received - GRN-2026-00008',52900.00,0.00,1),(205,43,62,'Payable to abc Metere ',0.00,52900.00,2),(206,44,63,'Sale / Customer Utility Materials - ISV-MNT-MNT-2026-00002',3356.35,0.00,1),(207,44,61,'Inventory issued - ISV-MNT-MNT-2026-00002',0.00,3356.35,2),(208,47,61,'Inventory received - GRV-00001',4600.00,0.00,1),(209,47,62,'Payable to abc Metere ',0.00,4600.00,2),(210,48,67,'Stock transferred into SheSha Ber',6380.00,0.00,1),(211,48,61,'Stock transferred out from main Store',0.00,6380.00,2),(212,49,63,'Sale / Customer Utility Materials - ISV-NLC-NLC-2026-00002',4952.94,0.00,1),(213,49,61,'Inventory issued - ISV-NLC-NLC-2026-00002',0.00,4952.94,2),(214,50,63,'Sale / Customer Utility Materials - ISV-NLC-NLC-2026-00003',3395.24,0.00,1),(215,50,61,'Inventory issued - ISV-NLC-NLC-2026-00003',0.00,3395.24,2),(216,51,2,'ßï¿ßïìßêâ ßììßîåßë│ ßëÑßê¡ ÔÇö Receivable ÔÇö New Bill FT-00188186',840.00,0.00,0),(217,51,17,'ßï¿ßïìßêâ ßììßîåßë│ ßëÑßê¡ ÔÇö Revenue ÔÇö New Bill FT-00188186',0.00,840.00,1),(218,51,3,'ßëåßîúßê¬ ßè¬ßê½ßï¡ ÔÇö Receivable ÔÇö New Bill FT-00188186',30.00,0.00,2),(219,51,18,'ßëåßîúßê¬ ßè¬ßê½ßï¡ ÔÇö Revenue ÔÇö New Bill FT-00188186',0.00,30.00,3),(220,51,11,'ßï░ßê¿ßëà ßëåßê╗ßê╗ ÔÇö Receivable ÔÇö New Bill FT-00188186',70.00,0.00,4),(221,51,27,'ßï░ßê¿ßëà ßëåßê╗ßê╗ ÔÇö Revenue ÔÇö New Bill FT-00188186',0.00,70.00,5),(222,51,5,'ßïìßïØßìì ßììßîåßë│ ßè¡ßììßï½ ÔÇö Receivable ÔÇö New Bill FT-00188186',118.00,0.00,6),(223,51,20,'ßïìßïØßìì ßììßîåßë│ ßè¡ßììßï½ ÔÇö Revenue ÔÇö New Bill FT-00188186',0.00,118.00,7),(224,51,6,'ßïìßïØßìì ßëåßîúßê¬ ßè¬ßê½ßï¡ ÔÇö Receivable ÔÇö New Bill FT-00188186',790.00,0.00,8),(225,51,21,'ßïìßïØßìì ßëåßîúßê¬ ßè¬ßê½ßï¡ ÔÇö Revenue ÔÇö New Bill FT-00188186',0.00,790.00,9),(226,51,8,'ßëàßîúßëÁ ÔÇö Receivable ÔÇö New Bill FT-00188186',500.00,0.00,10),(227,51,23,'ßëàßîúßëÁ ÔÇö Revenue ÔÇö New Bill FT-00188186',0.00,500.00,11),(228,51,14,'ßïìßïØßìì ßï░ßê¿ßëà ßëåßê╗ßê╗ ÔÇö Receivable ÔÇö New Bill FT-00188186',700.00,0.00,12),(229,51,30,'ßïìßïØßìì ßï░ßê¿ßëà ßëåßê╗ßê╗ ÔÇö Revenue ÔÇö New Bill FT-00188186',0.00,700.00,13),(230,51,9,'ßï¿ßë░ßêïßêêßìê(ßèÉßëúßê¡) ßïìßïØßìì ÔÇö Receivable ÔÇö New Bill FT-00188186',1400.00,0.00,14),(231,51,24,'ßï¿ßë░ßêïßêêßìê(ßèÉßëúßê¡) ßïìßïØßìì ÔÇö Revenue ÔÇö New Bill FT-00188186',0.00,1400.00,15);
/*!40000 ALTER TABLE `fnc_journal_entry_line` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `hrms_attendance_records`
--

DROP TABLE IF EXISTS `hrms_attendance_records`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `hrms_attendance_records` (
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
  KEY `fk_hrms_att_shift` (`shift_schedule_id`),
  CONSTRAINT `fk_hrms_att_emp` FOREIGN KEY (`hrms_employee_info_id`) REFERENCES `hrms_employee_info` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_hrms_att_shift` FOREIGN KEY (`shift_schedule_id`) REFERENCES `hrms_shift_schedules` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `hrms_attendance_records`
--

LOCK TABLES `hrms_attendance_records` WRITE;
/*!40000 ALTER TABLE `hrms_attendance_records` DISABLE KEYS */;
/*!40000 ALTER TABLE `hrms_attendance_records` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `hrms_employee_chlota`
--

DROP TABLE IF EXISTS `hrms_employee_chlota`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `hrms_employee_chlota` (
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
  KEY `fk_hrms_chlota_emp` (`hrms_employee_info_id`),
  CONSTRAINT `fk_hrms_chlota_emp` FOREIGN KEY (`hrms_employee_info_id`) REFERENCES `hrms_employee_info` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `hrms_employee_chlota`
--

LOCK TABLES `hrms_employee_chlota` WRITE;
/*!40000 ALTER TABLE `hrms_employee_chlota` DISABLE KEYS */;
/*!40000 ALTER TABLE `hrms_employee_chlota` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `hrms_employee_education`
--

DROP TABLE IF EXISTS `hrms_employee_education`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `hrms_employee_education` (
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
  KEY `fk_hrms_edu_emp` (`hrms_employee_info_id`),
  CONSTRAINT `fk_hrms_edu_emp` FOREIGN KEY (`hrms_employee_info_id`) REFERENCES `hrms_employee_info` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `hrms_employee_education`
--

LOCK TABLES `hrms_employee_education` WRITE;
/*!40000 ALTER TABLE `hrms_employee_education` DISABLE KEYS */;
INSERT INTO `hrms_employee_education` (`id`, `hrms_employee_info_id`, `yetmhrt_dereja`, `yetmhrtbet_sm`, `yetmhrt_aynet`, `yetmhrt_dereja_status`, `graduation_year_ec`, `gpa`, `registered_date`, `registered_by`, `modified_date`, `modified_by`, `is_deleted`) VALUES (1,1,'Bachelor\'s Degree / ßï¿ßêÿßîÇßêÿßê¬ßï½ ßï▓ßîìßê¬ (BSc/BA)','Arba Minch University (Water Technology Institute)','Hydraulic & Water Resources Engineering','COMPLETED','2014 E.C.',3.75,'2026-09-13 10:26:29',1,'2026-09-13 10:26:29',NULL,0);
/*!40000 ALTER TABLE `hrms_employee_education` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `hrms_employee_info_photo`
--

DROP TABLE IF EXISTS `hrms_employee_info_photo`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `hrms_employee_info_photo` (
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
  KEY `fk_hrms_photo_emp` (`hrms_employee_info_id`),
  CONSTRAINT `fk_hrms_photo_emp` FOREIGN KEY (`hrms_employee_info_id`) REFERENCES `hrms_employee_info` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `hrms_employee_info_photo`
--

LOCK TABLES `hrms_employee_info_photo` WRITE;
/*!40000 ALTER TABLE `hrms_employee_info_photo` DISABLE KEYS */;
/*!40000 ALTER TABLE `hrms_employee_info_photo` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `hrms_employee_info_salary_defaults`
--

DROP TABLE IF EXISTS `hrms_employee_info_salary_defaults`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `hrms_employee_info_salary_defaults` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `hrms_employee_info_id` int(11) NOT NULL,
  `hrms_salary_configurations_id` int(11) NOT NULL,
  `default_value` double NOT NULL DEFAULT 0,
  `is_active` tinyint(1) NOT NULL DEFAULT 1,
  `is_deleted` tinyint(1) NOT NULL DEFAULT 0,
  PRIMARY KEY (`id`),
  KEY `fk_hrms_sal_def_emp` (`hrms_employee_info_id`),
  KEY `fk_hrms_sal_def_cfg` (`hrms_salary_configurations_id`),
  CONSTRAINT `fk_hrms_sal_def_cfg` FOREIGN KEY (`hrms_salary_configurations_id`) REFERENCES `hrms_salary_configurations` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_hrms_sal_def_emp` FOREIGN KEY (`hrms_employee_info_id`) REFERENCES `hrms_employee_info` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `hrms_employee_info_salary_defaults`
--

LOCK TABLES `hrms_employee_info_salary_defaults` WRITE;
/*!40000 ALTER TABLE `hrms_employee_info_salary_defaults` DISABLE KEYS */;
/*!40000 ALTER TABLE `hrms_employee_info_salary_defaults` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `hrms_employee_leave`
--

DROP TABLE IF EXISTS `hrms_employee_leave`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `hrms_employee_leave` (
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
  KEY `fk_hrms_leave_type` (`leave_type_id`),
  CONSTRAINT `fk_hrms_leave_emp` FOREIGN KEY (`hrms_employee_info_id`) REFERENCES `hrms_employee_info` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_hrms_leave_type` FOREIGN KEY (`leave_type_id`) REFERENCES `hrms_leave_types` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `hrms_employee_leave`
--

LOCK TABLES `hrms_employee_leave` WRITE;
/*!40000 ALTER TABLE `hrms_employee_leave` DISABLE KEYS */;
INSERT INTO `hrms_employee_leave` (`id`, `hrms_employee_info_id`, `leave_type_id`, `year`, `leave_days`, `leave_start`, `leave_end`, `leave_reason`, `approval_status`, `approved_by`, `approved_date`, `attachment_path`, `registered_by`, `registered_date`, `modified_by`, `modified_date`, `is_deleted`) VALUES (1,1,1,2019,21,'2026-09-20','2026-10-10','','APPROVED',1,'2026-09-13 16:47:33',NULL,1,'2026-09-13 16:46:28',NULL,'2026-09-13 16:46:28',0);
/*!40000 ALTER TABLE `hrms_employee_leave` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `hrms_employee_ljoch`
--

DROP TABLE IF EXISTS `hrms_employee_ljoch`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `hrms_employee_ljoch` (
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
  KEY `fk_hrms_ljoch_emp` (`hrms_employee_info_id`),
  CONSTRAINT `fk_hrms_ljoch_emp` FOREIGN KEY (`hrms_employee_info_id`) REFERENCES `hrms_employee_info` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `hrms_employee_ljoch`
--

LOCK TABLES `hrms_employee_ljoch` WRITE;
/*!40000 ALTER TABLE `hrms_employee_ljoch` DISABLE KEYS */;
/*!40000 ALTER TABLE `hrms_employee_ljoch` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `hrms_employee_more_info`
--

DROP TABLE IF EXISTS `hrms_employee_more_info`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `hrms_employee_more_info` (
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
  KEY `fk_hrms_more_info_emp` (`hrms_employee_info_id`),
  CONSTRAINT `fk_hrms_more_info_emp` FOREIGN KEY (`hrms_employee_info_id`) REFERENCES `hrms_employee_info` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `hrms_employee_more_info`
--

LOCK TABLES `hrms_employee_more_info` WRITE;
/*!40000 ALTER TABLE `hrms_employee_more_info` DISABLE KEYS */;
/*!40000 ALTER TABLE `hrms_employee_more_info` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `hrms_employee_yesewnet_meglecha`
--

DROP TABLE IF EXISTS `hrms_employee_yesewnet_meglecha`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `hrms_employee_yesewnet_meglecha` (
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
  KEY `fk_hrms_meglecha_emp` (`hrms_employee_info_id`),
  CONSTRAINT `fk_hrms_meglecha_emp` FOREIGN KEY (`hrms_employee_info_id`) REFERENCES `hrms_employee_info` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `hrms_employee_yesewnet_meglecha`
--

LOCK TABLES `hrms_employee_yesewnet_meglecha` WRITE;
/*!40000 ALTER TABLE `hrms_employee_yesewnet_meglecha` DISABLE KEYS */;
/*!40000 ALTER TABLE `hrms_employee_yesewnet_meglecha` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `hrms_employee_yeteketerebachew`
--

DROP TABLE IF EXISTS `hrms_employee_yeteketerebachew`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `hrms_employee_yeteketerebachew` (
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
  KEY `fk_hrms_exp_emp` (`hrms_employee_info_id`),
  CONSTRAINT `fk_hrms_exp_emp` FOREIGN KEY (`hrms_employee_info_id`) REFERENCES `hrms_employee_info` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `hrms_employee_yeteketerebachew`
--

LOCK TABLES `hrms_employee_yeteketerebachew` WRITE;
/*!40000 ALTER TABLE `hrms_employee_yeteketerebachew` DISABLE KEYS */;
INSERT INTO `hrms_employee_yeteketerebachew` (`id`, `hrms_employee_info_id`, `organization_name`, `yesra_medeb`, `demewez_meten`, `employeed_from`, `employeed_to`, `reason_for_leaving`, `registered_date`, `registered_by`, `modified_date`, `modified_by`, `is_deleted`) VALUES (1,1,'ßèÑßèôßëÁ ßëúßèòßè¡','ßï░ßèòßëáßè×ßë¢ ßèáßîêßêìßîìßêÄßëÁ',16000,'2024-01-13','2025-05-13','ßêÁßê½ ßëªßë│ ßëáßêÿßêìßëÇßëà','2026-09-13 15:20:05',1,'2026-09-13 15:20:04',NULL,0);
/*!40000 ALTER TABLE `hrms_employee_yeteketerebachew` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `hrms_leave_allocations`
--

DROP TABLE IF EXISTS `hrms_leave_allocations`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `hrms_leave_allocations` (
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
  KEY `fk_hrms_alloc_type` (`leave_type_id`),
  CONSTRAINT `fk_hrms_alloc_emp` FOREIGN KEY (`hrms_employee_info_id`) REFERENCES `hrms_employee_info` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_hrms_alloc_type` FOREIGN KEY (`leave_type_id`) REFERENCES `hrms_leave_types` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `hrms_leave_allocations`
--

LOCK TABLES `hrms_leave_allocations` WRITE;
/*!40000 ALTER TABLE `hrms_leave_allocations` DISABLE KEYS */;
/*!40000 ALTER TABLE `hrms_leave_allocations` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `hrms_payroll_runs`
--

DROP TABLE IF EXISTS `hrms_payroll_runs`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `hrms_payroll_runs` (
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
  KEY `fk_hrms_prun_jentry` (`journal_entry_id`),
  CONSTRAINT `fk_hrms_prun_fy` FOREIGN KEY (`fiscal_year_id`) REFERENCES `fnc_fiscal_year` (`id`),
  CONSTRAINT `fk_hrms_prun_jentry` FOREIGN KEY (`journal_entry_id`) REFERENCES `fnc_journal_entry` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `hrms_payroll_runs`
--

LOCK TABLES `hrms_payroll_runs` WRITE;
/*!40000 ALTER TABLE `hrms_payroll_runs` DISABLE KEYS */;
/*!40000 ALTER TABLE `hrms_payroll_runs` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `hrms_shift_assignments`
--

DROP TABLE IF EXISTS `hrms_shift_assignments`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `hrms_shift_assignments` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `hrms_employee_info_id` int(11) NOT NULL,
  `shift_schedule_id` int(11) NOT NULL,
  `assigned_date` date NOT NULL,
  `is_standby_on_call` tinyint(1) NOT NULL DEFAULT 0,
  `created_at` datetime NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `fk_hrms_shift_emp` (`hrms_employee_info_id`),
  KEY `fk_hrms_shift_sched` (`shift_schedule_id`),
  CONSTRAINT `fk_hrms_shift_emp` FOREIGN KEY (`hrms_employee_info_id`) REFERENCES `hrms_employee_info` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_hrms_shift_sched` FOREIGN KEY (`shift_schedule_id`) REFERENCES `hrms_shift_schedules` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `hrms_shift_assignments`
--

LOCK TABLES `hrms_shift_assignments` WRITE;
/*!40000 ALTER TABLE `hrms_shift_assignments` DISABLE KEYS */;
/*!40000 ALTER TABLE `hrms_shift_assignments` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `inv_serial_tracking`
--

DROP TABLE IF EXISTS `inv_serial_tracking`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `inv_serial_tracking` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `item_id` bigint(20) NOT NULL,
  `store_id` int(11) NOT NULL,
  `tracking_type` enum('SERIAL','MOTOR','BATCH') NOT NULL,
  `serial_number` varchar(100) DEFAULT NULL,
  `motor_number` varchar(100) DEFAULT NULL,
  `chassis_number` varchar(100) DEFAULT NULL,
  `plate_number` varchar(100) DEFAULT NULL,
  `batch_number` varchar(100) DEFAULT NULL,
  `expiry_date` date DEFAULT NULL,
  `manufacture_date` date DEFAULT NULL,
  `status` enum('IN_STOCK','ISSUED','TRANSFERRED','DISPOSED','RETURNED') NOT NULL DEFAULT 'IN_STOCK',
  `reference_type` varchar(50) DEFAULT NULL,
  `reference_id` bigint(20) DEFAULT NULL,
  `remarks` varchar(500) DEFAULT NULL,
  `created_by` varchar(100) DEFAULT NULL,
  `created_at` datetime DEFAULT current_timestamp(),
  `updated_at` datetime DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `fk_serial_item` (`item_id`),
  KEY `fk_serial_store` (`store_id`),
  KEY `idx_serial_number` (`serial_number`),
  KEY `idx_motor_number` (`motor_number`),
  KEY `idx_batch_number` (`batch_number`),
  CONSTRAINT `fk_serial_item` FOREIGN KEY (`item_id`) REFERENCES `inv_item` (`id`),
  CONSTRAINT `fk_serial_store` FOREIGN KEY (`store_id`) REFERENCES `inv_store` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_uca1400_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `inv_serial_tracking`
--

LOCK TABLES `inv_serial_tracking` WRITE;
/*!40000 ALTER TABLE `inv_serial_tracking` DISABLE KEYS */;
/*!40000 ALTER TABLE `inv_serial_tracking` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `inv_item_store_stock`
--

DROP TABLE IF EXISTS `inv_item_store_stock`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `inv_item_store_stock` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `item_id` bigint(20) NOT NULL,
  `store_id` int(11) NOT NULL,
  `quantity_on_hand` decimal(15,4) NOT NULL DEFAULT 0.0000,
  `quantity_reserved` decimal(15,4) NOT NULL DEFAULT 0.0000,
  `quantity_on_order` decimal(15,4) NOT NULL DEFAULT 0.0000,
  `weighted_avg_cost` decimal(15,4) NOT NULL DEFAULT 0.0000,
  `last_count_date` date DEFAULT NULL,
  `last_count_quantity` decimal(15,4) DEFAULT NULL,
  `created_at` datetime DEFAULT current_timestamp(),
  `updated_at` datetime DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_item_store` (`item_id`,`store_id`),
  KEY `fk_stock_store` (`store_id`),
  CONSTRAINT `fk_stock_item` FOREIGN KEY (`item_id`) REFERENCES `inv_item` (`id`),
  CONSTRAINT `fk_stock_store` FOREIGN KEY (`store_id`) REFERENCES `inv_store` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=66 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_uca1400_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `inv_item_store_stock`
--

LOCK TABLES `inv_item_store_stock` WRITE;
/*!40000 ALTER TABLE `inv_item_store_stock` DISABLE KEYS */;
INSERT INTO `inv_item_store_stock` (`id`, `item_id`, `store_id`, `quantity_on_hand`, `quantity_reserved`, `quantity_on_order`, `weighted_avg_cost`, `last_count_date`, `last_count_quantity`, `created_at`, `updated_at`) VALUES (9,3,1,0.0000,0.0000,0.0000,600.0000,NULL,NULL,'2026-09-08 12:36:38','2026-09-22 13:46:55'),(10,2,1,0.0000,0.0000,0.0000,800.0000,NULL,NULL,'2026-09-08 12:36:38','2026-09-24 12:58:41'),(11,3,2,0.0000,0.0000,0.0000,600.0000,NULL,NULL,'2026-09-08 14:52:16','2026-10-05 19:39:31'),(12,2,2,9.0000,0.0000,0.0000,800.0000,NULL,NULL,'2026-09-08 14:52:16','2026-10-05 19:39:31'),(13,1,1,100.0000,0.0000,0.0000,0.0000,NULL,NULL,'2026-09-12 22:16:42','2026-09-12 22:16:42'),(14,1,2,100.0000,0.0000,0.0000,0.0000,NULL,NULL,'2026-09-12 22:16:42','2026-09-12 22:16:42'),(15,1,3,100.0000,0.0000,0.0000,0.0000,NULL,NULL,'2026-09-12 22:16:42','2026-09-12 22:16:42'),(16,2,3,92.0000,0.0000,0.0000,0.0000,NULL,NULL,'2026-09-12 22:16:42','2026-09-13 17:00:58'),(17,3,3,85.0000,0.0000,0.0000,0.0000,NULL,NULL,'2026-09-12 22:16:42','2026-09-13 14:24:18'),(18,4,1,30.0000,0.0000,0.0000,38.0000,NULL,NULL,'2026-09-12 22:16:42','2026-10-05 19:02:49'),(19,4,2,110.0000,0.0000,0.0000,38.0000,NULL,NULL,'2026-09-12 22:16:42','2026-10-05 19:03:33'),(20,4,3,104.0000,0.0000,0.0000,38.0000,NULL,NULL,'2026-09-12 22:16:42','2026-09-21 19:50:41'),(21,5,1,50.0000,0.0000,0.0000,120.0000,NULL,NULL,'2026-09-12 22:16:42','2026-10-05 19:02:49'),(22,5,2,150.0000,0.0000,0.0000,117.6471,NULL,NULL,'2026-09-12 22:16:42','2026-10-05 19:39:31'),(23,5,3,81.0000,0.0000,0.0000,120.0000,NULL,NULL,'2026-09-12 22:16:42','2026-09-13 14:24:18'),(24,6,1,100.0000,0.0000,0.0000,28.0000,NULL,NULL,'2026-09-12 22:16:42','2026-09-12 22:16:42'),(25,6,2,100.0000,0.0000,0.0000,28.0000,NULL,NULL,'2026-09-12 22:16:42','2026-09-12 22:16:42'),(26,6,3,98.0000,0.0000,0.0000,28.0000,NULL,NULL,'2026-09-12 22:16:42','2026-09-13 12:50:37'),(27,7,1,100.0000,0.0000,0.0000,55.0000,NULL,NULL,'2026-09-12 22:16:42','2026-09-12 22:16:42'),(28,7,2,110.0000,0.0000,0.0000,60.4545,NULL,NULL,'2026-09-12 22:16:42','2026-10-05 13:47:54'),(29,7,3,92.0000,0.0000,0.0000,55.0000,NULL,NULL,'2026-09-12 22:16:42','2026-09-13 14:24:18'),(30,8,1,100.0000,0.0000,0.0000,52.0000,NULL,NULL,'2026-09-12 22:16:42','2026-09-12 22:16:42'),(31,8,2,100.0000,0.0000,0.0000,52.0000,NULL,NULL,'2026-09-12 22:16:42','2026-09-12 22:16:42'),(32,8,3,100.0000,0.0000,0.0000,52.0000,NULL,NULL,'2026-09-12 22:16:42','2026-09-12 22:16:42'),(33,9,1,100.0000,0.0000,0.0000,88.0000,NULL,NULL,'2026-09-12 22:16:42','2026-09-12 22:16:42'),(34,9,2,100.0000,0.0000,0.0000,88.0000,NULL,NULL,'2026-09-12 22:16:42','2026-09-12 22:16:42'),(35,9,3,99.0000,0.0000,0.0000,88.0000,NULL,NULL,'2026-09-12 22:16:42','2026-09-13 12:50:37'),(36,10,1,105.0000,0.0000,0.0000,45.7143,NULL,NULL,'2026-09-12 22:16:42','2026-09-30 14:06:38'),(37,10,2,100.0000,0.0000,0.0000,18.0000,NULL,NULL,'2026-09-12 22:16:42','2026-09-12 22:16:42'),(38,10,3,130.0000,0.0000,0.0000,152.3077,NULL,NULL,'2026-09-12 22:16:42','2026-09-21 19:50:41'),(39,11,1,100.0000,0.0000,0.0000,65.0000,NULL,NULL,'2026-09-12 22:16:42','2026-09-12 22:16:42'),(40,11,2,100.0000,0.0000,0.0000,65.0000,NULL,NULL,'2026-09-12 22:16:42','2026-09-12 22:16:42'),(41,11,3,91.0000,0.0000,0.0000,65.0000,NULL,NULL,'2026-09-12 22:16:42','2026-09-13 13:48:10'),(42,12,1,100.0000,0.0000,0.0000,22.0000,NULL,NULL,'2026-09-12 22:16:42','2026-09-12 22:16:42'),(43,12,2,110.0000,0.0000,0.0000,82.7273,NULL,NULL,'2026-09-12 22:16:42','2026-09-30 20:24:45'),(44,12,3,98.0000,0.0000,0.0000,22.0000,NULL,NULL,'2026-09-12 22:16:42','2026-09-13 12:50:38'),(45,13,1,100.0000,0.0000,0.0000,32.0000,NULL,NULL,'2026-09-12 22:16:42','2026-09-12 22:16:42'),(46,13,2,140.0000,0.0000,0.0000,376.0714,NULL,NULL,'2026-09-12 22:16:42','2026-10-05 13:47:54'),(47,13,3,100.0000,0.0000,0.0000,32.0000,NULL,NULL,'2026-09-12 22:16:42','2026-09-12 22:16:42'),(48,14,1,80.0000,0.0000,0.0000,14.0000,NULL,NULL,'2026-09-12 22:16:42','2026-09-24 12:58:41'),(49,14,2,100.0000,0.0000,0.0000,14.0000,NULL,NULL,'2026-09-12 22:16:42','2026-09-12 22:16:42'),(50,14,3,96.0000,0.0000,0.0000,14.0000,NULL,NULL,'2026-09-12 22:16:42','2026-09-13 13:48:10'),(51,15,1,100.0000,0.0000,0.0000,24.0000,NULL,NULL,'2026-09-12 22:16:42','2026-09-12 22:16:42'),(52,15,2,100.0000,0.0000,0.0000,24.0000,NULL,NULL,'2026-09-12 22:16:42','2026-09-12 22:16:42'),(53,15,3,108.0000,0.0000,0.0000,114.3704,NULL,NULL,'2026-09-12 22:16:42','2026-09-30 13:23:21'),(54,16,1,10.0000,0.0000,0.0000,62.0000,NULL,NULL,'2026-09-12 22:16:42','2026-09-21 17:29:21'),(55,16,2,100.0000,0.0000,0.0000,62.0000,NULL,NULL,'2026-09-12 22:16:42','2026-09-12 22:16:42'),(56,16,3,100.0000,0.0000,0.0000,62.0000,NULL,NULL,'2026-09-12 22:16:42','2026-09-12 22:16:42'),(57,17,1,100.0000,0.0000,0.0000,190.0000,NULL,NULL,'2026-09-12 22:16:42','2026-09-12 22:16:42'),(58,17,2,100.0000,0.0000,0.0000,190.0000,NULL,NULL,'2026-09-12 22:16:42','2026-09-12 22:16:42'),(59,17,3,100.0000,0.0000,0.0000,190.0000,NULL,NULL,'2026-09-12 22:16:42','2026-09-12 22:16:42'),(60,10,4,12.0000,0.0000,0.0000,164.0741,NULL,NULL,'2026-09-21 14:02:52','2026-10-05 11:34:40'),(61,16,4,100.0000,0.0000,0.0000,575.0000,NULL,NULL,'2026-09-21 16:17:24','2026-09-30 18:14:13'),(62,4,4,50.0000,0.0000,0.0000,230.0000,NULL,NULL,'2026-09-21 17:30:44','2026-09-30 18:14:13'),(63,14,4,10.0000,0.0000,0.0000,34.5000,NULL,NULL,'2026-09-24 13:00:17','2026-09-30 19:32:29'),(64,2,4,19.0000,0.0000,0.0000,895.2381,NULL,NULL,'2026-09-24 13:00:17','2026-10-07 06:31:08'),(65,3,4,5.0000,0.0000,0.0000,500.0000,NULL,NULL,'2026-09-29 19:29:59','2026-10-07 06:31:08');
/*!40000 ALTER TABLE `inv_item_store_stock` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `inv_purchase_order`
--

DROP TABLE IF EXISTS `inv_purchase_order`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `inv_purchase_order` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `po_number` varchar(50) NOT NULL,
  `requisition_id` bigint(20) DEFAULT NULL,
  `supplier_id` int(11) NOT NULL,
  `store_id` int(11) NOT NULL,
  `order_date` date NOT NULL,
  `expected_delivery_date` date DEFAULT NULL,
  `status` enum('DRAFT','SUBMITTED','APPROVED_L1','APPROVED_L2','SENT_TO_SUPPLIER','PARTIALLY_RECEIVED','FULLY_RECEIVED','CANCELLED') NOT NULL DEFAULT 'DRAFT',
  `approved_by_l1` varchar(100) DEFAULT NULL,
  `approved_date_l1` datetime DEFAULT NULL,
  `approved_by_l2` varchar(100) DEFAULT NULL,
  `approved_date_l2` datetime DEFAULT NULL,
  `subtotal` decimal(15,2) NOT NULL DEFAULT 0.00,
  `vat_rate` decimal(5,2) NOT NULL DEFAULT 15.00,
  `vat_amount` decimal(15,2) NOT NULL DEFAULT 0.00,
  `grand_total` decimal(15,2) NOT NULL DEFAULT 0.00,
  `payment_terms` varchar(200) DEFAULT NULL,
  `delivery_terms` varchar(200) DEFAULT NULL,
  `remarks` varchar(500) DEFAULT NULL,
  `rejected_by` varchar(100) DEFAULT NULL,
  `rejected_date` datetime DEFAULT NULL,
  `rejection_reason` varchar(500) DEFAULT NULL,
  `created_by` varchar(100) DEFAULT NULL,
  `created_at` datetime DEFAULT current_timestamp(),
  `updated_at` datetime DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `po_number` (`po_number`),
  KEY `fk_po_requisition` (`requisition_id`),
  KEY `fk_po_supplier` (`supplier_id`),
  KEY `fk_po_store` (`store_id`),
  KEY `idx_po_status` (`status`),
  CONSTRAINT `fk_po_requisition` FOREIGN KEY (`requisition_id`) REFERENCES `inv_purchase_requisition` (`id`),
  CONSTRAINT `fk_po_store` FOREIGN KEY (`store_id`) REFERENCES `inv_store` (`id`),
  CONSTRAINT `fk_po_supplier` FOREIGN KEY (`supplier_id`) REFERENCES `inv_supplier` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=14 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_uca1400_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `inv_purchase_order`
--

LOCK TABLES `inv_purchase_order` WRITE;
/*!40000 ALTER TABLE `inv_purchase_order` DISABLE KEYS */;
INSERT INTO `inv_purchase_order` (`id`, `po_number`, `requisition_id`, `supplier_id`, `store_id`, `order_date`, `expected_delivery_date`, `status`, `approved_by_l1`, `approved_date_l1`, `approved_by_l2`, `approved_date_l2`, `subtotal`, `vat_rate`, `vat_amount`, `grand_total`, `payment_terms`, `delivery_terms`, `remarks`, `rejected_by`, `rejected_date`, `rejection_reason`, `created_by`, `created_at`, `updated_at`) VALUES (4,'PO-2026-00001',7,1,1,'2026-09-08',NULL,'FULLY_RECEIVED',NULL,NULL,'fhead','2026-09-08 12:20:49',22000.00,15.00,3300.00,25300.00,'Net 30 Days','Delivered to Store (DDP)','Converted from PR #PR-2026-00001: firstREqu',NULL,NULL,NULL,'pofficer','2026-09-08 12:19:57','2026-09-08 12:36:39'),(5,'PO-2026-00002',11,1,2,'2026-09-20',NULL,'FULLY_RECEIVED',NULL,NULL,'fhead','2026-09-20 08:32:30',2000.00,15.00,300.00,2300.00,'Net 30 Days','Delivered to Store (DDP)','Converted from PR #PR-2026-00005',NULL,NULL,NULL,'pofficer','2026-09-20 08:31:51','2026-09-20 08:33:49'),(6,'PO-2026-00003',10,1,4,'2026-09-21','2026-09-22','APPROVED_L1','fhead','2026-09-21 06:21:23',NULL,NULL,190000.00,15.00,28500.00,218500.00,'Net 30 Days','Delivered to Store (DDP)','Converted from PR #PR-2026-00004',NULL,NULL,NULL,'pofficer','2026-09-21 06:19:50','2026-09-21 06:21:23'),(7,'PO-2026-00004',12,1,4,'2026-09-21','2026-09-23','FULLY_RECEIVED',NULL,NULL,'fhead','2026-09-21 14:01:42',59400.00,15.00,8910.00,68310.00,'cash','Delivered to Store (DDP)','Converted from PR #PR-2026-00006',NULL,NULL,NULL,'pofficer','2026-09-21 14:00:58','2026-09-21 14:02:52'),(8,'PO-2026-00005',13,1,4,'2026-09-29','2026-09-30','FULLY_RECEIVED',NULL,NULL,'fhead','2026-09-29 19:28:29',23000.00,15.00,3450.00,26450.00,'Net 30 Days','Delivered to Store (DDP)','Converted from PR #PR-2026-00007',NULL,NULL,NULL,'pofficer','2026-09-29 19:27:35','2026-09-29 19:29:59'),(9,'PO-2026-00006',9,1,3,'2026-09-30','2026-09-30','FULLY_RECEIVED',NULL,NULL,'reading2','2026-09-30 13:20:44',10000.00,15.00,1500.00,11500.00,'Net 30 Days','Delivered to Store (DDP)','Converted from PR #PR-2026-00003: for sale',NULL,NULL,NULL,'reading2','2026-09-30 13:20:02','2026-09-30 13:23:21'),(10,'PO-2026-00007',14,1,4,'2026-09-30','2026-10-01','FULLY_RECEIVED',NULL,NULL,'fhead','2026-09-30 18:10:11',60000.00,15.00,9000.00,69000.00,'Net 30 Days','Delivered to Store (DDP)','Converted from PR #PR-2026-00008',NULL,NULL,NULL,'pofficer','2026-09-30 18:03:03','2026-09-30 18:14:13'),(11,'PO-2026-00008',15,1,4,'2026-09-30','2026-09-29','FULLY_RECEIVED',NULL,NULL,'fhead','2026-09-30 19:29:59',500.00,15.00,75.00,575.00,'Net 30 Days','Delivered to Store (DDP)','Converted from PR #PR-2026-00009',NULL,NULL,NULL,'pofficer','2026-09-30 19:14:38','2026-09-30 19:32:29'),(12,'PO-2026-00009',NULL,1,2,'2026-09-30',NULL,'FULLY_RECEIVED',NULL,NULL,'fhead','2026-09-30 20:23:28',46000.00,15.00,6900.00,52900.00,'Net 30 Days','Delivered to Store (DDP)',NULL,NULL,NULL,NULL,'fhead','2026-09-30 20:19:42','2026-09-30 20:24:45'),(13,'PO-02027',17,1,2,'2026-10-05','2026-10-28','FULLY_RECEIVED',NULL,NULL,'fhead','2026-10-05 13:26:11',4000.00,15.00,600.00,4600.00,'Net 30 Days','Delivered to Store (DDP)','Converted from PR #PR-02028',NULL,NULL,NULL,'pofficer','2026-10-05 13:25:36','2026-10-05 13:47:54');
/*!40000 ALTER TABLE `inv_purchase_order` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `inv_purchase_requisition_line`
--

DROP TABLE IF EXISTS `inv_purchase_requisition_line`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `inv_purchase_requisition_line` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `requisition_id` bigint(20) NOT NULL,
  `item_id` bigint(20) NOT NULL,
  `requested_quantity` decimal(15,4) NOT NULL,
  `approved_quantity` decimal(15,4) DEFAULT NULL,
  `estimated_unit_cost` decimal(15,4) NOT NULL DEFAULT 0.0000,
  `estimated_total` decimal(15,2) NOT NULL DEFAULT 0.00,
  `purpose` varchar(300) DEFAULT NULL,
  `line_order` int(11) NOT NULL DEFAULT 0,
  PRIMARY KEY (`id`),
  KEY `fk_prl_requisition` (`requisition_id`),
  KEY `fk_prl_item` (`item_id`),
  CONSTRAINT `fk_prl_item` FOREIGN KEY (`item_id`) REFERENCES `inv_item` (`id`),
  CONSTRAINT `fk_prl_requisition` FOREIGN KEY (`requisition_id`) REFERENCES `inv_purchase_requisition` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=32 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_uca1400_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `inv_purchase_requisition_line`
--

LOCK TABLES `inv_purchase_requisition_line` WRITE;
/*!40000 ALTER TABLE `inv_purchase_requisition_line` DISABLE KEYS */;
INSERT INTO `inv_purchase_requisition_line` (`id`, `requisition_id`, `item_id`, `requested_quantity`, `approved_quantity`, `estimated_unit_cost`, `estimated_total`, `purpose`, `line_order`) VALUES (11,7,3,10.0000,10.0000,600.0000,6000.00,'',1),(12,7,2,20.0000,20.0000,800.0000,16000.00,'',2),(13,8,2,10.0000,NULL,1000.0000,10000.00,'',1),(14,8,3,20.0000,NULL,2000.0000,40000.00,'',2),(15,8,5,10.0000,NULL,100.0000,1000.00,'',3),(16,9,15,10.0000,10.0000,500.0000,5000.00,'',1),(17,10,13,10.0000,10.0000,8000.0000,80000.00,'',1),(18,10,16,20.0000,20.0000,3000.0000,60000.00,'',2),(19,11,5,20.0000,20.0000,52.0000,1040.00,'',1),(20,12,10,33.0000,33.0000,300.0000,9900.00,'',1),(21,12,10,66.0000,66.0000,200.0000,13200.00,'',2),(22,13,2,20.0000,20.0000,900.0000,18000.00,'',1),(23,13,3,10.0000,10.0000,500.0000,5000.00,'',2),(24,14,16,100.0000,100.0000,0.0000,0.00,'',1),(25,14,4,50.0000,50.0000,100.0000,5000.00,'',2),(26,15,10,20.0000,20.0000,100.0000,2000.00,'',1),(27,15,14,10.0000,10.0000,14.0000,140.00,'',2),(28,16,2,20.0000,NULL,900.0000,18000.00,'',1),(29,16,5,30.0000,NULL,600.0000,18000.00,'',2),(30,17,7,10.0000,10.0000,100.0000,1000.00,'',1),(31,17,13,20.0000,20.0000,150.0000,3000.00,'',2);
/*!40000 ALTER TABLE `inv_purchase_requisition_line` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `inv_stock_adjustment`
--

DROP TABLE IF EXISTS `inv_stock_adjustment`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `inv_stock_adjustment` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `adjustment_number` varchar(50) NOT NULL,
  `store_id` int(11) NOT NULL,
  `adjustment_type` enum('PHYSICAL_COUNT','DAMAGE','DISPOSAL','EXPIRY','OTHER') NOT NULL,
  `adjustment_date` date NOT NULL,
  `status` enum('DRAFT','SUBMITTED','APPROVED','APPLIED','CANCELLED') NOT NULL DEFAULT 'DRAFT',
  `approved_by` varchar(100) DEFAULT NULL,
  `approved_date` datetime DEFAULT NULL,
  `applied_by` varchar(100) DEFAULT NULL,
  `applied_date` datetime DEFAULT NULL,
  `journal_entry_id` bigint(20) DEFAULT NULL,
  `remarks` varchar(500) DEFAULT NULL,
  `created_by` varchar(100) DEFAULT NULL,
  `created_at` datetime DEFAULT current_timestamp(),
  `updated_at` datetime DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `adjustment_number` (`adjustment_number`),
  KEY `fk_adj_store` (`store_id`),
  KEY `fk_adj_journal` (`journal_entry_id`),
  KEY `idx_adj_status` (`status`),
  CONSTRAINT `fk_adj_journal` FOREIGN KEY (`journal_entry_id`) REFERENCES `fnc_journal_entry` (`id`),
  CONSTRAINT `fk_adj_store` FOREIGN KEY (`store_id`) REFERENCES `inv_store` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_uca1400_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `inv_stock_adjustment`
--

LOCK TABLES `inv_stock_adjustment` WRITE;
/*!40000 ALTER TABLE `inv_stock_adjustment` DISABLE KEYS */;
/*!40000 ALTER TABLE `inv_stock_adjustment` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `inv_stock_transfer`
--

DROP TABLE IF EXISTS `inv_stock_transfer`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `inv_stock_transfer` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `transfer_number` varchar(50) NOT NULL,
  `from_store_id` int(11) NOT NULL,
  `to_store_id` int(11) NOT NULL,
  `transfer_date` date NOT NULL,
  `status` enum('DRAFT','SUBMITTED','APPROVED','IN_TRANSIT','RECEIVED','CANCELLED') NOT NULL DEFAULT 'DRAFT',
  `requested_by` varchar(100) DEFAULT NULL,
  `approved_by` varchar(100) DEFAULT NULL,
  `approved_date` datetime DEFAULT NULL,
  `shipped_by` varchar(100) DEFAULT NULL,
  `shipped_date` datetime DEFAULT NULL,
  `received_by` varchar(100) DEFAULT NULL,
  `received_date` datetime DEFAULT NULL,
  `total_amount` decimal(15,2) NOT NULL DEFAULT 0.00,
  `remarks` varchar(500) DEFAULT NULL,
  `waybill_number` varchar(100) DEFAULT NULL,
  `vehicle_plate` varchar(50) DEFAULT NULL,
  `driver_name` varchar(100) DEFAULT NULL,
  `journal_entry_id` bigint(20) DEFAULT NULL,
  `created_by` varchar(100) DEFAULT NULL,
  `created_at` datetime DEFAULT current_timestamp(),
  `updated_at` datetime DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `transfer_number` (`transfer_number`),
  KEY `fk_tf_from_store` (`from_store_id`),
  KEY `fk_tf_to_store` (`to_store_id`),
  KEY `idx_tf_status` (`status`),
  KEY `fk_tf_journal_entry` (`journal_entry_id`),
  CONSTRAINT `fk_tf_from_store` FOREIGN KEY (`from_store_id`) REFERENCES `inv_store` (`id`),
  CONSTRAINT `fk_tf_journal_entry` FOREIGN KEY (`journal_entry_id`) REFERENCES `fnc_journal_entry` (`id`) ON DELETE SET NULL,
  CONSTRAINT `fk_tf_to_store` FOREIGN KEY (`to_store_id`) REFERENCES `inv_store` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=14 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_uca1400_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `inv_stock_transfer`
--

LOCK TABLES `inv_stock_transfer` WRITE;
/*!40000 ALTER TABLE `inv_stock_transfer` DISABLE KEYS */;
INSERT INTO `inv_stock_transfer` (`id`, `transfer_number`, `from_store_id`, `to_store_id`, `transfer_date`, `status`, `requested_by`, `approved_by`, `approved_date`, `shipped_by`, `shipped_date`, `received_by`, `received_date`, `total_amount`, `remarks`, `waybill_number`, `vehicle_plate`, `driver_name`, `journal_entry_id`, `created_by`, `created_at`, `updated_at`) VALUES (3,'TRF-2026-00001',1,2,'2026-09-08','RECEIVED','mstore','fhead','2026-09-08 14:22:44','mostore','2026-09-08 14:50:09','mostore','2026-09-08 14:52:16',9800.00,'store transfer 11','777','3-36475b','alemu kebede',NULL,'mstore','2026-09-08 14:18:40','2026-09-08 14:52:16'),(4,'TRF-2026-00002',1,4,'2026-09-21','SUBMITTED','4store',NULL,NULL,NULL,NULL,NULL,NULL,4240.00,'for sale transfer',NULL,NULL,NULL,NULL,'4store','2026-09-21 14:25:02','2026-09-21 14:25:42'),(5,'TRF-2026-00003',1,4,'2026-09-21','RECEIVED','mostore','fhead','2026-09-21 16:12:26','mostore','2026-09-21 16:14:14','4store','2026-09-21 16:17:24',1860.00,'storeSale','hgg','5445','jkkjkj',22,'mostore','2026-09-21 14:30:24','2026-09-21 16:17:24'),(6,'TRF-2026-00004',1,4,'2026-09-21','RECEIVED','4store','fhead','2026-09-21 17:21:17','mostore','2026-09-21 17:29:21','4store','2026-09-21 17:30:44',6000.00,'Inter-store transfer','jjj','7778','hjhjhjh',23,'4store','2026-09-21 17:20:06','2026-09-21 17:30:44'),(7,'TRF-2026-00005',1,4,'2026-09-21','CANCELLED','mostore',NULL,NULL,NULL,NULL,NULL,NULL,1320.00,'Inter-store transfer | Rejected: bbbb',NULL,NULL,NULL,NULL,'mostore','2026-09-21 17:38:02','2026-09-21 17:38:59'),(8,'TRF-2026-00006',1,2,'2026-09-21','APPROVED','mostore','fhead','2026-09-21 17:41:01',NULL,NULL,NULL,NULL,840.00,'Inter-store transfer',NULL,NULL,NULL,NULL,'mostore','2026-09-21 17:40:19','2026-09-21 17:41:01'),(9,'TRF-2026-00007',4,3,'2026-09-21','RECEIVED','4store','fhead','2026-09-21 19:49:17','4store','2026-09-21 19:50:02','3store','2026-09-21 19:50:41',18380.00,'Inter-store transfer','jjj','kjjkjk','mmm',24,'4store','2026-09-21 19:36:52','2026-09-21 19:50:41'),(10,'TRF-2026-00008',1,4,'2026-09-24','RECEIVED','mostore','fhead','2026-09-24 12:56:35','mostore','2026-09-24 12:58:41','4store','2026-09-24 13:00:17',4280.00,'for 4branch sale','yyy','77','gerea',31,'mostore','2026-09-24 12:55:51','2026-09-24 13:00:17'),(11,'TRF-2026-00009',4,1,'2026-09-30','RECEIVED','4store','fhead','2026-09-30 13:49:19','4store','2026-09-30 14:05:26','mostore','2026-09-30 14:06:38',3000.00,'Inter-store transfer','787','458-58','kebede alemu',40,'4store','2026-09-30 13:47:10','2026-09-30 14:06:38'),(12,'TRF-02027',1,2,'2026-10-05','SUBMITTED','mstore',NULL,NULL,NULL,NULL,NULL,NULL,1000.00,'Inter-store transfer',NULL,NULL,NULL,NULL,'mstore','2026-10-05 18:48:51','2026-10-05 18:49:04'),(13,'TRF-02028',1,2,'2026-10-05','RECEIVED','mstore','fhead','2026-10-05 19:01:00','mostore','2026-10-05 19:02:49','mstore','2026-10-05 19:03:33',6380.00,'Inter-store transfer','ndhdj52','4748','kebede alemu',48,'mstore','2026-10-05 18:55:48','2026-10-05 19:03:33');
/*!40000 ALTER TABLE `inv_stock_transfer` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `inv_issue_voucher`
--

DROP TABLE IF EXISTS `inv_issue_voucher`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `inv_issue_voucher` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `voucher_number` varchar(50) NOT NULL,
  `store_id` int(11) NOT NULL,
  `issue_type` enum('SALE','INTERNAL_USE','PROJECT','MAINTENANCE') NOT NULL,
  `issued_to` varchar(200) DEFAULT NULL,
  `department` varchar(200) DEFAULT NULL,
  `issued_date` date NOT NULL,
  `status` enum('DRAFT','APPROVED','ISSUED','CANCELLED') NOT NULL DEFAULT 'DRAFT',
  `approved_by` varchar(100) DEFAULT NULL,
  `approved_date` datetime DEFAULT NULL,
  `issued_by` varchar(100) DEFAULT NULL,
  `total_amount` decimal(15,2) NOT NULL DEFAULT 0.00,
  `journal_entry_id` bigint(20) DEFAULT NULL,
  `remarks` varchar(500) DEFAULT NULL,
  `created_by` varchar(100) DEFAULT NULL,
  `created_at` datetime DEFAULT current_timestamp(),
  `updated_at` datetime DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `material_request_id` bigint(20) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `voucher_number` (`voucher_number`),
  KEY `fk_iv_store` (`store_id`),
  KEY `fk_iv_journal` (`journal_entry_id`),
  KEY `idx_iv_status` (`status`),
  CONSTRAINT `fk_iv_journal` FOREIGN KEY (`journal_entry_id`) REFERENCES `fnc_journal_entry` (`id`),
  CONSTRAINT `fk_iv_store` FOREIGN KEY (`store_id`) REFERENCES `inv_store` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_uca1400_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `inv_issue_voucher`
--

LOCK TABLES `inv_issue_voucher` WRITE;
/*!40000 ALTER TABLE `inv_issue_voucher` DISABLE KEYS */;
INSERT INTO `inv_issue_voucher` (`id`, `voucher_number`, `store_id`, `issue_type`, `issued_to`, `department`, `issued_date`, `status`, `approved_by`, `approved_date`, `issued_by`, `total_amount`, `journal_entry_id`, `remarks`, `created_by`, `created_at`, `updated_at`, `material_request_id`) VALUES (1,'ISV-MNT-MNT-2026-00001',4,'SALE','ßêØßëÁßè® ßèáßï½ßèô ßè¡ßèòßï┤','Maintenance Service / Customer Care','2026-09-28','ISSUED','4store','2026-09-28 07:58:43','4store',5000.00,36,'Materials issued for Maintenance Request: MNT-2026-00001',NULL,'2026-09-28 07:58:43','2026-09-28 07:58:43',NULL),(2,'ISV-NLC-NLC-2026-00001',4,'SALE','ßêêßêØßêêßêØ ßêÿßêêßê░ ßëóßêêßïì','Customer Service / New Line','2026-09-28','ISSUED','reading2','2026-09-28 19:58:01','reading2',6000.00,37,'Materials issued for New Water Line Connection: NLC-2026-00001',NULL,'2026-09-28 19:58:01','2026-09-28 19:58:01',NULL),(3,'ISV-MNT-MNT-2026-00002',4,'SALE','ßèÑßèòßè│ßèÉßêà ßê×ßêï','Maintenance Service / Customer Care','2026-10-05','ISSUED','4store','2026-10-05 11:34:40','4store',3356.35,44,'Materials issued for Maintenance Request: MNT-2026-00002',NULL,'2026-10-05 11:34:40','2026-10-05 11:34:40',NULL),(4,'ISV-NLC-NLC-2026-00002',2,'SALE','ßêÿßêêßê░ ßï░ßëáßëá ßê░ßêÄßê×ßèò','Customer Service / New Line','2026-10-05','ISSUED','mstore','2026-10-05 19:39:31','mstore',4952.94,49,'Materials issued for New Water Line Connection: NLC-2026-00002',NULL,'2026-10-05 19:39:31','2026-10-05 19:39:31',NULL),(5,'ISV-NLC-NLC-2026-00003',4,'SALE','ßï«ßê┤ßìì ßè¿ßëáßï░ ßèáßêêßêÖ','Customer Service / New Line','2026-10-07','ISSUED','4store','2026-10-07 06:31:08','4store',3395.24,50,'Materials issued for New Water Line Connection: NLC-2026-00003',NULL,'2026-10-07 06:31:08','2026-10-07 06:31:08',NULL);
/*!40000 ALTER TABLE `inv_issue_voucher` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `inv_goods_received_note`
--

DROP TABLE IF EXISTS `inv_goods_received_note`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `inv_goods_received_note` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `grn_number` varchar(50) NOT NULL,
  `purchase_order_id` bigint(20) NOT NULL,
  `store_id` int(11) NOT NULL,
  `supplier_id` int(11) NOT NULL,
  `received_date` date NOT NULL,
  `received_by` varchar(100) NOT NULL,
  `status` enum('DRAFT','CONFIRMED','CANCELLED') NOT NULL DEFAULT 'DRAFT',
  `supplier_invoice_number` varchar(50) DEFAULT NULL,
  `remarks` varchar(500) DEFAULT NULL,
  `total_amount` decimal(15,2) NOT NULL DEFAULT 0.00,
  `journal_entry_id` bigint(20) DEFAULT NULL,
  `created_by` varchar(100) DEFAULT NULL,
  `created_at` datetime DEFAULT current_timestamp(),
  `updated_at` datetime DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `grn_number` (`grn_number`),
  KEY `fk_grn_po` (`purchase_order_id`),
  KEY `fk_grn_store` (`store_id`),
  KEY `fk_grn_supplier` (`supplier_id`),
  KEY `fk_grn_journal` (`journal_entry_id`),
  KEY `idx_grn_status` (`status`),
  CONSTRAINT `fk_grn_journal` FOREIGN KEY (`journal_entry_id`) REFERENCES `fnc_journal_entry` (`id`),
  CONSTRAINT `fk_grn_po` FOREIGN KEY (`purchase_order_id`) REFERENCES `inv_purchase_order` (`id`),
  CONSTRAINT `fk_grn_store` FOREIGN KEY (`store_id`) REFERENCES `inv_store` (`id`),
  CONSTRAINT `fk_grn_supplier` FOREIGN KEY (`supplier_id`) REFERENCES `inv_supplier` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=20 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_uca1400_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `inv_goods_received_note`
--

LOCK TABLES `inv_goods_received_note` WRITE;
/*!40000 ALTER TABLE `inv_goods_received_note` DISABLE KEYS */;
INSERT INTO `inv_goods_received_note` (`id`, `grn_number`, `purchase_order_id`, `store_id`, `supplier_id`, `received_date`, `received_by`, `status`, `supplier_invoice_number`, `remarks`, `total_amount`, `journal_entry_id`, `created_by`, `created_at`, `updated_at`) VALUES (10,'GRN-2026-00001',4,1,1,'2026-09-08','pofficer','CONFIRMED','5556','Goods received against PO PO-2026-00001',22000.00,13,'pofficer','2026-09-08 12:26:01','2026-09-08 12:36:39'),(11,'GRN-2026-00002',5,2,1,'2026-09-20','fhead','CONFIRMED','ogh787','Goods received against PO PO-2026-00002',2000.00,20,'fhead','2026-09-20 08:33:40','2026-09-20 08:33:49'),(12,'GRN-2026-00003',7,4,1,'2026-09-21','fhead','CONFIRMED','po888','Goods received against PO PO-2026-00004',59400.00,21,'fhead','2026-09-21 14:02:35','2026-09-21 14:02:52'),(13,'GRN-2026-00004',8,4,1,'2026-09-29','fhead','CONFIRMED','rpn000025','Goods received against PO PO-2026-00005',23000.00,38,'fhead','2026-09-29 19:29:45','2026-09-29 19:29:59'),(14,'GRN-2026-00005',9,3,1,'2026-09-30','reading2','CONFIRMED','po78784','Goods received against PO PO-2026-00006',10000.00,39,'reading2','2026-09-30 13:23:09','2026-09-30 13:23:21'),(15,'GRN-2026-00006',10,4,1,'2026-09-30','fhead','CONFIRMED','inv989898','Goods received against PO PO-2026-00007',60000.00,41,'fhead','2026-09-30 18:14:07','2026-09-30 18:14:13'),(16,'GRN-2026-00007',11,4,1,'2026-09-30','fhead','CONFIRMED','pr998811','Goods received against PO PO-2026-00008',500.00,42,'fhead','2026-09-30 19:32:13','2026-09-30 19:32:29'),(17,'GRN-2026-00008',12,2,1,'2026-09-30','fhead','CONFIRMED','nn1111','Goods received against PO PO-2026-00009',46000.00,43,'fhead','2026-09-30 20:24:38','2026-09-30 20:24:45'),(19,'GRV-00001',13,2,1,'2026-10-05','pofficer','CONFIRMED','INV-8000598','Goods received against PO PO-02027',4000.00,47,'pofficer','2026-10-05 13:34:53','2026-10-05 13:47:54');
/*!40000 ALTER TABLE `inv_goods_received_note` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `inv_disposal`
--

DROP TABLE IF EXISTS `inv_disposal`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `inv_disposal` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `disposal_number` varchar(50) NOT NULL,
  `store_id` int(11) NOT NULL,
  `branch_id` int(11) DEFAULT NULL,
  `disposal_type` varchar(30) NOT NULL,
  `disposal_date` date NOT NULL,
  `status` varchar(20) NOT NULL DEFAULT 'DRAFT',
  `total_amount` decimal(15,2) DEFAULT 0.00,
  `workflow_instance_id` bigint(20) DEFAULT NULL,
  `journal_entry_id` bigint(20) DEFAULT NULL,
  `reason` text DEFAULT NULL,
  `disposal_method` varchar(200) DEFAULT NULL,
  `committee_members` varchar(500) DEFAULT NULL,
  `remarks` varchar(500) DEFAULT NULL,
  `created_by` varchar(100) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `disposal_number` (`disposal_number`),
  KEY `branch_id` (`branch_id`),
  KEY `journal_entry_id` (`journal_entry_id`),
  KEY `workflow_instance_id` (`workflow_instance_id`),
  KEY `idx_inv_dsp_status` (`status`),
  KEY `idx_inv_dsp_store` (`store_id`)
) ENGINE=MyISAM DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `inv_disposal`
--

LOCK TABLES `inv_disposal` WRITE;
/*!40000 ALTER TABLE `inv_disposal` DISABLE KEYS */;
/*!40000 ALTER TABLE `inv_disposal` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `inv_material_request`
--

DROP TABLE IF EXISTS `inv_material_request`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `inv_material_request` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `request_number` varchar(50) NOT NULL,
  `store_id` int(11) NOT NULL,
  `department_id` int(11) DEFAULT NULL,
  `branch_id` int(11) DEFAULT NULL,
  `requested_by` varchar(200) NOT NULL,
  `requested_date` date NOT NULL,
  `needed_by_date` date DEFAULT NULL,
  `priority` varchar(20) NOT NULL DEFAULT 'NORMAL',
  `status` varchar(30) NOT NULL DEFAULT 'DRAFT',
  `purpose` varchar(500) DEFAULT NULL,
  `remarks` varchar(500) DEFAULT NULL,
  `total_estimated_amount` decimal(15,2) DEFAULT 0.00,
  `workflow_instance_id` bigint(20) DEFAULT NULL,
  `issue_voucher_id` bigint(20) DEFAULT NULL,
  `created_by` varchar(100) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `request_number` (`request_number`),
  KEY `issue_voucher_id` (`issue_voucher_id`),
  KEY `workflow_instance_id` (`workflow_instance_id`),
  KEY `idx_inv_mr_status` (`status`),
  KEY `idx_inv_mr_branch` (`branch_id`),
  KEY `idx_inv_mr_store` (`store_id`),
  KEY `idx_inv_mr_dept` (`department_id`)
) ENGINE=MyISAM DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `inv_material_request`
--

LOCK TABLES `inv_material_request` WRITE;
/*!40000 ALTER TABLE `inv_material_request` DISABLE KEYS */;
/*!40000 ALTER TABLE `inv_material_request` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `inv_return_voucher`
--

DROP TABLE IF EXISTS `inv_return_voucher`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `inv_return_voucher` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `voucher_number` varchar(50) NOT NULL,
  `store_id` int(11) NOT NULL,
  `branch_id` int(11) DEFAULT NULL,
  `return_type` varchar(30) NOT NULL,
  `original_issue_voucher_id` bigint(20) DEFAULT NULL,
  `original_grn_id` bigint(20) DEFAULT NULL,
  `supplier_id` bigint(20) DEFAULT NULL,
  `returned_by` varchar(200) DEFAULT NULL,
  `department` varchar(200) DEFAULT NULL,
  `return_date` date NOT NULL,
  `status` varchar(20) NOT NULL DEFAULT 'DRAFT',
  `approved_by` varchar(100) DEFAULT NULL,
  `approved_date` timestamp NULL DEFAULT NULL,
  `received_by` varchar(100) DEFAULT NULL,
  `total_amount` decimal(15,2) DEFAULT 0.00,
  `journal_entry_id` bigint(20) DEFAULT NULL,
  `reason` varchar(500) DEFAULT NULL,
  `remarks` varchar(500) DEFAULT NULL,
  `created_by` varchar(100) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `voucher_number` (`voucher_number`),
  KEY `branch_id` (`branch_id`),
  KEY `original_grn_id` (`original_grn_id`),
  KEY `supplier_id` (`supplier_id`),
  KEY `journal_entry_id` (`journal_entry_id`),
  KEY `idx_inv_rv_status` (`status`),
  KEY `idx_inv_rv_type` (`return_type`),
  KEY `idx_inv_rv_store` (`store_id`),
  KEY `idx_inv_rv_orig_iv` (`original_issue_voucher_id`)
) ENGINE=MyISAM DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `inv_return_voucher`
--

LOCK TABLES `inv_return_voucher` WRITE;
/*!40000 ALTER TABLE `inv_return_voucher` DISABLE KEYS */;
/*!40000 ALTER TABLE `inv_return_voucher` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `inv_stock_count`
--

DROP TABLE IF EXISTS `inv_stock_count`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `inv_stock_count` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `count_number` varchar(50) NOT NULL,
  `store_id` int(11) NOT NULL,
  `branch_id` int(11) DEFAULT NULL,
  `count_date` date NOT NULL,
  `count_scope` varchar(20) NOT NULL DEFAULT 'FULL',
  `category_filter_id` int(11) DEFAULT NULL,
  `status` varchar(20) NOT NULL DEFAULT 'PLANNED',
  `counted_by` varchar(100) DEFAULT NULL,
  `verified_by` varchar(100) DEFAULT NULL,
  `verified_date` timestamp NULL DEFAULT NULL,
  `total_system_value` decimal(15,2) DEFAULT 0.00,
  `total_physical_value` decimal(15,2) DEFAULT 0.00,
  `total_variance_value` decimal(15,2) DEFAULT 0.00,
  `stock_adjustment_id` bigint(20) DEFAULT NULL,
  `remarks` varchar(500) DEFAULT NULL,
  `created_by` varchar(100) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `count_number` (`count_number`),
  KEY `branch_id` (`branch_id`),
  KEY `category_filter_id` (`category_filter_id`),
  KEY `stock_adjustment_id` (`stock_adjustment_id`),
  KEY `idx_inv_sc_status` (`status`),
  KEY `idx_inv_sc_store` (`store_id`)
) ENGINE=MyISAM DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `inv_stock_count`
--

LOCK TABLES `inv_stock_count` WRITE;
/*!40000 ALTER TABLE `inv_stock_count` DISABLE KEYS */;
/*!40000 ALTER TABLE `inv_stock_count` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `custom_common_material`
--

DROP TABLE IF EXISTS `custom_common_material`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `custom_common_material` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `inv_item_id` bigint(20) DEFAULT NULL,
  `display_order` int(11) NOT NULL DEFAULT 0,
  `is_active` tinyint(1) NOT NULL DEFAULT 1,
  `created_at` datetime DEFAULT current_timestamp(),
  `updated_at` datetime DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `is_water_meter` tinyint(1) NOT NULL DEFAULT 0,
  PRIMARY KEY (`id`),
  KEY `inv_item_id` (`inv_item_id`),
  CONSTRAINT `custom_common_material_ibfk_1` FOREIGN KEY (`inv_item_id`) REFERENCES `inv_item` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `custom_common_material`
--

LOCK TABLES `custom_common_material` WRITE;
/*!40000 ALTER TABLE `custom_common_material` DISABLE KEYS */;
INSERT INTO `custom_common_material` (`id`, `inv_item_id`, `display_order`, `is_active`, `created_at`, `updated_at`, `is_water_meter`) VALUES (1,5,1,1,'2026-09-26 09:07:42','2026-09-26 09:07:42',0),(2,3,2,1,'2026-09-26 09:07:52','2026-09-26 09:07:52',0),(3,2,3,1,'2026-09-26 09:08:01','2026-09-26 09:08:01',0),(4,10,4,1,'2026-09-28 07:04:17','2026-09-28 07:04:17',0),(5,4,5,1,'2026-09-28 07:04:33','2026-09-28 07:04:33',0);
/*!40000 ALTER TABLE `custom_common_material` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `custom_maintenance_common_material`
--

DROP TABLE IF EXISTS `custom_maintenance_common_material`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `custom_maintenance_common_material` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `maintenance_type_id` bigint(20) NOT NULL,
  `inv_item_id` bigint(20) DEFAULT NULL,
  `display_order` int(11) NOT NULL DEFAULT 0,
  `is_active` tinyint(1) NOT NULL DEFAULT 1,
  `created_at` datetime DEFAULT current_timestamp(),
  `updated_at` datetime DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `is_water_meter` tinyint(1) NOT NULL DEFAULT 0,
  PRIMARY KEY (`id`),
  KEY `idx_cmm_type` (`maintenance_type_id`),
  CONSTRAINT `fk_cmm_type` FOREIGN KEY (`maintenance_type_id`) REFERENCES `custom_maintenance_type` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=9 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `custom_maintenance_common_material`
--

LOCK TABLES `custom_maintenance_common_material` WRITE;
/*!40000 ALTER TABLE `custom_maintenance_common_material` DISABLE KEYS */;
INSERT INTO `custom_maintenance_common_material` (`id`, `maintenance_type_id`, `inv_item_id`, `display_order`, `is_active`, `created_at`, `updated_at`, `is_water_meter`) VALUES (1,1,8,1,1,'2026-09-26 09:08:49','2026-09-26 09:08:49',0),(2,1,3,2,1,'2026-09-26 09:08:57','2026-09-26 09:08:57',0),(3,1,2,3,1,'2026-09-28 07:44:03','2026-09-28 07:44:03',0),(4,1,10,4,1,'2026-09-28 07:44:20','2026-09-28 07:44:20',0),(5,2,2,5,1,'2026-09-28 11:27:06','2026-09-28 11:27:06',0),(6,2,3,6,1,'2026-09-28 11:27:14','2026-09-28 11:27:14',0),(7,2,10,7,1,'2026-09-28 11:27:23','2026-09-28 11:27:23',0),(8,2,13,8,1,'2026-09-28 11:28:40','2026-09-28 11:28:40',0);
/*!40000 ALTER TABLE `custom_maintenance_common_material` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `custom_maintenance_request`
--

DROP TABLE IF EXISTS `custom_maintenance_request`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `custom_maintenance_request` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `request_number` varchar(50) NOT NULL,
  `customer_id` int(11) NOT NULL,
  `maintenance_type_id` bigint(20) DEFAULT NULL,
  `customer_full_name` varchar(200) NOT NULL,
  `customer_full_name_eng` varchar(200) DEFAULT NULL,
  `phone_number` varchar(50) NOT NULL,
  `national_id_number` varchar(50) DEFAULT NULL,
  `house_number` varchar(50) DEFAULT NULL,
  `account_number` varchar(50) NOT NULL,
  `meter_number` varchar(50) DEFAULT NULL,
  `branch_id` int(11) NOT NULL,
  `kebele_id` int(11) DEFAULT NULL,
  `ketena_id` int(11) DEFAULT NULL,
  `customer_type_id` int(11) DEFAULT NULL,
  `address_description` text DEFAULT NULL,
  `problem_description` text DEFAULT NULL,
  `status` varchar(50) NOT NULL DEFAULT 'PENDING_SURVEY_ASSIGNMENT',
  `survey_plumber_id` int(11) DEFAULT NULL,
  `survey_assigned_date` datetime DEFAULT NULL,
  `survey_plumber_notes` text DEFAULT NULL,
  `materials_utility_total` decimal(15,2) NOT NULL DEFAULT 0.00,
  `materials_outside_total` decimal(15,2) NOT NULL DEFAULT 0.00,
  `service_charge_percent` decimal(5,2) NOT NULL DEFAULT 55.00,
  `service_charge_amount` decimal(15,2) NOT NULL DEFAULT 0.00,
  `transport_charge_percent` decimal(5,2) NOT NULL DEFAULT 25.00,
  `transport_charge_amount` decimal(15,2) NOT NULL DEFAULT 0.00,
  `additional_fees_total` decimal(15,2) NOT NULL DEFAULT 0.00,
  `total_payable_amount` decimal(15,2) NOT NULL DEFAULT 0.00,
  `is_paid` tinyint(1) NOT NULL DEFAULT 0,
  `payment_reference_number` varchar(100) DEFAULT NULL,
  `payment_receipt_number` varchar(100) DEFAULT NULL,
  `payment_approved_by` varchar(100) DEFAULT NULL,
  `payment_approved_date` datetime DEFAULT NULL,
  `inv_issue_voucher_id` bigint(20) DEFAULT NULL,
  `materials_collected_date` datetime DEFAULT NULL,
  `storekeeper_username` varchar(100) DEFAULT NULL,
  `maintenance_plumber_id` int(11) DEFAULT NULL,
  `maintenance_assigned_date` datetime DEFAULT NULL,
  `maintenance_completed_date` datetime DEFAULT NULL,
  `maintenance_notes` text DEFAULT NULL,
  `maintenance_approved_by` varchar(100) DEFAULT NULL,
  `final_meter_reading` double DEFAULT NULL,
  `registered_by` varchar(100) DEFAULT NULL,
  `created_at` datetime DEFAULT current_timestamp(),
  `updated_at` datetime DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `rejection_reason` text DEFAULT NULL,
  `rejected_by` varchar(100) DEFAULT NULL,
  `rejected_date` datetime DEFAULT NULL,
  `cancellation_reason` text DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `request_number` (`request_number`),
  KEY `idx_cmr_status` (`status`),
  KEY `idx_cmr_branch` (`branch_id`),
  KEY `idx_cmr_customer` (`customer_id`),
  KEY `idx_cmr_phone` (`phone_number`),
  KEY `idx_cmr_account` (`account_number`),
  KEY `fk_cmr_type` (`maintenance_type_id`),
  CONSTRAINT `fk_cmr_customer` FOREIGN KEY (`customer_id`) REFERENCES `billing_customer_info` (`id`),
  CONSTRAINT `fk_cmr_type` FOREIGN KEY (`maintenance_type_id`) REFERENCES `custom_maintenance_type` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `custom_maintenance_request`
--

LOCK TABLES `custom_maintenance_request` WRITE;
/*!40000 ALTER TABLE `custom_maintenance_request` DISABLE KEYS */;
INSERT INTO `custom_maintenance_request` (`id`, `request_number`, `customer_id`, `maintenance_type_id`, `customer_full_name`, `customer_full_name_eng`, `phone_number`, `national_id_number`, `house_number`, `account_number`, `meter_number`, `branch_id`, `kebele_id`, `ketena_id`, `customer_type_id`, `address_description`, `problem_description`, `status`, `survey_plumber_id`, `survey_assigned_date`, `survey_plumber_notes`, `materials_utility_total`, `materials_outside_total`, `service_charge_percent`, `service_charge_amount`, `transport_charge_percent`, `transport_charge_amount`, `additional_fees_total`, `total_payable_amount`, `is_paid`, `payment_reference_number`, `payment_receipt_number`, `payment_approved_by`, `payment_approved_date`, `inv_issue_voucher_id`, `materials_collected_date`, `storekeeper_username`, `maintenance_plumber_id`, `maintenance_assigned_date`, `maintenance_completed_date`, `maintenance_notes`, `maintenance_approved_by`, `final_meter_reading`, `registered_by`, `created_at`, `updated_at`, `rejection_reason`, `rejected_by`, `rejected_date`, `cancellation_reason`) VALUES (1,'MNT-2026-00001',3167,1,'ßêØßëÁßè® ßèáßï½ßèô ßè¡ßèòßï┤','Mtku Ayana Kndie','+251995190298',NULL,NULL,'400180','mkljui',8,4,27,2138,'ßëÑßêÄßè¡ 2','ßëåßîúßê¬ ßëÑßêìßê¢ßëÁ','MAINTENANCE_COMPLETED',229,'2026-09-28 07:41:44','',1500.00,2000.00,55.00,1581.25,25.00,175.00,225.00,3481.25,1,'Bunna Bank','RN-09985','4gebioff','2026-09-28 07:51:43',1,'2026-09-28 07:58:43','4store',229,'2026-09-28 07:59:21','2026-09-28 07:59:53','done meterChange','4tech',30,'custom4','2026-09-28 07:39:58','2026-09-28 07:59:53',NULL,NULL,NULL,NULL),(2,'MNT-2026-00002',3007,2,'ßèÑßèòßè│ßèÉßêà ßê×ßêï','Enkuaneh Mola','+251900000000',NULL,NULL,'400060','0',8,4,27,2138,NULL,'metre change of user','MAINTENANCE_COMPLETED',229,'2026-09-28 11:29:23','',2300.00,8500.00,55.00,5706.25,25.00,375.00,211.00,8592.25,1,'Abay Bank','RP 800','4gebioff','2026-09-28 11:35:45',3,'2026-10-05 11:34:40','4store',229,'2026-10-05 11:35:42','2026-10-05 11:39:14','745','4tech',90,'custom4','2026-09-28 11:26:09','2026-10-05 11:39:14',NULL,NULL,NULL,NULL);
/*!40000 ALTER TABLE `custom_maintenance_request` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `hrms_salary_calculated`
--

DROP TABLE IF EXISTS `hrms_salary_calculated`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `hrms_salary_calculated` (
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
  KEY `fk_hrms_scal_emp` (`hrms_employee_id`),
  CONSTRAINT `fk_hrms_scal_emp` FOREIGN KEY (`hrms_employee_id`) REFERENCES `hrms_employee_info` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_hrms_scal_run` FOREIGN KEY (`hrms_payroll_run_id`) REFERENCES `hrms_payroll_runs` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `hrms_salary_calculated`
--

LOCK TABLES `hrms_salary_calculated` WRITE;
/*!40000 ALTER TABLE `hrms_salary_calculated` DISABLE KEYS */;
/*!40000 ALTER TABLE `hrms_salary_calculated` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `inv_purchase_order_line`
--

DROP TABLE IF EXISTS `inv_purchase_order_line`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `inv_purchase_order_line` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `purchase_order_id` bigint(20) NOT NULL,
  `item_id` bigint(20) NOT NULL,
  `ordered_quantity` decimal(15,4) NOT NULL,
  `received_quantity` decimal(15,4) NOT NULL DEFAULT 0.0000,
  `unit_price` decimal(15,4) NOT NULL,
  `total_price` decimal(15,2) NOT NULL DEFAULT 0.00,
  `vat_rate` decimal(5,2) DEFAULT 15.00,
  `vat_amount` decimal(15,2) DEFAULT 0.00,
  `line_order` int(11) NOT NULL DEFAULT 0,
  PRIMARY KEY (`id`),
  KEY `fk_pol_po` (`purchase_order_id`),
  KEY `fk_pol_item` (`item_id`),
  CONSTRAINT `fk_pol_item` FOREIGN KEY (`item_id`) REFERENCES `inv_item` (`id`),
  CONSTRAINT `fk_pol_po` FOREIGN KEY (`purchase_order_id`) REFERENCES `inv_purchase_order` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=24 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_uca1400_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `inv_purchase_order_line`
--

LOCK TABLES `inv_purchase_order_line` WRITE;
/*!40000 ALTER TABLE `inv_purchase_order_line` DISABLE KEYS */;
INSERT INTO `inv_purchase_order_line` (`id`, `purchase_order_id`, `item_id`, `ordered_quantity`, `received_quantity`, `unit_price`, `total_price`, `vat_rate`, `vat_amount`, `line_order`) VALUES (6,4,3,10.0000,10.0000,600.0000,6000.00,15.00,900.00,1),(7,4,2,20.0000,20.0000,800.0000,16000.00,15.00,2400.00,2),(8,5,5,20.0000,20.0000,100.0000,2000.00,15.00,300.00,1),(9,6,13,10.0000,0.0000,9000.0000,90000.00,15.00,13500.00,1),(10,6,16,20.0000,0.0000,5000.0000,100000.00,15.00,15000.00,2),(11,7,10,33.0000,33.0000,600.0000,19800.00,15.00,2970.00,1),(12,7,10,66.0000,66.0000,600.0000,39600.00,15.00,5940.00,2),(13,8,2,20.0000,20.0000,900.0000,18000.00,15.00,2700.00,1),(14,8,3,10.0000,10.0000,500.0000,5000.00,15.00,750.00,2),(15,9,15,10.0000,10.0000,1000.0000,10000.00,15.00,1500.00,1),(16,10,16,100.0000,100.0000,500.0000,50000.00,15.00,7500.00,1),(17,10,4,50.0000,50.0000,200.0000,10000.00,15.00,1500.00,2),(18,11,10,20.0000,20.0000,10.0000,200.00,15.00,30.00,1),(19,11,14,10.0000,10.0000,30.0000,300.00,15.00,45.00,2),(20,12,13,20.0000,20.0000,2000.0000,40000.00,15.00,6000.00,1),(21,12,12,10.0000,10.0000,600.0000,6000.00,15.00,900.00,2),(22,13,7,10.0000,10.0000,100.0000,1000.00,15.00,150.00,1),(23,13,13,20.0000,20.0000,150.0000,3000.00,15.00,450.00,2);
/*!40000 ALTER TABLE `inv_purchase_order_line` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `inv_stock_adjustment_line`
--

DROP TABLE IF EXISTS `inv_stock_adjustment_line`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `inv_stock_adjustment_line` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `adjustment_id` bigint(20) NOT NULL,
  `item_id` bigint(20) NOT NULL,
  `system_quantity` decimal(15,4) NOT NULL,
  `actual_quantity` decimal(15,4) NOT NULL,
  `variance` decimal(15,4) NOT NULL DEFAULT 0.0000,
  `unit_cost` decimal(15,4) NOT NULL DEFAULT 0.0000,
  `variance_cost` decimal(15,2) NOT NULL DEFAULT 0.00,
  `reason` varchar(300) DEFAULT NULL,
  `line_order` int(11) NOT NULL DEFAULT 0,
  PRIMARY KEY (`id`),
  KEY `fk_adjl_adjustment` (`adjustment_id`),
  KEY `fk_adjl_item` (`item_id`),
  CONSTRAINT `fk_adjl_adjustment` FOREIGN KEY (`adjustment_id`) REFERENCES `inv_stock_adjustment` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_adjl_item` FOREIGN KEY (`item_id`) REFERENCES `inv_item` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_uca1400_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `inv_stock_adjustment_line`
--

LOCK TABLES `inv_stock_adjustment_line` WRITE;
/*!40000 ALTER TABLE `inv_stock_adjustment_line` DISABLE KEYS */;
/*!40000 ALTER TABLE `inv_stock_adjustment_line` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `inv_stock_transaction`
--

DROP TABLE IF EXISTS `inv_stock_transaction`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `inv_stock_transaction` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `transaction_number` varchar(50) NOT NULL,
  `item_id` bigint(20) NOT NULL,
  `store_id` int(11) NOT NULL,
  `transaction_type` enum('RECEIVE','ISSUE_SALE','ISSUE_INTERNAL','TRANSFER_OUT','TRANSFER_IN','ADJUSTMENT_PLUS','ADJUSTMENT_MINUS','RETURN','DISPOSAL') NOT NULL,
  `quantity` decimal(15,4) NOT NULL,
  `unit_cost` decimal(15,4) NOT NULL DEFAULT 0.0000,
  `total_cost` decimal(15,2) NOT NULL DEFAULT 0.00,
  `reference_type` varchar(50) DEFAULT NULL,
  `reference_id` bigint(20) DEFAULT NULL,
  `balance_before` decimal(15,4) NOT NULL DEFAULT 0.0000,
  `balance_after` decimal(15,4) NOT NULL DEFAULT 0.0000,
  `serial_tracking_id` bigint(20) DEFAULT NULL,
  `remarks` varchar(500) DEFAULT NULL,
  `transaction_date` date NOT NULL,
  `created_by` varchar(100) DEFAULT NULL,
  `created_at` datetime DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `transaction_number` (`transaction_number`),
  KEY `fk_txn_store` (`store_id`),
  KEY `fk_txn_serial` (`serial_tracking_id`),
  KEY `idx_txn_date` (`transaction_date`),
  KEY `idx_txn_item` (`item_id`),
  KEY `idx_txn_type` (`transaction_type`),
  KEY `idx_txn_ref` (`reference_type`,`reference_id`),
  CONSTRAINT `fk_txn_item` FOREIGN KEY (`item_id`) REFERENCES `inv_item` (`id`),
  CONSTRAINT `fk_txn_serial` FOREIGN KEY (`serial_tracking_id`) REFERENCES `inv_serial_tracking` (`id`),
  CONSTRAINT `fk_txn_store` FOREIGN KEY (`store_id`) REFERENCES `inv_store` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=127 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_uca1400_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `inv_stock_transaction`
--

LOCK TABLES `inv_stock_transaction` WRITE;
/*!40000 ALTER TABLE `inv_stock_transaction` DISABLE KEYS */;
INSERT INTO `inv_stock_transaction` (`id`, `transaction_number`, `item_id`, `store_id`, `transaction_type`, `quantity`, `unit_cost`, `total_cost`, `reference_type`, `reference_id`, `balance_before`, `balance_after`, `serial_tracking_id`, `remarks`, `transaction_date`, `created_by`, `created_at`) VALUES (96,'TXN-2026-000001',2,4,'ISSUE_SALE',1.0000,800.0000,800.00,'CUSTOMER_MAINTENANCE',1,2.0000,1.0000,NULL,NULL,'2026-09-28','4store','2026-09-28 07:58:43'),(97,'TXN-2026-000002',10,4,'ISSUE_SALE',7.0000,600.0000,4200.00,'CUSTOMER_MAINTENANCE',1,29.0000,22.0000,NULL,NULL,'2026-09-28','4store','2026-09-28 07:58:43'),(98,'TXN-2026-000003',10,4,'ISSUE_SALE',10.0000,600.0000,6000.00,'NEW_LINE_CONNECTION',2,22.0000,12.0000,NULL,NULL,'2026-09-28','reading2','2026-09-28 19:58:01'),(99,'TXN-2026-000004',2,4,'RECEIVE',20.0000,900.0000,18000.00,'GRN',13,1.0000,21.0000,NULL,NULL,'2026-09-29','fhead','2026-09-29 19:29:59'),(100,'TXN-2026-000005',3,4,'RECEIVE',10.0000,500.0000,5000.00,'GRN',13,0.0000,10.0000,NULL,NULL,'2026-09-29','fhead','2026-09-29 19:29:59'),(101,'TXN-2026-000006',15,3,'RECEIVE',10.0000,1000.0000,10000.00,'GRN',14,98.0000,108.0000,NULL,NULL,'2026-09-30','reading2','2026-09-30 13:23:21'),(102,'TXN-2026-000007',10,4,'TRANSFER_OUT',5.0000,600.0000,3000.00,'TRANSFER',11,12.0000,7.0000,NULL,NULL,'2026-09-30','4store','2026-09-30 14:05:26'),(103,'TXN-2026-000008',10,1,'RECEIVE',5.0000,600.0000,3000.00,'TRANSFER',11,100.0000,105.0000,NULL,NULL,'2026-09-30','mostore','2026-09-30 14:06:38'),(104,'TXN-2026-000009',16,4,'RECEIVE',100.0000,575.0000,57500.00,'GRN',15,0.0000,100.0000,NULL,NULL,'2026-09-30','fhead','2026-09-30 18:14:13'),(105,'TXN-2026-000010',4,4,'RECEIVE',50.0000,230.0000,11500.00,'GRN',15,0.0000,50.0000,NULL,NULL,'2026-09-30','fhead','2026-09-30 18:14:13'),(106,'TXN-2026-000011',10,4,'RECEIVE',20.0000,11.5000,230.00,'GRN',16,7.0000,27.0000,NULL,NULL,'2026-09-30','fhead','2026-09-30 19:32:29'),(107,'TXN-2026-000012',14,4,'RECEIVE',10.0000,34.5000,345.00,'GRN',16,0.0000,10.0000,NULL,NULL,'2026-09-30','fhead','2026-09-30 19:32:29'),(108,'TXN-2026-000013',13,2,'RECEIVE',20.0000,2300.0000,46000.00,'GRN',17,100.0000,120.0000,NULL,NULL,'2026-09-30','fhead','2026-09-30 20:24:45'),(109,'TXN-2026-000014',12,2,'RECEIVE',10.0000,690.0000,6900.00,'GRN',17,100.0000,110.0000,NULL,NULL,'2026-09-30','fhead','2026-09-30 20:24:45'),(110,'TXN-2026-000015',2,4,'ISSUE_SALE',1.0000,895.2381,895.24,'CUSTOMER_MAINTENANCE',2,21.0000,20.0000,NULL,NULL,'2026-10-05','4store','2026-10-05 11:34:40'),(111,'TXN-2026-000016',10,4,'ISSUE_SALE',15.0000,164.0741,2461.11,'CUSTOMER_MAINTENANCE',2,27.0000,12.0000,NULL,NULL,'2026-10-05','4store','2026-10-05 11:34:40'),(116,'TXN-2026-000017',7,2,'RECEIVE',10.0000,115.0000,1150.00,'GRN',19,100.0000,110.0000,NULL,NULL,'2026-10-05','pofficer','2026-10-05 13:47:54'),(117,'TXN-2026-000018',13,2,'RECEIVE',20.0000,172.5000,3450.00,'GRN',19,120.0000,140.0000,NULL,NULL,'2026-10-05','pofficer','2026-10-05 13:47:54'),(118,'TXN-2026-000019',5,1,'TRANSFER_OUT',50.0000,120.0000,6000.00,'TRANSFER',13,100.0000,50.0000,NULL,NULL,'2026-10-05','mostore','2026-10-05 19:02:49'),(119,'TXN-2026-000020',4,1,'TRANSFER_OUT',10.0000,38.0000,380.00,'TRANSFER',13,40.0000,30.0000,NULL,NULL,'2026-10-05','mostore','2026-10-05 19:02:49'),(120,'TXN-2026-000021',5,2,'RECEIVE',50.0000,120.0000,6000.00,'TRANSFER',13,120.0000,170.0000,NULL,NULL,'2026-10-05','mstore','2026-10-05 19:03:33'),(121,'TXN-2026-000022',4,2,'RECEIVE',10.0000,38.0000,380.00,'TRANSFER',13,100.0000,110.0000,NULL,NULL,'2026-10-05','mstore','2026-10-05 19:03:33'),(122,'TXN-2026-000023',5,2,'ISSUE_SALE',20.0000,117.6471,2352.94,'NEW_LINE_CONNECTION',3,170.0000,150.0000,NULL,NULL,'2026-10-05','mstore','2026-10-05 19:39:31'),(123,'TXN-2026-000024',3,2,'ISSUE_SALE',3.0000,600.0000,1800.00,'NEW_LINE_CONNECTION',3,3.0000,0.0000,NULL,NULL,'2026-10-05','mstore','2026-10-05 19:39:31'),(124,'TXN-2026-000025',2,2,'ISSUE_SALE',1.0000,800.0000,800.00,'NEW_LINE_CONNECTION',3,10.0000,9.0000,NULL,NULL,'2026-10-05','mstore','2026-10-05 19:39:31'),(125,'TXN-2026-000026',3,4,'ISSUE_SALE',5.0000,500.0000,2500.00,'NEW_LINE_CONNECTION',4,10.0000,5.0000,NULL,NULL,'2026-10-07','4store','2026-10-07 06:31:08'),(126,'TXN-2026-000027',2,4,'ISSUE_SALE',1.0000,895.2381,895.24,'NEW_LINE_CONNECTION',4,20.0000,19.0000,NULL,NULL,'2026-10-07','4store','2026-10-07 06:31:08');
/*!40000 ALTER TABLE `inv_stock_transaction` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `inv_stock_transfer_line`
--

DROP TABLE IF EXISTS `inv_stock_transfer_line`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `inv_stock_transfer_line` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `transfer_id` bigint(20) NOT NULL,
  `item_id` bigint(20) NOT NULL,
  `quantity` decimal(15,4) NOT NULL,
  `unit_cost` decimal(15,4) NOT NULL DEFAULT 0.0000,
  `total_cost` decimal(15,2) NOT NULL DEFAULT 0.00,
  `serial_tracking_id` bigint(20) DEFAULT NULL,
  `received_quantity` decimal(15,4) DEFAULT NULL,
  `line_order` int(11) NOT NULL DEFAULT 0,
  PRIMARY KEY (`id`),
  KEY `fk_tfl_transfer` (`transfer_id`),
  KEY `fk_tfl_item` (`item_id`),
  KEY `fk_tfl_serial` (`serial_tracking_id`),
  CONSTRAINT `fk_tfl_item` FOREIGN KEY (`item_id`) REFERENCES `inv_item` (`id`),
  CONSTRAINT `fk_tfl_serial` FOREIGN KEY (`serial_tracking_id`) REFERENCES `inv_serial_tracking` (`id`),
  CONSTRAINT `fk_tfl_transfer` FOREIGN KEY (`transfer_id`) REFERENCES `inv_stock_transfer` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=23 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_uca1400_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `inv_stock_transfer_line`
--

LOCK TABLES `inv_stock_transfer_line` WRITE;
/*!40000 ALTER TABLE `inv_stock_transfer_line` DISABLE KEYS */;
INSERT INTO `inv_stock_transfer_line` (`id`, `transfer_id`, `item_id`, `quantity`, `unit_cost`, `total_cost`, `serial_tracking_id`, `received_quantity`, `line_order`) VALUES (5,3,3,3.0000,600.0000,1800.00,NULL,NULL,1),(6,3,2,10.0000,800.0000,8000.00,NULL,NULL,2),(7,4,13,20.0000,32.0000,640.00,NULL,NULL,1),(8,4,5,30.0000,120.0000,3600.00,NULL,NULL,2),(9,5,16,30.0000,62.0000,1860.00,NULL,NULL,1),(10,6,4,60.0000,38.0000,2280.00,NULL,NULL,1),(11,6,16,60.0000,62.0000,3720.00,NULL,NULL,2),(12,7,15,55.0000,24.0000,1320.00,NULL,NULL,1),(13,8,6,30.0000,28.0000,840.00,NULL,NULL,1),(14,9,4,10.0000,38.0000,380.00,NULL,NULL,1),(15,9,10,30.0000,600.0000,18000.00,NULL,NULL,2),(16,10,14,20.0000,14.0000,280.00,NULL,NULL,1),(17,10,2,5.0000,800.0000,4000.00,NULL,NULL,2),(18,11,10,5.0000,600.0000,3000.00,NULL,NULL,1),(19,12,6,20.0000,28.0000,560.00,NULL,NULL,1),(20,12,12,20.0000,22.0000,440.00,NULL,NULL,2),(21,13,5,50.0000,120.0000,6000.00,NULL,NULL,1),(22,13,4,10.0000,38.0000,380.00,NULL,NULL,2);
/*!40000 ALTER TABLE `inv_stock_transfer_line` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `inv_issue_voucher_line`
--

DROP TABLE IF EXISTS `inv_issue_voucher_line`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `inv_issue_voucher_line` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `voucher_id` bigint(20) NOT NULL,
  `item_id` bigint(20) NOT NULL,
  `requested_quantity` decimal(15,4) NOT NULL,
  `approved_quantity` decimal(15,4) DEFAULT NULL,
  `issued_quantity` decimal(15,4) NOT NULL DEFAULT 0.0000,
  `unit_cost` decimal(15,4) NOT NULL DEFAULT 0.0000,
  `total_cost` decimal(15,2) NOT NULL DEFAULT 0.00,
  `serial_tracking_id` bigint(20) DEFAULT NULL,
  `line_order` int(11) NOT NULL DEFAULT 0,
  PRIMARY KEY (`id`),
  KEY `fk_ivl_voucher` (`voucher_id`),
  KEY `fk_ivl_item` (`item_id`),
  KEY `fk_ivl_serial` (`serial_tracking_id`),
  CONSTRAINT `fk_ivl_item` FOREIGN KEY (`item_id`) REFERENCES `inv_item` (`id`),
  CONSTRAINT `fk_ivl_serial` FOREIGN KEY (`serial_tracking_id`) REFERENCES `inv_serial_tracking` (`id`),
  CONSTRAINT `fk_ivl_voucher` FOREIGN KEY (`voucher_id`) REFERENCES `inv_issue_voucher` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=11 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_uca1400_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `inv_issue_voucher_line`
--

LOCK TABLES `inv_issue_voucher_line` WRITE;
/*!40000 ALTER TABLE `inv_issue_voucher_line` DISABLE KEYS */;
INSERT INTO `inv_issue_voucher_line` (`id`, `voucher_id`, `item_id`, `requested_quantity`, `approved_quantity`, `issued_quantity`, `unit_cost`, `total_cost`, `serial_tracking_id`, `line_order`) VALUES (1,1,2,1.0000,1.0000,1.0000,800.0000,800.00,NULL,1),(2,1,10,7.0000,7.0000,7.0000,600.0000,4200.00,NULL,2),(3,2,10,10.0000,10.0000,10.0000,600.0000,6000.00,NULL,1),(4,3,2,1.0000,1.0000,1.0000,895.2381,895.24,NULL,1),(5,3,10,15.0000,15.0000,15.0000,164.0741,2461.11,NULL,2),(6,4,5,20.0000,20.0000,20.0000,117.6471,2352.94,NULL,1),(7,4,3,3.0000,3.0000,3.0000,600.0000,1800.00,NULL,2),(8,4,2,1.0000,1.0000,1.0000,800.0000,800.00,NULL,3),(9,5,3,5.0000,5.0000,5.0000,500.0000,2500.00,NULL,1),(10,5,2,1.0000,1.0000,1.0000,895.2381,895.24,NULL,2);
/*!40000 ALTER TABLE `inv_issue_voucher_line` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `inv_goods_received_note_line`
--

DROP TABLE IF EXISTS `inv_goods_received_note_line`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `inv_goods_received_note_line` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `grn_id` bigint(20) NOT NULL,
  `po_line_id` bigint(20) NOT NULL,
  `item_id` bigint(20) NOT NULL,
  `received_quantity` decimal(15,4) NOT NULL,
  `accepted_quantity` decimal(15,4) NOT NULL,
  `rejected_quantity` decimal(15,4) NOT NULL DEFAULT 0.0000,
  `unit_cost` decimal(15,4) NOT NULL,
  `total_cost` decimal(15,2) NOT NULL DEFAULT 0.00,
  `batch_number` varchar(50) DEFAULT NULL,
  `expiry_date` date DEFAULT NULL,
  `rejection_reason` varchar(300) DEFAULT NULL,
  `line_order` int(11) NOT NULL DEFAULT 0,
  PRIMARY KEY (`id`),
  KEY `fk_grnl_grn` (`grn_id`),
  KEY `fk_grnl_pol` (`po_line_id`),
  KEY `fk_grnl_item` (`item_id`),
  CONSTRAINT `fk_grnl_grn` FOREIGN KEY (`grn_id`) REFERENCES `inv_goods_received_note` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_grnl_item` FOREIGN KEY (`item_id`) REFERENCES `inv_item` (`id`),
  CONSTRAINT `fk_grnl_pol` FOREIGN KEY (`po_line_id`) REFERENCES `inv_purchase_order_line` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=37 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_uca1400_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `inv_goods_received_note_line`
--

LOCK TABLES `inv_goods_received_note_line` WRITE;
/*!40000 ALTER TABLE `inv_goods_received_note_line` DISABLE KEYS */;
INSERT INTO `inv_goods_received_note_line` (`id`, `grn_id`, `po_line_id`, `item_id`, `received_quantity`, `accepted_quantity`, `rejected_quantity`, `unit_cost`, `total_cost`, `batch_number`, `expiry_date`, `rejection_reason`, `line_order`) VALUES (19,10,6,3,10.0000,10.0000,0.0000,600.0000,6000.00,'45514','2026-09-16','',1),(20,10,7,2,20.0000,20.0000,0.0000,800.0000,16000.00,'875','2026-09-30','',2),(21,11,8,5,20.0000,20.0000,0.0000,100.0000,2000.00,'',NULL,'',1),(22,12,11,10,33.0000,33.0000,0.0000,600.0000,19800.00,'',NULL,'',1),(23,12,12,10,66.0000,66.0000,0.0000,600.0000,39600.00,'',NULL,'',2),(24,13,13,2,20.0000,20.0000,0.0000,900.0000,18000.00,'',NULL,'',1),(25,13,14,3,10.0000,10.0000,0.0000,500.0000,5000.00,'',NULL,'',2),(26,14,15,15,10.0000,10.0000,0.0000,1000.0000,10000.00,'',NULL,'',1),(27,15,16,16,100.0000,100.0000,0.0000,500.0000,50000.00,'',NULL,'',1),(28,15,17,4,50.0000,50.0000,0.0000,200.0000,10000.00,'',NULL,'',2),(29,16,18,10,20.0000,20.0000,0.0000,10.0000,200.00,'',NULL,'',1),(30,16,19,14,10.0000,10.0000,0.0000,30.0000,300.00,'',NULL,'',2),(31,17,20,13,20.0000,20.0000,0.0000,2000.0000,40000.00,'',NULL,'',1),(32,17,21,12,10.0000,10.0000,0.0000,600.0000,6000.00,'',NULL,'',2),(35,19,22,7,10.0000,10.0000,0.0000,100.0000,1000.00,'',NULL,'',1),(36,19,23,13,20.0000,20.0000,0.0000,150.0000,3000.00,'',NULL,'',2);
/*!40000 ALTER TABLE `inv_goods_received_note_line` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `inv_disposal_line`
--

DROP TABLE IF EXISTS `inv_disposal_line`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `inv_disposal_line` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `disposal_id` bigint(20) NOT NULL,
  `item_id` bigint(20) NOT NULL,
  `line_order` int(11) NOT NULL DEFAULT 1,
  `quantity` decimal(15,4) NOT NULL,
  `unit_cost` decimal(15,4) DEFAULT 0.0000,
  `total_cost` decimal(15,2) DEFAULT 0.00,
  `reason` varchar(500) DEFAULT NULL,
  `remarks` varchar(500) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `disposal_id` (`disposal_id`),
  KEY `item_id` (`item_id`)
) ENGINE=MyISAM DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `inv_disposal_line`
--

LOCK TABLES `inv_disposal_line` WRITE;
/*!40000 ALTER TABLE `inv_disposal_line` DISABLE KEYS */;
/*!40000 ALTER TABLE `inv_disposal_line` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `inv_material_request_line`
--

DROP TABLE IF EXISTS `inv_material_request_line`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `inv_material_request_line` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `material_request_id` bigint(20) NOT NULL,
  `item_id` bigint(20) NOT NULL,
  `line_order` int(11) NOT NULL DEFAULT 1,
  `requested_quantity` decimal(15,4) NOT NULL,
  `approved_quantity` decimal(15,4) DEFAULT NULL,
  `issued_quantity` decimal(15,4) DEFAULT 0.0000,
  `estimated_unit_cost` decimal(15,4) DEFAULT 0.0000,
  `remarks` varchar(500) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `material_request_id` (`material_request_id`),
  KEY `item_id` (`item_id`)
) ENGINE=MyISAM DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `inv_material_request_line`
--

LOCK TABLES `inv_material_request_line` WRITE;
/*!40000 ALTER TABLE `inv_material_request_line` DISABLE KEYS */;
/*!40000 ALTER TABLE `inv_material_request_line` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `inv_return_voucher_line`
--

DROP TABLE IF EXISTS `inv_return_voucher_line`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `inv_return_voucher_line` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `return_voucher_id` bigint(20) NOT NULL,
  `item_id` bigint(20) NOT NULL,
  `line_order` int(11) NOT NULL DEFAULT 1,
  `quantity` decimal(15,4) NOT NULL,
  `unit_cost` decimal(15,4) DEFAULT 0.0000,
  `total_cost` decimal(15,2) DEFAULT 0.00,
  `condition_status` varchar(30) DEFAULT 'GOOD',
  `remarks` varchar(500) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `return_voucher_id` (`return_voucher_id`),
  KEY `item_id` (`item_id`)
) ENGINE=MyISAM DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `inv_return_voucher_line`
--

LOCK TABLES `inv_return_voucher_line` WRITE;
/*!40000 ALTER TABLE `inv_return_voucher_line` DISABLE KEYS */;
/*!40000 ALTER TABLE `inv_return_voucher_line` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `inv_stock_count_line`
--

DROP TABLE IF EXISTS `inv_stock_count_line`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `inv_stock_count_line` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `stock_count_id` bigint(20) NOT NULL,
  `item_id` bigint(20) NOT NULL,
  `system_quantity` decimal(15,4) NOT NULL,
  `physical_quantity` decimal(15,4) DEFAULT NULL,
  `variance_quantity` decimal(15,4) DEFAULT NULL,
  `unit_cost` decimal(15,4) DEFAULT 0.0000,
  `variance_value` decimal(15,2) DEFAULT 0.00,
  `is_counted` tinyint(1) NOT NULL DEFAULT 0,
  `remarks` varchar(500) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `stock_count_id` (`stock_count_id`),
  KEY `item_id` (`item_id`)
) ENGINE=MyISAM DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `inv_stock_count_line`
--

LOCK TABLES `inv_stock_count_line` WRITE;
/*!40000 ALTER TABLE `inv_stock_count_line` DISABLE KEYS */;
/*!40000 ALTER TABLE `inv_stock_count_line` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `custom_maintenance_activity_log`
--

DROP TABLE IF EXISTS `custom_maintenance_activity_log`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `custom_maintenance_activity_log` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `request_id` bigint(20) NOT NULL,
  `action` varchar(100) NOT NULL,
  `from_status` varchar(50) DEFAULT NULL,
  `to_status` varchar(50) NOT NULL,
  `actor_username` varchar(100) NOT NULL,
  `actor_role` varchar(100) DEFAULT NULL,
  `comments` text DEFAULT NULL,
  `created_at` datetime DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `idx_cmal_req` (`request_id`),
  CONSTRAINT `fk_cmal_req` FOREIGN KEY (`request_id`) REFERENCES `custom_maintenance_request` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=15 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `custom_maintenance_activity_log`
--

LOCK TABLES `custom_maintenance_activity_log` WRITE;
/*!40000 ALTER TABLE `custom_maintenance_activity_log` DISABLE KEYS */;
INSERT INTO `custom_maintenance_activity_log` (`id`, `request_id`, `action`, `from_status`, `to_status`, `actor_username`, `actor_role`, `comments`, `created_at`) VALUES (1,1,'REQUEST_CREATED',NULL,'PENDING_SURVEY_ASSIGNMENT','custom4','CUSTOMER_SERVICE','Customer maintenance request registered. Type: ßï¿ßëºßèòßëº ßììßê│ßê¢ ßîÑßîêßèô, Customer: ßêØßëÁßè® ßèáßï½ßèô ßè¡ßèòßï┤ (400180)','2026-09-28 07:39:58'),(2,1,'SURVEY_PLUMBER_ASSIGNED','PENDING_SURVEY_ASSIGNMENT','SURVEY_IN_PROGRESS','4tech','TECHNICAL','Plumber 4plumber ppp assigned for on-site maintenance inspection. ßëúßêêßêÖßï½ ßèÑßëâ ßëÑßêìßê¢ßëÁ ßï¡ßêÿßê¡ßêØßê¡','2026-09-28 07:41:44'),(3,1,'SURVEY_SUBMITTED','SURVEY_IN_PROGRESS','PENDING_PAYMENT_APPROVAL','4tech','TECHNICAL','Maintenance materials & fees encoded. Utility: ETB 1500.00 (Meter: ETB 800.00 - 0% overhead), Outside: ETB 2000.00, 55% Service: ETB 1581.25, 25% Transport: ETB 175.00, Fees: ETB 225.00, Total Payable: ETB 3481.25','2026-09-28 07:45:44'),(4,1,'PAYMENT_APPROVED','PENDING_PAYMENT_APPROVAL','PENDING_STORE_COLLECTION','4gebioff','REVENUE','Maintenance payment approved by Revenue Officer. Receipt: RN-09985, Ref: Bunna Bank (prices/items reviewed & updated)','2026-09-28 07:51:43'),(5,1,'MATERIALS_DISPATCHED','PENDING_STORE_COLLECTION','MATERIALS_COLLECTED','4store','INVENTORY','Maintenance materials issued from store \'4branch Store\' and released by storekeeper: 4store (Voucher: ISV-MNT-MNT-2026-00001, Journal: JE-INV-2026-1790582323366)','2026-09-28 07:58:43'),(6,1,'MAINTENANCE_PLUMBER_ASSIGNED','MATERIALS_COLLECTED','MAINTENANCE_IN_PROGRESS','4tech','TECHNICAL','Plumber 4plumber ppp assigned for physical maintenance repair. ','2026-09-28 07:59:21'),(7,1,'MAINTENANCE_COMPLETED','MAINTENANCE_IN_PROGRESS','MAINTENANCE_COMPLETED','4tech','TECHNICAL','Customer maintenance physical work completed and verified. done meterChange','2026-09-28 07:59:53'),(8,2,'REQUEST_CREATED',NULL,'PENDING_SURVEY_ASSIGNMENT','custom4','CUSTOMER_SERVICE','Customer maintenance request registered. Type: ßï¿ßïìßêâ ßëåßîúßê¬ ßëàßï½ßê¼ / ßîÑßîêßèô, Customer: ßèÑßèòßè│ßèÉßêà ßê×ßêï (400060)','2026-09-28 11:26:09'),(9,2,'SURVEY_PLUMBER_ASSIGNED','PENDING_SURVEY_ASSIGNMENT','SURVEY_IN_PROGRESS','4tech','TECHNICAL','Plumber 4plumber ppp assigned for on-site maintenance inspection. ','2026-09-28 11:29:23'),(10,2,'SURVEY_SUBMITTED','SURVEY_IN_PROGRESS','PENDING_PAYMENT_APPROVAL','4tech','TECHNICAL','Maintenance materials & fees encoded. Utility: ETB 2300.00 (Meter: ETB 800.00 - 0% overhead), Outside: ETB 2320.00, 55% Service: ETB 2307.25, 25% Transport: ETB 375.00, Fees: ETB 211.00, Total Payable: ETB 5193.25','2026-09-28 11:30:43'),(11,2,'PAYMENT_APPROVED','PENDING_PAYMENT_APPROVAL','PENDING_STORE_COLLECTION','4gebioff','REVENUE','Maintenance payment approved by Revenue Officer. Receipt: RP 800, Ref: Abay Bank (prices/items reviewed & updated)','2026-09-28 11:35:45'),(12,2,'MATERIALS_DISPATCHED','PENDING_STORE_COLLECTION','MATERIALS_COLLECTED','4store','INVENTORY','Maintenance materials issued from store \'4branch Store\' and released by storekeeper: 4store (Voucher: ISV-MNT-MNT-2026-00002, Journal: JE-INV-0001)','2026-10-05 11:34:40'),(13,2,'MAINTENANCE_PLUMBER_ASSIGNED','MATERIALS_COLLECTED','MAINTENANCE_IN_PROGRESS','4tech','TECHNICAL','Plumber 4plumber ppp assigned for physical maintenance repair. ','2026-10-05 11:35:42'),(14,2,'MAINTENANCE_COMPLETED','MAINTENANCE_IN_PROGRESS','MAINTENANCE_COMPLETED','4tech','TECHNICAL','Customer maintenance physical work completed and verified. 745','2026-10-05 11:39:14');
/*!40000 ALTER TABLE `custom_maintenance_activity_log` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `custom_maintenance_additional_fee`
--

DROP TABLE IF EXISTS `custom_maintenance_additional_fee`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `custom_maintenance_additional_fee` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `request_id` bigint(20) NOT NULL,
  `fee_type_id` int(11) DEFAULT NULL,
  `fee_name` varchar(200) NOT NULL,
  `fee_name_am` varchar(200) NOT NULL,
  `unit_name` varchar(50) NOT NULL DEFAULT 'ßëÑßê¡',
  `quantity` decimal(10,2) NOT NULL DEFAULT 1.00,
  `unit_price` decimal(15,2) NOT NULL DEFAULT 0.00,
  `total_price` decimal(15,2) NOT NULL DEFAULT 0.00,
  `remarks` varchar(500) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_cmaf_req` (`request_id`),
  CONSTRAINT `fk_cmaf_req` FOREIGN KEY (`request_id`) REFERENCES `custom_maintenance_request` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=25 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `custom_maintenance_additional_fee`
--

LOCK TABLES `custom_maintenance_additional_fee` WRITE;
/*!40000 ALTER TABLE `custom_maintenance_additional_fee` DISABLE KEYS */;
INSERT INTO `custom_maintenance_additional_fee` (`id`, `request_id`, `fee_type_id`, `fee_name`, `fee_name_am`, `unit_name`, `quantity`, `unit_price`, `total_price`, `remarks`) VALUES (7,1,1,'Site Survey Fee','ßï¿ßï│ßê░ßê│ ßîÑßèôßëÁ ßè¡ßììßï½','ßëÑßê¡',1.00,40.00,40.00,''),(8,1,2,'Excavation / Inspection','ßè¿ßë░ßëåßîúßîúßê¬ / ßëüßìïßê«','ßëÑßê¡',2.00,50.00,100.00,''),(9,1,3,'Photocopy Charge','ßìÄßëÂ ßè«ßìÆ','ßëÑßê¡',1.00,6.00,6.00,''),(10,1,4,'Document & Form Processing','ßê░ßèÉßïÁ / ßï░ßê¿ßê░ßèØ','ßëÑßê¡',1.00,4.00,4.00,''),(11,1,5,'Meter Security Sticker','ßêÁßë┤ßè¿ßê¡','ßëÑßê¡',1.00,5.00,5.00,''),(12,1,6,'Legal Revenue Stamp','ßë│ßêØßëÑ','ßëÑßê¡',1.00,70.00,70.00,''),(19,2,1,'Site Survey Fee','ßï¿ßï│ßê░ßê│ ßîÑßèôßëÁ ßè¡ßììßï½','ßëÑßê¡',1.00,40.00,40.00,''),(20,2,2,'Excavation / Inspection','ßè¿ßë░ßëåßîúßîúßê¬ / ßëüßìïßê«','ßëÑßê¡',1.00,50.00,50.00,''),(21,2,3,'Photocopy Charge','ßìÄßëÂ ßè«ßìÆ','ßëÑßê¡',1.00,6.00,6.00,''),(22,2,4,'Document & Form Processing','ßê░ßèÉßïÁ / ßï░ßê¿ßê░ßèØ','ßëÑßê¡',10.00,4.00,40.00,''),(23,2,5,'Meter Security Sticker','ßêÁßë┤ßè¿ßê¡','ßëÑßê¡',1.00,5.00,5.00,''),(24,2,6,'Legal Revenue Stamp','ßë│ßêØßëÑ','ßëÑßê¡',1.00,70.00,70.00,'');
/*!40000 ALTER TABLE `custom_maintenance_additional_fee` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `custom_maintenance_item`
--

DROP TABLE IF EXISTS `custom_maintenance_item`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `custom_maintenance_item` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `request_id` bigint(20) NOT NULL,
  `maintenance_common_material_id` bigint(20) DEFAULT NULL,
  `inv_item_id` bigint(20) DEFAULT NULL,
  `item_name` varchar(200) NOT NULL,
  `item_name_am` varchar(200) NOT NULL,
  `unit_of_measure` varchar(50) NOT NULL DEFAULT 'ßëáßëüßîÑßê¡',
  `surveyed_quantity` decimal(10,2) NOT NULL DEFAULT 0.00,
  `utility_quantity` decimal(10,2) NOT NULL DEFAULT 0.00,
  `utility_unit_price` decimal(15,2) NOT NULL DEFAULT 0.00,
  `utility_total_price` decimal(15,2) NOT NULL DEFAULT 0.00,
  `outside_quantity` decimal(10,2) NOT NULL DEFAULT 0.00,
  `outside_unit_price` decimal(15,2) NOT NULL DEFAULT 0.00,
  `outside_total_price` decimal(15,2) NOT NULL DEFAULT 0.00,
  `remarks` varchar(500) DEFAULT NULL,
  `is_water_meter` tinyint(1) NOT NULL DEFAULT 0,
  PRIMARY KEY (`id`),
  KEY `idx_cmi_req` (`request_id`),
  CONSTRAINT `fk_cmi_req` FOREIGN KEY (`request_id`) REFERENCES `custom_maintenance_request` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=17 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `custom_maintenance_item`
--

LOCK TABLES `custom_maintenance_item` WRITE;
/*!40000 ALTER TABLE `custom_maintenance_item` DISABLE KEYS */;
INSERT INTO `custom_maintenance_item` (`id`, `request_id`, `maintenance_common_material_id`, `inv_item_id`, `item_name`, `item_name_am`, `unit_of_measure`, `surveyed_quantity`, `utility_quantity`, `utility_unit_price`, `utility_total_price`, `outside_quantity`, `outside_unit_price`, `outside_total_price`, `remarks`, `is_water_meter`) VALUES (5,1,1,8,'Stop Valve 1/2\"','ßêÁßëÂßìò ßë½ßêìßë¡/ßè«ßè¡ 1/2\"','Pieces',0.00,0.00,52.00,0.00,0.00,52.00,0.00,'',0),(6,1,2,3,'HDP pipe','HDP ßë▒ßëª ','Meter',10.00,0.00,200.00,0.00,10.00,200.00,2000.00,'',0),(7,1,3,2,'water Meter','ßê£ßëÁßê¡','Pieces',1.00,1.00,800.00,800.00,0.00,800.00,0.00,'',1),(8,1,4,10,'Teflon Tape','ßë┤ßììßêÄßèò ßë┤ßìò','Pieces',7.00,7.00,100.00,700.00,0.00,100.00,0.00,'',0),(13,2,5,2,'water Meter','ßê£ßëÁßê¡','Pieces',1.00,1.00,800.00,800.00,0.00,800.00,0.00,'',1),(14,2,6,3,'HDP pipe','HDP ßë▒ßëª ','Meter',10.00,0.00,200.00,0.00,10.00,800.00,8000.00,'',0),(15,2,7,10,'Teflon Tape','ßë┤ßììßêÄßèò ßë┤ßìò','Pieces',15.00,15.00,100.00,1500.00,0.00,100.00,0.00,'',0),(16,2,8,13,'Elbow 1/2\"','ßè¡ßê¡ßèò 1/2\"','Pieces',10.00,0.00,32.00,0.00,10.00,50.00,500.00,'',0);
/*!40000 ALTER TABLE `custom_maintenance_item` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `custom_new_line_connection_request`
--

DROP TABLE IF EXISTS `custom_new_line_connection_request`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `custom_new_line_connection_request` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `application_number` varchar(50) NOT NULL,
  `customer_id` int(11) DEFAULT NULL,
  `applicant_name` varchar(200) DEFAULT NULL,
  `customer_full_name` varchar(200) NOT NULL,
  `customer_full_name_eng` varchar(200) DEFAULT NULL,
  `phone_number` varchar(50) NOT NULL,
  `national_id_number` varchar(50) DEFAULT NULL,
  `house_number` varchar(50) DEFAULT NULL,
  `kebele_id` int(11) DEFAULT NULL,
  `ketena_id` int(11) DEFAULT NULL,
  `customer_type_id` int(11) DEFAULT NULL,
  `branch_id` int(11) DEFAULT NULL,
  `address_description` text DEFAULT NULL,
  `status` varchar(50) NOT NULL DEFAULT 'PENDING_SURVEY_ASSIGNMENT',
  `survey_plumber_id` int(11) DEFAULT NULL,
  `survey_assigned_date` datetime DEFAULT NULL,
  `survey_plumber_notes` text DEFAULT NULL,
  `materials_utility_total` decimal(15,2) NOT NULL DEFAULT 0.00,
  `materials_outside_total` decimal(15,2) NOT NULL DEFAULT 0.00,
  `service_charge_percent` decimal(5,2) NOT NULL DEFAULT 55.00,
  `service_charge_amount` decimal(15,2) NOT NULL DEFAULT 0.00,
  `transport_charge_percent` decimal(5,2) NOT NULL DEFAULT 25.00,
  `transport_charge_amount` decimal(15,2) NOT NULL DEFAULT 0.00,
  `additional_fees_total` decimal(15,2) NOT NULL DEFAULT 0.00,
  `total_payable_amount` decimal(15,2) NOT NULL DEFAULT 0.00,
  `is_paid` tinyint(1) NOT NULL DEFAULT 0,
  `payment_reference_number` varchar(100) DEFAULT NULL,
  `payment_receipt_number` varchar(100) DEFAULT NULL,
  `payment_approved_by` varchar(100) DEFAULT NULL,
  `payment_approved_date` datetime DEFAULT NULL,
  `inv_issue_voucher_id` bigint(20) DEFAULT NULL,
  `materials_collected_date` datetime DEFAULT NULL,
  `storekeeper_username` varchar(100) DEFAULT NULL,
  `installation_plumber_id` int(11) DEFAULT NULL,
  `installation_assigned_date` datetime DEFAULT NULL,
  `installation_completed_date` datetime DEFAULT NULL,
  `installation_notes` text DEFAULT NULL,
  `installation_approved_by` varchar(100) DEFAULT NULL,
  `meter_number` varchar(50) DEFAULT NULL,
  `meter_size_id` int(11) DEFAULT NULL,
  `initial_reading` double NOT NULL DEFAULT 0,
  `assigned_reader_id` int(11) DEFAULT NULL,
  `location_coordination` varchar(100) DEFAULT NULL,
  `activated_by` varchar(100) DEFAULT NULL,
  `activated_date` datetime DEFAULT NULL,
  `created_by` varchar(100) DEFAULT NULL,
  `created_at` datetime DEFAULT current_timestamp(),
  `updated_at` datetime DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `rejection_reason` text DEFAULT NULL,
  `rejected_by` varchar(100) DEFAULT NULL,
  `rejected_date` datetime DEFAULT NULL,
  `cancellation_reason` text DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `application_number` (`application_number`),
  KEY `customer_id` (`customer_id`),
  KEY `kebele_id` (`kebele_id`),
  KEY `ketena_id` (`ketena_id`),
  KEY `customer_type_id` (`customer_type_id`),
  KEY `survey_plumber_id` (`survey_plumber_id`),
  KEY `installation_plumber_id` (`installation_plumber_id`),
  KEY `assigned_reader_id` (`assigned_reader_id`),
  KEY `inv_issue_voucher_id` (`inv_issue_voucher_id`),
  KEY `idx_cnl_status` (`status`),
  KEY `idx_cnl_branch` (`branch_id`),
  KEY `idx_cnl_phone` (`phone_number`),
  KEY `idx_cnl_status_branch` (`status`,`branch_id`),
  CONSTRAINT `custom_new_line_connection_request_ibfk_1` FOREIGN KEY (`customer_id`) REFERENCES `billing_customer_info` (`id`) ON DELETE SET NULL,
  CONSTRAINT `custom_new_line_connection_request_ibfk_2` FOREIGN KEY (`kebele_id`) REFERENCES `address_streets` (`id`) ON DELETE SET NULL,
  CONSTRAINT `custom_new_line_connection_request_ibfk_3` FOREIGN KEY (`ketena_id`) REFERENCES `address_ketena` (`id`) ON DELETE SET NULL,
  CONSTRAINT `custom_new_line_connection_request_ibfk_4` FOREIGN KEY (`customer_type_id`) REFERENCES `billing_customer_type` (`id`) ON DELETE SET NULL,
  CONSTRAINT `custom_new_line_connection_request_ibfk_5` FOREIGN KEY (`branch_id`) REFERENCES `branchs` (`id`) ON DELETE SET NULL,
  CONSTRAINT `custom_new_line_connection_request_ibfk_6` FOREIGN KEY (`survey_plumber_id`) REFERENCES `user_account` (`id`) ON DELETE SET NULL,
  CONSTRAINT `custom_new_line_connection_request_ibfk_7` FOREIGN KEY (`installation_plumber_id`) REFERENCES `user_account` (`id`) ON DELETE SET NULL,
  CONSTRAINT `custom_new_line_connection_request_ibfk_8` FOREIGN KEY (`assigned_reader_id`) REFERENCES `user_account` (`id`) ON DELETE SET NULL,
  CONSTRAINT `custom_new_line_connection_request_ibfk_9` FOREIGN KEY (`inv_issue_voucher_id`) REFERENCES `inv_issue_voucher` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `custom_new_line_connection_request`
--

LOCK TABLES `custom_new_line_connection_request` WRITE;
/*!40000 ALTER TABLE `custom_new_line_connection_request` DISABLE KEYS */;
INSERT INTO `custom_new_line_connection_request` (`id`, `application_number`, `customer_id`, `applicant_name`, `customer_full_name`, `customer_full_name_eng`, `phone_number`, `national_id_number`, `house_number`, `kebele_id`, `ketena_id`, `customer_type_id`, `branch_id`, `address_description`, `status`, `survey_plumber_id`, `survey_assigned_date`, `survey_plumber_notes`, `materials_utility_total`, `materials_outside_total`, `service_charge_percent`, `service_charge_amount`, `transport_charge_percent`, `transport_charge_amount`, `additional_fees_total`, `total_payable_amount`, `is_paid`, `payment_reference_number`, `payment_receipt_number`, `payment_approved_by`, `payment_approved_date`, `inv_issue_voucher_id`, `materials_collected_date`, `storekeeper_username`, `installation_plumber_id`, `installation_assigned_date`, `installation_completed_date`, `installation_notes`, `installation_approved_by`, `meter_number`, `meter_size_id`, `initial_reading`, `assigned_reader_id`, `location_coordination`, `activated_by`, `activated_date`, `created_by`, `created_at`, `updated_at`, `rejection_reason`, `rejected_by`, `rejected_date`, `cancellation_reason`) VALUES (2,'NLC-2026-00001',3350,'ßêêßêØßêêßêØ ßêÿßêêßê░ ßëóßêêßïì','ßêêßêØßêêßêØ ßêÿßêêßê░ ßëóßêêßïì','Lemelem Melese Belewu','+251978787878',NULL,NULL,4,27,2138,8,NULL,'FINAL_ACTIVATION_COMPLETED',229,'2026-09-28 09:00:48','',1000.00,5250.00,55.00,3575.00,25.00,250.00,329.00,5154.00,1,'','RP-00089','4gebioff','2026-09-28 10:03:58',2,'2026-09-28 19:58:01','reading2',229,'2026-10-05 19:50:18','2026-10-05 19:53:57','ßï¿ßïìßêâ ßêÿßêÁßêÿßê¡ ßïØßê¡ßîïßë│ßïì ßëáßë┤ßè¡ßèÆßè¡ ßè¡ßììßêì ßë░ßîáßèôßëå ßììßë░ßê╗ ßë░ßï░ßê¡ßîôßêìßìó (Physical piping connection completed and pressure tested.)','reading2','5555',1,0,123,NULL,'custom4','2026-10-07 06:20:49','custom4','2026-09-28 09:00:10','2026-10-07 06:20:50',NULL,NULL,NULL,NULL),(3,'NLC-2026-00002',3349,'ßêÿßêêßê░ ßï░ßëáßëá ßê░ßêÄßê×ßèò','ßêÿßêêßê░ ßï░ßëáßëá ßê░ßêÄßê×ßèò','melese debebe selomon','+251985858585',NULL,NULL,11,29,2138,6,NULL,'FINAL_ACTIVATION_COMPLETED',213,'2026-10-05 19:12:11','',4800.00,7000.00,55.00,7026.25,25.00,975.00,175.00,12976.25,1,'','inv878778','gebe','2026-10-05 19:19:03',4,'2026-10-05 19:39:31','mstore',215,'2026-10-05 19:41:55','2026-10-05 19:42:06','ßï¿ßïìßêâ ßêÿßêÁßêÿßê¡ ßïØßê¡ßîïßë│ßïì ßëáßë┤ßè¡ßèÆßè¡ ßè¡ßììßêì ßë░ßîáßèôßëå ßììßë░ßê╗ ßë░ßï░ßê¡ßîôßêìßìó (Physical piping connection completed and pressure tested.)','techn','mn89857',1,70,123,NULL,'customers','2026-10-05 19:43:20','customers','2026-10-05 19:11:13','2026-10-05 19:43:20',NULL,NULL,NULL,NULL),(4,'NLC-2026-00003',3351,'ßï«ßê┤ßìì ßè¿ßëáßï░ ßèáßêêßêÖ','ßï«ßê┤ßìì ßè¿ßëáßï░ ßèáßêêßêÖ','yosef kebede alemu','+251963636635',NULL,NULL,1,1,2138,8,NULL,'FINAL_ACTIVATION_COMPLETED',229,'2026-10-07 06:23:35','',3400.00,12000.00,55.00,8813.75,25.00,625.00,325.00,13163.75,1,'abay Bank','inv989898','4gebioff','2026-10-07 06:29:34',5,'2026-10-07 06:31:08','4store',229,'2026-10-07 06:32:26','2026-10-07 06:32:56','ßï¿ßïìßêâ ßêÿßêÁßêÿßê¡ ßïØßê¡ßîïßë│ßïì ßëáßë┤ßè¡ßèÆßè¡ ßè¡ßììßêì ßë░ßîáßèôßëå ßììßë░ßê╗ ßë░ßï░ßê¡ßîôßêìßìó (Physical piping connection completed and pressure tested.)','4tech','mn9999',3,99,123,NULL,'custom4','2026-10-07 06:36:02','custom4','2026-10-07 06:22:56','2026-10-07 06:36:02',NULL,NULL,NULL,NULL);
/*!40000 ALTER TABLE `custom_new_line_connection_request` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `hrms_salary_calculated_tekenash`
--

DROP TABLE IF EXISTS `hrms_salary_calculated_tekenash`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `hrms_salary_calculated_tekenash` (
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
  KEY `fk_hrms_scal_tek_cfg` (`hrm_salary_configurations_id`),
  CONSTRAINT `fk_hrms_scal_tek_cfg` FOREIGN KEY (`hrm_salary_configurations_id`) REFERENCES `hrms_salary_configurations` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_hrms_scal_tek_scal` FOREIGN KEY (`hrm_salary_calculated_id`) REFERENCES `hrms_salary_calculated` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `hrms_salary_calculated_tekenash`
--

LOCK TABLES `hrms_salary_calculated_tekenash` WRITE;
/*!40000 ALTER TABLE `hrms_salary_calculated_tekenash` DISABLE KEYS */;
/*!40000 ALTER TABLE `hrms_salary_calculated_tekenash` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `hrms_attendance_raw_logs`
--

DROP TABLE IF EXISTS `hrms_attendance_raw_logs`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `hrms_attendance_raw_logs` (
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
  KEY `fk_hrms_raw_device` (`device_id`),
  CONSTRAINT `fk_hrms_raw_device` FOREIGN KEY (`device_id`) REFERENCES `hrms_biometric_device` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `hrms_attendance_raw_logs`
--

LOCK TABLES `hrms_attendance_raw_logs` WRITE;
/*!40000 ALTER TABLE `hrms_attendance_raw_logs` DISABLE KEYS */;
/*!40000 ALTER TABLE `hrms_attendance_raw_logs` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `custom_new_line_activity_log`
--

DROP TABLE IF EXISTS `custom_new_line_activity_log`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `custom_new_line_activity_log` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `request_id` bigint(20) NOT NULL,
  `action` varchar(50) NOT NULL,
  `from_status` varchar(50) DEFAULT NULL,
  `to_status` varchar(50) NOT NULL,
  `actor_username` varchar(100) NOT NULL,
  `actor_role` varchar(100) DEFAULT NULL,
  `comments` text DEFAULT NULL,
  `created_at` datetime DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `request_id` (`request_id`),
  CONSTRAINT `custom_new_line_activity_log_ibfk_1` FOREIGN KEY (`request_id`) REFERENCES `custom_new_line_connection_request` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=33 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `custom_new_line_activity_log`
--

LOCK TABLES `custom_new_line_activity_log` WRITE;
/*!40000 ALTER TABLE `custom_new_line_activity_log` DISABLE KEYS */;
INSERT INTO `custom_new_line_activity_log` (`id`, `request_id`, `action`, `from_status`, `to_status`, `actor_username`, `actor_role`, `comments`, `created_at`) VALUES (9,2,'APPLICATION_CREATED',NULL,'PENDING_SURVEY_ASSIGNMENT','custom4','CUSTOMER_SERVICE','New line connection application registered. Applicant: ßêêßêØßêêßêØ ßêÿßêêßê░ ßëóßêêßïì','2026-09-28 09:00:10'),(10,2,'SURVEY_PLUMBER_ASSIGNED','PENDING_SURVEY_ASSIGNMENT','SURVEY_IN_PROGRESS','4tech','TECHNICAL','Plumber 4plumber ppp assigned for on-site survey. ','2026-09-28 09:00:48'),(11,2,'SURVEY_SUBMITTED','SURVEY_IN_PROGRESS','PENDING_PAYMENT_APPROVAL','4tech','TECHNICAL','Materials & fees encoded. Utility: ETB 1000.00 (Meter: ETB 0.00), Outside: ETB 1390.00, 55% Service: ETB 1452.00, 25% Transport (excl. meter): ETB 250.00, Fees: ETB 329.00, Total Payable: ETB 3031.00','2026-09-28 09:02:46'),(12,2,'PAYMENT_APPROVED','PENDING_PAYMENT_APPROVAL','PENDING_STORE_COLLECTION','4gebioff','REVENUE','Payment approved by Revenue Officer. Receipt: RP-00089, Ref:  (prices/items reviewed & updated)','2026-09-28 10:03:58'),(13,2,'MATERIALS_DISPATCHED','PENDING_STORE_COLLECTION','MATERIALS_COLLECTED','reading2','INVENTORY','Utility materials issued from store \'4branch Store\' and dispatched to customer by storekeeper: reading2 (Voucher: ISV-NLC-NLC-2026-00001, Journal: JE-INV-2026-1790625481248)','2026-09-28 19:58:01'),(14,3,'APPLICATION_CREATED',NULL,'PENDING_SURVEY_ASSIGNMENT','customers','CUSTOMER_SERVICE','New line connection application registered. Applicant: ßêÿßêêßê░ ßï░ßëáßëá ßê░ßêÄßê×ßèò','2026-10-05 19:11:13'),(15,3,'SURVEY_PLUMBER_ASSIGNED','PENDING_SURVEY_ASSIGNMENT','SURVEY_IN_PROGRESS','techn','TECHNICAL','Plumber ßè½ßê│ßêüßèò ßï░ßêÁßë│ assigned for on-site survey. ','2026-10-05 19:12:11'),(16,3,'SURVEY_SUBMITTED','SURVEY_IN_PROGRESS','PENDING_PAYMENT_APPROVAL','techn','TECHNICAL','Materials & fees encoded. Utility: ETB 4800.00 (Meter: ETB 900.00), Outside: ETB 3500.00, 55% Service: ETB 5101.25, 25% Transport (excl. meter): ETB 975.00, Fees: ETB 175.00, Total Payable: ETB 11051.25','2026-10-05 19:14:26'),(17,3,'PAYMENT_APPROVED','PENDING_PAYMENT_APPROVAL','PENDING_STORE_COLLECTION','gebe','REVENUE','Payment approved by Revenue Officer. Receipt: inv878778, Ref:  (prices/items reviewed & updated)','2026-10-05 19:19:03'),(18,3,'MATERIALS_DISPATCHED','PENDING_STORE_COLLECTION','MATERIALS_COLLECTED','mstore','INVENTORY','Utility materials issued from store \'SheSha Ber\' and dispatched to customer by storekeeper: mstore (Voucher: ISV-NLC-NLC-2026-00002, Journal: JE-INV-0004)','2026-10-05 19:39:31'),(19,3,'INSTALLATION_PLUMBER_ASSIGNED','MATERIALS_COLLECTED','INSTALLATION_IN_PROGRESS','techn','TECHNICAL','Plumber ßèáßêêßêÖ ßë░ßìêßê½ assigned for physical water line installation. ','2026-10-05 19:41:55'),(20,3,'INSTALLATION_COMPLETED','INSTALLATION_IN_PROGRESS','INSTALLATION_COMPLETED','techn','TECHNICAL','Physical line connection completed and approved by Technical Officer. Ready for customer activation.','2026-10-05 19:42:06'),(21,3,'CUSTOMER_ACTIVATED','INSTALLATION_COMPLETED','FINAL_ACTIVATION_COMPLETED','customers','CUSTOMER_SERVICE','Customer fully activated into billing system. Account: 1103345, Meter: mn89857, Initial Reading: 70.0, Coordinates: null','2026-10-05 19:43:20'),(22,2,'INSTALLATION_PLUMBER_ASSIGNED','MATERIALS_COLLECTED','INSTALLATION_IN_PROGRESS','reading2','TECHNICAL','Plumber 4plumber ppp assigned for physical water line installation. ','2026-10-05 19:50:18'),(23,2,'INSTALLATION_COMPLETED','INSTALLATION_IN_PROGRESS','INSTALLATION_COMPLETED','reading2','TECHNICAL','Physical line connection completed and approved by Technical Officer. Ready for customer activation.','2026-10-05 19:53:57'),(24,2,'CUSTOMER_ACTIVATED','INSTALLATION_COMPLETED','FINAL_ACTIVATION_COMPLETED','custom4','CUSTOMER_SERVICE','Customer fully activated into billing system. Account: 403345, Meter: 5555, Initial Reading: 0.0, Coordinates: N/A','2026-10-07 06:20:50'),(25,4,'APPLICATION_CREATED',NULL,'PENDING_SURVEY_ASSIGNMENT','custom4','CUSTOMER_SERVICE','New line connection application registered. Applicant: ßï«ßê┤ßìì ßè¿ßëáßï░ ßèáßêêßêÖ','2026-10-07 06:22:56'),(26,4,'SURVEY_PLUMBER_ASSIGNED','PENDING_SURVEY_ASSIGNMENT','SURVEY_IN_PROGRESS','4tech','TECHNICAL','Plumber 4plumber ppp assigned for on-site survey. ','2026-10-07 06:23:35'),(27,4,'SURVEY_SUBMITTED','SURVEY_IN_PROGRESS','PENDING_PAYMENT_APPROVAL','4tech','TECHNICAL','Materials & fees encoded. Utility: ETB 3400.00 (Meter: ETB 900.00), Outside: ETB 2400.00, 55% Service: ETB 3533.75, 25% Transport (excl. meter): ETB 625.00, Fees: ETB 325.00, Total Payable: ETB 7883.75','2026-10-07 06:24:36'),(28,4,'PAYMENT_APPROVED','PENDING_PAYMENT_APPROVAL','PENDING_STORE_COLLECTION','4gebioff','REVENUE','Payment approved by Revenue Officer. Receipt: inv989898, Ref: abay Bank (prices/items reviewed & updated)','2026-10-07 06:29:34'),(29,4,'MATERIALS_DISPATCHED','PENDING_STORE_COLLECTION','MATERIALS_COLLECTED','4store','INVENTORY','Utility materials issued from store \'4branch Store\' and dispatched to customer by storekeeper: 4store (Voucher: ISV-NLC-NLC-2026-00003, Journal: JE-INV-0005)','2026-10-07 06:31:08'),(30,4,'INSTALLATION_PLUMBER_ASSIGNED','MATERIALS_COLLECTED','INSTALLATION_IN_PROGRESS','4tech','TECHNICAL','Plumber 4plumber ppp assigned for physical water line installation. ','2026-10-07 06:32:26'),(31,4,'INSTALLATION_COMPLETED','INSTALLATION_IN_PROGRESS','INSTALLATION_COMPLETED','4tech','TECHNICAL','Physical line installation completed and verified by Technical Department. Meter: mn9999, Initial Reading: 99.0, Meter Size ID: 3. ßï¿ßïìßêâ ßêÿßêÁßêÿßê¡ ßïØßê¡ßîïßë│ßïì ßëáßë┤ßè¡ßèÆßè¡ ßè¡ßììßêì ßë░ßîáßèôßëå ßììßë░ßê╗ ßë░ßï░ßê¡ßîôßêìßìó (Physical piping connection completed and pressure tested.)','2026-10-07 06:32:56'),(32,4,'CUSTOMER_ACTIVATED','INSTALLATION_COMPLETED','FINAL_ACTIVATION_COMPLETED','custom4','CUSTOMER_SERVICE','Customer fully activated into billing system. Account: 103344, Meter: mn9999, Initial Reading: 99.0, Coordinates: N/A','2026-10-07 06:36:02');
/*!40000 ALTER TABLE `custom_new_line_activity_log` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `custom_new_line_additional_fee`
--

DROP TABLE IF EXISTS `custom_new_line_additional_fee`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `custom_new_line_additional_fee` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `request_id` bigint(20) NOT NULL,
  `fee_type_id` int(11) DEFAULT NULL,
  `fee_name` varchar(200) NOT NULL,
  `fee_name_am` varchar(200) DEFAULT NULL,
  `unit_name` varchar(50) DEFAULT 'ßëÑßê¡',
  `quantity` decimal(10,2) NOT NULL DEFAULT 1.00,
  `unit_price` decimal(15,2) NOT NULL DEFAULT 0.00,
  `total_price` decimal(15,2) NOT NULL DEFAULT 0.00,
  `remarks` varchar(500) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `request_id` (`request_id`),
  KEY `fee_type_id` (`fee_type_id`),
  CONSTRAINT `custom_new_line_additional_fee_ibfk_1` FOREIGN KEY (`request_id`) REFERENCES `custom_new_line_connection_request` (`id`) ON DELETE CASCADE,
  CONSTRAINT `custom_new_line_additional_fee_ibfk_2` FOREIGN KEY (`fee_type_id`) REFERENCES `custom_additional_fee_type` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=49 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `custom_new_line_additional_fee`
--

LOCK TABLES `custom_new_line_additional_fee` WRITE;
/*!40000 ALTER TABLE `custom_new_line_additional_fee` DISABLE KEYS */;
INSERT INTO `custom_new_line_additional_fee` (`id`, `request_id`, `fee_type_id`, `fee_name`, `fee_name_am`, `unit_name`, `quantity`, `unit_price`, `total_price`, `remarks`) VALUES (19,2,1,'ßï¿ßï│ßê░ßê│ ßîÑßèôßëÁ ßè¡ßììßï½','ßï¿ßï│ßê░ßê│ ßîÑßèôßëÁ ßè¡ßììßï½','ßëÑßê¡',1.00,40.00,40.00,''),(20,2,2,'ßè¿ßë░ßëåßîúßîúßê¬ / ßëüßìïßê«','ßè¿ßë░ßëåßîúßîúßê¬ / ßëüßìïßê«','ßëÑßê¡',4.00,50.00,200.00,''),(21,2,3,'ßìÄßëÂ ßè«ßìÆ','ßìÄßëÂ ßè«ßìÆ','ßëÑßê¡',1.00,6.00,6.00,''),(22,2,4,'ßê░ßèÉßïÁ / ßï░ßê¿ßê░ßèØ','ßê░ßèÉßïÁ / ßï░ßê¿ßê░ßèØ','ßëÑßê¡',2.00,4.00,8.00,''),(23,2,5,'ßêÁßë┤ßè¿ßê¡','ßêÁßë┤ßè¿ßê¡','ßëÑßê¡',1.00,5.00,5.00,''),(24,2,6,'ßë│ßêØßëÑ','ßë│ßêØßëÑ','ßëÑßê¡',1.00,70.00,70.00,''),(31,3,1,'ßï¿ßï│ßê░ßê│ ßîÑßèôßëÁ ßè¡ßììßï½','ßï¿ßï│ßê░ßê│ ßîÑßèôßëÁ ßè¡ßììßï½','ßëÑßê¡',1.00,40.00,40.00,''),(32,3,2,'ßè¿ßë░ßëåßîúßîúßê¬ / ßëüßìïßê«','ßè¿ßë░ßëåßîúßîúßê¬ / ßëüßìïßê«','ßëÑßê¡',1.00,50.00,50.00,''),(33,3,3,'ßìÄßëÂ ßè«ßìÆ','ßìÄßëÂ ßè«ßìÆ','ßëÑßê¡',1.00,6.00,6.00,''),(34,3,4,'ßê░ßèÉßïÁ / ßï░ßê¿ßê░ßèØ','ßê░ßèÉßïÁ / ßï░ßê¿ßê░ßèØ','ßëÑßê¡',1.00,4.00,4.00,''),(35,3,5,'ßêÁßë┤ßè¿ßê¡','ßêÁßë┤ßè¿ßê¡','ßëÑßê¡',1.00,5.00,5.00,''),(36,3,6,'ßë│ßêØßëÑ','ßë│ßêØßëÑ','ßëÑßê¡',1.00,70.00,70.00,''),(43,4,1,'ßï¿ßï│ßê░ßê│ ßîÑßèôßëÁ ßè¡ßììßï½','ßï¿ßï│ßê░ßê│ ßîÑßèôßëÁ ßè¡ßììßï½','ßëÑßê¡',1.00,40.00,40.00,''),(44,4,2,'ßè¿ßë░ßëåßîúßîúßê¬ / ßëüßìïßê«','ßè¿ßë░ßëåßîúßîúßê¬ / ßëüßìïßê«','ßëÑßê¡',4.00,50.00,200.00,''),(45,4,3,'ßìÄßëÂ ßè«ßìÆ','ßìÄßëÂ ßè«ßìÆ','ßëÑßê¡',1.00,6.00,6.00,''),(46,4,4,'ßê░ßèÉßïÁ / ßï░ßê¿ßê░ßèØ','ßê░ßèÉßïÁ / ßï░ßê¿ßê░ßèØ','ßëÑßê¡',1.00,4.00,4.00,''),(47,4,5,'ßêÁßë┤ßè¿ßê¡','ßêÁßë┤ßè¿ßê¡','ßëÑßê¡',1.00,5.00,5.00,''),(48,4,6,'ßë│ßêØßëÑ','ßë│ßêØßëÑ','ßëÑßê¡',1.00,70.00,70.00,'');
/*!40000 ALTER TABLE `custom_new_line_additional_fee` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `custom_new_line_item`
--

DROP TABLE IF EXISTS `custom_new_line_item`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `custom_new_line_item` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `request_id` bigint(20) NOT NULL,
  `common_material_id` bigint(20) DEFAULT NULL,
  `inv_item_id` bigint(20) DEFAULT NULL,
  `item_name` varchar(200) NOT NULL,
  `item_name_am` varchar(200) DEFAULT NULL,
  `unit_of_measure` varchar(50) DEFAULT 'ßëáßëüßîÑßê¡',
  `surveyed_quantity` decimal(12,2) NOT NULL DEFAULT 0.00,
  `utility_quantity` decimal(12,2) NOT NULL DEFAULT 0.00,
  `utility_unit_price` decimal(15,2) NOT NULL DEFAULT 0.00,
  `utility_total_price` decimal(15,2) NOT NULL DEFAULT 0.00,
  `outside_quantity` decimal(12,2) NOT NULL DEFAULT 0.00,
  `outside_unit_price` decimal(15,2) NOT NULL DEFAULT 0.00,
  `outside_total_price` decimal(15,2) NOT NULL DEFAULT 0.00,
  `remarks` varchar(500) DEFAULT NULL,
  `is_water_meter` tinyint(1) NOT NULL DEFAULT 0,
  PRIMARY KEY (`id`),
  KEY `request_id` (`request_id`),
  KEY `common_material_id` (`common_material_id`),
  KEY `inv_item_id` (`inv_item_id`),
  CONSTRAINT `custom_new_line_item_ibfk_1` FOREIGN KEY (`request_id`) REFERENCES `custom_new_line_connection_request` (`id`) ON DELETE CASCADE,
  CONSTRAINT `custom_new_line_item_ibfk_2` FOREIGN KEY (`common_material_id`) REFERENCES `custom_common_material` (`id`) ON DELETE SET NULL,
  CONSTRAINT `custom_new_line_item_ibfk_3` FOREIGN KEY (`inv_item_id`) REFERENCES `inv_item` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=25 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `custom_new_line_item`
--

LOCK TABLES `custom_new_line_item` WRITE;
/*!40000 ALTER TABLE `custom_new_line_item` DISABLE KEYS */;
INSERT INTO `custom_new_line_item` (`id`, `request_id`, `common_material_id`, `inv_item_id`, `item_name`, `item_name_am`, `unit_of_measure`, `surveyed_quantity`, `utility_quantity`, `utility_unit_price`, `utility_total_price`, `outside_quantity`, `outside_unit_price`, `outside_total_price`, `remarks`, `is_water_meter`) VALUES (10,2,1,5,'ßïêßèòßïÁ ßèáßï│ßìòßë░ßê¡ 1/2\"','ßïêßèòßïÁ ßèáßï│ßìòßë░ßê¡ 1/2\"','Pieces',10.00,0.00,120.00,0.00,10.00,500.00,5000.00,'',0),(11,2,4,10,'ßë┤ßììßêÄßèò ßë┤ßìò','ßë┤ßììßêÄßèò ßë┤ßìò','Pieces',10.00,10.00,100.00,1000.00,0.00,100.00,0.00,'',0),(12,2,5,4,'ßï¿ßëÑßê¿ßëÁ 1/2\"','ßï¿ßëÑßê¿ßëÁ 1/2\"','Meter',5.00,0.00,38.00,0.00,5.00,50.00,250.00,'',0),(16,3,1,5,'ßïêßèòßïÁ ßèáßï│ßìòßë░ßê¡ 1/2\"','ßïêßèòßïÁ ßèáßï│ßìòßë░ßê¡ 1/2\"','Pieces',20.00,20.00,120.00,2400.00,0.00,120.00,0.00,'',0),(17,3,2,3,'HDP ßë▒ßëª ','HDP ßë▒ßëª ','Meter',10.00,3.00,500.00,1500.00,7.00,1000.00,7000.00,'',0),(18,3,3,2,'ßê£ßëÁßê¡','ßê£ßëÁßê¡','Pieces',1.00,1.00,900.00,900.00,0.00,900.00,0.00,'',1),(22,4,1,5,'ßïêßèòßïÁ ßèáßï│ßìòßë░ßê¡ 1/2\"','ßïêßèòßïÁ ßèáßï│ßìòßë░ßê¡ 1/2\"','Pieces',20.00,0.00,120.00,0.00,20.00,600.00,12000.00,'',0),(23,4,2,3,'HDP ßë▒ßëª ','HDP ßë▒ßëª ','Meter',5.00,5.00,500.00,2500.00,0.00,500.00,0.00,'',0),(24,4,3,2,'ßê£ßëÁßê¡','ßê£ßëÁßê¡','Pieces',1.00,1.00,900.00,900.00,0.00,900.00,0.00,'',1);
/*!40000 ALTER TABLE `custom_new_line_item` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-10-07 16:04:31
