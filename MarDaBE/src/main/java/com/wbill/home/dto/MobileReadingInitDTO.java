package com.wbill.home.dto;

public class MobileReadingInitDTO {
    private String accountNumber;
    private String customerName;
    private String meterNumber;
    private Integer previousReading;
    private Integer previousConsumption;
    private Integer averageConsumption;
    private String kifyaWer;
    private Boolean meterChanged;

    public String getAccountNumber() {
        return accountNumber;
    }

    public void setAccountNumber(String accountNumber) {
        this.accountNumber = accountNumber;
    }

    public String getCustomerName() {
        return customerName;
    }

    public void setCustomerName(String customerName) {
        this.customerName = customerName;
    }

    public String getMeterNumber() {
        return meterNumber;
    }

    public void setMeterNumber(String meterNumber) {
        this.meterNumber = meterNumber;
    }

    public Integer getPreviousReading() {
        return previousReading;
    }

    public void setPreviousReading(Integer previousReading) {
        this.previousReading = previousReading;
    }

    public Integer getPreviousConsumption() {
        return previousConsumption;
    }

    public void setPreviousConsumption(Integer previousConsumption) {
        this.previousConsumption = previousConsumption;
    }

    public Integer getAverageConsumption() {
        return averageConsumption;
    }

    public void setAverageConsumption(Integer averageConsumption) {
        this.averageConsumption = averageConsumption;
    }

    public String getKifyaWer() {
        return kifyaWer;
    }

    public void setKifyaWer(String kifyaWer) {
        this.kifyaWer = kifyaWer;
    }

    public Boolean getMeterChanged() {
        return meterChanged;
    }

    public void setMeterChanged(Boolean meterChanged) {
        this.meterChanged = meterChanged;
    }
}
