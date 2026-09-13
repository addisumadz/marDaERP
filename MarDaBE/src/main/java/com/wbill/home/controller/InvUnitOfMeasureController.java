package com.wbill.home.controller;

import com.wbill.home.model.InvUnitOfMeasure;
import com.wbill.home.service.InvUnitOfMeasureService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.security.Principal;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/card_managenment/inv-units")
@CrossOrigin(origins = "*", maxAge = 3600)
public class InvUnitOfMeasureController {

    @Autowired
    private InvUnitOfMeasureService service;

    @GetMapping("/all")
    public ResponseEntity<Page<InvUnitOfMeasure>> getAll(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        return ResponseEntity.ok(service.getAllPaged(page, size));
    }

    @GetMapping("/active")
    public ResponseEntity<List<InvUnitOfMeasure>> getAllActive() {
        return ResponseEntity.ok(service.getAllActive());
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getById(@PathVariable int id) {
        return service.getById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<?> create(@RequestBody InvUnitOfMeasure unit, Principal principal) {
        try {
            String username = principal != null ? principal.getName() : "system";
            return ResponseEntity.status(HttpStatus.CREATED).body(service.create(unit, username));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(java.util.Collections.singletonMap("message", e.getMessage() != null ? e.getMessage() : e.toString()));
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> update(@PathVariable int id, @RequestBody InvUnitOfMeasure unit, Principal principal) {
        try {
            String username = principal != null ? principal.getName() : "system";
            return ResponseEntity.ok(service.update(id, unit, username));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(java.util.Collections.singletonMap("message", e.getMessage() != null ? e.getMessage() : e.toString()));
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> delete(@PathVariable int id) {
        try {
            service.softDelete(id);
            return ResponseEntity.ok(Map.of("message", "Unit deleted successfully"));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(java.util.Collections.singletonMap("message", e.getMessage() != null ? e.getMessage() : e.toString()));
        }
    }

    @PutMapping("/{id}/toggle-active")
    public ResponseEntity<?> toggleActive(@PathVariable int id) {
        try {
            service.toggleActive(id);
            return ResponseEntity.ok(Map.of("message", "Status toggled"));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(java.util.Collections.singletonMap("message", e.getMessage() != null ? e.getMessage() : e.toString()));
        }
    }
}
