package com.wbill.home.dto;



import java.util.Date;

import com.wbill.home.model.UserAccount;

public class MeterCreateUpdateDTO {
 private Integer id;
 private String meterNumber;
 private Boolean activeMeter;
 private Integer billingMeterTypeId;
 private String billingMeterTypeName;
 private Integer meterSizeId;
 private String meterSizeName;
 private Integer initialReading;
 private Integer maxReference;
 private Date registeredDate;
 private String deleted;
 private UserAccount userAccount;

public MeterCreateUpdateDTO(Integer id, String meterNumber, Boolean activeMeter, Integer billingMeterTypeId,
		String billingMeterTypeName, Integer meterSizeId, String meterSizeName, Integer initialReading,
		Integer maxReference, Date registeredDate ,String deleted, UserAccount userAccount) {
	super();
	this.id = id;
	this.meterNumber = meterNumber;
	this.activeMeter = activeMeter;
	this.billingMeterTypeId = billingMeterTypeId;
	this.billingMeterTypeName = billingMeterTypeName;
	this.meterSizeId = meterSizeId;
	this.meterSizeName = meterSizeName;
	this.initialReading = initialReading;
	this.maxReference = maxReference;
	this.registeredDate = registeredDate;	
	this.deleted=deleted;
	this.userAccount=userAccount;
}
public String getDeleted() {
	return deleted;
}
public void setDeleted(String deleted) {
	this.deleted = deleted;
}

public UserAccount getUserAccount() {
	return userAccount;
}
public void setUserAccount(UserAccount userAccount) {
	this.userAccount = userAccount;
}
public MeterCreateUpdateDTO() {
	super();
}
public Integer getId() {
	return id;
}
public void setId(Integer id) {
	this.id = id;
}
public String getMeterNumber() {
	return meterNumber;
}
public void setMeterNumber(String meterNumber) {
	this.meterNumber = meterNumber;
}
public Boolean getActiveMeter() {
	return activeMeter;
}
public void setActiveMeter(Boolean activeMeter) {
	this.activeMeter = activeMeter;
}
public Integer getBillingMeterTypeId() {
	return billingMeterTypeId;
}
public void setBillingMeterTypeId(Integer billingMeterTypeId) {
	this.billingMeterTypeId = billingMeterTypeId;
}
public String getBillingMeterTypeName() {
	return billingMeterTypeName;
}
public void setBillingMeterTypeName(String billingMeterTypeName) {
	this.billingMeterTypeName = billingMeterTypeName;
}
public Integer getMeterSizeId() {
	return meterSizeId;
}
public void setMeterSizeId(Integer meterSizeId) {
	this.meterSizeId = meterSizeId;
}
public String getMeterSizeName() {
	return meterSizeName;
}
public void setMeterSizeName(String meterSizeName) {
	this.meterSizeName = meterSizeName;
}
public Integer getInitialReading() {
	return initialReading;
}
public void setInitialReading(Integer initialReading) {
	this.initialReading = initialReading;
}
public Integer getMaxReference() {
	return maxReference;
}
public void setMaxReference(Integer maxReference) {
	this.maxReference = maxReference;
}
public Date getRegisteredDate() {
	return registeredDate;
}
public void setRegisteredDate(Date registeredDate) {
	this.registeredDate = registeredDate;
}

 // getters/setters
}
