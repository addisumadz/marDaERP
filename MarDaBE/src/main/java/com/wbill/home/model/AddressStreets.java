package com.wbill.home.model;

import java.io.Serializable;
import java.util.Date;
import jakarta.persistence.*;
import com.fasterxml.jackson.annotation.JsonManagedReference;

@Entity
@Table(name = "address_streets")
@NamedQuery(name = "AddressStreets.findAll", query = "SELECT a FROM AddressStreets a")
public class AddressStreets implements Serializable {
	private static final long serialVersionUID = 1L;

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private int id;

	@Column(name = "address_streets_number", nullable = false)
	private int addressStreetsNumber;

	@ManyToOne
	@JoinColumn(name = "city_id", nullable = false)
	private AddressCity addressCity; // Assuming 'AddressCity' is the entity for the 'address_city' table

	@Column(name = "streets_code", nullable = false, length = 20, unique = true)
	private String streetsCode;

	@Column(name = "streets_name", nullable = false, length = 150)
	private String streetsName;

	@Column(name = "population_size", nullable = false)
	private int populationSize;

	@Column(name = "status", nullable = false, length = 20)
	private String status;

	@Column(name = "deleted", nullable = false, length = 20)
	private String deleted;

	@Temporal(TemporalType.TIMESTAMP)
	@Column(name = "registered_date", nullable = false)
	private Date registeredDate;

	// bi-directional many-to-one association to UserAccount (registered by)
	@ManyToOne
	@JoinColumn(name = "registered_by", nullable = false)
	private UserAccount registeredBy;

	@Temporal(TemporalType.TIMESTAMP)
	@Column(name = "modified_date", nullable = false)
	private Date modifiedDate;

	// bi-directional many-to-one association to UserAccount (modified by)
	@ManyToOne
	@JoinColumn(name = "modified_by", nullable = false)
	private UserAccount modifiedBy;

	public AddressStreets() {
	}

	// Getters and Setters (you can generate these in your IDE)

	public int getId() {
		return this.id;
	}

	public void setId(int id) {
		this.id = id;
	}

	public int getAddressStreetsNumber() {
		return this.addressStreetsNumber;
	}

	public void setAddressStreetsNumber(int addressStreetsNumber) {
		this.addressStreetsNumber = addressStreetsNumber;
	}

	public AddressCity getAddressCity() {
		return this.addressCity;
	}

	public void setAddressCity(AddressCity addressCity) {
		this.addressCity = addressCity;
	}

	public String getStreetsCode() {
		return this.streetsCode;
	}

	public void setStreetsCode(String streetsCode) {
		this.streetsCode = streetsCode;
	}

	public String getStreetsName() {
		return this.streetsName;
	}

	public void setStreetsName(String streetsName) {
		this.streetsName = streetsName;
	}

	public int getPopulationSize() {
		return this.populationSize;
	}

	public void setPopulationSize(int populationSize) {
		this.populationSize = populationSize;
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
