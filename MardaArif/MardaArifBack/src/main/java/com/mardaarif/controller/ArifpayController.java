package com.mardaarif.controller;

import com.mardaarif.model.ArifPayConfig;
import com.mardaarif.model.Bill;
import com.mardaarif.model.BillStatus;
import com.mardaarif.model.Payment;
import com.mardaarif.service.ArifPayConfigService;
import com.mardaarif.service.BillService;
import com.mardaarif.service.PaymentService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.client.RestTemplate;

import java.time.LocalDateTime;
import java.util.*;

@RestController
@RequestMapping("/api/payments/arifpay")
public class ArifpayController {

    private static final Logger logger = LoggerFactory.getLogger(ArifpayController.class);

    @Autowired
    private BillService billService;

    @Autowired
    private PaymentService paymentService;

    @Autowired
    private ArifPayConfigService configService;

    private final RestTemplate restTemplate = new RestTemplate();

    /**
     * Initiate an ArifPay payment checkout session for a bill.
     */
    @PostMapping("/initiate/{billId}")
    public ResponseEntity<?> initiatePayment(@PathVariable Long billId,
            @RequestBody(required = false) Map<String, String> body) {
        ArifPayConfig config = configService.getConfig();

        Optional<Bill> billOpt = billService.getBillById(billId);
        if (billOpt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("message", "Bill not found with ID: " + billId));
        }

        Bill bill = billOpt.get();
        if (bill.getStatus() != BillStatus.PENDING) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("message", "Bill is already paid or cancelled"));
        }

        // Unique transaction reference/nonce
        String nonce = bill.getId().toString() + "_" + System.currentTimeMillis();

        // Fallback mock session for local test mode (when API key is default)
        if ("test_api_key_123456789".equals(config.getApiKey())) {
            logger.info("[ArifpayController] Using mock session response for development testing");
            Map<String, Object> mockRes = new LinkedHashMap<>();
            String mockSessionId = "mock_session_" + bill.getId() + "_" + System.currentTimeMillis();
            mockRes.put("sessionId", mockSessionId);
            // In mock mode, redirecting to successUrl with sessionId and referenceId
            String mockCheckoutUrl = config.getSuccessUrl() + "&sessionId=" + mockSessionId + "&referenceId=" + nonce;
            mockRes.put("checkoutUrl", mockCheckoutUrl);
            return ResponseEntity.ok(mockRes);
        }

        // Build checkout session request payload
        Map<String, Object> payload = new LinkedHashMap<>();
        payload.put("cancelUrl", config.getCancelUrl());
        payload.put("successUrl", config.getSuccessUrl());
        payload.put("errorUrl", config.getErrorUrl());
        payload.put("notifyUrl", getDirectWebhookUrl()); // Webhook callback URL

        // Use phone from request body if provided, otherwise fall back to bill's phone
        String rawPhone = (body != null && body.get("phone") != null) ? body.get("phone") : bill.getPhoneNumber();
        String phone = normalizePhone(rawPhone);
        payload.put("phone", phone);
        payload.put("email",
                bill.getEmail() != null && !bill.getEmail().isEmpty() ? bill.getEmail() : "customer@example.com");
        payload.put("nonce", nonce);
        payload.put("paymentMethods", Arrays.asList("TELEBIRR_USSD", "CBE", "AWASH_BIRR"));

        // Expiration in 24 hours (ArifPay format: no timezone suffix)
        String expireDateStr = LocalDateTime.now().plusDays(1).toString();
        payload.put("expireDate", expireDateStr);

        Map<String, Object> item = new LinkedHashMap<>();
        String itemName = bill.getDescription() != null && !bill.getDescription().isEmpty() ? bill.getDescription()
                : "Water Bill Payment";
        item.put("name", itemName);
        item.put("price", bill.getAmountDue());
        item.put("quantity", 1);
        item.put("description", itemName);
        payload.put("items", Collections.singletonList(item));

        Map<String, Object> beneficiary = new LinkedHashMap<>();
        beneficiary.put("accountNumber", config.getBeneficiaryAccount());
        beneficiary.put("bank", config.getBeneficiaryBank());
        beneficiary.put("amount", bill.getAmountDue());
        payload.put("beneficiaries", Collections.singletonList(beneficiary));

        payload.put("lang", "EN");

        try {
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            headers.set("x-arifpay-key", config.getApiKey());

            HttpEntity<Map<String, Object>> entity = new HttpEntity<>(payload, headers);
            logger.info("[ArifpayController] Creating ArifPay Session. Bill ID={}, Amount={}, Url={}",
                    billId, bill.getAmountDue(), config.getApiUrl());

            ResponseEntity<Map> response = restTemplate.postForEntity(config.getApiUrl(), entity, Map.class);
            if (response.getStatusCode().is2xxSuccessful() && response.getBody() != null) {
                Map<String, Object> responseBody = response.getBody();
                logger.info("[ArifpayController] Raw ArifPay response: {}", responseBody);

                // ArifPay may nest data inside a "data" field or return flat
                Map<String, Object> data = responseBody;
                if (responseBody.containsKey("data") && responseBody.get("data") instanceof Map) {
                    data = (Map<String, Object>) responseBody.get("data");
                    logger.info("[ArifpayController] Unwrapped nested data: {}", data);
                }

                // Extract sessionId — try multiple possible field names
                String sid = getStringField(data, "sessionId", "session_id", "id");

                // Extract payment/checkout URL — try multiple possible field names
                String checkoutUrl = getStringField(data, "paymentUrl", "payment_url", "checkoutUrl", "checkout_url", "url");
                if (checkoutUrl != null) {
                    checkoutUrl = checkoutUrl.replaceAll("(?<!https?:)/{2,}", "/");
                }

                logger.info("[ArifpayController] Extracted sessionId={}, checkoutUrl={}", sid, checkoutUrl);

                // Build normalized response for frontend
                Map<String, Object> result = new LinkedHashMap<>(responseBody);
                if (sid != null) {
                    result.put("sessionId", sid);
                }
                if (checkoutUrl != null) {
                    result.put("checkoutUrl", checkoutUrl);
                }
                return ResponseEntity.ok(result);
            } else {
                logger.error("[ArifpayController] Checkout failed: status={}, body={}",
                        response.getStatusCode(), response.getBody());
                return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                        .body(Map.of("message", "Arifpay returned code: " + response.getStatusCodeValue()));
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

            // ArifPay sends "transactionStatus" not "status"
            String status = getStringField(data, "transactionStatus", "status");

            // transactionId may be nested inside "transaction" object
            String transactionId = getStringField(data, "transactionId");
            if (transactionId == null && data.get("transaction") instanceof Map) {
                Map<String, Object> txn = (Map<String, Object>) data.get("transaction");
                transactionId = getStringField(txn, "transactionId");
            }

            // ArifPay sends "nonce" not "referenceId"
            String referenceId = getStringField(data, "nonce", "referenceId");

            logger.info("[ArifpayController] Parsed webhook: status={}, transactionId={}, referenceId={}",
                    status, transactionId, referenceId);

            if ("SUCCESS".equalsIgnoreCase(status) || "PAID".equalsIgnoreCase(status)
                    || "COMPLETED".equalsIgnoreCase(status)) {
                processSuccessfulPayment(referenceId, transactionId, data);
                return ResponseEntity.ok(Map.of("status", "SUCCESS"));
            } else {
                logger.info("[ArifpayController] Webhook transaction status received: {} (ignored)", status);
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
                Long billId = Long.parseLong(parts[2]);
                Optional<Bill> billOpt = billService.getBillById(billId);
                if (billOpt.isPresent()) {
                    Bill bill = billOpt.get();
                    if (bill.getStatus() == BillStatus.PENDING) {
                        paymentService.recordPayment(
                                bill.getId(),
                                bill.getAmountDue(),
                                LocalDateTime.now().toString().split("T")[0],
                                "Arifpay Mock",
                                "MOCK-TXN-" + System.currentTimeMillis(),
                                "MOBILE");
                        logger.info("[ArifpayController] Mock payment successfully recorded for bill ID: {}", billId);
                    }
                    return ResponseEntity.ok(Map.of("status", "SUCCESS", "bill", billOpt.get()));
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

                // ArifPay uses "transactionStatus" not "status" or "paymentStatus"
                String paymentStatus = getStringField(sessionData, "transactionStatus", "paymentStatus", "status");

                // referenceId is "nonce" in ArifPay
                String referenceId = getStringField(sessionData, "nonce", "referenceId");

                // transactionId may be nested inside "transaction" object
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
                        .body(Map.of("message", "Arifpay query response: " + response.getStatusCodeValue()));
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
        Long billId = Long.parseLong(parts[0]);

        Optional<Bill> billOpt = billService.getBillById(billId);
        if (billOpt.isPresent()) {
            Bill bill = billOpt.get();
            if (bill.getStatus() == BillStatus.PENDING) {
                logger.info("[ArifpayController] Webhook success for Bill ID={}, referenceId={}", billId, referenceId);

                Double amountPaid = bill.getAmountDue();
                if (data.containsKey("amount")) {
                    try {
                        amountPaid = ((Number) data.get("amount")).doubleValue();
                    } catch (Exception e) {
                        // ignore and use default
                    }
                }

                String paidOn = LocalDateTime.now().toString().split("T")[0];
                paymentService.recordPayment(
                        bill.getId(),
                        amountPaid,
                        paidOn,
                        "Arifpay",
                        transactionId != null ? transactionId : ("ARIFPAY-" + System.currentTimeMillis()),
                        "MOBILE");
            }
        } else {
            logger.error("[ArifpayController] Bill ID {} not found", billId);
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
        // TODO: In production, replace with your publicly-accessible server URL
        return "http://196.189.51.78:8083/api/payments/arifpay/callback";
    }

    /**
     * Try multiple possible field names and return the first non-null String value found.
     */
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
