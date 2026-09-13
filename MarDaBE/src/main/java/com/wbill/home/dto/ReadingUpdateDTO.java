package com.wbill.home.dto;

import com.wbill.home.model.BillingReading;

public class ReadingUpdateDTO {

    private String customerAccountNumber;
    private int lastReading;
    private String kifyaWer;

    public String getCustomerAccountNumber() {
        return customerAccountNumber;
    }

    public void setCustomerAccountNumber(String customerAccountNumber) {
        this.customerAccountNumber = customerAccountNumber;
    }

    public int getLastReading() {
        return lastReading;
    }

    public void setLastReading(int lastReading) {
        this.lastReading = lastReading;
    }

    public String getKifyaWer() {
        return kifyaWer;
    }

    public void setKifyaWer(String kifyaWer) {
        this.kifyaWer = kifyaWer;
    }

    /**
     * Convenience mapper to build a ReadingUpdateDTO from a BillingReading entity.
     * Only maps fields available in this DTO: customerAccountNumber, lastReading,
     * kifyaWer.
     */
    public static ReadingUpdateDTO from(BillingReading reading) {
        if (reading == null) {
            return null;
        }
        ReadingUpdateDTO dto = new ReadingUpdateDTO();
        dto.setLastReading(reading.getLastReading());
        dto.setKifyaWer(reading.getKifyaWer());
        if (reading.getBillingCustomerInfo() != null) {
            dto.setCustomerAccountNumber(reading.getBillingCustomerInfo().getAccountNumber());
        }
        return dto;
    }

    private Integer zeroReadingReasonId;

    public Integer getZeroReadingReasonId() {
        return zeroReadingReasonId;
    }

    public void setZeroReadingReasonId(Integer zeroReadingReasonId) {
        this.zeroReadingReasonId = zeroReadingReasonId;
    }

    private String readerGps;

    public String getReaderGps() {
        return readerGps;
    }

    public void setReaderGps(String readerGps) {
        this.readerGps = readerGps;
    }

    @Override
    public String toString() {
        return "ReadingUpdateDTO{" +
                "customerAccountNumber='" + customerAccountNumber + '\'' +
                ", lastReading=" + lastReading +
                ", kifyaWer='" + kifyaWer + '\'' +
                ", zeroReadingReasonId=" + zeroReadingReasonId +
                ", readerGps='" + readerGps + '\'' +
                '}';
    }
}