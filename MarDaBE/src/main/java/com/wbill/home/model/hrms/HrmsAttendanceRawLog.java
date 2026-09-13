package com.wbill.home.model.hrms;

import java.io.Serializable;
import java.time.LocalDateTime;
import jakarta.persistence.*;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

@Entity
@Table(name = "hrms_attendance_raw_logs")
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class HrmsAttendanceRawLog implements Serializable {
    private static final long serialVersionUID = 1L;

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "device_id", nullable = false)
    private HrmsBiometricDevice device;

    @Column(name = "biometric_pin", nullable = false, length = 50)
    private String biometricPin;

    @Column(name = "punch_time_utc", nullable = false)
    private LocalDateTime punchTimeUtc;

    @Column(name = "punch_time_local", nullable = false)
    private LocalDateTime punchTimeLocal;

    @Column(name = "punch_type", length = 50)
    private String punchType = "CHECK_IN"; // CHECK_IN, CHECK_OUT, BREAK_OUT, BREAK_IN, OVERTIME_IN, OVERTIME_OUT

    @Column(name = "verify_mode", length = 50)
    private String verifyMode = "FINGERPRINT"; // FINGERPRINT, FACE_RECOGNITION, RFID_CARD, PASSWORD

    @Column(name = "is_processed", nullable = false)
    private boolean processed = false;

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    public HrmsAttendanceRawLog() {}

    // Getters and Setters
    public long getId() { return id; }
    public void setId(long id) { this.id = id; }

    public HrmsBiometricDevice getDevice() { return device; }
    public void setDevice(HrmsBiometricDevice device) { this.device = device; }

    public String getBiometricPin() { return biometricPin; }
    public void setBiometricPin(String biometricPin) { this.biometricPin = biometricPin; }

    public LocalDateTime getPunchTimeUtc() { return punchTimeUtc; }
    public void setPunchTimeUtc(LocalDateTime punchTimeUtc) { this.punchTimeUtc = punchTimeUtc; }

    public LocalDateTime getPunchTimeLocal() { return punchTimeLocal; }
    public void setPunchTimeLocal(LocalDateTime punchTimeLocal) { this.punchTimeLocal = punchTimeLocal; }

    public String getPunchType() { return punchType; }
    public void setPunchType(String punchType) { this.punchType = punchType; }

    public String getVerifyMode() { return verifyMode; }
    public void setVerifyMode(String verifyMode) { this.verifyMode = verifyMode; }

    public boolean isProcessed() { return processed; }
    public void setProcessed(boolean processed) { this.processed = processed; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}
