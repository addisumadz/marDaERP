package com.wbill.home.service;

import com.wbill.home.model.ArifPayConfig;
import com.wbill.home.repository.ArifPayConfigRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;

/**
 * Ensures the arifpay_config table exists and seeds it with default configuration on first startup.
 */
@Component
public class ArifPayConfigInitializer implements CommandLineRunner {

    private static final Logger logger = LoggerFactory.getLogger(ArifPayConfigInitializer.class);

    @Autowired
    private JdbcTemplate jdbcTemplate;

    @Autowired
    private ArifPayConfigRepository configRepository;

    @Override
    public void run(String... args) {
        try {
            // Ensure table exists even when spring.jpa.hibernate.ddl-auto=none
            jdbcTemplate.execute(
                "CREATE TABLE IF NOT EXISTS arifpay_config (" +
                "  id INT AUTO_INCREMENT PRIMARY KEY," +
                "  api_key VARCHAR(500) NOT NULL," +
                "  merchant_id VARCHAR(500) NOT NULL," +
                "  api_url VARCHAR(500) NOT NULL," +
                "  success_url VARCHAR(500) NOT NULL," +
                "  cancel_url VARCHAR(500) NOT NULL," +
                "  error_url VARCHAR(500) NOT NULL," +
                "  notify_url VARCHAR(500) NULL," +
                "  beneficiary_bank VARCHAR(100) NOT NULL," +
                "  beneficiary_account VARCHAR(100) NOT NULL," +
                "  updated_at DATETIME NULL" +
                ") ENGINE=InnoDB DEFAULT CHARSET=utf8mb4"
            );

            try {
                jdbcTemplate.execute("ALTER TABLE arifpay_config ADD COLUMN notify_url VARCHAR(500) NULL");
            } catch (Exception ignored) {
                // Column already exists
            }

            if (configRepository.count() == 0) {
                ArifPayConfig config = new ArifPayConfig();
                config.setApiKey("test_api_key_123456789");
                config.setMerchantId("test_merchant_id");
                config.setApiUrl("https://gateway.arifpay.net/api/checkout/session");
                config.setSuccessUrl("http://localhost:9000/ui/manager/payWithArifpay?status=success");
                config.setCancelUrl("http://localhost:9000/ui/manager/payWithArifpay?status=cancel");
                config.setErrorUrl("http://localhost:9000/ui/manager/payWithArifpay?status=error");
                config.setNotifyUrl("http://localhost:9092/api/mardaerp/payments/arifpay/callback");
                config.setBeneficiaryBank("Commercial Bank of Ethiopia");
                config.setBeneficiaryAccount("1000123456789");
                config.setUpdatedAt(LocalDateTime.now());

                configRepository.save(config);
                logger.info("[ArifPayConfigInitializer] Default ArifPay configuration seeded into database.");
            } else {
                logger.info("[ArifPayConfigInitializer] ArifPay configuration already exists, skipping seed.");
            }
        } catch (Exception e) {
            logger.error("[ArifPayConfigInitializer] Error initializing arifpay_config table/data: {}", e.getMessage(), e);
        }
    }
}
