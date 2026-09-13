package com.mardaarif.controller;

import com.mardaarif.model.Bill;
import com.mardaarif.model.City;
import com.mardaarif.service.ApiKeyService;
import com.mardaarif.service.BillService;
import com.mardaarif.service.CsvService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.FileSystemResource;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.util.*;

/**
 * The core Unicash-mirror endpoints.
 * These are what the existing WBMS system calls — same URL patterns as real Unicash.
 */
@RestController
public class BillIntegrationController {
    private static final Logger logger = LoggerFactory.getLogger(BillIntegrationController.class);

    @Autowired
    private ApiKeyService apiKeyService;

    @Autowired
    private BillService billService;

    @Autowired
    private CsvService csvService;

    /**
     * POST /BillIntegrationResource/updateOrRegisterBill?API_KEY=...
     * Accepts the exact same JSON payload as real Unicash.
     */
    @PostMapping("/BillIntegrationResource/updateOrRegisterBill")
    public ResponseEntity<?> updateOrRegisterBill(
            @RequestParam("API_KEY") String apiKey,
            @RequestBody Map<String, Object> payload) {

        City city = apiKeyService.validateApiKey(apiKey);
        if (city == null) {
            logger.warn("[BillIntegration] Invalid API key: {}", apiKey);
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                .body(Map.of("error", "Invalid API key"));
        }

        try {
            Bill bill = billService.updateOrRegisterBill(city.getId(), payload);
            logger.info("[BillIntegration] updateOrRegisterBill success: cityId={}, billId={}",
                city.getId(), bill.getBillId());

            Map<String, Object> response = new LinkedHashMap<>();
            response.put("status", "SUCCESS");
            response.put("billId", bill.getBillId());
            response.put("message", "Bill registered/updated successfully");
            return ResponseEntity.ok(response);

        } catch (Exception e) {
            logger.error("[BillIntegration] updateOrRegisterBill failed: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("error", e.getMessage()));
        }
    }

    /**
     * POST /BillIntegrationResource/billSyncFile?API_KEY=...
     * Accepts { startDate, endDate } and generates a CSV of paid bills.
     */
    @PostMapping("/BillIntegrationResource/billSyncFile")
    public ResponseEntity<?> billSyncFile(
            @RequestParam("API_KEY") String apiKey,
            @RequestBody Map<String, String> payload) {

        City city = apiKeyService.validateApiKey(apiKey);
        if (city == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                .body(Map.of("error", "Invalid API key"));
        }

        try {
            String startDate = payload.get("startDate");
            String endDate = payload.get("endDate");

            List<Bill> paidBills = billService.getPaidBillsForSync(city.getId(), startDate, endDate);
            String csvPath = csvService.generateBillSyncCsv(paidBills, city.getId());

            logger.info("[BillIntegration] billSyncFile generated: cityId={}, records={}, path={}",
                city.getId(), paidBills.size(), csvPath);

            return ResponseEntity.ok(Map.of("path", "/csv-files/" + csvPath));

        } catch (Exception e) {
            logger.error("[BillIntegration] billSyncFile failed: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("error", e.getMessage()));
        }
    }

    /**
     * POST /BillIntegrationResource/cancelBill?API_KEY=...&bill_id=...
     * Marks the bill as CANCELLED.
     */
    @PostMapping("/BillIntegrationResource/cancelBill")
    public ResponseEntity<?> cancelBill(
            @RequestParam("API_KEY") String apiKey,
            @RequestParam("bill_id") String billId) {

        City city = apiKeyService.validateApiKey(apiKey);
        if (city == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                .body(Map.of("error", "Invalid API key"));
        }

        try {
            Bill bill = billService.cancelBill(billId, city.getId());
            logger.info("[BillIntegration] cancelBill success: cityId={}, billId={}", city.getId(), billId);

            return ResponseEntity.ok(Map.of(
                "status", "SUCCESS",
                "billId", billId,
                "message", "Bill cancelled successfully"));

        } catch (Exception e) {
            logger.error("[BillIntegration] cancelBill failed: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("error", e.getMessage()));
        }
    }

    /**
     * POST /BillIntegrationResource/bulkBillUpdate?API_KEY=...
     * Accepts multipart CSV upload. Parses and updates/registers bills in bulk.
     */
    @PostMapping({"/BillIntegrationResource/bulkBillUpdate", "/BillIntegrationResource/bulkBillUpload"})
    public ResponseEntity<?> bulkBillUpdate(
            @RequestParam("API_KEY") String apiKey,
            @RequestParam("uploadedFile") MultipartFile file) {

        City city = apiKeyService.validateApiKey(apiKey);
        if (city == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                .body(Map.of("error", "Invalid API key"));
        }

        try {
            List<Map<String, String>> rows = csvService.parseBulkBillCsv(file);
            int successCount = 0;
            int failCount = 0;

            for (Map<String, String> row : rows) {
                try {
                    // Build Unicash-format payload from CSV row with MardaArif specific extensions
                    Map<String, Object> payload = new LinkedHashMap<>();
                    payload.put("billId", row.getOrDefault("bill_id", row.get("billid")));
                    payload.put("validUntil", row.getOrDefault("due_date", row.getOrDefault("valid_until", "")));

                    Map<String, Object> customer = new LinkedHashMap<>();
                    customer.put("fullName", row.getOrDefault("name", row.getOrDefault("customer_name", row.get("full_name"))));
                    customer.put("phoneNumber", row.getOrDefault("mobile", row.getOrDefault("phone_number", "")));
                    customer.put("customerId", row.getOrDefault("customer_id", row.get("customerid")));
                    payload.put("customer", customer);

                    Map<String, Object> item = new LinkedHashMap<>();
                    item.put("name", row.getOrDefault("bill_description", row.getOrDefault("description", "")));
                    try {
                        item.put("price", Double.parseDouble(row.getOrDefault("amount_due", "0")));
                    } catch (NumberFormatException e) {
                        item.put("price", 0.0);
                    }
                    payload.put("receiptData", Map.of("items", List.of(item)));

                    // WBMS extra fields
                    payload.put("billReason", row.getOrDefault("bill_reason", ""));
                    payload.put("email", row.getOrDefault("email", ""));
                    payload.put("prevRead", row.getOrDefault("prev_read", "0"));
                    payload.put("currRead", row.getOrDefault("curr_read", "0"));
                    payload.put("consumption", row.getOrDefault("consumtion", row.getOrDefault("consumption", "0")));

                    billService.updateOrRegisterBill(city.getId(), payload);
                    successCount++;
                } catch (Exception e) {
                    failCount++;
                    logger.warn("[BillIntegration] Bulk row failed: {}", e.getMessage());
                }
            }

            logger.info("[BillIntegration] bulkBillUpdate completed: cityId={}, success={}, failed={}",
                city.getId(), successCount, failCount);

            return ResponseEntity.ok(Map.of(
                "status", "SUCCESS",
                "totalRows", rows.size(),
                "successCount", successCount,
                "failCount", failCount));

        } catch (Exception e) {
            logger.error("[BillIntegration] bulkBillUpdate failed: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("error", e.getMessage()));
        }
    }

    /**
     * GET /csv-files/{filename}
     * Serves the generated CSV files for download.
     */
    @GetMapping("/csv-files/{filename}")
    public ResponseEntity<Resource> downloadCsvFile(@PathVariable String filename) {
        try {
            File file = csvService.getCsvFile(filename);
            FileSystemResource resource = new FileSystemResource(file);

            return ResponseEntity.ok()
                .contentType(MediaType.parseMediaType("text/csv"))
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + filename + "\"")
                .body(resource);

        } catch (Exception e) {
            logger.error("[BillIntegration] CSV download failed: {}", e.getMessage());
            return ResponseEntity.notFound().build();
        }
    }
}
