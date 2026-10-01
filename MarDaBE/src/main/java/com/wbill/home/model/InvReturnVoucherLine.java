package com.wbill.home.model;

import java.io.Serializable;
import java.math.BigDecimal;
import jakarta.persistence.*;
import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

@Entity
@Table(name = "inv_return_voucher_line")
public class InvReturnVoucherLine implements Serializable {
    private static final long serialVersionUID = 1L;

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private long id;

    @JsonIgnore
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "return_voucher_id", nullable = false)
    private InvReturnVoucher returnVoucher;

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

    @Enumerated(EnumType.STRING)
    @Column(name = "condition_status", length = 30)
    private ItemCondition conditionStatus = ItemCondition.GOOD;

    @Column(name = "remarks", length = 500)
    private String remarks;

    public enum ItemCondition {
        GOOD, DAMAGED, EXPIRED, DEFECTIVE
    }

    public InvReturnVoucherLine() {}

    // Getters and Setters
    public long getId() { return id; }
    public void setId(long id) { this.id = id; }

    public InvReturnVoucher getReturnVoucher() { return returnVoucher; }
    public void setReturnVoucher(InvReturnVoucher returnVoucher) { this.returnVoucher = returnVoucher; }

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

    public ItemCondition getConditionStatus() { return conditionStatus; }
    public void setConditionStatus(ItemCondition conditionStatus) { this.conditionStatus = conditionStatus; }

    public String getRemarks() { return remarks; }
    public void setRemarks(String remarks) { this.remarks = remarks; }
}
