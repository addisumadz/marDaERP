package com.wbill.home.dto;

import java.util.Date;

/**
 * DTO for individual bank payment update
 */
public class BankPaymentUpdateDTO {
    private Double tekilalaYetekefele;
    private Double tekilalaBankYetekefele;
    private Boolean isPaidThroughBank;
    private Boolean isDerashPaid;
    private Date moneyCollectedDate;
    private String bankPaidConfirmationCode;
    private String bankPaidAgentId;

    // Default constructor
    public BankPaymentUpdateDTO() {}

    // Constructor with all fields
    public BankPaymentUpdateDTO(Double tekilalaYetekefele, Double tekilalaBankYetekefele, 
                               Boolean isPaidThroughBank, Boolean isDerashPaid, 
                               Date moneyCollectedDate, String bankPaidConfirmationCode, 
                               String bankPaidAgentId) {
        this.tekilalaYetekefele = tekilalaYetekefele;
        this.tekilalaBankYetekefele = tekilalaBankYetekefele;
        this.isPaidThroughBank = isPaidThroughBank;
        this.isDerashPaid = isDerashPaid;
        this.moneyCollectedDate = moneyCollectedDate;
        this.bankPaidConfirmationCode = bankPaidConfirmationCode;
        this.bankPaidAgentId = bankPaidAgentId;
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

    public Boolean getIsPaidThroughBank() {
        return isPaidThroughBank;
    }

    public void setIsPaidThroughBank(Boolean isPaidThroughBank) {
        this.isPaidThroughBank = isPaidThroughBank;
    }

    public Boolean getIsDerashPaid() {
        return isDerashPaid;
    }

    public void setIsDerashPaid(Boolean isDerashPaid) {
        this.isDerashPaid = isDerashPaid;
    }

    public Date getMoneyCollectedDate() {
        return moneyCollectedDate;
    }

    public void setMoneyCollectedDate(Date moneyCollectedDate) {
        this.moneyCollectedDate = moneyCollectedDate;
    }

    public String getBankPaidConfirmationCode() {
        return bankPaidConfirmationCode;
    }

    public void setBankPaidConfirmationCode(String bankPaidConfirmationCode) {
        this.bankPaidConfirmationCode = bankPaidConfirmationCode;
    }

    public String getBankPaidAgentId() {
        return bankPaidAgentId;
    }

    public void setBankPaidAgentId(String bankPaidAgentId) {
        this.bankPaidAgentId = bankPaidAgentId;
    }

    @Override
    public String toString() {
        return "BankPaymentUpdateDTO{" +
                "tekilalaYetekefele=" + tekilalaYetekefele +
                ", tekilalaBankYetekefele=" + tekilalaBankYetekefele +
                ", isPaidThroughBank=" + isPaidThroughBank +
                ", isDerashPaid=" + isDerashPaid +
                ", moneyCollectedDate=" + moneyCollectedDate +
                ", bankPaidConfirmationCode='" + bankPaidConfirmationCode + '\'' +
                ", bankPaidAgentId='" + bankPaidAgentId + '\'' +
                '}';
    }
}
