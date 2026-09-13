package com.wbill.home.repository;

import com.wbill.home.model.InvStockTransfer;
import com.wbill.home.model.InvStockTransfer.TransferStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

public interface InvStockTransferRepository extends JpaRepository<InvStockTransfer, Long> {
    Page<InvStockTransfer> findByStatusOrderByCreatedAtDesc(TransferStatus status, Pageable pageable);
    Page<InvStockTransfer> findByFromStoreIdOrderByCreatedAtDesc(int fromStoreId, Pageable pageable);
    Page<InvStockTransfer> findByToStoreIdOrderByCreatedAtDesc(int toStoreId, Pageable pageable);
    Page<InvStockTransfer> findAllByOrderByCreatedAtDesc(Pageable pageable);

    @Query("SELECT MAX(CAST(SUBSTRING(t.transferNumber, 10) AS long)) FROM InvStockTransfer t WHERE t.transferNumber LIKE CONCAT(:prefix, '%')")
    Long findMaxSequence(String prefix);
}
