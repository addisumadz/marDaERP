package com.wbill.home.model;

import java.io.Serializable;
import java.util.Date;
import jakarta.persistence.*;

@Entity
@Table(name="billing_customer_info_meter")
@NamedQuery(name="BillingCustomerInfoMeter.findAll", query="SELECT b FROM BillingCustomerInfoMeter b")
public class BillingCustomerInfoMeter implements Serializable {
	private static final long serialVersionUID = 1L;

	@Id
	@GeneratedValue(strategy=GenerationType.IDENTITY)
	private int id;

	//bi-directional many-to-one association to BillingCustomerInfo
	@ManyToOne
	@JoinColumn(name="billing_customer_info_id", nullable=false)
	private BillingCustomerInfo billingCustomerInfo;

	@Column(name="meter_number", nullable=false, length=50)
	private String meterNumber;

	@Column(name="active_meter", nullable=false)
	private boolean activeMeter;

	//bi-directional many-to-one association to BillingMeterType
	@ManyToOne
	@JoinColumn(name="billing_meter_type_id")
	private BillingMeterType billingMeterType;

	//bi-directional many-to-one association to BillingMeterSize
	@ManyToOne
	@JoinColumn(name="meter_size_id")
	private BillingMeterSize billingMeterSize;

	@Column(name="initial_reading", nullable=false)
	private int initialReading;

	@Column(name="max_reference", nullable=false)
	private int maxReference;

	@Temporal(TemporalType.DATE)
	@Column(name="meter_life_start")
	private Date meterLifeStart;

	@Temporal(TemporalType.DATE)
	@Column(name="meter_life_limit")
	private Date meterLifeLimit;

	@Temporal(TemporalType.TIMESTAMP)
	@Column(name="registered_date", nullable=false)
	private Date registeredDate;

	//bi-directional many-to-one association to UserAccount
	@ManyToOne
	@JoinColumn(name="registered_by")
	private UserAccount userAccount; // Assuming UserAccount is the entity for the 'user_account' table

	@Column(name="deleted", nullable=false, length=20)
	private String deleted;

	public BillingCustomerInfoMeter() {
	}

	// Getters and Setters (you can generate these in your IDE)

	public int getId() {
		return this.id;
	}

	public void setId(int id) {
		this.id = id;
	}

	public BillingCustomerInfo getBillingCustomerInfo() {
		return this.billingCustomerInfo;
	}

	public void setBillingCustomerInfo(BillingCustomerInfo billingCustomerInfo) {
		this.billingCustomerInfo = billingCustomerInfo;
	}

	public String getMeterNumber() {
		return this.meterNumber;
	}

	public void setMeterNumber(String meterNumber) {
		this.meterNumber = meterNumber;
	}

	public boolean isActiveMeter() {
		return this.activeMeter;
	}

	public void setActiveMeter(boolean activeMeter) {
		this.activeMeter = activeMeter;
	}

	public BillingMeterType getBillingMeterType() {
		return this.billingMeterType;
	}

	public void setBillingMeterType(BillingMeterType billingMeterType) {
		this.billingMeterType = billingMeterType;
	}

	public BillingMeterSize getBillingMeterSize() {
		return this.billingMeterSize;
	}

	public void setBillingMeterSize(BillingMeterSize billingMeterSize) {
		this.billingMeterSize = billingMeterSize;
	}

	public int getInitialReading() {
		return this.initialReading;
	}

	public void setInitialReading(int initialReading) {
		this.initialReading = initialReading;
	}

	public int getMaxReference() {
		return this.maxReference;
	}

	public void setMaxReference(int maxReference) {
		this.maxReference = maxReference;
	}

	public Date getMeterLifeStart() {
		return this.meterLifeStart;
	}

	public void setMeterLifeStart(Date meterLifeStart) {
		this.meterLifeStart = meterLifeStart;
	}

	public Date getMeterLifeLimit() {
		return this.meterLifeLimit;
	}

	public void setMeterLifeLimit(Date meterLifeLimit) {
		this.meterLifeLimit = meterLifeLimit;
	}

	public Date getRegisteredDate() {
		return this.registeredDate;
	}

	public void setRegisteredDate(Date registeredDate) {
		this.registeredDate = registeredDate;
	}

	public UserAccount getUserAccount() {
		return this.userAccount;
	}

	public void setUserAccount(UserAccount userAccount) {
		this.userAccount = userAccount;
	}

	public String getDeleted() {
		return this.deleted;
	}

	public void setDeleted(String deleted) {
		this.deleted = deleted;
	}
}