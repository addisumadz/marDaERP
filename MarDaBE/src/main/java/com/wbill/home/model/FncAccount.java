package com.wbill.home.model;

import java.io.Serializable;
import java.time.LocalDateTime;
import java.util.List;
import jakarta.persistence.*;
import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

@Entity
@Table(name = "fnc_account")
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class FncAccount implements Serializable {
    private static final long serialVersionUID = 1L;

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private int id;

    @Column(name = "account_code", nullable = false, unique = true, length = 20)
    private String accountCode;

    @Column(name = "account_name", nullable = false, length = 200)
    private String accountName;

    @Column(name = "account_name_am", length = 200)
    private String accountNameAm;

    @Enumerated(EnumType.STRING)
    @Column(name = "account_type", nullable = false)
    private AccountType accountType;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "parent_account_id")
    @JsonIgnoreProperties({"childAccounts", "parentAccount", "hibernateLazyInitializer", "handler"})
    private FncAccount parentAccount;

    @JsonIgnore
    @OneToMany(mappedBy = "parentAccount", fetch = FetchType.LAZY)
    @OrderBy("accountCode ASC")
    private List<FncAccount> childAccounts;

    @Column(name = "is_active")
    private boolean isActive = true;

    @Column(name = "is_header")
    private boolean isHeader = false;

    @Enumerated(EnumType.STRING)
    @Column(name = "normal_balance", nullable = false)
    private NormalBalance normalBalance;

    @Column(name = "description", length = 500)
    private String description;

    @Column(name = "created_by", length = 100)
    private String createdBy;

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }

    public enum AccountType {
        ASSET, LIABILITY, EQUITY, REVENUE, EXPENSE
    }

    public enum NormalBalance {
        DEBIT, CREDIT
    }

    public FncAccount() {}

    // Getters and Setters
    public int getId() { return id; }
    public void setId(int id) { this.id = id; }

    public String getAccountCode() { return accountCode; }
    public void setAccountCode(String accountCode) { this.accountCode = accountCode; }

    public String getAccountName() { return accountName; }
    public void setAccountName(String accountName) { this.accountName = accountName; }

    public String getAccountNameAm() { return accountNameAm; }
    public void setAccountNameAm(String accountNameAm) { this.accountNameAm = accountNameAm; }

    public AccountType getAccountType() { return accountType; }
    public void setAccountType(AccountType accountType) { this.accountType = accountType; }

    public FncAccount getParentAccount() { return parentAccount; }
    public void setParentAccount(FncAccount parentAccount) { this.parentAccount = parentAccount; }

    public List<FncAccount> getChildAccounts() { return childAccounts; }
    public void setChildAccounts(List<FncAccount> childAccounts) { this.childAccounts = childAccounts; }

    public boolean getIsActive() { return isActive; }
    public void setIsActive(boolean isActive) { this.isActive = isActive; }

    public boolean getIsHeader() { return isHeader; }
    public void setIsHeader(boolean isHeader) { this.isHeader = isHeader; }

    public NormalBalance getNormalBalance() { return normalBalance; }
    public void setNormalBalance(NormalBalance normalBalance) { this.normalBalance = normalBalance; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public String getCreatedBy() { return createdBy; }
    public void setCreatedBy(String createdBy) { this.createdBy = createdBy; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
}
