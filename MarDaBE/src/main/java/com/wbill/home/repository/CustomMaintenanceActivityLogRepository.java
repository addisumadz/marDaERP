package com.wbill.home.repository;

import com.wbill.home.model.CustomMaintenanceActivityLog;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface CustomMaintenanceActivityLogRepository extends JpaRepository<CustomMaintenanceActivityLog, Long> {
    List<CustomMaintenanceActivityLog> findByRequestIdOrderByCreatedAtDesc(Long requestId);
}
