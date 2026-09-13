package com.wbill.home.repository;
import java.util.List;
import java.util.Optional;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.wbill.home.model.BillingCustomerType;
import com.wbill.home.model.BillingMeterRent;
import com.wbill.home.model.BillingMeterSize;
@Repository
public interface BillingMeterRentRepository extends JpaRepository<BillingMeterRent, Integer> {
    // Basic queries
    @Query("SELECT mr FROM BillingMeterRent mr WHERE mr.status = 'active' ORDER BY mr.rentBirr ASC")
    List<BillingMeterRent> findAllActive();
    
    @Query("SELECT mr FROM BillingMeterRent mr ORDER BY mr.rentBirr ASC")
    List<BillingMeterRent> findAllMeterRents();
    
    // Find meter rent by customer type and meter size
    Optional<BillingMeterRent> findByBillingCustomerTypeAndBillingMeterSize(
            BillingCustomerType customerType, BillingMeterSize meterSize);
    
    @Query("SELECT mr FROM BillingMeterRent mr " +
           "WHERE mr.billingCustomerType = :customerType " +
           "AND mr.billingMeterSize = :meterSize " +
           "AND mr.status = 'active'")
    Optional<BillingMeterRent> findActiveByCustomerTypeAndMeterSize(
            @Param("customerType") BillingCustomerType customerType,
            @Param("meterSize") BillingMeterSize meterSize);
    
    // Ensures only one row is returned when multiple active entries exist
    Optional<BillingMeterRent> findFirstByBillingCustomerTypeAndBillingMeterSizeAndStatusOrderByIdDesc(
            BillingCustomerType customerType,
            BillingMeterSize meterSize,
            String status);
    
    List<BillingMeterRent> findByStatus(String status);
    
    // Paginated queries
    Page<BillingMeterRent> findByStatus(String status, Pageable pageable);
    
    @Query("SELECT mr FROM BillingMeterRent mr WHERE mr.status = 'active' ORDER BY mr.rentBirr ASC")
    Page<BillingMeterRent> findAllActiveWithPagination(Pageable pageable);
    
    @Query("SELECT mr FROM BillingMeterRent mr WHERE mr.status = 'deleted' ORDER BY mr.rentBirr ASC")
    Page<BillingMeterRent> findAllDeleted(Pageable pageable);
    
    // Existence checks
    boolean existsByBillingCustomerTypeAndBillingMeterSizeAndIdNot(
            BillingCustomerType customerType, BillingMeterSize meterSize, Integer id);
    
    boolean existsByBillingCustomerTypeAndBillingMeterSize(
            BillingCustomerType customerType, BillingMeterSize meterSize);
    
    // Statistics queries
    @Query("SELECT COUNT(mr) FROM BillingMeterRent mr WHERE mr.status = 'active'")
    Long countActiveMeterRents();
    
    @Query("SELECT COUNT(mr) FROM BillingMeterRent mr WHERE mr.status = 'deleted'")
    Long countDeletedMeterRents();
}
