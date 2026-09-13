package com.wbill.home.repository;

import com.wbill.home.model.CustomCommonMaterial;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface CustomCommonMaterialRepository extends JpaRepository<CustomCommonMaterial, Long> {
    List<CustomCommonMaterial> findByIsActiveTrueOrderByDisplayOrderAsc();
    Optional<CustomCommonMaterial> findByMaterialCode(String materialCode);
}
