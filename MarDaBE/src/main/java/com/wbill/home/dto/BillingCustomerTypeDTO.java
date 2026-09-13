package com.wbill.home.dto;

public class BillingCustomerTypeDTO {
    private Integer id;
    private String customerType;
    private String description;
    private Double techemariKfya;
    private String deleted;

    // Constructors
    public BillingCustomerTypeDTO() {}

    public BillingCustomerTypeDTO(Integer id, String customerType, String description, 
                                 Double techemariKfya, String deleted) {
        this.id = id;
        this.customerType = customerType;
        this.description = description;
        this.techemariKfya = techemariKfya;
        this.deleted = deleted;
    }

    // Getters and Setters
    public Integer getId() {
        return id;
    }

    public void setId(Integer id) {
        this.id = id;
    }

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

    public String getDeleted() {
        return deleted;
    }

    public void setDeleted(String deleted) {
        this.deleted = deleted;
    }
}
