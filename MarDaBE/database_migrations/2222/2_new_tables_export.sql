-- ============================================================================
-- Export of 74 New Tables from wbill_jwns9
-- Generated: Thu 09/17/2026 12:24:17.20
-- Tables exported in dependency order (topological sort)
-- ============================================================================

-- Disable foreign key checks for safe import
SET FOREIGN_KEY_CHECKS = 0;
SET NAMES utf8mb4;
SET CHARACTER SET utf8mb4;
SET collation_connection = 'utf8mb4_unicode_ci';

-- === TIER 0: Independent tables (no new-table dependencies) ===

-- Table: custom_additional_fee_type
/*M!999999\- enable the sandbox mode */ 
-- MariaDB dump 10.19-11.5.2-MariaDB, for Win64 (AMD64)
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
/*M!100616 SET @OLD_NOTE_VERBOSITY=@@NOTE_VERBOSITY, NOTE_VERBOSITY=0 */;

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
  `unit_name` varchar(50) NOT NULL DEFAULT 'ብር',
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
INSERT INTO `custom_additional_fee_type` (`id`, `fee_code`, `fee_name`, `fee_name_am`, `default_amount`, `unit_name`, `is_active`, `created_at`) VALUES (1,'FEE_SURVEY','Site Survey Fee','የዳሰሳ ጥናት ክፍያ',40.00,'ብር',1,'2026-09-09 16:08:39'),
(2,'FEE_EXCAVATION','Excavation / Inspection','ከተቆጣጣሪ / ቁፋሮ',50.00,'ብር',1,'2026-09-09 16:08:39'),
(3,'FEE_PHOTOCOPY','Photocopy Charge','ፎቶ ኮፒ',6.00,'ብር',1,'2026-09-09 16:08:39'),
(4,'FEE_DOCUMENT','Document & Form Processing','ሰነድ / ደረሰኝ',4.00,'ብር',1,'2026-09-09 16:08:39'),
(5,'FEE_STICKER','Meter Security Sticker','ስቴከር',5.00,'ብር',1,'2026-09-09 16:08:39'),
(6,'FEE_STAMP','Legal Revenue Stamp','ታምብ',70.00,'ብር',1,'2026-09-09 16:08:39');
/*!40000 ALTER TABLE `custom_additional_fee_type` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*M!100616 SET NOTE_VERBOSITY=@OLD_NOTE_VERBOSITY */;

-- Dump completed on 2026-09-17 12:24:17

-- Table: custom_maintenance_type
/*M!999999\- enable the sandbox mode */ 
-- MariaDB dump 10.19-11.5.2-MariaDB, for Win64 (AMD64)
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
/*M!100616 SET @OLD_NOTE_VERBOSITY=@@NOTE_VERBOSITY, NOTE_VERBOSITY=0 */;

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
INSERT INTO `custom_maintenance_type` (`id`, `type_code`, `type_name`, `type_name_am`, `description`, `display_order`, `is_active`, `created_at`, `updated_at`) VALUES (1,'PIPE_LEAKAGE','Pipe Leakage Repair','የቧንቧ ፍሳሽ ጥገና','Repair of leaking HDPE / GI pipes and fittings',1,1,'2026-09-11 23:28:47','2026-09-11 23:28:47'),
(2,'METER_REPLACE','Water Meter Replacement / Repair','የውሃ ቆጣሪ ቅያሬ / ጥገና','Replacement of broken, stuck, or aged water meter',2,1,'2026-09-11 23:28:47','2026-09-11 23:28:47'),
(3,'GATE_VALVE','Gate Valve & Fitting Repair','የጌት ቫልቭ እና ማገናኛ ጥገና','Servicing and replacing worn-out gate valves and nipples',3,1,'2026-09-11 23:28:47','2026-09-11 23:28:47'),
(4,'LINE_BURST','Main Line Breakdown Repair','የዋና መስመር መቆራረጥ ጥገና','Urgent line burst repair, reconnection and welding',4,1,'2026-09-11 23:28:47','2026-09-11 23:28:47'),
(5,'OTHER_MAINTENANCE','General / Other Maintenance','አጠቃላይ / ሌሎች ጥገናዎች','Other miscellaneous customer site water maintenance',5,1,'2026-09-11 23:28:47','2026-09-11 23:28:47');
/*!40000 ALTER TABLE `custom_maintenance_type` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*M!100616 SET NOTE_VERBOSITY=@OLD_NOTE_VERBOSITY */;

-- Dump completed on 2026-09-17 12:24:19

-- Table: fnc_fiscal_year
/*M!999999\- enable the sandbox mode */ 
-- MariaDB dump 10.19-11.5.2-MariaDB, for Win64 (AMD64)
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
/*M!100616 SET @OLD_NOTE_VERBOSITY=@@NOTE_VERBOSITY, NOTE_VERBOSITY=0 */;

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
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `fnc_fiscal_year`
--

LOCK TABLES `fnc_fiscal_year` WRITE;
/*!40000 ALTER TABLE `fnc_fiscal_year` DISABLE KEYS */;
INSERT INTO `fnc_fiscal_year` (`id`, `fiscal_year_name`, `start_date`, `end_date`, `is_closed`, `created_by`, `created_at`, `updated_at`) VALUES (1,'2019','2026-07-09','2027-06-09',0,'reading2','2026-08-26 15:40:40','2026-08-26 15:40:40');
/*!40000 ALTER TABLE `fnc_fiscal_year` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*M!100616 SET NOTE_VERBOSITY=@OLD_NOTE_VERBOSITY */;

-- Dump completed on 2026-09-17 12:24:19

-- Table: hrms_biometric_device
/*M!999999\- enable the sandbox mode */ 
-- MariaDB dump 10.19-11.5.2-MariaDB, for Win64 (AMD64)
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
/*M!100616 SET @OLD_NOTE_VERBOSITY=@@NOTE_VERBOSITY, NOTE_VERBOSITY=0 */;

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
INSERT INTO `hrms_biometric_device` (`id`, `device_name`, `device_ip`, `port`, `serial_number`, `device_model`, `location_name`, `protocol`, `last_sync_time`, `is_active`, `created_at`, `updated_at`) VALUES (1,'WTP Central Plant Terminal','192.168.1.201',4370,'ZK-WTP-001','ZKTeco SilkBio-101TC','Main Water Treatment Plant Entrance','ZK_TCP',NULL,1,'2026-09-13 11:50:11','2026-09-13 11:50:11'),
(2,'Reservoir Booster Station Terminal','192.168.1.202',4370,'ZK-BST-002','ZKTeco iClock-680','Reservoir Pump & Booster Station','ZK_TCP',NULL,1,'2026-09-13 11:50:11','2026-09-13 11:50:11'),
(3,'Head Office Attendance Terminal','192.168.1.203',4370,'ZK-HQ-003','ZKTeco uFace-800','Head Office HR & Admin Building','ZK_TCP',NULL,1,'2026-09-13 11:50:11','2026-09-13 11:50:11'),
(4,'Central Workshop & Stores Terminal','192.168.1.204',4370,'ZK-ST-004','Hikvision DS-K1T671','Central Mechanical Workshop & Warehouse','ZK_TCP',NULL,1,'2026-09-13 11:50:11','2026-09-13 11:50:11');
/*!40000 ALTER TABLE `hrms_biometric_device` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*M!100616 SET NOTE_VERBOSITY=@OLD_NOTE_VERBOSITY */;

-- Dump completed on 2026-09-17 12:24:19

-- Table: hrms_departments
/*M!999999\- enable the sandbox mode */ 
-- MariaDB dump 10.19-11.5.2-MariaDB, for Win64 (AMD64)
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
/*M!100616 SET @OLD_NOTE_VERBOSITY=@@NOTE_VERBOSITY, NOTE_VERBOSITY=0 */;

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
) ENGINE=InnoDB AUTO_INCREMENT=13 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `hrms_departments`
--

LOCK TABLES `hrms_departments` WRITE;
/*!40000 ALTER TABLE `hrms_departments` DISABLE KEYS */;
INSERT INTO `hrms_departments` (`id`, `department_code`, `department_name`, `department_name_am`, `parent_department_id`, `manager_employee_id`, `cost_center_code`, `is_active`, `created_at`, `updated_at`) VALUES (1,'WTP-PROD','Water Production & Treatment Department','የውሃ ማጣሪያና ማምረቻ መምሪያ',NULL,NULL,'CC-101',1,'2026-09-13 11:50:11','2026-09-13 11:50:11'),
(2,'DIST-NET','Water Distribution & Sewerage Network Department','የውሃ ሥርጭትና መስመር መምሪያ',NULL,NULL,'CC-102',1,'2026-09-13 11:50:11','2026-09-13 11:50:11'),
(3,'ELEC-MECH','Electromechanical & Maintenance Department','ኤሌክትሮ መካኒካልና ጥገና መምሪያ',NULL,NULL,'CC-103',1,'2026-09-13 11:50:11','2026-09-13 11:50:11'),
(4,'COMM-BILL','Commercial Billing & Customer Care Department','የደንበኞች አገልግሎትና ቢሊንግ መምሪያ',NULL,NULL,'CC-104',1,'2026-09-13 11:50:11','2026-09-13 11:50:11'),
(5,'ADM-FIN','Administration & Human Resources Department','አስተዳደርና የሰው ኃይል መምሪያ',NULL,NULL,'CC-105',1,'2026-09-13 11:50:11','2026-09-13 11:50:11'),
(6,'FIN-ACCTS','Finance & Accounts Department','ፋይናንስና ሂሳብ መምሪያ',NULL,NULL,'CC-106',1,'2026-09-13 11:50:11','2026-09-13 11:50:11');
/*!40000 ALTER TABLE `hrms_departments` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*M!100616 SET NOTE_VERBOSITY=@OLD_NOTE_VERBOSITY */;

-- Dump completed on 2026-09-17 12:24:20

-- Table: hrms_gibir_setting
/*M!999999\- enable the sandbox mode */ 
-- MariaDB dump 10.19-11.5.2-MariaDB, for Win64 (AMD64)
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
/*M!100616 SET @OLD_NOTE_VERBOSITY=@@NOTE_VERBOSITY, NOTE_VERBOSITY=0 */;

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
INSERT INTO `hrms_gibir_setting` (`id`, `weight`, `upper_limit_birr`, `percent_birr`, `and_above`, `total_deductible_till_this`, `setting_description`, `is_deleted`) VALUES (1,1,600,0,0,0,'0 - 600 ETB (0% Exempt)',0),
(2,2,1650,10,0,60,'601 - 1,650 ETB (10%)',0),
(3,3,3200,15,0,142.5,'1,651 - 3,200 ETB (15%)',0),
(4,4,5250,20,0,302.5,'3,201 - 5,250 ETB (20%)',0),
(5,5,7800,25,0,565,'5,251 - 7,800 ETB (25%)',0),
(6,6,10900,30,0,955,'7,801 - 10,900 ETB (30%)',0),
(7,7,10900,35,1,1500,'> 10,900 ETB (35%)',0);
/*!40000 ALTER TABLE `hrms_gibir_setting` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*M!100616 SET NOTE_VERBOSITY=@OLD_NOTE_VERBOSITY */;

-- Dump completed on 2026-09-17 12:24:20

-- Table: hrms_job_grades
/*M!999999\- enable the sandbox mode */ 
-- MariaDB dump 10.19-11.5.2-MariaDB, for Win64 (AMD64)
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
/*M!100616 SET @OLD_NOTE_VERBOSITY=@@NOTE_VERBOSITY, NOTE_VERBOSITY=0 */;

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
) ENGINE=InnoDB AUTO_INCREMENT=11 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `hrms_job_grades`
--

LOCK TABLES `hrms_job_grades` WRITE;
/*!40000 ALTER TABLE `hrms_job_grades` DISABLE KEYS */;
INSERT INTO `hrms_job_grades` (`id`, `grade_code`, `grade_name`, `min_salary`, `max_salary`, `step_increment_rate`, `description`, `is_active`, `created_at`, `updated_at`) VALUES (1,'GR-I','Grade I (Junior Support / Casual)',4500,7500,300,'Junior field support, trench workers, security guards',1,'2026-09-13 11:50:11','2026-09-13 11:50:11'),
(2,'GR-II','Grade II (Field Technician / Operator)',7500,12500,500,'Plumbers, water meter readers, junior pump operators',1,'2026-09-13 11:50:11','2026-09-13 11:50:11'),
(3,'GR-III','Grade III (Senior Technician / Officer)',12500,20000,800,'WTP plant operators, electromechanical technicians, billing officers',1,'2026-09-13 11:50:11','2026-09-13 11:50:11'),
(4,'GR-IV','Grade IV (Professional / Team Leader)',20000,32000,1200,'Water quality chemists, network engineers, HR officers, accountants',1,'2026-09-13 11:50:11','2026-09-13 11:50:11'),
(5,'GR-V','Grade V (Department Head / Director)',32000,55000,2000,'Department directors, technical division heads',1,'2026-09-13 11:50:11','2026-09-13 11:50:11');
/*!40000 ALTER TABLE `hrms_job_grades` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*M!100616 SET NOTE_VERBOSITY=@OLD_NOTE_VERBOSITY */;

-- Dump completed on 2026-09-17 12:24:20

-- Table: hrms_leave_types
/*M!999999\- enable the sandbox mode */ 
-- MariaDB dump 10.19-11.5.2-MariaDB, for Win64 (AMD64)
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
/*M!100616 SET @OLD_NOTE_VERBOSITY=@@NOTE_VERBOSITY, NOTE_VERBOSITY=0 */;

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
) ENGINE=InnoDB AUTO_INCREMENT=15 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `hrms_leave_types`
--

LOCK TABLES `hrms_leave_types` WRITE;
/*!40000 ALTER TABLE `hrms_leave_types` DISABLE KEYS */;
INSERT INTO `hrms_leave_types` (`id`, `type_code`, `type_name`, `type_name_am`, `default_days`, `is_service_accrued`, `is_paid`, `requires_attachment`, `gender_restriction`, `is_active`) VALUES (1,'ANNUAL','Annual Leave','ዓመታዊ የዕረፍት ፈቃድ',16,1,1,0,'ALL',1),
(2,'MATERNITY','Maternity Leave','የወሊድ ፈቃድ',120,0,1,1,'FEMALE',1),
(3,'PATERNITY','Paternity Leave','የአባትነት ፈቃድ',3,0,1,1,'MALE',1),
(4,'SICK','Sick Leave','የሕክምና ፈቃድ',30,0,1,1,'ALL',1),
(5,'BEREAVEMENT','Bereavement / Mourning Leave','የሐዘን ፈቃድ',3,0,1,0,'ALL',1),
(6,'WEDDING','Wedding Leave','የጋብቻ ፈቃድ',3,0,1,1,'ALL',1),
(7,'SPECIAL','Special Duty / Exam Leave','ልዩ ፈቃድ',5,0,1,1,'ALL',1);
/*!40000 ALTER TABLE `hrms_leave_types` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*M!100616 SET NOTE_VERBOSITY=@OLD_NOTE_VERBOSITY */;

-- Dump completed on 2026-09-17 12:24:21

-- Table: hrms_salary_configurations
/*M!999999\- enable the sandbox mode */ 
-- MariaDB dump 10.19-11.5.2-MariaDB, for Win64 (AMD64)
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
/*M!100616 SET @OLD_NOTE_VERBOSITY=@@NOTE_VERBOSITY, NOTE_VERBOSITY=0 */;

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
INSERT INTO `hrms_salary_configurations` (`id`, `config_code`, `config_title`, `config_title_am`, `is_birr`, `is_percent`, `config_value`, `weight`, `is_taxed`, `is_deductible`, `is_additive`, `is_pension`, `is_leave_config`, `is_deleted`, `created_at`, `updated_at`) VALUES (1,'CFG_OT_DAY','Daytime Overtime 1.5x','የትርፍ ሰዓት ክፍያ (ቀን 1.5x)',1,0,0,1,1,0,1,0,0,0,'2026-09-13 11:50:11','2026-09-13 11:50:11'),
(2,'CFG_HOUSING','Housing Allowance','የቤት ኪራይ አበል',1,0,500,2,1,0,1,0,0,0,'2026-09-13 11:50:11','2026-09-13 11:50:11'),
(3,'CFG_TRANSPORT','Transport Allowance','ጠቅላላ የትራንስፖርት አበል',1,0,300,3,1,0,1,0,0,0,'2026-09-13 11:50:11','2026-09-13 11:50:11'),
(4,'CFG_PENSION_EMP','Employee Pension 7%','የጡረታ መዋጮ (ሠራተኛ 7%)',0,1,7,4,0,1,0,1,0,0,'2026-09-13 11:50:11','2026-09-13 11:50:11'),
(5,'CFG_PENSION_ORG','Employer Pension 11%','የጡረታ መዋጮ (አሰሪ 11%)',0,1,11,5,0,0,0,1,0,0,'2026-09-13 11:50:11','2026-09-13 11:50:11'),
(6,'CFG_HAZARD','Hazard & Chemical Allowance','የክሎሪንና ኬሚካል አበል',1,0,400,6,1,0,1,0,0,0,'2026-09-13 11:50:11','2026-09-13 11:50:11'),
(7,'CFG_SHIFT_DIFF','Night Shift Differential Allowance','የማታ ፈረቃ አበል',1,0,250,7,1,0,1,0,0,0,'2026-09-13 11:50:11','2026-09-13 11:50:11'),
(8,'CFG_EDIR','Staff Association / Edir Deduction','የእድርና ብድር ተቀናሽ',1,0,100,8,0,1,0,0,0,0,'2026-09-13 11:50:11','2026-09-13 11:50:11');
/*!40000 ALTER TABLE `hrms_salary_configurations` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*M!100616 SET NOTE_VERBOSITY=@OLD_NOTE_VERBOSITY */;

-- Dump completed on 2026-09-17 12:24:21

-- Table: hrms_shift_schedules
/*M!999999\- enable the sandbox mode */ 
-- MariaDB dump 10.19-11.5.2-MariaDB, for Win64 (AMD64)
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
/*M!100616 SET @OLD_NOTE_VERBOSITY=@@NOTE_VERBOSITY, NOTE_VERBOSITY=0 */;

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
) ENGINE=InnoDB AUTO_INCREMENT=11 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `hrms_shift_schedules`
--

LOCK TABLES `hrms_shift_schedules` WRITE;
/*!40000 ALTER TABLE `hrms_shift_schedules` DISABLE KEYS */;
INSERT INTO `hrms_shift_schedules` (`id`, `shift_code`, `shift_name`, `start_time`, `end_time`, `is_night_shift`, `grace_period_minutes`, `total_hours`, `description`, `is_active`) VALUES (1,'SHIFT-MORN','Morning Shift (የጠዋት ፈረቃ)','06:00:00','14:00:00',0,15,8,'Treatment plant and pump station morning shift',1),
(2,'SHIFT-AFTN','Afternoon Shift (የከሰዓት ፈረቃ)','14:00:00','22:00:00',0,15,8,'Treatment plant and pump station afternoon shift',1),
(3,'SHIFT-NIGHT','Night Shift (የማታ ፈረቃ - 1.75x OT / Allowance)','22:00:00','06:00:00',1,15,8,'Continuous night operation with statutory night differential',1),
(4,'SHIFT-GEN','General Office Hours (መደበኛ የቢሮ ሰዓት)','08:00:00','17:00:00',0,15,8,'Standard administration & billing office schedule with 1hr lunch',1),
(5,'SHIFT-STNDBY','Emergency Standby (የአደጋ ጊዜ ተረኛ)','17:00:00','08:00:00',1,30,15,'On-call emergency leak burst & main line repair crew',1);
/*!40000 ALTER TABLE `hrms_shift_schedules` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*M!100616 SET NOTE_VERBOSITY=@OLD_NOTE_VERBOSITY */;

-- Dump completed on 2026-09-17 12:24:21

-- Table: inv_item_category
/*M!999999\- enable the sandbox mode */ 
-- MariaDB dump 10.19-11.5.2-MariaDB, for Win64 (AMD64)
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
/*M!100616 SET @OLD_NOTE_VERBOSITY=@@NOTE_VERBOSITY, NOTE_VERBOSITY=0 */;

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
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `inv_item_category`
--

LOCK TABLES `inv_item_category` WRITE;
/*!40000 ALTER TABLE `inv_item_category` DISABLE KEYS */;
INSERT INTO `inv_item_category` (`id`, `category_code`, `category_name`, `category_name_am`, `description`, `item_type`, `tracking_type`, `is_active`, `deleted`, `created_by`, `created_at`, `updated_at`) VALUES (1,'1122','Pipe andFiting2','ቧንቧወች','','SERVICE','NONE',1,'No','system','2026-09-06 05:44:21','2026-09-07 06:49:08');
/*!40000 ALTER TABLE `inv_item_category` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*M!100616 SET NOTE_VERBOSITY=@OLD_NOTE_VERBOSITY */;

-- Dump completed on 2026-09-17 12:24:21

-- Table: inv_supplier
/*M!999999\- enable the sandbox mode */ 
-- MariaDB dump 10.19-11.5.2-MariaDB, for Win64 (AMD64)
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
/*M!100616 SET @OLD_NOTE_VERBOSITY=@@NOTE_VERBOSITY, NOTE_VERBOSITY=0 */;

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
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `inv_supplier`
--

LOCK TABLES `inv_supplier` WRITE;
/*!40000 ALTER TABLE `inv_supplier` DISABLE KEYS */;
INSERT INTO `inv_supplier` (`id`, `supplier_code`, `supplier_name`, `supplier_name_am`, `tin`, `phone`, `email`, `address`, `city`, `contact_person`, `contact_phone`, `bank_name`, `bank_account_number`, `is_active`, `deleted`, `created_by`, `created_at`, `updated_at`) VALUES (1,'SUP1','abc Metere ','abc Metere  amh','00052154','0935981944','toaddisu@gmail.com','Bahir Dar , Amhara ,ET(1CDEx4)','Amhara, Bahir Dar, Bahir Dar','Addisu Zeleke Mesfin','0935981944','dshn','100002541',1,'No','reading2','2026-09-06 08:16:37','2026-09-06 08:16:37');
/*!40000 ALTER TABLE `inv_supplier` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*M!100616 SET NOTE_VERBOSITY=@OLD_NOTE_VERBOSITY */;

-- Dump completed on 2026-09-17 12:24:21

-- Table: inv_unit_of_measure
/*M!999999\- enable the sandbox mode */ 
-- MariaDB dump 10.19-11.5.2-MariaDB, for Win64 (AMD64)
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
/*M!100616 SET @OLD_NOTE_VERBOSITY=@@NOTE_VERBOSITY, NOTE_VERBOSITY=0 */;

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
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `inv_unit_of_measure`
--

LOCK TABLES `inv_unit_of_measure` WRITE;
/*!40000 ALTER TABLE `inv_unit_of_measure` DISABLE KEYS */;
INSERT INTO `inv_unit_of_measure` (`id`, `unit_code`, `unit_name`, `unit_name_am`, `is_active`, `deleted`, `created_by`, `created_at`, `updated_at`) VALUES (1,' PCS','Pieces','ብዛት',1,'No','system','2026-09-06 05:35:48','2026-09-06 05:38:52'),
(2,'M','Meter','ሜትር',1,'No','system','2026-09-06 05:39:11','2026-09-06 05:39:11'),
(3,'2312','liter','lig',1,'No','system','2026-09-06 06:47:14','2026-09-06 06:47:21');
/*!40000 ALTER TABLE `inv_unit_of_measure` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*M!100616 SET NOTE_VERBOSITY=@OLD_NOTE_VERBOSITY */;

-- Dump completed on 2026-09-17 12:24:21

-- Table: user_account_role
/*M!999999\- enable the sandbox mode */ 
-- MariaDB dump 10.19-11.5.2-MariaDB, for Win64 (AMD64)
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
/*M!100616 SET @OLD_NOTE_VERBOSITY=@@NOTE_VERBOSITY, NOTE_VERBOSITY=0 */;

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
INSERT INTO `user_account_role` (`id`, `user_account_id`, `user_role_id`, `branch_id`, `assigned_by`, `assigned_at`, `is_active`) VALUES (1,111,7,NULL,'reading2','2026-09-06 15:33:48',0),
(2,111,8,NULL,'reading2','2026-09-06 15:34:06',0),
(3,111,15,NULL,'reading2','2026-09-06 15:43:18',0),
(4,204,51,NULL,'admin2','2026-09-06 17:09:02',0),
(5,1,1,NULL,'admin2','2026-09-06 17:12:00',1),
(6,111,30,NULL,'admin2','2026-09-06 17:12:39',1),
(7,1,30,NULL,'admin2','2026-09-06 18:41:27',1),
(8,204,30,NULL,'admin2','2026-09-07 04:23:27',0),
(9,204,30,NULL,'admin2','2026-09-07 04:34:13',0),
(10,204,1,NULL,'admin2','2026-09-07 04:37:08',0),
(11,204,51,NULL,'mstore','2026-09-07 04:55:43',1),
(12,204,30,NULL,'mstore','2026-09-07 05:47:20',0),
(13,204,1,NULL,'mstore','2026-09-07 05:50:26',0),
(14,204,30,NULL,'mstore','2026-09-07 06:14:40',0),
(15,204,30,NULL,'mstore','2026-09-07 06:19:07',0),
(16,204,49,NULL,'admin2','2026-09-07 06:28:39',0),
(17,205,52,NULL,'admin2','2026-09-07 06:35:19',1),
(18,209,56,NULL,'reading2','2026-09-08 14:31:39',1);
/*!40000 ALTER TABLE `user_account_role` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*M!100616 SET NOTE_VERBOSITY=@OLD_NOTE_VERBOSITY */;

-- Dump completed on 2026-09-17 12:24:21

-- Table: wf_workflow_template
/*M!999999\- enable the sandbox mode */ 
-- MariaDB dump 10.19-11.5.2-MariaDB, for Win64 (AMD64)
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
/*M!100616 SET @OLD_NOTE_VERBOSITY=@@NOTE_VERBOSITY, NOTE_VERBOSITY=0 */;

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
INSERT INTO `wf_workflow_template` (`id`, `template_code`, `template_name`, `document_type`, `description`, `is_active`, `created_by`, `created_at`, `updated_at`) VALUES (1,'PR_APPROVAL','Purchase Requisition Approval','PURCHASE_REQUISITION','Standard 3-step approval for purchase requisitions',1,'system','2026-09-06 17:03:03','2026-09-06 17:03:03'),
(2,'PO_APPROVAL','Purchase Order Approval','PURCHASE_ORDER','Finance and GM approval for purchase orders',1,'system','2026-09-06 17:03:03','2026-09-06 17:03:03'),
(3,'TRANSFER_APPROVAL','Stock Transfer Approval','STOCK_TRANSFER','Manager approval for inter-store transfers',1,'system','2026-09-06 17:03:03','2026-09-06 17:03:03'),
(4,'ADJUSTMENT_APPROVAL','Stock Adjustment Approval','STOCK_ADJUSTMENT','Manager and finance approval for adjustments',1,'system','2026-09-06 17:03:03','2026-09-06 17:03:03'),
(5,'ISSUE_APPROVAL','Issue Voucher Approval','ISSUE_VOUCHER','Manager approval for material issues',1,'system','2026-09-06 17:03:03','2026-09-06 17:03:03');
/*!40000 ALTER TABLE `wf_workflow_template` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*M!100616 SET NOTE_VERBOSITY=@OLD_NOTE_VERBOSITY */;

-- Dump completed on 2026-09-17 12:24:21

-- === TIER 1: Depends on Tier 0 new tables ===

-- Table: fnc_account
/*M!999999\- enable the sandbox mode */ 
-- MariaDB dump 10.19-11.5.2-MariaDB, for Win64 (AMD64)
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
/*M!100616 SET @OLD_NOTE_VERBOSITY=@@NOTE_VERBOSITY, NOTE_VERBOSITY=0 */;

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
) ENGINE=InnoDB AUTO_INCREMENT=81 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `fnc_account`
--

LOCK TABLES `fnc_account` WRITE;
/*!40000 ALTER TABLE `fnc_account` DISABLE KEYS */;
INSERT INTO `fnc_account` (`id`, `account_code`, `account_name`, `account_name_am`, `account_type`, `parent_account_id`, `is_active`, `is_header`, `normal_balance`, `description`, `created_by`, `created_at`, `updated_at`) VALUES (1,'1200-0000','Accounts Receivable','ተሰብሳቢ ሂሳብ','ASSET',NULL,1,1,'DEBIT','Parent Header — Customer Accounts Receivable Control','system','2026-08-25 21:58:53','2026-08-25 21:58:53'),
(2,'1222-0006','Current Month Water consumption','የዚህ ወር የውሃ ፍጆታ ተቀባይ','ASSET',1,1,0,'DEBIT','Receivable for current month water consumption — yezihWerFjotaKfya','system','2026-08-25 21:58:54','2026-08-25 21:58:54'),
(3,'1222-0007','Meter Rent','ቆጣሪ ኪራይ ተቀባይ','ASSET',1,1,0,'DEBIT','Receivable for meter rent — kotariKiray','system','2026-08-25 21:58:54','2026-08-25 21:58:54'),
(4,'1222-0008','Bill Additional Payment','ተጨማሪ ክፍያ ተቀባይ','ASSET',1,1,0,'DEBIT','Receivable for bill additional payment — techemariKfya','system','2026-08-25 21:58:54','2026-08-25 21:58:54'),
(5,'1222-0009','Arrears Water Consumption','ውዝፍ የውሃ ፍጆታ ተቀባይ','ASSET',1,1,0,'DEBIT','Receivable for arrears water consumption — wuzifFjotaKfya','system','2026-08-25 21:58:54','2026-08-25 21:58:54'),
(6,'1222-0010','Arrears Meter rent','ውዝፍ ቆጣሪ ኪራይ ተቀባይ','ASSET',1,1,0,'DEBIT','Receivable for arrears meter rent — wuzifKotariKiray','system','2026-08-25 21:58:54','2026-08-25 21:58:54'),
(7,'1222-0011','Arrears Bill Additional Payment','ውዝፍ ተጨማሪ ክፍያ ተቀባይ','ASSET',1,1,0,'DEBIT','Receivable for arrears bill additional payment — wuzifTechemariKfya','system','2026-08-25 21:58:55','2026-08-25 21:58:55'),
(8,'1222-0012','Bill Penalty','ቅጣት ተቀባይ','ASSET',1,1,0,'DEBIT','Receivable for penalty charges — kitat','system','2026-08-25 21:58:55','2026-08-25 21:58:55'),
(9,'1222-0013','Bill Old system Arrears','የተላለፈ(ነባር) ውዝፍ ተቀባይ','ASSET',1,1,0,'DEBIT','Receivable for old system carried forward arrears — calculated','system','2026-08-25 21:58:55','2026-08-25 21:58:55'),
(10,'1222-0014','Bill Service Charge','የአገልግሎት ክፍያ ተቀባይ','ASSET',1,1,0,'DEBIT','Receivable for service charge — billing_additional_payment_1_value','system','2026-08-25 21:58:55','2026-08-25 21:58:55'),
(11,'1222-0015','Dry Wast','የዚህ ወር ደረቅ ቆሻሻ ተቀባይ','ASSET',1,1,0,'DEBIT','Receivable for dry waste charge — additionalHisab','system','2026-08-25 21:58:55','2026-08-25 21:58:55'),
(12,'1222-0016','School Feeding','የትምህርት ቤት ምገባ ተቀባይ','ASSET',1,1,0,'DEBIT','Receivable for school feeding charge — billing_additional_payment_2_value','system','2026-08-25 21:58:55','2026-08-25 21:58:55'),
(13,'1222-0017','Arrears Bill Service Charge','ውዝፍ የአገልግሎት ክፍያ ተቀባይ','ASSET',1,1,0,'DEBIT','Receivable for arrears service charge — billing_additional_payment_1_wuzif','system','2026-08-25 21:58:55','2026-08-25 21:58:55'),
(14,'1222-0018','Arrears Dry Wast','ውዝፍ ደረቅ ቆሻሻ ተቀባይ','ASSET',1,1,0,'DEBIT','Receivable for arrears dry waste charge — wuzifDerekKoshasha','system','2026-08-25 21:58:55','2026-08-25 21:58:55'),
(15,'1222-0019','Arrears School Feeding','ውዝፍ የትምህርት ቤት ምገባ ተቀባይ','ASSET',1,1,0,'DEBIT','Receivable for arrears school feeding charge — billing_additional_payment_2_wuzif','system','2026-08-25 21:58:56','2026-08-25 21:58:56'),
(16,'4001-0000','Water Sales Revenue','የውሃ ሽያጭ ገቢ','REVENUE',NULL,1,1,'CREDIT','Parent Header — Water Sales Revenue Control','system','2026-08-25 21:58:56','2026-08-25 21:58:56'),
(17,'4001-0005','Current Month Water consumption','የዚህ ወር የውሃ ፍጆታ ገቢ','REVENUE',16,1,0,'CREDIT','Revenue for current month water consumption — yezihWerFjotaKfya','system','2026-08-25 21:58:56','2026-08-25 21:58:56'),
(18,'4001-0006','Meter Rent','ቆጣሪ ኪራይ ገቢ','REVENUE',16,1,0,'CREDIT','Monthly meter rental fees — kotariKiray','system','2026-08-25 21:58:56','2026-08-25 21:58:56'),
(19,'4001-0007','Bill Additional Payment','ተጨማሪ ክፍያ ገቢ','REVENUE',16,1,0,'CREDIT','Revenue for bill additional payments — techemariKfya','system','2026-08-25 21:58:56','2026-08-25 21:58:56'),
(20,'4001-0008','Arrears Water Consumption','ውዝፍ የውሃ ፍጆታ ገቢ','REVENUE',16,1,0,'CREDIT','Revenue for prior arrears water consumption — wuzifFjotaKfya','system','2026-08-25 21:58:56','2026-08-25 21:58:56'),
(21,'4001-0009','Arrears Meter rent','ውዝፍ ቆጣሪ ኪራይ ገቢ','REVENUE',16,1,0,'CREDIT','Revenue for prior arrears meter rent — wuzifKotariKiray','system','2026-08-25 21:58:56','2026-08-25 21:58:56'),
(22,'4001-0010','Arrears Bill Additional Payment','ውዝፍ ተጨማሪ ክፍያ ገቢ','REVENUE',16,1,0,'CREDIT','Revenue for prior arrears bill additional payment — wuzifTechemariKfya','system','2026-08-25 21:58:56','2026-08-25 21:58:56'),
(23,'4001-0011','Bill Penalty','ቅጣት ገቢ','REVENUE',16,1,0,'CREDIT','Revenue for late payment penalties — kitat','system','2026-08-25 21:58:56','2026-08-25 21:58:56'),
(24,'4001-0012','Bill Old system Arrears','የተላለፈ(ነባር) ውዝፍ ገቢ','REVENUE',16,1,0,'CREDIT','Revenue recognized for legacy/old system arrears carried forward','system','2026-08-25 21:58:56','2026-08-25 21:58:56'),
(25,'4001-0013','Bill Service Charge','የአገልግሎት ክፍያ ገቢ','REVENUE',16,1,0,'CREDIT','Revenue for billing service charges — billing_additional_payment_1_value','system','2026-08-25 21:58:56','2026-08-25 21:58:56'),
(26,'2005-0000','Other Gov\'t Tax Payable','ሌሎች የመንግስት ታክስ ተከፋይ','LIABILITY',NULL,1,1,'CREDIT','Parent Header — Other Government Tax & Surcharge Payables Control','system','2026-08-25 21:58:57','2026-08-25 21:58:57'),
(27,'2005-0004','Dry Wast','የዚህ ወር ደረቅ ቆሻሻ ተከፋይ','LIABILITY',26,1,0,'CREDIT','Payable to municipality/waste company for dry waste — additionalHisab','system','2026-08-25 21:58:57','2026-08-25 21:58:57'),
(28,'2005-0005','School Feeding','የትምህርት ቤት ምገባ ተከፋይ','LIABILITY',26,1,0,'CREDIT','Payable for school feeding program — billing_additional_payment_2_value','system','2026-08-25 21:58:57','2026-08-25 21:58:57'),
(29,'2005-0006','Arrears Bill Service Charge','ውዝፍ የአገልግሎት ክፍያ ተከፋይ','LIABILITY',26,1,0,'CREDIT','Payable for arrears service charges — billing_additional_payment_1_wuzif','system','2026-08-25 21:58:57','2026-08-25 21:58:57'),
(30,'2005-0007','Arrears Dry Wast','ውዝፍ ደረቅ ቆሻሻ ተከፋይ','LIABILITY',26,1,0,'CREDIT','Payable to municipality/waste company for arrears dry waste — wuzifDerekKoshasha','system','2026-08-25 21:58:57','2026-08-25 21:58:57'),
(31,'2005-0008','Arrears School Feeding','ውዝፍ የትምህርት ቤት ምገባ ተከፋይ','LIABILITY',26,1,0,'CREDIT','Payable for arrears school feeding program — billing_additional_payment_2_wuzif','system','2026-08-25 21:58:57','2026-08-25 21:58:57'),
(32,'1100-0000','Cash and Cash Equivalents','ጥሬ ገንዘብ እና የባንክ ሂሳቦች','ASSET',NULL,1,1,'DEBIT','Parent Header — Cash and Cash Equivalents','system','2026-08-26 18:12:14','2026-08-26 18:12:14'),
(33,'1111-0000','Cash on Hand','በእጅ ያለ ጥሬ ገንዘብ','ASSET',32,1,1,'DEBIT','Cash on Hand Control Header','system','2026-08-26 18:12:14','2026-08-26 18:12:14'),
(34,'1113-0000','Cash at Bank','በባንክ ያለ ገንዘብ','ASSET',32,1,1,'DEBIT','Cash at Bank Control Header','system','2026-08-26 18:12:15','2026-08-26 18:12:15'),
(35,'1111-0001','Office Cash Account','የቢሮ ጥሬ ገንዘብ','ASSET',33,1,0,'DEBIT','Front office cash collections — OFFICE_CASH','system','2026-08-26 18:12:15','2026-08-26 18:12:15'),
(36,'1112-0001','Prepaid Customer Deposit Account','የደንበኞች ቅድመ ክፍያ ተቀማጭ','ASSET',32,1,0,'DEBIT','Customer prepaid/credit balances — PREPAID_ACCOUNT','system','2026-08-26 18:12:15','2026-08-26 18:12:15'),
(37,'1113-0001','Abay Bank','አባይ ባንክ','ASSET',34,1,0,'DEBIT','Abay Bank Collection Account','system','2026-08-26 18:12:15','2026-08-26 18:12:15'),
(38,'1113-0002','Commercial Bank of Ethiopia (CBE)','የኢትዮጵያ ንግድ ባንክ','ASSET',34,1,0,'DEBIT','CBE Collection Account','system','2026-08-26 18:12:15','2026-08-26 18:12:15'),
(39,'1113-0003','Telebirr','ቴሌብር','ASSET',34,1,0,'DEBIT','Telebirr Payment Account','system','2026-08-26 18:12:15','2026-08-26 18:12:15'),
(40,'1113-0004','Bank of Abyssinia','አቢሲኒያ ባንክ','ASSET',34,1,0,'DEBIT','Bank of Abyssinia Collection Account','system','2026-08-26 18:12:15','2026-08-26 18:12:15'),
(41,'1113-0005','Dashen Bank','ዳሽን ባንክ','ASSET',34,1,0,'DEBIT','Dashen Bank Collection Account','system','2026-08-26 18:12:15','2026-08-26 18:12:15'),
(42,'1113-0006','Awash Bank','አዋሽ ባንክ','ASSET',34,1,0,'DEBIT','Awash Bank Collection Account','system','2026-08-26 18:12:15','2026-08-26 18:12:15'),
(43,'1113-0008','Nib International Bank','ንብ ባንክ','ASSET',34,1,0,'DEBIT','Nib Bank Collection Account','system','2026-08-26 18:12:15','2026-08-26 18:12:15'),
(44,'1113-0009','Cooperative Bank of Oromia','የኦሮሚያ ህብረት ስራ ባንክ','ASSET',34,1,0,'DEBIT','Coop Bank Collection Account','system','2026-08-26 18:12:15','2026-08-26 18:12:15'),
(45,'1113-0010','Hibret Bank','ኅብረት ባንክ','ASSET',34,1,0,'DEBIT','Hibret Bank Collection Account','system','2026-08-26 18:12:15','2026-08-26 18:12:15'),
(46,'1113-0011','Berhan Bank','ብርሃን ባንክ','ASSET',34,1,0,'DEBIT','Berhan Bank Collection Account','system','2026-08-26 18:12:15','2026-08-26 18:12:15'),
(47,'1113-0012','Zemen Bank','ዘመን ባንክ','ASSET',34,1,0,'DEBIT','Zemen Bank Collection Account','system','2026-08-26 18:12:15','2026-08-26 18:12:15'),
(48,'1113-0013','Bunna International Bank','ቡና ባንክ','ASSET',34,1,0,'DEBIT','Bunna Bank Collection Account','system','2026-08-26 18:12:15','2026-08-26 18:12:15'),
(49,'1113-0015','Lion International Bank','አንበሳ ባንክ','ASSET',34,1,0,'DEBIT','Lion Bank Collection Account','system','2026-08-26 18:12:15','2026-08-26 18:12:15'),
(50,'1113-0016','Enat Bank','እናት ባንክ','ASSET',34,1,0,'DEBIT','Enat Bank Collection Account','system','2026-08-26 18:12:15','2026-08-26 18:12:15'),
(51,'1113-0017','Global Bank Ethiopia','ግሎባል ባንክ ኢትዮጵያ','ASSET',34,1,0,'DEBIT','Global Bank Collection Account','system','2026-08-26 18:12:15','2026-08-26 18:12:15'),
(52,'1113-0018','Amhara Bank','አማራ ባንክ','ASSET',34,1,0,'DEBIT','Amhara Bank Collection Account','system','2026-08-26 18:12:15','2026-08-26 18:12:15'),
(53,'1113-0019','Gadaa Bank','ገዳ ባንክ','ASSET',34,1,0,'DEBIT','Gadaa Bank Collection Account','system','2026-08-26 18:12:15','2026-08-26 18:12:15'),
(54,'1113-0020','Hijra Bank','ሂጅራ ባንክ','ASSET',34,1,0,'DEBIT','Hijra Bank Collection Account','system','2026-08-26 18:12:15','2026-08-26 18:12:15'),
(55,'1113-0021','ZamZam Bank','ዘምዘም ባንክ','ASSET',34,1,0,'DEBIT','ZamZam Bank Collection Account','system','2026-08-26 18:12:15','2026-08-26 18:12:15'),
(56,'1113-0022','Sinqee Bank','ሲንቄ ባንክ','ASSET',34,1,0,'DEBIT','Sinqee Bank Collection Account','system','2026-08-26 18:12:15','2026-08-26 18:12:15'),
(57,'1113-0023','Tsedey Bank','ፀደይ ባንክ','ASSET',34,1,0,'DEBIT','Tsedey Bank Collection Account','system','2026-08-26 18:12:15','2026-08-26 18:12:15'),
(58,'1113-0024','CBE Birr','የሲቢኢ ብር','ASSET',34,1,0,'DEBIT','CBE Birr Mobile Wallet Account','system','2026-08-26 18:12:16','2026-08-26 18:12:16'),
(59,'1113-0025','Unicash / Derash Payment','ዩኒካሽ / ደራሽ ክፍያ','ASSET',34,1,0,'DEBIT','Unicash/Derash Payment Gateway Account','system','2026-08-26 18:12:16','2026-08-26 18:12:16'),
(60,'1113-0026','Marda Arif Payment','ማርዳ አሪፍ ክፍያ','ASSET',34,1,0,'DEBIT','Marda Arif Payment Account','system','2026-08-26 18:12:16','2026-08-26 18:12:16'),
(61,'1300-0001','Inventory Asset','የዕቃ ንብረት ሂሳብ','ASSET',NULL,1,0,'DEBIT','General inventory asset account for stored materials','system','2026-09-12 19:16:11','2026-09-12 19:16:11'),
(62,'2100-0001','Accounts Payable - Inventory / GR-IR','የሚከፈል እዳ (የዕቃ ግዢ)','LIABILITY',NULL,1,0,'CREDIT','Accounts payable for goods received from suppliers','system','2026-09-12 19:16:11','2026-09-12 19:16:11'),
(63,'5100-0001','Cost of Goods Sold (COGS)','የተሸጡ ዕቃዎች ወጪ','EXPENSE',NULL,1,0,'DEBIT','Cost of materials sold or issued for new connections/services','system','2026-09-12 19:16:11','2026-09-12 19:16:11'),
(64,'6200-0001','Operating Supplies Expense','የስራ ማስኬጃ ዕቃዎች ወጪ','EXPENSE',NULL,1,0,'DEBIT','Internal supplies and maintenance materials consumed','system','2026-09-12 19:16:11','2026-09-12 19:16:11'),
(65,'6300-0001','Inventory Adjustment Gain','የዕቃ ማስተካከያ ትርፍ','REVENUE',NULL,1,0,'CREDIT','Physical audit count surplus gain','system','2026-09-12 19:16:11','2026-09-12 19:16:11'),
(66,'6300-0002','Inventory Loss / Shrinkage','የዕቃ ብልሽት/ኪሳራ ወጪ','EXPENSE',NULL,1,0,'DEBIT','Physical audit count shortage or damage write-off','system','2026-09-12 19:16:11','2026-09-12 19:16:11'),
(67,'1301-0001','Inventory In-Transit','ተቀባይ መጋዘን / ዝውውር','ASSET',NULL,1,0,'DEBIT','Inter-store transfer transit account','system','2026-09-12 19:16:11','2026-09-12 19:16:11'),
(68,'5100-0000','Salaries & Employee Benefits','የደመወዝና ሠራተኞች ጥቅማጥቅም ወጪ','EXPENSE',NULL,1,1,'DEBIT','Parent Header — Payroll and Employee Benefits Control','system','2026-09-13 08:38:16','2026-09-13 08:38:16'),
(69,'5110-0001','Basic Salaries Expense','መሰረታዊ ደመወዝ ወጪ','EXPENSE',68,1,0,'DEBIT','Basic salaries expense for permanent & contract staff','system','2026-09-13 08:38:16','2026-09-13 08:38:16'),
(70,'5110-0002','Overtime Pay Expense','የትርፍ ሰዓት ክፍያ ወጪ','EXPENSE',68,1,0,'DEBIT','Overtime compensation under Labour Proclamation 1156/2019','system','2026-09-13 08:38:16','2026-09-13 08:38:16'),
(71,'5110-0003','Housing Allowances Expense','የቤት ኪራይ አበል ወጪ','EXPENSE',68,1,0,'DEBIT','Housing and living cost allowances expense','system','2026-09-13 08:38:16','2026-09-13 08:38:16'),
(72,'5110-0004','Transport Allowances Expense','የትራንስፖርት አበል ወጪ','EXPENSE',68,1,0,'DEBIT','Transport and commute allowances expense','system','2026-09-13 08:38:16','2026-09-13 08:38:16'),
(73,'5110-0005','Hazard & Chemical Allowances Expense','የክሎሪንና ኬሚካል አበል ወጪ','EXPENSE',68,1,0,'DEBIT','Water treatment hazardous chemical handling & shift allowances','system','2026-09-13 08:38:16','2026-09-13 08:38:16'),
(74,'5110-0006','Employer Pension Contribution 11%','የአሰሪው ጡረታ መዋጮ 11% ወጪ','EXPENSE',68,1,0,'DEBIT','Statutory 11% employer pension contribution expense','system','2026-09-13 08:38:17','2026-09-13 08:38:17'),
(75,'2100-0000','Payroll Withholdings & Accruals','የደመወዝ ተቀናሾችና እዳዎች','LIABILITY',NULL,1,1,'CREDIT','Parent Header — Statutory withholdings and payroll liabilities','system','2026-09-13 08:38:17','2026-09-13 08:38:17'),
(76,'2110-0001','Employment Income Tax Payable','የሥራ ግብር ተከፋይ','LIABILITY',75,1,0,'CREDIT','Employment income tax payable to Ministry of Revenues (Schedule A)','system','2026-09-13 08:38:17','2026-09-13 08:38:17'),
(77,'2110-0002','Pension Contribution Payable','የጡረታ መዋጮ ተከፋይ (18%)','LIABILITY',75,1,0,'CREDIT','Total statutory pension payable to POESSA / PSSSA (18%)','system','2026-09-13 08:38:17','2026-09-13 08:38:17'),
(78,'2110-0003','Staff Association & Edir Payable','የእድርና ብድር ተቀናሽ ተከፋይ','LIABILITY',75,1,0,'CREDIT','Voluntary payroll deductions (Edir, Credit Association, Union)','system','2026-09-13 08:38:17','2026-09-13 08:38:17'),
(79,'2110-0004','Net Salaries Payable — CBE','የተጣራ ደመወዝ ተከፋይ (ንግድ ባንክ)','LIABILITY',75,1,0,'CREDIT','Net salary payable to staff via Commercial Bank of Ethiopia','system','2026-09-13 08:38:17','2026-09-13 08:38:17'),
(80,'2110-0005','Net Salaries Payable — Abay Bank','የተጣራ ደመወዝ ተከፋይ (አባይ ባንክ)','LIABILITY',75,1,0,'CREDIT','Net salary & special allowances payable via Abay Bank','system','2026-09-13 08:38:17','2026-09-13 08:38:17');
/*!40000 ALTER TABLE `fnc_account` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*M!100616 SET NOTE_VERBOSITY=@OLD_NOTE_VERBOSITY */;

-- Dump completed on 2026-09-17 12:24:21

-- Table: hrms_positions
/*M!999999\- enable the sandbox mode */ 
-- MariaDB dump 10.19-11.5.2-MariaDB, for Win64 (AMD64)
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
/*M!100616 SET @OLD_NOTE_VERBOSITY=@@NOTE_VERBOSITY, NOTE_VERBOSITY=0 */;

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
) ENGINE=InnoDB AUTO_INCREMENT=19 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `hrms_positions`
--

LOCK TABLES `hrms_positions` WRITE;
/*!40000 ALTER TABLE `hrms_positions` DISABLE KEYS */;
INSERT INTO `hrms_positions` (`id`, `position_code`, `position_title`, `position_title_am`, `department_id`, `job_grade_id`, `approved_headcount`, `is_hazardous`, `requires_shift_work`, `is_active`, `created_at`, `updated_at`) VALUES (1,'POS-WTP-OP','Water Treatment Plant Operator','የውሃ ማጣሪያ ፕላንት ኦፕሬተር',1,3,8,1,1,1,'2026-09-13 11:50:11','2026-09-13 11:50:11'),
(2,'POS-WTP-CHM','Water Quality Lab Chemist','የውሃ ጥራት ተቆጣጣሪ ኬሚስት',1,4,3,1,0,1,'2026-09-13 11:50:11','2026-09-13 11:50:11'),
(3,'POS-NET-PLMB','Network Maintenance Plumber','የውሃ መስመር ጥገና ባለሙያ (ቧንቧ ሠራተኛ)',2,2,12,0,1,1,'2026-09-13 11:50:11','2026-09-13 11:50:11'),
(4,'POS-LEAK-REP','Emergency Leak Repair Technician','የአደጋ ጊዜ የውሃ ፍሰት ጥገና ቴክኒሻን',2,3,6,0,1,1,'2026-09-13 11:50:11','2026-09-13 11:50:11'),
(5,'POS-ELEC-ENG','Electro-Mechanical Pump Station Engineer','የቦስተርና ፓምፕ ኤሌክትሮ መካኒክ መሃንዲስ',3,4,4,1,1,1,'2026-09-13 11:50:11','2026-09-13 11:50:11'),
(6,'POS-MTR-RDR','Water Meter Reader & Collector','የውሃ ቆጣሪ አንባቢና ተቆጣጣሪ',4,2,15,0,0,1,'2026-09-13 11:50:11','2026-09-13 11:50:11'),
(7,'POS-BILL-OFF','Customer Billing Officer','የደንበኞች ቢሊንግ ባለሙያ',4,3,6,0,0,1,'2026-09-13 11:50:11','2026-09-13 11:50:11'),
(8,'POS-HR-OFF','Human Resource Specialist','የሰው ኃይል አስተዳደር ባለሙያ',5,4,2,0,0,1,'2026-09-13 11:50:11','2026-09-13 11:50:11'),
(9,'POS-PAY-ACC','Payroll & General Ledger Accountant','የደመወዝና ፋይናንስ ሂሳብ ሹም',6,4,2,0,0,1,'2026-09-13 11:50:11','2026-09-13 11:50:11');
/*!40000 ALTER TABLE `hrms_positions` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*M!100616 SET NOTE_VERBOSITY=@OLD_NOTE_VERBOSITY */;

-- Dump completed on 2026-09-17 12:24:22

-- Table: inv_item_group
/*M!999999\- enable the sandbox mode */ 
-- MariaDB dump 10.19-11.5.2-MariaDB, for Win64 (AMD64)
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
/*M!100616 SET @OLD_NOTE_VERBOSITY=@@NOTE_VERBOSITY, NOTE_VERBOSITY=0 */;

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
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `inv_item_group`
--

LOCK TABLES `inv_item_group` WRITE;
/*!40000 ALTER TABLE `inv_item_group` DISABLE KEYS */;
INSERT INTO `inv_item_group` (`id`, `category_id`, `group_code`, `group_name`, `group_name_am`, `is_active`, `deleted`, `created_by`, `created_at`, `updated_at`) VALUES (2,1,'23','dsdsd','bbbbb',1,'No','system','2026-09-06 06:30:54','2026-09-06 06:30:54'),
(3,1,'232','office use','offfus',1,'No','system','2026-09-06 06:51:03','2026-09-06 06:51:03');
/*!40000 ALTER TABLE `inv_item_group` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*M!100616 SET NOTE_VERBOSITY=@OLD_NOTE_VERBOSITY */;

-- Dump completed on 2026-09-17 12:24:22

-- Table: inv_store
/*M!999999\- enable the sandbox mode */ 
-- MariaDB dump 10.19-11.5.2-MariaDB, for Win64 (AMD64)
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
/*M!100616 SET @OLD_NOTE_VERBOSITY=@@NOTE_VERBOSITY, NOTE_VERBOSITY=0 */;

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
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `inv_store`
--

LOCK TABLES `inv_store` WRITE;
/*!40000 ALTER TABLE `inv_store` DISABLE KEYS */;
INSERT INTO `inv_store` (`id`, `store_code`, `store_name`, `store_name_am`, `branch_id`, `is_main_store`, `store_keeper_id`, `manager_id`, `location`, `is_active`, `deleted`, `created_by`, `created_at`, `updated_at`) VALUES (1,'ST1','main Store','ዋናው እቃ ቤት',1,1,209,NULL,'kebele 1',1,'No','reading2','2026-09-06 08:01:25','2026-09-11 19:31:32'),
(2,'ST2','SheSha Ber','ሸሻ በር',6,0,204,NULL,'3',1,'No','reading2','2026-09-06 08:02:12','2026-09-11 19:31:33'),
(3,'STB3','branch 3','ብራንች 3',7,0,219,NULL,'keb33',1,'No','reading2','2026-09-11 09:44:32','2026-09-11 19:31:33');
/*!40000 ALTER TABLE `inv_store` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*M!100616 SET NOTE_VERBOSITY=@OLD_NOTE_VERBOSITY */;

-- Dump completed on 2026-09-17 12:24:22

-- Table: wf_workflow_step
/*M!999999\- enable the sandbox mode */ 
-- MariaDB dump 10.19-11.5.2-MariaDB, for Win64 (AMD64)
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
/*M!100616 SET @OLD_NOTE_VERBOSITY=@@NOTE_VERBOSITY, NOTE_VERBOSITY=0 */;

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
) ENGINE=MyISAM AUTO_INCREMENT=11 DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `wf_workflow_step`
--

LOCK TABLES `wf_workflow_step` WRITE;
/*!40000 ALTER TABLE `wf_workflow_step` DISABLE KEYS */;
INSERT INTO `wf_workflow_step` (`id`, `template_id`, `step_order`, `step_name`, `step_name_am`, `approver_role_code`, `is_required`, `min_amount`, `max_amount`, `auto_approve_below`, `sla_hours`, `can_reject`, `notify_on_arrival`, `created_at`) VALUES (1,1,1,'Branch Manager Approval','Branch Manager Approval','M_BRANCH_MANAGER',1,NULL,NULL,NULL,24,1,1,'2026-09-06 17:03:03'),
(2,1,2,'Finance Manager Approval','Finance Manager Approval','M_FINANCE_HEAD',1,NULL,NULL,NULL,48,1,1,'2026-09-06 17:03:03'),
(3,1,3,'Purchase Officer Review','Purchase Officer Review','M_PURCHASING_OFFICER',1,NULL,NULL,NULL,24,1,1,'2026-09-06 17:03:03'),
(4,2,1,'Finance Head','Finance Manager ','M_FINANCE_HEAD',1,NULL,50000.00,NULL,48,1,1,'2026-09-06 17:03:03'),
(5,2,2,'General Manager','General Manager','billzgjt',0,50000.00,NULL,NULL,48,1,1,'2026-09-06 17:03:03'),
(6,3,1,'Branch Manager','Branch Manager','M_BRANCH_MANAGER',1,NULL,NULL,NULL,24,1,1,'2026-09-06 17:03:03'),
(7,4,1,'Store Manager Approval','????? ??? ???','INV_MANAGER',1,NULL,NULL,NULL,24,1,1,'2026-09-06 17:03:03'),
(8,4,2,'Finance Approval','?????? ???','FNC',1,NULL,NULL,NULL,48,1,1,'2026-09-06 17:03:03'),
(9,5,1,'Department Manager Approval','???? ??? ???','INV_MANAGER',1,NULL,NULL,NULL,24,1,1,'2026-09-06 17:03:04'),
(10,3,2,'Finance Head ','Finance Head ','M_FINANCE_HEAD',1,NULL,NULL,NULL,48,1,1,'2026-09-08 12:46:32');
/*!40000 ALTER TABLE `wf_workflow_step` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*M!100616 SET NOTE_VERBOSITY=@OLD_NOTE_VERBOSITY */;

-- Dump completed on 2026-09-17 12:24:22

-- === TIER 2: Depends on Tier 1 ===

-- Table: fnc_billing_account_map
/*M!999999\- enable the sandbox mode */ 
-- MariaDB dump 10.19-11.5.2-MariaDB, for Win64 (AMD64)
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
/*M!100616 SET @OLD_NOTE_VERBOSITY=@@NOTE_VERBOSITY, NOTE_VERBOSITY=0 */;

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
) ENGINE=InnoDB AUTO_INCREMENT=79 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `fnc_billing_account_map`
--

LOCK TABLES `fnc_billing_account_map` WRITE;
/*!40000 ALTER TABLE `fnc_billing_account_map` DISABLE KEYS */;
INSERT INTO `fnc_billing_account_map` (`id`, `mapping_key`, `account_id`, `label`, `created_at`, `updated_at`) VALUES (1,'BP_DR_WATER_CONSUMPTION',2,'DR: የውሃ ፍጆታ ብር (Current Month Water consumption)','2026-08-25 22:00:25','2026-08-25 22:00:25'),
(2,'BP_CR_WATER_CONSUMPTION',17,'CR: የውሃ ፍጆታ ብር (Current Month Water consumption)','2026-08-25 22:00:25','2026-08-25 22:00:25'),
(3,'BP_DR_METER_RENT',3,'DR: ቆጣሪ ኪራይ (Meter Rent)','2026-08-25 22:00:25','2026-08-25 22:00:25'),
(4,'BP_CR_METER_RENT',18,'CR: ቆጣሪ ኪራይ (Meter Rent)','2026-08-25 22:00:25','2026-08-25 22:00:25'),
(5,'BP_DR_ADDITIONAL_CHARGE',4,'DR: ተጨማሪ ክፍያ (Bill Additional Payment)','2026-08-26 06:35:34','2026-08-26 06:35:34'),
(6,'BP_CR_ADDITIONAL_CHARGE',19,'CR: ተጨማሪ ክፍያ (Bill Additional Payment)','2026-08-26 06:35:34','2026-08-26 06:35:34'),
(7,'BP_DR_WUZIF_CONSUMPTION',5,'DR: ውዝፍ ፍጆታ ክፍያ (Arrears Water Consumption)','2026-08-26 06:35:34','2026-08-26 06:35:34'),
(8,'BP_CR_WUZIF_CONSUMPTION',20,'CR: ውዝፍ ፍጆታ ክፍያ (Arrears Water Consumption)','2026-08-26 06:35:34','2026-08-26 06:35:34'),
(9,'BP_DR_WUZIF_METER_RENT',6,'DR: ውዝፍ ቆጣሪ ኪራይ (Arrears Meter rent)','2026-08-26 06:35:34','2026-08-26 06:35:34'),
(10,'BP_CR_WUZIF_METER_RENT',21,'CR: ውዝፍ ቆጣሪ ኪራይ (Arrears Meter rent)','2026-08-26 06:35:34','2026-08-26 06:35:34'),
(11,'BP_DR_WUZIF_ADDITIONAL',7,'DR: ውዝፍ ተጨማሪ ክፍያ (Arrears Bill Additional Payment)','2026-08-26 06:35:34','2026-08-26 06:35:34'),
(12,'BP_CR_WUZIF_ADDITIONAL',22,'CR: ውዝፍ ተጨማሪ ክፍያ (Arrears Bill Additional Payment)','2026-08-26 06:35:34','2026-08-26 06:35:34'),
(13,'BP_DR_PENALTY',8,'DR: ቅጣት (Bill Penalty)','2026-08-26 06:35:34','2026-08-26 06:35:34'),
(14,'BP_CR_PENALTY',23,'CR: ቅጣት (Bill Penalty)','2026-08-26 06:35:34','2026-08-26 06:35:34'),
(15,'BP_DR_CARRIED_FORWARD',9,'DR: የተላለፈ(ነባር) ውዝፍ (Bill Old system Arrears)','2026-08-26 06:35:34','2026-08-26 06:35:34'),
(16,'BP_CR_CARRIED_FORWARD',24,'CR: የተላለፈ(ነባር) ውዝፍ (Bill Old system Arrears)','2026-08-26 06:35:34','2026-08-26 06:35:34'),
(17,'BP_DR_SERVICE_CHARGE',10,'DR: የአገልግሎት ክፍያ (Bill Service Charge)','2026-08-26 06:35:34','2026-08-26 06:35:34'),
(18,'BP_DR_WASTE_CHARGE',11,'DR: የዚህ ወር ደረቅ ቆሻሻ (Dry Wast)','2026-08-26 06:35:34','2026-08-26 06:35:34'),
(19,'BP_CR_WASTE_CHARGE',27,'CR: የዚህ ወር ደረቅ ቆሻሻ (Dry Wast)','2026-08-26 06:35:34','2026-08-26 06:35:34'),
(20,'BP_DR_SCHOOL_FEEDING',12,'DR: የትምህርት ቤት ምገባ (School Feeding)','2026-08-26 06:35:34','2026-08-26 06:35:34'),
(21,'BP_CR_SCHOOL_FEEDING',28,'CR: የትምህርት ቤት ምገባ (School Feeding)','2026-08-26 06:35:34','2026-08-26 06:35:34'),
(22,'BP_DR_WUZIF_SERVICE_CHARGE',13,'DR: ውዝፍ የአገልግሎት ክፍያ (Arrears Bill Service Charge)','2026-08-26 06:35:34','2026-08-26 06:35:34'),
(23,'BP_CR_WUZIF_SERVICE_CHARGE',29,'CR: ውዝፍ የአገልግሎት ክፍያ (Arrears Bill Service Charge)','2026-08-26 06:35:34','2026-08-26 06:35:34'),
(24,'BP_DR_WUZIF_WASTE',14,'DR: ውዝፍ ደረቅ ቆሻሻ (Arrears Dry Wast)','2026-08-26 06:35:34','2026-08-26 06:35:34'),
(25,'BP_CR_WUZIF_WASTE',30,'CR: ውዝፍ ደረቅ ቆሻሻ (Arrears Dry Wast)','2026-08-26 06:35:34','2026-08-26 06:35:34'),
(26,'BP_DR_WUZIF_SCHOOL_FEEDING',15,'DR: ውዝፍ የትምህርት ቤት ምገባ (Arrears School Feeding)','2026-08-26 06:35:34','2026-08-26 06:35:34'),
(27,'BP_CR_WUZIF_SCHOOL_FEEDING',31,'CR: ውዝፍ የትምህርት ቤት ምገባ (Arrears School Feeding)','2026-08-26 06:35:34','2026-08-26 06:35:34'),
(28,'BP_CR_SERVICE_CHARGE',25,'CR: የአገልግሎት ክፍያ (Bill Service Charge)','2026-08-26 06:35:34','2026-08-26 06:35:34'),
(29,'BANK_1',37,'Bank: BANK_1','2026-08-26 18:21:12','2026-08-26 18:21:12'),
(30,'BANK_9',52,'Bank: BANK_9','2026-08-26 18:21:12','2026-08-26 18:21:12'),
(31,'BANK_7',42,'Bank: BANK_7','2026-08-26 18:21:12','2026-08-26 18:21:12'),
(32,'BANK_4',40,'Bank: BANK_4','2026-08-26 18:21:12','2026-08-26 18:21:12'),
(33,'BANK_2',48,'Bank: BANK_2','2026-08-26 18:32:06','2026-08-26 18:32:06'),
(34,'BANK_3',38,'Bank: BANK_3','2026-08-26 18:32:06','2026-08-26 18:32:06'),
(35,'BANK_11',41,'Bank: BANK_11','2026-08-26 18:32:06','2026-08-26 18:32:06'),
(36,'BANK_8',50,'Bank: BANK_8','2026-08-26 18:32:06','2026-08-26 18:32:06'),
(37,'BANK_6',45,'Bank: BANK_6','2026-08-26 18:32:06','2026-08-26 18:32:06'),
(38,'BANK_10',39,'Bank: BANK_10','2026-08-26 18:32:06','2026-08-26 18:32:06'),
(39,'OFFICE_CASH',35,'Office Cash Account (ቢሮ ጥሬ ገንዘብ)','2026-08-26 18:33:03','2026-08-26 18:33:03'),
(40,'PREPAID_ACCOUNT',36,'Prepaid/Credit Account','2026-08-26 18:33:03','2026-08-26 18:33:03'),
(67,'INV_DR_GRN_ASSET',61,'DR: የዕቃ መቀበያ ሰነድ (GRN Stock Intake)','2026-09-13 11:38:05','2026-09-13 11:38:05'),
(68,'INV_CR_GRN_PAYABLE',62,'CR: የዕቃ መቀበያ ሰነድ (GRN Stock Intake)','2026-09-13 11:38:05','2026-09-13 11:38:05'),
(69,'INV_DR_ISSUE_EXPENSE',64,'DR: የዕቃ ወጪ ሰነድ (Store Issue / Dept Consumption)','2026-09-13 11:38:05','2026-09-13 11:38:05'),
(70,'INV_CR_ISSUE_ASSET',61,'CR: የዕቃ ወጪ ሰነድ (Store Issue / Dept Consumption)','2026-09-13 11:38:05','2026-09-13 11:38:05'),
(71,'INV_DR_SALE_COGS',63,'DR: የዕቃ ሽያጭ / ወጪ (Customer Sale & COGS)','2026-09-13 11:38:05','2026-09-13 11:38:05'),
(72,'INV_CR_SALE_ASSET',61,'CR: የዕቃ ሽያጭ / ወጪ (Customer Sale & COGS)','2026-09-13 11:38:05','2026-09-13 11:38:05'),
(73,'INV_DR_ADJUST_GAIN_ASSET',61,'DR: የዕቃ ቆጠራ ትርፍ ማስተካከያ','2026-09-13 11:38:05','2026-09-13 11:38:05'),
(74,'INV_CR_ADJUST_GAIN_REV',65,'CR: የዕቃ ቆጠራ ትርፍ ማስተካከያ','2026-09-13 11:38:05','2026-09-13 11:38:05'),
(75,'INV_DR_ADJUST_LOSS_EXP',66,'DR: የዕቃ ቆጠራ ጉድለት/ብልሽት','2026-09-13 11:38:05','2026-09-13 11:38:05'),
(76,'INV_CR_ADJUST_LOSS_ASSET',61,'CR: የዕቃ ቆጠራ ጉድለት/ብልሽት','2026-09-13 11:38:05','2026-09-13 11:38:05'),
(77,'INV_DR_TRANSFER_ASSET',67,'DR: የዕቃ መጋዘን ዝውውር (Destination)','2026-09-13 11:38:05','2026-09-13 11:38:05'),
(78,'INV_CR_TRANSFER_ASSET',61,'CR: የዕቃ መጋዘን ዝውውር (Source)','2026-09-13 11:38:05','2026-09-13 11:38:05');
/*!40000 ALTER TABLE `fnc_billing_account_map` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*M!100616 SET NOTE_VERBOSITY=@OLD_NOTE_VERBOSITY */;

-- Dump completed on 2026-09-17 12:24:22

-- Table: fnc_budget
/*M!999999\- enable the sandbox mode */ 
-- MariaDB dump 10.19-11.5.2-MariaDB, for Win64 (AMD64)
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
/*M!100616 SET @OLD_NOTE_VERBOSITY=@@NOTE_VERBOSITY, NOTE_VERBOSITY=0 */;

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
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `fnc_budget`
--

LOCK TABLES `fnc_budget` WRITE;
/*!40000 ALTER TABLE `fnc_budget` DISABLE KEYS */;
/*!40000 ALTER TABLE `fnc_budget` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*M!100616 SET NOTE_VERBOSITY=@OLD_NOTE_VERBOSITY */;

-- Dump completed on 2026-09-17 12:24:22

-- Table: fnc_journal_entry
/*M!999999\- enable the sandbox mode */ 
-- MariaDB dump 10.19-11.5.2-MariaDB, for Win64 (AMD64)
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
/*M!100616 SET @OLD_NOTE_VERBOSITY=@@NOTE_VERBOSITY, NOTE_VERBOSITY=0 */;

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
) ENGINE=InnoDB AUTO_INCREMENT=20 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `fnc_journal_entry`
--

LOCK TABLES `fnc_journal_entry` WRITE;
/*!40000 ALTER TABLE `fnc_journal_entry` DISABLE KEYS */;
INSERT INTO `fnc_journal_entry` (`id`, `entry_number`, `entry_date`, `fiscal_year_id`, `reference_number`, `source_type`, `source_id`, `billing_month`, `description`, `status`, `total_debit`, `total_credit`, `posted_by`, `posted_at`, `voided_by`, `voided_at`, `void_reason`, `created_by`, `created_at`, `updated_at`) VALUES (1,'JE-2019-00001','2026-08-31',1,'BILL-PREP-ነሐሴ-2018','BILL_PREP','ነሐሴ, 2018','ነሐሴ, 2018','Bill Preparation — Revenue Recognition — ነሐሴ 2018','VOID',25674.00,25674.00,'reading2','2026-09-01 12:36:16','reading2','2026-09-01 12:38:01','cc','reading2','2026-08-31 17:07:09','2026-09-01 12:38:01'),
(2,'JE-2019-00002','2026-09-01',1,'BILL-PREP-ሐምሌ-2018','BILL_PREP','ሐምሌ, 2018','ሐምሌ, 2018','Bill Preparation — Revenue Recognition — ሐምሌ 2018','POSTED',2318279.00,2318279.00,'reading2','2026-09-01 12:38:53',NULL,NULL,NULL,'reading2','2026-09-01 12:37:04','2026-09-01 12:38:53'),
(3,'JE-2019-00003','2026-09-01',1,'BILL-ሐምሌ-2018-BANK-Bunna Bank','BILL_COLLECTION','ሐምሌ, 2018','ሐምሌ, 2018','Water billing collection — Bank: Bunna Bank — ሐምሌ 2018','POSTED',191095.00,191095.00,'reading2','2026-09-01 12:46:07',NULL,NULL,NULL,'reading2','2026-09-01 12:45:37','2026-09-01 12:46:07'),
(6,'JE-2019-00004','2026-09-01',1,'BILL-ADJ-FT-00187155-1788300922347','BILL_ADJUSTMENT','ሐምሌ, 2018','ሐምሌ, 2018','Bill Adjustment — FT-00187155 — ሐምሌ, 2018','POSTED',780.00,780.00,'reading2','2026-09-01 19:17:41',NULL,NULL,NULL,'reading2','2026-09-01 19:15:22','2026-09-01 19:17:41'),
(7,'JE-2019-00005','2026-09-02',1,'BILL-PREP-SINGLE-FT-00187157-1788375210330','BILL_PREP','ነሐሴ, 2018','ነሐሴ, 2018','Bill Preparation — FT-00187157 — ነሐሴ, 2018','DRAFT',460.00,460.00,NULL,NULL,NULL,NULL,NULL,'reading2','2026-09-02 15:53:30','2026-09-02 15:53:30'),
(8,'JE-2019-00006','2026-09-05',1,'BILL-PREP-ግንቦት-2018','BILL_PREP','ግንቦት, 2018','ግንቦት, 2018','Bill Preparation — Revenue Recognition — ግንቦት 2018','POSTED',2754296.00,2754296.00,'reading2','2026-09-05 10:02:27',NULL,NULL,NULL,'reading2','2026-09-05 09:20:54','2026-09-05 10:02:27'),
(9,'JE-2019-00007','2026-09-05',1,'BILL-PREP-SINGLE-FT-00187158-1788613608511','BILL_PREP','የካቲት, 2018','የካቲት, 2018','Bill Preparation — FT-00187158 — የካቲት, 2018','DRAFT',970.00,970.00,NULL,NULL,NULL,NULL,NULL,'reading2','2026-09-05 10:06:48','2026-09-05 10:06:48'),
(10,'JE-2019-00008','2026-09-05',1,'UNPAID-REV-ሚያዚያ-2018','UNPAID_REVERSAL','ሚያዚያ, 2018','ሚያዚያ, 2018','Unpaid Receivable Reversal — ሚያዚያ 2018','DRAFT',1861026.00,1861026.00,NULL,NULL,NULL,NULL,NULL,'reading2','2026-09-05 10:12:13','2026-09-05 10:12:13'),
(11,'JE-2019-00009','2026-09-05',1,'BILL-PREP-ነሐሴ-2018','BILL_PREP','ነሐሴ, 2018','ነሐሴ, 2018','Bill Preparation — Revenue Recognition — ነሐሴ 2018','DRAFT',26764.00,26764.00,NULL,NULL,NULL,NULL,NULL,'reading2','2026-09-05 10:15:09','2026-09-05 10:15:09'),
(12,'JE-INV-2026-1788813593440','2026-09-07',1,'GRN-2026-00001','INVENTORY_GRN','1',NULL,'Goods Received - GRN-2026-00001 from abc Metere ','POSTED',2300.00,2300.00,'pofficer',NULL,NULL,NULL,NULL,'pofficer','2026-09-07 17:39:53','2026-09-07 17:39:53'),
(13,'JE-INV-2026-1788870998893','2026-09-08',1,'GRN-2026-00001','INVENTORY_GRN','10',NULL,'Goods Received - GRN-2026-00001 from abc Metere ','POSTED',22000.00,22000.00,'pofficer',NULL,NULL,NULL,NULL,'pofficer','2026-09-08 09:36:38','2026-09-08 09:36:38'),
(14,'JE-INV-2026-1789241945776','2026-09-12',1,'ISV-MNT-MNT-2026-00001','INVENTORY_ISSUE','6',NULL,'Sale / Customer Utility Materials - ISV-MNT-MNT-2026-00001 (ወ/ሮ እናኑ ብርሀን)','POSTED',4000.00,4000.00,'reading2','2026-09-12 16:39:05',NULL,NULL,NULL,'reading2','2026-09-12 16:39:05','2026-09-12 16:39:05'),
(15,'JE-INV-2026-1789303838026','2026-09-13',1,'ISV-NLC-NLC-2026-00010','INVENTORY_ISSUE','7',NULL,'Sale / Customer Utility Materials - ISV-NLC-NLC-2026-00010 (ጋሽነት አበጋዝ አሊ)','POSTED',1091.44,1091.44,'3store','2026-09-13 09:50:38',NULL,NULL,NULL,'3store','2026-09-13 09:50:38','2026-09-13 09:50:38'),
(16,'JE-INV-2026-1789307290516','2026-09-13',1,'ISV-MNT-MNT-2026-00003','INVENTORY_ISSUE','8',NULL,'Sale / Customer Utility Materials - ISV-MNT-MNT-2026-00003 (ጋሽነት አበጋዝ አሊ)','POSTED',2481.24,2481.24,'3store','2026-09-13 10:48:10',NULL,NULL,NULL,'3store','2026-09-13 10:48:10','2026-09-13 10:48:10'),
(17,'JE-INV-2026-1789309458300','2026-09-13',1,'ISV-NLC-NLC-2026-00011','INVENTORY_ISSUE','9',NULL,'Sale / Customer Utility Materials - ISV-NLC-NLC-2026-00011 (አብርሀም አሞኘ ብርሀኑ)','POSTED',782.72,782.72,'3store','2026-09-13 11:24:18',NULL,NULL,NULL,'3store','2026-09-13 11:24:18','2026-09-13 11:24:18'),
(18,'JE-INV-2026-1789318858119','2026-09-13',1,'ISV-NLC-NLC-2026-00007','INVENTORY_ISSUE','10',NULL,'Sale / Customer Utility Materials - ISV-NLC-NLC-2026-00007 (test)','POSTED',6400.00,6400.00,'3store','2026-09-13 14:00:58',NULL,NULL,NULL,'3store','2026-09-13 14:00:58','2026-09-13 14:00:58'),
(19,'JE-2019-00010','2026-09-14',1,'BILL-PREP-SINGLE-FT-00187305-1789366577247','BILL_PREP','ሰኔ, 2018','ሰኔ, 2018','Bill Preparation — FT-00187305 — ሰኔ, 2018','DRAFT',3005.00,3005.00,NULL,NULL,NULL,NULL,NULL,'reading2','2026-09-14 03:16:17','2026-09-14 03:16:17');
/*!40000 ALTER TABLE `fnc_journal_entry` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*M!100616 SET NOTE_VERBOSITY=@OLD_NOTE_VERBOSITY */;

-- Dump completed on 2026-09-17 12:24:22

-- Table: fnc_general_ledger
/*M!999999\- enable the sandbox mode */ 
-- MariaDB dump 10.19-11.5.2-MariaDB, for Win64 (AMD64)
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
/*M!100616 SET @OLD_NOTE_VERBOSITY=@@NOTE_VERBOSITY, NOTE_VERBOSITY=0 */;

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
) ENGINE=InnoDB AUTO_INCREMENT=40 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `fnc_general_ledger`
--

LOCK TABLES `fnc_general_ledger` WRITE;
/*!40000 ALTER TABLE `fnc_general_ledger` DISABLE KEYS */;
INSERT INTO `fnc_general_ledger` (`id`, `account_id`, `fiscal_year_id`, `period_month`, `opening_balance`, `total_debit`, `total_credit`, `closing_balance`) VALUES (1,2,1,8,0.00,0.00,0.00,0.00),
(2,17,1,8,0.00,0.00,0.00,0.00),
(3,3,1,8,0.00,0.00,0.00,0.00),
(4,18,1,8,0.00,0.00,0.00,0.00),
(5,11,1,8,0.00,0.00,0.00,0.00),
(6,27,1,8,0.00,0.00,0.00,0.00),
(7,5,1,8,0.00,0.00,0.00,0.00),
(8,20,1,8,0.00,0.00,0.00,0.00),
(9,6,1,8,0.00,0.00,0.00,0.00),
(10,21,1,8,0.00,0.00,0.00,0.00),
(11,7,1,8,0.00,0.00,0.00,0.00),
(12,22,1,8,0.00,0.00,0.00,0.00),
(13,8,1,8,0.00,0.00,0.00,0.00),
(14,23,1,8,0.00,0.00,0.00,0.00),
(15,14,1,8,0.00,0.00,0.00,0.00),
(16,30,1,8,0.00,0.00,0.00,0.00),
(17,9,1,8,0.00,0.00,0.00,0.00),
(18,24,1,8,0.00,0.00,0.00,0.00),
(19,2,1,9,0.00,830970.00,91350.00,739620.00),
(20,17,1,9,0.00,210.00,830970.00,830760.00),
(21,3,1,9,0.00,235740.00,23940.00,211800.00),
(22,18,1,9,0.00,30.00,235740.00,235710.00),
(23,4,1,9,0.00,112949.00,1300.00,111649.00),
(24,19,1,9,0.00,0.00,112949.00,112949.00),
(25,11,1,9,0.00,262710.00,29540.00,233170.00),
(26,27,1,9,0.00,0.00,262710.00,262710.00),
(27,5,1,9,0.00,608983.00,17860.00,591123.00),
(28,20,1,9,0.00,0.00,608983.00,608983.00),
(29,6,1,9,0.00,783013.00,4755.00,778258.00),
(30,21,1,9,0.00,0.00,783013.00,783013.00),
(31,7,1,9,0.00,84694.00,3200.00,81494.00),
(32,22,1,9,0.00,0.00,84694.00,84694.00),
(33,8,1,9,0.00,792200.00,13450.00,778750.00),
(34,23,1,9,0.00,0.00,792200.00,792200.00),
(35,14,1,9,0.00,429800.00,5740.00,424060.00),
(36,30,1,9,0.00,0.00,429800.00,429800.00),
(37,9,1,9,0.00,932056.00,200.00,931856.00),
(38,24,1,9,0.00,0.00,932056.00,932056.00),
(39,48,1,9,0.00,191095.00,0.00,191095.00);
/*!40000 ALTER TABLE `fnc_general_ledger` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*M!100616 SET NOTE_VERBOSITY=@OLD_NOTE_VERBOSITY */;

-- Dump completed on 2026-09-17 12:24:22

-- Table: fnc_opening_balance
/*M!999999\- enable the sandbox mode */ 
-- MariaDB dump 10.19-11.5.2-MariaDB, for Win64 (AMD64)
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
/*M!100616 SET @OLD_NOTE_VERBOSITY=@@NOTE_VERBOSITY, NOTE_VERBOSITY=0 */;

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
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `fnc_opening_balance`
--

LOCK TABLES `fnc_opening_balance` WRITE;
/*!40000 ALTER TABLE `fnc_opening_balance` DISABLE KEYS */;
/*!40000 ALTER TABLE `fnc_opening_balance` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*M!100616 SET NOTE_VERBOSITY=@OLD_NOTE_VERBOSITY */;

-- Dump completed on 2026-09-17 12:24:22

-- Table: hrms_employee_info
/*M!999999\- enable the sandbox mode */ 
-- MariaDB dump 10.19-11.5.2-MariaDB, for Win64 (AMD64)
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
/*M!100616 SET @OLD_NOTE_VERBOSITY=@@NOTE_VERBOSITY, NOTE_VERBOSITY=0 */;

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
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `hrms_employee_info`
--

LOCK TABLES `hrms_employee_info` WRITE;
/*!40000 ALTER TABLE `hrms_employee_info` DISABLE KEYS */;
INSERT INTO `hrms_employee_info` (`id`, `employee_id`, `tin_number`, `fayda_national_id`, `pension_number`, `full_name`, `full_name_am`, `mother_name`, `marital_status`, `disability_status`, `sex`, `date_of_birth`, `nationality`, `blood_group`, `department_id`, `position_id`, `job_grade_id`, `duty_station`, `branchs_id`, `address_city_id`, `address_ketena_id`, `address_streets_id`, `phone_number`, `email`, `emergency_contact_name`, `emergency_contact_phone`, `employment_type`, `employment_status`, `first_employment_date`, `yeteketerubet_ken`, `probation_end_date`, `tureta_yemiwetubet_ken`, `current_salary`, `biometric_pin`, `rfid_card_number`, `primary_bank_name`, `primary_bank_account`, `primary_bank_branch`, `secondary_bank_name`, `secondary_bank_account`, `secondary_bank_branch`, `secondary_payment_purpose`, `employee_photo`, `employee_signature`, `registered_by`, `registered_date`, `modified_by`, `modified_date`, `is_deleted`, `is_salary_defaults_modified`) VALUES (1,'EMP-TEST-001','','','','Abebe Kebede Tesfaye','አበበ ከበደ ተስፋየ','','SINGLE','NONE','MALE','2026-09-09','Ethiopian',NULL,NULL,NULL,NULL,'Head Office',NULL,NULL,NULL,NULL,'','',NULL,NULL,'PERMANENT','ACTIVE',NULL,NULL,NULL,NULL,18500,'1001',NULL,'Commercial Bank of Ethiopia','1000123456789',NULL,'Abay Bank','2000987654321',NULL,'Per Diem & Special Allowances',NULL,NULL,NULL,'2026-09-13 09:47:08',1,'2026-09-13 09:50:09',0,0);
/*!40000 ALTER TABLE `hrms_employee_info` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*M!100616 SET NOTE_VERBOSITY=@OLD_NOTE_VERBOSITY */;

-- Dump completed on 2026-09-17 12:24:22

-- Table: hrms_payroll_account_map
/*M!999999\- enable the sandbox mode */ 
-- MariaDB dump 10.19-11.5.2-MariaDB, for Win64 (AMD64)
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
/*M!100616 SET @OLD_NOTE_VERBOSITY=@@NOTE_VERBOSITY, NOTE_VERBOSITY=0 */;

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
INSERT INTO `hrms_payroll_account_map` (`id`, `mapping_key`, `account_id`, `label`, `label_am`, `entry_type`, `created_at`, `updated_at`) VALUES (1,'HRMS_DR_BASIC_SALARY',69,'Basic Salaries Expense','መሰረታዊ ደመወዝ ወጪ','DEBIT','2026-09-13 11:38:17','2026-09-13 11:38:17'),
(2,'HRMS_DR_OVERTIME',70,'Overtime Pay Expense','የትርፍ ሰዓት ክፍያ ወጪ','DEBIT','2026-09-13 11:38:17','2026-09-13 11:38:17'),
(3,'HRMS_DR_HOUSING_ALLOWANCE',71,'Housing Allowances Expense','የቤት ኪራይ አበል ወጪ','DEBIT','2026-09-13 11:38:17','2026-09-13 11:38:17'),
(4,'HRMS_DR_TRANSPORT_ALLOWANCE',72,'Transport Allowances Expense','የትራንስፖርት አበል ወጪ','DEBIT','2026-09-13 11:38:17','2026-09-13 11:38:17'),
(5,'HRMS_DR_HAZARD_ALLOWANCE',73,'Hazard & Chemical Allowances Expense','የክሎሪንና ኬሚካል አበል ወጪ','DEBIT','2026-09-13 11:38:17','2026-09-13 11:38:17'),
(6,'HRMS_DR_EMPLOYER_PENSION_11',74,'Employer Pension Contribution 11%','የአሰሪው ጡረታ መዋጮ 11% ወጪ','DEBIT','2026-09-13 11:38:17','2026-09-13 11:38:17'),
(7,'HRMS_CR_TAX_PAYABLE',76,'Employment Income Tax Payable (Schedule A)','የሥራ ግብር ተከፋይ','CREDIT','2026-09-13 11:38:17','2026-09-13 11:38:17'),
(8,'HRMS_CR_PENSION_PAYABLE_18',77,'Pension Contribution Payable (18%)','የጡረታ መዋጮ ተከፋይ (18%)','CREDIT','2026-09-13 11:38:17','2026-09-13 11:38:17'),
(9,'HRMS_CR_EDIR_PAYABLE',78,'Staff Association & Edir Payable','የእድርና ብድር ተቀናሽ ተከፋይ','CREDIT','2026-09-13 11:38:17','2026-09-13 11:38:17'),
(10,'HRMS_CR_NET_SALARY_CBE',79,'Net Salaries Payable — Commercial Bank of Ethiopia','የተጣራ ደመወዝ ተከፋይ (ንግድ ባንክ)','CREDIT','2026-09-13 11:38:17','2026-09-13 11:38:17'),
(11,'HRMS_CR_NET_SALARY_ABAY',80,'Net Salaries Payable — Abay Bank','የተጣራ ደመወዝ ተከፋይ (አባይ ባንክ)','CREDIT','2026-09-13 11:38:17','2026-09-13 11:38:17');
/*!40000 ALTER TABLE `hrms_payroll_account_map` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*M!100616 SET NOTE_VERBOSITY=@OLD_NOTE_VERBOSITY */;

-- Dump completed on 2026-09-17 12:24:23

-- Table: inv_item
/*M!999999\- enable the sandbox mode */ 
-- MariaDB dump 10.19-11.5.2-MariaDB, for Win64 (AMD64)
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
/*M!100616 SET @OLD_NOTE_VERBOSITY=@@NOTE_VERBOSITY, NOTE_VERBOSITY=0 */;

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
  `is_active` tinyint(1) NOT NULL DEFAULT 1,
  `deleted` varchar(20) NOT NULL DEFAULT 'No',
  `created_by` varchar(100) DEFAULT NULL,
  `created_at` datetime DEFAULT current_timestamp(),
  `updated_at` datetime DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `item_code` (`item_code`),
  KEY `fk_item_category` (`category_id`),
  KEY `fk_item_group` (`item_group_id`),
  KEY `fk_item_uom` (`unit_of_measure_id`),
  CONSTRAINT `fk_item_category` FOREIGN KEY (`category_id`) REFERENCES `inv_item_category` (`id`),
  CONSTRAINT `fk_item_group` FOREIGN KEY (`item_group_id`) REFERENCES `inv_item_group` (`id`),
  CONSTRAINT `fk_item_uom` FOREIGN KEY (`unit_of_measure_id`) REFERENCES `inv_unit_of_measure` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=18 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `inv_item`
--

LOCK TABLES `inv_item` WRITE;
/*!40000 ALTER TABLE `inv_item` DISABLE KEYS */;
INSERT INTO `inv_item` (`id`, `item_code`, `item_name`, `item_name_am`, `description`, `category_id`, `item_group_id`, `unit_of_measure_id`, `reorder_level`, `reorder_quantity`, `tracking_type`, `item_usage`, `default_unit_cost`, `is_active`, `deleted`, `created_by`, `created_at`, `updated_at`) VALUES (1,'1122-00001','foset','amfoset','',1,NULL,1,0,0,'NONE','BOTH',0.00,1,'No','system','2026-09-06 06:39:28','2026-09-08 15:12:38'),
(2,'1122-00002','meter','ሜትር','',1,2,1,10,50,'NONE','FOR_SALE',0.00,1,'No','reading2','2026-09-06 07:59:45','2026-09-06 07:59:45'),
(3,'1122-00003','HDP pipe','HDP ቱቦ ','',1,3,2,10,50,'NONE','FOR_SALE',0.00,1,'No','admin2','2026-09-08 10:34:37','2026-09-08 10:34:37'),
(4,'PIPE-00002','GI Pipe 1/2\"','የብረት 1/2\"',NULL,1,NULL,2,10,50,'NONE','BOTH',38.00,1,'No',NULL,'2026-09-12 22:16:11','2026-09-12 22:16:11'),
(5,'FIT-00001','Male Adapter 1/2\"','ወንድ አዳፕተር 1/2\"',NULL,1,NULL,1,20,100,'NONE','BOTH',120.00,1,'No',NULL,'2026-09-12 22:16:11','2026-09-12 22:16:11'),
(6,'FIT-00002','Female Adapter 1/2\"','ሴት አዳፕተር 1/2\"',NULL,1,NULL,1,20,100,'NONE','BOTH',28.00,1,'No',NULL,'2026-09-12 22:16:11','2026-09-12 22:16:11'),
(7,'FIT-00003','Union / Saddle 1 1/2\" - 1\"','ዩኒየን /ሳድል ኮኔ 1 1/2\" - 1\"',NULL,1,NULL,1,10,50,'NONE','BOTH',55.00,1,'No',NULL,'2026-09-12 22:16:11','2026-09-12 22:16:11'),
(8,'FIT-00004','Stop Valve 1/2\"','ስቶፕ ቫልቭ/ኮክ 1/2\"',NULL,1,NULL,1,15,60,'NONE','BOTH',52.00,1,'No',NULL,'2026-09-12 22:16:11','2026-09-12 22:16:11'),
(9,'FIT-00005','Gate Valve 1/2\"','ጌት ቫልቭ 1/2\"',NULL,1,NULL,1,15,60,'NONE','BOTH',88.00,1,'No',NULL,'2026-09-12 22:16:11','2026-09-12 22:16:11'),
(10,'FIT-00006','Teflon Tape','ቴፍሎን ቴፕ',NULL,1,NULL,1,50,200,'NONE','BOTH',18.00,1,'No',NULL,'2026-09-12 22:16:11','2026-09-12 22:16:11'),
(11,'FIT-00007','Clamp Saddle','ክላምፕ ሳድል',NULL,1,NULL,1,20,80,'NONE','BOTH',65.00,1,'No',NULL,'2026-09-12 22:16:11','2026-09-12 22:16:11'),
(12,'FIT-00008','Nipple 1/2\"','ኒፕል 1/2\"',NULL,1,NULL,1,30,100,'NONE','BOTH',22.00,1,'No',NULL,'2026-09-12 22:16:11','2026-09-12 22:16:11'),
(13,'FIT-00009','Elbow 1/2\"','ክርን 1/2\"',NULL,1,NULL,1,30,100,'NONE','BOTH',32.00,1,'No',NULL,'2026-09-12 22:16:11','2026-09-12 22:16:11'),
(14,'FIT-00010','Compression Tee 1/2\"','ኮምፕረሽን ቲ 1/2\"',NULL,1,NULL,1,20,80,'NONE','BOTH',14.00,1,'No',NULL,'2026-09-12 22:16:11','2026-09-12 22:16:11'),
(15,'FIT-00011','End Cap 1/2\"','እንዲ ካፕ 1/2\"',NULL,1,NULL,1,20,80,'NONE','BOTH',24.00,1,'No',NULL,'2026-09-12 22:16:11','2026-09-12 22:16:11'),
(16,'FIT-00012','Coupling Reducer 1\" - 1/2\"','ኮፕሊንግ ሪዲውሰር 1\" - 1/2\"',NULL,1,NULL,1,20,80,'NONE','BOTH',62.00,1,'No',NULL,'2026-09-12 22:16:11','2026-09-12 22:16:11'),
(17,'PIPE-00003','GI Pipe Full Length','ባለሙሉ ርዝመት ብረት',NULL,1,NULL,2,5,20,'NONE','BOTH',190.00,1,'No',NULL,'2026-09-12 22:16:11','2026-09-12 22:16:11');
/*!40000 ALTER TABLE `inv_item` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*M!100616 SET NOTE_VERBOSITY=@OLD_NOTE_VERBOSITY */;

-- Dump completed on 2026-09-17 12:24:23

-- Table: inv_store_user
/*M!999999\- enable the sandbox mode */ 
-- MariaDB dump 10.19-11.5.2-MariaDB, for Win64 (AMD64)
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
/*M!100616 SET @OLD_NOTE_VERBOSITY=@@NOTE_VERBOSITY, NOTE_VERBOSITY=0 */;

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
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `inv_store_user`
--

LOCK TABLES `inv_store_user` WRITE;
/*!40000 ALTER TABLE `inv_store_user` DISABLE KEYS */;
INSERT INTO `inv_store_user` (`id`, `store_id`, `user_account_id`, `role_in_store`, `is_primary`, `is_active`, `assigned_by`, `assigned_date`, `notes`, `created_at`, `updated_at`) VALUES (1,2,204,'STORE_KEEPER',1,1,'system','2026-09-09 15:16:53','Branch storekeeper','2026-09-09 15:16:53','2026-09-09 15:16:53'),
(2,1,209,'STORE_KEEPER',1,1,'system','2026-09-09 15:17:02','Main storekeeper','2026-09-09 15:17:02','2026-09-09 15:17:02');
/*!40000 ALTER TABLE `inv_store_user` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*M!100616 SET NOTE_VERBOSITY=@OLD_NOTE_VERBOSITY */;

-- Dump completed on 2026-09-17 12:24:23

-- Table: inv_purchase_requisition
/*M!999999\- enable the sandbox mode */ 
-- MariaDB dump 10.19-11.5.2-MariaDB, for Win64 (AMD64)
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
/*M!100616 SET @OLD_NOTE_VERBOSITY=@@NOTE_VERBOSITY, NOTE_VERBOSITY=0 */;

--
-- Table structure for table `inv_purchase_requisition`
--

DROP TABLE IF EXISTS `inv_purchase_requisition`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `inv_purchase_requisition` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `requisition_number` varchar(50) NOT NULL,
  `store_id` int(11) NOT NULL,
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
  CONSTRAINT `fk_pr_store` FOREIGN KEY (`store_id`) REFERENCES `inv_store` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=10 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `inv_purchase_requisition`
--

LOCK TABLES `inv_purchase_requisition` WRITE;
/*!40000 ALTER TABLE `inv_purchase_requisition` DISABLE KEYS */;
INSERT INTO `inv_purchase_requisition` (`id`, `requisition_number`, `store_id`, `requested_by`, `requested_date`, `status`, `approved_by_l1`, `approved_date_l1`, `approved_by_l2`, `approved_date_l2`, `rejected_by`, `rejected_date`, `rejection_reason`, `remarks`, `total_estimated_amount`, `created_by`, `created_at`, `updated_at`) VALUES (7,'PR-2026-00001',1,'mstore','2026-09-08','CONVERTED_TO_PO','fhead','2026-09-08 12:17:37','pofficer','2026-09-08 12:18:16',NULL,NULL,NULL,'firstREqu',22000.00,'mstore','2026-09-08 12:16:13','2026-09-08 12:19:57'),
(8,'PR-2026-00002',3,'3store','2026-09-14','DRAFT',NULL,NULL,NULL,NULL,NULL,NULL,NULL,'for sale on branch 3',51000.00,'3store','2026-09-14 06:38:02','2026-09-14 06:38:02'),
(9,'PR-2026-00003',3,'3store','2026-09-14','DRAFT',NULL,NULL,NULL,NULL,NULL,NULL,NULL,'for sale',5000.00,'3store','2026-09-14 06:47:18','2026-09-14 06:47:18');
/*!40000 ALTER TABLE `inv_purchase_requisition` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*M!100616 SET NOTE_VERBOSITY=@OLD_NOTE_VERBOSITY */;

-- Dump completed on 2026-09-17 12:24:23

-- Table: wf_workflow_action
/*M!999999\- enable the sandbox mode */ 
-- MariaDB dump 10.19-11.5.2-MariaDB, for Win64 (AMD64)
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
/*M!100616 SET @OLD_NOTE_VERBOSITY=@@NOTE_VERBOSITY, NOTE_VERBOSITY=0 */;

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
) ENGINE=MyISAM AUTO_INCREMENT=26 DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `wf_workflow_action`
--

LOCK TABLES `wf_workflow_action` WRITE;
/*!40000 ALTER TABLE `wf_workflow_action` DISABLE KEYS */;
INSERT INTO `wf_workflow_action` (`id`, `instance_id`, `step_id`, `action`, `acted_by`, `acted_at`, `comments`) VALUES (1,1,1,'APPROVED','mstore','2026-09-07 13:48:34','Approved'),
(2,1,2,'APPROVED','fhead','2026-09-07 13:49:26','Approved'),
(3,1,3,'APPROVED','pofficer','2026-09-07 14:11:39','Approved'),
(4,1,3,'APPROVED','pofficer','2026-09-07 14:12:15','Approved'),
(5,1,3,'APPROVED','pofficer','2026-09-07 14:12:55','Approved'),
(6,1,3,'APPROVED','pofficer','2026-09-07 14:16:31','Approved'),
(7,1,3,'APPROVED','pofficer','2026-09-07 14:18:19','Approved'),
(8,1,3,'APPROVED','pofficer','2026-09-07 14:19:08','Approved'),
(9,1,3,'APPROVED','pofficer','2026-09-07 14:19:19','Approved'),
(10,1,3,'APPROVED','pofficer','2026-09-07 14:26:21','Approved'),
(11,2,1,'APPROVED','badmin','2026-09-07 15:00:28','Approved'),
(12,2,2,'APPROVED','fhead','2026-09-07 15:01:52','Approved'),
(13,2,3,'APPROVED','pofficer','2026-09-07 15:02:24','Approved'),
(14,3,4,'APPROVED','fhead','2026-09-07 17:45:50','Approved'),
(15,4,1,'APPROVED','badmin','2026-09-08 10:37:01','Approved'),
(16,4,2,'APPROVED','fhead','2026-09-08 10:37:46','Approved'),
(17,4,3,'APPROVED','pofficer','2026-09-08 10:38:12','Approved'),
(18,5,4,'APPROVED','fhead','2026-09-08 10:41:03','Approved'),
(19,5,5,'APPROVED','reading2','2026-09-08 10:42:03','Approved'),
(20,6,1,'APPROVED','badmin','2026-09-08 12:16:56','Approved'),
(21,6,2,'APPROVED','fhead','2026-09-08 12:17:37','Approved'),
(22,6,3,'APPROVED','pofficer','2026-09-08 12:18:16','Approved'),
(23,7,4,'APPROVED','fhead','2026-09-08 12:20:49','Approved'),
(24,8,6,'APPROVED','badmin','2026-09-08 14:20:45','Approved'),
(25,8,10,'APPROVED','fhead','2026-09-08 14:22:44','Approved');
/*!40000 ALTER TABLE `wf_workflow_action` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*M!100616 SET NOTE_VERBOSITY=@OLD_NOTE_VERBOSITY */;

-- Dump completed on 2026-09-17 12:24:23

-- Table: wf_workflow_instance
/*M!999999\- enable the sandbox mode */ 
-- MariaDB dump 10.19-11.5.2-MariaDB, for Win64 (AMD64)
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
/*M!100616 SET @OLD_NOTE_VERBOSITY=@@NOTE_VERBOSITY, NOTE_VERBOSITY=0 */;

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
) ENGINE=MyISAM AUTO_INCREMENT=9 DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `wf_workflow_instance`
--

LOCK TABLES `wf_workflow_instance` WRITE;
/*!40000 ALTER TABLE `wf_workflow_instance` DISABLE KEYS */;
INSERT INTO `wf_workflow_instance` (`id`, `template_id`, `document_type`, `document_id`, `document_number`, `current_step_id`, `status`, `initiated_by`, `initiated_at`, `completed_at`, `total_amount`, `branch_id`) VALUES (1,1,'PURCHASE_REQUISITION',4,'PR-2026-00004',NULL,'COMPLETED','mstore','2026-09-07 13:46:35','2026-09-07 17:52:07',148500.00,NULL),
(2,1,'PURCHASE_REQUISITION',5,'PR-2026-00005',NULL,'COMPLETED','mstore','2026-09-07 14:58:56','2026-09-07 15:02:24',2300.00,NULL),
(3,2,'PURCHASE_ORDER',1,'PO-2026-00001',NULL,'COMPLETED','pofficer','2026-09-07 17:39:28','2026-09-07 17:45:50',2645.00,1),
(4,1,'PURCHASE_REQUISITION',6,'PR-2026-00006',NULL,'COMPLETED','mstore','2026-09-08 10:36:07','2026-09-08 10:38:12',100000.00,NULL),
(5,2,'PURCHASE_ORDER',3,'PO-2026-00003',NULL,'COMPLETED','pofficer','2026-09-08 10:40:32','2026-09-08 10:42:03',74750.00,1),
(6,1,'PURCHASE_REQUISITION',7,'PR-2026-00001',NULL,'COMPLETED','mstore','2026-09-08 12:16:16','2026-09-08 12:18:16',22000.00,NULL),
(7,2,'PURCHASE_ORDER',4,'PO-2026-00001',NULL,'COMPLETED','pofficer','2026-09-08 12:20:03','2026-09-08 12:20:49',25300.00,1),
(8,3,'STOCK_TRANSFER',3,'TRF-2026-00001',NULL,'COMPLETED','mstore','2026-09-08 14:19:47','2026-09-08 14:22:44',9800.00,NULL);
/*!40000 ALTER TABLE `wf_workflow_instance` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*M!100616 SET NOTE_VERBOSITY=@OLD_NOTE_VERBOSITY */;

-- Dump completed on 2026-09-17 12:24:23

-- === TIER 3: Depends on Tier 2 ===

-- Table: fnc_budget_line
/*M!999999\- enable the sandbox mode */ 
-- MariaDB dump 10.19-11.5.2-MariaDB, for Win64 (AMD64)
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
/*M!100616 SET @OLD_NOTE_VERBOSITY=@@NOTE_VERBOSITY, NOTE_VERBOSITY=0 */;

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
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `fnc_budget_line`
--

LOCK TABLES `fnc_budget_line` WRITE;
/*!40000 ALTER TABLE `fnc_budget_line` DISABLE KEYS */;
/*!40000 ALTER TABLE `fnc_budget_line` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*M!100616 SET NOTE_VERBOSITY=@OLD_NOTE_VERBOSITY */;

-- Dump completed on 2026-09-17 12:24:23

-- Table: fnc_journal_entry_line
/*M!999999\- enable the sandbox mode */ 
-- MariaDB dump 10.19-11.5.2-MariaDB, for Win64 (AMD64)
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
/*M!100616 SET @OLD_NOTE_VERBOSITY=@@NOTE_VERBOSITY, NOTE_VERBOSITY=0 */;

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
) ENGINE=InnoDB AUTO_INCREMENT=158 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `fnc_journal_entry_line`
--

LOCK TABLES `fnc_journal_entry_line` WRITE;
/*!40000 ALTER TABLE `fnc_journal_entry_line` DISABLE KEYS */;
INSERT INTO `fnc_journal_entry_line` (`id`, `journal_entry_id`, `account_id`, `description`, `debit_amount`, `credit_amount`, `line_order`) VALUES (1,1,2,'የውሃ ፍጆታ ብር — Receivable — ነሐሴ 2018',2270.00,0.00,0),
(2,1,17,'የውሃ ፍጆታ ብር — ነሐሴ 2018',0.00,2270.00,1),
(3,1,3,'ቆጣሪ ኪራይ — Receivable — ነሐሴ 2018',990.00,0.00,2),
(4,1,18,'ቆጣሪ ኪራይ — ነሐሴ 2018',0.00,990.00,3),
(5,1,11,'ደረቅ ቆሻሻ — Receivable — ነሐሴ 2018',140.00,0.00,4),
(6,1,27,'ደረቅ ቆሻሻ — ነሐሴ 2018',0.00,140.00,5),
(7,1,5,'ውዝፍ ፍጆታ ክፍያ — Receivable — ነሐሴ 2018',3500.00,0.00,6),
(8,1,20,'ውዝፍ ፍጆታ ክፍያ — ነሐሴ 2018',0.00,3500.00,7),
(9,1,6,'ውዝፍ ቆጣሪ ኪራይ — Receivable — ነሐሴ 2018',4710.00,0.00,8),
(10,1,21,'ውዝፍ ቆጣሪ ኪራይ — ነሐሴ 2018',0.00,4710.00,9),
(11,1,7,'ውዝፍ ተጨማሪ ክፍያ — Receivable — ነሐሴ 2018',1000.00,0.00,10),
(12,1,22,'ውዝፍ ተጨማሪ ክፍያ — ነሐሴ 2018',0.00,1000.00,11),
(13,1,8,'ቅጣት — Receivable — ነሐሴ 2018',5950.00,0.00,12),
(14,1,23,'ቅጣት — ነሐሴ 2018',0.00,5950.00,13),
(15,1,14,'ውዝፍ ደረቅ ቆሻሻ — Receivable — ነሐሴ 2018',350.00,0.00,14),
(16,1,30,'ውዝፍ ደረቅ ቆሻሻ — ነሐሴ 2018',0.00,350.00,15),
(17,1,9,'የተላለፈ(ነባር) ውዝፍ — Receivable — ነሐሴ 2018',6764.00,0.00,16),
(18,1,24,'የተላለፈ(ነባር) ውዝፍ — ነሐሴ 2018',0.00,6764.00,17),
(19,2,2,'የውሃ ፍጆታ ብር — Receivable — ሐምሌ 2018',376320.00,0.00,0),
(20,2,17,'የውሃ ፍጆታ ብር — ሐምሌ 2018',0.00,376320.00,1),
(21,2,3,'ቆጣሪ ኪራይ — Receivable — ሐምሌ 2018',115260.00,0.00,2),
(22,2,18,'ቆጣሪ ኪራይ — ሐምሌ 2018',0.00,115260.00,3),
(23,2,4,'ተጨማሪ ክፍያ — Receivable — ሐምሌ 2018',12189.00,0.00,4),
(24,2,19,'ተጨማሪ ክፍያ — ሐምሌ 2018',0.00,12189.00,5),
(25,2,11,'ደረቅ ቆሻሻ — Receivable — ሐምሌ 2018',128940.00,0.00,6),
(26,2,27,'ደረቅ ቆሻሻ — ሐምሌ 2018',0.00,128940.00,7),
(27,2,5,'ውዝፍ ፍጆታ ክፍያ — Receivable — ሐምሌ 2018',272529.00,0.00,8),
(28,2,20,'ውዝፍ ፍጆታ ክፍያ — ሐምሌ 2018',0.00,272529.00,9),
(29,2,6,'ውዝፍ ቆጣሪ ኪራይ — Receivable — ሐምሌ 2018',364944.00,0.00,10),
(30,2,21,'ውዝፍ ቆጣሪ ኪራይ — ሐምሌ 2018',0.00,364944.00,11),
(31,2,7,'ውዝፍ ተጨማሪ ክፍያ — Receivable — ሐምሌ 2018',48443.00,0.00,12),
(32,2,22,'ውዝፍ ተጨማሪ ክፍያ — ሐምሌ 2018',0.00,48443.00,13),
(33,2,8,'ቅጣት — Receivable — ሐምሌ 2018',399450.00,0.00,14),
(34,2,23,'ቅጣት — ሐምሌ 2018',0.00,399450.00,15),
(35,2,14,'ውዝፍ ደረቅ ቆሻሻ — Receivable — ሐምሌ 2018',215250.00,0.00,16),
(36,2,30,'ውዝፍ ደረቅ ቆሻሻ — ሐምሌ 2018',0.00,215250.00,17),
(37,2,9,'የተላለፈ(ነባር) ውዝፍ — Receivable — ሐምሌ 2018',384954.00,0.00,18),
(38,2,24,'የተላለፈ(ነባር) ውዝፍ — ሐምሌ 2018',0.00,384954.00,19),
(39,3,48,'Bank: Bunna Bank — Collection ሐምሌ 2018',191095.00,0.00,0),
(40,3,2,'የውሃ ፍጆታ — Receivable — ሐምሌ 2018',0.00,91140.00,1),
(41,3,3,'ቆጣሪ ኪራይ — Receivable — ሐምሌ 2018',0.00,23910.00,2),
(42,3,4,'ተጨማሪ ክፍያ — Receivable — ሐምሌ 2018',0.00,1300.00,3),
(43,3,11,'ደረቅ ቆሻሻ — Receivable — ሐምሌ 2018',0.00,29540.00,4),
(44,3,5,'ውዝፍ ፍጆታ — Receivable — ሐምሌ 2018',0.00,17860.00,5),
(45,3,6,'ውዝፍ ቆጣሪ ኪራይ — Receivable — ሐምሌ 2018',0.00,4755.00,6),
(46,3,7,'ውዝፍ ተጨማሪ — Receivable — ሐምሌ 2018',0.00,3200.00,7),
(47,3,8,'ቅጣት — Receivable — ሐምሌ 2018',0.00,13450.00,8),
(48,3,14,'ውዝፍ ደረቅ ቆሻሻ — Receivable — ሐምሌ 2018',0.00,5740.00,9),
(49,3,9,'የተላለፈ(ነባር) ውዝፍ — Receivable — ሐምሌ 2018',0.00,200.00,10),
(58,6,2,'የውሃ ፍጆታ ብር — Receivable — New Bill FT-00184043',510.00,0.00,0),
(59,6,17,'የውሃ ፍጆታ ብር — Revenue — New Bill FT-00184043',0.00,510.00,1),
(60,6,3,'ቆጣሪ ኪራይ — Receivable — New Bill FT-00184043',30.00,0.00,2),
(61,6,18,'ቆጣሪ ኪራይ — Revenue — New Bill FT-00184043',0.00,30.00,3),
(62,6,17,'የውሃ ፍጆታ ብር — Revenue Reversal — Old Bill FT-00184043',210.00,0.00,4),
(63,6,2,'የውሃ ፍጆታ ብር — Receivable Reversal — Old Bill FT-00184043',0.00,210.00,5),
(64,6,18,'ቆጣሪ ኪራይ — Revenue Reversal — Old Bill FT-00184043',30.00,0.00,6),
(65,6,3,'ቆጣሪ ኪራይ — Receivable Reversal — Old Bill FT-00184043',0.00,30.00,7),
(66,7,2,'የውሃ ፍጆታ ብር — Receivable — New Bill FT-00187157',430.00,0.00,0),
(67,7,17,'የውሃ ፍጆታ ብር — Revenue — New Bill FT-00187157',0.00,430.00,1),
(68,7,3,'ቆጣሪ ኪራይ — Receivable — New Bill FT-00187157',30.00,0.00,2),
(69,7,18,'ቆጣሪ ኪራይ — Revenue — New Bill FT-00187157',0.00,30.00,3),
(70,8,2,'የውሃ ፍጆታ ብር — Receivable — ግንቦት 2018',454140.00,0.00,0),
(71,8,17,'የውሃ ፍጆታ ብር — ግንቦት 2018',0.00,454140.00,1),
(72,8,3,'ቆጣሪ ኪራይ — Receivable — ግንቦት 2018',120450.00,0.00,2),
(73,8,18,'ቆጣሪ ኪራይ — ግንቦት 2018',0.00,120450.00,3),
(74,8,4,'ተጨማሪ ክፍያ — Receivable — ግንቦት 2018',100760.00,0.00,4),
(75,8,19,'ተጨማሪ ክፍያ — ግንቦት 2018',0.00,100760.00,5),
(76,8,11,'ደረቅ ቆሻሻ — Receivable — ግንቦት 2018',133770.00,0.00,6),
(77,8,27,'ደረቅ ቆሻሻ — ግንቦት 2018',0.00,133770.00,7),
(78,8,5,'ውዝፍ ፍጆታ ክፍያ — Receivable — ግንቦት 2018',336454.00,0.00,8),
(79,8,20,'ውዝፍ ፍጆታ ክፍያ — ግንቦት 2018',0.00,336454.00,9),
(80,8,6,'ውዝፍ ቆጣሪ ኪራይ — Receivable — ግንቦት 2018',418069.00,0.00,10),
(81,8,21,'ውዝፍ ቆጣሪ ኪራይ — ግንቦት 2018',0.00,418069.00,11),
(82,8,7,'ውዝፍ ተጨማሪ ክፍያ — Receivable — ግንቦት 2018',36251.00,0.00,12),
(83,8,22,'ውዝፍ ተጨማሪ ክፍያ — ግንቦት 2018',0.00,36251.00,13),
(84,8,8,'ቅጣት — Receivable — ግንቦት 2018',392750.00,0.00,14),
(85,8,23,'ቅጣት — ግንቦት 2018',0.00,392750.00,15),
(86,8,14,'ውዝፍ ደረቅ ቆሻሻ — Receivable — ግንቦት 2018',214550.00,0.00,16),
(87,8,30,'ውዝፍ ደረቅ ቆሻሻ — ግንቦት 2018',0.00,214550.00,17),
(88,8,9,'የተላለፈ(ነባር) ውዝፍ — Receivable — ግንቦት 2018',547102.00,0.00,18),
(89,8,24,'የተላለፈ(ነባር) ውዝፍ — ግንቦት 2018',0.00,547102.00,19),
(90,9,2,'የውሃ ፍጆታ ብር — Receivable — New Bill FT-00187158',910.00,0.00,0),
(91,9,17,'የውሃ ፍጆታ ብር — Revenue — New Bill FT-00187158',0.00,910.00,1),
(92,9,3,'ቆጣሪ ኪራይ — Receivable — New Bill FT-00187158',60.00,0.00,2),
(93,9,18,'ቆጣሪ ኪራይ — Revenue — New Bill FT-00187158',0.00,60.00,3),
(94,10,17,'Unpaid Reversal — የውሃ ፍጆታ ብር — ሚያዚያ 2018',74210.00,0.00,0),
(95,10,2,'Unpaid Reversal — የውሃ ፍጆታ ብር — ሚያዚያ 2018',0.00,74210.00,1),
(96,10,18,'Unpaid Reversal — ቆጣሪ ኪራይ — ሚያዚያ 2018',39710.00,0.00,2),
(97,10,3,'Unpaid Reversal — ቆጣሪ ኪራይ — ሚያዚያ 2018',0.00,39710.00,3),
(98,10,19,'Unpaid Reversal — ተጨማሪ ክፍያ — ሚያዚያ 2018',2000.00,0.00,4),
(99,10,4,'Unpaid Reversal — ተጨማሪ ክፍያ — ሚያዚያ 2018',0.00,2000.00,5),
(100,10,27,'Unpaid Reversal — ደረቅ ቆሻሻ — ሚያዚያ 2018',40460.00,0.00,6),
(101,10,11,'Unpaid Reversal — ደረቅ ቆሻሻ — ሚያዚያ 2018',0.00,40460.00,7),
(102,10,20,'Unpaid Reversal — ውዝፍ ፍጆታ ክፍያ — ሚያዚያ 2018',262244.00,0.00,8),
(103,10,5,'Unpaid Reversal — ውዝፍ ፍጆታ ክፍያ — ሚያዚያ 2018',0.00,262244.00,9),
(104,10,21,'Unpaid Reversal — ውዝፍ ቆጣሪ ኪራይ — ሚያዚያ 2018',378359.00,0.00,10),
(105,10,6,'Unpaid Reversal — ውዝፍ ቆጣሪ ኪራይ — ሚያዚያ 2018',0.00,378359.00,11),
(106,10,22,'Unpaid Reversal — ውዝፍ ተጨማሪ ክፍያ — ሚያዚያ 2018',34251.00,0.00,12),
(107,10,7,'Unpaid Reversal — ውዝፍ ተጨማሪ ክፍያ — ሚያዚያ 2018',0.00,34251.00,13),
(108,10,23,'Unpaid Reversal — ቅጣት — ሚያዚያ 2018',308600.00,0.00,14),
(109,10,8,'Unpaid Reversal — ቅጣት — ሚያዚያ 2018',0.00,308600.00,15),
(110,10,30,'Unpaid Reversal — ውዝፍ ደረቅ ቆሻሻ — ሚያዚያ 2018',174090.00,0.00,16),
(111,10,14,'Unpaid Reversal — ውዝፍ ደረቅ ቆሻሻ — ሚያዚያ 2018',0.00,174090.00,17),
(112,10,24,'Unpaid Reversal — የተላለፈ ውዝፍ — ሚያዚያ 2018',547102.00,0.00,18),
(113,10,9,'Unpaid Reversal — የተላለፈ ውዝፍ — ሚያዚያ 2018',0.00,547102.00,19),
(114,11,2,'የውሃ ፍጆታ ብር — Receivable — ነሐሴ 2018',3300.00,0.00,0),
(115,11,17,'የውሃ ፍጆታ ብር — ነሐሴ 2018',0.00,3300.00,1),
(116,11,3,'ቆጣሪ ኪራይ — Receivable — ነሐሴ 2018',1050.00,0.00,2),
(117,11,18,'ቆጣሪ ኪራይ — ነሐሴ 2018',0.00,1050.00,3),
(118,11,11,'ደረቅ ቆሻሻ — Receivable — ነሐሴ 2018',140.00,0.00,4),
(119,11,27,'ደረቅ ቆሻሻ — ነሐሴ 2018',0.00,140.00,5),
(120,11,5,'ውዝፍ ፍጆታ ክፍያ — Receivable — ነሐሴ 2018',3500.00,0.00,6),
(121,11,20,'ውዝፍ ፍጆታ ክፍያ — ነሐሴ 2018',0.00,3500.00,7),
(122,11,6,'ውዝፍ ቆጣሪ ኪራይ — Receivable — ነሐሴ 2018',4710.00,0.00,8),
(123,11,21,'ውዝፍ ቆጣሪ ኪራይ — ነሐሴ 2018',0.00,4710.00,9),
(124,11,7,'ውዝፍ ተጨማሪ ክፍያ — Receivable — ነሐሴ 2018',1000.00,0.00,10),
(125,11,22,'ውዝፍ ተጨማሪ ክፍያ — ነሐሴ 2018',0.00,1000.00,11),
(126,11,8,'ቅጣት — Receivable — ነሐሴ 2018',5950.00,0.00,12),
(127,11,23,'ቅጣት — ነሐሴ 2018',0.00,5950.00,13),
(128,11,14,'ውዝፍ ደረቅ ቆሻሻ — Receivable — ነሐሴ 2018',350.00,0.00,14),
(129,11,30,'ውዝፍ ደረቅ ቆሻሻ — ነሐሴ 2018',0.00,350.00,15),
(130,11,9,'የተላለፈ(ነባር) ውዝፍ — Receivable — ነሐሴ 2018',6764.00,0.00,16),
(131,11,24,'የተላለፈ(ነባር) ውዝፍ — ነሐሴ 2018',0.00,6764.00,17),
(132,12,37,'Inventory received - GRN-2026-00001',2300.00,0.00,1),
(133,12,27,'Payable to abc Metere ',0.00,2300.00,2),
(134,13,37,'Inventory received - GRN-2026-00001',22000.00,0.00,1),
(135,13,27,'Payable to abc Metere ',0.00,22000.00,2),
(136,14,63,'Sale / Customer Utility Materials - ISV-MNT-MNT-2026-00001',4000.00,0.00,1),
(137,14,61,'Inventory issued - ISV-MNT-MNT-2026-00001',0.00,4000.00,2),
(138,15,63,'Sale / Customer Utility Materials - ISV-NLC-NLC-2026-00010',1091.44,0.00,1),
(139,15,61,'Inventory issued - ISV-NLC-NLC-2026-00010',0.00,1091.44,2),
(140,16,63,'Sale / Customer Utility Materials - ISV-MNT-MNT-2026-00003',2481.24,0.00,1),
(141,16,61,'Inventory issued - ISV-MNT-MNT-2026-00003',0.00,2481.24,2),
(142,17,63,'Sale / Customer Utility Materials - ISV-NLC-NLC-2026-00011',782.72,0.00,1),
(143,17,61,'Inventory issued - ISV-NLC-NLC-2026-00011',0.00,782.72,2),
(144,18,63,'Sale / Customer Utility Materials - ISV-NLC-NLC-2026-00007',6400.00,0.00,1),
(145,18,61,'Inventory issued - ISV-NLC-NLC-2026-00007',0.00,6400.00,2),
(146,19,2,'የውሃ ፍጆታ ብር — Receivable — New Bill FT-00187305',590.00,0.00,0),
(147,19,17,'የውሃ ፍጆታ ብር — Revenue — New Bill FT-00187305',0.00,590.00,1),
(148,19,3,'ቆጣሪ ኪራይ — Receivable — New Bill FT-00187305',30.00,0.00,2),
(149,19,18,'ቆጣሪ ኪራይ — Revenue — New Bill FT-00187305',0.00,30.00,3),
(150,19,6,'ውዝፍ ቆጣሪ ኪራይ — Receivable — New Bill FT-00187305',705.00,0.00,4),
(151,19,21,'ውዝፍ ቆጣሪ ኪራይ — Revenue — New Bill FT-00187305',0.00,705.00,5),
(152,19,8,'ቅጣት — Receivable — New Bill FT-00187305',450.00,0.00,6),
(153,19,23,'ቅጣት — Revenue — New Bill FT-00187305',0.00,450.00,7),
(154,19,14,'ውዝፍ ደረቅ ቆሻሻ — Receivable — New Bill FT-00187305',70.00,0.00,8),
(155,19,30,'ውዝፍ ደረቅ ቆሻሻ — Revenue — New Bill FT-00187305',0.00,70.00,9),
(156,19,9,'የተላለፈ(ነባር) ውዝፍ — Receivable — New Bill FT-00187305',1160.00,0.00,10),
(157,19,24,'የተላለፈ(ነባር) ውዝፍ — Revenue — New Bill FT-00187305',0.00,1160.00,11);
/*!40000 ALTER TABLE `fnc_journal_entry_line` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*M!100616 SET NOTE_VERBOSITY=@OLD_NOTE_VERBOSITY */;

-- Dump completed on 2026-09-17 12:24:23

-- Table: hrms_attendance_records
/*M!999999\- enable the sandbox mode */ 
-- MariaDB dump 10.19-11.5.2-MariaDB, for Win64 (AMD64)
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
/*M!100616 SET @OLD_NOTE_VERBOSITY=@@NOTE_VERBOSITY, NOTE_VERBOSITY=0 */;

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
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*M!100616 SET NOTE_VERBOSITY=@OLD_NOTE_VERBOSITY */;

-- Dump completed on 2026-09-17 12:24:24

-- Table: hrms_employee_chlota
/*M!999999\- enable the sandbox mode */ 
-- MariaDB dump 10.19-11.5.2-MariaDB, for Win64 (AMD64)
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
/*M!100616 SET @OLD_NOTE_VERBOSITY=@@NOTE_VERBOSITY, NOTE_VERBOSITY=0 */;

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
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*M!100616 SET NOTE_VERBOSITY=@OLD_NOTE_VERBOSITY */;

-- Dump completed on 2026-09-17 12:24:24

-- Table: hrms_employee_education
/*M!999999\- enable the sandbox mode */ 
-- MariaDB dump 10.19-11.5.2-MariaDB, for Win64 (AMD64)
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
/*M!100616 SET @OLD_NOTE_VERBOSITY=@@NOTE_VERBOSITY, NOTE_VERBOSITY=0 */;

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
INSERT INTO `hrms_employee_education` (`id`, `hrms_employee_info_id`, `yetmhrt_dereja`, `yetmhrtbet_sm`, `yetmhrt_aynet`, `yetmhrt_dereja_status`, `graduation_year_ec`, `gpa`, `registered_date`, `registered_by`, `modified_date`, `modified_by`, `is_deleted`) VALUES (1,1,'Bachelor\'s Degree / የመጀመሪያ ዲግሪ (BSc/BA)','Arba Minch University (Water Technology Institute)','Hydraulic & Water Resources Engineering','COMPLETED','2014 E.C.',3.75,'2026-09-13 10:26:29',1,'2026-09-13 10:26:29',NULL,0);
/*!40000 ALTER TABLE `hrms_employee_education` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*M!100616 SET NOTE_VERBOSITY=@OLD_NOTE_VERBOSITY */;

-- Dump completed on 2026-09-17 12:24:24

-- Table: hrms_employee_info_photo
/*M!999999\- enable the sandbox mode */ 
-- MariaDB dump 10.19-11.5.2-MariaDB, for Win64 (AMD64)
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
/*M!100616 SET @OLD_NOTE_VERBOSITY=@@NOTE_VERBOSITY, NOTE_VERBOSITY=0 */;

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
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*M!100616 SET NOTE_VERBOSITY=@OLD_NOTE_VERBOSITY */;

-- Dump completed on 2026-09-17 12:24:24

-- Table: hrms_employee_info_salary_defaults
/*M!999999\- enable the sandbox mode */ 
-- MariaDB dump 10.19-11.5.2-MariaDB, for Win64 (AMD64)
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
/*M!100616 SET @OLD_NOTE_VERBOSITY=@@NOTE_VERBOSITY, NOTE_VERBOSITY=0 */;

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
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*M!100616 SET NOTE_VERBOSITY=@OLD_NOTE_VERBOSITY */;

-- Dump completed on 2026-09-17 12:24:24

-- Table: hrms_employee_leave
/*M!999999\- enable the sandbox mode */ 
-- MariaDB dump 10.19-11.5.2-MariaDB, for Win64 (AMD64)
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
/*M!100616 SET @OLD_NOTE_VERBOSITY=@@NOTE_VERBOSITY, NOTE_VERBOSITY=0 */;

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
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*M!100616 SET NOTE_VERBOSITY=@OLD_NOTE_VERBOSITY */;

-- Dump completed on 2026-09-17 12:24:24

-- Table: hrms_employee_ljoch
/*M!999999\- enable the sandbox mode */ 
-- MariaDB dump 10.19-11.5.2-MariaDB, for Win64 (AMD64)
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
/*M!100616 SET @OLD_NOTE_VERBOSITY=@@NOTE_VERBOSITY, NOTE_VERBOSITY=0 */;

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
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*M!100616 SET NOTE_VERBOSITY=@OLD_NOTE_VERBOSITY */;

-- Dump completed on 2026-09-17 12:24:24

-- Table: hrms_employee_more_info
/*M!999999\- enable the sandbox mode */ 
-- MariaDB dump 10.19-11.5.2-MariaDB, for Win64 (AMD64)
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
/*M!100616 SET @OLD_NOTE_VERBOSITY=@@NOTE_VERBOSITY, NOTE_VERBOSITY=0 */;

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
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*M!100616 SET NOTE_VERBOSITY=@OLD_NOTE_VERBOSITY */;

-- Dump completed on 2026-09-17 12:24:24

-- Table: hrms_employee_yesewnet_meglecha
/*M!999999\- enable the sandbox mode */ 
-- MariaDB dump 10.19-11.5.2-MariaDB, for Win64 (AMD64)
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
/*M!100616 SET @OLD_NOTE_VERBOSITY=@@NOTE_VERBOSITY, NOTE_VERBOSITY=0 */;

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
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*M!100616 SET NOTE_VERBOSITY=@OLD_NOTE_VERBOSITY */;

-- Dump completed on 2026-09-17 12:24:24

-- Table: hrms_employee_yeteketerebachew
/*M!999999\- enable the sandbox mode */ 
-- MariaDB dump 10.19-11.5.2-MariaDB, for Win64 (AMD64)
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
/*M!100616 SET @OLD_NOTE_VERBOSITY=@@NOTE_VERBOSITY, NOTE_VERBOSITY=0 */;

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
INSERT INTO `hrms_employee_yeteketerebachew` (`id`, `hrms_employee_info_id`, `organization_name`, `yesra_medeb`, `demewez_meten`, `employeed_from`, `employeed_to`, `reason_for_leaving`, `registered_date`, `registered_by`, `modified_date`, `modified_by`, `is_deleted`) VALUES (1,1,'እናት ባንክ','ደንበኞች አገልግሎት',16000,'2024-01-13','2025-05-13','ስራ ቦታ በመልቀቅ','2026-09-13 15:20:05',1,'2026-09-13 15:20:04',NULL,0);
/*!40000 ALTER TABLE `hrms_employee_yeteketerebachew` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*M!100616 SET NOTE_VERBOSITY=@OLD_NOTE_VERBOSITY */;

-- Dump completed on 2026-09-17 12:24:25

-- Table: hrms_leave_allocations
/*M!999999\- enable the sandbox mode */ 
-- MariaDB dump 10.19-11.5.2-MariaDB, for Win64 (AMD64)
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
/*M!100616 SET @OLD_NOTE_VERBOSITY=@@NOTE_VERBOSITY, NOTE_VERBOSITY=0 */;

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
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*M!100616 SET NOTE_VERBOSITY=@OLD_NOTE_VERBOSITY */;

-- Dump completed on 2026-09-17 12:24:25

-- Table: hrms_payroll_runs
/*M!999999\- enable the sandbox mode */ 
-- MariaDB dump 10.19-11.5.2-MariaDB, for Win64 (AMD64)
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
/*M!100616 SET @OLD_NOTE_VERBOSITY=@@NOTE_VERBOSITY, NOTE_VERBOSITY=0 */;

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
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*M!100616 SET NOTE_VERBOSITY=@OLD_NOTE_VERBOSITY */;

-- Dump completed on 2026-09-17 12:24:25

-- Table: hrms_shift_assignments
/*M!999999\- enable the sandbox mode */ 
-- MariaDB dump 10.19-11.5.2-MariaDB, for Win64 (AMD64)
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
/*M!100616 SET @OLD_NOTE_VERBOSITY=@@NOTE_VERBOSITY, NOTE_VERBOSITY=0 */;

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
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*M!100616 SET NOTE_VERBOSITY=@OLD_NOTE_VERBOSITY */;

-- Dump completed on 2026-09-17 12:24:25

-- Table: inv_serial_tracking
/*M!999999\- enable the sandbox mode */ 
-- MariaDB dump 10.19-11.5.2-MariaDB, for Win64 (AMD64)
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
/*M!100616 SET @OLD_NOTE_VERBOSITY=@@NOTE_VERBOSITY, NOTE_VERBOSITY=0 */;

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
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `inv_serial_tracking`
--

LOCK TABLES `inv_serial_tracking` WRITE;
/*!40000 ALTER TABLE `inv_serial_tracking` DISABLE KEYS */;
/*!40000 ALTER TABLE `inv_serial_tracking` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*M!100616 SET NOTE_VERBOSITY=@OLD_NOTE_VERBOSITY */;

-- Dump completed on 2026-09-17 12:24:25

-- Table: inv_item_store_stock
/*M!999999\- enable the sandbox mode */ 
-- MariaDB dump 10.19-11.5.2-MariaDB, for Win64 (AMD64)
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
/*M!100616 SET @OLD_NOTE_VERBOSITY=@@NOTE_VERBOSITY, NOTE_VERBOSITY=0 */;

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
) ENGINE=InnoDB AUTO_INCREMENT=76 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `inv_item_store_stock`
--

LOCK TABLES `inv_item_store_stock` WRITE;
/*!40000 ALTER TABLE `inv_item_store_stock` DISABLE KEYS */;
INSERT INTO `inv_item_store_stock` (`id`, `item_id`, `store_id`, `quantity_on_hand`, `quantity_reserved`, `quantity_on_order`, `weighted_avg_cost`, `last_count_date`, `last_count_quantity`, `created_at`, `updated_at`) VALUES (9,3,1,7.0000,0.0000,0.0000,600.0000,NULL,NULL,'2026-09-08 12:36:38','2026-09-08 14:50:09'),
(10,2,1,5.0000,0.0000,0.0000,800.0000,NULL,NULL,'2026-09-08 12:36:38','2026-09-12 19:39:05'),
(11,3,2,3.0000,0.0000,0.0000,600.0000,NULL,NULL,'2026-09-08 14:52:16','2026-09-08 14:52:16'),
(12,2,2,10.0000,0.0000,0.0000,800.0000,NULL,NULL,'2026-09-08 14:52:16','2026-09-08 14:52:16'),
(13,1,1,100.0000,0.0000,0.0000,0.0000,NULL,NULL,'2026-09-12 22:16:42','2026-09-12 22:16:42'),
(14,1,2,100.0000,0.0000,0.0000,0.0000,NULL,NULL,'2026-09-12 22:16:42','2026-09-12 22:16:42'),
(15,1,3,100.0000,0.0000,0.0000,0.0000,NULL,NULL,'2026-09-12 22:16:42','2026-09-12 22:16:42'),
(16,2,3,92.0000,0.0000,0.0000,0.0000,NULL,NULL,'2026-09-12 22:16:42','2026-09-13 17:00:58'),
(17,3,3,85.0000,0.0000,0.0000,0.0000,NULL,NULL,'2026-09-12 22:16:42','2026-09-13 14:24:18'),
(18,4,1,100.0000,0.0000,0.0000,38.0000,NULL,NULL,'2026-09-12 22:16:42','2026-09-12 22:16:42'),
(19,4,2,100.0000,0.0000,0.0000,38.0000,NULL,NULL,'2026-09-12 22:16:42','2026-09-12 22:16:42'),
(20,4,3,94.0000,0.0000,0.0000,38.0000,NULL,NULL,'2026-09-12 22:16:42','2026-09-13 14:24:18'),
(21,5,1,100.0000,0.0000,0.0000,120.0000,NULL,NULL,'2026-09-12 22:16:42','2026-09-12 22:16:42'),
(22,5,2,100.0000,0.0000,0.0000,120.0000,NULL,NULL,'2026-09-12 22:16:42','2026-09-12 22:16:42'),
(23,5,3,81.0000,0.0000,0.0000,120.0000,NULL,NULL,'2026-09-12 22:16:42','2026-09-13 14:24:18'),
(24,6,1,100.0000,0.0000,0.0000,28.0000,NULL,NULL,'2026-09-12 22:16:42','2026-09-12 22:16:42'),
(25,6,2,100.0000,0.0000,0.0000,28.0000,NULL,NULL,'2026-09-12 22:16:42','2026-09-12 22:16:42'),
(26,6,3,98.0000,0.0000,0.0000,28.0000,NULL,NULL,'2026-09-12 22:16:42','2026-09-13 12:50:37'),
(27,7,1,100.0000,0.0000,0.0000,55.0000,NULL,NULL,'2026-09-12 22:16:42','2026-09-12 22:16:42'),
(28,7,2,100.0000,0.0000,0.0000,55.0000,NULL,NULL,'2026-09-12 22:16:42','2026-09-12 22:16:42'),
(29,7,3,92.0000,0.0000,0.0000,55.0000,NULL,NULL,'2026-09-12 22:16:42','2026-09-13 14:24:18'),
(30,8,1,100.0000,0.0000,0.0000,52.0000,NULL,NULL,'2026-09-12 22:16:42','2026-09-12 22:16:42'),
(31,8,2,100.0000,0.0000,0.0000,52.0000,NULL,NULL,'2026-09-12 22:16:42','2026-09-12 22:16:42'),
(32,8,3,100.0000,0.0000,0.0000,52.0000,NULL,NULL,'2026-09-12 22:16:42','2026-09-12 22:16:42'),
(33,9,1,100.0000,0.0000,0.0000,88.0000,NULL,NULL,'2026-09-12 22:16:42','2026-09-12 22:16:42'),
(34,9,2,100.0000,0.0000,0.0000,88.0000,NULL,NULL,'2026-09-12 22:16:42','2026-09-12 22:16:42'),
(35,9,3,99.0000,0.0000,0.0000,88.0000,NULL,NULL,'2026-09-12 22:16:42','2026-09-13 12:50:37'),
(36,10,1,100.0000,0.0000,0.0000,18.0000,NULL,NULL,'2026-09-12 22:16:42','2026-09-12 22:16:42'),
(37,10,2,100.0000,0.0000,0.0000,18.0000,NULL,NULL,'2026-09-12 22:16:42','2026-09-12 22:16:42'),
(38,10,3,100.0000,0.0000,0.0000,18.0000,NULL,NULL,'2026-09-12 22:16:42','2026-09-12 22:16:42'),
(39,11,1,100.0000,0.0000,0.0000,65.0000,NULL,NULL,'2026-09-12 22:16:42','2026-09-12 22:16:42'),
(40,11,2,100.0000,0.0000,0.0000,65.0000,NULL,NULL,'2026-09-12 22:16:42','2026-09-12 22:16:42'),
(41,11,3,91.0000,0.0000,0.0000,65.0000,NULL,NULL,'2026-09-12 22:16:42','2026-09-13 13:48:10'),
(42,12,1,100.0000,0.0000,0.0000,22.0000,NULL,NULL,'2026-09-12 22:16:42','2026-09-12 22:16:42'),
(43,12,2,100.0000,0.0000,0.0000,22.0000,NULL,NULL,'2026-09-12 22:16:42','2026-09-12 22:16:42'),
(44,12,3,98.0000,0.0000,0.0000,22.0000,NULL,NULL,'2026-09-12 22:16:42','2026-09-13 12:50:38'),
(45,13,1,100.0000,0.0000,0.0000,32.0000,NULL,NULL,'2026-09-12 22:16:42','2026-09-12 22:16:42'),
(46,13,2,100.0000,0.0000,0.0000,32.0000,NULL,NULL,'2026-09-12 22:16:42','2026-09-12 22:16:42'),
(47,13,3,100.0000,0.0000,0.0000,32.0000,NULL,NULL,'2026-09-12 22:16:42','2026-09-12 22:16:42'),
(48,14,1,100.0000,0.0000,0.0000,14.0000,NULL,NULL,'2026-09-12 22:16:42','2026-09-12 22:16:42'),
(49,14,2,100.0000,0.0000,0.0000,14.0000,NULL,NULL,'2026-09-12 22:16:42','2026-09-12 22:16:42'),
(50,14,3,96.0000,0.0000,0.0000,14.0000,NULL,NULL,'2026-09-12 22:16:42','2026-09-13 13:48:10'),
(51,15,1,100.0000,0.0000,0.0000,24.0000,NULL,NULL,'2026-09-12 22:16:42','2026-09-12 22:16:42'),
(52,15,2,100.0000,0.0000,0.0000,24.0000,NULL,NULL,'2026-09-12 22:16:42','2026-09-12 22:16:42'),
(53,15,3,98.0000,0.0000,0.0000,24.0000,NULL,NULL,'2026-09-12 22:16:42','2026-09-13 12:50:37'),
(54,16,1,100.0000,0.0000,0.0000,62.0000,NULL,NULL,'2026-09-12 22:16:42','2026-09-12 22:16:42'),
(55,16,2,100.0000,0.0000,0.0000,62.0000,NULL,NULL,'2026-09-12 22:16:42','2026-09-12 22:16:42'),
(56,16,3,100.0000,0.0000,0.0000,62.0000,NULL,NULL,'2026-09-12 22:16:42','2026-09-12 22:16:42'),
(57,17,1,100.0000,0.0000,0.0000,190.0000,NULL,NULL,'2026-09-12 22:16:42','2026-09-12 22:16:42'),
(58,17,2,100.0000,0.0000,0.0000,190.0000,NULL,NULL,'2026-09-12 22:16:42','2026-09-12 22:16:42'),
(59,17,3,100.0000,0.0000,0.0000,190.0000,NULL,NULL,'2026-09-12 22:16:42','2026-09-12 22:16:42');
/*!40000 ALTER TABLE `inv_item_store_stock` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*M!100616 SET NOTE_VERBOSITY=@OLD_NOTE_VERBOSITY */;

-- Dump completed on 2026-09-17 12:24:25

-- Table: inv_purchase_order
/*M!999999\- enable the sandbox mode */ 
-- MariaDB dump 10.19-11.5.2-MariaDB, for Win64 (AMD64)
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
/*M!100616 SET @OLD_NOTE_VERBOSITY=@@NOTE_VERBOSITY, NOTE_VERBOSITY=0 */;

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
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `inv_purchase_order`
--

LOCK TABLES `inv_purchase_order` WRITE;
/*!40000 ALTER TABLE `inv_purchase_order` DISABLE KEYS */;
INSERT INTO `inv_purchase_order` (`id`, `po_number`, `requisition_id`, `supplier_id`, `store_id`, `order_date`, `expected_delivery_date`, `status`, `approved_by_l1`, `approved_date_l1`, `approved_by_l2`, `approved_date_l2`, `subtotal`, `vat_rate`, `vat_amount`, `grand_total`, `payment_terms`, `delivery_terms`, `remarks`, `created_by`, `created_at`, `updated_at`) VALUES (4,'PO-2026-00001',7,1,1,'2026-09-08',NULL,'FULLY_RECEIVED',NULL,NULL,'fhead','2026-09-08 12:20:49',22000.00,15.00,3300.00,25300.00,'Net 30 Days','Delivered to Store (DDP)','Converted from PR #PR-2026-00001: firstREqu','pofficer','2026-09-08 12:19:57','2026-09-08 12:36:39');
/*!40000 ALTER TABLE `inv_purchase_order` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*M!100616 SET NOTE_VERBOSITY=@OLD_NOTE_VERBOSITY */;

-- Dump completed on 2026-09-17 12:24:25

-- Table: inv_purchase_requisition_line
/*M!999999\- enable the sandbox mode */ 
-- MariaDB dump 10.19-11.5.2-MariaDB, for Win64 (AMD64)
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
/*M!100616 SET @OLD_NOTE_VERBOSITY=@@NOTE_VERBOSITY, NOTE_VERBOSITY=0 */;

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
) ENGINE=InnoDB AUTO_INCREMENT=17 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `inv_purchase_requisition_line`
--

LOCK TABLES `inv_purchase_requisition_line` WRITE;
/*!40000 ALTER TABLE `inv_purchase_requisition_line` DISABLE KEYS */;
INSERT INTO `inv_purchase_requisition_line` (`id`, `requisition_id`, `item_id`, `requested_quantity`, `approved_quantity`, `estimated_unit_cost`, `estimated_total`, `purpose`, `line_order`) VALUES (11,7,3,10.0000,10.0000,600.0000,6000.00,'',1),
(12,7,2,20.0000,20.0000,800.0000,16000.00,'',2),
(13,8,2,10.0000,NULL,1000.0000,10000.00,'',1),
(14,8,3,20.0000,NULL,2000.0000,40000.00,'',2),
(15,8,5,10.0000,NULL,100.0000,1000.00,'',3),
(16,9,15,10.0000,NULL,500.0000,5000.00,'',1);
/*!40000 ALTER TABLE `inv_purchase_requisition_line` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*M!100616 SET NOTE_VERBOSITY=@OLD_NOTE_VERBOSITY */;

-- Dump completed on 2026-09-17 12:24:26

-- Table: inv_stock_adjustment
/*M!999999\- enable the sandbox mode */ 
-- MariaDB dump 10.19-11.5.2-MariaDB, for Win64 (AMD64)
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
/*M!100616 SET @OLD_NOTE_VERBOSITY=@@NOTE_VERBOSITY, NOTE_VERBOSITY=0 */;

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
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `inv_stock_adjustment`
--

LOCK TABLES `inv_stock_adjustment` WRITE;
/*!40000 ALTER TABLE `inv_stock_adjustment` DISABLE KEYS */;
/*!40000 ALTER TABLE `inv_stock_adjustment` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*M!100616 SET NOTE_VERBOSITY=@OLD_NOTE_VERBOSITY */;

-- Dump completed on 2026-09-17 12:24:26

-- Table: inv_stock_transfer
/*M!999999\- enable the sandbox mode */ 
-- MariaDB dump 10.19-11.5.2-MariaDB, for Win64 (AMD64)
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
/*M!100616 SET @OLD_NOTE_VERBOSITY=@@NOTE_VERBOSITY, NOTE_VERBOSITY=0 */;

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
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `inv_stock_transfer`
--

LOCK TABLES `inv_stock_transfer` WRITE;
/*!40000 ALTER TABLE `inv_stock_transfer` DISABLE KEYS */;
INSERT INTO `inv_stock_transfer` (`id`, `transfer_number`, `from_store_id`, `to_store_id`, `transfer_date`, `status`, `requested_by`, `approved_by`, `approved_date`, `shipped_by`, `shipped_date`, `received_by`, `received_date`, `total_amount`, `remarks`, `waybill_number`, `vehicle_plate`, `driver_name`, `journal_entry_id`, `created_by`, `created_at`, `updated_at`) VALUES (3,'TRF-2026-00001',1,2,'2026-09-08','RECEIVED','mstore','fhead','2026-09-08 14:22:44','mostore','2026-09-08 14:50:09','mostore','2026-09-08 14:52:16',9800.00,'store transfer 11','777','3-36475b','alemu kebede',NULL,'mstore','2026-09-08 14:18:40','2026-09-08 14:52:16');
/*!40000 ALTER TABLE `inv_stock_transfer` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*M!100616 SET NOTE_VERBOSITY=@OLD_NOTE_VERBOSITY */;

-- Dump completed on 2026-09-17 12:24:26

-- Table: inv_issue_voucher
/*M!999999\- enable the sandbox mode */ 
-- MariaDB dump 10.19-11.5.2-MariaDB, for Win64 (AMD64)
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
/*M!100616 SET @OLD_NOTE_VERBOSITY=@@NOTE_VERBOSITY, NOTE_VERBOSITY=0 */;

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
  PRIMARY KEY (`id`),
  UNIQUE KEY `voucher_number` (`voucher_number`),
  KEY `fk_iv_store` (`store_id`),
  KEY `fk_iv_journal` (`journal_entry_id`),
  KEY `idx_iv_status` (`status`),
  CONSTRAINT `fk_iv_journal` FOREIGN KEY (`journal_entry_id`) REFERENCES `fnc_journal_entry` (`id`),
  CONSTRAINT `fk_iv_store` FOREIGN KEY (`store_id`) REFERENCES `inv_store` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=11 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `inv_issue_voucher`
--

LOCK TABLES `inv_issue_voucher` WRITE;
/*!40000 ALTER TABLE `inv_issue_voucher` DISABLE KEYS */;
INSERT INTO `inv_issue_voucher` (`id`, `voucher_number`, `store_id`, `issue_type`, `issued_to`, `department`, `issued_date`, `status`, `approved_by`, `approved_date`, `issued_by`, `total_amount`, `journal_entry_id`, `remarks`, `created_by`, `created_at`, `updated_at`) VALUES (1,'ISV-NLC-NLC-2026-00002',1,'SALE','አመለወርቅ ተካ ባህሩ','Customer Service / New Line','2026-09-09','ISSUED','admin2','2026-09-09 19:38:09','admin2',35.36,NULL,'Materials issued for New Water Line Connection: NLC-2026-00002',NULL,'2026-09-09 19:38:09','2026-09-09 19:38:09'),
(2,'ISV-NLC-NLC-2026-00003',1,'SALE','ከበደ ወሰደ መጣ','Customer Service / New Line','2026-09-10','ISSUED','mstore','2026-09-10 05:17:06','mstore',157.00,NULL,'Materials issued for New Water Line Connection: NLC-2026-00003',NULL,'2026-09-10 05:17:06','2026-09-10 05:17:06'),
(3,'ISV-NLC-NLC-2026-00005',1,'SALE','meseret tadele kebede','Customer Service / New Line','2026-09-10','ISSUED','mstore','2026-09-10 18:28:25','mstore',7360.00,NULL,'Materials issued for New Water Line Connection: NLC-2026-00005',NULL,'2026-09-10 18:28:25','2026-09-10 18:28:25'),
(4,'ISV-NLC-NLC-2026-00006',2,'SALE','አበበ አድማሱ ያሲን','Customer Service / New Line','2026-09-11','ISSUED','mstore','2026-09-11 10:03:15','mstore',9200.00,NULL,'Materials issued for New Water Line Connection: NLC-2026-00006',NULL,'2026-09-11 10:03:15','2026-09-11 10:03:15'),
(5,'ISV-MNT-MNT-2026-00002',2,'SALE','አቶ ወርቁ ሀይሌ','Maintenance Service / Customer Care','2026-09-12','ISSUED','mstore','2026-09-12 17:50:39','mstore',1400.00,NULL,'Materials issued for Maintenance Request: MNT-2026-00002',NULL,'2026-09-12 17:50:39','2026-09-12 17:50:39'),
(6,'ISV-MNT-MNT-2026-00001',1,'SALE','ወ/ሮ እናኑ ብርሀን','Maintenance Service / Customer Care','2026-09-12','ISSUED','reading2','2026-09-12 19:39:05','reading2',4000.00,14,'Materials issued for Maintenance Request: MNT-2026-00001',NULL,'2026-09-12 19:39:05','2026-09-12 19:39:05'),
(7,'ISV-NLC-NLC-2026-00010',3,'SALE','ጋሽነት አበጋዝ አሊ','Customer Service / New Line','2026-09-13','ISSUED','3store','2026-09-13 12:50:37','3store',1091.44,15,'kkkkk',NULL,'2026-09-13 12:50:37','2026-09-13 12:50:38'),
(8,'ISV-MNT-MNT-2026-00003',3,'SALE','ጋሽነት አበጋዝ አሊ','Maintenance Service / Customer Care','2026-09-13','ISSUED','3store','2026-09-13 13:48:10','3store',2481.24,16,'Materials issued for Maintenance Request: MNT-2026-00003',NULL,'2026-09-13 13:48:10','2026-09-13 13:48:10'),
(9,'ISV-NLC-NLC-2026-00011',3,'SALE','አብርሀም አሞኘ ብርሀኑ','Customer Service / New Line','2026-09-13','ISSUED','3store','2026-09-13 14:24:18','3store',782.72,17,'Materials issued for New Water Line Connection: NLC-2026-00011',NULL,'2026-09-13 14:24:18','2026-09-13 14:24:18'),
(10,'ISV-NLC-NLC-2026-00007',3,'SALE','test','Customer Service / New Line','2026-09-13','ISSUED','3store','2026-09-13 17:00:57','3store',6400.00,18,'Materials issued for New Water Line Connection: NLC-2026-00007',NULL,'2026-09-13 17:00:58','2026-09-13 17:00:58');
/*!40000 ALTER TABLE `inv_issue_voucher` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*M!100616 SET NOTE_VERBOSITY=@OLD_NOTE_VERBOSITY */;

-- Dump completed on 2026-09-17 12:24:26

-- Table: inv_goods_received_note
/*M!999999\- enable the sandbox mode */ 
-- MariaDB dump 10.19-11.5.2-MariaDB, for Win64 (AMD64)
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
/*M!100616 SET @OLD_NOTE_VERBOSITY=@@NOTE_VERBOSITY, NOTE_VERBOSITY=0 */;

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
) ENGINE=InnoDB AUTO_INCREMENT=11 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `inv_goods_received_note`
--

LOCK TABLES `inv_goods_received_note` WRITE;
/*!40000 ALTER TABLE `inv_goods_received_note` DISABLE KEYS */;
INSERT INTO `inv_goods_received_note` (`id`, `grn_number`, `purchase_order_id`, `store_id`, `supplier_id`, `received_date`, `received_by`, `status`, `supplier_invoice_number`, `remarks`, `total_amount`, `journal_entry_id`, `created_by`, `created_at`, `updated_at`) VALUES (10,'GRN-2026-00001',4,1,1,'2026-09-08','pofficer','CONFIRMED','5556','Goods received against PO PO-2026-00001',22000.00,13,'pofficer','2026-09-08 12:26:01','2026-09-08 12:36:39');
/*!40000 ALTER TABLE `inv_goods_received_note` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*M!100616 SET NOTE_VERBOSITY=@OLD_NOTE_VERBOSITY */;

-- Dump completed on 2026-09-17 12:24:26

-- Table: custom_common_material
/*M!999999\- enable the sandbox mode */ 
-- MariaDB dump 10.19-11.5.2-MariaDB, for Win64 (AMD64)
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
/*M!100616 SET @OLD_NOTE_VERBOSITY=@@NOTE_VERBOSITY, NOTE_VERBOSITY=0 */;

--
-- Table structure for table `custom_common_material`
--

DROP TABLE IF EXISTS `custom_common_material`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `custom_common_material` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `material_code` varchar(50) NOT NULL,
  `material_name` varchar(200) NOT NULL,
  `material_name_am` varchar(200) NOT NULL,
  `unit_of_measure` varchar(50) NOT NULL DEFAULT 'በቁጥር',
  `inv_item_id` bigint(20) DEFAULT NULL,
  `default_unit_price` decimal(15,2) NOT NULL DEFAULT 0.00,
  `display_order` int(11) NOT NULL DEFAULT 0,
  `is_active` tinyint(1) NOT NULL DEFAULT 1,
  `created_at` datetime DEFAULT current_timestamp(),
  `updated_at` datetime DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `material_code` (`material_code`),
  KEY `inv_item_id` (`inv_item_id`),
  CONSTRAINT `custom_common_material_ibfk_1` FOREIGN KEY (`inv_item_id`) REFERENCES `inv_item` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=18 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `custom_common_material`
--

LOCK TABLES `custom_common_material` WRITE;
/*!40000 ALTER TABLE `custom_common_material` DISABLE KEYS */;
INSERT INTO `custom_common_material` (`id`, `material_code`, `material_name`, `material_name_am`, `unit_of_measure`, `inv_item_id`, `default_unit_price`, `display_order`, `is_active`, `created_at`, `updated_at`) VALUES (1,'MAT_HDPE_HALF','HDPE Pipe 1/2\"','ቢ.ባ. ኤች.ዲ.ፒ. 1/2\"','ሜትር',3,35.36,1,1,'2026-09-09 16:08:39','2026-09-12 22:16:42'),
(2,'MAT_PIPE_HALF','GI Pipe 1/2\"','ቧንቧ 1/2\"','በቁጥር',4,44.08,2,1,'2026-09-09 16:08:39','2026-09-12 22:16:42'),
(3,'MAT_MALE_ADAPT_HALF','Male Adapter 1/2\"','ሜል አዳፕተር 1/2\"','በቁጥር',5,149.50,3,1,'2026-09-09 16:08:39','2026-09-12 22:16:42'),
(4,'MAT_FEM_ADAPT_HALF','Female Adapter 1/2\"','ፊሜል አዳፕተር 1/2\"','በቁጥር',5,35.00,4,1,'2026-09-09 16:08:39','2026-09-12 22:16:42'),
(5,'MAT_UNION_SADDLE','Union / Saddle 1 1/2\" - 1\"','ዩኒየን /ሲግናል ሳድል 1 1/2\" - 1\"','በቁጥር',7,69.00,5,1,'2026-09-09 16:08:39','2026-09-12 22:16:42'),
(6,'MAT_FEM_THREAD_HALF','Female Threaded 1/2\"','ፊሜል ትሬዴት 1/2\"','በቁጥር',6,60.00,6,1,'2026-09-09 16:08:39','2026-09-12 22:17:56'),
(7,'MAT_COMP_TEE_HALF','Compression Tee 1/2\"','ኮምፕሬሽን ቲ 1/2\"','በቁጥር',14,17.00,7,1,'2026-09-09 16:08:39','2026-09-12 22:16:42'),
(8,'MAT_END_CAP_HALF','End Cap 1/2\"','ኤንድ ካፕ 1/2\"','በቁጥር',15,29.80,8,1,'2026-09-09 16:08:39','2026-09-12 22:16:42'),
(9,'MAT_STOP_VALVE_HALF','Stop Valve 1/2\"','እስቶፕ ቆልፍ/ቫልቭ 1/2\"','በቁጥር',8,66.00,9,1,'2026-09-09 16:08:39','2026-09-12 22:16:42'),
(10,'MAT_REDUCER_1_HALF','Coupling Reducer 1\" - 1/2\"','ካፕሊንግ ሬዲዩሰር 1\" - 1/2\"','በቁጥር',16,80.99,10,1,'2026-09-09 16:08:39','2026-09-12 22:16:42'),
(11,'MAT_TEFLON_TAPE','Teflon Tape','ቴፍሎን ቴፕ','በቁጥር',10,25.00,11,1,'2026-09-09 16:08:39','2026-09-12 22:16:42'),
(12,'MAT_WATER_METER_HALF','Water Meter 1/2\"','የውሃ ቆጣሪ 1/2\"','በቁጥር',2,1200.00,12,1,'2026-09-09 16:08:39','2026-09-12 22:16:42'),
(13,'MAT_CLAMP_SADDLE','Clamp Saddle','ክላምፕ ሳድል','በቁጥር',11,85.00,13,1,'2026-09-09 16:08:39','2026-09-12 22:16:42'),
(14,'MAT_GATE_VALVE_HALF','Gate Valve 1/2\"','ጌት ቫልቭ 1/2\"','በቁጥር',9,110.00,14,1,'2026-09-09 16:08:39','2026-09-12 22:16:42'),
(15,'MAT_NIPPLE_HALF','Nipple 1/2\"','ኒፕል 1/2\"','በቁጥር',12,30.00,15,1,'2026-09-09 16:08:39','2026-09-12 22:16:42'),
(16,'MAT_ELBOW_HALF','Elbow 1/2\"','ኤልቦ 1/2\"','በቁጥር',13,45.00,16,1,'2026-09-09 16:08:39','2026-09-12 22:16:42'),
(17,'MAT_GI_PIPE_FULL','GI Pipe Full Length','ጋልቫናይዝድ ፓይፕ','በቁጥር',4,250.00,17,1,'2026-09-09 16:08:39','2026-09-12 22:16:42');
/*!40000 ALTER TABLE `custom_common_material` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*M!100616 SET NOTE_VERBOSITY=@OLD_NOTE_VERBOSITY */;

-- Dump completed on 2026-09-17 12:24:26

-- Table: custom_maintenance_common_material
/*M!999999\- enable the sandbox mode */ 
-- MariaDB dump 10.19-11.5.2-MariaDB, for Win64 (AMD64)
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
/*M!100616 SET @OLD_NOTE_VERBOSITY=@@NOTE_VERBOSITY, NOTE_VERBOSITY=0 */;

--
-- Table structure for table `custom_maintenance_common_material`
--

DROP TABLE IF EXISTS `custom_maintenance_common_material`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `custom_maintenance_common_material` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `maintenance_type_id` bigint(20) NOT NULL,
  `material_code` varchar(50) NOT NULL,
  `material_name` varchar(200) NOT NULL,
  `material_name_am` varchar(200) NOT NULL,
  `unit_of_measure` varchar(50) NOT NULL DEFAULT 'በቁጥር',
  `inv_item_id` bigint(20) DEFAULT NULL,
  `default_unit_price` decimal(15,2) NOT NULL DEFAULT 0.00,
  `display_order` int(11) NOT NULL DEFAULT 0,
  `is_active` tinyint(1) NOT NULL DEFAULT 1,
  `created_at` datetime DEFAULT current_timestamp(),
  `updated_at` datetime DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `idx_cmm_type` (`maintenance_type_id`),
  CONSTRAINT `fk_cmm_type` FOREIGN KEY (`maintenance_type_id`) REFERENCES `custom_maintenance_type` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=33 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `custom_maintenance_common_material`
--

LOCK TABLES `custom_maintenance_common_material` WRITE;
/*!40000 ALTER TABLE `custom_maintenance_common_material` DISABLE KEYS */;
INSERT INTO `custom_maintenance_common_material` (`id`, `maintenance_type_id`, `material_code`, `material_name`, `material_name_am`, `unit_of_measure`, `inv_item_id`, `default_unit_price`, `display_order`, `is_active`, `created_at`, `updated_at`) VALUES (1,1,'PL_HDPE_HALF','HDPE Pipe 1/2\"','ቢ.ባ. ኤች.ዲ.ፒ. 1/2\"','ሜትር',3,35.36,1,1,'2026-09-11 23:29:34','2026-09-12 22:16:42'),
(2,1,'PL_MALE_ADAPT','Male Adapter 1/2\"','ወንድ አዳፕተር 1/2\"','በቁጥር',5,149.50,2,1,'2026-09-11 23:29:34','2026-09-12 22:16:42'),
(3,1,'PL_FEM_ADAPT','Female Adapter 1/2\"','ሴት አዳፕተር 1/2\"','በቁጥር',5,35.00,3,1,'2026-09-11 23:29:34','2026-09-12 22:16:42'),
(4,1,'PL_COMP_TEE','Compression Tee 1/2\"','ኮምፕሬሽን ቲ 1/2\"','በቁጥር',14,17.00,4,1,'2026-09-11 23:29:34','2026-09-12 22:16:42'),
(5,1,'PL_CLAMP_SADDLE','Clamp Saddle','ክላምፕ ሳድል','በቁጥር',11,85.00,5,1,'2026-09-11 23:29:34','2026-09-12 22:16:42'),
(6,1,'PL_TEFLON_TAPE','Teflon Tape','ቴፍሎን ቴፕ','በቁጥር',10,25.00,6,1,'2026-09-11 23:29:34','2026-09-12 22:16:42'),
(7,1,'PL_ELBOW_HALF','Elbow 1/2\"','ኤልቦ 1/2\"','በቁጥር',13,45.00,7,1,'2026-09-11 23:29:34','2026-09-12 22:16:42'),
(8,1,'PL_NIPPLE_HALF','Nipple 1/2\"','ኒፕል 1/2\"','በቁጥር',12,30.00,8,1,'2026-09-11 23:29:34','2026-09-12 22:16:42'),
(9,2,'MR_WATER_METER','Water Meter 1/2\"','የውሃ ቆጣሪ 1/2\"','በቁጥር',2,1200.00,1,1,'2026-09-11 23:29:34','2026-09-12 22:16:42'),
(10,2,'MR_STOP_VALVE','Stop Valve 1/2\"','ስቶፕ ቫልቭ/ኮክ 1/2\"','በቁጥር',8,66.00,2,1,'2026-09-11 23:29:34','2026-09-12 22:16:42'),
(11,2,'MR_GATE_VALVE','Gate Valve 1/2\"','ጌት ቫልቭ 1/2\"','በቁጥር',9,110.00,3,1,'2026-09-11 23:29:34','2026-09-12 22:16:42'),
(12,2,'MR_NIPPLE_HALF','Nipple 1/2\"','ኒፕል 1/2\"','በቁጥር',12,30.00,4,1,'2026-09-11 23:29:34','2026-09-12 22:16:42'),
(13,2,'MR_MALE_ADAPT','Male Adapter 1/2\"','ወንድ አዳፕተር 1/2\"','በቁጥር',5,149.50,5,1,'2026-09-11 23:29:34','2026-09-12 22:16:42'),
(14,2,'MR_FEM_ADAPT','Female Adapter 1/2\"','ሴት አዳፕተር 1/2\"','በቁጥር',5,35.00,6,1,'2026-09-11 23:29:34','2026-09-12 22:16:42'),
(15,2,'MR_TEFLON_TAPE','Teflon Tape','ቴፍሎን ቴፕ','በቁጥር',10,25.00,7,1,'2026-09-11 23:29:34','2026-09-12 22:16:42'),
(16,3,'GV_GATE_VALVE','Gate Valve 1/2\"','ጌት ቫልቭ 1/2\"','በቁጥር',9,110.00,1,1,'2026-09-11 23:29:34','2026-09-12 22:16:42'),
(17,3,'GV_STOP_VALVE','Stop Valve 1/2\"','ስቶፕ ቫልቭ/ኮክ 1/2\"','በቁጥር',8,66.00,2,1,'2026-09-11 23:29:34','2026-09-12 22:16:42'),
(18,3,'GV_NIPPLE_HALF','Nipple 1/2\"','ኒፕል 1/2\"','በቁጥር',12,30.00,3,1,'2026-09-11 23:29:34','2026-09-12 22:16:42'),
(19,3,'GV_UNION_SADDLE','Union / Saddle 1 1/2\" - 1\"','ዩኒየን /ሳድል ክላም 1 1/2\" - 1\"','በቁጥር',7,69.00,4,1,'2026-09-11 23:29:34','2026-09-12 22:16:42'),
(20,3,'GV_TEFLON_TAPE','Teflon Tape','ቴፍሎን ቴፕ','በቁጥር',10,25.00,5,1,'2026-09-11 23:29:34','2026-09-12 22:16:42'),
(21,4,'LB_GI_PIPE_FULL','GI Pipe Full Length','ጋልቫናይዝድ ቧንቧ','በቁጥር',4,250.00,1,1,'2026-09-11 23:29:34','2026-09-12 22:16:42'),
(22,4,'LB_HDPE_HALF','HDPE Pipe 1/2\"','ቢ.ባ. ኤች.ዲ.ፒ. 1/2\"','ሜትር',3,35.36,2,1,'2026-09-11 23:29:34','2026-09-12 22:16:42'),
(23,4,'LB_COMP_TEE','Compression Tee 1/2\"','ኮምፕሬሽን ቲ 1/2\"','በቁጥር',14,17.00,3,1,'2026-09-11 23:29:34','2026-09-12 22:16:42'),
(24,4,'LB_CLAMP_SADDLE','Clamp Saddle','ክላምፕ ሳድል','በቁጥር',11,85.00,4,1,'2026-09-11 23:29:34','2026-09-12 22:16:42'),
(25,4,'LB_REDUCER','Coupling Reducer 1\" - 1/2\"','ካፕሊንግ ሬዲዩሰር 1\" - 1/2\"','በቁጥር',16,80.99,5,1,'2026-09-11 23:29:34','2026-09-12 22:16:42'),
(26,4,'LB_END_CAP','End Cap 1/2\"','ኤንድ ካፕ 1/2\"','በቁጥር',15,29.80,6,1,'2026-09-11 23:29:34','2026-09-12 22:16:42'),
(27,5,'OM_HDPE_HALF','HDPE Pipe 1/2\"','ቢ.ባ. ኤች.ዲ.ፒ. 1/2\"','ሜትር',3,35.36,1,1,'2026-09-11 23:29:34','2026-09-12 22:16:42'),
(28,5,'OM_GI_PIPE_HALF','GI Pipe 1/2\"','ቧንቧ 1/2\"','በቁጥር',4,44.08,2,1,'2026-09-11 23:29:34','2026-09-12 22:16:42'),
(29,5,'OM_MALE_ADAPT','Male Adapter 1/2\"','ወንድ አዳፕተር 1/2\"','በቁጥር',5,149.50,3,1,'2026-09-11 23:29:34','2026-09-12 22:16:42'),
(30,5,'OM_WATER_METER','Water Meter 1/2\"','የውሃ ቆጣሪ 1/2\"','በቁጥር',2,1200.00,4,1,'2026-09-11 23:29:34','2026-09-12 22:16:42'),
(31,5,'OM_GATE_VALVE','Gate Valve 1/2\"','ጌት ቫልቭ 1/2\"','በቁጥር',9,110.00,5,1,'2026-09-11 23:29:34','2026-09-12 22:16:42'),
(32,5,'OM_TEFLON_TAPE','Teflon Tape','ቴፍሎን ቴፕ','በቁጥር',10,25.00,6,1,'2026-09-11 23:29:34','2026-09-12 22:16:42');
/*!40000 ALTER TABLE `custom_maintenance_common_material` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*M!100616 SET NOTE_VERBOSITY=@OLD_NOTE_VERBOSITY */;

-- Dump completed on 2026-09-17 12:24:26

-- Table: custom_maintenance_request
/*M!999999\- enable the sandbox mode */ 
-- MariaDB dump 10.19-11.5.2-MariaDB, for Win64 (AMD64)
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
/*M!100616 SET @OLD_NOTE_VERBOSITY=@@NOTE_VERBOSITY, NOTE_VERBOSITY=0 */;

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
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `custom_maintenance_request`
--

LOCK TABLES `custom_maintenance_request` WRITE;
/*!40000 ALTER TABLE `custom_maintenance_request` DISABLE KEYS */;
INSERT INTO `custom_maintenance_request` (`id`, `request_number`, `customer_id`, `maintenance_type_id`, `customer_full_name`, `customer_full_name_eng`, `phone_number`, `national_id_number`, `house_number`, `account_number`, `meter_number`, `branch_id`, `kebele_id`, `ketena_id`, `customer_type_id`, `address_description`, `problem_description`, `status`, `survey_plumber_id`, `survey_assigned_date`, `survey_plumber_notes`, `materials_utility_total`, `materials_outside_total`, `service_charge_percent`, `service_charge_amount`, `transport_charge_percent`, `transport_charge_amount`, `additional_fees_total`, `total_payable_amount`, `is_paid`, `payment_reference_number`, `payment_receipt_number`, `payment_approved_by`, `payment_approved_date`, `inv_issue_voucher_id`, `materials_collected_date`, `storekeeper_username`, `maintenance_plumber_id`, `maintenance_assigned_date`, `maintenance_completed_date`, `maintenance_notes`, `maintenance_approved_by`, `final_meter_reading`, `registered_by`, `created_at`, `updated_at`) VALUES (1,'MNT-2026-00001',12,2,'ወ/ሮ እናኑ ብርሀን','Enanu Birihan','0995190589',NULL,NULL,'200012','0',1,2,12,2120,NULL,'change metere','MATERIALS_COLLECTED',214,'2026-09-11 21:14:51','',4000.00,785.00,55.00,2631.75,25.00,1000.00,175.00,7806.75,1,'fjdf','erer','reading2','2026-09-11 21:16:34',6,'2026-09-12 19:39:05','reading2',NULL,NULL,NULL,NULL,NULL,NULL,'reading2','2026-09-11 21:14:38','2026-09-12 19:39:05'),
(2,'MNT-2026-00002',1,1,'አቶ ወርቁ ሀይሌ','Worku Hailie2','0928859396',NULL,NULL,'200001','0',6,2,12,2120,NULL,'change lov','MAINTENANCE_COMPLETED',213,'2026-09-12 17:44:06','',1400.00,1172.50,55.00,1414.88,25.00,350.00,175.00,3339.88,1,'ret','gnsd','gebe','2026-09-12 17:48:54',5,'2026-09-12 17:50:39','mstore',215,'2026-09-12 17:51:44','2026-09-12 17:52:16','gg','techn',1010,'customers','2026-09-12 17:37:29','2026-09-12 17:52:16'),
(3,'MNT-2026-00003',3340,1,'ጋሽነት አበጋዝ አሊ','Gashit Abegaz Ali','+251947577300',NULL,NULL,'103336','566666',7,1,1,2138,'አሻራ ትምህርት ቤት ጎን','የቧንቧ ፍሳሽ','MAINTENANCE_COMPLETED',218,'2026-09-13 13:02:44','',2481.24,0.00,55.00,1364.68,25.00,620.31,175.00,4641.23,1,NULL,'ንግድ ባንክ','3gebe','2026-09-13 13:47:25',8,'2026-09-13 13:48:10','3store',218,'2026-09-13 13:48:46','2026-09-13 13:49:25','ጥገናው ተከናውኗል','techn2',52,'custom2','2026-09-13 13:00:57','2026-09-13 13:49:25'),
(4,'MNT-2026-00004',3339,2,'333rrr','hdhdhd djdfj','+251987541236',NULL,NULL,'203335','784oi',7,2,12,2138,NULL,'መቆራረጥ','SURVEY_IN_PROGRESS',218,'2026-09-13 13:45:30',NULL,0.00,0.00,55.00,0.00,25.00,0.00,0.00,0.00,0,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'custom2','2026-09-13 13:44:17','2026-09-13 13:45:30');
/*!40000 ALTER TABLE `custom_maintenance_request` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*M!100616 SET NOTE_VERBOSITY=@OLD_NOTE_VERBOSITY */;

-- Dump completed on 2026-09-17 12:24:26

-- === TIER 4: Depends on Tier 3 ===

-- Table: hrms_salary_calculated
/*M!999999\- enable the sandbox mode */ 
-- MariaDB dump 10.19-11.5.2-MariaDB, for Win64 (AMD64)
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
/*M!100616 SET @OLD_NOTE_VERBOSITY=@@NOTE_VERBOSITY, NOTE_VERBOSITY=0 */;

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
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*M!100616 SET NOTE_VERBOSITY=@OLD_NOTE_VERBOSITY */;

-- Dump completed on 2026-09-17 12:24:27

-- Table: inv_purchase_order_line
/*M!999999\- enable the sandbox mode */ 
-- MariaDB dump 10.19-11.5.2-MariaDB, for Win64 (AMD64)
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
/*M!100616 SET @OLD_NOTE_VERBOSITY=@@NOTE_VERBOSITY, NOTE_VERBOSITY=0 */;

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
  `line_order` int(11) NOT NULL DEFAULT 0,
  PRIMARY KEY (`id`),
  KEY `fk_pol_po` (`purchase_order_id`),
  KEY `fk_pol_item` (`item_id`),
  CONSTRAINT `fk_pol_item` FOREIGN KEY (`item_id`) REFERENCES `inv_item` (`id`),
  CONSTRAINT `fk_pol_po` FOREIGN KEY (`purchase_order_id`) REFERENCES `inv_purchase_order` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `inv_purchase_order_line`
--

LOCK TABLES `inv_purchase_order_line` WRITE;
/*!40000 ALTER TABLE `inv_purchase_order_line` DISABLE KEYS */;
INSERT INTO `inv_purchase_order_line` (`id`, `purchase_order_id`, `item_id`, `ordered_quantity`, `received_quantity`, `unit_price`, `total_price`, `line_order`) VALUES (6,4,3,10.0000,10.0000,600.0000,6000.00,1),
(7,4,2,20.0000,20.0000,800.0000,16000.00,2);
/*!40000 ALTER TABLE `inv_purchase_order_line` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*M!100616 SET NOTE_VERBOSITY=@OLD_NOTE_VERBOSITY */;

-- Dump completed on 2026-09-17 12:24:27

-- Table: inv_stock_adjustment_line
/*M!999999\- enable the sandbox mode */ 
-- MariaDB dump 10.19-11.5.2-MariaDB, for Win64 (AMD64)
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
/*M!100616 SET @OLD_NOTE_VERBOSITY=@@NOTE_VERBOSITY, NOTE_VERBOSITY=0 */;

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
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `inv_stock_adjustment_line`
--

LOCK TABLES `inv_stock_adjustment_line` WRITE;
/*!40000 ALTER TABLE `inv_stock_adjustment_line` DISABLE KEYS */;
/*!40000 ALTER TABLE `inv_stock_adjustment_line` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*M!100616 SET NOTE_VERBOSITY=@OLD_NOTE_VERBOSITY */;

-- Dump completed on 2026-09-17 12:24:27

-- Table: inv_stock_transaction
/*M!999999\- enable the sandbox mode */ 
-- MariaDB dump 10.19-11.5.2-MariaDB, for Win64 (AMD64)
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
/*M!100616 SET @OLD_NOTE_VERBOSITY=@@NOTE_VERBOSITY, NOTE_VERBOSITY=0 */;

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
) ENGINE=InnoDB AUTO_INCREMENT=43 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `inv_stock_transaction`
--

LOCK TABLES `inv_stock_transaction` WRITE;
/*!40000 ALTER TABLE `inv_stock_transaction` DISABLE KEYS */;
INSERT INTO `inv_stock_transaction` (`id`, `transaction_number`, `item_id`, `store_id`, `transaction_type`, `quantity`, `unit_cost`, `total_cost`, `reference_type`, `reference_id`, `balance_before`, `balance_after`, `serial_tracking_id`, `remarks`, `transaction_date`, `created_by`, `created_at`) VALUES (9,'TXN-2026-000001',3,1,'RECEIVE',10.0000,600.0000,6000.00,'GRN',10,0.0000,10.0000,NULL,NULL,'2026-09-08','pofficer','2026-09-08 12:36:38'),
(10,'TXN-2026-000002',2,1,'RECEIVE',20.0000,800.0000,16000.00,'GRN',10,0.0000,20.0000,NULL,NULL,'2026-09-08','pofficer','2026-09-08 12:36:38'),
(12,'TXN-2026-000003',3,1,'TRANSFER_OUT',3.0000,600.0000,1800.00,'TRANSFER',3,10.0000,7.0000,NULL,NULL,'2026-09-08','mostore','2026-09-08 14:50:09'),
(13,'TXN-2026-000004',2,1,'TRANSFER_OUT',10.0000,800.0000,8000.00,'TRANSFER',3,20.0000,10.0000,NULL,NULL,'2026-09-08','mostore','2026-09-08 14:50:09'),
(14,'TXN-2026-000005',3,2,'RECEIVE',3.0000,600.0000,1800.00,'TRANSFER',3,0.0000,3.0000,NULL,NULL,'2026-09-08','mostore','2026-09-08 14:52:16'),
(15,'TXN-2026-000006',2,2,'RECEIVE',10.0000,800.0000,8000.00,'TRANSFER',3,0.0000,10.0000,NULL,NULL,'2026-09-08','mostore','2026-09-08 14:52:16'),
(16,'TXN-2026-000007',2,1,'ISSUE_SALE',5.0000,800.0000,4000.00,'CUSTOMER_MAINTENANCE',1,10.0000,5.0000,NULL,NULL,'2026-09-12','reading2','2026-09-12 19:39:05'),
(23,'TXN-2026-000008',3,3,'ISSUE_SALE',4.0000,35.3600,141.44,'NEW_LINE_CONNECTION',10,100.0000,96.0000,NULL,NULL,'2026-09-13','3store','2026-09-13 12:50:37'),
(24,'TXN-2026-000009',4,3,'ISSUE_SALE',2.0000,38.0000,76.00,'NEW_LINE_CONNECTION',10,100.0000,98.0000,NULL,NULL,'2026-09-13','3store','2026-09-13 12:50:37'),
(25,'TXN-2026-000010',5,3,'ISSUE_SALE',2.0000,120.0000,240.00,'NEW_LINE_CONNECTION',10,100.0000,98.0000,NULL,NULL,'2026-09-13','3store','2026-09-13 12:50:37'),
(26,'TXN-2026-000011',5,3,'ISSUE_SALE',2.0000,120.0000,240.00,'NEW_LINE_CONNECTION',10,98.0000,96.0000,NULL,NULL,'2026-09-13','3store','2026-09-13 12:50:37'),
(27,'TXN-2026-000012',6,3,'ISSUE_SALE',2.0000,28.0000,56.00,'NEW_LINE_CONNECTION',10,100.0000,98.0000,NULL,NULL,'2026-09-13','3store','2026-09-13 12:50:37'),
(28,'TXN-2026-000013',14,3,'ISSUE_SALE',2.0000,14.0000,28.00,'NEW_LINE_CONNECTION',10,100.0000,98.0000,NULL,NULL,'2026-09-13','3store','2026-09-13 12:50:37'),
(29,'TXN-2026-000014',15,3,'ISSUE_SALE',2.0000,24.0000,48.00,'NEW_LINE_CONNECTION',10,100.0000,98.0000,NULL,NULL,'2026-09-13','3store','2026-09-13 12:50:37'),
(30,'TXN-2026-000015',11,3,'ISSUE_SALE',2.0000,65.0000,130.00,'NEW_LINE_CONNECTION',10,100.0000,98.0000,NULL,NULL,'2026-09-13','3store','2026-09-13 12:50:37'),
(31,'TXN-2026-000016',9,3,'ISSUE_SALE',1.0000,88.0000,88.00,'NEW_LINE_CONNECTION',10,100.0000,99.0000,NULL,NULL,'2026-09-13','3store','2026-09-13 12:50:37'),
(32,'TXN-2026-000017',12,3,'ISSUE_SALE',2.0000,22.0000,44.00,'NEW_LINE_CONNECTION',10,100.0000,98.0000,NULL,NULL,'2026-09-13','3store','2026-09-13 12:50:37'),
(33,'TXN-2026-000018',3,3,'ISSUE_SALE',9.0000,35.3600,318.24,'CUSTOMER_MAINTENANCE',3,96.0000,87.0000,NULL,NULL,'2026-09-13','3store','2026-09-13 13:48:10'),
(34,'TXN-2026-000019',5,3,'ISSUE_SALE',8.0000,120.0000,960.00,'CUSTOMER_MAINTENANCE',3,96.0000,88.0000,NULL,NULL,'2026-09-13','3store','2026-09-13 13:48:10'),
(35,'TXN-2026-000020',5,3,'ISSUE_SALE',6.0000,120.0000,720.00,'CUSTOMER_MAINTENANCE',3,88.0000,82.0000,NULL,NULL,'2026-09-13','3store','2026-09-13 13:48:10'),
(36,'TXN-2026-000021',14,3,'ISSUE_SALE',2.0000,14.0000,28.00,'CUSTOMER_MAINTENANCE',3,98.0000,96.0000,NULL,NULL,'2026-09-13','3store','2026-09-13 13:48:10'),
(37,'TXN-2026-000022',11,3,'ISSUE_SALE',7.0000,65.0000,455.00,'CUSTOMER_MAINTENANCE',3,98.0000,91.0000,NULL,NULL,'2026-09-13','3store','2026-09-13 13:48:10'),
(38,'TXN-2026-000023',3,3,'ISSUE_SALE',2.0000,35.3600,70.72,'NEW_LINE_CONNECTION',11,87.0000,85.0000,NULL,NULL,'2026-09-13','3store','2026-09-13 14:24:18'),
(39,'TXN-2026-000024',4,3,'ISSUE_SALE',4.0000,38.0000,152.00,'NEW_LINE_CONNECTION',11,98.0000,94.0000,NULL,NULL,'2026-09-13','3store','2026-09-13 14:24:18'),
(40,'TXN-2026-000025',5,3,'ISSUE_SALE',1.0000,120.0000,120.00,'NEW_LINE_CONNECTION',11,82.0000,81.0000,NULL,NULL,'2026-09-13','3store','2026-09-13 14:24:18'),
(41,'TXN-2026-000026',7,3,'ISSUE_SALE',8.0000,55.0000,440.00,'NEW_LINE_CONNECTION',11,100.0000,92.0000,NULL,NULL,'2026-09-13','3store','2026-09-13 14:24:18'),
(42,'TXN-2026-000027',2,3,'ISSUE_SALE',8.0000,800.0000,6400.00,'NEW_LINE_CONNECTION',7,100.0000,92.0000,NULL,NULL,'2026-09-13','3store','2026-09-13 17:00:58');
/*!40000 ALTER TABLE `inv_stock_transaction` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*M!100616 SET NOTE_VERBOSITY=@OLD_NOTE_VERBOSITY */;

-- Dump completed on 2026-09-17 12:24:27

-- Table: inv_stock_transfer_line
/*M!999999\- enable the sandbox mode */ 
-- MariaDB dump 10.19-11.5.2-MariaDB, for Win64 (AMD64)
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
/*M!100616 SET @OLD_NOTE_VERBOSITY=@@NOTE_VERBOSITY, NOTE_VERBOSITY=0 */;

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
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `inv_stock_transfer_line`
--

LOCK TABLES `inv_stock_transfer_line` WRITE;
/*!40000 ALTER TABLE `inv_stock_transfer_line` DISABLE KEYS */;
INSERT INTO `inv_stock_transfer_line` (`id`, `transfer_id`, `item_id`, `quantity`, `unit_cost`, `total_cost`, `serial_tracking_id`, `received_quantity`, `line_order`) VALUES (5,3,3,3.0000,600.0000,1800.00,NULL,NULL,1),
(6,3,2,10.0000,800.0000,8000.00,NULL,NULL,2);
/*!40000 ALTER TABLE `inv_stock_transfer_line` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*M!100616 SET NOTE_VERBOSITY=@OLD_NOTE_VERBOSITY */;

-- Dump completed on 2026-09-17 12:24:27

-- Table: inv_issue_voucher_line
/*M!999999\- enable the sandbox mode */ 
-- MariaDB dump 10.19-11.5.2-MariaDB, for Win64 (AMD64)
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
/*M!100616 SET @OLD_NOTE_VERBOSITY=@@NOTE_VERBOSITY, NOTE_VERBOSITY=0 */;

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
) ENGINE=InnoDB AUTO_INCREMENT=22 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `inv_issue_voucher_line`
--

LOCK TABLES `inv_issue_voucher_line` WRITE;
/*!40000 ALTER TABLE `inv_issue_voucher_line` DISABLE KEYS */;
INSERT INTO `inv_issue_voucher_line` (`id`, `voucher_id`, `item_id`, `requested_quantity`, `approved_quantity`, `issued_quantity`, `unit_cost`, `total_cost`, `serial_tracking_id`, `line_order`) VALUES (1,6,2,5.0000,5.0000,5.0000,800.0000,4000.00,NULL,1),
(2,7,3,4.0000,4.0000,4.0000,35.3600,141.44,NULL,1),
(3,7,4,2.0000,2.0000,2.0000,38.0000,76.00,NULL,2),
(4,7,5,2.0000,2.0000,2.0000,120.0000,240.00,NULL,3),
(5,7,5,2.0000,2.0000,2.0000,120.0000,240.00,NULL,4),
(6,7,6,2.0000,2.0000,2.0000,28.0000,56.00,NULL,5),
(7,7,14,2.0000,2.0000,2.0000,14.0000,28.00,NULL,6),
(8,7,15,2.0000,2.0000,2.0000,24.0000,48.00,NULL,7),
(9,7,11,2.0000,2.0000,2.0000,65.0000,130.00,NULL,8),
(10,7,9,1.0000,1.0000,1.0000,88.0000,88.00,NULL,9),
(11,7,12,2.0000,2.0000,2.0000,22.0000,44.00,NULL,10),
(12,8,3,9.0000,9.0000,9.0000,35.3600,318.24,NULL,1),
(13,8,5,8.0000,8.0000,8.0000,120.0000,960.00,NULL,2),
(14,8,5,6.0000,6.0000,6.0000,120.0000,720.00,NULL,3),
(15,8,14,2.0000,2.0000,2.0000,14.0000,28.00,NULL,4),
(16,8,11,7.0000,7.0000,7.0000,65.0000,455.00,NULL,5),
(17,9,3,2.0000,2.0000,2.0000,35.3600,70.72,NULL,1),
(18,9,4,4.0000,4.0000,4.0000,38.0000,152.00,NULL,2),
(19,9,5,1.0000,1.0000,1.0000,120.0000,120.00,NULL,3),
(20,9,7,8.0000,8.0000,8.0000,55.0000,440.00,NULL,4),
(21,10,2,8.0000,8.0000,8.0000,800.0000,6400.00,NULL,1);
/*!40000 ALTER TABLE `inv_issue_voucher_line` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*M!100616 SET NOTE_VERBOSITY=@OLD_NOTE_VERBOSITY */;

-- Dump completed on 2026-09-17 12:24:27

-- Table: inv_goods_received_note_line
/*M!999999\- enable the sandbox mode */ 
-- MariaDB dump 10.19-11.5.2-MariaDB, for Win64 (AMD64)
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
/*M!100616 SET @OLD_NOTE_VERBOSITY=@@NOTE_VERBOSITY, NOTE_VERBOSITY=0 */;

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
) ENGINE=InnoDB AUTO_INCREMENT=21 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `inv_goods_received_note_line`
--

LOCK TABLES `inv_goods_received_note_line` WRITE;
/*!40000 ALTER TABLE `inv_goods_received_note_line` DISABLE KEYS */;
INSERT INTO `inv_goods_received_note_line` (`id`, `grn_id`, `po_line_id`, `item_id`, `received_quantity`, `accepted_quantity`, `rejected_quantity`, `unit_cost`, `total_cost`, `batch_number`, `expiry_date`, `rejection_reason`, `line_order`) VALUES (19,10,6,3,10.0000,10.0000,0.0000,600.0000,6000.00,'45514','2026-09-16','',1),
(20,10,7,2,20.0000,20.0000,0.0000,800.0000,16000.00,'875','2026-09-30','',2);
/*!40000 ALTER TABLE `inv_goods_received_note_line` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*M!100616 SET NOTE_VERBOSITY=@OLD_NOTE_VERBOSITY */;

-- Dump completed on 2026-09-17 12:24:27

-- Table: custom_maintenance_activity_log
/*M!999999\- enable the sandbox mode */ 
-- MariaDB dump 10.19-11.5.2-MariaDB, for Win64 (AMD64)
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
/*M!100616 SET @OLD_NOTE_VERBOSITY=@@NOTE_VERBOSITY, NOTE_VERBOSITY=0 */;

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
) ENGINE=InnoDB AUTO_INCREMENT=22 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `custom_maintenance_activity_log`
--

LOCK TABLES `custom_maintenance_activity_log` WRITE;
/*!40000 ALTER TABLE `custom_maintenance_activity_log` DISABLE KEYS */;
INSERT INTO `custom_maintenance_activity_log` (`id`, `request_id`, `action`, `from_status`, `to_status`, `actor_username`, `actor_role`, `comments`, `created_at`) VALUES (1,1,'REQUEST_CREATED',NULL,'PENDING_SURVEY_ASSIGNMENT','reading2','CUSTOMER_SERVICE','Customer maintenance request registered. Type: የውሃ ቆጣሪ ቅያሬ / ጥገና, Customer: ወ/ሮ እናኑ ብርሀን (200012)','2026-09-11 21:14:38'),
(2,1,'SURVEY_PLUMBER_ASSIGNED','PENDING_SURVEY_ASSIGNMENT','SURVEY_IN_PROGRESS','reading2','TECHNICAL','Plumber ተስፋዬ በቀለ assigned for on-site maintenance inspection. ','2026-09-11 21:14:51'),
(3,1,'SURVEY_SUBMITTED','SURVEY_IN_PROGRESS','PENDING_PAYMENT_APPROVAL','reading2','TECHNICAL','Maintenance materials & fees encoded. Utility: ETB 4000.00, Outside: ETB 785.00, 55% Service: ETB 2631.75, 25% Transport: ETB 1000.00, Fees: ETB 175.00, Total Payable: ETB 7806.75','2026-09-11 21:16:13'),
(4,1,'PAYMENT_APPROVED','PENDING_PAYMENT_APPROVAL','PENDING_STORE_COLLECTION','reading2','REVENUE','Maintenance payment approved by Revenue Officer. Receipt: erer, Ref: fjdf (prices/items reviewed & updated)','2026-09-11 21:16:34'),
(5,2,'REQUEST_CREATED',NULL,'PENDING_SURVEY_ASSIGNMENT','customers','CUSTOMER_SERVICE','Customer maintenance request registered. Type: የቧንቧ ፍሳሽ ጥገና, Customer: አቶ ወርቁ ሀይሌ (200001)','2026-09-12 17:37:29'),
(6,2,'SURVEY_PLUMBER_ASSIGNED','PENDING_SURVEY_ASSIGNMENT','SURVEY_IN_PROGRESS','techn','TECHNICAL','Plumber ካሳሁን ደስታ assigned for on-site maintenance inspection. ','2026-09-12 17:44:06'),
(7,2,'SURVEY_SUBMITTED','SURVEY_IN_PROGRESS','PENDING_PAYMENT_APPROVAL','techn','TECHNICAL','Maintenance materials & fees encoded. Utility: ETB 1200.00, Outside: ETB 1172.50, 55% Service: ETB 1304.88, 25% Transport: ETB 300.00, Fees: ETB 175.00, Total Payable: ETB 2979.88','2026-09-12 17:47:06'),
(8,2,'PAYMENT_APPROVED','PENDING_PAYMENT_APPROVAL','PENDING_STORE_COLLECTION','gebe','REVENUE','Maintenance payment approved by Revenue Officer. Receipt: gnsd, Ref: ret (prices/items reviewed & updated)','2026-09-12 17:48:54'),
(9,2,'MATERIALS_DISPATCHED','PENDING_STORE_COLLECTION','MATERIALS_COLLECTED','mstore','INVENTORY','Maintenance materials issued and released by storekeeper: mstore','2026-09-12 17:50:39'),
(10,2,'MAINTENANCE_PLUMBER_ASSIGNED','MATERIALS_COLLECTED','MAINTENANCE_IN_PROGRESS','techn','TECHNICAL','Plumber አለሙ ተፈራ assigned for physical maintenance repair. ','2026-09-12 17:51:44'),
(11,2,'MAINTENANCE_COMPLETED','MAINTENANCE_IN_PROGRESS','MAINTENANCE_COMPLETED','techn','TECHNICAL','Customer maintenance physical work completed and verified. gg','2026-09-12 17:52:16'),
(12,1,'MATERIALS_DISPATCHED','PENDING_STORE_COLLECTION','MATERIALS_COLLECTED','reading2','INVENTORY','Maintenance materials issued from store \'main Store\' and released by storekeeper: reading2 (Voucher: ISV-MNT-MNT-2026-00001, Journal: JE-INV-2026-1789241945776)','2026-09-12 19:39:05'),
(13,3,'REQUEST_CREATED',NULL,'PENDING_SURVEY_ASSIGNMENT','custom2','CUSTOMER_SERVICE','Customer maintenance request registered. Type: የቧንቧ ፍሳሽ ጥገና, Customer: ጋሽነት አበጋዝ አሊ (103336)','2026-09-13 13:00:57'),
(14,3,'SURVEY_PLUMBER_ASSIGNED','PENDING_SURVEY_ASSIGNMENT','SURVEY_IN_PROGRESS','techn2','TECHNICAL','Plumber Addisu Mesfin assigned for on-site maintenance inspection. ','2026-09-13 13:02:44'),
(15,4,'REQUEST_CREATED',NULL,'PENDING_SURVEY_ASSIGNMENT','custom2','CUSTOMER_SERVICE','Customer maintenance request registered. Type: የውሃ ቆጣሪ ቅያሬ / ጥገና, Customer: 333rrr (203335)','2026-09-13 13:44:17'),
(16,4,'SURVEY_PLUMBER_ASSIGNED','PENDING_SURVEY_ASSIGNMENT','SURVEY_IN_PROGRESS','techn2','TECHNICAL','Plumber Addisu Mesfin assigned for on-site maintenance inspection. ','2026-09-13 13:45:30'),
(17,3,'SURVEY_SUBMITTED','SURVEY_IN_PROGRESS','PENDING_PAYMENT_APPROVAL','techn2','TECHNICAL','Maintenance materials & fees encoded. Utility: ETB 2481.24, Outside: ETB 0.00, 55% Service: ETB 1364.68, 25% Transport: ETB 620.31, Fees: ETB 175.00, Total Payable: ETB 4641.23','2026-09-13 13:46:40'),
(18,3,'PAYMENT_APPROVED','PENDING_PAYMENT_APPROVAL','PENDING_STORE_COLLECTION','3gebe','REVENUE','Maintenance payment approved by Revenue Officer. Receipt: ንግድ ባንክ, Ref: null (prices/items reviewed & updated)','2026-09-13 13:47:25'),
(19,3,'MATERIALS_DISPATCHED','PENDING_STORE_COLLECTION','MATERIALS_COLLECTED','3store','INVENTORY','Maintenance materials issued from store \'branch 3\' and released by storekeeper: 3store (Voucher: ISV-MNT-MNT-2026-00003, Journal: JE-INV-2026-1789307290516)','2026-09-13 13:48:10'),
(20,3,'MAINTENANCE_PLUMBER_ASSIGNED','MATERIALS_COLLECTED','MAINTENANCE_IN_PROGRESS','techn2','TECHNICAL','Plumber Addisu Mesfin assigned for physical maintenance repair. ','2026-09-13 13:48:46'),
(21,3,'MAINTENANCE_COMPLETED','MAINTENANCE_IN_PROGRESS','MAINTENANCE_COMPLETED','techn2','TECHNICAL','Customer maintenance physical work completed and verified. ጥገናው ተከናውኗል','2026-09-13 13:49:25');
/*!40000 ALTER TABLE `custom_maintenance_activity_log` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*M!100616 SET NOTE_VERBOSITY=@OLD_NOTE_VERBOSITY */;

-- Dump completed on 2026-09-17 12:24:27

-- Table: custom_maintenance_additional_fee
/*M!999999\- enable the sandbox mode */ 
-- MariaDB dump 10.19-11.5.2-MariaDB, for Win64 (AMD64)
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
/*M!100616 SET @OLD_NOTE_VERBOSITY=@@NOTE_VERBOSITY, NOTE_VERBOSITY=0 */;

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
  `unit_name` varchar(50) NOT NULL DEFAULT 'ብር',
  `quantity` decimal(10,2) NOT NULL DEFAULT 1.00,
  `unit_price` decimal(15,2) NOT NULL DEFAULT 0.00,
  `total_price` decimal(15,2) NOT NULL DEFAULT 0.00,
  `remarks` varchar(500) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_cmaf_req` (`request_id`),
  CONSTRAINT `fk_cmaf_req` FOREIGN KEY (`request_id`) REFERENCES `custom_maintenance_request` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=37 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `custom_maintenance_additional_fee`
--

LOCK TABLES `custom_maintenance_additional_fee` WRITE;
/*!40000 ALTER TABLE `custom_maintenance_additional_fee` DISABLE KEYS */;
INSERT INTO `custom_maintenance_additional_fee` (`id`, `request_id`, `fee_type_id`, `fee_name`, `fee_name_am`, `unit_name`, `quantity`, `unit_price`, `total_price`, `remarks`) VALUES (7,1,1,'Site Survey Fee','የዳሰሳ ጥናት ክፍያ','ብር',1.00,40.00,40.00,''),
(8,1,2,'Excavation / Inspection','ከተቆጣጣሪ / ቁፋሮ','ብር',1.00,50.00,50.00,''),
(9,1,3,'Photocopy Charge','ፎቶ ኮፒ','ብር',1.00,6.00,6.00,''),
(10,1,4,'Document & Form Processing','ሰነድ / ደረሰኝ','ብር',1.00,4.00,4.00,''),
(11,1,5,'Meter Security Sticker','ስቴከር','ብር',1.00,5.00,5.00,''),
(12,1,6,'Legal Revenue Stamp','ታምብ','ብር',1.00,70.00,70.00,''),
(19,2,1,'Site Survey Fee','የዳሰሳ ጥናት ክፍያ','ብር',1.00,40.00,40.00,''),
(20,2,2,'Excavation / Inspection','ከተቆጣጣሪ / ቁፋሮ','ብር',1.00,50.00,50.00,''),
(21,2,3,'Photocopy Charge','ፎቶ ኮፒ','ብር',1.00,6.00,6.00,''),
(22,2,4,'Document & Form Processing','ሰነድ / ደረሰኝ','ብር',1.00,4.00,4.00,''),
(23,2,5,'Meter Security Sticker','ስቴከር','ብር',1.00,5.00,5.00,''),
(24,2,6,'Legal Revenue Stamp','ታምብ','ብር',1.00,70.00,70.00,''),
(31,3,1,'Site Survey Fee','የዳሰሳ ጥናት ክፍያ','ብር',1.00,40.00,40.00,''),
(32,3,2,'Excavation / Inspection','ከተቆጣጣሪ / ቁፋሮ','ብር',1.00,50.00,50.00,''),
(33,3,3,'Photocopy Charge','ፎቶ ኮፒ','ብር',1.00,6.00,6.00,''),
(34,3,4,'Document & Form Processing','ሰነድ / ደረሰኝ','ብር',1.00,4.00,4.00,''),
(35,3,5,'Meter Security Sticker','ስቴከር','ብር',1.00,5.00,5.00,''),
(36,3,6,'Legal Revenue Stamp','ታምብ','ብር',1.00,70.00,70.00,'');
/*!40000 ALTER TABLE `custom_maintenance_additional_fee` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*M!100616 SET NOTE_VERBOSITY=@OLD_NOTE_VERBOSITY */;

-- Dump completed on 2026-09-17 12:24:27

-- Table: custom_maintenance_item
/*M!999999\- enable the sandbox mode */ 
-- MariaDB dump 10.19-11.5.2-MariaDB, for Win64 (AMD64)
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
/*M!100616 SET @OLD_NOTE_VERBOSITY=@@NOTE_VERBOSITY, NOTE_VERBOSITY=0 */;

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
  `unit_of_measure` varchar(50) NOT NULL DEFAULT 'በቁጥር',
  `surveyed_quantity` decimal(10,2) NOT NULL DEFAULT 0.00,
  `utility_quantity` decimal(10,2) NOT NULL DEFAULT 0.00,
  `utility_unit_price` decimal(15,2) NOT NULL DEFAULT 0.00,
  `utility_total_price` decimal(15,2) NOT NULL DEFAULT 0.00,
  `outside_quantity` decimal(10,2) NOT NULL DEFAULT 0.00,
  `outside_unit_price` decimal(15,2) NOT NULL DEFAULT 0.00,
  `outside_total_price` decimal(15,2) NOT NULL DEFAULT 0.00,
  `remarks` varchar(500) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_cmi_req` (`request_id`),
  CONSTRAINT `fk_cmi_req` FOREIGN KEY (`request_id`) REFERENCES `custom_maintenance_request` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=47 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `custom_maintenance_item`
--

LOCK TABLES `custom_maintenance_item` WRITE;
/*!40000 ALTER TABLE `custom_maintenance_item` DISABLE KEYS */;
INSERT INTO `custom_maintenance_item` (`id`, `request_id`, `maintenance_common_material_id`, `inv_item_id`, `item_name`, `item_name_am`, `unit_of_measure`, `surveyed_quantity`, `utility_quantity`, `utility_unit_price`, `utility_total_price`, `outside_quantity`, `outside_unit_price`, `outside_total_price`, `remarks`) VALUES (8,1,9,2,'Water Meter 1/2\"','የውሃ ቆጣሪ 1/2\"','በቁጥር',5.00,5.00,800.00,4000.00,0.00,800.00,0.00,''),
(9,1,10,NULL,'Stop Valve 1/2\"','ስቶፕ ቫልቭ/ኮክ 1/2\"','በቁጥር',10.00,0.00,66.00,0.00,10.00,66.00,660.00,''),
(10,1,11,NULL,'Gate Valve 1/2\"','ጌት ቫልቭ 1/2\"','በቁጥር',0.00,0.00,110.00,0.00,0.00,110.00,0.00,''),
(11,1,12,NULL,'Nipple 1/2\"','ኒፕል 1/2\"','በቁጥር',0.00,0.00,30.00,0.00,0.00,30.00,0.00,''),
(12,1,13,NULL,'Male Adapter 1/2\"','ወንድ አዳፕተር 1/2\"','በቁጥር',0.00,0.00,149.50,0.00,0.00,149.50,0.00,''),
(13,1,14,NULL,'Female Adapter 1/2\"','ሴት አዳፕተር 1/2\"','በቁጥር',0.00,0.00,35.00,0.00,0.00,35.00,0.00,''),
(14,1,15,NULL,'Teflon Tape','ቴፍሎን ቴፕ','በቁጥር',5.00,0.00,25.00,0.00,5.00,25.00,125.00,''),
(23,2,1,3,'HDPE Pipe 1/2\"','ቢ.ባ. ኤች.ዲ.ፒ. 1/2\"','ሜትር',2.00,2.00,700.00,1400.00,0.00,600.00,0.00,''),
(24,2,2,NULL,'Male Adapter 1/2\"','ወንድ አዳፕተር 1/2\"','በቁጥር',5.00,0.00,180.00,0.00,5.00,149.50,747.50,''),
(25,2,3,NULL,'Female Adapter 1/2\"','ሴት አዳፕተር 1/2\"','በቁጥር',0.00,0.00,35.00,0.00,0.00,35.00,0.00,''),
(26,2,4,NULL,'Compression Tee 1/2\"','ኮምፕሬሽን ቲ 1/2\"','በቁጥር',0.00,0.00,17.00,0.00,0.00,17.00,0.00,''),
(27,2,5,NULL,'Clamp Saddle','ክላምፕ ሳድል','በቁጥር',5.00,0.00,85.00,0.00,5.00,85.00,425.00,''),
(28,2,6,NULL,'Teflon Tape','ቴፍሎን ቴፕ','በቁጥር',0.00,0.00,25.00,0.00,0.00,25.00,0.00,''),
(29,2,7,NULL,'Elbow 1/2\"','ኤልቦ 1/2\"','በቁጥር',0.00,0.00,45.00,0.00,0.00,45.00,0.00,''),
(30,2,8,NULL,'Nipple 1/2\"','ኒፕል 1/2\"','በቁጥር',0.00,0.00,30.00,0.00,0.00,30.00,0.00,''),
(39,3,1,3,'HDPE Pipe 1/2\"','ቢ.ባ. ኤች.ዲ.ፒ. 1/2\"','ሜትር',9.00,9.00,35.36,318.24,0.00,35.36,0.00,''),
(40,3,2,5,'Male Adapter 1/2\"','ወንድ አዳፕተር 1/2\"','በቁጥር',8.00,8.00,120.00,960.00,0.00,120.00,0.00,''),
(41,3,3,5,'Female Adapter 1/2\"','ሴት አዳፕተር 1/2\"','በቁጥር',6.00,6.00,120.00,720.00,0.00,120.00,0.00,''),
(42,3,4,14,'Compression Tee 1/2\"','ኮምፕሬሽን ቲ 1/2\"','በቁጥር',2.00,2.00,14.00,28.00,0.00,14.00,0.00,''),
(43,3,5,11,'Clamp Saddle','ክላምፕ ሳድል','በቁጥር',7.00,7.00,65.00,455.00,0.00,65.00,0.00,''),
(44,3,6,10,'Teflon Tape','ቴፍሎን ቴፕ','በቁጥር',0.00,0.00,18.00,0.00,0.00,18.00,0.00,''),
(45,3,7,13,'Elbow 1/2\"','ኤልቦ 1/2\"','በቁጥር',0.00,0.00,32.00,0.00,0.00,32.00,0.00,''),
(46,3,8,12,'Nipple 1/2\"','ኒፕል 1/2\"','በቁጥር',0.00,0.00,22.00,0.00,0.00,22.00,0.00,'');
/*!40000 ALTER TABLE `custom_maintenance_item` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*M!100616 SET NOTE_VERBOSITY=@OLD_NOTE_VERBOSITY */;

-- Dump completed on 2026-09-17 12:24:27

-- Table: custom_new_line_connection_request
/*M!999999\- enable the sandbox mode */ 
-- MariaDB dump 10.19-11.5.2-MariaDB, for Win64 (AMD64)
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
/*M!100616 SET @OLD_NOTE_VERBOSITY=@@NOTE_VERBOSITY, NOTE_VERBOSITY=0 */;

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
  CONSTRAINT `custom_new_line_connection_request_ibfk_1` FOREIGN KEY (`customer_id`) REFERENCES `billing_customer_info` (`id`) ON DELETE SET NULL,
  CONSTRAINT `custom_new_line_connection_request_ibfk_2` FOREIGN KEY (`kebele_id`) REFERENCES `address_streets` (`id`) ON DELETE SET NULL,
  CONSTRAINT `custom_new_line_connection_request_ibfk_3` FOREIGN KEY (`ketena_id`) REFERENCES `address_ketena` (`id`) ON DELETE SET NULL,
  CONSTRAINT `custom_new_line_connection_request_ibfk_4` FOREIGN KEY (`customer_type_id`) REFERENCES `billing_customer_type` (`id`) ON DELETE SET NULL,
  CONSTRAINT `custom_new_line_connection_request_ibfk_5` FOREIGN KEY (`branch_id`) REFERENCES `branchs` (`id`) ON DELETE SET NULL,
  CONSTRAINT `custom_new_line_connection_request_ibfk_6` FOREIGN KEY (`survey_plumber_id`) REFERENCES `user_account` (`id`) ON DELETE SET NULL,
  CONSTRAINT `custom_new_line_connection_request_ibfk_7` FOREIGN KEY (`installation_plumber_id`) REFERENCES `user_account` (`id`) ON DELETE SET NULL,
  CONSTRAINT `custom_new_line_connection_request_ibfk_8` FOREIGN KEY (`assigned_reader_id`) REFERENCES `user_account` (`id`) ON DELETE SET NULL,
  CONSTRAINT `custom_new_line_connection_request_ibfk_9` FOREIGN KEY (`inv_issue_voucher_id`) REFERENCES `inv_issue_voucher` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=12 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `custom_new_line_connection_request`
--

LOCK TABLES `custom_new_line_connection_request` WRITE;
/*!40000 ALTER TABLE `custom_new_line_connection_request` DISABLE KEYS */;
INSERT INTO `custom_new_line_connection_request` (`id`, `application_number`, `customer_id`, `applicant_name`, `customer_full_name`, `customer_full_name_eng`, `phone_number`, `national_id_number`, `house_number`, `kebele_id`, `ketena_id`, `customer_type_id`, `branch_id`, `address_description`, `status`, `survey_plumber_id`, `survey_assigned_date`, `survey_plumber_notes`, `materials_utility_total`, `materials_outside_total`, `service_charge_percent`, `service_charge_amount`, `transport_charge_percent`, `transport_charge_amount`, `additional_fees_total`, `total_payable_amount`, `is_paid`, `payment_reference_number`, `payment_receipt_number`, `payment_approved_by`, `payment_approved_date`, `inv_issue_voucher_id`, `materials_collected_date`, `storekeeper_username`, `installation_plumber_id`, `installation_assigned_date`, `installation_completed_date`, `installation_notes`, `installation_approved_by`, `meter_number`, `meter_size_id`, `initial_reading`, `assigned_reader_id`, `location_coordination`, `activated_by`, `activated_date`, `created_by`, `created_at`, `updated_at`) VALUES (1,'NLC-2026-00001',NULL,'አበበ በቀለ ደስታ','አበበ በቀለ ደስታ','Abebe Bekele Desta','+251911223344','ID-99221','104',1,1,1,1,'Near Town Hall','SURVEY_IN_PROGRESS',214,'2026-09-09 20:33:50',NULL,0.00,0.00,55.00,0.00,25.00,0.00,0.00,0.00,0,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,0,NULL,NULL,NULL,NULL,'customer_service','2026-09-09 14:14:34','2026-09-09 20:33:50'),
(2,'NLC-2026-00002',3336,'አመለወርቅ ተካ ባህሩ','አመለወርቅ ተካ ባህሩ','Amelewerk Teka Bahiru','+251947577300','','',1,1,2138,6,'','FINAL_ACTIVATION_COMPLETED',213,'2026-09-09 19:11:54','Survey completed successfully.',35.36,0.00,55.00,19.45,25.00,8.84,105.00,168.65,1,'TXN99887766','REC-892301','admin2','2026-09-09 19:35:21',1,'2026-09-09 19:38:09','admin2',213,'2026-09-09 19:41:30','2026-09-10 03:26:02','Line connected and tested','technical','WM-NLC-00219',1,0,111,'9.012345, 38.765432','customer_service','2026-09-10 03:35:00','customers','2026-09-09 14:16:33','2026-09-10 03:35:00'),
(3,'NLC-2026-00003',NULL,'ከበደ ወሰደ መጣ','ከበደ ወሰደ መጣ','kebede wusede meta','251910204050','','',3,23,2146,6,'','INSTALLATION_COMPLETED',213,'2026-09-10 04:33:26','',157.00,0.00,55.00,86.35,25.00,39.25,175.00,457.60,1,'3453423423','2343','gebe','2026-09-10 05:13:00',2,'2026-09-10 05:17:06','mstore',215,'2026-09-10 05:19:01','2026-09-10 05:19:14','Physical piping connection completed and verified by technical officer','techn',NULL,NULL,0,NULL,NULL,NULL,NULL,'customers','2026-09-10 04:32:19','2026-09-10 05:19:14'),
(4,'NLC-2026-00004',NULL,'Abebe Kebede','Abebe Kebede','','+251911998877','','',1,NULL,NULL,1,'','SURVEY_IN_PROGRESS',214,'2026-09-10 07:23:53',NULL,0.00,0.00,55.00,0.00,25.00,0.00,0.00,0.00,0,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,0,NULL,NULL,NULL,NULL,'customer_service','2026-09-10 07:22:05','2026-09-10 07:23:53'),
(5,'NLC-2026-00005',3337,'meseret tadele kebede','meseret tadele kebede','meseret tadele keeebede','+25198754785','','',3,23,2120,6,'','FINAL_ACTIVATION_COMPLETED',213,'2026-09-10 18:12:09','',7360.00,5677.00,55.00,7170.35,25.00,1840.00,175.00,16545.35,1,'233131','inv122','gebe','2026-09-10 18:21:59',3,'2026-09-10 18:28:25','mstore',215,'2026-09-11 04:42:43','2026-09-11 04:42:58','Physical piping connection completed and verified by technical officer','techn','mn334',3,0,124,'','customers','2026-09-11 04:44:07','customers','2026-09-10 18:10:51','2026-09-11 04:44:07'),
(6,'NLC-2026-00006',3338,'አበበ አድማሱ ያሲን','አበበ አድማሱ ያሲን','abebe admasu yasin','+251912457896',NULL,NULL,2,12,2138,6,NULL,'FINAL_ACTIVATION_COMPLETED',213,'2026-09-11 09:22:55','',9200.00,1690.80,55.00,5989.94,25.00,2300.00,175.00,17664.94,1,'juh','jj522','gebe','2026-09-11 09:59:18',4,'2026-09-11 10:03:15','mstore',213,'2026-09-11 10:03:45','2026-09-11 10:03:56','Physical piping connection completed and verified by technical officer','techn','nm585',4,0,125,NULL,'customers','2026-09-11 10:04:40','customers','2026-09-11 09:18:27','2026-09-11 10:04:41'),
(7,'NLC-2026-00007',NULL,'test','test','3rd test','+25198574854',NULL,NULL,2,12,2138,7,NULL,'MATERIALS_COLLECTED',218,'2026-09-11 16:02:28','',6400.00,50.00,55.00,3547.50,25.00,1600.00,175.00,11722.50,1,'telebirr','hge334','3gebe','2026-09-11 16:24:48',10,'2026-09-13 17:00:58','3store',NULL,NULL,NULL,NULL,NULL,NULL,NULL,0,NULL,NULL,NULL,NULL,'custom2','2026-09-11 10:29:45','2026-09-13 17:00:58'),
(8,'NLC-2026-00008',3339,'333rrr','333rrr','hdhdhd djdfj','+251987541236',NULL,NULL,2,12,2138,7,NULL,'FINAL_ACTIVATION_COMPLETED',218,'2026-09-11 18:27:18','',0.00,3301.10,55.00,1815.61,25.00,0.00,175.00,1990.61,1,'mmm','mj874','3gebe','2026-09-11 18:29:08',NULL,NULL,NULL,218,'2026-09-11 18:31:45','2026-09-11 18:31:52','Physical piping connection completed and verified by technical officer','techn2','784oi',2,0,125,NULL,'custom2','2026-09-11 18:34:10','custom2','2026-09-11 18:25:27','2026-09-11 18:34:11'),
(9,'NLC-2026-00009',NULL,'ምስጋነው ያዜ እውነቱ','ምስጋነው ያዜ እውነቱ','Misganew Yazie Ewunetu','+251947577300',NULL,NULL,1,24,2138,6,'አካዳሚ ጀርባ','PENDING_STORE_COLLECTION',215,'2026-09-13 11:55:56','',21710.00,0.00,55.00,11940.50,25.00,5427.50,275.00,39353.00,1,'','reci-858585','gebe','2026-09-13 12:04:00',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,0,NULL,NULL,NULL,NULL,'customers','2026-09-13 11:53:26','2026-09-13 12:04:00'),
(10,'NLC-2026-00010',3340,'ጋሽነት አበጋዝ አሊ','ጋሽነት አበጋዝ አሊ','Gashit Abegaz Ali','+251947577300',NULL,NULL,1,1,2138,7,'መዝገቡ አበራ','FINAL_ACTIVATION_COMPLETED',218,'2026-09-13 12:22:34','',1091.44,0.00,55.00,600.29,25.00,272.86,405.00,2369.59,1,'','7888888999','3gebe','2026-09-13 12:49:17',7,'2026-09-13 12:50:38','3store',218,'2026-09-13 12:52:32','2026-09-13 12:52:39','Physical piping connection completed and verified by technical officer','techn2','566666',1,0,123,'885','custom2','2026-09-13 12:53:40','custom2','2026-09-13 12:21:27','2026-09-13 12:53:40'),
(11,'NLC-2026-00011',NULL,'አብርሀም አሞኘ ብርሀኑ','አብርሀም አሞኘ ብርሀኑ','AbrhAm amogne brhanu','+251940846434',NULL,NULL,1,24,2138,7,'mesgid jerba','INSTALLATION_IN_PROGRESS',218,'2026-09-13 13:55:28','ggg',782.72,0.00,55.00,430.50,25.00,195.68,315.00,1723.90,1,'','89898989','3gebe','2026-09-13 14:16:02',9,'2026-09-13 14:24:18','3store',218,'2026-09-13 14:26:14',NULL,NULL,NULL,NULL,NULL,0,NULL,NULL,NULL,NULL,'custom2','2026-09-13 13:54:30','2026-09-13 14:26:14');
/*!40000 ALTER TABLE `custom_new_line_connection_request` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*M!100616 SET NOTE_VERBOSITY=@OLD_NOTE_VERBOSITY */;

-- Dump completed on 2026-09-17 12:24:28

-- === TIER 5: Depends on Tier 4 ===

-- Table: hrms_salary_calculated_tekenash
/*M!999999\- enable the sandbox mode */ 
-- MariaDB dump 10.19-11.5.2-MariaDB, for Win64 (AMD64)
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
/*M!100616 SET @OLD_NOTE_VERBOSITY=@@NOTE_VERBOSITY, NOTE_VERBOSITY=0 */;

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
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*M!100616 SET NOTE_VERBOSITY=@OLD_NOTE_VERBOSITY */;

-- Dump completed on 2026-09-17 12:24:28

-- Table: hrms_attendance_raw_logs
/*M!999999\- enable the sandbox mode */ 
-- MariaDB dump 10.19-11.5.2-MariaDB, for Win64 (AMD64)
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
/*M!100616 SET @OLD_NOTE_VERBOSITY=@@NOTE_VERBOSITY, NOTE_VERBOSITY=0 */;

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
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*M!100616 SET NOTE_VERBOSITY=@OLD_NOTE_VERBOSITY */;

-- Dump completed on 2026-09-17 12:24:28

-- Table: custom_new_line_activity_log
/*M!999999\- enable the sandbox mode */ 
-- MariaDB dump 10.19-11.5.2-MariaDB, for Win64 (AMD64)
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
/*M!100616 SET @OLD_NOTE_VERBOSITY=@@NOTE_VERBOSITY, NOTE_VERBOSITY=0 */;

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
) ENGINE=InnoDB AUTO_INCREMENT=67 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `custom_new_line_activity_log`
--

LOCK TABLES `custom_new_line_activity_log` WRITE;
/*!40000 ALTER TABLE `custom_new_line_activity_log` DISABLE KEYS */;
INSERT INTO `custom_new_line_activity_log` (`id`, `request_id`, `action`, `from_status`, `to_status`, `actor_username`, `actor_role`, `comments`, `created_at`) VALUES (1,1,'APPLICATION_CREATED',NULL,'PENDING_SURVEY_ASSIGNMENT','customer_service','CUSTOMER_SERVICE','New line connection application registered. Applicant: አበበ በቀለ ደስታ','2026-09-09 14:14:34'),
(2,2,'APPLICATION_CREATED',NULL,'PENDING_SURVEY_ASSIGNMENT','customers','CUSTOMER_SERVICE','New line connection application registered. Applicant: አመለወርቅ ተካ ባህሩ','2026-09-09 14:16:33'),
(3,2,'SURVEY_PLUMBER_ASSIGNED','PENDING_SURVEY_ASSIGNMENT','SURVEY_IN_PROGRESS','admin2','TECHNICAL','Plumber ካሳሁን ደስታ assigned for on-site survey. ','2026-09-09 19:11:54'),
(4,2,'SURVEY_SUBMITTED','SURVEY_IN_PROGRESS','PENDING_PAYMENT_APPROVAL','admin2','TECHNICAL','Materials & fees encoded. Utility: ETB 35.36, Outside: ETB 0.00, 55% Service: ETB 19.45, 25% Transport: ETB 8.84, Fees: ETB 105.00, Total Payable: ETB 168.65','2026-09-09 19:31:43'),
(5,2,'PAYMENT_APPROVED','PENDING_PAYMENT_APPROVAL','PENDING_STORE_COLLECTION','admin2','REVENUE','Payment approved by Revenue Officer. Receipt: REC-892301, Ref: TXN99887766 (prices/items reviewed & updated)','2026-09-09 19:35:21'),
(6,2,'MATERIALS_DISPATCHED','PENDING_STORE_COLLECTION','MATERIALS_COLLECTED','admin2','INVENTORY','Utility materials issued and dispatched to customer by storekeeper: admin2','2026-09-09 19:38:10'),
(7,2,'INSTALLATION_PLUMBER_ASSIGNED','MATERIALS_COLLECTED','INSTALLATION_IN_PROGRESS','admin2','TECHNICAL','Plumber ካሳሁን ደስታ assigned for physical water line installation. Proceed with line installation.','2026-09-09 19:41:30'),
(8,1,'SURVEY_PLUMBER_ASSIGNED','PENDING_SURVEY_ASSIGNMENT','SURVEY_IN_PROGRESS','admin2','TECHNICAL','Plumber ተስፋዬ በቀለ assigned for on-site survey. ','2026-09-09 20:33:50'),
(9,2,'INSTALLATION_COMPLETED','INSTALLATION_IN_PROGRESS','INSTALLATION_COMPLETED','technical','TECHNICAL','Physical line connection completed and approved by Technical Officer. Ready for customer activation.','2026-09-10 03:26:02'),
(10,2,'CUSTOMER_ACTIVATED','INSTALLATION_COMPLETED','FINAL_ACTIVATION_COMPLETED','customer_service','CUSTOMER_SERVICE','Customer fully activated into billing system. Account: 103332, Meter: WM-NLC-00219, Initial Reading: 0.0, Coordinates: 9.012345, 38.765432','2026-09-10 03:32:18'),
(11,2,'CUSTOMER_ACTIVATED','FINAL_ACTIVATION_COMPLETED','FINAL_ACTIVATION_COMPLETED','customer_service','CUSTOMER_SERVICE','Customer fully activated into billing system. Account: 103332, Meter: WM-NLC-00219, Initial Reading: 0.0, Coordinates: 9.012345, 38.765432','2026-09-10 03:35:00'),
(12,3,'APPLICATION_CREATED',NULL,'PENDING_SURVEY_ASSIGNMENT','customers','CUSTOMER_SERVICE','New line connection application registered. Applicant: ከበደ ወሰደ መጣ','2026-09-10 04:32:19'),
(13,3,'SURVEY_PLUMBER_ASSIGNED','PENDING_SURVEY_ASSIGNMENT','SURVEY_IN_PROGRESS','techn','TECHNICAL','Plumber ካሳሁን ደስታ assigned for on-site survey. ','2026-09-10 04:33:26'),
(14,3,'SURVEY_SUBMITTED','SURVEY_IN_PROGRESS','PENDING_PAYMENT_APPROVAL','techn','TECHNICAL','Materials & fees encoded. Utility: ETB 157.00, Outside: ETB 70.00, 55% Service: ETB 124.85, 25% Transport: ETB 39.25, Fees: ETB 175.00, Total Payable: ETB 496.10','2026-09-10 05:10:39'),
(15,3,'PAYMENT_APPROVED','PENDING_PAYMENT_APPROVAL','PENDING_STORE_COLLECTION','gebe','REVENUE','Payment approved by Revenue Officer. Receipt: 2343, Ref: 3453423423 (prices/items reviewed & updated)','2026-09-10 05:13:00'),
(16,3,'MATERIALS_DISPATCHED','PENDING_STORE_COLLECTION','MATERIALS_COLLECTED','mstore','INVENTORY','Utility materials issued and dispatched to customer by storekeeper: mstore','2026-09-10 05:17:07'),
(17,3,'INSTALLATION_PLUMBER_ASSIGNED','MATERIALS_COLLECTED','INSTALLATION_IN_PROGRESS','techn','TECHNICAL','Plumber አለሙ ተፈራ assigned for physical water line installation. ','2026-09-10 05:19:01'),
(18,3,'INSTALLATION_COMPLETED','INSTALLATION_IN_PROGRESS','INSTALLATION_COMPLETED','techn','TECHNICAL','Physical line connection completed and approved by Technical Officer. Ready for customer activation.','2026-09-10 05:19:14'),
(19,4,'APPLICATION_CREATED',NULL,'PENDING_SURVEY_ASSIGNMENT','customer_service','CUSTOMER_SERVICE','New line connection application registered. Applicant: Abebe Kebede','2026-09-10 07:22:06'),
(20,4,'SURVEY_PLUMBER_ASSIGNED','PENDING_SURVEY_ASSIGNMENT','SURVEY_IN_PROGRESS','technical','TECHNICAL','Plumber ተስፋዬ በቀለ assigned for on-site survey. ','2026-09-10 07:23:53'),
(21,5,'APPLICATION_CREATED',NULL,'PENDING_SURVEY_ASSIGNMENT','customers','CUSTOMER_SERVICE','New line connection application registered. Applicant: meseret tadele kebede','2026-09-10 18:10:51'),
(22,5,'SURVEY_PLUMBER_ASSIGNED','PENDING_SURVEY_ASSIGNMENT','SURVEY_IN_PROGRESS','techn','TECHNICAL','Plumber ካሳሁን ደስታ assigned for on-site survey. ','2026-09-10 18:12:09'),
(23,5,'SURVEY_SUBMITTED','SURVEY_IN_PROGRESS','PENDING_PAYMENT_APPROVAL','techn','TECHNICAL','Materials & fees encoded. Utility: ETB 6760.00, Outside: ETB 3038.98, 55% Service: ETB 5389.44, 25% Transport: ETB 1690.00, Fees: ETB 175.00, Total Payable: ETB 14014.44','2026-09-10 18:17:45'),
(24,5,'PAYMENT_APPROVED','PENDING_PAYMENT_APPROVAL','PENDING_STORE_COLLECTION','gebe','REVENUE','Payment approved by Revenue Officer. Receipt: inv122, Ref: 233131 (prices/items reviewed & updated)','2026-09-10 18:21:59'),
(25,5,'MATERIALS_DISPATCHED','PENDING_STORE_COLLECTION','MATERIALS_COLLECTED','mstore','INVENTORY','Utility materials issued and dispatched to customer by storekeeper: mstore','2026-09-10 18:28:25'),
(26,5,'INSTALLATION_PLUMBER_ASSIGNED','MATERIALS_COLLECTED','INSTALLATION_IN_PROGRESS','techn','TECHNICAL','Plumber አለሙ ተፈራ assigned for physical water line installation. ','2026-09-11 04:42:43'),
(27,5,'INSTALLATION_COMPLETED','INSTALLATION_IN_PROGRESS','INSTALLATION_COMPLETED','techn','TECHNICAL','Physical line connection completed and approved by Technical Officer. Ready for customer activation.','2026-09-11 04:42:58'),
(28,5,'CUSTOMER_ACTIVATED','INSTALLATION_COMPLETED','FINAL_ACTIVATION_COMPLETED','customers','CUSTOMER_SERVICE','Customer fully activated into billing system. Account: 303333, Meter: mn334, Initial Reading: 0.0, Coordinates: ','2026-09-11 04:44:07'),
(29,6,'APPLICATION_CREATED',NULL,'PENDING_SURVEY_ASSIGNMENT','customers','CUSTOMER_SERVICE','New line connection application registered. Applicant: አበበ አድማሱ ያሲን','2026-09-11 09:18:27'),
(30,6,'SURVEY_PLUMBER_ASSIGNED','PENDING_SURVEY_ASSIGNMENT','SURVEY_IN_PROGRESS','techn','TECHNICAL','Plumber ካሳሁን ደስታ assigned for on-site survey. ','2026-09-11 09:22:55'),
(31,6,'SURVEY_SUBMITTED','SURVEY_IN_PROGRESS','PENDING_PAYMENT_APPROVAL','techn','TECHNICAL','Materials & fees encoded. Utility: ETB 9200.00, Outside: ETB 5690.80, 55% Service: ETB 8189.94, 25% Transport: ETB 2300.00, Fees: ETB 175.00, Total Payable: ETB 19864.94','2026-09-11 09:57:54'),
(32,6,'PAYMENT_APPROVED','PENDING_PAYMENT_APPROVAL','PENDING_STORE_COLLECTION','gebe','REVENUE','Payment approved by Revenue Officer. Receipt: jj522, Ref: juh (prices/items reviewed & updated)','2026-09-11 09:59:18'),
(33,6,'MATERIALS_DISPATCHED','PENDING_STORE_COLLECTION','MATERIALS_COLLECTED','mstore','INVENTORY','Utility materials issued and dispatched to customer by storekeeper: mstore','2026-09-11 10:03:15'),
(34,6,'INSTALLATION_PLUMBER_ASSIGNED','MATERIALS_COLLECTED','INSTALLATION_IN_PROGRESS','techn','TECHNICAL','Plumber ካሳሁን ደስታ assigned for physical water line installation. ','2026-09-11 10:03:45'),
(35,6,'INSTALLATION_COMPLETED','INSTALLATION_IN_PROGRESS','INSTALLATION_COMPLETED','techn','TECHNICAL','Physical line connection completed and approved by Technical Officer. Ready for customer activation.','2026-09-11 10:03:56'),
(36,6,'CUSTOMER_ACTIVATED','INSTALLATION_COMPLETED','FINAL_ACTIVATION_COMPLETED','customers','CUSTOMER_SERVICE','Customer fully activated into billing system. Account: 203334, Meter: nm585, Initial Reading: 0.0, Coordinates: null','2026-09-11 10:04:41'),
(37,7,'APPLICATION_CREATED',NULL,'PENDING_SURVEY_ASSIGNMENT','custom2','CUSTOMER_SERVICE','New line connection application registered. Applicant: test','2026-09-11 10:29:45'),
(38,7,'SURVEY_PLUMBER_ASSIGNED','PENDING_SURVEY_ASSIGNMENT','SURVEY_IN_PROGRESS','techn2','TECHNICAL','Plumber Addisu Mesfin assigned for on-site survey. ','2026-09-11 16:02:28'),
(39,7,'SURVEY_SUBMITTED','SURVEY_IN_PROGRESS','PENDING_PAYMENT_APPROVAL','techn2','TECHNICAL','Materials & fees encoded. Utility: ETB 6400.00, Outside: ETB 50.00, 55% Service: ETB 3547.50, 25% Transport: ETB 1600.00, Fees: ETB 175.00, Total Payable: ETB 11722.50','2026-09-11 16:20:05'),
(40,7,'PAYMENT_APPROVED','PENDING_PAYMENT_APPROVAL','PENDING_STORE_COLLECTION','3gebe','REVENUE','Payment approved by Revenue Officer. Receipt: hge334, Ref: telebirr (prices/items reviewed & updated)','2026-09-11 16:24:48'),
(41,8,'APPLICATION_CREATED',NULL,'PENDING_SURVEY_ASSIGNMENT','custom2','CUSTOMER_SERVICE','New line connection application registered. Applicant: 333rrr','2026-09-11 18:25:27'),
(42,8,'SURVEY_PLUMBER_ASSIGNED','PENDING_SURVEY_ASSIGNMENT','SURVEY_IN_PROGRESS','techn2','TECHNICAL','Plumber Addisu Mesfin assigned for on-site survey. ','2026-09-11 18:27:18'),
(43,8,'SURVEY_SUBMITTED','SURVEY_IN_PROGRESS','PENDING_PAYMENT_APPROVAL','techn2','TECHNICAL','Materials & fees encoded. Utility: ETB 0.00, Outside: ETB 3301.10, 55% Service: ETB 1815.61, 25% Transport: ETB 0.00, Fees: ETB 175.00, Total Payable: ETB 1990.61','2026-09-11 18:28:15'),
(44,8,'PAYMENT_APPROVED','PENDING_PAYMENT_APPROVAL','MATERIALS_COLLECTED','3gebe','REVENUE','Payment approved by Revenue Officer. Receipt: mj874, Ref: mmm (prices/items reviewed & updated)','2026-09-11 18:29:08'),
(45,8,'INSTALLATION_PLUMBER_ASSIGNED','MATERIALS_COLLECTED','INSTALLATION_IN_PROGRESS','techn2','TECHNICAL','Plumber Addisu Mesfin assigned for physical water line installation. ','2026-09-11 18:31:45'),
(46,8,'INSTALLATION_COMPLETED','INSTALLATION_IN_PROGRESS','INSTALLATION_COMPLETED','techn2','TECHNICAL','Physical line connection completed and approved by Technical Officer. Ready for customer activation.','2026-09-11 18:31:52'),
(47,8,'CUSTOMER_ACTIVATED','INSTALLATION_COMPLETED','FINAL_ACTIVATION_COMPLETED','custom2','CUSTOMER_SERVICE','Customer fully activated into billing system. Account: 203335, Meter: 784oi, Initial Reading: 0.0, Coordinates: null','2026-09-11 18:34:11'),
(48,9,'APPLICATION_CREATED',NULL,'PENDING_SURVEY_ASSIGNMENT','customers','CUSTOMER_SERVICE','New line connection application registered. Applicant: ምስጋነው ያዜ እውነቱ','2026-09-13 11:53:26'),
(49,9,'SURVEY_PLUMBER_ASSIGNED','PENDING_SURVEY_ASSIGNMENT','SURVEY_IN_PROGRESS','techn','TECHNICAL','Plumber አለሙ ተፈራ assigned for on-site survey. ','2026-09-13 11:55:56'),
(50,9,'SURVEY_SUBMITTED','SURVEY_IN_PROGRESS','PENDING_PAYMENT_APPROVAL','techn','TECHNICAL','Materials & fees encoded. Utility: ETB 21710.00, Outside: ETB 4200.00, 55% Service: ETB 14250.50, 25% Transport: ETB 5427.50, Fees: ETB 275.00, Total Payable: ETB 41663.00','2026-09-13 11:59:59'),
(51,9,'PAYMENT_APPROVED','PENDING_PAYMENT_APPROVAL','PENDING_STORE_COLLECTION','gebe','REVENUE','Payment approved by Revenue Officer. Receipt: reci-858585, Ref:  (prices/items reviewed & updated)','2026-09-13 12:04:00'),
(52,10,'APPLICATION_CREATED',NULL,'PENDING_SURVEY_ASSIGNMENT','custom2','CUSTOMER_SERVICE','New line connection application registered. Applicant: ጋሽነት አበጋዝ አሊ','2026-09-13 12:21:27'),
(53,10,'SURVEY_PLUMBER_ASSIGNED','PENDING_SURVEY_ASSIGNMENT','SURVEY_IN_PROGRESS','techn2','TECHNICAL','Plumber Addisu Mesfin assigned for on-site survey. ','2026-09-13 12:22:34'),
(54,10,'SURVEY_SUBMITTED','SURVEY_IN_PROGRESS','PENDING_PAYMENT_APPROVAL','techn2','TECHNICAL','Materials & fees encoded. Utility: ETB 1091.44, Outside: ETB 0.00, 55% Service: ETB 600.29, 25% Transport: ETB 272.86, Fees: ETB 405.00, Total Payable: ETB 2369.59','2026-09-13 12:24:57'),
(55,10,'PAYMENT_APPROVED','PENDING_PAYMENT_APPROVAL','PENDING_STORE_COLLECTION','3gebe','REVENUE','Payment approved by Revenue Officer. Receipt: 7888888999, Ref:  (prices/items reviewed & updated)','2026-09-13 12:49:17'),
(56,10,'MATERIALS_DISPATCHED','PENDING_STORE_COLLECTION','MATERIALS_COLLECTED','3store','INVENTORY','Utility materials issued from store \'branch 3\' and dispatched to customer by storekeeper: 3store (Voucher: ISV-NLC-NLC-2026-00010, Journal: JE-INV-2026-1789303838026)','2026-09-13 12:50:38'),
(57,10,'INSTALLATION_PLUMBER_ASSIGNED','MATERIALS_COLLECTED','INSTALLATION_IN_PROGRESS','techn2','TECHNICAL','Plumber Addisu Mesfin assigned for physical water line installation. ','2026-09-13 12:52:32'),
(58,10,'INSTALLATION_COMPLETED','INSTALLATION_IN_PROGRESS','INSTALLATION_COMPLETED','techn2','TECHNICAL','Physical line connection completed and approved by Technical Officer. Ready for customer activation.','2026-09-13 12:52:39'),
(59,10,'CUSTOMER_ACTIVATED','INSTALLATION_COMPLETED','FINAL_ACTIVATION_COMPLETED','custom2','CUSTOMER_SERVICE','Customer fully activated into billing system. Account: 103336, Meter: 566666, Initial Reading: 0.0, Coordinates: 885','2026-09-13 12:53:40'),
(60,11,'APPLICATION_CREATED',NULL,'PENDING_SURVEY_ASSIGNMENT','custom2','CUSTOMER_SERVICE','New line connection application registered. Applicant: አብርሀም አሞኘ ብርሀኑ','2026-09-13 13:54:30'),
(61,11,'SURVEY_PLUMBER_ASSIGNED','PENDING_SURVEY_ASSIGNMENT','SURVEY_IN_PROGRESS','techn2','TECHNICAL','Plumber Addisu Mesfin assigned for on-site survey. ','2026-09-13 13:55:28'),
(62,11,'SURVEY_SUBMITTED','SURVEY_IN_PROGRESS','PENDING_PAYMENT_APPROVAL','techn2','TECHNICAL','Materials & fees encoded. Utility: ETB 782.72, Outside: ETB 0.00, 55% Service: ETB 430.50, 25% Transport: ETB 195.68, Fees: ETB 315.00, Total Payable: ETB 1723.90','2026-09-13 13:56:56'),
(63,11,'PAYMENT_APPROVED','PENDING_PAYMENT_APPROVAL','PENDING_STORE_COLLECTION','3gebe','REVENUE','Payment approved by Revenue Officer. Receipt: 89898989, Ref:  (prices/items reviewed & updated)','2026-09-13 14:16:02'),
(64,11,'MATERIALS_DISPATCHED','PENDING_STORE_COLLECTION','MATERIALS_COLLECTED','3store','INVENTORY','Utility materials issued from store \'branch 3\' and dispatched to customer by storekeeper: 3store (Voucher: ISV-NLC-NLC-2026-00011, Journal: JE-INV-2026-1789309458300)','2026-09-13 14:24:18'),
(65,11,'INSTALLATION_PLUMBER_ASSIGNED','MATERIALS_COLLECTED','INSTALLATION_IN_PROGRESS','techn2','TECHNICAL','Plumber Addisu Mesfin assigned for physical water line installation. ','2026-09-13 14:26:14'),
(66,7,'MATERIALS_DISPATCHED','PENDING_STORE_COLLECTION','MATERIALS_COLLECTED','3store','INVENTORY','Utility materials issued from store \'branch 3\' and dispatched to customer by storekeeper: 3store (Voucher: ISV-NLC-NLC-2026-00007, Journal: JE-INV-2026-1789318858119)','2026-09-13 17:00:58');
/*!40000 ALTER TABLE `custom_new_line_activity_log` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*M!100616 SET NOTE_VERBOSITY=@OLD_NOTE_VERBOSITY */;

-- Dump completed on 2026-09-17 12:24:28

-- Table: custom_new_line_additional_fee
/*M!999999\- enable the sandbox mode */ 
-- MariaDB dump 10.19-11.5.2-MariaDB, for Win64 (AMD64)
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
/*M!100616 SET @OLD_NOTE_VERBOSITY=@@NOTE_VERBOSITY, NOTE_VERBOSITY=0 */;

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
  `unit_name` varchar(50) DEFAULT 'ብር',
  `quantity` decimal(10,2) NOT NULL DEFAULT 1.00,
  `unit_price` decimal(15,2) NOT NULL DEFAULT 0.00,
  `total_price` decimal(15,2) NOT NULL DEFAULT 0.00,
  `remarks` varchar(500) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `request_id` (`request_id`),
  KEY `fee_type_id` (`fee_type_id`),
  CONSTRAINT `custom_new_line_additional_fee_ibfk_1` FOREIGN KEY (`request_id`) REFERENCES `custom_new_line_connection_request` (`id`) ON DELETE CASCADE,
  CONSTRAINT `custom_new_line_additional_fee_ibfk_2` FOREIGN KEY (`fee_type_id`) REFERENCES `custom_additional_fee_type` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=55 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `custom_new_line_additional_fee`
--

LOCK TABLES `custom_new_line_additional_fee` WRITE;
/*!40000 ALTER TABLE `custom_new_line_additional_fee` DISABLE KEYS */;
INSERT INTO `custom_new_line_additional_fee` (`id`, `request_id`, `fee_type_id`, `fee_name`, `fee_name_am`, `unit_name`, `quantity`, `unit_price`, `total_price`, `remarks`) VALUES (1,2,1,'የዳሰሳ ጥናት ክፍያ','የዳሰሳ ጥናት ክፍያ','ብር',1.00,40.00,40.00,''),
(2,2,2,'ከተቆጣጣሪ / ቁፋሮ','ከተቆጣጣሪ / ቁፋሮ','ብር',1.00,50.00,50.00,''),
(3,2,3,'ፎቶ ኮፒ','ፎቶ ኮፒ','ብር',1.00,6.00,6.00,''),
(4,2,4,'ሰነድ / ደረሰኝ','ሰነድ / ደረሰኝ','ብር',1.00,4.00,4.00,''),
(5,2,5,'ስቴከር','ስቴከር','ብር',1.00,5.00,5.00,''),
(6,3,1,'የዳሰሳ ጥናት ክፍያ','የዳሰሳ ጥናት ክፍያ','ብር',1.00,40.00,40.00,''),
(7,3,2,'ከተቆጣጣሪ / ቁፋሮ','ከተቆጣጣሪ / ቁፋሮ','ብር',1.00,50.00,50.00,''),
(8,3,3,'ፎቶ ኮፒ','ፎቶ ኮፒ','ብር',1.00,6.00,6.00,''),
(9,3,4,'ሰነድ / ደረሰኝ','ሰነድ / ደረሰኝ','ብር',1.00,4.00,4.00,''),
(10,3,5,'ስቴከር','ስቴከር','ብር',1.00,5.00,5.00,''),
(11,3,6,'ታምብ','ታምብ','ብር',1.00,70.00,70.00,''),
(12,5,1,'የዳሰሳ ጥናት ክፍያ','የዳሰሳ ጥናት ክፍያ','ብር',1.00,40.00,40.00,''),
(13,5,2,'ከተቆጣጣሪ / ቁፋሮ','ከተቆጣጣሪ / ቁፋሮ','ብር',1.00,50.00,50.00,''),
(14,5,3,'ፎቶ ኮፒ','ፎቶ ኮፒ','ብር',1.00,6.00,6.00,''),
(15,5,4,'ሰነድ / ደረሰኝ','ሰነድ / ደረሰኝ','ብር',1.00,4.00,4.00,''),
(16,5,5,'ስቴከር','ስቴከር','ብር',1.00,5.00,5.00,''),
(17,5,6,'ታምብ','ታምብ','ብር',1.00,70.00,70.00,''),
(18,6,1,'የዳሰሳ ጥናት ክፍያ','የዳሰሳ ጥናት ክፍያ','ብር',1.00,40.00,40.00,''),
(19,6,2,'ከተቆጣጣሪ / ቁፋሮ','ከተቆጣጣሪ / ቁፋሮ','ብር',1.00,50.00,50.00,''),
(20,6,3,'ፎቶ ኮፒ','ፎቶ ኮፒ','ብር',1.00,6.00,6.00,''),
(21,6,4,'ሰነድ / ደረሰኝ','ሰነድ / ደረሰኝ','ብር',1.00,4.00,4.00,''),
(22,6,5,'ስቴከር','ስቴከር','ብር',1.00,5.00,5.00,''),
(23,6,6,'ታምብ','ታምብ','ብር',1.00,70.00,70.00,''),
(24,7,1,'የዳሰሳ ጥናት ክፍያ','የዳሰሳ ጥናት ክፍያ','ብር',1.00,40.00,40.00,''),
(25,7,2,'ከተቆጣጣሪ / ቁፋሮ','ከተቆጣጣሪ / ቁፋሮ','ብር',1.00,50.00,50.00,''),
(26,7,3,'ፎቶ ኮፒ','ፎቶ ኮፒ','ብር',1.00,6.00,6.00,''),
(27,7,4,'ሰነድ / ደረሰኝ','ሰነድ / ደረሰኝ','ብር',1.00,4.00,4.00,''),
(28,7,5,'ስቴከር','ስቴከር','ብር',1.00,5.00,5.00,''),
(29,7,6,'ታምብ','ታምብ','ብር',1.00,70.00,70.00,''),
(30,8,1,'የዳሰሳ ጥናት ክፍያ','የዳሰሳ ጥናት ክፍያ','ብር',1.00,40.00,40.00,''),
(31,8,2,'ከተቆጣጣሪ / ቁፋሮ','ከተቆጣጣሪ / ቁፋሮ','ብር',1.00,50.00,50.00,''),
(32,8,3,'ፎቶ ኮፒ','ፎቶ ኮፒ','ብር',1.00,6.00,6.00,''),
(33,8,4,'ሰነድ / ደረሰኝ','ሰነድ / ደረሰኝ','ብር',1.00,4.00,4.00,''),
(34,8,5,'ስቴከር','ስቴከር','ብር',1.00,5.00,5.00,''),
(35,8,6,'ታምብ','ታምብ','ብር',1.00,70.00,70.00,''),
(36,9,1,'የዳሰሳ ጥናት ክፍያ','የዳሰሳ ጥናት ክፍያ','ብር',1.00,40.00,40.00,''),
(37,9,2,'ከተቆጣጣሪ / ቁፋሮ','ከተቆጣጣሪ / ቁፋሮ','ብር',3.00,50.00,150.00,''),
(38,9,3,'ፎቶ ኮፒ','ፎቶ ኮፒ','ብር',1.00,6.00,6.00,''),
(39,9,4,'ሰነድ / ደረሰኝ','ሰነድ / ደረሰኝ','ብር',1.00,4.00,4.00,''),
(40,9,5,'ስቴከር','ስቴከር','ብር',1.00,5.00,5.00,''),
(41,9,6,'ታምብ','ታምብ','ብር',1.00,70.00,70.00,''),
(42,10,1,'የዳሰሳ ጥናት ክፍያ','የዳሰሳ ጥናት ክፍያ','ብር',6.00,40.00,240.00,''),
(43,10,2,'ከተቆጣጣሪ / ቁፋሮ','ከተቆጣጣሪ / ቁፋሮ','ብር',1.00,50.00,50.00,''),
(44,10,3,'ፎቶ ኮፒ','ፎቶ ኮፒ','ብር',1.00,6.00,6.00,''),
(45,10,4,'ሰነድ / ደረሰኝ','ሰነድ / ደረሰኝ','ብር',1.00,4.00,4.00,''),
(46,10,5,'ስቴከር','ስቴከር','ብር',1.00,5.00,5.00,''),
(47,10,6,'ታምብ','ታምብ','ብር',1.00,70.00,70.00,''),
(48,10,NULL,'montarbox21','montarbox21','ብር',1.00,30.00,30.00,''),
(49,11,1,'የዳሰሳ ጥናት ክፍያ','የዳሰሳ ጥናት ክፍያ','ብር',2.00,40.00,80.00,''),
(50,11,2,'ከተቆጣጣሪ / ቁፋሮ','ከተቆጣጣሪ / ቁፋሮ','ብር',3.00,50.00,150.00,''),
(51,11,3,'ፎቶ ኮፒ','ፎቶ ኮፒ','ብር',1.00,6.00,6.00,''),
(52,11,4,'ሰነድ / ደረሰኝ','ሰነድ / ደረሰኝ','ብር',1.00,4.00,4.00,''),
(53,11,5,'ስቴከር','ስቴከር','ብር',1.00,5.00,5.00,''),
(54,11,6,'ታምብ','ታምብ','ብር',1.00,70.00,70.00,'');
/*!40000 ALTER TABLE `custom_new_line_additional_fee` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*M!100616 SET NOTE_VERBOSITY=@OLD_NOTE_VERBOSITY */;

-- Dump completed on 2026-09-17 12:24:28

-- Table: custom_new_line_item
/*M!999999\- enable the sandbox mode */ 
-- MariaDB dump 10.19-11.5.2-MariaDB, for Win64 (AMD64)
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
/*M!100616 SET @OLD_NOTE_VERBOSITY=@@NOTE_VERBOSITY, NOTE_VERBOSITY=0 */;

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
  `unit_of_measure` varchar(50) DEFAULT 'በቁጥር',
  `surveyed_quantity` decimal(12,2) NOT NULL DEFAULT 0.00,
  `utility_quantity` decimal(12,2) NOT NULL DEFAULT 0.00,
  `utility_unit_price` decimal(15,2) NOT NULL DEFAULT 0.00,
  `utility_total_price` decimal(15,2) NOT NULL DEFAULT 0.00,
  `outside_quantity` decimal(12,2) NOT NULL DEFAULT 0.00,
  `outside_unit_price` decimal(15,2) NOT NULL DEFAULT 0.00,
  `outside_total_price` decimal(15,2) NOT NULL DEFAULT 0.00,
  `remarks` varchar(500) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `request_id` (`request_id`),
  KEY `common_material_id` (`common_material_id`),
  KEY `inv_item_id` (`inv_item_id`),
  CONSTRAINT `custom_new_line_item_ibfk_1` FOREIGN KEY (`request_id`) REFERENCES `custom_new_line_connection_request` (`id`) ON DELETE CASCADE,
  CONSTRAINT `custom_new_line_item_ibfk_2` FOREIGN KEY (`common_material_id`) REFERENCES `custom_common_material` (`id`) ON DELETE SET NULL,
  CONSTRAINT `custom_new_line_item_ibfk_3` FOREIGN KEY (`inv_item_id`) REFERENCES `inv_item` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=87 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `custom_new_line_item`
--

LOCK TABLES `custom_new_line_item` WRITE;
/*!40000 ALTER TABLE `custom_new_line_item` DISABLE KEYS */;
INSERT INTO `custom_new_line_item` (`id`, `request_id`, `common_material_id`, `inv_item_id`, `item_name`, `item_name_am`, `unit_of_measure`, `surveyed_quantity`, `utility_quantity`, `utility_unit_price`, `utility_total_price`, `outside_quantity`, `outside_unit_price`, `outside_total_price`, `remarks`) VALUES (2,2,1,NULL,'ቢ.ባ. ኤች.ዲ.ፒ. 1/2\"','ቢ.ባ. ኤች.ዲ.ፒ. 1/2\"','ሜትር',1.00,1.00,35.36,35.36,0.00,0.00,0.00,''),
(6,3,4,NULL,'ፊሜል አዳፕተር 1/2\"','ፊሜል አዳፕተር 1/2\"','በቁጥር',3.00,3.00,35.00,105.00,0.00,0.00,0.00,''),
(7,3,4,NULL,'ፊሜል አዳፕተር 1/2\"','ፊሜል አዳፕተር 1/2\"','በቁጥር',1.00,1.00,35.00,35.00,0.00,0.00,0.00,''),
(8,3,7,NULL,'ኮምፕሬሽን ቲ 1/2\"','ኮምፕሬሽን ቲ 1/2\"','በቁጥር',1.00,1.00,17.00,17.00,0.00,0.00,0.00,''),
(16,5,1,3,'ቢ.ባ. ኤች.ዲ.ፒ. 1/2\"','ቢ.ባ. ኤች.ዲ.ፒ. 1/2\"','ሜትር',3.00,3.00,800.00,2400.00,0.00,0.00,0.00,''),
(17,5,2,NULL,'ቧንቧ 1/2\"','ቧንቧ 1/2\"','በቁጥር',6.00,0.00,0.00,0.00,6.00,650.00,3900.00,''),
(18,5,3,NULL,'ሜል አዳፕተር 1/2\"','ሜል አዳፕተር 1/2\"','በቁጥር',5.00,0.00,0.00,0.00,5.00,190.00,950.00,''),
(19,5,4,NULL,'ፊሜል አዳፕተር 1/2\"','ፊሜል አዳፕተር 1/2\"','በቁጥር',4.00,0.00,0.00,0.00,4.00,35.00,140.00,''),
(20,5,5,NULL,'ዩኒየን /ሲግናል ሳድል 1 1/2\" - 1\"','ዩኒየን /ሲግናል ሳድል 1 1/2\" - 1\"','በቁጥር',3.00,0.00,0.00,0.00,3.00,69.00,207.00,''),
(21,5,6,NULL,'ፊሜል ትሬዴት 1/2\"','ፊሜል ትሬዴት 1/2\"','በቁጥር',8.00,0.00,0.00,0.00,8.00,60.00,480.00,''),
(22,5,12,2,'የውሃ ቆጣሪ 1/2\"','የውሃ ቆጣሪ 1/2\"','በቁጥር',6.20,6.20,800.00,4960.00,0.00,0.00,0.00,''),
(27,6,1,3,'ቢ.ባ. ኤች.ዲ.ፒ. 1/2\"','ቢ.ባ. ኤች.ዲ.ፒ. 1/2\"','ሜትር',2.00,2.00,600.00,1200.00,0.00,0.00,0.00,''),
(28,6,2,NULL,'ቧንቧ 1/2\"','ቧንቧ 1/2\"','በቁጥር',10.00,0.00,0.00,0.00,10.00,44.08,440.80,''),
(29,6,12,2,'የውሃ ቆጣሪ 1/2\"','የውሃ ቆጣሪ 1/2\"','በቁጥር',10.00,10.00,800.00,8000.00,0.00,0.00,0.00,''),
(30,6,17,NULL,'ጋልቫናይዝድ ፓይፕ','ጋልቫናይዝድ ፓይፕ','በቁጥር',5.00,0.00,0.00,0.00,5.00,250.00,1250.00,''),
(33,7,11,NULL,'ቴፍሎን ቴፕ','ቴፍሎን ቴፕ','በቁጥር',2.00,0.00,0.00,0.00,2.00,25.00,50.00,''),
(34,7,12,2,'የውሃ ቆጣሪ 1/2\"','የውሃ ቆጣሪ 1/2\"','በቁጥር',8.00,8.00,800.00,6400.00,0.00,0.00,0.00,''),
(38,8,1,3,'ቢ.ባ. ኤች.ዲ.ፒ. 1/2\"','ቢ.ባ. ኤች.ዲ.ፒ. 1/2\"','ሜትር',10.00,0.00,0.00,0.00,10.00,35.36,353.60,''),
(39,8,3,NULL,'ሜል አዳፕተር 1/2\"','ሜል አዳፕተር 1/2\"','በቁጥር',5.00,0.00,0.00,0.00,5.00,149.50,747.50,''),
(40,8,14,NULL,'ጌት ቫልቭ 1/2\"','ጌት ቫልቭ 1/2\"','በቁጥር',20.00,0.00,0.00,0.00,20.00,110.00,2200.00,''),
(49,9,1,3,'ቢ.ባ. ኤች.ዲ.ፒ. 1/2\"','ቢ.ባ. ኤች.ዲ.ፒ. 1/2\"','ሜትር',3.00,3.00,600.00,1800.00,0.00,0.00,0.00,''),
(50,9,2,4,'ቧንቧ 1/2\"','ቧንቧ 1/2\"','በቁጥር',2.00,2.00,38.00,76.00,0.00,0.00,0.00,''),
(51,9,3,5,'ሜል አዳፕተር 1/2\"','ሜል አዳፕተር 1/2\"','በቁጥር',100.00,100.00,120.00,12000.00,0.00,0.00,0.00,''),
(52,9,4,5,'ፊሜል አዳፕተር 1/2\"','ፊሜል አዳፕተር 1/2\"','በቁጥር',50.00,50.00,120.00,6000.00,0.00,0.00,0.00,''),
(53,9,5,7,'ዩኒየን /ሲግናል ሳድል 1 1/2\" - 1\"','ዩኒየን /ሲግናል ሳድል 1 1/2\" - 1\"','በቁጥር',2.00,2.00,55.00,110.00,0.00,0.00,0.00,''),
(54,9,6,6,'ፊሜል ትሬዴት 1/2\"','ፊሜል ትሬዴት 1/2\"','በቁጥር',10.00,10.00,28.00,280.00,0.00,0.00,0.00,''),
(55,9,7,14,'ኮምፕሬሽን ቲ 1/2\"','ኮምፕሬሽን ቲ 1/2\"','በቁጥር',100.00,100.00,14.00,1400.00,0.00,0.00,0.00,''),
(56,9,15,12,'ኒፕል 1/2\"','ኒፕል 1/2\"','በቁጥር',2.00,2.00,22.00,44.00,0.00,0.00,0.00,''),
(67,10,1,3,'ቢ.ባ. ኤች.ዲ.ፒ. 1/2\"','ቢ.ባ. ኤች.ዲ.ፒ. 1/2\"','ሜትር',4.00,4.00,35.36,141.44,0.00,0.00,0.00,''),
(68,10,2,4,'ቧንቧ 1/2\"','ቧንቧ 1/2\"','በቁጥር',2.00,2.00,38.00,76.00,0.00,0.00,0.00,''),
(69,10,3,5,'ሜል አዳፕተር 1/2\"','ሜል አዳፕተር 1/2\"','በቁጥር',2.00,2.00,120.00,240.00,0.00,0.00,0.00,''),
(70,10,4,5,'ፊሜል አዳፕተር 1/2\"','ፊሜል አዳፕተር 1/2\"','በቁጥር',2.00,2.00,120.00,240.00,0.00,0.00,0.00,''),
(71,10,6,6,'ፊሜል ትሬዴት 1/2\"','ፊሜል ትሬዴት 1/2\"','በቁጥር',2.00,2.00,28.00,56.00,0.00,0.00,0.00,''),
(72,10,7,14,'ኮምፕሬሽን ቲ 1/2\"','ኮምፕሬሽን ቲ 1/2\"','በቁጥር',2.00,2.00,14.00,28.00,0.00,0.00,0.00,''),
(73,10,8,15,'ኤንድ ካፕ 1/2\"','ኤንድ ካፕ 1/2\"','በቁጥር',2.00,2.00,24.00,48.00,0.00,0.00,0.00,''),
(74,10,13,11,'ክላምፕ ሳድል','ክላምፕ ሳድል','በቁጥር',2.00,2.00,65.00,130.00,0.00,0.00,0.00,''),
(75,10,14,9,'ጌት ቫልቭ 1/2\"','ጌት ቫልቭ 1/2\"','በቁጥር',1.00,1.00,88.00,88.00,0.00,0.00,0.00,''),
(76,10,15,12,'ኒፕል 1/2\"','ኒፕል 1/2\"','በቁጥር',2.00,2.00,22.00,44.00,0.00,0.00,0.00,''),
(82,11,1,3,'ቢ.ባ. ኤች.ዲ.ፒ. 1/2\"','ቢ.ባ. ኤች.ዲ.ፒ. 1/2\"','ሜትር',2.00,2.00,35.36,70.72,0.00,0.00,0.00,''),
(83,11,2,4,'ቧንቧ 1/2\"','ቧንቧ 1/2\"','በቁጥር',4.00,4.00,38.00,152.00,0.00,0.00,0.00,''),
(84,11,3,5,'ሜል አዳፕተር 1/2\"','ሜል አዳፕተር 1/2\"','በቁጥር',1.00,1.00,120.00,120.00,0.00,0.00,0.00,''),
(85,11,5,7,'ዩኒየን /ሲግናል ሳድል 1 1/2\" - 1\"','ዩኒየን /ሲግናል ሳድል 1 1/2\" - 1\"','በቁጥር',8.00,8.00,55.00,440.00,0.00,0.00,0.00,''),
(86,11,NULL,NULL,'mnter','mnter','በቁጥር',2.00,0.00,0.00,0.00,2.00,0.00,0.00,'');
/*!40000 ALTER TABLE `custom_new_line_item` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*M!100616 SET NOTE_VERBOSITY=@OLD_NOTE_VERBOSITY */;

-- Dump completed on 2026-09-17 12:24:28


-- Re-enable foreign key checks
SET FOREIGN_KEY_CHECKS = 1;

-- ============================================================================
-- Export complete
-- ============================================================================
