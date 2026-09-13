package com.wbill.home.model.hrms;

import java.io.Serializable;
import java.time.LocalDateTime;
import jakarta.persistence.*;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

@Entity
@Table(name = "hrms_positions")
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class HrmsPosition implements Serializable {
    private static final long serialVersionUID = 1L;

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private int id;

    @Column(name = "position_code", nullable = false, unique = true, length = 50)
    private String positionCode;

    @Column(name = "position_title", nullable = false, length = 150)
    private String positionTitle;

    @Column(name = "position_title_am", length = 200)
    private String positionTitleAm;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "department_id", nullable = false)
    @JsonIgnoreProperties({"subDepartments", "parentDepartment", "hibernateLazyInitializer", "handler"})
    private HrmsDepartment department;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "job_grade_id")
    @JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
    private HrmsJobGrade jobGrade;

    @Column(name = "approved_headcount", nullable = false)
    private int approvedHeadcount = 1;

    @Column(name = "is_hazardous", nullable = false)
    private boolean hazardous = false;

    @Column(name = "requires_shift_work", nullable = false)
    private boolean requiresShiftWork = false;

    @Column(name = "is_active", nullable = false)
    private boolean active = true;

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    @Column(name = "updated_at")
    private LocalDateTime updatedAt = LocalDateTime.now();

    public HrmsPosition() {}

    // Getters and Setters
    public int getId() { return id; }
    public void setId(int id) { this.id = id; }

    public String getPositionCode() { return positionCode; }
    public void setPositionCode(String positionCode) { this.positionCode = positionCode; }

    public String getPositionTitle() { return positionTitle; }
    public void setPositionTitle(String positionTitle) { this.positionTitle = positionTitle; }

    public String getPositionTitleAm() { return positionTitleAm; }
    public void setPositionTitleAm(String positionTitleAm) { this.positionTitleAm = positionTitleAm; }

    public HrmsDepartment getDepartment() { return department; }
    public void setDepartment(HrmsDepartment department) { this.department = department; }

    public HrmsJobGrade getJobGrade() { return jobGrade; }
    public void setJobGrade(HrmsJobGrade jobGrade) { this.jobGrade = jobGrade; }

    public int getApprovedHeadcount() { return approvedHeadcount; }
    public void setApprovedHeadcount(int approvedHeadcount) { this.approvedHeadcount = approvedHeadcount; }

    public boolean isHazardous() { return hazardous; }
    public void setHazardous(boolean hazardous) { this.hazardous = hazardous; }

    public boolean isRequiresShiftWork() { return requiresShiftWork; }
    public void setRequiresShiftWork(boolean requiresShiftWork) { this.requiresShiftWork = requiresShiftWork; }

    public boolean isActive() { return active; }
    public void setActive(boolean active) { this.active = active; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
}
