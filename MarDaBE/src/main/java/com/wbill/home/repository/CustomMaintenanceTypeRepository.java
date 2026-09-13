package com.wbill.home.repository;

import com.wbill.home.model.CustomMaintenanceType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface CustomMaintenanceTypeRepository extends JpaRepository<CustomMaintenanceType, Long> {
    List<CustomMaintenanceType> findByIsActiveTrueOrderByDisplayOrderAsc();
    Optional<CustomMaintenanceType> findByTypeCode(String typeCode);
}
