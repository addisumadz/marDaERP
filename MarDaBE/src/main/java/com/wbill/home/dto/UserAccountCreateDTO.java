package com.wbill.home.dto;

public class UserAccountCreateDTO {
    public String userName;
    public String password; // plain text to be encoded server-side
    public String firstName;
    public String midleName;
    public String lastName;
    public String sex;
    public Integer branchId;
    public Integer roleId;
}
