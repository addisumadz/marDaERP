package com.wbill.home.model;

import java.io.Serializable;
import jakarta.persistence.*;

@Entity
@Table(name="billing_meter_size")
@NamedQuery(name="BillingMeterSize.findAll", query="SELECT b FROM BillingMeterSize b")
public class BillingMeterSize implements Serializable {
	private static final long serialVersionUID = 1L;

	@Id
	@GeneratedValue(strategy=GenerationType.IDENTITY)
	private int id;

	@Column(name="meter_size", nullable=false)
	private double meterSize;

	@Column(name="meter_code", nullable=false, length=100)
	private String meterCode;

	@Column(name="deleted", nullable=false, length=20)
	private String deleted;

	public BillingMeterSize() {
	}

	// Getters and Setters (you can generate these in your IDE)

	public int getId() {
		return this.id;
	}

	public void setId(int id) {
		this.id = id;
	}

	public double getMeterSize() {
		return this.meterSize;
	}

	public void setMeterSize(double meterSize) {
		this.meterSize = meterSize;
	}

	public String getMeterCode() {
		return this.meterCode;
	}

	public void setMeterCode(String meterCode) {
		this.meterCode = meterCode;
	}

	public String getDeleted() {
		return this.deleted;
	}

	public void setDeleted(String deleted) {
		this.deleted = deleted;
	}
}
