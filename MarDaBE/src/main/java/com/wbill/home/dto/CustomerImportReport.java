package com.wbill.home.dto;

import java.util.ArrayList;
import java.util.List;

// This class will hold the final summary of the import process.
public class CustomerImportReport {
	
	
    private int importedCount = 0;
    private int skippedCount = 0;
    private List<String> importedCustomerSummaries = new ArrayList<>();
    private List<SkippedRowInfo> skippedRows = new ArrayList<>();

    // Standard Getters and Setters...
    public int getImportedCount() { return importedCount; }
    public void setImportedCount(int importedCount) { this.importedCount = importedCount; }
    public int getSkippedCount() { return skippedCount; }
    public void setSkippedCount(int skippedCount) { this.skippedCount = skippedCount; }
    public List<String> getImportedCustomerSummaries() { return importedCustomerSummaries; }
    public void setImportedCustomerSummaries(List<String> importedCustomerSummaries) { this.importedCustomerSummaries = importedCustomerSummaries; }
    public List<SkippedRowInfo> getSkippedRows() { return skippedRows; }
    public void setSkippedRows(List<SkippedRowInfo> skippedRows) { this.skippedRows = skippedRows; }

    // Helper methods to make the service code cleaner
    public void addSuccess(String summary) {
        this.importedCount++;
        this.importedCustomerSummaries.add(summary);

    }
    public void addSkipped(SkippedRowInfo skippedInfo) {
        this.skippedCount++;
        this.skippedRows.add(skippedInfo);

    }
}