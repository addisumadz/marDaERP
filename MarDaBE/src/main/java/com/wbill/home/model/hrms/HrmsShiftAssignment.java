package com.wbill.home.model.hrms;

import java.io.Serializable;
import java.time.LocalDate;
import java.time.LocalDateTime;
import jakarta.persistence.*;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

@Entity
@Table(name = "hrms_shift_assignments")
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class HrmsShiftAssignment implements Serializable {
    private static final long serialVersionUID = 1L;

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private int id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "hrms_employee_info_id", nullable = false)
    @JsonIgnoreProperties({"department", "position", "branch", "hibernateLazyInitializer", "handler"})
    private HrmsEmployee employee;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "shift_schedule_id", nullable = false)
    private HrmsShiftSchedule shiftSchedule;

    @Column(name = "assigned_date", nullable = false)
    private LocalDate assignedDate;

    @Column(name = "is_standby_on_call", nullable = false)
    private boolean standbyOnCall = false; // Emergency burst repair crew

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    public HrmsShiftAssignment() {}

    // Getters and Setters
    public int getId() { return id; }
    public void setId(int id) { this.id = id; }

    public HrmsEmployee getEmployee() { return employee; }
    public void setEmployee(HrmsEmployee employee) { this.employee = employee; }

    public HrmsShiftSchedule getShiftSchedule() { return shiftSchedule; }
    public void setShiftSchedule(HrmsShiftSchedule shiftSchedule) { this.shiftSchedule = shiftSchedule; }

    public LocalDate getAssignedDate() { return assignedDate; }
    public void setAssignedDate(LocalDate assignedDate) { this.assignedDate = assignedDate; }

    public boolean isStandbyOnCall() { return standbyOnCall; }
    public void setStandbyOnCall(boolean standbyOnCall) { this.standbyOnCall = standbyOnCall; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}
