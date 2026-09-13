package com.wbill.home.model;

import java.io.Serializable;
import jakarta.persistence.*;

@Entity
@Table(name="billing_reading_consumption")
@NamedQuery(name="BillingReadingConsumption.findAll", query="SELECT b FROM BillingReadingConsumption b")
public class BillingReadingConsumption implements Serializable {
	private static final long serialVersionUID = 1L;

	@Id
	@GeneratedValue(strategy=GenerationType.IDENTITY)
	private int id;

	@Column(name="backup_table_primary_key", nullable=false)
	private int backupTablePrimaryKey;

	//bi-directional many-to-one association to BillingReading
	@ManyToOne
	@JoinColumn(name="reading_id", nullable=false)
	private BillingReading billingReading;

	@Column(name="block_name", nullable=false, length=100)
	private String blockName;

	@Column(name="consumption", nullable=false)
	private double consumption;

	@Column(name="tariff", nullable=false)
	private double tariff;

	@Column(name="total_amount", nullable=false)
	private double totalAmount;

	@Column(name="status", nullable=false, length=20)
	private String status;

	public BillingReadingConsumption() {
	}

	// Getters and Setters (you can generate these in your IDE)

	public int getId() {
		return this.id;
	}

	public void setId(int id) {
		this.id = id;
	}

	public int getBackupTablePrimaryKey() {
		return this.backupTablePrimaryKey;
	}

	public void setBackupTablePrimaryKey(int backupTablePrimaryKey) {
		this.backupTablePrimaryKey = backupTablePrimaryKey;
	}

	public BillingReading getBillingReading() {
		return this.billingReading;
	}

	public void setBillingReading(BillingReading billingReading) {
		this.billingReading = billingReading;
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

	public double getTariff() {
		return this.tariff;
	}

	public void setTariff(double tariff) {
		this.tariff = tariff;
	}

	public double getTotalAmount() {
		return this.totalAmount;
	}

	public void setTotalAmount(double totalAmount) {
		this.totalAmount = totalAmount;
	}

	public String getStatus() {
		return this.status;
	}

	public void setStatus(String status) {
		this.status = status;
	}
}
