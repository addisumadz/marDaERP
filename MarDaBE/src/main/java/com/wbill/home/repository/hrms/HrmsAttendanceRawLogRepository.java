package com.wbill.home.repository.hrms;

import java.time.LocalDateTime;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import com.wbill.home.model.hrms.HrmsAttendanceRawLog;

@Repository
public interface HrmsAttendanceRawLogRepository extends JpaRepository<HrmsAttendanceRawLog, Long> {
    List<HrmsAttendanceRawLog> findByProcessedFalseOrderByPunchTimeLocalAsc();
    List<HrmsAttendanceRawLog> findByBiometricPinAndPunchTimeLocalBetween(String biometricPin, LocalDateTime start, LocalDateTime end);
}
