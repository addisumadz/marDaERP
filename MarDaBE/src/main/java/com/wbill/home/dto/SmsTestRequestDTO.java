package com.wbill.home.dto;

public class SmsTestRequestDTO {
    private String phoneNumber;
    private String message;

    public SmsTestRequestDTO() {
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
