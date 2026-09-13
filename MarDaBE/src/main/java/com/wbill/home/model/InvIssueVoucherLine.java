package com.wbill.home.model;

import java.io.Serializable;
import java.math.BigDecimal;
import jakarta.persistence.*;
import com.fasterxml.jackson.annotation.JsonIgnore;

@Entity
@Table(name = "inv_issue_voucher_line")
public class InvIssueVoucherLine implements Serializable {
    private static final long serialVersionUID = 1L;

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private long id;

    @JsonIgnore
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "voucher_id", nullable = false)
    private InvIssueVoucher issueVoucher;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "item_id", nullable = false)
    private InvItem item;

    @Column(name = "requested_quantity", nullable = false, precision = 15, scale = 4)
    private BigDecimal requestedQuantity;

    @Column(name = "approved_quantity", precision = 15, scale = 4)
    private BigDecimal approvedQuantity;

    @Column(name = "issued_quantity", nullable = false, precision = 15, scale = 4)
    private BigDecimal issuedQuantity = BigDecimal.ZERO;

    @Column(name = "unit_cost", nullable = false, precision = 15, scale = 4)
    private BigDecimal unitCost = BigDecimal.ZERO;

    @Column(name = "total_cost", nullable = false, precision = 15, scale = 2)
    private BigDecimal totalCost = BigDecimal.ZERO;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "serial_tracking_id")
    private InvSerialTracking serialTracking;

    @Column(name = "line_order", nullable = false)
    private int lineOrder = 0;

    public InvIssueVoucherLine() {}

    // Getters and Setters
    public long getId() { return id; }
    public void setId(long id) { this.id = id; }

    public InvIssueVoucher getIssueVoucher() { return issueVoucher; }
    public void setIssueVoucher(InvIssueVoucher issueVoucher) { this.issueVoucher = issueVoucher; }

    public InvItem getItem() { return item; }
    public void setItem(InvItem item) { this.item = item; }

    public BigDecimal getRequestedQuantity() { return requestedQuantity; }
    public void setRequestedQuantity(BigDecimal requestedQuantity) { this.requestedQuantity = requestedQuantity; }

    public BigDecimal getApprovedQuantity() { return approvedQuantity; }
    public void setApprovedQuantity(BigDecimal approvedQuantity) { this.approvedQuantity = approvedQuantity; }

    public BigDecimal getIssuedQuantity() { return issuedQuantity; }
    public void setIssuedQuantity(BigDecimal issuedQuantity) { this.issuedQuantity = issuedQuantity; }

    public BigDecimal getUnitCost() { return unitCost; }
    public void setUnitCost(BigDecimal unitCost) { this.unitCost = unitCost; }

    public BigDecimal getTotalCost() { return totalCost; }
    public void setTotalCost(BigDecimal totalCost) { this.totalCost = totalCost; }

    public InvSerialTracking getSerialTracking() { return serialTracking; }
    public void setSerialTracking(InvSerialTracking serialTracking) { this.serialTracking = serialTracking; }

    public int getLineOrder() { return lineOrder; }
    public void setLineOrder(int lineOrder) { this.lineOrder = lineOrder; }
}
