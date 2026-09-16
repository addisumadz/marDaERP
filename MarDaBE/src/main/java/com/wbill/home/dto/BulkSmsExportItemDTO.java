package com.wbill.home.dto;

public class BulkSmsExportItemDTO {

    private Integer readingId;
    private String accountNumber;
    private String customerName;
    private String phoneNumber;
    private String message;
    private String billMonth;
    private Double totalAmount;
    private Boolean alreadySent;
    private String status; // READY, SENT, FAILED

    public BulkSmsExportItemDTO() {
    }

    public BulkSmsExportItemDTO(String accountNumber, String phoneNumber, String message) {
        this.accountNumber = accountNumber;
        this.phoneNumber = phoneNumber;
        this.message = message;
    }

    public BulkSmsExportItemDTO(Integer readingId, String accountNumber, String customerName,
                                String phoneNumber, String message, String billMonth,
                                Double totalAmount, Boolean alreadySent, String status) {
        this.readingId = readingId;
        this.accountNumber = accountNumber;
        this.customerName = customerName;
        this.phoneNumber = phoneNumber;
        this.message = message;
        this.billMonth = billMonth;
        this.totalAmount = totalAmount;
        this.alreadySent = alreadySent;
        this.status = status;
    }

    public Integer getReadingId() {
        return readingId;
    }

    public void setReadingId(Integer readingId) {
        this.readingId = readingId;
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

    public String getPhoneNumber() {
        return phoneNumber;
    }

    public void setPhoneNumber(String phoneNumber) {
        this.phoneNumber = phoneNumber;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }

    public String getBillMonth() {
        return billMonth;
    }

    public void setBillMonth(String billMonth) {
        this.billMonth = billMonth;
    }

    public Double getTotalAmount() {
        return totalAmount;
    }

    public void setTotalAmount(Double totalAmount) {
        this.totalAmount = totalAmount;
    }

    public Boolean getAlreadySent() {
        return alreadySent;
    }

    public void setAlreadySent(Boolean alreadySent) {
        this.alreadySent = alreadySent;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }
}
