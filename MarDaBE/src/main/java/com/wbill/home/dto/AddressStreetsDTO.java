package com.wbill.home.dto;

import com.wbill.home.model.AddressStreets;
import java.util.Date;

public class AddressStreetsDTO {
    private int id;
    private String streetsCode;
    private String streetsName;
    private int addressStreetsNumber;
    private int populationSize;
    private String status;
    private String deleted;
    private Date registeredDate;
    private Date modifiedDate;
    
    // City information (flattened to avoid circular references)
    private Integer cityId;
    private String cityCode;
    private String cityName;
    
    // Zone information (from city)
    private Integer zoneId;
    private String zoneCode;
    private String zoneName;
    
    // State information (from zone)
    private Integer stateId;
    private String stateCode;
    private String stateName;
    
    // User information (simplified)
    private String registeredByUsername;
    private String modifiedByUsername;

    // Default constructor
    public AddressStreetsDTO() {}

    // Constructor from entity
    public AddressStreetsDTO(AddressStreets street) {
        this.id = street.getId();
        this.streetsCode = street.getStreetsCode();
        this.streetsName = street.getStreetsName();
        this.addressStreetsNumber = street.getAddressStreetsNumber();
        this.populationSize = street.getPopulationSize();
        this.status = street.getStatus();
        this.deleted = street.getDeleted();
        this.registeredDate = street.getRegisteredDate();
        this.modifiedDate = street.getModifiedDate();
        
        // City information
        if (street.getAddressCity() != null) {
            this.cityId = street.getAddressCity().getId();
            this.cityCode = street.getAddressCity().getCityCode();
            this.cityName = street.getAddressCity().getCityName();
            
            // Zone information
            if (street.getAddressCity().getAddressZone() != null) {
                this.zoneId = street.getAddressCity().getAddressZone().getId();
                this.zoneCode = street.getAddressCity().getAddressZone().getZoneCode();
                this.zoneName = street.getAddressCity().getAddressZone().getZoneName();
                
                // State information
                if (street.getAddressCity().getAddressZone().getAddressState() != null) {
                    this.stateId = street.getAddressCity().getAddressZone().getAddressState().getId();
                    this.stateCode = street.getAddressCity().getAddressZone().getAddressState().getStateCode();
                    this.stateName = street.getAddressCity().getAddressZone().getAddressState().getStateName();
                }
            }
        }
        
        // User information
        if (street.getRegisteredBy() != null) {
            this.registeredByUsername = street.getRegisteredBy().getUserName();
        }
        if (street.getModifiedBy() != null) {
            this.modifiedByUsername = street.getModifiedBy().getUserName();
        }
    }

    // Getters and Setters
    public int getId() {
        return id;
    }

    public void setId(int id) {
        this.id = id;
    }

    public String getStreetsCode() {
        return streetsCode;
    }

    public void setStreetsCode(String streetsCode) {
        this.streetsCode = streetsCode;
    }

    public String getStreetsName() {
        return streetsName;
    }

    public void setStreetsName(String streetsName) {
        this.streetsName = streetsName;
    }

    public int getAddressStreetsNumber() {
        return addressStreetsNumber;
    }

    public void setAddressStreetsNumber(int addressStreetsNumber) {
        this.addressStreetsNumber = addressStreetsNumber;
    }

    public int getPopulationSize() {
        return populationSize;
    }

    public void setPopulationSize(int populationSize) {
        this.populationSize = populationSize;
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

    public Integer getCityId() {
        return cityId;
    }

    public void setCityId(Integer cityId) {
        this.cityId = cityId;
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

    public Integer getZoneId() {
        return zoneId;
    }

    public void setZoneId(Integer zoneId) {
        this.zoneId = zoneId;
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

    public String getRegisteredByUsername() {
        return registeredByUsername;
    }

    public void setRegisteredByUsername(String registeredByUsername) {
        this.registeredByUsername = registeredByUsername;
    }

    public String getModifiedByUsername() {
        return modifiedByUsername;
    }

    public void setModifiedByUsername(String modifiedByUsername) {
        this.modifiedByUsername = modifiedByUsername;
    }
}
