package com.wbill.home.model;

import java.io.Serializable;
import java.math.BigDecimal;
import jakarta.persistence.*;

@Entity
@Table(name = "fnc_budget_line")
public class FncBudgetLine implements Serializable {
    private static final long serialVersionUID = 1L;

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "budget_id", nullable = false)
    private FncBudget budget;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "account_id", nullable = false)
    private FncAccount account;

    @Column(name = "annual_amount", precision = 15, scale = 2)
    private BigDecimal annualAmount = BigDecimal.ZERO;

    @Column(name = "q1_amount", precision = 15, scale = 2)
    private BigDecimal q1Amount = BigDecimal.ZERO;

    @Column(name = "q2_amount", precision = 15, scale = 2)
    private BigDecimal q2Amount = BigDecimal.ZERO;

    @Column(name = "q3_amount", precision = 15, scale = 2)
    private BigDecimal q3Amount = BigDecimal.ZERO;

    @Column(name = "q4_amount", precision = 15, scale = 2)
    private BigDecimal q4Amount = BigDecimal.ZERO;

    @Column(name = "notes", length = 500)
    private String notes;

    public FncBudgetLine() {}

    public long getId() { return id; }
    public void setId(long id) { this.id = id; }
    public FncBudget getBudget() { return budget; }
    public void setBudget(FncBudget budget) { this.budget = budget; }
    public FncAccount getAccount() { return account; }
    public void setAccount(FncAccount account) { this.account = account; }
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
