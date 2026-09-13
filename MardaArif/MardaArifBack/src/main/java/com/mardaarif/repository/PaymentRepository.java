package com.mardaarif.repository;

import com.mardaarif.model.Payment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface PaymentRepository extends JpaRepository<Payment, Long> {
    List<Payment> findByCityId(Integer cityId);
    List<Payment> findByBillId(Long billId);
    List<Payment> findByCustomerIdAndCityId(String customerId, Integer cityId);

    @Query("SELECT p FROM Payment p WHERE p.cityId = :cityId AND p.paidOn >= :fromDate AND p.paidOn <= :toDate ORDER BY p.createdAt DESC")
    List<Payment> findByCityIdAndDateRange(
        @Param("cityId") Integer cityId,
        @Param("fromDate") String fromDate,
        @Param("toDate") String toDate);

    @Query("SELECT p FROM Payment p ORDER BY p.createdAt DESC")
    List<Payment> findAllOrderByCreatedAtDesc();

    @Query("SELECT p FROM Payment p WHERE p.reconciled = false")
    List<Payment> findUnreconciled();

    @Query("SELECT COALESCE(SUM(p.paidAmount), 0) FROM Payment p WHERE p.cityId = :cityId")
    Double totalPaidAmountByCityId(@Param("cityId") Integer cityId);

    @Query("SELECT COUNT(p) FROM Payment p WHERE p.cityId = :cityId")
    long countByCityId(@Param("cityId") Integer cityId);

    @Query("SELECT p FROM Payment p WHERE p.customerId LIKE %:search% OR p.customerName LIKE %:search% OR p.billNumber LIKE %:search%")
    List<Payment> searchPayments(@Param("search") String search);

    @Query("SELECT p FROM Payment p WHERE p.cityId = :cityId AND (p.customerId LIKE %:search% OR p.customerName LIKE %:search% OR p.billNumber LIKE %:search%)")
    List<Payment> searchPaymentsByCityId(@Param("cityId") Integer cityId, @Param("search") String search);
}
