package com.wbill.home.controller;

import com.wbill.home.model.*;
import com.wbill.home.model.InvPurchaseRequisition.PRStatus;
import com.wbill.home.service.InvPurchaseRequisitionService;
import com.wbill.home.repository.InvItemRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.math.BigDecimal;
import java.security.Principal;
import java.util.*;

@RestController
@RequestMapping("/api/card_managenment/inv-purchase-requisitions")
@CrossOrigin(origins = "*", maxAge = 3600)
public class InvPurchaseRequisitionController {

    @Autowired
    private InvPurchaseRequisitionService service;

    @Autowired
    private InvItemRepository itemRepository;

    @GetMapping("/all")
    public ResponseEntity<Page<InvPurchaseRequisition>> getAll(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(required = false) Integer storeId,
            @RequestParam(required = false) String status) {
        if (storeId != null && status != null) {
            return ResponseEntity.ok(service.getByStoreAndStatus(storeId, PRStatus.valueOf(status), page, size));
        } else if (storeId != null) {
            return ResponseEntity.ok(service.getByStore(storeId, page, size));
        } else if (status != null) {
            return ResponseEntity.ok(service.getByStatus(PRStatus.valueOf(status), page, size));
        }
        return ResponseEntity.ok(service.getAll(page, size));
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getById(@PathVariable long id) {
        return service.getById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<?> create(@RequestBody Map<String, Object> body, Principal principal) {
        try {
            String username = principal != null ? principal.getName() : "system";
            InvPurchaseRequisition pr = new InvPurchaseRequisition();
            pr.setRemarks((String) body.get("remarks"));
            int storeId = Integer.parseInt(body.get("storeId").toString());

            List<Map<String, Object>> lineData = (List<Map<String, Object>>) body.get("lines");
            List<InvPurchaseRequisitionLine> lines = new ArrayList<>();
            for (Map<String, Object> ld : lineData) {
                InvPurchaseRequisitionLine line = new InvPurchaseRequisitionLine();
                InvItem item = new InvItem();
                item.setId(Long.parseLong(ld.get("itemId").toString()));
                line.setItem(item);
                line.setRequestedQuantity(new BigDecimal(ld.get("requestedQuantity").toString()));
                line.setEstimatedUnitCost(new BigDecimal(ld.get("estimatedUnitCost").toString()));
                line.setPurpose((String) ld.get("purpose"));
                lines.add(line);
            }
            return ResponseEntity.status(HttpStatus.CREATED).body(service.create(pr, storeId, lines, username));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(java.util.Collections.singletonMap("message", e.getMessage() != null ? e.getMessage() : e.toString()));
        }
    }

    @PutMapping("/{id}/submit")
    public ResponseEntity<?> submit(@PathVariable long id, Principal principal) {
        try {
            String username = principal != null ? principal.getName() : "system";
            return ResponseEntity.ok(service.submit(id, username));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(java.util.Collections.singletonMap("message", e.getMessage() != null ? e.getMessage() : e.toString()));
        }
    }

    @PutMapping("/{id}/approve-l1")
    public ResponseEntity<?> approveL1(@PathVariable long id, Principal principal) {
        try {
            String approver = principal != null ? principal.getName() : "system";
            return ResponseEntity.ok(service.approveL1(id, approver));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(java.util.Collections.singletonMap("message", e.getMessage() != null ? e.getMessage() : e.toString()));
        }
    }

    @PutMapping("/{id}/approve-l2")
    public ResponseEntity<?> approveL2(@PathVariable long id, Principal principal) {
        try {
            String approver = principal != null ? principal.getName() : "system";
            return ResponseEntity.ok(service.approveL2(id, approver));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(java.util.Collections.singletonMap("message", e.getMessage() != null ? e.getMessage() : e.toString()));
        }
    }

    @PutMapping("/{id}/reject")
    public ResponseEntity<?> reject(@PathVariable long id, @RequestBody Map<String, String> body, Principal principal) {
        try {
            String rejector = principal != null ? principal.getName() : "system";
            return ResponseEntity.ok(service.reject(id, rejector, body.get("reason")));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(java.util.Collections.singletonMap("message", e.getMessage() != null ? e.getMessage() : e.toString()));
        }
    }
}
