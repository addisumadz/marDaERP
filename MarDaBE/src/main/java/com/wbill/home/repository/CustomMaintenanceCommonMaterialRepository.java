package com.wbill.home.repository;

import com.wbill.home.model.CustomMaintenanceCommonMaterial;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface CustomMaintenanceCommonMaterialRepository extends JpaRepository<CustomMaintenanceCommonMaterial, Long> {
    List<CustomMaintenanceCommonMaterial> findByIsActiveTrueOrderByDisplayOrderAsc();
    List<CustomMaintenanceCommonMaterial> findByMaintenanceTypeIdAndIsActiveTrueOrderByDisplayOrderAsc(Long maintenanceTypeId);
    Optional<CustomMaintenanceCommonMaterial> findByMaterialCode(String materialCode);
}
