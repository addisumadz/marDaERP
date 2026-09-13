package com.wbill.home.controller;

import com.wbill.home.model.*;
import com.wbill.home.service.InvStockAdjustmentService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.math.BigDecimal;
import java.security.Principal;
import java.util.*;

@RestController
@RequestMapping("/api/card_managenment/inv-adjustments")
@CrossOrigin(origins = "*", maxAge = 3600)
public class InvStockAdjustmentController {

    @Autowired
    private InvStockAdjustmentService service;

    @GetMapping("/all")
    public ResponseEntity<Page<InvStockAdjustment>> getAll(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(required = false) Integer storeId) {
        if (storeId != null) return ResponseEntity.ok(service.getByStore(storeId, page, size));
        return ResponseEntity.ok(service.getAll(page, size));
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getById(@PathVariable long id) {
        return service.getById(id).map(ResponseEntity::ok).orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<?> create(@RequestBody Map<String, Object> body, Principal principal) {
        try {
            String username = principal != null ? principal.getName() : "system";
            InvStockAdjustment adj = new InvStockAdjustment();
            adj.setAdjustmentType(InvStockAdjustment.AdjustmentType.valueOf((String) body.get("adjustmentType")));
            adj.setRemarks((String) body.get("remarks"));
            int storeId = Integer.parseInt(body.get("storeId").toString());

            List<Map<String, Object>> lineData = (List<Map<String, Object>>) body.get("lines");
            List<InvStockAdjustmentLine> lines = new ArrayList<>();
            for (Map<String, Object> ld : lineData) {
                InvStockAdjustmentLine line = new InvStockAdjustmentLine();
                InvItem item = new InvItem();
                item.setId(Long.parseLong(ld.get("itemId").toString()));
                line.setItem(item);
                line.setActualQuantity(new BigDecimal(ld.get("actualQuantity").toString()));
                line.setReason((String) ld.get("reason"));
                lines.add(line);
            }
            return ResponseEntity.status(HttpStatus.CREATED).body(service.create(adj, storeId, lines, username));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(java.util.Collections.singletonMap("message", e.getMessage() != null ? e.getMessage() : e.toString()));
        }
    }

    @PutMapping("/{id}/approve")
    public ResponseEntity<?> approve(@PathVariable long id, Principal principal) {
        try { return ResponseEntity.ok(service.approve(id, principal != null ? principal.getName() : "system")); }
        catch (Exception e) { return ResponseEntity.badRequest().body(java.util.Collections.singletonMap("message", e.getMessage() != null ? e.getMessage() : e.toString())); }
    }

    @PutMapping("/{id}/apply")
    public ResponseEntity<?> apply(@PathVariable long id, Principal principal) {
        try { return ResponseEntity.ok(service.apply(id, principal != null ? principal.getName() : "system")); }
        catch (Exception e) { return ResponseEntity.badRequest().body(java.util.Collections.singletonMap("message", e.getMessage() != null ? e.getMessage() : e.toString())); }
    }
}
