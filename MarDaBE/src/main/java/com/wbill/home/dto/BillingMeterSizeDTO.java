package com.wbill.home.dto;

public class BillingMeterSizeDTO {
    private Integer id;
    private Double meterSize;
    private String meterCode;
    private String deleted;

    // Constructors
    public BillingMeterSizeDTO() {}

    public BillingMeterSizeDTO(Integer id, Double meterSize, String meterCode, String deleted) {
        this.id = id;
        this.meterSize = meterSize;
        this.meterCode = meterCode;
        this.deleted = deleted;
    }

    // Getters and Setters
    public Integer getId() {
        return id;
    }

    public void setId(Integer id) {
        this.id = id;
    }

    public Double getMeterSize() {
        return meterSize;
    }

    public void setMeterSize(Double meterSize) {
        this.meterSize = meterSize;
    }

    public String getMeterCode() {
        return meterCode;
    }

    public void setMeterCode(String meterCode) {
        this.meterCode = meterCode;
    }

    public String getDeleted() {
        return deleted;
    }

    public void setDeleted(String deleted) {
        this.deleted = deleted;
    }
}
