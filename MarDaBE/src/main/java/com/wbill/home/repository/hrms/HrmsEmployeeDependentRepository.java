package com.wbill.home.repository.hrms;

import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import com.wbill.home.model.hrms.HrmsEmployeeDependent;

@Repository
public interface HrmsEmployeeDependentRepository extends JpaRepository<HrmsEmployeeDependent, Integer> {
    List<HrmsEmployeeDependent> findByEmployee_IdAndDeletedFalse(int employeeId);
}
