package com.wbill.home.model;

import java.io.Serializable;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import jakarta.persistence.*;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

@Entity
@Table(name = "custom_maintenance_request")
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class CustomMaintenanceRequest implements Serializable {
    private static final long serialVersionUID = 1L;

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "request_number", nullable = false, unique = true, length = 50)
    private String requestNumber;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "customer_id", nullable = false)
    @JsonIgnoreProperties({"hibernateLazyInitializer", "handler", "billingReadings", "billingCustomerInfoMeter", "addressStreet", "addressKetena", "branch", "userAccount", "billingTerminationReason", "billingMeterType", "billingModeOfWaterService", "billingMeterSize", "billingCustomerType"})
    private BillingCustomerInfo customer;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "maintenance_type_id")
    @JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
    private CustomMaintenanceType maintenanceType;

    @Column(name = "customer_full_name", nullable = false, length = 200)
    private String customerFullName;

    @Column(name = "customer_full_name_eng", length = 200)
    private String customerFullNameEng;

    @Column(name = "phone_number", nullable = false, length = 50)
    private String phoneNumber;

    @Column(name = "national_id_number", length = 50)
    private String nationalIdNumber;

    @Column(name = "house_number", length = 50)
    private String houseNumber;

    @Column(name = "account_number", nullable = false, length = 50)
    private String accountNumber;

    @Column(name = "meter_number", length = 50)
    private String meterNumber;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "branch_id", nullable = false)
    @JsonIgnoreProperties({"hibernateLazyInitializer", "handler", "branchKebele", "branchCity", "registeredBy", "modifiedBy"})
    private Branch branch;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "kebele_id")
    @JsonIgnoreProperties({"hibernateLazyInitializer", "handler", "registeredBy", "modifiedBy", "addressCity"})
    private AddressStreets kebele;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "ketena_id")
    @JsonIgnoreProperties({"hibernateLazyInitializer", "handler", "addressStreets", "registeredBy", "modifiedBy"})
    private AddressKetena ketena;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "customer_type_id")
    @JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
    private BillingCustomerType customerType;

    @Column(name = "address_description", columnDefinition = "TEXT")
    private String addressDescription;

    @Column(name = "problem_description", columnDefinition = "TEXT")
    private String problemDescription;

    @Column(name = "status", nullable = false, length = 50)
    private String status = "PENDING_SURVEY_ASSIGNMENT";

    // Survey Stage
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "survey_plumber_id")
    @JsonIgnoreProperties({"hibernateLazyInitializer", "handler", "userRole", "branch", "registeredBy", "modifiedBy"})
    private UserAccount surveyPlumber;

    @Column(name = "survey_assigned_date")
    private LocalDateTime surveyAssignedDate;

    @Column(name = "survey_plumber_notes", columnDefinition = "TEXT")
    private String surveyPlumberNotes;

    // Financial Totals
    @Column(name = "materials_utility_total", precision = 15, scale = 2, nullable = false)
    private BigDecimal materialsUtilityTotal = BigDecimal.ZERO;

    @Column(name = "materials_outside_total", precision = 15, scale = 2, nullable = false)
    private BigDecimal materialsOutsideTotal = BigDecimal.ZERO;

    @Column(name = "service_charge_percent", precision = 5, scale = 2, nullable = false)
    private BigDecimal serviceChargePercent = new BigDecimal("55.00");

    @Column(name = "service_charge_amount", precision = 15, scale = 2, nullable = false)
    private BigDecimal serviceChargeAmount = BigDecimal.ZERO;

    @Column(name = "transport_charge_percent", precision = 5, scale = 2, nullable = false)
    private BigDecimal transportChargePercent = new BigDecimal("25.00");

    @Column(name = "transport_charge_amount", precision = 15, scale = 2, nullable = false)
    private BigDecimal transportChargeAmount = BigDecimal.ZERO;

    @Column(name = "additional_fees_total", precision = 15, scale = 2, nullable = false)
    private BigDecimal additionalFeesTotal = BigDecimal.ZERO;

    @Column(name = "total_payable_amount", precision = 15, scale = 2, nullable = false)
    private BigDecimal totalPayableAmount = BigDecimal.ZERO;

    // Revenue Stage
    @Column(name = "is_paid", nullable = false)
    private Boolean isPaid = false;

    @Column(name = "payment_reference_number", length = 100)
    private String paymentReferenceNumber;

    @Column(name = "payment_receipt_number", length = 100)
    private String paymentReceiptNumber;

    @Column(name = "payment_approved_by", length = 100)
    private String paymentApprovedBy;

    @Column(name = "payment_approved_date")
    private LocalDateTime paymentApprovedDate;

    // Store Material Dispatch
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "inv_issue_voucher_id")
    @JsonIgnoreProperties({"hibernateLazyInitializer", "handler", "lines", "store"})
    private InvIssueVoucher invIssueVoucher;

    @Column(name = "materials_collected_date")
    private LocalDateTime materialsCollectedDate;

    @Column(name = "storekeeper_username", length = 100)
    private String storekeeperUsername;

    // Maintenance Execution Stage
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "maintenance_plumber_id")
    @JsonIgnoreProperties({"hibernateLazyInitializer", "handler", "userRole", "branch", "registeredBy", "modifiedBy"})
    private UserAccount maintenancePlumber;

    @Column(name = "maintenance_assigned_date")
    private LocalDateTime maintenanceAssignedDate;

    @Column(name = "maintenance_completed_date")
    private LocalDateTime maintenanceCompletedDate;

    @Column(name = "maintenance_notes", columnDefinition = "TEXT")
    private String maintenanceNotes;

    @Column(name = "maintenance_approved_by", length = 100)
    private String maintenanceApprovedBy;

    @Column(name = "final_meter_reading")
    private Double finalMeterReading;

    @Column(name = "registered_by", length = 100)
    private String registeredBy;

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @Column(name = "rejection_reason", columnDefinition = "TEXT")
    private String rejectionReason;

    @Column(name = "rejected_by", length = 100)
    private String rejectedBy;

    @Column(name = "rejected_date")
    private LocalDateTime rejectedDate;

    @Column(name = "cancellation_reason", columnDefinition = "TEXT")
    private String cancellationReason;

    // Child relations
    @OneToMany(mappedBy = "request", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    @OrderBy("id ASC")
    private List<CustomMaintenanceItem> items = new ArrayList<>();

    @OneToMany(mappedBy = "request", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    @OrderBy("id ASC")
    private List<CustomMaintenanceAdditionalFee> additionalFees = new ArrayList<>();

    @OneToMany(mappedBy = "request", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    @OrderBy("createdAt DESC")
    private List<CustomMaintenanceActivityLog> activityLogs = new ArrayList<>();

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
        if (status == null) status = "PENDING_SURVEY_ASSIGNMENT";
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }

    public CustomMaintenanceRequest() {}

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getRequestNumber() { return requestNumber; }
    public void setRequestNumber(String requestNumber) { this.requestNumber = requestNumber; }

    public BillingCustomerInfo getCustomer() { return customer; }
    public void setCustomer(BillingCustomerInfo customer) { this.customer = customer; }

    public CustomMaintenanceType getMaintenanceType() { return maintenanceType; }
    public void setMaintenanceType(CustomMaintenanceType maintenanceType) { this.maintenanceType = maintenanceType; }

    public String getCustomerFullName() { return customerFullName; }
    public void setCustomerFullName(String customerFullName) { this.customerFullName = customerFullName; }

    public String getCustomerFullNameEng() { return customerFullNameEng; }
    public void setCustomerFullNameEng(String customerFullNameEng) { this.customerFullNameEng = customerFullNameEng; }

    public String getPhoneNumber() { return phoneNumber; }
    public void setPhoneNumber(String phoneNumber) { this.phoneNumber = phoneNumber; }

    public String getNationalIdNumber() { return nationalIdNumber; }
    public void setNationalIdNumber(String nationalIdNumber) { this.nationalIdNumber = nationalIdNumber; }

    public String getHouseNumber() { return houseNumber; }
    public void setHouseNumber(String houseNumber) { this.houseNumber = houseNumber; }

    public String getAccountNumber() { return accountNumber; }
    public void setAccountNumber(String accountNumber) { this.accountNumber = accountNumber; }

    public String getMeterNumber() { return meterNumber; }
    public void setMeterNumber(String meterNumber) { this.meterNumber = meterNumber; }

    public Branch getBranch() { return branch; }
    public void setBranch(Branch branch) { this.branch = branch; }

    public AddressStreets getKebele() { return kebele; }
    public void setKebele(AddressStreets kebele) { this.kebele = kebele; }

    public AddressKetena getKetena() { return ketena; }
    public void setKetena(AddressKetena ketena) { this.ketena = ketena; }

    public BillingCustomerType getCustomerType() { return customerType; }
    public void setCustomerType(BillingCustomerType customerType) { this.customerType = customerType; }

    public String getAddressDescription() { return addressDescription; }
    public void setAddressDescription(String addressDescription) { this.addressDescription = addressDescription; }

    public String getProblemDescription() { return problemDescription; }
    public void setProblemDescription(String problemDescription) { this.problemDescription = problemDescription; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public UserAccount getSurveyPlumber() { return surveyPlumber; }
    public void setSurveyPlumber(UserAccount surveyPlumber) { this.surveyPlumber = surveyPlumber; }

    public LocalDateTime getSurveyAssignedDate() { return surveyAssignedDate; }
    public void setSurveyAssignedDate(LocalDateTime surveyAssignedDate) { this.surveyAssignedDate = surveyAssignedDate; }

    public String getSurveyPlumberNotes() { return surveyPlumberNotes; }
    public void setSurveyPlumberNotes(String surveyPlumberNotes) { this.surveyPlumberNotes = surveyPlumberNotes; }

    public BigDecimal getMaterialsUtilityTotal() { return materialsUtilityTotal; }
    public void setMaterialsUtilityTotal(BigDecimal materialsUtilityTotal) { this.materialsUtilityTotal = materialsUtilityTotal; }

    public BigDecimal getMaterialsOutsideTotal() { return materialsOutsideTotal; }
    public void setMaterialsOutsideTotal(BigDecimal materialsOutsideTotal) { this.materialsOutsideTotal = materialsOutsideTotal; }

    public BigDecimal getServiceChargePercent() { return serviceChargePercent; }
    public void setServiceChargePercent(BigDecimal serviceChargePercent) { this.serviceChargePercent = serviceChargePercent; }

    public BigDecimal getServiceChargeAmount() { return serviceChargeAmount; }
    public void setServiceChargeAmount(BigDecimal serviceChargeAmount) { this.serviceChargeAmount = serviceChargeAmount; }

    public BigDecimal getTransportChargePercent() { return transportChargePercent; }
    public void setTransportChargePercent(BigDecimal transportChargePercent) { this.transportChargePercent = transportChargePercent; }

    public BigDecimal getTransportChargeAmount() { return transportChargeAmount; }
    public void setTransportChargeAmount(BigDecimal transportChargeAmount) { this.transportChargeAmount = transportChargeAmount; }

    public BigDecimal getAdditionalFeesTotal() { return additionalFeesTotal; }
    public void setAdditionalFeesTotal(BigDecimal additionalFeesTotal) { this.additionalFeesTotal = additionalFeesTotal; }

    public BigDecimal getTotalPayableAmount() { return totalPayableAmount; }
    public void setTotalPayableAmount(BigDecimal totalPayableAmount) { this.totalPayableAmount = totalPayableAmount; }

    public Boolean getIsPaid() { return isPaid; }
    public void setIsPaid(Boolean isPaid) { this.isPaid = isPaid; }

    public String getPaymentReferenceNumber() { return paymentReferenceNumber; }
    public void setPaymentReferenceNumber(String paymentReferenceNumber) { this.paymentReferenceNumber = paymentReferenceNumber; }

    public String getPaymentReceiptNumber() { return paymentReceiptNumber; }
    public void setPaymentReceiptNumber(String paymentReceiptNumber) { this.paymentReceiptNumber = paymentReceiptNumber; }

    public String getPaymentApprovedBy() { return paymentApprovedBy; }
    public void setPaymentApprovedBy(String paymentApprovedBy) { this.paymentApprovedBy = paymentApprovedBy; }

    public LocalDateTime getPaymentApprovedDate() { return paymentApprovedDate; }
    public void setPaymentApprovedDate(LocalDateTime paymentApprovedDate) { this.paymentApprovedDate = paymentApprovedDate; }

    public InvIssueVoucher getInvIssueVoucher() { return invIssueVoucher; }
    public void setInvIssueVoucher(InvIssueVoucher invIssueVoucher) { this.invIssueVoucher = invIssueVoucher; }

    public LocalDateTime getMaterialsCollectedDate() { return materialsCollectedDate; }
    public void setMaterialsCollectedDate(LocalDateTime materialsCollectedDate) { this.materialsCollectedDate = materialsCollectedDate; }

    public String getStorekeeperUsername() { return storekeeperUsername; }
    public void setStorekeeperUsername(String storekeeperUsername) { this.storekeeperUsername = storekeeperUsername; }

    public UserAccount getMaintenancePlumber() { return maintenancePlumber; }
    public void setMaintenancePlumber(UserAccount maintenancePlumber) { this.maintenancePlumber = maintenancePlumber; }

    public LocalDateTime getMaintenanceAssignedDate() { return maintenanceAssignedDate; }
    public void setMaintenanceAssignedDate(LocalDateTime maintenanceAssignedDate) { this.maintenanceAssignedDate = maintenanceAssignedDate; }

    public LocalDateTime getMaintenanceCompletedDate() { return maintenanceCompletedDate; }
    public void setMaintenanceCompletedDate(LocalDateTime maintenanceCompletedDate) { this.maintenanceCompletedDate = maintenanceCompletedDate; }

    public String getMaintenanceNotes() { return maintenanceNotes; }
    public void setMaintenanceNotes(String maintenanceNotes) { this.maintenanceNotes = maintenanceNotes; }

    public String getMaintenanceApprovedBy() { return maintenanceApprovedBy; }
    public void setMaintenanceApprovedBy(String maintenanceApprovedBy) { this.maintenanceApprovedBy = maintenanceApprovedBy; }

    public Double getFinalMeterReading() { return finalMeterReading; }
    public void setFinalMeterReading(Double finalMeterReading) { this.finalMeterReading = finalMeterReading; }

    public String getRegisteredBy() { return registeredBy; }
    public void setRegisteredBy(String registeredBy) { this.registeredBy = registeredBy; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }

    public List<CustomMaintenanceItem> getItems() { return items; }
    public void setItems(List<CustomMaintenanceItem> items) { this.items = items; }

    public List<CustomMaintenanceAdditionalFee> getAdditionalFees() { return additionalFees; }
    public void setAdditionalFees(List<CustomMaintenanceAdditionalFee> additionalFees) { this.additionalFees = additionalFees; }

    public List<CustomMaintenanceActivityLog> getActivityLogs() { return activityLogs; }
    public void setActivityLogs(List<CustomMaintenanceActivityLog> activityLogs) { this.activityLogs = activityLogs; }

    public String getRejectionReason() { return rejectionReason; }
    public void setRejectionReason(String rejectionReason) { this.rejectionReason = rejectionReason; }

    public String getRejectedBy() { return rejectedBy; }
    public void setRejectedBy(String rejectedBy) { this.rejectedBy = rejectedBy; }

    public LocalDateTime getRejectedDate() { return rejectedDate; }
    public void setRejectedDate(LocalDateTime rejectedDate) { this.rejectedDate = rejectedDate; }

    public String getCancellationReason() { return cancellationReason; }
    public void setCancellationReason(String cancellationReason) { this.cancellationReason = cancellationReason; }
}

