package com.wbill.home.repository;

import com.wbill.home.model.CustomMaintenanceItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface CustomMaintenanceItemRepository extends JpaRepository<CustomMaintenanceItem, Long> {
    List<CustomMaintenanceItem> findByRequestIdOrderByIdAsc(Long requestId);
    void deleteByRequestId(Long requestId);
}
