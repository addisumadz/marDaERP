package com.wbill.home.dto;

import java.util.Date;

/**
 * DTO for individual MardaArif payment update
 */
public class MardaArifPaymentUpdateDTO {
    private Double tekilalaYetekefele;
    private Double tekilalaBankYetekefele;
    private Boolean isMardaArifPaid;
    private Date moneyCollectedDate;
    private String mBankPaidConfirmationCode;
    private String mBankPaidAgentId;

    // Default constructor
    public MardaArifPaymentUpdateDTO() {}

    // Constructor with all fields
    public MardaArifPaymentUpdateDTO(Double tekilalaYetekefele, Double tekilalaBankYetekefele,
                                    Boolean isMardaArifPaid, Date moneyCollectedDate,
                                    String mBankPaidConfirmationCode, String mBankPaidAgentId) {
        this.tekilalaYetekefele = tekilalaYetekefele;
        this.tekilalaBankYetekefele = tekilalaBankYetekefele;
        this.isMardaArifPaid = isMardaArifPaid;
        this.moneyCollectedDate = moneyCollectedDate;
        this.mBankPaidConfirmationCode = mBankPaidConfirmationCode;
        this.mBankPaidAgentId = mBankPaidAgentId;
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

    public Boolean getIsMardaArifPaid() {
        return isMardaArifPaid;
    }

    public void setIsMardaArifPaid(Boolean isMardaArifPaid) {
        this.isMardaArifPaid = isMardaArifPaid;
    }

    public Date getMoneyCollectedDate() {
        return moneyCollectedDate;
    }

    public void setMoneyCollectedDate(Date moneyCollectedDate) {
        this.moneyCollectedDate = moneyCollectedDate;
    }

    public String getmBankPaidConfirmationCode() {
        return mBankPaidConfirmationCode;
    }

    public void setmBankPaidConfirmationCode(String mBankPaidConfirmationCode) {
        this.mBankPaidConfirmationCode = mBankPaidConfirmationCode;
    }

    public String getmBankPaidAgentId() {
        return mBankPaidAgentId;
    }

    public void setmBankPaidAgentId(String mBankPaidAgentId) {
        this.mBankPaidAgentId = mBankPaidAgentId;
    }

    @Override
    public String toString() {
        return "MardaArifPaymentUpdateDTO{" +
                "tekilalaYetekefele=" + tekilalaYetekefele +
                ", tekilalaBankYetekefele=" + tekilalaBankYetekefele +
                ", isMardaArifPaid=" + isMardaArifPaid +
                ", moneyCollectedDate=" + moneyCollectedDate +
                ", mBankPaidConfirmationCode='" + mBankPaidConfirmationCode + '\'' +
                ", mBankPaidAgentId='" + mBankPaidAgentId + '\'' +
                '}';
    }
}
