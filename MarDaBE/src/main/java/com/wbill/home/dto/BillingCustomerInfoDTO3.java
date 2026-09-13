package com.wbill.home.dto;

// DTO for the main customer information
public class BillingCustomerInfoDTO3 {
    private int id;
    private String fullName;
    private String fullNameEng;
    private String phoneNumber;
    private String accountNumber;
    private String meterNumber;
    private String status;

    // Address & Locality Information
    private int addressStreetsId;
    private int addressKetenaId;
    private int branchsId;
    private String addressDescription;

    // Meter & Billing Information
    private int customerTypeId;
    private int billingMeterSizeId;
    private double additionalMonthlyPayment;
    private double initialReading;
    private int initialConsumption;
    private int maxReference;
    private double tekemachKfya; // Deposit
    private double techemariKfya; // Additional Fee
    
    // Arrears Information
    private boolean oldHasPenalty;
    private int oldPenlityNumberOfMonths;
    private String oldMonthsList;
    private double oldKfyaAndPenaltyTotal;
    
    // Reader Assignment
    private int assignedReaderId;

    // Getters and Setters for all fields
    public int getId() { return id; }
    public void setId(int id) { this.id = id; }
    public String getFullName() { return fullName; }
    public void setFullName(String fullName) { this.fullName = fullName; }
    public String getFullNameEng() { return fullNameEng; }
    public void setFullNameEng(String fullNameEng) { this.fullNameEng = fullNameEng; }
    public String getPhoneNumber() { return phoneNumber; }
    public void setPhoneNumber(String phoneNumber) { this.phoneNumber = phoneNumber; }
    public String getAccountNumber() { return accountNumber; }
    public void setAccountNumber(String accountNumber) { this.accountNumber = accountNumber; }
    public String getMeterNumber() { return meterNumber; }
    public void setMeterNumber(String meterNumber) { this.meterNumber = meterNumber; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public int getAddressStreetsId() { return addressStreetsId; }
    public void setAddressStreetsId(int addressStreetsId) { this.addressStreetsId = addressStreetsId; }
    public int getAddressKetenaId() { return addressKetenaId; }
    public void setAddressKetenaId(int addressKetenaId) { this.addressKetenaId = addressKetenaId; }
    public int getBranchsId() { return branchsId; }
    public void setBranchsId(int branchsId) { this.branchsId = branchsId; }
    public String getAddressDescription() { return addressDescription; }
    public void setAddressDescription(String addressDescription) { this.addressDescription = addressDescription; }

    public int getCustomerTypeId() { return customerTypeId; }
    public void setCustomerTypeId(int customerTypeId) { this.customerTypeId = customerTypeId; }
    public int getBillingMeterSizeId() { return billingMeterSizeId; }
    public void setBillingMeterSizeId(int billingMeterSizeId) { this.billingMeterSizeId = billingMeterSizeId; }
    public double getAdditionalMonthlyPayment() { return additionalMonthlyPayment; }
    public void setAdditionalMonthlyPayment(double additionalMonthlyPayment) { this.additionalMonthlyPayment = additionalMonthlyPayment; }
    public double getInitialReading() { return initialReading; }
    public void setInitialReading(double initialReading) { this.initialReading = initialReading; }
    public int getInitialConsumption() { return initialConsumption; }
    public void setInitialConsumption(int initialConsumption) { this.initialConsumption = initialConsumption; }
    public int getMaxReference() { return maxReference; }
    public void setMaxReference(int maxReference) { this.maxReference = maxReference; }
    public double getTekemachKfya() { return tekemachKfya; }
    public void setTekemachKfya(double tekemachKfya) { this.tekemachKfya = tekemachKfya; }
    public double getTechemariKfya() { return techemariKfya; }
    public void setTechemariKfya(double techemariKfya) { this.techemariKfya = techemariKfya; }

    public boolean isOldHasPenalty() { return oldHasPenalty; }
    public void setOldHasPenalty(boolean oldHasPenalty) { this.oldHasPenalty = oldHasPenalty; }
    public int getOldPenlityNumberOfMonths() { return oldPenlityNumberOfMonths; }
    public void setOldPenlityNumberOfMonths(int oldPenlityNumberOfMonths) { this.oldPenlityNumberOfMonths = oldPenlityNumberOfMonths; }
    public String getOldMonthsList() { return oldMonthsList; }
    public void setOldMonthsList(String oldMonthsList) { this.oldMonthsList = oldMonthsList; }
    public double getOldKfyaAndPenaltyTotal() { return oldKfyaAndPenaltyTotal; }
    public void setOldKfyaAndPenaltyTotal(double oldKfyaAndPenaltyTotal) { this.oldKfyaAndPenaltyTotal = oldKfyaAndPenaltyTotal; }
    
    public int getAssignedReaderId() { return assignedReaderId; }
    public void setAssignedReaderId(int assignedReaderId) { this.assignedReaderId = assignedReaderId; }
}
