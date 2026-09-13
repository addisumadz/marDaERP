package com.wbill.home.dto;

import java.util.Date;

public class CashierPaymentUpdateDTO {
    private Double amount; // amount collected at front office
    private Date moneyCollectedDate; // optional; defaults to now if null
    private String remark; // optional cashier remark or receipt number
    private Integer cashierUserId; // optional; to link cashier user

    public Double getAmount() {
        return amount;
    }

    public void setAmount(Double amount) {
        this.amount = amount;
    }

    public Date getMoneyCollectedDate() {
        return moneyCollectedDate;
    }

    public void setMoneyCollectedDate(Date moneyCollectedDate) {
        this.moneyCollectedDate = moneyCollectedDate;
    }

    public String getRemark() {
        return remark;
    }

    public void setRemark(String remark) {
        this.remark = remark;
    }

    public Integer getCashierUserId() {
        return cashierUserId;
    }

    public void setCashierUserId(Integer cashierUserId) {
        this.cashierUserId = cashierUserId;
    }
}
