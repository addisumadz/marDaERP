package com.wbill.home.model;

import java.io.Serializable;
import jakarta.persistence.*;

@Entity
@Table(name="branchs")
@NamedQuery(name="Branch.findAll", query="SELECT b FROM Branch b")
public class Branch implements Serializable {
	private static final long serialVersionUID = 1L;

	@Id
	@GeneratedValue(strategy=GenerationType.IDENTITY)
	private int id;

	//bi-directional many-to-one association to Branch (self-referencing for parent office)
//	@ManyToOne
//	@JoinColumn(name="parent_office_id")
//	private Branch parentOffice;

	//bi-directional many-to-one association to AddressStreets
	@ManyToOne
	@JoinColumn(name="branch_kebele_id", nullable=false)
	private AddressStreets branchKebele; // Assuming 'AddressStreets' is the entity for the 'address_streets' table

	@Column(name="branch_code", nullable=false, length=100)
	private String branchCode;

	@Column(name="branch_description", nullable=false, length=200)
	private String branchDescription;

	@Column(name="office_level", nullable=false, length=100)
	private String officeLevel;

	@Lob // For TEXT type
	@Column(name="about_office")
	private String aboutOffice;

	@Column(name="deleted", nullable=false, length=20)
	private String deleted;

	public Branch() {
	}

	// Getters and Setters (you can generate these in your IDE)

	public int getId() {
		return this.id;
	}

	public void setId(int id) {
		this.id = id;
	}

//	public Branch getParentOffice() {
//		return this.parentOffice;
//	}
//
//	public void setParentOffice(Branch parentOffice) {
//		this.parentOffice = parentOffice;
//	}

	public AddressStreets getBranchKebele() {
		return this.branchKebele;
	}

	public void setBranchKebele(AddressStreets branchKebele) {
		this.branchKebele = branchKebele;
	}

	public String getBranchCode() {
		return this.branchCode;
	}

	public void setBranchCode(String branchCode) {
		this.branchCode = branchCode;
	}

	public String getBranchDescription() {
		return this.branchDescription;
	}

	public void setBranchDescription(String branchDescription) {
		this.branchDescription = branchDescription;
	}

	public String getOfficeLevel() {
		return this.officeLevel;
	}

	public void setOfficeLevel(String officeLevel) {
		this.officeLevel = officeLevel;
	}

	public String getAboutOffice() {
		return this.aboutOffice;
	}

	public void setAboutOffice(String aboutOffice) {
		this.aboutOffice = aboutOffice;
	}

	public String getDeleted() {
		return this.deleted;
	}

	public void setDeleted(String deleted) {
		this.deleted = deleted;
	}
}
