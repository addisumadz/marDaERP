package com.wbill.home.repository;

import com.wbill.home.model.InvPurchaseOrder;
import com.wbill.home.model.InvPurchaseOrder.POStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

public interface InvPurchaseOrderRepository extends JpaRepository<InvPurchaseOrder, Long> {
    Page<InvPurchaseOrder> findByStatusOrderByCreatedAtDesc(POStatus status, Pageable pageable);
    Page<InvPurchaseOrder> findBySupplierIdOrderByCreatedAtDesc(int supplierId, Pageable pageable);
    Page<InvPurchaseOrder> findByStoreIdOrderByCreatedAtDesc(int storeId, Pageable pageable);
    Page<InvPurchaseOrder> findByStoreIdAndStatusOrderByCreatedAtDesc(int storeId, POStatus status, Pageable pageable);
    Page<InvPurchaseOrder> findAllByOrderByCreatedAtDesc(Pageable pageable);

    java.util.List<InvPurchaseOrder> findByStatusInOrderByCreatedAtDesc(java.util.Collection<POStatus> statuses);

    @Query("SELECT MAX(CAST(SUBSTRING(p.poNumber, 9) AS long)) FROM InvPurchaseOrder p WHERE p.poNumber LIKE CONCAT(:prefix, '%')")
    Long findMaxSequence(String prefix);
}
