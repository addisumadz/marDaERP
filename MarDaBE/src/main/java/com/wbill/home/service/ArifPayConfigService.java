package com.wbill.home.service;

import com.wbill.home.model.ArifPayConfig;
import com.wbill.home.repository.ArifPayConfigRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;

@Service
public class ArifPayConfigService {

    @Autowired
    private ArifPayConfigRepository configRepository;

    /**
     * Returns the single ArifPay configuration row.
     */
    public ArifPayConfig getConfig() {
        return configRepository.findAll()
                .stream()
                .findFirst()
                .orElseGet(() -> {
                    ArifPayConfig fallback = new ArifPayConfig();
                    fallback.setApiKey("test_api_key_123456789");
                    fallback.setMerchantId("test_merchant_id");
                    fallback.setApiUrl("https://gateway.arifpay.net/api/checkout/session");
                    fallback.setSuccessUrl("http://localhost:9000/ui/manager/payWithArifpay?status=success");
                    fallback.setCancelUrl("http://localhost:9000/ui/manager/payWithArifpay?status=cancel");
                    fallback.setErrorUrl("http://localhost:9000/ui/manager/payWithArifpay?status=error");
                    fallback.setNotifyUrl("http://localhost:9092/api/mardaerp/payments/arifpay/callback");
                    fallback.setBeneficiaryBank("Commercial Bank of Ethiopia");
                    fallback.setBeneficiaryAccount("1000123456789");
                    fallback.setUpdatedAt(LocalDateTime.now());
                    return configRepository.save(fallback);
                });
    }

    /**
     * Creates or updates the ArifPay configuration.
     */
    public ArifPayConfig saveConfig(ArifPayConfig configData) {
        ArifPayConfig existing = configRepository.findAll()
                .stream()
                .findFirst()
                .orElse(new ArifPayConfig());

        existing.setApiKey(configData.getApiKey());
        existing.setMerchantId(configData.getMerchantId());
        existing.setApiUrl(configData.getApiUrl());
        existing.setSuccessUrl(configData.getSuccessUrl());
        existing.setCancelUrl(configData.getCancelUrl());
        existing.setErrorUrl(configData.getErrorUrl());
        existing.setNotifyUrl(configData.getNotifyUrl());
        existing.setBeneficiaryBank(configData.getBeneficiaryBank());
        existing.setBeneficiaryAccount(configData.getBeneficiaryAccount());
        existing.setUpdatedAt(LocalDateTime.now());

        return configRepository.save(existing);
    }
}
