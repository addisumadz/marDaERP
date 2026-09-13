package com.wbill.home.service;

import org.springframework.stereotype.Service;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class BankProcessJobStore {
    private final Map<String, com.wbill.home.dto.BankProcessResultDTO> results = new ConcurrentHashMap<>();

    public void setResult(String jobId, com.wbill.home.dto.BankProcessResultDTO dto) {
        if (jobId == null) return;
        results.put(jobId, dto);
    }

    public com.wbill.home.dto.BankProcessResultDTO getResult(String jobId) {
        if (jobId == null) return null;
        return results.get(jobId);
    }

    public void cleanup(String jobId) {
        if (jobId == null) return;
        results.remove(jobId);
    }
}
