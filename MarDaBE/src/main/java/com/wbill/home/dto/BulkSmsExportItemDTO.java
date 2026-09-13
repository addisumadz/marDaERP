package com.wbill.home.dto;

public class BulkSmsExportItemDTO {

    private String accountNumber;
    private String phoneNumber;
    private String message;

    public BulkSmsExportItemDTO() {
    }

    public BulkSmsExportItemDTO(String accountNumber, String phoneNumber, String message) {
        this.accountNumber = accountNumber;
        this.phoneNumber = phoneNumber;
        this.message = message;
    }

    public String getAccountNumber() {
        return accountNumber;
    }

    public void setAccountNumber(String accountNumber) {
        this.accountNumber = accountNumber;
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
}
