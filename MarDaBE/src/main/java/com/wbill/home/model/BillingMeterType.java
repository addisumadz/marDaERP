package com.wbill.home.model;

import java.io.Serializable;
import jakarta.persistence.*;

@Entity
@Table(name="billing_meter_type")
@NamedQuery(name="BillingMeterType.findAll", query="SELECT b FROM BillingMeterType b")
public class BillingMeterType implements Serializable {
	private static final long serialVersionUID = 1L;

	@Id
	@GeneratedValue(strategy=GenerationType.IDENTITY)
	private int id;

	@Column(name="meter_type_code", nullable=false, length=20)
	private String meterTypeCode;

	@Column(name="meter_type_name", nullable=false, length=100)
	private String meterTypeName;

	@Column(name="deleted", nullable=false, length=20)
	private String deleted;

	public BillingMeterType() {
	}

	// Getters and Setters (you can generate these in your IDE)

	public int getId() {
		return this.id;
	}

	public void setId(int id) {
		this.id = id;
	}

	public String getMeterTypeCode() {
		return this.meterTypeCode;
	}

	public void setMeterTypeCode(String meterTypeCode) {
		this.meterTypeCode = meterTypeCode;
	}

	public String getMeterTypeName() {
		return this.meterTypeName;
	}

	public void setMeterTypeName(String meterTypeName) {
		this.meterTypeName = meterTypeName;
	}

	public String getDeleted() {
		return this.deleted;
	}

	public void setDeleted(String deleted) {
		this.deleted = deleted;
	}
}
