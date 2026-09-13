package com.wbill.home.dto;

import java.util.List;

public class FncTrialBalanceDTO {
    private int fiscalYearId;
    private String fiscalYearName;
    private String asOfDate;
    private List<TrialBalanceRow> rows;
    private double totalDebit;
    private double totalCredit;
    private boolean isBalanced;

    public static class TrialBalanceRow {
        private int accountId;
        private String accountCode;
        private String accountName;
        private String accountNameAm;
        private String accountType;
        private double debitBalance;
        private double creditBalance;

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
        public double getDebitBalance() { return debitBalance; }
        public void setDebitBalance(double debitBalance) { this.debitBalance = debitBalance; }
        public double getCreditBalance() { return creditBalance; }
        public void setCreditBalance(double creditBalance) { this.creditBalance = creditBalance; }
    }

    public int getFiscalYearId() { return fiscalYearId; }
    public void setFiscalYearId(int fiscalYearId) { this.fiscalYearId = fiscalYearId; }
    public String getFiscalYearName() { return fiscalYearName; }
    public void setFiscalYearName(String fiscalYearName) { this.fiscalYearName = fiscalYearName; }
    public String getAsOfDate() { return asOfDate; }
    public void setAsOfDate(String asOfDate) { this.asOfDate = asOfDate; }
    public List<TrialBalanceRow> getRows() { return rows; }
    public void setRows(List<TrialBalanceRow> rows) { this.rows = rows; }
    public double getTotalDebit() { return totalDebit; }
    public void setTotalDebit(double totalDebit) { this.totalDebit = totalDebit; }
    public double getTotalCredit() { return totalCredit; }
    public void setTotalCredit(double totalCredit) { this.totalCredit = totalCredit; }
    public boolean getIsBalanced() { return isBalanced; }
    public void setIsBalanced(boolean isBalanced) { this.isBalanced = isBalanced; }
}
