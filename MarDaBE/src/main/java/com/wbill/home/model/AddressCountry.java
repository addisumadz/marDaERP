package com.wbill.home.model;

import java.io.Serializable;
import java.util.Date;
import jakarta.persistence.*;

@Entity
@Table(name="address_country")
@NamedQuery(name="AddressCountry.findAll", query="SELECT a FROM AddressCountry a")
public class AddressCountry implements Serializable {
	private static final long serialVersionUID = 1L;

	@Id
	@GeneratedValue(strategy=GenerationType.IDENTITY)
	private int id;

	@Column(name="country_code", nullable=false, length=50, unique=true)
	private String countryCode;

	@Column(name="country_name", nullable=false, length=150, unique=true)
	private String countryName;

	@Column(name="continent", nullable=false, length=100)
	private String continent;

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

	public AddressCountry() {
	}

	// Getters and Setters (you can generate these in your IDE)

	public int getId() {
		return this.id;
	}

	public void setId(int id) {
		this.id = id;
	}

	public String getCountryCode() {
		return this.countryCode;
	}

	public void setCountryCode(String countryCode) {
		this.countryCode = countryCode;
	}

	public String getCountryName() {
		return this.countryName;
	}

	public void setCountryName(String countryName) {
		this.countryName = countryName;
	}

	public String getContinent() {
		return this.continent;
	}

	public void setContinent(String continent) {
		this.continent = continent;
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
