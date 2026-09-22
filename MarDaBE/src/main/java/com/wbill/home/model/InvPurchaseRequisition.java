package com.wbill.home.model;

import java.io.Serializable;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import jakarta.persistence.*;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

@Entity
@Table(name = "inv_purchase_requisition")
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class InvPurchaseRequisition implements Serializable {
    private static final long serialVersionUID = 1L;

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private long id;

    @Column(name = "requisition_number", nullable = false, unique = true, length = 50)
    private String requisitionNumber;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "store_id", nullable = false)
    @JsonIgnoreProperties({"hibernateLazyInitializer", "handler", "branch", "storeKeeper", "manager"})
    private InvStore store;

    @Column(name = "requested_by", nullable = false, length = 100)
    private String requestedBy;

    @Column(name = "requested_date", nullable = false)
    private LocalDate requestedDate;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false)
    private PRStatus status = PRStatus.DRAFT;

    @Column(name = "approved_by_l1", length = 100)
    private String approvedByL1;

    @Column(name = "approved_date_l1")
    private LocalDateTime approvedDateL1;

    @Column(name = "approved_by_l2", length = 100)
    private String approvedByL2;

    @Column(name = "approved_date_l2")
    private LocalDateTime approvedDateL2;

    @Column(name = "rejected_by", length = 100)
    private String rejectedBy;

    @Column(name = "rejected_date")
    private LocalDateTime rejectedDate;

    @Column(name = "rejection_reason", length = 500)
    private String rejectionReason;

    @Column(name = "remarks", length = 500)
    private String remarks;

    @Column(name = "total_estimated_amount", precision = 15, scale = 2)
    private BigDecimal totalEstimatedAmount = BigDecimal.ZERO;

    @OneToMany(mappedBy = "purchaseRequisition", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    @OrderBy("lineOrder ASC")
    private List<InvPurchaseRequisitionLine> lines = new ArrayList<>();

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

    public enum PRStatus {
        DRAFT, SUBMITTED, APPROVED_L1, APPROVED_L2, APPROVED, REJECTED, CONVERTED_TO_PO, CANCELLED
    }

    public InvPurchaseRequisition() {}

    public void addLine(InvPurchaseRequisitionLine line) {
        lines.add(line);
        line.setPurchaseRequisition(this);
    }

    public void removeLine(InvPurchaseRequisitionLine line) {
        lines.remove(line);
        line.setPurchaseRequisition(null);
    }

    // Getters and Setters
    public long getId() { return id; }
    public void setId(long id) { this.id = id; }

    public String getRequisitionNumber() { return requisitionNumber; }
    public void setRequisitionNumber(String requisitionNumber) { this.requisitionNumber = requisitionNumber; }

    public InvStore getStore() { return store; }
    public void setStore(InvStore store) { this.store = store; }

    public String getRequestedBy() { return requestedBy; }
    public void setRequestedBy(String requestedBy) { this.requestedBy = requestedBy; }

    public LocalDate getRequestedDate() { return requestedDate; }
    public void setRequestedDate(LocalDate requestedDate) { this.requestedDate = requestedDate; }

    public PRStatus getStatus() { return status; }
    public void setStatus(PRStatus status) { this.status = status; }

    public String getApprovedByL1() { return approvedByL1; }
    public void setApprovedByL1(String approvedByL1) { this.approvedByL1 = approvedByL1; }

    public LocalDateTime getApprovedDateL1() { return approvedDateL1; }
    public void setApprovedDateL1(LocalDateTime approvedDateL1) { this.approvedDateL1 = approvedDateL1; }

    public String getApprovedByL2() { return approvedByL2; }
    public void setApprovedByL2(String approvedByL2) { this.approvedByL2 = approvedByL2; }

    public LocalDateTime getApprovedDateL2() { return approvedDateL2; }
    public void setApprovedDateL2(LocalDateTime approvedDateL2) { this.approvedDateL2 = approvedDateL2; }

    public String getRejectedBy() { return rejectedBy; }
    public void setRejectedBy(String rejectedBy) { this.rejectedBy = rejectedBy; }

    public LocalDateTime getRejectedDate() { return rejectedDate; }
    public void setRejectedDate(LocalDateTime rejectedDate) { this.rejectedDate = rejectedDate; }

    public String getRejectionReason() { return rejectionReason; }
    public void setRejectionReason(String rejectionReason) { this.rejectionReason = rejectionReason; }

    public String getRemarks() { return remarks; }
    public void setRemarks(String remarks) { this.remarks = remarks; }

    public BigDecimal getTotalEstimatedAmount() { return totalEstimatedAmount; }
    public void setTotalEstimatedAmount(BigDecimal totalEstimatedAmount) { this.totalEstimatedAmount = totalEstimatedAmount; }

    public List<InvPurchaseRequisitionLine> getLines() { return lines; }
    public void setLines(List<InvPurchaseRequisitionLine> lines) { this.lines = lines; }

    public String getCreatedBy() { return createdBy; }
    public void setCreatedBy(String createdBy) { this.createdBy = createdBy; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
}
