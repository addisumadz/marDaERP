package com.wbill.home.controller;

import com.wbill.home.model.*;
import com.wbill.home.model.InvPurchaseOrder.POStatus;
import com.wbill.home.service.InvPurchaseOrderService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.security.Principal;
import java.util.*;

@RestController
@RequestMapping("/api/mardaerp/inv-purchase-orders")
@CrossOrigin(origins = "*", maxAge = 3600)
public class InvPurchaseOrderController {

    @Autowired
    private InvPurchaseOrderService service;

    @GetMapping("/all")
    public ResponseEntity<Page<InvPurchaseOrder>> getAll(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) Integer storeId) {
        if (status != null) return ResponseEntity.ok(service.getByStatus(POStatus.valueOf(status), page, size));
        if (storeId != null) return ResponseEntity.ok(service.getByStore(storeId, page, size));
        return ResponseEntity.ok(service.getAll(page, size));
    }

    @GetMapping("/approved-requisitions")
    public ResponseEntity<?> getApprovedRequisitions() {
        return ResponseEntity.ok(service.getApprovedRequisitions());
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getById(@PathVariable long id) {
        return service.getById(id).map(ResponseEntity::ok).orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<?> create(@RequestBody Map<String, Object> body, Principal principal) {
        try {
            String username = principal != null ? principal.getName() : "system";
            InvPurchaseOrder po = new InvPurchaseOrder();
            po.setRemarks((String) body.get("remarks"));
            po.setPaymentTerms((String) body.get("paymentTerms"));
            po.setDeliveryTerms((String) body.get("deliveryTerms"));
            if (body.get("expectedDeliveryDate") != null) {
                po.setExpectedDeliveryDate(LocalDate.parse((String) body.get("expectedDeliveryDate")));
            }
            if (body.get("vatRate") != null) {
                po.setVatRate(new BigDecimal(body.get("vatRate").toString()));
            }

            int supplierId = Integer.parseInt(body.get("supplierId").toString());
            int storeId = Integer.parseInt(body.get("storeId").toString());
            Long requisitionId = body.get("requisitionId") != null && !body.get("requisitionId").toString().isEmpty() ? Long.parseLong(body.get("requisitionId").toString()) : null;

            List<Map<String, Object>> lineData = (List<Map<String, Object>>) body.get("lines");
            List<InvPurchaseOrderLine> lines = new ArrayList<>();
            for (Map<String, Object> ld : lineData) {
                InvPurchaseOrderLine line = new InvPurchaseOrderLine();
                InvItem item = new InvItem();
                item.setId(Long.parseLong(ld.get("itemId").toString()));
                line.setItem(item);
                line.setOrderedQuantity(new BigDecimal(ld.get("orderedQuantity").toString()));
                line.setUnitPrice(new BigDecimal(ld.get("unitPrice").toString()));
                lines.add(line);
            }
            return ResponseEntity.status(HttpStatus.CREATED).body(service.create(po, supplierId, storeId, requisitionId, lines, username));
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
        try { return ResponseEntity.ok(service.approveL1(id, principal != null ? principal.getName() : "system")); }
        catch (Exception e) { return ResponseEntity.badRequest().body(java.util.Collections.singletonMap("message", e.getMessage() != null ? e.getMessage() : e.toString())); }
    }

    @PutMapping("/{id}/approve-l2")
    public ResponseEntity<?> approveL2(@PathVariable long id, Principal principal) {
        try { return ResponseEntity.ok(service.approveL2(id, principal != null ? principal.getName() : "system")); }
        catch (Exception e) { return ResponseEntity.badRequest().body(java.util.Collections.singletonMap("message", e.getMessage() != null ? e.getMessage() : e.toString())); }
    }

    @PutMapping("/{id}/reject")
    public ResponseEntity<?> reject(@PathVariable long id, @RequestBody Map<String, String> body, Principal principal) {
        try {
            String username = principal != null ? principal.getName() : "system";
            String reason = body != null ? body.get("reason") : "";
            return ResponseEntity.ok(service.reject(id, username, reason));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(java.util.Collections.singletonMap("message", e.getMessage() != null ? e.getMessage() : e.toString()));
        }
    }

    @PutMapping("/{id}/send-to-supplier")
    public ResponseEntity<?> sendToSupplier(@PathVariable long id) {
        try { return ResponseEntity.ok(service.sendToSupplier(id)); }
        catch (Exception e) { return ResponseEntity.badRequest().body(java.util.Collections.singletonMap("message", e.getMessage() != null ? e.getMessage() : e.toString())); }
    }
}
