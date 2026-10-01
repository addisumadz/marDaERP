package com.wbill.home.repository;

import com.wbill.home.model.InvMaterialRequest;
import com.wbill.home.model.InvMaterialRequest.RequestStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;

public interface InvMaterialRequestRepository extends JpaRepository<InvMaterialRequest, Long> {
    Page<InvMaterialRequest> findAllByOrderByCreatedAtDesc(Pageable pageable);
    Page<InvMaterialRequest> findByStatusOrderByCreatedAtDesc(RequestStatus status, Pageable pageable);
    Page<InvMaterialRequest> findByStoreIdOrderByCreatedAtDesc(int storeId, Pageable pageable);
    Page<InvMaterialRequest> findByStoreIdAndStatusOrderByCreatedAtDesc(int storeId, RequestStatus status, Pageable pageable);
    Page<InvMaterialRequest> findByDepartmentIdOrderByCreatedAtDesc(int departmentId, Pageable pageable);
    Page<InvMaterialRequest> findByBranchIdOrderByCreatedAtDesc(int branchId, Pageable pageable);
    Page<InvMaterialRequest> findByBranchIdAndStatusOrderByCreatedAtDesc(int branchId, RequestStatus status, Pageable pageable);
    List<InvMaterialRequest> findByRequestedByOrderByCreatedAtDesc(String requestedBy);
    long countByStatusIn(List<RequestStatus> statuses);

    @Query("SELECT MAX(CAST(SUBSTRING(r.requestNumber, 5) AS long)) FROM InvMaterialRequest r WHERE r.requestNumber LIKE CONCAT(:prefix, '%')")
    Long findMaxSequence(String prefix);
}
