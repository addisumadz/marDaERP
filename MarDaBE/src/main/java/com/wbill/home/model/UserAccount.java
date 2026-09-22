package com.wbill.home.model;

import java.io.Serializable;
import java.util.Date;
import jakarta.persistence.*;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

@Entity
@Table(name = "user_account")
@NamedQuery(name = "UserAccount.findAll", query = "SELECT u FROM UserAccount u")
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class UserAccount implements Serializable {
	private static final long serialVersionUID = 1L;

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private int id;

	@Lob // For TEXT type
	@Column(name = "logged_devices")
	private String loggedDevices;

	// bi-directional many-to-one association to Branch
	@ManyToOne
	@JoinColumn(name = "branchs_id")
	@JsonIgnoreProperties({"hibernateLazyInitializer", "handler", "branchKebele"})
	private Branch branch; // Assuming 'Branch' is the entity for the 'branchs' table

	@Column(name = "user_name", nullable = false, length = 100, unique = true)
	private String userName;

	@Column(name = "password", nullable = false, length = 400)
	private String password;

	@Column(name = "title_maereg", length = 100)
	private String titleMaereg;

	@Column(name = "first_name", nullable = false, length = 20)
	private String firstName;

	@Column(name = "midle_name", nullable = false, length = 20)
	private String midleName;

	@Column(name = "last_name", nullable = false, length = 20)
	private String lastName;

	@Column(name = "sex", nullable = false, length = 7)
	private String sex;

	@Lob // For MEDIUMTEXT type
	@Column(name = "photo")
	private String photo;

	@Column(name = "signature", length = 200)
	private String signature;

	// bi-directional many-to-one association to UserRole
	@ManyToOne
	@JoinColumn(name = "role_id", nullable = false)
	private UserRole userRole; // Assuming 'UserRole' is the entity for the 'user_role' table

	@Column(name = "has_boss", nullable = false)
	private boolean hasBoss;

	@Column(name = "pass_code", length = 100)
	private String passCode;

	@Column(name = "is_doctor", nullable = false)
	private boolean isDoctor;

	@Column(name = "is_specialist", nullable = false)
	private boolean isSpecialist;

	@Column(name = "dr_specialization", length = 200)
	private String drSpecialization;

	@Column(name = "is_desktop_logged", nullable = false)
	private boolean isDesktopLogged;

	@Column(name = "user_performance", nullable = false)
	private double userPerformance;

	@Column(name = "total_yanebebew", nullable = false)
	private double totalYanebebew;

	@Column(name = "total_assigned_customer", nullable = false)
	private double totalAssignedCustomer;

	@Column(name = "previous_month_csv_file_name", length = 100)
	private String previousMonthCsvFileName;

	@Column(name = "status", nullable = false, length = 20)
	private String status;

	@Column(name = "deleted", nullable = false, length = 20)
	private String deleted;

	@Temporal(TemporalType.TIMESTAMP)
	@Column(name = "registered_date", nullable = false)
	private Date registeredDate;

	@Temporal(TemporalType.TIMESTAMP)
	@Column(name = "modified_date", nullable = false)
	private Date modifiedDate;

	@Column(name = "is_allow_previous_reading", nullable = false)
	private boolean isAllowPreviousReading;

	public UserAccount() {
	}

	// Getters and Setters (you can generate these in your IDE)

	public int getId() {
		return this.id;
	}

	public void setId(int id) {
		this.id = id;
	}

	public String getLoggedDevices() {
		return this.loggedDevices;
	}

	public void setLoggedDevices(String loggedDevices) {
		this.loggedDevices = loggedDevices;
	}

	public Branch getBranch() {
		return this.branch;
	}

	public void setBranch(Branch branch) {
		this.branch = branch;
	}

	public String getUserName() {
		return this.userName;
	}

	public void setUserName(String userName) {
		this.userName = userName;
	}

	public String getPassword() {
		return this.password;
	}

	public void setPassword(String password) {
		this.password = password;
	}

	public String getTitleMaereg() {
		return this.titleMaereg;
	}

	public void setTitleMaereg(String titleMaereg) {
		this.titleMaereg = titleMaereg;
	}

	public String getFirstName() {
		return this.firstName;
	}

	public void setFirstName(String firstName) {
		this.firstName = firstName;
	}

	public String getMidleName() {
		return this.midleName;
	}

	public void setMidleName(String midleName) {
		this.midleName = midleName;
	}

	public String getLastName() {
		return this.lastName;
	}

	public void setLastName(String lastName) {
		this.lastName = lastName;
	}

	public String getSex() {
		return this.sex;
	}

	public void setSex(String sex) {
		this.sex = sex;
	}

	public String getPhoto() {
		return this.photo;
	}

	public void setPhoto(String photo) {
		this.photo = photo;
	}

	public String getSignature() {
		return this.signature;
	}

	public void setSignature(String signature) {
		this.signature = signature;
	}

	public UserRole getUserRole() {
		return this.userRole;
	}

	public void setUserRole(UserRole userRole) {
		this.userRole = userRole;
	}

	public boolean getHasBoss() {
		return this.hasBoss;
	}

	public void setHasBoss(boolean hasBoss) {
		this.hasBoss = hasBoss;
	}

	public String getPassCode() {
		return this.passCode;
	}

	public void setPassCode(String passCode) {
		this.passCode = passCode;
	}

	public boolean getIsDoctor() {
		return this.isDoctor;
	}

	public void setIsDoctor(boolean isDoctor) {
		this.isDoctor = isDoctor;
	}

	public boolean getIsSpecialist() {
		return this.isSpecialist;
	}

	public void setIsSpecialist(boolean isSpecialist) {
		this.isSpecialist = isSpecialist;
	}

	public String getDrSpecialization() {
		return this.drSpecialization;
	}

	public void setDrSpecialization(String drSpecialization) {
		this.drSpecialization = drSpecialization;
	}

	public boolean getIsDesktopLogged() {
		return this.isDesktopLogged;
	}

	public void setIsDesktopLogged(boolean isDesktopLogged) {
		this.isDesktopLogged = isDesktopLogged;
	}

	public double getUserPerformance() {
		return this.userPerformance;
	}

	public void setUserPerformance(double userPerformance) {
		this.userPerformance = userPerformance;
	}

	public double getTotalYanebebew() {
		return this.totalYanebebew;
	}

	public void setTotalYanebebew(double totalYanebebew) {
		this.totalYanebebew = totalYanebebew;
	}

	public double getTotalAssignedCustomer() {
		return this.totalAssignedCustomer;
	}

	public void setTotalAssignedCustomer(double totalAssignedCustomer) {
		this.totalAssignedCustomer = totalAssignedCustomer;
	}

	public String getPreviousMonthCsvFileName() {
		return this.previousMonthCsvFileName;
	}

	public void setPreviousMonthCsvFileName(String previousMonthCsvFileName) {
		this.previousMonthCsvFileName = previousMonthCsvFileName;
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

	public Date getRegisteredDate() {
		return this.registeredDate;
	}

	public void setRegisteredDate(Date registeredDate) {
		this.registeredDate = registeredDate;
	}

	public Date getModifiedDate() {
		return this.modifiedDate;
	}

	public void setModifiedDate(Date modifiedDate) {
		this.modifiedDate = modifiedDate;
	}

	public boolean getIsAllowPreviousReading() {
		return this.isAllowPreviousReading;
	}

	public void setIsAllowPreviousReading(boolean isAllowPreviousReading) {
		this.isAllowPreviousReading = isAllowPreviousReading;
	}
}
