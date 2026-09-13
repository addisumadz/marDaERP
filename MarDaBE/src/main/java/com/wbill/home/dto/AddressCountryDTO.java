package com.wbill.home.dto;

import java.util.Date;

public class AddressCountryDTO {
    private int id;
    private String countryCode;
    private String countryName;
    private String continent;
    private String status;
    private String deleted;
    private Date registeredDate;
    private Date modifiedDate;
    
    // User information for registered/modified by
    private Integer registeredById;
    private String registeredByName;
    private Integer modifiedById;
    private String modifiedByName;

    // Default constructor
    public AddressCountryDTO() {}

    // Constructor for basic fields
    public AddressCountryDTO(int id, String countryCode, String countryName, String continent, 
                           String status, String deleted, Date registeredDate, Date modifiedDate) {
        this.id = id;
        this.countryCode = countryCode;
        this.countryName = countryName;
        this.continent = continent;
        this.status = status;
        this.deleted = deleted;
        this.registeredDate = registeredDate;
        this.modifiedDate = modifiedDate;
    }

    // Full constructor
    public AddressCountryDTO(int id, String countryCode, String countryName, String continent, 
                           String status, String deleted, Date registeredDate, Date modifiedDate,
                           Integer registeredById, String registeredByName, 
                           Integer modifiedById, String modifiedByName) {
        this(id, countryCode, countryName, continent, status, deleted, registeredDate, modifiedDate);
        this.registeredById = registeredById;
        this.registeredByName = registeredByName;
        this.modifiedById = modifiedById;
        this.modifiedByName = modifiedByName;
    }

    // Getters and Setters
    public int getId() {
        return id;
    }

    public void setId(int id) {
        this.id = id;
    }

    public String getCountryCode() {
        return countryCode;
    }

    public void setCountryCode(String countryCode) {
        this.countryCode = countryCode;
    }

    public String getCountryName() {
        return countryName;
    }

    public void setCountryName(String countryName) {
        this.countryName = countryName;
    }

    public String getContinent() {
        return continent;
    }

    public void setContinent(String continent) {
        this.continent = continent;
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
