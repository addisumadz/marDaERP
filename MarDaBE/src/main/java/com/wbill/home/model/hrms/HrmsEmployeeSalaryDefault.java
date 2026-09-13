package com.wbill.home.model.hrms;

import java.io.Serializable;
import jakarta.persistence.*;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

@Entity
@Table(name = "hrms_employee_info_salary_defaults")
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class HrmsEmployeeSalaryDefault implements Serializable {
    private static final long serialVersionUID = 1L;

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private int id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "hrms_employee_info_id", nullable = false)
    @JsonIgnoreProperties({"department", "position", "branch", "hibernateLazyInitializer", "handler"})
    private HrmsEmployee employee;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "hrms_salary_configurations_id", nullable = false)
    private HrmsSalaryConfiguration salaryConfiguration;

    @Column(name = "default_value", nullable = false)
    private double defaultValue = 0.0;

    @Column(name = "is_active", nullable = false)
    private boolean active = true;

    @Column(name = "is_deleted", nullable = false)
    private boolean deleted = false;

    public HrmsEmployeeSalaryDefault() {}

    // Getters and Setters
    public int getId() { return id; }
    public void setId(int id) { this.id = id; }

    public HrmsEmployee getEmployee() { return employee; }
    public void setEmployee(HrmsEmployee employee) { this.employee = employee; }

    public HrmsSalaryConfiguration getSalaryConfiguration() { return salaryConfiguration; }
    public void setSalaryConfiguration(HrmsSalaryConfiguration salaryConfiguration) { this.salaryConfiguration = salaryConfiguration; }

    public double getDefaultValue() { return defaultValue; }
    public void setDefaultValue(double defaultValue) { this.defaultValue = defaultValue; }

    public boolean isActive() { return active; }
    public void setActive(boolean active) { this.active = active; }

    public boolean isDeleted() { return deleted; }
    public void setDeleted(boolean deleted) { this.deleted = deleted; }
}
