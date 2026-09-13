package com.wbill.home.repository.hrms;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import com.wbill.home.model.hrms.HrmsAttendanceRecord;

@Repository
public interface HrmsAttendanceRecordRepository extends JpaRepository<HrmsAttendanceRecord, Long> {
    Optional<HrmsAttendanceRecord> findByEmployeeIdAndAttendanceDate(int employeeId, LocalDate attendanceDate);
    List<HrmsAttendanceRecord> findByEmployeeIdAndAttendanceDateBetween(int employeeId, LocalDate startDate, LocalDate endDate);
    List<HrmsAttendanceRecord> findByAttendanceDate(LocalDate attendanceDate);
}
