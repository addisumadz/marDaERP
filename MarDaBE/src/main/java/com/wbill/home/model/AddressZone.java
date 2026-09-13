package com.wbill.home.model;

import java.io.Serializable;
import java.util.Date;
import jakarta.persistence.*;

@Entity
@Table(name="address_zone")
@NamedQuery(name="AddressZone.findAll", query="SELECT a FROM AddressZone a")
public class AddressZone implements Serializable {
	private static final long serialVersionUID = 1L;

	@Id
	@GeneratedValue(strategy=GenerationType.IDENTITY)
	private int id;

	//bi-directional many-to-one association to AddressState
	@ManyToOne
	@JoinColumn(name="address_state_id", nullable=false)
	private AddressState addressState; // Assuming 'AddressState' is the entity for the 'address_state' table

	@Column(name="zone_code", nullable=false, length=50, unique=true)
	private String zoneCode;

	@Column(name="zone_name", nullable=false, length=100, unique=true)
	private String zoneName;

	@Column(name="status", nullable=false, length=20)
	private String status;

	@Column(name="deleted", nullable=false, length=20)
	private String deleted;

	@Temporal(TemporalType.TIMESTAMP)
	@Column(name="registered_date", nullable=false)
	private Date registeredDate;

	//bi-directional many-to-one association to UserAccount (registered by)
	@ManyToOne
	@JoinColumn(name="registered_by", nullable=false)
	private UserAccount registeredBy;

	@Temporal(TemporalType.TIMESTAMP)
	@Column(name="modified_date", nullable=false)
	private Date modifiedDate;

	//bi-directional many-to-one association to UserAccount (modified by)
	@ManyToOne
	@JoinColumn(name="modified_by", nullable=false)
	private UserAccount modifiedBy;

	public AddressZone() {
	}

	// Getters and Setters (you can generate these in your IDE)

	public int getId() {
		return this.id;
	}

	public void setId(int id) {
		this.id = id;
	}

	public AddressState getAddressState() {
		return this.addressState;
	}

	public void setAddressState(AddressState addressState) {
		this.addressState = addressState;
	}

	public String getZoneCode() {
		return this.zoneCode;
	}

	public void setZoneCode(String zoneCode) {
		this.zoneCode = zoneCode;
	}

	public String getZoneName() {
		return this.zoneName;
	}

	public void setZoneName(String zoneName) {
		this.zoneName = zoneName;
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

	public Date getRegisteredDate() {
		return this.registeredDate;
	}

	public void setRegisteredDate(Date registeredDate) {
		this.registeredDate = registeredDate;
	}

	public UserAccount getRegisteredBy() {
		return this.registeredBy;
	}

	public void setRegisteredBy(UserAccount registeredBy) {
		this.registeredBy = registeredBy;
	}

	public Date getModifiedDate() {
		return this.modifiedDate;
	}

	public void setModifiedDate(Date modifiedDate) {
		this.modifiedDate = modifiedDate;
	}

	public UserAccount getModifiedBy() {
		return this.modifiedBy;
	}

	public void setModifiedBy(UserAccount modifiedBy) {
		this.modifiedBy = modifiedBy;
	}
}
