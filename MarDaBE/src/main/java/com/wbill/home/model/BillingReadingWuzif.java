package com.wbill.home.model;

import java.io.Serializable;
import jakarta.persistence.*;

@Entity
@Table(name="billing_reading_wuzif")
@NamedQuery(name="BillingReadingWuzif.findAll", query="SELECT b FROM BillingReadingWuzif b")
public class BillingReadingWuzif implements Serializable {
	private static final long serialVersionUID = 1L;

	@Id
	@GeneratedValue(strategy=GenerationType.IDENTITY)
	private int id;

	@Column(name="backup_table_primary_key", nullable=false)
	private int backupTablePrimaryKey;

	//bi-directional many-to-one association to BillingReading (actual payment)
	@ManyToOne
	@JoinColumn(name="billing_reading_id_actual_payment", nullable=false)
	private BillingReading billingReadingActualPayment;

	//bi-directional many-to-one association to BillingReading (penalized)
	@ManyToOne
	@JoinColumn(name="billing_reading_id_penalized")
	private BillingReading billingReadingPenalized;

	@Column(name="wuzif_kesih_eske", length=200)
	private String wuzifKesihEske;

	@Column(name="wuzif_kotari_kiray_yeskahun_teklala", nullable=false)
	private double wuzifKotariKirayYeskahunTeklala;

	@Column(name="wuzif_hisab_yeskahun_teklala", nullable=false)
	private double wuzifHisabYeskahunTeklala;

	@Column(name="wuzf_wor_bzat_yahunun_chemro", nullable=false)
	private int wuzfWorBzatYahununChemro;

	@Column(name="total_kitat", nullable=false)
	private double totalKitat;

	@Column(name="total_additional_monthly_payment_yezihn_wor_chemro", nullable=false)
	private double totalAdditionalMonthlyPaymentYezihnWorChemro;

	@Column(name="is_money_collected", nullable=false)
	private boolean isMoneyCollected;

	@Column(name="weight", nullable=false)
	private int weight;

	@Column(name="deleted", nullable=false, length=20)
	private String deleted;

	@Column(name="is_kitat_tenestual", nullable=false)
	private boolean isKitatTenestual;

	public BillingReadingWuzif() {
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

	public BillingReading getBillingReadingActualPayment() {
		return this.billingReadingActualPayment;
	}

	public void setBillingReadingActualPayment(BillingReading billingReadingActualPayment) {
		this.billingReadingActualPayment = billingReadingActualPayment;
	}

	public BillingReading getBillingReadingPenalized() {
		return this.billingReadingPenalized;
	}

	public void setBillingReadingPenalized(BillingReading billingReadingPenalized) {
		this.billingReadingPenalized = billingReadingPenalized;
	}

	public String getWuzifKesihEske() {
		return this.wuzifKesihEske;
	}

	public void setWuzifKesihEske(String wuzifKesihEske) {
		this.wuzifKesihEske = wuzifKesihEske;
	}

	public double getWuzifKotariKirayYeskahunTeklala() {
		return this.wuzifKotariKirayYeskahunTeklala;
	}

	public void setWuzifKotariKirayYeskahunTeklala(double wuzifKotariKirayYeskahunTeklala) {
		this.wuzifKotariKirayYeskahunTeklala = wuzifKotariKirayYeskahunTeklala;
	}

	public double getWuzifHisabYeskahunTeklala() {
		return this.wuzifHisabYeskahunTeklala;
	}

	public void setWuzifHisabYeskahunTeklala(double wuzifHisabYeskahunTeklala) {
		this.wuzifHisabYeskahunTeklala = wuzifHisabYeskahunTeklala;
	}

	public int getWuzfWorBzatYahununChemro() {
		return this.wuzfWorBzatYahununChemro;
	}

	public void setWuzfWorBzatYahununChemro(int wuzfWorBzatYahununChemro) {
		this.wuzfWorBzatYahununChemro = wuzfWorBzatYahununChemro;
	}

	public double getTotalKitat() {
		return this.totalKitat;
	}

	public void setTotalKitat(double totalKitat) {
		this.totalKitat = totalKitat;
	}

	public double getTotalAdditionalMonthlyPaymentYezihnWorChemro() {
		return this.totalAdditionalMonthlyPaymentYezihnWorChemro;
	}

	public void setTotalAdditionalMonthlyPaymentYezihnWorChemro(double totalAdditionalMonthlyPaymentYezihnWorChemro) {
		this.totalAdditionalMonthlyPaymentYezihnWorChemro = totalAdditionalMonthlyPaymentYezihnWorChemro;
	}

	public boolean getIsMoneyCollected() {
		return this.isMoneyCollected;
	}

	public void setIsMoneyCollected(boolean isMoneyCollected) {
		this.isMoneyCollected = isMoneyCollected;
	}

	public int getWeight() {
		return this.weight;
	}

	public void setWeight(int weight) {
		this.weight = weight;
	}

	public String getDeleted() {
		return this.deleted;
	}

	public void setDeleted(String deleted) {
		this.deleted = deleted;
	}

	public boolean getIsKitatTenestual() {
		return this.isKitatTenestual;
	}

	public void setIsKitatTenestual(boolean isKitatTenestual) {
		this.isKitatTenestual = isKitatTenestual;
	}
}
