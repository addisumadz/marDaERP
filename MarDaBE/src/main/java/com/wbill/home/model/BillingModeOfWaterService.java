package com.wbill.home.model;

import java.io.Serializable;
import jakarta.persistence.*;

@Entity
@Table(name="billing_mode_of_water_service")
@NamedQuery(name="BillingModeOfWaterService.findAll", query="SELECT b FROM BillingModeOfWaterService b")
public class BillingModeOfWaterService implements Serializable {
	private static final long serialVersionUID = 1L;

	@Id
	@GeneratedValue(strategy=GenerationType.IDENTITY)
	private int id;

	@Column(name="mode_code", nullable=false, length=50)
	private String modeCode;

	@Column(name="mode_name", nullable=false, length=200)
	private String modeName;

	@Column(name="deleted", nullable=false, length=20)
	private String deleted;

	public BillingModeOfWaterService() {
	}

	// Getters and Setters (you can generate these in your IDE)

	public int getId() {
		return this.id;
	}

	public void setId(int id) {
		this.id = id;
	}

	public String getModeCode() {
		return this.modeCode;
	}

	public void setModeCode(String modeCode) {
		this.modeCode = modeCode;
	}

	public String getModeName() {
		return this.modeName;
	}

	public void setModeName(String modeName) {
		this.modeName = modeName;
	}

	public String getDeleted() {
		return this.deleted;
	}

	public void setDeleted(String deleted) {
		this.deleted = deleted;
	}
}
