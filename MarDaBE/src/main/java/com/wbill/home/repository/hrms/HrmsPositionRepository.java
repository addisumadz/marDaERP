package com.wbill.home.repository.hrms;

import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import com.wbill.home.model.hrms.HrmsPosition;

@Repository
public interface HrmsPositionRepository extends JpaRepository<HrmsPosition, Integer> {
    List<HrmsPosition> findByActiveTrueOrderByPositionTitleAsc();

    @Query("SELECT p FROM HrmsPosition p WHERE p.department.id = :departmentId AND p.active = true")
    List<HrmsPosition> findByDepartmentIdAndActiveTrue(@Param("departmentId") int departmentId);
}
