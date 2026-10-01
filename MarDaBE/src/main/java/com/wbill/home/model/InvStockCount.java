package com.wbill.home.model;

import java.io.Serializable;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import jakarta.persistence.*;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

@Entity
@Table(name = "inv_stock_count")
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class InvStockCount implements Serializable {
    private static final long serialVersionUID = 1L;

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private long id;

    @Column(name = "count_number", nullable = false, unique = true, length = 50)
    private String countNumber;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "store_id", nullable = false)
    @JsonIgnoreProperties({"hibernateLazyInitializer", "handler", "storeKeeper", "manager"})
    private InvStore store;

    @Column(name = "count_date", nullable = false)
    private LocalDate countDate;

    @Enumerated(EnumType.STRING)
    @Column(name = "count_scope", nullable = false)
    private CountScope countScope = CountScope.FULL;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "category_filter_id")
    @JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
    private InvItemCategory categoryFilter;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false)
    private CountStatus status = CountStatus.PLANNED;

    @Column(name = "counted_by", length = 100)
    private String countedBy;

    @Column(name = "verified_by", length = 100)
    private String verifiedBy;

    @Column(name = "verified_date")
    private LocalDateTime verifiedDate;

    @Column(name = "total_system_value", precision = 15, scale = 2)
    private BigDecimal totalSystemValue = BigDecimal.ZERO;

    @Column(name = "total_physical_value", precision = 15, scale = 2)
    private BigDecimal totalPhysicalValue = BigDecimal.ZERO;

    @Column(name = "total_variance_value", precision = 15, scale = 2)
    private BigDecimal totalVarianceValue = BigDecimal.ZERO;

    // Link to auto-generated Stock Adjustment
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "stock_adjustment_id")
    @JsonIgnoreProperties({"hibernateLazyInitializer", "handler", "lines", "journalEntry"})
    private InvStockAdjustment stockAdjustment;

    @Column(name = "remarks", length = 500)
    private String remarks;

    @OneToMany(mappedBy = "stockCount", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    @OrderBy("id ASC")
    private List<InvStockCountLine> lines = new ArrayList<>();

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "branch_id")
    @JsonIgnoreProperties({"hibernateLazyInitializer", "handler", "branchKebele", "branchCity", "registeredBy", "modifiedBy"})
    private Branch branch;

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

    public enum CountScope {
        FULL, BY_CATEGORY, SELECTIVE
    }

    public enum CountStatus {
        PLANNED, COUNTING, COUNTED, RECONCILED, ADJUSTED, CANCELLED
    }

    public InvStockCount() {}

    public void addLine(InvStockCountLine line) {
        lines.add(line);
        line.setStockCount(this);
    }

    public void removeLine(InvStockCountLine line) {
        lines.remove(line);
        line.setStockCount(null);
    }

    // Getters and Setters
    public long getId() { return id; }
    public void setId(long id) { this.id = id; }

    public String getCountNumber() { return countNumber; }
    public void setCountNumber(String countNumber) { this.countNumber = countNumber; }

    public InvStore getStore() { return store; }
    public void setStore(InvStore store) { this.store = store; }

    public LocalDate getCountDate() { return countDate; }
    public void setCountDate(LocalDate countDate) { this.countDate = countDate; }

    public CountScope getCountScope() { return countScope; }
    public void setCountScope(CountScope countScope) { this.countScope = countScope; }

    public InvItemCategory getCategoryFilter() { return categoryFilter; }
    public void setCategoryFilter(InvItemCategory categoryFilter) { this.categoryFilter = categoryFilter; }

    public CountStatus getStatus() { return status; }
    public void setStatus(CountStatus status) { this.status = status; }

    public String getCountedBy() { return countedBy; }
    public void setCountedBy(String countedBy) { this.countedBy = countedBy; }

    public String getVerifiedBy() { return verifiedBy; }
    public void setVerifiedBy(String verifiedBy) { this.verifiedBy = verifiedBy; }

    public LocalDateTime getVerifiedDate() { return verifiedDate; }
    public void setVerifiedDate(LocalDateTime verifiedDate) { this.verifiedDate = verifiedDate; }

    public BigDecimal getTotalSystemValue() { return totalSystemValue; }
    public void setTotalSystemValue(BigDecimal totalSystemValue) { this.totalSystemValue = totalSystemValue; }

    public BigDecimal getTotalPhysicalValue() { return totalPhysicalValue; }
    public void setTotalPhysicalValue(BigDecimal totalPhysicalValue) { this.totalPhysicalValue = totalPhysicalValue; }

    public BigDecimal getTotalVarianceValue() { return totalVarianceValue; }
    public void setTotalVarianceValue(BigDecimal totalVarianceValue) { this.totalVarianceValue = totalVarianceValue; }

    public InvStockAdjustment getStockAdjustment() { return stockAdjustment; }
    public void setStockAdjustment(InvStockAdjustment stockAdjustment) { this.stockAdjustment = stockAdjustment; }

    public String getRemarks() { return remarks; }
    public void setRemarks(String remarks) { this.remarks = remarks; }

    public List<InvStockCountLine> getLines() { return lines; }
    public void setLines(List<InvStockCountLine> lines) { this.lines = lines; }

    public Branch getBranch() { return branch; }
    public void setBranch(Branch branch) { this.branch = branch; }

    public String getCreatedBy() { return createdBy; }
    public void setCreatedBy(String createdBy) { this.createdBy = createdBy; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
}
