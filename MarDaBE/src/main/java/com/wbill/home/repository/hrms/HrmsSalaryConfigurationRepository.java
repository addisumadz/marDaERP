package com.wbill.home.repository.hrms;

import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import com.wbill.home.model.hrms.HrmsSalaryConfiguration;

@Repository
public interface HrmsSalaryConfigurationRepository extends JpaRepository<HrmsSalaryConfiguration, Integer> {
    List<HrmsSalaryConfiguration> findByDeletedFalseOrderByWeightAsc();
    Optional<HrmsSalaryConfiguration> findByConfigCodeAndDeletedFalse(String configCode);
}
