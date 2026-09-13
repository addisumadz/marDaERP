package com.wbill.home.model;

import java.io.Serializable;
import jakarta.persistence.*;

@Entity
@Table(name="billing_meter_rent")
@NamedQuery(name="BillingMeterRent.findAll", query="SELECT b FROM BillingMeterRent b")
public class BillingMeterRent implements Serializable {
	private static final long serialVersionUID = 1L;

	@Id
	@GeneratedValue(strategy=GenerationType.IDENTITY)
	private int id;

	//bi-directional many-to-one association to BillingCustomerType
	@ManyToOne
	@JoinColumn(name="billing_customer_type_id")
	private BillingCustomerType billingCustomerType;

	//bi-directional many-to-one association to BillingMeterSize
	@ManyToOne
	@JoinColumn(name="meter_size_id", nullable=false)
	private BillingMeterSize billingMeterSize;

	@Column(name="rent_birr", nullable=false)
	private double rentBirr;

	@Column(name="status", nullable=false, length=20)
	private String status;

	public BillingMeterRent() {
	}

	// Getters and Setters (you can generate these in your IDE)

	
	public BillingCustomerType getBillingCustomerType() {
		return this.billingCustomerType;
	}

	public int getId() {
		return id;
	}

	public void setId(int id) {
		this.id = id;
	}

	public void setBillingCustomerType(BillingCustomerType billingCustomerType) {
		this.billingCustomerType = billingCustomerType;
	}

	public BillingMeterSize getBillingMeterSize() {
		return this.billingMeterSize;
	}

	public void setBillingMeterSize(BillingMeterSize billingMeterSize) {
		this.billingMeterSize = billingMeterSize;
	}

	public double getRentBirr() {
		return this.rentBirr;
	}

	public void setRentBirr(double rentBirr) {
		this.rentBirr = rentBirr;
	}

	public String getStatus() {
		return this.status;
	}

	public void setStatus(String status) {
		this.status = status;
	}
}
