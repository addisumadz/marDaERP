package com.wbill.home.controller;

import com.wbill.home.model.InvItemGroup;
import com.wbill.home.service.InvItemGroupService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.security.Principal;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/mardaerp/inv-groups")
@CrossOrigin(origins = "*", maxAge = 3600)
public class InvItemGroupController {

    @Autowired
    private InvItemGroupService service;

    @GetMapping("/all")
    public ResponseEntity<Page<InvItemGroup>> getAll(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        return ResponseEntity.ok(service.getAllPaged(page, size));
    }

    @GetMapping("/by-category/{categoryId}")
    public ResponseEntity<Page<InvItemGroup>> getByCategory(
            @PathVariable int categoryId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        return ResponseEntity.ok(service.getByCategoryPaged(categoryId, page, size));
    }

    @GetMapping("/active")
    public ResponseEntity<List<InvItemGroup>> getAllActive() {
        return ResponseEntity.ok(service.getAllActive());
    }

    @GetMapping("/active/by-category/{categoryId}")
    public ResponseEntity<List<InvItemGroup>> getActiveByCategory(@PathVariable int categoryId) {
        return ResponseEntity.ok(service.getActiveByCategory(categoryId));
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getById(@PathVariable int id) {
        return service.getById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<?> create(@RequestBody Map<String, Object> body, Principal principal) {
        try {
            String username = principal != null ? principal.getName() : "system";
            InvItemGroup group = new InvItemGroup();
            group.setGroupCode((String) body.get("groupCode"));
            group.setGroupName((String) body.get("groupName"));
            group.setGroupNameAm((String) body.get("groupNameAm"));
            group.setIsActive(body.get("isActive") != null ? (Boolean) body.get("isActive") : true);
            int categoryId = Integer.parseInt(body.get("categoryId").toString());
            return ResponseEntity.status(HttpStatus.CREATED).body(service.create(group, categoryId, username));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(java.util.Collections.singletonMap("message", e.getMessage() != null ? e.getMessage() : e.toString()));
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> update(@PathVariable int id, @RequestBody Map<String, Object> body) {
        try {
            InvItemGroup group = new InvItemGroup();
            group.setGroupCode((String) body.get("groupCode"));
            group.setGroupName((String) body.get("groupName"));
            group.setGroupNameAm((String) body.get("groupNameAm"));
            group.setIsActive(body.get("isActive") != null ? (Boolean) body.get("isActive") : true);
            int categoryId = Integer.parseInt(body.get("categoryId").toString());
            return ResponseEntity.ok(service.update(id, group, categoryId));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(java.util.Collections.singletonMap("message", e.getMessage() != null ? e.getMessage() : e.toString()));
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> delete(@PathVariable int id) {
        try {
            service.softDelete(id);
            return ResponseEntity.ok(Map.of("message", "Group deleted"));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(java.util.Collections.singletonMap("message", e.getMessage() != null ? e.getMessage() : e.toString()));
        }
    }
}
