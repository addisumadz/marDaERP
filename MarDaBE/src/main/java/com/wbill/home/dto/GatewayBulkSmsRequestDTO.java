package com.wbill.home.dto;

import java.util.List;

public class GatewayBulkSmsRequestDTO {

    private List<Integer> readingIds;
    private String gatewayUrl;
    private String apiKey;
    private String smsDueDateText;
    private String monthYearPart;
    private List<CustomSmsItemDTO> customItems;
    private String protocol;
    private Integer cityId;

    public GatewayBulkSmsRequestDTO() {
    }

    public List<Integer> getReadingIds() {
        return readingIds;
    }

    public void setReadingIds(List<Integer> readingIds) {
        this.readingIds = readingIds;
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

    public String getSmsDueDateText() {
        return smsDueDateText;
    }

    public void setSmsDueDateText(String smsDueDateText) {
        this.smsDueDateText = smsDueDateText;
    }

    public String getMonthYearPart() {
        return monthYearPart;
    }

    public void setMonthYearPart(String monthYearPart) {
        this.monthYearPart = monthYearPart;
    }

    public List<CustomSmsItemDTO> getCustomItems() {
        return customItems;
    }

    public void setCustomItems(List<CustomSmsItemDTO> customItems) {
        this.customItems = customItems;
    }

    public String getProtocol() {
        return protocol;
    }

    public void setProtocol(String protocol) {
        this.protocol = protocol;
    }

    public Integer getCityId() {
        return cityId;
    }

    public void setCityId(Integer cityId) {
        this.cityId = cityId;
    }

    public static class CustomSmsItemDTO {
        private Integer readingId;
        private String phoneNumber;
        private String message;

        public CustomSmsItemDTO() {
        }

        public CustomSmsItemDTO(Integer readingId, String phoneNumber, String message) {
            this.readingId = readingId;
            this.phoneNumber = phoneNumber;
            this.message = message;
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
    }
}
