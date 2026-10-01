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
@Table(name = "inv_material_request")
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class InvMaterialRequest implements Serializable {
    private static final long serialVersionUID = 1L;

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private long id;

    @Column(name = "request_number", nullable = false, unique = true, length = 50)
    private String requestNumber;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "store_id", nullable = false)
    @JsonIgnoreProperties({"hibernateLazyInitializer", "handler", "storeKeeper", "manager"})
    private InvStore store;

    @Column(name = "department_id")
    private Integer departmentId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "branch_id")
    @JsonIgnoreProperties({"hibernateLazyInitializer", "handler", "branchKebele", "branchCity", "registeredBy", "modifiedBy"})
    private Branch branch;

    @Column(name = "requested_by", nullable = false, length = 200)
    private String requestedBy;

    @Column(name = "requested_date", nullable = false)
    private LocalDate requestedDate;

    @Column(name = "needed_by_date")
    private LocalDate neededByDate;

    @Enumerated(EnumType.STRING)
    @Column(name = "priority", nullable = false)
    private Priority priority = Priority.NORMAL;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false)
    private RequestStatus status = RequestStatus.DRAFT;

    @Column(name = "purpose", length = 500)
    private String purpose;

    @Column(name = "remarks", length = 500)
    private String remarks;

    @Column(name = "total_estimated_amount", precision = 15, scale = 2)
    private BigDecimal totalEstimatedAmount = BigDecimal.ZERO;

    // Workflow integration
    @Column(name = "workflow_instance_id")
    private Long workflowInstanceId;

    // Link to auto-created Issue Voucher
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "issue_voucher_id")
    @JsonIgnoreProperties({"hibernateLazyInitializer", "handler", "lines", "store", "journalEntry"})
    private InvIssueVoucher issueVoucher;

    @OneToMany(mappedBy = "materialRequest", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    @OrderBy("lineOrder ASC")
    private List<InvMaterialRequestLine> lines = new ArrayList<>();

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

    public enum Priority {
        LOW, NORMAL, HIGH, URGENT
    }

    public enum RequestStatus {
        DRAFT, SUBMITTED, IN_APPROVAL, APPROVED, PARTIALLY_ISSUED, ISSUED, REJECTED, CANCELLED
    }

    public InvMaterialRequest() {}

    public void addLine(InvMaterialRequestLine line) {
        lines.add(line);
        line.setMaterialRequest(this);
    }

    public void removeLine(InvMaterialRequestLine line) {
        lines.remove(line);
        line.setMaterialRequest(null);
    }

    // Getters and Setters
    public long getId() { return id; }
    public void setId(long id) { this.id = id; }

    public String getRequestNumber() { return requestNumber; }
    public void setRequestNumber(String requestNumber) { this.requestNumber = requestNumber; }

    public InvStore getStore() { return store; }
    public void setStore(InvStore store) { this.store = store; }

    public Integer getDepartmentId() { return departmentId; }
    public void setDepartmentId(Integer departmentId) { this.departmentId = departmentId; }

    public Branch getBranch() { return branch; }
    public void setBranch(Branch branch) { this.branch = branch; }

    public String getRequestedBy() { return requestedBy; }
    public void setRequestedBy(String requestedBy) { this.requestedBy = requestedBy; }

    public LocalDate getRequestedDate() { return requestedDate; }
    public void setRequestedDate(LocalDate requestedDate) { this.requestedDate = requestedDate; }

    public LocalDate getNeededByDate() { return neededByDate; }
    public void setNeededByDate(LocalDate neededByDate) { this.neededByDate = neededByDate; }

    public Priority getPriority() { return priority; }
    public void setPriority(Priority priority) { this.priority = priority; }

    public RequestStatus getStatus() { return status; }
    public void setStatus(RequestStatus status) { this.status = status; }

    public String getPurpose() { return purpose; }
    public void setPurpose(String purpose) { this.purpose = purpose; }

    public String getRemarks() { return remarks; }
    public void setRemarks(String remarks) { this.remarks = remarks; }

    public BigDecimal getTotalEstimatedAmount() { return totalEstimatedAmount; }
    public void setTotalEstimatedAmount(BigDecimal totalEstimatedAmount) { this.totalEstimatedAmount = totalEstimatedAmount; }

    public Long getWorkflowInstanceId() { return workflowInstanceId; }
    public void setWorkflowInstanceId(Long workflowInstanceId) { this.workflowInstanceId = workflowInstanceId; }

    public InvIssueVoucher getIssueVoucher() { return issueVoucher; }
    public void setIssueVoucher(InvIssueVoucher issueVoucher) { this.issueVoucher = issueVoucher; }

    public List<InvMaterialRequestLine> getLines() { return lines; }
    public void setLines(List<InvMaterialRequestLine> lines) { this.lines = lines; }

    public String getCreatedBy() { return createdBy; }
    public void setCreatedBy(String createdBy) { this.createdBy = createdBy; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
}
