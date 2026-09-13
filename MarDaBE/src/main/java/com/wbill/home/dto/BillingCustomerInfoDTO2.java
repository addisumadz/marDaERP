package com.wbill.home.dto;


//DTO for the main customer information
public class BillingCustomerInfoDTO2 {
 private int id;
 private String fullName;
 private String fullNameEng;
 private String accountNumber;
 private String meterNumber;
 private String status;
 private UserAccountDTO assignedReader; // Nested DTO, not the entity!

 // Getters and Setters
 public int getId() { return id; }
 public void setId(int id) { this.id = id; }
 public String getFullName() { return fullName; }
 public void setFullName(String fullName) { this.fullName = fullName; }
 public String getFullNameEng() { return fullNameEng; }
 public void setFullNameEng(String fullNameEng) { this.fullNameEng = fullNameEng; }
 public String getAccountNumber() { return accountNumber; }
 public void setAccountNumber(String accountNumber) { this.accountNumber = accountNumber; }
 public String getMeterNumber() { return meterNumber; }
 public void setMeterNumber(String meterNumber) { this.meterNumber = meterNumber; }
 public String getStatus() { return status; }
 public void setStatus(String status) { this.status = status; }
 public UserAccountDTO getAssignedReader() { return assignedReader; }
 public void setAssignedReader(UserAccountDTO assignedReader) { this.assignedReader = assignedReader; }
}
