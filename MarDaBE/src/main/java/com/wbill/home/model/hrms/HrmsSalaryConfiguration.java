package com.wbill.home.model.hrms;

import java.io.Serializable;
import java.time.LocalDateTime;
import jakarta.persistence.*;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

@Entity
@Table(name = "hrms_salary_configurations")
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class HrmsSalaryConfiguration implements Serializable {
    private static final long serialVersionUID = 1L;

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private int id;

    @Column(name = "config_code", unique = true, length = 50)
    private String configCode;

    @Column(name = "config_title", nullable = false, length = 150)
    private String configTitle;

    @Column(name = "config_title_am", length = 200)
    private String configTitleAm;

    @Column(name = "is_birr", nullable = false)
    private boolean birr = true;

    @Column(name = "is_percent", nullable = false)
    private boolean percent = false;

    @Column(name = "config_value", nullable = false)
    private double configValue = 0.0;

    @Column(name = "weight", nullable = false)
    private int weight = 0;

    @Column(name = "is_taxed", nullable = false)
    private boolean taxed = false;

    @Column(name = "is_deductible", nullable = false)
    private boolean deductible = false;

    @Column(name = "is_additive", nullable = false)
    private boolean additive = false;

    @Column(name = "is_pension", nullable = false)
    private boolean pension = false;

    @Column(name = "is_leave_config", nullable = false)
    private boolean leaveConfig = false;

    @Column(name = "is_deleted", nullable = false)
    private boolean deleted = false;

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    @Column(name = "updated_at")
    private LocalDateTime updatedAt = LocalDateTime.now();

    public HrmsSalaryConfiguration() {}

    // Getters and Setters
    public int getId() { return id; }
    public void setId(int id) { this.id = id; }

    public String getConfigCode() { return configCode; }
    public void setConfigCode(String configCode) { this.configCode = configCode; }

    public String getConfigTitle() { return configTitle; }
    public void setConfigTitle(String configTitle) { this.configTitle = configTitle; }

    public String getConfigTitleAm() { return configTitleAm; }
    public void setConfigTitleAm(String configTitleAm) { this.configTitleAm = configTitleAm; }

    public boolean isBirr() { return birr; }
    public void setBirr(boolean birr) { this.birr = birr; }

    public boolean isPercent() { return percent; }
    public void setPercent(boolean percent) { this.percent = percent; }

    public double getConfigValue() { return configValue; }
    public void setConfigValue(double configValue) { this.configValue = configValue; }

    public int getWeight() { return weight; }
    public void setWeight(int weight) { this.weight = weight; }

    public boolean isTaxed() { return taxed; }
    public void setTaxed(boolean taxed) { this.taxed = taxed; }

    public boolean isDeductible() { return deductible; }
    public void setDeductible(boolean deductible) { this.deductible = deductible; }

    public boolean isAdditive() { return additive; }
    public void setAdditive(boolean additive) { this.additive = additive; }

    public boolean isPension() { return pension; }
    public void setPension(boolean pension) { this.pension = pension; }

    public boolean isLeaveConfig() { return leaveConfig; }
    public void setLeaveConfig(boolean leaveConfig) { this.leaveConfig = leaveConfig; }

    public boolean isDeleted() { return deleted; }
    public void setDeleted(boolean deleted) { this.deleted = deleted; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
}
