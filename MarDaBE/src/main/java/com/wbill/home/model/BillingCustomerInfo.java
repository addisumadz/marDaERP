package com.wbill.home.model;

import java.io.Serializable;
import java.util.Date;
import java.util.List;

import com.fasterxml.jackson.annotation.JsonManagedReference;

import jakarta.persistence.*;

/**
 * The persistent class for the billing_customer_info database table.
 * */

@Entity
@Table(name="billing_customer_info")
@NamedQuery(name="BillingCustomerInfo.findAll", query="SELECT b FROM BillingCustomerInfo b")
public class BillingCustomerInfo implements Serializable {
	private static final long serialVersionUID = 1L;

	@Id
	@GeneratedValue(strategy=GenerationType.IDENTITY)
	private int id;

	@Column(name="customer_balance_birr")
	private double customerBalanceBirr;

	@Column(name="customer_photo")
	private String customerPhoto;

	@Column(name="metawokia_scanned")
	private String metawokiaScanned;

	@Lob
	@Column(name="address_description")
	private String addressDescription;

	@Column(name="max_reference")
	private int maxReference;

	@Column(name="full_name")
	private String fullName;

	@Column(name="full_name_eng")
	private String fullNameEng;

	@Column(name="phone_number")
	private String phoneNumber;

	@Column(name="national_id_number")
	private String nationalIdNumber;

	@Column(name="account_number")
	private String accountNumber;

	@Column(name="house_number")
	private String houseNumber;

	@Column(name="meter_number")
	private String meterNumber;

	@Column(name="count_number")
	private Integer countNumber;

	@Column(name="initial_reading")
	private double initialReading;

	@Column(name="initial_consumption")
	private Integer initialConsumption;

	@Temporal(TemporalType.DATE)
	@Column(name="meter_life_start")
	private Date meterLifeStart;

	@Temporal(TemporalType.DATE)
	@Column(name="meter_life_limit")
	private Date meterLifeLimit;

	@Column(name="is_initialized")
	private boolean isInitialized;

	@Column(name="is_initialized_second_time")
	private boolean isInitializedSecondTime;

	@Column(name="prepaid_birr_current_balance")
	private double prepaidBirrCurrentBalance;

	@Lob
	@Column(name="termination_remark")
	private String terminationRemark;

	@Column(name="location_coordination")
	private String locationCoordination;

	@Column(name="qr_code")
	private String qrCode;

	@Column(name="additional_monthly_payment")
	private double additionalMonthlyPayment;

	@Column(name="old_has_penalty")
	private boolean oldHasPenalty;

	@Column(name="old_if_penalty_paid")
	private boolean oldIfPenaltyPaid;

	@Column(name="old_months_list")
	private String oldMonthsList;

	@Column(name="old_kfya_and_penalty_total")
	private double oldKfyaAndPenaltyTotal;

	@Lob
	@Column(name="old_kfya_each_month")
	private String oldKfyaEachMonth;

	@Column(name="old_penlity_number_of_months")
	private int oldPenlityNumberOfMonths;

	@Temporal(TemporalType.DATE)
	@Column(name="registered_date")
	private Date registeredDate;

	@Column(name="registered_year")
	private Integer registeredYear;

	@Column(name="registered_month")
	private Integer registeredMonth;

	@Temporal(TemporalType.DATE)
	@Column(name="canceled_date")
	private Date canceledDate;

	@Column(name="canceled_year")
	private Integer canceledYear;

	@Column(name="canceled_month")
	private Integer canceledMonth;

	@Column(name="was_canceled")
	private boolean wasCanceled;

	@Column(name="is_just_return_from_penality")
	private boolean isJustReturnFromPenality;

	@Temporal(TemporalType.DATE)
	@Column(name="canceled_activated_date")
	private Date canceledActivatedDate;

	@Column(name="tekemach_kfya")
	private double tekemachKfya;

	@Column(name="techemari_field_name")
	private String techemariFieldName;

	@Column(name="techemari_kfya")
	private double techemariKfya;

	private String status;

	@Column(name="cityId")
	private Integer cityId;

	@Column(name="zoneId")
	private Integer zoneId;

	@Column(name="complete_deleted")
	private String completeDeleted;

	@Temporal(TemporalType.TIMESTAMP)
	@Column(name="complete_deleted_date")
	private Date completeDeletedDate;

	@Lob
	@Column(name="kdme_kfya_reasons")
	private String kdmeKfyaReasons;

	//bi-directional many-to-one association to BillingCustomerInfoMeter
	@ManyToOne(fetch = FetchType.LAZY)
	@JoinColumn(name="billing_customer_info_meter_id")
	private BillingCustomerInfoMeter billingCustomerInfoMeter;

	//bi-directional many-to-one association to BillingTerminationReason
	@ManyToOne(fetch = FetchType.LAZY)
	@JoinColumn(name="billing_termination_reason_id")
	private BillingTerminationReason billingTerminationReason;

	//bi-directional many-to-one association to BillingMeterType
	@ManyToOne(fetch = FetchType.LAZY)
	@JoinColumn(name="billing_meter_type_id")
	private BillingMeterType billingMeterType;

	//bi-directional many-to-one association to BillingModeOfWaterService
	@ManyToOne(fetch = FetchType.LAZY)
	@JoinColumn(name="billing_mode_of_water_service_id")
	private BillingModeOfWaterService billingModeOfWaterService;

	//bi-directional many-to-one association to UserAccount
	@ManyToOne(fetch = FetchType.LAZY)
	@JoinColumn(name="assigned_reader_id")
	private UserAccount userAccount;

	//bi-directional many-to-one association to Branch
	@ManyToOne(fetch = FetchType.LAZY)
	@JoinColumn(name="branchs_id")
	private Branch branch;

	//bi-directional many-to-one association to AddressStreet
	@ManyToOne(fetch = FetchType.LAZY)
	@JoinColumn(name="address_streets_id")
	private AddressStreets addressStreet;

	//bi-directional many-to-one association to AddressKetena
	@ManyToOne(fetch = FetchType.LAZY)
	@JoinColumn(name="address_ketena_id")
	private AddressKetena addressKetena;

	//bi-directional many-to-one association to BillingCustomerType
	@ManyToOne(fetch = FetchType.LAZY)
	@JoinColumn(name="customer_type_id")
	private BillingCustomerType billingCustomerType;

	//bi-directional many-to-one association to BillingMeterSize
	@ManyToOne(fetch = FetchType.LAZY)
	@JoinColumn(name="meter_size_id")
	private BillingMeterSize billingMeterSize;

	//bi-directional one-to-many association to BillingReading
	@OneToMany(mappedBy="billingCustomerInfo", fetch = FetchType.LAZY)
	@JsonManagedReference
	private List<BillingReading> billingReadings;

	public BillingCustomerInfo() {
	}

	// Getters and Setters ...
	public int getId() {
		return this.id;
	}

	public void setId(int id) {
		this.id = id;
	}

	public double getCustomerBalanceBirr() {
		return this.customerBalanceBirr;
	}

	public void setCustomerBalanceBirr(double customerBalanceBirr) {
		this.customerBalanceBirr = customerBalanceBirr;
	}

	public String getCustomerPhoto() {
		return this.customerPhoto;
	}

	public void setCustomerPhoto(String customerPhoto) {
		this.customerPhoto = customerPhoto;
	}

	public String getMetawokiaScanned() {
		return this.metawokiaScanned;
	}

	public void setMetawokiaScanned(String metawokiaScanned) {
		this.metawokiaScanned = metawokiaScanned;
	}

	public String getAddressDescription() {
		return this.addressDescription;
	}

	public void setAddressDescription(String addressDescription) {
		this.addressDescription = addressDescription;
	}

	public int getMaxReference() {
		return this.maxReference;
	}

	public void setMaxReference(int maxReference) {
		this.maxReference = maxReference;
	}

	public String getFullName() {
		return this.fullName;
	}

	public void setFullName(String fullName) {
		this.fullName = fullName;
	}

	public String getFullNameEng() {
		return this.fullNameEng;
	}

	public void setFullNameEng(String fullNameEng) {
		this.fullNameEng = fullNameEng;
	}

	public String getPhoneNumber() {
		return this.phoneNumber;
	}

	public void setPhoneNumber(String phoneNumber) {
		this.phoneNumber = phoneNumber;
	}

	public String getNationalIdNumber() {
		return this.nationalIdNumber;
	}

	public void setNationalIdNumber(String nationalIdNumber) {
		this.nationalIdNumber = nationalIdNumber;
	}

	public String getAccountNumber() {
		return this.accountNumber;
	}

	public void setAccountNumber(String accountNumber) {
		this.accountNumber = accountNumber;
	}

	public String getHouseNumber() {
		return this.houseNumber;
	}

	public void setHouseNumber(String houseNumber) {
		this.houseNumber = houseNumber;
	}

	public String getMeterNumber() {
		return this.meterNumber;
	}

	public void setMeterNumber(String meterNumber) {
		this.meterNumber = meterNumber;
	}

	public Integer getCountNumber() {
		return this.countNumber;
	}

	public void setCountNumber(Integer countNumber) {
		this.countNumber = countNumber;
	}

	public double getInitialReading() {
		return this.initialReading;
	}

	public void setInitialReading(double initialReading) {
		this.initialReading = initialReading;
	}

	public Integer getInitialConsumption() {
		return this.initialConsumption;
	}

	public void setInitialConsumption(Integer initialConsumption) {
		this.initialConsumption = initialConsumption;
	}

	public Date getMeterLifeStart() {
		return this.meterLifeStart;
	}

	public void setMeterLifeStart(Date meterLifeStart) {
		this.meterLifeStart = meterLifeStart;
	}

	public Date getMeterLifeLimit() {
		return this.meterLifeLimit;
	}

	public void setMeterLifeLimit(Date meterLifeLimit) {
		this.meterLifeLimit = meterLifeLimit;
	}

	public boolean getIsInitialized() {
		return this.isInitialized;
	}

	public void setIsInitialized(boolean isInitialized) {
		this.isInitialized = isInitialized;
	}

	public boolean getIsInitializedSecondTime() {
		return this.isInitializedSecondTime;
	}

	public void setIsInitializedSecondTime(boolean isInitializedSecondTime) {
		this.isInitializedSecondTime = isInitializedSecondTime;
	}

	public double getPrepaidBirrCurrentBalance() {
		return this.prepaidBirrCurrentBalance;
	}

	public void setPrepaidBirrCurrentBalance(double prepaidBirrCurrentBalance) {
		this.prepaidBirrCurrentBalance = prepaidBirrCurrentBalance;
	}

	public String getTerminationRemark() {
		return this.terminationRemark;
	}

	public void setTerminationRemark(String terminationRemark) {
		this.terminationRemark = terminationRemark;
	}

	public String getLocationCoordination() {
		return this.locationCoordination;
	}

	public void setLocationCoordination(String locationCoordination) {
		this.locationCoordination = locationCoordination;
	}

	public String getQrCode() {
		return this.qrCode;
	}

	public void setQrCode(String qrCode) {
		this.qrCode = qrCode;
	}

	public double getAdditionalMonthlyPayment() {
		return this.additionalMonthlyPayment;
	}

	public void setAdditionalMonthlyPayment(double additionalMonthlyPayment) {
		this.additionalMonthlyPayment = additionalMonthlyPayment;
	}

	public boolean getOldHasPenalty() {
		return this.oldHasPenalty;
	}

	public void setOldHasPenalty(boolean oldHasPenalty) {
		this.oldHasPenalty = oldHasPenalty;
	}

	public boolean getOldIfPenaltyPaid() {
		return this.oldIfPenaltyPaid;
	}

	public void setOldIfPenaltyPaid(boolean oldIfPenaltyPaid) {
		this.oldIfPenaltyPaid = oldIfPenaltyPaid;
	}

	public String getOldMonthsList() {
		return this.oldMonthsList;
	}

	public void setOldMonthsList(String oldMonthsList) {
		this.oldMonthsList = oldMonthsList;
	}

	public double getOldKfyaAndPenaltyTotal() {
		return this.oldKfyaAndPenaltyTotal;
	}

	public void setOldKfyaAndPenaltyTotal(double oldKfyaAndPenaltyTotal) {
		this.oldKfyaAndPenaltyTotal = oldKfyaAndPenaltyTotal;
	}

	public String getOldKfyaEachMonth() {
		return this.oldKfyaEachMonth;
	}

	public void setOldKfyaEachMonth(String oldKfyaEachMonth) {
		this.oldKfyaEachMonth = oldKfyaEachMonth;
	}

	public int getOldPenlityNumberOfMonths() {
		return this.oldPenlityNumberOfMonths;
	}

	public void setOldPenlityNumberOfMonths(int oldPenlityNumberOfMonths) {
		this.oldPenlityNumberOfMonths = oldPenlityNumberOfMonths;
	}

	public Date getRegisteredDate() {
		return this.registeredDate;
	}

	public void setRegisteredDate(Date registeredDate) {
		this.registeredDate = registeredDate;
	}

	public Integer getRegisteredYear() {
		return this.registeredYear;
	}

	public void setRegisteredYear(Integer registeredYear) {
		this.registeredYear = registeredYear;
	}

	public Integer getRegisteredMonth() {
		return this.registeredMonth;
	}

	public void setRegisteredMonth(Integer registeredMonth) {
		this.registeredMonth = registeredMonth;
	}

	public Date getCanceledDate() {
		return this.canceledDate;
	}

	public void setCanceledDate(Date canceledDate) {
		this.canceledDate = canceledDate;
	}

	public Integer getCanceledYear() {
		return this.canceledYear;
	}

	public void setCanceledYear(Integer canceledYear) {
		this.canceledYear = canceledYear;
	}

	public Integer getCanceledMonth() {
		return this.canceledMonth;
	}

	public void setCanceledMonth(Integer canceledMonth) {
		this.canceledMonth = canceledMonth;
	}

	public boolean getWasCanceled() {
		return this.wasCanceled;
	}

	public void setWasCanceled(boolean wasCanceled) {
		this.wasCanceled = wasCanceled;
	}

	public boolean getIsJustReturnFromPenality() {
		return this.isJustReturnFromPenality;
	}

	public void setIsJustReturnFromPenality(boolean isJustReturnFromPenality) {
		this.isJustReturnFromPenality = isJustReturnFromPenality;
	}

	public Date getCanceledActivatedDate() {
		return this.canceledActivatedDate;
	}

	public void setCanceledActivatedDate(Date canceledActivatedDate) {
		this.canceledActivatedDate = canceledActivatedDate;
	}

	public double getTekemachKfya() {
		return this.tekemachKfya;
	}

	public void setTekemachKfya(double tekemachKfya) {
		this.tekemachKfya = tekemachKfya;
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

	public String getStatus() {
		return this.status;
	}

	public void setStatus(String status) {
		this.status = status;
	}

	public Integer getCityId() {
		return this.cityId;
	}

	public void setCityId(Integer cityId) {
		this.cityId = cityId;
	}

	public Integer getZoneId() {
		return this.zoneId;
	}

	public void setZoneId(Integer zoneId) {
		this.zoneId = zoneId;
	}

	public String getCompleteDeleted() {
		return this.completeDeleted;
	}

	public void setCompleteDeleted(String completeDeleted) {
		this.completeDeleted = completeDeleted;
	}

	public Date getCompleteDeletedDate() {
		return this.completeDeletedDate;
	}

	public void setCompleteDeletedDate(Date completeDeletedDate) {
		this.completeDeletedDate = completeDeletedDate;
	}

	public String getKdmeKfyaReasons() {
		return this.kdmeKfyaReasons;
	}

	public void setKdmeKfyaReasons(String kdmeKfyaReasons) {
		this.kdmeKfyaReasons = kdmeKfyaReasons;
	}

	public BillingCustomerInfoMeter getBillingCustomerInfoMeter() {
		return this.billingCustomerInfoMeter;
	}

	public void setBillingCustomerInfoMeter(BillingCustomerInfoMeter billingCustomerInfoMeter) {
		this.billingCustomerInfoMeter = billingCustomerInfoMeter;
	}

	public BillingTerminationReason getBillingTerminationReason() {
		return this.billingTerminationReason;
	}

	public void setBillingTerminationReason(BillingTerminationReason billingTerminationReason) {
		this.billingTerminationReason = billingTerminationReason;
	}

	public BillingMeterType getBillingMeterType() {
		return this.billingMeterType;
	}

	public void setBillingMeterType(BillingMeterType billingMeterType) {
		this.billingMeterType = billingMeterType;
	}

	public BillingModeOfWaterService getBillingModeOfWaterService() {
		return this.billingModeOfWaterService;
	}

	public void setBillingModeOfWaterService(BillingModeOfWaterService billingModeOfWaterService) {
		this.billingModeOfWaterService = billingModeOfWaterService;
	}

	public UserAccount getUserAccount() {
		return this.userAccount;
	}

	public void setUserAccount(UserAccount userAccount) {
		this.userAccount = userAccount;
	}

	public Branch getBranch() {
		return this.branch;
	}

	public void setBranch(Branch branch) {
		this.branch = branch;
	}

	public AddressStreets getAddressStreet() {
		return this.addressStreet;
	}

	public void setAddressStreet(AddressStreets addressStreet) {
		this.addressStreet = addressStreet;
	}

	public AddressKetena getAddressKetena() {
		return this.addressKetena;
	}

	public void setAddressKetena(AddressKetena addressKetena) {
		this.addressKetena = addressKetena;
	}

	public BillingCustomerType getBillingCustomerType() {
		return this.billingCustomerType;
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

	public List<BillingReading> getBillingReadings() {
		return this.billingReadings;
	}

	public void setBillingReadings(List<BillingReading> billingReadings) {
		this.billingReadings = billingReadings;
	}

	public BillingReading addBillingReading(BillingReading billingReading) {
		getBillingReadings().add(billingReading);
		billingReading.setBillingCustomerInfo(this);

		return billingReading;
	}

	public BillingReading removeBillingReading(BillingReading billingReading) {
		getBillingReadings().remove(billingReading);
		billingReading.setBillingCustomerInfo(null);

		return billingReading;
	}

}
