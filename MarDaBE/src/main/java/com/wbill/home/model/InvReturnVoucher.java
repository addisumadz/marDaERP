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
@Table(name = "inv_return_voucher")
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class InvReturnVoucher implements Serializable {
    private static final long serialVersionUID = 1L;

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private long id;

    @Column(name = "voucher_number", nullable = false, unique = true, length = 50)
    private String voucherNumber;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "store_id", nullable = false)
    @JsonIgnoreProperties({"hibernateLazyInitializer", "handler", "storeKeeper", "manager"})
    private InvStore store;

    @Enumerated(EnumType.STRING)
    @Column(name = "return_type", nullable = false)
    private ReturnType returnType;

    // Link to original Issue Voucher (for RETURN_FROM_DEPARTMENT)
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "original_issue_voucher_id")
    @JsonIgnoreProperties({"hibernateLazyInitializer", "handler", "lines", "journalEntry", "materialRequest"})
    private InvIssueVoucher originalIssueVoucher;

    // Link to original GRN (for RETURN_TO_SUPPLIER)
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "original_grn_id")
    @JsonIgnoreProperties({"hibernateLazyInitializer", "handler", "lines"})
    private InvGoodsReceivedNote originalGrn;

    // Link to supplier (for RETURN_TO_SUPPLIER)
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "supplier_id")
    @JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
    private InvSupplier supplier;

    @Column(name = "returned_by", length = 200)
    private String returnedBy;

    @Column(name = "department", length = 200)
    private String department;

    @Column(name = "return_date", nullable = false)
    private LocalDate returnDate;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false)
    private ReturnStatus status = ReturnStatus.DRAFT;

    @Column(name = "approved_by", length = 100)
    private String approvedBy;

    @Column(name = "approved_date")
    private LocalDateTime approvedDate;

    @Column(name = "received_by", length = 100)
    private String receivedBy;

    @Column(name = "total_amount", precision = 15, scale = 2)
    private BigDecimal totalAmount = BigDecimal.ZERO;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "journal_entry_id")
    @JsonIgnoreProperties({"lines", "fiscalYear", "hibernateLazyInitializer", "handler"})
    private FncJournalEntry journalEntry;

    @Column(name = "reason", length = 500)
    private String reason;

    @Column(name = "remarks", length = 500)
    private String remarks;

    @OneToMany(mappedBy = "returnVoucher", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    @OrderBy("lineOrder ASC")
    private List<InvReturnVoucherLine> lines = new ArrayList<>();

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "branch_id")
    @JsonIgnoreProperties({"hibernateLazyInitializer", "handler", "branchKebele", "branchCity", "registeredBy", "modifiedBy"})
    private Branch branch;

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

    public enum ReturnType {
        RETURN_FROM_DEPARTMENT, RETURN_TO_SUPPLIER
    }

    public enum ReturnStatus {
        DRAFT, APPROVED, RECEIVED, CANCELLED
    }

    public InvReturnVoucher() {}

    public void addLine(InvReturnVoucherLine line) {
        lines.add(line);
        line.setReturnVoucher(this);
    }

    public void removeLine(InvReturnVoucherLine line) {
        lines.remove(line);
        line.setReturnVoucher(null);
    }

    // Getters and Setters
    public long getId() { return id; }
    public void setId(long id) { this.id = id; }

    public String getVoucherNumber() { return voucherNumber; }
    public void setVoucherNumber(String voucherNumber) { this.voucherNumber = voucherNumber; }

    public InvStore getStore() { return store; }
    public void setStore(InvStore store) { this.store = store; }

    public ReturnType getReturnType() { return returnType; }
    public void setReturnType(ReturnType returnType) { this.returnType = returnType; }

    public InvIssueVoucher getOriginalIssueVoucher() { return originalIssueVoucher; }
    public void setOriginalIssueVoucher(InvIssueVoucher originalIssueVoucher) { this.originalIssueVoucher = originalIssueVoucher; }

    public InvGoodsReceivedNote getOriginalGrn() { return originalGrn; }
    public void setOriginalGrn(InvGoodsReceivedNote originalGrn) { this.originalGrn = originalGrn; }

    public InvSupplier getSupplier() { return supplier; }
    public void setSupplier(InvSupplier supplier) { this.supplier = supplier; }

    public String getReturnedBy() { return returnedBy; }
    public void setReturnedBy(String returnedBy) { this.returnedBy = returnedBy; }

    public String getDepartment() { return department; }
    public void setDepartment(String department) { this.department = department; }

    public LocalDate getReturnDate() { return returnDate; }
    public void setReturnDate(LocalDate returnDate) { this.returnDate = returnDate; }

    public ReturnStatus getStatus() { return status; }
    public void setStatus(ReturnStatus status) { this.status = status; }

    public String getApprovedBy() { return approvedBy; }
    public void setApprovedBy(String approvedBy) { this.approvedBy = approvedBy; }

    public LocalDateTime getApprovedDate() { return approvedDate; }
    public void setApprovedDate(LocalDateTime approvedDate) { this.approvedDate = approvedDate; }

    public String getReceivedBy() { return receivedBy; }
    public void setReceivedBy(String receivedBy) { this.receivedBy = receivedBy; }

    public BigDecimal getTotalAmount() { return totalAmount; }
    public void setTotalAmount(BigDecimal totalAmount) { this.totalAmount = totalAmount; }

    public FncJournalEntry getJournalEntry() { return journalEntry; }
    public void setJournalEntry(FncJournalEntry journalEntry) { this.journalEntry = journalEntry; }

    public String getReason() { return reason; }
    public void setReason(String reason) { this.reason = reason; }

    public String getRemarks() { return remarks; }
    public void setRemarks(String remarks) { this.remarks = remarks; }

    public List<InvReturnVoucherLine> getLines() { return lines; }
    public void setLines(List<InvReturnVoucherLine> lines) { this.lines = lines; }

    public Branch getBranch() { return branch; }
    public void setBranch(Branch branch) { this.branch = branch; }

    public String getCreatedBy() { return createdBy; }
    public void setCreatedBy(String createdBy) { this.createdBy = createdBy; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
}
