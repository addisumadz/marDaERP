package com.wbill.home.model;

import java.io.Serializable;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import jakarta.persistence.*;

@Entity
@Table(name = "fnc_budget")
public class FncBudget implements Serializable {
    private static final long serialVersionUID = 1L;

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private int id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "fiscal_year_id", nullable = false)
    private FncFiscalYear fiscalYear;

    @Column(name = "budget_name", nullable = false, length = 200)
    private String budgetName;

    @Column(name = "description", length = 500)
    private String description;

    @Enumerated(EnumType.STRING)
    @Column(name = "status")
    private BudgetStatus status = BudgetStatus.DRAFT;

    @Column(name = "total_revenue_budget", precision = 15, scale = 2)
    private BigDecimal totalRevenueBudget = BigDecimal.ZERO;

    @Column(name = "total_expense_budget", precision = 15, scale = 2)
    private BigDecimal totalExpenseBudget = BigDecimal.ZERO;

    @Column(name = "approved_by", length = 100)
    private String approvedBy;

    @Column(name = "approved_at")
    private LocalDateTime approvedAt;

    @Column(name = "created_by", length = 100)
    private String createdBy;

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @OneToMany(mappedBy = "budget", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    private List<FncBudgetLine> lines = new ArrayList<>();

    @PrePersist
    protected void onCreate() { createdAt = LocalDateTime.now(); updatedAt = LocalDateTime.now(); }

    @PreUpdate
    protected void onUpdate() { updatedAt = LocalDateTime.now(); }

    public enum BudgetStatus { DRAFT, APPROVED, REVISED }

    public FncBudget() {}

    // Getters and Setters
    public int getId() { return id; }
    public void setId(int id) { this.id = id; }
    public FncFiscalYear getFiscalYear() { return fiscalYear; }
    public void setFiscalYear(FncFiscalYear fiscalYear) { this.fiscalYear = fiscalYear; }
    public String getBudgetName() { return budgetName; }
    public void setBudgetName(String budgetName) { this.budgetName = budgetName; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    public BudgetStatus getStatus() { return status; }
    public void setStatus(BudgetStatus status) { this.status = status; }
    public BigDecimal getTotalRevenueBudget() { return totalRevenueBudget; }
    public void setTotalRevenueBudget(BigDecimal totalRevenueBudget) { this.totalRevenueBudget = totalRevenueBudget; }
    public BigDecimal getTotalExpenseBudget() { return totalExpenseBudget; }
    public void setTotalExpenseBudget(BigDecimal totalExpenseBudget) { this.totalExpenseBudget = totalExpenseBudget; }
    public String getApprovedBy() { return approvedBy; }
    public void setApprovedBy(String approvedBy) { this.approvedBy = approvedBy; }
    public LocalDateTime getApprovedAt() { return approvedAt; }
    public void setApprovedAt(LocalDateTime approvedAt) { this.approvedAt = approvedAt; }
    public String getCreatedBy() { return createdBy; }
    public void setCreatedBy(String createdBy) { this.createdBy = createdBy; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
    public List<FncBudgetLine> getLines() { return lines; }
    public void setLines(List<FncBudgetLine> lines) { this.lines = lines; }
}
