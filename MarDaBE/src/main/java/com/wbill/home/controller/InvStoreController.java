package com.wbill.home.controller;

import com.wbill.home.dto.InvStoreDTO;
import com.wbill.home.model.InvStore;
import com.wbill.home.service.InvStoreService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.security.Principal;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/mardaerp/inv-stores")
@CrossOrigin(origins = "*", maxAge = 3600)
public class InvStoreController {

    @Autowired
    private InvStoreService service;

    @GetMapping("/all")
    public ResponseEntity<Page<InvStoreDTO>> getAll(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        Page<InvStoreDTO> dtoPage = service.getAllPaged(page, size)
                .map(InvStoreDTO::fromEntity);
        return ResponseEntity.ok(dtoPage);
    }

    @GetMapping("/active")
    public ResponseEntity<List<InvStoreDTO>> getAllActive() {
        List<InvStoreDTO> dtos = service.getAllActive().stream()
                .map(InvStoreDTO::fromEntity)
                .collect(Collectors.toList());
        return ResponseEntity.ok(dtos);
    }

    @GetMapping("/main")
    public ResponseEntity<?> getMainStore() {
        return service.getMainStore()
                .map(s -> ResponseEntity.ok(InvStoreDTO.fromEntity(s)))
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/by-branch/{branchId}")
    public ResponseEntity<?> getByBranch(@PathVariable int branchId) {
        return service.getByBranch(branchId)
                .map(s -> ResponseEntity.ok(InvStoreDTO.fromEntity(s)))
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getById(@PathVariable int id) {
        return service.getById(id)
                .map(s -> ResponseEntity.ok(InvStoreDTO.fromEntity(s)))
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<?> create(@RequestBody Map<String, Object> body, Principal principal) {
        try {
            String username = principal != null ? principal.getName() : "system";
            InvStore store = new InvStore();
            store.setStoreCode((String) body.get("storeCode"));
            store.setStoreName((String) body.get("storeName"));
            store.setStoreNameAm((String) body.get("storeNameAm"));
            store.setIsMainStore(body.get("isMainStore") != null ? (Boolean) body.get("isMainStore") : false);
            store.setLocation((String) body.get("location"));
            store.setIsActive(body.get("isActive") != null ? (Boolean) body.get("isActive") : true);

            Integer branchId = body.get("branchId") != null && !body.get("branchId").toString().isEmpty() ? Integer.parseInt(body.get("branchId").toString()) : null;
            Integer storeKeeperId = body.get("storeKeeperId") != null && !body.get("storeKeeperId").toString().isEmpty() ? Integer.parseInt(body.get("storeKeeperId").toString()) : null;
            Integer managerId = body.get("managerId") != null && !body.get("managerId").toString().isEmpty() ? Integer.parseInt(body.get("managerId").toString()) : null;

            InvStore saved = service.create(store, branchId, storeKeeperId, managerId, username);
            return ResponseEntity.status(HttpStatus.CREATED).body(InvStoreDTO.fromEntity(saved));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(java.util.Collections.singletonMap("message", e.getMessage() != null ? e.getMessage() : e.toString()));
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> update(@PathVariable int id, @RequestBody Map<String, Object> body) {
        try {
            InvStore store = new InvStore();
            store.setStoreCode((String) body.get("storeCode"));
            store.setStoreName((String) body.get("storeName"));
            store.setStoreNameAm((String) body.get("storeNameAm"));
            store.setIsMainStore(body.get("isMainStore") != null ? (Boolean) body.get("isMainStore") : false);
            store.setLocation((String) body.get("location"));
            store.setIsActive(body.get("isActive") != null ? (Boolean) body.get("isActive") : true);

            Integer branchId = body.get("branchId") != null && !body.get("branchId").toString().isEmpty() ? Integer.parseInt(body.get("branchId").toString()) : null;
            Integer storeKeeperId = body.get("storeKeeperId") != null && !body.get("storeKeeperId").toString().isEmpty() ? Integer.parseInt(body.get("storeKeeperId").toString()) : null;
            Integer managerId = body.get("managerId") != null && !body.get("managerId").toString().isEmpty() ? Integer.parseInt(body.get("managerId").toString()) : null;

            InvStore updated = service.update(id, store, branchId, storeKeeperId, managerId);
            return ResponseEntity.ok(InvStoreDTO.fromEntity(updated));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(java.util.Collections.singletonMap("message", e.getMessage() != null ? e.getMessage() : e.toString()));
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> delete(@PathVariable int id) {
        try {
            service.softDelete(id);
            return ResponseEntity.ok(Map.of("message", "Store deleted"));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(java.util.Collections.singletonMap("message", e.getMessage() != null ? e.getMessage() : e.toString()));
        }
    }
}

