package com.wbill.home.dto;

import com.wbill.home.model.FncBudgetLine;
import java.math.BigDecimal;

public class FncBudgetLineDTO {
    private long id;
    private int accountId;
    private String accountCode;
    private String accountName;
    private String accountNameAm;
    private String accountType;
    private BigDecimal annualAmount;
    private BigDecimal q1Amount;
    private BigDecimal q2Amount;
    private BigDecimal q3Amount;
    private BigDecimal q4Amount;
    private String notes;

    public FncBudgetLineDTO() {}

    public FncBudgetLineDTO(FncBudgetLine l) {
        this.id = l.getId();
        this.accountId = l.getAccount().getId();
        this.accountCode = l.getAccount().getAccountCode();
        this.accountName = l.getAccount().getAccountName();
        this.accountNameAm = l.getAccount().getAccountNameAm();
        this.accountType = l.getAccount().getAccountType().name();
        this.annualAmount = l.getAnnualAmount();
        this.q1Amount = l.getQ1Amount();
        this.q2Amount = l.getQ2Amount();
        this.q3Amount = l.getQ3Amount();
        this.q4Amount = l.getQ4Amount();
        this.notes = l.getNotes();
    }

    public long getId() { return id; }
    public void setId(long id) { this.id = id; }
    public int getAccountId() { return accountId; }
    public void setAccountId(int accountId) { this.accountId = accountId; }
    public String getAccountCode() { return accountCode; }
    public void setAccountCode(String accountCode) { this.accountCode = accountCode; }
    public String getAccountName() { return accountName; }
    public void setAccountName(String accountName) { this.accountName = accountName; }
    public String getAccountNameAm() { return accountNameAm; }
    public void setAccountNameAm(String accountNameAm) { this.accountNameAm = accountNameAm; }
    public String getAccountType() { return accountType; }
    public void setAccountType(String accountType) { this.accountType = accountType; }
    public BigDecimal getAnnualAmount() { return annualAmount; }
    public void setAnnualAmount(BigDecimal annualAmount) { this.annualAmount = annualAmount; }
    public BigDecimal getQ1Amount() { return q1Amount; }
    public void setQ1Amount(BigDecimal q1Amount) { this.q1Amount = q1Amount; }
    public BigDecimal getQ2Amount() { return q2Amount; }
    public void setQ2Amount(BigDecimal q2Amount) { this.q2Amount = q2Amount; }
    public BigDecimal getQ3Amount() { return q3Amount; }
    public void setQ3Amount(BigDecimal q3Amount) { this.q3Amount = q3Amount; }
    public BigDecimal getQ4Amount() { return q4Amount; }
    public void setQ4Amount(BigDecimal q4Amount) { this.q4Amount = q4Amount; }
    public String getNotes() { return notes; }
    public void setNotes(String notes) { this.notes = notes; }
}
