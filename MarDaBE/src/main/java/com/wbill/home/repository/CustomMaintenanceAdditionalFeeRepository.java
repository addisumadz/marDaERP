package com.wbill.home.repository;

import com.wbill.home.model.CustomMaintenanceAdditionalFee;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface CustomMaintenanceAdditionalFeeRepository extends JpaRepository<CustomMaintenanceAdditionalFee, Long> {
    List<CustomMaintenanceAdditionalFee> findByRequestIdOrderByIdAsc(Long requestId);
    void deleteByRequestId(Long requestId);
}
