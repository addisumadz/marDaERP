package com.wbill.home.model;

import java.io.Serializable;
import java.math.BigDecimal;
import jakarta.persistence.*;
import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

@Entity
@Table(name = "inv_purchase_order_line")
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class InvPurchaseOrderLine implements Serializable {
    private static final long serialVersionUID = 1L;

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private long id;

    @JsonIgnore
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "purchase_order_id", nullable = false)
    private InvPurchaseOrder purchaseOrder;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "item_id", nullable = false)
    @JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
    private InvItem item;

    @Column(name = "ordered_quantity", nullable = false, precision = 15, scale = 4)
    private BigDecimal orderedQuantity;

    @Column(name = "received_quantity", nullable = false, precision = 15, scale = 4)
    private BigDecimal receivedQuantity = BigDecimal.ZERO;

    @Column(name = "unit_price", nullable = false, precision = 15, scale = 4)
    private BigDecimal unitPrice;

    @Column(name = "total_price", nullable = false, precision = 15, scale = 2)
    private BigDecimal totalPrice = BigDecimal.ZERO;

    @Column(name = "line_order", nullable = false)
    private int lineOrder = 0;

    public InvPurchaseOrderLine() {}

    public BigDecimal getRemainingQuantity() {
        if (orderedQuantity == null) return BigDecimal.ZERO;
        BigDecimal rec = receivedQuantity != null ? receivedQuantity : BigDecimal.ZERO;
        return orderedQuantity.subtract(rec);
    }

    public boolean isFullyReceived() {
        if (orderedQuantity == null) return false;
        BigDecimal rec = receivedQuantity != null ? receivedQuantity : BigDecimal.ZERO;
        return rec.compareTo(orderedQuantity) >= 0;
    }

    // Getters and Setters
    public long getId() { return id; }
    public void setId(long id) { this.id = id; }

    public InvPurchaseOrder getPurchaseOrder() { return purchaseOrder; }
    public void setPurchaseOrder(InvPurchaseOrder purchaseOrder) { this.purchaseOrder = purchaseOrder; }

    public InvItem getItem() { return item; }
    public void setItem(InvItem item) { this.item = item; }

    public BigDecimal getOrderedQuantity() { return orderedQuantity; }
    public void setOrderedQuantity(BigDecimal orderedQuantity) { this.orderedQuantity = orderedQuantity; }

    public BigDecimal getReceivedQuantity() { return receivedQuantity; }
    public void setReceivedQuantity(BigDecimal receivedQuantity) { this.receivedQuantity = receivedQuantity; }

    public BigDecimal getUnitPrice() { return unitPrice; }
    public void setUnitPrice(BigDecimal unitPrice) { this.unitPrice = unitPrice; }

    public BigDecimal getTotalPrice() { return totalPrice; }
    public void setTotalPrice(BigDecimal totalPrice) { this.totalPrice = totalPrice; }

    public int getLineOrder() { return lineOrder; }
    public void setLineOrder(int lineOrder) { this.lineOrder = lineOrder; }
}
