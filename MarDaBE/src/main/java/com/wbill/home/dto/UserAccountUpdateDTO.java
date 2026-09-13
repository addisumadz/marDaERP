package com.wbill.home.dto;

public class UserAccountUpdateDTO {
    public String firstName;
    public String midleName;
    public String lastName;
    public String sex;
    public Integer branchId;
    public Integer roleId;
    public String status;   // active | deleted
    public String deleted;  // active | deleted (soft delete flag)
}
