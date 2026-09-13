package com.wbill.home.dto;

public class AddressKetenaCreateDTO {
    private String ketenaCode;
    private String ketenaName;
    private Integer populationSize;
    private Integer streetsId;

    // Constructors
    public AddressKetenaCreateDTO() {}

    public AddressKetenaCreateDTO(String ketenaCode, String ketenaName, Integer populationSize, Integer streetsId) {
        this.ketenaCode = ketenaCode;
        this.ketenaName = ketenaName;
        this.populationSize = populationSize;
        this.streetsId = streetsId;
    }

    // Getters and Setters
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

    public Integer getStreetsId() {
        return streetsId;
    }

    public void setStreetsId(Integer streetsId) {
        this.streetsId = streetsId;
    }
}
