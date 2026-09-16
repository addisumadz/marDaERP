package com.wbill.home.dto;

public class GatewaySingleSmsRequestDTO {

    private Integer readingId;
    private String phoneNumber;
    private String message;
    private String gatewayUrl;
    private String apiKey;

    public GatewaySingleSmsRequestDTO() {
    }

    public GatewaySingleSmsRequestDTO(Integer readingId, String phoneNumber, String message, String gatewayUrl, String apiKey) {
        this.readingId = readingId;
        this.phoneNumber = phoneNumber;
        this.message = message;
        this.gatewayUrl = gatewayUrl;
        this.apiKey = apiKey;
    }

    public Integer getReadingId() {
        return readingId;
    }

    public void setReadingId(Integer readingId) {
        this.readingId = readingId;
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

    public String getGatewayUrl() {
        return gatewayUrl;
    }

    public void setGatewayUrl(String gatewayUrl) {
        this.gatewayUrl = gatewayUrl;
    }

    public String getApiKey() {
        return apiKey;
    }

    public void setApiKey(String apiKey) {
        this.apiKey = apiKey;
    }
}
