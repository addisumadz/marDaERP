package com.wbill.home.dto;

public class BillingCustomerTypeCreateDTO {
    private String customerType;
    private String description;
    private Double techemariKfya;

    // Constructors
    public BillingCustomerTypeCreateDTO() {}

    public BillingCustomerTypeCreateDTO(String customerType, String description, Double techemariKfya) {
        this.customerType = customerType;
        this.description = description;
        this.techemariKfya = techemariKfya;
    }

    // Getters and Setters
    public String getCustomerType() {
        return customerType;
    }

    public void setCustomerType(String customerType) {
        this.customerType = customerType;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public Double getTechemariKfya() {
        return techemariKfya;
    }

    public void setTechemariKfya(Double techemariKfya) {
        this.techemariKfya = techemariKfya;
    }
}
