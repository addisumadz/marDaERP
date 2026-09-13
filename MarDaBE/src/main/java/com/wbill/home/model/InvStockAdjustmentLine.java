package com.wbill.home.model;

import java.io.Serializable;
import java.math.BigDecimal;
import jakarta.persistence.*;
import com.fasterxml.jackson.annotation.JsonIgnore;

@Entity
@Table(name = "inv_stock_adjustment_line")
public class InvStockAdjustmentLine implements Serializable {
    private static final long serialVersionUID = 1L;

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private long id;

    @JsonIgnore
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "adjustment_id", nullable = false)
    private InvStockAdjustment stockAdjustment;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "item_id", nullable = false)
    private InvItem item;

    @Column(name = "system_quantity", nullable = false, precision = 15, scale = 4)
    private BigDecimal systemQuantity;

    @Column(name = "actual_quantity", nullable = false, precision = 15, scale = 4)
    private BigDecimal actualQuantity;

    @Column(name = "variance", nullable = false, precision = 15, scale = 4)
    private BigDecimal variance = BigDecimal.ZERO;

    @Column(name = "unit_cost", nullable = false, precision = 15, scale = 4)
    private BigDecimal unitCost = BigDecimal.ZERO;

    @Column(name = "variance_cost", nullable = false, precision = 15, scale = 2)
    private BigDecimal varianceCost = BigDecimal.ZERO;

    @Column(name = "reason", length = 300)
    private String reason;

    @Column(name = "line_order", nullable = false)
    private int lineOrder = 0;

    public InvStockAdjustmentLine() {}

    /**
     * Calculates variance = actual - system. Positive = gain, negative = loss.
     */
    public void calculateVariance() {
        this.variance = this.actualQuantity.subtract(this.systemQuantity);
        this.varianceCost = this.variance.multiply(this.unitCost).setScale(2, java.math.RoundingMode.HALF_UP);
    }

    // Getters and Setters
    public long getId() { return id; }
    public void setId(long id) { this.id = id; }

    public InvStockAdjustment getStockAdjustment() { return stockAdjustment; }
    public void setStockAdjustment(InvStockAdjustment stockAdjustment) { this.stockAdjustment = stockAdjustment; }

    public InvItem getItem() { return item; }
    public void setItem(InvItem item) { this.item = item; }

    public BigDecimal getSystemQuantity() { return systemQuantity; }
    public void setSystemQuantity(BigDecimal systemQuantity) { this.systemQuantity = systemQuantity; }

    public BigDecimal getActualQuantity() { return actualQuantity; }
    public void setActualQuantity(BigDecimal actualQuantity) { this.actualQuantity = actualQuantity; }

    public BigDecimal getVariance() { return variance; }
    public void setVariance(BigDecimal variance) { this.variance = variance; }

    public BigDecimal getUnitCost() { return unitCost; }
    public void setUnitCost(BigDecimal unitCost) { this.unitCost = unitCost; }

    public BigDecimal getVarianceCost() { return varianceCost; }
    public void setVarianceCost(BigDecimal varianceCost) { this.varianceCost = varianceCost; }

    public String getReason() { return reason; }
    public void setReason(String reason) { this.reason = reason; }

    public int getLineOrder() { return lineOrder; }
    public void setLineOrder(int lineOrder) { this.lineOrder = lineOrder; }
}
