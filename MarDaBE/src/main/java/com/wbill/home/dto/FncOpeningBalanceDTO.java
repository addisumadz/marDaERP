package com.wbill.home.dto;

import com.wbill.home.model.FncOpeningBalance;

public class FncOpeningBalanceDTO {
    private int id;
    private int accountId;
    private String accountCode;
    private String accountName;
    private String accountType;
    private int fiscalYearId;
    private double debitAmount;
    private double creditAmount;

    public FncOpeningBalanceDTO() {}

    public FncOpeningBalanceDTO(FncOpeningBalance ob) {
        this.id = ob.getId();
        this.accountId = ob.getAccount().getId();
        this.accountCode = ob.getAccount().getAccountCode();
        this.accountName = ob.getAccount().getAccountName();
        this.accountType = ob.getAccount().getAccountType().name();
        this.fiscalYearId = ob.getFiscalYear().getId();
        this.debitAmount = ob.getDebitAmount().doubleValue();
        this.creditAmount = ob.getCreditAmount().doubleValue();
    }

    public int getId() { return id; }
    public void setId(int id) { this.id = id; }
    public int getAccountId() { return accountId; }
    public void setAccountId(int accountId) { this.accountId = accountId; }
    public String getAccountCode() { return accountCode; }
    public void setAccountCode(String accountCode) { this.accountCode = accountCode; }
    public String getAccountName() { return accountName; }
    public void setAccountName(String accountName) { this.accountName = accountName; }
    public String getAccountType() { return accountType; }
    public void setAccountType(String accountType) { this.accountType = accountType; }
    public int getFiscalYearId() { return fiscalYearId; }
    public void setFiscalYearId(int fiscalYearId) { this.fiscalYearId = fiscalYearId; }
    public double getDebitAmount() { return debitAmount; }
    public void setDebitAmount(double debitAmount) { this.debitAmount = debitAmount; }
    public double getCreditAmount() { return creditAmount; }
    public void setCreditAmount(double creditAmount) { this.creditAmount = creditAmount; }
}
