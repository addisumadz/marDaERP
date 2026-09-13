package com.wbill.home.dto;

public class AddressStreetsCreateDTO {
    private String streetsCode;
    private String streetsName;
    private int addressStreetsNumber;
    private int populationSize;
    private Integer cityId;

    // Default constructor
    public AddressStreetsCreateDTO() {}

    // Constructor
    public AddressStreetsCreateDTO(String streetsCode, String streetsName, int addressStreetsNumber, int populationSize, Integer cityId) {
        this.streetsCode = streetsCode;
        this.streetsName = streetsName;
        this.addressStreetsNumber = addressStreetsNumber;
        this.populationSize = populationSize;
        this.cityId = cityId;
    }

    // Getters and Setters
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

    public Integer getCityId() {
        return cityId;
    }

    public void setCityId(Integer cityId) {
        this.cityId = cityId;
    }
}
