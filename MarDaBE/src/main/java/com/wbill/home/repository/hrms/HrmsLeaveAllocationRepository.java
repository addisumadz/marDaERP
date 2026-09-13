package com.wbill.home.repository.hrms;

import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import com.wbill.home.model.hrms.HrmsLeaveAllocation;

@Repository
public interface HrmsLeaveAllocationRepository extends JpaRepository<HrmsLeaveAllocation, Integer> {
    List<HrmsLeaveAllocation> findByEmployeeIdAndFiscalYearEc(int employeeId, int fiscalYearEc);
    Optional<HrmsLeaveAllocation> findByEmployeeIdAndLeaveTypeIdAndFiscalYearEc(int employeeId, int leaveTypeId, int fiscalYearEc);
}
