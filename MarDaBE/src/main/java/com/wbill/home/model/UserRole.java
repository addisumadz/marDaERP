package com.wbill.home.model;

import java.io.Serializable;
import jakarta.persistence.*;

@Entity
@Table(name="user_role")
@NamedQuery(name="UserRole.findAll", query="SELECT u FROM UserRole u")
public class UserRole implements Serializable {
	private static final long serialVersionUID = 1L;

	@Id
	@GeneratedValue(strategy=GenerationType.IDENTITY)
	private int id;

	@Column(name="role_code", nullable=false, length=20)
	private String roleCode;

	@Column(name="role_name", nullable=false, length=100)
	private String roleName;

	@Column(name="is_medical", nullable=false)
	private boolean isMedical;

	@Column(name="is_store", nullable=false)
	private boolean isStore;

	@Column(name="is_forman_expert", nullable=false)
	private boolean isFormanExpert;

	@Column(name="is_water_meter_reader", nullable=false)
	private boolean isWaterMeterReader;

	@Column(name="status", nullable=false, length=20)
	private String status;

	@Column(name="deleted", nullable=false, length=20)
	private String deleted;

	public UserRole() {
	}

	// Getters and Setters (you can generate these in your IDE)

	public int getId() {
		return this.id;
	}

	public void setId(int id) {
		this.id = id;
	}

	public String getRoleCode() {
		return this.roleCode;
	}

	public void setRoleCode(String roleCode) {
		this.roleCode = roleCode;
	}

	public String getRoleName() {
		return this.roleName;
	}

	public void setRoleName(String roleName) {
		this.roleName = roleName;
	}

	public boolean getIsMedical() {
		return this.isMedical;
	}

	public void setIsMedical(boolean isMedical) {
		this.isMedical = isMedical;
	}

	public boolean getIsStore() {
		return this.isStore;
	}

	public void setIsStore(boolean isStore) {
		this.isStore = isStore;
	}

	public boolean getIsFormanExpert() {
		return this.isFormanExpert;
	}

	public void setIsFormanExpert(boolean isFormanExpert) {
		this.isFormanExpert = isFormanExpert;
	}

	public boolean getIsWaterMeterReader() {
		return this.isWaterMeterReader;
	}

	public void setIsWaterMeterReader(boolean isWaterMeterReader) {
		this.isWaterMeterReader = isWaterMeterReader;
	}

	public String getStatus() {
		return this.status;
	}

	public void setStatus(String status) {
		this.status = status;
	}

	public String getDeleted() {
		return this.deleted;
	}

	public void setDeleted(String deleted) {
		this.deleted = deleted;
	}
}
