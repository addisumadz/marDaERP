package com.wbill.home.dto;

import com.wbill.home.model.BillingBanks;

public class BillingBanksDTO {
    private int id;
    private String gatewayCode;
    private String bankCode;
    private String bankName;
    private String bankColor;
    private String deleted;

    // Default constructor
    public BillingBanksDTO() {}

    // Constructor from entity
    public BillingBanksDTO(BillingBanks bank) {
        this.id = bank.getId();
        this.gatewayCode = bank.getGatewayCode();
        this.bankCode = bank.getBankCode();
        this.bankName = bank.getBankName();
        this.bankColor = bank.getBankColor();
        this.deleted = bank.getDeleted();
    }

    // Getters and Setters
    public int getId() {
        return id;
    }

    public void setId(int id) {
        this.id = id;
    }

    public String getGatewayCode() {
        return gatewayCode;
    }

    public void setGatewayCode(String gatewayCode) {
        this.gatewayCode = gatewayCode;
    }

    public String getBankCode() {
        return bankCode;
    }

    public void setBankCode(String bankCode) {
        this.bankCode = bankCode;
    }

    public String getBankName() {
        return bankName;
    }

    public void setBankName(String bankName) {
        this.bankName = bankName;
    }

    public String getBankColor() {
        return bankColor;
    }

    public void setBankColor(String bankColor) {
        this.bankColor = bankColor;
    }

    public String getDeleted() {
        return deleted;
    }

    public void setDeleted(String deleted) {
        this.deleted = deleted;
    }
}
