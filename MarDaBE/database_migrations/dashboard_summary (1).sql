

CREATE TABLE IF NOT EXISTS dashboard_summary (
    id INT AUTO_INCREMENT PRIMARY KEY,
    
    -- Customer Stats
    total_active_customers INT,
    total_deactivated_customers INT,
    total_deleted_customers INT,
    customers_without_reading BIGINT,
    
    -- Active Period
    active_billing_month VARCHAR(255),
    active_billing_year INT,
    active_reading_date DATE,
    
    -- High Level Summary
    total_bills_generated INT,
    total_consumption_m3 DOUBLE,
    total_wuzif_consumption_m3 DOUBLE,
    total_additional_fees DOUBLE,
    total_derek_koshasha DOUBLE,
    total_wuzif_amount DOUBLE,
    total_penalty DOUBLE,
    total_prepaid DOUBLE,
    total_paid_amount DOUBLE,
    total_expected_amount DOUBLE,
    
    -- Group 1: Current Month Breakdown
    paid_yezih_wer_fjota_kfya DOUBLE,
    total_yezih_wer_fjota_kfya DOUBLE,
    paid_kotari_kiray DOUBLE,
    total_kotari_kiray DOUBLE,
    paid_techemari_kfya DOUBLE,
    total_techemari_kfya DOUBLE,
    paid_additional_hisab DOUBLE,
    
    -- Group 2: Arrears Breakdown
    paid_wuzif_kotari_kiray DOUBLE,
    total_wuzif_kotari_kiray DOUBLE,
    paid_wuzif_techemari_kfya DOUBLE,
    total_wuzif_techemari_kfya DOUBLE,
    paid_kitat DOUBLE,
    paid_wuzif_fjota_kfya DOUBLE,
    total_wuzif_fjota_kfya DOUBLE,
    paid_wuzif_derek_koshasha DOUBLE,
    total_wuzif_derek_koshasha DOUBLE,
    paid_wuzif_hisab DOUBLE,
    total_wuzif_fjota DOUBLE,
    
    -- Metadata & Stats JSON
    mobile_reader_stats LONGTEXT,
    payment_location_stats LONGTEXT,
    last_updated DATETIME,
    updated_by VARCHAR(255)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;



CREATE TABLE IF NOT EXISTS `dashboard_summary` (
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
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

