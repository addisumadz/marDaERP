package com.wbill.home.repository.hrms;

import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import com.wbill.home.model.hrms.HrmsDepartment;

@Repository
public interface HrmsDepartmentRepository extends JpaRepository<HrmsDepartment, Integer> {
    List<HrmsDepartment> findByActiveTrueOrderByDepartmentNameAsc();
}
