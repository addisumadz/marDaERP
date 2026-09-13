package com.wbill.home.repository;

import com.wbill.home.model.BillingInvoiceNumbersReference;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import jakarta.persistence.LockModeType;
import java.util.Optional;

@Repository
public interface BillingInvoiceNumbersReferenceRepository
        extends JpaRepository<BillingInvoiceNumbersReference, Integer> {

    /**
     * Fetches the invoice number reference with a pessimistic write lock.
     * This ensures that only one transaction can read and modify the counter at a
     * time,
     * preventing race conditions that could lead to duplicate invoice numbers.
     * 
     * @param id The ID of the reference record
     * @return Optional containing the locked reference entity
     */
    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("SELECT r FROM BillingInvoiceNumbersReference r WHERE r.id = :id")
    Optional<BillingInvoiceNumbersReference> findByIdWithLock(@Param("id") Integer id);
}
