package com.wbill.home.dto;

// This class holds the information for a single skipped row.
public class SkippedRowInfo {
    private int rowNumber;
    private String identifier; // Account Number or Name from the row
    private String reason;

    public SkippedRowInfo(int rowNumber, String identifier, String reason) {
        this.rowNumber = rowNumber;
        this.identifier = identifier;
        this.reason = reason;
    }
    // Standard Getters and Setters...
    public int getRowNumber() { return rowNumber; }
    public void setRowNumber(int rowNumber) { this.rowNumber = rowNumber; }
    public String getIdentifier() { return identifier; }
    public void setIdentifier(String identifier) { this.identifier = identifier; }
    public String getReason() { return reason; }
    public void setReason(String reason) { this.reason = reason; }
}