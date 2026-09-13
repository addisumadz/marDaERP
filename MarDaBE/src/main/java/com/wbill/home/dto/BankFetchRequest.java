package com.wbill.home.dto;

public class BankFetchRequest {
    private String fromDate; // yyyy-MM-dd
    private String toDate;   // yyyy-MM-dd
    private String kifyaWer; // e.g., "ነሐሴ, 2017"

    public String getFromDate() { return fromDate; }
    public void setFromDate(String fromDate) { this.fromDate = fromDate; }
    public String getToDate() { return toDate; }
    public void setToDate(String toDate) { this.toDate = toDate; }
    public String getKifyaWer() { return kifyaWer; }
    public void setKifyaWer(String kifyaWer) { this.kifyaWer = kifyaWer; }
}
