package com.wbill.home.dto;

import java.io.Serializable;
import java.util.Date;

public class BillingReadingDTO implements Serializable {
    private static final long serialVersionUID = 1L;

    private int id;
    // private String invoiceNumber; // REMOVED as per request 2
    private boolean isBillGenerated;
    private boolean isMoneyCollected;
    private int lastReading;
    private int previousReading;
    private int consumption;
    private String kifyaWer;
    private double additionalHisab;
    private double yezihWerFjotaKfya;
    private double kotariKiray;
    private double techemariKfya;
    private double yezihWer;
    private double wuzifHisab;
    private String wuzifKezihEske;
    private double wuzifDerekKoshasha;
    private boolean isPaidThroughBank;
    private boolean isPaidOnFrontOffice;
    private boolean isPaidFromTekemach;
    private boolean isDerashPaid;
    private boolean isUnicashPaid;
    private boolean isAbyssiniaPaid;
    private double tekilalaTekefay;
    private double tekilalaBankYetekefele;
    private double tekilalaYetekefele;
    private double kecreditYetekefele;
    private String bankPaidAgentId;
    private String uBankPaidAgentId;
    private String status;

    private double kitat;
    private double wuzifTechemariKfya;
    private int consumptionWuzif;
    private double wuzifKotariKiray;
    private int wuzifFjota;
    private boolean isVoid;
    private double temelashBirr;
    private double wuzifFjotaKfya;
    private Integer wuzifWorBzat;
    private boolean isSendToBank;
    private boolean isSendToBankUnicash;
    private boolean enableEditMeneshaReading;

    // --- NEW FIELDS ADDED ---
    private String billingInvoiceNumber; // From BillingInvoiceNumbers relation
    private Integer cashierUserId; // From UserAccount (cashierUser) relation - ID for filtering
    private String cashierFullName; // From UserAccount (cashierUser) relation
    private String bankName; // From BillingBanks relation
    private String uBankName; // From uBillingBank relation
    private String billDescriptionBank; // NEW: description for bank CSV

    // Date fields for payment logic
    private Date moneyCollectedDate;
    private Date uMoneyCollectedDate;
    private Date collectionDate;
    private Date modifiedDate;
    private Date registeredDate;

    // FIELDS FOR CUSTOMER INFO
    private String customerFullName;
    private String customerFullNameEng; // NEW: English full name
    private String customerAccountNumber;
    private String customerPhoneNumber;
    private Integer customerKebeleId; // from BillingCustomerInfo.addressStreet.id
    private String customerKebele; // from BillingCustomerInfo.addressStreet.streetsName
    // New filter-aligned fields
    private Integer addressKetenaId; // from BillingCustomerInfo.addressKetena.id
    private Integer branchsId; // from BillingCustomerInfo.branch.id
    private Integer assignedReaderId; // from BillingCustomerInfo.userAccount.id
    // New readable name fields for display
    private String ketenaName; // from BillingCustomerInfo.addressKetena.ketenaName
    private String branchDescription; // from BillingCustomerInfo.branch.branchDescription
    private String assignedReaderName; // from BillingCustomerInfo.userAccount.userName

    // Customer type for filtering/display
    private Integer customerTypeId; // from BillingCustomerInfo.billingCustomerType.id
    private String customerType; // from BillingCustomerInfo.billingCustomerType.customerType

    private Integer initialConsumption;

    // CustomerInfo primary key (for legacy mobile CSV exports)
    private Integer customerInfoId;

    // Wuzif-specific flags (from BillingReadingWuzif). Optional; may be null when
    // not a Wuzif DTO mapping.
    private String wuzifDeleted; // values like "active" / "deleted"
    private Boolean wuzifIsKitatTenestual; // true if kitate is removed/tenestual
    private Boolean wuzifIsMoneyCollected; // true if the Wuzif item is money collected

    // Journal push tracking
    private boolean isJournalPushed;

    // Paid bill journal push tracking (separate from Bill Preparation)
    private boolean isPaidJournalPushed;

    // --- Service Charge fields (percentage-based from CompanyProfile) ---
    private Double mBillingAdditionalPayment1Value;
    private Double mBillingAdditionalPayment2Value;
    private Double mBillingAdditionalPayment1Wuzif;
    private Double mBillingAdditionalPayment2Wuzif;
    private String mBillingAdditionalPayment1ValueLable;
    private String mBillingAdditionalPayment2ValueLable;

    public BillingReadingDTO(int id, boolean isBillGenerated, boolean isMoneyCollected,
            int lastReading, int previousReading, int consumption, String kifyaWer,
            double additionalHisab, double yezihWerFjotaKfya, double kotariKiray,
            double techemariKfya, double yezihWer, double wuzifHisab,
            double wuzifDerekKoshasha, boolean isPaidThroughBank,
            boolean isPaidOnFrontOffice, boolean isPaidFromTekemach,
            boolean isDerashPaid, boolean isUnicashPaid, boolean isAbyssiniaPaid,
            double tekilalaTekefay, double tekilalaBankYetekefele,
            double tekilalaYetekefele, double kecreditYetekefele,
            String bankPaidAgentId, String uBankPaidAgentId, String status,
            double kitat, double wuzifTechemariKfya, int consumptionWuzif,
            double wuzifKotariKiray, int wuzifFjota, boolean isVoid, double temelashBirr,
            double wuzifFjotaKfya,
            // NEW CONSTRUCTOR PARAMETERS
            String billingInvoiceNumber, Integer cashierUserId, String cashierFullName, String bankName,
            // CUSTOMER INFO PARAMETERS
            String customerFullName, String customerAccountNumber,
            Integer customerKebeleId, String customerKebele,
            // Filter-aligned parameters
            Integer addressKetenaId, Integer branchsId, Integer assignedReaderId,
            // Readable names
            String ketenaName, String branchDescription, String assignedReaderName,
            // NEW: extra fields for CSV export
            String billDescriptionBank, String customerFullNameEng, Integer wuzifWorBzat,
            Integer customerTypeId, String customerType,
            String customerPhoneNumber,
            boolean isSendToBank,
            boolean isSendToBankUnicash,
            boolean enableEditMeneshaReading,
            Integer initialConsumption,
            Integer customerInfoId,
            Integer zeroReadingWorBzat,
            // NEW FIELDS
            Date moneyCollectedDate, Date uMoneyCollectedDate, Date collectionDate,
            Date modifiedDate, Date registeredDate, String uBankName,
            // CONFIRMATION CODES
            String bankPaidConfirmationCode, String uBankPaidConfirmationCode,
            // CUSTOMER STATUS
            String customerStatus,
            // Wuzif Remark
            String wuzifKezihEske,
            // Journal push tracking
            boolean isJournalPushed,
            // Paid bill journal push tracking
            boolean isPaidJournalPushed,
            // SERVICE CHARGE FIELDS
            Double mBillingAdditionalPayment1Value, Double mBillingAdditionalPayment2Value,
            Double mBillingAdditionalPayment1Wuzif, Double mBillingAdditionalPayment2Wuzif,
            String mBillingAdditionalPayment1ValueLable, String mBillingAdditionalPayment2ValueLable) {
        this.id = id;
        this.isBillGenerated = isBillGenerated;
        this.isMoneyCollected = isMoneyCollected;
        this.lastReading = lastReading;
        this.previousReading = previousReading;
        this.consumption = consumption;
        this.kifyaWer = kifyaWer;
        this.additionalHisab = additionalHisab;
        this.yezihWerFjotaKfya = yezihWerFjotaKfya;
        this.kotariKiray = kotariKiray;
        this.techemariKfya = techemariKfya;
        this.yezihWer = yezihWer;
        this.wuzifHisab = wuzifHisab;
        this.wuzifKezihEske = wuzifKezihEske;
        this.wuzifDerekKoshasha = wuzifDerekKoshasha;
        this.isPaidThroughBank = isPaidThroughBank;
        this.isPaidOnFrontOffice = isPaidOnFrontOffice;
        this.isPaidFromTekemach = isPaidFromTekemach;
        this.isDerashPaid = isDerashPaid;
        this.isUnicashPaid = isUnicashPaid;
        this.isAbyssiniaPaid = isAbyssiniaPaid;
        this.tekilalaTekefay = tekilalaTekefay;
        this.tekilalaBankYetekefele = tekilalaBankYetekefele;
        this.tekilalaYetekefele = tekilalaYetekefele;
        this.kecreditYetekefele = kecreditYetekefele;
        this.bankPaidAgentId = bankPaidAgentId;
        this.uBankPaidAgentId = uBankPaidAgentId;
        this.status = status;
        this.kitat = kitat;
        this.wuzifTechemariKfya = wuzifTechemariKfya;
        this.consumptionWuzif = consumptionWuzif;
        this.wuzifKotariKiray = wuzifKotariKiray;
        this.wuzifFjota = wuzifFjota;
        this.isVoid = isVoid;
        this.temelashBirr = temelashBirr;
        this.wuzifFjotaKfya = wuzifFjotaKfya;

        // Assign new fields
        this.billingInvoiceNumber = billingInvoiceNumber;
        this.cashierUserId = cashierUserId;
        this.cashierFullName = cashierFullName;
        this.bankName = bankName;
        this.uBankName = uBankName;

        this.moneyCollectedDate = moneyCollectedDate;
        this.uMoneyCollectedDate = uMoneyCollectedDate;
        this.collectionDate = collectionDate;
        this.modifiedDate = modifiedDate;
        this.registeredDate = registeredDate;

        // Assign confirmation codes
        this.bankPaidConfirmationCode = bankPaidConfirmationCode;
        this.uBankPaidConfirmationCode = uBankPaidConfirmationCode;

        // Assign customer status
        this.customerStatus = customerStatus;

        // Assign customer info fields
        this.customerFullName = customerFullName;
        this.customerAccountNumber = customerAccountNumber;
        this.customerPhoneNumber = customerPhoneNumber;
        this.customerKebeleId = customerKebeleId;
        this.customerKebele = customerKebele;
        this.addressKetenaId = addressKetenaId;
        this.branchsId = branchsId;
        this.assignedReaderId = assignedReaderId;
        this.ketenaName = ketenaName;
        this.branchDescription = branchDescription;
        this.assignedReaderName = assignedReaderName;

        // New fields
        this.billDescriptionBank = billDescriptionBank;
        this.customerFullNameEng = customerFullNameEng;
        this.wuzifWorBzat = wuzifWorBzat;
        this.customerTypeId = customerTypeId;
        this.customerType = customerType;
        this.isSendToBank = isSendToBank;
        this.isSendToBankUnicash = isSendToBankUnicash;
        this.enableEditMeneshaReading = enableEditMeneshaReading;
        this.initialConsumption = initialConsumption;
        this.customerInfoId = customerInfoId;
        this.zeroReadingWorBzat = zeroReadingWorBzat;

        // Journal push tracking
        this.isJournalPushed = isJournalPushed;

        // Paid bill journal push tracking
        this.isPaidJournalPushed = isPaidJournalPushed;

        // Service charge fields
        this.mBillingAdditionalPayment1Value = mBillingAdditionalPayment1Value;
        this.mBillingAdditionalPayment2Value = mBillingAdditionalPayment2Value;
        this.mBillingAdditionalPayment1Wuzif = mBillingAdditionalPayment1Wuzif;
        this.mBillingAdditionalPayment2Wuzif = mBillingAdditionalPayment2Wuzif;
        this.mBillingAdditionalPayment1ValueLable = mBillingAdditionalPayment1ValueLable;
        this.mBillingAdditionalPayment2ValueLable = mBillingAdditionalPayment2ValueLable;
    }
    // --- Getters and Setters for all fields ---

    public int getId() {
        return id;
    }

    public void setId(int id) {
        this.id = id;
    }

    // public String getInvoiceNumber() { return invoiceNumber; }
    // public void setInvoiceNumber(String invoiceNumber) { this.invoiceNumber =
    // invoiceNumber; }
    public boolean getIsBillGenerated() {
        return isBillGenerated;
    }

    public void setIsBillGenerated(boolean isBillGenerated) {
        this.isBillGenerated = isBillGenerated;
    }

    public boolean isMoneyCollected() {
        return isMoneyCollected;
    }

    public void setMoneyCollected(boolean moneyCollected) {
        this.isMoneyCollected = moneyCollected;
    }

    public int getLastReading() {
        return lastReading;
    }

    public void setLastReading(int lastReading) {
        this.lastReading = lastReading;
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

    public String getKifyaWer() {
        return kifyaWer;
    }

    public void setKifyaWer(String kifyaWer) {
        this.kifyaWer = kifyaWer;
    }

    public double getAdditionalHisab() {
        return additionalHisab;
    }

    public void setAdditionalHisab(double additionalHisab) {
        this.additionalHisab = additionalHisab;
    }

    public double getYezihWerFjotaKfya() {
        return yezihWerFjotaKfya;
    }

    public void setYezihWerFjotaKfya(double yezihWerFjotaKfya) {
        this.yezihWerFjotaKfya = yezihWerFjotaKfya;
    }

    public double getKotariKiray() {
        return kotariKiray;
    }

    public void setKotariKiray(double kotariKiray) {
        this.kotariKiray = kotariKiray;
    }

    public double getTechemariKfya() {
        return techemariKfya;
    }

    public void setTechemariKfya(double techemariKfya) {
        this.techemariKfya = techemariKfya;
    }

    public double getYezihWer() {
        return yezihWer;
    }

    public void setYezihWer(double yezihWer) {
        this.yezihWer = yezihWer;
    }

    public double getWuzifHisab() {
        return wuzifHisab;
    }

    public void setWuzifHisab(double wuzifHisab) {
        this.wuzifHisab = wuzifHisab;
    }

    public String getWuzifKezihEske() {
        return wuzifKezihEske;
    }

    public void setWuzifKezihEske(String wuzifKezihEske) {
        this.wuzifKezihEske = wuzifKezihEske;
    }

    public double getWuzifDerekKoshasha() {
        return wuzifDerekKoshasha;
    }

    public void setWuzifDerekKoshasha(double wuzifDerekKoshasha) {
        this.wuzifDerekKoshasha = wuzifDerekKoshasha;
    }

    public boolean isPaidThroughBank() {
        return isPaidThroughBank;
    }

    public void setPaidThroughBank(boolean paidThroughBank) {
        this.isPaidThroughBank = paidThroughBank;
    }

    public boolean isPaidOnFrontOffice() {
        return isPaidOnFrontOffice;
    }

    public void setPaidOnFrontOffice(boolean paidOnFrontOffice) {
        this.isPaidOnFrontOffice = paidOnFrontOffice;
    }

    public boolean isPaidFromTekemach() {
        return isPaidFromTekemach;
    }

    public void setPaidFromTekemach(boolean paidFromTekemach) {
        this.isPaidFromTekemach = paidFromTekemach;
    }

    public boolean isDerashPaid() {
        return isDerashPaid;
    }

    public void setDerashPaid(boolean derashPaid) {
        this.isDerashPaid = derashPaid;
    }

    public boolean isUnicashPaid() {
        return isUnicashPaid;
    }

    public void setUnicashPaid(boolean unicashPaid) {
        this.isUnicashPaid = unicashPaid;
    }

    public boolean isAbyssiniaPaid() {
        return isAbyssiniaPaid;
    }

    public void setAbyssiniaPaid(boolean abyssiniaPaid) {
        this.isAbyssiniaPaid = abyssiniaPaid;
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

    public String getBankPaidAgentId() {
        return bankPaidAgentId;
    }

    public void setBankPaidAgentId(String bankPaidAgentId) {
        this.bankPaidAgentId = bankPaidAgentId;
    }

    public String getuBankPaidAgentId() {
        return uBankPaidAgentId;
    }

    public void setuBankPaidAgentId(String uBankPaidAgentId) {
        this.uBankPaidAgentId = uBankPaidAgentId;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public double getKitat() {
        return kitat;
    }

    public void setKitat(double kitat) {
        this.kitat = kitat;
    }

    public double getWuzifTechemariKfya() {
        return wuzifTechemariKfya;
    }

    public void setWuzifTechemariKfya(double wuzifTechemariKfya) {
        this.wuzifTechemariKfya = wuzifTechemariKfya;
    }

    public int getConsumptionWuzif() {
        return consumptionWuzif;
    }

    public void setConsumptionWuzif(int consumptionWuzif) {
        this.consumptionWuzif = consumptionWuzif;
    }

    public double getWuzifKotariKiray() {
        return wuzifKotariKiray;
    }

    public void setWuzifKotariKiray(double wuzifKotariKiray) {
        this.wuzifKotariKiray = wuzifKotariKiray;
    }

    public int getWuzifFjota() {
        return wuzifFjota;
    }

    public void setWuzifFjota(int wuzifFjota) {
        this.wuzifFjota = wuzifFjota;
    }

    public boolean isVoid() {
        return isVoid;
    }

    public void setVoid(boolean isVoid) {
        this.isVoid = isVoid;
    }

    public double getTemelashBirr() {
        return temelashBirr;
    }

    public void setTemelashBirr(double temelashBirr) {
        this.temelashBirr = temelashBirr;
    }

    public double getWuzifFjotaKfya() {
        return wuzifFjotaKfya;
    }

    public void setWuzifFjotaKfya(double wuzifFjotaKfya) {
        this.wuzifFjotaKfya = wuzifFjotaKfya;
    }

    // --- NEW Getters and Setters for Customer Info ---
    public String getCustomerFullName() {
        return customerFullName;
    }

    public void setCustomerFullName(String customerFullName) {
        this.customerFullName = customerFullName;
    }

    public String getCustomerAccountNumber() {
        return customerAccountNumber;
    }

    public void setCustomerAccountNumber(String customerAccountNumber) {
        this.customerAccountNumber = customerAccountNumber;
    }

    public String getCustomerPhoneNumber() {
        return customerPhoneNumber;
    }

    public void setCustomerPhoneNumber(String customerPhoneNumber) {
        this.customerPhoneNumber = customerPhoneNumber;
    }

    public boolean isEnableEditMeneshaReading() {
        return enableEditMeneshaReading;
    }

    public void setEnableEditMeneshaReading(boolean enableEditMeneshaReading) {
        this.enableEditMeneshaReading = enableEditMeneshaReading;
    }

    public Integer getCustomerKebeleId() {
        return customerKebeleId;
    }

    public void setCustomerKebeleId(Integer customerKebeleId) {
        this.customerKebeleId = customerKebeleId;
    }

    public String getCustomerKebele() {
        return customerKebele;
    }

    public void setCustomerKebele(String customerKebele) {
        this.customerKebele = customerKebele;
    }

    public Integer getAddressKetenaId() {
        return addressKetenaId;
    }

    public void setAddressKetenaId(Integer addressKetenaId) {
        this.addressKetenaId = addressKetenaId;
    }

    public Integer getBranchsId() {
        return branchsId;
    }

    public void setBranchsId(Integer branchsId) {
        this.branchsId = branchsId;
    }

    public Integer getAssignedReaderId() {
        return assignedReaderId;
    }

    public void setAssignedReaderId(Integer assignedReaderId) {
        this.assignedReaderId = assignedReaderId;
    }

    public String getKetenaName() {
        return ketenaName;
    }

    public void setKetenaName(String ketenaName) {
        this.ketenaName = ketenaName;
    }

    public String getBranchDescription() {
        return branchDescription;
    }

    public void setBranchDescription(String branchDescription) {
        this.branchDescription = branchDescription;
    }

    public String getAssignedReaderName() {
        return assignedReaderName;
    }

    public void setAssignedReaderName(String assignedReaderName) {
        this.assignedReaderName = assignedReaderName;
    }

    // --- Getters and Setters for NEW fields ---
    public String getBillingInvoiceNumber() {
        return billingInvoiceNumber;
    }

    public void setBillingInvoiceNumber(String billingInvoiceNumber) {
        this.billingInvoiceNumber = billingInvoiceNumber;
    }

    public String getCashierFullName() {
        return cashierFullName;
    }

    public void setCashierFullName(String cashierFullName) {
        this.cashierFullName = cashierFullName;
    }

    public String getBankName() {
        return bankName;
    }

    public void setBankName(String bankName) {
        this.bankName = bankName;
    }

    // NEW getters/setters
    public String getBillDescriptionBank() {
        return billDescriptionBank;
    }

    public void setBillDescriptionBank(String billDescriptionBank) {
        this.billDescriptionBank = billDescriptionBank;
    }

    public String getCustomerFullNameEng() {
        return customerFullNameEng;
    }

    public void setCustomerFullNameEng(String customerFullNameEng) {
        this.customerFullNameEng = customerFullNameEng;
    }

    // --- Wuzif-specific getters/setters ---
    public String getWuzifDeleted() {
        return wuzifDeleted;
    }

    public void setWuzifDeleted(String wuzifDeleted) {
        this.wuzifDeleted = wuzifDeleted;
    }

    public Boolean getWuzifIsKitatTenestual() {
        return wuzifIsKitatTenestual;
    }

    public void setWuzifIsKitatTenestual(Boolean wuzifIsKitatTenestual) {
        this.wuzifIsKitatTenestual = wuzifIsKitatTenestual;
    }

    public Boolean getWuzifIsMoneyCollected() {
        return wuzifIsMoneyCollected;
    }

    public void setWuzifIsMoneyCollected(Boolean wuzifIsMoneyCollected) {
        this.wuzifIsMoneyCollected = wuzifIsMoneyCollected;
    }

    public Integer getWuzifWorBzat() {
        return wuzifWorBzat;
    }

    public void setWuzifWorBzat(Integer wuzifWorBzat) {
        this.wuzifWorBzat = wuzifWorBzat;
    }

    public Integer getCustomerTypeId() {
        return customerTypeId;
    }

    public void setCustomerTypeId(Integer customerTypeId) {
        this.customerTypeId = customerTypeId;
    }

    public String getCustomerType() {
        return customerType;
    }

    public void setCustomerType(String customerType) {
        this.customerType = customerType;
    }

    public Integer getInitialConsumption() {
        return initialConsumption;
    }

    public void setInitialConsumption(Integer initialConsumption) {
        this.initialConsumption = initialConsumption;
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

    public Integer getCustomerInfoId() {
        return customerInfoId;
    }

    public void setCustomerInfoId(Integer customerInfoId) {
        this.customerInfoId = customerInfoId;
    }

    // NEW FIELD
    private Integer zeroReadingWorBzat;

    public Integer getZeroReadingWorBzat() {
        return zeroReadingWorBzat;
    }

    public void setZeroReadingWorBzat(Integer zeroReadingWorBzat) {
        this.zeroReadingWorBzat = zeroReadingWorBzat;
    }

    public Date getMoneyCollectedDate() {
        return moneyCollectedDate;
    }

    public void setMoneyCollectedDate(Date moneyCollectedDate) {
        this.moneyCollectedDate = moneyCollectedDate;
    }

    public Date getuMoneyCollectedDate() {
        return uMoneyCollectedDate;
    }

    public void setuMoneyCollectedDate(Date uMoneyCollectedDate) {
        this.uMoneyCollectedDate = uMoneyCollectedDate;
    }

    public Date getCollectionDate() {
        return collectionDate;
    }

    public void setCollectionDate(Date collectionDate) {
        this.collectionDate = collectionDate;
    }

    public Date getModifiedDate() {
        return modifiedDate;
    }

    public void setModifiedDate(Date modifiedDate) {
        this.modifiedDate = modifiedDate;
    }

    public Date getRegisteredDate() {
        return registeredDate;
    }

    public void setRegisteredDate(Date registeredDate) {
        this.registeredDate = registeredDate;
    }

    public String getuBankName() {
        return uBankName;
    }

    public void setuBankName(String uBankName) {
        this.uBankName = uBankName;
    }

    // NEW FIELDS for Bank Confirmation
    private String bankPaidConfirmationCode; // Renamed from bankConfirmationCode
    private String uBankPaidConfirmationCode;

    // NEW FIELD: Customer Status
    private String customerStatus;

    public String getBankPaidConfirmationCode() {
        return bankPaidConfirmationCode;
    }

    public void setBankPaidConfirmationCode(String bankPaidConfirmationCode) {
        this.bankPaidConfirmationCode = bankPaidConfirmationCode;
    }

    public String getuBankPaidConfirmationCode() {
        return uBankPaidConfirmationCode;
    }

    public void setuBankPaidConfirmationCode(String uBankPaidConfirmationCode) {
        this.uBankPaidConfirmationCode = uBankPaidConfirmationCode;
    }

    public String getCustomerStatus() {
        return customerStatus;
    }

    public void setCustomerStatus(String customerStatus) {
        this.customerStatus = customerStatus;
    }

    public Integer getCashierUserId() {
        return cashierUserId;
    }

    public void setCashierUserId(Integer cashierUserId) {
        this.cashierUserId = cashierUserId;
    }

    public boolean isJournalPushed() {
        return isJournalPushed;
    }

    public void setJournalPushed(boolean isJournalPushed) {
        this.isJournalPushed = isJournalPushed;
    }

    public boolean isPaidJournalPushed() {
        return isPaidJournalPushed;
    }

    public void setPaidJournalPushed(boolean isPaidJournalPushed) {
        this.isPaidJournalPushed = isPaidJournalPushed;
    }

    // --- Service Charge Getters/Setters ---
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