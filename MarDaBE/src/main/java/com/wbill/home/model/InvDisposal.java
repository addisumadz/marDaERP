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
@Table(name = "inv_disposal")
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class InvDisposal implements Serializable {
    private static final long serialVersionUID = 1L;

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private long id;

    @Column(name = "disposal_number", nullable = false, unique = true, length = 50)
    private String disposalNumber;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "store_id", nullable = false)
    @JsonIgnoreProperties({"hibernateLazyInitializer", "handler", "storeKeeper", "manager"})
    private InvStore store;

    @Enumerated(EnumType.STRING)
    @Column(name = "disposal_type", nullable = false)
    private DisposalType disposalType;

    @Column(name = "disposal_date", nullable = false)
    private LocalDate disposalDate;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false)
    private DisposalStatus status = DisposalStatus.DRAFT;

    @Column(name = "total_amount", precision = 15, scale = 2)
    private BigDecimal totalAmount = BigDecimal.ZERO;

    // Workflow integration
    @Column(name = "workflow_instance_id")
    private Long workflowInstanceId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "journal_entry_id")
    @JsonIgnoreProperties({"lines", "fiscalYear", "hibernateLazyInitializer", "handler"})
    private FncJournalEntry journalEntry;

    @Column(name = "reason", columnDefinition = "TEXT")
    private String reason;

    @Column(name = "disposal_method", length = 200)
    private String disposalMethod;

    @Column(name = "committee_members", length = 500)
    private String committeeMembers;

    @Column(name = "remarks", length = 500)
    private String remarks;

    @OneToMany(mappedBy = "disposal", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    @OrderBy("lineOrder ASC")
    private List<InvDisposalLine> lines = new ArrayList<>();

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

    public enum DisposalType {
        DAMAGED, EXPIRED, OBSOLETE, SCRAP, OTHER
    }

    public enum DisposalStatus {
        DRAFT, SUBMITTED, IN_APPROVAL, APPROVED, EXECUTED, REJECTED, CANCELLED
    }

    public InvDisposal() {}

    public void addLine(InvDisposalLine line) {
        lines.add(line);
        line.setDisposal(this);
    }

    public void removeLine(InvDisposalLine line) {
        lines.remove(line);
        line.setDisposal(null);
    }

    // Getters and Setters
    public long getId() { return id; }
    public void setId(long id) { this.id = id; }

    public String getDisposalNumber() { return disposalNumber; }
    public void setDisposalNumber(String disposalNumber) { this.disposalNumber = disposalNumber; }

    public InvStore getStore() { return store; }
    public void setStore(InvStore store) { this.store = store; }

    public DisposalType getDisposalType() { return disposalType; }
    public void setDisposalType(DisposalType disposalType) { this.disposalType = disposalType; }

    public LocalDate getDisposalDate() { return disposalDate; }
    public void setDisposalDate(LocalDate disposalDate) { this.disposalDate = disposalDate; }

    public DisposalStatus getStatus() { return status; }
    public void setStatus(DisposalStatus status) { this.status = status; }

    public BigDecimal getTotalAmount() { return totalAmount; }
    public void setTotalAmount(BigDecimal totalAmount) { this.totalAmount = totalAmount; }

    public Long getWorkflowInstanceId() { return workflowInstanceId; }
    public void setWorkflowInstanceId(Long workflowInstanceId) { this.workflowInstanceId = workflowInstanceId; }

    public FncJournalEntry getJournalEntry() { return journalEntry; }
    public void setJournalEntry(FncJournalEntry journalEntry) { this.journalEntry = journalEntry; }

    public String getReason() { return reason; }
    public void setReason(String reason) { this.reason = reason; }

    public String getDisposalMethod() { return disposalMethod; }
    public void setDisposalMethod(String disposalMethod) { this.disposalMethod = disposalMethod; }

    public String getCommitteeMembers() { return committeeMembers; }
    public void setCommitteeMembers(String committeeMembers) { this.committeeMembers = committeeMembers; }

    public String getRemarks() { return remarks; }
    public void setRemarks(String remarks) { this.remarks = remarks; }

    public List<InvDisposalLine> getLines() { return lines; }
    public void setLines(List<InvDisposalLine> lines) { this.lines = lines; }

    public Branch getBranch() { return branch; }
    public void setBranch(Branch branch) { this.branch = branch; }

    public String getCreatedBy() { return createdBy; }
    public void setCreatedBy(String createdBy) { this.createdBy = createdBy; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
}
