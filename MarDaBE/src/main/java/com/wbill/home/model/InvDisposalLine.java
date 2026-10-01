package com.wbill.home.model;

import java.io.Serializable;
import java.math.BigDecimal;
import jakarta.persistence.*;
import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

@Entity
@Table(name = "inv_disposal_line")
public class InvDisposalLine implements Serializable {
    private static final long serialVersionUID = 1L;

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private long id;

    @JsonIgnore
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "disposal_id", nullable = false)
    private InvDisposal disposal;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "item_id", nullable = false)
    @JsonIgnoreProperties({"hibernateLazyInitializer", "handler", "category", "itemGroup", "unitOfMeasure"})
    private InvItem item;

    @Column(name = "line_order", nullable = false)
    private int lineOrder;

    @Column(name = "quantity", nullable = false, precision = 15, scale = 4)
    private BigDecimal quantity;

    @Column(name = "unit_cost", nullable = false, precision = 15, scale = 4)
    private BigDecimal unitCost = BigDecimal.ZERO;

    @Column(name = "total_cost", nullable = false, precision = 15, scale = 2)
    private BigDecimal totalCost = BigDecimal.ZERO;

    @Column(name = "reason", length = 500)
    private String reason;

    @Column(name = "remarks", length = 500)
    private String remarks;

    public InvDisposalLine() {}

    // Getters and Setters
    public long getId() { return id; }
    public void setId(long id) { this.id = id; }

    public InvDisposal getDisposal() { return disposal; }
    public void setDisposal(InvDisposal disposal) { this.disposal = disposal; }

    public InvItem getItem() { return item; }
    public void setItem(InvItem item) { this.item = item; }

    public int getLineOrder() { return lineOrder; }
    public void setLineOrder(int lineOrder) { this.lineOrder = lineOrder; }

    public BigDecimal getQuantity() { return quantity; }
    public void setQuantity(BigDecimal quantity) { this.quantity = quantity; }

    public BigDecimal getUnitCost() { return unitCost; }
    public void setUnitCost(BigDecimal unitCost) { this.unitCost = unitCost; }

    public BigDecimal getTotalCost() { return totalCost; }
    public void setTotalCost(BigDecimal totalCost) { this.totalCost = totalCost; }

    public String getReason() { return reason; }
    public void setReason(String reason) { this.reason = reason; }

    public String getRemarks() { return remarks; }
    public void setRemarks(String remarks) { this.remarks = remarks; }
}
