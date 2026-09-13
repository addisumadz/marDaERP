package com.wbill.home.dto;

import java.util.List;

public class AdditionalMonthlyPaymentBulkUpdateDTO {

    private Double amount;
    private List<Integer> customerIds;

    public Double getAmount() {
        return amount;
    }

    public void setAmount(Double amount) {
        this.amount = amount;
    }

    public List<Integer> getCustomerIds() {
        return customerIds;
    }

    public void setCustomerIds(List<Integer> customerIds) {
        this.customerIds = customerIds;
    }
}
