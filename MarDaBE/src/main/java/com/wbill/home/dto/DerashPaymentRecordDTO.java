package com.wbill.home.dto;

import java.util.Date;

public class DerashPaymentRecordDTO {
    private String billId;
    private Double paidAmount;
    private Date paidDate;
    private String agentId;
    private String agentTxCode;
    private Integer readingId; // if matched
    private String customerName;
    private String kifyaWer;

    public String getBillId() { return billId; }
    public void setBillId(String billId) { this.billId = billId; }
    public Double getPaidAmount() { return paidAmount; }
    public void setPaidAmount(Double paidAmount) { this.paidAmount = paidAmount; }
    public Date getPaidDate() { return paidDate; }
    public void setPaidDate(Date paidDate) { this.paidDate = paidDate; }
    public String getAgentId() { return agentId; }
    public void setAgentId(String agentId) { this.agentId = agentId; }
    public String getAgentTxCode() { return agentTxCode; }
    public void setAgentTxCode(String agentTxCode) { this.agentTxCode = agentTxCode; }
    public Integer getReadingId() { return readingId; }
    public void setReadingId(Integer readingId) { this.readingId = readingId; }
    public String getCustomerName() { return customerName; }
    public void setCustomerName(String customerName) { this.customerName = customerName; }
    public String getKifyaWer() { return kifyaWer; }
    public void setKifyaWer(String kifyaWer) { this.kifyaWer = kifyaWer; }
}
