package com.wbill.home.repository;

import com.wbill.home.model.InvPurchaseRequisition;
import com.wbill.home.model.InvPurchaseRequisition.PRStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

public interface InvPurchaseRequisitionRepository extends JpaRepository<InvPurchaseRequisition, Long> {
    Page<InvPurchaseRequisition> findByStatusOrderByCreatedAtDesc(PRStatus status, Pageable pageable);
    Page<InvPurchaseRequisition> findByStoreIdOrderByCreatedAtDesc(int storeId, Pageable pageable);
    Page<InvPurchaseRequisition> findByStoreIdAndStatusOrderByCreatedAtDesc(int storeId, PRStatus status, Pageable pageable);
    Page<InvPurchaseRequisition> findAllByOrderByCreatedAtDesc(Pageable pageable);
    java.util.List<InvPurchaseRequisition> findByStatusInOrderByCreatedAtDesc(java.util.Collection<PRStatus> statuses);

    @Query("SELECT MAX(CAST(SUBSTRING(r.requisitionNumber, 9) AS long)) FROM InvPurchaseRequisition r WHERE r.requisitionNumber LIKE CONCAT(:prefix, '%')")
    Long findMaxSequence(String prefix);
}
