package com.wbill.home.model;

import java.io.Serializable;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import jakarta.persistence.*;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

@Entity
@Table(name = "inv_item_store_stock",
       uniqueConstraints = @UniqueConstraint(columnNames = {"item_id", "store_id"}))
public class InvItemStoreStock implements Serializable {
    private static final long serialVersionUID = 1L;

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "item_id", nullable = false)
    @JsonIgnoreProperties({"hibernateLazyInitializer", "handler", "category", "itemGroup", "unitOfMeasure"})
    private InvItem item;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "store_id", nullable = false)
    @JsonIgnoreProperties({"hibernateLazyInitializer", "handler", "storeKeeper", "branch"})
    private InvStore store;

    @Column(name = "quantity_on_hand", nullable = false, precision = 15, scale = 4)
    private BigDecimal quantityOnHand = BigDecimal.ZERO;

    @Column(name = "quantity_reserved", nullable = false, precision = 15, scale = 4)
    private BigDecimal quantityReserved = BigDecimal.ZERO;

    @Column(name = "quantity_on_order", nullable = false, precision = 15, scale = 4)
    private BigDecimal quantityOnOrder = BigDecimal.ZERO;

    @Column(name = "weighted_avg_cost", nullable = false, precision = 15, scale = 4)
    private BigDecimal weightedAvgCost = BigDecimal.ZERO;

    @Column(name = "last_count_date")
    private LocalDate lastCountDate;

    @Column(name = "last_count_quantity", precision = 15, scale = 4)
    private BigDecimal lastCountQuantity;

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

    public InvItemStoreStock() {}

    /**
     * Returns the available quantity (on-hand minus reserved).
     */
    public BigDecimal getAvailableQuantity() {
        BigDecimal onHand = quantityOnHand != null ? quantityOnHand : BigDecimal.ZERO;
        BigDecimal reserved = quantityReserved != null ? quantityReserved : BigDecimal.ZERO;
        return onHand.subtract(reserved);
    }

    // Getters and Setters
    public long getId() { return id; }
    public void setId(long id) { this.id = id; }

    public InvItem getItem() { return item; }
    public void setItem(InvItem item) { this.item = item; }

    public InvStore getStore() { return store; }
    public void setStore(InvStore store) { this.store = store; }

    public BigDecimal getQuantityOnHand() { return quantityOnHand; }
    public void setQuantityOnHand(BigDecimal quantityOnHand) { this.quantityOnHand = quantityOnHand; }

    public BigDecimal getQuantityReserved() { return quantityReserved; }
    public void setQuantityReserved(BigDecimal quantityReserved) { this.quantityReserved = quantityReserved; }

    public BigDecimal getQuantityOnOrder() { return quantityOnOrder; }
    public void setQuantityOnOrder(BigDecimal quantityOnOrder) { this.quantityOnOrder = quantityOnOrder; }

    public BigDecimal getWeightedAvgCost() { return weightedAvgCost; }
    public void setWeightedAvgCost(BigDecimal weightedAvgCost) { this.weightedAvgCost = weightedAvgCost; }

    public LocalDate getLastCountDate() { return lastCountDate; }
    public void setLastCountDate(LocalDate lastCountDate) { this.lastCountDate = lastCountDate; }

    public BigDecimal getLastCountQuantity() { return lastCountQuantity; }
    public void setLastCountQuantity(BigDecimal lastCountQuantity) { this.lastCountQuantity = lastCountQuantity; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
}
