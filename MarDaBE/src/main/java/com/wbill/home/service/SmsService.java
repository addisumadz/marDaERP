package com.wbill.home.service;

import com.cloudhopper.commons.charset.CharsetUtil;
import com.cloudhopper.smpp.SmppBindType;
import com.cloudhopper.smpp.SmppConstants;
import com.cloudhopper.smpp.SmppSession;
import com.cloudhopper.smpp.SmppSessionConfiguration;
import com.cloudhopper.smpp.impl.DefaultSmppClient;
import com.cloudhopper.smpp.impl.DefaultSmppSessionHandler;
import com.cloudhopper.smpp.pdu.SubmitSm;
import com.cloudhopper.smpp.pdu.SubmitSmResp;
import com.cloudhopper.smpp.type.Address;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpMethod;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.util.UriComponentsBuilder;

import java.util.ArrayList;
import java.util.List;

@Service
public class SmsService {

    private static final Logger logger = LoggerFactory.getLogger(SmsService.class);

    private static final String DEFAULT_SENDER_NAME = "WoldiaWater";

    @org.springframework.beans.factory.annotation.Autowired(required = false)
    private SmsSettingService smsSettingService;

    public static class SmppCredentials {
        public String host = "10.204.181.70";
        public int port = 5019;
        public String systemId = "8581";
        public String password = "Wtw@1921";
        public String senderName = DEFAULT_SENDER_NAME;
    }

    public SmppCredentials resolveSmppCredentials(Integer cityId) {
        SmppCredentials creds = new SmppCredentials();
        if (smsSettingService != null) {
            try {
                java.util.Optional<com.wbill.home.dto.SmsSettingDTO> opt = smsSettingService.getSettingForCity(cityId);
                if (opt.isPresent()) {
                    com.wbill.home.dto.SmsSettingDTO s = opt.get();
                    if (s.getSmppHost() != null && !s.getSmppHost().trim().isEmpty()) {
                        creds.host = s.getSmppHost().trim();
                    }
                    if (s.getSmppPort() != null && s.getSmppPort() > 0) {
                        creds.port = s.getSmppPort();
                    }
                    if (s.getSmppSystemId() != null && !s.getSmppSystemId().trim().isEmpty()) {
                        creds.systemId = s.getSmppSystemId().trim();
                    }
                    if (s.getSmppPassword() != null && !s.getSmppPassword().trim().isEmpty()) {
                        creds.password = s.getSmppPassword().trim();
                    }
                    if (s.getSenderId() != null && !s.getSenderId().trim().isEmpty()) {
                        creds.senderName = s.getSenderId().trim();
                    }
                }
            } catch (Exception e) {
                logger.warn("Could not retrieve dynamic SMPP settings from DB, using fallback: {}", e.getMessage());
            }
        }
        return creds;
    }

    @Value("${jasmin.http.base-url:http://127.0.0.1:1401}")
    private String jasminBaseUrl;

    @Value("${jasmin.http.username}")
    private String jasminUsername;

    @Value("${jasmin.http.password}")
    private String jasminPassword;

    public void sendTestSms(String phoneNumber, String message) {
        sendTestSms(phoneNumber, message, null);
    }

    public void sendTestSms(String phoneNumber, String message, Integer cityId) {
        SmppCredentials creds = resolveSmppCredentials(cityId);
        SmppSessionConfiguration config = new SmppSessionConfiguration();
        config.setWindowSize(1);
        config.setName("wbill-smpp-test");
        config.setType(SmppBindType.TRANSCEIVER);
        config.setHost(creds.host);
        config.setPort(creds.port);
        config.setSystemId(creds.systemId);
        config.setPassword(creds.password);
        config.setConnectTimeout(10000);
        config.setBindTimeout(10000);
        config.setInterfaceVersion(SmppConstants.VERSION_3_4);
        config.setRequestExpiryTimeout(90000);
        config.setWindowMonitorInterval(15000);
        config.setCountersEnabled(true);

        DefaultSmppClient client = new DefaultSmppClient();
        SmppSession session = null;
        try {
            logger.info("Connecting to SMPP {}:{} (SystemId: {}, Sender: {})",
                    config.getHost(), config.getPort(), config.getSystemId(), creds.senderName);
            session = client.bind(config, new DefaultSmppSessionHandler());
            logger.info("SMPP session established, isBound={}", session != null && session.isBound());

            SubmitSm submit = new SubmitSm();
            submit.setSourceAddress(new Address((byte) SmppConstants.TON_ALPHANUMERIC, (byte) SmppConstants.NPI_UNKNOWN,
                    creds.senderName));
            submit.setDestAddress(
                    new Address((byte) SmppConstants.TON_INTERNATIONAL, (byte) SmppConstants.NPI_E164, phoneNumber));

            // Ensure short_message does not exceed SMPP's 255-byte limit.
            // For UCS2 (2 bytes/char for Amharic), 120 chars ~= 240 bytes which is safely
            // under 255.
            String textToSend = message != null ? message : "";
            final int maxChars = 120;
            if (textToSend.length() > maxChars) {
                logger.warn(
                        "SMS text too long ({} chars), truncating to {} chars to satisfy 255-byte short_message limit",
                        textToSend.length(), maxChars);
                textToSend = textToSend.substring(0, maxChars);
            }

            submit.setShortMessage(CharsetUtil.encode(textToSend, CharsetUtil.CHARSET_UCS_2));
            submit.setDataCoding(SmppConstants.DATA_CODING_UCS2);
            submit.setRegisteredDelivery(SmppConstants.REGISTERED_DELIVERY_SMSC_RECEIPT_REQUESTED);

            logger.info("Sending submit_sm from '{}' to {} with text: {} (UCS2, possibly truncated)", creds.senderName,
                    phoneNumber, textToSend);
            SubmitSmResp submitResp = session.submit(submit, 90000);
            logger.info("submit_sm response: commandStatus={}, messageId={}", submitResp.getCommandStatus(),
                    submitResp.getMessageId());
            if (submitResp.getCommandStatus() != SmppConstants.STATUS_OK) {
                throw new IllegalStateException("SMPP submit failed with status " + submitResp.getCommandStatus());
            }
        } catch (Exception e) {
            logger.error("Error while sending SMPP test SMS", e);
            throw new RuntimeException("Failed to send SMS: " + e.getMessage(), e);
        } finally {
            if (session != null) {
                logger.info("Unbinding SMPP session");
                try {
                    session.unbind(5000);
                } catch (Exception e) {
                    logger.warn("Error while unbinding SMPP session", e);
                }
                session.destroy();
            }
            client.destroy();
        }
    }

    public void sendTestSmsViaJasmin(String phoneNumber, String message) {
        sendTestSmsViaJasmin(phoneNumber, message, null);
    }

    public void sendTestSmsViaJasmin(String phoneNumber, String message, Integer cityId) {
        try {
            SmppCredentials creds = resolveSmppCredentials(cityId);
            RestTemplate restTemplate = new RestTemplate();

            logger.info("Preparing Jasmin HTTP SMS from '{}' to {} with text: {}", creds.senderName, phoneNumber, message);

            String hexContent = toUcs2Hex(message);
            logger.info("Prepared UCS2 hex content for Jasmin: {}", hexContent);

            String url = UriComponentsBuilder.fromHttpUrl(jasminBaseUrl)
                    .path("/send")
                    .queryParam("username", jasminUsername)
                    .queryParam("password", jasminPassword)
                    .queryParam("to", phoneNumber)
                    .queryParam("from", creds.senderName)
                    .queryParam("coding", 8)
                    .queryParam("hex-content", hexContent)
                    .toUriString();

            logger.info("Sending SMS via Jasmin HTTP API to {} using URL {}", phoneNumber, url);

            ResponseEntity<String> response = restTemplate.exchange(
                    url,
                    HttpMethod.GET,
                    HttpEntity.EMPTY,
                    String.class);

            if (!response.getStatusCode().is2xxSuccessful()) {
                throw new IllegalStateException("Jasmin HTTP API returned status " + response.getStatusCode());
            }

            String body = response.getBody();
            logger.info("Jasmin HTTP API response body: {}", body);
        } catch (Exception e) {
            logger.error("Error while sending SMS via Jasmin HTTP API", e);
            throw new RuntimeException("Failed to send SMS via Jasmin: " + e.getMessage(), e);
        }
    }

    // ===== Bulk SMPP sending with a single session =====

    public static class BulkSmsRequest {
        private final Integer readingId;
        private final String phoneNumber;
        private final String message;

        public BulkSmsRequest(Integer readingId, String phoneNumber, String message) {
            this.readingId = readingId;
            this.phoneNumber = phoneNumber;
            this.message = message;
        }

        public Integer getReadingId() {
            return readingId;
        }

        public String getPhoneNumber() {
            return phoneNumber;
        }

        public String getMessage() {
            return message;
        }
    }

    public static class BulkSmsResult {
        private final Integer readingId;
        private final String phoneNumber;
        private final boolean success;
        private final String error;

        public BulkSmsResult(Integer readingId, String phoneNumber, boolean success, String error) {
            this.readingId = readingId;
            this.phoneNumber = phoneNumber;
            this.success = success;
            this.error = error;
        }

        public Integer getReadingId() {
            return readingId;
        }

        public String getPhoneNumber() {
            return phoneNumber;
        }

        public boolean isSuccess() {
            return success;
        }

        public String getError() {
            return error;
        }
    }

    /**
     * Sends multiple SMS messages using a single SMPP session.
     * This method does not touch any database state; it only reports per-message
     * success.
     */
    /**
     * Sends multiple SMS messages using a single SMPP session.
     * This method does not touch any database state; it only reports per-message
     * success.
     */
    public List<BulkSmsResult> sendBulkSms(List<BulkSmsRequest> requests) {
        return sendBulkSms(requests, null);
    }

    public List<BulkSmsResult> sendBulkSms(List<BulkSmsRequest> requests, Integer cityId) {
        List<BulkSmsResult> results = new ArrayList<>();
        if (requests == null || requests.isEmpty()) {
            return results;
        }

        SmppCredentials creds = resolveSmppCredentials(cityId);

        SmppSessionConfiguration config = new SmppSessionConfiguration();
        config.setWindowSize(1);
        config.setName("wbill-smpp-bulk");
        config.setType(SmppBindType.TRANSCEIVER);
        config.setHost(creds.host);
        config.setPort(creds.port);
        config.setSystemId(creds.systemId);
        config.setPassword(creds.password);
        config.setConnectTimeout(10000);
        config.setBindTimeout(10000);
        config.setInterfaceVersion(SmppConstants.VERSION_3_4);
        config.setRequestExpiryTimeout(90000);
        config.setWindowMonitorInterval(15000);
        config.setCountersEnabled(true);

        DefaultSmppClient client = new DefaultSmppClient();
        SmppSession session = null;
        try {
            logger.info("Connecting to SMPP {}:{} (SystemId: {}, Sender: {}) for bulk SMS ({} items)",
                    config.getHost(), config.getPort(), config.getSystemId(), creds.senderName, requests.size());
            session = client.bind(config, new DefaultSmppSessionHandler());
            logger.info("SMPP bulk session established, isBound={}", session != null && session.isBound());

            if (session == null || !session.isBound()) {
                throw new IllegalStateException("SMPP bulk session not established");
            }

            for (BulkSmsRequest req : requests) {
                if (req == null) {
                    continue;
                }
                String phoneNumber = req.getPhoneNumber();
                String message = req.getMessage();
                if (phoneNumber == null || phoneNumber.trim().isEmpty()) {
                    results.add(new BulkSmsResult(req.getReadingId(), phoneNumber, false, "Missing phoneNumber"));
                    continue;
                }
                try {
                    String textToSend = message != null ? message : "";
                    final int maxChars = 120;
                    if (textToSend.length() > maxChars) {
                        logger.warn(
                                "Bulk SMS text too long ({} chars), truncating to {} chars to satisfy 255-byte short_message limit",
                                textToSend.length(), maxChars);
                        textToSend = textToSend.substring(0, maxChars);
                    }

                    SubmitSm submit = new SubmitSm();
                    submit.setSourceAddress(new Address((byte) SmppConstants.TON_ALPHANUMERIC,
                            (byte) SmppConstants.NPI_UNKNOWN, creds.senderName));
                    submit.setDestAddress(new Address((byte) SmppConstants.TON_INTERNATIONAL,
                            (byte) SmppConstants.NPI_E164, phoneNumber));
                    submit.setShortMessage(CharsetUtil.encode(textToSend, CharsetUtil.CHARSET_UCS_2));
                    submit.setDataCoding(SmppConstants.DATA_CODING_UCS2);
                    submit.setRegisteredDelivery(SmppConstants.REGISTERED_DELIVERY_SMSC_RECEIPT_REQUESTED);

                    logger.info("Sending bulk submit_sm to {} with text: {} (UCS2, possibly truncated)",
                            phoneNumber, textToSend);
                    SubmitSmResp submitResp = session.submit(submit, 90000);
                    boolean ok = submitResp.getCommandStatus() == SmppConstants.STATUS_OK;
                    if (!ok) {
                        String err = "SMPP submit failed with status " + submitResp.getCommandStatus();
                        logger.warn("{} for phone {}", err, phoneNumber);
                        results.add(new BulkSmsResult(req.getReadingId(), phoneNumber, false, err));
                    } else {
                        results.add(new BulkSmsResult(req.getReadingId(), phoneNumber, true, null));
                    }
                } catch (Exception ex) {
                    logger.error("Error while sending bulk SMS to {}", phoneNumber, ex);
                    results.add(new BulkSmsResult(req.getReadingId(), phoneNumber, false, ex.getMessage()));
                }
            }
        } catch (Exception e) {
            logger.error("Fatal error while establishing SMPP bulk session", e);
            if (results.isEmpty()) {
                for (BulkSmsRequest req : requests) {
                    if (req != null) {
                        results.add(new BulkSmsResult(req.getReadingId(), req.getPhoneNumber(), false,
                                "Bulk session error: " + e.getMessage()));
                    }
                }
            }
        } finally {
            if (session != null) {
                logger.info("Unbinding SMPP bulk session");
                try {
                    session.unbind(5000);
                } catch (Exception e) {
                    logger.warn("Error while unbinding SMPP bulk session", e);
                }
                session.destroy();
            }
            client.destroy();
        }
        return results;
    }

    private String toUcs2Hex(String text) {
        if (text == null) {
            return "";
        }
        try {
            byte[] bytes = text.getBytes("UTF-16BE");
            StringBuilder sb = new StringBuilder(bytes.length * 2);
            for (byte b : bytes) {
                sb.append(String.format("%02X", b));
            }
            return sb.toString();
        } catch (Exception e) {
            logger.error("Failed to encode text to UCS2 hex", e);
            return "";
        }
    }

    /**
     * Sends multiple SMS messages using a single SMPP session BUT suppresses
     * per-message logging.
     * Only logs start, end, and errors.
     */
    public List<BulkSmsResult> sendBulkSmsSilent(List<BulkSmsRequest> requests) {
        return sendBulkSmsSilent(requests, null);
    }

    public List<BulkSmsResult> sendBulkSmsSilent(List<BulkSmsRequest> requests, Integer cityId) {
        List<BulkSmsResult> results = new ArrayList<>();
        if (requests == null || requests.isEmpty()) {
            return results;
        }

        SmppCredentials creds = resolveSmppCredentials(cityId);

        SmppSessionConfiguration config = new SmppSessionConfiguration();
        config.setWindowSize(1);
        config.setName("wbill-smpp-bulk-silent");
        config.setType(SmppBindType.TRANSCEIVER);
        config.setHost(creds.host);
        config.setPort(creds.port);
        config.setSystemId(creds.systemId);
        config.setPassword(creds.password);
        config.setConnectTimeout(10000);
        config.setBindTimeout(10000);
        config.setInterfaceVersion(SmppConstants.VERSION_3_4);
        config.setRequestExpiryTimeout(90000);
        config.setWindowMonitorInterval(15000);
        config.setCountersEnabled(true);

        DefaultSmppClient client = new DefaultSmppClient();
        SmppSession session = null;
        try {
            logger.info("Connecting to SMPP {}:{} (SystemId: {}, Sender: {}) for SILENT bulk SMS ({} items)",
                    config.getHost(), config.getPort(), config.getSystemId(), creds.senderName, requests.size());
            session = client.bind(config, new DefaultSmppSessionHandler());
            logger.info("SMPP silent bulk session established, isBound={}", session != null && session.isBound());

            if (session == null || !session.isBound()) {
                throw new IllegalStateException("SMPP bulk session not established");
            }

            int count = 0;
            for (BulkSmsRequest req : requests) {
                if (req == null) {
                    continue;
                }
                String phoneNumber = req.getPhoneNumber();
                String message = req.getMessage();
                if (phoneNumber == null || phoneNumber.trim().isEmpty()) {
                    results.add(new BulkSmsResult(req.getReadingId(), phoneNumber, false, "Missing phoneNumber"));
                    continue;
                }
                try {
                    String textToSend = message != null ? message : "";
                    final int maxChars = 120;
                    if (textToSend.length() > maxChars) {
                        textToSend = textToSend.substring(0, maxChars);
                    }

                    SubmitSm submit = new SubmitSm();
                    submit.setSourceAddress(new Address((byte) SmppConstants.TON_ALPHANUMERIC,
                            (byte) SmppConstants.NPI_UNKNOWN, creds.senderName));
                    submit.setDestAddress(new Address((byte) SmppConstants.TON_INTERNATIONAL,
                            (byte) SmppConstants.NPI_E164, phoneNumber));
                    submit.setShortMessage(CharsetUtil.encode(textToSend, CharsetUtil.CHARSET_UCS_2));
                    submit.setDataCoding(SmppConstants.DATA_CODING_UCS2);
                    submit.setRegisteredDelivery(SmppConstants.REGISTERED_DELIVERY_SMSC_RECEIPT_REQUESTED);

                    SubmitSmResp submitResp = session.submit(submit, 90000);
                    boolean ok = submitResp.getCommandStatus() == SmppConstants.STATUS_OK;
                    if (!ok) {
                        String err = "SMPP submit failed with status " + submitResp.getCommandStatus();
                        logger.warn("Silent SMS fail: {} for phone {}", err, phoneNumber);
                        results.add(new BulkSmsResult(req.getReadingId(), phoneNumber, false, err));
                    } else {
                        results.add(new BulkSmsResult(req.getReadingId(), phoneNumber, true, null));
                    }
                    count++;
                } catch (Exception ex) {
                    logger.error("Error while sending silent bulk SMS to {}", phoneNumber, ex);
                    results.add(new BulkSmsResult(req.getReadingId(), phoneNumber, false, ex.getMessage()));
                }
            }
            logger.info("Finished SILENT bulk SMS loop. Processed {} items.", count);

        } catch (Exception e) {
            logger.error("Fatal error while establishing SMPP silent bulk session", e);
            if (results.isEmpty()) {
                for (BulkSmsRequest req : requests) {
                    if (req != null) {
                        results.add(new BulkSmsResult(req.getReadingId(), req.getPhoneNumber(), false,
                                "Bulk session error: " + e.getMessage()));
                    }
                }
            }
        } finally {
            if (session != null) {
                logger.info("Unbinding SMPP silent bulk session");
                try {
                    session.unbind(5000);
                } catch (Exception e) {
                    logger.warn("Error while unbinding SMPP silent bulk session", e);
                }
                session.destroy();
            }
            client.destroy();
        }
        return results;
    }

    // ===== Direct HTTP SMS Gateway Sending (e.g. smsethiopia.et) =====

    private final RestTemplate httpGatewayRestTemplate = new RestTemplate();

    public String normalizeEthiopianPhoneNumber(String phone) {
        if (phone == null) return "";
        String cleaned = phone.replaceAll("[^\\d+]", "");
        if (cleaned.startsWith("+251")) {
            cleaned = cleaned.substring(1);
        }
        if (cleaned.startsWith("0") && cleaned.length() == 10) {
            cleaned = "251" + cleaned.substring(1);
        }
        if (cleaned.length() == 9 && (cleaned.startsWith("9") || cleaned.startsWith("7"))) {
            cleaned = "251" + cleaned;
        }
        return cleaned;
    }

    public BulkSmsResult sendSmsViaHttpGateway(String gatewayUrl, String apiKey, Integer readingId, String phoneNumber, String message) {
        if (gatewayUrl == null || gatewayUrl.trim().isEmpty()) {
            gatewayUrl = "https://smsethiopia.et/api/sms/send";
        }
        if (apiKey == null || apiKey.trim().isEmpty()) {
            return new BulkSmsResult(readingId, phoneNumber, false, "SMS API key is required");
        }
        if (phoneNumber == null || phoneNumber.trim().isEmpty()) {
            return new BulkSmsResult(readingId, phoneNumber, false, "Missing phone number");
        }
        if (message == null || message.trim().isEmpty()) {
            return new BulkSmsResult(readingId, phoneNumber, false, "Message content is empty");
        }

        String normalizedPhone = normalizeEthiopianPhoneNumber(phoneNumber);
        if (normalizedPhone.isEmpty()) {
            return new BulkSmsResult(readingId, phoneNumber, false, "Invalid Ethiopian phone number: " + phoneNumber);
        }

        try {
            org.springframework.http.HttpHeaders headers = new org.springframework.http.HttpHeaders();
            headers.setContentType(org.springframework.http.MediaType.APPLICATION_JSON);
            headers.set("KEY", apiKey.trim());

            java.util.Map<String, String> body = new java.util.HashMap<>();
            body.put("msisdn", normalizedPhone);
            body.put("text", message);

            HttpEntity<java.util.Map<String, String>> request = new HttpEntity<>(body, headers);
            logger.info("Sending HTTP Gateway SMS to: {} (raw: {}) via {}", normalizedPhone, phoneNumber, gatewayUrl);

            ResponseEntity<String> response = httpGatewayRestTemplate.postForEntity(gatewayUrl.trim(), request, String.class);

            if (response.getStatusCode().is2xxSuccessful()) {
                return new BulkSmsResult(readingId, normalizedPhone, true, null);
            } else {
                String err = "Gateway returned status: " + response.getStatusCode().value() + " - " + response.getBody();
                return new BulkSmsResult(readingId, normalizedPhone, false, err);
            }
        } catch (Exception e) {
            logger.error("Error sending HTTP Gateway SMS to {}", normalizedPhone, e);
            return new BulkSmsResult(readingId, normalizedPhone, false, e.getMessage() != null ? e.getMessage() : e.toString());
        }
    }

    public List<BulkSmsResult> sendBulkSmsViaHttpGateway(List<BulkSmsRequest> requests, String gatewayUrl, String apiKey) {
        List<BulkSmsResult> results = new ArrayList<>();
        if (requests == null || requests.isEmpty()) {
            return results;
        }
        for (BulkSmsRequest req : requests) {
            if (req == null) continue;
            BulkSmsResult res = sendSmsViaHttpGateway(gatewayUrl, apiKey, req.getReadingId(), req.getPhoneNumber(), req.getMessage());
            results.add(res);
        }
        return results;
    }
}
