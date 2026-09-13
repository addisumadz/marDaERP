package com.mardaarif.repository;

import com.mardaarif.model.Bill;
import com.mardaarif.model.BillStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface BillRepository extends JpaRepository<Bill, Long> {
    Optional<Bill> findByBillIdAndCityId(String billId, Integer cityId);
    List<Bill> findByCityId(Integer cityId);
    List<Bill> findByCityIdAndStatus(Integer cityId, BillStatus status);
    List<Bill> findByCustomerIdAndCityId(String customerId, Integer cityId);
    List<Bill> findByStatus(BillStatus status);

    @Query("SELECT b FROM Bill b WHERE b.cityId = :cityId AND b.status = 'PAID' " +
           "AND b.paidOn >= :startDate AND b.paidOn <= :endDate")
    List<Bill> findPaidBillsByCityAndDateRange(
        @Param("cityId") Integer cityId,
        @Param("startDate") String startDate,
        @Param("endDate") String endDate);

    @Query("SELECT COUNT(b) FROM Bill b WHERE b.cityId = :cityId")
    long countByCityId(@Param("cityId") Integer cityId);

    @Query("SELECT COUNT(b) FROM Bill b WHERE b.status = :status")
    long countByStatus(@Param("status") BillStatus status);

    @Query("SELECT COUNT(b) FROM Bill b WHERE b.cityId = :cityId AND b.status = :status")
    long countByCityIdAndStatus(@Param("cityId") Integer cityId, @Param("status") BillStatus status);

    @Query("SELECT COALESCE(SUM(b.paidAmount), 0) FROM Bill b WHERE b.status = 'PAID'")
    Double totalPaidAmount();

    @Query("SELECT COALESCE(SUM(b.paidAmount), 0) FROM Bill b WHERE b.cityId = :cityId AND b.status = 'PAID'")
    Double totalPaidAmountByCityId(@Param("cityId") Integer cityId);

    @Query("SELECT COALESCE(SUM(b.amountDue), 0) FROM Bill b WHERE b.status = 'PENDING'")
    Double totalPendingAmount();

    @Query("SELECT b FROM Bill b WHERE b.customerId LIKE %:search% OR b.customerName LIKE %:search% OR b.billId LIKE %:search%")
    List<Bill> searchBills(@Param("search") String search);

    @Query("SELECT b FROM Bill b WHERE b.cityId = :cityId AND (b.customerId LIKE %:search% OR b.customerName LIKE %:search% OR b.billId LIKE %:search%)")
    List<Bill> searchBillsByCityId(@Param("cityId") Integer cityId, @Param("search") String search);
}
