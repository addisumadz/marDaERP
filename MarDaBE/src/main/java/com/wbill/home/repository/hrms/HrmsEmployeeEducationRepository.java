package com.wbill.home.repository.hrms;

import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import com.wbill.home.model.hrms.HrmsEmployeeEducation;

@Repository
public interface HrmsEmployeeEducationRepository extends JpaRepository<HrmsEmployeeEducation, Integer> {
    List<HrmsEmployeeEducation> findByEmployee_IdAndDeletedFalseOrderByGraduationYearEcDesc(int employeeId);
}
