package com.wbill.home.dto;

import com.wbill.home.model.InvStore;

public class InvStoreDTO {
    private int id;
    private String storeCode;
    private String storeName;
    private String storeNameAm;
    private boolean isMainStore;
    private String location;
    private boolean isActive;
    private String createdBy;
    private String createdAt;
    private String updatedAt;

    // Flattened branch info
    private BranchInfo branch;

    // Flattened user info
    private UserInfo storeKeeper;
    private UserInfo manager;

    public InvStoreDTO() {}

    /**
     * Convert an InvStore entity to a safe DTO (no circular references).
     */
    public static InvStoreDTO fromEntity(InvStore entity) {
        if (entity == null) return null;

        InvStoreDTO dto = new InvStoreDTO();
        dto.setId(entity.getId());
        dto.setStoreCode(entity.getStoreCode());
        dto.setStoreName(entity.getStoreName());
        dto.setStoreNameAm(entity.getStoreNameAm());
        dto.setIsMainStore(entity.getIsMainStore());
        dto.setLocation(entity.getLocation());
        dto.setIsActive(entity.getIsActive());
        dto.setCreatedBy(entity.getCreatedBy());
        dto.setCreatedAt(entity.getCreatedAt() != null ? entity.getCreatedAt().toString() : null);
        dto.setUpdatedAt(entity.getUpdatedAt() != null ? entity.getUpdatedAt().toString() : null);

        if (entity.getBranch() != null) {
            BranchInfo b = new BranchInfo();
            b.setId(entity.getBranch().getId());
            b.setBranchCode(entity.getBranch().getBranchCode());
            b.setBranchDescription(entity.getBranch().getBranchDescription());
            dto.setBranch(b);
        }

        if (entity.getStoreKeeper() != null) {
            UserInfo sk = new UserInfo();
            sk.setId(entity.getStoreKeeper().getId());
            sk.setUserName(entity.getStoreKeeper().getUserName());
            sk.setFullName(buildFullName(entity.getStoreKeeper()));
            dto.setStoreKeeper(sk);
        }

        if (entity.getManager() != null) {
            UserInfo mg = new UserInfo();
            mg.setId(entity.getManager().getId());
            mg.setUserName(entity.getManager().getUserName());
            mg.setFullName(buildFullName(entity.getManager()));
            dto.setManager(mg);
        }

        return dto;
    }

    private static String buildFullName(com.wbill.home.model.UserAccount user) {
        StringBuilder sb = new StringBuilder();
        if (user.getFirstName() != null) sb.append(user.getFirstName());
        if (user.getMidleName() != null) {
            if (sb.length() > 0) sb.append(" ");
            sb.append(user.getMidleName());
        }
        if (user.getLastName() != null) {
            if (sb.length() > 0) sb.append(" ");
            sb.append(user.getLastName());
        }
        return sb.length() > 0 ? sb.toString() : user.getUserName();
    }

    // --- Nested lightweight DTOs ---

    public static class BranchInfo {
        private int id;
        private String branchCode;
        private String branchDescription;

        public int getId() { return id; }
        public void setId(int id) { this.id = id; }
        public String getBranchCode() { return branchCode; }
        public void setBranchCode(String branchCode) { this.branchCode = branchCode; }
        public String getBranchDescription() { return branchDescription; }
        public void setBranchDescription(String branchDescription) { this.branchDescription = branchDescription; }
    }

    public static class UserInfo {
        private int id;
        private String userName;
        private String fullName;

        public int getId() { return id; }
        public void setId(int id) { this.id = id; }
        public String getUserName() { return userName; }
        public void setUserName(String userName) { this.userName = userName; }
        public String getFullName() { return fullName; }
        public void setFullName(String fullName) { this.fullName = fullName; }
    }

    // --- Getters and Setters ---

    public int getId() { return id; }
    public void setId(int id) { this.id = id; }

    public String getStoreCode() { return storeCode; }
    public void setStoreCode(String storeCode) { this.storeCode = storeCode; }

    public String getStoreName() { return storeName; }
    public void setStoreName(String storeName) { this.storeName = storeName; }

    public String getStoreNameAm() { return storeNameAm; }
    public void setStoreNameAm(String storeNameAm) { this.storeNameAm = storeNameAm; }

    public boolean getIsMainStore() { return isMainStore; }
    public void setIsMainStore(boolean isMainStore) { this.isMainStore = isMainStore; }

    public String getLocation() { return location; }
    public void setLocation(String location) { this.location = location; }

    public boolean getIsActive() { return isActive; }
    public void setIsActive(boolean isActive) { this.isActive = isActive; }

    public String getCreatedBy() { return createdBy; }
    public void setCreatedBy(String createdBy) { this.createdBy = createdBy; }

    public String getCreatedAt() { return createdAt; }
    public void setCreatedAt(String createdAt) { this.createdAt = createdAt; }

    public String getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(String updatedAt) { this.updatedAt = updatedAt; }

    public BranchInfo getBranch() { return branch; }
    public void setBranch(BranchInfo branch) { this.branch = branch; }

    public UserInfo getStoreKeeper() { return storeKeeper; }
    public void setStoreKeeper(UserInfo storeKeeper) { this.storeKeeper = storeKeeper; }

    public UserInfo getManager() { return manager; }
    public void setManager(UserInfo manager) { this.manager = manager; }
}
