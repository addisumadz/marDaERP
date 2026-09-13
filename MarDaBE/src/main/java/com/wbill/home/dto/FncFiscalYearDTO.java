package com.wbill.home.dto;

import com.wbill.home.model.FncFiscalYear;

public class FncFiscalYearDTO {
    private int id;
    private String fiscalYearName;
    private String startDate;
    private String endDate;
    private boolean isClosed;
    private String createdBy;

    public FncFiscalYearDTO() {}

    public FncFiscalYearDTO(FncFiscalYear fy) {
        this.id = fy.getId();
        this.fiscalYearName = fy.getFiscalYearName();
        this.startDate = fy.getStartDate().toString();
        this.endDate = fy.getEndDate().toString();
        this.isClosed = fy.getIsClosed();
        this.createdBy = fy.getCreatedBy();
    }

    public int getId() { return id; }
    public void setId(int id) { this.id = id; }
    public String getFiscalYearName() { return fiscalYearName; }
    public void setFiscalYearName(String fiscalYearName) { this.fiscalYearName = fiscalYearName; }
    public String getStartDate() { return startDate; }
    public void setStartDate(String startDate) { this.startDate = startDate; }
    public String getEndDate() { return endDate; }
    public void setEndDate(String endDate) { this.endDate = endDate; }
    public boolean getIsClosed() { return isClosed; }
    public void setIsClosed(boolean isClosed) { this.isClosed = isClosed; }
    public String getCreatedBy() { return createdBy; }
    public void setCreatedBy(String createdBy) { this.createdBy = createdBy; }
}
