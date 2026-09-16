package com.wbill.home.dto;

import java.io.Serializable;
import java.util.Date;

public class SmsSettingDTO implements Serializable {
    private static final long serialVersionUID = 1L;

    private Integer id;
    private Integer cityId;
    private String cityName;
    private String gatewayUrl;
    private String apiKey;
    private String senderId;
    private Boolean isActive = true;
    private String description;
    private Date createdDate;
    private Date modifiedDate;
    private String protocol = "HTTP_REST";
    private String smppHost;
    private Integer smppPort = 5019;
    private String smppSystemId;
    private String smppPassword;

    public SmsSettingDTO() {
    }

    public SmsSettingDTO(Integer id, Integer cityId, String cityName, String gatewayUrl, String apiKey, String senderId, Boolean isActive, String description, Date createdDate, Date modifiedDate) {
        this.id = id;
        this.cityId = cityId;
        this.cityName = cityName;
        this.gatewayUrl = gatewayUrl;
        this.apiKey = apiKey;
        this.senderId = senderId;
        this.isActive = isActive;
        this.description = description;
        this.createdDate = createdDate;
        this.modifiedDate = modifiedDate;
    }

    public SmsSettingDTO(Integer id, Integer cityId, String cityName, String gatewayUrl, String apiKey, String senderId, Boolean isActive, String description, Date createdDate, Date modifiedDate, String protocol, String smppHost, Integer smppPort, String smppSystemId, String smppPassword) {
        this.id = id;
        this.cityId = cityId;
        this.cityName = cityName;
        this.gatewayUrl = gatewayUrl;
        this.apiKey = apiKey;
        this.senderId = senderId;
        this.isActive = isActive;
        this.description = description;
        this.createdDate = createdDate;
        this.modifiedDate = modifiedDate;
        this.protocol = protocol;
        this.smppHost = smppHost;
        this.smppPort = smppPort;
        this.smppSystemId = smppSystemId;
        this.smppPassword = smppPassword;
    }

    public Integer getId() {
        return id;
    }

    public void setId(Integer id) {
        this.id = id;
    }

    public Integer getCityId() {
        return cityId;
    }

    public void setCityId(Integer cityId) {
        this.cityId = cityId;
    }

    public String getCityName() {
        return cityName;
    }

    public void setCityName(String cityName) {
        this.cityName = cityName;
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

    public String getSenderId() {
        return senderId;
    }

    public void setSenderId(String senderId) {
        this.senderId = senderId;
    }

    public Boolean getIsActive() {
        return isActive;
    }

    public void setIsActive(Boolean active) {
        isActive = active;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public Date getCreatedDate() {
        return createdDate;
    }

    public void setCreatedDate(Date createdDate) {
        this.createdDate = createdDate;
    }

    public Date getModifiedDate() {
        return modifiedDate;
    }

    public void setModifiedDate(Date modifiedDate) {
        this.modifiedDate = modifiedDate;
    }

    public String getProtocol() {
        return protocol;
    }

    public void setProtocol(String protocol) {
        this.protocol = protocol;
    }

    public String getSmppHost() {
        return smppHost;
    }

    public void setSmppHost(String smppHost) {
        this.smppHost = smppHost;
    }

    public Integer getSmppPort() {
        return smppPort;
    }

    public void setSmppPort(Integer smppPort) {
        this.smppPort = smppPort;
    }

    public String getSmppSystemId() {
        return smppSystemId;
    }

    public void setSmppSystemId(String smppSystemId) {
        this.smppSystemId = smppSystemId;
    }

    public String getSmppPassword() {
        return smppPassword;
    }

    public void setSmppPassword(String smppPassword) {
        this.smppPassword = smppPassword;
    }
}
