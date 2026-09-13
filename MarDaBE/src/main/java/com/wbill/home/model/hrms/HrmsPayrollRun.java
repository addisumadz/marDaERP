package com.wbill.home.model.hrms;

import java.io.Serializable;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import jakarta.persistence.*;
import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.wbill.home.model.FncFiscalYear;
import com.wbill.home.model.FncJournalEntry;

@Entity
@Table(name = "hrms_payroll_runs")
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class HrmsPayrollRun implements Serializable {
    private static final long serialVersionUID = 1L;

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private int id;

    @Column(name = "payroll_reference", nullable = false, unique = true, length = 100)
    private String payrollReference; // e.g. PAYROLL-መስከረም-2018

    @Column(name = "salary_month_name", nullable = false, length = 50)
    private String salaryMonthName; // e.g. መስከረም

    @Column(name = "salary_year", nullable = false)
    private int salaryYear; // e.g. 2018

    @Column(name = "salary_month_date", nullable = false)
    private LocalDate salaryMonthDate;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "fiscal_year_id", nullable = false)
    @JsonIgnoreProperties({"periods", "journalEntries", "hibernateLazyInitializer", "handler"})
    private FncFiscalYear fiscalYear;

    // Aggregations
    @Column(name = "total_basic_salary", nullable = false)
    private double totalBasicSalary = 0.0;

    @Column(name = "total_overtime", nullable = false)
    private double totalOvertime = 0.0;

    @Column(name = "total_additive", nullable = false)
    private double totalAdditive = 0.0;

    @Column(name = "total_gross_salary", nullable = false)
    private double totalGrossSalary = 0.0;

    @Column(name = "total_taxable_income", nullable = false)
    private double totalTaxableIncome = 0.0;

    @Column(name = "total_salary_tax", nullable = false)
    private double totalSalaryTax = 0.0;

    @Column(name = "total_pension_employee", nullable = false)
    private double totalPensionEmployee = 0.0; // 7%

    @Column(name = "total_pension_employer", nullable = false)
    private double totalPensionEmployer = 0.0; // 11%

    @Column(name = "total_deductible", nullable = false)
    private double totalDeductible = 0.0;

    // Dual Bank Split Totals
    @Column(name = "total_net_salary", nullable = false)
    private double totalNetSalary = 0.0;

    @Column(name = "total_net_cbe", nullable = false)
    private double totalNetCbe = 0.0;

    @Column(name = "total_net_abay", nullable = false)
    private double totalNetAbay = 0.0;

    // Statuses
    @Column(name = "payment_status", nullable = false, length = 50)
    private String paymentStatus = "PENDING";

    @Column(name = "approval_status", nullable = false, length = 50)
    private String approvalStatus = "DRAFT"; // DRAFT, VERIFIED, APPROVED, POSTED_TO_JOURNAL

    @Column(name = "is_posted_to_journal", nullable = false)
    private boolean postedToJournal = false;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "journal_entry_id")
    @JsonIgnoreProperties({"fiscalYear", "lines", "hibernateLazyInitializer", "handler"})
    private FncJournalEntry journalEntry;

    @Column(name = "fnce_payment_voucher_id")
    private Integer fncePaymentVoucherId;

    // Relationships
    @JsonIgnore
    @OneToMany(mappedBy = "payrollRun", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<HrmsSalaryCalculated> calculatedSalaries;

    // Audit fields
    @Column(name = "registered_by", nullable = false)
    private int registeredBy;

    @Column(name = "registered_date", updatable = false)
    private LocalDateTime registeredDate = LocalDateTime.now();

    @Column(name = "approved_by")
    private Integer approvedBy;

    @Column(name = "approved_date")
    private LocalDateTime approvedDate;

    @Column(name = "is_deleted", nullable = false)
    private boolean deleted = false;

    public HrmsPayrollRun() {}

    // Getters and Setters
    public int getId() { return id; }
    public void setId(int id) { this.id = id; }

    public String getPayrollReference() { return payrollReference; }
    public void setPayrollReference(String payrollReference) { this.payrollReference = payrollReference; }

    public String getSalaryMonthName() { return salaryMonthName; }
    public void setSalaryMonthName(String salaryMonthName) { this.salaryMonthName = salaryMonthName; }

    public int getSalaryYear() { return salaryYear; }
    public void setSalaryYear(int salaryYear) { this.salaryYear = salaryYear; }

    public LocalDate getSalaryMonthDate() { return salaryMonthDate; }
    public void setSalaryMonthDate(LocalDate salaryMonthDate) { this.salaryMonthDate = salaryMonthDate; }

    public FncFiscalYear getFiscalYear() { return fiscalYear; }
    public void setFiscalYear(FncFiscalYear fiscalYear) { this.fiscalYear = fiscalYear; }

    public double getTotalBasicSalary() { return totalBasicSalary; }
    public void setTotalBasicSalary(double totalBasicSalary) { this.totalBasicSalary = totalBasicSalary; }

    public double getTotalOvertime() { return totalOvertime; }
    public void setTotalOvertime(double totalOvertime) { this.totalOvertime = totalOvertime; }

    public double getTotalAdditive() { return totalAdditive; }
    public void setTotalAdditive(double totalAdditive) { this.totalAdditive = totalAdditive; }

    public double getTotalGrossSalary() { return totalGrossSalary; }
    public void setTotalGrossSalary(double totalGrossSalary) { this.totalGrossSalary = totalGrossSalary; }

    public double getTotalTaxableIncome() { return totalTaxableIncome; }
    public void setTotalTaxableIncome(double totalTaxableIncome) { this.totalTaxableIncome = totalTaxableIncome; }

    public double getTotalSalaryTax() { return totalSalaryTax; }
    public void setTotalSalaryTax(double totalSalaryTax) { this.totalSalaryTax = totalSalaryTax; }

    public double getTotalPensionEmployee() { return totalPensionEmployee; }
    public void setTotalPensionEmployee(double totalPensionEmployee) { this.totalPensionEmployee = totalPensionEmployee; }

    public double getTotalPensionEmployer() { return totalPensionEmployer; }
    public void setTotalPensionEmployer(double totalPensionEmployer) { this.totalPensionEmployer = totalPensionEmployer; }

    public double getTotalDeductible() { return totalDeductible; }
    public void setTotalDeductible(double totalDeductible) { this.totalDeductible = totalDeductible; }

    public double getTotalNetSalary() { return totalNetSalary; }
    public void setTotalNetSalary(double totalNetSalary) { this.totalNetSalary = totalNetSalary; }

    public double getTotalNetCbe() { return totalNetCbe; }
    public void setTotalNetCbe(double totalNetCbe) { this.totalNetCbe = totalNetCbe; }

    public double getTotalNetAbay() { return totalNetAbay; }
    public void setTotalNetAbay(double totalNetAbay) { this.totalNetAbay = totalNetAbay; }

    public String getPaymentStatus() { return paymentStatus; }
    public void setPaymentStatus(String paymentStatus) { this.paymentStatus = paymentStatus; }

    public String getApprovalStatus() { return approvalStatus; }
    public void setApprovalStatus(String approvalStatus) { this.approvalStatus = approvalStatus; }

    public boolean isPostedToJournal() { return postedToJournal; }
    public void setPostedToJournal(boolean postedToJournal) { this.postedToJournal = postedToJournal; }

    public FncJournalEntry getJournalEntry() { return journalEntry; }
    public void setJournalEntry(FncJournalEntry journalEntry) { this.journalEntry = journalEntry; }

    public Integer getFncePaymentVoucherId() { return fncePaymentVoucherId; }
    public void setFncePaymentVoucherId(Integer fncePaymentVoucherId) { this.fncePaymentVoucherId = fncePaymentVoucherId; }

    public List<HrmsSalaryCalculated> getCalculatedSalaries() { return calculatedSalaries; }
    public void setCalculatedSalaries(List<HrmsSalaryCalculated> calculatedSalaries) { this.calculatedSalaries = calculatedSalaries; }

    public int getRegisteredBy() { return registeredBy; }
    public void setRegisteredBy(int registeredBy) { this.registeredBy = registeredBy; }

    public LocalDateTime getRegisteredDate() { return registeredDate; }
    public void setRegisteredDate(LocalDateTime registeredDate) { this.registeredDate = registeredDate; }

    public Integer getApprovedBy() { return approvedBy; }
    public void setApprovedBy(Integer approvedBy) { this.approvedBy = approvedBy; }

    public LocalDateTime getApprovedDate() { return approvedDate; }
    public void setApprovedDate(LocalDateTime approvedDate) { this.approvedDate = approvedDate; }

    public boolean isDeleted() { return deleted; }
    public void setDeleted(boolean deleted) { this.deleted = deleted; }
}
