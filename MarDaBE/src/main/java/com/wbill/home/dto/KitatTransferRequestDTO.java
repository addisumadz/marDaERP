package com.wbill.home.dto;

public class KitatTransferRequestDTO {
    private String accountNumber;
    private double totalKitat;

    public KitatTransferRequestDTO() {
    }

    public String getAccountNumber() {
        return accountNumber;
    }

    public void setAccountNumber(String accountNumber) {
        this.accountNumber = accountNumber;
    }

    public double getTotalKitat() {
        return totalKitat;
    }

    public void setTotalKitat(double totalKitat) {
        this.totalKitat = totalKitat;
    }
}
