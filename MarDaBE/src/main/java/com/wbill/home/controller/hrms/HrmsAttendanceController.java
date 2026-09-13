package com.wbill.home.controller.hrms;

import java.time.LocalDate;
import java.util.List;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import com.wbill.home.model.hrms.HrmsAttendanceRecord;
import com.wbill.home.model.hrms.HrmsShiftSchedule;
import com.wbill.home.repository.hrms.HrmsShiftScheduleRepository;
import com.wbill.home.service.hrms.HrmsAttendanceEvaluationService;

@RestController
@RequestMapping({"/api/card_managenment/hrms/attendance", "/api/hrms/attendance"})
@CrossOrigin(origins = "*", maxAge = 3600)
public class HrmsAttendanceController {

    @Autowired
    private HrmsAttendanceEvaluationService attendanceEvaluationService;

    @Autowired
    private HrmsShiftScheduleRepository shiftScheduleRepository;

    @GetMapping("/daily")
    public ResponseEntity<List<HrmsAttendanceRecord>> getDailyAttendance(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
        return ResponseEntity.ok(attendanceEvaluationService.getAttendanceByDate(date));
    }

    @GetMapping("/employee/{employeeId}")
    public ResponseEntity<List<HrmsAttendanceRecord>> getEmployeeAttendance(
            @PathVariable int employeeId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate start,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate end) {
        return ResponseEntity.ok(attendanceEvaluationService.getEmployeeAttendance(employeeId, start, end));
    }

    @PostMapping("/reconcile/{employeeId}")
    public ResponseEntity<HrmsAttendanceRecord> reconcileAttendance(
            @PathVariable int employeeId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
        return ResponseEntity.ok(attendanceEvaluationService.reconcileDailyAttendance(employeeId, date));
    }

    @PutMapping("/records/{id}/approve-overtime")
    public ResponseEntity<HrmsAttendanceRecord> approveOvertime(
            @PathVariable long id,
            @RequestParam(defaultValue = "1") int userId) {
        return ResponseEntity.ok(attendanceEvaluationService.approveOvertime(id, userId));
    }

    @GetMapping("/shifts")
    public ResponseEntity<List<HrmsShiftSchedule>> getShiftSchedules() {
        return ResponseEntity.ok(shiftScheduleRepository.findByActiveTrue());
    }

    @PostMapping("/shifts")
    public ResponseEntity<HrmsShiftSchedule> createShiftSchedule(@RequestBody HrmsShiftSchedule shift) {
        return ResponseEntity.ok(shiftScheduleRepository.save(shift));
    }
}
