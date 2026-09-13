package com.wbill.home.dto;

import com.wbill.home.model.FncJournalEntry;
import java.util.List;
import java.util.stream.Collectors;

public class FncJournalEntryDTO {
    private long id;
    private String entryNumber;
    private String entryDate;
    private int fiscalYearId;
    private String fiscalYearName;
    private String referenceNumber;
    private String sourceType;
    private String sourceId;
    private String description;
    private String status;
    private double totalDebit;
    private double totalCredit;
    private String postedBy;
    private String postedAt;
    private String voidedBy;
    private String voidedAt;
    private String voidReason;
    private String createdBy;
    private String createdAt;
    private List<FncJournalEntryLineDTO> lines;

    public FncJournalEntryDTO() {}

    public FncJournalEntryDTO(FncJournalEntry je) {
        this.id = je.getId();
        this.entryNumber = je.getEntryNumber();
        this.entryDate = je.getEntryDate().toString();
        this.fiscalYearId = je.getFiscalYear().getId();
        this.fiscalYearName = je.getFiscalYear().getFiscalYearName();
        this.referenceNumber = je.getReferenceNumber();
        this.sourceType = je.getSourceType();
        this.sourceId = je.getSourceId();
        this.description = je.getDescription();
        this.status = je.getStatus().name();
        this.totalDebit = je.getTotalDebit().doubleValue();
        this.totalCredit = je.getTotalCredit().doubleValue();
        this.postedBy = je.getPostedBy();
        this.postedAt = je.getPostedAt() != null ? je.getPostedAt().toString() : null;
        this.voidedBy = je.getVoidedBy();
        this.voidedAt = je.getVoidedAt() != null ? je.getVoidedAt().toString() : null;
        this.voidReason = je.getVoidReason();
        this.createdBy = je.getCreatedBy();
        this.createdAt = je.getCreatedAt() != null ? je.getCreatedAt().toString() : null;
    }

    public FncJournalEntryDTO(FncJournalEntry je, boolean includeLines) {
        this(je);
        if (includeLines && je.getLines() != null) {
            this.lines = je.getLines().stream()
                    .map(FncJournalEntryLineDTO::new)
                    .collect(Collectors.toList());
        }
    }

    // Getters and Setters
    public long getId() { return id; }
    public void setId(long id) { this.id = id; }
    public String getEntryNumber() { return entryNumber; }
    public void setEntryNumber(String entryNumber) { this.entryNumber = entryNumber; }
    public String getEntryDate() { return entryDate; }
    public void setEntryDate(String entryDate) { this.entryDate = entryDate; }
    public int getFiscalYearId() { return fiscalYearId; }
    public void setFiscalYearId(int fiscalYearId) { this.fiscalYearId = fiscalYearId; }
    public String getFiscalYearName() { return fiscalYearName; }
    public void setFiscalYearName(String fiscalYearName) { this.fiscalYearName = fiscalYearName; }
    public String getReferenceNumber() { return referenceNumber; }
    public void setReferenceNumber(String referenceNumber) { this.referenceNumber = referenceNumber; }
    public String getSourceType() { return sourceType; }
    public void setSourceType(String sourceType) { this.sourceType = sourceType; }
    public String getSourceId() { return sourceId; }
    public void setSourceId(String sourceId) { this.sourceId = sourceId; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    public double getTotalDebit() { return totalDebit; }
    public void setTotalDebit(double totalDebit) { this.totalDebit = totalDebit; }
    public double getTotalCredit() { return totalCredit; }
    public void setTotalCredit(double totalCredit) { this.totalCredit = totalCredit; }
    public String getPostedBy() { return postedBy; }
    public void setPostedBy(String postedBy) { this.postedBy = postedBy; }
    public String getPostedAt() { return postedAt; }
    public void setPostedAt(String postedAt) { this.postedAt = postedAt; }
    public String getVoidedBy() { return voidedBy; }
    public void setVoidedBy(String voidedBy) { this.voidedBy = voidedBy; }
    public String getVoidedAt() { return voidedAt; }
    public void setVoidedAt(String voidedAt) { this.voidedAt = voidedAt; }
    public String getVoidReason() { return voidReason; }
    public void setVoidReason(String voidReason) { this.voidReason = voidReason; }
    public String getCreatedBy() { return createdBy; }
    public void setCreatedBy(String createdBy) { this.createdBy = createdBy; }
    public String getCreatedAt() { return createdAt; }
    public void setCreatedAt(String createdAt) { this.createdAt = createdAt; }
    public List<FncJournalEntryLineDTO> getLines() { return lines; }
    public void setLines(List<FncJournalEntryLineDTO> lines) { this.lines = lines; }
}
