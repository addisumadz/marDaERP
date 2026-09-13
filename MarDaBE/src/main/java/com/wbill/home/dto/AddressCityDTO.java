package com.wbill.home.dto;

import java.util.Date;

public class AddressCityDTO {
    private Integer id;
    private String cityCode;
    private String cityName;
    private Double centerLatitude;
    private Double centerLongitude;
    private Integer populationSize;
    private Integer publicTapUser;
    private Integer averageHouseHoldSize;
    private String status;
    private String deleted;
    private Date registeredDate;
    private Date modifiedDate;
    
    // Zone relationship fields
    private Integer zoneId;
    private String zoneName;
    private String zoneCode;
    
    // State relationship fields (through zone)
    private Integer stateId;
    private String stateName;
    private String stateCode;
    
    // Country relationship fields (through state)
    private Integer countryId;
    private String countryName;
    private String countryCode;
    
    // Audit fields
    private Integer registeredBy;
    private String registeredByUserName;
    private Integer modifiedBy;
    private String modifiedByUserName;

    // Default constructor
    public AddressCityDTO() {
    }

    // Constructor for basic city information
    public AddressCityDTO(Integer id, String cityCode, String cityName, 
                         Double centerLatitude, Double centerLongitude,
                         Integer populationSize, Integer publicTapUser, 
                         Integer averageHouseHoldSize, String status, String deleted,
                         Date registeredDate, Date modifiedDate, Integer zoneId) {
        this.id = id;
        this.cityCode = cityCode;
        this.cityName = cityName;
        this.centerLatitude = centerLatitude;
        this.centerLongitude = centerLongitude;
        this.populationSize = populationSize;
        this.publicTapUser = publicTapUser;
        this.averageHouseHoldSize = averageHouseHoldSize;
        this.status = status;
        this.deleted = deleted;
        this.registeredDate = registeredDate;
        this.modifiedDate = modifiedDate;
        this.zoneId = zoneId;
    }

    // Constructor with zone information
    public AddressCityDTO(Integer id, String cityCode, String cityName,
                         Double centerLatitude, Double centerLongitude,
                         Integer populationSize, Integer publicTapUser,
                         Integer averageHouseHoldSize, String status, String deleted,
                         Date registeredDate, Date modifiedDate,
                         Integer zoneId, String zoneName, String zoneCode,
                         Integer stateId, String stateName, String stateCode,
                         Integer countryId, String countryName, String countryCode,
                         Integer registeredBy, String registeredByUserName,
                         Integer modifiedBy, String modifiedByUserName) {
        this.id = id;
        this.cityCode = cityCode;
        this.cityName = cityName;
        this.centerLatitude = centerLatitude;
        this.centerLongitude = centerLongitude;
        this.populationSize = populationSize;
        this.publicTapUser = publicTapUser;
        this.averageHouseHoldSize = averageHouseHoldSize;
        this.status = status;
        this.deleted = deleted;
        this.registeredDate = registeredDate;
        this.modifiedDate = modifiedDate;
        this.zoneId = zoneId;
        this.zoneName = zoneName;
        this.zoneCode = zoneCode;
        this.stateId = stateId;
        this.stateName = stateName;
        this.stateCode = stateCode;
        this.countryId = countryId;
        this.countryName = countryName;
        this.countryCode = countryCode;
        this.registeredBy = registeredBy;
        this.registeredByUserName = registeredByUserName;
        this.modifiedBy = modifiedBy;
        this.modifiedByUserName = modifiedByUserName;
    }

    // Getters and Setters
    public Integer getId() {
        return id;
    }

    public void setId(Integer id) {
        this.id = id;
    }

    public String getCityCode() {
        return cityCode;
    }

    public void setCityCode(String cityCode) {
        this.cityCode = cityCode;
    }

    public String getCityName() {
        return cityName;
    }

    public void setCityName(String cityName) {
        this.cityName = cityName;
    }

    public Double getCenterLatitude() {
        return centerLatitude;
    }

    public void setCenterLatitude(Double centerLatitude) {
        this.centerLatitude = centerLatitude;
    }

    public Double getCenterLongitude() {
        return centerLongitude;
    }

    public void setCenterLongitude(Double centerLongitude) {
        this.centerLongitude = centerLongitude;
    }

    public Integer getPopulationSize() {
        return populationSize;
    }

    public void setPopulationSize(Integer populationSize) {
        this.populationSize = populationSize;
    }

    public Integer getPublicTapUser() {
        return publicTapUser;
    }

    public void setPublicTapUser(Integer publicTapUser) {
        this.publicTapUser = publicTapUser;
    }

    public Integer getAverageHouseHoldSize() {
        return averageHouseHoldSize;
    }

    public void setAverageHouseHoldSize(Integer averageHouseHoldSize) {
        this.averageHouseHoldSize = averageHouseHoldSize;
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

    public Integer getZoneId() {
        return zoneId;
    }

    public void setZoneId(Integer zoneId) {
        this.zoneId = zoneId;
    }

    public String getZoneName() {
        return zoneName;
    }

    public void setZoneName(String zoneName) {
        this.zoneName = zoneName;
    }

    public String getZoneCode() {
        return zoneCode;
    }

    public void setZoneCode(String zoneCode) {
        this.zoneCode = zoneCode;
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

    public String getStateCode() {
        return stateCode;
    }

    public void setStateCode(String stateCode) {
        this.stateCode = stateCode;
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

    public String getCountryCode() {
        return countryCode;
    }

    public void setCountryCode(String countryCode) {
        this.countryCode = countryCode;
    }

    public Integer getRegisteredBy() {
        return registeredBy;
    }

    public void setRegisteredBy(Integer registeredBy) {
        this.registeredBy = registeredBy;
    }

    public String getRegisteredByUserName() {
        return registeredByUserName;
    }

    public void setRegisteredByUserName(String registeredByUserName) {
        this.registeredByUserName = registeredByUserName;
    }

    public Integer getModifiedBy() {
        return modifiedBy;
    }

    public void setModifiedBy(Integer modifiedBy) {
        this.modifiedBy = modifiedBy;
    }

    public String getModifiedByUserName() {
        return modifiedByUserName;
    }

    public void setModifiedByUserName(String modifiedByUserName) {
        this.modifiedByUserName = modifiedByUserName;
    }
}
