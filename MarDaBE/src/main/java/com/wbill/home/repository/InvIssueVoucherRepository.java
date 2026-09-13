package com.wbill.home.repository;

import com.wbill.home.model.InvIssueVoucher;
import com.wbill.home.model.InvIssueVoucher.IssueStatus;
import com.wbill.home.model.InvIssueVoucher.IssueType;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

public interface InvIssueVoucherRepository extends JpaRepository<InvIssueVoucher, Long> {
    Page<InvIssueVoucher> findByStatusOrderByCreatedAtDesc(IssueStatus status, Pageable pageable);
    Page<InvIssueVoucher> findByStoreIdOrderByCreatedAtDesc(int storeId, Pageable pageable);
    Page<InvIssueVoucher> findByStoreIdAndStatusOrderByCreatedAtDesc(int storeId, IssueStatus status, Pageable pageable);
    Page<InvIssueVoucher> findByIssueTypeOrderByCreatedAtDesc(IssueType issueType, Pageable pageable);
    Page<InvIssueVoucher> findAllByOrderByCreatedAtDesc(Pageable pageable);

    @Query("SELECT MAX(CAST(SUBSTRING(v.voucherNumber, 10) AS long)) FROM InvIssueVoucher v WHERE v.voucherNumber LIKE CONCAT(:prefix, '%')")
    Long findMaxSequence(String prefix);
}
