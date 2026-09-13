package com.wbill.home.model;

import java.io.Serializable;
import jakarta.persistence.*;

@Entity
@Table(name="billing_invoice_numbers_reference")
@NamedQuery(name="BillingInvoiceNumbersReference.findAll", query="SELECT b FROM BillingInvoiceNumbersReference b")
public class BillingInvoiceNumbersReference implements Serializable {
	private static final long serialVersionUID = 1L;

	@Id
	@GeneratedValue(strategy=GenerationType.IDENTITY)
	private int id;

	@Column(name="next_billing_invoice", nullable=false)
	private int nextBillingInvoice;

	@Column(name="previous_billing_invoice", nullable=false)
	private int previousBillingInvoice;

	public BillingInvoiceNumbersReference() {
	}

	// Getters and Setters (you can generate these in your IDE)

	public int getId() {
		return this.id;
	}

	public void setId(int id) {
		this.id = id;
	}

	public int getNextBillingInvoice() {
		return this.nextBillingInvoice;
	}

	public void setNextBillingInvoice(int nextBillingInvoice) {
		this.nextBillingInvoice = nextBillingInvoice;
	}

	public int getPreviousBillingInvoice() {
		return this.previousBillingInvoice;
	}

	public void setPreviousBillingInvoice(int previousBillingInvoice) {
		this.previousBillingInvoice = previousBillingInvoice;
	}
}
