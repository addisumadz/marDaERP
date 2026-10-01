package com.wbill.home.model;

import java.io.Serializable;
import java.math.BigDecimal;
import jakarta.persistence.*;
import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

@Entity
@Table(name = "inv_stock_count_line")
public class InvStockCountLine implements Serializable {
    private static final long serialVersionUID = 1L;

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private long id;

    @JsonIgnore
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "stock_count_id", nullable = false)
    private InvStockCount stockCount;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "item_id", nullable = false)
    @JsonIgnoreProperties({"hibernateLazyInitializer", "handler", "category", "itemGroup", "unitOfMeasure"})
    private InvItem item;

    @Column(name = "system_quantity", nullable = false, precision = 15, scale = 4)
    private BigDecimal systemQuantity;

    @Column(name = "physical_quantity", precision = 15, scale = 4)
    private BigDecimal physicalQuantity;

    @Column(name = "variance_quantity", precision = 15, scale = 4)
    private BigDecimal varianceQuantity;

    @Column(name = "unit_cost", precision = 15, scale = 4)
    private BigDecimal unitCost = BigDecimal.ZERO;

    @Column(name = "variance_value", precision = 15, scale = 2)
    private BigDecimal varianceValue = BigDecimal.ZERO;

    @Column(name = "is_counted", nullable = false)
    private boolean isCounted = false;

    @Column(name = "remarks", length = 500)
    private String remarks;

    public InvStockCountLine() {}

    // Getters and Setters
    public long getId() { return id; }
    public void setId(long id) { this.id = id; }

    public InvStockCount getStockCount() { return stockCount; }
    public void setStockCount(InvStockCount stockCount) { this.stockCount = stockCount; }

    public InvItem getItem() { return item; }
    public void setItem(InvItem item) { this.item = item; }

    public BigDecimal getSystemQuantity() { return systemQuantity; }
    public void setSystemQuantity(BigDecimal systemQuantity) { this.systemQuantity = systemQuantity; }

    public BigDecimal getPhysicalQuantity() { return physicalQuantity; }
    public void setPhysicalQuantity(BigDecimal physicalQuantity) { this.physicalQuantity = physicalQuantity; }

    public BigDecimal getVarianceQuantity() { return varianceQuantity; }
    public void setVarianceQuantity(BigDecimal varianceQuantity) { this.varianceQuantity = varianceQuantity; }

    public BigDecimal getUnitCost() { return unitCost; }
    public void setUnitCost(BigDecimal unitCost) { this.unitCost = unitCost; }

    public BigDecimal getVarianceValue() { return varianceValue; }
    public void setVarianceValue(BigDecimal varianceValue) { this.varianceValue = varianceValue; }

    public boolean getIsCounted() { return isCounted; }
    public void setIsCounted(boolean isCounted) { this.isCounted = isCounted; }

    public String getRemarks() { return remarks; }
    public void setRemarks(String remarks) { this.remarks = remarks; }
}
