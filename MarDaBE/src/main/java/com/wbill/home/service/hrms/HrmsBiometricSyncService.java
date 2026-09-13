package com.wbill.home.service.hrms;

import java.time.LocalDateTime;
import java.util.List;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import com.wbill.home.model.hrms.HrmsAttendanceRawLog;
import com.wbill.home.model.hrms.HrmsBiometricDevice;
import com.wbill.home.model.hrms.HrmsEmployee;
import com.wbill.home.repository.hrms.HrmsAttendanceRawLogRepository;
import com.wbill.home.repository.hrms.HrmsBiometricDeviceRepository;
import com.wbill.home.repository.hrms.HrmsEmployeeRepository;

/**
 * Service to manage biometric attendance hardware integration
 * and process incoming raw punches.
 */
@Service
public class HrmsBiometricSyncService {

    @Autowired
    private HrmsBiometricDeviceRepository deviceRepository;

    @Autowired
    private HrmsAttendanceRawLogRepository rawLogRepository;

    @Autowired
    private HrmsEmployeeRepository employeeRepository;

    @Autowired
    private HrmsAttendanceEvaluationService attendanceEvaluationService;

    public List<HrmsBiometricDevice> getActiveDevices() {
        return deviceRepository.findByActiveTrue();
    }

    public HrmsBiometricDevice saveDevice(HrmsBiometricDevice device) {
        return deviceRepository.save(device);
    }

    /**
     * Ingests a raw punch log from a biometric device (ZKTeco/Hikvision).
     */
    @Transactional
    public HrmsAttendanceRawLog ingestPunchLog(int deviceId,
                                              String biometricPin,
                                              LocalDateTime punchTimeLocal,
                                              String punchType,
                                              String verifyMode) {

        HrmsBiometricDevice device = deviceRepository.findById(deviceId)
                .orElseThrow(() -> new IllegalArgumentException("Biometric device not found: " + deviceId));

        HrmsAttendanceRawLog log = new HrmsAttendanceRawLog();
        log.setDevice(device);
        log.setBiometricPin(biometricPin);
        log.setPunchTimeLocal(punchTimeLocal);
        log.setPunchTimeUtc(punchTimeLocal);
        log.setPunchType(punchType != null ? punchType : "CHECK_IN");
        log.setVerifyMode(verifyMode != null ? verifyMode : "FINGERPRINT");
        log.setProcessed(false);

        HrmsAttendanceRawLog saved = rawLogRepository.save(log);

        // Update device last sync time
        device.setLastSyncTime(LocalDateTime.now());
        deviceRepository.save(device);

        // Auto-reconcile for today if employee exists
        employeeRepository.findByBiometricPinAndDeletedFalse(biometricPin).ifPresent(emp -> {
            try {
                attendanceEvaluationService.reconcileDailyAttendance(emp.getId(), punchTimeLocal.toLocalDate());
                saved.setProcessed(true);
                rawLogRepository.save(saved);
            } catch (Exception ignored) {}
        });

        return saved;
    }

    /**
     * Batch processes any un-reconciled raw logs.
     */
    @Transactional
    public int processUnprocessedLogs() {
        List<HrmsAttendanceRawLog> unprocessed = rawLogRepository.findByProcessedFalseOrderByPunchTimeLocalAsc();
        int count = 0;

        for (HrmsAttendanceRawLog log : unprocessed) {
            employeeRepository.findByBiometricPinAndDeletedFalse(log.getBiometricPin()).ifPresent(emp -> {
                attendanceEvaluationService.reconcileDailyAttendance(emp.getId(), log.getPunchTimeLocal().toLocalDate());
                log.setProcessed(true);
                rawLogRepository.save(log);
            });
            count++;
        }

        return count;
    }
}
