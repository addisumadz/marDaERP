package com.wbill.home.dto; // Or com.wbill.home.dto.importreport

import java.io.Serializable;
import java.util.List;
import java.util.ArrayList;

public class ImportReport implements Serializable {
    private static final long serialVersionUID = 1L;

    private List<String> importLogs;
    private List<NoPreviousReadingReportEntry> noPreviousReadingEntries;
    private int successCount;
    private int failedCount;
    private int updatedCount;
    private int skippedCount;

    public int getSkippedCount() {
		return skippedCount;
	}

	public void setSkippedCount(int skippedCount) {
		this.skippedCount = skippedCount;
	}

	public int getUpdatedCount() {
		return updatedCount;
	}

	public void setUpdatedCount(int updatedCount) {
		this.updatedCount = updatedCount;
	}

	public ImportReport() {
        this.importLogs = new ArrayList<>();
        this.noPreviousReadingEntries = new ArrayList<>();
    }

    public List<String> getImportLogs() {
        return importLogs;
    }

    public void setImportLogs(List<String> importLogs) {
        this.importLogs = importLogs;
    }

    public List<NoPreviousReadingReportEntry> getNoPreviousReadingEntries() {
        return noPreviousReadingEntries;
    }

    public void setNoPreviousReadingEntries(List<NoPreviousReadingReportEntry> noPreviousReadingEntries) {
        this.noPreviousReadingEntries = noPreviousReadingEntries;
    }

    public int getSuccessCount() {
        return successCount;
    }

    public void setSuccessCount(int successCount) {
        this.successCount = successCount;
    }

    public int getFailedCount() {
        return failedCount;
    }

    public void setFailedCount(int failedCount) {
        this.failedCount = failedCount;
    }
}
