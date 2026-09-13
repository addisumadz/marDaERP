package com.wbill.home.repository;

import com.wbill.home.model.CustomNewLineActivityLog;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface CustomNewLineActivityLogRepository extends JpaRepository<CustomNewLineActivityLog, Long> {
    List<CustomNewLineActivityLog> findByRequestIdOrderByCreatedAtDesc(Long requestId);
}
