package com.wbill.home.model.hrms;

import java.io.Serializable;
import java.time.LocalDateTime;
import jakarta.persistence.*;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

@Entity
@Table(name = "hrms_leave_allocations")
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class HrmsLeaveAllocation implements Serializable {
    private static final long serialVersionUID = 1L;

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private int id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "hrms_employee_info_id", nullable = false)
    @JsonIgnoreProperties({"department", "position", "branch", "hibernateLazyInitializer", "handler"})
    private HrmsEmployee employee;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "leave_type_id", nullable = false)
    private HrmsLeaveType leaveType;

    @Column(name = "fiscal_year_ec", nullable = false)
    private int fiscalYearEc;

    @Column(name = "entitled_days", nullable = false)
    private double entitledDays = 0.0;

    @Column(name = "carried_over_days", nullable = false)
    private double carriedOverDays = 0.0;

    @Column(name = "used_days", nullable = false)
    private double usedDays = 0.0;

    @Column(name = "remaining_days", nullable = false)
    private double remainingDays = 0.0;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt = LocalDateTime.now();

    public HrmsLeaveAllocation() {}

    // Getters and Setters
    public int getId() { return id; }
    public void setId(int id) { this.id = id; }

    public HrmsEmployee getEmployee() { return employee; }
    public void setEmployee(HrmsEmployee employee) { this.employee = employee; }

    public HrmsLeaveType getLeaveType() { return leaveType; }
    public void setLeaveType(HrmsLeaveType leaveType) { this.leaveType = leaveType; }

    public int getFiscalYearEc() { return fiscalYearEc; }
    public void setFiscalYearEc(int fiscalYearEc) { this.fiscalYearEc = fiscalYearEc; }

    public double getEntitledDays() { return entitledDays; }
    public void setEntitledDays(double entitledDays) { this.entitledDays = entitledDays; }

    public double getCarriedOverDays() { return carriedOverDays; }
    public void setCarriedOverDays(double carriedOverDays) { this.carriedOverDays = carriedOverDays; }

    public double getUsedDays() { return usedDays; }
    public void setUsedDays(double usedDays) { this.usedDays = usedDays; }

    public double getRemainingDays() { return remainingDays; }
    public void setRemainingDays(double remainingDays) { this.remainingDays = remainingDays; }

    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
}
