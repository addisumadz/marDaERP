package com.wbill.home.model.hrms;

import java.io.Serializable;
import java.time.LocalDate;
import java.time.LocalDateTime;
import jakarta.persistence.*;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.wbill.home.model.Branch;
import com.wbill.home.model.AddressCity;
import com.wbill.home.model.AddressKetena;
import com.wbill.home.model.AddressStreets;

@Entity
@Table(name = "hrms_employee_info")
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class HrmsEmployee implements Serializable {
    private static final long serialVersionUID = 1L;

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private int id;

    @Column(name = "employee_id", nullable = false, unique = true, length = 50)
    private String employeeId;

    @Column(name = "tin_number", length = 50)
    private String tinNumber;

    @Column(name = "fayda_national_id", length = 50)
    private String faydaNationalId;

    @Column(name = "pension_number", length = 50)
    private String pensionNumber;

    @Column(name = "full_name", nullable = false, length = 200)
    private String fullName;

    @Column(name = "full_name_am", nullable = false, length = 300)
    private String fullNameAm;

    @Column(name = "mother_name", length = 150)
    private String motherName;

    @Column(name = "marital_status", length = 50)
    private String maritalStatus = "SINGLE";

    @Column(name = "disability_status", length = 100)
    private String disabilityStatus = "NONE";

    @Column(name = "sex", nullable = false, length = 10)
    private String sex;

    @Column(name = "date_of_birth")
    private LocalDate dateOfBirth;

    @Column(name = "nationality", length = 100)
    private String nationality = "Ethiopian";

    @Column(name = "blood_group", length = 10)
    private String bloodGroup;

    // Organization & Placement
    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "department_id")
    @JsonIgnoreProperties({"subDepartments", "parentDepartment", "hibernateLazyInitializer", "handler"})
    private HrmsDepartment department;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "position_id")
    @JsonIgnoreProperties({"department", "hibernateLazyInitializer", "handler"})
    private HrmsPosition position;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "job_grade_id")
    @JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
    private HrmsJobGrade jobGrade;

    @Column(name = "duty_station", length = 150)
    private String dutyStation = "Head Office";

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "branchs_id")
    @JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
    private Branch branch;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "address_city_id")
    @JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
    private AddressCity addressCity;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "address_ketena_id")
    @JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
    private AddressKetena addressKetena;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "address_streets_id")
    @JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
    private AddressStreets addressStreets;

    @Column(name = "phone_number", length = 50)
    private String phoneNumber;

    @Column(name = "email", length = 100)
    private String email;

    @Column(name = "emergency_contact_name", length = 150)
    private String emergencyContactName;

    @Column(name = "emergency_contact_phone", length = 50)
    private String emergencyContactPhone;

    // Employment Status (Labour Proclamation 1156/2019)
    @Column(name = "employment_type", nullable = false, length = 50)
    private String employmentType = "PERMANENT"; // PERMANENT, CONTRACT, CASUAL_DAILY_LABOR

    @Column(name = "employment_status", nullable = false, length = 50)
    private String employmentStatus = "ACTIVE"; // ACTIVE, PROBATION, SUSPENDED, ON_LEAVE, TERMINATED, RETIRED

    @Column(name = "first_employment_date")
    private LocalDate firstEmploymentDate;

    @Column(name = "yeteketerubet_ken")
    private LocalDate yeteketerubetKen;

    @Column(name = "probation_end_date")
    private LocalDate probationEndDate;

    @Column(name = "tureta_yemiwetubet_ken")
    private LocalDate turetaYemiwetubetKen;

    @Column(name = "current_salary", nullable = false)
    private double currentSalary = 0.0;

    // Biometric & Attendance Hardware Identification
    @Column(name = "biometric_pin", length = 50)
    private String biometricPin;

    @Column(name = "rfid_card_number", length = 50)
    private String rfidCardNumber;

    // Dual Banking Architecture (Primary CBE, Secondary Abay Bank)
    @Column(name = "primary_bank_name", length = 100)
    private String primaryBankName = "Commercial Bank of Ethiopia";

    @Column(name = "primary_bank_account", length = 50)
    private String primaryBankAccount;

    @Column(name = "primary_bank_branch", length = 100)
    private String primaryBankBranch;

    @Column(name = "secondary_bank_name", length = 100)
    private String secondaryBankName = "Abay Bank";

    @Column(name = "secondary_bank_account", length = 50)
    private String secondaryBankAccount;

    @Column(name = "secondary_bank_branch", length = 100)
    private String secondaryBankBranch;

    @Column(name = "secondary_payment_purpose", length = 150)
    private String secondaryPaymentPurpose = "Per Diem & Special Allowances";

    // Media & Photos
    @Column(name = "employee_photo", length = 255)
    private String employeePhoto;

    @Column(name = "employee_signature", length = 255)
    private String employeeSignature;

    // Audit fields
    @Column(name = "registered_by")
    private Integer registeredBy;

    @Column(name = "registered_date", updatable = false)
    private LocalDateTime registeredDate = LocalDateTime.now();

    @Column(name = "modified_by")
    private Integer modifiedBy;

    @Column(name = "modified_date")
    private LocalDateTime modifiedDate = LocalDateTime.now();

    @Column(name = "is_deleted", nullable = false)
    private boolean deleted = false;

    @Column(name = "is_salary_defaults_modified", nullable = false)
    private boolean salaryDefaultsModified = false;

    public HrmsEmployee() {}

    // Getters and Setters
    public int getId() { return id; }
    public void setId(int id) { this.id = id; }

    public String getEmployeeId() { return employeeId; }
    public void setEmployeeId(String employeeId) { this.employeeId = employeeId; }

    public String getTinNumber() { return tinNumber; }
    public void setTinNumber(String tinNumber) { this.tinNumber = tinNumber; }

    public String getFaydaNationalId() { return faydaNationalId; }
    public void setFaydaNationalId(String faydaNationalId) { this.faydaNationalId = faydaNationalId; }

    public String getPensionNumber() { return pensionNumber; }
    public void setPensionNumber(String pensionNumber) { this.pensionNumber = pensionNumber; }

    public String getFullName() { return fullName; }
    public void setFullName(String fullName) { this.fullName = fullName; }

    public String getFullNameAm() { return fullNameAm; }
    public void setFullNameAm(String fullNameAm) { this.fullNameAm = fullNameAm; }

    public String getMotherName() { return motherName; }
    public void setMotherName(String motherName) { this.motherName = motherName; }

    public String getMaritalStatus() { return maritalStatus; }
    public void setMaritalStatus(String maritalStatus) { this.maritalStatus = maritalStatus; }

    public String getDisabilityStatus() { return disabilityStatus; }
    public void setDisabilityStatus(String disabilityStatus) { this.disabilityStatus = disabilityStatus; }

    public String getSex() { return sex; }
    public void setSex(String sex) { this.sex = sex; }

    public LocalDate getDateOfBirth() { return dateOfBirth; }
    public void setDateOfBirth(LocalDate dateOfBirth) { this.dateOfBirth = dateOfBirth; }

    public String getNationality() { return nationality; }
    public void setNationality(String nationality) { this.nationality = nationality; }

    public String getBloodGroup() { return bloodGroup; }
    public void setBloodGroup(String bloodGroup) { this.bloodGroup = bloodGroup; }

    public HrmsDepartment getDepartment() { return department; }
    public void setDepartment(HrmsDepartment department) { this.department = department; }

    public HrmsPosition getPosition() { return position; }
    public void setPosition(HrmsPosition position) { this.position = position; }

    public HrmsJobGrade getJobGrade() { return jobGrade; }
    public void setJobGrade(HrmsJobGrade jobGrade) { this.jobGrade = jobGrade; }

    public String getDutyStation() { return dutyStation; }
    public void setDutyStation(String dutyStation) { this.dutyStation = dutyStation; }

    public Branch getBranch() { return branch; }
    public void setBranch(Branch branch) { this.branch = branch; }

    public AddressCity getAddressCity() { return addressCity; }
    public void setAddressCity(AddressCity addressCity) { this.addressCity = addressCity; }

    public AddressKetena getAddressKetena() { return addressKetena; }
    public void setAddressKetena(AddressKetena addressKetena) { this.addressKetena = addressKetena; }

    public AddressStreets getAddressStreets() { return addressStreets; }
    public void setAddressStreets(AddressStreets addressStreets) { this.addressStreets = addressStreets; }

    public String getPhoneNumber() { return phoneNumber; }
    public void setPhoneNumber(String phoneNumber) { this.phoneNumber = phoneNumber; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getEmergencyContactName() { return emergencyContactName; }
    public void setEmergencyContactName(String emergencyContactName) { this.emergencyContactName = emergencyContactName; }

    public String getEmergencyContactPhone() { return emergencyContactPhone; }
    public void setEmergencyContactPhone(String emergencyContactPhone) { this.emergencyContactPhone = emergencyContactPhone; }

    public String getEmploymentType() { return employmentType; }
    public void setEmploymentType(String employmentType) { this.employmentType = employmentType; }

    public String getEmploymentStatus() { return employmentStatus; }
    public void setEmploymentStatus(String employmentStatus) { this.employmentStatus = employmentStatus; }

    public LocalDate getFirstEmploymentDate() { return firstEmploymentDate; }
    public void setFirstEmploymentDate(LocalDate firstEmploymentDate) { this.firstEmploymentDate = firstEmploymentDate; }

    public LocalDate getYeteketerubetKen() { return yeteketerubetKen; }
    public void setYeteketerubetKen(LocalDate yeteketerubetKen) { this.yeteketerubetKen = yeteketerubetKen; }

    public LocalDate getProbationEndDate() { return probationEndDate; }
    public void setProbationEndDate(LocalDate probationEndDate) { this.probationEndDate = probationEndDate; }

    public LocalDate getTuretaYemiwetubetKen() { return turetaYemiwetubetKen; }
    public void setTuretaYemiwetubetKen(LocalDate turetaYemiwetubetKen) { this.turetaYemiwetubetKen = turetaYemiwetubetKen; }

    public double getCurrentSalary() { return currentSalary; }
    public void setCurrentSalary(double currentSalary) { this.currentSalary = currentSalary; }

    public String getBiometricPin() { return biometricPin; }
    public void setBiometricPin(String biometricPin) { this.biometricPin = biometricPin; }

    public String getRfidCardNumber() { return rfidCardNumber; }
    public void setRfidCardNumber(String rfidCardNumber) { this.rfidCardNumber = rfidCardNumber; }

    public String getPrimaryBankName() { return primaryBankName; }
    public void setPrimaryBankName(String primaryBankName) { this.primaryBankName = primaryBankName; }

    public String getPrimaryBankAccount() { return primaryBankAccount; }
    public void setPrimaryBankAccount(String primaryBankAccount) { this.primaryBankAccount = primaryBankAccount; }

    public String getPrimaryBankBranch() { return primaryBankBranch; }
    public void setPrimaryBankBranch(String primaryBankBranch) { this.primaryBankBranch = primaryBankBranch; }

    public String getSecondaryBankName() { return secondaryBankName; }
    public void setSecondaryBankName(String secondaryBankName) { this.secondaryBankName = secondaryBankName; }

    public String getSecondaryBankAccount() { return secondaryBankAccount; }
    public void setSecondaryBankAccount(String secondaryBankAccount) { this.secondaryBankAccount = secondaryBankAccount; }

    public String getSecondaryBankBranch() { return secondaryBankBranch; }
    public void setSecondaryBankBranch(String secondaryBankBranch) { this.secondaryBankBranch = secondaryBankBranch; }

    public String getSecondaryPaymentPurpose() { return secondaryPaymentPurpose; }
    public void setSecondaryPaymentPurpose(String secondaryPaymentPurpose) { this.secondaryPaymentPurpose = secondaryPaymentPurpose; }

    public String getEmployeePhoto() { return employeePhoto; }
    public void setEmployeePhoto(String employeePhoto) { this.employeePhoto = employeePhoto; }

    public String getEmployeeSignature() { return employeeSignature; }
    public void setEmployeeSignature(String employeeSignature) { this.employeeSignature = employeeSignature; }

    public Integer getRegisteredBy() { return registeredBy; }
    public void setRegisteredBy(Integer registeredBy) { this.registeredBy = registeredBy; }

    public LocalDateTime getRegisteredDate() { return registeredDate; }
    public void setRegisteredDate(LocalDateTime registeredDate) { this.registeredDate = registeredDate; }

    public Integer getModifiedBy() { return modifiedBy; }
    public void setModifiedBy(Integer modifiedBy) { this.modifiedBy = modifiedBy; }

    public LocalDateTime getModifiedDate() { return modifiedDate; }
    public void setModifiedDate(LocalDateTime modifiedDate) { this.modifiedDate = modifiedDate; }

    public boolean isDeleted() { return deleted; }
    public void setDeleted(boolean deleted) { this.deleted = deleted; }

    public boolean isSalaryDefaultsModified() { return salaryDefaultsModified; }
    public void setSalaryDefaultsModified(boolean salaryDefaultsModified) { this.salaryDefaultsModified = salaryDefaultsModified; }
}
