package com.wbill.home.repository.hrms;

import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import com.wbill.home.model.hrms.HrmsSalaryCalculated;

@Repository
public interface HrmsSalaryCalculatedRepository extends JpaRepository<HrmsSalaryCalculated, Integer> {
    List<HrmsSalaryCalculated> findByPayrollRunIdAndDeletedFalse(int payrollRunId);
    Optional<HrmsSalaryCalculated> findByPayrollRunIdAndEmployeeIdAndDeletedFalse(int payrollRunId, int employeeId);
}
