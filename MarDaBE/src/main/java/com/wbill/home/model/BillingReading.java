package com.wbill.home.model;

import java.io.Serializable;
import java.util.Date;

import com.fasterxml.jackson.annotation.JsonBackReference;

import jakarta.persistence.*;

@Entity
@Table(name = "billing_reading")
@NamedQuery(name = "BillingReading.findAll", query = "SELECT b FROM BillingReading b")
public class BillingReading implements Serializable {
	private static final long serialVersionUID = 1L;

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private int id;

	@Column(name = "is_billing_closed")
	private boolean isBillingClosed;

	@Column(name = "invoice_number")
	private String invoiceNumber;

	@Column(name = "is_ready_for_bill")
	private boolean isReadyForBill;

	@Column(name = "is_bill_generated")
	private boolean isBillGenerated;

	@Column(name = "is_money_collected")
	private boolean isMoneyCollected;

	@Column(name = "is_kitat")
	private boolean isKitat;

	@Column(name = "is_ktat_tekeflual")
	private boolean isKtatTekeflual;

	@Column(name = "is_old_penality_paid_in_this_month")
	private boolean isOldPenalityPaidInThisMonth;

	@Column(name = "is_mobile_collected")
	private boolean isMobileCollected;

	@Column(name = "last_reading")
	private int lastReading;

	@Column(name = "temp_last_reading")
	private int tempLastReading;

	@Column(name = "consumption_before_temelash")
	private int consumptionBeforeTemelash;

	@Column(name = "reading_before_temelash")
	private int readingBeforeTemelash;

	@Column(name = "previous_reading")
	private int previousReading;

	private int consumption;

	@Column(name = "consumption_wuzif")
	private int consumptionWuzif;

	@Column(name = "consumption_wuzif_yalefew")
	private int consumptionWuzifYalefew;

	@Temporal(TemporalType.DATE)
	@Column(name = "collection_date")
	private Date collectionDate;

	@Column(name = "kifya_wer")
	private String kifyaWer;

	@Column(name = "money_collector")
	private String moneyCollector;

	@Temporal(TemporalType.DATE)
	@Column(name = "money_collected_date")
	private Date moneyCollectedDate;

	@Column(name = "kotari_kiray")
	private double kotariKiray;

	@Column(name = "yezih_wer")
	private double yezihWer;

	@Column(name = "wuzif_kezih_eske")
	private String wuzifKezihEske;

	@Lob
	@Column(name = "wuzif_wor_zrzr")
	private String wuzifWorZrzr;

	@Column(name = "wuzif_kotari_kiray")
	private double wuzifKotariKiray;

	@Column(name = "wuzif_hisab")
	private double wuzifHisab;

	@Column(name = "wuzif_wor_bzat")
	private int wuzifWorBzat;

	@Column(name = "yezih_wer_fjota_kfya")
	private double yezihWerFjotaKfya;

	@Column(name = "wuzif_fjota")
	private int wuzifFjota;

	@Column(name = "wuzif_fjota_kfya")
	private double wuzifFjotaKfya;

	@Column(name = "wuzif_derek_koshasha")
	private double wuzifDerekKoshasha;

	@Column(name = "wuzif_techemari_kfya")
	private double wuzifTechemariKfya;

	private double kitat;

	@Column(name = "is_zero_evaluated")
	private boolean isZeroEvaluated;

	@Column(name = "is_zero_occurred")
	private boolean isZeroOccurred;

	@Column(name = "is_void")
	private boolean isVoid;

	@Column(name = "is_send_to_bank")
	private boolean isSendToBank;

	@Column(name = "is_send_to_bank_unicash")
	private boolean isSendToBankUnicash;

	@Column(name = "is_bank_canceled")
	private boolean isBankCanceled;

	@Column(name = "is_bank_canceled_unicash")
	private boolean isBankCanceledUnicash;

	@Column(name = "bank_confirmation_code")
	private String bankConfirmationCode;

	@Column(name = "is_paid_through_bank")
	private boolean isPaidThroughBank;

	@Column(name = "is_paid_on_front_office")
	private boolean isPaidOnFrontOffice;

	@Column(name = "is_paid_from_tekemach")
	private boolean isPaidFromTekemach;

	@Column(name = "is_yeteganene")
	private boolean isYeteganene;

	@Column(name = "is_yeteganene_accepted")
	private boolean isYeteganeneAccepted;

	@Column(name = "is_kecredit_tekeflual")
	private boolean isKecreditTekeflual;

	@Column(name = "is_temelash_as_credit")
	private boolean isTemelashAsCredit;

	@Column(name = "is_derash_paid")
	private boolean isDerashPaid;

	@Column(name = "is_unicash_paid")
	private boolean isUnicashPaid;

	@Column(name = "is_abyssinia_paid")
	private boolean isAbyssiniaPaid;

	@Column(name = "is_send_to_bank_mardaarif")
	private boolean isSendToBankMardaArif;

	@Column(name = "is_bank_canceled_mardaarif")
	private boolean isBankCanceledMardaArif;

	@Column(name = "is_mardaarif_paid")
	private boolean isMardaArifPaid;

	@Column(name = "m_bank_paid_agent_id")
	private String mBankPaidAgentId;

	@ManyToOne
	@JoinColumn(name = "m_billing_bank_id")
	private BillingBanks mBillingBank;

	@Temporal(TemporalType.DATE)
	@Column(name = "m_bank_due_date")
	private Date mBankDueDate;

	@Temporal(TemporalType.DATE)
	@Column(name = "m_bank_upload_date")
	private Date mBankUploadDate;

	@Temporal(TemporalType.TIMESTAMP)
	@Column(name = "m_money_collected_date")
	private Date mMoneyCollectedDate;

	@Column(name = "m_bank_paid_confirmation_code")
	private String mBankPaidConfirmationCode;

	@Column(name = "is_initialized_second_time")
	private boolean isInitializedSecondTime;

	@Column(name = "is_just_return_from_penality")
	private boolean isJustReturnFromPenality;

	@Column(name = "enable_edit_menesha_reading")
	private boolean enableEditMeneshaReading;

	@Column(name = "has_temelash_birr")
	private boolean hasTemelashBirr;

	@Column(name = "temelash_birr")
	private double temelashBirr;

	@Column(name = "temp_temelash_birr_selected")
	private String tempTemelashBirrSelected;

	@Column(name = "additional_text")
	private String additionalText;

	@Column(name = "reader_gps", nullable = true)
	private String readerGps;

	@Column(name = "additional_hisab")
	private double additionalHisab;

	@Column(name = "techemari_field_name")
	private String techemariFieldName;

	@Column(name = "techemari_kfya")
	private double techemariKfya;

	@Column(name = "m_billing_additional_payment_1_value", nullable = true)
	private Double mBillingAdditionalPayment1Value;

	@Column(name = "m_billing_additional_payment_2_value", nullable = true)
	private Double mBillingAdditionalPayment2Value;

	@Column(name = "m_billing_additional_payment_1_wuzif", nullable = true)
	private Double mBillingAdditionalPayment1Wuzif;

	@Column(name = "m_billing_additional_payment_2_wuzif", nullable = true)
	private Double mBillingAdditionalPayment2Wuzif;

	@Column(name = "m_billing_additional_payment_1_value_lable", nullable = true)
	private String mBillingAdditionalPayment1ValueLable;

	@Column(name = "m_billing_additional_payment_2_value_lable", nullable = true)
	private String mBillingAdditionalPayment2ValueLable;

	@Column(name = "tekilala_tekefay")
	private double tekilalaTekefay;

	@Column(name = "tekilala_bank_yetekefele")
	private double tekilalaBankYetekefele;

	@Column(name = "tekilala_yetekefele")
	private double tekilalaYetekefele;

	@Column(name = "kecredit_yetekefele")
	private double kecreditYetekefele;

	@Column(name = "bank_paid_confirmation_code")
	private String bankPaidConfirmationCode;

	@Lob
	private String remark;

	@Column(name = "zero_reading_reason")
	private String zeroReadingReason;

	@Column(name = "zero_reading_wor_bzat")
	private int zeroReadingWorBzat;

	@Column(name = "bank_paid_agent_id")
	private String bankPaidAgentId;

	@Temporal(TemporalType.DATE)
	@Column(name = "bank_due_date")
	private Date bankDueDate;

	@Temporal(TemporalType.DATE)
	@Column(name = "bank_upload_date")
	private Date bankUploadDate;

	@Column(name = "u_bank_paid_agent_id")
	private String uBankPaidAgentId;

	@ManyToOne
	@JoinColumn(name = "u_billing_bank_id")
	private BillingBanks uBillingBank;

	@Temporal(TemporalType.DATE)
	@Column(name = "u_bank_due_date")
	private Date uBankDueDate;

	@Temporal(TemporalType.DATE)
	@Column(name = "u_bank_upload_date")
	private Date uBankUploadDate;

	@Temporal(TemporalType.TIMESTAMP)
	@Column(name = "u_money_collected_date")
	private Date uMoneyCollectedDate;

	@Column(name = "u_bank_paid_confirmation_code")
	private String uBankPaidConfirmationCode;

	@Column(name = "techemari_kitat")
	private double techemariKitat;

	@Lob
	@Column(name = "derash_error_message")
	private String derashErrorMessage;

	@Column(name = "is_current_month_kitat_temp")
	private boolean isCurrentMonthKitatTemp;

	@Column(name = "is_bill_adjusted")
	private boolean isBillAdjusted;

	@Column(name = "is_bill_adjusted_bank_paid")
	private boolean isBillAdjustedBankPaid;

	@Column(name = "old_bill")
	private double oldBill;

	@Column(name = "adjustment_bill")
	private double adjustmentBill;

	@Temporal(TemporalType.TIMESTAMP)
	@Column(name = "registered_date")
	private Date registeredDate;

	@Temporal(TemporalType.TIMESTAMP)
	@Column(name = "modified_date")
	private Date modifiedDate;

	private String status;

	@Column(name = "average_consumption")
	private int averageConsumption;

	@Column(name = "is_on_move")
	private boolean isOnMove;

	@Column(name = "is_on_move_completed")
	private boolean isOnMoveCompleted;

	@Column(name = "is_on_return_completed")
	private boolean isOnReturnCompleted;

	@Column(name = "is_on_return")
	private boolean isOnReturn;

	@Column(name = "back_table_pkey")
	private int backTablePkey;

	@Column(name = "is_send_csv")
	private boolean isSendCsv;

	@Column(name = "is_direct_to_bank")
	private boolean isDirectToBank;

	@Column(name = "is_journal_pushed")
	private boolean isJournalPushed;

	@Column(name = "journal_entry_ref", length = 100)
	private String journalEntryRef;

	// Paid bill journal push tracking (separate from Bill Preparation push)
	@Column(name = "is_paid_journal_pushed")
	private boolean isPaidJournalPushed;

	@Column(name = "paid_journal_entry_ref", length = 100)
	private String paidJournalEntryRef;

	@Lob
	@Column(name = "bill_description_bank")
	private String billDescriptionBank;

	// bi-directional many-to-one association to BillingCustomerInfo
	@ManyToOne
	@JoinColumn(name = "customer_info_id")
	@JsonBackReference
	private BillingCustomerInfo billingCustomerInfo;

	// bi-directional many-to-one association to BillingZeroReadingReason
	@ManyToOne
	@JoinColumn(name = "billing_zero_reading_reason_id")
	private BillingZeroReadingReason billingZeroReadingReason;

	// bi-directional many-to-one association to BillingInvoiceNumber
	@ManyToOne
	@JoinColumn(name = "invoice_number_id")
	private BillingInvoiceNumbers billingInvoiceNumbers;

	// bi-directional many-to-one association to BillingCustomerInfoMeter
	@ManyToOne
	@JoinColumn(name = "billing_customer_info_meter_id")
	private BillingCustomerInfoMeter billingCustomerInfoMeter;

	// bi-directional many-to-one association to BillingBank
	@ManyToOne
	@JoinColumn(name = "billing_bank_id")
	private BillingBanks billingBanks;

	// bi-directional many-to-one association to UserAccount
	@ManyToOne
	@JoinColumn(name = "cashier_user_id")
	private UserAccount cashierUser;

	// bi-directional many-to-one association to UserAccount
	@ManyToOne
	@JoinColumn(name = "mobile_reader_user")
	private UserAccount mobileReaderUser;

	// bi-directional many-to-one association to UserAccount
	@ManyToOne
	@JoinColumn(name = "modified_by_user")
	private UserAccount modifiedByUser;

	public BillingReading() {
	}

	public int getId() {
		return id;
	}

	public void setId(int id) {
		this.id = id;
	}

	public boolean isBillingClosed() {
		return isBillingClosed;
	}

	public void setBillingClosed(boolean isBillingClosed) {
		this.isBillingClosed = isBillingClosed;
	}

	public String getInvoiceNumber() {
		return invoiceNumber;
	}

	public void setInvoiceNumber(String invoiceNumber) {
		this.invoiceNumber = invoiceNumber;
	}

	public boolean isReadyForBill() {
		return isReadyForBill;
	}

	public void setReadyForBill(boolean isReadyForBill) {
		this.isReadyForBill = isReadyForBill;
	}

	public boolean isBillGenerated() {
		return isBillGenerated;
	}

	public void setBillGenerated(boolean isBillGenerated) {
		this.isBillGenerated = isBillGenerated;
	}

	public boolean isMoneyCollected() {
		return isMoneyCollected;
	}

	public void setMoneyCollected(boolean isMoneyCollected) {
		this.isMoneyCollected = isMoneyCollected;
	}

	public boolean isKitat() {
		return isKitat;
	}

	public void setKitat(boolean isKitat) {
		this.isKitat = isKitat;
	}

	public boolean isKtatTekeflual() {
		return isKtatTekeflual;
	}

	public void setKtatTekeflual(boolean isKtatTekeflual) {
		this.isKtatTekeflual = isKtatTekeflual;
	}

	public boolean isOldPenalityPaidInThisMonth() {
		return isOldPenalityPaidInThisMonth;
	}

	public void setOldPenalityPaidInThisMonth(boolean isOldPenalityPaidInThisMonth) {
		this.isOldPenalityPaidInThisMonth = isOldPenalityPaidInThisMonth;
	}

	public boolean isMobileCollected() {
		return isMobileCollected;
	}

	public void setMobileCollected(boolean isMobileCollected) {
		this.isMobileCollected = isMobileCollected;
	}

	public int getLastReading() {
		return lastReading;
	}

	public void setLastReading(int lastReading) {
		this.lastReading = lastReading;
	}

	public int getTempLastReading() {
		return tempLastReading;
	}

	public void setTempLastReading(int tempLastReading) {
		this.tempLastReading = tempLastReading;
	}

	public int getConsumptionBeforeTemelash() {
		return consumptionBeforeTemelash;
	}

	public void setConsumptionBeforeTemelash(int consumptionBeforeTemelash) {
		this.consumptionBeforeTemelash = consumptionBeforeTemelash;
	}

	public int getReadingBeforeTemelash() {
		return readingBeforeTemelash;
	}

	public void setReadingBeforeTemelash(int readingBeforeTemelash) {
		this.readingBeforeTemelash = readingBeforeTemelash;
	}

	public int getPreviousReading() {
		return previousReading;
	}

	public void setPreviousReading(int previousReading) {
		this.previousReading = previousReading;
	}

	public int getConsumption() {
		return consumption;
	}

	public void setConsumption(int consumption) {
		this.consumption = consumption;
	}

	public int getConsumptionWuzif() {
		return consumptionWuzif;
	}

	public void setConsumptionWuzif(int consumptionWuzif) {
		this.consumptionWuzif = consumptionWuzif;
	}

	public int getConsumptionWuzifYalefew() {
		return consumptionWuzifYalefew;
	}

	public void setConsumptionWuzifYalefew(int consumptionWuzifYalefew) {
		this.consumptionWuzifYalefew = consumptionWuzifYalefew;
	}

	public Date getCollectionDate() {
		return collectionDate;
	}

	public void setCollectionDate(Date collectionDate) {
		this.collectionDate = collectionDate;
	}

	public String getKifyaWer() {
		return kifyaWer;
	}

	public void setKifyaWer(String kifyaWer) {
		this.kifyaWer = kifyaWer;
	}

	public String getMoneyCollector() {
		return moneyCollector;
	}

	public void setMoneyCollector(String moneyCollector) {
		this.moneyCollector = moneyCollector;
	}

	public Date getMoneyCollectedDate() {
		return moneyCollectedDate;
	}

	public void setMoneyCollectedDate(Date moneyCollectedDate) {
		this.moneyCollectedDate = moneyCollectedDate;
	}

	public double getKotariKiray() {
		return kotariKiray;
	}

	public void setKotariKiray(double kotariKiray) {
		this.kotariKiray = kotariKiray;
	}

	public double getYezihWer() {
		return yezihWer;
	}

	public void setYezihWer(double yezihWer) {
		this.yezihWer = yezihWer;
	}

	public String getWuzifKezihEske() {
		return wuzifKezihEske;
	}

	public void setWuzifKezihEske(String wuzifKezihEske) {
		this.wuzifKezihEske = wuzifKezihEske;
	}

	public String getWuzifWorZrzr() {
		return wuzifWorZrzr;
	}

	public void setWuzifWorZrzr(String wuzifWorZrzr) {
		this.wuzifWorZrzr = wuzifWorZrzr;
	}

	public double getWuzifKotariKiray() {
		return wuzifKotariKiray;
	}

	public void setWuzifKotariKiray(double wuzifKotariKiray) {
		this.wuzifKotariKiray = wuzifKotariKiray;
	}

	public double getWuzifHisab() {
		return wuzifHisab;
	}

	public void setWuzifHisab(double wuzifHisab) {
		this.wuzifHisab = wuzifHisab;
	}

	public int getWuzifWorBzat() {
		return wuzifWorBzat;
	}

	public void setWuzifWorBzat(int wuzifWorBzat) {
		this.wuzifWorBzat = wuzifWorBzat;
	}

	public double getYezihWerFjotaKfya() {
		return yezihWerFjotaKfya;
	}

	public void setYezihWerFjotaKfya(double yezihWerFjotaKfya) {
		this.yezihWerFjotaKfya = yezihWerFjotaKfya;
	}

	public int getWuzifFjota() {
		return wuzifFjota;
	}

	public void setWuzifFjota(int wuzifFjota) {
		this.wuzifFjota = wuzifFjota;
	}

	public double getWuzifFjotaKfya() {
		return wuzifFjotaKfya;
	}

	public void setWuzifFjotaKfya(double wuzifFjotaKfya) {
		this.wuzifFjotaKfya = wuzifFjotaKfya;
	}

	public double getWuzifDerekKoshasha() {
		return wuzifDerekKoshasha;
	}

	public void setWuzifDerekKoshasha(double wuzifDerekKoshasha) {
		this.wuzifDerekKoshasha = wuzifDerekKoshasha;
	}

	public double getWuzifTechemariKfya() {
		return wuzifTechemariKfya;
	}

	public void setWuzifTechemariKfya(double wuzifTechemariKfya) {
		this.wuzifTechemariKfya = wuzifTechemariKfya;
	}

	public double getKitat() {
		return kitat;
	}

	public void setKitat(double kitat) {
		this.kitat = kitat;
	}

	public boolean isZeroEvaluated() {
		return isZeroEvaluated;
	}

	public void setZeroEvaluated(boolean isZeroEvaluated) {
		this.isZeroEvaluated = isZeroEvaluated;
	}

	public boolean isZeroOccurred() {
		return isZeroOccurred;
	}

	public void setZeroOccurred(boolean isZeroOccurred) {
		this.isZeroOccurred = isZeroOccurred;
	}

	public boolean isVoid() {
		return isVoid;
	}

	public void setVoid(boolean isVoid) {
		this.isVoid = isVoid;
	}

	public boolean isSendToBank() {
		return isSendToBank;
	}

	public void setSendToBank(boolean isSendToBank) {
		this.isSendToBank = isSendToBank;
	}

	public boolean isSendToBankUnicash() {
		return isSendToBankUnicash;
	}

	public void setSendToBankUnicash(boolean isSendToBankUnicash) {
		this.isSendToBankUnicash = isSendToBankUnicash;
	}

	public boolean isBankCanceled() {
		return isBankCanceled;
	}

	public void setBankCanceled(boolean isBankCanceled) {
		this.isBankCanceled = isBankCanceled;
	}

	public boolean isBankCanceledUnicash() {
		return isBankCanceledUnicash;
	}

	public void setBankCanceledUnicash(boolean isBankCanceledUnicash) {
		this.isBankCanceledUnicash = isBankCanceledUnicash;
	}

	public String getBankConfirmationCode() {
		return bankConfirmationCode;
	}

	public void setBankConfirmationCode(String bankConfirmationCode) {
		this.bankConfirmationCode = bankConfirmationCode;
	}

	public boolean isPaidThroughBank() {
		return isPaidThroughBank;
	}

	public void setPaidThroughBank(boolean isPaidThroughBank) {
		this.isPaidThroughBank = isPaidThroughBank;
	}

	public boolean isPaidOnFrontOffice() {
		return isPaidOnFrontOffice;
	}

	public void setPaidOnFrontOffice(boolean isPaidOnFrontOffice) {
		this.isPaidOnFrontOffice = isPaidOnFrontOffice;
	}

	public boolean isPaidFromTekemach() {
		return isPaidFromTekemach;
	}

	public void setPaidFromTekemach(boolean isPaidFromTekemach) {
		this.isPaidFromTekemach = isPaidFromTekemach;
	}

	public boolean isYeteganene() {
		return isYeteganene;
	}

	public void setYeteganene(boolean isYeteganene) {
		this.isYeteganene = isYeteganene;
	}

	public boolean isYeteganeneAccepted() {
		return isYeteganeneAccepted;
	}

	public void setYeteganeneAccepted(boolean isYeteganeneAccepted) {
		this.isYeteganeneAccepted = isYeteganeneAccepted;
	}

	public boolean isKecreditTekeflual() {
		return isKecreditTekeflual;
	}

	public void setKecreditTekeflual(boolean isKecreditTekeflual) {
		this.isKecreditTekeflual = isKecreditTekeflual;
	}

	public boolean isTemelashAsCredit() {
		return isTemelashAsCredit;
	}

	public void setTemelashAsCredit(boolean isTemelashAsCredit) {
		this.isTemelashAsCredit = isTemelashAsCredit;
	}

	public boolean isDerashPaid() {
		return isDerashPaid;
	}

	public void setDerashPaid(boolean isDerashPaid) {
		this.isDerashPaid = isDerashPaid;
	}

	public boolean isUnicashPaid() {
		return isUnicashPaid;
	}

	public void setUnicashPaid(boolean isUnicashPaid) {
		this.isUnicashPaid = isUnicashPaid;
	}

	public boolean isAbyssiniaPaid() {
		return isAbyssiniaPaid;
	}

	public void setAbyssiniaPaid(boolean isAbyssiniaPaid) {
		this.isAbyssiniaPaid = isAbyssiniaPaid;
	}

	public boolean isInitializedSecondTime() {
		return isInitializedSecondTime;
	}

	public void setInitializedSecondTime(boolean isInitializedSecondTime) {
		this.isInitializedSecondTime = isInitializedSecondTime;
	}

	public boolean isJustReturnFromPenality() {
		return isJustReturnFromPenality;
	}

	public void setJustReturnFromPenality(boolean isJustReturnFromPenality) {
		this.isJustReturnFromPenality = isJustReturnFromPenality;
	}

	public boolean isEnableEditMeneshaReading() {
		return enableEditMeneshaReading;
	}

	public void setEnableEditMeneshaReading(boolean enableEditMeneshaReading) {
		this.enableEditMeneshaReading = enableEditMeneshaReading;
	}

	public boolean isHasTemelashBirr() {
		return hasTemelashBirr;
	}

	public void setHasTemelashBirr(boolean hasTemelashBirr) {
		this.hasTemelashBirr = hasTemelashBirr;
	}

	public double getTemelashBirr() {
		return temelashBirr;
	}

	public void setTemelashBirr(double temelashBirr) {
		this.temelashBirr = temelashBirr;
	}

	public String getTempTemelashBirrSelected() {
		return tempTemelashBirrSelected;
	}

	public void setTempTemelashBirrSelected(String tempTemelashBirrSelected) {
		this.tempTemelashBirrSelected = tempTemelashBirrSelected;
	}

	public String getAdditionalText() {
		return additionalText;
	}

	public void setAdditionalText(String additionalText) {
		this.additionalText = additionalText;
	}

	public String getReaderGps() {
		return readerGps;
	}

	public void setReaderGps(String readerGps) {
		this.readerGps = readerGps;
	}

	public double getAdditionalHisab() {
		return additionalHisab;
	}

	public void setAdditionalHisab(double additionalHisab) {
		this.additionalHisab = additionalHisab;
	}

	public String getTechemariFieldName() {
		return techemariFieldName;
	}

	public void setTechemariFieldName(String techemariFieldName) {
		this.techemariFieldName = techemariFieldName;
	}

	public double getTechemariKfya() {
		return techemariKfya;
	}

	public void setTechemariKfya(double techemariKfya) {
		this.techemariKfya = techemariKfya;
	}

	public Double getmBillingAdditionalPayment1Value() {
		return mBillingAdditionalPayment1Value;
	}

	public void setmBillingAdditionalPayment1Value(Double mBillingAdditionalPayment1Value) {
		this.mBillingAdditionalPayment1Value = mBillingAdditionalPayment1Value;
	}

	public Double getmBillingAdditionalPayment2Value() {
		return mBillingAdditionalPayment2Value;
	}

	public void setmBillingAdditionalPayment2Value(Double mBillingAdditionalPayment2Value) {
		this.mBillingAdditionalPayment2Value = mBillingAdditionalPayment2Value;
	}

	public Double getmBillingAdditionalPayment1Wuzif() {
		return mBillingAdditionalPayment1Wuzif;
	}

	public void setmBillingAdditionalPayment1Wuzif(Double mBillingAdditionalPayment1Wuzif) {
		this.mBillingAdditionalPayment1Wuzif = mBillingAdditionalPayment1Wuzif;
	}

	public Double getmBillingAdditionalPayment2Wuzif() {
		return mBillingAdditionalPayment2Wuzif;
	}

	public void setmBillingAdditionalPayment2Wuzif(Double mBillingAdditionalPayment2Wuzif) {
		this.mBillingAdditionalPayment2Wuzif = mBillingAdditionalPayment2Wuzif;
	}

	public double getTekilalaTekefay() {
		return tekilalaTekefay;
	}

	public void setTekilalaTekefay(double tekilalaTekefay) {
		this.tekilalaTekefay = tekilalaTekefay;
	}

	public double getTekilalaBankYetekefele() {
		return tekilalaBankYetekefele;
	}

	public void setTekilalaBankYetekefele(double tekilalaBankYetekefele) {
		this.tekilalaBankYetekefele = tekilalaBankYetekefele;
	}

	public double getTekilalaYetekefele() {
		return tekilalaYetekefele;
	}

	public void setTekilalaYetekefele(double tekilalaYetekefele) {
		this.tekilalaYetekefele = tekilalaYetekefele;
	}

	public double getKecreditYetekefele() {
		return kecreditYetekefele;
	}

	public void setKecreditYetekefele(double kecreditYetekefele) {
		this.kecreditYetekefele = kecreditYetekefele;
	}

	public String getBankPaidConfirmationCode() {
		return bankPaidConfirmationCode;
	}

	public void setBankPaidConfirmationCode(String bankPaidConfirmationCode) {
		this.bankPaidConfirmationCode = bankPaidConfirmationCode;
	}

	public String getRemark() {
		return remark;
	}

	public void setRemark(String remark) {
		this.remark = remark;
	}

	public String getZeroReadingReason() {
		return zeroReadingReason;
	}

	public void setZeroReadingReason(String zeroReadingReason) {
		this.zeroReadingReason = zeroReadingReason;
	}

	public int getZeroReadingWorBzat() {
		return zeroReadingWorBzat;
	}

	public void setZeroReadingWorBzat(int zeroReadingWorBzat) {
		this.zeroReadingWorBzat = zeroReadingWorBzat;
	}

	public String getBankPaidAgentId() {
		return bankPaidAgentId;
	}

	public void setBankPaidAgentId(String bankPaidAgentId) {
		this.bankPaidAgentId = bankPaidAgentId;
	}

	public Date getBankDueDate() {
		return bankDueDate;
	}

	public void setBankDueDate(Date bankDueDate) {
		this.bankDueDate = bankDueDate;
	}

	public Date getBankUploadDate() {
		return bankUploadDate;
	}

	public void setBankUploadDate(Date bankUploadDate) {
		this.bankUploadDate = bankUploadDate;
	}

	public String getuBankPaidAgentId() {
		return uBankPaidAgentId;
	}

	public void setuBankPaidAgentId(String uBankPaidAgentId) {
		this.uBankPaidAgentId = uBankPaidAgentId;
	}

	public BillingBanks getuBillingBank() {
		return uBillingBank;
	}

	public void setuBillingBank(BillingBanks uBillingBank) {
		this.uBillingBank = uBillingBank;
	}

	public Date getuBankDueDate() {
		return uBankDueDate;
	}

	public void setuBankDueDate(Date uBankDueDate) {
		this.uBankDueDate = uBankDueDate;
	}

	public Date getuBankUploadDate() {
		return uBankUploadDate;
	}

	public void setuBankUploadDate(Date uBankUploadDate) {
		this.uBankUploadDate = uBankUploadDate;
	}

	public Date getuMoneyCollectedDate() {
		return uMoneyCollectedDate;
	}

	public void setuMoneyCollectedDate(Date uMoneyCollectedDate) {
		this.uMoneyCollectedDate = uMoneyCollectedDate;
	}

	public String getuBankPaidConfirmationCode() {
		return uBankPaidConfirmationCode;
	}

	public void setuBankPaidConfirmationCode(String uBankPaidConfirmationCode) {
		this.uBankPaidConfirmationCode = uBankPaidConfirmationCode;
	}

	public double getTechemariKitat() {
		return techemariKitat;
	}

	public void setTechemariKitat(double techemariKitat) {
		this.techemariKitat = techemariKitat;
	}

	public String getDerashErrorMessage() {
		return derashErrorMessage;
	}

	public void setDerashErrorMessage(String derashErrorMessage) {
		this.derashErrorMessage = derashErrorMessage;
	}

	public boolean isCurrentMonthKitatTemp() {
		return isCurrentMonthKitatTemp;
	}

	public void setCurrentMonthKitatTemp(boolean isCurrentMonthKitatTemp) {
		this.isCurrentMonthKitatTemp = isCurrentMonthKitatTemp;
	}

	public boolean isBillAdjusted() {
		return isBillAdjusted;
	}

	public void setBillAdjusted(boolean isBillAdjusted) {
		this.isBillAdjusted = isBillAdjusted;
	}

	public boolean isBillAdjustedBankPaid() {
		return isBillAdjustedBankPaid;
	}

	public void setBillAdjustedBankPaid(boolean isBillAdjustedBankPaid) {
		this.isBillAdjustedBankPaid = isBillAdjustedBankPaid;
	}

	public double getOldBill() {
		return oldBill;
	}

	public void setOldBill(double oldBill) {
		this.oldBill = oldBill;
	}

	public double getAdjustmentBill() {
		return adjustmentBill;
	}

	public void setAdjustmentBill(double adjustmentBill) {
		this.adjustmentBill = adjustmentBill;
	}

	public Date getRegisteredDate() {
		return registeredDate;
	}

	public void setRegisteredDate(Date registeredDate) {
		this.registeredDate = registeredDate;
	}

	public Date getModifiedDate() {
		return modifiedDate;
	}

	public void setModifiedDate(Date modifiedDate) {
		this.modifiedDate = modifiedDate;
	}

	public String getStatus() {
		return status;
	}

	public void setStatus(String status) {
		this.status = status;
	}

	public int getAverageConsumption() {
		return averageConsumption;
	}

	public void setAverageConsumption(int averageConsumption) {
		this.averageConsumption = averageConsumption;
	}

	public boolean isOnMove() {
		return isOnMove;
	}

	public void setOnMove(boolean isOnMove) {
		this.isOnMove = isOnMove;
	}

	public boolean isOnMoveCompleted() {
		return isOnMoveCompleted;
	}

	public void setOnMoveCompleted(boolean isOnMoveCompleted) {
		this.isOnMoveCompleted = isOnMoveCompleted;
	}

	public boolean isOnReturnCompleted() {
		return isOnReturnCompleted;
	}

	public void setOnReturnCompleted(boolean isOnReturnCompleted) {
		this.isOnReturnCompleted = isOnReturnCompleted;
	}

	public boolean isOnReturn() {
		return isOnReturn;
	}

	public void setOnReturn(boolean isOnReturn) {
		this.isOnReturn = isOnReturn;
	}

	public int getBackTablePkey() {
		return backTablePkey;
	}

	public void setBackTablePkey(int backTablePkey) {
		this.backTablePkey = backTablePkey;
	}

	public boolean isSendCsv() {
		return isSendCsv;
	}

	public void setSendCsv(boolean isSendCsv) {
		this.isSendCsv = isSendCsv;
	}

	public boolean isDirectToBank() {
		return isDirectToBank;
	}

	public void setDirectToBank(boolean isDirectToBank) {
		this.isDirectToBank = isDirectToBank;
	}

	public String getBillDescriptionBank() {
		return billDescriptionBank;
	}

	public void setBillDescriptionBank(String billDescriptionBank) {
		this.billDescriptionBank = billDescriptionBank;
	}

	public BillingCustomerInfo getBillingCustomerInfo() {
		return billingCustomerInfo;
	}

	public void setBillingCustomerInfo(BillingCustomerInfo billingCustomerInfo) {
		this.billingCustomerInfo = billingCustomerInfo;
	}

	public BillingZeroReadingReason getBillingZeroReadingReason() {
		return billingZeroReadingReason;
	}

	public void setBillingZeroReadingReason(BillingZeroReadingReason billingZeroReadingReason) {
		this.billingZeroReadingReason = billingZeroReadingReason;
	}

	public BillingInvoiceNumbers getBillingInvoiceNumbers() {
		return billingInvoiceNumbers;
	}

	public void setBillingInvoiceNumbers(BillingInvoiceNumbers billingInvoiceNumbers) {
		this.billingInvoiceNumbers = billingInvoiceNumbers;
	}

	public BillingCustomerInfoMeter getBillingCustomerInfoMeter() {
		return billingCustomerInfoMeter;
	}

	public void setBillingCustomerInfoMeter(BillingCustomerInfoMeter billingCustomerInfoMeter) {
		this.billingCustomerInfoMeter = billingCustomerInfoMeter;
	}

	public BillingBanks getBillingBanks() {
		return billingBanks;
	}

	public void setBillingBanks(BillingBanks billingBanks) {
		this.billingBanks = billingBanks;
	}

	public UserAccount getCashierUser() {
		return cashierUser;
	}

	public void setCashierUser(UserAccount cashierUser) {
		this.cashierUser = cashierUser;
	}

	public UserAccount getMobileReaderUser() {
		return mobileReaderUser;
	}

	public void setMobileReaderUser(UserAccount mobileReaderUser) {
		this.mobileReaderUser = mobileReaderUser;
	}

	public UserAccount getModifiedByUser() {
		return modifiedByUser;
	}

	public void setModifiedByUser(UserAccount modifiedByUser) {
		this.modifiedByUser = modifiedByUser;
	}

	// ===================== MardaArif Fields =====================

	public boolean isSendToBankMardaArif() {
		return isSendToBankMardaArif;
	}

	public void setSendToBankMardaArif(boolean isSendToBankMardaArif) {
		this.isSendToBankMardaArif = isSendToBankMardaArif;
	}

	public boolean isBankCanceledMardaArif() {
		return isBankCanceledMardaArif;
	}

	public void setBankCanceledMardaArif(boolean isBankCanceledMardaArif) {
		this.isBankCanceledMardaArif = isBankCanceledMardaArif;
	}

	public boolean isMardaArifPaid() {
		return isMardaArifPaid;
	}

	public void setMardaArifPaid(boolean isMardaArifPaid) {
		this.isMardaArifPaid = isMardaArifPaid;
	}

	public String getmBankPaidAgentId() {
		return mBankPaidAgentId;
	}

	public void setmBankPaidAgentId(String mBankPaidAgentId) {
		this.mBankPaidAgentId = mBankPaidAgentId;
	}

	public BillingBanks getmBillingBank() {
		return mBillingBank;
	}

	public void setmBillingBank(BillingBanks mBillingBank) {
		this.mBillingBank = mBillingBank;
	}

	public Date getmBankDueDate() {
		return mBankDueDate;
	}

	public void setmBankDueDate(Date mBankDueDate) {
		this.mBankDueDate = mBankDueDate;
	}

	public Date getmBankUploadDate() {
		return mBankUploadDate;
	}

	public void setmBankUploadDate(Date mBankUploadDate) {
		this.mBankUploadDate = mBankUploadDate;
	}

	public Date getmMoneyCollectedDate() {
		return mMoneyCollectedDate;
	}

	public void setmMoneyCollectedDate(Date mMoneyCollectedDate) {
		this.mMoneyCollectedDate = mMoneyCollectedDate;
	}

	public String getmBankPaidConfirmationCode() {
		return mBankPaidConfirmationCode;
	}

	public void setmBankPaidConfirmationCode(String mBankPaidConfirmationCode) {
		this.mBankPaidConfirmationCode = mBankPaidConfirmationCode;
	}

	public boolean isJournalPushed() {
		return isJournalPushed;
	}

	public void setJournalPushed(boolean isJournalPushed) {
		this.isJournalPushed = isJournalPushed;
	}

	public String getJournalEntryRef() {
		return journalEntryRef;
	}

	public void setJournalEntryRef(String journalEntryRef) {
		this.journalEntryRef = journalEntryRef;
	}

	public boolean isPaidJournalPushed() {
		return isPaidJournalPushed;
	}

	public void setPaidJournalPushed(boolean isPaidJournalPushed) {
		this.isPaidJournalPushed = isPaidJournalPushed;
	}

	public String getPaidJournalEntryRef() {
		return paidJournalEntryRef;
	}

	public void setPaidJournalEntryRef(String paidJournalEntryRef) {
		this.paidJournalEntryRef = paidJournalEntryRef;
	}

	public String getmBillingAdditionalPayment1ValueLable() {
		return mBillingAdditionalPayment1ValueLable;
	}

	public void setmBillingAdditionalPayment1ValueLable(String mBillingAdditionalPayment1ValueLable) {
		this.mBillingAdditionalPayment1ValueLable = mBillingAdditionalPayment1ValueLable;
	}

	public String getmBillingAdditionalPayment2ValueLable() {
		return mBillingAdditionalPayment2ValueLable;
	}

	public void setmBillingAdditionalPayment2ValueLable(String mBillingAdditionalPayment2ValueLable) {
		this.mBillingAdditionalPayment2ValueLable = mBillingAdditionalPayment2ValueLable;
	}

}
