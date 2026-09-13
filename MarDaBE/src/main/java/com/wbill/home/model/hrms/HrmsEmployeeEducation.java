package com.wbill.home.model.hrms;

import java.io.Serializable;
import java.time.LocalDateTime;
import jakarta.persistence.*;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

@Entity
@Table(name = "hrms_employee_education")
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class HrmsEmployeeEducation implements Serializable {
    private static final long serialVersionUID = 1L;

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private int id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "hrms_employee_info_id", nullable = false)
    @JsonIgnoreProperties({"department", "position", "branch", "hibernateLazyInitializer", "handler"})
    private HrmsEmployee employee;

    @Column(name = "yetmhrt_dereja", nullable = false, length = 100)
    private String yetmhrtDereja; // Certificate, Diploma, Degree, Masters, PhD, TVET Level 1-5

    @Column(name = "yetmhrtbet_sm", nullable = false, length = 200)
    private String yetmhrtbetSm;

    @Column(name = "yetmhrt_aynet", nullable = false, length = 200)
    private String yetmhrtAynet;

    @Column(name = "yetmhrt_dereja_status", length = 100)
    private String yetmhrtDerejaStatus = "COMPLETED";

    @Column(name = "graduation_year_ec", length = 20)
    private String graduationYearEc;

    @Column(name = "gpa")
    private Double gpa;

    @Column(name = "registered_date", updatable = false)
    private LocalDateTime registeredDate = LocalDateTime.now();

    @Column(name = "registered_by")
    private Integer registeredBy;

    @Column(name = "modified_date")
    private LocalDateTime modifiedDate = LocalDateTime.now();

    @Column(name = "modified_by")
    private Integer modifiedBy;

    @Column(name = "is_deleted", nullable = false)
    private boolean deleted = false;

    public HrmsEmployeeEducation() {}

    // Getters and Setters
    public int getId() { return id; }
    public void setId(int id) { this.id = id; }

    public HrmsEmployee getEmployee() { return employee; }
    public void setEmployee(HrmsEmployee employee) { this.employee = employee; }

    public String getYetmhrtDereja() { return yetmhrtDereja; }
    public void setYetmhrtDereja(String yetmhrtDereja) { this.yetmhrtDereja = yetmhrtDereja; }

    public String getYetmhrtbetSm() { return yetmhrtbetSm; }
    public void setYetmhrtbetSm(String yetmhrtbetSm) { this.yetmhrtbetSm = yetmhrtbetSm; }

    public String getYetmhrtAynet() { return yetmhrtAynet; }
    public void setYetmhrtAynet(String yetmhrtAynet) { this.yetmhrtAynet = yetmhrtAynet; }

    public String getYetmhrtDerejaStatus() { return yetmhrtDerejaStatus; }
    public void setYetmhrtDerejaStatus(String yetmhrtDerejaStatus) { this.yetmhrtDerejaStatus = yetmhrtDerejaStatus; }

    public String getGraduationYearEc() { return graduationYearEc; }
    public void setGraduationYearEc(String graduationYearEc) { this.graduationYearEc = graduationYearEc; }

    public Double getGpa() { return gpa; }
    public void setGpa(Double gpa) { this.gpa = gpa; }

    public LocalDateTime getRegisteredDate() { return registeredDate; }
    public void setRegisteredDate(LocalDateTime registeredDate) { this.registeredDate = registeredDate; }

    public Integer getRegisteredBy() { return registeredBy; }
    public void setRegisteredBy(Integer registeredBy) { this.registeredBy = registeredBy; }

    public LocalDateTime getModifiedDate() { return modifiedDate; }
    public void setModifiedDate(LocalDateTime modifiedDate) { this.modifiedDate = modifiedDate; }

    public Integer getModifiedBy() { return modifiedBy; }
    public void setModifiedBy(Integer modifiedBy) { this.modifiedBy = modifiedBy; }

    public boolean isDeleted() { return deleted; }
    public void setDeleted(boolean deleted) { this.deleted = deleted; }
}
