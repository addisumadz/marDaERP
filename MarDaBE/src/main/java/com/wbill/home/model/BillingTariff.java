package com.wbill.home.model;

import java.io.Serializable;
import jakarta.persistence.*;

@Entity
@Table(name="billing_tarrif")
@NamedQuery(name="BillingTariff.findAll", query="SELECT b FROM BillingTariff b")
public class BillingTariff implements Serializable {
	private static final long serialVersionUID = 1L;

	@Id
	@GeneratedValue(strategy=GenerationType.IDENTITY)
	private int id;

	//bi-directional many-to-one association to BillingCustomerType
	@ManyToOne
	@JoinColumn(name="customer_type_id")
	private BillingCustomerType billingCustomerType;

	@Column(name="block_name", nullable=false, length=100)
	private String blockName;

	@Column(name="consumption", nullable=false)
	private double consumption;

	@Column(name="tarrif_birr", nullable=false)
	private double tarrifBirr;

	@Column(name="status", nullable=false, length=20)
	private String status;

	@Column(name="is_last", nullable=false)
	private boolean isLast;

	public BillingTariff() {
	}

	// Getters and Setters (you can generate these in your IDE)

	public int getId() {
		return this.id;
	}

	public void setId(int id) {
		this.id = id;
	}

	public BillingCustomerType getBillingCustomerType() {
		return this.billingCustomerType;
	}

	public void setBillingCustomerType(BillingCustomerType billingCustomerType) {
		this.billingCustomerType = billingCustomerType;
	}

	public String getBlockName() {
		return this.blockName;
	}

	public void setBlockName(String blockName) {
		this.blockName = blockName;
	}

	public double getConsumption() {
		return this.consumption;
	}

	public void setConsumption(double consumption) {
		this.consumption = consumption;
	}

	public double getTarrifBirr() {
		return this.tarrifBirr;
	}

	public void setTarrifBirr(double tarrifBirr) {
		this.tarrifBirr = tarrifBirr;
	}

	public String getStatus() {
		return this.status;
	}

	public void setStatus(String status) {
		this.status = status;
	}

	public boolean getIsLast() {
		return this.isLast;
	}

	public void setIsLast(boolean isLast) {
		this.isLast = isLast;
	}
}
