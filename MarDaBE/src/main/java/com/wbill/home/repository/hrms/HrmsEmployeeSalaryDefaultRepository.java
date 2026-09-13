package com.wbill.home.repository.hrms;

import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import com.wbill.home.model.hrms.HrmsEmployeeSalaryDefault;

@Repository
public interface HrmsEmployeeSalaryDefaultRepository extends JpaRepository<HrmsEmployeeSalaryDefault, Integer> {
    List<HrmsEmployeeSalaryDefault> findByEmployeeIdAndDeletedFalse(int employeeId);
}
