package com.wbill.home.model;

import java.io.Serializable;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import jakarta.persistence.*;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

@Entity
@Table(name = "custom_new_line_connection_request")
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class CustomNewLineConnectionRequest implements Serializable {
    private static final long serialVersionUID = 1L;

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "application_number", nullable = false, unique = true, length = 50)
    private String applicationNumber;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "customer_id")
    @JsonIgnoreProperties({"hibernateLazyInitializer", "handler", "billingReadings", "billingCustomerInfoMeter", "addressStreet", "addressKetena", "branch", "userAccount", "billingTerminationReason", "billingMeterType", "billingModeOfWaterService", "billingMeterSize", "billingCustomerType"})
    private BillingCustomerInfo customer;

    @Column(name = "applicant_name", length = 200)
    private String applicantName;

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

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "branch_id")
    @JsonIgnoreProperties({"hibernateLazyInitializer", "handler", "branchKebele", "branchCity", "registeredBy", "modifiedBy"})
    private Branch branch;

    @Column(name = "address_description", columnDefinition = "TEXT")
    private String addressDescription;

    @Column(name = "status", nullable = false, length = 50)
    private String status = "PENDING_SURVEY_ASSIGNMENT";

    // Technical & Survey Stage
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "survey_plumber_id")
    @JsonIgnoreProperties({"hibernateLazyInitializer", "handler", "userRole", "branch", "registeredBy", "modifiedBy"})
    private UserAccount surveyPlumber;

    @Column(name = "survey_assigned_date")
    private LocalDateTime surveyAssignedDate;

    @Column(name = "survey_plumber_notes", columnDefinition = "TEXT")
    private String surveyPlumberNotes;

    // Financial Totals (55% Service, 25% Transport)
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

    // Installation Stage
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "installation_plumber_id")
    @JsonIgnoreProperties({"hibernateLazyInitializer", "handler", "userRole", "branch", "registeredBy", "modifiedBy"})
    private UserAccount installationPlumber;

    @Column(name = "installation_assigned_date")
    private LocalDateTime installationAssignedDate;

    @Column(name = "installation_completed_date")
    private LocalDateTime installationCompletedDate;

    @Column(name = "installation_notes", columnDefinition = "TEXT")
    private String installationNotes;

    @Column(name = "installation_approved_by", length = 100)
    private String installationApprovedBy;

    // Final Customer Activation
    @Column(name = "meter_number", length = 50)
    private String meterNumber;

    @Column(name = "meter_size_id")
    private Integer meterSizeId;

    @Column(name = "initial_reading", nullable = false)
    private double initialReading = 0.0;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "assigned_reader_id")
    @JsonIgnoreProperties({"hibernateLazyInitializer", "handler", "userRole", "branch", "registeredBy", "modifiedBy"})
    private UserAccount assignedReader;

    @Column(name = "location_coordination", length = 100)
    private String locationCoordination;

    @Column(name = "activated_by", length = 100)
    private String activatedBy;

    @Column(name = "activated_date")
    private LocalDateTime activatedDate;

    @Column(name = "created_by", length = 100)
    private String createdBy;

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    // Child relations
    @OneToMany(mappedBy = "request", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    @OrderBy("id ASC")
    private List<CustomNewLineItem> items = new ArrayList<>();

    @OneToMany(mappedBy = "request", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    @OrderBy("id ASC")
    private List<CustomNewLineAdditionalFee> additionalFees = new ArrayList<>();

    @OneToMany(mappedBy = "request", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    @OrderBy("createdAt DESC")
    private List<CustomNewLineActivityLog> activityLogs = new ArrayList<>();

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }

    public CustomNewLineConnectionRequest() {}

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getApplicationNumber() { return applicationNumber; }
    public void setApplicationNumber(String applicationNumber) { this.applicationNumber = applicationNumber; }

    public BillingCustomerInfo getCustomer() { return customer; }
    public void setCustomer(BillingCustomerInfo customer) { this.customer = customer; }

    public String getApplicantName() { return applicantName; }
    public void setApplicantName(String applicantName) { this.applicantName = applicantName; }

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

    public AddressStreets getKebele() { return kebele; }
    public void setKebele(AddressStreets kebele) { this.kebele = kebele; }

    public AddressKetena getKetena() { return ketena; }
    public void setKetena(AddressKetena ketena) { this.ketena = ketena; }

    public BillingCustomerType getCustomerType() { return customerType; }
    public void setCustomerType(BillingCustomerType customerType) { this.customerType = customerType; }

    public Branch getBranch() { return branch; }
    public void setBranch(Branch branch) { this.branch = branch; }

    public String getAddressDescription() { return addressDescription; }
    public void setAddressDescription(String addressDescription) { this.addressDescription = addressDescription; }

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

    public UserAccount getInstallationPlumber() { return installationPlumber; }
    public void setInstallationPlumber(UserAccount installationPlumber) { this.installationPlumber = installationPlumber; }

    public LocalDateTime getInstallationAssignedDate() { return installationAssignedDate; }
    public void setInstallationAssignedDate(LocalDateTime installationAssignedDate) { this.installationAssignedDate = installationAssignedDate; }

    public LocalDateTime getInstallationCompletedDate() { return installationCompletedDate; }
    public void setInstallationCompletedDate(LocalDateTime installationCompletedDate) { this.installationCompletedDate = installationCompletedDate; }

    public String getInstallationNotes() { return installationNotes; }
    public void setInstallationNotes(String installationNotes) { this.installationNotes = installationNotes; }

    public String getInstallationApprovedBy() { return installationApprovedBy; }
    public void setInstallationApprovedBy(String installationApprovedBy) { this.installationApprovedBy = installationApprovedBy; }

    public String getMeterNumber() { return meterNumber; }
    public void setMeterNumber(String meterNumber) { this.meterNumber = meterNumber; }

    public Integer getMeterSizeId() { return meterSizeId; }
    public void setMeterSizeId(Integer meterSizeId) { this.meterSizeId = meterSizeId; }

    public double getInitialReading() { return initialReading; }
    public void setInitialReading(double initialReading) { this.initialReading = initialReading; }

    public UserAccount getAssignedReader() { return assignedReader; }
    public void setAssignedReader(UserAccount assignedReader) { this.assignedReader = assignedReader; }

    public String getLocationCoordination() { return locationCoordination; }
    public void setLocationCoordination(String locationCoordination) { this.locationCoordination = locationCoordination; }

    public String getActivatedBy() { return activatedBy; }
    public void setActivatedBy(String activatedBy) { this.activatedBy = activatedBy; }

    public LocalDateTime getActivatedDate() { return activatedDate; }
    public void setActivatedDate(LocalDateTime activatedDate) { this.activatedDate = activatedDate; }

    public String getCreatedBy() { return createdBy; }
    public void setCreatedBy(String createdBy) { this.createdBy = createdBy; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }

    public List<CustomNewLineItem> getItems() { return items; }
    public void setItems(List<CustomNewLineItem> items) { this.items = items; }

    public List<CustomNewLineAdditionalFee> getAdditionalFees() { return additionalFees; }
    public void setAdditionalFees(List<CustomNewLineAdditionalFee> additionalFees) { this.additionalFees = additionalFees; }

    public List<CustomNewLineActivityLog> getActivityLogs() { return activityLogs; }
    public void setActivityLogs(List<CustomNewLineActivityLog> activityLogs) { this.activityLogs = activityLogs; }
}
