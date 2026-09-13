-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1:3307
-- Generation Time: Sep 14, 2026 at 02:01 PM
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
-- Table structure for table `wf_workflow_action`
--

DROP TABLE IF EXISTS `wf_workflow_action`;
CREATE TABLE IF NOT EXISTS `wf_workflow_action` (
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

--
-- Dumping data for table `wf_workflow_action`
--

INSERT INTO `wf_workflow_action` (`id`, `instance_id`, `step_id`, `action`, `acted_by`, `acted_at`, `comments`) VALUES
(1, 1, 1, 'APPROVED', 'mstore', '2026-09-07 13:48:34', 'Approved'),
(2, 1, 2, 'APPROVED', 'fhead', '2026-09-07 13:49:26', 'Approved'),
(3, 1, 3, 'APPROVED', 'pofficer', '2026-09-07 14:11:39', 'Approved'),
(4, 1, 3, 'APPROVED', 'pofficer', '2026-09-07 14:12:15', 'Approved'),
(5, 1, 3, 'APPROVED', 'pofficer', '2026-09-07 14:12:55', 'Approved'),
(6, 1, 3, 'APPROVED', 'pofficer', '2026-09-07 14:16:31', 'Approved'),
(7, 1, 3, 'APPROVED', 'pofficer', '2026-09-07 14:18:19', 'Approved'),
(8, 1, 3, 'APPROVED', 'pofficer', '2026-09-07 14:19:08', 'Approved'),
(9, 1, 3, 'APPROVED', 'pofficer', '2026-09-07 14:19:19', 'Approved'),
(10, 1, 3, 'APPROVED', 'pofficer', '2026-09-07 14:26:21', 'Approved'),
(11, 2, 1, 'APPROVED', 'badmin', '2026-09-07 15:00:28', 'Approved'),
(12, 2, 2, 'APPROVED', 'fhead', '2026-09-07 15:01:52', 'Approved'),
(13, 2, 3, 'APPROVED', 'pofficer', '2026-09-07 15:02:24', 'Approved'),
(14, 3, 4, 'APPROVED', 'fhead', '2026-09-07 17:45:50', 'Approved'),
(15, 4, 1, 'APPROVED', 'badmin', '2026-09-08 10:37:01', 'Approved'),
(16, 4, 2, 'APPROVED', 'fhead', '2026-09-08 10:37:46', 'Approved'),
(17, 4, 3, 'APPROVED', 'pofficer', '2026-09-08 10:38:12', 'Approved'),
(18, 5, 4, 'APPROVED', 'fhead', '2026-09-08 10:41:03', 'Approved'),
(19, 5, 5, 'APPROVED', 'reading2', '2026-09-08 10:42:03', 'Approved'),
(20, 6, 1, 'APPROVED', 'badmin', '2026-09-08 12:16:56', 'Approved'),
(21, 6, 2, 'APPROVED', 'fhead', '2026-09-08 12:17:37', 'Approved'),
(22, 6, 3, 'APPROVED', 'pofficer', '2026-09-08 12:18:16', 'Approved'),
(23, 7, 4, 'APPROVED', 'fhead', '2026-09-08 12:20:49', 'Approved'),
(24, 8, 6, 'APPROVED', 'badmin', '2026-09-08 14:20:45', 'Approved'),
(25, 8, 10, 'APPROVED', 'fhead', '2026-09-08 14:22:44', 'Approved');

-- --------------------------------------------------------

--
-- Table structure for table `wf_workflow_instance`
--

DROP TABLE IF EXISTS `wf_workflow_instance`;
CREATE TABLE IF NOT EXISTS `wf_workflow_instance` (
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

--
-- Dumping data for table `wf_workflow_instance`
--

INSERT INTO `wf_workflow_instance` (`id`, `template_id`, `document_type`, `document_id`, `document_number`, `current_step_id`, `status`, `initiated_by`, `initiated_at`, `completed_at`, `total_amount`, `branch_id`) VALUES
(1, 1, 'PURCHASE_REQUISITION', 4, 'PR-2026-00004', NULL, 'COMPLETED', 'mstore', '2026-09-07 13:46:35', '2026-09-07 17:52:07', 148500.00, NULL),
(2, 1, 'PURCHASE_REQUISITION', 5, 'PR-2026-00005', NULL, 'COMPLETED', 'mstore', '2026-09-07 14:58:56', '2026-09-07 15:02:24', 2300.00, NULL),
(3, 2, 'PURCHASE_ORDER', 1, 'PO-2026-00001', NULL, 'COMPLETED', 'pofficer', '2026-09-07 17:39:28', '2026-09-07 17:45:50', 2645.00, 1),
(4, 1, 'PURCHASE_REQUISITION', 6, 'PR-2026-00006', NULL, 'COMPLETED', 'mstore', '2026-09-08 10:36:07', '2026-09-08 10:38:12', 100000.00, NULL),
(5, 2, 'PURCHASE_ORDER', 3, 'PO-2026-00003', NULL, 'COMPLETED', 'pofficer', '2026-09-08 10:40:32', '2026-09-08 10:42:03', 74750.00, 1),
(6, 1, 'PURCHASE_REQUISITION', 7, 'PR-2026-00001', NULL, 'COMPLETED', 'mstore', '2026-09-08 12:16:16', '2026-09-08 12:18:16', 22000.00, NULL),
(7, 2, 'PURCHASE_ORDER', 4, 'PO-2026-00001', NULL, 'COMPLETED', 'pofficer', '2026-09-08 12:20:03', '2026-09-08 12:20:49', 25300.00, 1),
(8, 3, 'STOCK_TRANSFER', 3, 'TRF-2026-00001', NULL, 'COMPLETED', 'mstore', '2026-09-08 14:19:47', '2026-09-08 14:22:44', 9800.00, NULL);

-- --------------------------------------------------------

--
-- Table structure for table `wf_workflow_step`
--

DROP TABLE IF EXISTS `wf_workflow_step`;
CREATE TABLE IF NOT EXISTS `wf_workflow_step` (
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

--
-- Dumping data for table `wf_workflow_step`
--

INSERT INTO `wf_workflow_step` (`id`, `template_id`, `step_order`, `step_name`, `step_name_am`, `approver_role_code`, `is_required`, `min_amount`, `max_amount`, `auto_approve_below`, `sla_hours`, `can_reject`, `notify_on_arrival`, `created_at`) VALUES
(1, 1, 1, 'Branch Manager Approval', 'Branch Manager Approval', 'M_BRANCH_MANAGER', 1, NULL, NULL, NULL, 24, 1, 1, '2026-09-06 17:03:03'),
(2, 1, 2, 'Finance Manager Approval', 'Finance Manager Approval', 'M_FINANCE_HEAD', 1, NULL, NULL, NULL, 48, 1, 1, '2026-09-06 17:03:03'),
(3, 1, 3, 'Purchase Officer Review', 'Purchase Officer Review', 'M_PURCHASING_OFFICER', 1, NULL, NULL, NULL, 24, 1, 1, '2026-09-06 17:03:03'),
(4, 2, 1, 'Finance Head', 'Finance Manager ', 'M_FINANCE_HEAD', 1, NULL, 50000.00, NULL, 48, 1, 1, '2026-09-06 17:03:03'),
(5, 2, 2, 'General Manager', 'General Manager', 'billzgjt', 0, 50000.00, NULL, NULL, 48, 1, 1, '2026-09-06 17:03:03'),
(6, 3, 1, 'Branch Manager', 'Branch Manager', 'M_BRANCH_MANAGER', 1, NULL, NULL, NULL, 24, 1, 1, '2026-09-06 17:03:03'),
(7, 4, 1, 'Store Manager Approval', '????? ??? ???', 'INV_MANAGER', 1, NULL, NULL, NULL, 24, 1, 1, '2026-09-06 17:03:03'),
(8, 4, 2, 'Finance Approval', '?????? ???', 'FNC', 1, NULL, NULL, NULL, 48, 1, 1, '2026-09-06 17:03:03'),
(9, 5, 1, 'Department Manager Approval', '???? ??? ???', 'INV_MANAGER', 1, NULL, NULL, NULL, 24, 1, 1, '2026-09-06 17:03:04'),
(10, 3, 2, 'Finance Head ', 'Finance Head ', 'M_FINANCE_HEAD', 1, NULL, NULL, NULL, 48, 1, 1, '2026-09-08 12:46:32');

-- --------------------------------------------------------

--
-- Table structure for table `wf_workflow_template`
--

DROP TABLE IF EXISTS `wf_workflow_template`;
CREATE TABLE IF NOT EXISTS `wf_workflow_template` (
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

--
-- Dumping data for table `wf_workflow_template`
--

INSERT INTO `wf_workflow_template` (`id`, `template_code`, `template_name`, `document_type`, `description`, `is_active`, `created_by`, `created_at`, `updated_at`) VALUES
(1, 'PR_APPROVAL', 'Purchase Requisition Approval', 'PURCHASE_REQUISITION', 'Standard 3-step approval for purchase requisitions', 1, 'system', '2026-09-06 17:03:03', '2026-09-06 17:03:03'),
(2, 'PO_APPROVAL', 'Purchase Order Approval', 'PURCHASE_ORDER', 'Finance and GM approval for purchase orders', 1, 'system', '2026-09-06 17:03:03', '2026-09-06 17:03:03'),
(3, 'TRANSFER_APPROVAL', 'Stock Transfer Approval', 'STOCK_TRANSFER', 'Manager approval for inter-store transfers', 1, 'system', '2026-09-06 17:03:03', '2026-09-06 17:03:03'),
(4, 'ADJUSTMENT_APPROVAL', 'Stock Adjustment Approval', 'STOCK_ADJUSTMENT', 'Manager and finance approval for adjustments', 1, 'system', '2026-09-06 17:03:03', '2026-09-06 17:03:03'),
(5, 'ISSUE_APPROVAL', 'Issue Voucher Approval', 'ISSUE_VOUCHER', 'Manager approval for material issues', 1, 'system', '2026-09-06 17:03:03', '2026-09-06 17:03:03');
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
