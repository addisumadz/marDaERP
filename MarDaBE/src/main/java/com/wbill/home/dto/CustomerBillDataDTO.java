package com.wbill.home.dto;

import java.util.List;
import java.util.Objects;

/**
 * A Data Transfer Object to hold combined customer bill data.
 * This version uses standard Java boilerplate code instead of Lombok annotations.
 */
public class CustomerBillDataDTO {

    private List<BillingReadingDTO> bills;
    private List<BillingReadingDTO> wuzifBills;

    /**
     * No-argument constructor.
     * Required by many frameworks for instantiation.
     */
    public CustomerBillDataDTO() {
    }

    /**
     * All-arguments constructor to initialize all fields.
     *
     * @param bills A list of regular bills.
     * @param wuzifBills A list of unpaid wuzif bills.
     */
    public CustomerBillDataDTO(List<BillingReadingDTO> bills, List<BillingReadingDTO> wuzifBills) {
        this.bills = bills;
        this.wuzifBills = wuzifBills;
    }

    // --- Getters and Setters ---

    public List<BillingReadingDTO> getBills() {
        return bills;
    }

    public void setBills(List<BillingReadingDTO> bills) {
        this.bills = bills;
    }

    public List<BillingReadingDTO> getWuzifBills() {
        return wuzifBills;
    }

    public void setWuzifBills(List<BillingReadingDTO> wuzifBills) {
        this.wuzifBills = wuzifBills;
    }

    // --- equals, hashCode, and toString ---

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        CustomerBillDataDTO that = (CustomerBillDataDTO) o;
        return Objects.equals(bills, that.bills) &&
               Objects.equals(wuzifBills, that.wuzifBills);
    }

    @Override
    public int hashCode() {
        return Objects.hash(bills, wuzifBills);
    }

    @Override
    public String toString() {
        return "CustomerBillDataDTO{" +
                "bills=" + bills +
                ", wuzifBills=" + wuzifBills +
                '}';
    }
}