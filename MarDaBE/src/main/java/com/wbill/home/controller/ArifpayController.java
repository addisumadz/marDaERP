package com.wbill.home.controller;

import com.wbill.home.model.ArifPayConfig;
import com.wbill.home.model.BillingCustomerInfo;
import com.wbill.home.model.BillingReading;
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
        String rawPhone = (body != null && body.get("phone") != null) ? body.get("phone")
                : (customer != null ? customer.getPhoneNumber() : null);
        String phone = normalizePhone(rawPhone);
        payload.put("phone", phone);

        String email = "customer@example.com";
        payload.put("email", email);
        payload.put("nonce", nonce);
        payload.put("paymentMethods", Arrays.asList("TELEBIRR_USSD", "CBE", "AWASH_BIRR"));

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

        Map<String, Object> beneficiary = new LinkedHashMap<>();
        beneficiary.put("accountNumber", config.getBeneficiaryAccount());
        beneficiary.put("bank", config.getBeneficiaryBank());
        beneficiary.put("amount", amountDue);
        payload.put("beneficiaries", Collections.singletonList(beneficiary));

        payload.put("lang", "EN");

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
            Map<String, Object> data = (Map<String, Object>) payload.get("data");
            if (data == null) {
                data = payload;
            }

            String status = getStringField(data, "transactionStatus", "status");
            String transactionId = getStringField(data, "transactionId");
            if (transactionId == null && data.get("transaction") instanceof Map) {
                Map<String, Object> txn = (Map<String, Object>) data.get("transaction");
                transactionId = getStringField(txn, "transactionId");
            }
            String referenceId = getStringField(data, "nonce", "referenceId");

            logger.info("[ArifpayController] Parsed webhook: status={}, transactionId={}, referenceId={}",
                    status, transactionId, referenceId);

            if ("SUCCESS".equalsIgnoreCase(status) || "PAID".equalsIgnoreCase(status)
                    || "COMPLETED".equalsIgnoreCase(status)) {
                processSuccessfulPayment(referenceId, transactionId, data);
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
                        recordArifpayPayment(reading, amount, "MOCK-TXN-" + System.currentTimeMillis());
                        logger.info("[ArifpayController] Mock payment successfully recorded for reading ID: {}", readingId);
                    }
                    return ResponseEntity.ok(Map.of("status", "SUCCESS", "readingId", reading.getId()));
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
                Map<String, Object> sessionData = response.getBody();
                logger.info("[ArifpayController] Raw status response: {}", sessionData);

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
                    processSuccessfulPayment(referenceId, transactionId, sessionData);
                    return ResponseEntity.ok(Map.of("status", "SUCCESS", "details", sessionData));
                } else {
                    return ResponseEntity.ok(Map.of("status", paymentStatus != null ? paymentStatus : "PENDING",
                            "details", sessionData));
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

    private void processSuccessfulPayment(String referenceId, String transactionId, Map<String, Object> data) {
        if (referenceId == null) {
            logger.error("[ArifpayController] Cannot record payment: referenceId is null");
            return;
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
                }
                recordArifpayPayment(reading, amountPaid, transactionId != null ? transactionId : ("ARIFPAY-" + System.currentTimeMillis()));
                logger.info("[ArifpayController] Arifpay payment successfully recorded for Reading ID: {}", readingId);
            }
        } else {
            logger.error("[ArifpayController] Reading ID {} not found", readingId);
        }
    }

    private void recordArifpayPayment(BillingReading reading, Double amountPaid, String transactionId) {
        Date now = new Date();
        reading.setMardaArifPaid(true);
        reading.setPaidThroughBank(true);
        reading.setMoneyCollected(true);
        reading.setMoneyCollectedDate(now);
        reading.setmMoneyCollectedDate(now);
        reading.setTekilalaYetekefele(amountPaid != null ? amountPaid : reading.getTekilalaTekefay());
        reading.setTekilalaBankYetekefele(amountPaid != null ? amountPaid : reading.getTekilalaTekefay());
        reading.setmBankPaidConfirmationCode(transactionId);
        reading.setmBankPaidAgentId("Arifpay");
        reading.setMoneyCollector("Arifpay");
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
    }

    /**
     * Normalize phone number to ArifPay format: 251XXXXXXXXX
     */
    private String normalizePhone(String phone) {
        if (phone == null || phone.isEmpty()) {
            return "251900000000";
        }
        phone = phone.trim().replaceAll("[\\s\\-]", "");
        if (phone.startsWith("+")) {
            phone = phone.substring(1);
        }
        if (phone.startsWith("0")) {
            phone = "251" + phone.substring(1);
        }
        if (!phone.startsWith("251")) {
            phone = "251" + phone;
        }
        return phone;
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
