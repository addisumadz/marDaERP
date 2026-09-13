package com.wbill.home.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public class BillingTariffCreateDTO {
    @NotNull
    private Integer customerTypeId;

    @NotBlank
    private String blockName;

    @NotNull
    @Min(0)
    private Double consumption;

    @NotNull
    @Min(0)
    private Double tarrifBirr;

    @NotNull
    private Boolean isLast;

    public Integer getCustomerTypeId() { return customerTypeId; }
    public void setCustomerTypeId(Integer customerTypeId) { this.customerTypeId = customerTypeId; }

    public String getBlockName() { return blockName; }
    public void setBlockName(String blockName) { this.blockName = blockName; }

    public Double getConsumption() { return consumption; }
    public void setConsumption(Double consumption) { this.consumption = consumption; }

    public Double getTarrifBirr() { return tarrifBirr; }
    public void setTarrifBirr(Double tarrifBirr) { this.tarrifBirr = tarrifBirr; }

    public Boolean getIsLast() { return isLast; }
    public void setIsLast(Boolean isLast) { this.isLast = isLast; }
}
