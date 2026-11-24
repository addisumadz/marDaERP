package com.wbill.home.dto;

import java.util.List;

public class BulkBillSmsRequestDTO {

    private List<Integer> readingIds;
    private String smsDueDateText;
    private String monthYearPart;
    private String templateCode;

    public BulkBillSmsRequestDTO() {
    }

    public List<Integer> getReadingIds() {
        return readingIds;
    }

    public void setReadingIds(List<Integer> readingIds) {
        this.readingIds = readingIds;
    }

    public String getSmsDueDateText() {
        return smsDueDateText;
    }

    public void setSmsDueDateText(String smsDueDateText) {
        this.smsDueDateText = smsDueDateText;
    }

    public String getMonthYearPart() {
        return monthYearPart;
    }

    public void setMonthYearPart(String monthYearPart) {
        this.monthYearPart = monthYearPart;
    }

    public String getTemplateCode() {
        return templateCode;
    }

    public void setTemplateCode(String templateCode) {
        this.templateCode = templateCode;
    }
}
