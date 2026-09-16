package com.wbill.home.model;

import java.io.Serializable;
import java.util.Date;
import jakarta.persistence.*;

@Entity
@Table(name = "sms_setting")
public class SmsSetting implements Serializable {
    private static final long serialVersionUID = 1L;

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private int id;

    @Column(name = "city_id")
    private Integer cityId;

    @Column(name = "city_name", nullable = false, length = 150)
    private String cityName;

    @Column(name = "gateway_url", nullable = false, length = 500)
    private String gatewayUrl;

    @Column(name = "api_key", nullable = false, length = 500)
    private String apiKey;

    @Column(name = "sender_id", length = 100)
    private String senderId;

    @Column(name = "is_active", nullable = false)
    private boolean isActive = true;

    @Column(name = "description", length = 255)
    private String description;

    @Temporal(TemporalType.TIMESTAMP)
    @Column(name = "created_date")
    private Date createdDate;

    @Temporal(TemporalType.TIMESTAMP)
    @Column(name = "modified_date")
    private Date modifiedDate;

    @Column(name = "protocol", length = 30)
    private String protocol = "HTTP_REST";

    @Column(name = "smpp_host", length = 255)
    private String smppHost;

    @Column(name = "smpp_port")
    private Integer smppPort = 5019;

    @Column(name = "smpp_system_id", length = 100)
    private String smppSystemId;

    @Column(name = "smpp_password", length = 255)
    private String smppPassword;

    public SmsSetting() {
    }

    public SmsSetting(Integer cityId, String cityName, String gatewayUrl, String apiKey, String senderId, boolean isActive, String description) {
        this.cityId = cityId;
        this.cityName = cityName;
        this.gatewayUrl = gatewayUrl;
        this.apiKey = apiKey;
        this.senderId = senderId;
        this.isActive = isActive;
        this.description = description;
        this.createdDate = new Date();
        this.modifiedDate = new Date();
    }

    @PrePersist
    protected void onCreate() {
        this.createdDate = new Date();
        this.modifiedDate = new Date();
    }

    @PreUpdate
    protected void onUpdate() {
        this.modifiedDate = new Date();
    }

    public int getId() {
        return id;
    }

    public void setId(int id) {
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

    public boolean isActive() {
        return isActive;
    }

    public void setActive(boolean active) {
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
