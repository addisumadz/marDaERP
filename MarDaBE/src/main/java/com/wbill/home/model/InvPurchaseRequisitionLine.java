package com.wbill.home.model;

import java.io.Serializable;
import java.math.BigDecimal;
import jakarta.persistence.*;
import com.fasterxml.jackson.annotation.JsonIgnore;

@Entity
@Table(name = "inv_purchase_requisition_line")
public class InvPurchaseRequisitionLine implements Serializable {
    private static final long serialVersionUID = 1L;

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private long id;

    @JsonIgnore
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "requisition_id", nullable = false)
    private InvPurchaseRequisition purchaseRequisition;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "item_id", nullable = false)
    private InvItem item;

    @Column(name = "requested_quantity", nullable = false, precision = 15, scale = 4)
    private BigDecimal requestedQuantity;

    @Column(name = "approved_quantity", precision = 15, scale = 4)
    private BigDecimal approvedQuantity;

    @Column(name = "estimated_unit_cost", nullable = false, precision = 15, scale = 4)
    private BigDecimal estimatedUnitCost = BigDecimal.ZERO;

    @Column(name = "estimated_total", nullable = false, precision = 15, scale = 2)
    private BigDecimal estimatedTotal = BigDecimal.ZERO;

    @Column(name = "purpose", length = 300)
    private String purpose;

    @Column(name = "line_order", nullable = false)
    private int lineOrder = 0;

    public InvPurchaseRequisitionLine() {}

    // Getters and Setters
    public long getId() { return id; }
    public void setId(long id) { this.id = id; }

    public InvPurchaseRequisition getPurchaseRequisition() { return purchaseRequisition; }
    public void setPurchaseRequisition(InvPurchaseRequisition purchaseRequisition) { this.purchaseRequisition = purchaseRequisition; }

    public InvItem getItem() { return item; }
    public void setItem(InvItem item) { this.item = item; }

    public BigDecimal getRequestedQuantity() { return requestedQuantity; }
    public void setRequestedQuantity(BigDecimal requestedQuantity) { this.requestedQuantity = requestedQuantity; }

    public BigDecimal getApprovedQuantity() { return approvedQuantity; }
    public void setApprovedQuantity(BigDecimal approvedQuantity) { this.approvedQuantity = approvedQuantity; }

    public BigDecimal getEstimatedUnitCost() { return estimatedUnitCost; }
    public void setEstimatedUnitCost(BigDecimal estimatedUnitCost) { this.estimatedUnitCost = estimatedUnitCost; }

    public BigDecimal getEstimatedTotal() { return estimatedTotal; }
    public void setEstimatedTotal(BigDecimal estimatedTotal) { this.estimatedTotal = estimatedTotal; }

    public String getPurpose() { return purpose; }
    public void setPurpose(String purpose) { this.purpose = purpose; }

    public int getLineOrder() { return lineOrder; }
    public void setLineOrder(int lineOrder) { this.lineOrder = lineOrder; }
}
