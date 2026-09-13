package com.wbill.home.model;

import java.io.Serializable;
import java.time.LocalDateTime;
import java.util.List;
import jakarta.persistence.*;
import com.fasterxml.jackson.annotation.JsonIgnore;

@Entity
@Table(name = "inv_item_category")
public class InvItemCategory implements Serializable {
    private static final long serialVersionUID = 1L;

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private int id;

    @Column(name = "category_code", nullable = false, unique = true, length = 20)
    private String categoryCode;

    @Column(name = "category_name", nullable = false, length = 200)
    private String categoryName;

    @Column(name = "category_name_am", length = 200)
    private String categoryNameAm;

    @Column(name = "description", length = 500)
    private String description;

    @Enumerated(EnumType.STRING)
    @Column(name = "item_type", nullable = false)
    private ItemType itemType = ItemType.STOCK;

    @Enumerated(EnumType.STRING)
    @Column(name = "tracking_type", nullable = false)
    private TrackingType trackingType = TrackingType.NONE;

    @JsonIgnore
    @OneToMany(mappedBy = "category", fetch = FetchType.LAZY)
    @OrderBy("groupCode ASC")
    private List<InvItemGroup> itemGroups;

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

    public enum ItemType {
        STOCK, NON_STOCK, SERVICE
    }

    public enum TrackingType {
        NONE, BATCH, EXPIRY, SERIAL, MOTOR
    }

    public InvItemCategory() {}

    // Getters and Setters
    public int getId() { return id; }
    public void setId(int id) { this.id = id; }

    public String getCategoryCode() { return categoryCode; }
    public void setCategoryCode(String categoryCode) { this.categoryCode = categoryCode; }

    public String getCategoryName() { return categoryName; }
    public void setCategoryName(String categoryName) { this.categoryName = categoryName; }

    public String getCategoryNameAm() { return categoryNameAm; }
    public void setCategoryNameAm(String categoryNameAm) { this.categoryNameAm = categoryNameAm; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public ItemType getItemType() { return itemType; }
    public void setItemType(ItemType itemType) { this.itemType = itemType; }

    public TrackingType getTrackingType() { return trackingType; }
    public void setTrackingType(TrackingType trackingType) { this.trackingType = trackingType; }

    public List<InvItemGroup> getItemGroups() { return itemGroups; }
    public void setItemGroups(List<InvItemGroup> itemGroups) { this.itemGroups = itemGroups; }

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
