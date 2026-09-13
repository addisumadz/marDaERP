package com.wbill.home.repository;

import com.wbill.home.model.InvGoodsReceivedNote;
import com.wbill.home.model.InvGoodsReceivedNote.GRNStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import java.util.List;

public interface InvGoodsReceivedNoteRepository extends JpaRepository<InvGoodsReceivedNote, Long> {
    Page<InvGoodsReceivedNote> findByStatusOrderByCreatedAtDesc(GRNStatus status, Pageable pageable);
    Page<InvGoodsReceivedNote> findByStoreIdOrderByCreatedAtDesc(int storeId, Pageable pageable);
    Page<InvGoodsReceivedNote> findAllByOrderByCreatedAtDesc(Pageable pageable);
    List<InvGoodsReceivedNote> findByPurchaseOrderId(long purchaseOrderId);

    @Query("SELECT MAX(CAST(SUBSTRING(g.grnNumber, 10) AS long)) FROM InvGoodsReceivedNote g WHERE g.grnNumber LIKE CONCAT(:prefix, '%')")
    Long findMaxSequence(String prefix);
}
