package com.wbill.home.repository;

import com.wbill.home.model.FncBillingAccountMap;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface FncBillingAccountMapRepository extends JpaRepository<FncBillingAccountMap, Integer> {
    Optional<FncBillingAccountMap> findByMappingKey(String mappingKey);
}
