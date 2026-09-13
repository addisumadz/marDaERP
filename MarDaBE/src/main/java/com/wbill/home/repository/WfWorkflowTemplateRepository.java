package com.wbill.home.repository;

import com.wbill.home.model.WfWorkflowTemplate;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

public interface WfWorkflowTemplateRepository extends JpaRepository<WfWorkflowTemplate, Integer> {
    Optional<WfWorkflowTemplate> findByTemplateCode(String templateCode);
    List<WfWorkflowTemplate> findByDocumentTypeAndIsActiveTrue(String documentType);
    List<WfWorkflowTemplate> findByIsActiveTrue();
}
