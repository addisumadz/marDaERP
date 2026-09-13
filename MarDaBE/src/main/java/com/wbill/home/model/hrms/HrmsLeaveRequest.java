package com.wbill.home.model.hrms;

import java.io.Serializable;
import java.time.LocalDate;
import java.time.LocalDateTime;
import jakarta.persistence.*;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

@Entity
@Table(name = "hrms_employee_leave")
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class HrmsLeaveRequest implements Serializable {
    private static final long serialVersionUID = 1L;

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private int id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "hrms_employee_info_id", nullable = false)
    @JsonIgnoreProperties({"department", "position", "branch", "hibernateLazyInitializer", "handler"})
    private HrmsEmployee employee;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "leave_type_id")
    private HrmsLeaveType leaveType;

    @Column(name = "year", nullable = false)
    private int year;

    @Column(name = "leave_days", nullable = false)
    private int leaveDays;

    @Column(name = "leave_start", nullable = false)
    private LocalDate leaveStart;

    @Column(name = "leave_end", nullable = false)
    private LocalDate leaveEnd;

    @Column(name = "leave_reason", length = 255)
    private String leaveReason;

    @Column(name = "approval_status", nullable = false, length = 50)
    private String approvalStatus = "PENDING"; // PENDING, APPROVED, REJECTED, CANCELLED

    @Column(name = "approved_by")
    private Integer approvedBy;

    @Column(name = "approved_date")
    private LocalDateTime approvedDate;

    @Column(name = "attachment_path", length = 255)
    private String attachmentPath;

    @Column(name = "registered_by", nullable = false)
    private int registeredBy;

    @Column(name = "registered_date", updatable = false)
    private LocalDateTime registeredDate = LocalDateTime.now();

    @Column(name = "modified_by")
    private Integer modifiedBy;

    @Column(name = "modified_date")
    private LocalDateTime modifiedDate = LocalDateTime.now();

    @Column(name = "is_deleted", nullable = false)
    private boolean deleted = false;

    public HrmsLeaveRequest() {}

    // Getters and Setters
    public int getId() { return id; }
    public void setId(int id) { this.id = id; }

    public HrmsEmployee getEmployee() { return employee; }
    public void setEmployee(HrmsEmployee employee) { this.employee = employee; }

    public HrmsLeaveType getLeaveType() { return leaveType; }
    public void setLeaveType(HrmsLeaveType leaveType) { this.leaveType = leaveType; }

    public int getYear() { return year; }
    public void setYear(int year) { this.year = year; }

    public int getLeaveDays() { return leaveDays; }
    public void setLeaveDays(int leaveDays) { this.leaveDays = leaveDays; }

    public LocalDate getLeaveStart() { return leaveStart; }
    public void setLeaveStart(LocalDate leaveStart) { this.leaveStart = leaveStart; }

    public LocalDate getLeaveEnd() { return leaveEnd; }
    public void setLeaveEnd(LocalDate leaveEnd) { this.leaveEnd = leaveEnd; }

    public String getLeaveReason() { return leaveReason; }
    public void setLeaveReason(String leaveReason) { this.leaveReason = leaveReason; }

    public String getApprovalStatus() { return approvalStatus; }
    public void setApprovalStatus(String approvalStatus) { this.approvalStatus = approvalStatus; }

    public Integer getApprovedBy() { return approvedBy; }
    public void setApprovedBy(Integer approvedBy) { this.approvedBy = approvedBy; }

    public LocalDateTime getApprovedDate() { return approvedDate; }
    public void setApprovedDate(LocalDateTime approvedDate) { this.approvedDate = approvedDate; }

    public String getAttachmentPath() { return attachmentPath; }
    public void setAttachmentPath(String attachmentPath) { this.attachmentPath = attachmentPath; }

    public int getRegisteredBy() { return registeredBy; }
    public void setRegisteredBy(int registeredBy) { this.registeredBy = registeredBy; }

    public LocalDateTime getRegisteredDate() { return registeredDate; }
    public void setRegisteredDate(LocalDateTime registeredDate) { this.registeredDate = registeredDate; }

    public Integer getModifiedBy() { return modifiedBy; }
    public void setModifiedBy(Integer modifiedBy) { this.modifiedBy = modifiedBy; }

    public LocalDateTime getModifiedDate() { return modifiedDate; }
    public void setModifiedDate(LocalDateTime modifiedDate) { this.modifiedDate = modifiedDate; }

    public boolean isDeleted() { return deleted; }
    public void setDeleted(boolean deleted) { this.deleted = deleted; }
}
