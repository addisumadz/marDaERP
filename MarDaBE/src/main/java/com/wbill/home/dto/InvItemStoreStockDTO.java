package com.wbill.home.dto;

import com.wbill.home.model.InvItemStoreStock;
import java.math.BigDecimal;

/**
 * DTO for InvItemStoreStock – flattens nested entity references
 * to prevent infinite recursion during JSON serialization.
 */
public class InvItemStoreStockDTO {
    private long id;
    private BigDecimal quantityOnHand;
    private BigDecimal quantityReserved;
    private BigDecimal quantityOnOrder;
    private BigDecimal availableQuantity;
    private BigDecimal weightedAvgCost;
    private String lastCountDate;
    private BigDecimal lastCountQuantity;
    private String createdAt;
    private String updatedAt;

    // Flattened item info
    private ItemInfo item;

    // Flattened store info
    private StoreInfo store;

    public InvItemStoreStockDTO() {}

    public static InvItemStoreStockDTO fromEntity(InvItemStoreStock entity) {
        if (entity == null) return null;

        InvItemStoreStockDTO dto = new InvItemStoreStockDTO();
        dto.setId(entity.getId());
        dto.setQuantityOnHand(entity.getQuantityOnHand());
        dto.setQuantityReserved(entity.getQuantityReserved());
        dto.setQuantityOnOrder(entity.getQuantityOnOrder());
        dto.setAvailableQuantity(entity.getAvailableQuantity());
        dto.setWeightedAvgCost(entity.getWeightedAvgCost());
        dto.setLastCountDate(entity.getLastCountDate() != null ? entity.getLastCountDate().toString() : null);
        dto.setLastCountQuantity(entity.getLastCountQuantity());
        dto.setCreatedAt(entity.getCreatedAt() != null ? entity.getCreatedAt().toString() : null);
        dto.setUpdatedAt(entity.getUpdatedAt() != null ? entity.getUpdatedAt().toString() : null);

        if (entity.getItem() != null) {
            ItemInfo itemInfo = new ItemInfo();
            itemInfo.setId(entity.getItem().getId());
            itemInfo.setItemCode(entity.getItem().getItemCode());
            itemInfo.setItemName(entity.getItem().getItemName());
            itemInfo.setItemNameAm(entity.getItem().getItemNameAm());
            itemInfo.setReorderLevel(entity.getItem().getReorderLevel());
            if (entity.getItem().getUnitOfMeasure() != null) {
                itemInfo.setUnitOfMeasureName(entity.getItem().getUnitOfMeasure().getUnitName());
            }
            if (entity.getItem().getCategory() != null) {
                itemInfo.setCategoryName(entity.getItem().getCategory().getCategoryName());
            }
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
        private int reorderLevel;
        private String unitOfMeasureName;
        private String categoryName;

        public long getId() { return id; }
        public void setId(long id) { this.id = id; }
        public String getItemCode() { return itemCode; }
        public void setItemCode(String itemCode) { this.itemCode = itemCode; }
        public String getItemName() { return itemName; }
        public void setItemName(String itemName) { this.itemName = itemName; }
        public String getItemNameAm() { return itemNameAm; }
        public void setItemNameAm(String itemNameAm) { this.itemNameAm = itemNameAm; }
        public int getReorderLevel() { return reorderLevel; }
        public void setReorderLevel(int reorderLevel) { this.reorderLevel = reorderLevel; }
        public String getUnitOfMeasureName() { return unitOfMeasureName; }
        public void setUnitOfMeasureName(String unitOfMeasureName) { this.unitOfMeasureName = unitOfMeasureName; }
        public String getCategoryName() { return categoryName; }
        public void setCategoryName(String categoryName) { this.categoryName = categoryName; }
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

    public BigDecimal getQuantityOnHand() { return quantityOnHand; }
    public void setQuantityOnHand(BigDecimal quantityOnHand) { this.quantityOnHand = quantityOnHand; }

    public BigDecimal getQuantityReserved() { return quantityReserved; }
    public void setQuantityReserved(BigDecimal quantityReserved) { this.quantityReserved = quantityReserved; }

    public BigDecimal getQuantityOnOrder() { return quantityOnOrder; }
    public void setQuantityOnOrder(BigDecimal quantityOnOrder) { this.quantityOnOrder = quantityOnOrder; }

    public BigDecimal getAvailableQuantity() { return availableQuantity; }
    public void setAvailableQuantity(BigDecimal availableQuantity) { this.availableQuantity = availableQuantity; }

    public BigDecimal getWeightedAvgCost() { return weightedAvgCost; }
    public void setWeightedAvgCost(BigDecimal weightedAvgCost) { this.weightedAvgCost = weightedAvgCost; }

    public String getLastCountDate() { return lastCountDate; }
    public void setLastCountDate(String lastCountDate) { this.lastCountDate = lastCountDate; }

    public BigDecimal getLastCountQuantity() { return lastCountQuantity; }
    public void setLastCountQuantity(BigDecimal lastCountQuantity) { this.lastCountQuantity = lastCountQuantity; }

    public String getCreatedAt() { return createdAt; }
    public void setCreatedAt(String createdAt) { this.createdAt = createdAt; }

    public String getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(String updatedAt) { this.updatedAt = updatedAt; }

    public ItemInfo getItem() { return item; }
    public void setItem(ItemInfo item) { this.item = item; }

    public StoreInfo getStore() { return store; }
    public void setStore(StoreInfo store) { this.store = store; }
}
