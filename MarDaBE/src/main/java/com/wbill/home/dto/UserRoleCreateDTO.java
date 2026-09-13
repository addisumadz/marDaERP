package com.wbill.home.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public class UserRoleCreateDTO {
    @NotBlank
    @Size(max = 20)
    private String roleCode;

    @NotBlank
    @Size(max = 100)
    private String roleName;

    // Booleans come as tinyint(1) in DB; map as boolean in Java
    // Force isMedical to false in service regardless of value passed
    @JsonProperty("isMedical")
    private boolean isMedical;

    @JsonProperty("isStore")
    private boolean isStore;

    @JsonProperty("isFormanExpert")
    private boolean isFormanExpert;

    @JsonProperty("isWaterMeterReader")
    private boolean isWaterMeterReader;

    public String getRoleCode() { return roleCode; }
    public void setRoleCode(String roleCode) { this.roleCode = roleCode; }
    public String getRoleName() { return roleName; }
    public void setRoleName(String roleName) { this.roleName = roleName; }
    public boolean getIsMedical() { return isMedical; }
    public void setIsMedical(boolean isMedical) { this.isMedical = isMedical; }
    public boolean getIsStore() { return isStore; }
    public void setIsStore(boolean isStore) { this.isStore = isStore; }
    public boolean getIsFormanExpert() { return isFormanExpert; }
    public void setIsFormanExpert(boolean isFormanExpert) { this.isFormanExpert = isFormanExpert; }
    public boolean getIsWaterMeterReader() { return isWaterMeterReader; }
    public void setIsWaterMeterReader(boolean isWaterMeterReader) { this.isWaterMeterReader = isWaterMeterReader; }
}
