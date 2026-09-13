package com.wbill.home.model;

import java.io.Serializable;
import jakarta.persistence.*;

@Entity
@Table(name="billing_zero_reading_reason")
@NamedQuery(name="BillingZeroReadingReason.findAll", query="SELECT b FROM BillingZeroReadingReason b")
public class BillingZeroReadingReason implements Serializable {
	private static final long serialVersionUID = 1L;

	@Id
	@GeneratedValue(strategy=GenerationType.IDENTITY)
	private int id;

	@Column(name="reason_code", nullable=false, length=50)
	private String reasonCode;

	@Column(name="reason_name", nullable=false, length=100)
	private String reasonName;

	@Column(name="is_zero_reading_reason", nullable=false)
	private boolean isZeroReadingReason;

	@Column(name="is_door_close_reason", nullable=false)
	private boolean isDoorCloseReason;

	@Column(name="is_kotari_kiray", nullable=false)
	private boolean isKotariKiray;

	@Column(name="is_under_read_reason", nullable=false)
	private boolean isUnderReadReason;

	@Column(name="temp_statics", nullable=false)
	private int tempStatics;

	@Column(name="is_old_reasons", nullable=false)
	private boolean isOldReasons;

	@Column(name="old_reason_code", length=10)
	private String oldReasonCode;

	@Column(name="deleted", nullable=false, length=20)
	private String deleted;

	public BillingZeroReadingReason() {
	}

	// Getters and Setters (you can generate these in your IDE)

	public int getId() {
		return this.id;
	}

	public void setId(int id) {
		this.id = id;
	}

	public String getReasonCode() {
		return this.reasonCode;
	}

	public void setReasonCode(String reasonCode) {
		this.reasonCode = reasonCode;
	}

	public String getReasonName() {
		return this.reasonName;
	}

	public void setReasonName(String reasonName) {
		this.reasonName = reasonName;
	}

	public boolean getIsZeroReadingReason() {
		return this.isZeroReadingReason;
	}

	public void setIsZeroReadingReason(boolean isZeroReadingReason) {
		this.isZeroReadingReason = isZeroReadingReason;
	}

	public boolean getIsDoorCloseReason() {
		return this.isDoorCloseReason;
	}

	public void setIsDoorCloseReason(boolean isDoorCloseReason) {
		this.isDoorCloseReason = isDoorCloseReason;
	}

	public boolean getIsKotariKiray() {
		return this.isKotariKiray;
	}

	public void setIsKotariKiray(boolean isKotariKiray) {
		this.isKotariKiray = isKotariKiray;
	}

	public boolean getIsUnderReadReason() {
		return this.isUnderReadReason;
	}

	public void setIsUnderReadReason(boolean isUnderReadReason) {
		this.isUnderReadReason = isUnderReadReason;
	}

	public int getTempStatics() {
		return this.tempStatics;
	}

	public void setTempStatics(int tempStatics) {
		this.tempStatics = tempStatics;
	}

	public boolean getIsOldReasons() {
		return this.isOldReasons;
	}

	public void setIsOldReasons(boolean isOldReasons) {
		this.isOldReasons = isOldReasons;
	}

	public String getOldReasonCode() {
		return this.oldReasonCode;
	}

	public void setOldReasonCode(String oldReasonCode) {
		this.oldReasonCode = oldReasonCode;
	}

	public String getDeleted() {
		return this.deleted;
	}

	public void setDeleted(String deleted) {
		this.deleted = deleted;
	}
}
