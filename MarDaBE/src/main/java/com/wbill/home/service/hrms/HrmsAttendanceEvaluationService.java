package com.wbill.home.service.hrms;

import java.time.Duration;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.List;
import java.util.Optional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import com.wbill.home.model.hrms.HrmsAttendanceRawLog;
import com.wbill.home.model.hrms.HrmsAttendanceRecord;
import com.wbill.home.model.hrms.HrmsEmployee;
import com.wbill.home.model.hrms.HrmsShiftAssignment;
import com.wbill.home.model.hrms.HrmsShiftSchedule;
import com.wbill.home.repository.hrms.HrmsAttendanceRawLogRepository;
import com.wbill.home.repository.hrms.HrmsAttendanceRecordRepository;
import com.wbill.home.repository.hrms.HrmsEmployeeRepository;
import com.wbill.home.repository.hrms.HrmsShiftAssignmentRepository;

/**
 * Evaluates shift punches, tardiness, and overtime categories under
 * Ethiopian Labour Proclamation No. 1156/2019 Article 68.
 */
@Service
public class HrmsAttendanceEvaluationService {

    @Autowired
    private HrmsAttendanceRecordRepository attendanceRecordRepository;

    @Autowired
    private HrmsAttendanceRawLogRepository rawLogRepository;

    @Autowired
    private HrmsShiftAssignmentRepository shiftAssignmentRepository;

    @Autowired
    private HrmsEmployeeRepository employeeRepository;

    public List<HrmsAttendanceRecord> getAttendanceByDate(LocalDate date) {
        return attendanceRecordRepository.findByAttendanceDate(date);
    }

    public List<HrmsAttendanceRecord> getEmployeeAttendance(int employeeId, LocalDate start, LocalDate end) {
        return attendanceRecordRepository.findByEmployeeIdAndAttendanceDateBetween(employeeId, start, end);
    }

    /**
     * Reconciles raw biometric punches into an official attendance record for a given employee and date.
     */
    @Transactional
    public HrmsAttendanceRecord reconcileDailyAttendance(int employeeId, LocalDate date) {
        HrmsEmployee employee = employeeRepository.findById(employeeId)
                .orElseThrow(() -> new IllegalArgumentException("Employee not found: " + employeeId));

        LocalDateTime startOfDay = date.atStartOfDay();
        LocalDateTime endOfDay = date.atTime(23, 59, 59);

        // Fetch all raw punches for this employee on this date
        List<HrmsAttendanceRawLog> logs = rawLogRepository
                .findByBiometricPinAndPunchTimeLocalBetween(employee.getBiometricPin(), startOfDay, endOfDay);

        Optional<HrmsAttendanceRecord> existing = attendanceRecordRepository
                .findByEmployeeIdAndAttendanceDate(employeeId, date);

        HrmsAttendanceRecord record = existing.orElse(new HrmsAttendanceRecord());
        record.setEmployee(employee);
        record.setAttendanceDate(date);

        if (logs.isEmpty()) {
            record.setStatus("ABSENT");
            record.setRegularHours(0);
            return attendanceRecordRepository.save(record);
        }

        // Earliest punch as check-in, latest punch as check-out
        LocalDateTime checkIn = logs.get(0).getPunchTimeLocal();
        LocalDateTime checkOut = logs.get(logs.size() - 1).getPunchTimeLocal();

        record.setCheckInTime(checkIn);
        record.setCheckOutTime(checkOut);
        record.setStatus("PRESENT");

        // Shift schedule assignment
        Optional<HrmsShiftAssignment> assignmentOpt = shiftAssignmentRepository
                .findByEmployeeIdAndAssignedDate(employeeId, date);

        HrmsShiftSchedule shift = assignmentOpt.map(HrmsShiftAssignment::getShiftSchedule).orElse(null);
        record.setShiftSchedule(shift);

        double totalHours = 0.0;
        if (checkOut.isAfter(checkIn)) {
            totalHours = Duration.between(checkIn, checkOut).toMinutes() / 60.0;
        }

        // Standard 8 hours regular work limit
        double standardHours = shift != null ? shift.getTotalHours() : 8.0;
        double regularHours = Math.min(standardHours, totalHours);
        double extraHours = Math.max(0.0, totalHours - standardHours);

        record.setRegularHours(regularHours);

        // Late arrival check
        if (shift != null) {
            LocalTime scheduledStart = shift.getStartTime();
            LocalTime actualStart = checkIn.toLocalTime();
            int gracePeriod = shift.getGracePeriodMinutes();

            if (actualStart.isAfter(scheduledStart.plusMinutes(gracePeriod))) {
                long lateMinutes = Duration.between(scheduledStart, actualStart).toMinutes();
                record.setLateMinutes((int) lateMinutes);
            }
        }

        // Overtime classification under Ethiopian Labour Proclamation 1156/2019:
        // 1. Check if weekend (Sunday) -> 2.0x
        // 2. Check if night hours (22:00 to 06:00) -> 1.75x
        // 3. Otherwise daytime overtime -> 1.5x
        boolean isWeekend = date.getDayOfWeek().getValue() == 7; // Sunday

        if (isWeekend) {
            record.setOvertimeWeekendHours(totalHours); // Entire work on rest day is 2.0x OT
            record.setOvertimeDayHours(0);
            record.setOvertimeNightHours(0);
        } else if (extraHours > 0) {
            if (shift != null && shift.isNightShift()) {
                record.setOvertimeNightHours(extraHours); // 1.75x
                record.setOvertimeDayHours(0);
            } else {
                record.setOvertimeDayHours(extraHours); // 1.5x
                record.setOvertimeNightHours(0);
            }
        }

        return attendanceRecordRepository.save(record);
    }

    @Transactional
    public HrmsAttendanceRecord approveOvertime(long recordId, int approvedByUserId) {
        HrmsAttendanceRecord record = attendanceRecordRepository.findById(recordId)
                .orElseThrow(() -> new IllegalArgumentException("Attendance record not found: " + recordId));

        record.setOvertimeApproved(true);
        record.setApprovedBy(approvedByUserId);

        return attendanceRecordRepository.save(record);
    }
}
