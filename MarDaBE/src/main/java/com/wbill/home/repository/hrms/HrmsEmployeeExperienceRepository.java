package com.wbill.home.repository.hrms;

import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import com.wbill.home.model.hrms.HrmsEmployeeExperience;

@Repository
public interface HrmsEmployeeExperienceRepository extends JpaRepository<HrmsEmployeeExperience, Integer> {
    List<HrmsEmployeeExperience> findByEmployee_IdAndDeletedFalseOrderByEmployeedFromDesc(int employeeId);
}
