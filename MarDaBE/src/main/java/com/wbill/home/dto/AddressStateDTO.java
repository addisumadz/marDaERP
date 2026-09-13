package com.wbill.home.dto;

import java.util.Date;

public class AddressStateDTO {
    private Integer id;
    private Integer countryId;
    private String countryName;
    private String stateCode;
    private String stateName;
    private String status;
    private String deleted;
    private Date registeredDate;
    private Date modifiedDate;
    private Integer registeredById;
    private String registeredByName;
    private Integer modifiedById;
    private String modifiedByName;

    // Constructors
    public AddressStateDTO() {
    }

    // Constructor for basic data
    public AddressStateDTO(Integer id, Integer countryId, String stateCode, String stateName, 
                          String status, String deleted, Date registeredDate, Date modifiedDate) {
        this.id = id;
        this.countryId = countryId;
        this.stateCode = stateCode;
        this.stateName = stateName;
        this.status = status;
        this.deleted = deleted;
        this.registeredDate = registeredDate;
        this.modifiedDate = modifiedDate;
    }

    // Constructor with user information
    public AddressStateDTO(Integer id, Integer countryId, String stateCode, String stateName, 
                          String status, String deleted, Date registeredDate, Date modifiedDate,
                          Integer registeredById, String registeredByName, 
                          Integer modifiedById, String modifiedByName) {
        this.id = id;
        this.countryId = countryId;
        this.stateCode = stateCode;
        this.stateName = stateName;
        this.status = status;
        this.deleted = deleted;
        this.registeredDate = registeredDate;
        this.modifiedDate = modifiedDate;
        this.registeredById = registeredById;
        this.registeredByName = registeredByName;
        this.modifiedById = modifiedById;
        this.modifiedByName = modifiedByName;
    }

    // Constructor with country name
    public AddressStateDTO(Integer id, Integer countryId, String countryName, String stateCode, 
                          String stateName, String status, String deleted, Date registeredDate, 
                          Date modifiedDate, Integer registeredById, String registeredByName, 
                          Integer modifiedById, String modifiedByName) {
        this.id = id;
        this.countryId = countryId;
        this.countryName = countryName;
        this.stateCode = stateCode;
        this.stateName = stateName;
        this.status = status;
        this.deleted = deleted;
        this.registeredDate = registeredDate;
        this.modifiedDate = modifiedDate;
        this.registeredById = registeredById;
        this.registeredByName = registeredByName;
        this.modifiedById = modifiedById;
        this.modifiedByName = modifiedByName;
    }

    // Getters and Setters
    public Integer getId() {
        return id;
    }

    public void setId(Integer id) {
        this.id = id;
    }

    public Integer getCountryId() {
        return countryId;
    }

    public void setCountryId(Integer countryId) {
        this.countryId = countryId;
    }

    public String getCountryName() {
        return countryName;
    }

    public void setCountryName(String countryName) {
        this.countryName = countryName;
    }

    public String getStateCode() {
        return stateCode;
    }

    public void setStateCode(String stateCode) {
        this.stateCode = stateCode;
    }

    public String getStateName() {
        return stateName;
    }

    public void setStateName(String stateName) {
        this.stateName = stateName;
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

    public Integer getRegisteredById() {
        return registeredById;
    }

    public void setRegisteredById(Integer registeredById) {
        this.registeredById = registeredById;
    }

    public String getRegisteredByName() {
        return registeredByName;
    }

    public void setRegisteredByName(String registeredByName) {
        this.registeredByName = registeredByName;
    }

    public Integer getModifiedById() {
        return modifiedById;
    }

    public void setModifiedById(Integer modifiedById) {
        this.modifiedById = modifiedById;
    }

    public String getModifiedByName() {
        return modifiedByName;
    }

    public void setModifiedByName(String modifiedByName) {
        this.modifiedByName = modifiedByName;
    }
}
