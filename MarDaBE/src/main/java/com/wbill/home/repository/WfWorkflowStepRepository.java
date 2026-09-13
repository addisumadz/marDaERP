package com.wbill.home.repository;

import com.wbill.home.model.WfWorkflowStep;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface WfWorkflowStepRepository extends JpaRepository<WfWorkflowStep, Integer> {
    List<WfWorkflowStep> findByTemplateIdOrderByStepOrderAsc(int templateId);
}
