package com.wbill.home.model.hrms;

import java.io.Serializable;
import jakarta.persistence.*;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

@Entity
@Table(name = "hrms_leave_types")
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class HrmsLeaveType implements Serializable {
    private static final long serialVersionUID = 1L;

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private int id;

    @Column(name = "type_code", nullable = false, unique = true, length = 50)
    private String typeCode; // ANNUAL, MATERNITY, PATERNITY, SICK, BEREAVEMENT, WEDDING, SPECIAL

    @Column(name = "type_name", nullable = false, length = 100)
    private String typeName;

    @Column(name = "type_name_am", nullable = false, length = 150)
    private String typeNameAm;

    @Column(name = "default_days", nullable = false)
    private int defaultDays = 16;

    @Column(name = "is_service_accrued", nullable = false)
    private boolean serviceAccrued = false; // +1 day per 2 years (Proclamation 1156/2019)

    @Column(name = "is_paid", nullable = false)
    private boolean paid = true;

    @Column(name = "requires_attachment", nullable = false)
    private boolean requiresAttachment = false;

    @Column(name = "gender_restriction", length = 10)
    private String genderRestriction = "ALL"; // ALL, MALE, FEMALE

    @Column(name = "is_active", nullable = false)
    private boolean active = true;

    public HrmsLeaveType() {}

    // Getters and Setters
    public int getId() { return id; }
    public void setId(int id) { this.id = id; }

    public String getTypeCode() { return typeCode; }
    public void setTypeCode(String typeCode) { this.typeCode = typeCode; }

    public String getTypeName() { return typeName; }
    public void setTypeName(String typeName) { this.typeName = typeName; }

    public String getTypeNameAm() { return typeNameAm; }
    public void setTypeNameAm(String typeNameAm) { this.typeNameAm = typeNameAm; }

    public int getDefaultDays() { return defaultDays; }
    public void setDefaultDays(int defaultDays) { this.defaultDays = defaultDays; }

    public boolean isServiceAccrued() { return serviceAccrued; }
    public void setServiceAccrued(boolean serviceAccrued) { this.serviceAccrued = serviceAccrued; }

    public boolean isPaid() { return paid; }
    public void setPaid(boolean paid) { this.paid = paid; }

    public boolean isRequiresAttachment() { return requiresAttachment; }
    public void setRequiresAttachment(boolean requiresAttachment) { this.requiresAttachment = requiresAttachment; }

    public String getGenderRestriction() { return genderRestriction; }
    public void setGenderRestriction(String genderRestriction) { this.genderRestriction = genderRestriction; }

    public boolean isActive() { return active; }
    public void setActive(boolean active) { this.active = active; }
}
