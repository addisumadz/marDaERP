package com.wbill.home.dto;

import java.util.List;

public class FncJournalEntryCreateDTO {
    private String entryDate;
    private int fiscalYearId;
    private String referenceNumber;
    private String description;
    private String sourceType;      // e.g., "BILL_PREP", "BILL_COLLECTION"
    private String billingPeriod;   // e.g., "መስከረም, 2018" — the kifyaWer to mark bills
    private String billingMonth;    // e.g., "መስከረም, 2018" — explicit column for billing month
    private List<LineItem> lines;

    public static class LineItem {
        private int accountId;
        private String description;
        private double debitAmount;
        private double creditAmount;

        public int getAccountId() { return accountId; }
        public void setAccountId(int accountId) { this.accountId = accountId; }
        public String getDescription() { return description; }
        public void setDescription(String description) { this.description = description; }
        public double getDebitAmount() { return debitAmount; }
        public void setDebitAmount(double debitAmount) { this.debitAmount = debitAmount; }
        public double getCreditAmount() { return creditAmount; }
        public void setCreditAmount(double creditAmount) { this.creditAmount = creditAmount; }
    }

    public FncJournalEntryCreateDTO() {}

    public String getEntryDate() { return entryDate; }
    public void setEntryDate(String entryDate) { this.entryDate = entryDate; }
    public int getFiscalYearId() { return fiscalYearId; }
    public void setFiscalYearId(int fiscalYearId) { this.fiscalYearId = fiscalYearId; }
    public String getReferenceNumber() { return referenceNumber; }
    public void setReferenceNumber(String referenceNumber) { this.referenceNumber = referenceNumber; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    public String getSourceType() { return sourceType; }
    public void setSourceType(String sourceType) { this.sourceType = sourceType; }
    public String getBillingPeriod() { return billingPeriod; }
    public void setBillingPeriod(String billingPeriod) { this.billingPeriod = billingPeriod; }
    public String getBillingMonth() { return billingMonth; }
    public void setBillingMonth(String billingMonth) { this.billingMonth = billingMonth; }
    public List<LineItem> getLines() { return lines; }
    public void setLines(List<LineItem> lines) { this.lines = lines; }
}
