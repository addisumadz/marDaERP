package com.wbill.home.controller;

import com.wbill.home.model.*;
import com.wbill.home.model.InvStockTransfer.TransferStatus;
import com.wbill.home.service.InvStockTransferService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.math.BigDecimal;
import java.security.Principal;
import java.util.*;

@RestController
@RequestMapping("/api/card_managenment/inv-transfers")
@CrossOrigin(origins = "*", maxAge = 3600)
public class InvStockTransferController {

    @Autowired
    private InvStockTransferService service;

    @GetMapping("/all")
    public ResponseEntity<Page<InvStockTransfer>> getAll(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(required = false) String status) {
        if (status != null) return ResponseEntity.ok(service.getByStatus(TransferStatus.valueOf(status), page, size));
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
            InvStockTransfer transfer = new InvStockTransfer();
            transfer.setRemarks((String) body.get("remarks"));
            int fromStoreId = Integer.parseInt(body.get("fromStoreId").toString());
            int toStoreId = Integer.parseInt(body.get("toStoreId").toString());

            List<Map<String, Object>> lineData = (List<Map<String, Object>>) body.get("lines");
            List<InvStockTransferLine> lines = new ArrayList<>();
            for (Map<String, Object> ld : lineData) {
                InvStockTransferLine line = new InvStockTransferLine();
                InvItem item = new InvItem();
                item.setId(Long.parseLong(ld.get("itemId").toString()));
                line.setItem(item);
                line.setQuantity(new BigDecimal(ld.get("quantity").toString()));
                lines.add(line);
            }
            return ResponseEntity.status(HttpStatus.CREATED).body(service.create(transfer, fromStoreId, toStoreId, lines, username));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(java.util.Collections.singletonMap("message", e.getMessage() != null ? e.getMessage() : e.toString()));
        }
    }

    @PutMapping("/{id}/submit")
    public ResponseEntity<?> submit(@PathVariable long id, Principal principal) {
        try { return ResponseEntity.ok(service.submit(id, principal != null ? principal.getName() : "system")); }
        catch (Exception e) { return ResponseEntity.badRequest().body(java.util.Collections.singletonMap("message", e.getMessage() != null ? e.getMessage() : e.toString())); }
    }

    @PutMapping("/{id}/update-lines")
    public ResponseEntity<?> updateLines(@PathVariable long id, @RequestBody Map<String, Object> body, Principal principal) {
        try {
            String username = principal != null ? principal.getName() : "system";
            List<Map<String, Object>> lineData = (List<Map<String, Object>>) body.get("lines");
            return ResponseEntity.ok(service.updateLines(id, lineData, username));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(java.util.Collections.singletonMap("message", e.getMessage() != null ? e.getMessage() : e.toString()));
        }
    }

    @PutMapping("/{id}/approve")
    public ResponseEntity<?> approve(@PathVariable long id, @RequestBody(required = false) Map<String, Object> body, Principal principal) {
        try {
            String username = principal != null ? principal.getName() : "system";
            if (body != null && body.containsKey("lines")) {
                List<Map<String, Object>> lineData = (List<Map<String, Object>>) body.get("lines");
                service.updateLines(id, lineData, username);
            }
            return ResponseEntity.ok(service.approve(id, username));
        }
        catch (Exception e) { return ResponseEntity.badRequest().body(java.util.Collections.singletonMap("message", e.getMessage() != null ? e.getMessage() : e.toString())); }
    }

    @PutMapping("/{id}/ship")
    public ResponseEntity<?> ship(@PathVariable long id, @RequestBody(required = false) Map<String, Object> body, Principal principal) {
        try {
            String shipper = principal != null ? principal.getName() : "system";
            String waybill = body != null && body.get("waybillNumber") != null ? body.get("waybillNumber").toString() : null;
            String plate = body != null && body.get("vehiclePlate") != null ? body.get("vehiclePlate").toString() : null;
            String driver = body != null && body.get("driverName") != null ? body.get("driverName").toString() : null;
            return ResponseEntity.ok(service.ship(id, shipper, waybill, plate, driver));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(java.util.Collections.singletonMap("message", e.getMessage() != null ? e.getMessage() : e.toString()));
        }
    }

    @PutMapping("/{id}/receive")
    public ResponseEntity<?> receive(@PathVariable long id, Principal principal) {
        try { return ResponseEntity.ok(service.receive(id, principal != null ? principal.getName() : "system")); }
        catch (Exception e) { return ResponseEntity.badRequest().body(java.util.Collections.singletonMap("message", e.getMessage() != null ? e.getMessage() : e.toString())); }
    }

    @PutMapping("/{id}/reject")
    public ResponseEntity<?> reject(@PathVariable long id, @RequestBody(required = false) Map<String, Object> body, Principal principal) {
        try {
            String rejecter = principal != null ? principal.getName() : "system";
            String reason = body != null && body.get("reason") != null ? body.get("reason").toString() : null;
            return ResponseEntity.ok(service.reject(id, rejecter, reason));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(java.util.Collections.singletonMap("message", e.getMessage() != null ? e.getMessage() : e.toString()));
        }
    }
}
