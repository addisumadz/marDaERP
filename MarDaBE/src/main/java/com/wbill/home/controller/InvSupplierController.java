package com.wbill.home.controller;

import com.wbill.home.model.InvSupplier;
import com.wbill.home.service.InvSupplierService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.security.Principal;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/card_managenment/inv-suppliers")
@CrossOrigin(origins = "*", maxAge = 3600)
public class InvSupplierController {

    @Autowired
    private InvSupplierService service;

    @GetMapping("/all")
    public ResponseEntity<Page<InvSupplier>> getAll(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        return ResponseEntity.ok(service.getAllPaged(page, size));
    }

    @GetMapping("/active")
    public ResponseEntity<List<InvSupplier>> getAllActive() {
        return ResponseEntity.ok(service.getAllActive());
    }

    @GetMapping("/search")
    public ResponseEntity<Page<InvSupplier>> search(
            @RequestParam String q,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        return ResponseEntity.ok(service.search(q, page, size));
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getById(@PathVariable int id) {
        return service.getById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<?> create(@RequestBody InvSupplier supplier, Principal principal) {
        try {
            String username = principal != null ? principal.getName() : "system";
            return ResponseEntity.status(HttpStatus.CREATED).body(service.create(supplier, username));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(java.util.Collections.singletonMap("message", e.getMessage() != null ? e.getMessage() : e.toString()));
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> update(@PathVariable int id, @RequestBody InvSupplier supplier) {
        try {
            return ResponseEntity.ok(service.update(id, supplier));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(java.util.Collections.singletonMap("message", e.getMessage() != null ? e.getMessage() : e.toString()));
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> delete(@PathVariable int id) {
        try {
            service.softDelete(id);
            return ResponseEntity.ok(Map.of("message", "Supplier deleted"));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(java.util.Collections.singletonMap("message", e.getMessage() != null ? e.getMessage() : e.toString()));
        }
    }
}
