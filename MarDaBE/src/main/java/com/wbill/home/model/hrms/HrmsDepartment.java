package com.wbill.home.model.hrms;

import java.io.Serializable;
import java.time.LocalDateTime;
import java.util.List;
import jakarta.persistence.*;
import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

@Entity
@Table(name = "hrms_departments")
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class HrmsDepartment implements Serializable {
    private static final long serialVersionUID = 1L;

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private int id;

    @Column(name = "department_code", nullable = false, unique = true, length = 50)
    private String departmentCode;

    @Column(name = "department_name", nullable = false, length = 150)
    private String departmentName;

    @Column(name = "department_name_am", length = 200)
    private String departmentNameAm;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "parent_department_id")
    @JsonIgnoreProperties({"parentDepartment", "subDepartments", "positions", "hibernateLazyInitializer", "handler"})
    private HrmsDepartment parentDepartment;

    @JsonIgnore
    @OneToMany(mappedBy = "parentDepartment", fetch = FetchType.LAZY)
    private List<HrmsDepartment> subDepartments;

    @Column(name = "manager_employee_id")
    private Integer managerEmployeeId;

    @Column(name = "cost_center_code", length = 50)
    private String costCenterCode;

    @Column(name = "is_active", nullable = false)
    private boolean active = true;

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    @Column(name = "updated_at")
    private LocalDateTime updatedAt = LocalDateTime.now();

    public HrmsDepartment() {}

    // Getters and Setters
    public int getId() { return id; }
    public void setId(int id) { this.id = id; }

    public String getDepartmentCode() { return departmentCode; }
    public void setDepartmentCode(String departmentCode) { this.departmentCode = departmentCode; }

    public String getDepartmentName() { return departmentName; }
    public void setDepartmentName(String departmentName) { this.departmentName = departmentName; }

    public String getDepartmentNameAm() { return departmentNameAm; }
    public void setDepartmentNameAm(String departmentNameAm) { this.departmentNameAm = departmentNameAm; }

    public HrmsDepartment getParentDepartment() { return parentDepartment; }
    public void setParentDepartment(HrmsDepartment parentDepartment) { this.parentDepartment = parentDepartment; }

    public List<HrmsDepartment> getSubDepartments() { return subDepartments; }
    public void setSubDepartments(List<HrmsDepartment> subDepartments) { this.subDepartments = subDepartments; }

    public Integer getManagerEmployeeId() { return managerEmployeeId; }
    public void setManagerEmployeeId(Integer managerEmployeeId) { this.managerEmployeeId = managerEmployeeId; }

    public String getCostCenterCode() { return costCenterCode; }
    public void setCostCenterCode(String costCenterCode) { this.costCenterCode = costCenterCode; }

    public boolean isActive() { return active; }
    public void setActive(boolean active) { this.active = active; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
}
