package com.wbill.home.service;

import com.wbill.home.dto.SmsTemplateDTO;
import com.wbill.home.model.SmsTemplate;
import com.wbill.home.repository.SmsTemplateRepository;
import jakarta.annotation.PostConstruct;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class SmsTemplateService {

    private static final Logger logger = LoggerFactory.getLogger(SmsTemplateService.class);

    public static final String BILL_SMS_CODE = "BILL_SMS";
    public static final String DEFAULT_BILL_SMS_CONTENT =
            "ውድ ደንበኛችን {customerName} የውል ቁጥር {accountNumber} የ{billMonth}ወር ፍጆታ {consumption}m³(ከ{previousReading}-{currentReading}) ውዝፍ {arrears}፣ጠቅላላ ክፍያ {totalPayable} ብር እስከ {dueDate} ድረስ ይክፈሉ፡፡ ({companyName})";

    @Autowired
    private SmsTemplateRepository smsTemplateRepository;

    @Autowired(required = false)
    private JdbcTemplate jdbcTemplate;

    // In-memory cache for high-throughput batch operations
    private static class CacheEntry {
        final String content;
        final long timestamp;

        CacheEntry(String content, long timestamp) {
            this.content = content;
            this.timestamp = timestamp;
        }
    }

    private final Map<String, CacheEntry> templateCache = new ConcurrentHashMap<>();
    private static final long CACHE_TTL_MS = 5_000L; // 5 seconds to ensure fast reflection of database updates

    public void evictCache(String code) {
        if (code != null) {
            templateCache.remove(code.trim());
        }
    }

    public void clearCache() {
        templateCache.clear();
    }

    @PostConstruct
    public void init() {
        initTableAndSeed();
    }

    private void initTableAndSeed() {
        if (jdbcTemplate != null) {
            try {
                String ddl = "CREATE TABLE IF NOT EXISTS sms_template ("
                        + "id INT AUTO_INCREMENT PRIMARY KEY, "
                        + "template_code VARCHAR(50) NOT NULL UNIQUE, "
                        + "template_name VARCHAR(150) NOT NULL, "
                        + "template_content TEXT NOT NULL, "
                        + "description VARCHAR(255), "
                        + "is_active BOOLEAN NOT NULL DEFAULT TRUE, "
                        + "created_date DATETIME, "
                        + "modified_date DATETIME"
                        + ") ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;";
                jdbcTemplate.execute(ddl);
            } catch (Exception ex) {
                logger.warn("Could not execute DDL for sms_template table: {}", ex.getMessage());
            }
        }

        try {
            Optional<SmsTemplate> billSmsOpt = smsTemplateRepository.findByTemplateCode(BILL_SMS_CODE);
            if (billSmsOpt.isEmpty()) {
                logger.info("Seeding default BILL_SMS template into sms_template table...");
                SmsTemplate defaultBillSms = new SmsTemplate(
                        BILL_SMS_CODE,
                        "Water Bill Notification SMS",
                        DEFAULT_BILL_SMS_CONTENT,
                        "Standard monthly bill SMS notification sent to customers",
                        true
                );
                smsTemplateRepository.save(defaultBillSms);
                logger.info("Default BILL_SMS template seeded successfully.");
            }
        } catch (Exception ex) {
            logger.warn("Could not seed default BILL_SMS template: {}", ex.getMessage());
        }
    }

    public List<SmsTemplateDTO> getAllTemplates() {
        List<SmsTemplate> list = smsTemplateRepository.findAll();
        List<SmsTemplateDTO> dtos = new ArrayList<>();
        for (SmsTemplate entity : list) {
            dtos.add(toDTO(entity));
        }
        return dtos;
    }

    public Optional<SmsTemplateDTO> getTemplateByCode(String code) {
        if (code == null) return Optional.empty();
        return smsTemplateRepository.findByTemplateCode(code.trim()).map(this::toDTO);
    }

    public String getActiveTemplateContent(String code) {
        String normalizedCode = (code != null && !code.trim().isEmpty())
                ? code.trim()
                : BILL_SMS_CODE;
        long now = System.currentTimeMillis();

        CacheEntry cached = templateCache.get(normalizedCode);
        if (cached != null && (now - cached.timestamp) < CACHE_TTL_MS) {
            return cached.content;
        }

        try {
            Optional<SmsTemplate> opt = smsTemplateRepository.findByTemplateCode(normalizedCode);
            if (opt.isPresent() && opt.get().isActive()) {
                String content = opt.get().getTemplateContent();
                templateCache.put(normalizedCode, new CacheEntry(content, now));
                return content;
            }
        } catch (Exception ex) {
            logger.warn("Error fetching SMS template '{}': {}", normalizedCode, ex.getMessage());
        }

        // Fallback default for BILL_SMS
        if (BILL_SMS_CODE.equalsIgnoreCase(normalizedCode)) {
            return DEFAULT_BILL_SMS_CONTENT;
        }
        return null;
    }

    public SmsTemplateDTO saveOrUpdateTemplate(SmsTemplateDTO dto) {
        if (dto == null) {
            throw new IllegalArgumentException("Template payload is required");
        }

        String name = (dto.getTemplateName() != null) ? dto.getTemplateName().trim() : "";
        if (name.isEmpty()) {
            throw new IllegalArgumentException("Template name is required");
        }

        // Auto-generate code if null/empty
        String code = (dto.getTemplateCode() != null && !dto.getTemplateCode().trim().isEmpty())
                ? dto.getTemplateCode().trim()
                : null;

        SmsTemplate entity = null;
        if (dto.getId() != null) {
            entity = smsTemplateRepository.findById(dto.getId()).orElse(null);
        }
        if (entity == null && code != null) {
            entity = smsTemplateRepository.findByTemplateCode(code).orElse(null);
        }
        if (entity == null) {
            entity = new SmsTemplate();
            if (code == null) {
                // Auto-generate a clean, unique template code behind the scenes
                String cleanName = name.replaceAll("[^a-zA-Z0-9]", "_").toUpperCase();
                cleanName = cleanName.replaceAll("_+", "_");
                if (cleanName.startsWith("_")) cleanName = cleanName.substring(1);
                if (cleanName.length() > 20) cleanName = cleanName.substring(0, 20);
                if (cleanName.isEmpty()) cleanName = "CUSTOM";
                code = "BILL_" + cleanName + "_" + (System.currentTimeMillis() % 100000);
            }
            entity.setTemplateCode(code);
            entity.setCreatedDate(new Date());
        } else {
            code = entity.getTemplateCode();
        }

        entity.setTemplateName(name);
        entity.setTemplateContent(dto.getTemplateContent() != null ? dto.getTemplateContent().trim() : "");
        entity.setDescription(dto.getDescription());
        entity.setActive(dto.isActive() || dto.getIsActive());
        entity.setModifiedDate(new Date());

        SmsTemplate saved = smsTemplateRepository.save(entity);

        // Update in-memory cache
        templateCache.put(code, new CacheEntry(saved.getTemplateContent(), System.currentTimeMillis()));

        return toDTO(saved);
    }

    public void deleteTemplate(String code) {
        if (code == null || code.trim().isEmpty()) {
            throw new IllegalArgumentException("Template code is required for deletion");
        }
        String normalized = code.trim();
        if (BILL_SMS_CODE.equalsIgnoreCase(normalized)) {
            throw new IllegalArgumentException("The default system template (" + BILL_SMS_CODE + ") cannot be deleted.");
        }

        Optional<SmsTemplate> opt = smsTemplateRepository.findByTemplateCode(normalized);
        if (opt.isPresent()) {
            smsTemplateRepository.delete(opt.get());
            templateCache.remove(normalized);
            logger.info("Deleted SMS template with code '{}'", normalized);
        } else {
            throw new IllegalArgumentException("Template not found for code: " + normalized);
        }
    }

    public SmsTemplateDTO resetToDefault(String code) {
        if (BILL_SMS_CODE.equalsIgnoreCase(code)) {
            SmsTemplate entity = smsTemplateRepository.findByTemplateCode(BILL_SMS_CODE)
                    .orElse(new SmsTemplate());

            if (entity.getId() == null) {
                entity.setTemplateCode(BILL_SMS_CODE);
                entity.setCreatedDate(new Date());
            }
            entity.setTemplateName("Water Bill Notification SMS");
            entity.setTemplateContent(DEFAULT_BILL_SMS_CONTENT);
            entity.setDescription("Standard monthly bill SMS notification sent to customers");
            entity.setActive(true);
            entity.setModifiedDate(new Date());

            SmsTemplate saved = smsTemplateRepository.save(entity);
            templateCache.put(BILL_SMS_CODE, new CacheEntry(saved.getTemplateContent(), System.currentTimeMillis()));
            return toDTO(saved);
        }
        throw new IllegalArgumentException("No default template available for code: " + code);
    }

    public String getDefaultContentForCode(String code) {
        if (BILL_SMS_CODE.equalsIgnoreCase(code)) {
            return DEFAULT_BILL_SMS_CONTENT;
        }
        return "";
    }

    private SmsTemplateDTO toDTO(SmsTemplate e) {
        if (e == null) return null;
        return new SmsTemplateDTO(
                e.getId(),
                e.getTemplateCode(),
                e.getTemplateName(),
                e.getTemplateContent(),
                e.getDescription(),
                e.isActive(),
                e.getCreatedDate(),
                e.getModifiedDate()
        );
    }
}

