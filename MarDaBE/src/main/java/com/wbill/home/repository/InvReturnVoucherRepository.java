package com.wbill.home.repository;

import com.wbill.home.model.InvReturnVoucher;
import com.wbill.home.model.InvReturnVoucher.ReturnStatus;
import com.wbill.home.model.InvReturnVoucher.ReturnType;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

public interface InvReturnVoucherRepository extends JpaRepository<InvReturnVoucher, Long> {
    Page<InvReturnVoucher> findAllByOrderByCreatedAtDesc(Pageable pageable);
    Page<InvReturnVoucher> findByStatusOrderByCreatedAtDesc(ReturnStatus status, Pageable pageable);
    Page<InvReturnVoucher> findByReturnTypeOrderByCreatedAtDesc(ReturnType returnType, Pageable pageable);
    Page<InvReturnVoucher> findByStoreIdOrderByCreatedAtDesc(int storeId, Pageable pageable);
    Page<InvReturnVoucher> findByStoreIdAndStatusOrderByCreatedAtDesc(int storeId, ReturnStatus status, Pageable pageable);
    Page<InvReturnVoucher> findByStoreIdAndReturnTypeOrderByCreatedAtDesc(int storeId, ReturnType returnType, Pageable pageable);
    Page<InvReturnVoucher> findByBranchIdOrderByCreatedAtDesc(int branchId, Pageable pageable);
    Page<InvReturnVoucher> findByOriginalIssueVoucherIdOrderByCreatedAtDesc(long issueVoucherId, Pageable pageable);

    @Query("SELECT MAX(CAST(SUBSTRING(v.voucherNumber, 5) AS long)) FROM InvReturnVoucher v WHERE v.voucherNumber LIKE CONCAT(:prefix, '%')")
    Long findMaxSequence(String prefix);
}
