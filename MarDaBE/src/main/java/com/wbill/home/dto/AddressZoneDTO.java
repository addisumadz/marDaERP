package com.wbill.home.dto;

import java.util.Date;

public class AddressZoneDTO {
    private Integer id;
    private String zoneCode;
    private String zoneName;
    private Integer stateId;
    private String stateName;
    private String countryName;
    private String status;
    private String deleted;
    private Date registeredDate;
    private Date modifiedDate;
    private String registeredByUserName;
    private String modifiedByUserName;

    // Default constructor
    public AddressZoneDTO() {}

    // Constructor for basic data (create/update operations)
    public AddressZoneDTO(String zoneCode, String zoneName, Integer stateId) {
        this.zoneCode = zoneCode;
        this.zoneName = zoneName;
        this.stateId = stateId;
    }

    // Constructor for detailed data (list/view operations)
    public AddressZoneDTO(Integer id, String zoneCode, String zoneName, Integer stateId, 
                         String stateName, String countryName, String status, String deleted,
                         Date registeredDate, Date modifiedDate, 
                         String registeredByUserName, String modifiedByUserName) {
        this.id = id;
        this.zoneCode = zoneCode;
        this.zoneName = zoneName;
        this.stateId = stateId;
        this.stateName = stateName;
        this.countryName = countryName;
        this.status = status;
        this.deleted = deleted;
        this.registeredDate = registeredDate;
        this.modifiedDate = modifiedDate;
        this.registeredByUserName = registeredByUserName;
        this.modifiedByUserName = modifiedByUserName;
    }

    // Getters and Setters
    public Integer getId() {
        return id;
    }

    public void setId(Integer id) {
        this.id = id;
    }

    public String getZoneCode() {
        return zoneCode;
    }

    public void setZoneCode(String zoneCode) {
        this.zoneCode = zoneCode;
    }

    public String getZoneName() {
        return zoneName;
    }

    public void setZoneName(String zoneName) {
        this.zoneName = zoneName;
    }

    public Integer getStateId() {
        return stateId;
    }

    public void setStateId(Integer stateId) {
        this.stateId = stateId;
    }

    public String getStateName() {
        return stateName;
    }

    public void setStateName(String stateName) {
        this.stateName = stateName;
    }

    public String getCountryName() {
        return countryName;
    }

    public void setCountryName(String countryName) {
        this.countryName = countryName;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public String getDeleted() {
        return deleted;
    }

    public void setDeleted(String deleted) {
        this.deleted = deleted;
    }

    public Date getRegisteredDate() {
        return registeredDate;
    }

    public void setRegisteredDate(Date registeredDate) {
        this.registeredDate = registeredDate;
    }

    public Date getModifiedDate() {
        return modifiedDate;
    }

    public void setModifiedDate(Date modifiedDate) {
        this.modifiedDate = modifiedDate;
    }

    public String getRegisteredByUserName() {
        return registeredByUserName;
    }

    public void setRegisteredByUserName(String registeredByUserName) {
        this.registeredByUserName = registeredByUserName;
    }

    public String getModifiedByUserName() {
        return modifiedByUserName;
    }

    public void setModifiedByUserName(String modifiedByUserName) {
        this.modifiedByUserName = modifiedByUserName;
    }
}
