package com.wbill.home.dto;

public class RolePagePermissionDTO {

    private Integer userRecordId;
    private Integer roleId;
    private String roleCode;
    private String roleName;
    private String pageCode;
    private String pageName;
    private boolean permissionCreate;
    private boolean permissionEdit;
    private boolean permissionDelete;
    private boolean permissionApprove;
    private boolean permissionNeedsApproval;
    private boolean permissionKdmekfya;

    public Integer getUserRecordId() {
        return userRecordId;
    }

    public void setUserRecordId(Integer userRecordId) {
        this.userRecordId = userRecordId;
    }

    public Integer getRoleId() {
        return roleId;
    }

    public void setRoleId(Integer roleId) {
        this.roleId = roleId;
    }

    public String getRoleCode() {
        return roleCode;
    }

    public void setRoleCode(String roleCode) {
        this.roleCode = roleCode;
    }

    public String getRoleName() {
        return roleName;
    }

    public void setRoleName(String roleName) {
        this.roleName = roleName;
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
}
