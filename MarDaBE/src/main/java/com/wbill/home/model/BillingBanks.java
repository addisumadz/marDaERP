package com.wbill.home.model;

import java.io.Serializable;
import jakarta.persistence.*;

@Entity
@Table(name="billing_banks")
@NamedQuery(name="BillingBanks.findAll", query="SELECT b FROM BillingBanks b")
public class BillingBanks implements Serializable {
	private static final long serialVersionUID = 1L;

	@Id
	@GeneratedValue(strategy=GenerationType.IDENTITY)
	private int id;

	@Column(name="gateway_code", nullable=false, length=50)
	private String gatewayCode;

	@Column(name="bank_code", nullable=false, length=100)
	private String bankCode;

	@Column(name="bank_name", nullable=false, length=100)
	private String bankName;

	@Column(name="bank_color", nullable=false, length=100)
	private String bankColor;

	@Column(name="total_yetekefele_report", nullable=false)
	private double totalYetekefeleReport;

	@Column(name="total_tekefay_report", nullable=false)
	private double totalTekefayReport;

	@Column(name="deleted", nullable=false, length=20)
	private String deleted;

	public BillingBanks() {
	}

	// Getters and Setters (you can generate these in your IDE)

	public int getId() {
		return this.id;
	}

	public void setId(int id) {
		this.id = id;
	}

	public String getGatewayCode() {
		return this.gatewayCode;
	}

	public void setGatewayCode(String gatewayCode) {
		this.gatewayCode = gatewayCode;
	}

	public String getBankCode() {
		return this.bankCode;
	}

	public void setBankCode(String bankCode) {
		this.bankCode = bankCode;
	}

	public String getBankName() {
		return this.bankName;
	}

	public void setBankName(String bankName) {
		this.bankName = bankName;
	}

	public String getBankColor() {
		return this.bankColor;
	}

	public void setBankColor(String bankColor) {
		this.bankColor = bankColor;
	}

	public double getTotalYetekefeleReport() {
		return this.totalYetekefeleReport;
	}

	public void setTotalYetekefeleReport(double totalYetekefeleReport) {
		this.totalYetekefeleReport = totalYetekefeleReport;
	}

	public double getTotalTekefayReport() {
		return this.totalTekefayReport;
	}

	public void setTotalTekefayReport(double totalTekefayReport) {
		this.totalTekefayReport = totalTekefayReport;
	}

	public String getDeleted() {
		return this.deleted;
	}

	public void setDeleted(String deleted) {
		this.deleted = deleted;
	}
}
