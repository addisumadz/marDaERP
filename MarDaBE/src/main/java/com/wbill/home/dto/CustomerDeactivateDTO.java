package com.wbill.home.dto;


import lombok.Data;

@Data
public class CustomerDeactivateDTO {
    private String status;
    private Integer billingTerminationReasonId;
    private String terminationRemark;
    
    
	public CustomerDeactivateDTO(String status, Integer billingTerminationReasonId, String terminationRemark) {
		super();
		this.status = status;
		this.billingTerminationReasonId = billingTerminationReasonId;
		this.terminationRemark = terminationRemark;
	}
	@Override
	public String toString() {
		return "CustomerDeactivateDTO [status=" + status + ", billingTerminationReasonId=" + billingTerminationReasonId
				+ ", terminationRemark=" + terminationRemark + "]";
	}
	public String getStatus() {
		return status;
	}
	public void setStatus(String status) {
		this.status = status;
	}
	public Integer getBillingTerminationReasonId() {
		return billingTerminationReasonId;
	}
	public void setBillingTerminationReasonId(Integer billingTerminationReasonId) {
		this.billingTerminationReasonId = billingTerminationReasonId;
	}
	public String getTerminationRemark() {
		return terminationRemark;
	}
	public void setTerminationRemark(String terminationRemark) {
		this.terminationRemark = terminationRemark;
	}
    
    
}