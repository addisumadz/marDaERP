package com.wbill.home.model;

import java.io.Serializable;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import jakarta.persistence.*;
import com.fasterxml.jackson.annotation.JsonIgnore;

@Entity
@Table(name = "wf_workflow_step")
public class WfWorkflowStep implements Serializable {
    private static final long serialVersionUID = 1L;

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private int id;

    @JsonIgnore
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "template_id", nullable = false)
    private WfWorkflowTemplate template;

    @Column(name = "step_order", nullable = false)
    private int stepOrder;

    @Column(name = "step_name", nullable = false, length = 200)
    private String stepName;

    @Column(name = "step_name_am", length = 200)
    private String stepNameAm;

    @Column(name = "approver_role_code", nullable = false, length = 20)
    private String approverRoleCode;

    @Column(name = "is_required", nullable = false)
    private boolean isRequired = true;

    @Column(name = "min_amount", precision = 15, scale = 2)
    private BigDecimal minAmount;

    @Column(name = "max_amount", precision = 15, scale = 2)
    private BigDecimal maxAmount;

    @Column(name = "auto_approve_below", precision = 15, scale = 2)
    private BigDecimal autoApproveBelow;

    @Column(name = "sla_hours")
    private int slaHours = 48;

    @Column(name = "can_reject", nullable = false)
    private boolean canReject = true;

    @Column(name = "notify_on_arrival", nullable = false)
    private boolean notifyOnArrival = true;

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() { createdAt = LocalDateTime.now(); }

    public WfWorkflowStep() {}

    // Getters and Setters
    public int getId() { return id; }
    public void setId(int id) { this.id = id; }
    public WfWorkflowTemplate getTemplate() { return template; }
    public void setTemplate(WfWorkflowTemplate template) { this.template = template; }
    public int getStepOrder() { return stepOrder; }
    public void setStepOrder(int stepOrder) { this.stepOrder = stepOrder; }
    public String getStepName() { return stepName; }
    public void setStepName(String stepName) { this.stepName = stepName; }
    public String getStepNameAm() { return stepNameAm; }
    public void setStepNameAm(String stepNameAm) { this.stepNameAm = stepNameAm; }
    public String getApproverRoleCode() { return approverRoleCode; }
    public void setApproverRoleCode(String approverRoleCode) { this.approverRoleCode = approverRoleCode; }
    public boolean getIsRequired() { return isRequired; }
    public void setIsRequired(boolean isRequired) { this.isRequired = isRequired; }
    public BigDecimal getMinAmount() { return minAmount; }
    public void setMinAmount(BigDecimal minAmount) { this.minAmount = minAmount; }
    public BigDecimal getMaxAmount() { return maxAmount; }
    public void setMaxAmount(BigDecimal maxAmount) { this.maxAmount = maxAmount; }
    public BigDecimal getAutoApproveBelow() { return autoApproveBelow; }
    public void setAutoApproveBelow(BigDecimal autoApproveBelow) { this.autoApproveBelow = autoApproveBelow; }
    public int getSlaHours() { return slaHours; }
    public void setSlaHours(int slaHours) { this.slaHours = slaHours; }
    public boolean getCanReject() { return canReject; }
    public void setCanReject(boolean canReject) { this.canReject = canReject; }
    public boolean getNotifyOnArrival() { return notifyOnArrival; }
    public void setNotifyOnArrival(boolean notifyOnArrival) { this.notifyOnArrival = notifyOnArrival; }
    public LocalDateTime getCreatedAt() { return createdAt; }
}
