package com.wbill.home.dto;

import java.util.ArrayList;
import java.util.List;

public class BankProcessResultDTO {
    public static class PaymentViewDTO {
        public Integer id; // reading id if found
        public String invoiceNumber;
        public String customerName;
        public String customerAccountNumber;
        public String kifyaWer;
        public Double tekilalaTekefay;
        public Double tekilalaYetekefele;
        public Double tekilalaBankYetekefele;
        public Boolean isPaidThroughBank;
        public Boolean isDerashPaid;
        public String bankPaidAgentId;
        public String bankName; // resolved bank name from BillingBanks lookup
        public String bankPaidConfirmationCode;
        public String moneyCollectedDate; // ISO string
    }

    public static class SkippedBillDTO {
        public String invoiceNumber;
        public String customerName;
        public String customerAccountNumber;
        public String agentId;
        public Double paidAmount;
        public String paidDate;
        public String reason;
    }

    private List<PaymentViewDTO> newPayments = new ArrayList<>();
    private List<PaymentViewDTO> alreadyPaid = new ArrayList<>();
    private List<PaymentViewDTO> voidBills = new ArrayList<>(); // Bills that are locally void
    private List<SkippedBillDTO> skippedBills = new ArrayList<>(); // Bills skipped due to bank not found
    private List<String> notFound = new ArrayList<>(); // billIds
    private List<String> duplicates = new ArrayList<>(); // billIds duplicated in CSV
    private Integer totalPaidCount = 0;

    public List<PaymentViewDTO> getNewPayments() {
        return newPayments;
    }

    public List<PaymentViewDTO> getAlreadyPaid() {
        return alreadyPaid;
    }

    public List<PaymentViewDTO> getVoidBills() {
        return voidBills;
    }

    public List<SkippedBillDTO> getSkippedBills() {
        return skippedBills;
    }

    public List<String> getNotFound() {
        return notFound;
    }

    public List<String> getDuplicates() {
        return duplicates;
    }

    public Integer getTotalPaidCount() {
        return totalPaidCount;
    }

    public void setTotalPaidCount(Integer totalPaidCount) {
        this.totalPaidCount = totalPaidCount;
    }
}
