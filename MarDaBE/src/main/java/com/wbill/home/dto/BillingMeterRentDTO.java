package com.wbill.home.dto;

public class BillingMeterRentDTO {
    private Integer id;
    private Integer billingCustomerTypeId;
    private String customerTypeName;
    private Integer meterSizeId;
    private String meterCode;
    private Double meterSize;
    private Double rentBirr;
    private String status;

    // Constructors
    public BillingMeterRentDTO() {}

    public BillingMeterRentDTO(Integer id, Integer billingCustomerTypeId, String customerTypeName,
                              Integer meterSizeId, String meterCode, Double meterSize, 
                              Double rentBirr, String status) {
        this.id = id;
        this.billingCustomerTypeId = billingCustomerTypeId;
        this.customerTypeName = customerTypeName;
        this.meterSizeId = meterSizeId;
        this.meterCode = meterCode;
        this.meterSize = meterSize;
        this.rentBirr = rentBirr;
        this.status = status;
    }

    // Getters and Setters
    public Integer getId() {
        return id;
    }

    public void setId(Integer id) {
        this.id = id;
    }

    public Integer getBillingCustomerTypeId() {
        return billingCustomerTypeId;
    }

    public void setBillingCustomerTypeId(Integer billingCustomerTypeId) {
        this.billingCustomerTypeId = billingCustomerTypeId;
    }

    public String getCustomerTypeName() {
        return customerTypeName;
    }

    public void setCustomerTypeName(String customerTypeName) {
        this.customerTypeName = customerTypeName;
    }

    public Integer getMeterSizeId() {
        return meterSizeId;
    }

    public void setMeterSizeId(Integer meterSizeId) {
        this.meterSizeId = meterSizeId;
    }

    public String getMeterCode() {
        return meterCode;
    }

    public void setMeterCode(String meterCode) {
        this.meterCode = meterCode;
    }

    public Double getMeterSize() {
        return meterSize;
    }

    public void setMeterSize(Double meterSize) {
        this.meterSize = meterSize;
    }

    public Double getRentBirr() {
        return rentBirr;
    }

    public void setRentBirr(Double rentBirr) {
        this.rentBirr = rentBirr;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }
}
