package com.wbill.home.model;

import java.io.Serializable;
import jakarta.persistence.*;

@Entity
@Table(name="billing_customer_type")
@NamedQuery(name="BillingCustomerType.findAll", query="SELECT b FROM BillingCustomerType b")
public class BillingCustomerType implements Serializable {
	private static final long serialVersionUID = 1L;

	@Id
	@GeneratedValue(strategy=GenerationType.IDENTITY)
	private int id;

	@Column(name="customer_type", nullable=false, length=100)
	private String customerType;

	@Column(name="description", nullable=false, length=150)
	private String description;

	@Column(name="kifya", nullable=false)
	private double kifya;

	@Column(name="budget_code", length=100)
	private String budgetCode;

	@Column(name="is_office_tgena", nullable=false)
	private boolean isOfficeTgena;

	@Column(name="techemari_field_name", length=100)
	private String techemariFieldName;

	@Column(name="techemari_kfya", nullable=false)
	private double techemariKfya;

	@Column(name="deleted", nullable=false, length=20)
	private String deleted;

	@Column(name="is_residential", nullable=false)
	private boolean isResidential;

	@Column(name="is_public_tap", nullable=false)
	private boolean isPublicTap;

	public BillingCustomerType() {
	}

	// Getters and Setters (you can generate these in your IDE)

	public int getId() {
		return this.id;
	}

	public void setId(int id) {
		this.id = id;
	}

	public String getCustomerType() {
		return this.customerType;
	}

	public void setCustomerType(String customerType) {
		this.customerType = customerType;
	}

	public String getDescription() {
		return this.description;
	}

	public void setDescription(String description) {
		this.description = description;
	}

	public double getKifya() {
		return this.kifya;
	}

	public void setKifya(double kifya) {
		this.kifya = kifya;
	}

	public String getBudgetCode() {
		return this.budgetCode;
	}

	public void setBudgetCode(String budgetCode) {
		this.budgetCode = budgetCode;
	}

	public boolean getIsOfficeTgena() {
		return this.isOfficeTgena;
	}

	public void setIsOfficeTgena(boolean isOfficeTgena) {
		this.isOfficeTgena = isOfficeTgena;
	}

	public String getTechemariFieldName() {
		return this.techemariFieldName;
	}

	public void setTechemariFieldName(String techemariFieldName) {
		this.techemariFieldName = techemariFieldName;
	}

	public double getTechemariKfya() {
		return this.techemariKfya;
	}

	public void setTechemariKfya(double techemariKfya) {
		this.techemariKfya = techemariKfya;
	}

	public String getDeleted() {
		return this.deleted;
	}

	public void setDeleted(String deleted) {
		this.deleted = deleted;
	}

	public boolean getIsResidential() {
		return this.isResidential;
	}

	public void setIsResidential(boolean isResidential) {
		this.isResidential = isResidential;
	}

	public boolean getIsPublicTap() {
		return this.isPublicTap;
	}

	public void setIsPublicTap(boolean isPublicTap) {
		this.isPublicTap = isPublicTap;
	}
}
