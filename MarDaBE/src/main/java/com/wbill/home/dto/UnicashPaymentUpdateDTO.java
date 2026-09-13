package com.wbill.home.dto;

import java.util.Date;

/**
 * DTO for individual Unicash payment update
 */
public class UnicashPaymentUpdateDTO {
    private Double tekilalaYetekefele;
    private Double tekilalaBankYetekefele;
    private Boolean isUnicashPaid;
    private Date moneyCollectedDate;
    private String uBankPaidConfirmationCode;
    private String uBankPaidAgentId;

    // Default constructor
    public UnicashPaymentUpdateDTO() {}

    // Constructor with all fields
    public UnicashPaymentUpdateDTO(Double tekilalaYetekefele, Double tekilalaBankYetekefele, 
                                  Boolean isUnicashPaid, Date moneyCollectedDate, 
                                  String uBankPaidConfirmationCode, String uBankPaidAgentId) {
        this.tekilalaYetekefele = tekilalaYetekefele;
        this.tekilalaBankYetekefele = tekilalaBankYetekefele;
        this.isUnicashPaid = isUnicashPaid;
        this.moneyCollectedDate = moneyCollectedDate;
        this.uBankPaidConfirmationCode = uBankPaidConfirmationCode;
        this.uBankPaidAgentId = uBankPaidAgentId;
    }

    // Getters and Setters
    public Double getTekilalaYetekefele() {
        return tekilalaYetekefele;
    }

    public void setTekilalaYetekefele(Double tekilalaYetekefele) {
        this.tekilalaYetekefele = tekilalaYetekefele;
    }

    public Double getTekilalaBankYetekefele() {
        return tekilalaBankYetekefele;
    }

    public void setTekilalaBankYetekefele(Double tekilalaBankYetekefele) {
        this.tekilalaBankYetekefele = tekilalaBankYetekefele;
    }

    public Boolean getIsUnicashPaid() {
        return isUnicashPaid;
    }

    public void setIsUnicashPaid(Boolean isUnicashPaid) {
        this.isUnicashPaid = isUnicashPaid;
    }

    public Date getMoneyCollectedDate() {
        return moneyCollectedDate;
    }

    public void setMoneyCollectedDate(Date moneyCollectedDate) {
        this.moneyCollectedDate = moneyCollectedDate;
    }

    public String getuBankPaidConfirmationCode() {
        return uBankPaidConfirmationCode;
    }

    public void setuBankPaidConfirmationCode(String uBankPaidConfirmationCode) {
        this.uBankPaidConfirmationCode = uBankPaidConfirmationCode;
    }

    public String getuBankPaidAgentId() {
        return uBankPaidAgentId;
    }

    public void setuBankPaidAgentId(String uBankPaidAgentId) {
        this.uBankPaidAgentId = uBankPaidAgentId;
    }

    @Override
    public String toString() {
        return "UnicashPaymentUpdateDTO{" +
                "tekilalaYetekefele=" + tekilalaYetekefele +
                ", tekilalaBankYetekefele=" + tekilalaBankYetekefele +
                ", isUnicashPaid=" + isUnicashPaid +
                ", moneyCollectedDate=" + moneyCollectedDate +
                ", uBankPaidConfirmationCode='" + uBankPaidConfirmationCode + '\'' +
                ", uBankPaidAgentId='" + uBankPaidAgentId + '\'' +
                '}';
    }
}
