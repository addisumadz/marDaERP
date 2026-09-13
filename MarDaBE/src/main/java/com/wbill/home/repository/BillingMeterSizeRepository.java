package com.wbill.home.repository;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.wbill.home.model.BillingMeterSize;

import java.util.List;

@Repository
public interface BillingMeterSizeRepository extends JpaRepository<BillingMeterSize, Integer> {
    
    @Query("SELECT ms FROM BillingMeterSize ms WHERE ms.deleted = 'active' ORDER BY ms.meterSize ASC")
    List<BillingMeterSize> findAllActive();
    
    @Query("SELECT ms FROM BillingMeterSize ms WHERE ms.deleted = :status ORDER BY ms.meterSize ASC")
    Page<BillingMeterSize> findByDeletedWithPagination(@Param("status") String status, Pageable pageable);
    
    @Query("SELECT ms FROM BillingMeterSize ms ORDER BY ms.meterSize ASC")
    List<BillingMeterSize> findAllMeterSizes();
    
    BillingMeterSize findByMeterCode(String meterCode);
    
    @Query("SELECT ms FROM BillingMeterSize ms WHERE ms.meterCode = :meterCode AND ms.id != :id")
    BillingMeterSize findByMeterCodeAndNotId(@Param("meterCode") String meterCode, @Param("id") Integer id);
    
    @Query("SELECT ms FROM BillingMeterSize ms WHERE ms.meterSize = :meterSize AND ms.meterCode = :meterCode")
    BillingMeterSize findByMeterSizeAndMeterCode(@Param("meterSize") Double meterSize, @Param("meterCode") String meterCode);
    
    @Query("SELECT ms FROM BillingMeterSize ms WHERE ms.meterSize = :meterSize AND ms.meterCode = :meterCode AND ms.id != :id")
    BillingMeterSize findByMeterSizeAndMeterCodeAndNotId(@Param("meterSize") Double meterSize, @Param("meterCode") String meterCode, @Param("id") Integer id);
    
    List<BillingMeterSize> findByMeterSize(double meterSize);
    
    List<BillingMeterSize> findByDeleted(String deleted);
    
    boolean existsByMeterCode(String meterCode);
    
    boolean existsByMeterSizeAndMeterCode(Double meterSize, String meterCode);
    
    @Query("SELECT COUNT(ms) FROM BillingMeterSize ms WHERE ms.deleted = 'active'")
    long countActive();
    
    @Query("SELECT COUNT(ms) FROM BillingMeterSize ms WHERE ms.deleted = 'deleted'")
    long countDeleted();
}