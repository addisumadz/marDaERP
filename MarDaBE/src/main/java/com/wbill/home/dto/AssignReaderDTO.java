package com.wbill.home.dto;

import java.util.List;

public class AssignReaderDTO {
    private Integer readerId;
    private List<Integer> customerIds;

    public AssignReaderDTO() {}

    public AssignReaderDTO(Integer readerId, List<Integer> customerIds) {
        this.readerId = readerId;
        this.customerIds = customerIds;
    }

    public Integer getReaderId() {
        return readerId;
    }

    public void setReaderId(Integer readerId) {
        this.readerId = readerId;
    }

    public List<Integer> getCustomerIds() {
        return customerIds;
    }

    public void setCustomerIds(List<Integer> customerIds) {
        this.customerIds = customerIds;
    }
}
