package com.wbill.home.dto;

import java.util.List;

/**
 * Request DTO for extending MardaArif bank bills with additional penalty and new due date.
 * Mirrors UnicashBankExtendRequestDTO but is used for MardaArif-specific operations.
 */
public class MardaArifBankExtendRequestDTO {

    private List<Integer> readingIds;
    private double extraPenalty;
    private String dueDate; // yyyy-MM-dd (Gregorian)

    public MardaArifBankExtendRequestDTO() {
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
