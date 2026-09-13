package com.wbill.home.repository;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.wbill.home.model.BillingInvoiceNumbers;

@Repository
public interface BillingInvoiceNumbersRepository extends JpaRepository<BillingInvoiceNumbers, Integer> {
    // You might add custom queries here later if needed
}