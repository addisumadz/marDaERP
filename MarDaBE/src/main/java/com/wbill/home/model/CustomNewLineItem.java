package com.wbill.home.model;

import java.io.Serializable;
import java.math.BigDecimal;
import jakarta.persistence.*;
import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

@Entity
@Table(name = "custom_new_line_item")
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class CustomNewLineItem implements Serializable {
    private static final long serialVersionUID = 1L;

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @JsonIgnore
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "request_id", nullable = false)
    private CustomNewLineConnectionRequest request;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "common_material_id")
    @JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
    private CustomCommonMaterial commonMaterial;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "inv_item_id")
    @JsonIgnoreProperties({"hibernateLazyInitializer", "handler", "category", "itemGroup", "unitOfMeasure"})
    private InvItem invItem;

    @Column(name = "item_name", nullable = false, length = 200)
    private String itemName;

    @Column(name = "item_name_am", length = 200)
    private String itemNameAm;

    @Column(name = "unit_of_measure", length = 50)
    private String unitOfMeasure = "በቁጥር";

    @Column(name = "surveyed_quantity", precision = 12, scale = 2, nullable = false)
    private BigDecimal surveyedQuantity = BigDecimal.ZERO;

    @Column(name = "utility_quantity", precision = 12, scale = 2, nullable = false)
    private BigDecimal utilityQuantity = BigDecimal.ZERO;

    @Column(name = "utility_unit_price", precision = 15, scale = 2, nullable = false)
    private BigDecimal utilityUnitPrice = BigDecimal.ZERO;

    @Column(name = "utility_total_price", precision = 15, scale = 2, nullable = false)
    private BigDecimal utilityTotalPrice = BigDecimal.ZERO;

    @Column(name = "outside_quantity", precision = 12, scale = 2, nullable = false)
    private BigDecimal outsideQuantity = BigDecimal.ZERO;

    @Column(name = "outside_unit_price", precision = 15, scale = 2, nullable = false)
    private BigDecimal outsideUnitPrice = BigDecimal.ZERO;

    @Column(name = "outside_total_price", precision = 15, scale = 2, nullable = false)
    private BigDecimal outsideTotalPrice = BigDecimal.ZERO;

    @Column(name = "remarks", length = 500)
    private String remarks;

    public CustomNewLineItem() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public CustomNewLineConnectionRequest getRequest() { return request; }
    public void setRequest(CustomNewLineConnectionRequest request) { this.request = request; }

    public CustomCommonMaterial getCommonMaterial() { return commonMaterial; }
    public void setCommonMaterial(CustomCommonMaterial commonMaterial) { this.commonMaterial = commonMaterial; }

    public InvItem getInvItem() { return invItem; }
    public void setInvItem(InvItem invItem) { this.invItem = invItem; }

    public String getItemName() { return itemName; }
    public void setItemName(String itemName) { this.itemName = itemName; }

    public String getItemNameAm() { return itemNameAm; }
    public void setItemNameAm(String itemNameAm) { this.itemNameAm = itemNameAm; }

    public String getUnitOfMeasure() { return unitOfMeasure; }
    public void setUnitOfMeasure(String unitOfMeasure) { this.unitOfMeasure = unitOfMeasure; }

    public BigDecimal getSurveyedQuantity() { return surveyedQuantity; }
    public void setSurveyedQuantity(BigDecimal surveyedQuantity) { this.surveyedQuantity = surveyedQuantity; }

    public BigDecimal getUtilityQuantity() { return utilityQuantity; }
    public void setUtilityQuantity(BigDecimal utilityQuantity) { this.utilityQuantity = utilityQuantity; }

    public BigDecimal getUtilityUnitPrice() { return utilityUnitPrice; }
    public void setUtilityUnitPrice(BigDecimal utilityUnitPrice) { this.utilityUnitPrice = utilityUnitPrice; }

    public BigDecimal getUtilityTotalPrice() { return utilityTotalPrice; }
    public void setUtilityTotalPrice(BigDecimal utilityTotalPrice) { this.utilityTotalPrice = utilityTotalPrice; }

    public BigDecimal getOutsideQuantity() { return outsideQuantity; }
    public void setOutsideQuantity(BigDecimal outsideQuantity) { this.outsideQuantity = outsideQuantity; }

    public BigDecimal getOutsideUnitPrice() { return outsideUnitPrice; }
    public void setOutsideUnitPrice(BigDecimal outsideUnitPrice) { this.outsideUnitPrice = outsideUnitPrice; }

    public BigDecimal getOutsideTotalPrice() { return outsideTotalPrice; }
    public void setOutsideTotalPrice(BigDecimal outsideTotalPrice) { this.outsideTotalPrice = outsideTotalPrice; }

    public String getRemarks() { return remarks; }
    public void setRemarks(String remarks) { this.remarks = remarks; }
}
