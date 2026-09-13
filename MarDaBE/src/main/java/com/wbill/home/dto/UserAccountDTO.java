package com.wbill.home.dto;

import java.util.Date;

import com.wbill.home.model.UserAccount;

public class UserAccountDTO {
  public int id;
  public String userName;
  public String firstName;
  public String midleName;
  public String lastName;
  public String fullName;
  public String sex;
  public Integer branchId;
  public String branchName;
  public Integer roleId;
  public String roleName;
  public String status;
  public String deleted;
  public Date registeredDate;
  public Date modifiedDate;
  public String previousMonthCsvFileName;

  public static UserAccountDTO from(UserAccount u) {
    UserAccountDTO dto = new UserAccountDTO();
    dto.id = u.getId();
    dto.userName = u.getUserName();
    dto.firstName = u.getFirstName();
    dto.midleName = u.getMidleName();
    dto.lastName = u.getLastName();
    dto.fullName = String.join(" ",
      dto.firstName != null ? dto.firstName : "",
      dto.midleName != null ? dto.midleName : "",
      dto.lastName != null ? dto.lastName : ""
    ).trim().replaceAll("\\s+", " ");
    dto.sex = u.getSex();
    dto.branchId = u.getBranch() != null ? u.getBranch().getId() : null;
    dto.branchName = u.getBranch() != null ? u.getBranch().getBranchDescription() : null;
    dto.roleId = u.getUserRole() != null ? u.getUserRole().getId() : null;
    dto.roleName = u.getUserRole() != null ? u.getUserRole().getRoleName() : null;
    dto.status = u.getStatus();
    dto.deleted = u.getDeleted();
    dto.registeredDate = u.getRegisteredDate();
    dto.modifiedDate = u.getModifiedDate();
    dto.previousMonthCsvFileName = u.getPreviousMonthCsvFileName();
    return dto;
  }
}

//DTO for the user account associated with the customer
//public class UserAccountDTO {
//private int id;
//private String fullName; // Assuming UserAccount has a 'fullName' field
//
// Getters and Setters
//public int getId() { return id; }
//public void setId(int id) { this.id = id; }
//public String getFullName() { return fullName; }
//public void setFullName(String fullName) { this.fullName = fullName; }
//}