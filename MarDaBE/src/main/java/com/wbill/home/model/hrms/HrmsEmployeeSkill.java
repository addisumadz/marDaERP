package com.wbill.home.model.hrms;

import java.io.Serializable;
import java.time.LocalDateTime;
import jakarta.persistence.*;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

@Entity
@Table(name = "hrms_employee_chlota")
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class HrmsEmployeeSkill implements Serializable {
    private static final long serialVersionUID = 1L;

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private int id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "hrms_employee_info_id", nullable = false)
    @JsonIgnoreProperties({"department", "position", "branch", "hibernateLazyInitializer", "handler"})
    private HrmsEmployee employee;

    @Column(name = "chlota_sm", nullable = false, length = 200)
    private String chlotaSm; // Skill Name (e.g. Pipe Laying, Water Titration, GIS)

    @Column(name = "chlota_label", length = 200)
    private String chlotaLabel;

    @Column(name = "chlota_level", length = 50)
    private String chlotaLevel = "INTERMEDIATE"; // BASIC, INTERMEDIATE, ADVANCED, EXPERT

    @Column(name = "chlota_remark", columnDefinition = "TEXT")
    private String chlotaRemark;

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

    public HrmsEmployeeSkill() {}

    // Getters and Setters
    public int getId() { return id; }
    public void setId(int id) { this.id = id; }

    public HrmsEmployee getEmployee() { return employee; }
    public void setEmployee(HrmsEmployee employee) { this.employee = employee; }

    public String getChlotaSm() { return chlotaSm; }
    public void setChlotaSm(String chlotaSm) { this.chlotaSm = chlotaSm; }

    public String getChlotaLabel() { return chlotaLabel; }
    public void setChlotaLabel(String chlotaLabel) { this.chlotaLabel = chlotaLabel; }

    public String getChlotaLevel() { return chlotaLevel; }
    public void setChlotaLevel(String chlotaLevel) { this.chlotaLevel = chlotaLevel; }

    public String getChlotaRemark() { return chlotaRemark; }
    public void setChlotaRemark(String chlotaRemark) { this.chlotaRemark = chlotaRemark; }

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
