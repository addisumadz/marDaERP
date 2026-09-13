package com.wbill.home.model;

import java.io.Serializable;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import jakarta.persistence.*;

@Entity
@Table(name = "custom_additional_fee_type")
public class CustomAdditionalFeeType implements Serializable {
    private static final long serialVersionUID = 1L;

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(name = "fee_code", nullable = false, unique = true, length = 50)
    private String feeCode;

    @Column(name = "fee_name", nullable = false, length = 200)
    private String feeName;

    @Column(name = "fee_name_am", nullable = false, length = 200)
    private String feeNameAm;

    @Column(name = "default_amount", precision = 15, scale = 2, nullable = false)
    private BigDecimal defaultAmount = BigDecimal.ZERO;

    @Column(name = "unit_name", nullable = false, length = 50)
    private String unitName = "ብር";

    @Column(name = "is_active", nullable = false)
    private Boolean isActive = true;

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }

    public CustomAdditionalFeeType() {}

    public Integer getId() { return id; }
    public void setId(Integer id) { this.id = id; }

    public String getFeeCode() { return feeCode; }
    public void setFeeCode(String feeCode) { this.feeCode = feeCode; }

    public String getFeeName() { return feeName; }
    public void setFeeName(String feeName) { this.feeName = feeName; }

    public String getFeeNameAm() { return feeNameAm; }
    public void setFeeNameAm(String feeNameAm) { this.feeNameAm = feeNameAm; }

    public BigDecimal getDefaultAmount() { return defaultAmount; }
    public void setDefaultAmount(BigDecimal defaultAmount) { this.defaultAmount = defaultAmount; }

    public String getUnitName() { return unitName; }
    public void setUnitName(String unitName) { this.unitName = unitName; }

    public Boolean getIsActive() { return isActive; }
    public void setIsActive(Boolean isActive) { this.isActive = isActive; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}
