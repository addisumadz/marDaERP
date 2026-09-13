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
@Table(name = "inv_goods_received_note")
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class InvGoodsReceivedNote implements Serializable {
    private static final long serialVersionUID = 1L;

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private long id;

    @Column(name = "grn_number", nullable = false, unique = true, length = 50)
    private String grnNumber;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "purchase_order_id", nullable = false)
    @JsonIgnoreProperties({"lines", "goodsReceivedNotes", "hibernateLazyInitializer", "handler"})
    private InvPurchaseOrder purchaseOrder;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "store_id", nullable = false)
    @JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
    private InvStore store;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "supplier_id", nullable = false)
    @JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
    private InvSupplier supplier;

    @Column(name = "received_date", nullable = false)
    private LocalDate receivedDate;

    @Column(name = "received_by", nullable = false, length = 100)
    private String receivedBy;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false)
    private GRNStatus status = GRNStatus.DRAFT;

    @Column(name = "supplier_invoice_number", length = 50)
    private String supplierInvoiceNumber;

    @Column(name = "remarks", length = 500)
    private String remarks;

    @Column(name = "total_amount", precision = 15, scale = 2)
    private BigDecimal totalAmount = BigDecimal.ZERO;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "journal_entry_id")
    @JsonIgnoreProperties({"lines", "fiscalYear", "hibernateLazyInitializer", "handler"})
    private FncJournalEntry journalEntry;

    @OneToMany(mappedBy = "goodsReceivedNote", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    @OrderBy("lineOrder ASC")
    private List<InvGoodsReceivedNoteLine> lines = new ArrayList<>();

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

    public enum GRNStatus {
        DRAFT, CONFIRMED, CANCELLED
    }

    public InvGoodsReceivedNote() {}

    public void addLine(InvGoodsReceivedNoteLine line) {
        lines.add(line);
        line.setGoodsReceivedNote(this);
    }

    public void removeLine(InvGoodsReceivedNoteLine line) {
        lines.remove(line);
        line.setGoodsReceivedNote(null);
    }

    // Getters and Setters
    public long getId() { return id; }
    public void setId(long id) { this.id = id; }

    public String getGrnNumber() { return grnNumber; }
    public void setGrnNumber(String grnNumber) { this.grnNumber = grnNumber; }

    public InvPurchaseOrder getPurchaseOrder() { return purchaseOrder; }
    public void setPurchaseOrder(InvPurchaseOrder purchaseOrder) { this.purchaseOrder = purchaseOrder; }

    public InvStore getStore() { return store; }
    public void setStore(InvStore store) { this.store = store; }

    public InvSupplier getSupplier() { return supplier; }
    public void setSupplier(InvSupplier supplier) { this.supplier = supplier; }

    public LocalDate getReceivedDate() { return receivedDate; }
    public void setReceivedDate(LocalDate receivedDate) { this.receivedDate = receivedDate; }

    public String getReceivedBy() { return receivedBy; }
    public void setReceivedBy(String receivedBy) { this.receivedBy = receivedBy; }

    public GRNStatus getStatus() { return status; }
    public void setStatus(GRNStatus status) { this.status = status; }

    public String getSupplierInvoiceNumber() { return supplierInvoiceNumber; }
    public void setSupplierInvoiceNumber(String supplierInvoiceNumber) { this.supplierInvoiceNumber = supplierInvoiceNumber; }

    public String getRemarks() { return remarks; }
    public void setRemarks(String remarks) { this.remarks = remarks; }

    public BigDecimal getTotalAmount() { return totalAmount; }
    public void setTotalAmount(BigDecimal totalAmount) { this.totalAmount = totalAmount; }

    public FncJournalEntry getJournalEntry() { return journalEntry; }
    public void setJournalEntry(FncJournalEntry journalEntry) { this.journalEntry = journalEntry; }

    public List<InvGoodsReceivedNoteLine> getLines() { return lines; }
    public void setLines(List<InvGoodsReceivedNoteLine> lines) { this.lines = lines; }

    public String getCreatedBy() { return createdBy; }
    public void setCreatedBy(String createdBy) { this.createdBy = createdBy; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
}
