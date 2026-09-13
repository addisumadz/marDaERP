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

    private static final String SENDER_NAME = "WoldiaWater";
    // private static final String SENDER_NAME = "WerabeWater";

    @Value("${jasmin.http.base-url:http://127.0.0.1:1401}")
    private String jasminBaseUrl;

    @Value("${jasmin.http.username}")
    private String jasminUsername;

    @Value("${jasmin.http.password}")
    private String jasminPassword;

    public void sendTestSms(String phoneNumber, String message) {
        SmppSessionConfiguration config = new SmppSessionConfiguration();
        config.setWindowSize(1);
        config.setName("wbill-smpp-test");
        config.setType(SmppBindType.TRANSCEIVER);
        config.setHost("10.204.181.70");
        config.setPort(5019);
        config.setSystemId("8581");
        config.setPassword("Wtw@1921");
        config.setConnectTimeout(10000);
        config.setBindTimeout(10000);
        config.setInterfaceVersion(SmppConstants.VERSION_3_4);
        config.setRequestExpiryTimeout(90000);
        config.setWindowMonitorInterval(15000);
        config.setCountersEnabled(true);

        DefaultSmppClient client = new DefaultSmppClient();
        SmppSession session = null;
        try {
            logger.info("Connecting to SMPP {}:{}", config.getHost(), config.getPort());
            session = client.bind(config, new DefaultSmppSessionHandler());
            logger.info("SMPP session established, isBound={}", session != null && session.isBound());

            SubmitSm submit = new SubmitSm();
            submit.setSourceAddress(new Address((byte) SmppConstants.TON_ALPHANUMERIC, (byte) SmppConstants.NPI_UNKNOWN,
                    SENDER_NAME));
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

            logger.info("Sending submit_sm from '{}' to {} with text: {} (UCS2, possibly truncated)", SENDER_NAME,
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
        try {
            RestTemplate restTemplate = new RestTemplate();

            logger.info("Preparing Jasmin HTTP SMS from '{}' to {} with text: {}", SENDER_NAME, phoneNumber, message);

            String hexContent = toUcs2Hex(message);
            logger.info("Prepared UCS2 hex content for Jasmin: {}", hexContent);

            String url = UriComponentsBuilder.fromHttpUrl(jasminBaseUrl)
                    .path("/send")
                    .queryParam("username", jasminUsername)
                    .queryParam("password", jasminPassword)
                    .queryParam("to", phoneNumber)
                    .queryParam("from", SENDER_NAME)
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
    public List<BulkSmsResult> sendBulkSms(List<BulkSmsRequest> requests) {
        List<BulkSmsResult> results = new ArrayList<>();
        if (requests == null || requests.isEmpty()) {
            return results;
        }

        SmppSessionConfiguration config = new SmppSessionConfiguration();
        config.setWindowSize(1);
        config.setName("wbill-smpp-bulk");
        config.setType(SmppBindType.TRANSCEIVER);
        config.setHost("10.204.181.70");
        config.setPort(5019);
        config.setSystemId("8581");
        config.setPassword("Wtw@1921");
        config.setConnectTimeout(10000);
        config.setBindTimeout(10000);
        config.setInterfaceVersion(SmppConstants.VERSION_3_4);
        config.setRequestExpiryTimeout(90000);
        config.setWindowMonitorInterval(15000);
        config.setCountersEnabled(true);

        DefaultSmppClient client = new DefaultSmppClient();
        SmppSession session = null;
        try {
            logger.info("Connecting to SMPP {}:{} for bulk SMS ({} items)",
                    config.getHost(), config.getPort(), requests.size());
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
                            (byte) SmppConstants.NPI_UNKNOWN, SENDER_NAME));
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
        List<BulkSmsResult> results = new ArrayList<>();
        if (requests == null || requests.isEmpty()) {
            return results;
        }

        SmppSessionConfiguration config = new SmppSessionConfiguration();
        config.setWindowSize(1);
        config.setName("wbill-smpp-bulk-silent");
        config.setType(SmppBindType.TRANSCEIVER);
        config.setHost("10.204.181.70");
        config.setPort(5019);
        config.setSystemId("8581");
        config.setPassword("Wtw@1921");
        config.setConnectTimeout(10000);
        config.setBindTimeout(10000);
        config.setInterfaceVersion(SmppConstants.VERSION_3_4);
        config.setRequestExpiryTimeout(90000);
        config.setWindowMonitorInterval(15000);
        config.setCountersEnabled(true);

        DefaultSmppClient client = new DefaultSmppClient();
        SmppSession session = null;
        try {
            logger.info("Connecting to SMPP {}:{} for SILENT bulk SMS ({} items)",
                    config.getHost(), config.getPort(), requests.size());
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
                        // Suppressed warning log for silent mode, or keep it if critical?
                        // Requirement says "dont log each sms text", truncation is metadata but
                        // includes text usually.
                        // We will just truncate silently or log only that truncation happened without
                        // text.
                        textToSend = textToSend.substring(0, maxChars);
                    }

                    SubmitSm submit = new SubmitSm();
                    submit.setSourceAddress(new Address((byte) SmppConstants.TON_ALPHANUMERIC,
                            (byte) SmppConstants.NPI_UNKNOWN, SENDER_NAME));
                    submit.setDestAddress(new Address((byte) SmppConstants.TON_INTERNATIONAL,
                            (byte) SmppConstants.NPI_E164, phoneNumber));
                    submit.setShortMessage(CharsetUtil.encode(textToSend, CharsetUtil.CHARSET_UCS_2));
                    submit.setDataCoding(SmppConstants.DATA_CODING_UCS2);
                    submit.setRegisteredDelivery(SmppConstants.REGISTERED_DELIVERY_SMSC_RECEIPT_REQUESTED);

                    // Suppressed: logger.info("Sending bulk submit_sm...");

                    SubmitSmResp submitResp = session.submit(submit, 90000);
                    boolean ok = submitResp.getCommandStatus() == SmppConstants.STATUS_OK;
                    if (!ok) {
                        String err = "SMPP submit failed with status " + submitResp.getCommandStatus();
                        // We can still log errors as they are not "each sms text"
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
}
