package com.mardaarif.controller;

import com.mardaarif.model.Sms;
import com.mardaarif.repository.SmsRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.*;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.client.RestTemplate;

import java.time.LocalDateTime;
import java.util.*;

@RestController
@RequestMapping("/api/sms")
public class SmsController {

    private static final Logger logger = LoggerFactory.getLogger(SmsController.class);

    @Autowired
    private SmsRepository smsRepository;

    @Autowired
    private org.springframework.jdbc.core.JdbcTemplate jdbcTemplate;

    private final RestTemplate restTemplate = new RestTemplate();

    @jakarta.annotation.PostConstruct
    public void initDatabaseCharset() {
        try {
            logger.info("Altering sms_logs table to support UTF-8 (Amharic characters)...");
            jdbcTemplate.execute("ALTER TABLE sms_logs CONVERT TO CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci");
            logger.info("sms_logs table character set successfully altered to utf8mb4.");
        } catch (Exception e) {
            logger.warn("Could not alter table charset (it might not exist yet): {}", e.getMessage());
        }
    }

    @GetMapping
    public ResponseEntity<List<Sms>> getSmsLogs(
            @RequestParam Integer cityId,
            @RequestParam(required = false) String status) {
        if (status != null && !status.isEmpty()) {
            return ResponseEntity.ok(smsRepository.findByCityIdAndStatus(cityId, status));
        }
        return ResponseEntity.ok(smsRepository.findByCityId(cityId));
    }

    @PostMapping("/register")
    public ResponseEntity<?> registerSms(@RequestBody List<Sms> smsList) {
        if (smsList == null || smsList.isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("message", "SMS list cannot be empty"));
        }

        for (Sms sms : smsList) {
            sms.setStatus("PENDING");
            sms.setCreatedAt(LocalDateTime.now());
        }

        List<Sms> saved = smsRepository.saveAll(smsList);
        return ResponseEntity.ok(Map.of(
            "message", "Successfully registered " + saved.size() + " SMS messages",
            "count", saved.size()
        ));
    }

    @Transactional
    @DeleteMapping("/clear")
    public ResponseEntity<?> clearSmsLogs(@RequestParam Integer cityId) {
        smsRepository.deleteByCityId(cityId);
        return ResponseEntity.ok(Map.of("message", "SMS logs cleared successfully for city " + cityId));
    }

    @PostMapping("/send-bulk")
    public ResponseEntity<?> sendBulkSms(@RequestBody Map<String, Object> payload) {
        List<Integer> idsRaw = (List<Integer>) payload.get("ids");
        String gatewayUrl = (String) payload.get("gatewayUrl");
        String apiKey = (String) payload.get("apiKey");

        if (idsRaw == null || idsRaw.isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("message", "SMS IDs list cannot be empty"));
        }
        if (gatewayUrl == null || gatewayUrl.isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("message", "Gateway URL is required"));
        }
        if (apiKey == null || apiKey.isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("message", "API Key is required"));
        }

        List<Long> ids = new ArrayList<>();
        for (Object idObj : idsRaw) {
            if (idObj instanceof Number) {
                ids.add(((Number) idObj).longValue());
            }
        }

        List<Sms> smsList = smsRepository.findAllById(ids);
        if (smsList.isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("message", "No SMS records found for the given IDs"));
        }

        int sentCount = 0;
        int failedCount = 0;

        for (Sms sms : smsList) {
            sms.setStatus("SENDING");
            smsRepository.save(sms);

            String originalPhone = sms.getPhoneNumber();
            String normalizedPhone = normalizeEthiopianPhoneNumber(originalPhone);

            try {
                HttpHeaders headers = new HttpHeaders();
                headers.setContentType(MediaType.APPLICATION_JSON);
                headers.set("KEY", apiKey);

                Map<String, String> body = new HashMap<>();
                body.put("msisdn", normalizedPhone);
                body.put("text", sms.getMessage());

                HttpEntity<Map<String, String>> request = new HttpEntity<>(body, headers);

                logger.info("Sending SMS to: {} (Normalized from {})", normalizedPhone, originalPhone);
                ResponseEntity<String> response = restTemplate.postForEntity(gatewayUrl, request, String.class);

                if (response.getStatusCode().is2xxSuccessful()) {
                    sms.setStatus("SENT");
                    sms.setSentAt(LocalDateTime.now());
                    sms.setErrorMessage(null);
                    sentCount++;
                } else {
                    sms.setStatus("FAILED");
                    sms.setErrorMessage("Gateway returned status: " + response.getStatusCode().value() + " - " + response.getBody());
                    failedCount++;
                }
            } catch (Exception e) {
                logger.error("Error sending SMS ID: {}", sms.getId(), e);
                sms.setStatus("FAILED");
                sms.setErrorMessage(e.getMessage() != null ? e.getMessage() : e.toString());
                failedCount++;
            }

            smsRepository.save(sms);
        }

        return ResponseEntity.ok(Map.of(
            "message", "Bulk sending complete",
            "total", smsList.size(),
            "sent", sentCount,
            "failed", failedCount
        ));
    }

    private String normalizeEthiopianPhoneNumber(String phone) {
        if (phone == null) return "";
        // Remove all non-digit characters except maybe '+'
        String cleaned = phone.replaceAll("[^\\d+]", "");

        // If it starts with +251
        if (cleaned.startsWith("+251")) {
            cleaned = cleaned.substring(1);
        }

        // If it starts with 09... or 07... (standard local format), replace 0 with 251
        if (cleaned.startsWith("0") && cleaned.length() == 10) {
            cleaned = "251" + cleaned.substring(1);
        }

        // If it is just 9 digits starting with 9 or 7, prepend 251
        if (cleaned.length() == 9 && (cleaned.startsWith("9") || cleaned.startsWith("7"))) {
            cleaned = "251" + cleaned;
        }

        return cleaned;
    }
}
