package com.wbill.home.model.hrms;

import java.io.Serializable;
import java.time.LocalDateTime;
import java.util.List;
import jakarta.persistence.*;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

@Entity
@Table(name = "hrms_salary_calculated")
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class HrmsSalaryCalculated implements Serializable {
    private static final long serialVersionUID = 1L;

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private int id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "hrms_payroll_run_id")
    @JsonIgnoreProperties({"calculatedSalaries", "hibernateLazyInitializer", "handler"})
    private HrmsPayrollRun payrollRun;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "hrms_employee_id", nullable = false)
    @JsonIgnoreProperties({"department", "position", "branch", "hibernateLazyInitializer", "handler"})
    private HrmsEmployee employee;

    @Column(name = "basic_salary", nullable = false)
    private double basicSalary = 0.0;

    @Column(name = "current_salary", nullable = false)
    private double currentSalary = 0.0;

    // Overtime breakdown under Ethiopian Labour Proclamation No. 1156/2019
    @Column(name = "part_time_working_hr", nullable = false)
    private double partTimeWorkingHr = 0.0; // Day Overtime 1.5x

    @Column(name = "part_time_night", nullable = false)
    private double partTimeNight = 0.0; // Night Overtime 1.75x

    @Column(name = "part_time_weekend", nullable = false)
    private double partTimeWeekend = 0.0; // Rest Day Overtime 2.0x

    @Column(name = "part_time_holliday", nullable = false)
    private double partTimeHolliday = 0.0; // Holiday Overtime 2.5x

    @Column(name = "part_time_total", nullable = false)
    private double partTimeTotal = 0.0;

    @Column(name = "total_additive", nullable = false)
    private double totalAdditive = 0.0;

    @Column(name = "gross_salary", nullable = false)
    private double grossSalary = 0.0;

    @Column(name = "total_taxable_income", nullable = false)
    private double totalTaxableIncome = 0.0;

    @Column(name = "salary_tax", nullable = false)
    private double salaryTax = 0.0;

    @Column(name = "total_7_percent_pension", nullable = false)
    private double total7PercentPension = 0.0; // Employee 7%

    @Column(name = "total_11_percent_pension", nullable = false)
    private double total11PercentPension = 0.0; // Employer 11%

    @Column(name = "total_deductible", nullable = false)
    private double totalDeductible = 0.0;

    @Column(name = "net_salary", nullable = false)
    private double netSalary = 0.0;

    // Dual Bank Disbursement Split
    @Column(name = "disbursed_to_primary_cbe", nullable = false)
    private double disbursedToPrimaryCbe = 0.0;

    @Column(name = "disbursed_to_secondary_abay", nullable = false)
    private double disbursedToSecondaryAbay = 0.0;

    @Column(name = "working_days", nullable = false)
    private int workingDays = 30;

    @Column(name = "payment_status", nullable = false, length = 50)
    private String paymentStatus = "Pending";

    @Column(name = "approval_status", nullable = false, length = 50)
    private String approvalStatus = "Pending";

    @Column(name = "is_paid", nullable = false)
    private boolean paid = false;

    @OneToMany(mappedBy = "salaryCalculated", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<HrmsSalaryCalculatedTekenash> details;

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

    public HrmsSalaryCalculated() {}

    // Getters and Setters
    public int getId() { return id; }
    public void setId(int id) { this.id = id; }

    public HrmsPayrollRun getPayrollRun() { return payrollRun; }
    public void setPayrollRun(HrmsPayrollRun payrollRun) { this.payrollRun = payrollRun; }

    public HrmsEmployee getEmployee() { return employee; }
    public void setEmployee(HrmsEmployee employee) { this.employee = employee; }

    public double getBasicSalary() { return basicSalary; }
    public void setBasicSalary(double basicSalary) { this.basicSalary = basicSalary; }

    public double getCurrentSalary() { return currentSalary; }
    public void setCurrentSalary(double currentSalary) { this.currentSalary = currentSalary; }

    public double getPartTimeWorkingHr() { return partTimeWorkingHr; }
    public void setPartTimeWorkingHr(double partTimeWorkingHr) { this.partTimeWorkingHr = partTimeWorkingHr; }

    public double getPartTimeNight() { return partTimeNight; }
    public void setPartTimeNight(double partTimeNight) { this.partTimeNight = partTimeNight; }

    public double getPartTimeWeekend() { return partTimeWeekend; }
    public void setPartTimeWeekend(double partTimeWeekend) { this.partTimeWeekend = partTimeWeekend; }

    public double getPartTimeHolliday() { return partTimeHolliday; }
    public void setPartTimeHolliday(double partTimeHolliday) { this.partTimeHolliday = partTimeHolliday; }

    public double getPartTimeTotal() { return partTimeTotal; }
    public void setPartTimeTotal(double partTimeTotal) { this.partTimeTotal = partTimeTotal; }

    public double getTotalAdditive() { return totalAdditive; }
    public void setTotalAdditive(double totalAdditive) { this.totalAdditive = totalAdditive; }

    public double getGrossSalary() { return grossSalary; }
    public void setGrossSalary(double grossSalary) { this.grossSalary = grossSalary; }

    public double getTotalTaxableIncome() { return totalTaxableIncome; }
    public void setTotalTaxableIncome(double totalTaxableIncome) { this.totalTaxableIncome = totalTaxableIncome; }

    public double getSalaryTax() { return salaryTax; }
    public void setSalaryTax(double salaryTax) { this.salaryTax = salaryTax; }

    public double getTotal7PercentPension() { return total7PercentPension; }
    public void setTotal7PercentPension(double total7PercentPension) { this.total7PercentPension = total7PercentPension; }

    public double getTotal11PercentPension() { return total11PercentPension; }
    public void setTotal11PercentPension(double total11PercentPension) { this.total11PercentPension = total11PercentPension; }

    public double getTotalDeductible() { return totalDeductible; }
    public void setTotalDeductible(double totalDeductible) { this.totalDeductible = totalDeductible; }

    public double getNetSalary() { return netSalary; }
    public void setNetSalary(double netSalary) { this.netSalary = netSalary; }

    public double getDisbursedToPrimaryCbe() { return disbursedToPrimaryCbe; }
    public void setDisbursedToPrimaryCbe(double disbursedToPrimaryCbe) { this.disbursedToPrimaryCbe = disbursedToPrimaryCbe; }

    public double getDisbursedToSecondaryAbay() { return disbursedToSecondaryAbay; }
    public void setDisbursedToSecondaryAbay(double disbursedToSecondaryAbay) { this.disbursedToSecondaryAbay = disbursedToSecondaryAbay; }

    public int getWorkingDays() { return workingDays; }
    public void setWorkingDays(int workingDays) { this.workingDays = workingDays; }

    public String getPaymentStatus() { return paymentStatus; }
    public void setPaymentStatus(String paymentStatus) { this.paymentStatus = paymentStatus; }

    public String getApprovalStatus() { return approvalStatus; }
    public void setApprovalStatus(String approvalStatus) { this.approvalStatus = approvalStatus; }

    public boolean isPaid() { return paid; }
    public void setPaid(boolean paid) { this.paid = paid; }

    public List<HrmsSalaryCalculatedTekenash> getDetails() { return details; }
    public void setDetails(List<HrmsSalaryCalculatedTekenash> details) { this.details = details; }

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
