package com.wbill.home.dto;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PositiveOrZero;

public class BillingMeterRentCreateDTO {
    @NotNull(message = "Customer type ID is required")
    private Integer billingCustomerTypeId;
    
    @NotNull(message = "Meter size ID is required")
    private Integer meterSizeId;
    
    @NotNull(message = "Rent amount is required")
    @PositiveOrZero(message = "Rent amount must be zero or positive")
    private Double rentBirr;

    // Constructors
    public BillingMeterRentCreateDTO() {}

    public BillingMeterRentCreateDTO(Integer billingCustomerTypeId, Integer meterSizeId, Double rentBirr) {
        this.billingCustomerTypeId = billingCustomerTypeId;
        this.meterSizeId = meterSizeId;
        this.rentBirr = rentBirr;
    }

    // Getters and Setters
    public Integer getBillingCustomerTypeId() {
        return billingCustomerTypeId;
    }

    public void setBillingCustomerTypeId(Integer billingCustomerTypeId) {
        this.billingCustomerTypeId = billingCustomerTypeId;
    }

    public Integer getMeterSizeId() {
        return meterSizeId;
    }

    public void setMeterSizeId(Integer meterSizeId) {
        this.meterSizeId = meterSizeId;
    }

    public Double getRentBirr() {
        return rentBirr;
    }

    public void setRentBirr(Double rentBirr) {
        this.rentBirr = rentBirr;
    }
}
