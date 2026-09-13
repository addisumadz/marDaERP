package com.wbill.home.dto;

import java.util.List;

/**
 * Request DTO for extending Unicash bank bills with additional penalty and new due date.
 * Mirrors DerashBankExtendRequestDTO but is used for Unicash-specific operations.
 */
public class UnicashBankExtendRequestDTO {

    private List<Integer> readingIds;
    private double extraPenalty;
    private String dueDate; // yyyy-MM-dd (Gregorian)

    public UnicashBankExtendRequestDTO() {
    }

    public List<Integer> getReadingIds() {
        return readingIds;
    }

    public void setReadingIds(List<Integer> readingIds) {
        this.readingIds = readingIds;
    }

    public double getExtraPenalty() {
        return extraPenalty;
    }

    public void setExtraPenalty(double extraPenalty) {
        this.extraPenalty = extraPenalty;
    }

    public String getDueDate() {
        return dueDate;
    }

    public void setDueDate(String dueDate) {
        this.dueDate = dueDate;
    }
}
