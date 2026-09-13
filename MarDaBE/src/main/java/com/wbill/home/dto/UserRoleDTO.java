package com.wbill.home.dto;

import com.fasterxml.jackson.annotation.JsonProperty;

public class UserRoleDTO {
    private Integer id;
    private String roleCode;
    private String roleName;
    @JsonProperty("isMedical")
    private boolean isMedical;
    @JsonProperty("isStore")
    private boolean isStore;
    @JsonProperty("isFormanExpert")
    private boolean isFormanExpert;
    @JsonProperty("isWaterMeterReader")
    private boolean isWaterMeterReader;
    private String status;
    private String deleted;

    public UserRoleDTO() {}

    public UserRoleDTO(Integer id, String roleCode, String roleName,
                       boolean isMedical, boolean isStore, boolean isFormanExpert,
                       boolean isWaterMeterReader, String status, String deleted) {
        this.id = id;
        this.roleCode = roleCode;
        this.roleName = roleName;
        this.isMedical = isMedical;
        this.isStore = isStore;
        this.isFormanExpert = isFormanExpert;
        this.isWaterMeterReader = isWaterMeterReader;
        this.status = status;
        this.deleted = deleted;
    }

    public Integer getId() { return id; }
    public void setId(Integer id) { this.id = id; }
    public String getRoleCode() { return roleCode; }
    public void setRoleCode(String roleCode) { this.roleCode = roleCode; }
    public String getRoleName() { return roleName; }
    public void setRoleName(String roleName) { this.roleName = roleName; }
    public boolean getIsMedical() { return isMedical; }
    public void setIsMedical(boolean medical) { isMedical = medical; }
    public boolean getIsStore() { return isStore; }
    public void setIsStore(boolean store) { isStore = store; }
    public boolean getIsFormanExpert() { return isFormanExpert; }
    public void setIsFormanExpert(boolean formanExpert) { isFormanExpert = formanExpert; }
    public boolean getIsWaterMeterReader() { return isWaterMeterReader; }
    public void setIsWaterMeterReader(boolean waterMeterReader) { isWaterMeterReader = waterMeterReader; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    public String getDeleted() { return deleted; }
    public void setDeleted(String deleted) { this.deleted = deleted; }
}
