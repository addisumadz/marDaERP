package com.mardaarif.controller;

import com.mardaarif.model.Bill;
import com.mardaarif.service.BillService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/bills")
public class BillController {

    @Autowired
    private BillService billService;

    @GetMapping
    public ResponseEntity<List<Bill>> getBills(
            @RequestParam(required = false) Integer cityId) {
        if (cityId != null) {
            return ResponseEntity.ok(billService.getBillsByCity(cityId));
        }
        return ResponseEntity.ok(billService.getAllBills());
    }

    @GetMapping("/search")
    public ResponseEntity<List<Bill>> searchBills(
            @RequestParam String query,
            @RequestParam(required = false) Integer cityId) {
        return ResponseEntity.ok(billService.searchBills(query, cityId));
    }

    @GetMapping("/{id}")
    public ResponseEntity<Bill> getBill(@PathVariable Long id) {
        return billService.getBillById(id)
            .map(ResponseEntity::ok)
            .orElse(ResponseEntity.notFound().build());
    }

    @PutMapping("/{id}/mark-paid")
    public ResponseEntity<?> markBillAsPaid(@PathVariable Long id, @RequestBody Map<String, Object> payload) {
        try {
            Double paidAmount = payload.get("paidAmount") != null ?
                ((Number) payload.get("paidAmount")).doubleValue() : null;
            String paidOn = (String) payload.get("paidOn");
            String bankName = (String) payload.get("bankName");
            String bankRef = (String) payload.get("bankTransactionReference");

            Bill bill = billService.markBillAsPaid(id, paidAmount, paidOn, bankName, bankRef);
            return ResponseEntity.ok(bill);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }
}
