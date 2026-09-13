package com.wbill.home.controller;

import com.wbill.home.model.*;
import com.wbill.home.service.InvGoodsReceivedNoteService;
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
@RequestMapping("/api/card_managenment/inv-grns")
@CrossOrigin(origins = "*", maxAge = 3600)
public class InvGoodsReceivedNoteController {

    @Autowired
    private InvGoodsReceivedNoteService service;

    @GetMapping("/all")
    public ResponseEntity<Page<InvGoodsReceivedNote>> getAll(
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

    @GetMapping("/open-purchase-orders")
    public ResponseEntity<List<InvPurchaseOrder>> getOpenPurchaseOrders() {
        return ResponseEntity.ok(service.getOpenPurchaseOrders());
    }

    @PostMapping
    public ResponseEntity<?> create(@RequestBody Map<String, Object> body, Principal principal) {
        try {
            String username = principal != null ? principal.getName() : "system";
            InvGoodsReceivedNote grn = new InvGoodsReceivedNote();
            grn.setRemarks((String) body.get("remarks"));
            grn.setSupplierInvoiceNumber((String) body.get("supplierInvoiceNumber"));

            long poId = Long.parseLong(body.get("purchaseOrderId").toString());
            int storeId = Integer.parseInt(body.get("storeId").toString());
            int supplierId = Integer.parseInt(body.get("supplierId").toString());

            List<Map<String, Object>> lineData = (List<Map<String, Object>>) body.get("lines");
            List<InvGoodsReceivedNoteLine> lines = new ArrayList<>();
            for (Map<String, Object> ld : lineData) {
                InvGoodsReceivedNoteLine line = new InvGoodsReceivedNoteLine();
                InvItem item = new InvItem();
                item.setId(Long.parseLong(ld.get("itemId").toString()));
                line.setItem(item);
                InvPurchaseOrderLine poLine = new InvPurchaseOrderLine();
                poLine.setId(Long.parseLong(ld.get("poLineId").toString()));
                line.setPoLine(poLine);
                line.setReceivedQuantity(new BigDecimal(ld.get("receivedQuantity").toString()));
                line.setAcceptedQuantity(new BigDecimal(ld.get("acceptedQuantity").toString()));
                line.setRejectedQuantity(ld.get("rejectedQuantity") != null ? new BigDecimal(ld.get("rejectedQuantity").toString()) : BigDecimal.ZERO);
                line.setUnitCost(new BigDecimal(ld.get("unitCost").toString()));
                line.setBatchNumber((String) ld.get("batchNumber"));
                Object expVal = ld.get("expiryDate");
                if (expVal != null && !expVal.toString().trim().isEmpty()) {
                    try {
                        line.setExpiryDate(LocalDate.parse(expVal.toString().trim()));
                    } catch (Exception ignored) {}
                }
                line.setRejectionReason((String) ld.get("rejectionReason"));
                lines.add(line);
            }
            return ResponseEntity.status(HttpStatus.CREATED).body(service.create(grn, poId, storeId, supplierId, lines, username));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(java.util.Collections.singletonMap("message", e.getMessage() != null ? e.getMessage() : e.toString()));
        }
    }

    @PutMapping("/{id}/confirm")
    public ResponseEntity<?> confirm(@PathVariable long id, Principal principal) {
        try {
            String username = principal != null ? principal.getName() : "system";
            return ResponseEntity.ok(service.confirm(id, username));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(java.util.Collections.singletonMap("message", e.getMessage() != null ? e.getMessage() : e.toString()));
        }
    }
}
