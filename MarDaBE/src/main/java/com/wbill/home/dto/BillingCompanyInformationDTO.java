package com.wbill.home.dto;

public class BillingCompanyInformationDTO {
    private Integer id;
    private String companyName;
    private String companyLogo;
    private String motto;
    private String message;
    private String additionalInformation;
    private String genzebSebsabe;
    private String deresegnYemiaregagt;
    private String deresegnSebsabiLabel;
    private String deresegnYemiaregagtLabel;
    private Integer yeteganenePercent;
    private String status;

    public BillingCompanyInformationDTO() {}

    public BillingCompanyInformationDTO(Integer id, String companyName, String companyLogo, String motto, String message,
                                        String additionalInformation, String genzebSebsabe, String deresegnYemiaregagt,
                                        String deresegnSebsabiLabel, String deresegnYemiaregagtLabel, Integer yeteganenePercent,
                                        String status) {
        this.id = id;
        this.companyName = companyName;
        this.companyLogo = companyLogo;
        this.motto = motto;
        this.message = message;
        this.additionalInformation = additionalInformation;
        this.genzebSebsabe = genzebSebsabe;
        this.deresegnYemiaregagt = deresegnYemiaregagt;
        this.deresegnSebsabiLabel = deresegnSebsabiLabel;
        this.deresegnYemiaregagtLabel = deresegnYemiaregagtLabel;
        this.yeteganenePercent = yeteganenePercent;
        this.status = status;
    }

    // getters and setters
    public Integer getId() { return id; }
    public void setId(Integer id) { this.id = id; }
    public String getCompanyName() { return companyName; }
    public void setCompanyName(String companyName) { this.companyName = companyName; }
    public String getCompanyLogo() { return companyLogo; }
    public void setCompanyLogo(String companyLogo) { this.companyLogo = companyLogo; }
    public String getMotto() { return motto; }
    public void setMotto(String motto) { this.motto = motto; }
    public String getMessage() { return message; }
    public void setMessage(String message) { this.message = message; }
    public String getAdditionalInformation() { return additionalInformation; }
    public void setAdditionalInformation(String additionalInformation) { this.additionalInformation = additionalInformation; }
    public String getGenzebSebsabe() { return genzebSebsabe; }
    public void setGenzebSebsabe(String genzebSebsabe) { this.genzebSebsabe = genzebSebsabe; }
    public String getDeresegnYemiaregagt() { return deresegnYemiaregagt; }
    public void setDeresegnYemiaregagt(String deresegnYemiaregagt) { this.deresegnYemiaregagt = deresegnYemiaregagt; }
    public String getDeresegnSebsabiLabel() { return deresegnSebsabiLabel; }
    public void setDeresegnSebsabiLabel(String deresegnSebsabiLabel) { this.deresegnSebsabiLabel = deresegnSebsabiLabel; }
    public String getDeresegnYemiaregagtLabel() { return deresegnYemiaregagtLabel; }
    public void setDeresegnYemiaregagtLabel(String deresegnYemiaregagtLabel) { this.deresegnYemiaregagtLabel = deresegnYemiaregagtLabel; }
    public Integer getYeteganenePercent() { return yeteganenePercent; }
    public void setYeteganenePercent(Integer yeteganenePercent) { this.yeteganenePercent = yeteganenePercent; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
}
