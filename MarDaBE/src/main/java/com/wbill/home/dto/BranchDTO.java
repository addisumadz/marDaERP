package com.wbill.home.dto;

public class BranchDTO {
    private Integer id;
    private Integer branchKebeleId;
    private String branchKebeleName; // AddressStreets.streetsName
    private String branchCode;
    private String branchDescription;
    private String officeLevel;
    private String aboutOffice;
    private String deleted;

    public BranchDTO() {}

    public BranchDTO(Integer id, Integer branchKebeleId, String branchKebeleName, String branchCode,
                     String branchDescription, String officeLevel, String aboutOffice, String deleted) {
        this.id = id;
        this.branchKebeleId = branchKebeleId;
        this.branchKebeleName = branchKebeleName;
        this.branchCode = branchCode;
        this.branchDescription = branchDescription;
        this.officeLevel = officeLevel;
        this.aboutOffice = aboutOffice;
        this.deleted = deleted;
    }

    public Integer getId() { return id; }
    public void setId(Integer id) { this.id = id; }
    public Integer getBranchKebeleId() { return branchKebeleId; }
    public void setBranchKebeleId(Integer branchKebeleId) { this.branchKebeleId = branchKebeleId; }
    public String getBranchKebeleName() { return branchKebeleName; }
    public void setBranchKebeleName(String branchKebeleName) { this.branchKebeleName = branchKebeleName; }
    public String getBranchCode() { return branchCode; }
    public void setBranchCode(String branchCode) { this.branchCode = branchCode; }
    public String getBranchDescription() { return branchDescription; }
    public void setBranchDescription(String branchDescription) { this.branchDescription = branchDescription; }
    public String getOfficeLevel() { return officeLevel; }
    public void setOfficeLevel(String officeLevel) { this.officeLevel = officeLevel; }
    public String getAboutOffice() { return aboutOffice; }
    public void setAboutOffice(String aboutOffice) { this.aboutOffice = aboutOffice; }
    public String getDeleted() { return deleted; }
    public void setDeleted(String deleted) { this.deleted = deleted; }
}
