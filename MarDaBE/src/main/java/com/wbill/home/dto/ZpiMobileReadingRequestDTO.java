package com.wbill.home.dto;

import com.fasterxml.jackson.annotation.JsonProperty;

public class ZpiMobileReadingRequestDTO {

    @JsonProperty("customer_info_id")
    private Integer customerInfoId;

    @JsonProperty("consumption")
    private Integer consumption;

    @JsonProperty("kifya_wer")
    private String kifyaWer;

    @JsonProperty("maximumreading")
    private Integer maximumreading;

    @JsonProperty("additional_text")
    private String additionalText;

    public Integer getCustomerInfoId() {
        return customerInfoId;
    }

    public void setCustomerInfoId(Integer customerInfoId) {
        this.customerInfoId = customerInfoId;
    }

    public Integer getConsumption() {
        return consumption;
    }

    public void setConsumption(Integer consumption) {
        this.consumption = consumption;
    }

    public String getKifyaWer() {
        return kifyaWer;
    }

    public void setKifyaWer(String kifyaWer) {
        this.kifyaWer = kifyaWer;
    }

    public Integer getMaximumreading() {
        return maximumreading;
    }

    public void setMaximumreading(Integer maximumreading) {
        this.maximumreading = maximumreading;
    }

    public String getAdditionalText() {
        return additionalText;
    }

    public void setAdditionalText(String additionalText) {
        this.additionalText = additionalText;
    }

    @JsonProperty("wuzif_hisab")
    private Double wuzifHisab;

    @JsonProperty("wuzif_kezih_eske")
    private String wuzifKezihEske;

    public Double getWuzifHisab() {
        return wuzifHisab;
    }

    public void setWuzifHisab(Double wuzifHisab) {
        this.wuzifHisab = wuzifHisab;
    }

    public String getWuzifKezihEske() {
        return wuzifKezihEske;
    }

    public void setWuzifKezihEske(String wuzifKezihEske) {
        this.wuzifKezihEske = wuzifKezihEske;
    }

    @JsonProperty("zero_reason_id")
    private Integer zeroReadingReasonId;

    public Integer getZeroReadingReasonId() {
        return zeroReadingReasonId;
    }

    public void setZeroReadingReasonId(Integer zeroReadingReasonId) {
        this.zeroReadingReasonId = zeroReadingReasonId;
    }

    @JsonProperty("reader_gps")
    private String readerGps;

    public String getReaderGps() {
        return readerGps;
    }

    public void setReaderGps(String readerGps) {
        this.readerGps = readerGps;
    }
}
