package com.wbill.home.model;

import java.io.Serializable;
import java.math.BigDecimal;
import java.time.LocalDate;
import jakarta.persistence.*;
import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

@Entity
@Table(name = "inv_goods_received_note_line")
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class InvGoodsReceivedNoteLine implements Serializable {
    private static final long serialVersionUID = 1L;

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private long id;

    @JsonIgnore
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "grn_id", nullable = false)
    private InvGoodsReceivedNote goodsReceivedNote;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "po_line_id", nullable = false)
    @JsonIgnoreProperties({"purchaseOrder", "goodsReceivedNoteLines", "hibernateLazyInitializer", "handler"})
    private InvPurchaseOrderLine poLine;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "item_id", nullable = false)
    @JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
    private InvItem item;

    @Column(name = "received_quantity", nullable = false, precision = 15, scale = 4)
    private BigDecimal receivedQuantity;

    @Column(name = "accepted_quantity", nullable = false, precision = 15, scale = 4)
    private BigDecimal acceptedQuantity;

    @Column(name = "rejected_quantity", nullable = false, precision = 15, scale = 4)
    private BigDecimal rejectedQuantity = BigDecimal.ZERO;

    @Column(name = "unit_cost", nullable = false, precision = 15, scale = 4)
    private BigDecimal unitCost;

    @Column(name = "total_cost", nullable = false, precision = 15, scale = 2)
    private BigDecimal totalCost = BigDecimal.ZERO;

    @Column(name = "batch_number", length = 50)
    private String batchNumber;

    @Column(name = "expiry_date")
    private LocalDate expiryDate;

    @Column(name = "rejection_reason", length = 300)
    private String rejectionReason;

    @Column(name = "line_order", nullable = false)
    private int lineOrder = 0;

    public InvGoodsReceivedNoteLine() {}

    // Getters and Setters
    public long getId() { return id; }
    public void setId(long id) { this.id = id; }

    public InvGoodsReceivedNote getGoodsReceivedNote() { return goodsReceivedNote; }
    public void setGoodsReceivedNote(InvGoodsReceivedNote goodsReceivedNote) { this.goodsReceivedNote = goodsReceivedNote; }

    public InvPurchaseOrderLine getPoLine() { return poLine; }
    public void setPoLine(InvPurchaseOrderLine poLine) { this.poLine = poLine; }

    public InvItem getItem() { return item; }
    public void setItem(InvItem item) { this.item = item; }

    public BigDecimal getReceivedQuantity() { return receivedQuantity; }
    public void setReceivedQuantity(BigDecimal receivedQuantity) { this.receivedQuantity = receivedQuantity; }

    public BigDecimal getAcceptedQuantity() { return acceptedQuantity; }
    public void setAcceptedQuantity(BigDecimal acceptedQuantity) { this.acceptedQuantity = acceptedQuantity; }

    public BigDecimal getRejectedQuantity() { return rejectedQuantity; }
    public void setRejectedQuantity(BigDecimal rejectedQuantity) { this.rejectedQuantity = rejectedQuantity; }

    public BigDecimal getUnitCost() { return unitCost; }
    public void setUnitCost(BigDecimal unitCost) { this.unitCost = unitCost; }

    public BigDecimal getTotalCost() { return totalCost; }
    public void setTotalCost(BigDecimal totalCost) { this.totalCost = totalCost; }

    public String getBatchNumber() { return batchNumber; }
    public void setBatchNumber(String batchNumber) { this.batchNumber = batchNumber; }

    public LocalDate getExpiryDate() { return expiryDate; }
    public void setExpiryDate(LocalDate expiryDate) { this.expiryDate = expiryDate; }

    public String getRejectionReason() { return rejectionReason; }
    public void setRejectionReason(String rejectionReason) { this.rejectionReason = rejectionReason; }

    public int getLineOrder() { return lineOrder; }
    public void setLineOrder(int lineOrder) { this.lineOrder = lineOrder; }
}
