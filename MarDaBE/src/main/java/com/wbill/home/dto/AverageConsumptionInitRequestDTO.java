package com.wbill.home.dto;

import java.util.List;

public class AverageConsumptionInitRequestDTO {
    private List<String> accountNumbers;
    private String kifyaWer;
    private int months;

    public AverageConsumptionInitRequestDTO() {
    }

    public List<String> getAccountNumbers() {
        return accountNumbers;
    }

    public void setAccountNumbers(List<String> accountNumbers) {
        this.accountNumbers = accountNumbers;
    }

    public String getKifyaWer() {
        return kifyaWer;
    }

    public void setKifyaWer(String kifyaWer) {
        this.kifyaWer = kifyaWer;
    }

    public int getMonths() {
        return months;
    }

    public void setMonths(int months) {
        this.months = months;
    }
}
