// ChangePasswordRequest.java

package com.wbill.home.payload.request;

import jakarta.validation.constraints.NotBlank;

public class ChangePasswordRequest {

     

    @NotBlank
    private String newPassword;

    // Getters and setters

   
    public String getNewPassword() {
        return newPassword;
    }

    public void setNewPassword(String newPassword) {
        this.newPassword = newPassword;
    }
}
