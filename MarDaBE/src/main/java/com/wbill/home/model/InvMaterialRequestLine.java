package com.wbill.home.model;

import java.io.Serializable;
import java.math.BigDecimal;
import jakarta.persistence.*;
import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

@Entity
@Table(name = "inv_material_request_line")
public class InvMaterialRequestLine implements Serializable {
    private static final long serialVersionUID = 1L;

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private long id;

    @JsonIgnore
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "material_request_id", nullable = false)
    private InvMaterialRequest materialRequest;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "item_id", nullable = false)
    @JsonIgnoreProperties({"hibernateLazyInitializer", "handler", "category", "itemGroup", "unitOfMeasure"})
    private InvItem item;

    @Column(name = "line_order", nullable = false)
    private int lineOrder;

    @Column(name = "requested_quantity", nullable = false, precision = 15, scale = 4)
    private BigDecimal requestedQuantity;

    @Column(name = "approved_quantity", precision = 15, scale = 4)
    private BigDecimal approvedQuantity;

    @Column(name = "issued_quantity", precision = 15, scale = 4)
    private BigDecimal issuedQuantity = BigDecimal.ZERO;

    @Column(name = "estimated_unit_cost", precision = 15, scale = 4)
    private BigDecimal estimatedUnitCost = BigDecimal.ZERO;

    @Column(name = "remarks", length = 500)
    private String remarks;

    public InvMaterialRequestLine() {}

    // Getters and Setters
    public long getId() { return id; }
    public void setId(long id) { this.id = id; }

    public InvMaterialRequest getMaterialRequest() { return materialRequest; }
    public void setMaterialRequest(InvMaterialRequest materialRequest) { this.materialRequest = materialRequest; }

    public InvItem getItem() { return item; }
    public void setItem(InvItem item) { this.item = item; }

    public int getLineOrder() { return lineOrder; }
    public void setLineOrder(int lineOrder) { this.lineOrder = lineOrder; }

    public BigDecimal getRequestedQuantity() { return requestedQuantity; }
    public void setRequestedQuantity(BigDecimal requestedQuantity) { this.requestedQuantity = requestedQuantity; }

    public BigDecimal getApprovedQuantity() { return approvedQuantity; }
    public void setApprovedQuantity(BigDecimal approvedQuantity) { this.approvedQuantity = approvedQuantity; }

    public BigDecimal getIssuedQuantity() { return issuedQuantity; }
    public void setIssuedQuantity(BigDecimal issuedQuantity) { this.issuedQuantity = issuedQuantity; }

    public BigDecimal getEstimatedUnitCost() { return estimatedUnitCost; }
    public void setEstimatedUnitCost(BigDecimal estimatedUnitCost) { this.estimatedUnitCost = estimatedUnitCost; }

    public String getRemarks() { return remarks; }
    public void setRemarks(String remarks) { this.remarks = remarks; }
}
