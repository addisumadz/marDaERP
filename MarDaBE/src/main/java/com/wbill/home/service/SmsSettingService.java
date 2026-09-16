package com.wbill.home.service;

import java.sql.Connection;
import java.sql.Statement;
import java.util.Date;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;
import javax.sql.DataSource;

import jakarta.annotation.PostConstruct;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.wbill.home.dto.SmsSettingDTO;
import com.wbill.home.model.SmsSetting;
import com.wbill.home.repository.SmsSettingRepository;

@Service
public class SmsSettingService {

    private static final Logger logger = LoggerFactory.getLogger(SmsSettingService.class);

    private final SmsSettingRepository smsSettingRepository;
    private final DataSource dataSource;

    @Autowired
    public SmsSettingService(SmsSettingRepository smsSettingRepository, DataSource dataSource) {
        this.smsSettingRepository = smsSettingRepository;
        this.dataSource = dataSource;
    }

    @PostConstruct
    public void initTableAndDefaults() {
        try (Connection conn = dataSource.getConnection(); Statement stmt = conn.createStatement()) {
            String createTableSql = "CREATE TABLE IF NOT EXISTS sms_setting (" +
                    "id INT AUTO_INCREMENT PRIMARY KEY, " +
                    "city_id INT NULL, " +
                    "city_name VARCHAR(150) NOT NULL, " +
                    "gateway_url VARCHAR(500) NOT NULL DEFAULT 'https://smsethiopia.et/api/sms/send', " +
                    "api_key VARCHAR(500) NOT NULL, " +
                    "sender_id VARCHAR(100) NULL DEFAULT 'MarDa ERP', " +
                    "is_active BOOLEAN NOT NULL DEFAULT TRUE, " +
                    "description VARCHAR(255) NULL, " +
                    "created_date DATETIME DEFAULT CURRENT_TIMESTAMP, " +
                    "modified_date DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP, " +
                    "protocol VARCHAR(30) NOT NULL DEFAULT 'HTTP_REST', " +
                    "smpp_host VARCHAR(255) NULL, " +
                    "smpp_port INT NULL DEFAULT 5019, " +
                    "smpp_system_id VARCHAR(100) NULL, " +
                    "smpp_password VARCHAR(255) NULL, " +
                    "INDEX idx_sms_setting_city (city_id), " +
                    "INDEX idx_sms_setting_active (is_active)" +
                    ") ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci";
            stmt.execute(createTableSql);
            logger.info("Checked/created sms_setting table in MySQL database.");

            // Safely add new SMPP columns if migrating an existing sms_setting table
            String[] alterCols = {
                "ALTER TABLE sms_setting ADD COLUMN protocol VARCHAR(30) NOT NULL DEFAULT 'HTTP_REST'",
                "ALTER TABLE sms_setting ADD COLUMN smpp_host VARCHAR(255) NULL",
                "ALTER TABLE sms_setting ADD COLUMN smpp_port INT NULL DEFAULT 5019",
                "ALTER TABLE sms_setting ADD COLUMN smpp_system_id VARCHAR(100) NULL",
                "ALTER TABLE sms_setting ADD COLUMN smpp_password VARCHAR(255) NULL"
            };
            for (String sql : alterCols) {
                try {
                    stmt.execute(sql);
                } catch (Exception ignored) {
                    // column already exists
                }
            }
        } catch (Exception e) {
            logger.warn("Could not auto-create or alter sms_setting table via DataSource: {}", e.getMessage());
        }

        try {
            Optional<SmsSetting> defOpt = smsSettingRepository.findFirstByCityIdIsNullAndIsActiveTrue();
            if (defOpt.isPresent()) {
                SmsSetting def = defOpt.get();
                if (def.getSmppHost() == null || def.getSmppHost().trim().isEmpty()) {
                    def.setProtocol("SMPP");
                    def.setSmppHost("10.204.181.70");
                    def.setSmppPort(5019);
                    def.setSmppSystemId("8581");
                    def.setSmppPassword("Wtw@1921");
                    if (def.getSenderId() == null || def.getSenderId().equalsIgnoreCase("MarDa ERP")) {
                        def.setSenderId("WoldiaWater");
                    }
                    smsSettingRepository.save(def);
                    logger.info("Updated existing default SMS setting with Woldia SMPP credentials.");
                }
            } else if (smsSettingRepository.count() == 0) {
                SmsSetting defaultSetting = new SmsSetting(
                        null,
                        "Default (All Cities)",
                        "https://smsethiopia.et/api/sms/send",
                        "2NJFAWWIERUMIQNMY03D4B9O48EMOJOJ:1027",
                        "WoldiaWater",
                        true,
                        "Global default gateway and SMPP fallback"
                );
                defaultSetting.setProtocol("SMPP");
                defaultSetting.setSmppHost("10.204.181.70");
                defaultSetting.setSmppPort(5019);
                defaultSetting.setSmppSystemId("8581");
                defaultSetting.setSmppPassword("Wtw@1921");
                smsSettingRepository.save(defaultSetting);
                logger.info("Seeded default SMS_Setting with SMPP configuration in database.");
            }
        } catch (Exception e) {
            logger.warn("Could not seed or update default sms_setting: {}", e.getMessage());
        }
    }

    public List<SmsSettingDTO> getAllSettings() {
        return smsSettingRepository.findAll().stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    public List<SmsSettingDTO> getActiveSettings() {
        return smsSettingRepository.findByIsActiveTrue().stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    public Optional<SmsSettingDTO> getSettingForCity(Integer cityId) {
        if (cityId != null) {
            Optional<SmsSetting> citySetting = smsSettingRepository.findFirstByCityIdAndIsActiveTrue(cityId);
            if (citySetting.isPresent()) {
                return citySetting.map(this::toDTO);
            }
        }
        // Fallback to default
        return smsSettingRepository.findFirstByCityIdIsNullAndIsActiveTrue().map(this::toDTO);
    }

    public Optional<SmsSettingDTO> getSettingForCityName(String cityName) {
        if (cityName != null && !cityName.trim().isEmpty()) {
            Optional<SmsSetting> match = smsSettingRepository.findFirstByCityNameIgnoreCaseAndIsActiveTrue(cityName.trim());
            if (match.isPresent()) {
                return match.map(this::toDTO);
            }
        }
        return smsSettingRepository.findFirstByCityIdIsNullAndIsActiveTrue().map(this::toDTO);
    }

    @Transactional
    public SmsSettingDTO saveOrUpdateSetting(SmsSettingDTO dto) {
        if (dto == null) {
            throw new IllegalArgumentException("SmsSettingDTO cannot be null");
        }

        SmsSetting entity;
        if (dto.getId() != null && dto.getId() > 0) {
            entity = smsSettingRepository.findById(dto.getId())
                    .orElse(new SmsSetting());
        } else if (dto.getCityId() != null) {
            // Check if already exists for this cityId
            entity = smsSettingRepository.findFirstByCityIdAndIsActiveTrue(dto.getCityId())
                    .orElse(new SmsSetting());
        } else {
            entity = smsSettingRepository.findFirstByCityIdIsNullAndIsActiveTrue()
                    .orElse(new SmsSetting());
        }

        entity.setCityId(dto.getCityId());
        entity.setCityName(dto.getCityName() != null ? dto.getCityName().trim() : "Default");
        entity.setGatewayUrl(dto.getGatewayUrl() != null ? dto.getGatewayUrl().trim() : "https://smsethiopia.et/api/sms/send");
        entity.setApiKey(dto.getApiKey() != null ? dto.getApiKey().trim() : "");
        entity.setSenderId(dto.getSenderId() != null ? dto.getSenderId().trim() : "MarDa ERP");
        entity.setActive(dto.getIsActive() != null ? dto.getIsActive() : true);
        entity.setDescription(dto.getDescription());
        entity.setModifiedDate(new Date());
        entity.setProtocol(dto.getProtocol() != null && !dto.getProtocol().trim().isEmpty() ? dto.getProtocol().trim() : "HTTP_REST");
        entity.setSmppHost(dto.getSmppHost() != null ? dto.getSmppHost().trim() : null);
        entity.setSmppPort(dto.getSmppPort() != null ? dto.getSmppPort() : 5019);
        entity.setSmppSystemId(dto.getSmppSystemId() != null ? dto.getSmppSystemId().trim() : null);
        entity.setSmppPassword(dto.getSmppPassword() != null ? dto.getSmppPassword().trim() : null);

        SmsSetting saved = smsSettingRepository.save(entity);
        return toDTO(saved);
    }

    @Transactional
    public boolean deleteSetting(Integer id) {
        if (id != null && smsSettingRepository.existsById(id)) {
            smsSettingRepository.deleteById(id);
            return true;
        }
        return false;
    }

    private SmsSettingDTO toDTO(SmsSetting entity) {
        if (entity == null) return null;
        return new SmsSettingDTO(
                entity.getId(),
                entity.getCityId(),
                entity.getCityName(),
                entity.getGatewayUrl(),
                entity.getApiKey(),
                entity.getSenderId(),
                entity.isActive(),
                entity.getDescription(),
                entity.getCreatedDate(),
                entity.getModifiedDate(),
                entity.getProtocol(),
                entity.getSmppHost(),
                entity.getSmppPort(),
                entity.getSmppSystemId(),
                entity.getSmppPassword()
        );
    }
}
