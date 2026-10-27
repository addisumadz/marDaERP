package com.wbill.home.dto;

import java.io.Serializable;

public class BankInvoiceCompareRowDTO implements Serializable {
    private static final long serialVersionUID = 1L;

    private Integer rowIndex;
    private String accountNumber;
    private String customerName;
    private String systemInvoiceNumber;
    private String csvInvoiceNumber;
    private String invoiceDifference; // "Yes" or "No"
    private boolean invoiceMismatch; // true if diff == "Yes"
    private Double csvAmountDue;
    private Double tekilalaTekefay;
    private Double amountDifference;
    private boolean amountMismatch; // true if Math.abs(amountDifference) > 0.01
    private Integer readingId;
    private String kifyaWer;
    private String readingStatus;
    private boolean isVoid;
    private String matchStatus; // MATCHED, INVOICE_MISMATCH, AMOUNT_MISMATCH, BOTH_MISMATCH, READING_NOT_FOUND_FOR_MONTH, CUSTOMER_NOT_FOUND, VOID_BILL
    private String statusMessage;
    private String paidDate;
    private String agentId;
    private String agentName;
    private String confirmationCode;

    public BankInvoiceCompareRowDTO() {
    }

    public Integer getRowIndex() {
        return rowIndex;
    }

    public void setRowIndex(Integer rowIndex) {
        this.rowIndex = rowIndex;
    }

    public String getAccountNumber() {
        return accountNumber;
    }

    public void setAccountNumber(String accountNumber) {
        this.accountNumber = accountNumber;
    }

    public String getCustomerName() {
        return customerName;
    }

    public void setCustomerName(String customerName) {
        this.customerName = customerName;
    }

    public String getSystemInvoiceNumber() {
        return systemInvoiceNumber;
    }

    public void setSystemInvoiceNumber(String systemInvoiceNumber) {
        this.systemInvoiceNumber = systemInvoiceNumber;
    }

    public String getCsvInvoiceNumber() {
        return csvInvoiceNumber;
    }

    public void setCsvInvoiceNumber(String csvInvoiceNumber) {
        this.csvInvoiceNumber = csvInvoiceNumber;
    }

    public String getInvoiceDifference() {
        return invoiceDifference;
    }

    public void setInvoiceDifference(String invoiceDifference) {
        this.invoiceDifference = invoiceDifference;
    }

    public boolean isInvoiceMismatch() {
        return invoiceMismatch;
    }

    public void setInvoiceMismatch(boolean invoiceMismatch) {
        this.invoiceMismatch = invoiceMismatch;
    }

    public Double getCsvAmountDue() {
        return csvAmountDue;
    }

    public void setCsvAmountDue(Double csvAmountDue) {
        this.csvAmountDue = csvAmountDue;
    }

    public Double getTekilalaTekefay() {
        return tekilalaTekefay;
    }

    public void setTekilalaTekefay(Double tekilalaTekefay) {
        this.tekilalaTekefay = tekilalaTekefay;
    }

    public Double getAmountDifference() {
        return amountDifference;
    }

    public void setAmountDifference(Double amountDifference) {
        this.amountDifference = amountDifference;
    }

    public boolean isAmountMismatch() {
        return amountMismatch;
    }

    public void setAmountMismatch(boolean amountMismatch) {
        this.amountMismatch = amountMismatch;
    }

    public Integer getReadingId() {
        return readingId;
    }

    public void setReadingId(Integer readingId) {
        this.readingId = readingId;
    }

    public String getKifyaWer() {
        return kifyaWer;
    }

    public void setKifyaWer(String kifyaWer) {
        this.kifyaWer = kifyaWer;
    }

    public String getReadingStatus() {
        return readingStatus;
    }

    public void setReadingStatus(String readingStatus) {
        this.readingStatus = readingStatus;
    }

    public boolean isVoid() {
        return isVoid;
    }

    public void setVoid(boolean isVoid) {
        this.isVoid = isVoid;
    }

    public String getMatchStatus() {
        return matchStatus;
    }

    public void setMatchStatus(String matchStatus) {
        this.matchStatus = matchStatus;
    }

    public String getStatusMessage() {
        return statusMessage;
    }

    public void setStatusMessage(String statusMessage) {
        this.statusMessage = statusMessage;
    }

    public String getPaidDate() {
        return paidDate;
    }

    public void setPaidDate(String paidDate) {
        this.paidDate = paidDate;
    }

    public String getAgentId() {
        return agentId;
    }

    public void setAgentId(String agentId) {
        this.agentId = agentId;
    }

    public String getAgentName() {
        return agentName;
    }

    public void setAgentName(String agentName) {
        this.agentName = agentName;
    }

    public String getConfirmationCode() {
        return confirmationCode;
    }

    public void setConfirmationCode(String confirmationCode) {
        this.confirmationCode = confirmationCode;
    }
}
