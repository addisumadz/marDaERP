package com.wbill.home.repository.hrms;

import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import com.wbill.home.model.hrms.HrmsEmployee;

@Repository
public interface HrmsEmployeeRepository extends JpaRepository<HrmsEmployee, Integer> {
    Optional<HrmsEmployee> findByEmployeeIdAndDeletedFalse(String employeeId);
    Optional<HrmsEmployee> findByBiometricPinAndDeletedFalse(String biometricPin);
    List<HrmsEmployee> findByDeletedFalseOrderByFullNameAsc();
    List<HrmsEmployee> findByDepartmentIdAndDeletedFalse(int departmentId);
    List<HrmsEmployee> findByEmploymentStatusAndDeletedFalse(String employmentStatus);

    @Query("SELECT e FROM HrmsEmployee e WHERE e.deleted = false AND " +
           "(LOWER(e.fullName) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
           "LOWER(e.employeeId) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
           "e.fullNameAm LIKE CONCAT('%', :search, '%'))")
    List<HrmsEmployee> searchEmployees(@Param("search") String search);
}
