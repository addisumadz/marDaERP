package com.wbill.home.repository;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.wbill.home.model.BillingCustomerType;
import com.wbill.home.model.BillingPenaltyTarif;

import java.util.List;

@Repository
public interface BillingPenaltyTarifRepository extends JpaRepository<BillingPenaltyTarif, Integer> {
    
    @Query("SELECT pt FROM BillingPenaltyTarif pt WHERE pt.deleted = 'active' ORDER BY pt.numberOfMonth ASC")
    List<BillingPenaltyTarif> findAllActive();
    
    @Query("SELECT pt FROM BillingPenaltyTarif pt WHERE pt.deleted = :status ORDER BY pt.numberOfMonth ASC")
    Page<BillingPenaltyTarif> findByDeletedWithPagination(@Param("status") String status, Pageable pageable);
    
    @Query("SELECT pt FROM BillingPenaltyTarif pt ORDER BY pt.numberOfMonth ASC")
    List<BillingPenaltyTarif> findAllPenaltyTarifs();
    
    // Fetches active penalty tariffs for a customer type, ordered by the number of months
    @Query("SELECT b FROM BillingPenaltyTarif b WHERE b.billingCustomerType = :customerType AND b.deleted = 'active' ORDER BY b.numberOfMonth ASC")
    List<BillingPenaltyTarif> findByBillingCustomerTypeOrderByNumberOfMonthAsc(@Param("customerType") BillingCustomerType customerType);
    
    @Query("SELECT pt FROM BillingPenaltyTarif pt WHERE pt.billingCustomerType.id = :customerTypeId AND pt.numberOfMonth = :numberOfMonth")
    BillingPenaltyTarif findByCustomerTypeIdAndNumberOfMonth(@Param("customerTypeId") Integer customerTypeId, @Param("numberOfMonth") Integer numberOfMonth);
    
    @Query("SELECT pt FROM BillingPenaltyTarif pt WHERE pt.billingCustomerType.id = :customerTypeId AND pt.numberOfMonth = :numberOfMonth AND pt.id != :id")
    BillingPenaltyTarif findByCustomerTypeIdAndNumberOfMonthAndNotId(@Param("customerTypeId") Integer customerTypeId, @Param("numberOfMonth") Integer numberOfMonth, @Param("id") Integer id);
    
    List<BillingPenaltyTarif> findByDeleted(String deleted);
    
    boolean existsByBillingCustomerTypeIdAndNumberOfMonth(Integer customerTypeId, Integer numberOfMonth);
    
    @Query("SELECT COUNT(pt) FROM BillingPenaltyTarif pt WHERE pt.deleted = 'active'")
    long countActive();
    
    @Query("SELECT COUNT(pt) FROM BillingPenaltyTarif pt WHERE pt.deleted = 'deleted'")
    long countDeleted();
}