-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1:3307
-- Generation Time: Sep 14, 2026 at 01:21 PM
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
-- Table structure for table `user_account_role`
--

DROP TABLE IF EXISTS `user_account_role`;
CREATE TABLE IF NOT EXISTS `user_account_role` (
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

--
-- Dumping data for table `user_account_role`
--

INSERT INTO `user_account_role` (`id`, `user_account_id`, `user_role_id`, `branch_id`, `assigned_by`, `assigned_at`, `is_active`) VALUES
(1, 111, 7, NULL, 'reading2', '2026-09-06 15:33:48', 0),
(2, 111, 8, NULL, 'reading2', '2026-09-06 15:34:06', 0),
(3, 111, 15, NULL, 'reading2', '2026-09-06 15:43:18', 0),
(4, 204, 51, NULL, 'admin2', '2026-09-06 17:09:02', 0),
(5, 1, 1, NULL, 'admin2', '2026-09-06 17:12:00', 1),
(6, 111, 30, NULL, 'admin2', '2026-09-06 17:12:39', 1),
(7, 1, 30, NULL, 'admin2', '2026-09-06 18:41:27', 1),
(8, 204, 30, NULL, 'admin2', '2026-09-07 04:23:27', 0),
(9, 204, 30, NULL, 'admin2', '2026-09-07 04:34:13', 0),
(10, 204, 1, NULL, 'admin2', '2026-09-07 04:37:08', 0),
(11, 204, 51, NULL, 'mstore', '2026-09-07 04:55:43', 1),
(12, 204, 30, NULL, 'mstore', '2026-09-07 05:47:20', 0),
(13, 204, 1, NULL, 'mstore', '2026-09-07 05:50:26', 0),
(14, 204, 30, NULL, 'mstore', '2026-09-07 06:14:40', 0),
(15, 204, 30, NULL, 'mstore', '2026-09-07 06:19:07', 0),
(16, 204, 49, NULL, 'admin2', '2026-09-07 06:28:39', 0),
(17, 205, 52, NULL, 'admin2', '2026-09-07 06:35:19', 1),
(18, 209, 56, NULL, 'reading2', '2026-09-08 14:31:39', 1);
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
