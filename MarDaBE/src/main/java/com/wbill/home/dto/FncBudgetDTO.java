package com.wbill.home.dto;

import com.wbill.home.model.FncBudget;
import java.math.BigDecimal;
import java.util.List;
import java.util.stream.Collectors;

public class FncBudgetDTO {
    private int id;
    private int fiscalYearId;
    private String fiscalYearName;
    private String budgetName;
    private String description;
    private String status;
    private BigDecimal totalRevenueBudget;
    private BigDecimal totalExpenseBudget;
    private String approvedBy;
    private String approvedAt;
    private String createdBy;
    private String createdAt;
    private List<FncBudgetLineDTO> lines;

    public FncBudgetDTO() {}

    public FncBudgetDTO(FncBudget b) {
        this.id = b.getId();
        this.fiscalYearId = b.getFiscalYear().getId();
        this.fiscalYearName = b.getFiscalYear().getFiscalYearName();
        this.budgetName = b.getBudgetName();
        this.description = b.getDescription();
        this.status = b.getStatus().name();
        this.totalRevenueBudget = b.getTotalRevenueBudget();
        this.totalExpenseBudget = b.getTotalExpenseBudget();
        this.approvedBy = b.getApprovedBy();
        this.approvedAt = b.getApprovedAt() != null ? b.getApprovedAt().toString() : null;
        this.createdBy = b.getCreatedBy();
        this.createdAt = b.getCreatedAt() != null ? b.getCreatedAt().toString() : null;
    }

    public FncBudgetDTO(FncBudget b, boolean includeLines) {
        this(b);
        if (includeLines && b.getLines() != null) {
            this.lines = b.getLines().stream().map(FncBudgetLineDTO::new).collect(Collectors.toList());
        }
    }

    // Getters and Setters
    public int getId() { return id; }
    public void setId(int id) { this.id = id; }
    public int getFiscalYearId() { return fiscalYearId; }
    public void setFiscalYearId(int fiscalYearId) { this.fiscalYearId = fiscalYearId; }
    public String getFiscalYearName() { return fiscalYearName; }
    public void setFiscalYearName(String fiscalYearName) { this.fiscalYearName = fiscalYearName; }
    public String getBudgetName() { return budgetName; }
    public void setBudgetName(String budgetName) { this.budgetName = budgetName; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    public BigDecimal getTotalRevenueBudget() { return totalRevenueBudget; }
    public void setTotalRevenueBudget(BigDecimal v) { this.totalRevenueBudget = v; }
    public BigDecimal getTotalExpenseBudget() { return totalExpenseBudget; }
    public void setTotalExpenseBudget(BigDecimal v) { this.totalExpenseBudget = v; }
    public String getApprovedBy() { return approvedBy; }
    public void setApprovedBy(String approvedBy) { this.approvedBy = approvedBy; }
    public String getApprovedAt() { return approvedAt; }
    public void setApprovedAt(String approvedAt) { this.approvedAt = approvedAt; }
    public String getCreatedBy() { return createdBy; }
    public void setCreatedBy(String createdBy) { this.createdBy = createdBy; }
    public String getCreatedAt() { return createdAt; }
    public void setCreatedAt(String createdAt) { this.createdAt = createdAt; }
    public List<FncBudgetLineDTO> getLines() { return lines; }
    public void setLines(List<FncBudgetLineDTO> lines) { this.lines = lines; }
}
