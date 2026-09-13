package com.wbill.home.model.hrms;

import java.io.Serializable;
import jakarta.persistence.*;
import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

@Entity
@Table(name = "hrms_salary_calculated_tekenash")
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class HrmsSalaryCalculatedTekenash implements Serializable {
    private static final long serialVersionUID = 1L;

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private int id;

    @JsonIgnore
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "hrms_salary_calculated_id", nullable = false)
    private HrmsSalaryCalculated salaryCalculated;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "hrms_salary_configurations_id", nullable = false)
    private HrmsSalaryConfiguration salaryConfiguration;

    @Column(name = "is_percent", nullable = false)
    private boolean percent = false;

    @Column(name = "is_birr", nullable = false)
    private boolean birr = true;

    @Column(name = "config_value", nullable = false)
    private double configValue = 0.0;

    @Column(name = "tekenanash_value", nullable = false)
    private double tekenanashValue = 0.0;

    @Column(name = "is_tekenash", nullable = false)
    private boolean tekenash = false; // Deductive component

    @Column(name = "is_techemari", nullable = false)
    private boolean techemari = false; // Additive component

    @Column(name = "is_deleted", nullable = false)
    private boolean deleted = false;

    public HrmsSalaryCalculatedTekenash() {}

    // Getters and Setters
    public int getId() { return id; }
    public void setId(int id) { this.id = id; }

    public HrmsSalaryCalculated getSalaryCalculated() { return salaryCalculated; }
    public void setSalaryCalculated(HrmsSalaryCalculated salaryCalculated) { this.salaryCalculated = salaryCalculated; }

    public HrmsSalaryConfiguration getSalaryConfiguration() { return salaryConfiguration; }
    public void setSalaryConfiguration(HrmsSalaryConfiguration salaryConfiguration) { this.salaryConfiguration = salaryConfiguration; }

    public boolean isPercent() { return percent; }
    public void setPercent(boolean percent) { this.percent = percent; }

    public boolean isBirr() { return birr; }
    public void setBirr(boolean birr) { this.birr = birr; }

    public double getConfigValue() { return configValue; }
    public void setConfigValue(double configValue) { this.configValue = configValue; }

    public double getTekenanashValue() { return tekenanashValue; }
    public void setTekenanashValue(double tekenanashValue) { this.tekenanashValue = tekenanashValue; }

    public boolean isTekenash() { return tekenash; }
    public void setTekenash(boolean tekenash) { this.tekenash = tekenash; }

    public boolean isTechemari() { return techemari; }
    public void setTechemari(boolean techemari) { this.techemari = techemari; }

    public boolean isDeleted() { return deleted; }
    public void setDeleted(boolean deleted) { this.deleted = deleted; }
}
