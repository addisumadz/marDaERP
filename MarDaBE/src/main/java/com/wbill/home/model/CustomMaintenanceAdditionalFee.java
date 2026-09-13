package com.wbill.home.model;

import java.io.Serializable;
import java.math.BigDecimal;
import jakarta.persistence.*;
import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

@Entity
@Table(name = "custom_maintenance_additional_fee")
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class CustomMaintenanceAdditionalFee implements Serializable {
    private static final long serialVersionUID = 1L;

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @JsonIgnore
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "request_id", nullable = false)
    private CustomMaintenanceRequest request;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "fee_type_id")
    @JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
    private CustomAdditionalFeeType feeType;

    @Column(name = "fee_name", nullable = false, length = 200)
    private String feeName;

    @Column(name = "fee_name_am", length = 200)
    private String feeNameAm;

    @Column(name = "unit_name", length = 50)
    private String unitName = "ብር";

    @Column(name = "quantity", precision = 10, scale = 2, nullable = false)
    private BigDecimal quantity = BigDecimal.ONE;

    @Column(name = "unit_price", precision = 15, scale = 2, nullable = false)
    private BigDecimal unitPrice = BigDecimal.ZERO;

    @Column(name = "total_price", precision = 15, scale = 2, nullable = false)
    private BigDecimal totalPrice = BigDecimal.ZERO;

    @Column(name = "remarks", length = 500)
    private String remarks;

    public CustomMaintenanceAdditionalFee() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public CustomMaintenanceRequest getRequest() { return request; }
    public void setRequest(CustomMaintenanceRequest request) { this.request = request; }

    public CustomAdditionalFeeType getFeeType() { return feeType; }
    public void setFeeType(CustomAdditionalFeeType feeType) { this.feeType = feeType; }

    public String getFeeName() { return feeName; }
    public void setFeeName(String feeName) { this.feeName = feeName; }

    public String getFeeNameAm() { return feeNameAm; }
    public void setFeeNameAm(String feeNameAm) { this.feeNameAm = feeNameAm; }

    public String getUnitName() { return unitName; }
    public void setUnitName(String unitName) { this.unitName = unitName; }

    public BigDecimal getQuantity() { return quantity; }
    public void setQuantity(BigDecimal quantity) { this.quantity = quantity; }

    public BigDecimal getUnitPrice() { return unitPrice; }
    public void setUnitPrice(BigDecimal unitPrice) { this.unitPrice = unitPrice; }

    public BigDecimal getTotalPrice() { return totalPrice; }
    public void setTotalPrice(BigDecimal totalPrice) { this.totalPrice = totalPrice; }

    public String getRemarks() { return remarks; }
    public void setRemarks(String remarks) { this.remarks = remarks; }
}
