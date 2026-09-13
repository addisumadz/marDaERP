package com.wbill.home.service;

import com.wbill.home.model.CompanyProfile;
import com.wbill.home.repository.CompanyProfileRepository;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.client.RestClientException;
import org.springframework.web.client.RestClientResponseException;
import org.springframework.http.client.SimpleClientHttpRequestFactory;
import org.springframework.web.util.UriComponentsBuilder;

@Component
public class DerashClient {

    private final CompanyProfileRepository companyProfileRepository;
    private final RestTemplate restTemplate = new RestTemplate();

    public DerashClient(CompanyProfileRepository companyProfileRepository) {
        this.companyProfileRepository = companyProfileRepository;
        // Configure timeouts to avoid hanging on Derash outages
        SimpleClientHttpRequestFactory f = new SimpleClientHttpRequestFactory();
        f.setConnectTimeout(10_000);
        f.setReadTimeout(30_000);
        this.restTemplate.setRequestFactory(f);
    }

    public String fetchCustomerPaidBills(String fromDate, String toDate) {
        try {
            System.out.println("=== DERASH FETCH START ===");
            System.out.println("Requested date range: " + fromDate + " to " + toDate);
            
            // First, let's see what company profiles exist
            java.util.List<CompanyProfile> allProfiles = companyProfileRepository.findAll();
            System.out.println("Available company profiles: " + allProfiles.size());
            for (CompanyProfile cp : allProfiles) {
                System.out.println("  - ID: " + cp.getId() + ", Name: " + (cp.getCompanyName() != null ? cp.getCompanyName() : "N/A"));
            }
            
            // Try to fetch specific company profile with ID 9
            CompanyProfile companyProfile = companyProfileRepository.findById(9).orElse(null);
            if (companyProfile == null) {
                // If ID 9 doesn't exist, try to use the latest one (fallback)
                companyProfile = companyProfileRepository.findFirstByOrderByIdDesc();
                if (companyProfile != null) {
                    System.out.println("Company profile ID 9 not found, using latest profile ID: " + companyProfile.getId());
                } else {
                    throw new RuntimeException("No company profiles found in database");
                }
            } else {
                System.out.println("Found company profile with ID 9");
            }

            String baseUrl = companyProfile.getdCompanyUri();
            String apiKey = companyProfile.getdCompanyKey();
            String apiSecret = companyProfile.getdCompanySecret();

            if (baseUrl == null || baseUrl.trim().isEmpty()) {
                throw new RuntimeException("Derash base URL (d_company_uri) is not configured in company profile ID 9");
            }
            if (apiKey == null || apiKey.trim().isEmpty()) {
                throw new RuntimeException("Derash API key (d_company_key) is not configured in company profile ID 9");
            }
            if (apiSecret == null || apiSecret.trim().isEmpty()) {
                throw new RuntimeException("Derash API secret (d_company_secret) is not configured in company profile ID 9");
            }

            String url = UriComponentsBuilder.fromHttpUrl(baseUrl.trim())
                    .path("/customers-paid-bill")
                    .queryParam("fromDate", fromDate)
                    .queryParam("toDate", toDate)
                    .toUriString();

            System.out.println("Derash API URL: " + url);
            System.out.println("Making Derash API call...");

            HttpHeaders headers = new HttpHeaders();
            headers.set("api-key", apiKey.trim());
            headers.set("api-secret", apiSecret.trim());
            headers.set(HttpHeaders.ACCEPT, MediaType.TEXT_PLAIN_VALUE);

            try {
                // First try to get CSV response directly (with basic retries)
                ResponseEntity<String> response = exchangeWithRetry(
                    url,
                    HttpMethod.GET,
                    new HttpEntity<>(headers),
                    String.class
                );

                System.out.println("Derash API response status: " + response.getStatusCode());
                System.out.println("Response content type: " + response.getHeaders().getContentType());

                String responseBody = response.getBody();
                if (responseBody == null || responseBody.trim().isEmpty()) {
                    throw new RuntimeException("Derash API returned empty response");
                }

                System.out.println("Response length: " + responseBody.length());

                // Check if response looks like CSV (starts with CSV headers or data)
                if (responseBody.contains("biller_id") && responseBody.contains("bill_id")) {
                    System.out.println("Response appears to be CSV data");
                    return responseBody;
                } else {
                    System.out.println("Response doesn't appear to be CSV, might be HTML error");
                    System.err.println("Unexpected response format. First 200 chars: " +
                        responseBody.substring(0, Math.min(200, responseBody.length())));
                    throw new RuntimeException("Derash API returned unexpected response format. Expected CSV data.");
                }

            } catch (org.springframework.web.client.RestClientException e) {
                System.err.println("Derash API call failed: " + e.getMessage());

                // Try to get raw response to see what's actually being returned
                try {
                    ResponseEntity<String> rawResponse = restTemplate.exchange(
                        url,
                        HttpMethod.GET,
                        new HttpEntity<>(headers),
                        String.class
                    );

                    System.err.println("Raw response status: " + rawResponse.getStatusCode());
                    System.err.println("Raw response content type: " + rawResponse.getHeaders().getContentType());
                    System.err.println("Raw response body (first 500 chars): " +
                        (rawResponse.getBody() != null ?
                         rawResponse.getBody().substring(0, Math.min(500, rawResponse.getBody().length())) : "null"));

                } catch (Exception rawEx) {
                    System.err.println("Failed to get raw response: " + rawEx.getMessage());
                }

                throw new RuntimeException("Derash API call failed. Check network connectivity and API credentials. Original error: " + e.getMessage());
            }

        } catch (Exception e) {
            System.err.println("=== DERASH ERROR ===");
            System.err.println("Error type: " + e.getClass().getSimpleName());
            System.err.println("Error message: " + e.getMessage());
            e.printStackTrace();
            throw e;
        }
    }

    public java.util.Map<String, Object> fetchSinglePaidBill(String billId) {
        try {
            CompanyProfile companyProfile = companyProfileRepository.findById(9).orElse(null);
            if (companyProfile == null) {
                companyProfile = companyProfileRepository.findFirstByOrderByIdDesc();
                if (companyProfile == null) {
                    throw new RuntimeException("No company profiles found in database");
                }
            }

            String baseUrl = companyProfile.getdCompanyUri();
            String apiKey = companyProfile.getdCompanyKey();
            String apiSecret = companyProfile.getdCompanySecret();

            if (baseUrl == null || baseUrl.trim().isEmpty()) {
                throw new RuntimeException("Derash base URL (d_company_uri) is not configured in company profile");
            }
            if (apiKey == null || apiKey.trim().isEmpty()) {
                throw new RuntimeException("Derash API key (d_company_key) is not configured in company profile");
            }
            if (apiSecret == null || apiSecret.trim().isEmpty()) {
                throw new RuntimeException("Derash API secret (d_company_secret) is not configured in company profile");
            }

            String base = baseUrl.trim();
            // Base URL already includes '/biller/', so only append the resource segment
            String url = UriComponentsBuilder.fromHttpUrl(base)
                    .pathSegment("customer-paid-bill")
                    .queryParam("bill_id", billId)
                    .toUriString();

            HttpHeaders headers = new HttpHeaders();
            headers.set("api-key", apiKey.trim());
            headers.set("api-secret", apiSecret.trim());
            headers.set(HttpHeaders.ACCEPT, MediaType.APPLICATION_JSON_VALUE);

            System.out.println("[Derash] Single paid bill URL: " + url);
            ResponseEntity<java.util.Map> response = exchangeWithRetry(
                url,
                HttpMethod.GET,
                new HttpEntity<>(headers),
                java.util.Map.class
            );
            System.out.println("[Derash] Response status: " + response.getStatusCode());

            if (response.getStatusCode().is2xxSuccessful()) {
                java.util.Map body = response.getBody();
                if (body == null) {
                    throw new RuntimeException("Empty response from Derash for bill_id=" + billId);
                }
                return body;
            }

            throw new RuntimeException("Derash returned status: " + response.getStatusCode());
        } catch (Exception e) {
            throw e;
        }
    }

    public java.util.Map<String, Object> updateCustomerBill(String billId, String amountDue, String billDesc, String reason, String dueDate) {
        try {
            CompanyProfile companyProfile = companyProfileRepository.findById(9).orElse(null);
            if (companyProfile == null) {
                companyProfile = companyProfileRepository.findFirstByOrderByIdDesc();
                if (companyProfile == null) {
                    throw new RuntimeException("No company profiles found in database");
                }
            }

            String baseUrl = companyProfile.getdCompanyUri();
            String apiKey = companyProfile.getdCompanyKey();
            String apiSecret = companyProfile.getdCompanySecret();

            if (baseUrl == null || baseUrl.trim().isEmpty()) {
                throw new RuntimeException("Derash base URL (d_company_uri) is not configured in company profile");
            }
            if (apiKey == null || apiKey.trim().isEmpty()) {
                throw new RuntimeException("Derash API key (d_company_key) is not configured in company profile");
            }
            if (apiSecret == null || apiSecret.trim().isEmpty()) {
                throw new RuntimeException("Derash API secret (d_company_secret) is not configured in company profile");
            }

            String base = baseUrl.trim();
            String url = UriComponentsBuilder.fromHttpUrl(base)
                    .pathSegment("customer-bill-data")
                    .queryParam("bill_id", billId)
                    .toUriString();

            HttpHeaders headers = new HttpHeaders();
            headers.set("api-key", apiKey.trim());
            headers.set("api-secret", apiSecret.trim());
            headers.setContentType(MediaType.APPLICATION_JSON);

            java.util.Map<String, Object> payload = new java.util.LinkedHashMap<>();
            payload.put("bill_id", billId);
            payload.put("amount_due", amountDue);
            if (billDesc != null) {
                payload.put("bill_desc", billDesc);
            }
            if (reason != null) {
                payload.put("reason", reason);
            }
            if (dueDate != null) {
                payload.put("due_date", dueDate);
            }

            ResponseEntity<java.util.Map> response = exchangeWithRetry(
                    url,
                    HttpMethod.PUT,
                    new HttpEntity<>(payload, headers),
                    java.util.Map.class
            );

            if (response.getStatusCode().is2xxSuccessful()) {
                return response.getBody();
            }
            throw new RuntimeException("Derash returned status: " + response.getStatusCode());
        } catch (Exception e) {
            throw e;
        }
    }

    private <T> ResponseEntity<T> exchangeWithRetry(String url, HttpMethod method, HttpEntity<?> entity, Class<T> responseType) {
        int attempts = 0;
        RestClientResponseException lastResponseEx = null;
        while (attempts < 3) {
            try {
                return restTemplate.exchange(url, method, entity, responseType);
            } catch (RestClientResponseException ex) {
                int code = ex.getRawStatusCode();
                // Retry on transient upstream errors
                if (code == 502 || code == 503 || code == 504) {
                    attempts++;
                    lastResponseEx = ex;
                    try { Thread.sleep(300L * attempts); } catch (InterruptedException ignored) {}
                    continue;
                }
                throw ex;
            } catch (RestClientException ex) {
                attempts++;
                try { Thread.sleep(300L * attempts); } catch (InterruptedException ignored) {}
                if (attempts >= 3) throw ex;
            }
        }
        if (lastResponseEx != null) throw lastResponseEx;
        throw new RestClientException("Derash call failed after retries");
    }
}
