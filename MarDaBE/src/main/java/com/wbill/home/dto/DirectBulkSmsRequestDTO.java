package com.wbill.home.dto;

import java.util.List;

public class DirectBulkSmsRequestDTO {

    private List<Integer> readingIds;
    private String message;

    public DirectBulkSmsRequestDTO() {
    }

    public List<Integer> getReadingIds() {
        return readingIds;
    }

    public void setReadingIds(List<Integer> readingIds) {
        this.readingIds = readingIds;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }
}
