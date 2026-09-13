package com.wbill.home.repository.hrms;

import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import com.wbill.home.model.hrms.HrmsPosition;

@Repository
public interface HrmsPositionRepository extends JpaRepository<HrmsPosition, Integer> {
    List<HrmsPosition> findByActiveTrueOrderByPositionTitleAsc();
    List<HrmsPosition> findByDepartmentIdAndActiveTrue(int departmentId);
}
