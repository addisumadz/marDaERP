package com.wbill.home.model;

import java.io.Serializable;

import jakarta.persistence.*;

@Entity
@Table(name = "user_records")
@NamedQuery(name = "UserRecord.findAll", query = "SELECT u FROM UserRecord u")
public class UserRecord implements Serializable {

    private static final long serialVersionUID = 1L;

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private int id;

    @Column(name = "page_code", nullable = false, length = 150)
    private String pageCode;

    @Column(name = "page_name", nullable = false, length = 150)
    private String pageName;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_role_id")
    private UserRole userRole;

    @Column(name = "permission_create", nullable = false)
    private boolean permissionCreate;

    @Column(name = "permission_edit", nullable = false)
    private boolean permissionEdit;

    @Column(name = "permission_delete", nullable = false)
    private boolean permissionDelete;

    @Column(name = "permission_approve", nullable = false)
    private boolean permissionApprove;

    @Column(name = "permission_needs_approval", nullable = false)
    private boolean permissionNeedsApproval;

    @Column(name = "permission_kdmekfya", nullable = false)
    private boolean permissionKdmekfya;

    @Column(name = "deleted", nullable = false, length = 20)
    private String deleted;

    public UserRecord() {
    }

    public int getId() {
        return id;
    }

    public void setId(int id) {
        this.id = id;
    }

    public String getPageCode() {
        return pageCode;
    }

    public void setPageCode(String pageCode) {
        this.pageCode = pageCode;
    }

    public String getPageName() {
        return pageName;
    }

    public void setPageName(String pageName) {
        this.pageName = pageName;
    }

    public UserRole getUserRole() {
        return userRole;
    }

    public void setUserRole(UserRole userRole) {
        this.userRole = userRole;
    }

    public boolean isPermissionCreate() {
        return permissionCreate;
    }

    public void setPermissionCreate(boolean permissionCreate) {
        this.permissionCreate = permissionCreate;
    }

    public boolean isPermissionEdit() {
        return permissionEdit;
    }

    public void setPermissionEdit(boolean permissionEdit) {
        this.permissionEdit = permissionEdit;
    }

    public boolean isPermissionDelete() {
        return permissionDelete;
    }

    public void setPermissionDelete(boolean permissionDelete) {
        this.permissionDelete = permissionDelete;
    }

    public boolean isPermissionApprove() {
        return permissionApprove;
    }

    public void setPermissionApprove(boolean permissionApprove) {
        this.permissionApprove = permissionApprove;
    }

    public boolean isPermissionNeedsApproval() {
        return permissionNeedsApproval;
    }

    public void setPermissionNeedsApproval(boolean permissionNeedsApproval) {
        this.permissionNeedsApproval = permissionNeedsApproval;
    }

    public boolean isPermissionKdmekfya() {
        return permissionKdmekfya;
    }

    public void setPermissionKdmekfya(boolean permissionKdmekfya) {
        this.permissionKdmekfya = permissionKdmekfya;
    }

    public String getDeleted() {
        return deleted;
    }

    public void setDeleted(String deleted) {
        this.deleted = deleted;
    }
}
