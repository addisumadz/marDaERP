package com.wbill.home.model;

import java.io.Serializable;
import jakarta.persistence.*;

@Entity
@Table(name="billing_company_information")
@NamedQuery(name="BillingCompanyInformation.findAll", query="SELECT b FROM BillingCompanyInformation b")
public class BillingCompanyInformation implements Serializable {
	private static final long serialVersionUID = 1L;

	@Id
	@GeneratedValue(strategy=GenerationType.IDENTITY)
	private int id;

	@Column(name="company_name", nullable=false, length=200)
	private String companyName;

	@Column(name="company_logo", nullable=false, length=200)
	private String companyLogo;

	@Column(name="motto", nullable=false, length=100)
	private String motto;

	@Column(name="message", nullable=false, length=100)
	private String message;

	@Column(name="additional_information", nullable=false, length=200)
	private String additionalInformation;

	@Column(name="genzeb_sebsabe", nullable=false, length=100)
	private String genzebSebsabe;

	@Column(name="deresegn_yemiaregagt", nullable=false, length=200)
	private String deresegnYemiaregagt;

	@Column(name="deresegn_sebsabi_label", length=150)
	private String deresegnSebsabiLabel;

	@Column(name="deresegn_yemiaregagt_label", length=150)
	private String deresegnYemiaregagtLabel;

	@Column(name="yeteganene_percent", nullable=false)
	private int yeteganenePercent;

	@Column(name="status", nullable=false, length=20)
	private String status;

	public BillingCompanyInformation() {
	}

	// Getters and Setters (you can generate these in your IDE)

	public int getId() {
		return this.id;
	}

	public void setId(int id) {
		this.id = id;
	}

	public String getCompanyName() {
		return this.companyName;
	}

	public void setCompanyName(String companyName) {
		this.companyName = companyName;
	}

	public String getCompanyLogo() {
		return this.companyLogo;
	}

	public void setCompanyLogo(String companyLogo) {
		this.companyLogo = companyLogo;
	}

	public String getMotto() {
		return this.motto;
	}

	public void setMotto(String motto) {
		this.motto = motto;
	}

	public String getMessage() {
		return this.message;
	}

	public void setMessage(String message) {
		this.message = message;
	}

	public String getAdditionalInformation() {
		return this.additionalInformation;
	}

	public void setAdditionalInformation(String additionalInformation) {
		this.additionalInformation = additionalInformation;
	}

	public String getGenzebSebsabe() {
		return this.genzebSebsabe;
	}

	public void setGenzebSebsabe(String genzebSebsabe) {
		this.genzebSebsabe = genzebSebsabe;
	}

	public String getDeresegnYemiaregagt() {
		return this.deresegnYemiaregagt;
	}

	public void setDeresegnYemiaregagt(String deresegnYemiaregagt) {
		this.deresegnYemiaregagt = deresegnYemiaregagt;
	}

	public String getDeresegnSebsabiLabel() {
		return this.deresegnSebsabiLabel;
	}

	public void setDeresegnSebsabiLabel(String deresegnSebsabiLabel) {
		this.deresegnSebsabiLabel = deresegnSebsabiLabel;
	}

	public String getDeresegnYemiaregagtLabel() {
		return this.deresegnYemiaregagtLabel;
	}

	public void setDeresegnYemiaregagtLabel(String deresegnYemiaregagtLabel) {
		this.deresegnYemiaregagtLabel = deresegnYemiaregagtLabel;
	}

	public int getYeteganenePercent() {
		return this.yeteganenePercent;
	}

	public void setYeteganenePercent(int yeteganenePercent) {
		this.yeteganenePercent = yeteganenePercent;
	}

	public String getStatus() {
		return this.status;
	}

	public void setStatus(String status) {
		this.status = status;
	}
}
