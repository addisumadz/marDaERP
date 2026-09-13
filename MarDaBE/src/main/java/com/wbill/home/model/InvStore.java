package com.wbill.home.model;

import java.io.Serializable;
import java.time.LocalDateTime;
import jakarta.persistence.*;

@Entity
@Table(name = "inv_store")
public class InvStore implements Serializable {
    private static final long serialVersionUID = 1L;

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private int id;

    @Column(name = "store_code", nullable = false, unique = true, length = 20)
    private String storeCode;

    @Column(name = "store_name", nullable = false, length = 200)
    private String storeName;

    @Column(name = "store_name_am", length = 200)
    private String storeNameAm;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "branch_id")
    private Branch branch;

    @Column(name = "is_main_store", nullable = false)
    private boolean isMainStore = false;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "store_keeper_id")
    private UserAccount storeKeeper;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "manager_id")
    private UserAccount manager;

    @Column(name = "location", length = 200)
    private String location;

    @Column(name = "is_active", nullable = false)
    private boolean isActive = true;

    @Column(name = "deleted", nullable = false, length = 20)
    private String deleted = "No";

    @Column(name = "created_by", length = 100)
    private String createdBy;

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }

    public InvStore() {}

    // Getters and Setters
    public int getId() { return id; }
    public void setId(int id) { this.id = id; }

    public String getStoreCode() { return storeCode; }
    public void setStoreCode(String storeCode) { this.storeCode = storeCode; }

    public String getStoreName() { return storeName; }
    public void setStoreName(String storeName) { this.storeName = storeName; }

    public String getStoreNameAm() { return storeNameAm; }
    public void setStoreNameAm(String storeNameAm) { this.storeNameAm = storeNameAm; }

    public Branch getBranch() { return branch; }
    public void setBranch(Branch branch) { this.branch = branch; }

    public boolean getIsMainStore() { return isMainStore; }
    public void setIsMainStore(boolean isMainStore) { this.isMainStore = isMainStore; }

    public UserAccount getStoreKeeper() { return storeKeeper; }
    public void setStoreKeeper(UserAccount storeKeeper) { this.storeKeeper = storeKeeper; }

    public UserAccount getManager() { return manager; }
    public void setManager(UserAccount manager) { this.manager = manager; }

    public String getLocation() { return location; }
    public void setLocation(String location) { this.location = location; }

    public boolean getIsActive() { return isActive; }
    public void setIsActive(boolean isActive) { this.isActive = isActive; }

    public String getDeleted() { return deleted; }
    public void setDeleted(String deleted) { this.deleted = deleted; }

    public String getCreatedBy() { return createdBy; }
    public void setCreatedBy(String createdBy) { this.createdBy = createdBy; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
}
