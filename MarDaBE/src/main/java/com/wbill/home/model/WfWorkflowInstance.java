package com.wbill.home.model;

import java.io.Serializable;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import jakarta.persistence.*;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

@Entity
@Table(name = "wf_workflow_instance")
public class WfWorkflowInstance implements Serializable {
    private static final long serialVersionUID = 1L;

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private long id;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "template_id", nullable = false)
    @JsonIgnoreProperties({"steps"})
    private WfWorkflowTemplate template;

    @Column(name = "document_type", nullable = false, length = 50)
    private String documentType;

    @Column(name = "document_id", nullable = false)
    private long documentId;

    @Column(name = "document_number", length = 50)
    private String documentNumber;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "current_step_id")
    private WfWorkflowStep currentStep;

    @Column(name = "status", nullable = false, length = 30)
    private String status = "IN_PROGRESS";

    @Column(name = "initiated_by", length = 100)
    private String initiatedBy;

    @Column(name = "initiated_at", updatable = false)
    private LocalDateTime initiatedAt;

    @Column(name = "completed_at")
    private LocalDateTime completedAt;

    @Column(name = "total_amount", precision = 15, scale = 2)
    private BigDecimal totalAmount;

    @Column(name = "branch_id")
    private Integer branchId;

    @OneToMany(mappedBy = "instance", cascade = CascadeType.ALL, fetch = FetchType.EAGER)
    @OrderBy("actedAt ASC")
    private List<WfWorkflowAction> actions;

    @PrePersist
    protected void onCreate() { initiatedAt = LocalDateTime.now(); }

    public WfWorkflowInstance() {}

    // Getters and Setters
    public long getId() { return id; }
    public void setId(long id) { this.id = id; }
    public WfWorkflowTemplate getTemplate() { return template; }
    public void setTemplate(WfWorkflowTemplate template) { this.template = template; }
    public String getDocumentType() { return documentType; }
    public void setDocumentType(String documentType) { this.documentType = documentType; }
    public long getDocumentId() { return documentId; }
    public void setDocumentId(long documentId) { this.documentId = documentId; }
    public String getDocumentNumber() { return documentNumber; }
    public void setDocumentNumber(String documentNumber) { this.documentNumber = documentNumber; }
    public WfWorkflowStep getCurrentStep() { return currentStep; }
    public void setCurrentStep(WfWorkflowStep currentStep) { this.currentStep = currentStep; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    public String getInitiatedBy() { return initiatedBy; }
    public void setInitiatedBy(String initiatedBy) { this.initiatedBy = initiatedBy; }
    public LocalDateTime getInitiatedAt() { return initiatedAt; }
    public LocalDateTime getCompletedAt() { return completedAt; }
    public void setCompletedAt(LocalDateTime completedAt) { this.completedAt = completedAt; }
    public BigDecimal getTotalAmount() { return totalAmount; }
    public void setTotalAmount(BigDecimal totalAmount) { this.totalAmount = totalAmount; }
    public Integer getBranchId() { return branchId; }
    public void setBranchId(Integer branchId) { this.branchId = branchId; }
    public List<WfWorkflowAction> getActions() { return actions; }
    public void setActions(List<WfWorkflowAction> actions) { this.actions = actions; }
}
