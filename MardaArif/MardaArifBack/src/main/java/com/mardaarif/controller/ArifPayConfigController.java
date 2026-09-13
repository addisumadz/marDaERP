package com.mardaarif.controller;

import com.mardaarif.model.ArifPayConfig;
import com.mardaarif.service.ArifPayConfigService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/arifpay-config")
public class ArifPayConfigController {

    @Autowired
    private ArifPayConfigService configService;

    /**
     * Retrieve the current ArifPay configuration.
     */
    @GetMapping
    public ResponseEntity<?> getConfig() {
        try {
            ArifPayConfig config = configService.getConfig();
            return ResponseEntity.ok(config);
        } catch (RuntimeException e) {
            return ResponseEntity.status(404)
                .body(Map.of("message", e.getMessage()));
        }
    }

    /**
     * Update the ArifPay configuration.
     */
    @PutMapping
    public ResponseEntity<?> updateConfig(@RequestBody ArifPayConfig configData) {
        try {
            ArifPayConfig saved = configService.saveConfig(configData);
            return ResponseEntity.ok(saved);
        } catch (Exception e) {
            return ResponseEntity.status(500)
                .body(Map.of("message", "Failed to save configuration: " + e.getMessage()));
        }
    }
}
