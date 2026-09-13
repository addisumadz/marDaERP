package com.mardaarif.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "payments", indexes = {
    @Index(name = "idx_payment_bill", columnList = "bill_id"),
    @Index(name = "idx_payment_city", columnList = "city_id"),
    @Index(name = "idx_payment_paid_on", columnList = "paid_on")
})
public class Payment {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "bill_id", nullable = false)
    private Long billId;

    @Column(name = "city_id", nullable = false)
    private Integer cityId;

    @Column(name = "customer_id", length = 100)
    private String customerId;

    @Column(name = "customer_name", length = 300)
    private String customerName;

    @Column(name = "bill_number", length = 100)
    private String billNumber;

    @Column(name = "paid_amount")
    private Double paidAmount;

    @Column(name = "paid_on", length = 30)
    private String paidOn;

    @Column(name = "bank_name", length = 200)
    private String bankName;

    @Column(name = "bank_transaction_reference", length = 200)
    private String bankTransactionReference;

    @Column(name = "payment_method", length = 30)
    private String paymentMethod; // BANK, MOBILE, CASH

    @Column(name = "is_reconciled", nullable = false)
    private boolean reconciled = false;

    @Column(name = "reconciled_at")
    private LocalDateTime reconciledAt;

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;

    public Payment() {}

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
    }

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public Long getBillId() { return billId; }
    public void setBillId(Long billId) { this.billId = billId; }
    public Integer getCityId() { return cityId; }
    public void setCityId(Integer cityId) { this.cityId = cityId; }
    public String getCustomerId() { return customerId; }
    public void setCustomerId(String customerId) { this.customerId = customerId; }
    public String getCustomerName() { return customerName; }
    public void setCustomerName(String customerName) { this.customerName = customerName; }
    public String getBillNumber() { return billNumber; }
    public void setBillNumber(String billNumber) { this.billNumber = billNumber; }
    public Double getPaidAmount() { return paidAmount; }
    public void setPaidAmount(Double paidAmount) { this.paidAmount = paidAmount; }
    public String getPaidOn() { return paidOn; }
    public void setPaidOn(String paidOn) { this.paidOn = paidOn; }
    public String getBankName() { return bankName; }
    public void setBankName(String bankName) { this.bankName = bankName; }
    public String getBankTransactionReference() { return bankTransactionReference; }
    public void setBankTransactionReference(String bankTransactionReference) { this.bankTransactionReference = bankTransactionReference; }
    public String getPaymentMethod() { return paymentMethod; }
    public void setPaymentMethod(String paymentMethod) { this.paymentMethod = paymentMethod; }
    public boolean isReconciled() { return reconciled; }
    public void setReconciled(boolean reconciled) { this.reconciled = reconciled; }
    public LocalDateTime getReconciledAt() { return reconciledAt; }
    public void setReconciledAt(LocalDateTime reconciledAt) { this.reconciledAt = reconciledAt; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}