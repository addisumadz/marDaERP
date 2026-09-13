package com.wbill.home.dto;

import java.util.List;

public class DerashMarkSentRequestDTO {

    private List<Integer> readingIds;

    public DerashMarkSentRequestDTO() {
    }

    public List<Integer> getReadingIds() {
        return readingIds;
    }

    public void setReadingIds(List<Integer> readingIds) {
        this.readingIds = readingIds;
    }
}
