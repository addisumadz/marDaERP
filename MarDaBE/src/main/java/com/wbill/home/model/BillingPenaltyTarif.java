package com.wbill.home.model;

import java.io.Serializable;
import jakarta.persistence.*;

@Entity
@Table(name="billing_penalty_tarif")
@NamedQuery(name="BillingPenaltyTarif.findAll", query="SELECT b FROM BillingPenaltyTarif b")
public class BillingPenaltyTarif implements Serializable {
	private static final long serialVersionUID = 1L;

	@Id
	@GeneratedValue(strategy=GenerationType.IDENTITY)
	private int id;

	//bi-directional many-to-one association to BillingCustomerType
	@ManyToOne
	@JoinColumn(name="customer_type_id")
	private BillingCustomerType billingCustomerType;

	@Column(name="is_percent", nullable=false)
	private boolean isPercent;

	@Column(name="penality_birr", nullable=false)
	private double penalityBirr;

	@Column(name="additional_penalty", nullable=false)
	private double additionalPenalty;

	@Column(name="number_of_month", nullable=false)
	private int numberOfMonth;

	@Column(name="bewer_bzat_ybaza", nullable=false)
	private boolean bewerBzatYbaza;

	@Column(name="weru_lay_demr", nullable=false)
	private boolean weruLayDemr;

	@Column(name="ena_kezih_belay", nullable=false)
	private boolean enaKezihBelay;

	@Column(name="deleted", nullable=false, length=20)
	private String deleted;

	public BillingPenaltyTarif() {
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

	public boolean getIsPercent() {
		return this.isPercent;
	}

	public void setIsPercent(boolean isPercent) {
		this.isPercent = isPercent;
	}

	public double getPenalityBirr() {
		return this.penalityBirr;
	}

	public void setPenalityBirr(double penalityBirr) {
		this.penalityBirr = penalityBirr;
	}

	public double getAdditionalPenalty() {
		return this.additionalPenalty;
	}

	public void setAdditionalPenalty(double additionalPenalty) {
		this.additionalPenalty = additionalPenalty;
	}

	public int getNumberOfMonth() {
		return this.numberOfMonth;
	}

	public void setNumberOfMonth(int numberOfMonth) {
		this.numberOfMonth = numberOfMonth;
	}

	public boolean getBewerBzatYbaza() {
		return this.bewerBzatYbaza;
	}

	public void setBewerBzatYbaza(boolean bewerBzatYbaza) {
		this.bewerBzatYbaza = bewerBzatYbaza;
	}

	public boolean getWeruLayDemr() {
		return this.weruLayDemr;
	}

	public void setWeruLayDemr(boolean weruLayDemr) {
		this.weruLayDemr = weruLayDemr;
	}

	public boolean getEnaKezihBelay() {
		return this.enaKezihBelay;
	}

	public void setEnaKezihBelay(boolean enaKezihBelay) {
		this.enaKezihBelay = enaKezihBelay;
	}

	public String getDeleted() {
		return this.deleted;
	}

	public void setDeleted(String deleted) {
		this.deleted = deleted;
	}
}
