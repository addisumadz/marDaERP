package com.wbill.home.repository;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.wbill.home.model.BillingBanks;

import java.util.List;
import java.util.Optional;

@Repository
public interface BillingBanksRepository extends JpaRepository<BillingBanks, Integer> {
    
    // Basic queries
    @Query("SELECT b FROM BillingBanks b WHERE b.deleted = 'active' ORDER BY b.bankName ASC")
    List<BillingBanks> findAllActive();
    
    @Query("SELECT b FROM BillingBanks b ORDER BY b.bankName ASC")
    List<BillingBanks> findAllBanks();
    
    Optional<BillingBanks> findByGatewayCode(String gatewayCode);
    
    Optional<BillingBanks> findByBankCode(String bankCode);
    
    List<BillingBanks> findByBankNameContainingIgnoreCase(String bankName);
    
    @Query("SELECT b FROM BillingBanks b WHERE LOWER(b.bankName) = LOWER(:name) AND b.deleted = 'active'")
    List<BillingBanks> findByExactBankName(@Param("name") String name);
    
    List<BillingBanks> findByDeleted(String deleted);
    
    // Paginated queries
    Page<BillingBanks> findByDeleted(String deleted, Pageable pageable);
    
    @Query("SELECT b FROM BillingBanks b WHERE b.deleted = 'active' ORDER BY b.bankName ASC")
    Page<BillingBanks> findAllActiveWithPagination(Pageable pageable);
    
    @Query("SELECT b FROM BillingBanks b WHERE b.deleted = 'deleted' ORDER BY b.bankName ASC")
    Page<BillingBanks> findAllDeleted(Pageable pageable);
    
    // Existence checks
    boolean existsByGatewayCodeAndIdNot(String gatewayCode, Integer id);
    
    boolean existsByGatewayCode(String gatewayCode);
    
    boolean existsByBankCodeAndIdNot(String bankCode, Integer id);
    
    boolean existsByBankCode(String bankCode);
    
    boolean existsByBankNameAndIdNot(String bankName, Integer id);
    
    boolean existsByBankName(String bankName);
    
    // Statistics queries
    @Query("SELECT COUNT(b) FROM BillingBanks b WHERE b.deleted = 'active'")
    Long countActiveBanks();
    
    @Query("SELECT COUNT(b) FROM BillingBanks b WHERE b.deleted = 'deleted'")
    Long countDeletedBanks();
}
