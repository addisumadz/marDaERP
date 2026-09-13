package com.wbill.home.dto;


public class PreviousReadingBillDTO {
    private Integer previousReading; // what the next period should use as previous
    private Integer consumption;     // last period's consumption (0 if meter change/no history)
    private Boolean meterChanged;    // optional flag to indicate meter change path

    public PreviousReadingBillDTO() {}

    public PreviousReadingBillDTO(Integer previousReading, Integer consumption, Boolean meterChanged) {
        this.previousReading = previousReading;
        this.consumption = consumption;
        this.meterChanged = meterChanged;
    }

    public Integer getPreviousReading() {
        return previousReading;
    }

    public void setPreviousReading(Integer previousReading) {
        this.previousReading = previousReading;
    }

    public Integer getConsumption() {
        return consumption;
    }

    public void setConsumption(Integer consumption) {
        this.consumption = consumption;
    }

    public Boolean getMeterChanged() {
        return meterChanged;
    }

    public void setMeterChanged(Boolean meterChanged) {
        this.meterChanged = meterChanged;
    }
}
