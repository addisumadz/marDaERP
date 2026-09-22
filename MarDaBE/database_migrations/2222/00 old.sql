
SET FOREIGN_KEY_CHECKS = 0;
SET NAMES utf8mb4;
SET CHARACTER SET utf8mb4;

-- ============================================================================
-- SECTION 1: NEW TABLES - Schema + Data (dependency order)
-- ============================================================================

-- -------------------------------------------------------
-- 1.1 dashboard_summary (no FK dependencies, 87 rows)
-- -------------------------------------------------------
DROP TABLE IF EXISTS `dashboard_summary`;
CREATE TABLE `dashboard_summary` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `total_active_customers` int(11) DEFAULT NULL,
  `total_deactivated_customers` int(11) DEFAULT NULL,
  `total_deleted_customers` int(11) DEFAULT NULL,
  `customers_without_reading` bigint(20) DEFAULT NULL,
  `active_billing_month` varchar(255) DEFAULT NULL,
  `active_billing_year` int(11) DEFAULT NULL,
  `active_reading_date` date DEFAULT NULL,
  `total_bills_generated` int(11) DEFAULT NULL,
  `total_consumption_m3` double DEFAULT NULL,
  `total_wuzif_consumption_m3` double DEFAULT NULL,
  `total_additional_fees` double DEFAULT NULL,
  `total_derek_koshasha` double DEFAULT NULL,
  `total_wuzif_amount` double DEFAULT NULL,
  `total_penalty` double DEFAULT NULL,
  `total_prepaid` double DEFAULT NULL,
  `total_paid_amount` double DEFAULT NULL,
  `total_expected_amount` double DEFAULT NULL,
  `paid_yezih_wer_fjota_kfya` double DEFAULT NULL,
  `total_yezih_wer_fjota_kfya` double DEFAULT NULL,
  `paid_kotari_kiray` double DEFAULT NULL,
  `total_kotari_kiray` double DEFAULT NULL,
  `paid_techemari_kfya` double DEFAULT NULL,
  `total_techemari_kfya` double DEFAULT NULL,
  `paid_additional_hisab` double DEFAULT NULL,
  `paid_wuzif_kotari_kiray` double DEFAULT NULL,
  `total_wuzif_kotari_kiray` double DEFAULT NULL,
  `paid_wuzif_techemari_kfya` double DEFAULT NULL,
  `total_wuzif_techemari_kfya` double DEFAULT NULL,
  `paid_kitat` double DEFAULT NULL,
  `paid_wuzif_fjota_kfya` double DEFAULT NULL,
  `total_wuzif_fjota_kfya` double DEFAULT NULL,
  `paid_wuzif_derek_koshasha` double DEFAULT NULL,
  `total_wuzif_derek_koshasha` double DEFAULT NULL,
  `paid_wuzif_hisab` double DEFAULT NULL,
  `total_wuzif_fjota` double DEFAULT NULL,
  `mobile_reader_stats` longtext DEFAULT NULL,
  `payment_location_stats` longtext DEFAULT NULL,
  `last_updated` datetime DEFAULT NULL,
  `updated_by` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=89 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;





-- -------------------------------------------------------
-- 1.3 login_attempts (no FK dependencies, 82 rows)
-- -------------------------------------------------------
DROP TABLE IF EXISTS `login_attempts`;
CREATE TABLE `login_attempts` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `username` varchar(100) NOT NULL COMMENT 'Username attempting to log in',
  `ip_address` varchar(45) NOT NULL COMMENT 'IP address of the login attempt (supports IPv4 and IPv6)',
  `attempt_time` datetime NOT NULL COMMENT 'Timestamp of the login attempt',
  `success` tinyint(1) NOT NULL COMMENT 'Whether the login was successful',
  `failure_reason` varchar(255) DEFAULT NULL COMMENT 'Reason for failed login (e.g., Invalid credentials, Account locked)',
  PRIMARY KEY (`id`),
  KEY `idx_username_time` (`username`,`attempt_time`),
  KEY `idx_ip_address_time` (`ip_address`,`attempt_time`)
) ENGINE=InnoDB AUTO_INCREMENT=603 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Tracks login attempts for security monitoring and account lockout';


SET FOREIGN_KEY_CHECKS = 1;
