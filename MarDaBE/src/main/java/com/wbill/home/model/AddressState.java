package com.wbill.home.model;

import java.io.Serializable;
import java.util.Date;
import jakarta.persistence.*;

@Entity
@Table(name="address_state")
@NamedQuery(name="AddressState.findAll", query="SELECT a FROM AddressState a")
public class AddressState implements Serializable {
	private static final long serialVersionUID = 1L;

	@Id
	@GeneratedValue(strategy=GenerationType.IDENTITY)
	private int id;

	//bi-directional many-to-one association to AddressCountry
	@ManyToOne
	@JoinColumn(name="country_id", nullable=false)
	private AddressCountry addressCountry; // Assuming 'AddressCountry' is the entity for the 'address_country' table

	@Column(name="state_code", nullable=false, length=50, unique=true)
	private String stateCode;

	@Column(name="state_name", nullable=false, length=100, unique=true)
	private String stateName;

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

	public AddressState() {
	}

	// Getters and Setters (you can generate these in your IDE)

	public int getId() {
		return this.id;
	}

	public void setId(int id) {
		this.id = id;
	}

	public AddressCountry getAddressCountry() {
		return this.addressCountry;
	}

	public void setAddressCountry(AddressCountry addressCountry) {
		this.addressCountry = addressCountry;
	}

	public String getStateCode() {
		return this.stateCode;
	}

	public void setStateCode(String stateCode) {
		this.stateCode = stateCode;
	}

	public String getStateName() {
		return this.stateName;
	}

	public void setStateName(String stateName) {
		this.stateName = stateName;
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
