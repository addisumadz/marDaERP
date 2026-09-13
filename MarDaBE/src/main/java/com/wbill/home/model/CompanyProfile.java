package com.wbill.home.model;

import jakarta.persistence.*;
import java.io.Serializable;
import java.time.LocalDate;

@Entity
@Table(name="company_profile")
@NamedQuery(name="CompanyProfile.findAll", query="SELECT c FROM CompanyProfile c")
public class CompanyProfile implements Serializable {
	private static final long serialVersionUID = 1L;

	@Id
	@GeneratedValue(strategy=GenerationType.IDENTITY)
	private Integer id;

	@Column(name="company_name", nullable=false, length=200)
	private String companyName;

	@Column(name="company_name_amh", nullable=false, length=300)
	private String companyNameAmh;

	@Column(name="tin", length=100)
	private String tin;

	@Column(name="office_phone_number", length=20)
	private String officePhoneNumber;

	@Column(name="mobile_phone_number", length=20)
	private String mobilePhoneNumber;

	@Column(name="email", length=100)
	private String email;

	@Column(name="po_box", length=20)
	private String poBox;

	@Column(name="fax_number", length=20)
	private String faxNumber;

	@Column(name="website_address", length=100)
	private String websiteAddress;

	@Column(name="location_eng", length=100)
	private String locationEng;

	@Column(name="location_amh", length=100)
	private String locationAmh;

	@Column(name="report_header", length=400)
	private String reportHeader;

	@Column(name="report_footer", length=400)
	private String reportFooter;

	@Column(name="campany_moto", length=400)
	private String companyMoto;

	@Column(name="default_page_row", nullable=false)
	private int defaultPageRow;

	@Column(name="sales_with_negative_stock", nullable=false)
	private boolean salesWithNegativeStock;

	@Column(name="activate_email", nullable=false)
	private boolean activateEmail;

	@Column(name="activate_sms", nullable=false)
	private boolean activateSms;

	@Column(name="show_import_reading_excel", nullable=false)
	private boolean showImportReadingExcel;

	@Column(name="active_reading_date")
	private LocalDate activeReadingDate;

	@Column(name="active_billing_month")
	private LocalDate activeBillingMonth;

	@Column(name="activate_force_all_recorded", nullable=false)
	private boolean activateForceAllRecorded;

	@Column(name="defaul_bill_generate_is_money_collected", nullable=false)
	private boolean defaultBillGenerateIsMoneyCollected;

	@Column(name="is_connected_to_bank", nullable=false)
	private boolean connectedToBank;

	@Column(name="auto_give_account_number", nullable=false)
	private boolean autoGiveAccountNumber;

	@Column(name="is_account_number_tag_with_kebele", nullable=false)
	private boolean accountNumberTagWithKebele;

	@Column(name="account_number_kebele_length", nullable=false)
	private int accountNumberKebeleLength;

	@Column(name="activate_dashboard_connect_to_derash", nullable=false)
	private boolean activateDashboardConnectToDerash;

	@Column(name="number_of_payment_dates", nullable=false)
	private int numberOfPaymentDates;

	@Lob
	@Column(name="template_bill_sms", columnDefinition="TEXT")
	private String templateBillSms;

	@Lob
	@Column(name="template_customer_reply_bill_sms", columnDefinition="TEXT")
	private String templateCustomerReplyBillSms;

	@Lob
	@Column(name="template_derash_message", columnDefinition="TEXT")
	private String templateDerashMessage;

	@Column(name="activate_user", nullable=false)
	private boolean activateUser;

	@Column(name="activate_second_user", length=400)
	private String activateSecondUser;

	@Column(name="account_number_company_short_code", length=10)
	private String accountNumberCompanyShortCode;

	@Column(name="status", nullable=false, length=20)
	private String status;

	@Column(name="deleted", nullable=false, length=20)
	private String deleted;

	@Column(name="activate_manual_mrn", nullable=false)
	private boolean activateManualMrn;

	@Column(name="u_company_uri", nullable=false, length=200)
	private String uCompanyUri;

	@Column(name="u_company_file_url", nullable=false, length=100)
	private String uCompanyFileUrl;

	@Column(name="u_company_key", nullable=false, length=400)
	private String uCompanyKey;

	@Column(name="d_company_uri", nullable=false, length=100)
	private String dCompanyUri;

	@Column(name="d_company_key", nullable=false, length=400)
	private String dCompanyKey;

	@Column(name="d_company_secret", nullable=false, length=400)
	private String dCompanySecret;

	@Column(name="d_file_username", length=50)
	private String dFileUsername;

	@Column(name="d_file_password", length=100)
	private String dFilePassword;

	@Column(name="d_file_authentication_url", length=100)
	private String dFileAuthenticationUrl;

	@Column(name="d_file_upload_url", length=100)
	private String dFileUploadUrl;

	@Column(name="is_connected_to_derash", nullable=false)
	private boolean connectedToDerash;

	@Column(name="is_connected_to_unicash", nullable=false)
	private boolean connectedToUnicash;

	@Column(name="m_company_uri", length=200)
	private String mCompanyUri;

	@Column(name="m_company_file_url", length=100)
	private String mCompanyFileUrl;

	@Column(name="m_company_key", length=400)
	private String mCompanyKey;

	@Column(name="m_billing_additional_payment_1_value_lable", length=200)
	private String mBillingAdditionalPayment1ValueLable;

	@Column(name="m_billing_additional_payment_2_value_lable", length=200)
	private String mBillingAdditionalPayment2ValueLable;

	@Column(name="m_billing_additional_payment_1_value", nullable=true)
	private Double mBillingAdditionalPayment1Value;

	@Column(name="m_billing_additional_payment_2_value", nullable=true)
	private Double mBillingAdditionalPayment2Value;

	@Column(name="m_billing_additional_payment_1_value_option", length=50)
	private String mBillingAdditionalPayment1ValueOption;

	@Column(name="m_billing_additional_payment_2_value_option", length=50)
	private String mBillingAdditionalPayment2ValueOption;

	@Column(name="is_connected_to_mardaarif", nullable=false)
	private boolean connectedToMardaArif;

	@Column(name="number_of_digits_for_customer", nullable=false)
	private int numberOfDigitsForCustomer;

	@Column(name="sebsabi", length=100)
	private String sebsabi;

	@Column(name="terekabi", length=100)
	private String terekabi;

	@Column(name="arekakabi", length=100)
	private String arekakabi;

	@Column(name="halafinet1", length=100)
	private String halafinet1;

	@Column(name="halafinet2", length=100)
	private String halafinet2;

	@Column(name="halafinet3", length=100)
	private String halafinet3;

	@Column(name="calendar_add_active_month_forward", nullable=false)
	private int calendarAddActiveMonthForward;

	@Column(name="over_ride_mobile_reading_month", nullable=false)
	private boolean overRideMobileReadingMonth;

	@Column(name="allow_enter_reading_while_other_month_not_sent_to_zgjt", nullable=false)
	private boolean allowEnterReadingWhileOtherMonthNotSentToZgjt;

	@Column(name="is_on_bill_preparation", nullable=false)
	private boolean onBillPreparation;

	@Column(name="bill_preparation_browser_id", length=100)
	private String billPreparationBrowserId;

	@Column(name="filename_1", length=200)
	private String filename1;

	@Column(name="filename_2", length=200)
	private String filename2;

	@Column(name="filename_3", length=200)
	private String filename3;

	@Column(name="filename_4", length=200)
	private String filename4;

	@Column(name="filename_5", length=200)
	private String filename5;

	@Column(name="active_budget_year_code", length=100)
	private String activeBudgetYearCode;

	@Column(name="allow_under_reading", nullable=false)
	private boolean allowUnderReading;

	@Column(name="is_office_payment_open", nullable=false)
	private boolean officePaymentOpen;

	@Column(name="is_allow_negative", nullable=false)
	private boolean allowNegative;

	@Column(name="budget_year", nullable=false)
	private int budgetYear;

	@Column(name="budget_year_from_to", length=100)
	private String budgetYearFromTo;

	@Column(name="population_size", nullable=false)
	private int populationSize;

	@Column(name="average_family_size", nullable=false)
	private int averageFamilySize;

	@Column(name="number_of_bono_households", nullable=false)
	private int numberOfBonoHouseholds;

	@Column(name="total_number_of_full_time_staff", nullable=false)
	private int totalNumberOfFullTimeStaff;

	@Column(name="context_billing_water", length=20)
	private String contextBillingWater;

	@Column(name="context_base_ip_address", length=20)
	private String contextBaseIpAddress;

	public CompanyProfile() {
	}

	public Integer getId() {
		return this.id;
	}

	public void setId(Integer id) {
		this.id = id;
	}

	public String getCompanyName() {
		return this.companyName;
	}

	public void setCompanyName(String companyName) {
		this.companyName = companyName;
	}

	public String getCompanyNameAmh() {
		return this.companyNameAmh;
	}

	public void setCompanyNameAmh(String companyNameAmh) {
		this.companyNameAmh = companyNameAmh;
	}

	public String getTin() {
		return this.tin;
	}

	public void setTin(String tin) {
		this.tin = tin;
	}

	public String getOfficePhoneNumber() {
		return this.officePhoneNumber;
	}

	public void setOfficePhoneNumber(String officePhoneNumber) {
		this.officePhoneNumber = officePhoneNumber;
	}

	public String getMobilePhoneNumber() {
		return this.mobilePhoneNumber;
	}

	public void setMobilePhoneNumber(String mobilePhoneNumber) {
		this.mobilePhoneNumber = mobilePhoneNumber;
	}

	public String getEmail() {
		return this.email;
	}

	public void setEmail(String email) {
		this.email = email;
	}

	public String getPoBox() {
		return this.poBox;
	}

	public void setPoBox(String poBox) {
		this.poBox = poBox;
	}

	public String getFaxNumber() {
		return this.faxNumber;
	}

	public void setFaxNumber(String faxNumber) {
		this.faxNumber = faxNumber;
	}

	public String getWebsiteAddress() {
		return this.websiteAddress;
	}

	public void setWebsiteAddress(String websiteAddress) {
		this.websiteAddress = websiteAddress;
	}

	public String getLocationEng() {
		return this.locationEng;
	}

	public void setLocationEng(String locationEng) {
		this.locationEng = locationEng;
	}

	public String getLocationAmh() {
		return this.locationAmh;
	}

	public void setLocationAmh(String locationAmh) {
		this.locationAmh = locationAmh;
	}

	public String getReportHeader() {
		return this.reportHeader;
	}

	public void setReportHeader(String reportHeader) {
		this.reportHeader = reportHeader;
	}

	public String getReportFooter() {
		return this.reportFooter;
	}

	public void setReportFooter(String reportFooter) {
		this.reportFooter = reportFooter;
	}

	public String getCompanyMoto() {
		return this.companyMoto;
	}

	public void setCompanyMoto(String companyMoto) {
		this.companyMoto = companyMoto;
	}

	public int getDefaultPageRow() {
		return this.defaultPageRow;
	}

	public void setDefaultPageRow(int defaultPageRow) {
		this.defaultPageRow = defaultPageRow;
	}

	public boolean isSalesWithNegativeStock() {
		return this.salesWithNegativeStock;
	}

	public void setSalesWithNegativeStock(boolean salesWithNegativeStock) {
		this.salesWithNegativeStock = salesWithNegativeStock;
	}

	public boolean isActivateEmail() {
		return this.activateEmail;
	}

	public void setActivateEmail(boolean activateEmail) {
		this.activateEmail = activateEmail;
	}

	public boolean isActivateSms() {
		return this.activateSms;
	}

	public void setActivateSms(boolean activateSms) {
		this.activateSms = activateSms;
	}

	public boolean isShowImportReadingExcel() {
		return this.showImportReadingExcel;
	}

	public void setShowImportReadingExcel(boolean showImportReadingExcel) {
		this.showImportReadingExcel = showImportReadingExcel;
	}

	public LocalDate getActiveReadingDate() {
		return this.activeReadingDate;
	}

	public void setActiveReadingDate(LocalDate activeReadingDate) {
		this.activeReadingDate = activeReadingDate;
	}

	public LocalDate getActiveBillingMonth() {
		return this.activeBillingMonth;
	}

	public void setActiveBillingMonth(LocalDate activeBillingMonth) {
		this.activeBillingMonth = activeBillingMonth;
	}

	public boolean isActivateForceAllRecorded() {
		return this.activateForceAllRecorded;
	}

	public void setActivateForceAllRecorded(boolean activateForceAllRecorded) {
		this.activateForceAllRecorded = activateForceAllRecorded;
	}

	public boolean isDefaultBillGenerateIsMoneyCollected() {
		return this.defaultBillGenerateIsMoneyCollected;
	}

	public void setDefaultBillGenerateIsMoneyCollected(boolean defaultBillGenerateIsMoneyCollected) {
		this.defaultBillGenerateIsMoneyCollected = defaultBillGenerateIsMoneyCollected;
	}

	public boolean isConnectedToBank() {
		return this.connectedToBank;
	}

	public void setConnectedToBank(boolean connectedToBank) {
		this.connectedToBank = connectedToBank;
	}

	public boolean isAutoGiveAccountNumber() {
		return this.autoGiveAccountNumber;
	}

	public void setAutoGiveAccountNumber(boolean autoGiveAccountNumber) {
		this.autoGiveAccountNumber = autoGiveAccountNumber;
	}

	public boolean isAccountNumberTagWithKebele() {
		return this.accountNumberTagWithKebele;
	}

	public void setAccountNumberTagWithKebele(boolean accountNumberTagWithKebele) {
		this.accountNumberTagWithKebele = accountNumberTagWithKebele;
	}

	public int getAccountNumberKebeleLength() {
		return this.accountNumberKebeleLength;
	}

	public void setAccountNumberKebeleLength(int accountNumberKebeleLength) {
		this.accountNumberKebeleLength = accountNumberKebeleLength;
	}

	public boolean isActivateDashboardConnectToDerash() {
		return this.activateDashboardConnectToDerash;
	}

	public void setActivateDashboardConnectToDerash(boolean activateDashboardConnectToDerash) {
		this.activateDashboardConnectToDerash = activateDashboardConnectToDerash;
	}

	public int getNumberOfPaymentDates() {
		return this.numberOfPaymentDates;
	}

	public void setNumberOfPaymentDates(int numberOfPaymentDates) {
		this.numberOfPaymentDates = numberOfPaymentDates;
	}

	public String getTemplateBillSms() {
		return this.templateBillSms;
	}

	public void setTemplateBillSms(String templateBillSms) {
		this.templateBillSms = templateBillSms;
	}

	public String getTemplateCustomerReplyBillSms() {
		return this.templateCustomerReplyBillSms;
	}

	public void setTemplateCustomerReplyBillSms(String templateCustomerReplyBillSms) {
		this.templateCustomerReplyBillSms = templateCustomerReplyBillSms;
	}

	public String getTemplateDerashMessage() {
		return this.templateDerashMessage;
	}

	public void setTemplateDerashMessage(String templateDerashMessage) {
		this.templateDerashMessage = templateDerashMessage;
	}

	public boolean isActivateUser() {
		return this.activateUser;
	}

	public void setActivateUser(boolean activateUser) {
		this.activateUser = activateUser;
	}

	public String getActivateSecondUser() {
		return this.activateSecondUser;
	}

	public void setActivateSecondUser(String activateSecondUser) {
		this.activateSecondUser = activateSecondUser;
	}

	public String getAccountNumberCompanyShortCode() {
		return this.accountNumberCompanyShortCode;
	}

	public void setAccountNumberCompanyShortCode(String accountNumberCompanyShortCode) {
		this.accountNumberCompanyShortCode = accountNumberCompanyShortCode;
	}

	public String getStatus() {
		return this.status;
	}

	public void setStatus(String status) {
		this.status = status;
	}

	public String getDeleted() {
		return this.deleted;
	}

	public void setDeleted(String deleted) {
		this.deleted = deleted;
	}

	public boolean isActivateManualMrn() {
		return this.activateManualMrn;
	}

	public void setActivateManualMrn(boolean activateManualMrn) {
		this.activateManualMrn = activateManualMrn;
	}

	public String getuCompanyUri() {
		return this.uCompanyUri;
	}

	public void setuCompanyUri(String uCompanyUri) {
		this.uCompanyUri = uCompanyUri;
	}

	public String getuCompanyFileUrl() {
		return this.uCompanyFileUrl;
	}

	public void setuCompanyFileUrl(String uCompanyFileUrl) {
		this.uCompanyFileUrl = uCompanyFileUrl;
	}

	public String getuCompanyKey() {
		return this.uCompanyKey;
	}

	public void setuCompanyKey(String uCompanyKey) {
		this.uCompanyKey = uCompanyKey;
	}

	public String getdCompanyUri() {
		return this.dCompanyUri;
	}

	public void setdCompanyUri(String dCompanyUri) {
		this.dCompanyUri = dCompanyUri;
	}

	public String getdCompanyKey() {
		return this.dCompanyKey;
	}

	public void setdCompanyKey(String dCompanyKey) {
		this.dCompanyKey = dCompanyKey;
	}

	public String getdCompanySecret() {
		return this.dCompanySecret;
	}

	public void setdCompanySecret(String dCompanySecret) {
		this.dCompanySecret = dCompanySecret;
	}

	public String getdFileUsername() {
		return this.dFileUsername;
	}

	public void setdFileUsername(String dFileUsername) {
		this.dFileUsername = dFileUsername;
	}

	public String getdFilePassword() {
		return this.dFilePassword;
	}

	public void setdFilePassword(String dFilePassword) {
		this.dFilePassword = dFilePassword;
	}

	public String getdFileAuthenticationUrl() {
		return this.dFileAuthenticationUrl;
	}

	public void setdFileAuthenticationUrl(String dFileAuthenticationUrl) {
		this.dFileAuthenticationUrl = dFileAuthenticationUrl;
	}

	public String getdFileUploadUrl() {
		return this.dFileUploadUrl;
	}

	public void setdFileUploadUrl(String dFileUploadUrl) {
		this.dFileUploadUrl = dFileUploadUrl;
	}

	public boolean isConnectedToDerash() {
		return this.connectedToDerash;
	}

	public void setConnectedToDerash(boolean connectedToDerash) {
		this.connectedToDerash = connectedToDerash;
	}

	public boolean isConnectedToUnicash() {
		return this.connectedToUnicash;
	}

	public void setConnectedToUnicash(boolean connectedToUnicash) {
		this.connectedToUnicash = connectedToUnicash;
	}

	public int getNumberOfDigitsForCustomer() {
		return this.numberOfDigitsForCustomer;
	}

	public void setNumberOfDigitsForCustomer(int numberOfDigitsForCustomer) {
		this.numberOfDigitsForCustomer = numberOfDigitsForCustomer;
	}

	public String getSebsabi() {
		return this.sebsabi;
	}

	public void setSebsabi(String sebsabi) {
		this.sebsabi = sebsabi;
	}

	public String getTerekabi() {
		return this.terekabi;
	}

	public void setTerekabi(String terekabi) {
		this.terekabi = terekabi;
	}

	public String getArekakabi() {
		return this.arekakabi;
	}

	public void setArekakabi(String arekakabi) {
		this.arekakabi = arekakabi;
	}

	public String getHalafinet1() {
		return this.halafinet1;
	}

	public void setHalafinet1(String halafinet1) {
		this.halafinet1 = halafinet1;
	}

	public String getHalafinet2() {
		return this.halafinet2;
	}

	public void setHalafinet2(String halafinet2) {
		this.halafinet2 = halafinet2;
	}

	public String getHalafinet3() {
		return this.halafinet3;
	}

	public void setHalafinet3(String halafinet3) {
		this.halafinet3 = halafinet3;
	}

	public int getCalendarAddActiveMonthForward() {
		return this.calendarAddActiveMonthForward;
	}

	public void setCalendarAddActiveMonthForward(int calendarAddActiveMonthForward) {
		this.calendarAddActiveMonthForward = calendarAddActiveMonthForward;
	}

	public boolean isOverRideMobileReadingMonth() {
		return this.overRideMobileReadingMonth;
	}

	public void setOverRideMobileReadingMonth(boolean overRideMobileReadingMonth) {
		this.overRideMobileReadingMonth = overRideMobileReadingMonth;
	}

	public boolean isAllowEnterReadingWhileOtherMonthNotSentToZgjt() {
		return this.allowEnterReadingWhileOtherMonthNotSentToZgjt;
	}

	public void setAllowEnterReadingWhileOtherMonthNotSentToZgjt(boolean allowEnterReadingWhileOtherMonthNotSentToZgjt) {
		this.allowEnterReadingWhileOtherMonthNotSentToZgjt = allowEnterReadingWhileOtherMonthNotSentToZgjt;
	}

	public boolean isOnBillPreparation() {
		return this.onBillPreparation;
	}

	public void setOnBillPreparation(boolean onBillPreparation) {
		this.onBillPreparation = onBillPreparation;
	}

	public String getBillPreparationBrowserId() {
		return this.billPreparationBrowserId;
	}

	public void setBillPreparationBrowserId(String billPreparationBrowserId) {
		this.billPreparationBrowserId = billPreparationBrowserId;
	}

	public String getFilename1() {
		return this.filename1;
	}

	public void setFilename1(String filename1) {
		this.filename1 = filename1;
	}

	public String getFilename2() {
		return this.filename2;
	}

	public void setFilename2(String filename2) {
		this.filename2 = filename2;
	}

	public String getFilename3() {
		return this.filename3;
	}

	public void setFilename3(String filename3) {
		this.filename3 = filename3;
	}

	public String getFilename4() {
		return this.filename4;
	}

	public void setFilename4(String filename4) {
		this.filename4 = filename4;
	}

	public String getFilename5() {
		return this.filename5;
	}

	public void setFilename5(String filename5) {
		this.filename5 = filename5;
	}

	public String getActiveBudgetYearCode() {
		return this.activeBudgetYearCode;
	}

	public void setActiveBudgetYearCode(String activeBudgetYearCode) {
		this.activeBudgetYearCode = activeBudgetYearCode;
	}

	public boolean isAllowUnderReading() {
		return this.allowUnderReading;
	}

	public void setAllowUnderReading(boolean allowUnderReading) {
		this.allowUnderReading = allowUnderReading;
	}

	public boolean isOfficePaymentOpen() {
		return this.officePaymentOpen;
	}

	public void setOfficePaymentOpen(boolean officePaymentOpen) {
		this.officePaymentOpen = officePaymentOpen;
	}

	public boolean isAllowNegative() {
		return this.allowNegative;
	}

	public void setAllowNegative(boolean allowNegative) {
		this.allowNegative = allowNegative;
	}

	public int getBudgetYear() {
		return this.budgetYear;
	}

	public void setBudgetYear(int budgetYear) {
		this.budgetYear = budgetYear;
	}

	public String getBudgetYearFromTo() {
		return this.budgetYearFromTo;
	}

	public void setBudgetYearFromTo(String budgetYearFromTo) {
		this.budgetYearFromTo = budgetYearFromTo;
	}

	public int getPopulationSize() {
		return this.populationSize;
	}

	public void setPopulationSize(int populationSize) {
		this.populationSize = populationSize;
	}

	public int getAverageFamilySize() {
		return this.averageFamilySize;
	}

	public void setAverageFamilySize(int averageFamilySize) {
		this.averageFamilySize = averageFamilySize;
	}

	public int getNumberOfBonoHouseholds() {
		return this.numberOfBonoHouseholds;
	}

	public void setNumberOfBonoHouseholds(int numberOfBonoHouseholds) {
		this.numberOfBonoHouseholds = numberOfBonoHouseholds;
	}

	public int getTotalNumberOfFullTimeStaff() {
		return this.totalNumberOfFullTimeStaff;
	}

	public void setTotalNumberOfFullTimeStaff(int totalNumberOfFullTimeStaff) {
		this.totalNumberOfFullTimeStaff = totalNumberOfFullTimeStaff;
	}

	public String getContextBillingWater() {
		return this.contextBillingWater;
	}

	public void setContextBillingWater(String contextBillingWater) {
		this.contextBillingWater = contextBillingWater;
	}

	public String getContextBaseIpAddress() {
		return this.contextBaseIpAddress;
	}

	public void setContextBaseIpAddress(String contextBaseIpAddress) {
		this.contextBaseIpAddress = contextBaseIpAddress;
	}

	// ===================== MardaArif Config Fields =====================

	public String getmCompanyUri() {
		return this.mCompanyUri;
	}

	public void setmCompanyUri(String mCompanyUri) {
		this.mCompanyUri = mCompanyUri;
	}

	public String getmCompanyFileUrl() {
		return this.mCompanyFileUrl;
	}

	public void setmCompanyFileUrl(String mCompanyFileUrl) {
		this.mCompanyFileUrl = mCompanyFileUrl;
	}

	public String getmCompanyKey() {
		return this.mCompanyKey;
	}

	public void setmCompanyKey(String mCompanyKey) {
		this.mCompanyKey = mCompanyKey;
	}

	public String getmBillingAdditionalPayment1ValueLable() {
		return this.mBillingAdditionalPayment1ValueLable;
	}

	public void setmBillingAdditionalPayment1ValueLable(String mBillingAdditionalPayment1ValueLable) {
		this.mBillingAdditionalPayment1ValueLable = mBillingAdditionalPayment1ValueLable;
	}

	public String getmBillingAdditionalPayment2ValueLable() {
		return this.mBillingAdditionalPayment2ValueLable;
	}

	public void setmBillingAdditionalPayment2ValueLable(String mBillingAdditionalPayment2ValueLable) {
		this.mBillingAdditionalPayment2ValueLable = mBillingAdditionalPayment2ValueLable;
	}

	public Double getmBillingAdditionalPayment1Value() {
		return this.mBillingAdditionalPayment1Value;
	}

	public void setmBillingAdditionalPayment1Value(Double mBillingAdditionalPayment1Value) {
		this.mBillingAdditionalPayment1Value = mBillingAdditionalPayment1Value;
	}

	public Double getmBillingAdditionalPayment2Value() {
		return this.mBillingAdditionalPayment2Value;
	}

	public void setmBillingAdditionalPayment2Value(Double mBillingAdditionalPayment2Value) {
		this.mBillingAdditionalPayment2Value = mBillingAdditionalPayment2Value;
	}

	public String getmBillingAdditionalPayment1ValueOption() {
		return this.mBillingAdditionalPayment1ValueOption;
	}

	public void setmBillingAdditionalPayment1ValueOption(String mBillingAdditionalPayment1ValueOption) {
		this.mBillingAdditionalPayment1ValueOption = mBillingAdditionalPayment1ValueOption;
	}

	public String getmBillingAdditionalPayment2ValueOption() {
		return this.mBillingAdditionalPayment2ValueOption;
	}

	public void setmBillingAdditionalPayment2ValueOption(String mBillingAdditionalPayment2ValueOption) {
		this.mBillingAdditionalPayment2ValueOption = mBillingAdditionalPayment2ValueOption;
	}

	public boolean isConnectedToMardaArif() {
		return this.connectedToMardaArif;
	}

	public void setConnectedToMardaArif(boolean connectedToMardaArif) {
		this.connectedToMardaArif = connectedToMardaArif;
	}
}
