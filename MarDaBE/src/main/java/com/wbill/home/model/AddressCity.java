package com.wbill.home.model;

import java.io.Serializable;
import java.util.Date;
import jakarta.persistence.*;

@Entity
@Table(name="address_city")
@NamedQuery(name="AddressCity.findAll", query="SELECT a FROM AddressCity a")
public class AddressCity implements Serializable {
	private static final long serialVersionUID = 1L;

	@Id
	@GeneratedValue(strategy=GenerationType.IDENTITY)
	private int id;

	//bi-directional many-to-one association to AddressZone
	@ManyToOne
	@JoinColumn(name="zone_id")
	private AddressZone addressZone; // Assuming 'AddressZone' is the entity for the 'address_zone' table

	@Column(name="city_code", nullable=false, length=50, unique=true)
	private String cityCode;

	@Column(name="city_name", nullable=false, length=150, unique=true)
	private String cityName;

	@Column(name="center_latitude", nullable=false)
	private double centerLatitude;

	@Column(name="center_longitude", nullable=false)
	private double centerLongitude;

	@Column(name="population_size", nullable=false)
	private int populationSize;

	@Column(name="public_tap_user", nullable=false)
	private int publicTapUser;

	@Column(name="average_house_hold_size", nullable=false)
	private int averageHouseHoldSize;

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

	public AddressCity() {
	}

	// Getters and Setters (you can generate these in your IDE)

	public int getId() {
		return this.id;
	}

	public void setId(int id) {
		this.id = id;
	}

	public AddressZone getAddressZone() {
		return this.addressZone;
	}

	public void setAddressZone(AddressZone addressZone) {
		this.addressZone = addressZone;
	}

	public String getCityCode() {
		return this.cityCode;
	}

	public void setCityCode(String cityCode) {
		this.cityCode = cityCode;
	}

	public String getCityName() {
		return this.cityName;
	}

	public void setCityName(String cityName) {
		this.cityName = cityName;
	}

	public double getCenterLatitude() {
		return this.centerLatitude;
	}

	public void setCenterLatitude(double centerLatitude) {
		this.centerLatitude = centerLatitude;
	}

	public double getCenterLongitude() {
		return this.centerLongitude;
	}

	public void setCenterLongitude(double centerLongitude) {
		this.centerLongitude = centerLongitude;
	}

	public int getPopulationSize() {
		return this.populationSize;
	}

	public void setPopulationSize(int populationSize) {
		this.populationSize = populationSize;
	}

	public int getPublicTapUser() {
		return this.publicTapUser;
	}

	public void setPublicTapUser(int publicTapUser) {
		this.publicTapUser = publicTapUser;
	}

	public int getAverageHouseHoldSize() {
		return this.averageHouseHoldSize;
	}

	public void setAverageHouseHoldSize(int averageHouseHoldSize) {
		this.averageHouseHoldSize = averageHouseHoldSize;
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
