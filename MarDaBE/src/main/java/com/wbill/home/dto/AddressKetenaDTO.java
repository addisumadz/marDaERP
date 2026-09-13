package com.wbill.home.dto;

public class AddressKetenaDTO {
    private Integer id;
    private String ketenaCode;
    private String ketenaName;
    private Integer populationSize;
    private String deleted;
    
    // Street/Kebele information
    private Integer streetsId;
    private String streetsCode;
    private String streetsName;
    
    // City information
    private Integer cityId;
    private String cityName;
    private String cityCode;
    
    // Zone information
    private Integer zoneId;
    private String zoneName;
    private String zoneCode;
    
    // State information
    private Integer stateId;
    private String stateName;
    private String stateCode;

    // Constructors
    public AddressKetenaDTO() {}

    public AddressKetenaDTO(Integer id, String ketenaCode, String ketenaName, Integer populationSize,
                           String deleted,
                           Integer streetsId, String streetsCode, String streetsName,
                           Integer cityId, String cityName, String cityCode,
                           Integer zoneId, String zoneName, String zoneCode,
                           Integer stateId, String stateName, String stateCode) {
        this.id = id;
        this.ketenaCode = ketenaCode;
        this.ketenaName = ketenaName;
        this.populationSize = populationSize;
        this.deleted = deleted;
        this.streetsId = streetsId;
        this.streetsCode = streetsCode;
        this.streetsName = streetsName;
        this.cityId = cityId;
        this.cityName = cityName;
        this.cityCode = cityCode;
        this.zoneId = zoneId;
        this.zoneName = zoneName;
        this.zoneCode = zoneCode;
        this.stateId = stateId;
        this.stateName = stateName;
        this.stateCode = stateCode;
    }

    // Getters and Setters
    public Integer getId() {
        return id;
    }

    public void setId(Integer id) {
        this.id = id;
    }

    public String getKetenaCode() {
        return ketenaCode;
    }

    public void setKetenaCode(String ketenaCode) {
        this.ketenaCode = ketenaCode;
    }

    public String getKetenaName() {
        return ketenaName;
    }

    public void setKetenaName(String ketenaName) {
        this.ketenaName = ketenaName;
    }

    public Integer getPopulationSize() {
        return populationSize;
    }

    public void setPopulationSize(Integer populationSize) {
        this.populationSize = populationSize;
    }

    public String getDeleted() {
        return deleted;
    }

    public void setDeleted(String deleted) {
        this.deleted = deleted;
    }

    public Integer getStreetsId() {
        return streetsId;
    }

    public void setStreetsId(Integer streetsId) {
        this.streetsId = streetsId;
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

    public String getCityCode() {
        return cityCode;
    }

    public void setCityCode(String cityCode) {
        this.cityCode = cityCode;
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

}
