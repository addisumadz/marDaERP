package com.wbill.home.dto; // Or com.wbill.home.dto.importreport

import java.io.Serializable;

public class NoPreviousReadingReportEntry implements Serializable {
    private static final long serialVersionUID = 1L;

    private String accountNumber;
    private String reason;

    public NoPreviousReadingReportEntry() {
    }

    public NoPreviousReadingReportEntry(String accountNumber, String reason) {
        this.accountNumber = accountNumber;
        this.reason = reason;
    }

    public String getAccountNumber() {
        return accountNumber;
    }

    public void setAccountNumber(String accountNumber) {
        this.accountNumber = accountNumber;
    }

    public String getReason() {
        return reason;
    }

    public void setReason(String reason) {
        this.reason = reason;
    }

    @Override
    public String toString() {
        return "Account: " + accountNumber + ", Reason: " + reason;
    }
}

