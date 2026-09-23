package com.wbill.home.controller; // Adjust package name

import java.io.File;

import com.wbill.home.dto.BillingReadingDTO;
import com.wbill.home.dto.CustomerBillDataDTO;
import com.wbill.home.dto.ImportReport;
import com.wbill.home.dto.PreviousReadingBillDTO;
import com.wbill.home.dto.ReadingDetailResponseDTO;
import com.wbill.home.dto.PreviousReadingDTO;
import com.wbill.home.dto.UpdateReadingRequest;
import com.wbill.home.dto.GenerateBillWithReadingsRequest;
import com.wbill.home.dto.ReadingUpdateDTO;
import com.wbill.home.dto.SimplifiedReadingDTO;
import com.wbill.home.dto.DerashBankExtendRequestDTO;
import com.wbill.home.dto.DerashMarkSentRequestDTO;
import com.wbill.home.dto.UnicashBankExtendRequestDTO;
import com.wbill.home.dto.UnicashBillSubmissionDTO;
import com.wbill.home.dto.UnicashMarkSentRequestDTO;
import com.wbill.home.dto.MardaArifBankExtendRequestDTO;
import com.wbill.home.dto.MardaArifBillSubmissionDTO;
import com.wbill.home.dto.MardaArifMarkSentRequestDTO;
import com.wbill.home.dto.MardaArifPaymentUpdateDTO;
import com.wbill.home.dto.BulkMardaArifPaymentUpdateRequestDTO;
import com.wbill.home.model.BillingReading; // If you have methods returning full entities
import com.wbill.home.service.BillingCustomerInfoService;
import com.wbill.home.service.BillingReadingImportService;
import com.wbill.home.service.BillingService;
import com.wbill.home.service.ReadingService;
import com.wbill.home.service.BillingService.BillingProcessResult;
import com.wbill.home.service.WuzifService;
import com.wbill.home.service.BankPaymentImportService;
import com.wbill.home.repository.CompanyProfileRepository;
import com.wbill.home.repository.UserAccountRepository;
import com.wbill.home.dto.BankPaymentUpdateDTO;
import com.wbill.home.dto.BulkBankPaymentUpdateRequestDTO;
import com.wbill.home.dto.BulkUpdateResponseDTO;
import com.wbill.home.dto.ConsumptionBasedCorrectionRequestDTO;
import com.wbill.home.dto.AverageConsumptionInitRequestDTO;
import com.wbill.home.dto.UnicashPaymentUpdateDTO;
import com.wbill.home.dto.BulkUnicashPaymentUpdateRequestDTO;
import com.wbill.home.dto.CashierPaymentUpdateDTO;
import com.wbill.home.dto.MobileCsvPrepareRequestDTO;
import com.wbill.home.dto.ZpiMobileReadingRequestDTO;
import com.wbill.home.dto.KitatTransferRequestDTO;
import com.wbill.home.service.FrontOfficePaymentService;

import java.util.Optional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.security.access.prepost.PreAuthorize;

import java.util.List;
import java.util.Map;

import org.springframework.web.util.UriComponentsBuilder;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.HttpEntity;
import org.springframework.http.MediaType;

import org.springframework.web.multipart.MultipartFile;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.beans.factory.annotation.Value;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.charset.StandardCharsets;
import java.io.BufferedWriter;
import java.io.InputStream;
import java.io.ByteArrayOutputStream;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.zip.ZipEntry;
import java.util.zip.ZipOutputStream;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.core.io.ByteArrayResource;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.wbill.home.model.UserAccount;
import com.wbill.home.model.CompanyProfile;
import com.wbill.home.util.EthiopianCalendarUtil;

/**
 * Handles REST requests related to readings.
 */
@RestController
@RequestMapping("/api/mardaerp")
public class ReadingController {
    private static final Logger log = LoggerFactory.getLogger(ReadingController.class);

    @Autowired
    private ReadingService readingService;
    @Autowired
    private BillingReadingImportService billingReadingImportService;

    @Autowired
    private BillingCustomerInfoService billingCustomerInfoService;

    @Autowired
    private BillingService billingService;
    @Autowired
    private com.wbill.home.service.ProgressService progressService;
    @Autowired
    private com.wbill.home.service.BankProcessJobStore bankProcessJobStore;

    @Autowired
    private WuzifService wuzifService;
    @Autowired
    private BankPaymentImportService bankPaymentImportService;
    @Autowired
    private FrontOfficePaymentService frontOfficePaymentService;
    @Autowired
    private com.wbill.home.service.UnicashClient unicashClient;

    @Autowired
    private UserAccountRepository userAccountRepository;

    @GetMapping
    public ResponseEntity<List<BillingReadingDTO>> getAllReadings() {
        List<BillingReadingDTO> readings = readingService.getAllReadingsForList();
        return new ResponseEntity<>(readings, HttpStatus.OK);
    }

    @GetMapping("/wuzif/report/{customerId}")
    public ResponseEntity<List<BillingReadingDTO>> getWuzifReportForCustomer(@PathVariable int customerId) {
        List<BillingReadingDTO> reportData = wuzifService.getWuzifReportData(customerId);
        return new ResponseEntity<>(reportData, HttpStatus.OK);
    }

    @PostMapping("/wuzif/report/bulk")
    public ResponseEntity<List<BillingReadingDTO>> getBulkWuzifReport(@RequestBody Map<String, Object> payload) {
        @SuppressWarnings("unchecked")
        List<String> accountNumbers = (List<String>) payload.get("accountNumbers");
        String kifyaWer = (String) payload.get("kifyaWer");

        List<BillingReadingDTO> reportData = wuzifService.getBulkWuzifReportData(accountNumbers, kifyaWer);
        return new ResponseEntity<>(reportData, HttpStatus.OK);
    }

    // ===== Real Progress Support =====
    @PostMapping("/generate-async")
    public ResponseEntity<Map<String, Object>> startGenerateBillsAsync(
            @RequestBody Map<String, List<Integer>> payload) {
        List<Integer> readingIds = payload.get("readingIds");
        if (readingIds == null || readingIds.isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of(
                    "success", false,
                    "message", "Reading IDs list cannot be empty."));
        }
        try {
            String jobId = billingService.startAsyncGeneration(readingIds);
            return ResponseEntity.ok(Map.of(
                    "success", true,
                    "jobId", jobId));
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(Map.of(
                    "success", false,
                    "message", "Failed to start job: " + e.getMessage()));
        }
    }

    // ===== Bulk Apply Reading Strategies Async =====
    @PostMapping("/bulk-apply-readings-async")
    public ResponseEntity<Map<String, Object>> startBulkApplyReadingsAsync(
            @RequestBody Map<String, Object> payload) {
        @SuppressWarnings("unchecked")
        List<String> accountNumbers = (List<String>) payload.get("accountNumbers");
        String kifyaWer = (String) payload.get("kifyaWer");
        String strategy = (String) payload.get("strategy");

        if (accountNumbers == null || accountNumbers.isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of(
                    "success", false,
                    "message", "Account numbers list cannot be empty."));
        }
        if (kifyaWer == null || kifyaWer.trim().isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of(
                    "success", false,
                    "message", "kifyaWer is required."));
        }
        if (strategy == null || strategy.trim().isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of(
                    "success", false,
                    "message", "strategy is required (repeat, lastMonth, or average)."));
        }

        try {
            String jobId = progressService.createJob(accountNumbers.size());
            new Thread(() -> {
                try {
                    billingReadingImportService.processBulkStrategyAsync(
                            jobId, accountNumbers, kifyaWer, strategy, progressService);
                } catch (Exception ex) {
                    log.error("Bulk apply reading error for job {}", jobId, ex);
                    progressService.markError(jobId, ex.getMessage());
                }
            }, "bulk-reading-" + jobId).start();

            return ResponseEntity.ok(Map.of(
                    "success", true,
                    "jobId", jobId));
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(Map.of(
                    "success", false,
                    "message", "Failed to start bulk apply job: " + e.getMessage()));
        }
    }

    // ===== Check Wuzif Occurrence =====
    @PostMapping("/check-wuzif-occurrence")
    public ResponseEntity<Map<String, Object>> checkWuzifOccurrence(
            @RequestBody Map<String, List<Integer>> payload) {
        List<Integer> readingIds = payload.get("readingIds");
        if (readingIds == null || readingIds.isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of(
                    "success", false,
                    "message", "Reading IDs list cannot be empty."));
        }
        try {
            List<Integer> wuzifIds = billingService.checkWuzifOccurrence(readingIds);
            return ResponseEntity.ok(Map.of(
                    "success", true,
                    "wuzifReadingIds", wuzifIds,
                    "totalChecked", readingIds.size(),
                    "totalWithWuzif", wuzifIds.size()));
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(Map.of(
                    "success", false,
                    "message", "Failed to check wuzif occurrence: " + e.getMessage()));
        }
    }

    // ===== Check For Having Wuzif (mirrors formalizeArrearsFor, read-only) =====
    @PostMapping("/check-for-having-wuzif")
    public ResponseEntity<Map<String, Object>> checkForHavingWuzif(
            @RequestBody Map<String, List<Integer>> payload) {
        List<Integer> readingIds = payload.get("readingIds");
        if (readingIds == null || readingIds.isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of(
                    "success", false,
                    "message", "Reading IDs list cannot be empty."));
        }
        try {
            List<Integer> havingWuzifIds = billingService.checkForHavingWuzif(readingIds);
            return ResponseEntity.ok(Map.of(
                    "success", true,
                    "havingWuzifReadingIds", havingWuzifIds,
                    "totalChecked", readingIds.size(),
                    "totalWithUnpaidPrev", havingWuzifIds.size()));
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(Map.of(
                    "success", false,
                    "message", "Failed to check for having wuzif: " + e.getMessage()));
        }
    }

    // ===== Check Wuzif List (all active wuzif entries, regardless of payment) =====
    @PostMapping("/check-wuzif-list")
    public ResponseEntity<Map<String, Object>> checkWuzifList(
            @RequestBody Map<String, List<Integer>> payload) {
        List<Integer> readingIds = payload.get("readingIds");
        if (readingIds == null || readingIds.isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of(
                    "success", false,
                    "message", "Reading IDs list cannot be empty."));
        }
        try {
            List<Integer> wuzifListIds = billingService.checkWuzifList(readingIds);
            return ResponseEntity.ok(Map.of(
                    "success", true,
                    "wuzifListReadingIds", wuzifListIds,
                    "totalChecked", readingIds.size(),
                    "totalInWuzifList", wuzifListIds.size()));
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(Map.of(
                    "success", false,
                    "message", "Failed to check wuzif list: " + e.getMessage()));
        }
    }

    @PostMapping("/unicash-bank-payments/process-async")
    public ResponseEntity<Map<String, Object>> startProcessUnicashBankPaymentsAsync(
            @RequestBody com.wbill.home.dto.BankFetchRequest req) {
        if (req == null || req.getFromDate() == null || req.getToDate() == null) {
            return ResponseEntity.badRequest().body(Map.of(
                    "success", false,
                    "message", "fromDate and toDate are required (yyyy-MM-dd)"));
        }
        try {
            String jobId = progressService.createJob(0);
            new Thread(() -> {
                try {
                    com.wbill.home.dto.BankProcessResultDTO result = bankPaymentUnicashFlowService
                            .processCsvWithProgress(jobId, req.getFromDate(), req.getToDate(), req.getKifyaWer(),
                                    progressService);
                    bankProcessJobStore.setResult(jobId, result);
                    progressService.markDone(jobId, "CSV processed successfully");
                } catch (Exception ex) {
                    progressService.markError(jobId, ex.getMessage());
                }
            }).start();
            return ResponseEntity.ok(Map.of(
                    "success", true,
                    "jobId", jobId));
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(Map.of(
                    "success", false,
                    "message", "Failed to start process: " + e.getMessage()));
        }
    }

    @PostMapping("/unicash-bank-payments/process")
    public ResponseEntity<?> processUnicashBankPayments(@RequestBody com.wbill.home.dto.BankFetchRequest req) {
        try {
            if (req == null || req.getFromDate() == null || req.getToDate() == null) {
                return ResponseEntity.badRequest()
                        .body(new ErrorResponse("fromDate and toDate are required (yyyy-MM-dd)"));
            }
            com.wbill.home.dto.BankProcessResultDTO result = bankPaymentUnicashFlowService.processCsv(req.getFromDate(),
                    req.getToDate(), req.getKifyaWer());
            return ResponseEntity.ok(result);
        } catch (java.io.FileNotFoundException fnf) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(new ErrorResponse(fnf.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(new ErrorResponse("Failed to process: " + e.getMessage()));
        }
    }

    @PostMapping("/derash/customers-bill-data-file")
    public ResponseEntity<?> forwardCsvToDerash(@RequestParam("file") MultipartFile file) {
        try {
            if (file == null || file.isEmpty()) {
                return ResponseEntity.badRequest().body(new ErrorResponse("CSV file is required"));
            }

            com.wbill.home.model.CompanyProfile companyProfile = companyProfileRepository.findById(9).orElse(null);
            if (companyProfile == null) {
                return ResponseEntity.badRequest().body(new ErrorResponse("Company profile ID 9 not found"));
            }

            String baseUrl = companyProfile.getdCompanyUri();
            String apiKey = companyProfile.getdCompanyKey();
            String apiSecret = companyProfile.getdCompanySecret();

            if (baseUrl == null || baseUrl.isBlank() || apiKey == null || apiSecret == null) {
                return ResponseEntity.badRequest().body(new ErrorResponse("Derash configuration incomplete"));
            }

            // Ensure local directory exists for storing CSV/ZIP files
            Files.createDirectories(Paths.get(storageDir));

            // Prepare filenames
            String tmpOriginalName = file.getOriginalFilename();
            final String originalName = (tmpOriginalName == null || tmpOriginalName.isBlank())
                    ? "customers_bill_data.csv"
                    : tmpOriginalName;
            String timestamp = LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyyMMdd_HHmmss"));
            String csvFilename = "customers_bill_data_" + timestamp + ".csv";
            String zipFilename = "customers_bill_data_" + timestamp + ".zip";

            // Save the raw CSV to disk
            Path csvPath = Paths.get(storageDir, csvFilename);
            try (InputStream in = file.getInputStream()) {
                Files.copy(in, csvPath);
            }

            // Create ZIP archive in memory containing the CSV payload
            byte[] zipBytes;
            try (ByteArrayOutputStream baos = new ByteArrayOutputStream();
                    ZipOutputStream zos = new ZipOutputStream(baos)) {

                ZipEntry entry = new ZipEntry(originalName);
                zos.putNextEntry(entry);
                zos.write(file.getBytes());
                zos.closeEntry();
                zos.finish();
                zipBytes = baos.toByteArray();
            }

            // Save ZIP file to disk
            Path zipPath = Paths.get(storageDir, zipFilename);
            Files.write(zipPath, zipBytes);

            // Build Derash endpoint URL
            String url = UriComponentsBuilder.fromHttpUrl(baseUrl.trim())
                    .pathSegment("customers-bill-data-file")
                    .toUriString();

            HttpHeaders headers = new HttpHeaders();
            headers.set("api-key", apiKey.trim());
            headers.set("api-secret", apiSecret.trim());
            headers.setContentType(MediaType.MULTIPART_FORM_DATA);

            // Send ZIP file to Derash as multipart part "file"
            ByteArrayResource zipResource = new ByteArrayResource(zipBytes) {
                @Override
                public String getFilename() {
                    return zipFilename;
                }
            };

            MultiValueMap<String, Object> body = new LinkedMultiValueMap<>();
            body.add("file", zipResource);

            HttpEntity<MultiValueMap<String, Object>> requestEntity = new HttpEntity<>(body, headers);

            org.springframework.web.client.RestTemplate restTemplate = new org.springframework.web.client.RestTemplate();

            // Log the request details
            log.info("Sending ZIP to Derash API. Final Call URL: {}, Filename: {}, Size: {} bytes", url, zipFilename,
                    zipBytes.length);

            ResponseEntity<java.util.Map> response = restTemplate.exchange(
                    url,
                    HttpMethod.POST,
                    requestEntity,
                    java.util.Map.class);

            java.util.Map bodyMap = response.getBody();

            // Log Derash CSV API response similar to legacy DerashFileResponse.getMessage()
            try {
                log.info("Derash CSV upload response status: {}", response.getStatusCode());
                if (bodyMap != null) {
                    Object message = bodyMap.get("message");
                    log.info("Derash CSV upload response body: {}", bodyMap);
                    if (message != null) {
                        log.info(
                                "Derash CSV upload confirmation message (equivalent to DerashFileResponse.getMessage()): {}",
                                message);
                    }
                } else {
                    log.info("Derash CSV upload response body is null");
                }
            } catch (Exception logEx) {
                // Do not fail the request just because of logging issues
                log.warn("Failed to log Derash CSV upload response", logEx);
            }

            try {
                if (bodyMap != null) {
                    Object message = bodyMap.get("message");
                    if (message != null) {
                        companyProfile.setFilename2(message.toString());
                        companyProfileRepository.save(companyProfile);
                    }
                }
            } catch (Exception persistEx) {
                log.warn("Failed to persist Derash CSV response message into CompanyProfile.filename2", persistEx);
            }

            return ResponseEntity.status(response.getStatusCode()).body(bodyMap);
        } catch (Exception e) {
            return ResponseEntity.internalServerError()
                    .body(new ErrorResponse("Failed to send CSV to Derash: " + e.getMessage()));
        }
    }

    @PostMapping("/unicash/customers-bill-data-file")
    public ResponseEntity<?> forwardCsvToUnicash(@RequestParam("file") MultipartFile file) {
        try {
            if (file == null || file.isEmpty()) {
                return ResponseEntity.badRequest().body(new ErrorResponse("CSV file is required"));
            }

            com.wbill.home.model.CompanyProfile companyProfile = companyProfileRepository.findById(9).orElse(null);
            if (companyProfile == null) {
                return ResponseEntity.badRequest().body(new ErrorResponse("Company profile ID 9 not found"));
            }

            String baseUrl = companyProfile.getuCompanyUri();
            String apiKey = companyProfile.getuCompanyKey();

            if (baseUrl == null || baseUrl.isBlank() || apiKey == null) {
                return ResponseEntity.badRequest().body(new ErrorResponse("Unicash configuration incomplete"));
            }

            // --- 1. Save File to Disk (Old Code Management Style) ---
            Files.createDirectories(Paths.get(unicashStorageDir));

            String tmpOriginalNameUnicash = file.getOriginalFilename();
            final String originalName = (tmpOriginalNameUnicash == null || tmpOriginalNameUnicash.isBlank())
                    ? "customers_bill_data.csv"
                    : tmpOriginalNameUnicash;

            // Add timestamp to ensure uniqueness like we do for Derash
            String timestamp = LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyyMMdd_HHmmss"));
            String storageFilename = "unicash_" + timestamp + "_" + originalName;
            Path storagePath = Paths.get(unicashStorageDir, storageFilename);

            try (InputStream in = file.getInputStream()) {
                Files.copy(in, storagePath);
            }
            log.info("Saved Unicash CSV to: {}", storagePath.toAbsolutePath());
            // ---------------------------------------------------------

            String url = UriComponentsBuilder.fromHttpUrl(baseUrl.trim())
                    .path("BillIntegrationResource/bulkBillUpload")
                    .queryParam("API_KEY", apiKey.trim())
                    .toUriString();

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.MULTIPART_FORM_DATA);
            headers.add("API_KEY", apiKey.trim());

            ByteArrayResource csvResource = new ByteArrayResource(file.getBytes()) {
                @Override
                public String getFilename() {
                    return originalName;
                }
            };

            // Enforce application/octet-stream to match Old Code behavior strictly
            HttpHeaders partHeaders = new HttpHeaders();
            partHeaders.setContentType(MediaType.APPLICATION_OCTET_STREAM);
            HttpEntity<ByteArrayResource> filePart = new HttpEntity<>(csvResource, partHeaders);

            MultiValueMap<String, Object> body = new LinkedMultiValueMap<>();
            body.add("uploadedFile", filePart);

            HttpEntity<MultiValueMap<String, Object>> requestEntity = new HttpEntity<>(body, headers);

            // Configure RestTemplate with Timeouts (Good API Management)
            org.springframework.http.client.SimpleClientHttpRequestFactory factory = new org.springframework.http.client.SimpleClientHttpRequestFactory();
            factory.setConnectTimeout(10_000); // 10 seconds
            factory.setReadTimeout(60_000); // 60 seconds
            org.springframework.web.client.RestTemplate restTemplate = new org.springframework.web.client.RestTemplate(
                    factory);

            log.info("Sending Unicash CSV to: {}", url);
            ResponseEntity<String> response = restTemplate.exchange(
                    url,
                    HttpMethod.POST,
                    requestEntity,
                    String.class);

            String responseBody = response.getBody();
            log.info("Unicash API Response Status: {}", response.getStatusCode());
            log.info("Unicash API Response Body: {}", responseBody);

            // Construct a simple Map to return to frontend
            java.util.Map<String, Object> result = new java.util.HashMap<>();
            result.put("status", response.getStatusCode().value());
            result.put("message", responseBody != null ? responseBody : "No content from Unicash");

            return ResponseEntity.status(response.getStatusCode()).body(result);
        } catch (Exception e) {
            log.error("Failed to send CSV to Unicash", e);
            return ResponseEntity.internalServerError()
                    .body(new ErrorResponse("Failed to send CSV to Unicash: " + e.getMessage()));
        }
    }

    @GetMapping("/progress/{jobId}")
    public ResponseEntity<Map<String, Object>> getProgress(@PathVariable String jobId) {
        com.wbill.home.service.ProgressService.ProgressInfo info = progressService.get(jobId);
        if (info == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of(
                    "success", false,
                    "message", "Unknown jobId"));
        }
        return ResponseEntity.ok(Map.of(
                "success", true,
                "total", info.getTotal(),
                "processed", info.getProcessed(),
                "percent", info.getPercent(),
                "done", info.isDone(),
                "status", info.getStatus(),
                "message", info.getMessage()));
    }

    @GetMapping("/progress/{jobId}/logs")
    public ResponseEntity<Map<String, Object>> getProgressLogs(@PathVariable String jobId) {
        java.util.List<String> logs = progressService.getLogs(jobId);
        return ResponseEntity.ok(Map.of(
                "success", true,
                "logs", logs));
    }

    /**
     * Delete an active reading (mark deleted + void) and create a new reading row
     * using provided readings.
     */
    @PostMapping("/deleteAndRecreate")
    public ResponseEntity<?> deleteAndRecreate(@RequestBody UpdateReadingRequest request) {
        try {
            if (request.getId() == null) {
                return ResponseEntity.badRequest().body(new ErrorResponse("Reading ID is required"));
            }
            if (request.getPreviousReading() == null || request.getCurrentReading() == null) {
                return ResponseEntity.badRequest()
                        .body(new ErrorResponse("Both previousReading and currentReading are required"));
            }
            if (request.getPreviousReading() < 0 || request.getCurrentReading() < 0) {
                return ResponseEntity.badRequest().body(new ErrorResponse("Readings cannot be negative"));
            }
            if (request.getCurrentReading() < request.getPreviousReading()) {
                return ResponseEntity.badRequest()
                        .body(new ErrorResponse("Current reading cannot be less than previous reading"));
            }

            BillingReading newReading = readingService.deleteActiveAndCreateNewReading(
                    request.getId(), request.getPreviousReading(), request.getCurrentReading());

            return ResponseEntity.ok(Map.of(
                    "success", true,
                    "message", "Active reading deleted and new reading created",
                    "newReadingId", newReading.getId(),
                    "status", newReading.getStatus(),
                    "isVoid", newReading.isVoid()));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(new ErrorResponse(e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(new ErrorResponse("Internal error: " + e.getMessage()));
        }
    }

    @PostMapping("/bankpaymentsimport")
    public ResponseEntity<ImportReport> importBankPayments(
            @RequestParam("file") MultipartFile file,
            @RequestParam("kifyaWer") String kifyaWer) {
        if (file.isEmpty()) {
            ImportReport errorReport = new ImportReport();
            errorReport.getImportLogs().add("Please select a file to upload.");
            return new ResponseEntity<>(errorReport, HttpStatus.BAD_REQUEST);
        }
        try {
            ImportReport report = bankPaymentImportService.importPaymentsFromCsv(file, kifyaWer);
            return new ResponseEntity<>(report, HttpStatus.OK);
        } catch (Exception e) {
            ImportReport errorReport = new ImportReport();
            errorReport.getImportLogs().add("Error during file import: " + e.getMessage());
            return new ResponseEntity<>(errorReport, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    // In ReadingController.java
    @GetMapping("/BillByStatus/{status}")
    public ResponseEntity<List<BillingReadingDTO>> getReadingsByStatus(@PathVariable String status) {
        // System.out.println("Finding bill with status: " + status); // noisy log
        // commented out

        List<BillingReadingDTO> readings = readingService.getReadingsByStatusForList(status);
        return new ResponseEntity<>(readings, HttpStatus.OK);
    }
    //
    // @GetMapping("/status/{status}")
    // public ResponseEntity<List<BillingReadingDTO>>
    // getReadingsByStatus(@PathVariable String status) {
    // List<BillingReadingDTO> readings =
    // readingService.getReadingsByStatusForList(status);
    // return new ResponseEntity<>(readings, HttpStatus.OK);
    // }

    // @GetMapping("/customer/{customerId}")
    // public ResponseEntity<List<BillingReadingDTO>>
    // getReadingsByCustomerId(@PathVariable int customerId) {
    // List<BillingReadingDTO> readings =
    // readingService.getReadingsByCustomerIdForList(customerId);
    // return new ResponseEntity<>(readings, HttpStatus.OK);
    // }

    // Endpoint to get full reading details (if needed for a detail view)
    // @GetMapping("/{id}")
    // public ResponseEntity<BillingReading> getReadingDetails(@PathVariable int id)
    // {
    // Optional<BillingReading> reading = readingService.getReadingById(id);
    // return reading.map(ResponseEntity::ok)
    // .orElse(ResponseEntity.notFound().build());
    // }
    //
    // New detail endpoint: full reading entity + consumption breakdown
    @GetMapping("/readings/{id}/detail")
    public ResponseEntity<ReadingDetailResponseDTO> getReadingDetailWithConsumption(@PathVariable int id) {
        return readingService.getReadingDetailWithConsumption(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.status(HttpStatus.NOT_FOUND).build());
    }

    // New Endpoint: Fetch readings by status AND kifyaWer (using RequestParams)
    // Example URL: /api/readings/filtered?status=ACTIVE&kifyaWer=Jan
    @GetMapping("/filtered")
    public ResponseEntity<List<BillingReadingDTO>> getReadingsFiltered(
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String kifyaWer,
            @RequestParam(required = false) Integer customerId // Example: If you want to combine filters
    ) {
        // System.out.println("bill test"); // noisy log commented out
        List<BillingReadingDTO> readings;
        if (customerId != null && status != null && kifyaWer != null) {
            readings = readingService.getReadingsByCustomerIdAndStatusAndKifyaWerForList(customerId, status, kifyaWer);
        } else if (status != null && kifyaWer != null) {
            readings = readingService.getReadingsByStatusAndKifyaWerForList(status, kifyaWer);
        } else if (status != null) {
            // Re-use your existing service method for status only
            readings = readingService.getReadingsByStatusForList(status);
        } else if (kifyaWer != null) {
            // You'd need a new repository/service method for kifyaWer only if this
            // combination is desired
            // For now, this branch would require you to add that
            throw new UnsupportedOperationException("Fetching by kifyaWer alone is not yet implemented.");
        } else if (customerId != null) {
            // System.out.println("Finding bill for a customer : " + customerId); // noisy
            // log commented out

            readings = readingService.getReadingsByCustomerId(customerId);
        }

        else {
            readings = readingService.getAllReadingsForList(); // Fallback to all readings if no filters
        }
        return new ResponseEntity<>(readings, HttpStatus.OK);
    }

    @GetMapping("/Billfiltered")
    public ResponseEntity<List<BillingReadingDTO>> getReadingsFilteredBill(
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String kifyaWer,
            @RequestParam(required = false) Integer customerId // Example: If you want to combine filters
    ) {
        // System.out.println("bill test"); // noisy log commented out
        List<BillingReadingDTO> readings;
        if (customerId != null && status != null && kifyaWer != null) {
            readings = readingService.getReadingsByCustomerIdAndStatusAndKifyaWerForList(customerId, status, kifyaWer);
        } else if (status != null && kifyaWer != null) {
            readings = readingService.getBillReadingsByStatusAndKifyaWerForList(status, kifyaWer);
            // Verbose diagnostic logging block removed to reduce noise and avoid unused
            // variable warnings
        } else if (status != null) {
            // Re-use your existing service method for status only
            readings = readingService.getReadingsByStatusForList(status);
        } else if (kifyaWer != null) {
            // You'd need a new repository/service method for kifyaWer only if this
            // combination is desired
            // For now, this branch would require you to add that
            throw new UnsupportedOperationException("Fetching by kifyaWer alone is not yet implemented.");
        } else {
            readings = readingService.getAllReadingsForList(); // Fallback to all readings if no filters
        }
        return new ResponseEntity<>(readings, HttpStatus.OK);
    }

    // Fast O(1) index-backed count of generated bills for selected period (for KPI executive summaries)
    @GetMapping("/bills-count")
    public ResponseEntity<Long> getBilledReadingsCount(
            @RequestParam(required = false, defaultValue = "ACTIVE") String status,
            @RequestParam String kifyaWer
    ) {
        long count = readingService.countBaseReadingsByStatusAndKifyaWerNative(status, kifyaWer);
        return ResponseEntity.ok(count);
    }

    // Fast distinct billing periods from database
    @GetMapping("/distinct-kifya-wer")
    public ResponseEntity<List<String>> getDistinctKifyaWerList() {
        List<String> list = readingService.getDistinctKifyaWerList();
        return ResponseEntity.ok(list);
    }

    // New: Helper for Bill Support Page that allows VOID bills
    @GetMapping("/BillFilteredSupport")
    public ResponseEntity<List<BillingReadingDTO>> getReadingsFilteredBillSupport(
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String kifyaWer) {

        List<BillingReadingDTO> readings;
        if (status != null && kifyaWer != null) {
            readings = readingService.getSupportPageReadingsByStatusAndKifyaWerList(status, kifyaWer);
        } else if (status != null) {
            // Re-use your existing service method for status only
            readings = readingService.getReadingsByStatusForList(status);
        } else {
            readings = readingService.getAllReadingsForList(); // Fallback to all readings if no filters
        }
        return new ResponseEntity<>(readings, HttpStatus.OK);
    }

    @GetMapping("/BillFilteredSupportMerged")
    public ResponseEntity<List<BillingReadingDTO>> getBillFilteredSupportMerged(
            @RequestParam String kifyaWer) {
        List<BillingReadingDTO> activeSupport = readingService.getSupportPageReadingsByStatusAndKifyaWerList("ACTIVE", kifyaWer);
        List<BillingReadingDTO> deletedSupport = readingService.getSupportPageReadingsByStatusAndKifyaWerList("DELETED", kifyaWer);
        List<BillingReadingDTO> deletedFiltered = readingService.getReadingsByStatusAndKifyaWerForList("DELETED", kifyaWer);

        java.util.Map<Integer, BillingReadingDTO> map = new java.util.LinkedHashMap<>();
        if (activeSupport != null) {
            for (BillingReadingDTO dto : activeSupport) {
                if (dto.getId() != 0) map.put(dto.getId(), dto);
            }
        }
        if (deletedSupport != null) {
            for (BillingReadingDTO dto : deletedSupport) {
                if (dto.getId() != 0) map.put(dto.getId(), dto);
            }
        }
        if (deletedFiltered != null) {
            for (BillingReadingDTO dto : deletedFiltered) {
                if (dto.getId() != 0) map.put(dto.getId(), dto);
            }
        }

        return new ResponseEntity<>(new java.util.ArrayList<>(map.values()), HttpStatus.OK);
    }


    // New: Reading Management Page — skip isBillGenerated filter
    @GetMapping("/ReadingManagement")
    public ResponseEntity<List<BillingReadingDTO>> getReadingsForReadingManagement(
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String kifyaWer) {

        List<BillingReadingDTO> readings;
        if (status != null && kifyaWer != null) {
            readings = readingService.getReadingManagementByStatusAndKifyaWerList(status, kifyaWer);
        } else if (status != null) {
            readings = readingService.getReadingsByStatusForList(status);
        } else {
            readings = readingService.getAllReadingsForList();
        }
        return new ResponseEntity<>(readings, HttpStatus.OK);
    }

    // Small helper to safely stringify values for logs
    private static String safe(Object o) {
        try {
            return String.valueOf(o);
        } catch (Exception e) {
            return "null";
        }
    }

    // ... (existing DTO endpoints) ...
    //
    // @PostMapping("/readingsimport")
    // public ResponseEntity<List<String>> importReadings(
    // @RequestParam("file") MultipartFile file,
    // @RequestParam("kifyaWer") String kifyaWer // e.g., "መጋቢት, 2017"
    // ) {
    // System.out.println("importing");
    // if (file.isEmpty()) {
    // return new ResponseEntity<>(List.of("Please select a file to upload."),
    // HttpStatus.BAD_REQUEST);
    // }
    // try {
    // List<String> logs = importService.importReadingsFromExcel(file, kifyaWer);
    // return new ResponseEntity<>(logs, HttpStatus.OK);
    // } catch (Exception e) {
    // return new ResponseEntity<>(List.of("Error during file import: " +
    // e.getMessage()), HttpStatus.INTERNAL_SERVER_ERROR);
    // }
    // }
    //

    // ... (existing DTO endpoints) ...

    @PostMapping("/readingsimport")
    public ResponseEntity<ImportReport> importReadings( // Changed return type to ImportReport
            @RequestParam("file") MultipartFile file,
            @RequestParam("kifyaWer") String kifyaWer) {
        if (file.isEmpty()) {
            ImportReport errorReport = new ImportReport();
            errorReport.getImportLogs().add("Please select a file to upload.");
            return new ResponseEntity<>(errorReport, HttpStatus.BAD_REQUEST);
        }
        try {
            ImportReport report = billingReadingImportService.importReadingsFromExcel(file, kifyaWer);
            return new ResponseEntity<>(report, HttpStatus.OK);
        } catch (Exception e) {
            ImportReport errorReport = new ImportReport();
            errorReport.getImportLogs().add("Error during file import: " + e.getMessage());
            return new ResponseEntity<>(errorReport, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @GetMapping("/filteredSimplified")
    public ResponseEntity<List<SimplifiedReadingDTO>> getSimplifiedReadingsFiltered(
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String kifyaWer) {

        List<SimplifiedReadingDTO> readings = readingService
                .getFilteredSimplifiedReadingsWhereBillNotGenerated(status, kifyaWer);

        return new ResponseEntity<>(readings, HttpStatus.OK);
    }

    // POST endpoint to add a new reading
    //
    // public ResponseEntity<BillingReading> createReading(@RequestBody
    // ReadingUpdateDTO readingDTO) {
    // System.out.println("new read"+readingDTO);
    // try {
    // BillingReading newReading = readingService.createReading(readingDTO);
    // return ResponseEntity.ok(newReading);
    // } catch (Exception e) {
    // // Return a more informative error response
    // return ResponseEntity.badRequest().body(null);
    // }
    // }

    public static class ErrorResponse {
        private String message;

        public ErrorResponse(String message) {
            this.message = message;
        }

        public String getMessage() {
            return message;
        }

        public void setMessage(String message) {
            this.message = message;
        }
    }

    @PostMapping
    public ResponseEntity<?> createReading(@RequestBody ReadingUpdateDTO readingRequest) {
        try {
            // System.out.println(readingRequest.getCustomerAccountNumber() +"new reading
            // test 1");
            // Convert request DTO to service DTO
            // System.out.println("new reading test
            // 1"+readingRequest.getCustomerAccountNumber());
            ReadingUpdateDTO readingDTO = new ReadingUpdateDTO();
            readingDTO.setCustomerAccountNumber(readingRequest.getCustomerAccountNumber());
            readingDTO.setLastReading(readingRequest.getLastReading());
            readingDTO.setKifyaWer(readingRequest.getKifyaWer());

            BillingReading createdReading = billingReadingImportService.createReading(readingDTO);
            // Map the saved entity back to a DTO for response
            ReadingUpdateDTO responseDto = ReadingUpdateDTO.from(createdReading);
            return ResponseEntity.ok(responseDto);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(new ErrorResponse(e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.internalServerError()
                    .body(new ErrorResponse("Failed to create reading: " + e.getMessage()));
        }
    }

    // PUT endpoint to update a reading
    @PutMapping("/{id}")
    public ResponseEntity<?> updateReading(@PathVariable Integer id, @RequestBody ReadingUpdateDTO readingDTO) {
        try {
            BillingReading updatedReading = readingService.updateReading(id, readingDTO);
            // Convert to DTO to avoid circular reference serialization issues
            ReadingUpdateDTO responseDto = ReadingUpdateDTO.from(updatedReading);
            return ResponseEntity.ok(responseDto);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    // DELETE endpoint to delete a reading
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteReading(@PathVariable Integer id) {
        readingService.deleteReading(id);
        return ResponseEntity.noContent().build();
    }

    /**
     * Gets the last reading from the previous billing period (kifyaWer).
     *
     * @param accountNumber The customer's account number.
     * @param kifyaWer      The current billing period (e.g., "ሐምሌ, 2017").
     * @return A DTO containing the previous reading value.
     */
    @GetMapping("/previous-reading")
    public ResponseEntity<PreviousReadingDTO> getPreviousReading(
            @RequestParam String accountNumber,
            @RequestParam("kifyaWer") String currentKifyaWer) {
        int reading = billingReadingImportService.getPreviousReadingForCustomerOnly(accountNumber, currentKifyaWer);

        PreviousReadingDTO dto = new PreviousReadingDTO(reading);

        // PreviousReadingDTO previousReading =
        // billingCustomerInfoService.getPreviousReadingForCustomer(accountNumber,
        // currentKifyaWer);
        return ResponseEntity.ok(dto);
    }

    /**
     * Gets the last reading from the previous billing period (kifyaWer).
     *
     * @param accountNumber The customer's account number.
     * @param kifyaWer      The current billing period (e.g., "ሐምሌ, 2017").
     * @return A DTO containing the previous reading value.
     */
    @GetMapping("/previous-reading-bill")
    public ResponseEntity<PreviousReadingBillDTO> getPreviousReadingbill(
            @RequestParam String accountNumber,
            @RequestParam("kifyaWer") String currentKifyaWer) {
        try {
            PreviousReadingBillDTO dto = billingReadingImportService
                    .getPreviousReadingForCustomerOnlybill(accountNumber, currentKifyaWer);
            return ResponseEntity.ok(dto);
        } catch (EntityNotFoundException ex) {
            // Controlled 404 when account not found (frontend can handle gracefully)
            return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
        }
    }

    // Endpoint to change reading status and update readings (support POST and
    // PATCH)
    @PostMapping("/readingStatusChanger")
    @PatchMapping("/readingStatusChanger")
    public ResponseEntity<?> changeReadingStatus(@RequestBody UpdateReadingRequest request) {
        try {
            // System.out.println("change reading status request: " + request); // noisy log
            // commented out

            if (request.getId() == null || request.getStatus() == null) {
                return ResponseEntity.badRequest()
                        .body(new ErrorResponse("Reading ID and status are required"));
            }

            // For new reading creation, validate and update previous reading if provided
            if (request.getPreviousReading() != null && request.getCurrentReading() != null) {
                if (request.getCurrentReading() < request.getPreviousReading()) {
                    return ResponseEntity.badRequest()
                            .body(new ErrorResponse("Current reading cannot be less than previous reading"));
                }
                if (request.getCurrentReading() < 0 || request.getPreviousReading() < 0) {
                    return ResponseEntity.badRequest()
                            .body(new ErrorResponse("Readings cannot be negative"));
                }
            }

            BillingReading updatedReading = readingService.changeReadingStatus(
                    request.getId(),
                    request.getStatus(),
                    request.getPreviousReading(),
                    request.getCurrentReading());

            return ResponseEntity.ok(Map.of(
                    "success", true,
                    "message", "Reading updated successfully",
                    "readingId", updatedReading.getId(),
                    "newStatus", updatedReading.getStatus(),
                    "previousReading", updatedReading.getPreviousReading(),
                    "currentReading", updatedReading.getLastReading()));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest()
                    .body(new ErrorResponse("Failed to update reading status: " + e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.internalServerError()
                    .body(new ErrorResponse("Internal error: " + e.getMessage()));
        }
    }

    // ===================== Derash Bank Payments: Fetch & Process
    // =====================
    @org.springframework.beans.factory.annotation.Autowired
    private com.wbill.home.service.BankPaymentDerashFlowService bankPaymentDerashFlowService;

    @org.springframework.beans.factory.annotation.Autowired
    private CompanyProfileRepository companyProfileRepository;

    @Value("${storage.derash-csv-dir:src/main/resources/static/derash-csv}")
    private String storageDir;

    @org.springframework.beans.factory.annotation.Autowired
    private com.wbill.home.service.BankPaymentUnicashFlowService bankPaymentUnicashFlowService;

    @Value("${storage.unicash-csv-dir:src/main/resources/static/unicash-csv}")
    private String unicashStorageDir;

    @Value("${storage.mobile-csv-dir:src/main/resources/static/mobile-csv}")
    private String mobileCsvStorageDir;

    @org.springframework.beans.factory.annotation.Autowired
    private com.wbill.home.service.BankPaymentMardaArifFlowService bankPaymentMardaArifFlowService;

    @Value("${storage.mardaarif-csv-dir:src/main/resources/static/mardaarif-csv}")
    private String mardaarifStorageDir;

    private static String escapeCsvField(Object value) {
        if (value == null) {
            return "";
        }
        String s = String.valueOf(value);
        if (s.contains(",") || s.contains("\n") || s.contains("\"")) {
            s = s.replace("\"", "\"\"");
            return "\"" + s + "\"";
        }
        return s;
    }

    @PostMapping("/submit-bill-to-derash")
    public ResponseEntity<?> submitBillToDerash(@RequestBody com.wbill.home.dto.DerashBillSubmissionDTO billData) {
        try {
            if (billData == null) {
                return ResponseEntity.badRequest().body(new ErrorResponse("Bill data is required"));
            }

            // Validate required fields
            if (billData.getBillId() == null || billData.getBillId().trim().isEmpty()) {
                return ResponseEntity.badRequest().body(new ErrorResponse("bill_id is required"));
            }
            if (billData.getName() == null || billData.getName().trim().isEmpty()) {
                return ResponseEntity.badRequest().body(new ErrorResponse("name is required"));
            }
            if (billData.getAmountDue() == null || billData.getAmountDue().trim().isEmpty()) {
                return ResponseEntity.badRequest().body(new ErrorResponse("amount_due is required"));
            }
            if (billData.getDueDate() == null || billData.getDueDate().trim().isEmpty()) {
                return ResponseEntity.badRequest().body(new ErrorResponse("due_date is required"));
            }
            if (billData.getReason() == null || billData.getReason().trim().isEmpty()) {
                return ResponseEntity.badRequest().body(new ErrorResponse("reason is required"));
            }

            // Get Derash configuration
            com.wbill.home.model.CompanyProfile companyProfile = companyProfileRepository.findById(9).orElse(null);
            if (companyProfile == null) {
                return ResponseEntity.ok(java.util.Map.of(
                        "success", false,
                        "message", "Company profile ID 9 not found"));
            }

            String baseUrl = companyProfile.getdCompanyUri();
            String apiKey = companyProfile.getdCompanyKey();
            String apiSecret = companyProfile.getdCompanySecret();

            if (baseUrl == null || apiKey == null || apiSecret == null) {
                return ResponseEntity.ok(java.util.Map.of(
                        "success", false,
                        "message", "Derash configuration incomplete"));
            }

            // Prepare the Derash API request
            String derashUrl = UriComponentsBuilder.fromHttpUrl(baseUrl.trim())
                    .pathSegment("customer-bill-data")
                    .toUriString();

            HttpHeaders headers = new HttpHeaders();
            headers.set("api-key", apiKey.trim());
            headers.set("api-secret", apiSecret.trim());
            headers.set(HttpHeaders.CONTENT_TYPE, MediaType.APPLICATION_JSON_VALUE);

            // Build exact payload with snake_case keys to match Derash format
            java.util.Map<String, Object> payload = new java.util.LinkedHashMap<>();
            payload.put("bill_id", billData.getBillId());
            payload.put("bill_desc", billData.getBillDesc());
            payload.put("reason", billData.getReason());
            payload.put("amount_due", billData.getAmountDue());
            payload.put("due_date", billData.getDueDate());
            payload.put("partial_pay_allowed",
                    billData.getPartialPayAllowed() != null ? billData.getPartialPayAllowed() : Boolean.TRUE);
            payload.put("customer_id", billData.getCustomerId());
            payload.put("name", billData.getName());
            payload.put("mobile", billData.getMobile());
            payload.put("email", billData.getEmail());

            // Log payload for comparison
            try {
                String json = new ObjectMapper().writeValueAsString(payload);
                log.info("Derash single-bill payload: {}", json);
            } catch (Exception ie) {
                log.warn("Failed to serialize Derash payload for logging: {}", ie.getMessage());
            }

            // Make the API call
            org.springframework.web.client.RestTemplate restTemplate = new org.springframework.web.client.RestTemplate();
            ResponseEntity<java.util.Map> response;
            try {
                response = restTemplate.exchange(
                        derashUrl,
                        HttpMethod.POST,
                        new HttpEntity<>(payload, headers),
                        java.util.Map.class);
            } catch (org.springframework.web.client.RestClientResponseException httpEx) {
                String body = httpEx.getResponseBodyAsString();
                log.error("Derash single-bill HTTP error status={} body={}", httpEx.getRawStatusCode(), body);
                return ResponseEntity.status(HttpStatus.BAD_GATEWAY).body(java.util.Map.of(
                        "success", false,
                        "message", "Derash API HTTP error: " + httpEx.getStatusCode(),
                        "status", httpEx.getRawStatusCode(),
                        "body", body != null ? body : ""));
            }

            if (response.getStatusCode() == org.springframework.http.HttpStatus.OK) {
                java.util.Map responseBody = response.getBody();
                try {
                    // Mark the corresponding local bill as sent to bank
                    readingService.markBillSentToBankByBillId(billData.getBillId());
                } catch (Exception ignore) {
                    // Do not fail the API just because of local flag update issues
                }
                return ResponseEntity.ok(java.util.Map.of(
                        "success", true,
                        "bill_id", responseBody != null ? responseBody.get("bill_id") : billData.getBillId(),
                        "confirmation_code", responseBody != null ? responseBody.get("confirmation_code") : null,
                        "message", "Bill successfully submitted to Derash"));
            } else {
                log.error("Derash single-bill unexpected status={}, body={}", response.getStatusCode(),
                        response.getBody());
                return ResponseEntity.ok(java.util.Map.of(
                        "success", false,
                        "message", "Derash API returned status: " + response.getStatusCode(),
                        "status", response.getStatusCodeValue(),
                        "body", response.getBody()));
            }

        } catch (Exception e) {
            log.error("Failed to submit bill to Derash", e);
            return ResponseEntity.internalServerError()
                    .body(new ErrorResponse("Failed to submit bill to Derash: " + e.getMessage()));
        }
    }

    // ===================== Legacy Mobile CSV for Readers =====================

    @PostMapping("/mobile-csv/prepare")
    public ResponseEntity<?> prepareMobileCsvForReader(@RequestBody MobileCsvPrepareRequestDTO request) {
        try {
            if (request == null || request.getReaderId() == null || request.getKifyaWerEng() == null
                    || request.getKifyaWerEng().isBlank()) {
                return ResponseEntity.badRequest().body(new ErrorResponse("readerId and kifyaWerEng are required"));
            }

            java.util.List<ZpiMobileReadingRequestDTO> rows = request.getRows();
            if (rows == null || rows.isEmpty()) {
                return ResponseEntity.badRequest().body(new ErrorResponse("rows must not be empty"));
            }

            CompanyProfile companyProfile = companyProfileRepository.findById(9).orElse(null);
            String kifyaWerFromCompany = null;
            if (companyProfile != null && companyProfile.getActiveReadingDate() != null) {
                kifyaWerFromCompany = EthiopianCalendarUtil.formatMonthYear(companyProfile.getActiveReadingDate());
            }

            java.util.Optional<UserAccount> userOpt = userAccountRepository.findById(request.getReaderId());
            if (userOpt.isEmpty()) {
                return ResponseEntity.badRequest()
                        .body(new ErrorResponse("Reader not found for id=" + request.getReaderId()));
            }

            UserAccount reader = userOpt.get();
            String username = reader.getUserName();
            if (username == null || username.isBlank()) {
                username = "reader_" + reader.getId();
            }
            username = username.replaceAll("[^A-Za-z0-9_-]", "_");

            String kifyaWerEngSafe = request.getKifyaWerEng().replaceAll("[^A-Za-z0-9_-]", "_");
            String randomPart = String.format("%09d", new java.util.Random().nextInt(1_000_000_000));
            String fileName = username + "_" + kifyaWerEngSafe + "_" + randomPart + ".csv";

            Path dir = Paths.get(mobileCsvStorageDir);
            Files.createDirectories(dir);
            Path target = dir.resolve(fileName);

            try (java.io.OutputStream out = Files.newOutputStream(target);
                    java.io.OutputStreamWriter osw = new java.io.OutputStreamWriter(out, StandardCharsets.UTF_8);
                    BufferedWriter writer = new BufferedWriter(osw)) {

                // Write UTF-8 BOM so tools like WPS correctly detect encoding for Amharic text
                out.write(0xEF);
                out.write(0xBB);
                out.write(0xBF);

                writer.write(
                        "customer_info_id,consumption,maximumreading,wuzif_hisab,wuzif_kezih_eske,kifya_wer,additional_text");
                writer.newLine();
                for (ZpiMobileReadingRequestDTO row : rows) {
                    if (row == null)
                        continue;
                    // Override kifya_wer from frontend with server-side value derived from
                    // activeBillingMonth, if available
                    String effectiveKifyaWer = kifyaWerFromCompany != null ? kifyaWerFromCompany : row.getKifyaWer();
                    String line = String.join(",",
                            escapeCsvField(row.getCustomerInfoId()),
                            escapeCsvField(row.getConsumption()),
                            escapeCsvField(row.getMaximumreading()),
                            escapeCsvField(row.getWuzifHisab()),
                            escapeCsvField(row.getWuzifKezihEske()),
                            effectiveKifyaWer != null ? effectiveKifyaWer : "",
                            escapeCsvField(row.getAdditionalText()));
                    writer.write(line);
                    writer.newLine();
                }
            }

            reader.setPreviousMonthCsvFileName(fileName);
            userAccountRepository.save(reader);

            return ResponseEntity.ok(java.util.Map.of(
                    "success", true,
                    "fileName", fileName,
                    "rowCount", rows.size()));
        } catch (Exception e) {
            log.error("Failed to prepare mobile CSV for reader", e);
            return ResponseEntity.internalServerError()
                    .body(new ErrorResponse("Failed to prepare mobile CSV: " + e.getMessage()));
        }
    }

    @PostMapping("/submit-bill-to-unicash")
    public ResponseEntity<?> submitBillToUnicash(@RequestBody UnicashBillSubmissionDTO billData) {
        try {
            java.util.Map<String, Object> resp = readingService.submitUnicashBill(billData);

            return ResponseEntity.ok(java.util.Map.of(
                    "success", true,
                    "bill_id", billData.getBillId(),
                    "response", resp,
                    "message", "Bill successfully submitted to Unicash"));
        } catch (Exception e) {
            log.error("Failed to submit bill to Unicash", e);
            return ResponseEntity.internalServerError()
                    .body(new ErrorResponse("Failed to submit bill to Unicash: " + e.getMessage()));
        }
    }

    @PostMapping("/derash/update-bills")
    public ResponseEntity<?> extendBillsWithPenalty(@RequestBody DerashBankExtendRequestDTO request) {
        try {
            if (request == null || request.getReadingIds() == null || request.getReadingIds().isEmpty()) {
                return ResponseEntity.badRequest().body(new ErrorResponse("readingIds cannot be empty"));
            }
            if (request.getDueDate() == null || request.getDueDate().trim().isEmpty()) {
                return ResponseEntity.badRequest().body(new ErrorResponse("dueDate is required (yyyy-MM-dd)"));
            }
            java.time.LocalDate due = java.time.LocalDate.parse(request.getDueDate().trim());
            int updatedCount = readingService.extendBankBillsWithPenalty(
                    request.getReadingIds(),
                    request.getExtraPenalty(),
                    due);
            return ResponseEntity.ok(BulkUpdateResponseDTO.success(updatedCount));
        } catch (Exception e) {
            return ResponseEntity.internalServerError()
                    .body(BulkUpdateResponseDTO.error("Failed to update bills: " + e.getMessage()));
        }
    }

    @PostMapping("/unicash/update-bills")
    public ResponseEntity<?> extendUnicashBillsWithPenalty(@RequestBody UnicashBankExtendRequestDTO request) {
        try {
            if (request.getReadingIds() == null || request.getReadingIds().isEmpty()) {
                return ResponseEntity.badRequest().body(new ErrorResponse("readingIds cannot be empty"));
            }
            if (request.getDueDate() == null || request.getDueDate().trim().isEmpty()) {
                return ResponseEntity.badRequest().body(new ErrorResponse("dueDate is required"));
            }
            java.time.LocalDate due = java.time.LocalDate.parse(request.getDueDate().trim());

            int updatedCount = readingService.extendUnicashBillsWithPenalty(
                    request.getReadingIds(),
                    request.getExtraPenalty(),
                    due);

            return ResponseEntity.ok(BulkUpdateResponseDTO.success(updatedCount));
        } catch (Exception e) {
            return ResponseEntity.internalServerError()
                    .body(BulkUpdateResponseDTO.error("Failed to update Unicash bills: " + e.getMessage()));
        }
    }

    @PostMapping("/unicash/update-bills-local")
    public ResponseEntity<?> updateBillsLocallyWithPenalty(@RequestBody UnicashBankExtendRequestDTO request) {
        try {
            if (request.getReadingIds() == null || request.getReadingIds().isEmpty()) {
                return ResponseEntity.badRequest().body(new ErrorResponse("readingIds cannot be empty"));
            }
            if (request.getDueDate() == null || request.getDueDate().trim().isEmpty()) {
                return ResponseEntity.badRequest().body(new ErrorResponse("dueDate is required"));
            }
            java.time.LocalDate due = java.time.LocalDate.parse(request.getDueDate().trim());

            int updatedCount = readingService.updateBillsLocallyWithPenalty(
                    request.getReadingIds(),
                    request.getExtraPenalty(),
                    due);

            return ResponseEntity.ok(BulkUpdateResponseDTO.success(updatedCount));
        } catch (Exception e) {
            return ResponseEntity.internalServerError()
                    .body(BulkUpdateResponseDTO.error("Failed to update local bills: " + e.getMessage()));
        }
    }

    @PostMapping("/unicash/update-bills-bulk-file")
    public ResponseEntity<?> forwardBulkUpdateCsvToUnicash(@RequestParam("file") MultipartFile file) {
        try {
            if (file == null || file.isEmpty()) {
                return ResponseEntity.badRequest().body(new ErrorResponse("CSV file is required"));
            }

            com.wbill.home.model.CompanyProfile companyProfile = companyProfileRepository.findById(9).orElse(null);
            if (companyProfile == null) {
                return ResponseEntity.badRequest().body(new ErrorResponse("Company profile ID 9 not found"));
            }

            String baseUrl = companyProfile.getuCompanyUri();
            String apiKey = companyProfile.getuCompanyKey();

            if (baseUrl == null || baseUrl.isBlank() || apiKey == null) {
                return ResponseEntity.badRequest().body(new ErrorResponse("Unicash configuration incomplete"));
            }

            // Optional: Handle saving to disk for audit if requested, but don't fail if it
            // fails
            try {
                Files.createDirectories(Paths.get(unicashStorageDir));
                String tmpOriginalName = file.getOriginalFilename();
                String originalName = (tmpOriginalName == null || tmpOriginalName.isBlank()) ? "bulk_update.csv"
                        : tmpOriginalName;
                String timestamp = LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyyMMdd_HHmmss"));
                String storageFilename = "unicash_update_" + timestamp + "_" + originalName;
                Path storagePath = Paths.get(unicashStorageDir, storageFilename);
                Files.copy(file.getInputStream(), storagePath);
                log.info("Saved audit copy of Unicash Bulk Update CSV to: {}", storagePath.toAbsolutePath());
            } catch (Exception e) {
                log.warn("Failed to save audit copy of CSV: {}. Proceeding with gateway call.", e.getMessage());
            }

            String url = UriComponentsBuilder.fromHttpUrl(baseUrl.trim())
                    .path("BillIntegrationResource/bulkBillUpdate")
                    .queryParam("API_KEY", apiKey.trim())
                    .toUriString();

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.MULTIPART_FORM_DATA);
            headers.add("API_KEY", apiKey.trim());

            final String finalName = (file.getOriginalFilename() == null || file.getOriginalFilename().isBlank())
                    ? "bulk_update.csv"
                    : file.getOriginalFilename();
            ByteArrayResource csvResource = new ByteArrayResource(file.getBytes()) {
                @Override
                public String getFilename() {
                    return finalName;
                }
            };

            HttpHeaders partHeaders = new HttpHeaders();
            partHeaders.setContentType(MediaType.APPLICATION_OCTET_STREAM);
            HttpEntity<ByteArrayResource> filePart = new HttpEntity<>(csvResource, partHeaders);

            MultiValueMap<String, Object> body = new LinkedMultiValueMap<>();
            body.add("uploadedFile", filePart);

            HttpEntity<MultiValueMap<String, Object>> requestEntity = new HttpEntity<>(body, headers);

            org.springframework.http.client.SimpleClientHttpRequestFactory factory = new org.springframework.http.client.SimpleClientHttpRequestFactory();
            factory.setConnectTimeout(10_000);
            factory.setReadTimeout(60_000);
            org.springframework.web.client.RestTemplate restTemplate = new org.springframework.web.client.RestTemplate(
                    factory);

            log.info("Sending Unicash Bulk Update CSV to: {}", url);
            ResponseEntity<String> response = restTemplate.exchange(
                    url,
                    HttpMethod.POST,
                    requestEntity,
                    String.class);

            String responseBody = response.getBody();
            log.info("Unicash Bulk Update Response Body: {}", responseBody);

            java.util.Map<String, Object> result = new java.util.HashMap<>();
            result.put("success", true);
            result.put("message", "Bulk update file sent to Unicash");
            result.put("upstreamResponse", responseBody);

            return ResponseEntity.ok(result);

        } catch (Exception e) {
            log.error("Failed to upload bulk update CSV to Unicash", e);
            return ResponseEntity.internalServerError()
                    .body(new ErrorResponse("Failed to send CSV to Unicash: " + e.getMessage()));
        }
    }

    @PostMapping("/derash/cancel-bills")
    public ResponseEntity<?> cancelBills(@RequestBody DerashMarkSentRequestDTO request) {
        try {
            if (request == null || request.getReadingIds() == null || request.getReadingIds().isEmpty()) {
                return ResponseEntity.badRequest().body(new ErrorResponse("readingIds cannot be empty"));
            }
            int updatedCount = readingService.cancelBankBills(request.getReadingIds());
            return ResponseEntity.ok(BulkUpdateResponseDTO.success(updatedCount));
        } catch (Exception e) {
            return ResponseEntity.internalServerError()
                    .body(BulkUpdateResponseDTO.error("Failed to cancel bills: " + e.getMessage()));
        }
    }

    @PostMapping("/unicash/cancel-bills")
    public ResponseEntity<?> cancelUnicashBills(@RequestBody UnicashMarkSentRequestDTO request) {
        try {
            if (request == null || request.getReadingIds() == null || request.getReadingIds().isEmpty()) {
                return ResponseEntity.badRequest().body(new ErrorResponse("readingIds cannot be empty"));
            }
            int updatedCount = readingService.cancelUnicashBills(request.getReadingIds());
            return ResponseEntity.ok(BulkUpdateResponseDTO.success(updatedCount));
        } catch (Exception e) {
            return ResponseEntity.internalServerError()
                    .body(BulkUpdateResponseDTO.error("Failed to cancel Unicash bills: " + e.getMessage()));
        }
    }

    @PostMapping("/derash/mark-sent")
    public ResponseEntity<?> markBillsSentToBank(@RequestBody DerashMarkSentRequestDTO request) {
        try {
            if (request == null || request.getReadingIds() == null || request.getReadingIds().isEmpty()) {
                return ResponseEntity.badRequest().body(new ErrorResponse("readingIds cannot be empty"));
            }
            int updatedCount = readingService.markBillsSentToBank(request.getReadingIds());
            return ResponseEntity.ok(BulkUpdateResponseDTO.success(updatedCount));
        } catch (Exception e) {
            return ResponseEntity.internalServerError()
                    .body(BulkUpdateResponseDTO.error("Failed to mark bills as sent: " + e.getMessage()));
        }
    }

    @PostMapping("/unicash/mark-sent")
    public ResponseEntity<?> markBillsSentToUnicash(@RequestBody UnicashMarkSentRequestDTO request) {
        try {
            if (request == null || request.getReadingIds() == null || request.getReadingIds().isEmpty()) {
                return ResponseEntity.badRequest().body(new ErrorResponse("readingIds cannot be empty"));
            }
            int updatedCount = readingService.markBillsSentToUnicash(request.getReadingIds());
            return ResponseEntity.ok(BulkUpdateResponseDTO.success(updatedCount));
        } catch (Exception e) {
            return ResponseEntity.internalServerError()
                    .body(BulkUpdateResponseDTO.error("Failed to mark Unicash bills as sent: " + e.getMessage()));
        }
    }

    @PostMapping("/bank-payments/fetch")
    public ResponseEntity<?> fetchDerashBankPayments(@RequestBody com.wbill.home.dto.BankFetchRequest req) {
        try {
            if (req == null || req.getFromDate() == null || req.getToDate() == null) {
                return ResponseEntity.badRequest()
                        .body(new ErrorResponse("fromDate and toDate are required (yyyy-MM-dd)"));
            }
            String savedPath = bankPaymentDerashFlowService.fetchAndSaveCsv(req.getFromDate(), req.getToDate());
            String publicUrl = bankPaymentDerashFlowService.getPublicCsvUrl(req.getFromDate(), req.getToDate());
            return ResponseEntity.ok(java.util.Map.of(
                    "success", true,
                    "file", savedPath,
                    "publicUrl", publicUrl != null ? publicUrl : ""));
        } catch (org.springframework.web.client.RestClientResponseException httpEx) {
            String body = httpEx.getResponseBodyAsString();
            String message = null;
            try {
                com.fasterxml.jackson.databind.ObjectMapper om = new com.fasterxml.jackson.databind.ObjectMapper();
                java.util.Map<?, ?> m = om.readValue(body, java.util.Map.class);
                Object msg = m.get("message");
                message = msg != null ? msg.toString() : null;
            } catch (Exception ignore) {
            }
            if (message == null || message.isEmpty()) {
                message = httpEx.getMessage();
            }
            return ResponseEntity.status(httpEx.getStatusCode()).body(new ErrorResponse(message));
        } catch (Exception e) {
            System.err.println("=== FETCH ERROR ===");
            e.printStackTrace();
            return ResponseEntity.internalServerError().body(new ErrorResponse("Failed to fetch: " + e.getMessage()));
        }
    }

    @PostMapping("/unicash-bank-payments/fetch")
    public ResponseEntity<?> fetchUnicashBankPayments(@RequestBody com.wbill.home.dto.BankFetchRequest req) {
        try {
            if (req == null || req.getFromDate() == null || req.getToDate() == null) {
                return ResponseEntity.badRequest()
                        .body(new ErrorResponse("fromDate and toDate are required (yyyy-MM-dd)"));
            }
            String savedPath = bankPaymentUnicashFlowService.fetchAndSaveCsv(req.getFromDate(), req.getToDate());
            String publicUrl = bankPaymentUnicashFlowService.getPublicCsvUrl(req.getFromDate(), req.getToDate());
            return ResponseEntity.ok(java.util.Map.of(
                    "success", true,
                    "file", savedPath,
                    "publicUrl", publicUrl != null ? publicUrl : ""));
        } catch (org.springframework.web.client.RestClientResponseException httpEx) {
            String body = httpEx.getResponseBodyAsString();
            String message = null;
            try {
                com.fasterxml.jackson.databind.ObjectMapper om = new com.fasterxml.jackson.databind.ObjectMapper();
                java.util.Map<?, ?> m = om.readValue(body, java.util.Map.class);
                Object msg = m.get("message");
                message = msg != null ? msg.toString() : null;
            } catch (Exception ignore) {
            }
            if (message == null || message.isEmpty()) {
                message = httpEx.getMessage();
            }
            return ResponseEntity.status(httpEx.getStatusCode()).body(new ErrorResponse(message));
        } catch (Exception e) {
            System.err.println("=== UNICASH FETCH ERROR ===");
            e.printStackTrace();
            return ResponseEntity.internalServerError().body(new ErrorResponse("Failed to fetch: " + e.getMessage()));
        }
    }

    @PostMapping("/bank-payments/process")
    public ResponseEntity<?> processDerashBankPayments(@RequestBody com.wbill.home.dto.BankFetchRequest req) {
        try {
            if (req == null || req.getFromDate() == null || req.getToDate() == null) {
                return ResponseEntity.badRequest()
                        .body(new ErrorResponse("fromDate and toDate are required (yyyy-MM-dd)"));
            }
            com.wbill.home.dto.BankProcessResultDTO result = bankPaymentDerashFlowService.processCsv(req.getFromDate(),
                    req.getToDate(), req.getKifyaWer());
            return ResponseEntity.ok(result);
        } catch (java.io.FileNotFoundException fnf) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(new ErrorResponse(fnf.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(new ErrorResponse("Failed to process: " + e.getMessage()));
        }
    }

    // Async CSV processing with numeric progress and per-row logs
    @PostMapping("/bank-payments/process-async")
    public ResponseEntity<Map<String, Object>> startProcessDerashBankPaymentsAsync(
            @RequestBody com.wbill.home.dto.BankFetchRequest req) {
        if (req == null || req.getFromDate() == null || req.getToDate() == null) {
            return ResponseEntity.badRequest().body(Map.of(
                    "success", false,
                    "message", "fromDate and toDate are required (yyyy-MM-dd)"));
        }
        try {
            String jobId = progressService.createJob(0);
            // Run in background thread
            new Thread(() -> {
                try {
                    com.wbill.home.dto.BankProcessResultDTO result = bankPaymentDerashFlowService
                            .processCsvWithProgress(jobId, req.getFromDate(), req.getToDate(), req.getKifyaWer(),
                                    progressService);
                    bankProcessJobStore.setResult(jobId, result);
                    progressService.markDone(jobId, "CSV processed successfully");
                } catch (Exception ex) {
                    progressService.markError(jobId, ex.getMessage());
                }
            }).start();
            return ResponseEntity.ok(Map.of(
                    "success", true,
                    "jobId", jobId));
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(Map.of(
                    "success", false,
                    "message", "Failed to start process: " + e.getMessage()));
        }
    }

    @GetMapping("/bank-payments/process-result/{jobId}")
    public ResponseEntity<?> getProcessResult(@PathVariable String jobId) {
        com.wbill.home.dto.BankProcessResultDTO result = bankProcessJobStore.getResult(jobId);
        if (result == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(new ErrorResponse("Result not ready for jobId"));
        }
        return ResponseEntity.ok(Map.of(
                "success", true,
                "result", result));
    }

    @PostMapping("/bank-payments/upload-csv")
    public ResponseEntity<?> uploadDerashCsv(
            @RequestParam("file") MultipartFile file,
            @RequestParam("fromDate") String fromDate,
            @RequestParam("toDate") String toDate) {
        try {
            if (file == null || file.isEmpty()) {
                return ResponseEntity.badRequest().body(new ErrorResponse("CSV file is required"));
            }
            if (fromDate == null || fromDate.trim().isEmpty() || toDate == null || toDate.trim().isEmpty()) {
                return ResponseEntity.badRequest()
                        .body(new ErrorResponse("fromDate and toDate are required (yyyy-MM-dd)"));
            }

            Files.createDirectories(Paths.get(storageDir));
            String timestamp = LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyyMMdd_HHmmss"));
            String filename = String.format("derash_%s_to_%s_%s.csv", fromDate, toDate, timestamp);
            Path target = Paths.get(storageDir, filename);
            try (InputStream in = file.getInputStream()) {
                Files.copy(in, target);
            }
            String publicUrl = "/derash-csv/" + filename;
            return ResponseEntity.ok(java.util.Map.of(
                    "success", true,
                    "file", target.toString(),
                    "publicUrl", publicUrl));
        } catch (Exception e) {
            return ResponseEntity.internalServerError()
                    .body(new ErrorResponse("Failed to upload CSV: " + e.getMessage()));
        }
    }

    @PostMapping("/unicash-bank-payments/upload-csv")
    public ResponseEntity<?> uploadUnicashCsv(
            @RequestParam("file") MultipartFile file,
            @RequestParam("fromDate") String fromDate,
            @RequestParam("toDate") String toDate) {
        try {
            if (file == null || file.isEmpty()) {
                return ResponseEntity.badRequest().body(new ErrorResponse("CSV file is required"));
            }
            if (fromDate == null || fromDate.trim().isEmpty() || toDate == null || toDate.trim().isEmpty()) {
                return ResponseEntity.badRequest()
                        .body(new ErrorResponse("fromDate and toDate are required (yyyy-MM-dd)"));
            }

            Files.createDirectories(Paths.get(unicashStorageDir));
            String timestamp = LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyyMMdd_HHmmss"));
            String filename = String.format("unicash_%s_to_%s_%s.csv", fromDate, toDate, timestamp);
            Path target = Paths.get(unicashStorageDir, filename);
            try (InputStream in = file.getInputStream()) {
                Files.copy(in, target);
            }
            String publicUrl = "/unicash-csv/" + filename;
            return ResponseEntity.ok(java.util.Map.of(
                    "success", true,
                    "file", target.toString(),
                    "publicUrl", publicUrl));
        } catch (Exception e) {
            return ResponseEntity.internalServerError()
                    .body(new ErrorResponse("Failed to upload CSV: " + e.getMessage()));
        }
    }

    @GetMapping("/bank-payments/files")
    public ResponseEntity<?> listBankPaymentFiles() {
        try {
            java.util.List<java.util.Map<String, Object>> files = new java.util.ArrayList<>();
            
            // List Derash CSV files
            java.io.File derashDir = new java.io.File(storageDir);
            if (derashDir.exists() && derashDir.isDirectory()) {
                java.io.File[] derashFiles = derashDir.listFiles((dir, name) -> name.toLowerCase().endsWith(".csv"));
                if (derashFiles != null) {
                    for (java.io.File f : derashFiles) {
                        java.util.Map<String, Object> map = new java.util.HashMap<>();
                        map.put("name", f.getName());
                        map.put("size", f.length());
                        map.put("lastModified", f.lastModified());
                        map.put("type", "derash");
                        files.add(map);
                    }
                }
            }

            // List Unicash CSV files
            java.io.File unicashDir = new java.io.File(unicashStorageDir);
            if (unicashDir.exists() && unicashDir.isDirectory()) {
                java.io.File[] unicashFiles = unicashDir.listFiles((dir, name) -> name.toLowerCase().endsWith(".csv"));
                if (unicashFiles != null) {
                    for (java.io.File f : unicashFiles) {
                        java.util.Map<String, Object> map = new java.util.HashMap<>();
                        map.put("name", f.getName());
                        map.put("size", f.length());
                        map.put("lastModified", f.lastModified());
                        map.put("type", "unicash");
                        files.add(map);
                    }
                }
            }

            // List MardaArif CSV files
            java.io.File mardaarifDir = new java.io.File(mardaarifStorageDir);
            if (mardaarifDir.exists() && mardaarifDir.isDirectory()) {
                java.io.File[] mardaarifFiles = mardaarifDir.listFiles((dir, name) -> name.toLowerCase().endsWith(".csv"));
                if (mardaarifFiles != null) {
                    for (java.io.File f : mardaarifFiles) {
                        java.util.Map<String, Object> map = new java.util.HashMap<>();
                        map.put("name", f.getName());
                        map.put("size", f.length());
                        map.put("lastModified", f.lastModified());
                        map.put("type", "mardaarif");
                        files.add(map);
                    }
                }
            }

            return ResponseEntity.ok(files);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(new ErrorResponse("Failed to list files: " + e.getMessage()));
        }
    }

    @GetMapping("/bank-payments/download-file")
    public ResponseEntity<?> downloadBankPaymentFile(
            @RequestParam("name") String filename,
            @RequestParam("type") String type) {
        try {
            if (filename == null || filename.contains("..") || filename.contains("/") || filename.contains("\\")) {
                return ResponseEntity.badRequest().body(new ErrorResponse("Invalid file name"));
            }
            
            String targetDir;
            if ("derash".equalsIgnoreCase(type)) {
                targetDir = storageDir;
            } else if ("unicash".equalsIgnoreCase(type)) {
                targetDir = unicashStorageDir;
            } else if ("mardaarif".equalsIgnoreCase(type)) {
                targetDir = mardaarifStorageDir;
            } else {
                return ResponseEntity.badRequest().body(new ErrorResponse("Invalid type (must be derash, unicash, or mardaarif)"));
            }

            java.io.File file = new java.io.File(targetDir, filename);
            if (!file.exists() || !file.isFile()) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body(new ErrorResponse("File not found"));
            }

            byte[] fileBytes = java.nio.file.Files.readAllBytes(file.toPath());
            
            return ResponseEntity.ok()
                    .header(org.springframework.http.HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + filename + "\"")
                    .contentType(org.springframework.http.MediaType.parseMediaType("text/csv"))
                    .body(fileBytes);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(new ErrorResponse("Download failed: " + e.getMessage()));
        }
    }

    @GetMapping("/bank-payments/single")
    public ResponseEntity<?> fetchDerashSinglePaidBill(@RequestParam("billId") String billId) {
        try {
            java.util.Map<String, Object> result = bankPaymentDerashFlowService.fetchSinglePaidBill(billId);
            return ResponseEntity.ok(result);
        } catch (org.springframework.web.client.RestClientResponseException httpEx) {
            String body = httpEx.getResponseBodyAsString();
            String message = null;
            try {
                // Try to parse {"message":"..."}
                com.fasterxml.jackson.databind.ObjectMapper om = new com.fasterxml.jackson.databind.ObjectMapper();
                java.util.Map<?, ?> m = om.readValue(body, java.util.Map.class);
                Object msg = m.get("message");
                message = msg != null ? msg.toString() : null;
            } catch (Exception ignore) {
            }
            if (message == null || message.isEmpty()) {
                message = httpEx.getMessage();
            }
            return ResponseEntity.status(httpEx.getStatusCode()).body(new ErrorResponse(message));
        } catch (Exception e) {
            return ResponseEntity.internalServerError()
                    .body(new ErrorResponse("Failed to fetch single bill: " + e.getMessage()));
        }
    }

    @PostMapping("/generateWithReadings")
    public ResponseEntity<?> generateBillsWithReadings(@RequestBody GenerateBillWithReadingsRequest request) {
        try {
            // Validate request
            if (request.getReadingIds() == null || request.getReadingIds().isEmpty()) {
                return ResponseEntity.badRequest()
                        .body(new ErrorResponse("At least one reading ID is required"));
            }

            // Process each reading: set readings and activate
            for (Integer readingId : request.getReadingIds()) {
                Optional<BillingReading> readingOpt = readingService.getReadingById(readingId);
                if (readingOpt.isEmpty()) {
                    return ResponseEntity.badRequest()
                            .body(new ErrorResponse("Reading not found with ID: " + readingId));
                }
                if (request.getPreviousReading() != null || request.getCurrentReading() != null) {
                    readingService.changeReadingStatus(
                            readingId,
                            "active",
                            request.getPreviousReading(),
                            request.getCurrentReading());
                }
            }

            // Generate bills for the readings using BillingService
            billingService.generateBillsForSelectedReadings(request.getReadingIds());

            return ResponseEntity.ok(Map.of(
                    "success", true,
                    "message", "Bills generated successfully with provided readings",
                    "billCount", request.getReadingIds().size()));

        } catch (Exception e) {
            return ResponseEntity.internalServerError()
                    .body(new ErrorResponse("Error generating bills: " + e.getMessage()));
        }
    }

    @PostMapping("/generate")
    public ResponseEntity<Map<String, Object>> generateBillsForReadings(
            @RequestBody Map<String, List<Integer>> payload) {
        // System.out.println("bill gen 1"+payload); // noisy log commented out

        List<Integer> readingIds = payload.get("readingIds");
        if (readingIds == null || readingIds.isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of(
                    "success", false,
                    "message", "Reading IDs list cannot be empty."));
        }

        try {
            BillingProcessResult result = billingService.generateBillsForSelectedReadings(readingIds);
            return ResponseEntity.ok(Map.of(
                    "success", true,
                    "requested", result.getRequested(),
                    "processed", result.getProcessed(),
                    "skipped", result.getSkipped(),
                    "skipReasons", result.getSkipReasons()));
        } catch (Exception e) {
            // Log the exception for debugging
            return ResponseEntity.internalServerError().body(Map.of(
                    "success", false,
                    "message", "An error occurred: " + e.getMessage()));
        }
    }

    @PostMapping("/bills/void-and-revert-to-readings")
    public ResponseEntity<?> voidBillsAndRevertToReadings(
            @RequestBody Map<String, List<Integer>> payload) {
        List<Integer> readingIds = payload.get("readingIds");
        if (readingIds == null || readingIds.isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of(
                    "success", false,
                    "message", "Reading IDs list cannot be empty."));
        }

        try {
            Map<String, Object> result = readingService.voidBillsAndRevertToReadings(readingIds);
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            log.error("Error voiding and reverting bills to readings", e);
            return ResponseEntity.internalServerError().body(Map.of(
                    "success", false,
                    "message", "An error occurred while voiding bills: " + e.getMessage()));
        }
    }

    @GetMapping("/customer/{customerId}/all-bill-data")
    public ResponseEntity<CustomerBillDataDTO> getCustomerAllBillData(@PathVariable Integer customerId) {
        // 1. Get the regular list of bills
        List<BillingReadingDTO> regularBills = readingService.getReadingsByCustomerId(customerId);
        // System.out.println("wuzif log regularBills"); // noisy log commented out

        // 2. Get the list of unpaid Wuzif bills (already mapped to the same DTO)
        // List<BillingReadingDTO> unpaidWuzifBills =
        // wuzifService.findUnpaidWuzifAsBillingReadingDTO(Long.valueOf(customerId));
        // Convert the Long to an int before calling the method
        List<BillingReadingDTO> unpaidWuzifBills = wuzifService
                .findUnpaidWuzifAsBillingReadingDTO(Long.valueOf(customerId).intValue());
        // 3. Combine them into the wrapper DTO and return
        CustomerBillDataDTO combinedData = new CustomerBillDataDTO(regularBills, unpaidWuzifBills);

        return ResponseEntity.ok(combinedData);
    }

    // ===================== Wuzif Actions =====================
    @PostMapping("/wuzif/{readingId}/remove-wuzif")
    public ResponseEntity<?> removeWuzif(@PathVariable Integer readingId) {
        try {
            int updated = wuzifService.removeWuzif(readingId);
            return ResponseEntity.ok(Map.of("success", true, "updated", updated));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new ErrorResponse(e.getMessage()));
        }
    }

    @PostMapping("/wuzif/{readingId}/return-wuzif")
    public ResponseEntity<?> returnWuzif(@PathVariable Integer readingId) {
        try {
            int updated = wuzifService.returnWuzif(readingId);
            return ResponseEntity.ok(Map.of("success", true, "updated", updated));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new ErrorResponse(e.getMessage()));
        }
    }

    @PostMapping("/wuzif/{readingId}/remove-kitate")
    public ResponseEntity<?> removeKitate(@PathVariable Integer readingId) {
        try {
            int updated = wuzifService.removeKitate(readingId);
            return ResponseEntity.ok(Map.of("success", true, "updated", updated));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new ErrorResponse(e.getMessage()));
        }
    }

    @PostMapping("/wuzif/{readingId}/return-kitate")
    public ResponseEntity<?> returnKitate(@PathVariable Integer readingId) {
        try {
            int updated = wuzifService.returnKitate(readingId);
            return ResponseEntity.ok(Map.of("success", true, "updated", updated));
        } catch (Exception e) {
            return ResponseEntity.internalServerError()
                    .body(new ErrorResponse("Internal error: " + e.getMessage()));
        }
    }

    @PostMapping("/bills/consumption-based-correction")
    public ResponseEntity<BulkUpdateResponseDTO> applyConsumptionBasedCorrection(
            @RequestBody ConsumptionBasedCorrectionRequestDTO request) {
        try {
            if (request == null) {
                return ResponseEntity.badRequest()
                        .body(BulkUpdateResponseDTO.error("Request body is required"));
            }
            BulkUpdateResponseDTO response = readingService.applyConsumptionBasedCorrection(
                    request.getReadingIds(),
                    request.getReason(),
                    request.getPercent(),
                    request.getBaseType());
            if (response.isSuccess()) {
                return ResponseEntity.ok(response);
            } else {
                return ResponseEntity.badRequest().body(response);
            }
        } catch (Exception e) {
            return ResponseEntity.internalServerError()
                    .body(BulkUpdateResponseDTO.error("Internal error: " + e.getMessage()));
        }
    }

    @PostMapping("/bills/average-consumption-init")
    public ResponseEntity<BulkUpdateResponseDTO> initializeAverageConsumption(
            @RequestBody AverageConsumptionInitRequestDTO request) {
        try {
            if (request == null) {
                return ResponseEntity.badRequest()
                        .body(BulkUpdateResponseDTO.error("Request body is required"));
            }
            BulkUpdateResponseDTO response = readingService.initializeAverageConsumptionForCustomers(
                    request.getAccountNumbers(),
                    request.getKifyaWer(),
                    request.getMonths());
            if (response.isSuccess()) {
                return ResponseEntity.ok(response);
            } else {
                return ResponseEntity.badRequest().body(response);
            }
        } catch (Exception e) {
            return ResponseEntity.internalServerError()
                    .body(BulkUpdateResponseDTO.error("Internal error: " + e.getMessage()));
        }
    }

    @PostMapping("/wuzif/transfer-kitat-to-old-arrears")
    public ResponseEntity<?> transferKitatToOldArrears(@RequestBody KitatTransferRequestDTO request) {
        try {
            if (request == null) {
                return ResponseEntity.badRequest().body(new ErrorResponse("Request body is required"));
            }

            // ... (rest of the code remains the same)
            String accountNumber = request.getAccountNumber();
            double totalKitat = request.getTotalKitat();

            if (accountNumber == null || accountNumber.trim().isEmpty()) {
                return ResponseEntity.badRequest().body(new ErrorResponse("Account number is required"));
            }
            if (totalKitat <= 0) {
                return ResponseEntity.badRequest().body(new ErrorResponse("Total kitat must be greater than zero"));
            }

            int updatedCount = wuzifService.transferKitatToOldArrears(accountNumber, totalKitat);

            return ResponseEntity.ok(Map.of(
                    "success", true,
                    "updatedWuzifCount", updatedCount,
                    "accountNumber", accountNumber,
                    "totalKitat", totalKitat));
        } catch (jakarta.persistence.EntityNotFoundException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(new ErrorResponse(e.getMessage()));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(new ErrorResponse(e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.internalServerError()
                    .body(new ErrorResponse("Internal error: " + e.getMessage()));
        }
    }

    // ===================== Bank Payment Import Endpoints =====================

    /**
     * Bulk update multiple billing reading records with bank payment information
     * 
     * @param request The bulk update request containing list of updates
     * @return BulkUpdateResponseDTO with success status and count
     */
    @PutMapping("/bulk-update-bank-payments")
    public ResponseEntity<BulkUpdateResponseDTO> bulkUpdateBankPayments(
            @RequestBody BulkBankPaymentUpdateRequestDTO request) {
        try {
            BulkUpdateResponseDTO response = bankPaymentImportService.bulkUpdateBankPayments(request);

            if (response.isSuccess()) {
                return ResponseEntity.ok(response);
            } else {
                return ResponseEntity.badRequest().body(response);
            }
        } catch (Exception e) {
            return ResponseEntity.internalServerError()
                    .body(BulkUpdateResponseDTO.error("Internal error: " + e.getMessage()));
        }
    }

    /**
     * Update a single billing reading record with bank payment information
     * 
     * @param id        The ID of the billing reading record
     * @param updateDTO The update data
     * @return The updated BillingReading entity or error response
     */
    @PutMapping("/{id}/bank-payment")
    public ResponseEntity<?> updateSingleBankPayment(
            @PathVariable Integer id,
            @RequestBody BankPaymentUpdateDTO updateDTO) {
        try {
            BillingReading updatedReading = bankPaymentImportService.updateSingleBankPayment(id, updateDTO);

            return ResponseEntity.ok(Map.of(
                    "success", true,
                    "message", "Bank payment updated successfully",
                    "readingId", updatedReading.getId(),
                    "isPaidThroughBank", updatedReading.isPaidThroughBank(),
                    "isDerashPaid", updatedReading.isDerashPaid(),
                    "tekilalaBankYetekefele", updatedReading.getTekilalaBankYetekefele(),
                    "bankPaidAgentId", updatedReading.getBankPaidAgentId(),
                    "bankPaidConfirmationCode", updatedReading.getBankPaidConfirmationCode()));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(new ErrorResponse(e.getMessage()));
        } catch (IllegalStateException e) {
            return ResponseEntity.status(HttpStatus.CONFLICT).body(new ErrorResponse(e.getMessage()));
        } catch (RuntimeException e) {
            String msg = e.getMessage();
            if (msg != null && msg.contains("not found")) {
                return ResponseEntity.notFound().build();
            }
            return ResponseEntity.badRequest().body(new ErrorResponse(msg != null ? msg : "Unexpected runtime error"));
        } catch (Exception e) {
            return ResponseEntity.internalServerError()
                    .body(new ErrorResponse("Internal error: " + e.getMessage()));
        }
    }

    /**
     * Accept a cashier/front-office payment for a bill
     */
    @PutMapping("/{id}/cashier-payment")
    @PreAuthorize("hasAuthority('Cashier') or hasAuthority('billzgjt')")
    public ResponseEntity<?> updateCashierPayment(
            @PathVariable Integer id,
            @RequestBody CashierPaymentUpdateDTO updateDTO) {
        try {
            BillingReading updatedReading = frontOfficePaymentService.applyCashierPayment(id, updateDTO);

            return ResponseEntity.ok(Map.of(
                    "success", true,
                    "message", "Cashier payment recorded successfully",
                    "readingId", updatedReading.getId(),
                    "isPaidOnFrontOffice", updatedReading.isPaidOnFrontOffice(),
                    "isMoneyCollected", updatedReading.isMoneyCollected(),
                    "moneyCollectedDate", updatedReading.getMoneyCollectedDate(),
                    "tekilalaYetekefele", updatedReading.getTekilalaYetekefele()));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(new ErrorResponse(e.getMessage()));
        } catch (IllegalStateException e) {
            return ResponseEntity.status(HttpStatus.CONFLICT).body(new ErrorResponse(e.getMessage()));
        } catch (RuntimeException e) {
            if (e.getMessage() != null && e.getMessage().contains("not found")) {
                return ResponseEntity.notFound().build();
            }
            return ResponseEntity.badRequest().body(new ErrorResponse(e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.internalServerError()
                    .body(new ErrorResponse("Internal error: " + e.getMessage()));
        }
    }

    // ===== Unicash Payment Import Endpoints =====

    /**
     * Import Unicash payments from CSV file
     * 
     * @param file     CSV file containing Unicash payment data
     * @param kifyaWer The billing period
     * @return ImportReport with processing results
     */
    @PostMapping("/import-unicash-csv")
    public ResponseEntity<ImportReport> importUnicashPaymentsFromCsv(
            @RequestParam("file") MultipartFile file,
            @RequestParam("kifyaWer") String kifyaWer) {

        if (file == null || file.isEmpty()) {
            ImportReport errorReport = new ImportReport();
            errorReport.getImportLogs().add("ERROR: No file uploaded.");
            return new ResponseEntity<>(errorReport, HttpStatus.BAD_REQUEST);
        }
        try {
            ImportReport report = bankPaymentImportService.importUnicashPaymentsFromCsv(file, kifyaWer);
            return new ResponseEntity<>(report, HttpStatus.OK);
        } catch (Exception e) {
            ImportReport errorReport = new ImportReport();
            errorReport.getImportLogs().add("ERROR: " + e.getMessage());
            return new ResponseEntity<>(errorReport, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    /**
     * Bulk update Unicash payment information for multiple billing readings
     * 
     * @param request The bulk update request containing list of updates
     * @return BulkUpdateResponseDTO with success status and count
     */
    @PutMapping("/bulk-update-unicash")
    public ResponseEntity<BulkUpdateResponseDTO> bulkUpdateUnicashPayments(
            @RequestBody BulkUnicashPaymentUpdateRequestDTO request) {
        try {
            BulkUpdateResponseDTO response = bankPaymentImportService.bulkUpdateUnicashPayments(request);

            if (response.isSuccess()) {
                return ResponseEntity.ok(response);
            } else {
                return ResponseEntity.badRequest().body(response);
            }
        } catch (Exception e) {
            return ResponseEntity.internalServerError()
                    .body(BulkUpdateResponseDTO.error("Internal error: " + e.getMessage()));
        }
    }

    /**
     * Update a single billing reading with Unicash payment information
     * 
     * @param id        The ID of the billing reading record
     * @param updateDTO The update data
     * @return Updated billing reading information
     */
    @PutMapping("/unicash-payment/{id}")
    public ResponseEntity<?> updateSingleUnicashPayment(
            @PathVariable Integer id,
            @RequestBody UnicashPaymentUpdateDTO updateDTO) {
        try {
            BillingReading updatedReading = bankPaymentImportService.updateSingleUnicashPayment(id, updateDTO);

            return ResponseEntity.ok(Map.of(
                    "success", true,
                    "message", "Unicash payment updated successfully",
                    "readingId", updatedReading.getId(),
                    "isUnicashPaid", updatedReading.isUnicashPaid(),
                    "isMoneyCollected", updatedReading.isMoneyCollected(),
                    "moneyCollectedDate", updatedReading.getMoneyCollectedDate(),
                    "tekilalaYetekefele", updatedReading.getTekilalaYetekefele(),
                    "tekilalaBankYetekefele", updatedReading.getTekilalaBankYetekefele(),
                    "uBankPaidAgentId", updatedReading.getuBankPaidAgentId(),
                    "uBankPaidConfirmationCode", updatedReading.getuBankPaidConfirmationCode()));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(new ErrorResponse(e.getMessage()));
        } catch (IllegalStateException e) {
            return ResponseEntity.status(HttpStatus.CONFLICT).body(new ErrorResponse(e.getMessage()));
        } catch (RuntimeException e) {
            if (e.getMessage() != null && e.getMessage().contains("not found")) {
                return ResponseEntity.notFound().build();
            }
            return ResponseEntity.badRequest().body(new ErrorResponse(e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.internalServerError()
                    .body(new ErrorResponse("Internal error: " + e.getMessage()));
        }
    }

    /**
     * Preview bill generation for a reading without saving changes.
     */
    @GetMapping("/readings/{id}/preview")
    public ResponseEntity<ReadingDetailResponseDTO> previewBill(@PathVariable Integer id) {
        try {
            ReadingDetailResponseDTO result = billingService.previewBill(id); // Use billingService directly as updated
                                                                              // above
            return ResponseEntity.ok(result);
        } catch (RuntimeException e) {
            if (e.getMessage() != null && e.getMessage().contains("Reading not found")) {
                return ResponseEntity.notFound().build();
            }
            // For other runtime exceptions, return 500 or let global handler catch it
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    // ===================== MardaArif Bank Agent Endpoints =====================

    @PostMapping("/submit-bill-to-mardaarif")
    public ResponseEntity<?> submitBillToMardaArif(@RequestBody MardaArifBillSubmissionDTO billData) {
        try {
            java.util.Map<String, Object> resp = readingService.submitMardaArifBill(billData);

            return ResponseEntity.ok(java.util.Map.of(
                    "success", true,
                    "bill_id", billData.getBillId(),
                    "response", resp,
                    "message", "Bill successfully submitted to MardaArif"));
        } catch (Exception e) {
            log.error("Failed to submit bill to MardaArif", e);
            return ResponseEntity.internalServerError()
                    .body(new ErrorResponse("Failed to submit bill to MardaArif: " + e.getMessage()));
        }
    }

    @PostMapping("/mardaarif/update-bills")
    public ResponseEntity<?> extendMardaArifBillsWithPenalty(@RequestBody MardaArifBankExtendRequestDTO request) {
        try {
            if (request.getReadingIds() == null || request.getReadingIds().isEmpty()) {
                return ResponseEntity.badRequest().body(new ErrorResponse("readingIds cannot be empty"));
            }
            if (request.getDueDate() == null || request.getDueDate().trim().isEmpty()) {
                return ResponseEntity.badRequest().body(new ErrorResponse("dueDate is required"));
            }
            java.time.LocalDate due = java.time.LocalDate.parse(request.getDueDate().trim());

            int updatedCount = readingService.extendMardaArifBillsWithPenalty(
                    request.getReadingIds(),
                    request.getExtraPenalty(),
                    due);

            return ResponseEntity.ok(BulkUpdateResponseDTO.success(updatedCount));
        } catch (Exception e) {
            return ResponseEntity.internalServerError()
                    .body(BulkUpdateResponseDTO.error("Failed to update MardaArif bills: " + e.getMessage()));
        }
    }

    @PostMapping("/mardaarif/update-bills-local")
    public ResponseEntity<?> updateBillsLocallyWithPenaltyMardaArif(@RequestBody MardaArifBankExtendRequestDTO request) {
        try {
            if (request.getReadingIds() == null || request.getReadingIds().isEmpty()) {
                return ResponseEntity.badRequest().body(new ErrorResponse("readingIds cannot be empty"));
            }
            if (request.getDueDate() == null || request.getDueDate().trim().isEmpty()) {
                return ResponseEntity.badRequest().body(new ErrorResponse("dueDate is required"));
            }
            java.time.LocalDate due = java.time.LocalDate.parse(request.getDueDate().trim());

            int updatedCount = readingService.updateBillsLocallyWithPenaltyMardaArif(
                    request.getReadingIds(),
                    request.getExtraPenalty(),
                    due);

            return ResponseEntity.ok(BulkUpdateResponseDTO.success(updatedCount));
        } catch (Exception e) {
            return ResponseEntity.internalServerError()
                    .body(BulkUpdateResponseDTO.error("Failed to update local MardaArif bills: " + e.getMessage()));
        }
    }

    @PostMapping("/mardaarif/update-bills-bulk-file")
    public ResponseEntity<?> forwardBulkUpdateCsvToMardaArif(@RequestParam("file") MultipartFile file) {
        try {
            if (file == null || file.isEmpty()) {
                return ResponseEntity.badRequest().body(new ErrorResponse("CSV file is required"));
            }

            com.wbill.home.model.CompanyProfile companyProfile = companyProfileRepository.findById(9).orElse(null);
            if (companyProfile == null) {
                return ResponseEntity.badRequest().body(new ErrorResponse("Company profile ID 9 not found"));
            }

            String baseUrl = companyProfile.getmCompanyUri();
            String apiKey = companyProfile.getmCompanyKey();

            if (baseUrl == null || baseUrl.isBlank() || apiKey == null) {
                return ResponseEntity.badRequest().body(new ErrorResponse("MardaArif configuration incomplete"));
            }

            try {
                Files.createDirectories(Paths.get(mardaarifStorageDir));
                String tmpOriginalName = file.getOriginalFilename();
                String originalName = (tmpOriginalName == null || tmpOriginalName.isBlank()) ? "bulk_update.csv"
                        : tmpOriginalName;
                String timestamp = LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyyMMdd_HHmmss"));
                String storageFilename = "mardaarif_update_" + timestamp + "_" + originalName;
                Path storagePath = Paths.get(mardaarifStorageDir, storageFilename);
                Files.copy(file.getInputStream(), storagePath);
                log.info("Saved audit copy of MardaArif Bulk Update CSV to: {}", storagePath.toAbsolutePath());
            } catch (Exception e) {
                log.warn("Failed to save audit copy of CSV: {}. Proceeding with gateway call.", e.getMessage());
            }

            String url = UriComponentsBuilder.fromHttpUrl(baseUrl.trim())
                    .path("BillIntegrationResource/bulkBillUpdate")
                    .queryParam("API_KEY", apiKey.trim())
                    .toUriString();

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.MULTIPART_FORM_DATA);
            headers.add("API_KEY", apiKey.trim());

            final String finalName = (file.getOriginalFilename() == null || file.getOriginalFilename().isBlank())
                    ? "bulk_update.csv"
                    : file.getOriginalFilename();
            ByteArrayResource csvResource = new ByteArrayResource(file.getBytes()) {
                @Override
                public String getFilename() {
                    return finalName;
                }
            };

            HttpHeaders partHeaders = new HttpHeaders();
            partHeaders.setContentType(MediaType.APPLICATION_OCTET_STREAM);
            HttpEntity<ByteArrayResource> filePart = new HttpEntity<>(csvResource, partHeaders);

            MultiValueMap<String, Object> body = new LinkedMultiValueMap<>();
            body.add("uploadedFile", filePart);

            HttpEntity<MultiValueMap<String, Object>> requestEntity = new HttpEntity<>(body, headers);

            org.springframework.http.client.SimpleClientHttpRequestFactory factory = new org.springframework.http.client.SimpleClientHttpRequestFactory();
            factory.setConnectTimeout(10_000);
            factory.setReadTimeout(60_000);
            org.springframework.web.client.RestTemplate restTemplate = new org.springframework.web.client.RestTemplate(
                    factory);

            log.info("Sending MardaArif Bulk Update CSV to: {}", url);
            ResponseEntity<String> response = restTemplate.exchange(
                    url,
                    HttpMethod.POST,
                    requestEntity,
                    String.class);

            String responseBody = response.getBody();
            log.info("MardaArif Bulk Update Response Body: {}", responseBody);

            java.util.Map<String, Object> result = new java.util.HashMap<>();
            result.put("success", true);
            result.put("message", "Bulk update file sent to MardaArif");
            result.put("upstreamResponse", responseBody);

            return ResponseEntity.ok(result);

        } catch (Exception e) {
            log.error("Failed to upload bulk update CSV to MardaArif", e);
            return ResponseEntity.internalServerError()
                    .body(new ErrorResponse("Failed to send CSV to MardaArif: " + e.getMessage()));
        }
    }

    @PostMapping("/mardaarif/cancel-bills")
    public ResponseEntity<?> cancelMardaArifBills(@RequestBody MardaArifMarkSentRequestDTO request) {
        try {
            if (request == null || request.getReadingIds() == null || request.getReadingIds().isEmpty()) {
                return ResponseEntity.badRequest().body(new ErrorResponse("readingIds cannot be empty"));
            }
            int updatedCount = readingService.cancelMardaArifBills(request.getReadingIds());
            return ResponseEntity.ok(BulkUpdateResponseDTO.success(updatedCount));
        } catch (Exception e) {
            return ResponseEntity.internalServerError()
                    .body(BulkUpdateResponseDTO.error("Failed to cancel MardaArif bills: " + e.getMessage()));
        }
    }

    @PostMapping("/mardaarif/mark-sent")
    public ResponseEntity<?> markBillsSentToMardaArif(@RequestBody MardaArifMarkSentRequestDTO request) {
        try {
            if (request == null || request.getReadingIds() == null || request.getReadingIds().isEmpty()) {
                return ResponseEntity.badRequest().body(new ErrorResponse("readingIds cannot be empty"));
            }
            int updatedCount = readingService.markBillsSentToMardaArif(request.getReadingIds());
            return ResponseEntity.ok(BulkUpdateResponseDTO.success(updatedCount));
        } catch (Exception e) {
            return ResponseEntity.internalServerError()
                    .body(BulkUpdateResponseDTO.error("Failed to mark MardaArif bills as sent: " + e.getMessage()));
        }
    }

    @PostMapping("/mardaarif-bank-payments/fetch")
    public ResponseEntity<?> fetchMardaArifBankPayments(@RequestBody com.wbill.home.dto.BankFetchRequest req) {
        try {
            if (req == null || req.getFromDate() == null || req.getToDate() == null) {
                return ResponseEntity.badRequest()
                        .body(new ErrorResponse("fromDate and toDate are required (yyyy-MM-dd)"));
            }
            String savedPath = bankPaymentMardaArifFlowService.fetchAndSaveCsv(req.getFromDate(), req.getToDate());
            String publicUrl = bankPaymentMardaArifFlowService.getPublicCsvUrl(req.getFromDate(), req.getToDate());
            return ResponseEntity.ok(java.util.Map.of(
                    "success", true,
                    "file", savedPath,
                    "publicUrl", publicUrl != null ? publicUrl : ""));
        } catch (org.springframework.web.client.RestClientResponseException httpEx) {
            String body = httpEx.getResponseBodyAsString();
            String message = null;
            try {
                com.fasterxml.jackson.databind.ObjectMapper om = new com.fasterxml.jackson.databind.ObjectMapper();
                java.util.Map<?, ?> m = om.readValue(body, java.util.Map.class);
                Object msg = m.get("message");
                message = msg != null ? msg.toString() : null;
            } catch (Exception ignore) {
            }
            if (message == null || message.isEmpty()) {
                message = httpEx.getMessage();
            }
            return ResponseEntity.status(httpEx.getStatusCode()).body(new ErrorResponse(message));
        } catch (Exception e) {
            System.err.println("=== MARDAARIF FETCH ERROR ===");
            e.printStackTrace();
            return ResponseEntity.internalServerError().body(new ErrorResponse("Failed to fetch: " + e.getMessage()));
        }
    }

    @PostMapping("/mardaarif-bank-payments/process")
    public ResponseEntity<?> processMardaArifBankPayments(@RequestBody com.wbill.home.dto.BankFetchRequest req) {
        try {
            if (req == null || req.getFromDate() == null || req.getToDate() == null) {
                return ResponseEntity.badRequest()
                        .body(new ErrorResponse("fromDate and toDate are required (yyyy-MM-dd)"));
            }
            com.wbill.home.dto.BankProcessResultDTO result = bankPaymentMardaArifFlowService.processCsv(req.getFromDate(),
                    req.getToDate(), req.getKifyaWer());
            return ResponseEntity.ok(result);
        } catch (java.io.FileNotFoundException fnf) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(new ErrorResponse(fnf.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(new ErrorResponse("Failed to process: " + e.getMessage()));
        }
    }

    @PostMapping("/mardaarif-bank-payments/process-async")
    public ResponseEntity<Map<String, Object>> startProcessMardaArifBankPaymentsAsync(
            @RequestBody com.wbill.home.dto.BankFetchRequest req) {
        if (req == null || req.getFromDate() == null || req.getToDate() == null) {
            return ResponseEntity.badRequest().body(Map.of(
                    "success", false,
                    "message", "fromDate and toDate are required (yyyy-MM-dd)"));
        }
        try {
            String jobId = progressService.createJob(0);
            new Thread(() -> {
                try {
                    com.wbill.home.dto.BankProcessResultDTO result = bankPaymentMardaArifFlowService
                            .processCsvWithProgress(jobId, req.getFromDate(), req.getToDate(), req.getKifyaWer(),
                                    progressService);
                    bankProcessJobStore.setResult(jobId, result);
                    progressService.markDone(jobId, "CSV processed successfully");
                } catch (Exception ex) {
                    progressService.markError(jobId, ex.getMessage());
                }
            }).start();
            return ResponseEntity.ok(Map.of(
                    "success", true,
                    "jobId", jobId));
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(Map.of(
                    "success", false,
                    "message", "Failed to start process: " + e.getMessage()));
        }
    }

    @PostMapping("/mardaarif-bank-payments/upload-csv")
    public ResponseEntity<?> uploadMardaArifCsv(
            @RequestParam("file") MultipartFile file,
            @RequestParam("fromDate") String fromDate,
            @RequestParam("toDate") String toDate) {
        try {
            if (file == null || file.isEmpty()) {
                return ResponseEntity.badRequest().body(new ErrorResponse("CSV file is required"));
            }
            if (fromDate == null || fromDate.trim().isEmpty() || toDate == null || toDate.trim().isEmpty()) {
                return ResponseEntity.badRequest()
                        .body(new ErrorResponse("fromDate and toDate are required (yyyy-MM-dd)"));
            }

            Files.createDirectories(Paths.get(mardaarifStorageDir));
            String timestamp = LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyyMMdd_HHmmss"));
            String filename = String.format("mardaarif_%s_to_%s_%s.csv", fromDate, toDate, timestamp);
            Path target = Paths.get(mardaarifStorageDir, filename);
            try (InputStream in = file.getInputStream()) {
                Files.copy(in, target);
            }
            String publicUrl = "/mardaarif-csv/" + filename;
            return ResponseEntity.ok(java.util.Map.of(
                    "success", true,
                    "file", target.toString(),
                    "publicUrl", publicUrl));
        } catch (Exception e) {
            return ResponseEntity.internalServerError()
                    .body(new ErrorResponse("Failed to upload CSV: " + e.getMessage()));
        }
    }

    @PostMapping("/mardaarif/customers-bill-data-file")
    public ResponseEntity<?> forwardCsvToMardaArif(@RequestParam("file") MultipartFile file) {
        try {
            if (file == null || file.isEmpty()) {
                return ResponseEntity.badRequest().body(new ErrorResponse("CSV file is required"));
            }

            com.wbill.home.model.CompanyProfile companyProfile = companyProfileRepository.findById(9).orElse(null);
            if (companyProfile == null) {
                return ResponseEntity.badRequest().body(new ErrorResponse("Company profile ID 9 not found"));
            }

            String baseUrl = companyProfile.getmCompanyUri();
            String apiKey = companyProfile.getmCompanyKey();

            if (baseUrl == null || baseUrl.isBlank() || apiKey == null) {
                return ResponseEntity.badRequest().body(new ErrorResponse("MardaArif configuration incomplete"));
            }

            Files.createDirectories(Paths.get(mardaarifStorageDir));

            String tmpOriginalName = file.getOriginalFilename();
            final String originalName = (tmpOriginalName == null || tmpOriginalName.isBlank())
                    ? "customers_bill_data.csv"
                    : tmpOriginalName;

            String timestamp = LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyyMMdd_HHmmss"));
            String storageFilename = "mardaarif_" + timestamp + "_" + originalName;
            Path storagePath = Paths.get(mardaarifStorageDir, storageFilename);

            try (InputStream in = file.getInputStream()) {
                Files.copy(in, storagePath);
            }
            log.info("Saved MardaArif CSV to: {}", storagePath.toAbsolutePath());

            String url = UriComponentsBuilder.fromHttpUrl(baseUrl.trim())
                    .path("BillIntegrationResource/bulkBillUpload")
                    .queryParam("API_KEY", apiKey.trim())
                    .toUriString();

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.MULTIPART_FORM_DATA);
            headers.add("API_KEY", apiKey.trim());

            ByteArrayResource csvResource = new ByteArrayResource(file.getBytes()) {
                @Override
                public String getFilename() {
                    return originalName;
                }
            };

            HttpHeaders partHeaders = new HttpHeaders();
            partHeaders.setContentType(MediaType.APPLICATION_OCTET_STREAM);
            HttpEntity<ByteArrayResource> filePart = new HttpEntity<>(csvResource, partHeaders);

            MultiValueMap<String, Object> body = new LinkedMultiValueMap<>();
            body.add("uploadedFile", filePart);

            HttpEntity<MultiValueMap<String, Object>> requestEntity = new HttpEntity<>(body, headers);

            org.springframework.http.client.SimpleClientHttpRequestFactory factory = new org.springframework.http.client.SimpleClientHttpRequestFactory();
            factory.setConnectTimeout(10_000);
            factory.setReadTimeout(60_000);
            org.springframework.web.client.RestTemplate restTemplate = new org.springframework.web.client.RestTemplate(
                    factory);

            log.info("Sending MardaArif CSV to: {}", url);
            ResponseEntity<String> response = restTemplate.exchange(
                    url,
                    HttpMethod.POST,
                    requestEntity,
                    String.class);

            String responseBody = response.getBody();
            log.info("MardaArif API Response Status: {}", response.getStatusCode());
            log.info("MardaArif API Response Body: {}", responseBody);

            java.util.Map<String, Object> result = new java.util.HashMap<>();
            result.put("status", response.getStatusCode().value());
            result.put("message", responseBody != null ? responseBody : "No content from MardaArif");

            return ResponseEntity.status(response.getStatusCode()).body(result);
        } catch (Exception e) {
            log.error("Failed to send CSV to MardaArif", e);
            return ResponseEntity.internalServerError()
                    .body(new ErrorResponse("Failed to send CSV to MardaArif: " + e.getMessage()));
        }
    }

    @PostMapping("/import-mardaarif-csv")
    public ResponseEntity<ImportReport> importMardaArifPaymentsFromCsv(
            @RequestParam("file") MultipartFile file,
            @RequestParam("kifyaWer") String kifyaWer) {

        if (file == null || file.isEmpty()) {
            ImportReport errorReport = new ImportReport();
            errorReport.getImportLogs().add("ERROR: No file uploaded.");
            return new ResponseEntity<>(errorReport, HttpStatus.BAD_REQUEST);
        }
        try {
            ImportReport report = bankPaymentImportService.importMardaArifPaymentsFromCsv(file, kifyaWer);
            return new ResponseEntity<>(report, HttpStatus.OK);
        } catch (Exception e) {
            ImportReport errorReport = new ImportReport();
            errorReport.getImportLogs().add("ERROR: " + e.getMessage());
            return new ResponseEntity<>(errorReport, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @PutMapping("/bulk-update-mardaarif")
    public ResponseEntity<BulkUpdateResponseDTO> bulkUpdateMardaArifPayments(
            @RequestBody BulkMardaArifPaymentUpdateRequestDTO request) {
        try {
            BulkUpdateResponseDTO response = bankPaymentImportService.bulkUpdateMardaArifPayments(request);

            if (response.isSuccess()) {
                return ResponseEntity.ok(response);
            } else {
                return ResponseEntity.badRequest().body(response);
            }
        } catch (Exception e) {
            return ResponseEntity.internalServerError()
                    .body(BulkUpdateResponseDTO.error("Internal error: " + e.getMessage()));
        }
    }

    @PutMapping("/mardaarif-payment/{id}")
    public ResponseEntity<?> updateSingleMardaArifPayment(
            @PathVariable Integer id,
            @RequestBody MardaArifPaymentUpdateDTO updateDTO) {
        try {
            BillingReading updatedReading = bankPaymentImportService.updateSingleMardaArifPayment(id, updateDTO);

            return ResponseEntity.ok(Map.of(
                    "success", true,
                    "message", "MardaArif payment updated successfully",
                    "readingId", updatedReading.getId(),
                    "isMardaArifPaid", updatedReading.isMardaArifPaid(),
                    "isMoneyCollected", updatedReading.isMoneyCollected(),
                    "moneyCollectedDate", updatedReading.getMoneyCollectedDate(),
                    "tekilalaYetekefele", updatedReading.getTekilalaYetekefele(),
                    "tekilalaBankYetekefele", updatedReading.getTekilalaBankYetekefele(),
                    "mBankPaidAgentId", updatedReading.getmBankPaidAgentId(),
                    "mBankPaidConfirmationCode", updatedReading.getmBankPaidConfirmationCode()));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(new ErrorResponse(e.getMessage()));
        } catch (IllegalStateException e) {
            return ResponseEntity.status(HttpStatus.CONFLICT).body(new ErrorResponse(e.getMessage()));
        } catch (RuntimeException e) {
            if (e.getMessage() != null && e.getMessage().contains("not found")) {
                return ResponseEntity.notFound().build();
            }
            return ResponseEntity.badRequest().body(new ErrorResponse(e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.internalServerError()
                    .body(new ErrorResponse("Internal error: " + e.getMessage()));
        }
    }

    // ===== Yearly Consumption Report =====
    private static final String[] ETH_MONTHS = {
            "መስከረም", "ጥቅምት", "ኅዳር", "ታህሣሥ", "ጥር", "የካቲት",
            "መጋቢት", "ሚያዚያ", "ግንቦት", "ሰኔ", "ሐምሌ", "ነሐሴ", "ጳጉሜ"
    };

    @Autowired
    private com.wbill.home.repository.BillingReadingRepository billingReadingRepository;

    @GetMapping("/reports/yearly-consumption")
    public ResponseEntity<?> getYearlyConsumptionReport(
            @RequestParam("fromYear") int fromYear,
            @RequestParam("fromMonth") int fromMonth,
            @RequestParam("toYear") int toYear,
            @RequestParam("toMonth") int toMonth,
            @RequestParam(value = "customerTypeId", required = false) Integer customerTypeId,
            @RequestParam(value = "branchId", required = false) Integer branchId) {
        try {
            if (fromMonth < 1 || fromMonth > 13 || toMonth < 1 || toMonth > 13) {
                return ResponseEntity.badRequest().body(
                        Map.of("success", false, "message", "Month indices must be between 1 and 13."));
            }
            if (fromYear > toYear || (fromYear == toYear && fromMonth > toMonth)) {
                return ResponseEntity.badRequest().body(
                        Map.of("success", false, "message", "Start date must be before or equal to end date."));
            }

            // Build list of kifyaWer strings spanning across years
            java.util.List<String> kifyaWerList = new java.util.ArrayList<>();
            int curYear = fromYear;
            int curMonth = fromMonth;
            while (curYear < toYear || (curYear == toYear && curMonth <= toMonth)) {
                // Skip month 13 (Pagume) — not used in billing
                if (curMonth == 13) {
                    curMonth = 1;
                    curYear++;
                    continue;
                }
                kifyaWerList.add(ETH_MONTHS[curMonth - 1] + ", " + curYear);
                curMonth++;
                if (curMonth > 12) {
                    curMonth = 1;
                    curYear++;
                }
            }

            List<Object[]> rows = billingReadingRepository.getYearlyConsumptionSummary(kifyaWerList, customerTypeId, branchId);

            // Build a map for ordering
            java.util.Map<String, Map<String, Object>> dataMap = new java.util.LinkedHashMap<>();
            for (Object[] row : rows) {
                Map<String, Object> item = new java.util.LinkedHashMap<>();
                item.put("kifyaWer", row[0]);
                item.put("totalConsumption", row[1] != null ? ((Number) row[1]).longValue() : 0);
                item.put("billCount", row[2] != null ? ((Number) row[2]).longValue() : 0);
                item.put("totalYezihWerFjotaKfya", row[3] != null ? ((Number) row[3]).doubleValue() : 0.0);
                item.put("totalKotariKiray", row[4] != null ? ((Number) row[4]).doubleValue() : 0.0);
                item.put("totalTechemariKfya", row[5] != null ? ((Number) row[5]).doubleValue() : 0.0);
                item.put("totalAdditionalHisab", row[6] != null ? ((Number) row[6]).doubleValue() : 0.0);
                item.put("totalKitat", row[7] != null ? ((Number) row[7]).doubleValue() : 0.0);
                item.put("totalWuzifHisab", row[8] != null ? ((Number) row[8]).doubleValue() : 0.0);
                item.put("totalTekilalaTekefay", row[9] != null ? ((Number) row[9]).doubleValue() : 0.0);
                item.put("totalTekilalaYetekefele", row[10] != null ? ((Number) row[10]).doubleValue() : 0.0);
                item.put("totalKecreditYetekefele", row[11] != null ? ((Number) row[11]).doubleValue() : 0.0);
                item.put("totalWuzifDerekKoshasha", row[12] != null ? ((Number) row[12]).doubleValue() : 0.0);
                dataMap.put((String) row[0], item);
            }

            // Return in month order
            java.util.List<Map<String, Object>> result = new java.util.ArrayList<>();
            for (String kw : kifyaWerList) {
                if (dataMap.containsKey(kw)) {
                    result.add(dataMap.get(kw));
                } else {
                    // Month with no data — add zero row
                    Map<String, Object> emptyItem = new java.util.LinkedHashMap<>();
                    emptyItem.put("kifyaWer", kw);
                    emptyItem.put("totalConsumption", 0L);
                    emptyItem.put("billCount", 0L);
                    emptyItem.put("totalYezihWerFjotaKfya", 0.0);
                    emptyItem.put("totalKotariKiray", 0.0);
                    emptyItem.put("totalTechemariKfya", 0.0);
                    emptyItem.put("totalAdditionalHisab", 0.0);
                    emptyItem.put("totalKitat", 0.0);
                    emptyItem.put("totalWuzifHisab", 0.0);
                    emptyItem.put("totalTekilalaTekefay", 0.0);
                    emptyItem.put("totalTekilalaYetekefele", 0.0);
                    emptyItem.put("totalKecreditYetekefele", 0.0);
                    emptyItem.put("totalWuzifDerekKoshasha", 0.0);
                    result.add(emptyItem);
                }
            }

            return ResponseEntity.ok(Map.of("success", true, "data", result));
        } catch (Exception e) {
            log.error("Error generating yearly consumption report", e);
            return ResponseEntity.internalServerError().body(
                    Map.of("success", false, "message", "Failed to generate report: " + e.getMessage()));
        }
    }
}