package com.wbill.home.dto;

import com.wbill.home.util.EthiopianCalendarConverter;
import java.time.LocalDate;

/**
 * Customer Response DTO with Ethiopian Calendar Support
 * 
 * This DTO automatically converts Gregorian dates from the database
 * to Ethiopian calendar format for frontend display.
 */
public class CustomerResponseDTO {
    
    // Basic customer information
    private Long id;
    private String accountNumber;
    private String fullName;
    private String fullNameEng;
    private String phoneNumber;
    private String status;
    
    // Address information
    private String addressDescription;
    private Long addressStreetsId;
    private String addressStreetsName;
    private Long addressKetenaId;
    private String addressKetenaName;
    
    // Customer type and branch
    private Long customerTypeId;
    private String customerTypeName;
    private Long branchsId;
    private String branchName;
    
    // Meter information
    private String meterNumber;
    private Long meterSizeId;
    private String meterSizeName;
    private Double initialReading;
    private Double maxReference;
    
    // Payment information
    private Double additionalMonthlyPayment;
    private Double customerBalanceBirr;
    private Double prepaidBirrCurrentBalance;
    private String techemariFieldName;
    private Double techemariKfya;
    private Boolean oldHasPenalty;
    private Integer oldPenlityNumberOfMonths;
    private String oldMonthsList;
    private Double oldKfyaAndPenaltyTotal;
    
    // Date fields - both Gregorian (for processing) and Ethiopian (for display)
    private LocalDate registeredDate; // Original Gregorian date
    private String registeredDateEthiopian; // Ethiopian format: dd/MM/yyyy
    private String registeredDateEthiopianAmharic; // Ethiopian with Amharic month
    private Integer registeredYear;
    private Integer registeredMonth;
    
    private LocalDate canceledDate;
    private String canceledDateEthiopian;
    private String canceledDateEthiopianAmharic;
    
    private LocalDate canceledActivatedDate;
    private String canceledActivatedDateEthiopian;
    private String canceledActivatedDateEthiopianAmharic;
    
    // Reader assignment
    private Long assignedReaderId;
    private String assignedReaderName;
    
    // Location
    private String locationCoordination;
    
    // Meter status
    private Boolean isInitializedSecondTime;
    
    // Default constructor
    public CustomerResponseDTO() {}
    
    // Constructor with automatic Ethiopian date conversion
    public CustomerResponseDTO(Long id, String accountNumber, String fullName, String fullNameEng,
                              String phoneNumber, String status, LocalDate registeredDate,
                              Integer registeredYear, Integer registeredMonth) {
        this.id = id;
        this.accountNumber = accountNumber;
        this.fullName = fullName;
        this.fullNameEng = fullNameEng;
        this.phoneNumber = phoneNumber;
        this.status = status;
        this.registeredYear = registeredYear;
        this.registeredMonth = registeredMonth;
        
        // Convert registration date to Ethiopian
        setRegisteredDate(registeredDate);
    }
    
    // Setter with automatic Ethiopian conversion for registeredDate
    public void setRegisteredDate(LocalDate registeredDate) {
        this.registeredDate = registeredDate;
        if (registeredDate != null) {
            try {
                EthiopianCalendarConverter.EthiopianDate ethDate = 
                    EthiopianCalendarConverter.gregorianToEthiopian(registeredDate);
                this.registeredDateEthiopian = ethDate.format("dd/MM/yyyy");
                this.registeredDateEthiopianAmharic = ethDate.formatWithAmharicMonth();
            } catch (Exception e) {
                this.registeredDateEthiopian = null;
                this.registeredDateEthiopianAmharic = null;
            }
        } else {
            this.registeredDateEthiopian = null;
            this.registeredDateEthiopianAmharic = null;
        }
    }
    
    // Setter with automatic Ethiopian conversion for canceledDate
    public void setCanceledDate(LocalDate canceledDate) {
        this.canceledDate = canceledDate;
        if (canceledDate != null) {
            try {
                EthiopianCalendarConverter.EthiopianDate ethDate = 
                    EthiopianCalendarConverter.gregorianToEthiopian(canceledDate);
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
    
    // Setter with automatic Ethiopian conversion for canceledActivatedDate
    public void setCanceledActivatedDate(LocalDate canceledActivatedDate) {
        this.canceledActivatedDate = canceledActivatedDate;
        if (canceledActivatedDate != null) {
            try {
                EthiopianCalendarConverter.EthiopianDate ethDate = 
                    EthiopianCalendarConverter.gregorianToEthiopian(canceledActivatedDate);
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
    
    // Static factory method for easy DTO creation
    public static CustomerResponseDTO fromEntity(Object customerEntity) {
        // This would typically map from your Customer entity
        // Adjust field mappings based on your actual Customer entity structure
        CustomerResponseDTO dto = new CustomerResponseDTO();
        
        // Map basic fields (adjust based on your entity)
        // dto.setId(customerEntity.getId());
        // dto.setAccountNumber(customerEntity.getAccountNumber());
        // ... map other fields
        
        return dto;
    }
    
    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    
    public String getAccountNumber() { return accountNumber; }
    public void setAccountNumber(String accountNumber) { this.accountNumber = accountNumber; }
    
    public String getFullName() { return fullName; }
    public void setFullName(String fullName) { this.fullName = fullName; }
    
    public String getFullNameEng() { return fullNameEng; }
    public void setFullNameEng(String fullNameEng) { this.fullNameEng = fullNameEng; }
    
    public String getPhoneNumber() { return phoneNumber; }
    public void setPhoneNumber(String phoneNumber) { this.phoneNumber = phoneNumber; }
    
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    
    public String getAddressDescription() { return addressDescription; }
    public void setAddressDescription(String addressDescription) { this.addressDescription = addressDescription; }
    
    public Long getAddressStreetsId() { return addressStreetsId; }
    public void setAddressStreetsId(Long addressStreetsId) { this.addressStreetsId = addressStreetsId; }
    
    public String getAddressStreetsName() { return addressStreetsName; }
    public void setAddressStreetsName(String addressStreetsName) { this.addressStreetsName = addressStreetsName; }
    
    public Long getAddressKetenaId() { return addressKetenaId; }
    public void setAddressKetenaId(Long addressKetenaId) { this.addressKetenaId = addressKetenaId; }
    
    public String getAddressKetenaName() { return addressKetenaName; }
    public void setAddressKetenaName(String addressKetenaName) { this.addressKetenaName = addressKetenaName; }
    
    public Long getCustomerTypeId() { return customerTypeId; }
    public void setCustomerTypeId(Long customerTypeId) { this.customerTypeId = customerTypeId; }
    
    public String getCustomerTypeName() { return customerTypeName; }
    public void setCustomerTypeName(String customerTypeName) { this.customerTypeName = customerTypeName; }
    
    public Long getBranchsId() { return branchsId; }
    public void setBranchsId(Long branchsId) { this.branchsId = branchsId; }
    
    public String getBranchName() { return branchName; }
    public void setBranchName(String branchName) { this.branchName = branchName; }
    
    public String getMeterNumber() { return meterNumber; }
    public void setMeterNumber(String meterNumber) { this.meterNumber = meterNumber; }
    
    public Long getMeterSizeId() { return meterSizeId; }
    public void setMeterSizeId(Long meterSizeId) { this.meterSizeId = meterSizeId; }
    
    public String getMeterSizeName() { return meterSizeName; }
    public void setMeterSizeName(String meterSizeName) { this.meterSizeName = meterSizeName; }
    
    public Double getInitialReading() { return initialReading; }
    public void setInitialReading(Double initialReading) { this.initialReading = initialReading; }
    
    public Double getMaxReference() { return maxReference; }
    public void setMaxReference(Double maxReference) { this.maxReference = maxReference; }
    
    public Double getAdditionalMonthlyPayment() { return additionalMonthlyPayment; }
    public void setAdditionalMonthlyPayment(Double additionalMonthlyPayment) { this.additionalMonthlyPayment = additionalMonthlyPayment; }
    
    public Double getCustomerBalanceBirr() { return customerBalanceBirr; }
    public void setCustomerBalanceBirr(Double customerBalanceBirr) { this.customerBalanceBirr = customerBalanceBirr; }
    
    public Double getPrepaidBirrCurrentBalance() { return prepaidBirrCurrentBalance; }
    public void setPrepaidBirrCurrentBalance(Double prepaidBirrCurrentBalance) { this.prepaidBirrCurrentBalance = prepaidBirrCurrentBalance; }
    
    public String getTechemariFieldName() { return techemariFieldName; }
    public void setTechemariFieldName(String techemariFieldName) { this.techemariFieldName = techemariFieldName; }
    
    public Double getTechemariKfya() { return techemariKfya; }
    public void setTechemariKfya(Double techemariKfya) { this.techemariKfya = techemariKfya; }
    
    public Boolean getOldHasPenalty() { return oldHasPenalty; }
    public void setOldHasPenalty(Boolean oldHasPenalty) { this.oldHasPenalty = oldHasPenalty; }
    
    public Integer getOldPenlityNumberOfMonths() { return oldPenlityNumberOfMonths; }
    public void setOldPenlityNumberOfMonths(Integer oldPenlityNumberOfMonths) { this.oldPenlityNumberOfMonths = oldPenlityNumberOfMonths; }
    
    public String getOldMonthsList() { return oldMonthsList; }
    public void setOldMonthsList(String oldMonthsList) { this.oldMonthsList = oldMonthsList; }
    
    public Double getOldKfyaAndPenaltyTotal() { return oldKfyaAndPenaltyTotal; }
    public void setOldKfyaAndPenaltyTotal(Double oldKfyaAndPenaltyTotal) { this.oldKfyaAndPenaltyTotal = oldKfyaAndPenaltyTotal; }
    
    // Date getters (Gregorian - for processing)
    public LocalDate getRegisteredDate() { return registeredDate; }
    public LocalDate getCanceledDate() { return canceledDate; }
    public LocalDate getCanceledActivatedDate() { return canceledActivatedDate; }
    
    // Ethiopian date getters (for display)
    public String getRegisteredDateEthiopian() { return registeredDateEthiopian; }
    public String getRegisteredDateEthiopianAmharic() { return registeredDateEthiopianAmharic; }
    public String getCanceledDateEthiopian() { return canceledDateEthiopian; }
    public String getCanceledDateEthiopianAmharic() { return canceledDateEthiopianAmharic; }
    public String getCanceledActivatedDateEthiopian() { return canceledActivatedDateEthiopian; }
    public String getCanceledActivatedDateEthiopianAmharic() { return canceledActivatedDateEthiopianAmharic; }
    
    public Integer getRegisteredYear() { return registeredYear; }
    public void setRegisteredYear(Integer registeredYear) { this.registeredYear = registeredYear; }
    
    public Integer getRegisteredMonth() { return registeredMonth; }
    public void setRegisteredMonth(Integer registeredMonth) { this.registeredMonth = registeredMonth; }
    
    public Long getAssignedReaderId() { return assignedReaderId; }
    public void setAssignedReaderId(Long assignedReaderId) { this.assignedReaderId = assignedReaderId; }
    
    public String getAssignedReaderName() { return assignedReaderName; }
    public void setAssignedReaderName(String assignedReaderName) { this.assignedReaderName = assignedReaderName; }
    
    public String getLocationCoordination() { return locationCoordination; }
    public void setLocationCoordination(String locationCoordination) { this.locationCoordination = locationCoordination; }
    
    public Boolean getIsInitializedSecondTime() { return isInitializedSecondTime; }
    public void setIsInitializedSecondTime(Boolean isInitializedSecondTime) { this.isInitializedSecondTime = isInitializedSecondTime; }
}
