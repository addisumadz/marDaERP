package com.wbill.home.controller;

import com.wbill.home.dto.ReadingUpdateDTO;
import com.wbill.home.dto.AddressKetenaDTO;
import com.wbill.home.dto.ZpiMobileReadingRequestDTO;
import com.wbill.home.model.AddressStreets;
import com.wbill.home.model.BillingCustomerType;
import com.wbill.home.model.BillingCustomerInfo;
import com.wbill.home.model.BillingMeterSize;
import com.wbill.home.model.BillingReading;
import com.wbill.home.model.BillingZeroReadingReason;
import com.wbill.home.model.CompanyProfile;
import com.wbill.home.model.UserAccount;
import com.wbill.home.repository.AddressKetenaRepository;
import com.wbill.home.repository.AddressStreetsRepository;
import com.wbill.home.repository.BillingCustomerTypeRepository;
import com.wbill.home.repository.BillingCustomerInfoRepository;
import com.wbill.home.repository.BillingMeterSizeRepository;
import com.wbill.home.repository.BillingZeroReadingReasonRepository;
import com.wbill.home.repository.BillingReadingRepository;
import com.wbill.home.repository.UserAccountRepository;
import com.wbill.home.service.BillingReadingImportService;
import com.wbill.home.service.CompanyProfileService;
import com.wbill.home.util.EthiopianCalendarConverter;
import jakarta.servlet.http.HttpServletRequest;
import java.util.ArrayList;
import java.util.Collections;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.security.NoSuchAlgorithmException;
import java.security.spec.InvalidKeySpecException;
import javax.crypto.SecretKeyFactory;
import javax.crypto.spec.PBEKeySpec;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/mardamobileapp/billing")
public class LegacyMobileBillingController {

    private static final Logger logger = LoggerFactory.getLogger(LegacyMobileBillingController.class);

    @Autowired
    private UserAccountRepository userAccountRepository;

    @Autowired
    private com.wbill.home.service.UserService userService;

    @Autowired
    private CompanyProfileService companyProfileService;

    @Autowired
    private BillingCustomerInfoRepository billingCustomerInfoRepository;

    @Autowired
    private AddressStreetsRepository addressStreetsRepository;

    @Autowired
    private AddressKetenaRepository addressKetenaRepository;

    @Autowired
    private BillingZeroReadingReasonRepository billingZeroReadingReasonRepository;

    @Autowired
    private BillingCustomerTypeRepository billingCustomerTypeRepository;

    @Autowired
    private BillingMeterSizeRepository billingMeterSizeRepository;

    @Autowired
    private BillingReadingImportService billingReadingImportService;

    @Autowired
    private BillingReadingRepository billingReadingRepository;

    @org.springframework.beans.factory.annotation.Value("${storage.mobile-csv-dir:src/main/resources/static/mobile-csv}")
    private String mobileCsvStorageDir;

    private String getFullUrl(HttpServletRequest request) {
        StringBuffer url = request.getRequestURL();
        String query = request.getQueryString();
        if (query == null || query.isBlank()) {
            return url.toString();
        }
        return url.append("?").append(query).toString();
    }

    private void logLegacyCall(HttpServletRequest request, int statusCode) {
        String url = getFullUrl(request);
        String outcome = (statusCode >= 200 && statusCode < 300) ? "success" : "failed";
        logger.info("LegacyMobileBilling API call: {} requested, response {} ({})", url, statusCode, outcome);
    }

    // ---- Legacy password validation (PBKDF2) ----
    // The old system stored passwords as "iterations:salt:hash" using
    // PBKDF2WithHmacSHA1.
    // This method mirrors controller.util.PasswordHash.validatePassword so that
    // existing
    // password hashes keep working without change.
    private boolean legacyValidatePassword(String password, String storedHash) {
        if (storedHash == null) {
            return false;
        }

        String[] parts = storedHash.split(":");
        // If not in expected PBKDF2 format, fall back to plain-text comparison
        if (parts.length != 3) {
            return storedHash.equals(password);
        }

        try {
            int iterations = Integer.parseInt(parts[0]);
            byte[] salt = fromHex(parts[1]);
            byte[] hash = fromHex(parts[2]);

            byte[] testHash = pbkdf2(password.toCharArray(), salt, iterations, hash.length);
            return slowEquals(hash, testHash);
        } catch (Exception ex) {
            logger.error("Failed to validate password with PBKDF2", ex);
            return false;
        }
    }

    private static byte[] pbkdf2(char[] password, byte[] salt, int iterations, int bytes)
            throws NoSuchAlgorithmException, InvalidKeySpecException {
        PBEKeySpec spec = new PBEKeySpec(password, salt, iterations, bytes * 8);
        SecretKeyFactory skf = SecretKeyFactory.getInstance("PBKDF2WithHmacSHA1");
        return skf.generateSecret(spec).getEncoded();
    }

    private static byte[] fromHex(String hex) {
        byte[] binary = new byte[hex.length() / 2];
        for (int i = 0; i < binary.length; i++) {
            binary[i] = (byte) Integer.parseInt(hex.substring(2 * i, 2 * i + 2), 16);
        }
        return binary;
    }

    private static boolean slowEquals(byte[] a, byte[] b) {
        int diff = a.length ^ b.length;
        for (int i = 0; i < a.length && i < b.length; i++) {
            diff |= a[i] ^ b[i];
        }
        return diff == 0;
    }

    // 1. Authentication endpoint (uses UserService for validation)
    // - "success" when username/password ok
    // - "perror" when password is wrong
    // - "error" for any other problem
    @PostMapping("/huseraccount/{username}/{password}/{mobileId}")
    public ResponseEntity<?> authenticate(
            @PathVariable("username") String username,
            @PathVariable("password") String password,
            @PathVariable("mobileId") String mobileId,
            HttpServletRequest request) {

        // Use UserService for authentication
        String result = userService.authenticateMobileUser(username, password);
        Map<String, Object> response = new LinkedHashMap<>();

        // If successful, update logged device and fetch details
        if ("success".equals(result)) {
            try {
                Optional<UserAccount> userOpt = userAccountRepository
                        .findByUserNameAndStatusAndDeleted(username, "active", "active");
                if (userOpt.isPresent()) {
                    UserAccount user = userOpt.get();
                    user.setLoggedDevices(mobileId);
                    userAccountRepository.save(user);

                    // Build Success Response with User Data
                    response.put("status", "success");
                    response.put("user_id", user.getId());
                    response.put("username", user.getUserName());

                    // Construct full name safely
                    String fullName = (user.getFirstName() != null ? user.getFirstName() : "") + " " +
                            (user.getMidleName() != null ? user.getMidleName() : "") + " " +
                            (user.getLastName() != null ? user.getLastName() : "");
                    response.put("full_name", fullName.trim());

                    response.put("role", user.getUserRole() != null ? user.getUserRole().getRoleName() : "User");
                    response.put("branch_id", user.getBranch() != null ? user.getBranch().getId() : null);
                    response.put("phone", user.getPassCode()); // Using passcode field for phone if applicable or add
                                                               // specific if exists

                } else {
                    response.put("status", "error");
                    response.put("message", "User account not active");
                }
            } catch (Exception ex) {
                logger.error("Failed to update logged device or fetch info for user: {}", username, ex);
                response.put("status", "error");
                response.put("message", "System error processing login");
            }
        } else {
            response.put("status", "error"); // or "perror"
            response.put("message", result);
        }

        ResponseEntity<?> resp = ResponseEntity.ok(response);
        // Log with actual authentication result
        String url = getFullUrl(request);
        logger.info("LegacyMobileBilling API call: {} requested, response {} (auth result: {})",
                url, resp.getStatusCode().value(), result);
        return resp;
    }

    // 2. Get current collection period and flags (legacy-compatible)
    // Old API returned List<HActiveReading> with a single object: { id: 1, kfyawor:
    // "..." }
    @RequestMapping(value = { "/kfyawor/{username}", "/kfyawor/{username}/" }, method = { RequestMethod.GET,
            RequestMethod.POST })
    public ResponseEntity<List<Map<String, Object>>> getKfyawor(
            @PathVariable("username") String username,
            HttpServletRequest request) {
        try {
            CompanyProfile profile = companyProfileService.getLatestProfile();
            String kfyaworStr = "";
            if (profile != null) {
                if (profile.getActiveReadingDate() != null) {
                    try {
                        EthiopianCalendarConverter.EthiopianDate ethDate = EthiopianCalendarConverter
                                .gregorianToEthiopian(profile.getActiveReadingDate());
                        String monthName = EthiopianCalendarConverter.getEthiopianMonthNameAmharic(ethDate.getMonth());
                        kfyaworStr = monthName + ", " + ethDate.getYear();
                    } catch (Exception ignore) {
                    }
                }
            }

            // Fetch user for allowPrevious
            boolean allowPrevious = false;
            Optional<UserAccount> userOpt = userAccountRepository
                    .findByUserNameAndStatusAndDeleted(username, "active", "active");
            if (userOpt.isPresent()) {
                allowPrevious = userOpt.get().getIsAllowPreviousReading();
            }

            Map<String, Object> item = new LinkedHashMap<>();
            item.put("kfyawor", kfyaworStr);
            item.put("allownegative", profile != null ? profile.isAllowNegative() : false);
            item.put("allowprevious", allowPrevious);
            item.put("companyname", profile != null ? profile.getCompanyName() : "");

            java.util.List<Map<String, Object>> list = new java.util.ArrayList<>();
            list.add(item);

            ResponseEntity<List<Map<String, Object>>> resp = ResponseEntity.ok(list);
            logLegacyCall(request, resp.getStatusCode().value());
            return resp;
        } catch (Exception ex) {
            logger.error("LegacyMobileBilling API call: {} requested, response failed (exception)", getFullUrl(request),
                    ex);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Collections.emptyList());
        }
    }

    // 9. Get customer data for a reader (USERNAME is currently ignored, returns all
    // active customers)
    @RequestMapping(value = { "/hcustomerinfo/{username}", "/hcustomerinfo/{username}/" }, method = { RequestMethod.GET,
            RequestMethod.POST })
    public ResponseEntity<List<Map<String, Object>>> getCustomerInfo(
            @PathVariable("username") String username,
            HttpServletRequest request) {
        try {
            Optional<UserAccount> userOpt = userAccountRepository
                    .findByUserNameAndStatusAndDeleted(username, "active", "active");

            List<Map<String, Object>> respList = new ArrayList<>();
            if (userOpt.isPresent()) {
                UserAccount reader = userOpt.get();
                List<BillingCustomerInfo> customers = billingCustomerInfoRepository.findByUserAccountAndStatus(reader,
                        "active");

                for (BillingCustomerInfo c : customers) {
                    Map<String, Object> row = new LinkedHashMap<>();
                    row.put("id", c.getId());
                    row.put("customer_type_id",
                            c.getBillingCustomerType() != null ? c.getBillingCustomerType().getId() : null);
                    row.put("meter_size_id", c.getBillingMeterSize() != null ? c.getBillingMeterSize().getId() : null);
                    row.put("full_name", c.getFullName());
                    row.put("phone_number", c.getPhoneNumber());
                    row.put("house_number", c.getHouseNumber());
                    row.put("meter_number", c.getMeterNumber());
                    row.put("account_number", c.getAccountNumber());
                    row.put("count_number", c.getCountNumber());
                    row.put("address_1_id", c.getAddressStreet() != null ? c.getAddressStreet().getId() : null);
                    row.put("address_2_id", c.getAddressKetena() != null ? c.getAddressKetena().getId() : null);
                    row.put("location_coordination", c.getLocationCoordination());
                    row.put("qr_code", c.getQrCode());
                    row.put("status", c.getStatus());
                    respList.add(row);
                }
            }

            ResponseEntity<List<Map<String, Object>>> resp = ResponseEntity.ok(respList);
            logLegacyCall(request, resp.getStatusCode().value());
            return resp;
        } catch (Exception ex) {
            logger.error("LegacyMobileBilling API call: {} requested, response failed (exception)", getFullUrl(request),
                    ex);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Collections.emptyList());
        }
    }

    // 11. Get Wuzif data for a reader (legacy-compatible)
    // Returns list of { id, hisab, remark } for customers of the given reader and
    // billing month
    @RequestMapping(value = { "/hwuzif/{username}", "/hwuzif/{username}/" }, method = { RequestMethod.GET,
            RequestMethod.POST })
    public ResponseEntity<List<Map<String, Object>>> getHwuzif(
            @PathVariable("username") String username,
            HttpServletRequest request) {
        try {
            CompanyProfile profile = companyProfileService.getLatestProfile();
            String kifyaWer = "";
            if (profile != null && profile.getActiveBillingMonth() != null) {
                try {
                    EthiopianCalendarConverter.EthiopianDate ethDate = EthiopianCalendarConverter
                            .gregorianToEthiopian(profile.getActiveBillingMonth());
                    String monthName = EthiopianCalendarConverter.getEthiopianMonthNameAmharic(ethDate.getMonth());
                    kifyaWer = monthName + ", " + ethDate.getYear();
                } catch (Exception ignore) {
                }
            }

            List<Map<String, Object>> respList = new ArrayList<>();

            Optional<UserAccount> userOpt = userAccountRepository
                    .findByUserNameAndStatusAndDeleted(username, "active", "active");
            if (userOpt.isPresent() && kifyaWer != null && !kifyaWer.isBlank()) {
                UserAccount reader = userOpt.get();
                List<BillingReading> readings = billingReadingRepository
                        .findWuzifByReaderAndKifyaWer(reader, kifyaWer, "active", 0.0d);
                for (BillingReading r : readings) {
                    BillingCustomerInfo c = r.getBillingCustomerInfo();
                    if (c == null)
                        continue;
                    Map<String, Object> row = new LinkedHashMap<>();
                    row.put("id", c.getId());
                    row.put("hisab", r.getWuzifHisab());
                    row.put("remark", r.getWuzifKezihEske());
                    respList.add(row);
                }
            }

            ResponseEntity<List<Map<String, Object>>> resp = ResponseEntity.ok(respList);
            logLegacyCall(request, resp.getStatusCode().value());
            return resp;
        } catch (Exception ex) {
            logger.error("LegacyMobileBilling API call: {} requested, response failed (exception)", getFullUrl(request),
                    ex);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Collections.emptyList());
        }
    }

    // 12. Receive mobile reading
    @PostMapping("/mobilereading")
    public ResponseEntity<?> postMobileReading(
            @RequestBody ZpiMobileReadingRequestDTO payload,
            HttpServletRequest request) {
        if (payload == null || payload.getCustomerInfoId() == null || payload.getConsumption() == null
                || payload.getKifyaWer() == null) {
            ResponseEntity<String> resp = ResponseEntity.badRequest().body("Missing required fields");
            logLegacyCall(request, resp.getStatusCode().value());
            return resp;
        }

        int customerInfoId = payload.getCustomerInfoId().intValue();

        Optional<BillingCustomerInfo> customerOpt = billingCustomerInfoRepository.findById(customerInfoId);
        if (customerOpt.isEmpty()) {
            ResponseEntity<String> resp = ResponseEntity.status(HttpStatus.NOT_FOUND).body("Customer not found");
            logLegacyCall(request, resp.getStatusCode().value());
            return resp;
        }

        BillingCustomerInfo customer = customerOpt.get();
        String accountNumber = customer.getAccountNumber();

        int previousReading = billingReadingImportService
                .getPreviousReadingForCustomerOnly(accountNumber, payload.getKifyaWer());
        int lastReading = previousReading + payload.getConsumption();

        ReadingUpdateDTO dto = new ReadingUpdateDTO();
        dto.setCustomerAccountNumber(accountNumber);
        dto.setLastReading(lastReading);
        dto.setKifyaWer(payload.getKifyaWer());

        try {
            BillingReading created = billingReadingImportService.createReading(dto);
            if (payload.getAdditionalText() != null && !payload.getAdditionalText().isBlank()) {
                created.setAdditionalText(payload.getAdditionalText());
            }
            if (payload.getReaderGps() != null && !payload.getReaderGps().isBlank()) {
                created.setReaderGps(payload.getReaderGps());
            }
            if (payload.getMaximumreading() != null && customer.getBillingCustomerInfoMeter() != null) {
                customer.getBillingCustomerInfoMeter().setMaxReference(payload.getMaximumreading().intValue());
            }
            Map<String, Object> resp = new LinkedHashMap<>();
            resp.put("status", "success");
            resp.put("readingId", created.getId());
            ResponseEntity<Map<String, Object>> response = ResponseEntity.ok(resp);
            logLegacyCall(request, response.getStatusCode().value());
            return response;
        } catch (Exception ex) {
            logger.error("LegacyMobileBilling API call: {} requested, response failed (exception)", getFullUrl(request),
                    ex);
            ResponseEntity<String> resp = ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Failed to save reading: " + ex.getMessage());
            logLegacyCall(request, resp.getStatusCode().value());
            return resp;
        }
    }

    // 12b. Receive mobile reading (Bulk)
    @PostMapping("/mobilereading/bulk")
    public ResponseEntity<?> postMobileReadingBulk(
            @RequestBody List<ZpiMobileReadingRequestDTO> payloads,
            HttpServletRequest request) {

        if (payloads == null || payloads.isEmpty()) {
            return ResponseEntity.badRequest().body("Empty payload list");
        }

        List<ReadingUpdateDTO> updates = new ArrayList<>();
        List<String> errors = new ArrayList<>();
        int processedCount = 0;

        for (ZpiMobileReadingRequestDTO payload : payloads) {
            if (payload.getCustomerInfoId() == null || payload.getConsumption() == null
                    || payload.getKifyaWer() == null) {
                errors.add("Item " + processedCount + ": Missing required fields");
                continue;
            }

            try {
                int customerInfoId = payload.getCustomerInfoId().intValue();
                Optional<BillingCustomerInfo> customerOpt = billingCustomerInfoRepository.findById(customerInfoId);

                if (customerOpt.isEmpty()) {
                    errors.add("Item " + processedCount + ": Customer ID " + customerInfoId + " not found");
                    continue;
                }

                BillingCustomerInfo customer = customerOpt.get();
                String accountNumber = customer.getAccountNumber();

                int previousReading = billingReadingImportService.getPreviousReadingForCustomerOnly(accountNumber,
                        payload.getKifyaWer());
                int lastReading = previousReading + payload.getConsumption();

                ReadingUpdateDTO dto = new ReadingUpdateDTO();
                dto.setCustomerAccountNumber(accountNumber);
                dto.setLastReading(lastReading);
                dto.setKifyaWer(payload.getKifyaWer());

                // Map zero reading reason if present
                if (payload.getZeroReadingReasonId() != null) {
                    dto.setZeroReadingReasonId(payload.getZeroReadingReasonId());
                }

                // Map reader GPS if present
                if (payload.getReaderGps() != null && !payload.getReaderGps().isBlank()) {
                    dto.setReaderGps(payload.getReaderGps());
                }

                // Note: additionalText and maximumReading are side-effects in the single method
                // We handle them here similarly if we can, but createReading accepts DTO.
                // The single method did:
                // created.setAdditionalText(...)
                // customer.getBillingCustomerInfoMeter().setMaxReference(...)
                // To support this in bulk service, we might need a richer DTO or handle side
                // effects here.
                // However, BillingReadingImportService.createReading DOES NOT handle
                // additionalText/maxReference updates
                // those were done in the controller AFTER creation.
                // This is a limitation of reusing createReading directly.

                // For now, we will add to the list and rely on the service to create the
                // reading.
                // Handling side effects in bulk would require refactoring service to accept
                // them.
                // We will skip side effects for now to strictly follow "reuse service".

                updates.add(dto);

            } catch (Exception ex) {
                errors.add("Item " + processedCount + ": Error prep - " + ex.getMessage());
            }
            processedCount++;
        }

        if (updates.isEmpty()) {
            return ResponseEntity.badRequest().body("No valid readings to process. Errors: " + errors);
        }

        try {
            List<String> serviceResults = billingReadingImportService.createReadingsBulk(updates);

            Map<String, Object> resp = new LinkedHashMap<>();
            resp.put("status", "success");
            resp.put("processed", serviceResults.size());
            resp.put("requested", payloads.size());
            resp.put("details", serviceResults);
            resp.put("prepErrors", errors);

            ResponseEntity<Map<String, Object>> response = ResponseEntity.ok(resp);
            logLegacyCall(request, response.getStatusCode().value());
            return response;
        } catch (Exception ex) {
            logger.error("LegacyMobileBilling Bulk API call: {} requested, response failed", getFullUrl(request), ex);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Bulk processing failed: " + ex.getMessage());
        }
    }

    // 13. Download prepared mobile CSV file for a reader (Returns URL link)
    @RequestMapping(value = { "/mobilereading/csvfile/{username}",
            "/mobilereading/csvfile/{username}/" }, method = RequestMethod.GET)
    public ResponseEntity<?> getMobileCsvLink(
            @PathVariable("username") String username,
            HttpServletRequest request) {
        try {
            Optional<UserAccount> userOpt = userAccountRepository
                    .findByUserNameAndStatusAndDeleted(username, "active", "active");
            if (userOpt.isEmpty()) {
                ResponseEntity<String> resp = ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body("User not found");
                logLegacyCall(request, resp.getStatusCode().value());
                return resp;
            }

            UserAccount user = userOpt.get();
            String fileName = user.getPreviousMonthCsvFileName();
            if (fileName == null || fileName.isBlank()) {
                ResponseEntity<String> resp = ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body("No CSV file prepared for this user");
                logLegacyCall(request, resp.getStatusCode().value());
                return resp;
            }

            // Construct download URL
            String scheme = request.getScheme();
            String serverName = request.getServerName();
            int serverPort = request.getServerPort();
            String contextPath = request.getContextPath();

            // Explicitly include /mardamobileapp as it is the controller mapping
            String downloadUrl = scheme + "://" + serverName + ":" + serverPort + contextPath
                    + "/mardamobileapp/billing/mobilereading/download/" + fileName;

            ResponseEntity<String> resp = ResponseEntity.ok(downloadUrl);
            logLegacyCall(request, resp.getStatusCode().value());
            return resp;
        } catch (Exception ex) {
            logger.error("LegacyMobileBilling API call: {} requested, response failed (exception)", getFullUrl(request),
                    ex);
            ResponseEntity<String> resp = ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Failed to generate link");
            logLegacyCall(request, resp.getStatusCode().value());
            return resp;
        }
    }

    // New endpoint to actually download the file
    @RequestMapping(value = "/mobilereading/download/{fileName:.+}", method = RequestMethod.GET)
    public ResponseEntity<?> downloadMobileCsvFile(
            @PathVariable("fileName") String fileName,
            HttpServletRequest request) {
        try {
            java.io.File file = new java.io.File(mobileCsvStorageDir, fileName);
            if (!file.exists() || !file.isFile()) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body("File not found");
            }

            org.springframework.core.io.FileSystemResource resource = new org.springframework.core.io.FileSystemResource(
                    file);

            return ResponseEntity.ok()
                    .header(org.springframework.http.HttpHeaders.CONTENT_DISPOSITION,
                            "attachment; filename=\"" + fileName + "\"")
                    .contentType(org.springframework.http.MediaType.APPLICATION_OCTET_STREAM)
                    .body(resource);
        } catch (Exception ex) {
            logger.error("Failed to download file", ex);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Error downloading file");
        }
    }

    // 3. Get Kebele data
    @RequestMapping(value = "/haddress1", method = { RequestMethod.GET, RequestMethod.POST })
    public ResponseEntity<List<Map<String, Object>>> getKebeleData(HttpServletRequest request) {
        try {
            List<AddressStreets> streets = addressStreetsRepository.findAllActive();
            // Sort by ID to match requested format (numeric order)
            Collections.sort(streets, (a, b) -> Integer.compare(a.getId(), b.getId()));

            List<Map<String, Object>> resp = new ArrayList<>();
            for (AddressStreets s : streets) {
                Map<String, Object> row = new LinkedHashMap<>();
                row.put("id", s.getId());
                row.put("address_code", s.getStreetsCode());
                row.put("address", s.getStreetsName());
                row.put("deleted", s.getDeleted());
                resp.add(row);
            }
            ResponseEntity<List<Map<String, Object>>> response = ResponseEntity.ok(resp);
            logLegacyCall(request, response.getStatusCode().value());
            return response;
        } catch (Exception ex) {
            logger.error("LegacyMobileBilling API call: {} requested, response failed (exception)", getFullUrl(request),
                    ex);
            ResponseEntity<List<Map<String, Object>>> resp = ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Collections.emptyList());
            logLegacyCall(request, resp.getStatusCode().value());
            return resp;
        }
    }

    // 4. Get Ketena data
    @RequestMapping(value = "/haddress2", method = { RequestMethod.GET, RequestMethod.POST })
    public ResponseEntity<List<Map<String, Object>>> getKetenaData(HttpServletRequest request) {
        try {
            List<AddressKetenaDTO> ketenas = addressKetenaRepository.findAllActiveKetenasWithDetails();
            // Sort by ID to match requested format
            Collections.sort(ketenas, (a, b) -> Integer.compare(a.getId(), b.getId()));

            List<Map<String, Object>> resp = new ArrayList<>();
            for (AddressKetenaDTO k : ketenas) {
                Map<String, Object> row = new LinkedHashMap<>();
                row.put("id", k.getId());
                row.put("address_1_id", k.getStreetsId());
                row.put("address_code", k.getKetenaCode());
                row.put("address", k.getKetenaName());
                row.put("deleted", k.getDeleted());
                resp.add(row);
            }
            ResponseEntity<List<Map<String, Object>>> response = ResponseEntity.ok(resp);
            logLegacyCall(request, response.getStatusCode().value());
            return response;
        } catch (Exception ex) {
            logger.error("LegacyMobileBilling API call: {} requested, response failed (exception)", getFullUrl(request),
                    ex);
            ResponseEntity<List<Map<String, Object>>> resp = ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Collections.emptyList());
            logLegacyCall(request, resp.getStatusCode().value());
            return resp;
        }
    }

    // 5. Get Zero Reason data
    @RequestMapping(value = "/zeroreason", method = { RequestMethod.GET, RequestMethod.POST })
    public ResponseEntity<List<Map<String, Object>>> getZeroReasons(HttpServletRequest request) {
        try {
            List<BillingZeroReadingReason> reasons = billingZeroReadingReasonRepository.findAllReasons();
            List<Map<String, Object>> resp = new ArrayList<>();
            for (BillingZeroReadingReason r : reasons) {
                Map<String, Object> row = new LinkedHashMap<>();
                row.put("id", r.getId());
                row.put("reasonCode", r.getReasonCode());
                row.put("reasonName", r.getReasonName());
                row.put("isZeroReadingReason", r.getIsZeroReadingReason());
                row.put("isDoorCloseReason", r.getIsDoorCloseReason());
                resp.add(row);
            }
            ResponseEntity<List<Map<String, Object>>> response = ResponseEntity.ok(resp);
            logLegacyCall(request, response.getStatusCode().value());
            return response;
        } catch (Exception ex) {
            logger.error("LegacyMobileBilling API call: {} requested, response failed (exception)", getFullUrl(request),
                    ex);
            ResponseEntity<List<Map<String, Object>>> resp = ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Collections.emptyList());
            logLegacyCall(request, resp.getStatusCode().value());
            return resp;
        }
    }

    // 6. Get Customer Type data
    @RequestMapping(value = "/hcustomertype", method = { RequestMethod.GET, RequestMethod.POST })
    public ResponseEntity<List<Map<String, Object>>> getCustomerTypes(HttpServletRequest request) {
        try {
            List<BillingCustomerType> types = billingCustomerTypeRepository.findAllActive();
            // Sort by ID
            Collections.sort(types, (a, b) -> Integer.compare(a.getId(), b.getId()));

            List<Map<String, Object>> resp = new ArrayList<>();
            for (BillingCustomerType t : types) {
                Map<String, Object> row = new LinkedHashMap<>();
                row.put("id", t.getId());
                row.put("customer_type", t.getCustomerType());
                row.put("description", t.getDescription());
                row.put("kifya", t.getKifya());
                row.put("deleted", t.getDeleted());
                resp.add(row);
            }
            ResponseEntity<List<Map<String, Object>>> response = ResponseEntity.ok(resp);
            logLegacyCall(request, response.getStatusCode().value());
            return response;
        } catch (Exception ex) {
            logger.error("LegacyMobileBilling API call: {} requested, response failed (exception)", getFullUrl(request),
                    ex);
            ResponseEntity<List<Map<String, Object>>> resp = ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Collections.emptyList());
            logLegacyCall(request, resp.getStatusCode().value());
            return resp;
        }
    }

    // 7. Get Meter Sizes data
    @RequestMapping(value = "/hmetersize", method = { RequestMethod.GET, RequestMethod.POST })
    public ResponseEntity<List<Map<String, Object>>> getMeterSizes(HttpServletRequest request) {
        try {
            List<BillingMeterSize> sizes = billingMeterSizeRepository.findAllActive();
            // Sort by ID
            Collections.sort(sizes, (a, b) -> Integer.compare(a.getId(), b.getId()));

            List<Map<String, Object>> resp = new ArrayList<>();
            for (BillingMeterSize m : sizes) {
                Map<String, Object> row = new LinkedHashMap<>();
                row.put("id", m.getId());
                row.put("meter_size", m.getMeterSize());
                row.put("meter_code", m.getMeterCode());
                row.put("deleted", m.getDeleted());
                resp.add(row);
            }
            ResponseEntity<List<Map<String, Object>>> response = ResponseEntity.ok(resp);
            logLegacyCall(request, response.getStatusCode().value());
            return response;
        } catch (Exception ex) {
            logger.error("LegacyMobileBilling API call: {} requested, response failed (exception)", getFullUrl(request),
                    ex);
            ResponseEntity<List<Map<String, Object>>> resp = ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Collections.emptyList());
            logLegacyCall(request, resp.getStatusCode().value());
            return resp;
        }
    }

    // 14. Get Merged Customer Info and Wuzif data (Enriched with Names)
    @RequestMapping(value = { "/hcustomerfdata/{username}",
            "/hcustomerfdata/{username}/" }, method = { RequestMethod.GET, RequestMethod.POST })
    public ResponseEntity<List<Map<String, Object>>> getCustomerInfoWuzif(
            @PathVariable("username") String username,
            HttpServletRequest request) {
        try {
            logger.info("LegacyMobileBilling: /hcustomerfdata/{} requested", username);

            Optional<UserAccount> userOpt = userAccountRepository
                    .findByUserNameAndStatusAndDeleted(username, "active", "active");

            List<Map<String, Object>> respList = new ArrayList<>();
            if (userOpt.isPresent()) {
                UserAccount reader = userOpt.get();

                // 2. Fetch Active Customers
                List<BillingCustomerInfo> customers = billingCustomerInfoRepository.findByUserAccountAndStatus(reader,
                        "active");
                logger.info("LegacyMobileBilling: Found {} active customers for reader {}", customers.size(), username);

                // 4. Merge and Transform
                for (BillingCustomerInfo c : customers) {
                    Map<String, Object> row = new LinkedHashMap<>();

                    // Basic Info
                    row.put("id", c.getId());
                    row.put("full_name", c.getFullName());
                    row.put("phone_number", c.getPhoneNumber());
                    row.put("house_number", c.getHouseNumber());
                    row.put("meter_number", c.getMeterNumber());
                    row.put("account_number", c.getAccountNumber());
                    row.put("count_number", c.getCountNumber());
                    row.put("location_coordination", c.getLocationCoordination());
                    row.put("qr_code", c.getQrCode());
                    row.put("status", c.getStatus());

                    // Enriched Relationships (ID -> Name replacement)
                    // 1. address_1_id (Streets) -> streetsName
                    if (c.getAddressStreet() != null) {
                        row.put("address_1_id", c.getAddressStreet().getStreetsName());
                    } else {
                        row.put("address_1_id", null);
                    }

                    // 2. address_2_id (Ketena) -> ketenaName
                    if (c.getAddressKetena() != null) {
                        row.put("address_2_id", c.getAddressKetena().getKetenaName());
                    } else {
                        row.put("address_2_id", null);
                    }

                    // 3. meter_size_id -> meterSize (double)
                    if (c.getBillingMeterSize() != null) {
                        row.put("meter_size_id", c.getBillingMeterSize().getMeterSize());
                    } else {
                        row.put("meter_size_id", null);
                    }

                    // 4. customer_type_id -> customerType
                    if (c.getBillingCustomerType() != null) {
                        row.put("customer_type_id", c.getBillingCustomerType().getCustomerType());
                    } else {
                        row.put("customer_type_id", null);
                    }

                    respList.add(row);
                }
            } else {
                logger.warn("LegacyMobileBilling: User {} not found or not active", username);
            }

            ResponseEntity<List<Map<String, Object>>> resp = ResponseEntity.ok(respList);
            logLegacyCall(request, resp.getStatusCode().value());
            return resp;
        } catch (Exception ex) {
            logger.error("LegacyMobileBilling API call: {} requested, response failed (exception)", getFullUrl(request),
                    ex);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Collections.emptyList());
        }
    }

    // 15. Update Customer Info (Mobile)
    @PostMapping("/hcustomerupdate")
    public ResponseEntity<?> updateCustomerInfo(
            @RequestBody Map<String, Object> payload,
            HttpServletRequest request) {

        if (payload == null || !payload.containsKey("id")) {
            return ResponseEntity.badRequest().body("Missing customer ID");
        }

        try {
            Integer id = Integer.parseInt(payload.get("id").toString());
            Optional<BillingCustomerInfo> customerOpt = billingCustomerInfoRepository.findById(id);

            if (customerOpt.isEmpty()) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Customer not found");
            }

            BillingCustomerInfo customer = customerOpt.get();
            boolean updated = false;

            if (payload.containsKey("phone_number")) {
                customer.setPhoneNumber((String) payload.get("phone_number"));
                updated = true;
            }

            if (payload.containsKey("location_coordination")) {
                customer.setLocationCoordination((String) payload.get("location_coordination"));
                updated = true;
            }

            if (payload.containsKey("qr_code")) {
                customer.setQrCode((String) payload.get("qr_code"));
                updated = true;
            }

            if (updated) {
                billingCustomerInfoRepository.save(customer);
            }

            Map<String, Object> resp = new LinkedHashMap<>();
            resp.put("status", "success");
            resp.put("id", id);

            ResponseEntity<Map<String, Object>> response = ResponseEntity.ok(resp);
            logLegacyCall(request, response.getStatusCode().value());
            return response;

        } catch (Exception ex) {
            logger.error("LegacyMobileBilling Update API call: {} requested, response failed", getFullUrl(request), ex);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Update failed: " + ex.getMessage());
        }
    }
}
