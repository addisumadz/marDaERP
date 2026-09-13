package com.wbill.home.model;

import java.io.Serializable;
import java.time.LocalDateTime;
import jakarta.persistence.*;
import com.fasterxml.jackson.annotation.JsonIgnore;

@Entity
@Table(name = "wf_workflow_action")
public class WfWorkflowAction implements Serializable {
    private static final long serialVersionUID = 1L;

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private long id;

    @JsonIgnore
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "instance_id", nullable = false)
    private WfWorkflowInstance instance;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "step_id", nullable = false)
    private WfWorkflowStep step;

    @Column(name = "action", nullable = false, length = 20)
    private String action; // APPROVED, REJECTED, RETURNED, SKIPPED

    @Column(name = "acted_by", nullable = false, length = 100)
    private String actedBy;

    @Column(name = "acted_at")
    private LocalDateTime actedAt;

    @Column(name = "comments", length = 500)
    private String comments;

    @PrePersist
    protected void onCreate() { actedAt = LocalDateTime.now(); }

    public WfWorkflowAction() {}

    // Getters and Setters
    public long getId() { return id; }
    public void setId(long id) { this.id = id; }
    public WfWorkflowInstance getInstance() { return instance; }
    public void setInstance(WfWorkflowInstance instance) { this.instance = instance; }
    public WfWorkflowStep getStep() { return step; }
    public void setStep(WfWorkflowStep step) { this.step = step; }
    public String getAction() { return action; }
    public void setAction(String action) { this.action = action; }
    public String getActedBy() { return actedBy; }
    public void setActedBy(String actedBy) { this.actedBy = actedBy; }
    public LocalDateTime getActedAt() { return actedAt; }
    public String getComments() { return comments; }
    public void setComments(String comments) { this.comments = comments; }
}
