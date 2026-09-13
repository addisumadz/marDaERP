package com.wbill.home.dto;

public class FncFiscalYearCreateDTO {
    private String fiscalYearName;
    private String startDate;
    private String endDate;

    public FncFiscalYearCreateDTO() {}

    public String getFiscalYearName() { return fiscalYearName; }
    public void setFiscalYearName(String fiscalYearName) { this.fiscalYearName = fiscalYearName; }
    public String getStartDate() { return startDate; }
    public void setStartDate(String startDate) { this.startDate = startDate; }
    public String getEndDate() { return endDate; }
    public void setEndDate(String endDate) { this.endDate = endDate; }
}
