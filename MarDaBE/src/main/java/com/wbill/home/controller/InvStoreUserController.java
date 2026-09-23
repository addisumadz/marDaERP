package com.wbill.home.controller;

import com.wbill.home.model.InvStoreUser;
import com.wbill.home.service.InvStoreUserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.Collections;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/mardaerp/inv-store-users")
@CrossOrigin(origins = "*", maxAge = 3600)
public class InvStoreUserController {

    @Autowired
    private InvStoreUserService service;

    @GetMapping("/all")
    public ResponseEntity<List<InvStoreUser>> getAll() {
        return ResponseEntity.ok(service.getAll());
    }

    @GetMapping("/by-store/{storeId}")
    public ResponseEntity<List<InvStoreUser>> getByStore(@PathVariable int storeId) {
        return ResponseEntity.ok(service.getByStoreId(storeId));
    }

    @GetMapping("/by-user/{userId}")
    public ResponseEntity<List<InvStoreUser>> getByUser(@PathVariable int userId) {
        return ResponseEntity.ok(service.getByUserAccountId(userId));
    }

    @GetMapping("/my-stores")
    public ResponseEntity<List<InvStoreUser>> getMyStores(Principal principal) {
        String username = principal != null ? principal.getName() : "system";
        return ResponseEntity.ok(service.getActiveStoresForUser(username));
    }

    @PostMapping
    public ResponseEntity<?> assignUser(@RequestBody Map<String, Object> body, Principal principal) {
        try {
            String username = principal != null ? principal.getName() : "system";
            int storeId = Integer.parseInt(body.get("storeId").toString());
            int userAccountId = Integer.parseInt(body.get("userAccountId").toString());
            String roleInStore = body.get("roleInStore") != null ? (String) body.get("roleInStore") : "STORE_KEEPER";
            boolean isPrimary = body.get("isPrimary") != null && Boolean.parseBoolean(body.get("isPrimary").toString());
            String notes = body.get("notes") != null ? (String) body.get("notes") : "";

            InvStoreUser created = service.assignUserToStore(storeId, userAccountId, roleInStore, isPrimary, notes, username);
            return ResponseEntity.status(HttpStatus.CREATED).body(created);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Collections.singletonMap("message", e.getMessage() != null ? e.getMessage() : e.toString()));
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateAssignment(@PathVariable int id, @RequestBody Map<String, Object> body) {
        try {
            String roleInStore = body.get("roleInStore") != null ? (String) body.get("roleInStore") : null;
            Boolean isPrimary = body.get("isPrimary") != null ? Boolean.parseBoolean(body.get("isPrimary").toString()) : null;
            Boolean isActive = body.get("isActive") != null ? Boolean.parseBoolean(body.get("isActive").toString()) : null;
            String notes = body.get("notes") != null ? (String) body.get("notes") : null;

            InvStoreUser updated = service.updateAssignment(id, roleInStore, isPrimary, isActive, notes);
            return ResponseEntity.ok(updated);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Collections.singletonMap("message", e.getMessage() != null ? e.getMessage() : e.toString()));
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteAssignment(@PathVariable int id) {
        try {
            service.deleteAssignment(id);
            return ResponseEntity.ok(Collections.singletonMap("message", "Assignment removed successfully"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Collections.singletonMap("message", e.getMessage() != null ? e.getMessage() : e.toString()));
        }
    }
}
