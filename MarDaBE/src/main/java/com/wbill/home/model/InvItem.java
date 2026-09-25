package com.wbill.home.model;

import java.io.Serializable;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import jakarta.persistence.*;

@Entity
@Table(name = "inv_item")
public class InvItem implements Serializable {
    private static final long serialVersionUID = 1L;

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private long id;

    @Column(name = "item_code", nullable = false, unique = true, length = 30)
    private String itemCode;

    @Column(name = "item_name", nullable = false, length = 200)
    private String itemName;

    @Column(name = "item_name_am", length = 200)
    private String itemNameAm;

    @Column(name = "description", length = 500)
    private String description;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "category_id", nullable = false)
    private InvItemCategory category;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "item_group_id")
    private InvItemGroup itemGroup;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "unit_of_measure_id", nullable = false)
    private InvUnitOfMeasure unitOfMeasure;

    @Column(name = "reorder_level", nullable = false)
    private int reorderLevel = 0;

    @Column(name = "reorder_quantity", nullable = false)
    private int reorderQuantity = 0;

    @Enumerated(EnumType.STRING)
    @Column(name = "tracking_type", nullable = false)
    private InvItemCategory.TrackingType trackingType = InvItemCategory.TrackingType.NONE;

    @Enumerated(EnumType.STRING)
    @Column(name = "item_usage", nullable = false)
    private ItemUsage itemUsage = ItemUsage.BOTH;

    @Column(name = "default_unit_cost", precision = 15, scale = 2)
    private BigDecimal defaultUnitCost = BigDecimal.ZERO;

    @Column(name = "is_water_meter", nullable = false)
    private boolean isWaterMeter = false;

    @Column(name = "is_active", nullable = false)
    private boolean isActive = true;

    @Column(name = "deleted", nullable = false, length = 20)
    private String deleted = "No";

    @Column(name = "created_by", length = 100)
    private String createdBy;

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }

    public enum ItemUsage {
        FOR_SALE, COMPANY_USE, BOTH
    }

    public InvItem() {}

    // Getters and Setters
    public long getId() { return id; }
    public void setId(long id) { this.id = id; }

    public String getItemCode() { return itemCode; }
    public void setItemCode(String itemCode) { this.itemCode = itemCode; }

    public String getItemName() { return itemName; }
    public void setItemName(String itemName) { this.itemName = itemName; }

    public String getItemNameAm() { return itemNameAm; }
    public void setItemNameAm(String itemNameAm) { this.itemNameAm = itemNameAm; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public InvItemCategory getCategory() { return category; }
    public void setCategory(InvItemCategory category) { this.category = category; }

    public InvItemGroup getItemGroup() { return itemGroup; }
    public void setItemGroup(InvItemGroup itemGroup) { this.itemGroup = itemGroup; }

    public InvUnitOfMeasure getUnitOfMeasure() { return unitOfMeasure; }
    public void setUnitOfMeasure(InvUnitOfMeasure unitOfMeasure) { this.unitOfMeasure = unitOfMeasure; }

    public int getReorderLevel() { return reorderLevel; }
    public void setReorderLevel(int reorderLevel) { this.reorderLevel = reorderLevel; }

    public int getReorderQuantity() { return reorderQuantity; }
    public void setReorderQuantity(int reorderQuantity) { this.reorderQuantity = reorderQuantity; }

    public InvItemCategory.TrackingType getTrackingType() { return trackingType; }
    public void setTrackingType(InvItemCategory.TrackingType trackingType) { this.trackingType = trackingType; }

    public ItemUsage getItemUsage() { return itemUsage; }
    public void setItemUsage(ItemUsage itemUsage) { this.itemUsage = itemUsage; }

    public BigDecimal getDefaultUnitCost() { return defaultUnitCost; }
    public void setDefaultUnitCost(BigDecimal defaultUnitCost) { this.defaultUnitCost = defaultUnitCost; }

    public boolean isWaterMeter() { return isWaterMeter; }
    public void setIsWaterMeter(boolean isWaterMeter) { this.isWaterMeter = isWaterMeter; }

    public boolean getIsActive() { return isActive; }
    public void setIsActive(boolean isActive) { this.isActive = isActive; }

    public String getDeleted() { return deleted; }
    public void setDeleted(String deleted) { this.deleted = deleted; }

    public String getCreatedBy() { return createdBy; }
    public void setCreatedBy(String createdBy) { this.createdBy = createdBy; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
}
