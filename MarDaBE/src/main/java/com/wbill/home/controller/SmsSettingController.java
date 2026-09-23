package com.wbill.home.controller;

import java.util.List;
import java.util.Map;
import java.util.Optional;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.wbill.home.dto.SmsSettingDTO;
import com.wbill.home.service.SmsSettingService;

@RestController
@RequestMapping("/api/mardaerp/sms-settings")
@CrossOrigin(origins = "*")
public class SmsSettingController {

    private static final Logger logger = LoggerFactory.getLogger(SmsSettingController.class);

    private final SmsSettingService smsSettingService;

    @Autowired
    public SmsSettingController(SmsSettingService smsSettingService) {
        this.smsSettingService = smsSettingService;
    }

    @GetMapping
    public ResponseEntity<List<SmsSettingDTO>> getAllSettings() {
        try {
            return ResponseEntity.ok(smsSettingService.getAllSettings());
        } catch (Exception e) {
            logger.error("Error fetching all SMS settings", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @GetMapping("/active")
    public ResponseEntity<List<SmsSettingDTO>> getActiveSettings() {
        try {
            return ResponseEntity.ok(smsSettingService.getActiveSettings());
        } catch (Exception e) {
            logger.error("Error fetching active SMS settings", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @GetMapping("/by-city/{cityId}")
    public ResponseEntity<SmsSettingDTO> getSettingForCity(@PathVariable Integer cityId) {
        try {
            Optional<SmsSettingDTO> setting = smsSettingService.getSettingForCity(cityId);
            return setting.map(ResponseEntity::ok)
                    .orElseGet(() -> ResponseEntity.status(HttpStatus.NOT_FOUND).build());
        } catch (Exception e) {
            logger.error("Error fetching SMS setting for cityId: " + cityId, e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @GetMapping("/by-city-name/{cityName}")
    public ResponseEntity<SmsSettingDTO> getSettingForCityName(@PathVariable String cityName) {
        try {
            Optional<SmsSettingDTO> setting = smsSettingService.getSettingForCityName(cityName);
            return setting.map(ResponseEntity::ok)
                    .orElseGet(() -> ResponseEntity.status(HttpStatus.NOT_FOUND).build());
        } catch (Exception e) {
            logger.error("Error fetching SMS setting for cityName: " + cityName, e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @PostMapping
    public ResponseEntity<SmsSettingDTO> saveOrUpdateSetting(@RequestBody SmsSettingDTO dto) {
        try {
            if (dto.getCityName() == null || dto.getCityName().trim().isEmpty()) {
                dto.setCityName("Default");
            }
            if (dto.getGatewayUrl() == null || dto.getGatewayUrl().trim().isEmpty()) {
                dto.setGatewayUrl("https://smsethiopia.et/api/sms/send");
            }
            SmsSettingDTO saved = smsSettingService.saveOrUpdateSetting(dto);
            return ResponseEntity.ok(saved);
        } catch (Exception e) {
            logger.error("Error saving SMS setting", e);
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).build();
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Map<String, Object>> deleteSetting(@PathVariable Integer id) {
        try {
            boolean deleted = smsSettingService.deleteSetting(id);
            if (deleted) {
                return ResponseEntity.ok(Map.of("success", true, "message", "SMS setting deleted successfully"));
            } else {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(Map.of("success", false, "message", "SMS setting not found"));
            }
        } catch (Exception e) {
            logger.error("Error deleting SMS setting with id: " + id, e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("success", false, "error", e.getMessage()));
        }
    }
}
