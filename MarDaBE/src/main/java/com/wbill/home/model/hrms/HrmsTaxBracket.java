package com.wbill.home.model.hrms;

import java.io.Serializable;
import jakarta.persistence.*;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

@Entity
@Table(name = "hrms_gibir_setting")
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class HrmsTaxBracket implements Serializable {
    private static final long serialVersionUID = 1L;

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private int id;

    @Column(name = "weight", nullable = false)
    private int weight; // 1 to 7

    @Column(name = "upper_limit_birr", nullable = false)
    private int upperLimitBirr; // 600, 1650, 3200, 5250, 7800, 10900

    @Column(name = "percent_birr", nullable = false)
    private int percentBirr; // 0, 10, 15, 20, 25, 30, 35

    @Column(name = "and_above", nullable = false)
    private boolean andAbove = false;

    @Column(name = "total_deductible_till_this", nullable = false)
    private double totalDeductibleTillThis = 0.0; // 0, 60, 142.5, 302.5, 565, 955, 1500

    @Column(name = "setting_description", length = 150)
    private String settingDescription;

    @Column(name = "is_deleted", nullable = false)
    private boolean deleted = false;

    public HrmsTaxBracket() {}

    // Getters and Setters
    public int getId() { return id; }
    public void setId(int id) { this.id = id; }

    public int getWeight() { return weight; }
    public void setWeight(int weight) { this.weight = weight; }

    public int getUpperLimitBirr() { return upperLimitBirr; }
    public void setUpperLimitBirr(int upperLimitBirr) { this.upperLimitBirr = upperLimitBirr; }

    public int getPercentBirr() { return percentBirr; }
    public void setPercentBirr(int percentBirr) { this.percentBirr = percentBirr; }

    public boolean isAndAbove() { return andAbove; }
    public void setAndAbove(boolean andAbove) { this.andAbove = andAbove; }

    public double getTotalDeductibleTillThis() { return totalDeductibleTillThis; }
    public void setTotalDeductibleTillThis(double totalDeductibleTillThis) { this.totalDeductibleTillThis = totalDeductibleTillThis; }

    public String getSettingDescription() { return settingDescription; }
    public void setSettingDescription(String settingDescription) { this.settingDescription = settingDescription; }

    public boolean isDeleted() { return deleted; }
    public void setDeleted(boolean deleted) { this.deleted = deleted; }
}
