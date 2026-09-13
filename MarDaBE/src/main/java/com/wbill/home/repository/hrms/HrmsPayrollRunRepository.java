package com.wbill.home.repository.hrms;

import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import com.wbill.home.model.hrms.HrmsPayrollRun;

@Repository
public interface HrmsPayrollRunRepository extends JpaRepository<HrmsPayrollRun, Integer> {
    Optional<HrmsPayrollRun> findByPayrollReferenceAndDeletedFalse(String payrollReference);
    Optional<HrmsPayrollRun> findBySalaryMonthNameAndSalaryYearAndDeletedFalse(String salaryMonthName, int salaryYear);
    List<HrmsPayrollRun> findByDeletedFalseOrderBySalaryMonthDateDesc();
}
