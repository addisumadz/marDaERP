package com.mardaarif.service;

import com.mardaarif.model.ArifPayConfig;
import com.mardaarif.repository.ArifPayConfigRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

/**
 * Seeds the arifpay_config table with default values on first startup
 * if no configuration row exists yet.
 */
@Component
public class ArifPayConfigInitializer implements CommandLineRunner {

    private static final Logger logger = LoggerFactory.getLogger(ArifPayConfigInitializer.class);

    @Autowired
    private ArifPayConfigRepository configRepository;

    @Override
    public void run(String... args) {
        if (configRepository.count() == 0) {
            ArifPayConfig config = new ArifPayConfig();
            config.setApiKey("5oCuK7nKZIJtyPawotPNO3NryCoMdrkY");
            config.setMerchantId("APMG:001084");
            config.setApiUrl("https://gateway.arifpay.net/api/checkout/session");
            config.setSuccessUrl("http://196.189.51.78:3001/bills?status=success");
            config.setCancelUrl("http://196.189.51.78:3001/bills?status=cancel");
            config.setErrorUrl("http://196.189.51.78:3001/bills?status=error");
            config.setBeneficiaryBank("AWINETAA");
            config.setBeneficiaryAccount("1000062101478");
            configRepository.save(config);
            logger.info("[ArifPayConfigInitializer] Default ArifPay configuration seeded into database.");
        } else {
            logger.info("[ArifPayConfigInitializer] ArifPay configuration already exists, skipping seed.");
        }
    }
}
