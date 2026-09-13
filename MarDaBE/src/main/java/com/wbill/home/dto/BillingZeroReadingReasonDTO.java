package com.wbill.home.dto;

import com.fasterxml.jackson.annotation.JsonProperty;

public class BillingZeroReadingReasonDTO {
    private Integer id;
    private String reasonCode;
    private String reasonName;
    @JsonProperty("isZeroReadingReason")
    private boolean isZeroReadingReason;
    @JsonProperty("isDoorCloseReason")
    private boolean isDoorCloseReason;
    private String deleted;

    public BillingZeroReadingReasonDTO() {}

    public BillingZeroReadingReasonDTO(Integer id, String reasonCode, String reasonName,
                                       boolean isZeroReadingReason, boolean isDoorCloseReason, String deleted) {
        this.id = id;
        this.reasonCode = reasonCode;
        this.reasonName = reasonName;
        this.isZeroReadingReason = isZeroReadingReason;
        this.isDoorCloseReason = isDoorCloseReason;
        this.deleted = deleted;
    }

    public Integer getId() {
        return id;
    }

    public void setId(Integer id) {
        this.id = id;
    }

    public String getReasonCode() {
        return reasonCode;
    }

    public void setReasonCode(String reasonCode) {
        this.reasonCode = reasonCode;
    }

    public String getReasonName() {
        return reasonName;
    }

    public void setReasonName(String reasonName) {
        this.reasonName = reasonName;
    }

    public boolean isZeroReadingReason() {
        return isZeroReadingReason;
    }

    public void setZeroReadingReason(boolean zeroReadingReason) {
        isZeroReadingReason = zeroReadingReason;
    }

    public boolean isDoorCloseReason() {
        return isDoorCloseReason;
    }

    public void setDoorCloseReason(boolean doorCloseReason) {
        isDoorCloseReason = doorCloseReason;
    }

    public String getDeleted() {
        return deleted;
    }

    public void setDeleted(String deleted) {
        this.deleted = deleted;
    }
}
