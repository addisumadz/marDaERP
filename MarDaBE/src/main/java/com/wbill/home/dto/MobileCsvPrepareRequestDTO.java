package com.wbill.home.dto;

import java.util.List;

public class MobileCsvPrepareRequestDTO {

    private Integer readerId;
    private String kifyaWerEng;
    private List<ZpiMobileReadingRequestDTO> rows;

    public Integer getReaderId() {
        return readerId;
    }

    public void setReaderId(Integer readerId) {
        this.readerId = readerId;
    }

    public String getKifyaWerEng() {
        return kifyaWerEng;
    }

    public void setKifyaWerEng(String kifyaWerEng) {
        this.kifyaWerEng = kifyaWerEng;
    }

    public List<ZpiMobileReadingRequestDTO> getRows() {
        return rows;
    }

    public void setRows(List<ZpiMobileReadingRequestDTO> rows) {
        this.rows = rows;
    }
}
