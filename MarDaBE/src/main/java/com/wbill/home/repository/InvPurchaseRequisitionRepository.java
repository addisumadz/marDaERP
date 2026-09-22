package com.wbill.home.repository;

import com.wbill.home.model.InvPurchaseRequisition;
import com.wbill.home.model.InvPurchaseRequisition.PRStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface InvPurchaseRequisitionRepository extends JpaRepository<InvPurchaseRequisition, Long> {
    Page<InvPurchaseRequisition> findByStatusOrderByCreatedAtDesc(PRStatus status, Pageable pageable);
    Page<InvPurchaseRequisition> findByStoreIdOrderByCreatedAtDesc(int storeId, Pageable pageable);
    Page<InvPurchaseRequisition> findByStoreIdAndStatusOrderByCreatedAtDesc(int storeId, PRStatus status, Pageable pageable);
    Page<InvPurchaseRequisition> findByStoreIdInOrderByCreatedAtDesc(java.util.Collection<Integer> storeIds, Pageable pageable);
    Page<InvPurchaseRequisition> findByStoreIdInAndStatusOrderByCreatedAtDesc(java.util.Collection<Integer> storeIds, PRStatus status, Pageable pageable);

    @Query("SELECT r FROM InvPurchaseRequisition r WHERE r.store.branch.id = :branchId ORDER BY r.createdAt DESC")
    Page<InvPurchaseRequisition> findByBranchIdOrderByCreatedAtDesc(@Param("branchId") int branchId, Pageable pageable);

    @Query("SELECT r FROM InvPurchaseRequisition r WHERE r.store.branch.id = :branchId AND r.status = :status ORDER BY r.createdAt DESC")
    Page<InvPurchaseRequisition> findByBranchIdAndStatusOrderByCreatedAtDesc(@Param("branchId") int branchId, @Param("status") PRStatus status, Pageable pageable);

    Page<InvPurchaseRequisition> findAllByOrderByCreatedAtDesc(Pageable pageable);
    java.util.List<InvPurchaseRequisition> findByStatusInOrderByCreatedAtDesc(java.util.Collection<PRStatus> statuses);

    @Query("SELECT MAX(CAST(SUBSTRING(r.requisitionNumber, 9) AS long)) FROM InvPurchaseRequisition r WHERE r.requisitionNumber LIKE CONCAT(:prefix, '%')")
    Long findMaxSequence(String prefix);
}
