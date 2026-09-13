package com.wbill.home.dto;

import java.math.BigDecimal;
import java.util.List;

public class FncBudgetCreateDTO {
    private int fiscalYearId;
    private String budgetName;
    private String description;
    private List<LineDTO> lines;

    public static class LineDTO {
        private int accountId;
        private BigDecimal annualAmount;
        private BigDecimal q1Amount;
        private BigDecimal q2Amount;
        private BigDecimal q3Amount;
        private BigDecimal q4Amount;
        private String notes;

        public int getAccountId() { return accountId; }
        public void setAccountId(int accountId) { this.accountId = accountId; }
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

    public int getFiscalYearId() { return fiscalYearId; }
    public void setFiscalYearId(int fiscalYearId) { this.fiscalYearId = fiscalYearId; }
    public String getBudgetName() { return budgetName; }
    public void setBudgetName(String budgetName) { this.budgetName = budgetName; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    public List<LineDTO> getLines() { return lines; }
    public void setLines(List<LineDTO> lines) { this.lines = lines; }
}
