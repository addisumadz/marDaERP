package com.wbill.home.repository;

import com.wbill.home.model.InvDisposal;
import com.wbill.home.model.InvDisposal.DisposalStatus;
import com.wbill.home.model.InvDisposal.DisposalType;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

public interface InvDisposalRepository extends JpaRepository<InvDisposal, Long> {
    Page<InvDisposal> findAllByOrderByCreatedAtDesc(Pageable pageable);
    Page<InvDisposal> findByStatusOrderByCreatedAtDesc(DisposalStatus status, Pageable pageable);
    Page<InvDisposal> findByDisposalTypeOrderByCreatedAtDesc(DisposalType disposalType, Pageable pageable);
    Page<InvDisposal> findByStoreIdOrderByCreatedAtDesc(int storeId, Pageable pageable);
    Page<InvDisposal> findByStoreIdAndStatusOrderByCreatedAtDesc(int storeId, DisposalStatus status, Pageable pageable);
    Page<InvDisposal> findByBranchIdOrderByCreatedAtDesc(int branchId, Pageable pageable);

    @Query("SELECT MAX(CAST(SUBSTRING(d.disposalNumber, 5) AS long)) FROM InvDisposal d WHERE d.disposalNumber LIKE CONCAT(:prefix, '%')")
    Long findMaxSequence(String prefix);
}
