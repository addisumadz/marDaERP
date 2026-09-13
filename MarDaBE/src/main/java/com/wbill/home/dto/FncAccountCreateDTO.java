package com.wbill.home.dto;

public class FncAccountCreateDTO {
    private String accountCode;
    private String accountName;
    private String accountNameAm;
    private String accountType;
    private Integer parentAccountId;
    private boolean isHeader;
    private String description;

    public FncAccountCreateDTO() {}

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
    public boolean getIsHeader() { return isHeader; }
    public void setIsHeader(boolean isHeader) { this.isHeader = isHeader; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
}
