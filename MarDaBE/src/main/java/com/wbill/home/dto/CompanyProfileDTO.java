package com.wbill.home.dto;

import lombok.Data;

@Data
public class CompanyProfileDTO {
    private boolean autoGiveAccountNumber;
    // Add other settings as needed

    public CompanyProfileDTO(boolean autoGiveAccountNumber) {
		super();
		this.autoGiveAccountNumber = autoGiveAccountNumber;
	}
    
   
	public CompanyProfileDTO() {
		super();
	}

	public boolean isAutoGiveAccountNumber() {
		return autoGiveAccountNumber;
	}

	

	public void setAutoGiveAccountNumber(boolean autoGiveAccountNumber) {
		this.autoGiveAccountNumber = autoGiveAccountNumber;
	}
}
