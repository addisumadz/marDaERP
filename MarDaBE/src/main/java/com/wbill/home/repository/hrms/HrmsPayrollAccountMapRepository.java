package com.wbill.home.repository.hrms;

import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import com.wbill.home.model.hrms.HrmsPayrollAccountMap;

@Repository
public interface HrmsPayrollAccountMapRepository extends JpaRepository<HrmsPayrollAccountMap, Integer> {
    Optional<HrmsPayrollAccountMap> findByMappingKey(String mappingKey);
    List<HrmsPayrollAccountMap> findAllByOrderByMappingKeyAsc();
}
