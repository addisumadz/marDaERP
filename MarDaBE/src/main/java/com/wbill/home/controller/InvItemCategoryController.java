package com.wbill.home.controller;

import com.wbill.home.model.InvItemCategory;
import com.wbill.home.service.InvItemCategoryService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.security.Principal;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/mardaerp/inv-categories")
@CrossOrigin(origins = "*", maxAge = 3600)
public class InvItemCategoryController {

    @Autowired
    private InvItemCategoryService service;

    @GetMapping("/all")
    public ResponseEntity<Page<InvItemCategory>> getAll(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        return ResponseEntity.ok(service.getAllPaged(page, size));
    }

    @GetMapping("/active")
    public ResponseEntity<List<InvItemCategory>> getAllActive() {
        return ResponseEntity.ok(service.getAllActive());
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getById(@PathVariable int id) {
        return service.getById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<?> create(@RequestBody InvItemCategory category, Principal principal) {
        try {
            String username = principal != null ? principal.getName() : "system";
            return ResponseEntity.status(HttpStatus.CREATED).body(service.create(category, username));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(java.util.Collections.singletonMap("message", e.getMessage() != null ? e.getMessage() : e.toString()));
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> update(@PathVariable int id, @RequestBody InvItemCategory category) {
        try {
            return ResponseEntity.ok(service.update(id, category));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(java.util.Collections.singletonMap("message", e.getMessage() != null ? e.getMessage() : e.toString()));
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> delete(@PathVariable int id) {
        try {
            service.softDelete(id);
            return ResponseEntity.ok(Map.of("message", "Category deleted"));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(java.util.Collections.singletonMap("message", e.getMessage() != null ? e.getMessage() : e.toString()));
        }
    }
}
