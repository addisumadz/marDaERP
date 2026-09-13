package com.wbill.home.dto;

import java.util.ArrayList;
import java.util.List;

public class ReadingDetailResponseDTO {
    private BillingReadingSummaryDTO reading;
    private List<ReadingConsumptionItemDTO> consumption = new ArrayList<>();

    public ReadingDetailResponseDTO() {}

    public ReadingDetailResponseDTO(BillingReadingSummaryDTO reading, List<ReadingConsumptionItemDTO> consumption) {
        this.reading = reading;
        if (consumption != null) {
            this.consumption = consumption;
        }
    }

    public BillingReadingSummaryDTO getReading() { return reading; }
    public void setReading(BillingReadingSummaryDTO reading) { this.reading = reading; }

    public List<ReadingConsumptionItemDTO> getConsumption() { return consumption; }
    public void setConsumption(List<ReadingConsumptionItemDTO> consumption) { this.consumption = consumption; }
}
