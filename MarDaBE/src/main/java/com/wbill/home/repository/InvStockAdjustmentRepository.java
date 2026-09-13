package com.wbill.home.repository;

import com.wbill.home.model.InvStockAdjustment;
import com.wbill.home.model.InvStockAdjustment.AdjustmentStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

public interface InvStockAdjustmentRepository extends JpaRepository<InvStockAdjustment, Long> {
    Page<InvStockAdjustment> findByStatusOrderByCreatedAtDesc(AdjustmentStatus status, Pageable pageable);
    Page<InvStockAdjustment> findByStoreIdOrderByCreatedAtDesc(int storeId, Pageable pageable);
    Page<InvStockAdjustment> findByStoreIdAndStatusOrderByCreatedAtDesc(int storeId, AdjustmentStatus status, Pageable pageable);
    Page<InvStockAdjustment> findAllByOrderByCreatedAtDesc(Pageable pageable);

    @Query("SELECT MAX(CAST(SUBSTRING(a.adjustmentNumber, 10) AS long)) FROM InvStockAdjustment a WHERE a.adjustmentNumber LIKE CONCAT(:prefix, '%')")
    Long findMaxSequence(String prefix);
}
