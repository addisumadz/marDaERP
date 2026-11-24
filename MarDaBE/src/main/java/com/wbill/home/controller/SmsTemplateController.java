package com.wbill.home.controller;

import com.wbill.home.dto.SmsTemplateDTO;
import com.wbill.home.service.SmsTemplateService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/mardaerp/sms-templates")
@CrossOrigin(origins = "*")
public class SmsTemplateController {

    private static final Logger logger = LoggerFactory.getLogger(SmsTemplateController.class);

    @Autowired
    private SmsTemplateService smsTemplateService;

    @GetMapping
    public ResponseEntity<List<SmsTemplateDTO>> getAllTemplates() {
        try {
            return ResponseEntity.ok(smsTemplateService.getAllTemplates());
        } catch (Exception e) {
            logger.error("Error retrieving SMS templates", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @GetMapping("/{code}")
    public ResponseEntity<?> getTemplateByCode(@PathVariable String code) {
        try {
            Optional<SmsTemplateDTO> opt = smsTemplateService.getTemplateByCode(code);
            if (opt.isPresent()) {
                return ResponseEntity.ok(opt.get());
            } else {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(Map.of("message", "Template not found for code: " + code));
            }
        } catch (Exception e) {
            logger.error("Error retrieving SMS template for code " + code, e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @PostMapping
    public ResponseEntity<?> saveTemplate(@RequestBody SmsTemplateDTO dto) {
        try {
            if (dto == null || ((dto.getTemplateName() == null || dto.getTemplateName().trim().isEmpty())
                    && (dto.getTemplateCode() == null || dto.getTemplateCode().trim().isEmpty()))) {
                return ResponseEntity.badRequest().body(Map.of("message", "templateName is required"));
            }
            SmsTemplateDTO saved = smsTemplateService.saveOrUpdateTemplate(dto);
            return ResponseEntity.ok(saved);
        } catch (IllegalArgumentException iae) {
            return ResponseEntity.badRequest().body(Map.of("message", iae.getMessage()));
        } catch (Exception e) {
            logger.error("Error saving SMS template", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("message", "Failed to save template: " + e.getMessage()));
        }
    }

    @DeleteMapping("/{code}")
    public ResponseEntity<?> deleteTemplate(@PathVariable String code) {
        try {
            smsTemplateService.deleteTemplate(code);
            return ResponseEntity.ok(Map.of("message", "Template deleted successfully", "templateCode", code));
        } catch (IllegalArgumentException iae) {
            return ResponseEntity.badRequest().body(Map.of("message", iae.getMessage()));
        } catch (Exception e) {
            logger.error("Error deleting SMS template for code " + code, e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("message", "Failed to delete template: " + e.getMessage()));
        }
    }

    @PostMapping("/{code}/reset")
    public ResponseEntity<?> resetTemplateToDefault(@PathVariable String code) {
        try {
            SmsTemplateDTO reset = smsTemplateService.resetToDefault(code);
            return ResponseEntity.ok(reset);
        } catch (IllegalArgumentException iae) {
            return ResponseEntity.badRequest().body(Map.of("message", iae.getMessage()));
        } catch (Exception e) {
            logger.error("Error resetting SMS template for code " + code, e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("message", "Failed to reset template: " + e.getMessage()));
        }
    }
}

