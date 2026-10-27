package com.wbill.home.dto;

import java.io.Serializable;
import java.util.ArrayList;
import java.util.List;

public class BankInvoiceCompareResultDTO implements Serializable {
    private static final long serialVersionUID = 1L;

    private String kifyaWer;
    private Integer totalCsvRows = 0;
    private Integer matchedCount = 0;
    private Integer invoiceMismatchCount = 0;
    private Integer amountMismatchCount = 0;
    private Integer notFoundCount = 0;
    private Integer voidCount = 0;
    private Double totalCsvAmount = 0.0;
    private Double totalSystemAmount = 0.0;
    private List<BankInvoiceCompareRowDTO> rows = new ArrayList<>();

    public BankInvoiceCompareResultDTO() {
    }

    public String getKifyaWer() {
        return kifyaWer;
    }

    public void setKifyaWer(String kifyaWer) {
        this.kifyaWer = kifyaWer;
    }

    public Integer getTotalCsvRows() {
        return totalCsvRows;
    }

    public void setTotalCsvRows(Integer totalCsvRows) {
        this.totalCsvRows = totalCsvRows;
    }

    public Integer getMatchedCount() {
        return matchedCount;
    }

    public void setMatchedCount(Integer matchedCount) {
        this.matchedCount = matchedCount;
    }

    public Integer getInvoiceMismatchCount() {
        return invoiceMismatchCount;
    }

    public void setInvoiceMismatchCount(Integer invoiceMismatchCount) {
        this.invoiceMismatchCount = invoiceMismatchCount;
    }

    public Integer getAmountMismatchCount() {
        return amountMismatchCount;
    }

    public void setAmountMismatchCount(Integer amountMismatchCount) {
        this.amountMismatchCount = amountMismatchCount;
    }

    public Integer getNotFoundCount() {
        return notFoundCount;
    }

    public void setNotFoundCount(Integer notFoundCount) {
        this.notFoundCount = notFoundCount;
    }

    public Integer getVoidCount() {
        return voidCount;
    }

    public void setVoidCount(Integer voidCount) {
        this.voidCount = voidCount;
    }

    public Double getTotalCsvAmount() {
        return totalCsvAmount;
    }

    public void setTotalCsvAmount(Double totalCsvAmount) {
        this.totalCsvAmount = totalCsvAmount;
    }

    public Double getTotalSystemAmount() {
        return totalSystemAmount;
    }

    public void setTotalSystemAmount(Double totalSystemAmount) {
        this.totalSystemAmount = totalSystemAmount;
    }

    public List<BankInvoiceCompareRowDTO> getRows() {
        return rows;
    }

    public void setRows(List<BankInvoiceCompareRowDTO> rows) {
        this.rows = rows;
    }
}
