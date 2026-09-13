package com.wbill.home.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import com.fasterxml.jackson.annotation.JsonProperty;

public class BillingZeroReadingReasonCreateDTO {
    @NotBlank
    @Size(max = 50)
    private String reasonCode;

    @NotBlank
    @Size(max = 100)
    private String reasonName;

    @JsonProperty("isZeroReadingReason")
    private boolean isZeroReadingReason;
    @JsonProperty("isDoorCloseReason")
    private boolean isDoorCloseReason;

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
}
