package com.wbill.home.model;

import java.io.Serializable;
import java.util.Date;
import jakarta.persistence.*;

@Entity
@Table(name="billing_invoice_numbers")
@NamedQuery(name="BillingInvoiceNumbers.findAll", query="SELECT b FROM BillingInvoiceNumbers b")
public class BillingInvoiceNumbers implements Serializable {
	private static final long serialVersionUID = 1L;

	@Id
	@GeneratedValue(strategy=GenerationType.IDENTITY)
	private int id;

	@Column(name="invoice_numbers", nullable=false, length=100)
	private String invoiceNumbers;

	@Column(name="transaction_code", length=100)
	private String transactionCode;

	@Column(name="used_for", length=100)
	private String usedFor;

	@Temporal(TemporalType.TIMESTAMP)
	@Column(name="registered_date", nullable=false)
	private Date registeredDate;

	@Column(name="registered_by", nullable=false)
	private int registeredBy;

	@Column(name="status", nullable=false, length=20)
	private String status;

	@Column(name="deleted", nullable=false, length=20)
	private String deleted;

	public BillingInvoiceNumbers() {
	}

	// Getters and Setters (you can generate these in your IDE)

	public int getId() {
		return this.id;
	}

	public void setId(int id) {
		this.id = id;
	}

	public String getInvoiceNumbers() {
		return this.invoiceNumbers;
	}

	public void setInvoiceNumbers(String invoiceNumbers) {
		this.invoiceNumbers = invoiceNumbers;
	}

	public String getTransactionCode() {
		return this.transactionCode;
	}

	public void setTransactionCode(String transactionCode) {
		this.transactionCode = transactionCode;
	}

	public String getUsedFor() {
		return this.usedFor;
	}

	public void setUsedFor(String usedFor) {
		this.usedFor = usedFor;
	}

	public Date getRegisteredDate() {
		return this.registeredDate;
	}

	public void setRegisteredDate(Date registeredDate) {
		this.registeredDate = registeredDate;
	}

	public int getRegisteredBy() {
		return this.registeredBy;
	}

	public void setRegisteredBy(int registeredBy) {
		this.registeredBy = registeredBy;
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
}
