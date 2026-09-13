package com.wbill.home.dto;

import java.util.List;

public class ConsumptionBasedCorrectionRequestDTO {
    private List<Integer> readingIds;
    private String reason;
    private double percent;
    private String baseType;

    public ConsumptionBasedCorrectionRequestDTO() {
    }

    public List<Integer> getReadingIds() {
        return readingIds;
    }

    public void setReadingIds(List<Integer> readingIds) {
        this.readingIds = readingIds;
    }

    public String getReason() {
        return reason;
    }

    public void setReason(String reason) {
        this.reason = reason;
    }

    public double getPercent() {
        return percent;
    }

    public void setPercent(double percent) {
        this.percent = percent;
    }

    public String getBaseType() {
        return baseType;
    }

    public void setBaseType(String baseType) {
        this.baseType = baseType;
    }
}
