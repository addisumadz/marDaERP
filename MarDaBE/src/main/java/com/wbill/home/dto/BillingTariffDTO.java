package com.wbill.home.dto;

public class BillingTariffDTO {
    private Integer id;
    private Integer customerTypeId;
    private String customerTypeName;
    private String blockName;
    private Double consumption;
    private Double tarrifBirr;
    private String status;
    private Boolean isLast;

    public BillingTariffDTO(Integer id, Integer customerTypeId, String customerTypeName,
                             String blockName, Double consumption, Double tarrifBirr,
                             String status, Boolean isLast) {
        this.id = id;
        this.customerTypeId = customerTypeId;
        this.customerTypeName = customerTypeName;
        this.blockName = blockName;
        this.consumption = consumption;
        this.tarrifBirr = tarrifBirr;
        this.status = status;
        this.isLast = isLast;
    }

    public Integer getId() { return id; }
    public Integer getCustomerTypeId() { return customerTypeId; }
    public String getCustomerTypeName() { return customerTypeName; }
    public String getBlockName() { return blockName; }
    public Double getConsumption() { return consumption; }
    public Double getTarrifBirr() { return tarrifBirr; }
    public String getStatus() { return status; }
    public Boolean getIsLast() { return isLast; }
}
