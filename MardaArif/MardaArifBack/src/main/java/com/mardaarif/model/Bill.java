package com.mardaarif.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "bills", indexes = {
    @Index(name = "idx_bill_city", columnList = "city_id"),
    @Index(name = "idx_bill_bill_id", columnList = "bill_id"),
    @Index(name = "idx_bill_customer_id", columnList = "customer_id"),
    @Index(name = "idx_bill_status", columnList = "status")
})
public class Bill {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "bill_id", nullable = false, length = 100)
    private String billId;

    @Column(name = "city_id", nullable = false)
    private Integer cityId;

    @Column(name = "customer_id", length = 100)
    private String customerId;

    @Column(name = "customer_name", length = 300)
    private String customerName;

    @Column(name = "phone_number", length = 20)
    private String phoneNumber;

    @Column(name = "amount_due")
    private Double amountDue;

    @Column(name = "description", length = 500)
    private String description;

    @Column(name = "bill_reason", length = 500)
    private String billReason;

    @Column(name = "valid_until", length = 20)
    private String validUntil;

    @Column(name = "email", length = 100)
    private String email;

    @Column(name = "prev_read")
    private Double prevRead;

    @Column(name = "curr_read")
    private Double currRead;

    @Column(name = "consumption")
    private Double consumption;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 20)
    private BillStatus status = BillStatus.PENDING;

    @Column(name = "paid_amount")
    private Double paidAmount;

    @Column(name = "paid_on", length = 30)
    private String paidOn;

    @Column(name = "bank_name", length = 200)
    private String bankName;

    @Column(name = "bank_transaction_reference", length = 200)
    private String bankTransactionReference;

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    public Bill() {}

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        this.updatedAt = LocalDateTime.now();
    }

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getBillId() { return billId; }
    public void setBillId(String billId) { this.billId = billId; }
    public Integer getCityId() { return cityId; }
    public void setCityId(Integer cityId) { this.cityId = cityId; }
    public String getCustomerId() { return customerId; }
    public void setCustomerId(String customerId) { this.customerId = customerId; }
    public String getCustomerName() { return customerName; }
    public void setCustomerName(String customerName) { this.customerName = customerName; }
    public String getPhoneNumber() { return phoneNumber; }
    public void setPhoneNumber(String phoneNumber) { this.phoneNumber = phoneNumber; }
    public Double getAmountDue() { return amountDue; }
    public void setAmountDue(Double amountDue) { this.amountDue = amountDue; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    public String getBillReason() { return billReason; }
    public void setBillReason(String billReason) { this.billReason = billReason; }
    public String getValidUntil() { return validUntil; }
    public void setValidUntil(String validUntil) { this.validUntil = validUntil; }
    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }
    public Double getPrevRead() { return prevRead; }
    public void setPrevRead(Double prevRead) { this.prevRead = prevRead; }
    public Double getCurrRead() { return currRead; }
    public void setCurrRead(Double currRead) { this.currRead = currRead; }
    public Double getConsumption() { return consumption; }
    public void setConsumption(Double consumption) { this.consumption = consumption; }
    public BillStatus getStatus() { return status; }
    public void setStatus(BillStatus status) { this.status = status; }
    public Double getPaidAmount() { return paidAmount; }
    public void setPaidAmount(Double paidAmount) { this.paidAmount = paidAmount; }
    public String getPaidOn() { return paidOn; }
    public void setPaidOn(String paidOn) { this.paidOn = paidOn; }
    public String getBankName() { return bankName; }
    public void setBankName(String bankName) { this.bankName = bankName; }
    public String getBankTransactionReference() { return bankTransactionReference; }
    public void setBankTransactionReference(String bankTransactionReference) { this.bankTransactionReference = bankTransactionReference; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
}
