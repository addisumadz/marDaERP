package com.wbill.home.dto;

public class FncOpeningBalanceCreateDTO {
    private int accountId;
    private int fiscalYearId;
    private double debitAmount;
    private double creditAmount;

    public FncOpeningBalanceCreateDTO() {}

    public int getAccountId() { return accountId; }
    public void setAccountId(int accountId) { this.accountId = accountId; }
    public int getFiscalYearId() { return fiscalYearId; }
    public void setFiscalYearId(int fiscalYearId) { this.fiscalYearId = fiscalYearId; }
    public double getDebitAmount() { return debitAmount; }
    public void setDebitAmount(double debitAmount) { this.debitAmount = debitAmount; }
    public double getCreditAmount() { return creditAmount; }
    public void setCreditAmount(double creditAmount) { this.creditAmount = creditAmount; }
}
