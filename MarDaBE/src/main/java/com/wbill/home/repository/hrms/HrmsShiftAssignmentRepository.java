package com.wbill.home.repository.hrms;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import com.wbill.home.model.hrms.HrmsShiftAssignment;

@Repository
public interface HrmsShiftAssignmentRepository extends JpaRepository<HrmsShiftAssignment, Integer> {
    List<HrmsShiftAssignment> findByAssignedDate(LocalDate assignedDate);
    Optional<HrmsShiftAssignment> findByEmployeeIdAndAssignedDate(int employeeId, LocalDate assignedDate);
    List<HrmsShiftAssignment> findByEmployeeIdAndAssignedDateBetween(int employeeId, LocalDate start, LocalDate end);
}
