package com.mardaarif.service;

import com.mardaarif.model.ArifPayConfig;
import com.mardaarif.repository.ArifPayConfigRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class ArifPayConfigService {

    @Autowired
    private ArifPayConfigRepository configRepository;

    /**
     * Returns the single ArifPay configuration row.
     * Throws RuntimeException if no configuration has been set up yet.
     */
    public ArifPayConfig getConfig() {
        return configRepository.findAll()
                .stream()
                .findFirst()
                .orElseThrow(() -> new RuntimeException("ArifPay configuration not found. Please set up the configuration first."));
    }

    /**
     * Creates or updates the ArifPay configuration.
     * If a config row already exists, it updates that row.
     * If no row exists, it creates a new one.
     */
    public ArifPayConfig saveConfig(ArifPayConfig configData) {
        ArifPayConfig existing = configRepository.findAll()
                .stream()
                .findFirst()
                .orElse(null);

        if (existing != null) {
            existing.setApiKey(configData.getApiKey());
            existing.setMerchantId(configData.getMerchantId());
            existing.setApiUrl(configData.getApiUrl());
            existing.setSuccessUrl(configData.getSuccessUrl());
            existing.setCancelUrl(configData.getCancelUrl());
            existing.setErrorUrl(configData.getErrorUrl());
            existing.setBeneficiaryBank(configData.getBeneficiaryBank());
            existing.setBeneficiaryAccount(configData.getBeneficiaryAccount());
            return configRepository.save(existing);
        } else {
            return configRepository.save(configData);
        }
    }
}
