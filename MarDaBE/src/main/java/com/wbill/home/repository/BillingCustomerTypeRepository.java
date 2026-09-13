package com.wbill.home.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.wbill.home.model.BillingCustomerType;

import java.util.List;
import java.util.Optional;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

@Repository
public interface BillingCustomerTypeRepository extends JpaRepository<BillingCustomerType, Integer> {
    
	
	@Query("SELECT ct FROM BillingCustomerType ct WHERE ct.deleted = 'active' ORDER BY ct.customerType ASC")
    List<BillingCustomerType> findAllActive();
    
    @Query("SELECT ct FROM BillingCustomerType ct ORDER BY ct.customerType ASC")
    List<BillingCustomerType> findAllCustomerTypes();
    
    Optional<BillingCustomerType> findByCustomerType(String customerType);
    
    List<BillingCustomerType> findByDescriptionContainingIgnoreCase(String description);
    
    @Query("SELECT ct FROM BillingCustomerType ct WHERE LOWER(ct.customerType) = LOWER(:customerType) AND ct.deleted = 'active'")
    List<BillingCustomerType> findByExactCustomerType(@Param("customerType") String customerType);
    
    @Query("SELECT ct FROM BillingCustomerType ct WHERE LOWER(ct.description) = LOWER(:description) AND ct.deleted = 'active'")
    List<BillingCustomerType> findByExactDescription(@Param("description") String description);

    List<BillingCustomerType> findByDeleted(String deleted);
    
    // Paginated queries
    Page<BillingCustomerType> findByDeleted(String deleted, Pageable pageable);
    
    @Query("SELECT ct FROM BillingCustomerType ct WHERE ct.deleted = 'active' ORDER BY ct.customerType ASC")
    Page<BillingCustomerType> findAllActiveWithPagination(Pageable pageable);
    
    @Query("SELECT ct FROM BillingCustomerType ct WHERE ct.deleted = 'deleted' ORDER BY ct.customerType ASC")
    Page<BillingCustomerType> findAllDeleted(Pageable pageable);
    
    // Existence checks
    boolean existsByCustomerTypeAndIdNot(String customerType, Integer id);
    boolean existsByCustomerType(String customerType);
    boolean existsByDescriptionAndIdNot(String description, Integer id);
    boolean existsByDescription(String description);
    
    // Statistics queries
    @Query("SELECT COUNT(ct) FROM BillingCustomerType ct WHERE ct.deleted = 'active'")
    Long countActiveCustomerTypes();
    
    @Query("SELECT COUNT(ct) FROM BillingCustomerType ct WHERE ct.deleted = 'deleted'")
    Long countDeletedCustomerTypes();
    
    List<BillingCustomerType> findByIsOfficeTgena(boolean isOfficeTgena);
    
    List<BillingCustomerType> findByIsResidential(boolean isResidential);
    
    List<BillingCustomerType> findByIsPublicTap(boolean isPublicTap);
}