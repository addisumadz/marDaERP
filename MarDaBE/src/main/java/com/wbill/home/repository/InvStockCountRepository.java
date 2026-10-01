package com.wbill.home.repository;

import com.wbill.home.model.InvStockCount;
import com.wbill.home.model.InvStockCount.CountStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

public interface InvStockCountRepository extends JpaRepository<InvStockCount, Long> {
    Page<InvStockCount> findAllByOrderByCreatedAtDesc(Pageable pageable);
    Page<InvStockCount> findByStatusOrderByCreatedAtDesc(CountStatus status, Pageable pageable);
    Page<InvStockCount> findByStoreIdOrderByCreatedAtDesc(int storeId, Pageable pageable);
    Page<InvStockCount> findByStoreIdAndStatusOrderByCreatedAtDesc(int storeId, CountStatus status, Pageable pageable);
    Page<InvStockCount> findByBranchIdOrderByCreatedAtDesc(int branchId, Pageable pageable);

    @Query("SELECT MAX(CAST(SUBSTRING(c.countNumber, 5) AS long)) FROM InvStockCount c WHERE c.countNumber LIKE CONCAT(:prefix, '%')")
    Long findMaxSequence(String prefix);
}
