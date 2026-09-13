package com.wbill.home.repository.hrms;

import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import com.wbill.home.model.hrms.HrmsLeaveRequest;

@Repository
public interface HrmsLeaveRequestRepository extends JpaRepository<HrmsLeaveRequest, Integer> {
    List<HrmsLeaveRequest> findByEmployeeIdAndDeletedFalseOrderByLeaveStartDesc(int employeeId);
    List<HrmsLeaveRequest> findByApprovalStatusAndDeletedFalseOrderByLeaveStartDesc(String approvalStatus);
    List<HrmsLeaveRequest> findByDeletedFalseOrderByLeaveStartDesc();
}
