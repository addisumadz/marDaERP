package com.wbill.home.controller;

import com.wbill.home.model.FncBillingAccountMap;
import com.wbill.home.service.FncBillingAccountMapService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/mardaerp/fnc-billing-account-map")
@CrossOrigin(origins = "*", maxAge = 3600)
public class FncBillingAccountMapController {

    @Autowired
    private FncBillingAccountMapService service;

    @GetMapping("/all")
    public ResponseEntity<List<FncBillingAccountMap>> getAllMappings() {
        try {
            List<FncBillingAccountMap> mappings = service.getAllMappings();
            return ResponseEntity.ok(mappings);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @PutMapping
    public ResponseEntity<List<FncBillingAccountMap>> saveMappings(@RequestBody List<FncBillingAccountMap> mappings) {
        try {
            List<FncBillingAccountMap> saved = service.saveMappings(mappings);
            return ResponseEntity.ok(saved);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
}
