package com.wbill.home.dto;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Positive;

public class BillingMeterSizeCreateDTO {
    @NotNull(message = "Meter size is required")
    @Positive(message = "Meter size must be positive")
    private Double meterSize;

    @NotBlank(message = "Meter code is required")
    private String meterCode;

    // Constructors
    public BillingMeterSizeCreateDTO() {}

    public BillingMeterSizeCreateDTO(Double meterSize, String meterCode) {
        this.meterSize = meterSize;
        this.meterCode = meterCode;
    }

    // Getters and Setters
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
}
