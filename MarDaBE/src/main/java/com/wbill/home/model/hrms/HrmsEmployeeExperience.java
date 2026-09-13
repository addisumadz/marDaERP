package com.wbill.home.model.hrms;

import java.io.Serializable;
import java.time.LocalDate;
import java.time.LocalDateTime;
import jakarta.persistence.*;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

@Entity
@Table(name = "hrms_employee_yeteketerebachew")
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class HrmsEmployeeExperience implements Serializable {
    private static final long serialVersionUID = 1L;

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private int id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "hrms_employee_info_id", nullable = false)
    @JsonIgnoreProperties({"department", "position", "branch", "hibernateLazyInitializer", "handler"})
    private HrmsEmployee employee;

    @Column(name = "organization_name", nullable = false, length = 200)
    private String organizationName;

    @Column(name = "yesra_medeb", nullable = false, length = 150)
    private String yesraMedeb; // Position

    @Column(name = "demewez_meten", nullable = false)
    private double demewezMeten = 0.0;

    @Column(name = "employeed_from", nullable = false)
    private LocalDate employeedFrom;

    @Column(name = "employeed_to")
    private LocalDate employeedTo;

    @Column(name = "reason_for_leaving", length = 255)
    private String reasonForLeaving;

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

    public HrmsEmployeeExperience() {}

    // Getters and Setters
    public int getId() { return id; }
    public void setId(int id) { this.id = id; }

    public HrmsEmployee getEmployee() { return employee; }
    public void setEmployee(HrmsEmployee employee) { this.employee = employee; }

    public String getOrganizationName() { return organizationName; }
    public void setOrganizationName(String organizationName) { this.organizationName = organizationName; }

    public String getYesraMedeb() { return yesraMedeb; }
    public void setYesraMedeb(String yesraMedeb) { this.yesraMedeb = yesraMedeb; }

    public double getDemewezMeten() { return demewezMeten; }
    public void setDemewezMeten(double demewezMeten) { this.demewezMeten = demewezMeten; }

    public LocalDate getEmployeedFrom() { return employeedFrom; }
    public void setEmployeedFrom(LocalDate employeedFrom) { this.employeedFrom = employeedFrom; }

    public LocalDate getEmployeedTo() { return employeedTo; }
    public void setEmployeedTo(LocalDate employeedTo) { this.employeedTo = employeedTo; }

    public String getReasonForLeaving() { return reasonForLeaving; }
    public void setReasonForLeaving(String reasonForLeaving) { this.reasonForLeaving = reasonForLeaving; }

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
