package com.wbill.home.dto;

import com.wbill.home.model.FncJournalEntryLine;

public class FncJournalEntryLineDTO {
    private long id;
    private int accountId;
    private String accountCode;
    private String accountName;
    private String description;
    private double debitAmount;
    private double creditAmount;
    private int lineOrder;

    public FncJournalEntryLineDTO() {}

    public FncJournalEntryLineDTO(FncJournalEntryLine line) {
        this.id = line.getId();
        this.accountId = line.getAccount().getId();
        this.accountCode = line.getAccount().getAccountCode();
        this.accountName = line.getAccount().getAccountName();
        this.description = line.getDescription();
        this.debitAmount = line.getDebitAmount().doubleValue();
        this.creditAmount = line.getCreditAmount().doubleValue();
        this.lineOrder = line.getLineOrder();
    }

    public long getId() { return id; }
    public void setId(long id) { this.id = id; }
    public int getAccountId() { return accountId; }
    public void setAccountId(int accountId) { this.accountId = accountId; }
    public String getAccountCode() { return accountCode; }
    public void setAccountCode(String accountCode) { this.accountCode = accountCode; }
    public String getAccountName() { return accountName; }
    public void setAccountName(String accountName) { this.accountName = accountName; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    public double getDebitAmount() { return debitAmount; }
    public void setDebitAmount(double debitAmount) { this.debitAmount = debitAmount; }
    public double getCreditAmount() { return creditAmount; }
    public void setCreditAmount(double creditAmount) { this.creditAmount = creditAmount; }
    public int getLineOrder() { return lineOrder; }
    public void setLineOrder(int lineOrder) { this.lineOrder = lineOrder; }
}
