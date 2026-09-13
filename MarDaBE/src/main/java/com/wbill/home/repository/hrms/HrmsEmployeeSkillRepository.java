package com.wbill.home.repository.hrms;

import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import com.wbill.home.model.hrms.HrmsEmployeeSkill;

@Repository
public interface HrmsEmployeeSkillRepository extends JpaRepository<HrmsEmployeeSkill, Integer> {
    List<HrmsEmployeeSkill> findByEmployee_IdAndDeletedFalse(int employeeId);
}
