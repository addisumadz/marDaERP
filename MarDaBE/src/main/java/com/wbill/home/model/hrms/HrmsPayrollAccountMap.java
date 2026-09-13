package com.wbill.home.model.hrms;

import java.io.Serializable;
import java.time.LocalDateTime;
import jakarta.persistence.*;
import com.wbill.home.model.FncAccount;

@Entity
@Table(name = "hrms_payroll_account_map")
public class HrmsPayrollAccountMap implements Serializable {
    private static final long serialVersionUID = 1L;

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private int id;

    @Column(name = "mapping_key", nullable = false, unique = true, length = 100)
    private String mappingKey; // e.g. HRMS_DR_BASIC_SALARY, HRMS_CR_TAX_PAYABLE

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "account_id", nullable = false)
    private FncAccount account;

    @Column(name = "label", nullable = false, length = 200)
    private String label;

    @Column(name = "label_am", length = 250)
    private String labelAm;

    @Column(name = "entry_type", nullable = false, length = 10)
    private String entryType = "DEBIT"; // DEBIT or CREDIT

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    @Column(name = "updated_at")
    private LocalDateTime updatedAt = LocalDateTime.now();

    public HrmsPayrollAccountMap() {}

    public HrmsPayrollAccountMap(String mappingKey, FncAccount account, String label, String labelAm, String entryType) {
        this.mappingKey = mappingKey;
        this.account = account;
        this.label = label;
        this.labelAm = labelAm;
        this.entryType = entryType;
    }

    // Getters and Setters
    public int getId() { return id; }
    public void setId(int id) { this.id = id; }

    public String getMappingKey() { return mappingKey; }
    public void setMappingKey(String mappingKey) { this.mappingKey = mappingKey; }

    public FncAccount getAccount() { return account; }
    public void setAccount(FncAccount account) { this.account = account; }

    public String getLabel() { return label; }
    public void setLabel(String label) { this.label = label; }

    public String getLabelAm() { return labelAm; }
    public void setLabelAm(String labelAm) { this.labelAm = labelAm; }

    public String getEntryType() { return entryType; }
    public void setEntryType(String entryType) { this.entryType = entryType; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
}
