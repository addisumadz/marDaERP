package com.wbill.home.dto;

public class ReadingConsumptionItemDTO {
    private String blockName;
    private double consumption;
    private double tariff;
    private double totalAmount;
    private String status;

    public ReadingConsumptionItemDTO() {}

    public ReadingConsumptionItemDTO(String blockName, double consumption, double tariff, double totalAmount, String status) {
        this.blockName = blockName;
        this.consumption = consumption;
        this.tariff = tariff;
        this.totalAmount = totalAmount;
        this.status = status;
    }

    public String getBlockName() { return blockName; }
    public void setBlockName(String blockName) { this.blockName = blockName; }

    public double getConsumption() { return consumption; }
    public void setConsumption(double consumption) { this.consumption = consumption; }

    public double getTariff() { return tariff; }
    public void setTariff(double tariff) { this.tariff = tariff; }

    public double getTotalAmount() { return totalAmount; }
    public void setTotalAmount(double totalAmount) { this.totalAmount = totalAmount; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
}
