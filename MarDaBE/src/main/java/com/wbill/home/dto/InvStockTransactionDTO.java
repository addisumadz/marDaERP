package com.wbill.home.dto;

import com.wbill.home.model.InvStockTransaction;
import java.math.BigDecimal;

/**
 * DTO for InvStockTransaction – flattens nested entity references
 * to prevent infinite recursion during JSON serialization.
 */
public class InvStockTransactionDTO {
    private long id;
    private String transactionNumber;
    private String transactionType;
    private BigDecimal quantity;
    private BigDecimal unitCost;
    private BigDecimal totalCost;
    private BigDecimal balanceBefore;
    private BigDecimal balanceAfter;
    private String referenceType;
    private Long referenceId;
    private String remarks;
    private String transactionDate;
    private String createdBy;
    private String createdAt;

    // Flattened item info
    private ItemInfo item;

    // Flattened store info
    private StoreInfo store;

    // Flattened performer (createdBy is already a String, but keeping for alias)
    private String performedBy;

    public InvStockTransactionDTO() {}

    public static InvStockTransactionDTO fromEntity(InvStockTransaction entity) {
        if (entity == null) return null;

        InvStockTransactionDTO dto = new InvStockTransactionDTO();
        dto.setId(entity.getId());
        dto.setTransactionNumber(entity.getTransactionNumber());
        dto.setTransactionType(entity.getTransactionType() != null ? entity.getTransactionType().name() : null);
        dto.setQuantity(entity.getQuantity());
        dto.setUnitCost(entity.getUnitCost());
        dto.setTotalCost(entity.getTotalCost());
        dto.setBalanceBefore(entity.getBalanceBefore());
        dto.setBalanceAfter(entity.getBalanceAfter());
        dto.setReferenceType(entity.getReferenceType());
        dto.setReferenceId(entity.getReferenceId());
        dto.setRemarks(entity.getRemarks());
        dto.setTransactionDate(entity.getTransactionDate() != null ? entity.getTransactionDate().toString() : null);
        dto.setCreatedBy(entity.getCreatedBy());
        dto.setCreatedAt(entity.getCreatedAt() != null ? entity.getCreatedAt().toString() : null);
        dto.setPerformedBy(entity.getCreatedBy());

        if (entity.getItem() != null) {
            ItemInfo itemInfo = new ItemInfo();
            itemInfo.setId(entity.getItem().getId());
            itemInfo.setItemCode(entity.getItem().getItemCode());
            itemInfo.setItemName(entity.getItem().getItemName());
            itemInfo.setItemNameAm(entity.getItem().getItemNameAm());
            dto.setItem(itemInfo);
        }

        if (entity.getStore() != null) {
            StoreInfo storeInfo = new StoreInfo();
            storeInfo.setId(entity.getStore().getId());
            storeInfo.setStoreCode(entity.getStore().getStoreCode());
            storeInfo.setStoreName(entity.getStore().getStoreName());
            dto.setStore(storeInfo);
        }

        return dto;
    }

    // --- Nested lightweight DTOs ---

    public static class ItemInfo {
        private long id;
        private String itemCode;
        private String itemName;
        private String itemNameAm;

        public long getId() { return id; }
        public void setId(long id) { this.id = id; }
        public String getItemCode() { return itemCode; }
        public void setItemCode(String itemCode) { this.itemCode = itemCode; }
        public String getItemName() { return itemName; }
        public void setItemName(String itemName) { this.itemName = itemName; }
        public String getItemNameAm() { return itemNameAm; }
        public void setItemNameAm(String itemNameAm) { this.itemNameAm = itemNameAm; }
    }

    public static class StoreInfo {
        private int id;
        private String storeCode;
        private String storeName;

        public int getId() { return id; }
        public void setId(int id) { this.id = id; }
        public String getStoreCode() { return storeCode; }
        public void setStoreCode(String storeCode) { this.storeCode = storeCode; }
        public String getStoreName() { return storeName; }
        public void setStoreName(String storeName) { this.storeName = storeName; }
    }

    // --- Getters and Setters ---

    public long getId() { return id; }
    public void setId(long id) { this.id = id; }

    public String getTransactionNumber() { return transactionNumber; }
    public void setTransactionNumber(String transactionNumber) { this.transactionNumber = transactionNumber; }

    public String getTransactionType() { return transactionType; }
    public void setTransactionType(String transactionType) { this.transactionType = transactionType; }

    public BigDecimal getQuantity() { return quantity; }
    public void setQuantity(BigDecimal quantity) { this.quantity = quantity; }

    public BigDecimal getUnitCost() { return unitCost; }
    public void setUnitCost(BigDecimal unitCost) { this.unitCost = unitCost; }

    public BigDecimal getTotalCost() { return totalCost; }
    public void setTotalCost(BigDecimal totalCost) { this.totalCost = totalCost; }

    public BigDecimal getBalanceBefore() { return balanceBefore; }
    public void setBalanceBefore(BigDecimal balanceBefore) { this.balanceBefore = balanceBefore; }

    public BigDecimal getBalanceAfter() { return balanceAfter; }
    public void setBalanceAfter(BigDecimal balanceAfter) { this.balanceAfter = balanceAfter; }

    public String getReferenceType() { return referenceType; }
    public void setReferenceType(String referenceType) { this.referenceType = referenceType; }

    public Long getReferenceId() { return referenceId; }
    public void setReferenceId(Long referenceId) { this.referenceId = referenceId; }

    public String getRemarks() { return remarks; }
    public void setRemarks(String remarks) { this.remarks = remarks; }

    public String getTransactionDate() { return transactionDate; }
    public void setTransactionDate(String transactionDate) { this.transactionDate = transactionDate; }

    public String getCreatedBy() { return createdBy; }
    public void setCreatedBy(String createdBy) { this.createdBy = createdBy; }

    public String getCreatedAt() { return createdAt; }
    public void setCreatedAt(String createdAt) { this.createdAt = createdAt; }

    public ItemInfo getItem() { return item; }
    public void setItem(ItemInfo item) { this.item = item; }

    public StoreInfo getStore() { return store; }
    public void setStore(StoreInfo store) { this.store = store; }

    public String getPerformedBy() { return performedBy; }
    public void setPerformedBy(String performedBy) { this.performedBy = performedBy; }
}
