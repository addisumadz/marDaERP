package com.wbill.home.dto;

import com.wbill.home.model.FncAccount;
import java.util.List;
import java.util.stream.Collectors;

public class FncAccountDTO {
    private int id;
    private String accountCode;
    private String accountName;
    private String accountNameAm;
    private String accountType;
    private Integer parentAccountId;
    private String parentAccountCode;
    private String parentAccountName;
    private boolean isActive;
    private boolean isHeader;
    private String normalBalance;
    private String description;
    private List<FncAccountDTO> children;

    public FncAccountDTO() {}

    public FncAccountDTO(FncAccount account) {
        this.id = account.getId();
        this.accountCode = account.getAccountCode();
        this.accountName = account.getAccountName();
        this.accountNameAm = account.getAccountNameAm();
        this.accountType = account.getAccountType().name();
        this.isActive = account.getIsActive();
        this.isHeader = account.getIsHeader();
        this.normalBalance = account.getNormalBalance().name();
        this.description = account.getDescription();
        if (account.getParentAccount() != null) {
            this.parentAccountId = account.getParentAccount().getId();
            this.parentAccountCode = account.getParentAccount().getAccountCode();
            this.parentAccountName = account.getParentAccount().getAccountName();
        }
    }

    public FncAccountDTO(FncAccount account, boolean includeChildren) {
        this(account);
        if (includeChildren && account.getChildAccounts() != null) {
            this.children = account.getChildAccounts().stream()
                    .filter(FncAccount::getIsActive)
                    .map(c -> new FncAccountDTO(c, true))
                    .collect(Collectors.toList());
        }
    }

    // Getters and Setters
    public int getId() { return id; }
    public void setId(int id) { this.id = id; }
    public String getAccountCode() { return accountCode; }
    public void setAccountCode(String accountCode) { this.accountCode = accountCode; }
    public String getAccountName() { return accountName; }
    public void setAccountName(String accountName) { this.accountName = accountName; }
    public String getAccountNameAm() { return accountNameAm; }
    public void setAccountNameAm(String accountNameAm) { this.accountNameAm = accountNameAm; }
    public String getAccountType() { return accountType; }
    public void setAccountType(String accountType) { this.accountType = accountType; }
    public Integer getParentAccountId() { return parentAccountId; }
    public void setParentAccountId(Integer parentAccountId) { this.parentAccountId = parentAccountId; }
    public String getParentAccountCode() { return parentAccountCode; }
    public void setParentAccountCode(String parentAccountCode) { this.parentAccountCode = parentAccountCode; }
    public String getParentAccountName() { return parentAccountName; }
    public void setParentAccountName(String parentAccountName) { this.parentAccountName = parentAccountName; }
    public boolean getIsActive() { return isActive; }
    public void setIsActive(boolean isActive) { this.isActive = isActive; }
    public boolean getIsHeader() { return isHeader; }
    public void setIsHeader(boolean isHeader) { this.isHeader = isHeader; }
    public String getNormalBalance() { return normalBalance; }
    public void setNormalBalance(String normalBalance) { this.normalBalance = normalBalance; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    public List<FncAccountDTO> getChildren() { return children; }
    public void setChildren(List<FncAccountDTO> children) { this.children = children; }
}
