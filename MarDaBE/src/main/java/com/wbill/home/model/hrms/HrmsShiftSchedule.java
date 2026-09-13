package com.wbill.home.model.hrms;

import java.io.Serializable;
import java.time.LocalTime;
import jakarta.persistence.*;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

@Entity
@Table(name = "hrms_shift_schedules")
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class HrmsShiftSchedule implements Serializable {
    private static final long serialVersionUID = 1L;

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private int id;

    @Column(name = "shift_code", nullable = false, unique = true, length = 50)
    private String shiftCode; // SHIFT-MORN, SHIFT-AFTN, SHIFT-NIGHT, SHIFT-GEN

    @Column(name = "shift_name", nullable = false, length = 100)
    private String shiftName;

    @Column(name = "start_time", nullable = false)
    private LocalTime startTime;

    @Column(name = "end_time", nullable = false)
    private LocalTime endTime;

    @Column(name = "is_night_shift", nullable = false)
    private boolean nightShift = false;

    @Column(name = "grace_period_minutes", nullable = false)
    private int gracePeriodMinutes = 15;

    @Column(name = "total_hours", nullable = false)
    private double totalHours = 8.0;

    @Column(name = "description", length = 255)
    private String description;

    @Column(name = "is_active", nullable = false)
    private boolean active = true;

    public HrmsShiftSchedule() {}

    // Getters and Setters
    public int getId() { return id; }
    public void setId(int id) { this.id = id; }

    public String getShiftCode() { return shiftCode; }
    public void setShiftCode(String shiftCode) { this.shiftCode = shiftCode; }

    public String getShiftName() { return shiftName; }
    public void setShiftName(String shiftName) { this.shiftName = shiftName; }

    public LocalTime getStartTime() { return startTime; }
    public void setStartTime(LocalTime startTime) { this.startTime = startTime; }

    public LocalTime getEndTime() { return endTime; }
    public void setEndTime(LocalTime endTime) { this.endTime = endTime; }

    public boolean isNightShift() { return nightShift; }
    public void setNightShift(boolean nightShift) { this.nightShift = nightShift; }

    public int getGracePeriodMinutes() { return gracePeriodMinutes; }
    public void setGracePeriodMinutes(int gracePeriodMinutes) { this.gracePeriodMinutes = gracePeriodMinutes; }

    public double getTotalHours() { return totalHours; }
    public void setTotalHours(double totalHours) { this.totalHours = totalHours; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public boolean isActive() { return active; }
    public void setActive(boolean active) { this.active = active; }
}
