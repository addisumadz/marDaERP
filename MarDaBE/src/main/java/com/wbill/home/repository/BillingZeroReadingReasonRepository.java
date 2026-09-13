package com.wbill.home.repository;

import com.wbill.home.model.BillingZeroReadingReason;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

/**
 * Repository for the BillingZeroReadingReason entity.
 */
@Repository
public interface BillingZeroReadingReasonRepository extends JpaRepository<BillingZeroReadingReason, Integer> {

    /**
     * Finds a zero reading reason by its name and returns it as a projection
     * containing the ID and the reason name.
     *
     * @param reasonName The name of the reason to search for.
     * @return An Optional containing the ZeroReadingReasonProjection if found, otherwise empty.
     */
    Optional<BillingZeroReadingReason> findByReasonName(String reasonName);
    Optional<BillingZeroReadingReason> findByReasonCode(String reasonCode);
    
    Optional<BillingZeroReadingReason> findByIsKotariKirayTrue();
    
    Optional<BillingZeroReadingReason> findFirstByIsKotariKirayTrue();

    // Custom queries following the MeterSize pattern

    @Query("SELECT r FROM BillingZeroReadingReason r WHERE r.deleted = 'active' ORDER BY r.reasonName ASC")
    List<BillingZeroReadingReason> findAllActive();

    @Query("SELECT r FROM BillingZeroReadingReason r WHERE r.deleted = :status ORDER BY r.reasonName ASC")
    Page<BillingZeroReadingReason> findByDeletedWithPagination(@Param("status") String status, Pageable pageable);

    @Query("SELECT r FROM BillingZeroReadingReason r ORDER BY r.reasonName ASC")
    List<BillingZeroReadingReason> findAllReasons();

    boolean existsByReasonCode(String reasonCode);

    boolean existsByReasonName(String reasonName);

    @Query("SELECT COUNT(r) FROM BillingZeroReadingReason r WHERE r.deleted = 'active'")
    long countActive();

    @Query("SELECT COUNT(r) FROM BillingZeroReadingReason r WHERE r.deleted = 'deleted'")
    long countDeleted();

}