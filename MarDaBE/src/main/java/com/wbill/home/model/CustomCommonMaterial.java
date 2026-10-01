package com.wbill.home.model;

import java.io.Serializable;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import jakarta.persistence.*;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

@Entity
@Table(name = "custom_common_material")
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class CustomCommonMaterial implements Serializable {
    private static final long serialVersionUID = 1L;

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "inv_item_id")
    @JsonIgnoreProperties({"hibernateLazyInitializer", "handler", "category", "itemGroup", "unitOfMeasure"})
    private InvItem invItem;

    @Column(name = "display_order", nullable = false)
    private Integer displayOrder = 0;

    @Column(name = "is_active", nullable = false)
    private Boolean isActive = true;

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    // Transient fields - dropped from physical table, dynamically derived from invItem
    @Transient
    private String materialCode;

    @Transient
    private String materialName;

    @Transient
    private String materialNameAm;

    @Transient
    private String unitOfMeasure;

    @Transient
    private BigDecimal defaultUnitPrice;

    @Transient
    private Boolean isWaterMeter;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }

    public CustomCommonMaterial() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getMaterialCode() {
        if (invItem != null && invItem.getItemCode() != null && !invItem.getItemCode().isBlank()) {
            return invItem.getItemCode();
        }
        return materialCode;
    }
    public void setMaterialCode(String materialCode) { this.materialCode = materialCode; }

    public String getMaterialName() {
        if (invItem != null && invItem.getItemName() != null && !invItem.getItemName().isBlank()) {
            return invItem.getItemName();
        }
        return materialName;
    }
    public void setMaterialName(String materialName) { this.materialName = materialName; }

    public String getMaterialNameAm() {
        if (invItem != null) {
            if (invItem.getItemNameAm() != null && !invItem.getItemNameAm().isBlank()) {
                return invItem.getItemNameAm();
            }
            if (invItem.getItemName() != null && !invItem.getItemName().isBlank()) {
                return invItem.getItemName();
            }
        }
        return materialNameAm;
    }
    public void setMaterialNameAm(String materialNameAm) { this.materialNameAm = materialNameAm; }

    public String getUnitOfMeasure() {
        if (invItem != null && invItem.getUnitOfMeasure() != null) {
            String uomName = invItem.getUnitOfMeasure().getUnitName();
            if (uomName != null && !uomName.isBlank()) return uomName;
        }
        return unitOfMeasure != null ? unitOfMeasure : "በቁጥር";
    }
    public void setUnitOfMeasure(String unitOfMeasure) { this.unitOfMeasure = unitOfMeasure; }

    public InvItem getInvItem() { return invItem; }
    public void setInvItem(InvItem invItem) { this.invItem = invItem; }

    public BigDecimal getDefaultUnitPrice() {
        if (invItem != null && invItem.getDefaultUnitCost() != null && invItem.getDefaultUnitCost().compareTo(BigDecimal.ZERO) > 0) {
            return invItem.getDefaultUnitCost();
        }
        return defaultUnitPrice != null ? defaultUnitPrice : BigDecimal.ZERO;
    }
    public void setDefaultUnitPrice(BigDecimal defaultUnitPrice) { this.defaultUnitPrice = defaultUnitPrice; }

    public Integer getDisplayOrder() { return displayOrder; }
    public void setDisplayOrder(Integer displayOrder) { this.displayOrder = displayOrder; }

    public Boolean getIsWaterMeter() {
        if (invItem != null) {
            return invItem.isWaterMeter();
        }
        return Boolean.TRUE.equals(isWaterMeter);
    }
    public void setIsWaterMeter(Boolean isWaterMeter) { this.isWaterMeter = isWaterMeter != null ? isWaterMeter : false; }

    public Boolean getIsActive() { return isActive; }
    public void setIsActive(Boolean isActive) { this.isActive = isActive; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
}
