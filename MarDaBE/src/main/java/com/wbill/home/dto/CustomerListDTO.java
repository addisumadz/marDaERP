package com.wbill.home.dto;

import java.util.Date;

// This DTO contains only the fields needed for the customer list view.
public class CustomerListDTO {
    private int id;
    private String accountNumber;
    private String fullName;
    private String phoneNumber;
    private Date registeredDate;
    private String status;

    // --- NEW FIELDS (as IDs) ---
    // Using Integer wrapper class to allow for null values if the relationship is
    // optional.
    private Integer addressStreetId;
    private Integer addressKetenaId;
    private Integer customerTypeId;
    private Integer assignedReaderId;
    private Integer branchId;
    private String assignedReaderName;
    private Integer previousReading;

    // --- ORIGINAL CONSTRUCTOR ---
    public CustomerListDTO(int id, String accountNumber, String fullName, String phoneNumber, Date registeredDate, String status) {
        this.id = id;
        this.accountNumber = accountNumber;
        this.fullName = fullName;
        this.phoneNumber = phoneNumber;
        this.registeredDate = registeredDate;
        this.status = status;
    }

    // --- UPDATED CONSTRUCTOR ---
    // This constructor now accepts IDs instead of names for the new fields.
    public CustomerListDTO(int id, String accountNumber, String fullName, String phoneNumber, Date registeredDate,
            String status,
            Integer addressStreetId, Integer addressKetenaId, Integer customerTypeId, Integer assignedReaderId,
            Integer branchId,
            String assignedReaderName, Integer previousReading) {
        this.id = id;
        this.accountNumber = accountNumber;
        this.fullName = fullName;
        this.phoneNumber = phoneNumber;
        this.registeredDate = registeredDate;
        this.status = status;
        this.addressStreetId = addressStreetId;
        this.addressKetenaId = addressKetenaId;
        this.customerTypeId = customerTypeId;
        this.assignedReaderId = assignedReaderId;
        this.branchId = branchId;
        this.assignedReaderName = assignedReaderName;
        this.previousReading = previousReading;
    }

    // --- GETTERS AND SETTERS FOR ALL FIELDS ---

    public int getId() {
        return id;
    }

    public void setId(int id) {
        this.id = id;
    }

    public String getAccountNumber() {
        return accountNumber;
    }

    public void setAccountNumber(String accountNumber) {
        this.accountNumber = accountNumber;
    }

    public String getFullName() {
        return fullName;
    }

    public void setFullName(String fullName) {
        this.fullName = fullName;
    }

    public String getPhoneNumber() {
        return phoneNumber;
    }

    public void setPhoneNumber(String phoneNumber) {
        this.phoneNumber = phoneNumber;
    }

    public Date getRegisteredDate() {
        return registeredDate;
    }

    public void setRegisteredDate(Date registeredDate) {
        this.registeredDate = registeredDate;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    // --- GETTERS AND SETTERS FOR NEW ID FIELDS ---

    public Integer getAddressStreetId() {
        return addressStreetId;
    }

    public void setAddressStreetId(Integer addressStreetId) {
        this.addressStreetId = addressStreetId;
    }

    public Integer getAddressKetenaId() {
        return addressKetenaId;
    }

    public void setAddressKetenaId(Integer addressKetenaId) {
        this.addressKetenaId = addressKetenaId;
    }

    public Integer getCustomerTypeId() {
        return customerTypeId;
    }

    public void setCustomerTypeId(Integer customerTypeId) {
        this.customerTypeId = customerTypeId;
    }

    public Integer getAssignedReaderId() {
        return assignedReaderId;
    }

    public void setAssignedReaderId(Integer assignedReaderId) {
        this.assignedReaderId = assignedReaderId;
    }

    public Integer getBranchId() {
        return branchId;
    }

    public void setBranchId(Integer branchId) {
        this.branchId = branchId;
    }

    public String getAssignedReaderName() {
        return assignedReaderName;
    }

    public void setAssignedReaderName(String assignedReaderName) {
        this.assignedReaderName = assignedReaderName;
    }

    public Integer getPreviousReading() {
        return previousReading;
    }

    public void setPreviousReading(Integer previousReading) {
        this.previousReading = previousReading;
    }
}