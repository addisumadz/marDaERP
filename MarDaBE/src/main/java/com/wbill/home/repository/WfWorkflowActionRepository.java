package com.wbill.home.repository;

import com.wbill.home.model.WfWorkflowAction;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface WfWorkflowActionRepository extends JpaRepository<WfWorkflowAction, Long> {
    List<WfWorkflowAction> findByInstanceIdOrderByActedAtAsc(long instanceId);
}
