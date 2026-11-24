package com.wbill.home.dto;

import com.fasterxml.jackson.annotation.JsonAlias;
import com.fasterxml.jackson.annotation.JsonProperty;
import java.util.Date;

public class SmsTemplateDTO {
    private Integer id;
    private String templateCode;
    private String templateName;
    private String templateContent;
    private String description;

    @JsonProperty("isActive")
    @JsonAlias({"active", "isActive", "is_active"})
    private boolean isActive = true;

    private Date createdDate;
    private Date modifiedDate;

    public SmsTemplateDTO() {
    }

    public SmsTemplateDTO(Integer id, String templateCode, String templateName, String templateContent, String description, boolean isActive, Date createdDate, Date modifiedDate) {
        this.id = id;
        this.templateCode = templateCode;
        this.templateName = templateName;
        this.templateContent = templateContent;
        this.description = description;
        this.isActive = isActive;
        this.createdDate = createdDate;
        this.modifiedDate = modifiedDate;
    }

    public Integer getId() {
        return id;
    }

    public void setId(Integer id) {
        this.id = id;
    }

    public String getTemplateCode() {
        return templateCode;
    }

    public void setTemplateCode(String templateCode) {
        this.templateCode = templateCode;
    }

    public String getTemplateName() {
        return templateName;
    }

    public void setTemplateName(String templateName) {
        this.templateName = templateName;
    }

    public String getTemplateContent() {
        return templateContent;
    }

    public void setTemplateContent(String templateContent) {
        this.templateContent = templateContent;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    @JsonProperty("isActive")
    public boolean getIsActive() {
        return isActive;
    }

    @JsonProperty("isActive")
    public void setIsActive(boolean isActive) {
        this.isActive = isActive;
    }

    public boolean isActive() {
        return isActive;
    }

    public void setActive(boolean active) {
        this.isActive = active;
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
}

