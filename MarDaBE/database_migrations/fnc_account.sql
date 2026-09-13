-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1:3307
-- Generation Time: Aug 16, 2026 at 05:27 PM
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
-- Database: `wbill_wr3`
--

-- --------------------------------------------------------

--
-- Table structure for table `fnc_account`
--

DROP TABLE IF EXISTS `fnc_account`;
CREATE TABLE IF NOT EXISTS `fnc_account` (
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
  KEY `parent_account_id` (`parent_account_id`)
) ENGINE=InnoDB AUTO_INCREMENT=76 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_uca1400_ai_ci;

--
-- Dumping data for table `fnc_account`
--

INSERT INTO `fnc_account` (`id`, `account_code`, `account_name`, `account_name_am`, `account_type`, `parent_account_id`, `is_active`, `is_header`, `normal_balance`, `description`, `created_by`, `created_at`, `updated_at`) VALUES
(1, '1000', 'Assets', 'ንብረቶች', 'ASSET', NULL, 1, 1, 'DEBIT', 'All assets', NULL, '2026-07-08 07:33:09', '2026-07-08 07:33:09'),
(2, '1100', 'Current Assets', 'የአሁን ንብረቶች', 'ASSET', NULL, 1, 1, 'DEBIT', 'Current assets', NULL, '2026-07-08 07:33:09', '2026-07-08 07:33:09'),
(3, '1110', 'Cash on Hand', 'በእጅ ያለ ገንዘብ', 'ASSET', 2, 1, 0, 'DEBIT', 'Physical cash', NULL, '2026-07-08 07:33:09', '2026-07-08 07:33:09'),
(4, '1120', 'Cash at Bank - CBE', 'በባንክ ያለ ገንዘብ - ንግድ ባንክ', 'ASSET', 2, 1, 0, 'DEBIT', 'Commercial Bank of Ethiopia', NULL, '2026-07-08 07:33:09', '2026-07-08 07:33:09'),
(5, '1121', 'Cash at Bank - TeleBirr', 'በባንክ ያለ ገንዘብ - ቴሌ ብር', 'ASSET', 2, 1, 0, 'DEBIT', 'Tele Birr', NULL, '2026-07-08 07:33:09', '2026-08-08 09:42:53'),
(6, '1122', 'Cash at Bank - Dashen', 'በባንክ ያለ ገንዘብ - ዳሽን ባንክ', 'ASSET', 2, 1, 0, 'DEBIT', 'Dashen Bank', NULL, '2026-07-08 07:33:09', '2026-07-08 07:33:09'),
(7, '1123', 'Cash at Bank - Abyssinia', 'በባንክ ያለ ገንዘብ - አቢሲኒያ ባንክ', 'ASSET', 2, 1, 0, 'DEBIT', 'Bank of Abyssinia', NULL, '2026-07-08 07:33:09', '2026-07-08 07:33:09'),
(8, '1130', 'Petty Cash', 'ጥቃቅን ገንዘብ', 'ASSET', 2, 1, 0, 'DEBIT', 'Petty cash fund', NULL, '2026-07-08 07:33:09', '2026-07-08 07:33:09'),
(9, '1200', 'Accounts Receivable', 'የሚሰበሰብ ገንዘብ', 'ASSET', 2, 1, 0, 'DEBIT', 'Money owed by customers', NULL, '2026-07-08 07:33:09', '2026-07-08 07:33:09'),
(10, '1210', 'Water Bill Receivable', 'የውሃ ክፍያ ተሰብሳቢ', 'ASSET', 2, 1, 0, 'DEBIT', 'Outstanding water bills', NULL, '2026-07-08 07:33:09', '2026-07-08 07:33:09'),
(11, '1220', 'Penalty Receivable', 'የቅጣት ተሰብሳቢ', 'ASSET', 2, 1, 0, 'DEBIT', 'Outstanding penalties', NULL, '2026-07-08 07:33:09', '2026-07-08 07:33:09'),
(12, '1230', 'Other Receivables', 'ሌሎች ተሰብሳቢዎች', 'ASSET', 2, 1, 0, 'DEBIT', 'Other amounts receivable', NULL, '2026-07-08 07:33:09', '2026-07-08 07:33:09'),
(13, '1300', 'Prepaid Expenses', 'ቅድመ ክፍያዎች', 'ASSET', 2, 1, 0, 'DEBIT', 'Prepaid expenses', NULL, '2026-07-08 07:33:09', '2026-07-08 07:33:09'),
(14, '1400', 'Inventory - Supplies', 'የእቃ ክምችት', 'ASSET', 2, 1, 0, 'DEBIT', 'Water meters, pipes, supplies', NULL, '2026-07-08 07:33:09', '2026-07-08 07:33:09'),
(15, '1500', 'Fixed Assets', 'ቋሚ ንብረቶች', 'ASSET', NULL, 1, 1, 'DEBIT', 'Long-term assets', NULL, '2026-07-08 07:33:09', '2026-07-08 07:33:09'),
(16, '1510', 'Land', 'መሬት', 'ASSET', 15, 1, 0, 'DEBIT', 'Land owned', NULL, '2026-07-08 07:33:09', '2026-07-08 07:33:09'),
(17, '1520', 'Buildings', 'ሕንፃዎች', 'ASSET', 15, 1, 0, 'DEBIT', 'Office and facility buildings', NULL, '2026-07-08 07:33:09', '2026-07-08 07:33:09'),
(18, '1521', 'Accumulated Depreciation - Buildings', 'የተከማቸ ዋጋ ቅናሽ - ሕንፃዎች', 'ASSET', 15, 1, 0, 'CREDIT', 'Contra asset', NULL, '2026-07-08 07:33:09', '2026-07-08 07:33:09'),
(19, '1530', 'Vehicles', 'ተሽከርካሪዎች', 'ASSET', 15, 1, 0, 'DEBIT', 'Company vehicles', NULL, '2026-07-08 07:33:09', '2026-07-08 07:33:09'),
(20, '1531', 'Accumulated Depreciation - Vehicles', 'የተከማቸ ዋጋ ቅናሽ - ተሽከርካሪዎች', 'ASSET', 15, 1, 0, 'CREDIT', 'Contra asset', NULL, '2026-07-08 07:33:09', '2026-07-08 07:33:09'),
(21, '1540', 'Office Equipment', 'የቢሮ እቃዎች', 'ASSET', 15, 1, 0, 'DEBIT', 'Computers, furniture, etc.', NULL, '2026-07-08 07:33:09', '2026-07-08 07:33:09'),
(22, '1541', 'Accumulated Depreciation - Office Equipment', 'የተከማቸ ዋጋ ቅናሽ - የቢሮ እቃዎች', 'ASSET', 15, 1, 0, 'CREDIT', 'Contra asset', NULL, '2026-07-08 07:33:09', '2026-07-08 07:33:09'),
(23, '1550', 'Water Infrastructure', 'የውሃ መሰረተ ልማት', 'ASSET', 15, 1, 0, 'DEBIT', 'Pipes, pumps, treatment plants', NULL, '2026-07-08 07:33:09', '2026-07-08 07:33:09'),
(24, '1551', 'Accumulated Depreciation - Water Infrastructure', 'የተከማቸ ዋጋ ቅናሽ - የውሃ መሰረተ ልማት', 'ASSET', 15, 1, 0, 'CREDIT', 'Contra asset', NULL, '2026-07-08 07:33:09', '2026-07-08 07:33:09'),
(25, '1560', 'Water Meters', 'የውሃ ቆጣሪዎች', 'ASSET', 15, 1, 0, 'DEBIT', 'Installed water meters', NULL, '2026-07-08 07:33:09', '2026-07-08 07:33:09'),
(26, '1561', 'Accumulated Depreciation - Water Meters', 'የተከማቸ ዋጋ ቅናሽ - የውሃ ቆጣሪዎች', 'ASSET', 15, 1, 0, 'CREDIT', 'Contra asset', NULL, '2026-07-08 07:33:09', '2026-07-08 07:33:09'),
(27, '2000', 'Liabilities', 'እዳዎች', 'LIABILITY', NULL, 1, 1, 'CREDIT', 'All liabilities', NULL, '2026-07-08 07:33:09', '2026-07-08 07:33:09'),
(28, '2100', 'Current Liabilities', 'የአሁን እዳዎች', 'LIABILITY', NULL, 1, 1, 'CREDIT', 'Short-term obligations', NULL, '2026-07-08 07:33:09', '2026-07-08 07:33:09'),
(29, '2110', 'Accounts Payable', 'የሚከፈል ገንዘብ', 'LIABILITY', 28, 1, 0, 'CREDIT', 'Money owed to suppliers', NULL, '2026-07-08 07:33:09', '2026-07-08 07:33:09'),
(30, '2120', 'Salaries Payable', 'የሚከፈል ደመወዝ', 'LIABILITY', 28, 1, 0, 'CREDIT', 'Accrued salaries', NULL, '2026-07-08 07:33:09', '2026-07-08 07:33:09'),
(31, '2130', 'Tax Payable', 'የሚከፈል ግብር', 'LIABILITY', 28, 1, 0, 'CREDIT', 'Taxes owed', NULL, '2026-07-08 07:33:09', '2026-07-08 07:33:09'),
(32, '2131', 'Income Tax Payable', 'የገቢ ግብር', 'LIABILITY', 28, 1, 0, 'CREDIT', 'Employee income tax', NULL, '2026-07-08 07:33:09', '2026-07-08 07:33:09'),
(33, '2132', 'Pension Payable', 'የጡረታ መዋጮ', 'LIABILITY', 28, 1, 0, 'CREDIT', 'Pension contributions', NULL, '2026-07-08 07:33:09', '2026-07-08 07:33:09'),
(34, '2140', 'Customer Deposits', 'የደንበኛ ተቀማጭ', 'LIABILITY', 28, 1, 0, 'CREDIT', 'Water connection deposits', NULL, '2026-07-08 07:33:09', '2026-07-08 07:33:09'),
(35, '2150', 'Advance Payments Received', 'ቅድመ ክፍያ የተቀበለ', 'LIABILITY', 28, 1, 0, 'CREDIT', 'Customer advance payments', NULL, '2026-07-08 07:33:09', '2026-07-08 07:33:09'),
(36, '2160', 'Other Payables', 'ሌሎች ተከፋይ', 'LIABILITY', 28, 1, 0, 'CREDIT', 'Other amounts payable', NULL, '2026-07-08 07:33:09', '2026-07-08 07:33:09'),
(37, '2200', 'Long-term Liabilities', 'የረጅም ጊዜ እዳዎች', 'LIABILITY', NULL, 1, 1, 'CREDIT', 'Long-term obligations', NULL, '2026-07-08 07:33:09', '2026-07-08 07:33:09'),
(38, '2210', 'Bank Loans', 'የባንክ ብድር', 'LIABILITY', 37, 1, 0, 'CREDIT', 'Long-term bank loans', NULL, '2026-07-08 07:33:10', '2026-07-08 07:33:10'),
(39, '2220', 'Government Loans', 'የመንግስት ብድር', 'LIABILITY', 37, 1, 0, 'CREDIT', 'Government funding/loans', NULL, '2026-07-08 07:33:10', '2026-07-08 07:33:10'),
(40, '3000', 'Equity', 'የባለቤትነት ድርሻ', 'EQUITY', NULL, 1, 1, 'CREDIT', 'Owner equity', NULL, '2026-07-08 07:33:10', '2026-07-08 07:33:10'),
(41, '3100', 'Government Capital', 'የመንግስት ካፒታል', 'EQUITY', 40, 1, 0, 'CREDIT', 'Government invested capital', NULL, '2026-07-08 07:33:10', '2026-07-08 07:33:10'),
(42, '3200', 'Retained Earnings', 'ያልተከፋፈለ ትርፍ', 'EQUITY', 40, 1, 0, 'CREDIT', 'Accumulated net income', NULL, '2026-07-08 07:33:10', '2026-07-08 07:33:10'),
(43, '3300', 'Current Year Earnings', 'የዘንድሮ ትርፍ', 'EQUITY', 40, 1, 0, 'CREDIT', 'Current period net income', NULL, '2026-07-08 07:33:10', '2026-07-08 07:33:10'),
(44, '4000', 'Revenue', 'ገቢ', 'REVENUE', NULL, 1, 1, 'CREDIT', 'All revenue', NULL, '2026-07-08 07:33:10', '2026-07-08 07:33:10'),
(45, '4100', 'Water Consumption Revenue', 'የውሃ ፍጆታ ገቢ', 'REVENUE', 44, 1, 0, 'CREDIT', 'Revenue from Water Consumption', NULL, '2026-07-08 07:33:10', '2026-08-08 09:52:24'),
(46, '4110', 'Meter Rent Revenue', 'ቆጣሪ ኪራይ ገቢ', 'REVENUE', 44, 1, 0, 'CREDIT', 'Meter Rent Revenue', NULL, '2026-07-08 07:33:10', '2026-08-08 09:51:29'),
(47, '4120', 'Waste Charge Revenue', 'የዚህ ወር ደረቅ ቆሻሻ ገቢ', 'REVENUE', 44, 1, 0, 'CREDIT', 'Waste Charge Revenue', NULL, '2026-07-08 07:33:10', '2026-08-08 09:48:58'),
(48, '4130', 'Additional Charge Revenue', 'ተጨማሪ ክፍያ ገቢ', 'REVENUE', 44, 1, 0, 'CREDIT', 'Additional Charge Revenue', NULL, '2026-07-08 07:33:10', '2026-08-08 09:53:33'),
(49, '4140', 'Arrears Meter Rent Revenue', 'ውዝፍ ቆጣሪ ኪራይ ገቢ', 'REVENUE', 44, 1, 0, 'CREDIT', 'Arrears Meter Rent Revenue', NULL, '2026-07-08 07:33:10', '2026-08-08 09:54:51'),
(50, '4200', 'Arrears Additional Revenue', 'ውዝፍ ተጨማሪ ክፍያ ገቢ', 'REVENUE', 44, 1, 0, 'CREDIT', 'Arrears Additional Revenue', NULL, '2026-07-08 07:33:10', '2026-08-08 09:55:50'),
(51, '4300', 'Arrears Consumption Revenue', 'ውዝፍ ፍጆታ ክፍያ ገቢ', 'REVENUE', 44, 1, 0, 'CREDIT', 'Arrears Consumption Revenue', NULL, '2026-07-08 07:33:10', '2026-08-08 09:57:31'),
(52, '4400', 'Penalty Revenue', 'የቅጣት ገቢ', 'REVENUE', 44, 1, 0, 'CREDIT', 'Late payment penalties', NULL, '2026-07-08 07:33:10', '2026-07-08 07:33:10'),
(53, '4500', 'Arrears Waste Revenue', 'ውዝፍ ደረቅ ቆሻሻ ገቢ', 'REVENUE', 44, 1, 0, 'CREDIT', 'Arrears Waste Revenue', NULL, '2026-07-08 07:33:10', '2026-08-08 10:03:06'),
(54, '4900', 'Carried Forward Arrears Revenue', 'የተላለፈ(ነባር) ውዝፍ ገቢዎች', 'REVENUE', 44, 1, 0, 'CREDIT', 'Carried Forward Arrears Revenue', NULL, '2026-07-08 07:33:10', '2026-08-08 10:03:46'),
(55, '5000', 'Expenses', 'ወጪዎች', 'EXPENSE', NULL, 1, 1, 'DEBIT', 'All expenses', NULL, '2026-07-08 07:33:10', '2026-07-08 07:33:10'),
(56, '5100', 'Salary & Wages', 'ደመወዝ እና አበል', 'EXPENSE', 55, 1, 0, 'DEBIT', 'Employee salaries', NULL, '2026-07-08 07:33:10', '2026-07-08 07:33:10'),
(57, '5110', 'Employee Benefits', 'የሰራተኛ ጥቅማ ጥቅም', 'EXPENSE', 55, 1, 0, 'DEBIT', 'Benefits and allowances', NULL, '2026-07-08 07:33:10', '2026-07-08 07:33:10'),
(58, '5120', 'Pension Expense', 'የጡረታ ወጪ', 'EXPENSE', 55, 1, 0, 'DEBIT', 'Employer pension contribution', NULL, '2026-07-08 07:33:10', '2026-07-08 07:33:10'),
(59, '5200', 'Office Supplies', 'የቢሮ ቁሳቁስ', 'EXPENSE', 55, 1, 0, 'DEBIT', 'Stationery, supplies', NULL, '2026-07-08 07:33:10', '2026-07-08 07:33:10'),
(60, '5210', 'Office Rent', 'የቢሮ ኪራይ', 'EXPENSE', 55, 1, 0, 'DEBIT', 'Office space rental', NULL, '2026-07-08 07:33:10', '2026-07-08 07:33:10'),
(61, '5220', 'Utilities Expense', 'የመብራትና ውሃ ወጪ', 'EXPENSE', 55, 1, 0, 'DEBIT', 'Electricity, water, phone', NULL, '2026-07-08 07:33:10', '2026-07-08 07:33:10'),
(62, '5230', 'Communication Expense', 'የመገናኛ ወጪ', 'EXPENSE', 55, 1, 0, 'DEBIT', 'Phone, internet, postage', NULL, '2026-07-08 07:33:10', '2026-07-08 07:33:10'),
(63, '5300', 'Vehicle Expense', 'የተሽከርካሪ ወጪ', 'EXPENSE', 55, 1, 0, 'DEBIT', 'Fuel, maintenance', NULL, '2026-07-08 07:33:10', '2026-07-08 07:33:10'),
(64, '5310', 'Travel Expense', 'የጉዞ ወጪ', 'EXPENSE', 55, 1, 0, 'DEBIT', 'Travel and per diem', NULL, '2026-07-08 07:33:10', '2026-07-08 07:33:10'),
(65, '5400', 'Maintenance & Repair', 'ጥገና እና ግንባታ', 'EXPENSE', 55, 1, 0, 'DEBIT', 'Infrastructure maintenance', NULL, '2026-07-08 07:33:10', '2026-07-08 07:33:10'),
(66, '5410', 'Water Treatment Chemicals', 'የውሃ ማጣሪያ ኬሚካል', 'EXPENSE', 55, 1, 0, 'DEBIT', 'Chemicals for water treatment', NULL, '2026-07-08 07:33:10', '2026-07-08 07:33:10'),
(67, '5420', 'Pipe & Fittings', 'ቧንቧ እና መገጣጠሚያ', 'EXPENSE', 55, 1, 0, 'DEBIT', 'Replacement pipes and fittings', NULL, '2026-07-08 07:33:10', '2026-07-08 07:33:10'),
(68, '5500', 'Depreciation Expense', 'የዋጋ ቅናሽ ወጪ', 'EXPENSE', 55, 1, 0, 'DEBIT', 'Asset depreciation', NULL, '2026-07-08 07:33:10', '2026-07-08 07:33:10'),
(69, '5600', 'Insurance Expense', 'የኢንሹራንስ ወጪ', 'EXPENSE', 55, 1, 0, 'DEBIT', 'Insurance premiums', NULL, '2026-07-08 07:33:10', '2026-07-08 07:33:10'),
(70, '5700', 'Bank Charges', 'የባንክ ክፍያ', 'EXPENSE', 55, 1, 0, 'DEBIT', 'Bank service fees', NULL, '2026-07-08 07:33:10', '2026-07-08 07:33:10'),
(71, '5800', 'Bad Debt Expense', 'ሊሰበሰብ ያልቻለ ዕዳ', 'EXPENSE', 55, 1, 0, 'DEBIT', 'Uncollectible accounts', NULL, '2026-07-08 07:33:10', '2026-07-08 07:33:10'),
(72, '5900', 'Miscellaneous Expense', 'ልዩ ልዩ ወጪ', 'EXPENSE', 55, 1, 0, 'DEBIT', 'Other expenses', NULL, '2026-07-08 07:33:10', '2026-07-08 07:33:10'),
(73, '5910', 'Training Expense', 'የስልጠና ወጪ', 'EXPENSE', 55, 1, 0, 'DEBIT', 'Employee training', NULL, '2026-07-08 07:33:10', '2026-07-08 07:33:10'),
(74, '5920', 'Professional Fees', 'ሙያዊ ክፍያ', 'EXPENSE', 55, 1, 0, 'DEBIT', 'Consulting, audit, legal fees', NULL, '2026-07-08 07:33:10', '2026-07-08 07:33:10'),
(75, '5930', 'Refund/Return', 'ተመላሽ ብር', 'EXPENSE', 55, 1, 0, 'DEBIT', 'Refund/Return', 'reading2', '2026-08-08 10:10:08', '2026-08-08 10:10:08');

--
-- Constraints for dumped tables
--

--
-- Constraints for table `fnc_account`
--
ALTER TABLE `fnc_account`
  ADD CONSTRAINT `fnc_account_ibfk_1` FOREIGN KEY (`parent_account_id`) REFERENCES `fnc_account` (`id`);
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
