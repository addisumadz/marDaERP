package com.wbill.home.model;

import java.io.Serializable;
import jakarta.persistence.*;

@Entity
@Table(name="address_ketena")
@NamedQuery(name="AddressKetena.findAll", query="SELECT a FROM AddressKetena a")
public class AddressKetena implements Serializable {
	private static final long serialVersionUID = 1L;

	@Id
	@GeneratedValue(strategy=GenerationType.IDENTITY)
	private int id;

	//bi-directional many-to-one association to AddressStreets
	@ManyToOne
	@JoinColumn(name="address_streets_id", nullable=false)
	private AddressStreets addressStreets; // Assuming 'AddressStreets' is the entity for the 'address_streets' table

	@Column(name="ketena_code", nullable=false, length=20)
	private String ketenaCode;

	@Column(name="ketena_name", nullable=false, length=150)
	private String ketenaName;

	@Column(name="population_size", nullable=false)
	private int populationSize;
	

	@Column(name="deleted", nullable=false, length=20)
	private String deleted;

	public AddressKetena() {
	}

	// Getters and Setters (you can generate these in your IDE)

	public int getId() {
		return this.id;
	}

	public void setId(int id) {
		this.id = id;
	}

	public AddressStreets getAddressStreets() {
		return this.addressStreets;
	}

	public void setAddressStreets(AddressStreets addressStreets) {
		this.addressStreets = addressStreets;
	}

	public String getKetenaCode() {
		return this.ketenaCode;
	}

	public void setKetenaCode(String ketenaCode) {
		this.ketenaCode = ketenaCode;
	}

	public String getKetenaName() {
		return this.ketenaName;
	}

	public void setKetenaName(String ketenaName) {
		this.ketenaName = ketenaName;
	}

	public int getPopulationSize() {
		return this.populationSize;
	}

	public void setPopulationSize(int populationSize) {
		this.populationSize = populationSize;
	}


	public String getDeleted() {
		return this.deleted;
	}

	public void setDeleted(String deleted) {
		this.deleted = deleted;
	}
}
