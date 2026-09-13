package com.wbill.home.model;

import java.io.Serializable;
import jakarta.persistence.*;

@Entity
@Table(name="billing_termination_reason")
@NamedQuery(name="BillingTerminationReason.findAll", query="SELECT b FROM BillingTerminationReason b")
public class BillingTerminationReason implements Serializable {
	private static final long serialVersionUID = 1L;

	@Id
	@GeneratedValue(strategy=GenerationType.IDENTITY)
	private int id;

	@Column(name="termination_code", nullable=false, length=50)
	private String terminationCode;

	@Column(name="termination_reason", nullable=false, length=100)
	private String terminationReason;

	@Column(name="is_auto_termination_reason", nullable=false)
	private boolean isAutoTerminationReason;

	@Column(name="deleted", nullable=false, length=20)
	private String deleted;

	public BillingTerminationReason() {
	}

	// Getters and Setters (you can generate these in your IDE)

	public int getId() {
		return this.id;
	}

	public void setId(int id) {
		this.id = id;
	}

	public String getTerminationCode() {
		return this.terminationCode;
	}

	public void setTerminationCode(String terminationCode) {
		this.terminationCode = terminationCode;
	}

	public String getTerminationReason() {
		return this.terminationReason;
	}

	public void setTerminationReason(String terminationReason) {
		this.terminationReason = terminationReason;
	}

	public boolean getIsAutoTerminationReason() {
		return this.isAutoTerminationReason;
	}

	public void setIsAutoTerminationReason(boolean isAutoTerminationReason) {
		this.isAutoTerminationReason = isAutoTerminationReason;
	}

	public String getDeleted() {
		return this.deleted;
	}

	public void setDeleted(String deleted) {
		this.deleted = deleted;
	}
}
