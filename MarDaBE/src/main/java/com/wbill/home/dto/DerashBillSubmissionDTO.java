package com.wbill.home.dto;

import com.fasterxml.jackson.annotation.JsonAlias;
import com.fasterxml.jackson.annotation.JsonProperty;

/**
 * DTO for Derash bill submission data
 * Used when submitting individual customer bills to Derash payment gateway
 */
public class DerashBillSubmissionDTO {

    @JsonProperty("bill_id")
    @JsonAlias({"billId"})
    private String bill_id;

    @JsonProperty("bill_desc")
    @JsonAlias({"billDesc","bill_description"})
    private String bill_desc;

    @JsonProperty("reason")
    private String reason;

    @JsonProperty("amount_due")
    @JsonAlias({"amountDue"})
    private String amount_due;

    @JsonProperty("due_date")
    @JsonAlias({"dueDate"})
    private String due_date;

    @JsonProperty("partial_pay_allowed")
    @JsonAlias({"partialPayAllowed"})
    private Boolean partial_pay_allowed;

    @JsonProperty("customer_id")
    @JsonAlias({"customerId"})
    private String customer_id;

    @JsonProperty("name")
    private String name;

    @JsonProperty("mobile")
    private String mobile;

    @JsonProperty("email")
    private String email;

    // Default constructor
    public DerashBillSubmissionDTO() {}

    // Constructor with required fields
    public DerashBillSubmissionDTO(String billId, String name, String amountDue, String dueDate, String reason) {
        this.bill_id = billId;
        this.name = name;
        this.amount_due = amountDue;
        this.due_date = dueDate;
        this.reason = reason;
        this.partial_pay_allowed = false; // Default to false
    }

    // Getters and Setters
    public String getBillId() {
        return bill_id;
    }

    public void setBillId(String bill_id) {
        this.bill_id = bill_id;
    }

    public String getBillDesc() {
        return bill_desc;
    }

    public void setBillDesc(String bill_desc) {
        this.bill_desc = bill_desc;
    }

    public String getReason() {
        return reason;
    }

    public void setReason(String reason) {
        this.reason = reason;
    }

    public String getAmountDue() {
        return amount_due;
    }

    public void setAmountDue(String amount_due) {
        this.amount_due = amount_due;
    }

    public String getDueDate() {
        return due_date;
    }

    public void setDueDate(String due_date) {
        this.due_date = due_date;
    }

    public Boolean getPartialPayAllowed() {
        return partial_pay_allowed;
    }

    public void setPartialPayAllowed(Boolean partial_pay_allowed) {
        this.partial_pay_allowed = partial_pay_allowed;
    }

    public String getCustomerId() {
        return customer_id;
    }

    public void setCustomerId(String customer_id) {
        this.customer_id = customer_id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getMobile() {
        return mobile;
    }

    public void setMobile(String mobile) {
        this.mobile = mobile;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    @Override
    public String toString() {
        return "DerashBillSubmissionDTO{" +
                "bill_id='" + bill_id + '\'' +
                ", bill_desc='" + bill_desc + '\'' +
                ", reason='" + reason + '\'' +
                ", amount_due='" + amount_due + '\'' +
                ", due_date='" + due_date + '\'' +
                ", partial_pay_allowed=" + partial_pay_allowed +
                ", customer_id='" + customer_id + '\'' +
                ", name='" + name + '\'' +
                ", mobile='" + mobile + '\'' +
                ", email='" + email + '\'' +
                '}';
    }
}
