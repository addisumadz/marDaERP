package com.wbill.home.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public class BranchCreateDTO {
    @NotNull
    private Integer branchKebeleId;

    @NotBlank
    @Size(max = 100)
    private String branchCode;

    @NotBlank
    @Size(max = 200)
    private String branchDescription;

    @NotBlank
    @Size(max = 100)
    private String officeLevel;

    // optional long text
    private String aboutOffice;

    public Integer getBranchKebeleId() { return branchKebeleId; }
    public void setBranchKebeleId(Integer branchKebeleId) { this.branchKebeleId = branchKebeleId; }
    public String getBranchCode() { return branchCode; }
    public void setBranchCode(String branchCode) { this.branchCode = branchCode; }
    public String getBranchDescription() { return branchDescription; }
    public void setBranchDescription(String branchDescription) { this.branchDescription = branchDescription; }
    public String getOfficeLevel() { return officeLevel; }
    public void setOfficeLevel(String officeLevel) { this.officeLevel = officeLevel; }
    public String getAboutOffice() { return aboutOffice; }
    public void setAboutOffice(String aboutOffice) { this.aboutOffice = aboutOffice; }
}
