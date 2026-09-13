package com.wbill.home.repository;

import com.wbill.home.model.CustomAdditionalFeeType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface CustomAdditionalFeeTypeRepository extends JpaRepository<CustomAdditionalFeeType, Integer> {
    List<CustomAdditionalFeeType> findByIsActiveTrue();
    Optional<CustomAdditionalFeeType> findByFeeCode(String feeCode);
}
