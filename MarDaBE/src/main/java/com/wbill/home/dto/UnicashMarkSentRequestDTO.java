package com.wbill.home.dto;

import java.util.List;

/**
 * Simple DTO carrying a list of reading IDs for Unicash mark-sent and cancel operations.
 */
public class UnicashMarkSentRequestDTO {

    private List<Integer> readingIds;

    public UnicashMarkSentRequestDTO() {
    }

    public List<Integer> getReadingIds() {
        return readingIds;
    }

    public void setReadingIds(List<Integer> readingIds) {
        this.readingIds = readingIds;
    }
}
