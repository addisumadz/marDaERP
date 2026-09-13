package com.wbill.home.dto;

public class BillingPenaltyTarifDTO {
    private Integer id;
    private Integer customerTypeId;
    private String customerTypeName;
    private Boolean isPercent;
    private Double penalityBirr;
    private Double additionalPenalty;
    private Integer numberOfMonth;
    private Boolean bewerBzatYbaza;
    private Boolean weruLayDemr;
    private Boolean enaKezihBelay;
    private String deleted;

    // Constructors
    public BillingPenaltyTarifDTO() {}

    public BillingPenaltyTarifDTO(Integer id, Integer customerTypeId, String customerTypeName,
                                 Boolean isPercent, Double penalityBirr, Double additionalPenalty,
                                 Integer numberOfMonth, Boolean bewerBzatYbaza, Boolean weruLayDemr,
                                 Boolean enaKezihBelay, String deleted) {
        this.id = id;
        this.customerTypeId = customerTypeId;
        this.customerTypeName = customerTypeName;
        this.isPercent = isPercent;
        this.penalityBirr = penalityBirr;
        this.additionalPenalty = additionalPenalty;
        this.numberOfMonth = numberOfMonth;
        this.bewerBzatYbaza = bewerBzatYbaza;
        this.weruLayDemr = weruLayDemr;
        this.enaKezihBelay = enaKezihBelay;
        this.deleted = deleted;
    }

    // Getters and Setters
    public Integer getId() {
        return id;
    }

    public void setId(Integer id) {
        this.id = id;
    }

    public Integer getCustomerTypeId() {
        return customerTypeId;
    }

    public void setCustomerTypeId(Integer customerTypeId) {
        this.customerTypeId = customerTypeId;
    }

    public String getCustomerTypeName() {
        return customerTypeName;
    }

    public void setCustomerTypeName(String customerTypeName) {
        this.customerTypeName = customerTypeName;
    }

    public Boolean getIsPercent() {
        return isPercent;
    }

    public void setIsPercent(Boolean isPercent) {
        this.isPercent = isPercent;
    }

    public Double getPenalityBirr() {
        return penalityBirr;
    }

    public void setPenalityBirr(Double penalityBirr) {
        this.penalityBirr = penalityBirr;
    }

    public Double getAdditionalPenalty() {
        return additionalPenalty;
    }

    public void setAdditionalPenalty(Double additionalPenalty) {
        this.additionalPenalty = additionalPenalty;
    }

    public Integer getNumberOfMonth() {
        return numberOfMonth;
    }

    public void setNumberOfMonth(Integer numberOfMonth) {
        this.numberOfMonth = numberOfMonth;
    }

    public Boolean getBewerBzatYbaza() {
        return bewerBzatYbaza;
    }

    public void setBewerBzatYbaza(Boolean bewerBzatYbaza) {
        this.bewerBzatYbaza = bewerBzatYbaza;
    }

    public Boolean getWeruLayDemr() {
        return weruLayDemr;
    }

    public void setWeruLayDemr(Boolean weruLayDemr) {
        this.weruLayDemr = weruLayDemr;
    }

    public Boolean getEnaKezihBelay() {
        return enaKezihBelay;
    }

    public void setEnaKezihBelay(Boolean enaKezihBelay) {
        this.enaKezihBelay = enaKezihBelay;
    }

    public String getDeleted() {
        return deleted;
    }

    public void setDeleted(String deleted) {
        this.deleted = deleted;
    }
}
