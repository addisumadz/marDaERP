package com.wbill.home.dto;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.PositiveOrZero;

public class BillingPenaltyTarifCreateDTO {
    @NotNull(message = "Customer type ID is required")
    private Integer customerTypeId;

    @NotNull(message = "Is percent field is required")
    private Boolean isPercent;

    @NotNull(message = "Penalty birr is required")
    @PositiveOrZero(message = "Penalty birr must be positive or zero")
    private Double penalityBirr;

    @NotNull(message = "Additional penalty is required")
    @PositiveOrZero(message = "Additional penalty must be positive or zero")
    private Double additionalPenalty;

    @NotNull(message = "Number of months is required")
    @Min(value = 1, message = "Number of months must be at least 1")
    private Integer numberOfMonth;

    @NotNull(message = "Bewer bzat ybaza field is required")
    private Boolean bewerBzatYbaza;

    @NotNull(message = "Weru lay demr field is required")
    private Boolean weruLayDemr;

    @NotNull(message = "Ena kezih belay field is required")
    private Boolean enaKezihBelay;

    // Constructors
    public BillingPenaltyTarifCreateDTO() {}

    public BillingPenaltyTarifCreateDTO(Integer customerTypeId, Boolean isPercent, Double penalityBirr,
                                       Double additionalPenalty, Integer numberOfMonth, Boolean bewerBzatYbaza,
                                       Boolean weruLayDemr, Boolean enaKezihBelay) {
        this.customerTypeId = customerTypeId;
        this.isPercent = isPercent;
        this.penalityBirr = penalityBirr;
        this.additionalPenalty = additionalPenalty;
        this.numberOfMonth = numberOfMonth;
        this.bewerBzatYbaza = bewerBzatYbaza;
        this.weruLayDemr = weruLayDemr;
        this.enaKezihBelay = enaKezihBelay;
    }

    // Getters and Setters
    public Integer getCustomerTypeId() {
        return customerTypeId;
    }

    public void setCustomerTypeId(Integer customerTypeId) {
        this.customerTypeId = customerTypeId;
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
}
