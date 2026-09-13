package com.wbill.home.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import jakarta.validation.constraints.Min;

public class BillingCompanyInformationCreateDTO {
    @NotBlank
    @Size(max = 200)
    private String companyName;

    @NotBlank
    @Size(max = 200)
    private String companyLogo;

    @NotBlank
    @Size(max = 100)
    private String motto;

    @NotBlank
    @Size(max = 100)
    private String message;

    @NotBlank
    @Size(max = 200)
    private String additionalInformation;

    @NotBlank
    @Size(max = 100)
    private String genzebSebsabe;

    @NotBlank
    @Size(max = 200)
    private String deresegnYemiaregagt;

    @Size(max = 150)
    private String deresegnSebsabiLabel;

    @Size(max = 150)
    private String deresegnYemiaregagtLabel;

    @Min(0)
    private Integer yeteganenePercent;

    // getters and setters
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
}
