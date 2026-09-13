package com.wbill.home.controller.hrms;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import com.wbill.home.model.hrms.HrmsAttendanceRawLog;
import com.wbill.home.model.hrms.HrmsBiometricDevice;
import com.wbill.home.service.hrms.HrmsBiometricSyncService;

@RestController
@RequestMapping({"/api/card_managenment/hrms/biometric", "/api/hrms/biometric"})
@CrossOrigin(origins = "*", maxAge = 3600)
public class HrmsBiometricController {

    @Autowired
    private HrmsBiometricSyncService biometricSyncService;

    @GetMapping("/devices")
    public ResponseEntity<List<HrmsBiometricDevice>> getDevices() {
        return ResponseEntity.ok(biometricSyncService.getActiveDevices());
    }

    @PostMapping("/devices")
    public ResponseEntity<HrmsBiometricDevice> saveDevice(@RequestBody HrmsBiometricDevice device) {
        return ResponseEntity.ok(biometricSyncService.saveDevice(device));
    }

    /**
     * Webhook/Push endpoint for biometric attendance terminals.
     */
    @PostMapping("/push-log")
    public ResponseEntity<HrmsAttendanceRawLog> ingestPunchLog(@RequestBody Map<String, Object> payload) {
        int deviceId = payload.get("deviceId") != null ? ((Number) payload.get("deviceId")).intValue() : 1;
        String pin = (String) payload.get("biometricPin");
        String punchType = (String) payload.getOrDefault("punchType", "CHECK_IN");
        String verifyMode = (String) payload.getOrDefault("verifyMode", "FINGERPRINT");

        LocalDateTime time = LocalDateTime.now();
        if (payload.get("timestamp") != null) {
            try {
                time = LocalDateTime.parse((String) payload.get("timestamp"));
            } catch (Exception ignored) {}
        }

        HrmsAttendanceRawLog saved = biometricSyncService.ingestPunchLog(deviceId, pin, time, punchType, verifyMode);
        return ResponseEntity.ok(saved);
    }

    @PostMapping("/process-unprocessed")
    public ResponseEntity<Map<String, Object>> processUnprocessed() {
        int processedCount = biometricSyncService.processUnprocessedLogs();
        return ResponseEntity.ok(Map.of("processedCount", processedCount, "status", "SUCCESS"));
    }
}
