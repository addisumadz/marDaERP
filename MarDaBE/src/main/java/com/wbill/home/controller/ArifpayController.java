package com.wbill.home.controller;

import com.wbill.home.model.ArifPayConfig;
import com.wbill.home.model.BillingBanks;
import com.wbill.home.model.BillingCustomerInfo;
import com.wbill.home.model.BillingReading;
import com.wbill.home.repository.BillingBanksRepository;
import com.wbill.home.repository.BillingReadingRepository;
import com.wbill.home.service.ArifPayConfigService;
import com.wbill.home.service.BankPaymentImportService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.client.RestTemplate;

import java.time.LocalDateTime;
import java.util.*;

@RestController
@RequestMapping({"/api/mardaerp/payments/arifpay", "/api/card_managenment/payments/arifpay"})
public class ArifpayController {

    private static final Logger logger = LoggerFactory.getLogger(ArifpayController.class);

    @Autowired
    private BillingReadingRepository readingRepository;

    @Autowired
    private ArifPayConfigService configService;

    @Autowired
    private BankPaymentImportService bankPaymentImportService;

    @Autowired
    private BillingBanksRepository billingBanksRepository;

    private final RestTemplate restTemplate = new RestTemplate();

    /**
     * Get current ArifPay configuration.
     */
    @GetMapping("/config")
    public ResponseEntity<?> getConfig() {
        try {
            ArifPayConfig config = configService.getConfig();
            return ResponseEntity.ok(config);
        } catch (Exception e) {
            logger.error("[ArifpayController] Failed to retrieve ArifPay config", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("message", "Failed to retrieve configuration: " + e.getMessage()));
        }
    }

    /**
     * Update or create ArifPay configuration.
     */
    @RequestMapping(value = "/config", method = {RequestMethod.POST, RequestMethod.PUT})
    public ResponseEntity<?> updateConfig(@RequestBody ArifPayConfig configData) {
        try {
            logger.info("[ArifpayController] Updating ArifPay configuration...");
            ArifPayConfig saved = configService.saveConfig(configData);
            return ResponseEntity.ok(saved);
        } catch (Exception e) {
            logger.error("[ArifpayController] Failed to save ArifPay config", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("message", "Failed to save configuration: " + e.getMessage()));
        }
    }

    /**
     * Initiate an ArifPay payment checkout session for a billing reading.
     */
    @PostMapping("/initiate/{readingId}")
    public ResponseEntity<?> initiatePayment(@PathVariable Integer readingId,
                                             @RequestBody(required = false) Map<String, String> body) {
        ArifPayConfig config = configService.getConfig();

        Optional<BillingReading> readingOpt = readingRepository.findById(readingId);
        if (readingOpt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("message", "Bill reading not found with ID: " + readingId));
        }

        BillingReading reading = readingOpt.get();
        if (!reading.isBillGenerated()) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("message", "Bill is not generated for this reading"));
        }
        if (reading.isMoneyCollected() || reading.isMardaArifPaid()) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("message", "Bill is already paid"));
        }

        double amountDue = reading.getTekilalaTekefay() > 0 ? reading.getTekilalaTekefay() : (reading.getYezihWer() + reading.getKotariKiray());
        if (amountDue <= 0) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("message", "Bill amount due must be greater than 0"));
        }

        // Unique transaction reference / nonce
        String nonce = reading.getId() + "_" + System.currentTimeMillis();

        // Fallback mock session for local test mode
        if ("test_api_key_123456789".equals(config.getApiKey())) {
            logger.info("[ArifpayController] Using mock session response for development testing");
            Map<String, Object> mockRes = new LinkedHashMap<>();
            String mockSessionId = "mock_session_" + reading.getId() + "_" + System.currentTimeMillis();
            mockRes.put("sessionId", mockSessionId);
            String mockCheckoutUrl = config.getSuccessUrl() + "&sessionId=" + mockSessionId + "&referenceId=" + nonce;
            mockRes.put("checkoutUrl", mockCheckoutUrl);
            return ResponseEntity.ok(mockRes);
        }

        // Build checkout session request payload
        Map<String, Object> payload = new LinkedHashMap<>();
        payload.put("cancelUrl", config.getCancelUrl());
        payload.put("successUrl", config.getSuccessUrl());
        payload.put("errorUrl", config.getErrorUrl());

        String notifyUrl = config.getNotifyUrl();
        if (notifyUrl == null || notifyUrl.trim().isEmpty()) {
            notifyUrl = getDirectWebhookUrl();
        }
        payload.put("notifyUrl", notifyUrl);

        // Extract phone number
        BillingCustomerInfo customer = reading.getBillingCustomerInfo();
        String rawPhone = (body != null && body.get("phone") != null && !body.get("phone").trim().isEmpty())
                ? body.get("phone")
                : (customer != null ? customer.getPhoneNumber() : null);
        String phone = normalizePhone(rawPhone);

        if (phone == null || !phone.matches("^\\+251[97]\\d{8}$")) {
            logger.warn("[ArifpayController] Invalid Ethiopian mobile phone for reading ID={}: raw='{}', normalized='{}'",
                    readingId, rawPhone, phone);
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("message", "A valid 9-digit Ethiopian mobile number is required (+2519XXXXXXXX or +2517XXXXXXXX)"));
        }
        payload.put("phone", phone);

        // Update customer phone in session if requested
        if (customer != null && body != null && "true".equalsIgnoreCase(body.get("saveToCustomer"))) {
            try {
                customer.setPhoneNumber(phone);
            } catch (Exception e) {
                logger.warn("[ArifpayController] Could not update customer phone in session: {}", e.getMessage());
            }
        }

        String email = (body != null && body.get("email") != null && !body.get("email").trim().isEmpty())
                ? body.get("email").trim() : "customer@example.com";
        payload.put("email", email);
        payload.put("nonce", nonce);

        // Expiration in 24 hours
        String expireDateStr = LocalDateTime.now().plusDays(1).toString();
        payload.put("expireDate", expireDateStr);

        Map<String, Object> item = new LinkedHashMap<>();
        String itemName = "Water Bill Payment (" + (reading.getKifyaWer() != null ? reading.getKifyaWer() : "Reading " + reading.getId()) + ")";
        item.put("name", itemName);
        item.put("price", amountDue);
        item.put("quantity", 1);
        item.put("description", "Bill ID: " + reading.getId() + (reading.getInvoiceNumber() != null ? " Inv: " + reading.getInvoiceNumber() : ""));
        payload.put("items", Collections.singletonList(item));

        String lang = (body != null && body.get("lang") != null) ? body.get("lang") : "EN";
        payload.put("lang", lang);

        try {
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            headers.set("x-arifpay-key", config.getApiKey());

            HttpEntity<Map<String, Object>> entity = new HttpEntity<>(payload, headers);
            logger.info("[ArifpayController] Creating ArifPay Session. Reading ID={}, Amount={}, Url={}",
                    readingId, amountDue, config.getApiUrl());

            ResponseEntity<Map> response = restTemplate.postForEntity(config.getApiUrl(), entity, Map.class);
            if (response.getStatusCode().is2xxSuccessful() && response.getBody() != null) {
                Map<String, Object> responseBody = response.getBody();
                logger.info("[ArifpayController] Raw ArifPay response: {}", responseBody);

                Map<String, Object> data = responseBody;
                if (responseBody.containsKey("data") && responseBody.get("data") instanceof Map) {
                    data = (Map<String, Object>) responseBody.get("data");
                }

                String sid = getStringField(data, "sessionId", "session_id", "id");
                String checkoutUrl = getStringField(data, "paymentUrl", "payment_url", "checkoutUrl", "checkout_url", "url");
                if (checkoutUrl != null) {
                    checkoutUrl = checkoutUrl.replaceAll("(?<!https?:)/{2,}", "/");
                }

                logger.info("[ArifpayController] Extracted sessionId={}, checkoutUrl={}", sid, checkoutUrl);

                Map<String, Object> result = new LinkedHashMap<>(responseBody);
                if (sid != null) result.put("sessionId", sid);
                if (checkoutUrl != null) result.put("checkoutUrl", checkoutUrl);
                return ResponseEntity.ok(result);
            } else {
                logger.error("[ArifpayController] Checkout failed: status={}, body={}",
                        response.getStatusCode(), response.getBody());
                return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                        .body(Map.of("message", "Arifpay returned code: " + response.getStatusCode().value()));
            }
        } catch (Exception e) {
            logger.error("[ArifpayController] Error initiating payment checkout session", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("message", "Exception creating checkout session: " + e.getMessage()));
        }
    }

    /**
     * Webhook Callback endpoint for ArifPay asynchronous transaction updates.
     */
    @PostMapping("/callback")
    public ResponseEntity<?> handleCallback(@RequestBody Map<String, Object> payload) {
        logger.info("[ArifpayController] Webhook notification received: {}", payload);
        try {
            Map<String, Object> data = payload;
            if (payload.containsKey("data") && payload.get("data") instanceof Map) {
                data = (Map<String, Object>) payload.get("data");
            }

            String status = getStringField(data, "transactionStatus", "status", "paymentStatus");
            String transactionId = getStringField(data, "transactionId");
            if (transactionId == null && data.get("transaction") instanceof Map) {
                Map<String, Object> txn = (Map<String, Object>) data.get("transaction");
                transactionId = getStringField(txn, "transactionId");
            }
            String referenceId = getStringField(data, "nonce", "referenceId");
            String sessionId = getStringField(data, "sessionId", "uuid");

            logger.info("[ArifpayController] Parsed webhook: status={}, transactionId={}, referenceId={}, sessionId={}",
                    status, transactionId, referenceId, sessionId);

            if ("SUCCESS".equalsIgnoreCase(status) || "PAID".equalsIgnoreCase(status)
                    || "COMPLETED".equalsIgnoreCase(status)) {
                processSuccessfulPayment(referenceId, transactionId, data, sessionId);
                return ResponseEntity.ok(Map.of("status", "SUCCESS"));
            } else {
                return ResponseEntity.ok(Map.of("status", "IGNORED"));
            }
        } catch (Exception e) {
            logger.error("[ArifpayController] Webhook processing failed", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", e.getMessage()));
        }
    }

    /**
     * Fetch payment checkout session status from ArifPay directly.
     */
    @GetMapping("/status/{sessionId}")
    public ResponseEntity<?> getPaymentStatus(@PathVariable String sessionId) {
        logger.info("[ArifpayController] Verifying payment status for session: {}", sessionId);

        // Fallback for mock sandbox sessions
        if (sessionId.startsWith("mock_session_")) {
            try {
                String[] parts = sessionId.split("_");
                Integer readingId = Integer.parseInt(parts[2]);
                Optional<BillingReading> readingOpt = readingRepository.findById(readingId);
                if (readingOpt.isPresent()) {
                    BillingReading reading = readingOpt.get();
                    if (!reading.isMoneyCollected() || !reading.isMardaArifPaid()) {
                        double amount = reading.getTekilalaTekefay() > 0 ? reading.getTekilalaTekefay() : (reading.getYezihWer() + reading.getKotariKiray());
                        recordArifpayPayment(reading, amount, "MOCK-TXN-" + System.currentTimeMillis(), "TELEBIRR", null, sessionId);
                        logger.info("[ArifpayController] Mock payment successfully recorded for reading ID: {}", readingId);
                    }
                    return ResponseEntity.ok(Map.of(
                            "status", "SUCCESS",
                            "readingId", reading.getId(),
                            "paymentMethod", "Telebirr",
                            "paymentChannel", "Telebirr",
                            "bankName", "Telebirr",
                            "transactionId", "MOCK-TXN-" + System.currentTimeMillis()
                    ));
                }
            } catch (Exception e) {
                logger.error("[ArifpayController] Failed to parse mock session ID", e);
            }
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of("message", "Invalid mock session"));
        }

        try {
            ArifPayConfig config = configService.getConfig();
            HttpHeaders headers = new HttpHeaders();
            headers.set("x-arifpay-key", config.getApiKey());
            HttpEntity<Void> entity = new HttpEntity<>(headers);

            String queryUrl = config.getApiUrl() + "/" + sessionId;
            ResponseEntity<Map> response = restTemplate.exchange(queryUrl, HttpMethod.GET, entity, Map.class);

            if (response.getStatusCode().is2xxSuccessful() && response.getBody() != null) {
                Map<String, Object> responseBody = response.getBody();
                logger.info("[ArifpayController] Raw status response: {}", responseBody);

                Map<String, Object> sessionData = responseBody;
                if (responseBody.containsKey("data") && responseBody.get("data") instanceof Map) {
                    sessionData = (Map<String, Object>) responseBody.get("data");
                }

                String paymentStatus = getStringField(sessionData, "transactionStatus", "paymentStatus", "status");
                String referenceId = getStringField(sessionData, "nonce", "referenceId");
                String transactionId = getStringField(sessionData, "transactionId");
                if (transactionId == null && sessionData.get("transaction") instanceof Map) {
                    Map<String, Object> txn = (Map<String, Object>) sessionData.get("transaction");
                    transactionId = getStringField(txn, "transactionId");
                }

                logger.info("[ArifpayController] Parsed status: paymentStatus={}, transactionId={}, referenceId={}",
                        paymentStatus, transactionId, referenceId);

                if ("SUCCESS".equalsIgnoreCase(paymentStatus) || "PAID".equalsIgnoreCase(paymentStatus)
                        || "COMPLETED".equalsIgnoreCase(paymentStatus)) {
                    BillingReading updatedReading = processSuccessfulPayment(referenceId, transactionId, sessionData, sessionId);

                    String rawMethod = extractPaymentMethod(sessionData);
                    BillingBanks bank = resolveArifpayBank(rawMethod);
                    String bankDisplayName = (bank != null) ? bank.getBankName() : (rawMethod != null ? rawMethod : "ArifPay");

                    Map<String, Object> successResult = new LinkedHashMap<>();
                    successResult.put("status", "SUCCESS");
                    if (updatedReading != null) {
                        successResult.put("readingId", updatedReading.getId());
                    }
                    successResult.put("paymentMethod", bankDisplayName);
                    successResult.put("paymentChannel", bankDisplayName);
                    successResult.put("bankName", bankDisplayName);
                    successResult.put("transactionId", transactionId != null ? transactionId : "");
                    successResult.put("details", responseBody);

                    return ResponseEntity.ok(successResult);
                } else {
                    return ResponseEntity.ok(Map.of("status", paymentStatus != null ? paymentStatus : "PENDING",
                            "details", responseBody));
                }
            } else {
                return ResponseEntity.status(response.getStatusCode())
                        .body(Map.of("message", "Arifpay query response: " + response.getStatusCode().value()));
            }
        } catch (Exception e) {
            logger.error("[ArifpayController] Error querying status", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("message", "Exception checking status: " + e.getMessage()));
        }
    }

    private BillingReading processSuccessfulPayment(String referenceId, String transactionId, Map<String, Object> data, String sessionId) {
        if (referenceId == null) {
            logger.error("[ArifpayController] Cannot record payment: referenceId is null");
            return null;
        }

        String[] parts = referenceId.split("_");
        Integer readingId = Integer.parseInt(parts[0]);

        Optional<BillingReading> readingOpt = readingRepository.findById(readingId);
        if (readingOpt.isPresent()) {
            BillingReading reading = readingOpt.get();
            if (!reading.isMoneyCollected() || !reading.isMardaArifPaid()) {
                Double amountPaid = reading.getTekilalaTekefay() > 0 ? reading.getTekilalaTekefay() : (reading.getYezihWer() + reading.getKotariKiray());
                if (data.containsKey("amount")) {
                    try {
                        amountPaid = ((Number) data.get("amount")).doubleValue();
                    } catch (Exception e) {
                        // ignore and use default
                    }
                } else if (data.containsKey("totalAmount")) {
                    try {
                        amountPaid = ((Number) data.get("totalAmount")).doubleValue();
                    } catch (Exception e) {
                        // ignore and use default
                    }
                }

                String paymentMethod = extractPaymentMethod(data);
                String payerPhone = extractPayerPhone(data);

                BillingReading saved = recordArifpayPayment(reading, amountPaid,
                        transactionId != null ? transactionId : ("ARIFPAY-" + System.currentTimeMillis()),
                        paymentMethod, payerPhone, sessionId);
                logger.info("[ArifpayController] Arifpay payment successfully recorded for Reading ID: {}", readingId);
                return saved;
            } else {
                return reading;
            }
        } else {
            logger.error("[ArifpayController] Reading ID {} not found", readingId);
            return null;
        }
    }

    private BillingReading recordArifpayPayment(BillingReading reading, Double amountPaid, String transactionId,
                                                String rawPaymentMethod, String payerPhone, String sessionId) {
        Date now = new Date();
        reading.setMardaArifPaid(true);
        reading.setPaidThroughBank(true);
        reading.setMoneyCollected(true);
        reading.setMoneyCollectedDate(now);
        reading.setmMoneyCollectedDate(now);
        double actualAmount = (amountPaid != null && amountPaid > 0) ? amountPaid : reading.getTekilalaTekefay();
        reading.setTekilalaYetekefele(actualAmount);
        reading.setTekilalaBankYetekefele(actualAmount);

        // 1. Transaction confirmation code
        if (transactionId != null && !transactionId.isBlank()) {
            reading.setmBankPaidConfirmationCode(transactionId.trim());
            reading.setBankPaidConfirmationCode(transactionId.trim());
        }

        // 2. Resolve Payment Method & Link Bank Entity from Arifpay gateway
        BillingBanks bank = resolveArifpayBank(rawPaymentMethod);
        String bankName = (bank != null) ? bank.getBankName() : (rawPaymentMethod != null && !rawPaymentMethod.isBlank() ? rawPaymentMethod.trim() : "ArifPay");

        reading.setmBankPaidAgentId(bankName);
        reading.setBankPaidAgentId(bankName);
        if (bank != null) {
            reading.setmBillingBank(bank);
            reading.setBillingBanks(bank);
        }

        reading.setMoneyCollector(bankName.equalsIgnoreCase("ArifPay") ? "Arifpay" : "Arifpay (" + bankName + ")");

        // 3. Rich Payment Details in bill_description_bank
        String auditDetail = String.format("Paid via ArifPay [%s] | Txn: %s | Phone: %s | Session: %s | Date: %s",
                bankName,
                transactionId != null ? transactionId : "N/A",
                payerPhone != null ? payerPhone : "N/A",
                sessionId != null ? sessionId : "N/A",
                now.toString());
        reading.setBillDescriptionBank(auditDetail);

        reading.setModifiedDate(now);

        BillingCustomerInfo customer = reading.getBillingCustomerInfo();
        if (customer != null && !customer.getOldIfPenaltyPaid() && customer.getOldHasPenalty()) {
            reading.setOldPenalityPaidInThisMonth(true);
        }

        BillingReading saved = readingRepository.save(reading);
        try {
            bankPaymentImportService.processPaymentRelatedUpdates(saved);
        } catch (Exception e) {
            logger.warn("[ArifpayController] Error running processPaymentRelatedUpdates: {}", e.getMessage());
        }
        return saved;
    }

    private BillingBanks resolveArifpayBank(String rawMethod) {
        if (billingBanksRepository == null) {
            return null;
        }
        try {
            if (rawMethod != null && !rawMethod.isBlank()) {
                String clean = rawMethod.trim().toUpperCase();
                // Direct lookup against gateway_code = 'Arifpay'
                List<BillingBanks> matches = billingBanksRepository.findArifpayBankByMethod(clean);
                if (!matches.isEmpty()) {
                    return matches.get(0);
                }
                // Check substring / common abbreviations
                if (clean.contains("TELEBIRR")) {
                    matches = billingBanksRepository.findArifpayBankByMethod("TELEBIRR");
                } else if (clean.contains("CBE")) {
                    matches = billingBanksRepository.findArifpayBankByMethod("CBE");
                } else if (clean.contains("ABYSSINIA") || clean.equals("BOA")) {
                    matches = billingBanksRepository.findArifpayBankByMethod("BOA");
                } else if (clean.contains("AWASH")) {
                    matches = billingBanksRepository.findArifpayBankByMethod("AWASH");
                } else if (clean.contains("MPESA") || clean.contains("M-PESA")) {
                    matches = billingBanksRepository.findArifpayBankByMethod("MPESA");
                } else if (clean.contains("DASHEN")) {
                    matches = billingBanksRepository.findArifpayBankByMethod("DASHEN");
                } else if (clean.contains("AMHARA")) {
                    matches = billingBanksRepository.findArifpayBankByMethod("AMHARA");
                } else if (clean.contains("WEGAGEN")) {
                    matches = billingBanksRepository.findArifpayBankByMethod("WEGAGEN");
                } else if (clean.contains("CARD") || clean.contains("VISA") || clean.contains("MASTER")) {
                    matches = billingBanksRepository.findArifpayBankByMethod("CARD");
                }
                if (matches != null && !matches.isEmpty()) {
                    return matches.get(0);
                }
            }

            // Fallback to generic ArifPay row under gateway_code = 'Arifpay'
            List<BillingBanks> generic = billingBanksRepository.findArifpayBankByMethod("ARIFPAY");
            if (!generic.isEmpty()) {
                return generic.get(0);
            }
        } catch (Exception e) {
            logger.warn("[ArifpayController] Exception resolving ArifPay bank for method '{}': {}", rawMethod, e.getMessage());
        }
        return null;
    }

    private String extractPaymentMethod(Map<String, Object> data) {
        if (data == null) return null;
        String method = getStringField(data, "paymentMethod", "paymentType", "paymentRail", "channel", "bank");
        if (method == null && data.get("transaction") instanceof Map) {
            Map<String, Object> txn = (Map<String, Object>) data.get("transaction");
            method = getStringField(txn, "paymentMethod", "paymentType", "paymentRail", "bank", "bankName");
        }
        return method;
    }

    private String extractPayerPhone(Map<String, Object> data) {
        if (data == null) return null;
        String phone = getStringField(data, "phone", "phoneNumber", "payerPhone");
        if (phone == null && data.get("transaction") instanceof Map) {
            Map<String, Object> txn = (Map<String, Object>) data.get("transaction");
            phone = getStringField(txn, "phone", "phoneNumber");
        }
        return phone;
    }

    /**
     * Normalize phone number to ArifPay E.164 format: +251XXXXXXXXX
     */
    private String normalizePhone(String phone) {
        if (phone == null || phone.trim().isEmpty()) {
            return null;
        }
        phone = phone.trim().replaceAll("[\\s\\-\\(\\)]", "");
        if (phone.startsWith("+251")) {
            return phone;
        }
        if (phone.startsWith("251")) {
            return "+" + phone;
        }
        if (phone.startsWith("0")) {
            return "+251" + phone.substring(1);
        }
        if (phone.length() == 9 && (phone.startsWith("9") || phone.startsWith("7"))) {
            return "+251" + phone;
        }
        return phone.startsWith("+") ? phone : "+" + phone;
    }

    private String getDirectWebhookUrl() {
        // May be configured via environment/company profile if needed
        return "http://localhost:9092/api/mardaerp/payments/arifpay/callback";
    }

    private String getStringField(Map<String, Object> map, String... keys) {
        for (String key : keys) {
            Object val = map.get(key);
            if (val != null) {
                return val.toString();
            }
        }
        return null;
    }
}
