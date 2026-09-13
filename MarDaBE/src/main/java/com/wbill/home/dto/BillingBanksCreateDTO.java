package com.wbill.home.dto;

public class BillingBanksCreateDTO {
    private String gatewayCode;
    private String bankCode;
    private String bankName;
    private String bankColor;

    // Default constructor
    public BillingBanksCreateDTO() {}

    // Constructor
    public BillingBanksCreateDTO(String gatewayCode, String bankCode, String bankName, String bankColor) {
        this.gatewayCode = gatewayCode;
        this.bankCode = bankCode;
        this.bankName = bankName;
        this.bankColor = bankColor;
    }

    // Getters and Setters
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
}
