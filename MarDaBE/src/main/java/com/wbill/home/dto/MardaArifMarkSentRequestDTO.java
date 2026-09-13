package com.wbill.home.dto;

import java.util.List;

/**
 * Simple DTO carrying a list of reading IDs for MardaArif mark-sent and cancel operations.
 */
public class MardaArifMarkSentRequestDTO {

    private List<Integer> readingIds;

    public MardaArifMarkSentRequestDTO() {
    }

    public List<Integer> getReadingIds() {
        return readingIds;
    }

    public void setReadingIds(List<Integer> readingIds) {
        this.readingIds = readingIds;
    }
}
