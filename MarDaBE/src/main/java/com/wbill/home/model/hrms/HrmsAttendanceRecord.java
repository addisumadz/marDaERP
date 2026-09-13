package com.wbill.home.model.hrms;

import java.io.Serializable;
import java.time.LocalDate;
import java.time.LocalDateTime;
import jakarta.persistence.*;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

@Entity
@Table(name = "hrms_attendance_records")
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class HrmsAttendanceRecord implements Serializable {
    private static final long serialVersionUID = 1L;

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "hrms_employee_info_id", nullable = false)
    @JsonIgnoreProperties({"department", "position", "branch", "hibernateLazyInitializer", "handler"})
    private HrmsEmployee employee;

    @Column(name = "attendance_date", nullable = false)
    private LocalDate attendanceDate;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "shift_schedule_id")
    private HrmsShiftSchedule shiftSchedule;

    @Column(name = "check_in_time")
    private LocalDateTime checkInTime;

    @Column(name = "check_out_time")
    private LocalDateTime checkOutTime;

    @Column(name = "regular_hours", nullable = false)
    private double regularHours = 0.0;

    @Column(name = "late_minutes", nullable = false)
    private int lateMinutes = 0;

    @Column(name = "early_minutes", nullable = false)
    private int earlyMinutes = 0;

    // Overtime breakdown under Ethiopian Labour Proclamation No. 1156/2019
    @Column(name = "overtime_day_hours", nullable = false)
    private double overtimeDayHours = 0.0; // 1.5x

    @Column(name = "overtime_night_hours", nullable = false)
    private double overtimeNightHours = 0.0; // 1.75x

    @Column(name = "overtime_weekend_hours", nullable = false)
    private double overtimeWeekendHours = 0.0; // 2.0x

    @Column(name = "overtime_holiday_hours", nullable = false)
    private double overtimeHolidayHours = 0.0; // 2.5x

    @Column(name = "status", nullable = false, length = 50)
    private String status = "PRESENT"; // PRESENT, ABSENT, ON_LEAVE, REST_DAY

    @Column(name = "is_overtime_approved", nullable = false)
    private boolean overtimeApproved = false;

    @Column(name = "approved_by")
    private Integer approvedBy;

    @Column(name = "remarks", length = 255)
    private String remarks;

    public HrmsAttendanceRecord() {}

    // Getters and Setters
    public long getId() { return id; }
    public void setId(long id) { this.id = id; }

    public HrmsEmployee getEmployee() { return employee; }
    public void setEmployee(HrmsEmployee employee) { this.employee = employee; }

    public LocalDate getAttendanceDate() { return attendanceDate; }
    public void setAttendanceDate(LocalDate attendanceDate) { this.attendanceDate = attendanceDate; }

    public HrmsShiftSchedule getShiftSchedule() { return shiftSchedule; }
    public void setShiftSchedule(HrmsShiftSchedule shiftSchedule) { this.shiftSchedule = shiftSchedule; }

    public LocalDateTime getCheckInTime() { return checkInTime; }
    public void setCheckInTime(LocalDateTime checkInTime) { this.checkInTime = checkInTime; }

    public LocalDateTime getCheckOutTime() { return checkOutTime; }
    public void setCheckOutTime(LocalDateTime checkOutTime) { this.checkOutTime = checkOutTime; }

    public double getRegularHours() { return regularHours; }
    public void setRegularHours(double regularHours) { this.regularHours = regularHours; }

    public int getLateMinutes() { return lateMinutes; }
    public void setLateMinutes(int lateMinutes) { this.lateMinutes = lateMinutes; }

    public int getEarlyMinutes() { return earlyMinutes; }
    public void setEarlyMinutes(int earlyMinutes) { this.earlyMinutes = earlyMinutes; }

    public double getOvertimeDayHours() { return overtimeDayHours; }
    public void setOvertimeDayHours(double overtimeDayHours) { this.overtimeDayHours = overtimeDayHours; }

    public double getOvertimeNightHours() { return overtimeNightHours; }
    public void setOvertimeNightHours(double overtimeNightHours) { this.overtimeNightHours = overtimeNightHours; }

    public double getOvertimeWeekendHours() { return overtimeWeekendHours; }
    public void setOvertimeWeekendHours(double overtimeWeekendHours) { this.overtimeWeekendHours = overtimeWeekendHours; }

    public double getOvertimeHolidayHours() { return overtimeHolidayHours; }
    public void setOvertimeHolidayHours(double overtimeHolidayHours) { this.overtimeHolidayHours = overtimeHolidayHours; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public boolean isOvertimeApproved() { return overtimeApproved; }
    public void setOvertimeApproved(boolean overtimeApproved) { this.overtimeApproved = overtimeApproved; }

    public Integer getApprovedBy() { return approvedBy; }
    public void setApprovedBy(Integer approvedBy) { this.approvedBy = approvedBy; }

    public String getRemarks() { return remarks; }
    public void setRemarks(String remarks) { this.remarks = remarks; }
}
