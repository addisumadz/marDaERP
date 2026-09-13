package com.wbill.home.service;

import com.wbill.home.dto.UnicashBillSubmissionDTO;
import com.wbill.home.dto.UnicashBillSyncFilePathDTO;
import com.wbill.home.model.CompanyProfile;
import com.wbill.home.repository.CompanyProfileRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClientException;
import org.springframework.web.client.RestClientResponseException;
import org.springframework.web.client.RestTemplate;
import org.springframework.http.client.SimpleClientHttpRequestFactory;
import org.springframework.web.util.UriComponentsBuilder;
import org.springframework.core.io.FileSystemResource;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import java.io.File;

@Component
public class UnicashClient {

    private static final Logger logger = LoggerFactory.getLogger(UnicashClient.class);

    private final CompanyProfileRepository companyProfileRepository;
    private final RestTemplate restTemplate = new RestTemplate();

    public UnicashClient(CompanyProfileRepository companyProfileRepository) {
        this.companyProfileRepository = companyProfileRepository;
        SimpleClientHttpRequestFactory f = new SimpleClientHttpRequestFactory();
        f.setConnectTimeout(10_000);
        f.setReadTimeout(60_000);
        this.restTemplate.setRequestFactory(f);
    }

    private CompanyProfile resolveCompanyProfile() {
        CompanyProfile companyProfile = companyProfileRepository.findById(9).orElse(null);
        if (companyProfile == null) {
            companyProfile = companyProfileRepository.findFirstByOrderByIdDesc();
            if (companyProfile == null) {
                throw new RuntimeException("No company profiles found in database");
            }
        }
        return companyProfile;
    }

    public UnicashBillSyncFilePathDTO requestBillSyncFile(String startDate, String endDate) {
        try {
            CompanyProfile companyProfile = resolveCompanyProfile();

            String baseUrl = companyProfile.getuCompanyUri();
            String apiKey = companyProfile.getuCompanyKey();

            if (baseUrl == null || baseUrl.trim().isEmpty()) {
                throw new RuntimeException("Unicash base URL (u_company_uri) is not configured in company profile");
            }
            if (apiKey == null || apiKey.trim().isEmpty()) {
                throw new RuntimeException("Unicash API key (u_company_key) is not configured in company profile");
            }

            String url = UriComponentsBuilder.fromHttpUrl(baseUrl.trim())
                    .path("BillIntegrationResource/billSyncFile")
                    .queryParam("API_KEY", apiKey.trim())
                    .toUriString();

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);

            java.util.Map<String, String> payload = new java.util.HashMap<>();
            payload.put("startDate", startDate);
            payload.put("endDate", endDate);

            ResponseEntity<UnicashBillSyncFilePathDTO> response = exchangeWithRetry(
                    url,
                    HttpMethod.POST,
                    new HttpEntity<>(payload, headers),
                    UnicashBillSyncFilePathDTO.class);

            if (!response.getStatusCode().is2xxSuccessful()) {
                throw new RuntimeException("Unicash billSyncFile returned status: " + response.getStatusCode());
            }

            UnicashBillSyncFilePathDTO body = response.getBody();
            if (body == null || body.getPath() == null || body.getPath().trim().isEmpty()) {
                throw new RuntimeException("Unicash billSyncFile returned empty path");
            }

            return body;
        } catch (Exception e) {
            throw new RuntimeException("Failed to call Unicash billSyncFile: " + e.getMessage(), e);
        }
    }

    public byte[] downloadCsvBytes(String csvRelativePath) {
        try {
            CompanyProfile companyProfile = resolveCompanyProfile();
            String baseFileUrl = companyProfile.getuCompanyFileUrl();

            if (baseFileUrl == null || baseFileUrl.trim().isEmpty()) {
                throw new RuntimeException(
                        "Unicash file base URL (u_company_file_url) is not configured in company profile");
            }

            String base = baseFileUrl.trim();
            String path = csvRelativePath.startsWith("/") ? csvRelativePath.substring(1) : csvRelativePath;
            String url = base.endsWith("/") ? base + path : base + "/" + path;

            HttpHeaders headers = new HttpHeaders();
            headers.set(HttpHeaders.ACCEPT, MediaType.APPLICATION_OCTET_STREAM_VALUE);

            ResponseEntity<byte[]> response = exchangeWithRetry(
                    url,
                    HttpMethod.GET,
                    new HttpEntity<>(headers),
                    byte[].class);

            if (!response.getStatusCode().is2xxSuccessful() || response.getBody() == null) {
                throw new RuntimeException("Unicash CSV download failed with status: " + response.getStatusCode());
            }

            return response.getBody();
        } catch (Exception e) {
            throw new RuntimeException("Failed to download Unicash CSV: " + e.getMessage(), e);
        }
    }

    /**
     * Calls Unicash updateOrRegisterBill API for a single bill using the JSON
     * format
     * described in the legacy billingApi.postman_collection.json.
     */
    public java.util.Map<String, Object> updateOrRegisterBill(UnicashBillSubmissionDTO dto) {
        try {
            CompanyProfile companyProfile = resolveCompanyProfile();

            String baseUrl = companyProfile.getuCompanyUri();
            String apiKey = companyProfile.getuCompanyKey();

            if (baseUrl == null || baseUrl.trim().isEmpty()) {
                throw new RuntimeException("Unicash base URL (u_company_uri) is not configured in company profile");
            }
            if (apiKey == null || apiKey.trim().isEmpty()) {
                throw new RuntimeException("Unicash API key (u_company_key) is not configured in company profile");
            }

            String url = UriComponentsBuilder.fromHttpUrl(baseUrl.trim())
                    .path("BillIntegrationResource/updateOrRegisterBill")
                    .queryParam("API_KEY", apiKey.trim())
                    .toUriString();

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);

            java.util.Map<String, Object> root = new java.util.LinkedHashMap<>();
            root.put("validUntil", dto.getValidUntil());

            java.util.Map<String, Object> customer = new java.util.LinkedHashMap<>();
            customer.put("fullName", dto.getFullName());
            customer.put("phoneNumber", dto.getPhoneNumber() != null ? dto.getPhoneNumber() : "");
            customer.put("customerId", dto.getCustomerId());
            root.put("customer", customer);

            java.util.Map<String, Object> item = new java.util.LinkedHashMap<>();
            item.put("name", dto.getDescription());
            item.put("price", dto.getAmountDue());

            java.util.Map<String, Object> receipt = new java.util.LinkedHashMap<>();
            java.util.List<java.util.Map<String, Object>> items = new java.util.ArrayList<>();
            items.add(item);
            receipt.put("items", items);
            root.put("receiptData", receipt);

            root.put("billId", dto.getBillId());

            if (logger.isInfoEnabled()) {
                logger.info("[UnicashClient] updateOrRegisterBill URL={} payload={}", url, root);
            }

            ResponseEntity<java.util.Map> response = exchangeWithRetry(
                    url,
                    HttpMethod.POST,
                    new HttpEntity<>(root, headers),
                    java.util.Map.class);

            if (logger.isInfoEnabled()) {
                logger.info("[UnicashClient] updateOrRegisterBill responseStatus={} body={}",
                        response.getStatusCode(), response.getBody());
            }

            if (!response.getStatusCode().is2xxSuccessful()) {
                throw new RuntimeException("Unicash updateOrRegisterBill returned status: " + response.getStatusCode());
            }

            java.util.Map body = response.getBody();
            if (body != null) {
                // noinspection unchecked
                return (java.util.Map<String, Object>) body;
            }
            return java.util.Collections.emptyMap();
        } catch (Exception e) {
            throw new RuntimeException("Failed to call Unicash updateOrRegisterBill: " + e.getMessage(), e);
        }
    }

    /**
     * Calls Unicash cancelBill API for a single bill id.
     */
    public java.util.Map<String, Object> cancelBill(String billId) {
        try {
            CompanyProfile companyProfile = resolveCompanyProfile();

            String baseUrl = companyProfile.getuCompanyUri();
            String apiKey = companyProfile.getuCompanyKey();

            if (baseUrl == null || baseUrl.trim().isEmpty()) {
                throw new RuntimeException("Unicash base URL (u_company_uri) is not configured in company profile");
            }
            if (apiKey == null || apiKey.trim().isEmpty()) {
                throw new RuntimeException("Unicash API key (u_company_key) is not configured in company profile");
            }

            String url = UriComponentsBuilder.fromHttpUrl(baseUrl.trim())
                    .path("BillIntegrationResource/cancelBill")
                    .queryParam("API_KEY", apiKey.trim())
                    .queryParam("bill_id", billId)
                    .toUriString();

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);

            ResponseEntity<java.util.Map> response = exchangeWithRetry(
                    url,
                    HttpMethod.POST,
                    new HttpEntity<>(headers),
                    java.util.Map.class);

            if (response.getStatusCode().is2xxSuccessful()) {
                java.util.Map body = response.getBody();
                if (body != null) {
                    // noinspection unchecked
                    return (java.util.Map<String, Object>) body;
                }
                return java.util.Collections.emptyMap();
            }
            throw new RuntimeException("Unicash cancelBill returned status: " + response.getStatusCode());
        } catch (Exception e) {
            throw new RuntimeException("Failed to call Unicash cancelBill: " + e.getMessage(), e);
        }
    }

    public String uploadBulkBillUpdateFile(File file) {
        try {
            if (file == null || !file.exists()) {
                throw new IllegalArgumentException("File does not exist");
            }

            CompanyProfile companyProfile = resolveCompanyProfile();
            String baseUrl = companyProfile.getuCompanyUri();
            String apiKey = companyProfile.getuCompanyKey();

            if (baseUrl == null || baseUrl.trim().isEmpty()) {
                throw new RuntimeException("Unicash base URL (u_company_uri) is not configured");
            }
            if (apiKey == null || apiKey.trim().isEmpty()) {
                throw new RuntimeException("Unicash API key (u_company_key) is not configured");
            }

            String url = UriComponentsBuilder.fromHttpUrl(baseUrl.trim())
                    .path("BillIntegrationResource/bulkBillUpdate")
                    .queryParam("API_KEY", apiKey.trim())
                    .toUriString();

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.MULTIPART_FORM_DATA);
            headers.add("API_KEY", apiKey.trim());

            MultiValueMap<String, Object> body = new LinkedMultiValueMap<>();
            body.add("uploadedFile", new FileSystemResource(file));

            ResponseEntity<String> response = restTemplate.exchange(
                    url,
                    HttpMethod.POST,
                    new HttpEntity<>(body, headers),
                    String.class);

            if (!response.getStatusCode().is2xxSuccessful()) {
                throw new RuntimeException("Unicash bulk update failed: " + response.getStatusCode());
            }

            return response.getBody();

        } catch (Exception e) {
            throw new RuntimeException("Failed to upload bulk update file: " + e.getMessage(), e);
        }
    }

    private <T> ResponseEntity<T> exchangeWithRetry(String url, HttpMethod method, HttpEntity<?> entity,
            Class<T> responseType) {
        int attempts = 0;
        RestClientResponseException lastResponseEx = null;
        while (attempts < 3) {
            try {
                return restTemplate.exchange(url, method, entity, responseType);
            } catch (RestClientResponseException ex) {
                int code = ex.getRawStatusCode();
                if (code == 502 || code == 503 || code == 504) {
                    attempts++;
                    lastResponseEx = ex;
                    try {
                        Thread.sleep(300L * attempts);
                    } catch (InterruptedException ignored) {
                    }
                    continue;
                }
                throw ex;
            } catch (RestClientException ex) {
                attempts++;
                try {
                    Thread.sleep(300L * attempts);
                } catch (InterruptedException ignored) {
                }
                if (attempts >= 3)
                    throw ex;
            }
        }
        if (lastResponseEx != null)
            throw lastResponseEx;
        throw new RestClientException("Unicash call failed after retries");
    }
}
