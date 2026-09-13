package com.wbill.home.model;

import java.io.Serializable;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import jakarta.persistence.*;

@Entity
@Table(name = "inv_purchase_order")
public class InvPurchaseOrder implements Serializable {
    private static final long serialVersionUID = 1L;

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private long id;

    @Column(name = "po_number", nullable = false, unique = true, length = 50)
    private String poNumber;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "requisition_id")
    private InvPurchaseRequisition requisition;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "supplier_id", nullable = false)
    private InvSupplier supplier;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "store_id", nullable = false)
    private InvStore store;

    @Column(name = "order_date", nullable = false)
    private LocalDate orderDate;

    @Column(name = "expected_delivery_date")
    private LocalDate expectedDeliveryDate;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false)
    private POStatus status = POStatus.DRAFT;

    @Column(name = "approved_by_l1", length = 100)
    private String approvedByL1;

    @Column(name = "approved_date_l1")
    private LocalDateTime approvedDateL1;

    @Column(name = "approved_by_l2", length = 100)
    private String approvedByL2;

    @Column(name = "approved_date_l2")
    private LocalDateTime approvedDateL2;

    @Column(name = "subtotal", precision = 15, scale = 2)
    private BigDecimal subtotal = BigDecimal.ZERO;

    @Column(name = "vat_rate", precision = 5, scale = 2)
    private BigDecimal vatRate = new BigDecimal("15.00");

    @Column(name = "vat_amount", precision = 15, scale = 2)
    private BigDecimal vatAmount = BigDecimal.ZERO;

    @Column(name = "grand_total", precision = 15, scale = 2)
    private BigDecimal grandTotal = BigDecimal.ZERO;

    @Column(name = "payment_terms", length = 200)
    private String paymentTerms;

    @Column(name = "delivery_terms", length = 200)
    private String deliveryTerms;

    @Column(name = "remarks", length = 500)
    private String remarks;

    @OneToMany(mappedBy = "purchaseOrder", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    @OrderBy("lineOrder ASC")
    private List<InvPurchaseOrderLine> lines = new ArrayList<>();

    @Column(name = "created_by", length = 100)
    private String createdBy;

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }

    public enum POStatus {
        DRAFT, SUBMITTED, APPROVED_L1, APPROVED_L2, SENT_TO_SUPPLIER, PARTIALLY_RECEIVED, FULLY_RECEIVED, CANCELLED
    }

    public InvPurchaseOrder() {}

    public void addLine(InvPurchaseOrderLine line) {
        lines.add(line);
        line.setPurchaseOrder(this);
    }

    public void removeLine(InvPurchaseOrderLine line) {
        lines.remove(line);
        line.setPurchaseOrder(null);
    }

    public void recalculateTotals() {
        this.subtotal = lines.stream()
                .map(InvPurchaseOrderLine::getTotalPrice)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        this.vatAmount = this.subtotal.multiply(this.vatRate).divide(new BigDecimal("100"), 2, java.math.RoundingMode.HALF_UP);
        this.grandTotal = this.subtotal.add(this.vatAmount);
    }

    // Getters and Setters
    public long getId() { return id; }
    public void setId(long id) { this.id = id; }

    public String getPoNumber() { return poNumber; }
    public void setPoNumber(String poNumber) { this.poNumber = poNumber; }

    public InvPurchaseRequisition getRequisition() { return requisition; }
    public void setRequisition(InvPurchaseRequisition requisition) { this.requisition = requisition; }

    public InvSupplier getSupplier() { return supplier; }
    public void setSupplier(InvSupplier supplier) { this.supplier = supplier; }

    public InvStore getStore() { return store; }
    public void setStore(InvStore store) { this.store = store; }

    public LocalDate getOrderDate() { return orderDate; }
    public void setOrderDate(LocalDate orderDate) { this.orderDate = orderDate; }

    public LocalDate getExpectedDeliveryDate() { return expectedDeliveryDate; }
    public void setExpectedDeliveryDate(LocalDate expectedDeliveryDate) { this.expectedDeliveryDate = expectedDeliveryDate; }

    public POStatus getStatus() { return status; }
    public void setStatus(POStatus status) { this.status = status; }

    public String getApprovedByL1() { return approvedByL1; }
    public void setApprovedByL1(String approvedByL1) { this.approvedByL1 = approvedByL1; }

    public LocalDateTime getApprovedDateL1() { return approvedDateL1; }
    public void setApprovedDateL1(LocalDateTime approvedDateL1) { this.approvedDateL1 = approvedDateL1; }

    public String getApprovedByL2() { return approvedByL2; }
    public void setApprovedByL2(String approvedByL2) { this.approvedByL2 = approvedByL2; }

    public LocalDateTime getApprovedDateL2() { return approvedDateL2; }
    public void setApprovedDateL2(LocalDateTime approvedDateL2) { this.approvedDateL2 = approvedDateL2; }

    public BigDecimal getSubtotal() { return subtotal; }
    public void setSubtotal(BigDecimal subtotal) { this.subtotal = subtotal; }

    public BigDecimal getVatRate() { return vatRate; }
    public void setVatRate(BigDecimal vatRate) { this.vatRate = vatRate; }

    public BigDecimal getVatAmount() { return vatAmount; }
    public void setVatAmount(BigDecimal vatAmount) { this.vatAmount = vatAmount; }

    public BigDecimal getGrandTotal() { return grandTotal; }
    public void setGrandTotal(BigDecimal grandTotal) { this.grandTotal = grandTotal; }

    public String getPaymentTerms() { return paymentTerms; }
    public void setPaymentTerms(String paymentTerms) { this.paymentTerms = paymentTerms; }

    public String getDeliveryTerms() { return deliveryTerms; }
    public void setDeliveryTerms(String deliveryTerms) { this.deliveryTerms = deliveryTerms; }

    public String getRemarks() { return remarks; }
    public void setRemarks(String remarks) { this.remarks = remarks; }

    public List<InvPurchaseOrderLine> getLines() { return lines; }
    public void setLines(List<InvPurchaseOrderLine> lines) { this.lines = lines; }

    public String getCreatedBy() { return createdBy; }
    public void setCreatedBy(String createdBy) { this.createdBy = createdBy; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
}
