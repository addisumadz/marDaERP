package com.mardaarif.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "arifpay_config")
public class ArifPayConfig {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(name = "api_key", nullable = false, length = 500)
    private String apiKey;

    @Column(name = "merchant_id", nullable = false, length = 500)
    private String merchantId;

    @Column(name = "api_url", nullable = false, length = 500)
    private String apiUrl;

    @Column(name = "success_url", nullable = false, length = 500)
    private String successUrl;

    @Column(name = "cancel_url", nullable = false, length = 500)
    private String cancelUrl;

    @Column(name = "error_url", nullable = false, length = 500)
    private String errorUrl;

    @Column(name = "beneficiary_bank", nullable = false, length = 100)
    private String beneficiaryBank;

    @Column(name = "beneficiary_account", nullable = false, length = 100)
    private String beneficiaryAccount;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    public ArifPayConfig() {}

    @PrePersist
    protected void onCreate() {
        this.updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        this.updatedAt = LocalDateTime.now();
    }

    // Getters and Setters
    public Integer getId() { return id; }
    public void setId(Integer id) { this.id = id; }

    public String getApiKey() { return apiKey; }
    public void setApiKey(String apiKey) { this.apiKey = apiKey; }

    public String getMerchantId() { return merchantId; }
    public void setMerchantId(String merchantId) { this.merchantId = merchantId; }

    public String getApiUrl() { return apiUrl; }
    public void setApiUrl(String apiUrl) { this.apiUrl = apiUrl; }

    public String getSuccessUrl() { return successUrl; }
    public void setSuccessUrl(String successUrl) { this.successUrl = successUrl; }

    public String getCancelUrl() { return cancelUrl; }
    public void setCancelUrl(String cancelUrl) { this.cancelUrl = cancelUrl; }

    public String getErrorUrl() { return errorUrl; }
    public void setErrorUrl(String errorUrl) { this.errorUrl = errorUrl; }

    public String getBeneficiaryBank() { return beneficiaryBank; }
    public void setBeneficiaryBank(String beneficiaryBank) { this.beneficiaryBank = beneficiaryBank; }

    public String getBeneficiaryAccount() { return beneficiaryAccount; }
    public void setBeneficiaryAccount(String beneficiaryAccount) { this.beneficiaryAccount = beneficiaryAccount; }

    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
}
