package com.wbill.home.dto;

public class BillingReadingSummaryDTO {
    private int id;
    private String kifyaWer;
    private Integer previousReading;
    private Integer lastReading;
    private Integer consumption;
    private String status;
    private String invoiceNumber;
    private boolean isBillGenerated;

    // Additional display fields
    private String customerName; // from billingCustomerInfo.fullName
    private String mobileReaderUser; // display name if available
    private String cashierUser; // display name if available
    private String meterNumber; // from billingCustomerInfo.meterNumber
    private String meterSize; // optional, if available via meter entity

    // Optional: invoice number coming from BillingInvoiceNumbers entity
    // (used as a fallback when the main invoiceNumber field is empty)
    private String billingInvoiceNumbers;

    private Double kotariKiray;
    private Double yezihWerFjotaKfya;
    private Double additionalHisab;
    private String techemariFieldName;
    private Double techemariKfya;
    private Double yezihWer;
    private Double kitat;

    private Double wuzifKotariKiray;
    private Double wuzifFjotaKfya;
    private Double wuzifDerekKoshasha;
    private Double wuzifTechemariKfya;
    private Integer wuzifWorBzat;
    private String wuzifKezihEske;
    private Double wuzifHisab;

    private Double temelashBirr;

    private Double kecreditYetekefele;
    private Double tekilalaTekefay;
    private Double tekilalaYetekefele;
    private Integer wuzifFjota;

    // Bank display fields (names) for Derash and Unicash payments
    private String bankName; // from billingBanks.bankName
    private String uBankName; // from uBillingBank.bankName

    private String bankPaidAgentId;
    private String bankDueDate;
    private String moneyCollectedDate;
    private String uBankPaidAgentId;
    private String uBankDueDate;
    private String uMoneyCollectedDate;
    private Boolean isPaidOnFrontOffice;
    private Boolean isDerashPaid;
    private Boolean isUnicashPaid;
    private String billingZeroReadingReason;

    // --- Service Charge fields (percentage-based from CompanyProfile) ---
    private Double mBillingAdditionalPayment1Value;
    private Double mBillingAdditionalPayment2Value;
    private Double mBillingAdditionalPayment1Wuzif;
    private Double mBillingAdditionalPayment2Wuzif;
    private String mBillingAdditionalPayment1ValueLable;
    private String mBillingAdditionalPayment2ValueLable;

    public BillingReadingSummaryDTO() {
    }

    public BillingReadingSummaryDTO(int id, String kifyaWer, Integer previousReading, Integer lastReading,
            Integer consumption, String status, String invoiceNumber) {
        this.id = id;
        this.kifyaWer = kifyaWer;
        this.previousReading = previousReading;
        this.lastReading = lastReading;
        this.consumption = consumption;
        this.status = status;
        this.invoiceNumber = invoiceNumber;
    }

    public int getId() {
        return id;
    }

    public void setId(int id) {
        this.id = id;
    }

    public String getKifyaWer() {
        return kifyaWer;
    }

    public void setKifyaWer(String kifyaWer) {
        this.kifyaWer = kifyaWer;
    }

    public Integer getPreviousReading() {
        return previousReading;
    }

    public void setPreviousReading(Integer previousReading) {
        this.previousReading = previousReading;
    }

    public Integer getLastReading() {
        return lastReading;
    }

    public void setLastReading(Integer lastReading) {
        this.lastReading = lastReading;
    }

    public Integer getConsumption() {
        return consumption;
    }

    public void setConsumption(Integer consumption) {
        this.consumption = consumption;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public String getInvoiceNumber() {
        return invoiceNumber;
    }

    public void setInvoiceNumber(String invoiceNumber) {
        this.invoiceNumber = invoiceNumber;
    }

    public boolean getIsBillGenerated() {
        return isBillGenerated;
    }

    public void setIsBillGenerated(boolean isBillGenerated) {
        this.isBillGenerated = isBillGenerated;
    }

    public String getCustomerName() {
        return customerName;
    }

    public void setCustomerName(String customerName) {
        this.customerName = customerName;
    }

    public String getMobileReaderUser() {
        return mobileReaderUser;
    }

    public void setMobileReaderUser(String mobileReaderUser) {
        this.mobileReaderUser = mobileReaderUser;
    }

    public String getCashierUser() {
        return cashierUser;
    }

    public void setCashierUser(String cashierUser) {
        this.cashierUser = cashierUser;
    }

    public String getMeterNumber() {
        return meterNumber;
    }

    public void setMeterNumber(String meterNumber) {
        this.meterNumber = meterNumber;
    }

    public String getMeterSize() {
        return meterSize;
    }

    public void setMeterSize(String meterSize) {
        this.meterSize = meterSize;
    }

    public String getBillingInvoiceNumbers() {
        return billingInvoiceNumbers;
    }

    public void setBillingInvoiceNumbers(String billingInvoiceNumbers) {
        this.billingInvoiceNumbers = billingInvoiceNumbers;
    }

    public Double getKotariKiray() {
        return kotariKiray;
    }

    public void setKotariKiray(Double kotariKiray) {
        this.kotariKiray = kotariKiray;
    }

    public Double getYezihWerFjotaKfya() {
        return yezihWerFjotaKfya;
    }

    public void setYezihWerFjotaKfya(Double yezihWerFjotaKfya) {
        this.yezihWerFjotaKfya = yezihWerFjotaKfya;
    }

    public Double getAdditionalHisab() {
        return additionalHisab;
    }

    public void setAdditionalHisab(Double additionalHisab) {
        this.additionalHisab = additionalHisab;
    }

    public String getTechemariFieldName() {
        return techemariFieldName;
    }

    public void setTechemariFieldName(String techemariFieldName) {
        this.techemariFieldName = techemariFieldName;
    }

    public Double getTechemariKfya() {
        return techemariKfya;
    }

    public void setTechemariKfya(Double techemariKfya) {
        this.techemariKfya = techemariKfya;
    }

    public Double getYezihWer() {
        return yezihWer;
    }

    public void setYezihWer(Double yezihWer) {
        this.yezihWer = yezihWer;
    }

    public Double getKitat() {
        return kitat;
    }

    public void setKitat(Double kitat) {
        this.kitat = kitat;
    }

    public Double getWuzifKotariKiray() {
        return wuzifKotariKiray;
    }

    public void setWuzifKotariKiray(Double wuzifKotariKiray) {
        this.wuzifKotariKiray = wuzifKotariKiray;
    }

    public Double getWuzifFjotaKfya() {
        return wuzifFjotaKfya;
    }

    public void setWuzifFjotaKfya(Double wuzifFjotaKfya) {
        this.wuzifFjotaKfya = wuzifFjotaKfya;
    }

    public Double getWuzifDerekKoshasha() {
        return wuzifDerekKoshasha;
    }

    public void setWuzifDerekKoshasha(Double wuzifDerekKoshasha) {
        this.wuzifDerekKoshasha = wuzifDerekKoshasha;
    }

    public Double getWuzifTechemariKfya() {
        return wuzifTechemariKfya;
    }

    public void setWuzifTechemariKfya(Double wuzifTechemariKfya) {
        this.wuzifTechemariKfya = wuzifTechemariKfya;
    }

    public Integer getWuzifWorBzat() {
        return wuzifWorBzat;
    }

    public void setWuzifWorBzat(Integer wuzifWorBzat) {
        this.wuzifWorBzat = wuzifWorBzat;
    }

    public String getWuzifKezihEske() {
        return wuzifKezihEske;
    }

    public void setWuzifKezihEske(String wuzifKezihEske) {
        this.wuzifKezihEske = wuzifKezihEske;
    }

    public Double getWuzifHisab() {
        return wuzifHisab;
    }

    public void setWuzifHisab(Double wuzifHisab) {
        this.wuzifHisab = wuzifHisab;
    }

    public Double getTemelashBirr() {
        return temelashBirr;
    }

    public void setTemelashBirr(Double temelashBirr) {
        this.temelashBirr = temelashBirr;
    }

    public Double getKecreditYetekefele() {
        return kecreditYetekefele;
    }

    public void setKecreditYetekefele(Double kecreditYetekefele) {
        this.kecreditYetekefele = kecreditYetekefele;
    }

    public Double getTekilalaTekefay() {
        return tekilalaTekefay;
    }

    public void setTekilalaTekefay(Double tekilalaTekefay) {
        this.tekilalaTekefay = tekilalaTekefay;
    }

    public Double getTekilalaYetekefele() {
        return tekilalaYetekefele;
    }

    public void setTekilalaYetekefele(Double tekilalaYetekefele) {
        this.tekilalaYetekefele = tekilalaYetekefele;
    }

    public String getBankName() {
        return bankName;
    }

    public void setBankName(String bankName) {
        this.bankName = bankName;
    }

    public String getUBankName() {
        return uBankName;
    }

    public void setUBankName(String uBankName) {
        this.uBankName = uBankName;
    }

    public String getBankPaidAgentId() {
        return bankPaidAgentId;
    }

    public void setBankPaidAgentId(String bankPaidAgentId) {
        this.bankPaidAgentId = bankPaidAgentId;
    }

    public String getBankDueDate() {
        return bankDueDate;
    }

    public void setBankDueDate(String bankDueDate) {
        this.bankDueDate = bankDueDate;
    }

    public String getMoneyCollectedDate() {
        return moneyCollectedDate;
    }

    public void setMoneyCollectedDate(String moneyCollectedDate) {
        this.moneyCollectedDate = moneyCollectedDate;
    }

    public String getUBankPaidAgentId() {
        return uBankPaidAgentId;
    }

    public void setUBankPaidAgentId(String uBankPaidAgentId) {
        this.uBankPaidAgentId = uBankPaidAgentId;
    }

    public String getUBankDueDate() {
        return uBankDueDate;
    }

    public void setUBankDueDate(String uBankDueDate) {
        this.uBankDueDate = uBankDueDate;
    }

    public String getUMoneyCollectedDate() {
        return uMoneyCollectedDate;
    }

    public void setUMoneyCollectedDate(String uMoneyCollectedDate) {
        this.uMoneyCollectedDate = uMoneyCollectedDate;
    }

    public Boolean getIsPaidOnFrontOffice() {
        return isPaidOnFrontOffice;
    }

    public void setIsPaidOnFrontOffice(Boolean isPaidOnFrontOffice) {
        this.isPaidOnFrontOffice = isPaidOnFrontOffice;
    }

    public Integer getWuzifFjota() {
        return wuzifFjota;
    }

    public void setWuzifFjota(Integer wuzifFjota) {
        this.wuzifFjota = wuzifFjota;
    }

    public Boolean getIsDerashPaid() {
        return isDerashPaid;
    }

    public void setIsDerashPaid(Boolean isDerashPaid) {
        this.isDerashPaid = isDerashPaid;
    }

    public Boolean getIsUnicashPaid() {
        return isUnicashPaid;
    }

    public void setIsUnicashPaid(Boolean isUnicashPaid) {
        this.isUnicashPaid = isUnicashPaid;
    }

    public String getBillingZeroReadingReason() {
        return billingZeroReadingReason;
    }

    public void setBillingZeroReadingReason(String billingZeroReadingReason) {
        this.billingZeroReadingReason = billingZeroReadingReason;
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
