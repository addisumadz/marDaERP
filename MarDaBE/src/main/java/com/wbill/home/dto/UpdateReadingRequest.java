package com.wbill.home.dto;

import lombok.Data;

@Data
public class UpdateReadingRequest {
    private Integer id;
    private String status;
    private Integer previousReading;
    private Integer currentReading;
	public Integer getId() {
		return id;
	}
	public void setId(Integer id) {
		this.id = id;
	}
	public String getStatus() {
		return status;
	}
	public void setStatus(String status) {
		this.status = status;
	}
	public Integer getPreviousReading() {
		return previousReading;
	}
	public void setPreviousReading(Integer previousReading) {
		this.previousReading = previousReading;
	}
	public Integer getCurrentReading() {
		return currentReading;
	}
	public void setCurrentReading(Integer currentReading) {
		this.currentReading = currentReading;
	}
    
}
