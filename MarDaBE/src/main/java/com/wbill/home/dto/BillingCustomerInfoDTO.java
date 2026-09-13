package com.wbill.home.dto;

import com.wbill.home.util.EthiopianCalendarConverter;
import java.io.Serializable;
import java.time.LocalDate;
import java.util.Date;

// DTO for the main customer information
public class BillingCustomerInfoDTO implements Serializable {
    private static final long serialVersionUID = 1L;

    private int id;
    private double customerBalanceBirr;
    private String customerPhoto;
    private String metawokiaScanned;
    private String addressDescription;
    private int maxReference;
    private String fullName;
    private String fullNameEng;
    private String phoneNumber;
    private String nationalIdNumber;
    private String accountNumber;
    private String houseNumber;
    private String meterNumber;
    private Integer countNumber;
    private double initialReading;
    private Integer initialConsumption;
    private Date meterLifeStart;
    private Date meterLifeLimit;
    private boolean isInitialized;
    private boolean isInitializedSecondTime;
    private double prepaidBirrCurrentBalance;
    private String terminationRemark;
    private String locationCoordination;
    private String qrCode;
    private double additionalMonthlyPayment;
    private boolean oldHasPenalty;
    private boolean oldIfPenaltyPaid;
    private String oldMonthsList;
    private double oldKfyaAndPenaltyTotal;
    private String oldKfyaEachMonth;
    private int oldPenlityNumberOfMonths;
    private Date registeredDate;
    private String registeredDateEthiopian;
    private String registeredDateEthiopianAmharic;
    private Integer registeredYear;
    private Integer registeredMonth;
    private Date canceledDate;
    private String canceledDateEthiopian;
    private String canceledDateEthiopianAmharic;
    private Integer canceledYear;
    private Integer canceledMonth;
    private boolean wasCanceled;
    private boolean isJustReturnFromPenality;
    private Date canceledActivatedDate;
    private String canceledActivatedDateEthiopian;
    private String canceledActivatedDateEthiopianAmharic;
    private double tekemachKfya;
    private String techemariFieldName;
    private double techemariKfya;
    private String status;
    private Integer cityId;
    private Integer zoneId;
    private String completeDeleted;
    private Date completeDeletedDate;
    private String kdmeKfyaReasons;

    // Association IDs
    private Integer billingCustomerInfoMeterId;
    private Integer billingTerminationReasonId;
    private String terminationReason;
    private Integer billingMeterTypeId;
    private Integer billingModeOfWaterServiceId;
    private Integer assignedReaderId;
    private Integer branchsId;
    private Integer addressStreetsId;
    private Integer addressKetenaId;
    private Integer customerTypeId;
    private Integer meterSizeId;

    // Getters and Setters
    public int getId() { return id; }
    public void setId(int id) { this.id = id; }
    public double getCustomerBalanceBirr() { return customerBalanceBirr; }
    public void setCustomerBalanceBirr(double customerBalanceBirr) { this.customerBalanceBirr = customerBalanceBirr; }
    public String getCustomerPhoto() { return customerPhoto; }
    public void setCustomerPhoto(String customerPhoto) { this.customerPhoto = customerPhoto; }
    public String getMetawokiaScanned() { return metawokiaScanned; }
    public void setMetawokiaScanned(String metawokiaScanned) { this.metawokiaScanned = metawokiaScanned; }
    public String getAddressDescription() { return addressDescription; }
    public void setAddressDescription(String addressDescription) { this.addressDescription = addressDescription; }
    public int getMaxReference() { return maxReference; }
    public void setMaxReference(int maxReference) { this.maxReference = maxReference; }
    public String getFullName() { return fullName; }
    public void setFullName(String fullName) { this.fullName = fullName; }
    public String getFullNameEng() { return fullNameEng; }
    public void setFullNameEng(String fullNameEng) { this.fullNameEng = fullNameEng; }
    public String getPhoneNumber() { return phoneNumber; }
    public void setPhoneNumber(String phoneNumber) { this.phoneNumber = phoneNumber; }
    public String getNationalIdNumber() { return nationalIdNumber; }
    public void setNationalIdNumber(String nationalIdNumber) { this.nationalIdNumber = nationalIdNumber; }
    public String getAccountNumber() { return accountNumber; }
    public void setAccountNumber(String accountNumber) { this.accountNumber = accountNumber; }
    public String getHouseNumber() { return houseNumber; }
    public void setHouseNumber(String houseNumber) { this.houseNumber = houseNumber; }
    public String getMeterNumber() { return meterNumber; }
    public void setMeterNumber(String meterNumber) { this.meterNumber = meterNumber; }
    public Integer getCountNumber() { return countNumber; }
    public void setCountNumber(Integer countNumber) { this.countNumber = countNumber; }
    public double getInitialReading() { return initialReading; }
    public void setInitialReading(double initialReading) { this.initialReading = initialReading; }
    public Integer getInitialConsumption() { return initialConsumption; }
    public void setInitialConsumption(Integer initialConsumption) { this.initialConsumption = initialConsumption; }
    public Date getMeterLifeStart() { return meterLifeStart; }
    public void setMeterLifeStart(Date meterLifeStart) { this.meterLifeStart = meterLifeStart; }
    public Date getMeterLifeLimit() { return meterLifeLimit; }
    public void setMeterLifeLimit(Date meterLifeLimit) { this.meterLifeLimit = meterLifeLimit; }
    public boolean isIsInitialized() { return isInitialized; }
    public void setIsInitialized(boolean isInitialized) { this.isInitialized = isInitialized; }
    public boolean isIsInitializedSecondTime() { return isInitializedSecondTime; }
    public void setIsInitializedSecondTime(boolean isInitializedSecondTime) { this.isInitializedSecondTime = isInitializedSecondTime; }
    public double getPrepaidBirrCurrentBalance() { return prepaidBirrCurrentBalance; }
    public void setPrepaidBirrCurrentBalance(double prepaidBirrCurrentBalance) { this.prepaidBirrCurrentBalance = prepaidBirrCurrentBalance; }
    public String getTerminationRemark() { return terminationRemark; }
    public void setTerminationRemark(String terminationRemark) { this.terminationRemark = terminationRemark; }
    public String getLocationCoordination() { return locationCoordination; }
    public void setLocationCoordination(String locationCoordination) { this.locationCoordination = locationCoordination; }
    public String getQrCode() { return qrCode; }
    public void setQrCode(String qrCode) { this.qrCode = qrCode; }
    public double getAdditionalMonthlyPayment() { return additionalMonthlyPayment; }
    public void setAdditionalMonthlyPayment(double additionalMonthlyPayment) { this.additionalMonthlyPayment = additionalMonthlyPayment; }
    public boolean isOldHasPenalty() { return oldHasPenalty; }
    public void setOldHasPenalty(boolean oldHasPenalty) { this.oldHasPenalty = oldHasPenalty; }
    public boolean isOldIfPenaltyPaid() { return oldIfPenaltyPaid; }
    public void setOldIfPenaltyPaid(boolean oldIfPenaltyPaid) { this.oldIfPenaltyPaid = oldIfPenaltyPaid; }
    public String getOldMonthsList() { return oldMonthsList; }
    public void setOldMonthsList(String oldMonthsList) { this.oldMonthsList = oldMonthsList; }
    public double getOldKfyaAndPenaltyTotal() { return oldKfyaAndPenaltyTotal; }
    public void setOldKfyaAndPenaltyTotal(double oldKfyaAndPenaltyTotal) { this.oldKfyaAndPenaltyTotal = oldKfyaAndPenaltyTotal; }
    public String getOldKfyaEachMonth() { return oldKfyaEachMonth; }
    public void setOldKfyaEachMonth(String oldKfyaEachMonth) { this.oldKfyaEachMonth = oldKfyaEachMonth; }
    public int getOldPenlityNumberOfMonths() { return oldPenlityNumberOfMonths; }
    public void setOldPenlityNumberOfMonths(int oldPenlityNumberOfMonths) { this.oldPenlityNumberOfMonths = oldPenlityNumberOfMonths; }
    public Date getRegisteredDate() { return registeredDate; }
    public void setRegisteredDate(Date registeredDate) { 
        this.registeredDate = registeredDate;
        convertRegisteredDateToEthiopian();
    }
    public Integer getRegisteredYear() { return registeredYear; }
    public void setRegisteredYear(Integer registeredYear) { this.registeredYear = registeredYear; }
    public Integer getRegisteredMonth() { return registeredMonth; }
    public void setRegisteredMonth(Integer registeredMonth) { this.registeredMonth = registeredMonth; }
    public Date getCanceledDate() { return canceledDate; }
    public void setCanceledDate(Date canceledDate) { 
        this.canceledDate = canceledDate;
        convertCanceledDateToEthiopian();
    }
    public Integer getCanceledYear() { return canceledYear; }
    public void setCanceledYear(Integer canceledYear) { this.canceledYear = canceledYear; }
    public Integer getCanceledMonth() { return canceledMonth; }
    public void setCanceledMonth(Integer canceledMonth) { this.canceledMonth = canceledMonth; }
    public boolean isWasCanceled() { return wasCanceled; }
    public void setWasCanceled(boolean wasCanceled) { this.wasCanceled = wasCanceled; }
    public boolean isIsJustReturnFromPenality() { return isJustReturnFromPenality; }
    public void setIsJustReturnFromPenality(boolean isJustReturnFromPenality) { this.isJustReturnFromPenality = isJustReturnFromPenality; }
    public Date getCanceledActivatedDate() { return canceledActivatedDate; }
    public void setCanceledActivatedDate(Date canceledActivatedDate) { 
        this.canceledActivatedDate = canceledActivatedDate;
        convertCanceledActivatedDateToEthiopian();
    }
    public double getTekemachKfya() { return tekemachKfya; }
    public void setTekemachKfya(double tekemachKfya) { this.tekemachKfya = tekemachKfya; }
    public String getTechemariFieldName() { return techemariFieldName; }
    public void setTechemariFieldName(String techemariFieldName) { this.techemariFieldName = techemariFieldName; }
    public double getTechemariKfya() { return techemariKfya; }
    public void setTechemariKfya(double techemariKfya) { this.techemariKfya = techemariKfya; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    public Integer getCityId() { return cityId; }
    public void setCityId(Integer cityId) { this.cityId = cityId; }
    public Integer getZoneId() { return zoneId; }
    public void setZoneId(Integer zoneId) { this.zoneId = zoneId; }
    public String getCompleteDeleted() { return completeDeleted; }
    public void setCompleteDeleted(String completeDeleted) { this.completeDeleted = completeDeleted; }
    public Date getCompleteDeletedDate() { return completeDeletedDate; }
    public void setCompleteDeletedDate(Date completeDeletedDate) { this.completeDeletedDate = completeDeletedDate; }
    public String getKdmeKfyaReasons() { return kdmeKfyaReasons; }
    public void setKdmeKfyaReasons(String kdmeKfyaReasons) { this.kdmeKfyaReasons = kdmeKfyaReasons; }
    public Integer getBillingCustomerInfoMeterId() { return billingCustomerInfoMeterId; }
    public void setBillingCustomerInfoMeterId(Integer billingCustomerInfoMeterId) { this.billingCustomerInfoMeterId = billingCustomerInfoMeterId; }
    public Integer getBillingTerminationReasonId() { return billingTerminationReasonId; }
    public void setBillingTerminationReasonId(Integer billingTerminationReasonId) { this.billingTerminationReasonId = billingTerminationReasonId; }
    public String getTerminationReason() { return terminationReason; }
    public void setTerminationReason(String terminationReason) { this.terminationReason = terminationReason; }
    public Integer getBillingMeterTypeId() { return billingMeterTypeId; }
    public void setBillingMeterTypeId(Integer billingMeterTypeId) { this.billingMeterTypeId = billingMeterTypeId; }
    public Integer getBillingModeOfWaterServiceId() { return billingModeOfWaterServiceId; }
    public void setBillingModeOfWaterServiceId(Integer billingModeOfWaterServiceId) { this.billingModeOfWaterServiceId = billingModeOfWaterServiceId; }
    public Integer getAssignedReaderId() { return assignedReaderId; }
    public void setAssignedReaderId(Integer assignedReaderId) { this.assignedReaderId = assignedReaderId; }
    public Integer getBranchsId() { return branchsId; }
    public void setBranchsId(Integer branchsId) { this.branchsId = branchsId; }
    public Integer getAddressStreetsId() { return addressStreetsId; }
    public void setAddressStreetsId(Integer addressStreetsId) { this.addressStreetsId = addressStreetsId; }
    public Integer getAddressKetenaId() { return addressKetenaId; }
    public void setAddressKetenaId(Integer addressKetenaId) { this.addressKetenaId = addressKetenaId; }
    public Integer getCustomerTypeId() { return customerTypeId; }
    public void setCustomerTypeId(Integer customerTypeId) { this.customerTypeId = customerTypeId; }
    public Integer getMeterSizeId() { return meterSizeId; }
    public void setMeterSizeId(Integer meterSizeId) { this.meterSizeId = meterSizeId; }
    
    // Ethiopian Date Getters with automatic conversion
    public String getRegisteredDateEthiopian() { return registeredDateEthiopian; }
    public String getRegisteredDateEthiopianAmharic() { return registeredDateEthiopianAmharic; }
    
    private void convertRegisteredDateToEthiopian() {
        if (registeredDate != null) {
            try {
                LocalDate localDate = new java.sql.Date(registeredDate.getTime()).toLocalDate();
                EthiopianCalendarConverter.EthiopianDate ethDate = 
                    EthiopianCalendarConverter.gregorianToEthiopian(localDate);
                this.registeredDateEthiopian = ethDate.format("dd/MM/yyyy");
                this.registeredDateEthiopianAmharic = ethDate.formatWithAmharicMonth();
            } catch (Exception e) {
                System.err.println("Error converting registration date: " + e.getMessage());
                this.registeredDateEthiopian = null;
                this.registeredDateEthiopianAmharic = null;
            }
        } else {
            this.registeredDateEthiopian = null;
            this.registeredDateEthiopianAmharic = null;
        }
    }
    
    public String getCanceledDateEthiopian() { return canceledDateEthiopian; }
    public String getCanceledDateEthiopianAmharic() { return canceledDateEthiopianAmharic; }
    
    private void convertCanceledDateToEthiopian() {
        if (canceledDate != null) {
            try {
                LocalDate localDate = new java.sql.Date(canceledDate.getTime()).toLocalDate();
                EthiopianCalendarConverter.EthiopianDate ethDate = 
                    EthiopianCalendarConverter.gregorianToEthiopian(localDate);
                this.canceledDateEthiopian = ethDate.format("dd/MM/yyyy");
                this.canceledDateEthiopianAmharic = ethDate.formatWithAmharicMonth();
            } catch (Exception e) {
                this.canceledDateEthiopian = null;
                this.canceledDateEthiopianAmharic = null;
            }
        } else {
            this.canceledDateEthiopian = null;
            this.canceledDateEthiopianAmharic = null;
        }
    }
    
    public String getCanceledActivatedDateEthiopian() { return canceledActivatedDateEthiopian; }
    public String getCanceledActivatedDateEthiopianAmharic() { return canceledActivatedDateEthiopianAmharic; }
    
    private void convertCanceledActivatedDateToEthiopian() {
        if (canceledActivatedDate != null) {
            try {
                LocalDate localDate = new java.sql.Date(canceledActivatedDate.getTime()).toLocalDate();
                EthiopianCalendarConverter.EthiopianDate ethDate = 
                    EthiopianCalendarConverter.gregorianToEthiopian(localDate);
                this.canceledActivatedDateEthiopian = ethDate.format("dd/MM/yyyy");
                this.canceledActivatedDateEthiopianAmharic = ethDate.formatWithAmharicMonth();
            } catch (Exception e) {
                this.canceledActivatedDateEthiopian = null;
                this.canceledActivatedDateEthiopianAmharic = null;
            }
        } else {
            this.canceledActivatedDateEthiopian = null;
            this.canceledActivatedDateEthiopianAmharic = null;
        }
    }
}
