package com.mardaarif.controller;

import com.mardaarif.model.Payment;
import com.mardaarif.service.PaymentService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/payments")
public class PaymentController {

    @Autowired
    private PaymentService paymentService;

    @GetMapping
    public ResponseEntity<List<Payment>> getPayments(
            @RequestParam(required = false) Integer cityId,
            @RequestParam(required = false) String fromDate,
            @RequestParam(required = false) String toDate) {

        if (cityId != null && fromDate != null && toDate != null) {
            return ResponseEntity.ok(paymentService.getPaymentsByCityAndDateRange(cityId, fromDate, toDate));
        } else if (cityId != null) {
            return ResponseEntity.ok(paymentService.getPaymentsByCity(cityId));
        }
        return ResponseEntity.ok(paymentService.getAllPayments());
    }

    @GetMapping("/search")
    public ResponseEntity<List<Payment>> searchPayments(
            @RequestParam String query,
            @RequestParam(required = false) Integer cityId) {
        return ResponseEntity.ok(paymentService.searchPayments(query, cityId));
    }

    @GetMapping("/{id}")
    public ResponseEntity<Payment> getPayment(@PathVariable Long id) {
        return paymentService.getPaymentById(id)
            .map(ResponseEntity::ok)
            .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping("/{id}/reconcile")
    public ResponseEntity<Payment> reconcilePayment(@PathVariable Long id) {
        try {
            return ResponseEntity.ok(paymentService.reconcilePayment(id));
        } catch (Exception e) {
            return ResponseEntity.notFound().build();
        }
    }

    @PostMapping("/bulk-reconcile")
    public ResponseEntity<List<Payment>> bulkReconcile(@RequestBody Map<String, List<Long>> payload) {
        List<Long> ids = payload.get("ids");
        if (ids == null || ids.isEmpty()) {
            return ResponseEntity.badRequest().build();
        }
        return ResponseEntity.ok(paymentService.bulkReconcile(ids));
    }
}
