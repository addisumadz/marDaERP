package com.wbill.home.repository.hrms;

import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import com.wbill.home.model.hrms.HrmsLeaveType;

@Repository
public interface HrmsLeaveTypeRepository extends JpaRepository<HrmsLeaveType, Integer> {
    Optional<HrmsLeaveType> findByTypeCode(String typeCode);
    List<HrmsLeaveType> findByActiveTrueOrderByIdAsc();
}
