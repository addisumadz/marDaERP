package com.wbill.home.controller;

import com.wbill.home.dto.SmsTestRequestDTO;
import com.wbill.home.dto.BulkBillSmsRequestDTO;
import com.wbill.home.dto.DirectBulkSmsRequestDTO;
import com.wbill.home.dto.BulkSmsExportItemDTO;
import com.wbill.home.dto.GatewayBulkSmsRequestDTO;
import com.wbill.home.dto.GatewaySingleSmsRequestDTO;
import com.wbill.home.service.SmsService;
import com.wbill.home.service.ReadingService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/mardaerp/sms")
@CrossOrigin(origins = "*")
public class SmsTestController {

    private static final Logger logger = LoggerFactory.getLogger(SmsTestController.class);

    private final SmsService smsService;
    private final ReadingService readingService;

    public SmsTestController(SmsService smsService, ReadingService readingService) {
        this.smsService = smsService;
        this.readingService = readingService;
    }

    @PostMapping("/test")
    public ResponseEntity<?> sendTestSms(@RequestBody SmsTestRequestDTO request) {
        try {
            logger.info("Received SMS test request for phoneNumber={}", request.getPhoneNumber());
            smsService.sendTestSms(request.getPhoneNumber(), request.getMessage());
            return ResponseEntity.ok("SMS sent successfully");
        } catch (Exception e) {
            logger.error("Error sending test SMS", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Failed to send SMS: " + e.getMessage());
        }
    }

    @PostMapping("/test/jasmin")
    public ResponseEntity<?> sendTestSmsViaJasmin(@RequestBody SmsTestRequestDTO request) {
        try {
            logger.info("Received Jasmin SMS test request for phoneNumber={}", request.getPhoneNumber());
            smsService.sendTestSmsViaJasmin(request.getPhoneNumber(), request.getMessage());
            return ResponseEntity.ok("SMS via Jasmin sent successfully");
        } catch (Exception e) {
            logger.error("Error sending Jasmin test SMS", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Failed to send SMS via Jasmin: " + e.getMessage());
        }
    }

    @PostMapping("/bulk-bills")
    public ResponseEntity<?> sendBulkBillSms(@RequestBody BulkBillSmsRequestDTO request) {
        try {
            if (request == null || request.getReadingIds() == null || request.getReadingIds().isEmpty()) {
                return ResponseEntity.badRequest().body("readingIds list cannot be empty");
            }
            logger.info("Received bulk bill SMS request: count={}, smsDueDateText='{}', monthYearPart='{}'",
                    request.getReadingIds().size(),
                    request.getSmsDueDateText(),
                    request.getMonthYearPart());

            ReadingService.SmsBulkSendStats stats = readingService.sendBillSmsInBulk(
                    request.getReadingIds(),
                    request.getSmsDueDateText(),
                    request.getMonthYearPart());
            java.util.Map<String, Object> body = new java.util.HashMap<>();
            body.put("total", stats.getTotal());
            body.put("attempted", stats.getAttempted());
            body.put("sent", stats.getSent());
            body.put("failed", stats.getFailed());
            return ResponseEntity.ok(body);
        } catch (Exception e) {
            logger.error("Error sending bulk bill SMS", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Failed to send bulk SMS: " + e.getMessage());
        }
    }

    @PostMapping("/bulk-bills-silent")
    public ResponseEntity<?> sendBulkBillSmsSilent(@RequestBody BulkBillSmsRequestDTO request) {
        try {
            if (request == null || request.getReadingIds() == null || request.getReadingIds().isEmpty()) {
                return ResponseEntity.badRequest().body("readingIds list cannot be empty");
            }
            logger.info("Received SILENT bulk bill SMS request: count={}", request.getReadingIds().size());

            ReadingService.SmsBulkSendStats stats = readingService.sendBillSmsInBulkSilent(
                    request.getReadingIds(),
                    request.getSmsDueDateText(),
                    request.getMonthYearPart());
            java.util.Map<String, Object> body = new java.util.HashMap<>();
            body.put("total", stats.getTotal());
            body.put("attempted", stats.getAttempted());
            body.put("sent", stats.getSent());
            body.put("failed", stats.getFailed());
            return ResponseEntity.ok(body);
        } catch (Exception e) {
            logger.error("Error sending silent bulk bill SMS", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Failed to send silent bulk SMS: " + e.getMessage());
        }
    }

    @PostMapping("/bulk-bills-export")
    public ResponseEntity<?> getBulkBillSmsExportData(@RequestBody BulkBillSmsRequestDTO request) {
        try {
            if (request == null || request.getReadingIds() == null || request.getReadingIds().isEmpty()) {
                return ResponseEntity.badRequest().body("readingIds list cannot be empty");
            }
            logger.info("Received SMS export data request: count={}", request.getReadingIds().size());

            java.util.List<BulkSmsExportItemDTO> exportItems = readingService.prepareBillSmsExportData(
                    request.getReadingIds(),
                    request.getSmsDueDateText(),
                    request.getMonthYearPart());
            return ResponseEntity.ok(exportItems);
        } catch (Exception e) {
            logger.error("Error preparing SMS export data", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Failed to prepare SMS export data: " + e.getMessage());
        }
    }

    @PostMapping("/bulk-direct-message")
    public ResponseEntity<?> sendDirectBulkSms(@RequestBody DirectBulkSmsRequestDTO request) {
        try {
            if (request == null || request.getReadingIds() == null || request.getReadingIds().isEmpty()) {
                return ResponseEntity.badRequest().body("readingIds list cannot be empty");
            }
            if (request.getMessage() == null || request.getMessage().trim().isEmpty()) {
                return ResponseEntity.badRequest().body("message cannot be empty");
            }
            logger.info("Received direct bulk SMS request: count={}, messageLength={}",
                    request.getReadingIds().size(),
                    request.getMessage().length());

            ReadingService.SmsBulkSendStats stats = readingService.sendDirectMessageInBulk(
                    request.getReadingIds(),
                    request.getMessage());
            java.util.Map<String, Object> body = new java.util.HashMap<>();
            body.put("total", stats.getTotal());
            body.put("attempted", stats.getAttempted());
            body.put("sent", stats.getSent());
            body.put("failed", stats.getFailed());
            return ResponseEntity.ok(body);
        } catch (Exception e) {
            logger.error("Error sending direct bulk SMS", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Failed to send direct bulk SMS: " + e.getMessage());
        }
    }

    @PostMapping("/prepare-queue")
    public ResponseEntity<?> prepareBillSmsQueue(@RequestBody BulkBillSmsRequestDTO request) {
        try {
            if (request == null || request.getReadingIds() == null || request.getReadingIds().isEmpty()) {
                return ResponseEntity.badRequest().body("readingIds list cannot be empty");
            }
            logger.info("Received SMS queue preparation request: count={}", request.getReadingIds().size());

            java.util.List<BulkSmsExportItemDTO> queueItems = readingService.prepareBillSmsQueueData(
                    request.getReadingIds(),
                    request.getSmsDueDateText(),
                    request.getMonthYearPart());
            return ResponseEntity.ok(queueItems);
        } catch (Exception e) {
            logger.error("Error preparing SMS queue data", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Failed to prepare SMS queue data: " + e.getMessage());
        }
    }

    @PostMapping("/send-gateway-bulk")
    public ResponseEntity<?> sendGatewayBulkSms(@RequestBody GatewayBulkSmsRequestDTO request) {
        try {
            if (request == null) {
                return ResponseEntity.badRequest().body("Request cannot be null");
            }
            boolean hasReadings = request.getReadingIds() != null && !request.getReadingIds().isEmpty();
            boolean hasCustom = request.getCustomItems() != null && !request.getCustomItems().isEmpty();
            if (!hasReadings && !hasCustom) {
                return ResponseEntity.badRequest().body("readingIds or customItems cannot be empty");
            }

            logger.info("Received gateway bulk SMS request: readingIds={}, customItems={}, gatewayUrl={}",
                    hasReadings ? request.getReadingIds().size() : 0,
                    hasCustom ? request.getCustomItems().size() : 0,
                    request.getGatewayUrl());

            java.util.Map<String, Object> result = readingService.sendBillSmsViaGateway(
                    request.getReadingIds(),
                    request.getGatewayUrl(),
                    request.getApiKey(),
                    request.getSmsDueDateText(),
                    request.getMonthYearPart(),
                    request.getCustomItems());
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            logger.error("Error sending bulk SMS via gateway", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Failed to send bulk SMS via gateway: " + e.getMessage());
        }
    }

    @PostMapping("/send-gateway-single")
    public ResponseEntity<?> sendGatewaySingleSms(@RequestBody GatewaySingleSmsRequestDTO request) {
        try {
            if (request == null) {
                return ResponseEntity.badRequest().body("Request cannot be null");
            }
            if (request.getPhoneNumber() == null || request.getPhoneNumber().trim().isEmpty()) {
                return ResponseEntity.badRequest().body("phoneNumber cannot be empty");
            }
            if (request.getMessage() == null || request.getMessage().trim().isEmpty()) {
                return ResponseEntity.badRequest().body("message cannot be empty");
            }

            logger.info("Received gateway single SMS request for readingId={}, phone={}",
                    request.getReadingId(), request.getPhoneNumber());

            java.util.Map<String, Object> result = readingService.sendSingleBillSmsViaGateway(
                    request.getReadingId(),
                    request.getPhoneNumber(),
                    request.getMessage(),
                    request.getGatewayUrl(),
                    request.getApiKey());
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            logger.error("Error sending single SMS via gateway", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Failed to send single SMS via gateway: " + e.getMessage());
        }
    }

    @PostMapping("/test-gateway")
    public ResponseEntity<?> testGateway(@RequestBody GatewaySingleSmsRequestDTO request) {
        try {
            if (request == null || request.getPhoneNumber() == null || request.getPhoneNumber().trim().isEmpty()) {
                return ResponseEntity.badRequest().body("phoneNumber cannot be empty");
            }
            String testMsg = (request.getMessage() != null && !request.getMessage().trim().isEmpty())
                    ? request.getMessage()
                    : "Test SMS from MarDa ERP Gateway";

            SmsService.BulkSmsResult res = smsService.sendSmsViaHttpGateway(
                    request.getGatewayUrl(),
                    request.getApiKey(),
                    null,
                    request.getPhoneNumber(),
                    testMsg);

            java.util.Map<String, Object> body = new java.util.HashMap<>();
            body.put("success", res.isSuccess());
            body.put("phoneNumber", res.getPhoneNumber());
            body.put("error", res.getError());
            body.put("message", res.isSuccess() ? "Test SMS sent successfully!" : "Failed: " + res.getError());
            return ResponseEntity.ok(body);
        } catch (Exception e) {
            logger.error("Error testing gateway", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Failed to test gateway: " + e.getMessage());
        }
    }
}
