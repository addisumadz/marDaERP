package com.wbill.home.repository;

import com.wbill.home.model.WfWorkflowInstance;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.util.List;
import java.util.Optional;

public interface WfWorkflowInstanceRepository extends JpaRepository<WfWorkflowInstance, Long> {

    Optional<WfWorkflowInstance> findByDocumentTypeAndDocumentId(String documentType, long documentId);

    Page<WfWorkflowInstance> findByDocumentType(String documentType, Pageable pageable);

    Page<WfWorkflowInstance> findByStatus(String status, Pageable pageable);

    @Query("SELECT wi FROM WfWorkflowInstance wi WHERE wi.status = 'IN_PROGRESS' AND wi.currentStep.approverRoleCode = :roleCode")
    List<WfWorkflowInstance> findPendingByRole(@Param("roleCode") String roleCode);

    @Query("SELECT wi FROM WfWorkflowInstance wi WHERE wi.status = 'IN_PROGRESS' AND wi.currentStep.approverRoleCode IN :roleCodes")
    Page<WfWorkflowInstance> findPendingByRoles(@Param("roleCodes") List<String> roleCodes, Pageable pageable);

    @Query("SELECT COUNT(wi) FROM WfWorkflowInstance wi WHERE wi.status = 'IN_PROGRESS' AND wi.currentStep.approverRoleCode IN :roleCodes")
    long countPendingByRoles(@Param("roleCodes") List<String> roleCodes);
}
